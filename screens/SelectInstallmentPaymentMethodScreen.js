import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  StatusBar, 
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
  TextInput // Necesario para la clave dinámica si se añadiera
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native'; // Importamos useFocusEffect

import { appStyles, appColors } from '../constants/appStyles'; 
import { API_URL } from '@env'; 

const SelectInstallmentPaymentMethodScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { installment, userId } = route.params || {}; // userWalletBalance ya no se usa directamente de params

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [resultSuccess, setResultSuccess] = useState(false);

  // NUEVOS ESTADOS PARA LA CONFIRMACIÓN DE PAGO CON BILLETERA
  const [walletConfirmationModalVisible, setWalletConfirmationModalVisible] = useState(false);
  const [dynamicKey, setDynamicKey] = useState(''); // Para una posible clave dinámica para la billetera
  
  // ESTADO PARA EL SALDO REAL DE LA BILLETERA
  const [actualWalletBalance, setActualWalletBalance] = useState('0.00');
  const [loadingWalletBalance, setLoadingWalletBalance] = useState(true);

  // Función para obtener el saldo real de la billetera
  const fetchActualWalletBalance = useCallback(async () => {
    if (!userId) {
      console.warn("fetchActualWalletBalance: No userId available.");
      setLoadingWalletBalance(false);
      return;
    }
    try {
      setLoadingWalletBalance(true);
      const response = await fetch(`${API_URL}/api/getUsuarioDetalle/${userId}`);
      const data = await response.json();
      if (data && data.MIC_CREBIL !== undefined) {
        setActualWalletBalance(parseFloat(data.MIC_CREBIL).toFixed(2));
      } else {
        setActualWalletBalance('0.00');
        console.warn('MIC_CREBIL no encontrado en los datos del usuario.');
      }
    } catch (error) {
      console.error('Error fetching actual wallet balance:', error);
      setActualWalletBalance('0.00'); // Fallback a 0.00 en caso de error
    } finally {
      setLoadingWalletBalance(false);
    }
  }, [userId]);

  // Usar useFocusEffect para cargar el saldo cada vez que la pantalla se enfoca
  useFocusEffect(
    useCallback(() => {
      fetchActualWalletBalance();
      return () => {
        // Opcional: limpiar estados o cancelar peticiones si es necesario al desenfocar
      };
    }, [fetchActualWalletBalance])
  );

  // Lógica para procesar el pago con billetera (ahora se llama desde el modal de confirmación)
  const processPaymentWithWallet = async () => {
    if (!installment || !userId) {
      Alert.alert("Error", "Datos de cuota o usuario no disponibles.");
      return;
    }

    setIsProcessingPayment(true);
    const paymentId = installment.payment_id;
    const amountToPay = parseFloat(installment.payment_amount || 0);
    const currentWalletBalance = parseFloat(actualWalletBalance); // Usamos el saldo real

    if (currentWalletBalance < amountToPay) {
      setResultSuccess(false);
      setResultMessage(`Saldo insuficiente en la billetera. Tu saldo actual es $${currentWalletBalance.toFixed(2)}. Necesitas $${amountToPay.toFixed(2)} para este pago.`);
      setWalletConfirmationModalVisible(false); // Cierra el modal de confirmación de billetera
      setResultModalVisible(true);
      setIsProcessingPayment(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/payInstallment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`, // Si usas autenticación
        },
        body: JSON.stringify({
          installmentId: paymentId,
          usu_codigo: userId,
          // dynamicKey: dynamicKey, // Si usas clave dinámica
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResultSuccess(true);
        setResultMessage(data.message || 'Cuota pagada exitosamente con billetera.');
        // ¡CORRECCIÓN AQUÍ! Añadir un pequeño retraso antes de actualizar el saldo
        // Esto es para dar tiempo al backend a procesar la deducción en la DB.
        // La solución ideal es que el backend garantice la consistencia antes de responder.
        setTimeout(() => {
          fetchActualWalletBalance(); 
        }, 500); // Espera 500ms (medio segundo)
      } else {
        setResultSuccess(false);
        setResultMessage(data.message || 'Error al procesar el pago con billetera.');
      }
    } catch (error) {
      console.error('Error al procesar el pago con billetera:', error);
      setResultSuccess(false);
      setResultMessage('Error de conexión al servidor al pagar con billetera. Intenta de nuevo.');
    } finally {
      setIsProcessingPayment(false);
      setWalletConfirmationModalVisible(false); // Cierra el modal de confirmación de billetera
      setResultModalVisible(true);
    }
  };

  // Manejador para seleccionar el método de pago
  const handlePaymentMethodSelect = (method) => {
    if (!installment) {
      Alert.alert("Error", "No se ha seleccionado una cuota para pagar.");
      return;
    }

    switch (method) {
      case 'wallet':
        setWalletConfirmationModalVisible(true); // Abre el nuevo modal de confirmación de billetera
        break;
      case 'pagoMovilDirecto':
        navigation.navigate('PagoMovilCuotaScreen', { 
            userId: userId, 
            amount: parseFloat(installment.payment_amount || 0).toFixed(2), // Pasa el monto de la cuota
            // Puedes pasar más detalles de la cuota si PagoMovilDirectoScreen los necesita
            // Por ejemplo: installmentId: installment.payment_id,
        });
        break;
      case 'pagoMovil':
        Alert.alert("Próximamente", "La opción de Pago Móvil (tradicional) estará disponible pronto.");
        // navigation.navigate('PagoMovilScreen', { installmentId: installment.payment_id, amount: installment.payment_amount });
        break;
      case 'deposit':
        Alert.alert("Próximamente", "La opción de Depósito estará disponible pronto.");
        break;
      case 'card':
        Alert.alert("Próximamente", "La opción de Tarjeta estará disponible pronto.");
        break;
      default:
        Alert.alert("Error", "Método de pago no reconocido.");
    }
  };

  const handleResultModalClose = () => {
    setResultModalVisible(false);
    // Después de mostrar el resultado, volvemos a la pantalla anterior (AvanceEfectivoScreen)
    // para que se refresque el historial y el saldo.
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

          <Text style={styles.screenTitle}>Pagar Cuota de Avance</Text>
          <Text style={styles.subtitle}>Selecciona tu método de pago</Text>

          {installment && (
            <View style={styles.installmentDetailsCard}>
              <Text style={styles.detailTitle}>Detalles de la Cuota:</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Avance #:</Text>
                <Text style={styles.detailValue}>{installment.advance_request_id}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Cuota #:</Text>
                <Text style={styles.detailValue}>{installment.installment_number}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Monto a Pagar:</Text>
                <Text style={styles.detailValue}>${parseFloat(installment.payment_amount || 0).toFixed(2)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Fecha de Vencimiento:</Text>
                <Text style={styles.detailValue}>{new Date(installment.due_date).toLocaleDateString()}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tu Saldo Billetera:</Text>
                {loadingWalletBalance ? (
                  <ActivityIndicator size="small" color={appColors.primary} />
                ) : (
                  <Text style={styles.detailValue}>${actualWalletBalance}</Text>
                )}
              </View>
            </View>
          )}

          <View style={styles.paymentOptionsContainer}>
            <TouchableOpacity 
              style={styles.paymentOptionButton} 
              onPress={() => handlePaymentMethodSelect('wallet')}
              // No deshabilitamos aquí, el modal de confirmación manejará la carga
            >
              <Ionicons name="wallet-outline" size={40} color={appColors.primary} />
              <Text style={styles.paymentOptionButtonText}>Pagar con Billetera xPagar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.paymentOptionButton} 
              onPress={() => handlePaymentMethodSelect('pagoMovilDirecto')}
            >
              <Ionicons name="phone-portrait-outline" size={40} color={appColors.primary} />
              <Text style={styles.paymentOptionButtonText}>Pago Móvil Directo</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.paymentOptionButton} 
              onPress={() => handlePaymentMethodSelect('pagoMovil')}
            >
              <Ionicons name="phone-landscape-outline" size={40} color={appColors.primary} />
              <Text style={styles.paymentOptionButtonText}>Pago Móvil (Tradicional)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.paymentOptionButton} 
              onPress={() => handlePaymentMethodSelect('deposit')}
            >
              <Ionicons name="business-outline" size={40} color={appColors.primary} />
              <Text style={styles.paymentOptionButtonText}>Depósito/Transferencia</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.paymentOptionButton} 
              onPress={() => handlePaymentMethodSelect('card')}
            >
              <Ionicons name="card-outline" size={40} color={appColors.primary} />
              <Text style={styles.paymentOptionButtonText}>Tarjeta de Crédito/Débito</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Modal de Confirmación de Pago con Billetera */}
      <Modal visible={walletConfirmationModalVisible} transparent animationType="fade" onRequestClose={() => setWalletConfirmationModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirmar Pago con Billetera</Text>
              <TouchableOpacity onPress={() => setWalletConfirmationModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close-circle-outline" size={30} color={appColors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            {installment && (
              <View style={styles.modalBody}>
                <Text style={styles.modalMessage}>
                  Vas a pagar la Cuota #{installment.installment_number} del Avance #{installment.advance_request_id}.
                </Text>
                <Text style={styles.modalMessage}>
                  Monto a pagar: <Text style={styles.modalHighlightText}>
                    ${parseFloat(installment.payment_amount || 0).toFixed(2)}
                  </Text>
                </Text>
                <Text style={styles.modalMessage}>
                  Tu saldo actual de billetera: <Text style={styles.modalHighlightText}>
                    ${actualWalletBalance}
                  </Text>
                </Text>
                {/* Puedes añadir un campo para clave dinámica aquí si es necesario */}
                {/* <Text style={styles.inputLabelModal}>Clave Dinámica</Text>
                <TextInput
                  style={styles.inputModal}
                  placeholder="Ingresa tu clave"
                  placeholderTextColor={appColors.textSecondary}
                  keyboardType="numeric"
                  secureTextEntry={true}
                  value={dynamicKey}
                  onChangeText={setDynamicKey}
                  maxLength={6}
                /> */}
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalActionButton, { backgroundColor: appColors.textSecondary }]} 
                onPress={() => setWalletConfirmationModalVisible(false)}
                disabled={isProcessingPayment}
              >
                <Text style={styles.modalActionButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalActionButton} 
                onPress={processPaymentWithWallet} // Llama a la función de procesamiento real
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? (
                    <ActivityIndicator color={appColors.white} /> 
                ) : (
                    <Text style={styles.modalActionButtonText}>Confirmar Pago</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Resultado Final (Éxito/Error) */}
      <Modal visible={resultModalVisible} transparent animationType="fade" onRequestClose={handleResultModalClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: resultSuccess ? appColors.green : appColors.red }]}>
                {resultSuccess ? '¡Operación Exitosa!' : 'Error en la Operación'}
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
    fontSize: 26, // Increased font size
    fontWeight: 'bold',
    color: appColors.white,
    textAlign: 'center',
    marginBottom: 10, // Increased margin
    paddingHorizontal: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.4)', // Stronger shadow
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 5, // Larger shadow radius
  },
  subtitle: {
    fontSize: 18, // Increased font size
    color: appColors.textSecondary,
    textAlign: 'center',
    marginBottom: 30, // Increased margin
    paddingHorizontal: 20,
  },
  installmentDetailsCard: {
    backgroundColor: appColors.cardBackground,
    marginHorizontal: 20, // Increased margin
    padding: 25, // Increased padding
    borderRadius: 20, // More rounded corners
    marginBottom: 30, // Increased margin
    elevation: 10, // Stronger shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12, // Larger shadow radius
    borderWidth: 0, // Remove border for cleaner look
  },
  detailTitle: {
    fontSize: 20, // Increased font size
    fontWeight: 'bold',
    color: appColors.textPrimary,
    marginBottom: 20, // Increased margin
    textAlign: 'center',
    textDecorationLine: 'underline', // Add underline
    textDecorationColor: appColors.primary, // Underline color
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10, // Increased margin
    paddingVertical: 5, // Added vertical padding
    borderBottomWidth: 0.5, // Subtle separator
    borderBottomColor: appColors.lightGray,
  },
  detailLabel: {
    fontSize: 17, // Increased font size
    color: appColors.textSecondary,
    fontWeight: '600', // Slightly bolder
  },
  detailValue: {
    fontSize: 17, // Increased font size
    color: appColors.textPrimary,
    fontWeight: 'bold',
  },
  paymentOptionsContainer: {
    marginHorizontal: 20, // Increased margin
  },
  paymentOptionButton: {
    backgroundColor: appColors.cardBackground,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 22, // Increased vertical padding
    paddingHorizontal: 25, // Increased horizontal padding
    borderRadius: 18, // More rounded corners
    marginBottom: 18, // Increased margin
    elevation: 8, // Stronger shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    borderWidth: 0, // Remove border
    overflow: 'hidden', // Ensure gradient stays within bounds
  },
  paymentOptionButtonText: {
    fontSize: 19, // Increased font size
    fontWeight: 'bold',
    color: appColors.textPrimary,
    marginLeft: 20, // Increased margin
    flex: 1, 
  },
  activityIndicator: {
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darker overlay
  },
  modalContent: {
    backgroundColor: appColors.cardBackground,
    width: '90%',
    padding: 30, // Increased padding
    borderRadius: 25, // More rounded corners
    elevation: 20, // Stronger shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25, // Increased margin
  },
  modalTitle: {
    fontSize: 24, // Increased font size
    fontWeight: 'bold',
    color: appColors.textPrimary,
    textAlign: 'center',
    flex: 1,
  },
  closeButton: {
    padding: 8, // Larger touch target
  },
  modalBody: {
    alignItems: 'center',
    marginBottom: 30, // Increased margin
  },
  modalIcon: {
    marginBottom: 20, // Increased margin
  },
  modalMessage: {
    fontSize: 17, // Increased font size
    color: appColors.textPrimary,
    textAlign: 'center',
    lineHeight: 26, // Increased line height
  },
  modalActionButton: {
    backgroundColor: appColors.primary,
    padding: 18, // Increased padding
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5, // Added shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  modalActionButtonText: {
    fontSize: 19, // Increased font size
    fontWeight: 'bold',
    color: appColors.white,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 25, // Increased margin
  },
  inputLabelModal: {
    fontSize: 17, // Increased font size
    fontWeight: 'bold',
    color: appColors.textPrimary,
    marginTop: 25, // Increased margin
    marginBottom: 12, // Increased margin
  },
  inputModal: {
    backgroundColor: appColors.background,
    borderWidth: 1,
    borderColor: appColors.lightGray,
    borderRadius: 15, // More rounded corners
    padding: 18, // Increased padding
    fontSize: 17, // Increased font size
    color: appColors.textPrimary,
    width: '100%',
    textAlign: 'center',
  },
  modalHighlightText: {
    fontWeight: 'bold',
    color: appColors.primary,
  }
});

export default SelectInstallmentPaymentMethodScreen;
