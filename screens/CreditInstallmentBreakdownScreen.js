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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { jwtDecode } from 'jwt-decode'; // Para decodificar el token si es necesario

import { appStyles, appColors } from '../constants/appStyles';
import { API_URL } from '@env';

const CreditInstallmentBreakdownScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // Recibimos el objeto de la cuota y el userId
  const { installment, userId } = route.params || {};

  const [purchaseDetails, setPurchaseDetails] = useState(null);
  const [loadingPurchaseDetails, setLoadingPurchaseDetails] = useState(true);
  const [currentWalletBalance, setCurrentWalletBalance] = useState(0);
  const [loadingWalletBalance, setLoadingWalletBalance] = useState(true);

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [resultSuccess, setResultSuccess] = useState(false);
  const [walletConfirmationModalVisible, setWalletConfirmationModalVisible] = useState(false);

  // Determinar el monto a pagar y el ID de la cuota
  const amountToPay = parseFloat(installment?.amount_due || 0);
  const installmentId = installment?.installment_id;
  const installmentNumber = installment?.installment_number;
  const purchaseId = installment?.purchase_id;
  const installmentDueDate = installment?.due_date ? new Date(installment.due_date).toLocaleDateString() : 'N/A';

  // Función para obtener los detalles completos de la compra
  const fetchPurchaseDetails = useCallback(async () => {
    if (!purchaseId) {
      console.warn("No purchaseId provided to fetch purchase details.");
      setLoadingPurchaseDetails(false);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/purchase/${userId}`); // Asumiendo que este endpoint devuelve todas las compras del usuario
      const data = await response.json();
      if (Array.isArray(data)) {
        const foundPurchase = data.find(p => p.purchase_id === purchaseId);
        setPurchaseDetails(foundPurchase);
      } else {
        console.warn("Unexpected response from purchase history API:", data);
      }
    } catch (error) {
      console.error("Error fetching purchase details:", error);
    } finally {
      setLoadingPurchaseDetails(false);
    }
  }, [purchaseId, userId]);

  // Función para obtener el saldo actual de la billetera
  const fetchWalletBalance = useCallback(async () => {
    if (!userId) {
      console.warn("No userId to fetch wallet balance.");
      setLoadingWalletBalance(false);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/getUsuarioDetalle/${userId}`);
      const data = await response.json();
      if (data && data.MIC_CREBIL !== undefined) {
        setCurrentWalletBalance(parseFloat(data.MIC_CREBIL));
      } else {
        console.warn("Wallet balance not found in user details:", data);
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    } finally {
      setLoadingWalletBalance(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      if (!installment || !userId) {
        Alert.alert("Error", "No se pudo cargar la información de la cuota o del usuario.");
        navigation.goBack();
        return;
      }
      fetchPurchaseDetails();
      fetchWalletBalance();
    }, [installment, userId, navigation, fetchPurchaseDetails, fetchWalletBalance])
  );

  // Manejador para el pago con billetera
  const handleWalletPayment = () => {
    if (currentWalletBalance < amountToPay) {
      setResultSuccess(false);
      setResultMessage(`Saldo insuficiente en la billetera. Tu saldo actual es $${currentWalletBalance.toFixed(2)}. Necesitas $${amountToPay.toFixed(2)} para este pago.`);
      setResultModalVisible(true);
      return;
    }
    setWalletConfirmationModalVisible(true); // Mostrar modal de confirmación
  };

  // Confirmar y procesar el pago con billetera (después de la confirmación del usuario)
  const confirmWalletPayment = async () => {
    setWalletConfirmationModalVisible(false);
    setIsProcessingPayment(true);

    try {
      const response = await fetch(`${API_URL}/api/payCreditInstallment`, { // Endpoint para pagar cuotas de compra con billetera
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          installmentId: installmentId,
          userId: userId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResultSuccess(true);
        setResultMessage(data.message || 'Pago procesado exitosamente.');
        fetchWalletBalance(); // Recargar saldo de billetera
        fetchPurchaseDetails(); // Recargar detalles de la compra para actualizar estado de cuotas
      } else {
        setResultSuccess(false);
        setResultMessage(data.message || 'Error al procesar el pago.');
      }
    } catch (error) {
      console.error('Error al procesar el pago con billetera:', error);
      setResultSuccess(false);
      setResultMessage('Error de conexión al servidor. Intenta de nuevo.');
    } finally {
      setIsProcessingPayment(false);
      setResultModalVisible(true);
    }
  };

  // Manejador para Pago Móvil Directo
  const handlePagoMovilDirecto = () => {
    navigation.navigate('PagoMovilCuotaCreditoScreen', {
      installment: installment,
      userId: userId,
    });
  };

  // Manejador para Pago Móvil Tradicional (deshabilitado por ahora)
  const handlePagoMovilTradicional = () => {
    Alert.alert("Próximamente", "El pago móvil tradicional estará disponible pronto.");
  };

  // Manejador para Depósito (deshabilitado por ahora)
  const handleDeposito = () => {
    Alert.alert("Próximamente", "El pago por depósito estará disponible pronto.");
  };

  // Manejador para Tarjeta de Crédito/Débito (deshabilitado por ahora)
  const handleTarjeta = () => {
    Alert.alert("Próximamente", "El pago con tarjeta de crédito/débito estará disponible pronto.");
  };

  const handleResultModalClose = () => {
    setResultModalVisible(false);
    navigation.goBack(); // Volver a la pantalla anterior (Dashboard)
  };

  if (loadingPurchaseDetails || loadingWalletBalance) {
    return (
      <LinearGradient colors={[appColors.gradientStart, appColors.gradientEnd]} style={appStyles.loadingContainer}>
        <ActivityIndicator size="large" color={appColors.white} />
        <Text style={appStyles.loadingText}>Cargando detalles de la cuota...</Text>
      </LinearGradient>
    );
  }

  if (!installment || !userId || !purchaseDetails) {
    return (
      <LinearGradient colors={[appColors.gradientStart, appColors.gradientEnd]} style={appStyles.errorContainer}>
        <Text style={appStyles.errorText}>No se pudo cargar la información de la cuota o la compra.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={appStyles.retryButton}>
          <Text style={appStyles.retryButtonText}>Volver</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

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

          <Text style={styles.screenTitle}>Detalle de Cuota de Crédito</Text>
          <Text style={styles.subtitle}>Información y Opciones de Pago</Text>

          {/* Detalles de la Compra */}
          <View style={styles.detailsCard}>
            <Text style={styles.cardSectionTitle}>Información de la Compra</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>ID de Compra:</Text>
              <Text style={styles.detailValue}>#{purchaseDetails.purchase_id}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Artículo:</Text>
              <Text style={styles.detailValue}>{purchaseDetails.articulo_id}</Text> {/* Podrías buscar el nombre real del artículo */}
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Monto Total:</Text>
              <Text style={styles.detailValue}>${parseFloat(purchaseDetails.total_price).toFixed(2)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Cuotas Totales:</Text>
              <Text style={styles.detailValue}>{purchaseDetails.num_installments}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Fecha de Compra:</Text>
              <Text style={styles.detailValue}>{new Date(purchaseDetails.purchase_date).toLocaleDateString()}</Text>
            </View>
          </View>

          {/* Detalles de la Cuota Seleccionada */}
          <View style={styles.detailsCard}>
            <Text style={styles.cardSectionTitle}>Detalles de la Cuota</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Cuota Número:</Text>
              <Text style={styles.detailValue}>#{installmentNumber}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Monto a Pagar:</Text>
              <Text style={styles.detailAmount}>${amountToPay.toFixed(2)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Fecha de Vencimiento:</Text>
              <Text style={styles.detailValue}>{installmentDueDate}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Estado:</Text>
              <Text style={[styles.detailValue, { color: installment.payment_status === 'Paid' ? appColors.green : appColors.red }]}>
                {installment.payment_status}
              </Text>
            </View>
          </View>

          {/* Opciones de Pago */}
          {installment.payment_status === 'Pending' && (
            <View style={styles.paymentOptionsCard}>
              <Text style={styles.cardSectionTitle}>Selecciona el Método de Pago</Text>

              {/* Pagar con Billetera xPagar */}
              <TouchableOpacity
                style={styles.paymentOptionButton}
                onPress={handleWalletPayment}
                disabled={isProcessingPayment || currentWalletBalance < amountToPay}
              >
                <Ionicons name="wallet-outline" size={30} color={appColors.primary} />
                <View style={styles.paymentOptionTextContainer}>
                  <Text style={styles.paymentOptionTitle}>Billetera xPagar</Text>
                  <Text style={styles.paymentOptionSubtitle}>Saldo actual: ${currentWalletBalance.toFixed(2)}</Text>
                </View>
                <Ionicons name="chevron-forward-outline" size={24} color={appColors.textSecondary} />
              </TouchableOpacity>

              {/* Pago Móvil Directo */}
              <TouchableOpacity
                style={styles.paymentOptionButton}
                onPress={handlePagoMovilDirecto}
                disabled={isProcessingPayment}
              >
                <Ionicons name="phone-portrait-outline" size={30} color={appColors.primary} />
                <View style={styles.paymentOptionTextContainer}>
                  <Text style={styles.paymentOptionTitle}>Pago Móvil Directo</Text>
                  <Text style={styles.paymentOptionSubtitle}>Paga desde tu banco</Text>
                </View>
                <Ionicons name="chevron-forward-outline" size={24} color={appColors.textSecondary} />
              </TouchableOpacity>

              {/* Pago Móvil Tradicional (Deshabilitado) */}
              <TouchableOpacity
                style={[styles.paymentOptionButton, styles.disabledOption]}
                onPress={handlePagoMovilTradicional}
                disabled={true}
              >
                <Ionicons name="phone-landscape-outline" size={30} color={appColors.lightGray} />
                <View style={styles.paymentOptionTextContainer}>
                  <Text style={styles.paymentOptionTitle}>Pago Móvil Tradicional</Text>
                  <Text style={styles.paymentOptionSubtitle}>Próximamente</Text>
                </View>
                <Ionicons name="lock-closed-outline" size={24} color={appColors.lightGray} />
              </TouchableOpacity>

              {/* Depósito (Deshabilitado) */}
              <TouchableOpacity
                style={[styles.paymentOptionButton, styles.disabledOption]}
                onPress={handleDeposito}
                disabled={true}
              >
                <Ionicons name="briefcase-outline" size={30} color={appColors.lightGray} />
                <View style={styles.paymentOptionTextContainer}>
                  <Text style={styles.paymentOptionTitle}>Depósito</Text>
                  <Text style={styles.paymentOptionSubtitle}>Próximamente</Text>
                </View>
                <Ionicons name="lock-closed-outline" size={24} color={appColors.lightGray} />
              </TouchableOpacity>

              {/* Tarjeta de Crédito/Débito (Deshabilitado) */}
              <TouchableOpacity
                style={[styles.paymentOptionButton, styles.disabledOption]}
                onPress={handleTarjeta}
                disabled={true}
              >
                <Ionicons name="card-outline" size={30} color={appColors.lightGray} />
                <View style={styles.paymentOptionTextContainer}>
                  <Text style={styles.paymentOptionTitle}>Tarjeta de Crédito/Débito</Text>
                  <Text style={styles.paymentOptionSubtitle}>Próximamente</Text>
                </View>
                <Ionicons name="lock-closed-outline" size={24} color={appColors.lightGray} />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Modal de Confirmación de Pago con Billetera */}
      <Modal visible={walletConfirmationModalVisible} transparent animationType="fade" onRequestClose={() => setWalletConfirmationModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirmar Pago</Text>
              <TouchableOpacity onPress={() => setWalletConfirmationModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close-circle-outline" size={30} color={appColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Ionicons
                name="information-circle-outline"
                size={80}
                color={appColors.primary}
                style={styles.modalIcon}
              />
              <Text style={styles.modalMessage}>
                Estás a punto de pagar la Cuota #{installmentNumber} de la Compra #{purchaseId}.
              </Text>
              <Text style={styles.modalMessage}>
                Monto a pagar: <Text style={styles.modalHighlightText}>
                  ${amountToPay.toFixed(2)}
                </Text>
              </Text>
              <Text style={styles.modalMessage}>
                Tu saldo actual de billetera: <Text style={styles.modalHighlightText}>
                  ${currentWalletBalance.toFixed(2)}
                </Text>
              </Text>
              <Text style={styles.modalMessage}>
                Saldo restante después del pago: <Text style={styles.modalHighlightText}>
                  ${(currentWalletBalance - amountToPay).toFixed(2)}
                </Text>
              </Text>
            </View>

            <TouchableOpacity
                style={styles.modalActionButton}
                onPress={confirmWalletPayment}
                disabled={isProcessingPayment}
            >
              {isProcessingPayment ? (
                  <ActivityIndicator color={appColors.white} />
              ) : (
                  <Text style={styles.modalActionButtonText}>Confirmar Pago</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalCancelButton, { marginTop: 10 }]}
              onPress={() => setWalletConfirmationModalVisible(false)}
              disabled={isProcessingPayment}
            >
              <Text style={styles.modalCancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
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
  cardSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: appColors.primary,
    marginBottom: 15,
    textAlign: 'center',
    textDecorationLine: 'underline',
    textDecorationColor: appColors.secondary,
  },
  // Tarjetas de detalles
  detailsCard: {
    backgroundColor: appColors.cardBackground,
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    color: appColors.textPrimary,
    fontWeight: 'bold',
  },
  detailValue: {
    fontSize: 16,
    color: appColors.textSecondary,
  },
  detailAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: appColors.green, // Monto a pagar en verde
  },

  // Tarjeta de opciones de pago
  paymentOptionsCard: {
    backgroundColor: appColors.cardBackground,
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 20,
    marginBottom: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  paymentOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appColors.background,
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: appColors.lightGray,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  paymentOptionTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  paymentOptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: appColors.textPrimary,
    marginBottom: 3,
  },
  paymentOptionSubtitle: {
    fontSize: 14,
    color: appColors.textSecondary,
  },
  disabledOption: {
    opacity: 0.6, // Hace que las opciones deshabilitadas se vean más tenues
  },

  // Estilos de los modales (reutilizados y ajustados)
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
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  modalActionButtonText: {
    fontSize: 19,
    fontWeight: 'bold',
    color: appColors.white,
  },
  modalCancelButton: {
    backgroundColor: appColors.textSecondary,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 19,
    fontWeight: 'bold',
    color: appColors.white,
  },
  modalHighlightText: {
    fontWeight: 'bold',
    color: appColors.primary,
  },
});

export default CreditInstallmentBreakdownScreen;
