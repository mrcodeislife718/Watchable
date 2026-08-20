import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { getDb } from './db.js';

const dvrDir=path.resolve(process.env.DVR_STORAGE_PATH||'data/dvr');

export async function runDueRecordings({nowMs=Date.now()}={}) {
  fs.mkdirSync(dvrDir,{recursive:true});
  const db=getDb();
  const due=db.prepare(`SELECT d.id recording_id,p.*,c.playback_url,c.dvr_allowed FROM dvr_recordings d JOIN programs p ON p.id=d.program_id JOIN channels c ON c.id=p.channel_id WHERE d.status='scheduled' AND p.starts_at<=? AND p.ends_at>?`).all(new Date(nowMs).toISOString(),new Date(nowMs).toISOString());
  const results=[];
  for(const row of due){
    if(!row.dvr_allowed||!row.playback_url){db.prepare("UPDATE dvr_recordings SET status='unavailable' WHERE id=?").run(row.recording_id);results.push({id:row.recording_id,status:'unavailable'});continue;}
    const seconds=Math.max(1,Math.ceil((Date.parse(row.ends_at)-nowMs)/1000));
    const output=path.join(dvrDir,`${row.recording_id}.mp4`);
    db.prepare("UPDATE dvr_recordings SET status='recording' WHERE id=?").run(row.recording_id);
    const code=await ffmpegRecord(row.playback_url,output,seconds);
    const status=code===0?'ready':'failed';
    db.prepare('UPDATE dvr_recordings SET status=? WHERE id=?').run(status,row.recording_id);
    results.push({id:row.recording_id,status,output:status==='ready'?output:null});
  }
  return results;
}

function ffmpegRecord(url,output,seconds){return new Promise(resolve=>{const p=spawn('ffmpeg',['-y','-i',url,'-t',String(seconds),'-c','copy',output],{stdio:'ignore'});p.on('exit',c=>resolve(c??1));p.on('error',()=>resolve(1));})}
