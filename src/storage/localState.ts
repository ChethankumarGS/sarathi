import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApplicationMode, LocalChecklist, ReminderPreference } from '../types/scholarship';
const prefix='sarathi:';
export const checklistKey=(id:string,year:string,mode:ApplicationMode)=>`${prefix}checklist:${id}:${year}:${mode}`;
export async function loadChecklist(id:string,year:string,mode:ApplicationMode):Promise<LocalChecklist>{const raw=await AsyncStorage.getItem(checklistKey(id,year,mode));return raw?JSON.parse(raw):{scholarshipId:id,academicYear:year,mode,checkedDocumentIds:[]};}
export async function saveChecklist(c:LocalChecklist){await AsyncStorage.setItem(checklistKey(c.scholarshipId,c.academicYear,c.mode),JSON.stringify(c));}
export async function loadReminders():Promise<ReminderPreference[]>{return JSON.parse(await AsyncStorage.getItem(prefix+'reminders')||'[]');}
export async function saveReminders(rs:ReminderPreference[]){await AsyncStorage.setItem(prefix+'reminders',JSON.stringify(rs));}
export async function clearLocal(){const keys=(await AsyncStorage.getAllKeys()).filter(k=>k.startsWith(prefix+'checklist')||k===prefix+'reminders'||k===prefix+'filters');await AsyncStorage.multiRemove(keys);}
export { AsyncStorage };
