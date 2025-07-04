// NewPasswordScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import { useFonts, Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { API_URL } from '@env';

export default function NewPasswordScreen({ route, navigation }) {
  const { phone } = route.params;
  const [newPassword, setNewPassword] = useState('');
  let [fontsLoaded] = useFonts({ Pacifico_400Regular });

  const handleUpdatePassword = async () => {
    try {
      const response = await fetch(`${API_URL}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, newPassword }),
      });

      console.log(phone, newPassword);

      if (response.ok) {
        Alert.alert('Éxito', 'Contraseña actualizada');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', 'No se pudo actualizar');
      }
    } catch {
      Alert.alert('Error', 'Fallo al actualizar');
    }
  };

  if (!fontsLoaded) return null;

  return (
    <LinearGradient colors={[COLORS.primaryBlue, COLORS.primaryOrange]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.innerContainer}>
        <View style={styles.dialogBox}>
          <View style={styles.esloganBox}>
            <Image source={require('../assets/logo.png')} style={styles.esloganImage} resizeMode="contain" />
            <Text style={styles.esloganTexto}>Tu compra segura</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nueva contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#aaa"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleUpdatePassword}>
            <Text style={styles.loginButtonText}>Guardar contraseña</Text>
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
  container: { flex: 1 },
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
    width: 130,
    height: 130,
    marginBottom: -50,
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