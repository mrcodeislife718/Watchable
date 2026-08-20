import { getDb } from './db.js';
import { config } from './config.js';
import { id, now, sign, parseJson } from './util.js';
import { isEntitled } from './billing.js';

export const ADAPTER_TYPES = ['LICENSED_LINEAR','PREMIUM','FAST_AVOD','VOD','LOCAL_OTA'];

export function listChannels({ category, premium, sports } = {}) {
  const db = getDb();
  let sql = 'SELECT * FROM channels WHERE active=1'; const args=[];
  if (category) { sql += ' AND category=?'; args.push(category); }
  if (premium !== undefined) { sql += ' AND premium=?'; args.push(premium ? 1 : 0); }
  if (sports !== undefined) { sql += ' AND sports=?'; args.push(sports ? 1 : 0); }
  sql += ' ORDER BY category,name';
  return db.prepare(sql).all(...args).map(normalizeChannel);
}

export function listVod() {
  return getDb().prepare('SELECT * FROM vod_assets WHERE active=1 ORDER BY title').all().map(row => ({...row, premium: !!row.premium, metadata: parseJson(row.metadata_json)}));
}

export function guide({ hours = 6 } = {}) {
  const start = new Date(Date.now() - 30 * 60000).toISOString();
  const end = new Date(Date.now() + Math.min(hours,24) * 3600000).toISOString();
  const channels = listChannels();
  const db = getDb();
  return channels.map(channel => ({ channel, programs: db.prepare('SELECT * FROM programs WHERE channel_id=? AND ends_at>? AND starts_at<? ORDER BY starts_at').all(channel.id,start,end) }));
}

function normalizeChannel(row) {
  return {...row, premium: !!row.premium, sports: !!row.sports, active: !!row.active, metadata: parseJson(row.metadata_json)};
}

function rightsValid(row, country='US') {
  if (row.territories && !row.territories.split(',').map(v=>v.trim()).includes(country)) return false;
  if (row.rights_start && Date.parse(row.rights_start) > Date.now()) return false;
  if (row.rights_end && Date.parse(row.rights_end) <= Date.now()) return false;
  return true;
}

export function createPlaybackSession({ userId, assetType, assetId, country='US' }) {
  if (!isEntitled(userId)) throw Object.assign(new Error('Active Watchable TV subscription required'), { statusCode: 402 });
  const db = getDb();
  const table = assetType === 'channel' ? 'channels' : assetType === 'vod' ? 'vod_assets' : null;
  if (!table) throw Object.assign(new Error('Unsupported asset type'), { statusCode: 400 });
  const asset = db.prepare(`SELECT * FROM ${table} WHERE id=? AND active=1`).get(assetId);
  if (!asset) throw Object.assign(new Error('Asset not found'), { statusCode: 404 });
  if (!rightsValid(asset,country)) throw Object.assign(new Error('Content rights unavailable in this territory or window'), { statusCode: 451 });
  if (!asset.playback_url) throw Object.assign(new Error('Playback source not provisioned'), { statusCode: 503 });
  const playbackId = id('play');
  const expiresAt = new Date(Date.now()+10*60000).toISOString();
  db.prepare('INSERT INTO playback_sessions (id,user_id,asset_type,asset_id,expires_at,created_at) VALUES (?,?,?,?,?,?)').run(playbackId,userId,assetType,assetId,expiresAt,now());
  const payload = `${playbackId}.${userId}.${assetType}.${assetId}.${expiresAt}`;
  return { id: playbackId, playbackUrl: asset.playback_url, playbackType: asset.playback_type, expiresAt, token: `${Buffer.from(payload).toString('base64url')}.${sign(payload,config.playbackSigningSecret)}` };
}

export function scheduleRecording(userId, programId) {
  if (!isEntitled(userId)) throw Object.assign(new Error('Active subscription required'), { statusCode: 402 });
  const db = getDb();
  const program = db.prepare('SELECT * FROM programs WHERE id=?').get(programId);
  if (!program) throw Object.assign(new Error('Program not found'), { statusCode: 404 });
  const recording = { id: id('rec'), userId, programId, status: 'scheduled', createdAt: now() };
  db.prepare('INSERT INTO dvr_recordings (id,user_id,program_id,status,created_at) VALUES (?,?,?,?,?)').run(recording.id,userId,programId,recording.status,recording.createdAt);
  return recording;
}

export function listRecordings(userId) {
  return getDb().prepare(`SELECT d.id,d.status,d.created_at,p.title,p.starts_at,p.ends_at,c.name channel_name FROM dvr_recordings d JOIN programs p ON p.id=d.program_id JOIN channels c ON c.id=p.channel_id WHERE d.user_id=? ORDER BY p.starts_at DESC`).all(userId);
}

export function registerSource({ name, adapterType, configJson = {}, rightsVerified = false, status = 'inactive' }) {
  if (!ADAPTER_TYPES.includes(adapterType)) throw new Error('Invalid adapter type');
  const sourceId=id('src');
  getDb().prepare('INSERT INTO content_sources (id,name,adapter_type,status,rights_verified,config_json,created_at) VALUES (?,?,?,?,?,?,?)').run(sourceId,name,adapterType,status,rightsVerified?1:0,JSON.stringify(configJson),now());
  return sourceId;
}
