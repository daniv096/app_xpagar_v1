import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { useFonts, Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '@env';
import { useBox } from '../hooks/useBox'; // importa el hook

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const { box, BoxComponent } = useBox();

  const [fontsLoaded] = useFonts({ Pacifico_400Regular });

  const handleLogin = async () => {
    if (!email || !password) {
      console.log("Mostrando alerta...");
      box('Advertencia', 'Por favor ingresa correo y contraseña', 'Aceptar');
      //Alert.alert('Error', 'Por favor ingresa correo y contraseña');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        
          navigation.replace('DashboardTabs', { token: data.token }); // Enviar el token
     
      } else {
        box('Login fallido', data.message || 'Credenciales incorrectas', 'Aceptar');
        //Alert.alert('Login fallido', data.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error(error);
      box('Error', 'Hubo un problema al conectar con el servidor', 'Aceptar');
      //Alert.alert('Error', 'Hubo un problema al conectar con el servidor');
    }
  };

  if (!fontsLoaded) return null;

  return (
    <LinearGradient
      colors={[COLORS.primaryBlue, COLORS.primaryOrange]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.dialogBox}>
            <View style={styles.esloganBox}>
              <Image
                source={require('../assets/logo.png')}
                style={styles.esloganImage}
                resizeMode="contain"
              />
              <Text style={styles.esloganTexto}>Tu compra segura</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo electrónico</Text>
              <TextInput
                style={styles.input}
                placeholder="ejemplo@correo.com"
                placeholderTextColor="#aaa"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#aaa"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity
              style={styles.forgotContainer}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>
                ¿No tienes una cuenta?{' '}
                <Text style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
                  Regístrate
                </Text>
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => Alert.alert('Términos y Condiciones', 'Aquí mostrarás tu política.')}
          >
            <Text style={styles.terminosText}>Términos y Condiciones</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
      {/* ✅ El popup personalizado va aquí */}
      {BoxComponent}
    </LinearGradient>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  esloganBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  esloganImage: {
    width: 130,
    height: 130,
    marginBottom: -40,
  },
  esloganTexto: {
    fontSize: 20,
    fontFamily: 'Pacifico_400Regular',
    color: '#ffa500',
  },
  dialogBox: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 35,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#000',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
  },
  forgotContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 14,
    color: COLORS.primaryBlue,
  },
  loginButton: {
    backgroundColor: COLORS.primaryOrange,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  registerContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#666',
  },
  registerLink: {
    color: COLORS.primaryOrange,
    fontWeight: 'bold',
  },
  terminosText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#fff',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});