// ResetTokenScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import { useFonts, Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { API_URL } from '@env';
import { useNavigation } from '@react-navigation/native';

export default function ResetTokenScreen({ route }) {
  const { phone } = route.params;
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(120);
  const navigation = useNavigation();

  let [fontsLoaded] = useFonts({ Pacifico_400Regular });

  useEffect(() => {
    if (timeLeft === 0) return;
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleVerifyCode = async () => {
    try {
      const response = await fetch(`${API_URL}/api/verify-reset-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code })
      });

      const result = await response.json();

      if (result.verified) {
        navigation.navigate('NewPassword', { phone });
      } else {
        Alert.alert('Error', 'Código incorrecto');
      }
    } catch (error) {
      Alert.alert('Error', 'Fallo al verificar el código');
    }
  };

  const handleResend = async () => {
    setTimeLeft(120);
    try {
      await fetch(`${API_URL}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      Alert.alert('Reenviado', 'Nuevo token enviado');
    } catch (err) {
      Alert.alert('Error', 'No se pudo reenviar token');
    }
  };

  if (!fontsLoaded) return null;

  return (
    <LinearGradient colors={[COLORS.primaryBlue, COLORS.primaryOrange]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.innerContainer}
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

          <Text style={styles.label}>Código recibido por SMS</Text>
          <TextInput
            style={[styles.input, { textAlign: 'center' }]}
            placeholder="123456"
            value={code}
            onChangeText={setCode}
            keyboardType="numeric"
            maxLength={6}
          />

          <Text style={{ textAlign: 'center', marginBottom: 10, color: '#444' }}>
            {timeLeft > 0
              ? `Espera ${timeLeft} segundos para reenviar`
              : '¿No recibiste el código?'}
          </Text>

          {timeLeft === 0 && (
            <TouchableOpacity onPress={handleResend}>
              <Text style={{ color: COLORS.primaryBlue, textAlign: 'center', marginBottom: 10 }}>
                Reenviar código
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.loginButton, timeLeft === 0 && styles.disabledButton]} 
            onPress={handleVerifyCode}
            disabled={timeLeft === 0}
            >
            <Text style={styles.loginButtonText}>Verificar código</Text>
          </TouchableOpacity>

        </View>

        {/* Términos y Condiciones */}
                <TouchableOpacity onPress={() => Alert.alert('Términos y Condiciones', 'Aquí mostrarás tu política.')}>
                  <Text style={styles.terminosText}>Términos y Condiciones</Text>
                </TouchableOpacity>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  esloganBox: {
    alignItems: 'center',
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
  },
  dialogBox: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 25,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  label: {
    fontSize: 14,
    color: '#000',
    marginBottom: 6,
    fontWeight: '500',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
    marginBottom: 15,
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
  terminosText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#fff',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});