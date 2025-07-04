import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { ProgressBarAndroid, Platform, ProgressViewIOS } from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { jwtDecode } from 'jwt-decode';
import { API_URL } from '@env';



const colors = {
  primary: '#0055a4',
  secondary: '#ff6b00',
  textLight: '#fff',
  textMuted: '#ccc',
};

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const route = useRoute();

  const { token } = route.params || {};
  
  let userId = null;
    try {
      const decoded = jwtDecode(token);
      userId = decoded.id;
    } catch (e) {
      console.error('Token inválido o malformado', e);
    }
    //const {REG_CODIGO}  = userId;
   
  console.log(API_URL,userId);
   
  //const { usu_codigo } = route.params || {};
  console.log('Resultado del usuario de dashboard:', userId);
  // Simulamos el código de usuario
  //const usu_codigo = '0000000003';

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        //const response = await fetch('https://nodejs-mysql-restapi-production-d0f6.up.railway.app/api/iduser', {
        const response = await fetch(`${API_URL}/api/iduser`,{
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });
  
        const result = await response.json();
  
        if (result.success && result.user) {
          setUserData(result.user);
          console.log('✅ Datos de usuario cargados:', result.user);
        } else {
          console.warn('Usuario no encontrado o error en la respuesta');
        }
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    };
  
    fetchUserData();
  }, []);

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: () => navigation.replace('Login'),
      }
    ]);
  };

  const handleRefer = () => {
    Alert.alert("Compartir", "Aquí iría la lógica para referir a un amigo 😄");
  };

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }}>
    <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 120 }]}>
      <View style={styles.userInfo}>
        <Ionicons name="person-circle-outline" size={80} color="#0055a4" />
        <Text style={styles.name}>{userData.REG_NOMBRE} {userData.REG_APELLIDO}</Text>
        <Text style={styles.info}>Cédula: {userData.REG_CEDULA}</Text>
        <Text style={styles.info}>Correo: {userData.REG_MAIL}</Text>
        <Text style={styles.info}>Teléfono: {userData.REG_TELEFONO}</Text>
      </View>

      {/* Nivel y puntos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nivel de usuario</Text>
        <Text style={styles.settingText}>Nivel  puntos</Text>
        
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuración</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Notificaciones</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            thumbColor={notificationsEnabled ? '#ff6b00' : '#ccc'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categorías favoritas</Text>
        <Text style={styles.settingText}>[Aquí irán chips de selección o lista más adelante]</Text>
      </View>

      
        

      <TouchableOpacity style={styles.optionButton} onPress={handleRefer}>
        <Ionicons name="megaphone-outline" size={20} color="#0055a4" />
        <Text style={styles.optionText}>Referir a un amigo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.optionButton} onPress={handleRefer}>
      <Ionicons name="shield-lock-outline" size={20} color="#0055a4" />
        <Text style={styles.optionText}>Seguridad</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.optionButton}>
        <Ionicons name="document-text-outline" size={20} color="#0055a4" />
        <Text style={styles.optionText}>Términos y condiciones</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#555',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#0055a4',
  },
  info: {
    fontSize: 16,
    color: '#555',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 1,
  },
  optionText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#0055a4',
  },
  logoutButton: {
    backgroundColor: '#ff6b00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    marginTop: 30,
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;