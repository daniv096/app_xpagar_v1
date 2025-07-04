// VerifyTokenScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView,
  Platform, Alert, Image, BackHandler
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import { useFonts, Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_URL } from '@env';


export default function VerifyTokenScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { telefono, datosUsuario } = route.params;

  const [inputToken, setInputToken] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [attemptsLeft, setAttemptsLeft] = useState(3);

  let [fontsLoaded] = useFonts({ Pacifico_400Regular });

  useEffect(() => {
    if (timeLeft === 0) return;
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleVerification = async () => {
    try {
      const response = await fetch(`${API_URL}/api/verify-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: telefono, code: inputToken })
        
      });

      

      const result = await response.json();

      //console.log('phone:', telefono, 'code:', inputToken, 'result:', result);

      if (result.verified === true) {
        // guardar el usuario
        const saveUser = await fetch(`${API_URL}/api/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datosUsuario)
          
        });

        
        const resultRegister = await saveUser.json();
        console.log(datosUsuario, 'resultRegister:', resultRegister);

        if (saveUser.ok) {
          Alert.alert('Éxito', resultRegister.message || 'Usuario registrado correctamente');
          navigation.navigate('Login');
        } else {
          Alert.alert(
              'Error', 
              resultRegister.message || 'No se pudo guardar el usuario',
            [{ text: 'Volver', onPress: () => navigation.goBack() }]
          );
        }

      } else {
        const newAttempts = attemptsLeft - 1;
        setAttemptsLeft(newAttempts);

        if (newAttempts > 0) {
          Alert.alert('Token incorrecto', `Te quedan ${newAttempts} intento(s)`);
        } else {
          Alert.alert('Error', 'Demasiados intentos. Cerrando app.', [{ text: 'Aceptar', onPress: () => BackHandler.exitApp() }]);
        }
      }

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Fallo al verificar token');
    }
  };

  const handleResend = async () => {
    setTimeLeft(60);
    setAttemptsLeft(3);
    await fetch(`${API_URL}/api/send-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: telefono })
    });
    Alert.alert('Token reenviado', 'Revisa tu teléfono nuevamente.');
  };

  return (
    <LinearGradient colors={[COLORS.primaryBlue, COLORS.primaryOrange]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.dialogBox}>
        <View style={styles.esloganBox}>
          <Image source={require('../assets/logo.png')} style={styles.esloganImage} resizeMode="contain" />
          <Text style={styles.esloganTexto}>Tu compra segura</Text>
        </View>

        <Text style={styles.title}>Verificación de Token</Text>
        <Text style={styles.subtitle}>Ingrese el código enviado al número: {telefono}</Text>

        <TextInput
          style={styles.tokenInput}
          placeholder="123456"
          placeholderTextColor="#aaa"
          value={inputToken}
          onChangeText={setInputToken}
          keyboardType="numeric"
          textAlign="center"
          maxLength={6}
        />

        <Text style={styles.timer}>
          {timeLeft > 0 ? `Token expira en ${timeLeft}s` : 'Token expirado'}
        </Text>

        <TouchableOpacity
          style={[styles.verifyButton, timeLeft === 0 && styles.disabledButton]}
          onPress={handleVerification}
          disabled={timeLeft === 0}
        >
          <Text style={styles.verifyButtonText}>Verificar</Text>
        </TouchableOpacity>

        {timeLeft === 0 && (
          <TouchableOpacity onPress={handleResend}>
            <Text style={styles.resendText}>¿No recibiste el token? Reenviar</Text>
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  dialogBox: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    marginHorizontal: 25,
    borderRadius: 15,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 10,
  },
  esloganBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 10,
    marginBottom: 20,
  },
  esloganImage: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  esloganTexto: {
    fontSize: 20,
    fontFamily: 'Pacifico_400Regular',
    color: '#ffa500',
    textAlign: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 25,
  },
  tokenInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 20,
    backgroundColor: '#fff',
    marginBottom: 15,
    color: '#000',
    letterSpacing: 10,
  },
  timer: {
    textAlign: 'center',
    color: COLORS.primaryBlue,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  verifyButton: {
    backgroundColor: COLORS.primaryOrange,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  verifyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resendText: {
    textAlign: 'center',
    color: COLORS.primaryBlue,
    textDecorationLine: 'underline',
    fontSize: 14,
    marginTop: 10,
  },
  terminosText: {
    marginTop: 20,
    fontSize: 13,
    textAlign: 'center',
    color: '#fff',
    textDecorationLine: 'underline',
  },
});