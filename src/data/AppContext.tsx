import React,{createContext,useContext,useState,useEffect,useRef} from 'react';
import { AppState } from 'react-native';
import { Catalogue, ReminderPreference } from '../types/scholarship';
import { bundledCatalogue, loadCatalogue, refreshCatalogue } from './catalogueRepository';
import { loadReminders } from '../storage/localState';
import { reconcile } from '../notifications/reconcile';
const C=createContext<{catalogue:Catalogue;reminders:ReminderPreference[];setReminders:(r:ReminderPreference[])=>void;refresh:(force?:boolean)=>Promise<void>;message:string;ready:boolean}>(null!);
export const useApp=()=>useContext(C);
export function AppProvider({children}:React.PropsWithChildren){const [catalogue,setCatalogue]=useState(bundledCatalogue),[reminders,setReminders]=useState<ReminderPreference[]>([]),[message,setMessage]=useState('Bundled offline catalogue'),[ready,setReady]=useState(false);const latest=useRef(catalogue);const busy=useRef(false);async function refresh(force=false){if(busy.current)return;busy.current=true;try{const result=await refreshCatalogue(latest.current,force);latest.current=result.catalogue;setCatalogue(result.catalogue);setMessage(result.message);setReminders(await reconcile(result.catalogue,await loadReminders()));}finally{busy.current=false;}}useEffect(()=>{let alive=true;(async()=>{const c=await loadCatalogue();latest.current=c;if(alive){setCatalogue(c);setReminders(await reconcile(c,await loadReminders()));setReady(true);await refresh();}})();const sub=AppState.addEventListener('change',state=>{if(state==='active')void refresh();});return()=>{alive=false;sub.remove();};},[]);return <C.Provider value={{catalogue,reminders,setReminders,refresh,message,ready}}>{children}</C.Provider>;}
