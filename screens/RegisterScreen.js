// RegisterScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, Image, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { useFonts, Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { API_URL } from '@env';


export default function RegisterScreen() {
  const navigation = useNavigation();

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [cedula, setCedula] = useState('');
  const [password, setClave] = useState('');
  const [fchnac, setFechaNacimiento] = useState('');

  let [fontsLoaded] = useFonts({ Pacifico_400Regular });

  const handleRegistro = async () => {
    if (!cedula || !telefono || !email) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }

    const datosUsuario = {
      nombre, apellido, email, telefono, cedula, password, fchnac
    };

    try {
      // 1. Enviar OTP al número
      const sendToken = await fetch(`${API_URL}/api/send-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: telefono })
      });

      const result = await sendToken.json();
      if (result.status === 'pending') {
        navigation.navigate('VerifyToken', { telefono, datosUsuario });
      } else {
        Alert.alert('Error', 'No se pudo enviar el token.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Fallo al registrar o enviar token');
    }
  };

  return (
    <LinearGradient colors={[COLORS.primaryBlue, COLORS.primaryOrange]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollView} keyboardShouldPersistTaps="handled">
          <View style={styles.dialogBox}>
            <View style={styles.esloganBox}>
              <Image source={require('../assets/logo.png')} style={styles.esloganImage} resizeMode="contain" />
              <Text style={styles.esloganTexto}>Tu compra segura</Text>
            </View>

            <Text style={styles.title}>Crear Cuenta</Text>

            <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
            <TextInput style={styles.input} placeholder="Apellido" value={apellido} onChangeText={setApellido} />
            <TextInput style={styles.input} placeholder="Correo" value={email} onChangeText={setCorreo} keyboardType="email-address" />
            <TextInput style={styles.input} placeholder="Teléfono (+584...)" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />
            <TextInput style={styles.input} placeholder="Fecha de Nacimiento (YYYY-MM-DD)" value={fchnac} onChangeText={setFechaNacimiento} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Cédula" value={cedula} onChangeText={setCedula} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Contraseña" value={password} onChangeText={setClave} secureTextEntry />

            <TouchableOpacity style={styles.registerButton} onPress={handleRegistro}>
              <Text style={styles.registerButtonText}>Registrarse</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  dialogBox: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 10,
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
    color: '#000',
  },
  registerButton: {
    backgroundColor: COLORS.primaryOrange,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
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