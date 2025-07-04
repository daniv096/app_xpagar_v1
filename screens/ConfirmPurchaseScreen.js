import React, { useState, useEffect, useCallback } from 'react';
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
  ActivityIndicator,
  Alert,
  LayoutAnimation, // Para animaciones de expansión/colapso
  UIManager, // Para habilitar LayoutAnimation en Android
  Platform, // Para detectar la plataforma
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

import { appStyles, appColors } from '../constants/appStyles'; 
import { API_URL } from '@env'; 

// Habilitar LayoutAnimation en Android para transiciones fluidas
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ConfirmPurchaseScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { articulo, userId } = route.params || {};

  // Estados para la cantidad y el plan de cuotas
  const [quantity, setQuantity] = useState(1);
  const [selectedInstallments, setSelectedInstallments] = useState('3'); // Por defecto 3 cuotas
  const [initialPaymentPercentage, setInitialPaymentPercentage] = useState(0.20); // 20% de inicial por defecto
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);

  // Estados para el modal de resultado final
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [resultSuccess, setResultSuccess] = useState(false);

  // Nuevo estado para la política de cambio expandible
  const [policyExpanded, setPolicyExpanded] = useState(false);

  // Opciones de cuotas
  const installmentOptions = [
    { label: '3 Cuotas', value: '3' },
    { label: '6 Cuotas', value: '6' },
    { label: '9 Cuotas', value: '9' },
    { label: '12 Cuotas', value: '12' },
  ];

  // Validar que el artículo y el userId existan
  useEffect(() => {
    if (!articulo || !userId) {
      Alert.alert("Error", "No se pudo cargar la información del artículo o del usuario.");
      navigation.goBack();
    }
  }, [articulo, userId, navigation]);

  if (!articulo || !userId) {
    return (
      <LinearGradient colors={[appColors.gradientStart, appColors.gradientEnd]} style={appStyles.loadingContainer}>
        <ActivityIndicator size="large" color={appColors.white} />
        <Text style={appStyles.loadingText}>Cargando detalles de compra...</Text>
      </LinearGradient>
    );
  }

  // Cálculos dinámicos
  const itemPrice = parseFloat(articulo.PRO_PRECIO || 0);
  const subtotal = itemPrice * quantity;
  const initialPaymentAmount = subtotal * initialPaymentPercentage;
  const remainingAmount = subtotal - initialPaymentAmount;
  const installmentAmount = remainingAmount / parseInt(selectedInstallments);
  const totalAmountToPay = initialPaymentAmount + (installmentAmount * parseInt(selectedInstallments));

  // Función para calcular el desglose de pagos
  const calculatePaymentBreakdown = () => {
    const breakdown = [];
    let currentDate = new Date(); // Fecha de hoy para el inicial

    // Pago Inicial
    breakdown.push({
      type: 'Inicial',
      amount: initialPaymentAmount,
      // Formato DD/MM
      dueDate: 'Hoy ' + currentDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
      description: `Pago inicial por ${quantity}x ${articulo.PRO_DESCRI}`,
    });

    // Cuotas
    for (let i = 0; i < parseInt(selectedInstallments); i++) {
      let installmentDueDate = new Date(currentDate);
      installmentDueDate.setMonth(currentDate.getMonth() + (i + 1)); // Cuotas mensuales

      breakdown.push({
        type: `Cuota ${i + 1}`,
        amount: installmentAmount,
        // Formato DD/MM
        dueDate: installmentDueDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
        description: `Cuota ${i + 1} de ${selectedInstallments}`,
      });
    }
    return breakdown;
  };

  const paymentBreakdown = calculatePaymentBreakdown();

  // Lógica para el botón "Comprar" final
  const handleConfirmPurchase = async () => {
    setIsProcessingPurchase(true);
    
    // Aquí iría la llamada a tu API de backend para registrar la compra
    // Ejemplo de payload (ajustar según tu API):
    const purchasePayload = {
      userId: userId,
      articuloId: articulo.PRO_CODIGO,
      quantity: quantity,
      totalPrice: totalAmountToPay,
      initialPayment: initialPaymentAmount,
      numInstallments: parseInt(selectedInstallments),
      installmentAmount: installmentAmount,
      // Puedes añadir más detalles como el plan de pago completo, la tienda, etc.
    };

    try {
      // Este es un placeholder. Debes reemplazarlo con tu endpoint real de compra.
      const response = await fetch(`${API_URL}/api/processPurchase`, { // <--- REEMPLAZAR CON TU ENDPOINT REAL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`, // Si usas autenticación
        },
        body: JSON.stringify(purchasePayload),
      });

      const data = await response.json();

      if (response.ok) {
        setResultSuccess(true);
        setResultMessage(data.message || '¡Compra realizada con éxito!');
      } else {
        setResultSuccess(false);
        setResultMessage(data.message || 'Error al procesar la compra. Intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error al procesar la compra:', error);
      setResultSuccess(false);
      setResultMessage('Error de conexión al servidor al intentar comprar. Intenta de nuevo.');
    } finally {
      setIsProcessingPurchase(false);
      setResultModalVisible(true);
    }
  };

  const handleResultModalClose = () => {
    setResultModalVisible(false);
    // Después de la compra, puedes navegar a un historial de compras o al dashboard
    navigation.popToTop(); // Vuelve al Dashboard principal
  };

  // Función para alternar la sección de política de cambio
  const togglePolicy = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPolicyExpanded(!policyExpanded);
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

          <Text style={styles.screenTitle}>Confirmar Compra</Text>
          <Text style={styles.subtitle}>Revisa los detalles de tu artículo y plan de pago</Text>

          {/* Detalles del Producto */}
          <View style={styles.productDetailsCard}>
            <Text style={styles.cardSectionTitle}>Detalles del Artículo</Text>
            <Image 
              source={{ uri: articulo.PRO_IMAGEN1 || 'https://placehold.co/200x200/E0E0E0/000000?text=No+Image' }} 
              style={styles.productImage} 
              resizeMode="contain"
            />
            <Text style={styles.productName}>{articulo.PRO_DESCRI}</Text>
            <Text style={styles.productStore}>Vendido por: {articulo.TIE_NOMBRE || 'Tienda Desconocida'}</Text>
            {/* Precio Unitario con color naranja */}
            <Text style={[styles.productPrice, { color: appColors.orangePrimary }]}>Precio Unitario: ${parseFloat(articulo.PRO_PRECIO).toFixed(2)}</Text>
            
            <View style={styles.quantityContainer}>
              <Text style={styles.quantityLabel}>Cantidad:</Text>
              <TouchableOpacity 
                style={styles.quantityButton} 
                onPress={() => setQuantity(prev => Math.max(1, prev - 1))}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.quantityInput}
                keyboardType="numeric"
                value={String(quantity)}
                onChangeText={(text) => {
                  const num = parseInt(text);
                  if (!isNaN(num) && num > 0) {
                    setQuantity(num);
                  } else if (text === '') {
                    setQuantity(0); // Permite borrar el número temporalmente
                  }
                }}
                onBlur={() => { // Asegura que la cantidad sea al menos 1 al perder el foco
                  if (quantity === 0 || isNaN(quantity)) {
                    setQuantity(1);
                  }
                }}
              />
              <TouchableOpacity 
                style={styles.quantityButton} 
                onPress={() => setQuantity(prev => prev + 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.subtotalText}>Subtotal: ${subtotal.toFixed(2)}</Text>
            <Text style={styles.productDescription}>{articulo.PRO_DESCRIPCION_LARGA || 'Descripción general no disponible.'}</Text>
          </View>

          {/* Plan de Pago */}
          <View style={styles.paymentPlanCard}>
            <Text style={styles.cardSectionTitle}>Plan de Pago</Text>
            <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Pago Inicial ({initialPaymentPercentage * 100}%):</Text>
                <Text style={styles.paymentValue}>${initialPaymentAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Monto a Financiar:</Text>
                <Text style={styles.paymentValue}>${remainingAmount.toFixed(2)}</Text>
            </View>

            <Text style={styles.inputLabel}>Número de Cuotas:</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedInstallments}
                onValueChange={(itemValue) => setSelectedInstallments(itemValue)}
                style={styles.pickerStyle}
                itemStyle={styles.pickerItemStyle}
              >
                {installmentOptions.map((option) => (
                  <Picker.Item 
                    key={option.value} 
                    label={option.label} 
                    value={option.value} 
                  />
                ))}
              </Picker>
            </View>
            <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Monto por Cuota:</Text>
                <Text style={styles.paymentValue}>${installmentAmount.toFixed(2)}</Text>
            </View>
            {/* La línea antes del total a pagar se manejará en el desglose */}
          </View>

          {/* Detalle del Plan de Pago */}
          <View style={styles.paymentBreakdownCard}>
            <Text style={styles.cardSectionTitle}>Detalle del Plan de Pago</Text>
            {paymentBreakdown.map((item, index) => (
              <View key={index} style={styles.breakdownItem}>
                <Text style={styles.breakdownItemType}>{item.type}: {item.dueDate}</Text>
                <Text style={styles.breakdownItemAmount}>${item.amount.toFixed(2)}</Text>
              </View>
            ))}
            {/* Línea antes del total a pagar */}
            <View style={styles.totalPaymentDivider} />
            <View style={styles.totalPaymentRow}>
                <Text style={styles.totalPaymentLabel}>Total a Pagar:</Text>
                <Text style={styles.totalPaymentValue}>${totalAmountToPay.toFixed(2)}</Text>
            </View>
          </View>

          {/* Política de Cambio (Ahora expandible) */}
          <View style={styles.policyContainer}>
            <TouchableOpacity style={styles.policyHeader} onPress={togglePolicy}>
              <Text style={styles.policyTitle}>Política de Cambio y Devolución</Text>
              <Ionicons name={policyExpanded ? 'chevron-up-outline' : 'chevron-down-outline'} size={24} color={appColors.textPrimary} />
            </TouchableOpacity>
            {policyExpanded && (
              <View style={styles.policyBody}>
                <Text style={styles.policyText}>
                  Las políticas de cambio y devolución varían según la tienda y el tipo de producto.
                  Por favor, revisa las políticas específicas de {articulo.TIE_NOMBRE || 'la tienda'}
                  antes de finalizar tu compra. Generalmente, los productos pueden ser cambiados
                  dentro de los 7 días posteriores a la compra si presentan defectos de fábrica
                  o no cumplen con la descripción. Los productos deben estar en su empaque original
                  y sin usar.
                  Para más detalles, contacta directamente a {articulo.TIE_NOMBRE || 'la tienda'}.
                </Text>
              </View>
            )}
          </View>

          {/* Botón Final de Comprar */}
          <TouchableOpacity 
            style={styles.finalBuyButton} 
            onPress={handleConfirmPurchase}
            disabled={isProcessingPurchase}
          >
            {isProcessingPurchase ? (
              <ActivityIndicator color={appColors.white} />
            ) : (
              <Text style={styles.finalBuyButtonText}>Comprar Ahora</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      {/* Modal de Resultado Final (Éxito/Error) */}
      <Modal visible={resultModalVisible} transparent animationType="fade" onRequestClose={handleResultModalClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: resultSuccess ? appColors.green : appColors.red }]}>
                {resultSuccess ? '¡Compra Exitosa!' : 'Error en la Compra'}
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
  // Tarjetas de contenido
  productDetailsCard: {
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
    alignItems: 'center',
  },
  productImage: {
    width: '90%',
    height: 200,
    borderRadius: 15,
    marginBottom: 15,
    backgroundColor: appColors.background, // Fallback background
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: appColors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  productStore: {
    fontSize: 16,
    color: appColors.textSecondary,
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    // color: appColors.green, // Este color se sobrescribe en línea
    marginBottom: 15,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: appColors.background,
    borderRadius: 10,
    padding: 5,
    borderWidth: 1,
    borderColor: appColors.lightGray,
  },
  quantityLabel: {
    fontSize: 16,
    color: appColors.textPrimary,
    marginRight: 10,
    fontWeight: 'bold',
  },
  quantityButton: {
    backgroundColor: appColors.primary,
    width: 35,
    height: 35,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  quantityButtonText: {
    color: appColors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  quantityInput: {
    backgroundColor: appColors.white,
    width: 60,
    height: 40,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: appColors.textPrimary,
    borderWidth: 1,
    borderColor: appColors.lightGray,
  },
  subtotalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: appColors.textPrimary,
    marginTop: 10,
    marginBottom: 15,
  },
  productDescription: {
    fontSize: 15,
    color: appColors.textSecondary,
    textAlign: 'justify',
    lineHeight: 22,
    marginTop: 10,
  },

  paymentPlanCard: {
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
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  paymentLabel: {
    fontSize: 16,
    color: appColors.textPrimary,
    fontWeight: 'bold',
  },
  paymentValue: {
    fontSize: 16,
    color: appColors.primary,
    fontWeight: 'bold',
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: appColors.textPrimary,
    marginBottom: 8,
    marginTop: 10,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: appColors.lightGray,
    borderRadius: 12,
    backgroundColor: appColors.background,
    marginBottom: 15,
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
  totalPaymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    // paddingTop: 10, // Se elimina el padding top aquí
    // borderTopWidth: 1, // Se elimina el borde superior aquí
    // borderTopColor: appColors.lightGray,
  },
  totalPaymentLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: appColors.textPrimary,
  },
  totalPaymentValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: appColors.green,
  },
  totalPaymentDivider: { // Nueva línea divisoria para el total
    borderTopWidth: 1,
    borderTopColor: appColors.lightGray,
    marginVertical: 10,
  },

  paymentBreakdownCard: {
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
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // paddingVertical: 5, // Se elimina el padding vertical
    // borderBottomWidth: 0.5, // Se elimina el borde inferior
    // borderBottomColor: appColors.lightGray,
    marginBottom: 5, // Espacio entre ítems
  },
  breakdownItemType: {
    fontSize: 15,
    fontWeight: 'bold',
    color: appColors.textPrimary,
    flex: 1, // Permite que ocupe espacio y empuje el monto a la derecha
  },
  breakdownItemAmount: {
    fontSize: 15,
    color: appColors.textPrimary,
    textAlign: 'right', // Alinea el monto a la derecha
  },

  // Estilos para la política de cambio (ahora expandible)
  policyContainer: {
    backgroundColor: appColors.cardBackground,
    marginHorizontal: 16,
    borderRadius: 15,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    marginBottom: 30,
    overflow: 'hidden',
  },
  policyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    backgroundColor: appColors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  policyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: appColors.textPrimary,
  },
  policyBody: {
    padding: 18,
    backgroundColor: appColors.background,
  },
  policyText: {
    fontSize: 14,
    color: appColors.textSecondary,
    textAlign: 'justify',
    lineHeight: 20,
  },

  finalBuyButton: {
    backgroundColor: appColors.secondary, // Un color que resalte para el botón de compra final
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  finalBuyButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: appColors.white,
  },

  // Estilos para modales de resultado (reutilizados de otras pantallas)
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: appColors.cardBackground,
    width: '90%',
    padding: 30,
    borderRadius: 25,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: appColors.textPrimary,
    textAlign: 'center',
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  modalBody: {
    alignItems: 'center',
    marginBottom: 30,
  },
  modalIcon: {
    marginBottom: 20,
  },
  modalMessage: {
    fontSize: 17,
    color: appColors.textPrimary,
    textAlign: 'center',
    lineHeight: 26,
  },
  modalActionButton: {
    backgroundColor: appColors.primary,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  modalActionButtonText: {
    fontSize: 19,
    fontWeight: 'bold',
    color: appColors.white,
  },
});

export default ConfirmPurchaseScreen;