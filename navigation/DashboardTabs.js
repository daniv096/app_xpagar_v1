// xpagar/navigation/DashboardTabs.js

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DiarioCreditoScreen from '../screens/DiarioCreditoScreen';
import BilleteraScreen from '../screens/BilleteraScreen';
import AvanceEfectivoScreen from '../screens/AvanceEfectivoScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

//token: data.token
const DashboardTabs = ({ route }) => {
  const { token, micCreava } = route.params || {}; // <-- ¡Recibe micCreava aquí!
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
    screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#ff6b00',
        tabBarInactiveTintColor: '#ccc',
        tabBarStyle: {
            backgroundColor: '#222', // Gris claro
            borderTopWidth: 0,
            position: 'relative',
            elevation: 5,
            height: 60 + insets.bottom, // 👈 se adapta al dispositivo
            paddingBottom: insets.bottom, // 👈 espacio real para evitar tapar
          },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Inicio') iconName = 'home';
          if (route.name === 'Diario') iconName = 'cart';
          if (route.name === 'Billetera') iconName = 'wallet';
          if (route.name === 'Avance') iconName = 'wallet-outline';
          if (route.name === 'Perfil') iconName = 'person';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}    
    >
      <Tab.Screen name="Inicio" component={DashboardScreen} initialParams={{ token }} />
      <Tab.Screen name="Diario" component={DiarioCreditoScreen} initialParams={{ token }} />
      <Tab.Screen name="Billetera" component={BilleteraScreen} initialParams={{ token }} />
      <Tab.Screen name="Avance" component={AvanceEfectivoScreen} initialParams={{ token, micCreava }} />
      <Tab.Screen name="Perfil" component={ProfileScreen} initialParams={{ token }} />
      

    </Tab.Navigator>
  );
};

export default DashboardTabs;