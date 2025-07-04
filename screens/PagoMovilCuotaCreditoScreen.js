import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  StatusBar, 
  ScrollView,
  TextInput,
  Modal,
  Alert, 
  ActivityIndicator, 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { appStyles, appColors } from '../constants/appStyles'; 
import { API_URL } from '@env'; 

const PagoMovilCuotaCreditoScreen = () => {
  const navigation = useNavigation();
  const route = useRoute(); 
  // Recibimos 'userId' y el objeto 'installment' de la cuota de COMPRA a pagar
  const { userId, installment } = route.params || {}; 

  // Estados para los campos del formulario
  const [amount, setAmount] = useState(''); // Monto de la cuota, no editable, se toma de installment
  const [documentPrefix, setDocumentPrefix] = useState('V'); 
  const [documentNumber, setDocumentNumber] = useState('');
  const [phonePrefix, setPhonePrefix] = useState('0414'); 
  const [phoneNumber, setPhoneNumber] = useState('');
  const [accountType, setAccountType] = useState('Corriente'); // Tipo de cuenta para Pago Móvil
  const [bankCode, setBankCode] = useState(''); // Código del banco para Pago Móvil
  
  // Estados para modales de resultado y carga
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isLoadingBanks, setIsLoadingBanks] = useState(true);
  const [bancosDisponibles, setBancosDisponibles] = useState([]);

  // Prefijos para selectores
  const documentPrefixes = [
    { label: 'V', value: 'V' }, { label: 'J', value: 'J' },
    { label: 'E', value: 'E' }, { label: 'P', value: 'P' },
  ];
  const phonePrefixes = [
    { label: '0414', value: '0414' }, { label: '0424', value: '0424' },
    { label: '0426', value: '0426' }, { label: '0416', value: '0416' },
    { label: '0412', value: '0412' }, { label: '0422', value: '0422' },
  ];
  const accountTypes = [
    { label: 'Corriente', value: 'Corriente' },
    { label: 'Ahorro', value: 'Ahorro' },
  ];

  // Efecto para cargar los bancos disponibles al iniciar la pantalla
  useEffect(() => {
    const fetchBancos = async () => {
      try {
        setIsLoadingBanks(true);
        const response = await fetch(`${API_URL}/api/bancos`); 
        const result = await response.json();
        if (Array.isArray(result)) {
          setBancosDisponibles(result);
        } else {
          console.warn("fetchBancos: Respuesta inesperada de bancos:", result);
          setBancosDisponibles([]);
        }
      } catch (error) {
        console.error("Error al obtener bancos:", error);
        Alert.alert("Error", "No se pudieron cargar los bancos disponibles. Intenta de nuevo.");
        setBancosDisponibles([]);
      } finally {
        setIsLoadingBanks(false);
      }
    };
    fetchBancos();
  }, []);

  // Efecto para inicializar el monto de la cuota
  useEffect(() => {
    if (installment && installment.amount_due) {
      setAmount(parseFloat(installment.amount_due).toFixed(2));
    } else {
      Alert.alert("Error", "No se pudo cargar la información de la cuota.");
      navigation.goBack();
    }
  }, [installment, navigation]);

  if (!installment || !userId) {
    return (
      <LinearGradient colors={[appColors.gradientStart, appColors.gradientEnd]} style={appStyles.loadingContainer}>
        <ActivityIndicator size="large" color={appColors.white} />
        <Text style={appStyles.loadingText}>Cargando detalles de pago...</Text>
      </LinearGradient>
    );
  }

  const handlePayment = async () => {
    if (!documentNumber || !phoneNumber || !bankCode || !accountType) {
      Alert.alert("Campos Incompletos", "Por favor, completa todos los campos del formulario.");
      return;
    }
    if (phoneNumber.length !== 7) {
      Alert.alert("Número de Teléfono Inválido", "El número de teléfono debe tener 7 dígitos (sin el prefijo).");
      return;
    }

    setIsProcessingPayment(true);

    const paymentData = {
      installmentId: installment.installment_id, // ID de la cuota de compra
      userId: userId,
      paymentMethod: 'Pago Móvil',
      amountPaid: parseFloat(amount),
      documentType: documentPrefix,
      documentNumber: documentNumber,
      phonePrefix: phonePrefix,
      phoneNumber: phoneNumber,
      accountType: accountType,
      bankCode: bankCode,
      // Puedes añadir más detalles si tu backend los requiere
    };

    try {
      // Endpoint para procesar el pago de cuotas de crédito por Pago Móvil
      // ¡IMPORTANTE!: Necesitarás crear este endpoint en tu backend
      const response = await fetch(`${API_URL}/api/payCreditInstallmentViaMovil`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`, // Si tu API requiere token
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();

      if (response.ok) {
        setPaymentSuccess(true);
        setPaymentMessage(result.message || 'Pago de cuota de crédito procesado exitosamente.');
      } else {
        setPaymentSuccess(false);
        setPaymentMessage(result.message || 'Error al procesar el pago de la cuota de crédito.');
      }
    } catch (error) {
      console.error('Error en la llamada al API de pago de cuota de crédito:', error);
      setPaymentSuccess(false);
      setPaymentMessage('Error de conexión al servidor de pagos. Intenta de nuevo.');
    } finally {
      setIsProcessingPayment(false);
      setModalVisible(true); // Mostrar el modal de resultado
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    if (paymentSuccess) {
      navigation.popToTop(); // Vuelve al Dashboard principal o a la pantalla de historial
    }
  };

  return (
    <LinearGradient
      colors={[appColors.gradientStart, appColors.gradientEnd]}
      style={styles.container}
    >
      <StatusBar
        backgroundColor="transparent"
        translucent
        barStyle="light-content"
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
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

          <Text style={styles.screenTitle}>Pago Móvil - Cuota de Crédito</Text>
          <Text style={styles.subtitle}>Paga tu cuota de compra de crédito</Text>

          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Monto de la Cuota</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={`$${amount}`}
              editable={false} // El monto no es editable
            />

            <Text style={styles.inputLabel}>Cédula/RIF del Beneficiario</Text>
            <View style={styles.rowInputContainer}>
              <View style={styles.prefixPickerContainer}>
                <Picker
                  selectedValue={documentPrefix}
                  onValueChange={(itemValue) => setDocumentPrefix(itemValue)}
                  style={styles.pickerStyle}
                  itemStyle={styles.pickerItemStyle}
                >
                  {documentPrefixes.map((prefix) => (
                    <Picker.Item key={prefix.value} label={prefix.label} value={prefix.value} />
                  ))}
                </Picker>
              </View>
              <TextInput
                style={styles.inputFlex}
                placeholder="Número de documento"
                placeholderTextColor={appColors.textSecondary}
                keyboardType="numeric"
                value={documentNumber}
                onChangeText={setDocumentNumber}
                maxLength={10}
              />
            </View>

            <Text style={styles.inputLabel}>Número de Teléfono del Beneficiario</Text>
            <View style={styles.rowInputContainer}>
              <View style={styles.prefixPickerContainer}>
                <Picker
                  selectedValue={phonePrefix}
                  onValueChange={(itemValue) => setPhonePrefix(itemValue)}
                  style={styles.pickerStyle}
                  itemStyle={styles.pickerItemStyle}
                >
                  {phonePrefixes.map((prefix) => (
                    <Picker.Item key={prefix.value} label={prefix.label} value={prefix.value} />
                  ))}
                </Picker>
              </View>
              <TextInput
                style={styles.inputFlex}
                placeholder="Número de teléfono (7 dígitos)"
                placeholderTextColor={appColors.textSecondary}
                keyboardType="numeric"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                maxLength={7}
              />
            </View>

            <Text style={styles.inputLabel}>Banco Destino</Text>
            <View style={styles.pickerContainer}>
              {isLoadingBanks ? (
                <ActivityIndicator size="small" color={appColors.primary} />
              ) : (
                <Picker
                  selectedValue={bankCode}
                  onValueChange={(itemValue) => setBankCode(itemValue)}
                  style={styles.pickerStyle}
                  itemStyle={styles.pickerItemStyle}
                >
                  <Picker.Item label="Selecciona un banco" value="" />
                  {bancosDisponibles.map((bank) => (
                    <Picker.Item key={bank.ban_codigo} label={`${bank.Ban_nombre} (${bank.ban_codigo})`} value={bank.ban_codigo} />
                  ))}
                </Picker>
              )}
            </View>

            <Text style={styles.inputLabel}>Tipo de Cuenta</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={accountType}
                onValueChange={(itemValue) => setAccountType(itemValue)}
                style={styles.pickerStyle}
                itemStyle={styles.pickerItemStyle}
              >
                {accountTypes.map((type) => (
                  <Picker.Item key={type.value} label={type.label} value={type.value} />
                ))}
              </Picker>
            </View>

            <TouchableOpacity style={styles.payButton} onPress={handlePayment} disabled={isProcessingPayment}>
              {isProcessingPayment ? (
                <ActivityIndicator color={appColors.white} />
              ) : (
                <Text style={styles.payButtonText}>Pagar Cuota</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Modal de resultado de pago */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: paymentSuccess ? appColors.green : appColors.red }]}>
                {paymentSuccess ? '¡Pago Exitoso!' : 'Error en el Pago'}
              </Text>
              <TouchableOpacity onPress={handleModalClose} style={styles.closeButton}>
                <Ionicons name="close-circle-outline" size={30} color={appColors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Ionicons 
                name={paymentSuccess ? "checkmark-circle" : "close-circle"} 
                size={80} 
                color={paymentSuccess ? appColors.green : appColors.red} 
                style={styles.modalIcon} 
              />
              <Text style={styles.modalMessage}>
                {paymentMessage}
              </Text>
            </View>

            <TouchableOpacity 
                style={[styles.modalActionButton, { backgroundColor: paymentSuccess ? appColors.primary : appColors.red }]} 
                onPress={handleModalClose}
            >
              <Text style={styles.modalActionButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 15,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 10,
    zIndex: 1,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 5,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: appColors.white,
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 5,
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
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: appColors.textPrimary,
    marginBottom: 10,
  },
  input: {
    backgroundColor: appColors.background,
    borderWidth: 1,
    borderColor: appColors.lightGray,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: appColors.textPrimary,
    marginBottom: 20,
  },
  disabledInput: {
    backgroundColor: appColors.lightGray,
    color: appColors.textSecondary,
  },
  rowInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  prefixPickerContainer: {
    width: '30%',
    marginRight: 10,
    borderWidth: 1,
    borderColor: appColors.lightGray,
    borderRadius: 12,
    backgroundColor: appColors.background,
    overflow: 'hidden',
  },
  inputFlex: {
    flex: 1,
    backgroundColor: appColors.background,
    borderWidth: 1,
    borderColor: appColors.lightGray,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: appColors.textPrimary,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: appColors.lightGray,
    borderRadius: 12,
    backgroundColor: appColors.background,
    marginBottom: 20,
    overflow: 'hidden',
  },
  pickerStyle: {
    height: 50,
    color: appColors.textPrimary,
  },
  pickerItemStyle: {
    fontSize: 16,
    color: appColors.textPrimary,
  },
  payButton: {
    backgroundColor: appColors.primary,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: appColors.white,
  },
  // Estilos del modal de éxito/error
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: appColors.cardBackground,
    borderRadius: 20,
    padding: 25,
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: appColors.textPrimary, 
    borderBottomWidth: 3,
    borderBottomColor: appColors.secondary, 
    paddingBottom: 5,
    flex: 1, 
    marginRight: 10,
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    alignItems: 'center',
    marginBottom: 25,
  },
  modalIcon: {
    marginBottom: 15,
  },
  modalMessage: {
    fontSize: 16,
    color: appColors.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalActionButton: {
    backgroundColor: appColors.primary,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  modalActionButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: appColors.white,
  },
  modalHighlightText: {
    fontWeight: 'bold',
    color: appColors.primary, 
  },
});

export default PagoMovilCuotaCreditoScreen;