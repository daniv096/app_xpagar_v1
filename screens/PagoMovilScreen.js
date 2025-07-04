import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  StatusBar, 
  ScrollView,
  Modal, // Para el dropdown
  ActivityIndicator, // Para el estado de carga
  Alert // Para las alertas de copiar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Clipboard from '@react-native-community/clipboard'; // Para copiar al portapapeles

import { appStyles, appColors } from '../constants/appStyles'; 
import { API_URL } from '@env'; // Asegúrate de que API_URL esté disponible

const PagoMovilScreen = () => {
  const navigation = useNavigation();

  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [pagoMovilNumber, setPagoMovilNumber] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false); // Estado para el modal del dropdown

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. Obtener cuentas bancarias
        const bankResponse = await fetch(`${API_URL}/api/xp/bankAccounts`);
        if (!bankResponse.ok) {
          throw new Error('No se pudieron obtener las cuentas bancarias.');
        }
        const bankData = await bankResponse.json();
        if (Array.isArray(bankData) && bankData.length > 0) {
          setBankAccounts(bankData);
          setSelectedBank(bankData[0]); // Selecciona la primera cuenta por defecto
        } else {
          setBankAccounts([]);
          setSelectedBank(null);
          console.warn('No se encontraron cuentas bancarias.');
        }

        // 2. Obtener número de Pago Móvil de configuración
        const configResponse = await fetch(`${API_URL}/api/xp/config/CELULARPAGOMOVIL`);
        if (!configResponse.ok) {
          throw new Error('No se pudo obtener el número de Pago Móvil.');
        }
        const configData = await configResponse.json();
        setPagoMovilNumber(configData.value);

      } catch (err) {
        console.error('Error al cargar datos de Pago Móvil:', err);
        setError(err.message || 'Error al cargar la información de Pago Móvil. Intenta de nuevo.');
        Alert.alert('Error', err.message || 'No se pudo conectar con el servidor.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const copyToClipboard = (text, fieldName) => {
    Clipboard.setString(text);
    Alert.alert("Copiado", `${fieldName} "${text}" copiado al portapapeles.`);
  };

  const renderDropdown = () => (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsDropdownVisible(true)}
      >
        <Text style={styles.dropdownText}>
          {selectedBank ? selectedBank.bankName : "Seleccione un Banco"}
        </Text>
        <Ionicons name="caret-down-outline" size={20} color={appColors.textSecondary} />
      </TouchableOpacity>
      <Modal
        visible={isDropdownVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setIsDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsDropdownVisible(false)}
        >
          <View style={styles.dropdownModalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {bankAccounts.map((bank) => (
                <TouchableOpacity
                  key={bank.id}
                  style={styles.dropdownOption}
                  onPress={() => {
                    setSelectedBank(bank);
                    setIsDropdownVisible(false);
                  }}
                >
                  <Text style={styles.dropdownOptionText}>
                    {bank.bankName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );

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
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
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

          <Text style={styles.screenTitle}>Seleccione el tipo de recarga de la billetera</Text>
          <Text style={styles.subtitle}>Detalles de Pago Móvil xPagar</Text>

          {isLoading ? (
            <ActivityIndicator size="large" color={appColors.primary} style={styles.loadingIndicator} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <View style={styles.formContainer}>
              <Text style={styles.sectionLabel}>Seleccione el Banco:</Text>
              {renderDropdown()}

              {selectedBank && (
                <View style={styles.detailsCard}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Nombre del Banco:</Text>
                    <Text style={styles.detailValue}>{selectedBank.bankName}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>RIF de xPagar:</Text>
                    <TouchableOpacity onPress={() => copyToClipboard(selectedBank.rif, 'RIF')}>
                      <Text style={styles.detailValueWithCopy}>{selectedBank.rif} <Ionicons name="copy-outline" size={16} color={appColors.primary} /></Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Teléfono de xPagar:</Text>
                    <TouchableOpacity onPress={() => copyToClipboard(selectedBank.phoneNumber, 'Teléfono')}>
                      <Text style={styles.detailValueWithCopy}>{selectedBank.phoneNumber} <Ionicons name="copy-outline" size={16} color={appColors.primary} /></Text>
                    </TouchableOpacity>
                  </View>

                  {pagoMovilNumber && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Cédula/RIF para Pago Móvil:</Text>
                      <TouchableOpacity onPress={() => copyToClipboard(pagoMovilNumber, 'Cédula/RIF Pago Móvil')}>
                        <Text style={styles.detailValueWithCopy}>{pagoMovilNumber} <Ionicons name="copy-outline" size={16} color={appColors.primary} /></Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}

              <Text style={styles.infoText}>
                Realiza el pago móvil a los datos de xPagar y luego reporta tu pago en la sección correspondiente.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
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
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  screenTitle: {
    fontSize: 22,
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
  formContainer: {
    backgroundColor: appColors.cardBackground,
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    marginBottom: 30,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: appColors.textPrimary,
    marginBottom: 10,
  },
  detailsCard: {
    backgroundColor: appColors.background,
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: appColors.lightGray,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 15,
    color: appColors.textSecondary,
    fontWeight: 'bold',
    flex: 1,
  },
  detailValue: {
    fontSize: 15,
    color: appColors.textPrimary,
    flex: 2,
    textAlign: 'right',
  },
  detailValueWithCopy: {
    fontSize: 15,
    color: appColors.primary, // Color para indicar que se puede copiar
    flex: 2,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 14,
    color: appColors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 20,
  },
  loadingIndicator: {
    paddingVertical: 50,
  },
  errorText: {
    color: appColors.red,
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
    fontWeight: '600',
  },
  // Estilos para el dropdown (reutilizados de TelefonoPaymentScreen)
  dropdownContainer: {
    marginBottom: 20,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: appColors.background,
    borderWidth: 1,
    borderColor: appColors.lightGray,
    borderRadius: 12,
    padding: 15,
  },
  dropdownText: {
    fontSize: 16,
    color: appColors.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdownModalContent: {
    width: '80%',
    maxHeight: '40%',
    backgroundColor: appColors.cardBackground,
    borderRadius: 15,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  dropdownOption: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: appColors.lightGray,
  },
  dropdownOptionText: {
    fontSize: 16,
    color: appColors.textPrimary,
  },
});

export default PagoMovilScreen;
