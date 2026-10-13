import React,{createContext,useContext,useState,useEffect,useRef} from 'react';
import { AppState } from 'react-native';
import { Catalogue, ReminderPreference } from '../types/scholarship';
import { bundledCatalogue, loadCatalogue, refreshCatalogue, checkForUpdate } from './catalogueRepository';
import { AsyncStorage, loadReminders } from '../storage/localState';
import { reconcile } from '../notifications/reconcile';
const C=createContext<{catalogue:Catalogue;reminders:ReminderPreference[];setReminders:(r:ReminderPreference[])=>void;refresh:(force?:boolean)=>Promise<void>;message:string;ready:boolean;updateAvailable:number|null;applyUpdate:()=>Promise<void>;dismissUpdate:()=>void}>(null!);
export const useApp=()=>useContext(C);
export function AppProvider({children}:React.PropsWithChildren){const [catalogue,setCatalogue]=useState(bundledCatalogue),[reminders,setReminders]=useState<ReminderPreference[]>([]),[message,setMessage]=useState('Saved scholarship list (works offline)'),[ready,setReady]=useState(false),[updateAvailable,setUpdateAvailable]=useState<number|null>(null);const latest=useRef(catalogue);const busy=useRef(false);
async function refresh(force=false){if(busy.current)return;busy.current=true;try{const result=await refreshCatalogue(latest.current,force);latest.current=result.catalogue;setCatalogue(result.catalogue);setMessage(result.message);setReminders(await reconcile(result.catalogue,await loadReminders()));}finally{busy.current=false;}}
async function lookForUpdate(){const dismissed=Number(await AsyncStorage.getItem('sarathi:update-dismissed')||'0');const v=await checkForUpdate(latest.current);if(v&&v>dismissed)setUpdateAvailable(v);else await refresh();}
async function applyUpdate(){await refresh(true);setUpdateAvailable(null);}
function dismissUpdate(){if(updateAvailable!=null)void AsyncStorage.setItem('sarathi:update-dismissed',String(updateAvailable));setUpdateAvailable(null);}
useEffect(()=>{let alive=true;(async()=>{const c=await loadCatalogue();latest.current=c;if(alive){setCatalogue(c);setReminders(await reconcile(c,await loadReminders()));setReady(true);await lookForUpdate();}})();const sub=AppState.addEventListener('change',state=>{if(state==='active')void lookForUpdate();});return()=>{alive=false;sub.remove();};},[]);
return <C.Provider value={{catalogue,reminders,setReminders,refresh,message,ready,updateAvailable,applyUpdate,dismissUpdate}}>{children}</C.Provider>;}
