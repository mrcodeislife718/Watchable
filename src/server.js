import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config, PLAN, validateProductionConfig } from './config.js';
import { createUser, getUserAuthByEmail, verifyPassword, createSession, userFromToken, revokeSession, getUserById } from './auth.js';
import { createCheckout, getSubscription, listCommissionSummary, handleStripeWebhook } from './billing.js';
import { listChannels, listVod, guide, createPlaybackSession, scheduleRecording, listRecordings } from './content.js';
import { getDb } from './db.js';
import { seedDemo } from './seed.js';
import { id, now } from './util.js';
import { decideAd, trackAd } from './ads.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');
const productionErrors=validateProductionConfig();
if(productionErrors.length) throw new Error(`Production configuration invalid: ${productionErrors.join('; ')}`);
if(process.env.NODE_ENV!=='production') seedDemo();

function send(res, status, body, headers={}) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': typeof body === 'string' ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8', 'Cache-Control':'no-store', ...headers });
  res.end(payload);
}
function parseCookies(req) { return Object.fromEntries((req.headers.cookie||'').split(';').map(x=>x.trim()).filter(Boolean).map(v=>{const i=v.indexOf('='); return [decodeURIComponent(v.slice(0,i)),decodeURIComponent(v.slice(i+1))]})); }
async function readRaw(req) { const chunks=[]; let size=0; for await (const c of req){size+=c.length;if(size>1024*1024)throw Object.assign(new Error('Request too large'),{statusCode:413});chunks.push(c)} return Buffer.concat(chunks).toString('utf8'); }
async function readJson(req) { const raw=await readRaw(req); if(!raw)return {}; return JSON.parse(raw); }
function authUser(req) { const h=req.headers.authorization; const token=h?.startsWith('Bearer ')?h.slice(7):parseCookies(req).watchable_session; return userFromToken(token); }
function requireUser(req) { const user=authUser(req); if (!user) throw Object.assign(new Error('Authentication required'),{statusCode:401}); return user; }
function safeStaticPath(urlPath) { const rel=urlPath==='/'?'index.html':urlPath.replace(/^\//,''); const file=path.normalize(path.join(publicDir,rel)); if (!file.startsWith(publicDir)) return null; return file; }
function serveStatic(req,res,urlPath) {
  const file=safeStaticPath(urlPath); if (!file || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return false;
  const ext=path.extname(file); const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'};
  res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream','Cache-Control':ext==='.html'?'no-store':'public, max-age=3600'}); fs.createReadStream(file).pipe(res); return true;
}
function audit(action,user,targetType,targetId,detail={}) { getDb().prepare('INSERT INTO audit_events (id,actor_user_id,action,target_type,target_id,detail_json,created_at) VALUES (?,?,?,?,?,?,?)').run(id('aud'),user?.id||null,action,targetType||null,targetId||null,JSON.stringify(detail),now()); }

async function api(req,res,url) {
  const method=req.method||'GET';
  if (method==='GET' && url.pathname==='/api/health') return send(res,200,{ok:true,service:'Watchable TV',version:'1.0.0',time:now()});
  if (method==='GET' && url.pathname==='/api/plan') return send(res,200,PLAN);
  if (method==='POST' && url.pathname==='/api/billing/stripe/webhook') { const raw=await readRaw(req); const result=await handleStripeWebhook(raw,req.headers['stripe-signature']); return send(res,200,result); }
  if (method==='POST' && url.pathname==='/api/auth/register') {
    const b=await readJson(req); if(!b.email||!b.password||!b.displayName) return send(res,400,{error:'email, password and displayName are required'});
    if(String(b.password).length<10) return send(res,400,{error:'Password must be at least 10 characters'});
    const user=await createUser(b); const session=createSession(user.id); audit('user.registered',user,'user',user.id);
    return send(res,201,{user,expiresAt:session.expiresAt},{'Set-Cookie':`watchable_session=${encodeURIComponent(session.token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`});
  }
  if (method==='POST' && url.pathname==='/api/auth/login') {
    const b=await readJson(req); const auth=getUserAuthByEmail(b.email||''); if(!auth||!(await verifyPassword(b.password||'',auth.password_hash))) return send(res,401,{error:'Invalid email or password'});
    const session=createSession(auth.id); const user=getUserById(auth.id); audit('user.logged_in',user,'user',user.id);
    return send(res,200,{user,expiresAt:session.expiresAt},{'Set-Cookie':`watchable_session=${encodeURIComponent(session.token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`});
  }
  if (method==='POST' && url.pathname==='/api/auth/logout') { const token=parseCookies(req).watchable_session; revokeSession(token); return send(res,200,{ok:true},{'Set-Cookie':'watchable_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'}); }
  if (method==='GET' && url.pathname==='/api/me') { const user=requireUser(req); return send(res,200,{user,subscription:getSubscription(user.id)}); }
  if (method==='POST' && url.pathname==='/api/billing/checkout') { const user=requireUser(req); const b=await readJson(req); const result=await createCheckout({user,repCode:b.repCode||''}); audit('billing.checkout_created',user,'subscription',result.subscription?.id||null,{provider:result.provider}); return send(res,200,result); }
  if (method==='GET' && url.pathname==='/api/channels') { requireUser(req); return send(res,200,{channels:listChannels()}); }
  if (method==='GET' && url.pathname==='/api/vod') { requireUser(req); return send(res,200,{assets:listVod()}); }

  if (method==='GET' && url.pathname==='/api/search') { requireUser(req); const q=(url.searchParams.get('q')||'').trim().toLowerCase(); if(!q)return send(res,200,{channels:[],vod:[]}); return send(res,200,{channels:listChannels().filter(x=>x.name.toLowerCase().includes(q)||x.category.toLowerCase().includes(q)),vod:listVod().filter(x=>x.title.toLowerCase().includes(q)||(x.description||'').toLowerCase().includes(q))}); }
  if (method==='GET' && url.pathname==='/api/favorites') { const user=requireUser(req); return send(res,200,{favorites:getDb().prepare('SELECT asset_type,asset_id,created_at FROM favorites WHERE user_id=? ORDER BY created_at DESC').all(user.id)}); }
  if (method==='POST' && url.pathname==='/api/favorites') { const user=requireUser(req); const b=await readJson(req); getDb().prepare('INSERT OR IGNORE INTO favorites (user_id,asset_type,asset_id,created_at) VALUES (?,?,?,?)').run(user.id,b.assetType,b.assetId,now()); return send(res,201,{ok:true}); }
  if (method==='DELETE' && url.pathname==='/api/favorites') { const user=requireUser(req); const b=await readJson(req); getDb().prepare('DELETE FROM favorites WHERE user_id=? AND asset_type=? AND asset_id=?').run(user.id,b.assetType,b.assetId); return send(res,200,{ok:true}); }
  if (method==='GET' && url.pathname==='/api/profiles') { const user=requireUser(req); return send(res,200,{profiles:getDb().prepare('SELECT * FROM profiles WHERE user_id=? ORDER BY created_at').all(user.id)}); }
  if (method==='POST' && url.pathname==='/api/profiles') { const user=requireUser(req); const b=await readJson(req); if(!b.name)return send(res,400,{error:'name required'}); const profile={id:id('pro'),userId:user.id,name:String(b.name).slice(0,40),isKids:b.isKids?1:0,createdAt:now()}; getDb().prepare('INSERT INTO profiles (id,user_id,name,is_kids,created_at) VALUES (?,?,?,?,?)').run(profile.id,profile.userId,profile.name,profile.isKids,profile.createdAt); return send(res,201,profile); }
  if (method==='GET' && url.pathname==='/api/ads/decision') { const user=requireUser(req); return send(res,200,{ad:decideAd({userId:user.id,assetType:url.searchParams.get('assetType'),assetId:url.searchParams.get('assetId'),category:url.searchParams.get('category')})}); }
  if (method==='POST' && url.pathname==='/api/ads/event') { const user=requireUser(req); const b=await readJson(req); return send(res,201,trackAd({...b,userId:user.id})); }

  if (method==='GET' && url.pathname==='/api/guide') { requireUser(req); return send(res,200,{guide:guide({hours:Number(url.searchParams.get('hours')||6)})}); }
  if (method==='POST' && url.pathname==='/api/playback/session') { const user=requireUser(req); const b=await readJson(req); const result=createPlaybackSession({userId:user.id,assetType:b.assetType,assetId:b.assetId,country:req.headers['x-watchable-country']||'US'}); audit('playback.session_created',user,b.assetType,b.assetId); return send(res,200,result); }
  if (method==='POST' && url.pathname==='/api/dvr') { const user=requireUser(req); const b=await readJson(req); const rec=scheduleRecording(user.id,b.programId); audit('dvr.scheduled',user,'program',b.programId); return send(res,201,rec); }
  if (method==='GET' && url.pathname==='/api/dvr') { const user=requireUser(req); return send(res,200,{recordings:listRecordings(user.id)}); }
  if (method==='GET' && url.pathname==='/api/admin/summary') {
    const user=requireUser(req); if(user.role!=='admin') return send(res,403,{error:'Admin required'}); const db=getDb();
    const summary={users:db.prepare('SELECT COUNT(*) n FROM users').get().n,activeSubscriptions:db.prepare("SELECT COUNT(*) n FROM subscriptions WHERE status='active'").get().n,channels:db.prepare('SELECT COUNT(*) n FROM channels WHERE active=1').get().n,vod:db.prepare('SELECT COUNT(*) n FROM vod_assets WHERE active=1').get().n,rightsVerifiedSources:db.prepare('SELECT COUNT(*) n FROM content_sources WHERE rights_verified=1').get().n,commissionCents:db.prepare("SELECT COALESCE(SUM(commission_cents),0) n FROM commission_events WHERE status='earned'").get().n};
    return send(res,200,summary);
  }
  if (method==='GET' && url.pathname.startsWith('/api/reps/')) {
    const user=requireUser(req); if(user.role!=='admin') return send(res,403,{error:'Admin required'}); const code=url.pathname.split('/')[3]; const rep=getDb().prepare('SELECT * FROM reps WHERE code=?').get(code); if(!rep) return send(res,404,{error:'Rep not found'}); return send(res,200,{rep,summary:listCommissionSummary(rep.id)});
  }
  return send(res,404,{error:'Not found'});
}

const server=http.createServer(async (req,res)=>{
  try {
    const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`);
    if(url.pathname.startsWith('/api/')) return await api(req,res,url);
    if(serveStatic(req,res,url.pathname)) return;
    return send(res,404,'Not found');
  } catch(error) {
    console.error(error);
    return send(res,error.statusCode||500,{error:error.message||'Internal server error'});
  }
});

if (process.env.NODE_ENV!=='test') server.listen(config.port,()=>console.log(`Watchable TV listening on ${config.baseUrl}`));
export { server };
