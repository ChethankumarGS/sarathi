import { Catalogue, ReminderPreference } from '../types/scholarship';
import { cancelIds, scheduleTimes } from './schedule';
import { permissionStatus } from './permission';
import { saveReminders } from '../storage/localState';
import { reconcileWithDriver } from './reconcileEngine';
let queue:Promise<unknown>=Promise.resolve();
export function reconcile(c:Catalogue,reminders:ReminderPreference[],force=false):Promise<ReminderPreference[]>{
 const work=async()=>reconcileWithDriver(c,reminders,{permitted:await permissionStatus()==='granted',cancel:cancelIds,schedule:scheduleTimes,persist:saveReminders},force);
 const result=queue.then(work);queue=result.catch(()=>{});return result;
}
