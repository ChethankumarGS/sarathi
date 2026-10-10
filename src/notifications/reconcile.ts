import { Catalogue, ReminderPreference } from '../types/scholarship';
import { cancelIds, scheduleTimes } from './schedule';
import { planReminder } from './plan';
import { permissionStatus } from './permission';
import { saveReminders } from '../storage/localState';
let queue:Promise<unknown>=Promise.resolve();
export function reconcile(c:Catalogue,reminders:ReminderPreference[],force=false):Promise<ReminderPreference[]>{const work=async()=>{const permitted=await permissionStatus()==='granted';const output:ReminderPreference[]=[];for(const r of reminders){const s=c.scholarships.find(s=>s.id===r.scholarshipId);const p=planReminder(s,r);const changed=force||p.deadline!==r.deadlineSnapshot||p.unavailable!==!!r.unavailable||JSON.stringify(p.times)!==JSON.stringify(r.scheduledFor)||!permitted; if(!changed){output.push(r);continue;}await cancelIds(r.notificationIds);const next={...r,deadlineSnapshot:p.deadline||'',notificationIds:[],scheduledFor:[],unavailable:p.unavailable||!permitted} as ReminderPreference;await saveReminders([...output,next,...reminders.slice(output.length+1)]);if(s&&!next.unavailable){try{next.notificationIds=await scheduleTimes(s,next,p.times);next.scheduledFor=p.times;}catch{next.unavailable=true;}}output.push(next);}await saveReminders(output);return output;};const result=queue.then(work);queue=result.catch(()=>{});return result;}
