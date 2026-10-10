import { Catalogue, ReminderPreference, Scholarship } from '../types/scholarship';
import { planReminder } from './plan';
export interface ReminderDriver { permitted: boolean; cancel:(ids:string[])=>Promise<void>; schedule:(s:Scholarship,r:ReminderPreference,times:string[])=>Promise<string[]>; persist:(r:ReminderPreference[])=>Promise<void>; }
export async function reconcileWithDriver(c:Catalogue,reminders:ReminderPreference[],driver:ReminderDriver,force=false,now=Date.now()){
 const output:ReminderPreference[]=[];
 for(const r of reminders){
  const s=c.scholarships.find(s=>s.id===r.scholarshipId),p=planReminder(s,r,now);
  const unavailable=p.unavailable||!driver.permitted;
  const changed=force||p.deadline!==r.deadlineSnapshot||unavailable!==!!r.unavailable||JSON.stringify(p.times)!==JSON.stringify(r.scheduledFor);
  if(!changed){output.push(r);continue;}
  await driver.cancel(r.notificationIds);
  const next:ReminderPreference={...r,deadlineSnapshot:p.deadline||'',notificationIds:[],scheduledFor:[],unavailable};
  await driver.persist([...output,next,...reminders.slice(output.length+1)]);
  if(s&&!next.unavailable){try{next.notificationIds=await driver.schedule(s,next,p.times);next.scheduledFor=p.times;}catch{next.unavailable=true;}}
  output.push(next);
 }
 await driver.persist(output);return output;
}
