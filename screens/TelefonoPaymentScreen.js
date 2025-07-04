import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from '@react-navigation/native';
import { appStyles, appColors } from '../constants/appStyles'; 

// --- Ajustes de color a azul (usando appColors.primary) ---
const primaryColor = appColors.primary; // Azul principal
const secondaryColor = appColors.secondary; // Azul secundario
const buttonTextColor = appColors.white; // Blanco

const TelefonoPaymentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Recibir userWalletBalance y userId de los parámetros de navegación
  const { providerData, userWalletBalance, userId } = route.params;

  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [planType, setPlanType] = useState('prepago'); 
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState(''); 
  const [paymentSuccess, setPaymentSuccess] = useState(false); 
  
  const [movistarServiceType, setMovistarServiceType] = useState('celular');
  const [isPlanDropdownVisible, setIsPlanDropdownVisible] = useState(false);
  
  const [allPlans, setAllPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Para la carga de planes
  const [error, setError] = useState(null); 

  // NUEVO ESTADO: Para controlar la carga del proceso de pago
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsLoading(true);
        // Asegúrate de que esta URL es correcta. Para el emulador de Android, 10.0.2.2 es la IP correcta.
        const response = await fetch(`${API_URL}/api/xp/providers/${providerData.slug}/plans`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'No se pudieron obtener los planes de pago.');
        }

        const data = await response.json();
        
        if (Array.isArray(data)) {
          const plansWithNumbers = data.map(plan => ({
            ...plan,
            amount: plan.amount ? parseFloat(plan.amount) : null,
          }));
          
          setAllPlans(plansWithNumbers);
          setError(null);
        } else {
          throw new Error('La respuesta de la API no tiene el formato esperado (no es un array).');
        }
        
      } catch (err) {
        console.error('Error fetching plans:', err);
        setError(err.message || 'Error de conexión. Asegúrate de que el servidor esté corriendo.');
        Alert.alert('Error', err.message || 'No se pudo conectar con el servidor.');
      } finally {
        setIsLoading(false);
      }
    };

    if (providerData?.slug && providerData.slug !== 'cantv') {
      fetchPlans();
    }
  }, [providerData.slug]); 

  const filteredPlans = allPlans.filter(plan => {
      if (providerData.slug === 'movistar') {
          const isInternetPlan = plan.plan_type === 'postpago';
          const isCelularPlan = plan.plan_type === 'prepago';
          
          if (movistarServiceType === 'celular') return isCelularPlan;
          if (movistarServiceType === 'internet') return isInternetPlan;
      }
      return plan.plan_type === planType;
  });

  // Lógica de pago con validación de saldo y llamada a la API de backend
  const handlePayment = async () => {
    if (!phoneNumber) {
      Alert.alert("Campo Requerido", "Por favor, ingresa el número de teléfono.");
      return;
    }
    if (!selectedAmount || typeof selectedAmount.amount !== 'number') { 
      Alert.alert("Monto Requerido", "Por favor, selecciona un monto o plan válido.");
      return;
    }

    const paymentAmount = selectedAmount.amount;
    // Asegura que userWalletBalance sea un número, si es null/undefined, usa 0
    const currentWalletBalance = parseFloat(userWalletBalance || '0'); 

    // Validar saldo
    if (currentWalletBalance < paymentAmount) {
        setPaymentSuccess(false);
        setPaymentMessage(`Saldo insuficiente. Tu saldo actual es $${currentWalletBalance.toFixed(2)}. Necesitas $${paymentAmount.toFixed(2)} para este pago.`);
        setModalVisible(true);
        return; // Detiene la ejecución si el saldo es insuficiente
    }

    // Preparar datos para enviar al backend
    const paymentData = {
        userId: userId,
        amount: paymentAmount,
        providerSlug: providerData.slug,
        phoneNumber: phoneNumber,
        planId: selectedAmount.id, 
        description: `Pago ${providerData.name} - ${selectedAmount.label}` 
    };

    try {
        setIsProcessingPayment(true); // <--- CORRECCIÓN: Usar el nuevo estado de carga
        const response = await fetch(`${API_URL}/api/xp/processPayment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentData),
        });

        const result = await response.json();

        if (response.ok) {
            setPaymentSuccess(true);
            setPaymentMessage(result.message || 'Pago procesado exitosamente.');
            // No navegamos automáticamente, el usuario cerrará el modal
        } else {
            setPaymentSuccess(false);
            setPaymentMessage(result.message || 'Hubo un error al procesar el pago.');
        }
    } catch (err) {
        console.error('Error en la llamada al API de pago:', err);
        setPaymentSuccess(false);
        setPaymentMessage('Error de conexión al servidor de pagos. Intenta de nuevo.');
    } finally {
        setIsProcessingPayment(false); // <--- CORRECCIÓN: Usar el nuevo estado de carga
        setModalVisible(true); // Mostrar el modal de resultado
    }
  };
  
  const handleCantvBalanceCheck = () => {
      if (!phoneNumber) {
          Alert.alert("Campo Requerido", "Por favor, ingresa el número de teléfono fijo o contrato.");
          return;
      }
      Alert.alert("Consultando Saldo", `Consultando saldo pendiente para el número ${phoneNumber}.`);
  };

  const renderDropdown = (options, onSelect, selectedValue) => (
      <View style={styles.dropdownContainer}>
          <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setIsPlanDropdownVisible(true)}
          >
              <Text style={styles.dropdownText}>
                  {selectedValue ? selectedValue.label : "Seleccione un plan"}
              </Text>
              <Ionicons name="caret-down-outline" size={20} color={appColors.textSecondary} />
          </TouchableOpacity>
          <Modal
              visible={isPlanDropdownVisible}
              animationType="fade"
              transparent
              onRequestClose={() => setIsPlanDropdownVisible(false)}
          >
              <TouchableOpacity
                  style={styles.modalOverlay}
                  activeOpacity={1}
                  onPress={() => setIsPlanDropdownVisible(false)}
              >
                  <View style={styles.dropdownModalContent}>
                      <ScrollView showsVerticalScrollIndicator={false}>
                          {options.map((option, index) => (
                              <TouchableOpacity
                                  key={option.id || index}
                                  style={styles.dropdownOption}
                                  onPress={() => {
                                      onSelect(option);
                                      setIsPlanDropdownVisible(false);
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
  
  const renderMovistarUI = () => (
      <>
          <Text style={styles.inputLabel}>Número de Teléfono</Text>
          <TextInput
              style={styles.input}
              placeholder="Ej: 04141234567"
              placeholderTextColor={appColors.textSecondary}
              keyboardType="numeric"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              maxLength={11}
          />
          <Text style={styles.inputLabel}>Selecciona el Servicio</Text>
          <View style={styles.planSelector}>
              <TouchableOpacity
                  style={[styles.planButton, movistarServiceType === 'celular' && styles.planButtonSelected]}
                  onPress={() => { 
                      setMovistarServiceType('celular'); 
                      setSelectedAmount(null); 
                  }}
              >
                  <Text style={[styles.planText, movistarServiceType === 'celular' && { color: buttonTextColor }]}>Telefonía Celular</Text>
              </TouchableOpacity>
              <TouchableOpacity
                  style={[styles.planButton, movistarServiceType === 'internet' && styles.planButtonSelected]}
                  onPress={() => { 
                      setMovistarServiceType('internet'); 
                      setSelectedAmount(null); 
                  }}
              >
                  <Text style={[styles.planText, movistarServiceType === 'internet' && { color: buttonTextColor }]}>Internet Móvil</Text>
              </TouchableOpacity>
          </View>
          
          <Text style={styles.inputLabel}>Selecciona un Plan ({movistarServiceType === 'celular' ? 'Prepago' : 'Postpago'})</Text>
          {isLoading ? (
              <ActivityIndicator size="large" color={primaryColor} style={{ paddingVertical: 20 }} />
          ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
          ) : filteredPlans.length > 0 ? (
              renderDropdown(filteredPlans, setSelectedAmount, selectedAmount)
          ) : (
              <Text style={styles.noAmountsText}>No hay planes disponibles para este servicio.</Text>
          )}
          
          {selectedAmount && typeof selectedAmount.amount === 'number' && (
              <Text style={styles.selectedAmountText}>Monto a pagar: ${selectedAmount.amount.toFixed(2)}</Text>
          )}
          
          <TouchableOpacity style={styles.payButton} onPress={handlePayment} disabled={isProcessingPayment}>
              {isProcessingPayment ? (
                  <ActivityIndicator color={buttonTextColor} />
              ) : (
                  <Text style={styles.payButtonText}>Pagar Ahora</Text>
              )}
          </TouchableOpacity>
      </>
  );
  
  const renderTelecomPlansUI = () => (
      <>
          <Text style={styles.inputLabel}>Número de Teléfono</Text>
          <TextInput
              style={styles.input}
              placeholder="Ej: 04121234567"
              placeholderTextColor={appColors.textSecondary}
              keyboardType="numeric"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              maxLength={11}
          />
          <Text style={styles.inputLabel}>Selecciona el Tipo de Plan</Text>
          <View style={styles.planSelector}>
              <TouchableOpacity
                  style={[styles.planButton, planType === 'prepago' && styles.planButtonSelected]}
                  onPress={() => { 
                      setPlanType('prepago'); 
                      setSelectedAmount(null); 
                  }}
              >
                  <Text style={[styles.planText, planType === 'prepago' && { color: buttonTextColor }]}>Prepago</Text>
              </TouchableOpacity>
              <TouchableOpacity
                  style={[styles.planButton, planType === 'postpago' && styles.planButtonSelected]}
                  onPress={() => { 
                      setPlanType('postpago'); 
                      setSelectedAmount(null); 
                  }}
              >
                  <Text style={[styles.planText, planType === 'postpago' && { color: buttonTextColor }]}>Postpago</Text>
              </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>Selecciona un Plan</Text>
          {isLoading ? (
              <ActivityIndicator size="large" color={primaryColor} style={{ paddingVertical: 20 }} />
          ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
          ) : filteredPlans.length > 0 ? (
              renderDropdown(filteredPlans, setSelectedAmount, selectedAmount)
          ) : (
              <Text style={styles.noAmountsText}>No hay planes disponibles para este tipo de plan.</Text>
          )}
          
          {selectedAmount && typeof selectedAmount.amount === 'number' && (
              <Text style={styles.selectedAmountText}>Monto a pagar: ${selectedAmount.amount.toFixed(2)}</Text>
          )}
          
          <TouchableOpacity style={styles.payButton} onPress={handlePayment} disabled={isProcessingPayment}>
              {isProcessingPayment ? (
                  <ActivityIndicator color={buttonTextColor} />
              ) : (
                  <Text style={styles.payButtonText}>Pagar Ahora</Text>
              )}
          </TouchableOpacity>
      </>
  );

  const renderCantvUI = () => (
      <>
          <Text style={styles.inputLabel}>Número de Teléfono o Contrato</Text>
          <TextInput
              style={styles.input}
              placeholder="Ej: 02125555555"
              placeholderTextColor={appColors.textSecondary}
              keyboardType="numeric"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              maxLength={11}
          />
          <Text style={styles.cantvInfoText}>
              Tu saldo actual de billetera es: ${parseFloat(userWalletBalance || '0').toFixed(2)}
          </Text>
          <Text style={styles.cantvInfoText}>
              Ingresa tu número de teléfono fijo o contrato para ver tu deuda.
          </Text>
          
          <TouchableOpacity style={styles.payButton} onPress={handleCantvBalanceCheck} disabled={isProcessingPayment}>
              {isProcessingPayment ? (
                  <ActivityIndicator color={buttonTextColor} />
              ) : (
                  <Text style={styles.payButtonText}>Consultar Saldo</Text>
              )}
          </TouchableOpacity>
      </>
  );

  const renderDefaultUI = () => (
      <>
          <Text style={styles.inputLabel}>Número de Contrato</Text>
          <TextInput
              style={styles.input}
              placeholder="Ej: 1234567890"
              placeholderTextColor={appColors.textSecondary}
              keyboardType="numeric"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              maxLength={15}
          />
          <Text style={styles.inputLabel}>Selecciona el Tipo de Plan</Text>
          <View style={styles.planSelector}>
              <TouchableOpacity
                  style={[styles.planButton, planType === 'prepago' && styles.planButtonSelected]}
                  onPress={() => { setPlanType('prepago'); setSelectedAmount(null); }}
              >
                  <Text style={[styles.planText, planType === 'prepago' && { color: buttonTextColor }]}>Prepago</Text>
              </TouchableOpacity>
              <TouchableOpacity
                  style={[styles.planButton, planType === 'postpago' && styles.planButtonSelected]}
                  onPress={() => { setPlanType('postpago'); setSelectedAmount(null); }}
              >
                  <Text style={[styles.planText, planType === 'postpago' && { color: buttonTextColor }]}>Postpago</Text>
              </TouchableOpacity>
          </View>
          
          <Text style={styles.inputLabel}>Selecciona un Monto</Text>
          <View style={styles.amountsGrid}>
              {isLoading ? (
                  <ActivityIndicator size="large" color={primaryColor} style={{ width: '100%', paddingVertical: 20 }} />
              ) : error ? (
                  <Text style={styles.errorText}>{error}</Text>
              ) : filteredPlans.length > 0 ? (
                  filteredPlans.map(plan => (
                      <TouchableOpacity
                          key={plan.id}
                          style={[
                              styles.amountButton,
                              selectedAmount?.id === plan.id && styles.amountButtonSelected,
                          ]}
                          onPress={() => setSelectedAmount(plan)}
                      >
                          <Text style={[
                              styles.amountText,
                              selectedAmount?.id === plan.id && styles.amountTextSelected,
                          ]}>
                              {plan.label}
                          </Text>
                      </TouchableOpacity>
                  ))
              ) : (
                  <Text style={styles.noAmountsText}>No hay opciones de pago para este plan.</Text>
              )}
          </View>
          
          {selectedAmount && typeof selectedAmount.amount === 'number' && (
              <Text style={styles.selectedAmountText}>Monto a pagar: ${selectedAmount.amount.toFixed(2)}</Text>
          )}

          <TouchableOpacity style={styles.payButton} onPress={handlePayment} disabled={isProcessingPayment}>
              {isProcessingPayment ? (
                  <ActivityIndicator color={buttonTextColor} />
              ) : (
                  <Text style={styles.payButtonText}>Pagar Ahora</Text>
              )}
          </TouchableOpacity>
      </>
  );

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
            {providerData.logo_url && (
                <Image
                    source={{ uri: providerData.logo_url }}
                    style={styles.providerLogo}
                    resizeMode="contain"
                />
            )}
            <Text style={styles.providerName}>{providerData.name}</Text>
          </View>
          
          <View style={styles.formContainer}>
            {providerData.slug === 'cantv' && renderCantvUI()}
            {providerData.slug === 'movistar' && renderMovistarUI()}
            {['digitel', 'movilnet'].includes(providerData.slug) && renderTelecomPlansUI()}
            {['cantv', 'movistar', 'digitel', 'movilnet'].includes(providerData.slug) === false && renderDefaultUI()}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Modal de éxito/error de pago */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: paymentSuccess ? appColors.green : appColors.red }]}>
                {paymentSuccess ? '¡Transacción Exitosa!' : 'Error en la Transacción'}
              </Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); navigation.goBack(); }} style={styles.closeButton}>
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
                style={[styles.modalActionButton, { backgroundColor: paymentSuccess ? primaryColor : appColors.red }]} 
                onPress={() => { 
                    setModalVisible(false); 
                    navigation.goBack(); 
                }}
            >
              <Text style={styles.modalActionButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

// --- Estilos de la pantalla ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 25,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 20,
    zIndex: 1,
  },
  providerLogo: {
    width: 100,
    height: 100,
    marginBottom: 10,
    borderRadius: 15,
  },
  providerName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: appColors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
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
  planSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: appColors.background,
    borderRadius: 12,
    padding: 5,
  },
  planButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  planButtonSelected: {
    backgroundColor: primaryColor,
  },
  planText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: appColors.textPrimary,
  },
  amountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  amountButton: {
    width: '30%',
    padding: 15,
    backgroundColor: appColors.background,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  amountButtonSelected: {
    backgroundColor: primaryColor,
    borderColor: secondaryColor,
    borderWidth: 2,
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: appColors.textPrimary,
  },
  amountTextSelected: {
    color: buttonTextColor,
  },
  noAmountsText: {
    fontSize: 15,
    color: appColors.textSecondary,
    textAlign: 'center',
    width: '100%',
    paddingVertical: 20,
  },
  selectedAmountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: primaryColor,
    textAlign: 'center',
    marginBottom: 20,
  },
  payButton: {
    backgroundColor: primaryColor,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: buttonTextColor,
  },
  // Estilos del modal de éxito/error (ajustados para ser genéricos)
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
    color: primaryColor, 
    borderBottomWidth: 3,
    borderBottomColor: secondaryColor,
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
    backgroundColor: primaryColor,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  modalActionButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: buttonTextColor,
  },
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
  cantvInfoText: {
    fontSize: 15,
    color: appColors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default TelefonoPaymentScreen;
