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

const PagoMovilDirectoScreen = () => {
  const navigation = useNavigation();
  const route = useRoute(); 
  // Recibimos 'userId', 'amount' (opcional, si viene de recarga) y 'installment' (opcional, si viene de pago de cuota)
  const { userId, amount: initialAmount, installment } = route.params || {}; 

  // Estados para los campos del formulario
  const [amount, setAmount] = useState(initialAmount ? String(initialAmount) : ''); // Monto inicial puede venir de la cuota
  const [documentPrefix, setDocumentPrefix] = useState('V'); 
  const [documentNumber, setDocumentNumber] = useState('');
  const [phonePrefix, setPhonePrefix] = useState('0414'); 
  const [phoneNumber, setPhoneNumber] = useState('');
  const [accountType, setAccountType] = useState('Corriente'); 

  // Estados para la visibilidad de los dropdowns
  const [isDocumentPrefixDropdownVisible, setIsDocumentPrefixDropdownVisible] = useState(false);
  const [isPhonePrefixDropdownVisible, setIsPhonePrefixDropdownVisible] = useState(false);
  const [isAccountTypeDropdownVisible, setIsAccountTypeDropdownVisible] = useState(false);

  // Estados para el modal de confirmación
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
  const [dynamicKey, setDynamicKey] = useState('');
  const [isProcessingConfirmation, setIsProcessingConfirmation] = useState(false); 

  // Estados para el modal de resultado final (éxito/error)
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [resultSuccess, setResultSuccess] = useState(false);

  // Determinar si estamos en modo de pago de cuota
  const isInstallmentPayment = !!installment;

  useEffect(() => {
    if (isInstallmentPayment && installment?.payment_amount) {
      // Si es pago de cuota, pre-llenar y bloquear el monto
      setAmount(parseFloat(installment.payment_amount).toFixed(2));
    }
  }, [isInstallmentPayment, installment]);

  // Opciones para los dropdowns
  const documentPrefixOptions = [
    { label: 'V - Venezolano', value: 'V' },
    { label: 'J - Jurídico', value: 'J' },
    { label: 'C - Cédula', value: 'C' },
    { label: 'E - Extranjero', value: 'E' },
    { label: 'P - Pasaporte', value: 'P' },
  ];

  const phonePrefixOptions = [
    { label: '0414', value: '0414' },
    { label: '0424', value: '0424' },
    { label: '0426', value: '0426' },
    { label: '0416', value: '0416' },
    { label: '0412', value: '0412' },
    { label: '0422', value: '0422' },
  ];

  const accountTypeOptions = [
    { label: 'Corriente', value: 'Corriente' },
    { label: 'Ahorro', value: 'Ahorro' },
  ];

  // Función genérica para renderizar un dropdown
  const renderDropdown = (options, selectedValue, onSelect, setVisibility, isVisible) => (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setVisibility(true)}
      >
        <Text style={styles.dropdownText}>
          {selectedValue}
        </Text>
        <Ionicons name="caret-down-outline" size={20} color={appColors.textSecondary} />
      </TouchableOpacity>
      <Modal
        visible={isVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setVisibility(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setVisibility(false)}
        >
          <View style={styles.dropdownModalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={option.value || index}
                  style={styles.dropdownOption}
                  onPress={() => {
                    onSelect(option.value);
                    setVisibility(false);
                  }}
                >
                  <Text style={styles.dropdownOptionText}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );

  // Manejador para el botón "Confirmar" del formulario
  const handleConfirmPayment = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Por favor, ingresa un monto válido y mayor a cero.");
      return;
    }
    if (!documentNumber || documentNumber.length < 5) { 
      Alert.alert("Error", "Por favor, ingresa un número de documento válido (mínimo 5 dígitos).");
      return;
    }
    if (!phoneNumber || phoneNumber.length !== 7) { 
      Alert.alert("Error", "Por favor, ingresa los 7 dígitos del número de teléfono.");
      return;
    }
    if (!userId) {
        Alert.alert("Error", "No se pudo obtener el ID de usuario. Vuelve a iniciar sesión.");
        return;
    }

    setConfirmationModalVisible(true);
  };

  // Manejador para el botón "Confirmar" dentro del modal
  const handleConfirmDynamicKey = async () => {
    if (!dynamicKey || dynamicKey.length < 4) { 
      Alert.alert("Error", "Por favor, ingresa una clave dinámica válida (mínimo 4 dígitos).");
      return;
    }

    setIsProcessingConfirmation(true); 

    // Lógica condicional para pago de cuota o recarga de billetera
    if (isInstallmentPayment) {
      // --- Lógica para Pago de Cuota de Avance ---
      const installmentPaymentPayload = {
        installmentId: installment.payment_id,
        usu_codigo: userId,
        dynamicKey: dynamicKey, // Si tu backend requiere la clave dinámica para este pago
        // Otros datos de la cuota que el backend necesite para validar y procesar
      };

      try {
        const response = await fetch(`${API_URL}/api/payInstallment`, { // Endpoint para pagar cuotas
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(installmentPaymentPayload),
        });

        const result = await response.json();

        if (response.ok) {
          setResultSuccess(true);
          setResultMessage(result.message || 'Pago de cuota procesado exitosamente.');
        } else {
          setResultSuccess(false);
          setResultMessage(result.message || 'Error al procesar el pago de la cuota.');
        }
      } catch (error) {
        console.error("Error al procesar el pago de cuota por Pago Móvil Directo:", error);
        setResultSuccess(false);
        setResultMessage('Error de conexión al servidor. Intenta de nuevo.');
      } finally {
        setIsProcessingConfirmation(false); 
        setDynamicKey(''); 
        setConfirmationModalVisible(false); 
        setResultModalVisible(true); 
      }

    } else {
      // --- Lógica para Recarga de Billetera (comportamiento original) ---
      const depositData = {
          userId: userId,
          amount: parseFloat(amount), 
          documentPrefix: documentPrefix,
          documentNumber: documentNumber,
          phonePrefix: phonePrefix,
          phoneNumber: phoneNumber,
          accountType: accountType,
          dynamicKey: dynamicKey,
      };

      try {
        const response = await fetch(`${API_URL}/api/xp/processDeposit`, { // Endpoint para recargar billetera
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(depositData),
        });

        const result = await response.json();

        if (response.ok) {
            setResultSuccess(true);
            setResultMessage(result.message || 'Recarga procesada exitosamente.');
        } else {
            setResultSuccess(false);
            setResultMessage(result.message || 'Hubo un error al procesar la recarga.');
        }

      } catch (error) {
        console.error("Error al procesar la recarga de billetera por Pago Móvil Directo:", error);
        setResultSuccess(false);
        setResultMessage('Error de conexión al servidor. Intenta de nuevo.');
      } finally {
        setIsProcessingConfirmation(false); 
        setDynamicKey(''); 
        setConfirmationModalVisible(false); 
        setResultModalVisible(true); 
      }
    }
  };

  const handleResultModalClose = () => {
    setResultModalVisible(false);
    // Si es un pago de cuota, volvemos a la pantalla de AvanceEfectivoScreen para refrescar
    // Si es una recarga, podemos volver a la pantalla anterior (ej: BilleteraScreen)
    navigation.goBack(); 
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

          <Text style={styles.screenTitle}>
            {isInstallmentPayment ? 'Pagar Cuota de Avance' : 'Pago Móvil Directo'}
          </Text>
          <Text style={styles.subtitle}>
            {isInstallmentPayment ? 'Completa los datos para pagar tu cuota' : 'Seleccione los datos para su recarga'}
          </Text>

          {isInstallmentPayment && installment && (
            <View style={styles.installmentInfoCard}>
              <Text style={styles.installmentInfoText}>
                Estás pagando la Cuota <Text style={styles.installmentHighlight}>#{installment.installment_number}</Text> 
                del Avance <Text style={styles.installmentHighlight}>#{installment.advance_request_id}</Text>.
              </Text>
              <Text style={styles.installmentInfoText}>
                Monto de la cuota: <Text style={styles.installmentHighlight}>${parseFloat(installment.payment_amount || 0).toFixed(2)}</Text>
              </Text>
            </View>
          )}

          <View style={styles.formContainer}>
            {/* Monto a Recargar / Pagar */}
            <Text style={styles.inputLabel}>Monto a {isInstallmentPayment ? 'Pagar' : 'Recargar'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 15.00"
              placeholderTextColor={appColors.textSecondary}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              editable={!isInstallmentPayment} // No editable si es pago de cuota
            />
            {isInstallmentPayment && (
              <Text style={styles.infoTextSmall}>Este monto corresponde al valor de la cuota y no es editable.</Text>
            )}

            {/* Cédula/Identidad */}
            <Text style={styles.inputLabel}>Cédula/Identidad</Text>
            <View style={styles.rowContainer}>
              {renderDropdown(documentPrefixOptions, documentPrefix, setDocumentPrefix, setIsDocumentPrefixDropdownVisible, isDocumentPrefixDropdownVisible)}
              <TextInput
                style={[styles.input, styles.flexInput]}
                placeholder="Número de Documento"
                placeholderTextColor={appColors.textSecondary}
                keyboardType="numeric"
                value={documentNumber}
                onChangeText={setDocumentNumber}
                maxLength={10}
              />
            </View>

            {/* Teléfono */}
            <Text style={styles.inputLabel}>Número de Teléfono</Text>
            <View style={styles.rowContainer}>
              {renderDropdown(phonePrefixOptions, phonePrefix, setPhonePrefix, setIsPhonePrefixDropdownVisible, isPhonePrefixDropdownVisible)}
              <TextInput
                style={[styles.input, styles.flexInput]}
                placeholder="Digitos del Celular"
                placeholderTextColor={appColors.textSecondary}
                keyboardType="numeric"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                maxLength={7}
              />
            </View>

            {/* Tipo de Cuenta */}
            <Text style={styles.inputLabel}>Tipo de Cuenta</Text>
            {renderDropdown(accountTypeOptions, accountType, setAccountType, setIsAccountTypeDropdownVisible, isAccountTypeDropdownVisible)}

            {/* Botón Confirmar */}
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPayment}>
              <Text style={styles.confirmButtonText}>
                {isInstallmentPayment ? 'Pagar Cuota' : 'Confirmar Recarga'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Modal de Confirmación de Clave Dinámica */}
      <Modal visible={confirmationModalVisible} transparent animationType="fade" onRequestClose={() => setConfirmationModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirmar {isInstallmentPayment ? 'Pago de Cuota' : 'Recarga'}</Text>
              <TouchableOpacity onPress={() => setConfirmationModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close-circle-outline" size={30} color={appColors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalMessage}>
                Monto a {isInstallmentPayment ? 'pagar' : 'recargar'}: <Text style={styles.modalHighlightText}>${parseFloat(amount || 0).toFixed(2)}</Text>
              </Text>
              <Text style={styles.modalMessage}>
                Identidad: <Text style={styles.modalHighlightText}>{documentPrefix}-{documentNumber}</Text>
              </Text>
              <Text style={styles.modalMessage}>
                Teléfono: <Text style={styles.modalHighlightText}>{phonePrefix}-{phoneNumber}</Text>
              </Text>
              <Text style={styles.modalMessage}>
                Tipo de Cuenta: <Text style={styles.modalHighlightText}>{accountType}</Text>
              </Text>
              {isInstallmentPayment && installment && (
                <Text style={styles.modalMessage}>
                  Cuota: <Text style={styles.modalHighlightText}>#{installment.installment_number} del Avance #{installment.advance_request_id}</Text>
                </Text>
              )}

              <Text style={styles.inputLabelModal}>Clave Dinámica</Text>
              <TextInput
                style={styles.inputModal}
                placeholder="Ingresa tu clave dinámica"
                placeholderTextColor={appColors.textSecondary}
                keyboardType="numeric"
                secureTextEntry={true} 
                value={dynamicKey}
                onChangeText={setDynamicKey}
                maxLength={6} 
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalActionButton, { backgroundColor: appColors.textSecondary }]} 
                onPress={() => setConfirmationModalVisible(false)}
                disabled={isProcessingConfirmation}
              >
                <Text style={styles.modalActionButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalActionButton} 
                onPress={handleConfirmDynamicKey}
                disabled={isProcessingConfirmation}
              >
                {isProcessingConfirmation ? (
                    <ActivityIndicator color={appColors.white} /> 
                ) : (
                    <Text style={styles.modalActionButtonText}>Confirmar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Nuevo Modal de Resultado Final (Éxito/Error) */}
      <Modal visible={resultModalVisible} transparent animationType="fade" onRequestClose={handleResultModalClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: resultSuccess ? appColors.green : appColors.red }]}>
                {resultSuccess ? `¡${isInstallmentPayment ? 'Pago' : 'Recarga'} Exitosa!` : `Error en la ${isInstallmentPayment ? 'Operación' : 'Recarga'}`}
              </Text>
              <TouchableOpacity onPress={handleResultModalClose} style={styles.closeButton}>
                <Ionicons name="close-circle-outline" size={30} color={appColors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Ionicons 
                name={resultSuccess ? "checkmark-circle" : "close-circle"} 
                size={80} 
                color={resultSuccess ? appColors.green : appColors.red} 
                style={styles.modalIcon} 
              />
              <Text style={styles.modalMessage}>
                {resultMessage}
              </Text>
            </View>

            <TouchableOpacity 
                style={[styles.modalActionButton, { backgroundColor: resultSuccess ? appColors.primary : appColors.red }]} 
                onPress={handleResultModalClose}
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
    fontSize: 26,
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
  installmentInfoCard: {
    backgroundColor: appColors.cardBackground,
    marginHorizontal: 16,
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderLeftWidth: 5,
    borderLeftColor: appColors.primary,
  },
  installmentInfoText: {
    fontSize: 15,
    color: appColors.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
  },
  installmentHighlight: {
    fontWeight: 'bold',
    color: appColors.primary,
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
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: appColors.background,
    borderWidth: 1,
    borderColor: appColors.lightGray,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: appColors.textPrimary,
    marginBottom: 15,
  },
  infoTextSmall: {
    fontSize: 13,
    color: appColors.textSecondary,
    textAlign: 'left',
    marginBottom: 15,
    marginTop: -10, // Ajustar para que quede cerca del input
    paddingHorizontal: 5,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  flexInput: {
    flex: 1,
    marginLeft: 10,
    marginBottom: 0, 
  },
  dropdownContainer: {
    width: '35%', 
    marginRight: 10, 
    marginBottom: 0, 
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
    minHeight: 50, 
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
  confirmButton: {
    backgroundColor: appColors.primary, 
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: appColors.white, 
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
  modalMessage: {
    fontSize: 16,
    color: appColors.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 10,
  },
  modalHighlightText: {
    fontWeight: 'bold',
    color: appColors.primary, 
  },
  inputLabelModal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: appColors.textPrimary,
    marginTop: 20,
    marginBottom: 10,
  },
  inputModal: {
    backgroundColor: appColors.background,
    borderWidth: 1,
    borderColor: appColors.lightGray,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: appColors.textPrimary,
    width: '100%',
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  modalActionButton: {
    backgroundColor: appColors.primary, 
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  modalActionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: appColors.white, 
  },
  modalIcon: { 
    marginBottom: 15,
  },
});

export default PagoMovilDirectoScreen;
