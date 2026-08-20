import { getDb } from './db.js';
import { id, now, parseJson } from './util.js';

export function decideAd({userId,assetType,assetId,category=null}) {
  const db=getDb(); const ts=now();
  const campaigns=db.prepare("SELECT * FROM ad_campaigns WHERE status='active' AND (starts_at IS NULL OR starts_at<=?) AND (ends_at IS NULL OR ends_at>?) ORDER BY created_at").all(ts,ts);
  const eligible=campaigns.filter(c=>{const t=parseJson(c.target_json);return !t.categories||!category||t.categories.includes(category)});
  if(!eligible.length) return null;
  const campaign=eligible[Math.abs(hash(`${userId}:${assetId}:${new Date().getUTCDate()}`))%eligible.length];
  return {campaignId:campaign.id,creativeUrl:campaign.creative_url,clickUrl:campaign.click_url};
}
export function trackAd({campaignId,userId,assetType,assetId,eventType}) {getDb().prepare('INSERT INTO ad_impressions (id,campaign_id,user_id,asset_type,asset_id,event_type,created_at) VALUES (?,?,?,?,?,?,?)').run(id('adi'),campaignId,userId||null,assetType||null,assetId||null,eventType,now());return {ok:true}}
function hash(s){let h=0;for(const c of s)h=((h<<5)-h)+c.charCodeAt(0)|0;return h}
