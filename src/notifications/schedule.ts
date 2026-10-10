import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Scholarship, ReminderPreference } from '../types/scholarship';
import { reminderTimes, deadlinePassed } from '../utils/indiaDates';
export async function cancelIds(ids:string[]){if(Platform.OS!=='web')for(const id of ids)await Notifications.cancelScheduledNotificationAsync(id);}
export async function scheduleTimes(s:Scholarship,r:ReminderPreference,times:string[]){const ids:string[]=[];try{for(const t of times)ids.push(await Notifications.scheduleNotificationAsync({content:{title:'Sarathi: scholarship reminder',body:`${s.name}: check the official portal before applying.`,data:{scholarshipId:s.id,academicYear:r.academicYear,mode:r.mode}},trigger:{type:Notifications.SchedulableTriggerInputTypes.DATE,date:new Date(t),channelId:'deadlines'}}));return ids;}catch(e){await cancelIds(ids);throw e;}}
