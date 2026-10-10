import React from 'react';import * as Notifications from 'expo-notifications';import { Platform } from 'react-native';
if(Platform.OS!=='web')Notifications.setNotificationHandler({handleNotification:async()=>({shouldShowBanner:true,shouldShowList:true,shouldPlaySound:false,shouldSetBadge:false})});
import { SafeAreaProvider } from 'react-native-safe-area-context';import { StatusBar } from 'expo-status-bar';import { AppProvider } from './src/data/AppContext';import { RootNavigator } from './src/navigation/RootNavigator';
export default function App(){return <SafeAreaProvider><AppProvider><StatusBar style="dark"/><RootNavigator/></AppProvider></SafeAreaProvider>;}
