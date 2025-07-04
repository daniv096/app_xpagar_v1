import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { appStyles, appColors } from '../constants/appStyles'; 

const EnviarScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // Recibimos el saldo de la billetera y el userId de la pantalla anterior
  const { userWalletBalance, userId } = route.params || {};

  // Formateamos el saldo para mostrarlo
  const formattedWalletBalance = userWalletBalance != null ? parseFloat(userWalletBalance).toFixed(2) : '0.00';

  const handleSendOptionPress = (option) => {
    // Lógica para manejar la selección de la opción de envío
    console.log(`Opción de envío seleccionada: ${option}`);
    Alert.alert("Funcionalidad Próxima", `Has seleccionado: ${option}. Esta funcionalidad se desarrollará pronto.`);
    // Aquí navegarías a la pantalla específica para cada tipo de envío
    // Por ejemplo:
    // if (option === 'Otro Xpagar') {
    //   navigation.navigate('EnviarOtroXpagarScreen', { userId: userId, userWalletBalance: userWalletBalance });
    // } else if (option === 'Bancos') {
    //   navigation.navigate('EnviarBancosScreen', { userId: userId, userWalletBalance: userWalletBalance });
    // }
  };

  return (
    <LinearGradient
      colors={[appColors.gradientStart, appColors.gradientEnd]}
      style={appStyles.container}
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
            source={require('../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.screenTitle}>Enviar Dinero</Text>
        <Text style={styles.subtitle}>Seleccione cómo desea enviar fondos</Text>

        {/* Saldo de la billetera */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Saldo Actual de Billetera:</Text>
          <Text style={styles.balanceAmount}>${formattedWalletBalance}</Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.sendButton} onPress={() => handleSendOptionPress('Otro Xpagar')}>
            <Ionicons name="person-add-outline" size={40} color={appColors.primary} />
            <Text style={styles.sendButtonText}>Enviar a otro xPagar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sendButton} onPress={() => handleSendOptionPress('Bancos')}>
            <Ionicons name="business-outline" size={40} color={appColors.primary} />
            <Text style={styles.sendButtonText}>Enviar a Bancos</Text>
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
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 20,
    zIndex: 1,
  },
  logo: {
    width: 100, // Ajusta el tamaño según sea necesario
    height: 100, // Ajusta el tamaño según sea necesario
    marginBottom: 10,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: appColors.white,
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 18,
    color: appColors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  balanceContainer: {
    backgroundColor: appColors.cardBackground,
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  balanceLabel: {
    fontSize: 16,
    color: appColors.textSecondary,
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: appColors.primary,
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginTop: 20,
  },
  sendButton: {
    backgroundColor: appColors.cardBackground,
    width: '45%', 
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
  sendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: appColors.textPrimary,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default EnviarScreen;
