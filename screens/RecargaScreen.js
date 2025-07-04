import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar, Alert } from 'react-native'; // Importamos Alert
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { appStyles, appColors } from '../constants/appStyles'; // Asegúrate de que esta ruta sea correcta

const RecargaScreen = () => {
  const navigation = useNavigation();
  const route = useRoute(); // <-- Obtén los parámetros de la ruta
  const { userId } = route.params || {}; // <-- Extrae el userId

  // NUEVO LOG: Para ver qué userId se recibe de BilleteraScreen
  console.log('RecargaScreen - userId recibido:', userId);

  const handleRecargaTypePress = (type) => {
    // Lógica para manejar la selección del tipo de recarga
    console.log(`Tipo de recarga seleccionado: ${type}`);
    // Por ahora, solo mostramos una alerta para indicar que el botón funciona.
    // En el futuro, aquí navegarías a la pantalla específica para cada tipo de recarga.
    Alert.alert("Tipo de Recarga", `Has seleccionado: ${type}`);
  };

  return (
    <LinearGradient
      colors={[appColors.gradientStart, appColors.gradientEnd]}
      style={appStyles.container} // Usamos appStyles.container para un fondo consistente
    >
      <StatusBar
        backgroundColor="transparent"
        translucent
        barStyle="light-content"
      />
      <SafeAreaView style={appStyles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-circle-outline" size={35} color={appColors.white} />
          </TouchableOpacity>
          <Image
            source={require('../assets/logo.png')} // Asegúrate de que esta ruta sea correcta para tu logo de xPagar
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Seleccione el tipo de recarga de la billetera</Text>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.recargaButton} onPress={() => navigation.navigate('PagoMovilScreen')}>
            <Ionicons name="phone-portrait-outline" size={40} color={appColors.primary} />
            <Text style={styles.recargaButtonText}>Pago Móvil</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.recargaButton} onPress={() => handleRecargaTypePress('Deposito')}>
            <Ionicons name="wallet-outline" size={40} color={appColors.primary} />
            <Text style={styles.recargaButtonText}>Depósito</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.recargaButton} onPress={() => handleRecargaTypePress('Tarjeta')}>
            <Ionicons name="card-outline" size={40} color={appColors.primary} />
            <Text style={styles.recargaButtonText}>Tarjeta</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.recargaButton} onPress={() => navigation.navigate('PagoMovilDirectoScreen', { userId: userId })}> {/* <-- Pasa userId aquí */}
            <Ionicons name="phone-portrait-outline" size={40} color={appColors.primary} />
            <Text style={styles.recargaButtonText}>Pago Móvil Directo</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 25,
    position: 'relative', // Necesario para posicionar el botón de retroceso absolutamente
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 20,
    zIndex: 1,
  },
  logo: {
    width: 120, // Ajusta el tamaño según sea necesario
    height: 120, // Ajusta el tamaño según sea necesario
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: appColors.white,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginTop: 20,
  },
  recargaButton: {
    backgroundColor: appColors.cardBackground,
    width: '45%', // Aproximadamente la mitad del ancho, con algo de espaciado
    paddingVertical: 25,
    paddingHorizontal: 15,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  recargaButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: appColors.textPrimary,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default RecargaScreen;
