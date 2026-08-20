import { getDb } from './db.js';
import { id, now } from './util.js';
import { registerSource } from './content.js';

export function seedDemo() {
  const db=getDb();
  if (!db.prepare('SELECT 1 FROM reps LIMIT 1').get()) {
    db.prepare('INSERT INTO reps (id,code,name,email,status,default_rate,created_at) VALUES (?,?,?,?,?,?,?)').run(id('rep'),'FOUNDING20','Founding Sales Rep','sales@example.com','active',0.20,now());
  }
  if (db.prepare('SELECT COUNT(*) count FROM channels').get().count > 0) return;
  const demoSource=registerSource({name:'Watchable Demo Rights-Cleared Fixtures',adapterType:'VOD',rightsVerified:true,status:'active'});
  const channels=[
    ['news-demo','Watchable News Demo','News',false,false,'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'],
    ['sports-demo','Watchable Sports Demo','Sports',false,true,'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'],
    ['premium-demo','Watchable Premium Demo','Premium',true,false,'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4']
  ];
  for (const [slug,name,category,premium,sports,url] of channels) {
    const channelId=id('chn');
    db.prepare(`INSERT INTO channels (id,source_id,slug,name,category,playback_url,playback_type,premium,sports,active,territories,metadata_json) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(channelId,demoSource,slug,name,category,url,'mp4',premium?1:0,sports?1:0,1,'US','{"demo":true}');
    for (let i=0;i<6;i++) {
      const starts=new Date(Date.now()+i*3600000); const ends=new Date(starts.getTime()+3600000);
      db.prepare('INSERT INTO programs (id,channel_id,title,description,starts_at,ends_at,rating) VALUES (?,?,?,?,?,?,?)').run(id('prg'),channelId,`${name} — Program ${i+1}`,'Rights-cleared development fixture.',starts.toISOString(),ends.toISOString(),'TV-PG');
    }
  }
  db.prepare(`INSERT INTO vod_assets (id,source_id,slug,title,description,kind,playback_url,playback_type,premium,active,territories,metadata_json) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(id('vod'),demoSource,'big-buck-bunny','Big Buck Bunny','Open/demo VOD fixture used for platform verification.','movie','https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4','mp4',0,1,'US','{"demo":true}');
}
