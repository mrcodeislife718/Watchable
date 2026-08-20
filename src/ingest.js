import fs from 'node:fs';
import { getDb } from './db.js';
import { id, now } from './util.js';
import { ADAPTER_TYPES } from './content.js';

export function ingestPackage(input) {
  validatePackage(input);
  const db=getDb();
  let source=db.prepare('SELECT * FROM content_sources WHERE name=?').get(input.source.name);
  if (!source) {
    const sourceId=id('src');
    db.prepare('INSERT INTO content_sources (id,name,adapter_type,status,rights_verified,config_json,created_at) VALUES (?,?,?,?,?,?,?)')
      .run(sourceId,input.source.name,input.source.adapterType,input.source.status||'active',input.source.rightsVerified?1:0,JSON.stringify(input.source.config||{}),now());
    source=db.prepare('SELECT * FROM content_sources WHERE id=?').get(sourceId);
  } else {
    db.prepare('UPDATE content_sources SET adapter_type=?,status=?,rights_verified=?,config_json=? WHERE id=?')
      .run(input.source.adapterType,input.source.status||'active',input.source.rightsVerified?1:0,JSON.stringify(input.source.config||{}),source.id);
  }
  if (!source.rights_verified && !input.source.rightsVerified) throw new Error('Refusing to ingest commercial content without rightsVerified=true');
  let channelCount=0,vodCount=0,programCount=0;
  for (const c of input.channels||[]) {
    const existing=db.prepare('SELECT id FROM channels WHERE slug=?').get(c.slug); const cid=existing?.id||id('chn');
    if(existing) db.prepare(`UPDATE channels SET source_id=?,name=?,category=?,logo_url=?,playback_url=?,playback_type=?,premium=?,sports=?,active=?,rights_start=?,rights_end=?,territories=?,dvr_allowed=?,metadata_json=? WHERE id=?`).run(source.id,c.name,c.category,c.logoUrl||null,c.playbackUrl||null,c.playbackType||'hls',c.premium?1:0,c.sports?1:0,c.active===false?0:1,c.rightsStart||null,c.rightsEnd||null,(c.territories||['US']).join(','),c.dvrAllowed?1:0,JSON.stringify(c.metadata||{}),cid);
    else db.prepare(`INSERT INTO channels (id,source_id,slug,name,category,logo_url,playback_url,playback_type,premium,sports,active,rights_start,rights_end,territories,dvr_allowed,metadata_json) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(cid,source.id,c.slug,c.name,c.category,c.logoUrl||null,c.playbackUrl||null,c.playbackType||'hls',c.premium?1:0,c.sports?1:0,c.active===false?0:1,c.rightsStart||null,c.rightsEnd||null,(c.territories||['US']).join(','),c.dvrAllowed?1:0,JSON.stringify(c.metadata||{}));
    channelCount++;
    for(const p of c.programs||[]){db.prepare('INSERT OR REPLACE INTO programs (id,channel_id,title,description,starts_at,ends_at,rating,image_url) VALUES (?,?,?,?,?,?,?,?)').run(p.id||id('prg'),cid,p.title,p.description||null,p.startsAt,p.endsAt,p.rating||null,p.imageUrl||null);programCount++;}
  }
  for(const v of input.vod||[]) {
    const existing=db.prepare('SELECT id FROM vod_assets WHERE slug=?').get(v.slug); const vid=existing?.id||id('vod');
    if(existing) db.prepare(`UPDATE vod_assets SET source_id=?,title=?,description=?,kind=?,playback_url=?,playback_type=?,premium=?,image_url=?,active=?,rights_start=?,rights_end=?,territories=?,download_allowed=?,metadata_json=? WHERE id=?`).run(source.id,v.title,v.description||null,v.kind||'movie',v.playbackUrl||null,v.playbackType||'hls',v.premium?1:0,v.imageUrl||null,v.active===false?0:1,v.rightsStart||null,v.rightsEnd||null,(v.territories||['US']).join(','),v.downloadAllowed?1:0,JSON.stringify(v.metadata||{}),vid);
    else db.prepare(`INSERT INTO vod_assets (id,source_id,slug,title,description,kind,playback_url,playback_type,premium,image_url,active,rights_start,rights_end,territories,download_allowed,metadata_json) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(vid,source.id,v.slug,v.title,v.description||null,v.kind||'movie',v.playbackUrl||null,v.playbackType||'hls',v.premium?1:0,v.imageUrl||null,v.active===false?0:1,v.rightsStart||null,v.rightsEnd||null,(v.territories||['US']).join(','),v.downloadAllowed?1:0,JSON.stringify(v.metadata||{}));
    vodCount++;
  }
  return {sourceId:source.id,channelCount,vodCount,programCount};
}

export function ingestPackageFile(file){return ingestPackage(JSON.parse(fs.readFileSync(file,'utf8')))}

function validatePackage(input){
  if(!input?.source?.name) throw new Error('source.name required');
  if(!ADAPTER_TYPES.includes(input.source.adapterType)) throw new Error('Unsupported source.adapterType');
  if(input.source.status==='active' && !input.source.rightsVerified) throw new Error('Active source requires rightsVerified=true');
  for(const c of input.channels||[]){if(!c.slug||!c.name||!c.category) throw new Error('Each channel requires slug, name and category');}
}
