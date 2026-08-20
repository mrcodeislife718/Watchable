import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

process.env.DATABASE_PATH = path.resolve('data/test-watchable.db');
process.env.BILLING_PROVIDER = 'mock';
try { fs.unlinkSync(process.env.DATABASE_PATH); } catch {}

const { createUser, getUserAuthByEmail, verifyPassword } = await import('../src/auth.js');
const { createCheckout, getSubscription, listCommissionSummary } = await import('../src/billing.js');
const { getDb, closeDb } = await import('../src/db.js');
const { seedDemo } = await import('../src/seed.js');
const { listChannels, listVod, createPlaybackSession, scheduleRecording, listRecordings } = await import('../src/content.js');
const { ingestPackage } = await import('../src/ingest.js');

seedDemo();

test('account creation hashes password and authenticates', async () => {
  const user = await createUser({email:'customer@example.com',password:'very-secure-password',displayName:'Customer'});
  assert.equal(user.email,'customer@example.com');
  const auth = getUserAuthByEmail('CUSTOMER@example.com');
  assert.ok(auth.password_hash.includes(':'));
  assert.equal(await verifyPassword('very-secure-password',auth.password_hash),true);
  assert.equal(await verifyPassword('wrong-password',auth.password_hash),false);
});

test('mock subscription activates $75 plan and awards recurring-sales ledger entry', async () => {
  const user = getUserAuthByEmail('customer@example.com');
  const checkout = await createCheckout({user,repCode:'FOUNDING20'});
  assert.equal(checkout.activated,true);
  const sub = getSubscription(user.id);
  assert.equal(sub.status,'active');
  assert.equal(sub.commission_rate,0.20);
  const rep = getDb().prepare('SELECT * FROM reps WHERE code=?').get('FOUNDING20');
  const summary = listCommissionSummary(rep.id);
  assert.equal(summary.active_customers,1);
  assert.equal(summary.commission_cents,1500);
});

test('active subscriber can obtain short-lived playback session and schedule DVR', () => {
  const user = getUserAuthByEmail('customer@example.com');
  const channel = listChannels()[0];
  const session = createPlaybackSession({userId:user.id,assetType:'channel',assetId:channel.id});
  assert.ok(session.token);
  assert.ok(session.playbackUrl.startsWith('https://'));
  const program = getDb().prepare('SELECT * FROM programs WHERE channel_id=? LIMIT 1').get(channel.id);
  const rec = scheduleRecording(user.id,program.id);
  assert.equal(rec.status,'scheduled');
  assert.ok(listRecordings(user.id).length >= 1);
});

test('content ingestion fails closed without verified rights', () => {
  assert.throws(() => ingestPackage({source:{name:'Unverified',adapterType:'LICENSED_LINEAR',status:'active',rightsVerified:false},channels:[]}),/rightsVerified/);
});

test('verified licensed package can be ingested without changing platform code', () => {
  const result = ingestPackage({
    source:{name:'Fixture Supplier',adapterType:'LICENSED_LINEAR',status:'active',rightsVerified:true,config:{contractReference:'TEST'}},
    channels:[{slug:'fixture-channel',name:'Fixture Channel',category:'Entertainment',playbackUrl:'https://example.invalid/master.m3u8',playbackType:'hls',territories:['US'],dvrAllowed:true}],
    vod:[{slug:'fixture-vod',title:'Fixture VOD',kind:'movie',playbackUrl:'https://example.invalid/movie.m3u8',playbackType:'hls',territories:['US']}]
  });
  assert.equal(result.channelCount,1);
  assert.equal(result.vodCount,1);
  assert.ok(listChannels().some(c=>c.slug==='fixture-channel'));
  assert.ok(listVod().some(v=>v.slug==='fixture-vod'));
});

test.after(() => { closeDb(); try { fs.unlinkSync(process.env.DATABASE_PATH); } catch {} });
