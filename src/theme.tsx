import React,{createContext,useContext,useEffect,useMemo,useState} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
export type ThemePref='auto'|'light'|'dark';
export type Mode='light'|'dark';
export type Palette={bg:string;card:string;ink:string;muted:string;accent:string;accentInk:string;gold:string;sand:string;rule:string;selected:string;error:string;buttonSecondaryBg:string};
export const lightColors:Palette={bg:'#faf8f6',card:'#ffffff',ink:'#1c1917',muted:'#6b6560',accent:'#337765',accentInk:'#ffffff',gold:'#b98a2f',sand:'#f4efec',rule:'#e8e4e1',selected:'#d5e9e2',error:'#b42318',buttonSecondaryBg:'#edf5f2'};
export const darkColors:Palette={bg:'#101514',card:'#1a211e',ink:'#f2efe9',muted:'#a8a29b',accent:'#4da88c',accentInk:'#0c1f19',gold:'#d4a94e',sand:'#1e2a25',rule:'#2c3531',selected:'#24443a',error:'#f0928a',buttonSecondaryBg:'#223129'};
const C=createContext<{mode:Mode;pref:ThemePref;setPref:(p:ThemePref)=>void;colors:Palette}>(null!);
export function ThemeProvider({children}:React.PropsWithChildren){const system=useColorScheme();const [pref,setPrefState]=useState<ThemePref>('auto');useEffect(()=>{void AsyncStorage.getItem('sarathi:theme').then(v=>{if(v==='light'||v==='dark'||v==='auto')setPrefState(v);});},[]);const setPref=(p:ThemePref)=>{setPrefState(p);void AsyncStorage.setItem('sarathi:theme',p);};const mode:Mode=pref==='auto'?(system==='dark'?'dark':'light'):pref;const colors=mode==='dark'?darkColors:lightColors;const value=useMemo(()=>({mode,pref,setPref,colors}),[mode,pref,colors]);return <C.Provider value={value}>{children}</C.Provider>;}
export const useTheme=()=>useContext(C);
