import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  ScrollView,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert, // Se mantiene para validaciones de formulario específicas
  Image,
  LayoutAnimation, // Para animaciones de expansión/colapso
  UIManager, // Para habilitar LayoutAnimation en Android
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import RNPickerSelect from "react-native-picker-select";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { jwtDecode } from 'jwt-decode'; // Importar jwtDecode para decodificar el token

// Importar estilos y colores compartidos
import { appStyles, appColors } from '../constants/appStyles';
// Asegúrate de que API_URL esté configurado en tu archivo .env
import { API_URL } from '@env';

// Habilitar LayoutAnimation en Android para transiciones fluidas
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AvanceEfectivoScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Aseguramos que userWalletBalance tenga un valor por defecto
  const { token, userId: routeUserId, userWalletBalance = '0' } = route.params || {};

  // Usamos el userId de la ruta o del token como el currentUserId principal
  let currentUserId = routeUserId;
  if (token) { 
    try {
      const decoded = jwtDecode(token);
      currentUserId = decoded.id; 
    } catch (e) {
      console.error('AvanceEfectivoScreen - Error al decodificar el token:', e);
    }
  }

  console.log('AvanceEfectivoScreen - userId final utilizado:', currentUserId);

  // --- Estados para los campos del formulario de solicitud de avance ---
  const [modalVisible, setModalVisible] = useState(false); // Controla la visibilidad del modal de solicitud
  const [concepto, setConcepto] = useState(""); // Concepto del avance
  const [monto, setMonto] = useState(""); // Monto a solicitar
  const [numCuotasSolicitud, setNumCuotasSolicitud] = useState('1'); // Número de cuotas para la solicitud real

  // --- Estados para el modal de resumen y confirmación ---
  const [resumenVisible, setResumenVisible] = useState(false); // Controla la visibilidad del modal de resumen
  const [isConfirmingAdvance, setIsConfirmingAdvance] = useState(false); // Estado de carga para el botón de confirmar avance

  // --- Estados para el modal de éxito/error final de la operación ---
  const [resultModalVisible, setResultModalVisible] = useState(false); // Controla la visibilidad del modal de resultado
  const [resultMessage, setResultMessage] = useState(''); // Mensaje a mostrar en el modal de resultado
  const [resultSuccess, setResultSuccess] = useState(false); // Indica si la operación fue exitosa o fallida

  // --- Estados de datos y carga para la pantalla principal ---
  const [saldoCredito, setSaldoCredito] = useState(0); // Saldo de crédito disponible para avance (MIC_CREAVA)
  const [movimientos, setMovimientos] = useState([]); // Historial de movimientos de avance
  const [loadingSaldo, setLoadingSaldo] = useState(true); // Estado de carga para el saldo de crédito
  const [loadingMovimientos, setLoadingMovimientos] = useState(true); // Estado de carga para los movimientos
  const [cuentasGuardadas, setCuentasGuardadas] = useState([]); // Lista de cuentas guardadas del usuario
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null); // Cuenta guardada seleccionada
  const [bancosDisponibles, setBancosDisponibles] = useState([]); // Lista de bancos disponibles para selección
  const [mostrarMovimientos, setMostrarMovimientos] = useState(false); // Toggle para mostrar/ocultar historial
  const [dataFetchError, setDataFetchError] = useState(null); // Estado para errores al cargar datos iniciales

  // --- Estados para mejoras de UX ---
  const [simuladorModalVisible, setSimuladorModalVisible] = useState(false); // Visibilidad del modal del simulador
  const [simuladorMonto, setSimuladorMonto] = useState(''); // Monto para el simulador
  const [simuladorCuotas, setSimuladorCuotas] = useState('3'); // Número de cuotas para el simulador
  const [resultadoSimulacion, setResultadoSimulacion] = useState(null); // Resultado del cálculo del simulador
  const [faqExpanded, setFaqExpanded] = useState(false); // Estado para expandir/colapsar la sección de FAQ
  const [showNoAdvanceModal, setShowNoAdvanceModal] = useState(false); // Nuevo estado para el modal de "No Avance Disponible"

  // --- Estados para AÑADIR NUEVA CUENTA (en un modal separado) ---
  const [addAccountModalVisible, setAddAccountModalVisible] = useState(false);
  const [newAccountAlias, setNewAccountAlias] = useState('');
  const [newAccountPhone, setNewAccountPhone] = useState('');
  const [newAccountCedula, setNewAccountCedula] = useState('');
  const [newAccountBank, setNewAccountBank] = useState(null); // Código del banco seleccionado para nueva cuenta
  const [newAccountPhonePrefix, setNewAccountPhonePrefix] = useState('0414');
  const [newAccountCedulaPrefix, setNewAccountCedulaPrefix] = useState('V');
  const [showNoValidatedBankModal, setShowNoValidatedBankModal] = useState(false); // NUEVO: Modal para cuando no hay bancos validados

  // --- NUEVOS ESTADOS PARA PAGO DE CUOTAS ---
  // Eliminamos payInstallmentModalVisible y selectedInstallmentToPay de aquí
  const [isProcessingInstallmentPayment, setIsProcessingInstallmentPayment] = useState(false); // Estado de carga para el pago de cuota
  const [showPayInstallmentsSection, setShowPayInstallmentsSection] = useState(false); // Estado para mostrar/ocultar la sección de pago de cuotas

  // --- Opciones para los selectores (Pickers) ---
  const telefonoPrefixos = [
    { label: '0414', value: '0414' }, { label: '0424', value: '0424' },
    { label: '0426', value: '0426' }, { label: '0416', value: '0416' },
    { label: '0412', value: '0412' }, { label: '0422', value: '0422' },
  ];
  const cedulaPrefixos = [
    { label: 'V', value: 'V' }, { label: 'J', value: 'J' },
    { label: 'C', value: 'C' }, { label: 'E', value: 'E' },
    { label: 'P', value: 'P' },
  ];
  const cuotasOpciones = [
    { label: '1 Cuota (Pago Único)', value: '1' },
    { label: '3 Cuotas (Bi-semanal)', value: '3' },
    { label: '6 Cuotas (Mensual)', value: '6' },
    { label: '9 Cuotas (Mensual)', value: '9' },
    { label: '12 Cuotas (Mensual)', value: '12' },
  ];

  // --- Funciones de Fetch de Datos ---

  const obtenerSaldo = useCallback(async () => {
    try {
      setLoadingSaldo(true);
      if (!currentUserId) {
        console.warn("obtenerSaldo: No hay userId para obtener el saldo de crédito.");
        setSaldoCredito(0);
        setDataFetchError("No se pudo obtener el ID de usuario para cargar el saldo de crédito.");
        setShowNoAdvanceModal(true); 
        return;
      }
      const response = await fetch(`${API_URL}/api/getUsuarioDetalle/${currentUserId}`); 
      const data = await response.json();
      
      let fetchedSaldo = 0;
      if (data && data.MIC_CREAVA !== undefined) { 
        fetchedSaldo = parseFloat(data.MIC_CREAVA); 
      }

      setSaldoCredito(fetchedSaldo);
      setDataFetchError(null);

      if (fetchedSaldo < 5.00) { 
        setShowNoAdvanceModal(true); 
      } else {
        setShowNoAdvanceModal(false);
      }

    } catch (error) {
      console.error("Error al obtener saldo de crédito:", error);
      setDataFetchError("Error al cargar el saldo de crédito. Intenta de nuevo.");
      setShowNoAdvanceModal(true); 
    } finally {
      setLoadingSaldo(false);
    }
  }, [currentUserId]);

  const fetchMovimientos = useCallback(async () => {
    try {
      setLoadingMovimientos(true);
      if (!currentUserId) {
        console.warn("fetchMovimientos: No hay userId para obtener los movimientos de avance.");
        setMovimientos([]);
        setDataFetchError("No se pudo obtener el ID de usuario para cargar los movimientos.");
        return;
      }
      // El endpoint /api/movimientos ahora devuelve la nueva estructura
      const response = await fetch(`${API_URL}/api/movimientos/${currentUserId}`);
      const data = await response.json();
      console.log("Datos de movimientos recibidos del backend:", data);
      if (Array.isArray(data)) {
        setMovimientos(data);
        setDataFetchError(null);
      } else {
        setMovimientos([]);
        setDataFetchError("No se encontraron movimientos de avance.");
      }
    } catch (error) {
      console.error("Error al obtener los movimientos de avance:", error);
      setDataFetchError("Error al cargar el historial de avances. Intenta de nuevo.");
    } finally {
      setLoadingMovimientos(false);
    }
  }, [currentUserId]);

  const fetchBancos = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/bancos`); 
      const result = await response.json();
      if (Array.isArray(result)) {
        setBancosDisponibles(result);
      } else {
        console.warn("fetchBancos: Respuesta inesperada de bancos:", result);
      }
    } catch (error) {
      console.error("Error al obtener bancos:", error);
    }
  }, []);

  // Función para obtener las cuentas guardadas del usuario desde tu API (XPBANUSUARIO)
  const fetchCuentasGuardadas = useCallback(async () => {
    if (!currentUserId) {
      console.warn("fetchCuentasGuardadas: No hay userId para obtener las cuentas guardadas.");
      setCuentasGuardadas([]);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/getUserValidatedAccounts/${currentUserId}`); 
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setCuentasGuardadas(data);
        setCuentaSeleccionada(data[0]); // Preselecciona la primera cuenta
        setShowNoValidatedBankModal(false); // Ocultar modal si hay cuentas
      } else {
        setCuentasGuardadas([]);
        setCuentaSeleccionada(null);
        setShowNoValidatedBankModal(true); // Mostrar modal si no hay cuentas
        console.warn("No se encontraron cuentas guardadas o validadas.");
      }
    } catch (error) {
      console.error("Error al obtener cuentas guardadas:", error);
      setDataFetchError("Error al cargar tus cuentas validadas.");
      setShowNoValidatedBankModal(true); // Mostrar modal en caso de error
    }
  }, [currentUserId]);

  useFocusEffect(
    useCallback(() => {
      if (currentUserId) {
        obtenerSaldo(); 
        fetchMovimientos();
        fetchBancos();
        fetchCuentasGuardadas(); // Cargar cuentas validadas
        setDataFetchError(null);
      } else {
        setLoadingSaldo(false);
        setLoadingMovimientos(false);
        setDataFetchError("No se pudo obtener el ID de usuario. Por favor, asegúrate de haber iniciado sesión.");
        setShowNoAdvanceModal(true);
      }
      return () => {};
    }, [currentUserId, obtenerSaldo, fetchMovimientos, fetchBancos, fetchCuentasGuardadas])
  );

  // --- Lógica para el botón "Solicitar Avance" ---
  const handleSolicitarAvancePress = () => {
    if (saldoCredito < 5.00) { 
      setShowNoAdvanceModal(true); 
    } else if (cuentasGuardadas.length === 0) { // Validar si hay cuentas validadas
      setShowNoValidatedBankModal(true); // Mostrar modal si no hay cuentas validadas
    }
    else {
      setModalVisible(true); 
    }
  };

  // --- Lógica para solicitar un avance (desde el modal del formulario, antes del resumen) ---
  const solicitarAvance = () => {
    const montoNum = parseFloat(monto.replace(",", "."));
    if (isNaN(montoNum) || montoNum <= 0) {
      Alert.alert("Error", "Por favor, ingresa un monto válido y mayor a cero.");
      return;
    }
    if (montoNum > saldoCredito) {
      Alert.alert("Error", `El monto solicitado ($${montoNum.toFixed(2)}) excede tu saldo de crédito disponible ($${saldoCredito.toFixed(2)}).`);
      return;
    }
    if (montoNum < 5.00) { 
      Alert.alert("Error", "El monto mínimo para solicitar un avance es de $5.00.");
      return;
    }
    if (!numCuotasSolicitud) { 
      Alert.alert("Error", "Por favor, selecciona el número de cuotas.");
      return;
    }

    // Solo se permite solicitar avance a cuentas guardadas/validadas
    if (!cuentaSeleccionada) {
      Alert.alert("Error", "Por favor, selecciona una cuenta validada para el avance.");
      return;
    }
    
    setModalVisible(false); 
    setResumenVisible(true); 
  };

  // --- Lógica para añadir una nueva cuenta guardada a tu API (XPREGISTROS) ---
  const handleAddAccount = async () => {
    if (!newAccountAlias || !newAccountPhone || newAccountPhone.length !== 7 || !newAccountCedula || newAccountCedula.length < 5 || !newAccountBank) {
      Alert.alert("Error", "Por favor, completa todos los campos de la nueva cuenta y asegúrate de que el teléfono tenga 7 dígitos y la cédula sea válida.");
      return;
    }

    if (!currentUserId) {
      Alert.alert("Error", "No se pudo guardar la cuenta. ID de usuario no disponible.");
      return;
    }

    const selectedBankObj = bancosDisponibles.find(b => b.ban_codigo === newAccountBank);
    const bankName = selectedBankObj ? selectedBankObj.Ban_nombre : "Banco Desconocido";

    const newAccountData = {
      usu_codigo: currentUserId, // Asegúrate de que tu API reciba el ID de usuario
      alias: newAccountAlias,
      telefono: `${newAccountPhonePrefix}${newAccountPhone}`,
      cedula: `${newAccountCedulaPrefix}${newAccountCedula}`,
      banco_codigo: newAccountBank, // Código del banco
      banco_nombre: bankName, // Nombre del banco
      // Puedes añadir otros campos que tu API XPREGISTROS/XPBANUSUARIO requiera
    };

    try {
      const response = await fetch(`${API_URL}/api/addValidatedAccount`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAccountData),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Éxito", "Cuenta guardada exitosamente.");
        setAddAccountModalVisible(false);
        fetchCuentasGuardadas(); 
        // Limpiar campos del formulario de nueva cuenta
        setNewAccountAlias('');
        setNewAccountPhone('');
        setNewAccountCedula('');
        setNewAccountBank(null);
        setNewAccountPhonePrefix('0414');
        setNewAccountCedulaPrefix('V');
      } else {
        Alert.alert("Error", data.message || "No se pudo guardar la cuenta. Intenta de nuevo.");
      }
    } catch (error) {
      console.error("Error al guardar la cuenta:", error);
      Alert.alert("Error", "No se pudo conectar con el servidor o hubo un error inesperado al guardar la cuenta.");
    }
  };

  // --- Lógica para confirmar el avance (interacción con el backend) ---
  const confirmarAvance = async () => {
    setIsConfirmingAdvance(true); 
    const requestedAmount = parseFloat(monto.toString().replace(",", "."));
    const interestAmount = parseFloat(calcularInteres(monto).toString().replace(",", "."));
    const totalAmountDue = parseFloat(calcularTotal(monto).toString().replace(",", "."));

    const advanceRequestPayload = {
      usu_codigo: currentUserId, 
      requested_amount: requestedAmount,
      interest_amount: interestAmount,
      total_amount_due: totalAmountDue,
      num_installments: parseInt(numCuotasSolicitud),
      concept: concepto || "Avance de Efectivo",
      destination_account_id: cuentaSeleccionada.id, // ID de la cuenta validada de XPBANUSUARIO
    };

    try {
      const response = await fetch(`${API_URL}/api/crearmovavance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(advanceRequestPayload),
      });

      const data = await response.json();

      if (response.ok) {
        // NOTA: La lógica de descuento de MIC_CREAVA ahora se maneja en el backend dentro de crearMovAvance
        // Por lo tanto, eliminamos la llamada a /api/descredito de aquí.
        
        setResumenVisible(false); 
        setResultSuccess(true); 
        setResultMessage("¡Avance solicitado con éxito!"); 
        setResultModalVisible(true); 

        obtenerSaldo(); 
        fetchMovimientos(); // Refrescar el historial con la nueva estructura
        setMonto("");
        setConcepto("");
        setNumCuotasSolicitud('1'); 

      } else {
        setResumenVisible(false);
        setResultSuccess(false); 
        setResultMessage(data.message || "Error al solicitar el avance. Intenta de nuevo."); 
        setResultModalVisible(true);
      }
    } catch (error) {
      console.error("❌ Error de conexión o al procesar avance:", error);
      setResumenVisible(false);
      setResultSuccess(false);
      setResultMessage("No se pudo conectar con el servidor o hubo un error inesperado.");
      setResultModalVisible(true);
    } finally {
      setIsConfirmingAdvance(false); 
    }
  };

  // --- Lógica para el Simulador de Cuotas ---
  const calcularCuotasSimuladas = () => {
    const montoSim = parseFloat(simuladorMonto.replace(",", "."));
    const num = parseInt(simuladorCuotas);

    if (isNaN(montoSim) || montoSim <= 0) {
      Alert.alert("Error", "Por favor, ingresa un monto válido para el simulador.");
      setResultadoSimulacion(null);
      return;
    }
    if (isNaN(num) || num <= 0) {
      Alert.alert("Error", "Por favor, selecciona un número de cuotas válido.");
      setResultadoSimulacion(null);
      return;
    }

    const interesTotal = montoSim * 0.04;
    const totalConInteres = montoSim + interesTotal;
    const pagoMensual = totalConInteres / num; 

    setResultadoSimulacion({
      montoSimulado: montoSim.toFixed(2),
      interesTotal: interesTotal.toFixed(2),
      totalPagar: totalConInteres.toFixed(2),
      pagoMensual: pagoMensual.toFixed(2), 
      cuotas: num,
    });
  };

  // --- Funciones de Utilidad y Formateo ---

  const obtenerFechaFormateada = () => {
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    const horas = String(fecha.getHours()).padStart(2, "0");
    const minutos = String(fecha.getMinutes()).padStart(2, "0");
    const segundos = String(fecha.getSeconds()).padStart(2, "0");
    return `${anio}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
  };

  const calcularInteres = (monto) => {
    const num = parseFloat(monto.replace(",", "."));
    if (isNaN(num)) return "0.00";
    return (num * 0.04).toFixed(2);
  };

  const calcularTotal = (monto) => {
    const num = parseFloat(monto.replace(",", "."));
    if (isNaN(num)) return "0.00";
    return (num * 1.04).toFixed(2);
  };

  const calcularDetallePagos = (montoBase, numCuotas) => {
    const totalConInteres = parseFloat(calcularTotal(montoBase));
    const num = parseInt(numCuotas);

    if (isNaN(totalConInteres) || totalConInteres <= 0 || isNaN(num) || num <= 0) {
      return [];
    }

    const pagos = [];
    const pagoPorCuota = totalConInteres / num;
    let fechaInicio = new Date(); 

    for (let i = 0; i < num; i++) {
      let fechaPagoCuota = new Date(fechaInicio);

      if (num === 3) { 
        fechaPagoCuota.setDate(fechaPagoCuota.getDate() + (i * 15));
      } else { 
        fechaPagoCuota.setMonth(fechaPagoCuota.getMonth() + i);
      }

      pagos.push({
        date: fechaPagoCuota.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" }),
        amount: pagoPorCuota.toFixed(2),
        cuotaNum: i + 1,
      });
    }
    return pagos;
  };

  const handleMontoChange = (text) => {
    const clean = text.replace(/[^0-9.]/g, ""); 
    let finalClean = clean;
    const parts = clean.split('.');
    if (parts.length > 2) {
      finalClean = parts[0] + '.' + parts.slice(1).join('');
    }

    const parsed = parseFloat(finalClean);
    if (!isNaN(parsed)) {
      setMonto(finalClean); 
    } else {
      setMonto("");
    }
  };

  const handleSimuladorMontoChange = (text) => {
    const clean = text.replace(/[^0-9.]/g, "");
    let finalClean = clean;
    const parts = clean.split('.');
    if (parts.length > 2) {
      finalClean = parts[0] + '.' + parts.slice(1).join('');
    }
    setSimuladorMonto(finalClean);
  };

  // --- Lógica para el pago de cuotas (ahora navega a la selección de método de pago) ---
  const handlePayInstallment = (installment) => {
    // Navegar a la nueva pantalla de selección de método de pago
    navigation.navigate('SelectInstallmentPaymentMethodScreen', { 
      installment: installment, 
      userId: currentUserId,
      userWalletBalance: userWalletBalance // Pasamos el saldo de la billetera
    });
  };

  // La función confirmPayInstallment ya no se llama directamente desde aquí
  // sino desde SelectInstallmentPaymentMethodScreen (si se elige pagar con billetera)
  const confirmPayInstallment = async (selectedInstallmentToPay) => {
    if (!selectedInstallmentToPay) return;

    setIsProcessingInstallmentPayment(true);
    const paymentId = selectedInstallmentToPay.payment_id;
    const amountToPay = parseFloat(selectedInstallmentToPay.payment_amount || 0);

    // Validar saldo de billetera del usuario (simulado)
    const currentWalletBalance = parseFloat(userWalletBalance || '0');
    if (currentWalletBalance < amountToPay) {
      setResultSuccess(false); 
      setResultMessage(`Saldo insuficiente en la billetera. Tu saldo actual es $${currentWalletBalance.toFixed(2)}. Necesitas $${amountToPay.toFixed(2)} para este pago.`);
      // No cerramos el modal de pago de cuotas aquí, ya que esta función se llama desde otra pantalla
      setResultModalVisible(true);
      setIsProcessingInstallmentPayment(false);
      return false; // Indicar que el pago no se procesó
    }

    try {
      const response = await fetch(`${API_URL}/api/payInstallment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Incluir el token de autenticación si tu API lo requiere
          // 'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify({
          installmentId: paymentId,
          usu_codigo: currentUserId,
          // Aquí podrías añadir el método de pago si tu backend lo necesita
          // Por ahora, asumimos que se paga con el saldo de la billetera xPagar
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResultSuccess(true);
        setResultMessage(data.message || 'Cuota pagada exitosamente.');
        // Actualizar saldos y movimientos después de un pago exitoso
        obtenerSaldo(); 
        fetchMovimientos();
        return true; // Indicar éxito
      } else {
        setResultSuccess(false);
        setResultMessage(data.message || 'Error al procesar el pago de la cuota.');
        return false; // Indicar fallo
      }
    } catch (error) {
      console.error('Error al procesar el pago de la cuota:', error);
      setResultSuccess(false);
      setResultMessage('Error de conexión al servidor al pagar la cuota. Intenta de nuevo.');
      return false; // Indicar fallo
    } finally {
      setIsProcessingInstallmentPayment(false);
      setResultModalVisible(true);
    }
  };

  // Renderiza cada elemento del historial de movimientos (ahora solicitudes de avance)
  const renderMovimiento = ({ item }) => {
    // item ahora es un objeto XP_ADVANCE_REQUESTS
    return (
      <View style={styles.movimientoItem}>
        <View style={styles.movimientoDetalle}>
          <Text style={styles.movimientoDescripcion}>Solicitud: {item.concept || 'Avance de Efectivo'}</Text>
          <Text style={styles.movimientoFecha}>Fecha Solicitud: {new Date(item.request_date).toLocaleDateString()}</Text>
          <Text style={styles.movimientoBanco}>Monto Solicitado: ${parseFloat(item.requested_amount || 0).toFixed(2)}</Text>
          <Text style={styles.movimientoBanco}>Total a Pagar: ${parseFloat(item.total_amount_due || 0).toFixed(2)}</Text>
          <Text style={styles.movimientoBanco}>Cuotas: {item.num_installments}</Text>
          {/* Asumiendo que 'destination_bank_name' viene del backend al hacer JOIN */}
          <Text style={styles.movimientoBanco}>Banco Destino: {item.destination_bank_name || 'N/A'}</Text>
        </View>
        <View style={styles.movimientoMontoContainer}>
          <Text style={[styles.movimientoMonto, { color: item.status === 'Approved' ? appColors.green : appColors.red }]}>
            {item.status}
          </Text>
        </View>

        {item.installments && item.installments.length > 0 && (
          <View style={styles.installmentsContainer}>
            <Text style={styles.installmentsTitle}>Detalle de Cuotas:</Text>
            {item.installments.map((installment, index) => (
              <View key={installment.payment_id || index} style={styles.installmentItem}>
                <Text style={styles.installmentText}>Cuota {installment.installment_number}:</Text>
                <Text style={styles.installmentText}>$ {parseFloat(installment.payment_amount || 0).toFixed(2)}</Text>
                <Text style={styles.installmentText}>Vence: {new Date(installment.due_date).toLocaleDateString()}</Text>
                <Text style={[styles.installmentText, { color: installment.payment_status === 'Paid' ? appColors.green : appColors.red }]}>
                  ({installment.payment_status})
                </Text>
                {/* Botón de Pagar Cuota (pequeño, dentro del historial) */}
                {installment.payment_status === 'Pending' && (
                  <TouchableOpacity 
                    style={styles.payInstallmentButton} 
                    onPress={() => handlePayInstallment(installment)}
                  >
                    <Text style={styles.payInstallmentButtonText}>Pagar</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const toggleFaq = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFaqExpanded(!faqExpanded);
  };

  // Obtener todas las cuotas pendientes de todos los movimientos
  const allPendingInstallments = movimientos.flatMap(movimiento => 
    movimiento.installments ? movimiento.installments.filter(inst => inst.payment_status === 'Pending') : []
  );

  // Renderiza cada elemento de las cuotas pendientes en la nueva sección
  const renderPendingInstallmentItem = ({ item }) => {
    return (
      <View style={styles.movimientoItem}> {/* Reutilizamos el estilo de movimientoItem */}
        <View style={styles.movimientoDetalle}>
          <Text style={styles.movimientoDescripcion}>Cuota #{item.installment_number} del Avance #{item.advance_request_id}</Text>
          <Text style={styles.movimientoFecha}>Monto: ${parseFloat(item.payment_amount || 0).toFixed(2)}</Text>
          <Text style={styles.movimientoFecha}>Vence: {new Date(item.due_date).toLocaleDateString()}</Text>
          <Text style={[styles.movimientoBanco, { color: appColors.red }]}>Estado: Pendiente</Text>
        </View>
        <TouchableOpacity 
          style={styles.payInstallmentButtonLarge} // Nuevo estilo para el botón grande
          onPress={() => handlePayInstallment(item)} // Llama a la función que navega
        >
          <Text style={styles.payInstallmentButtonText}>Pagar Cuota</Text>
        </TouchableOpacity>
      </View>
    );
  };


  // --- Renderizado Principal de la Pantalla ---
  if (dataFetchError && !loadingSaldo && !loadingMovimientos) {
    return (
      <LinearGradient colors={[appColors.gradientStart, appColors.gradientEnd]} style={appStyles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color={appColors.red} />
        <Text style={appStyles.errorText}>{dataFetchError}</Text>
        <TouchableOpacity onPress={() => {
          if (currentUserId) {
            obtenerSaldo();
            fetchMovimientos();
            fetchBancos();
            fetchCuentasGuardadas();
            setDataFetchError(null); 
          } else {
            Alert.alert("Error de Sesión", "No se pudo obtener el ID de usuario. Por favor, inicia sesión nuevamente.");
            navigation.navigate('Login'); 
          }
        }} style={appStyles.retryButton}>
          <Text style={appStyles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const pagosProgramados = calcularDetallePagos(monto, numCuotasSolicitud);
  const finalDueDate = pagosProgramados.length > 0 ? pagosProgramados[pagosProgramados.length - 1].date : 'N/A';

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
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={appStyles.scrollViewContent}>
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

          <Text style={styles.screenTitle}>Avance de Efectivo</Text>
          <Text style={styles.subtitle}>Gestiona tus avances de crédito</Text>

          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Saldo de Avance de Efectivo</Text>
            {loadingSaldo ? (
              <ActivityIndicator size="large" color={appColors.primary} style={{ marginTop: 10 }} />
            ) : (
              <Text style={styles.balanceAmount}>${parseFloat(saldoCredito).toFixed(2)}</Text>
            )}
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.mainButton}
              onPress={handleSolicitarAvancePress} 
            >
              <Ionicons name="wallet-outline" size={30} color={appColors.white} />
              <Text style={styles.mainButtonText}>Solicitar Avance</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mainButton}
              onPress={() => setMostrarMovimientos(!mostrarMovimientos)}
            >
              <Ionicons name="list-circle-outline" size={30} color={appColors.white} />
              <Text style={styles.mainButtonText}>
                {mostrarMovimientos ? "Ocultar Historial" : "Ver Historial"}
              </Text>
            </TouchableOpacity>

            {/* NUEVO BOTÓN: Pagar Cuotas (ahora naranja) */}
            <TouchableOpacity
              style={[styles.mainButton, { backgroundColor: appColors.orangePrimary }]} // Color naranja
              onPress={() => setShowPayInstallmentsSection(!showPayInstallmentsSection)}
            >
              <Ionicons name="cash-outline" size={30} color={appColors.white} /> {/* Icono de efectivo, texto blanco */}
              <Text style={styles.mainButtonText}>
                {showPayInstallmentsSection ? "Ocultar Pagos" : "Pagar Cuotas"}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Simulador de Avance</Text>
            <Text style={styles.sectionDescription}>Calcula tus pagos mensuales para un monto y plazo deseado.</Text>
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={() => setSimuladorModalVisible(true)}
            >
              <MaterialCommunityIcons name="calculator" size={24} color={appColors.white} />
              <Text style={styles.secondaryButtonText}>Abrir Simulador</Text>
            </TouchableOpacity>
          </View>

          {/* NUEVA SECCIÓN: Cuotas Pendientes de Pago */}
          {showPayInstallmentsSection && (
            <View style={styles.historyContainer}> {/* Reutilizamos el estilo de historyContainer */}
              <Text style={styles.historyTitle}>Cuotas Pendientes de Pago</Text>
              {loadingMovimientos ? (
                <ActivityIndicator size="small" color={appColors.primary} style={{ paddingVertical: 20 }} />
              ) : allPendingInstallments.length > 0 ? (
                <FlatList
                  data={allPendingInstallments}
                  keyExtractor={(item) => item.payment_id.toString()}
                  renderItem={renderPendingInstallmentItem}
                  contentContainerStyle={styles.movimientosListContent}
                  scrollEnabled={false}
                />
              ) : (
                <Text style={styles.noHistoryText}>No tienes cuotas pendientes de pago en este momento.</Text>
              )}
            </View>
          )}

          {mostrarMovimientos && (
            <View style={styles.historyContainer}>
              <Text style={styles.historyTitle}>Historial de Avances</Text>
              {loadingMovimientos ? (
                <ActivityIndicator size="small" color={appColors.primary} style={{ paddingVertical: 20 }} />
              ) : movimientos.length > 0 ? (
                <FlatList
                  data={movimientos}
                  keyExtractor={(item) => item.request_id.toString()} 
                  renderItem={renderMovimiento}
                  contentContainerStyle={styles.movimientosListContent}
                  scrollEnabled={false} 
                />
              ) : (
                <Text style={styles.noHistoryText}>No hay movimientos de avance registrados.</Text>
              )}
            </View>
          )}

          <View style={styles.faqContainer}>
            <TouchableOpacity style={styles.faqHeader} onPress={toggleFaq}>
              <Text style={styles.faqTitle}>Preguntas Frecuentes</Text>
              <Ionicons name={faqExpanded ? 'chevron-up-outline' : 'chevron-down-outline'} size={24} color={appColors.textPrimary} />
            </TouchableOpacity>
            {faqExpanded && (
              <View style={styles.faqBody}>
                <Text style={styles.faqQuestion}>¿Qué es un Avance de Efectivo?</Text>
                <Text style={styles.faqAnswer}>
                  Es un préstamo de dinero en efectivo que puedes solicitar sobre tu línea de crédito disponible, con un plazo de pago definido.
                </Text>
                <Text style={styles.faqQuestion}>¿Cuál es la tasa de interés?</Text>
                <Text style={styles.faqAnswer}>
                  Aplicamos una tasa de interés del 4% sobre el monto solicitado.
                </Text>
                <Text style={styles.faqQuestion}>¿Cuándo debo pagar mi Avance?</Text>
                <Text style={styles.faqAnswer}>
                  El pago total del avance, incluyendo intereses, debe realizarse en la fecha indicada en el resumen de tu solicitud.
                </Text>
                <Text style={styles.faqQuestion}>¿Puedo pagar antes de la fecha de vencimiento?</Text>
                <Text style={styles.faqAnswer}>
                  Sí, puedes realizar el pago total o parcial de tu avance en cualquier momento antes de la fecha de vencimiento.
                </Text>
              </View>
            )}
          </View>

        </ScrollView>
      </SafeAreaView>

      {/* --- Modal - Formulario de Solicitud de Avance (PANTALLA COMPLETA) --- */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.fullScreenModalOverlay}> 
          <SafeAreaView style={styles.fullScreenModalSafeArea}> 
            <View style={styles.fullScreenModalContent}> 
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Solicitar Avance</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                  <Ionicons name="close-circle-outline" size={30} color={appColors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollContent}>
                <View style={styles.sectionContainer}>
                  {cuentasGuardadas.length > 0 ? (
                    <>
                      <Text style={styles.inputLabel}>Seleccionar cuenta validada:</Text>
                      <View style={styles.pickerWrapper}>
                        <Picker
                          selectedValue={cuentaSeleccionada ? cuentaSeleccionada.id : ''}
                          onValueChange={(itemValue) => {
                            const cuenta = cuentasGuardadas.find(c => c.id === itemValue);
                            setCuentaSeleccionada(cuenta);
                          }}
                          style={styles.pickerStyle}
                          itemStyle={styles.pickerItemStyle}
                        >
                          {cuentasGuardadas.map((cuenta) => (
                            <Picker.Item
                              key={cuenta.id}
                              label={`${cuenta.alias} (${cuenta.banco_nombre} - ${cuenta.telefono})`}
                              value={cuenta.id}
                            />
                          ))}
                        </Picker>
                      </View>
                      {cuentaSeleccionada && (
                        <View style={styles.accountDetails}>
                          <Text style={styles.detailText}>Alias: <Text style={styles.detailValue}>{cuentaSeleccionada.alias}</Text></Text>
                          <Text style={styles.detailText}>Teléfono: <Text style={styles.detailValue}>{cuentaSeleccionada.telefono}</Text></Text>
                          <Text style={styles.detailText}>Cédula: <Text style={styles.detailValue}>{cuentaSeleccionada.cedula}</Text></Text>
                          <Text style={styles.detailText}>Banco: <Text style={styles.detailValue}>{cuentaSeleccionada.banco_nombre}</Text></Text>
                        </View>
                      )}
                      <TouchableOpacity
                        style={[styles.secondaryButton, { marginTop: 15, alignSelf: 'center' }]}
                        onPress={() => setAddAccountModalVisible(true)}
                      >
                        <Ionicons name="add-circle-outline" size={24} color={appColors.white} />
                        <Text style={styles.secondaryButtonText}>Agregar Nueva Cuenta</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <View style={styles.noDataContainer}>
                      <Text style={styles.noDataText}>No hay cuentas validadas disponibles.</Text>
                      <TouchableOpacity
                        style={[styles.secondaryButton, { marginTop: 15, alignSelf: 'center' }]}
                        onPress={() => setAddAccountModalVisible(true)}
                      >
                        <Ionicons name="add-circle-outline" size={24} color={appColors.white} />
                        <Text style={styles.secondaryButtonText}>Agregar Primera Cuenta Validada</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                <Text style={styles.inputLabel}>Concepto del Avance</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Avance para gastos personales"
                  placeholderTextColor={appColors.textSecondary}
                  value={concepto}
                  onChangeText={setConcepto}
                />

                <Text style={styles.inputLabel}>Monto a Solicitar ($)</Text>
                <TextInput
                  placeholder="0.00"
                  placeholderTextColor={appColors.textSecondary}
                  value={monto}
                  onChangeText={handleMontoChange}
                  style={styles.input}
                  keyboardType="numeric"
                />

                <Text style={styles.inputLabel}>Número de Cuotas</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={numCuotasSolicitud}
                    onValueChange={(itemValue) => setNumCuotasSolicitud(itemValue)}
                    style={styles.pickerStyle}
                    itemStyle={styles.pickerItemStyle}
                  >
                    {cuotasOpciones.map((opcion, index) => (
                      <Picker.Item
                        key={index.toString()}
                        label={opcion.label}
                        value={opcion.value}
                      />
                    ))}
                  </Picker>
                </View>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={solicitarAvance}
                >
                  <Text style={styles.confirmButtonText}>Continuar</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      {/* --- Modal - Resumen de Solicitud --- */}
      <Modal visible={resumenVisible} transparent animationType="fade" onRequestClose={() => setResumenVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Resumen de Solicitud</Text>
            <TouchableOpacity onPress={() => setResumenVisible(false)} style={styles.closeButton}>
              <Ionicons name="close-circle-outline" size={30} color={appColors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Monto solicitado:</Text>
              <Text style={styles.summaryValue}>${parseFloat(monto.replace(",", ".")).toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Interés (4%):</Text>
              <Text style={styles.summaryValue}>${calcularInteres(monto)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total a pagar:</Text>
              <Text style={styles.summaryValue}>${calcularTotal(monto)}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Número de Cuotas:</Text>
              <Text style={styles.summaryValue}>{numCuotasSolicitud}</Text>
            </View>

            {pagosProgramados.length > 1 && ( 
                <View style={styles.paymentsBreakdownContainer}>
                    <Text style={styles.paymentsBreakdownTitle}>Detalle de Pagos:</Text>
                    {pagosProgramados.map((pago, index) => (
                        <View key={index} style={styles.paymentItem}>
                            <Text style={styles.paymentItemText}>Cuota {pago.cuotaNum}:</Text>
                            <Text style={styles.paymentItemText}>${pago.amount} ({pago.date})</Text>
                        </View>
                    ))}
                </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Fecha Límite de Pago:</Text>
              <Text style={styles.summaryValue}>{finalDueDate}</Text>
            </View>

            <Text style={styles.infoText}>
              Recuerde que el cálculo del pago móvil será en Bs a tasa del BCV del día.
            </Text>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={confirmarAvance}
              disabled={isConfirmingAdvance}
            >
              {isConfirmingAdvance ? (
                <ActivityIndicator color={appColors.white} />
              ) : (
                <Text style={styles.confirmButtonText}>Confirmar Avance</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelButton, { marginTop: 10 }]}
              onPress={() => setResumenVisible(false)}
              disabled={isConfirmingAdvance}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- Modal de Resultado Final (Éxito/Error) --- */}
      <Modal visible={resultModalVisible} transparent animationType="fade" onRequestClose={() => setResultModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: resultSuccess ? appColors.green : appColors.red }]}>
                {resultSuccess ? '¡Operación Exitosa!' : 'Error en la Operación'}
              </Text>
              <TouchableOpacity onPress={() => setResultModalVisible(false)} style={styles.closeButton}>
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
                onPress={() => {
                  setResultModalVisible(false);
                  // No navegamos automáticamente para que el usuario pueda ver el historial actualizado
                  // navigation.goBack(); 
                }}
            >
              <Text style={styles.modalActionButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- MODAL: Simulador de Cuotas --- */}
      <Modal
        visible={simuladorModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setSimuladorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Simulador de Avance</Text>
            <TouchableOpacity onPress={() => setSimuladorModalVisible(false)} style={styles.closeButton}>
              <Ionicons name="close-circle-outline" size={30} color={appColors.textSecondary} />
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Monto a Simular ($)</Text>
            <TextInput
              placeholder="0.00"
              placeholderTextColor={appColors.textSecondary}
              value={simuladorMonto}
              onChangeText={handleSimuladorMontoChange}
              style={styles.input}
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Número de Cuotas</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={simuladorCuotas}
                onValueChange={(itemValue) => setSimuladorCuotas(itemValue)}
                style={styles.pickerStyle}
                itemStyle={styles.pickerItemStyle}
              >
                {cuotasOpciones.map((opcion, index) => (
                  <Picker.Item
                    key={index.toString()}
                    label={opcion.label}
                    value={opcion.value}
                  />
                ))}
              </Picker>
            </View>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={calcularCuotasSimuladas}
            >
              <Text style={styles.confirmButtonText}>Calcular</Text>
            </TouchableOpacity>

            {resultadoSimulacion && (
              <View style={styles.simulationResultContainer}>
                <Text style={styles.simulationResultTitle}>Resultado de la Simulación:</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Monto Simulado:</Text>
                  <Text style={styles.summaryValue}>${resultadoSimulacion.montoSimulado}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Interés Total (4%):</Text>
                  <Text style={styles.summaryValue}>${resultadoSimulacion.interesTotal}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total a Pagar:</Text>
                  <Text style={styles.summaryValue}>${resultadoSimulacion.totalPagar}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Pago Mensual ({resultadoSimulacion.cuotas} cuotas):</Text>
                  <Text style={styles.summaryValue}>${resultadoSimulacion.pagoMensual}</Text>
                </View>
                <Text style={styles.infoText}>
                  Este es un cálculo estimado. Las condiciones finales pueden variar.
                </Text>
              </View>
            )}
            
            <TouchableOpacity
              style={[styles.cancelButton, { marginTop: 15 }]}
              onPress={() => setSimuladorModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- NUEVO MODAL: No Avance de Efectivo Disponible --- */}
      <Modal
        visible={showNoAdvanceModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowNoAdvanceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: appColors.red }]}>
                ¡Atención!
              </Text>
              <TouchableOpacity onPress={() => setShowNoAdvanceModal(false)} style={styles.closeButton}>
                <Ionicons name="close-circle-outline" size={30} color={appColors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Ionicons 
                name="information-circle-outline" 
                size={80} 
                color={appColors.red} 
                style={styles.modalIcon} 
              />
              <Text style={styles.modalMessage}>
                Actualmente no posees un saldo de avance de efectivo disponible.
                El monto mínimo para solicitar un avance es de $5.00.
                Por favor, contacta a soporte para más información sobre tu línea de crédito.
              </Text>
            </View>

            <TouchableOpacity 
                style={[styles.modalActionButton, { backgroundColor: appColors.primary }]} 
                onPress={() => setShowNoAdvanceModal(false)}
            >
              <Text style={styles.modalActionButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- NUEVO MODAL: No hay Bancos Validados --- */}
      <Modal
        visible={showNoValidatedBankModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowNoValidatedBankModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: appColors.red }]}>
                ¡Cuentas Bancarias Requeridas!
              </Text>
              <TouchableOpacity onPress={() => setShowNoValidatedBankModal(false)} style={styles.closeButton}>
                <Ionicons name="close-circle-outline" size={30} color={appColors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Ionicons 
                name="warning-outline" 
                size={80} 
                color={appColors.red} 
                style={styles.modalIcon} 
              />
              <Text style={styles.modalMessage}>
                Para solicitar un avance de efectivo, debes tener al menos una cuenta bancaria validada.
                Por favor, ingresa y valida tus cuentas en el **Módulo de Perfil**.
              </Text>
            </View>

            <TouchableOpacity 
                style={[styles.modalActionButton, { backgroundColor: appColors.primary }]} 
                onPress={() => {
                  setShowNoValidatedBankModal(false);
                  // Opcional: Navegar al módulo de perfil si existe una ruta definida
                  // navigation.navigate('ProfileModule'); 
                }}
            >
              <Text style={styles.modalActionButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- MODAL: Añadir Nueva Cuenta --- */}
      <Modal
        visible={addAccountModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAddAccountModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar Nueva Cuenta</Text>
            <TouchableOpacity onPress={() => setAddAccountModalVisible(false)} style={styles.closeButton}>
              <Ionicons name="close-circle-outline" size={30} color={appColors.textSecondary} />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Alias de la Cuenta</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Mi Cuenta Principal"
                placeholderTextColor={appColors.textSecondary}
                value={newAccountAlias}
                onChangeText={setNewAccountAlias}
              />

              <Text style={styles.inputLabel}>Número de Teléfono</Text>
              <View style={styles.rowInputContainer}>
                <View style={styles.pickerWrapperSmall}>
                  <RNPickerSelect
                    onValueChange={(value) => setNewAccountPhonePrefix(value)}
                    items={telefonoPrefixos}
                    style={pickerSelectStyles}
                    value={newAccountPhonePrefix}
                    useNativeAndroidPickerStyle={false}
                    placeholder={{ label: "Prefijo", value: null, color: appColors.textSecondary }}
                  />
                </View>
                <TextInput
                  style={styles.inputFlex}
                  placeholder="Número de celular (7 dígitos)"
                  placeholderTextColor={appColors.textSecondary}
                  keyboardType="numeric"
                  maxLength={7}
                  value={newAccountPhone}
                  onChangeText={setNewAccountPhone}
                />
              </View>

              <Text style={styles.inputLabel}>Cédula/Identidad</Text>
              <View style={styles.rowInputContainer}>
                <View style={styles.pickerWrapperSmall}>
                  <RNPickerSelect
                    onValueChange={(value) => setNewAccountCedulaPrefix(value)}
                    items={cedulaPrefixos}
                    style={pickerSelectStyles}
                    value={newAccountCedulaPrefix}
                    useNativeAndroidPickerStyle={false}
                    placeholder={{ label: "Prefijo", value: null, color: appColors.textSecondary }}
                  />
                </View>
                <TextInput
                  style={styles.inputFlex}
                  placeholder="Número de cédula/RIF"
                  placeholderTextColor={appColors.textSecondary}
                  keyboardType="numeric"
                  maxLength={10}
                  value={newAccountCedula}
                  onChangeText={setNewAccountCedula}
                />
              </View>

              <Text style={styles.inputLabel}>Banco</Text>
              <View style={styles.pickerWrapper}>
                <RNPickerSelect
                  onValueChange={(value) => setNewAccountBank(value)}
                  items={bancosDisponibles.map((item) => ({
                    label: `${item.ban_codigo} - ${item.Ban_nombre}`,
                    value: item.ban_codigo,
                  }))}
                  placeholder={{
                    label: "Seleccione un banco",
                    value: null,
                    color: appColors.textSecondary,
                  }}
                  style={pickerSelectStyles}
                  useNativeAndroidPickerStyle={false}
                />
              </View>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleAddAccount}
              >
                <Text style={styles.confirmButtonText}>Guardar Cuenta</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cancelButton, { marginTop: 10 }]}
                onPress={() => setAddAccountModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- ELIMINADO: Modal de Pagar Cuota directa, ahora se usa SelectInstallmentPaymentMethodScreen --- */}
      {/* <Modal
        visible={payInstallmentModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setPayInstallmentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirmar Pago de Cuota</Text>
              <TouchableOpacity onPress={() => setPayInstallmentModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close-circle-outline" size={30} color={appColors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            {selectedInstallmentToPay && (
              <View style={styles.modalBody}>
                <Text style={styles.modalMessage}>
                  Estás a punto de pagar la Cuota #{selectedInstallmentToPay.installment_number}
                  del Avance #{selectedInstallmentToPay.advance_request_id}.
                </Text>
                <Text style={styles.modalMessage}>
                  Monto a pagar: <Text style={styles.modalHighlightText}>
                    ${parseFloat(selectedInstallmentToPay.payment_amount || 0).toFixed(2)}
                  </Text>
                </Text>
                <Text style={styles.modalMessage}>
                  Fecha de Vencimiento: {new Date(selectedInstallmentToPay.due_date).toLocaleDateString()}
                </Text>
                <Text style={styles.modalMessage}>
                  Tu saldo actual de billetera: <Text style={styles.modalHighlightText}>
                    ${parseFloat(userWalletBalance || '0').toFixed(2)}
                  </Text>
                </Text>
              </View>
            )}

            <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={confirmPayInstallment}
                disabled={isProcessingInstallmentPayment}
            >
              {isProcessingInstallmentPayment ? (
                  <ActivityIndicator color={appColors.white} />
              ) : (
                  <Text style={styles.confirmButtonText}>Confirmar Pago</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelButton, { marginTop: 10 }]}
              onPress={() => setPayInstallmentModalVisible(false)}
              disabled={isProcessingInstallmentPayment}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal> */}
    </LinearGradient>
  );
};

// --- Estilos de la Pantalla AvanceEfectivoScreen ---
const styles = StyleSheet.create({
  // Estilos del encabezado y títulos de la pantalla
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
    fontSize: 24,
    fontWeight: 'bold',
    color: appColors.white,
    textAlign: 'center',
    marginBottom: 5, 
    paddingHorizontal: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 17, 
    color: appColors.textSecondary,
    textAlign: 'center',
    marginBottom: 20, 
    paddingHorizontal: 20,
  },

  // Estilos de la tarjeta de saldo de crédito
  balanceCard: {
    backgroundColor: appColors.cardBackground,
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 25, 
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

  // Estilos de los botones principales (Solicitar Avance, Ver Historial, Pagar Cuotas)
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginBottom: 20,
    flexWrap: 'wrap', // Permite que los botones se envuelvan si no caben en una fila
  },
  mainButton: {
    backgroundColor: appColors.primary, // Ahora todos son primary (azul)
    width: '45%', // Ajustado para 3 botones en una fila si es posible, o 2 por fila
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginBottom: 10, // Espacio entre las filas de botones
    marginHorizontal: '2%', // Espacio entre botones
  },
  mainButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: appColors.white, // Texto blanco para todos los botones principales
    marginTop: 8,
    textAlign: 'center',
  },

  // Estilos del contenedor y elementos del historial de movimientos
  historyContainer: {
    backgroundColor: appColors.cardBackground,
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 15,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    marginBottom: 25, 
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: appColors.textPrimary,
    marginBottom: 15,
    textAlign: 'center',
  },
  movimientosListContent: {
    paddingBottom: 10,
  },
  movimientoItem: {
    backgroundColor: appColors.background,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: appColors.lightGray,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  movimientoDetalle: {
    marginBottom: 10,
  },
  movimientoDescripcion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: appColors.textPrimary,
    marginBottom: 5,
  },
  movimientoFecha: {
    fontSize: 13,
    color: appColors.textSecondary,
    marginBottom: 2,
  },
  movimientoBanco: {
    fontSize: 13,
    color: appColors.textSecondary,
    marginBottom: 2,
  },
  movimientoMontoContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Alinea el estado a la derecha
    alignItems: 'center',
    marginTop: 5,
  },
  movimientoMonto: {
    fontSize: 16,
    fontWeight: 'bold',
    // color se define condicionalmente en el render
  },
  movimientoIcon: { // Este icono ya no se usa directamente en el nuevo renderMovimiento, pero se mantiene el estilo
    marginLeft: 5,
  },
  noHistoryText: {
    fontSize: 15,
    color: appColors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },

  // Estilos generales de los modales (para centrado y overlay)
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: appColors.cardBackground,
    width: '90%',
    padding: 25,
    borderRadius: 20,
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: appColors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 1,
    padding: 5,
  },
  inputLabel: {
    fontSize: 15,
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
  cancelButton: {
    backgroundColor: appColors.textSecondary,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: appColors.white,
    fontWeight: 'bold',
    fontSize: 18,
  },

  // Estilos para el toggle de "Usar Cuenta Guardada" (ahora solo un label informativo)
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingVertical: 10,
    backgroundColor: appColors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: appColors.lightGray,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: appColors.textPrimary,
    marginRight: 10,
  },
  toggleButton: { // Se mantiene para consistencia, aunque ya no es un toggle funcional
    padding: 5,
  },

  // Estilos para secciones dentro de los modales
  sectionContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: appColors.background,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: appColors.lightGray,
  },
  noDataContainer: { 
    alignItems: 'center',
    paddingVertical: 10,
  },
  noDataText: {
    fontSize: 15,
    color: appColors.textSecondary,
    textAlign: 'center',
    paddingVertical: 10,
  },
  accountDetails: {
    marginTop: 10,
    padding: 10,
    backgroundColor: appColors.cardBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: appColors.lightGray,
  },
  detailText: {
    fontSize: 15,
    color: appColors.textPrimary,
    marginBottom: 5,
  },
  detailValue: {
    fontWeight: 'bold',
    color: appColors.primary,
  },

  // Estilos para inputs y pickers en fila
  rowInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: appColors.lightGray,
    borderRadius: 12,
    backgroundColor: appColors.background,
    marginBottom: 15,
    overflow: 'hidden',
  },
  pickerWrapperSmall: {
    width: '35%',
    marginRight: 10,
    borderWidth: 1,
    borderColor: appColors.lightGray,
    borderRadius: 12,
    backgroundColor: appColors.background,
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

  // Estilos para el resumen de la solicitud
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: appColors.textPrimary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: appColors.primary,
  },
  infoText: {
    fontSize: 14,
    color: appColors.textSecondary,
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 20,
  },

  // Estilos para el modal de resultado final (éxito/error)
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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

  // --- NUEVOS ESTILOS PARA MEJORAS DE UX ---
  sectionCard: {
    backgroundColor: appColors.cardBackground,
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 25, 
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: appColors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  sectionDescription: {
    fontSize: 15,
    color: appColors.textSecondary,
    textAlign: 'center',
    marginBottom: 15,
  },
  secondaryButton: {
    backgroundColor: appColors.secondary, 
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: appColors.white,
    marginLeft: 8,
  },
  deleteButton: { 
    backgroundColor: appColors.red, 
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: appColors.white,
    marginLeft: 8,
  },
  simulationResultContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: appColors.background,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: appColors.lightGray,
  },
  simulationResultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: appColors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  // Estilos para la sección de FAQ
  faqContainer: {
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
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    backgroundColor: appColors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  faqTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: appColors.textPrimary,
  },
  faqBody: {
    padding: 18,
    backgroundColor: appColors.background,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: appColors.textPrimary,
    marginBottom: 8,
    marginTop: 10,
  },
  faqAnswer: {
    fontSize: 14,
    color: appColors.textSecondary,
    marginBottom: 10,
    lineHeight: 20,
  },
  // --- NUEVOS ESTILOS PARA MODAL DE SOLICITUD PANTALLA COMPLETA ---
  fullScreenModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', 
  },
  fullScreenModalSafeArea: {
    flex: 1,
  },
  fullScreenModalContent: {
    flex: 1,
    backgroundColor: appColors.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 25, 
    paddingTop: 20,
    paddingBottom: 20,
    marginTop: 50, 
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  modalScrollContent: {
    paddingBottom: 20, 
  },
  // Estilos para el desglose de pagos en el resumen
  paymentsBreakdownContainer: {
    marginTop: 20,
    marginBottom: 15,
    padding: 15,
    backgroundColor: appColors.background,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: appColors.lightGray,
  },
  paymentsBreakdownTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: appColors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: appColors.lightGray,
  },
  paymentItemText: {
    fontSize: 15,
    color: appColors.textPrimary,
  },
  // Nuevos estilos para el historial de movimientos
  installmentsContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: appColors.lightGray,
  },
  installmentsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: appColors.textPrimary,
    marginBottom: 5,
  },
  installmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Alinea verticalmente los elementos en la fila
    paddingVertical: 3,
  },
  installmentText: {
    fontSize: 13,
    color: appColors.textSecondary,
  },
  payInstallmentButton: {
    backgroundColor: appColors.secondary, // Un color que resalte para el botón de pago
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginLeft: 10, // Espacio entre el texto y el botón
  },
  payInstallmentButtonText: {
    color: appColors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  payInstallmentButtonLarge: { // Nuevo estilo para el botón de pagar cuota en la sección agregada
    backgroundColor: appColors.primary, // Ahora es azul
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 10,
  },
  modalHighlightText: { // Estilo para resaltar texto en los modales
    fontWeight: 'bold',
    color: appColors.primary, // Ahora es azul
  },
});

// --- Estilos específicos para RNPickerSelect (necesarios para iOS y Android) ---
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: appColors.textPrimary,
    paddingRight: 30, 
    height: 50,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: appColors.textPrimary,
    paddingRight: 30,
    height: 50,
  },
  placeholder: {
    color: appColors.textSecondary,
    fontSize: 16,
  },
  iconContainer: {
    top: 10,
    right: 12,
  },
});

export default AvanceEfectivoScreen;
