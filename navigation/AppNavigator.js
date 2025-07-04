import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context'; // <-- ¡IMPORTANTE!

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import VerifyTokenScreen from '../screens/VerifyTokenScreen';
import ArticuloDetalleScreen from '../screens/ArticuloDetalleScreen';
import DashboardScreen from '../screens/DashboardScreen';
import DashboardTabs from '../navigation/DashboardTabs'; 
import CuotasPendientesScreen from '../screens/CuotasPendientesScreen';
import DetalleCuotasScreen from '../screens/DetalleCuotasScreen';
import ConfirmarPagoScreen from '../screens/ConfirmarPagoScreen';
import StoreDetailScreen from '../screens/StoreDetailScreen';
import QrScreen from '../screens/QrScreen';
import DiarioCreditoScreen from '../screens/DiarioCreditoScreen';
import BilleteraScreen from '../screens/BilleteraScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetTokenScreen from '../screens/ResetTokenScreen';
import NewPasswordScreen from '../screens/NewPasswordScreen';
import CorpoelecScreen from '../screens/CorpoelecScreen'; 
import TelefonoPaymentScreen from '../screens/TelefonoPaymentScreen';
import RecargaScreen from '../screens/RecargaScreen'; 
import PagoMovilScreen from '../screens/PagoMovilScreen'; 
import PagoMovilDirectoScreen from '../screens/PagoMovilDirectoScreen';
import PagoMovilCuotaScreen from '../screens/PagoMovilCuotaScreen';
import EnviarScreen from '../screens/EnviarScreen';
import PagarScreen from '../screens/PagarScreen'; 
import SelectInstallmentPaymentMethodScreen from '../screens/SelectInstallmentPaymentMethodScreen'; 
import ConfirmPurchaseScreen from '../screens/ConfirmPurchaseScreen'; 
import PagoMovilCuotaCreditoScreen from '../screens/PagoMovilCuotaCreditoScreen';
import CreditInstallmentBreakdownScreen from '../screens/CreditInstallmentBreakdownScreen';




import TabNavigator from './TabNavigator';


const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <SafeAreaProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen 
            name="Splash" 
            component={SplashScreen}
        />
        <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
        />
        <Stack.Screen
            name="Home" // <- Ahora usamos el TabNavigator aquí
            component={TabNavigator}
            options={{ headerShown: false }}
        />
        <Stack.Screen
            name="Register"
            component={RegisterScreen}
        />
        <Stack.Screen
          name="VerifyToken"
          component={VerifyTokenScreen}
        />
        <Stack.Screen 
          name="ArticuloDetalle" 
          component={ArticuloDetalleScreen} 
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
        />
        <Stack.Screen 
          name="DashboardTabs" 
          component={DashboardTabs} 
        /> 
        <Stack.Screen 
          name="CuotasPendientesScreen" 
          component={CuotasPendientesScreen} 
        />
        <Stack.Screen 
          name="DetalleCuotasScreen" 
          component={DetalleCuotasScreen} 
        /> 
        <Stack.Screen 
          name="ConfirmarPago" 
          component={ConfirmarPagoScreen} 
        />       
        <Stack.Screen 
          name="StoreDetail" 
          component={StoreDetailScreen} 
        />   
        <Stack.Screen 
          name="QrScreen" 
          component={QrScreen} 
          options={{ headerShown: false }} 
        />    
        <Stack.Screen 
          name="DiarioCredito" 
          component={DiarioCreditoScreen} 
        />
        <Stack.Screen 
          name="Billetera" 
          component={BilleteraScreen} 
        />
        <Stack.Screen name="PagoMovilCuotaCreditoScreen" component={PagoMovilCuotaCreditoScreen} /> 
        <Stack.Screen name="ConfirmPurchaseScreen" component={ConfirmPurchaseScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PagarScreen" component={PagarScreen} options={{ headerShown: false }} />
        <Stack.Screen name="EnviarScreen" component={EnviarScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PagoMovilDirectoScreen" component={PagoMovilDirectoScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PagoMovilCuotaScreen" component={PagoMovilCuotaScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PagoMovilScreen" component={PagoMovilScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RecargaScreen" component={RecargaScreen} options={{ headerShown: false }} />
        <Stack.Screen name="TelefonoPaymentScreen" component={TelefonoPaymentScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CorpoelecScreen" component={CorpoelecScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetToken" component={ResetTokenScreen} />
        <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
        <Stack.Screen name="SelectInstallmentPaymentMethodScreen" component={SelectInstallmentPaymentMethodScreen} options={{ headerShown: false }} /> 
        <Stack.Screen name="CreditInstallmentBreakdownScreen" component={CreditInstallmentBreakdownScreen} options={{ headerShown: false }} /> 
      </Stack.Navigator>      
    </NavigationContainer>
    </SafeAreaProvider>
  );
}