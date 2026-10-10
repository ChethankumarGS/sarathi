import React,{useState} from 'react';import {View} from 'react-native';import {Button} from './ui';
export function Disclosure({label,children}:React.PropsWithChildren<{label:string}>){const [open,setOpen]=useState(false);return <View style={{gap:8}}><Button secondary label={(open?'Hide ':'View ')+label} onPress={()=>setOpen(!open)}/>{open&&children}</View>;}
