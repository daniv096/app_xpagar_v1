import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker'; // <-- Importamos el componente DropDownPicker

// Importa los estilos compartidos
import { appStyles, appColors } from '../constants/appStyles'; 

// Datos ficticios de facturas para simulación
const FACTURAS_FANTASMA = {
  'V14016391': {
    contrato: 'K17000307881',
    medidor: 'PSTE 84DK0249',
    monto: 'Bs. 5.000,00',
    deuda: 5000, // Monto numérico para lógica
  },
  'V12345678': {
    contrato: 'K19000554321',
    medidor: 'PSTE 99LM0123',
    monto: 'Bs. 8.250,50',
    deuda: 8250.50,
  },
  'J20000001': {
    contrato: 'K20000112233',
    medidor: 'PSTE 77AB4567',
    monto: 'Bs. 1.200,00',
    deuda: 1200,
  }
};

const CorpoelecScreen = () => {
  const navigation = useNavigation();
  const [cedula, setCedula] = useState('');
  const [facturaData, setFacturaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [isPayButtonEnabled, setIsPayButtonEnabled] = useState(false);
  
  // Estados para el DropDownPicker
  const [open, setOpen] = useState(false);
  const [tipoCedula, setTipoCedula] = useState('V');
  const [items, setItems] = useState([
    {label: 'V', value: 'V'},
    {label: 'J', value: 'J'},
    {label: 'C', value: 'C'},
    {label: 'G', value: 'G'},
    {label: 'E', value: 'E'},
    {label: 'P', value: 'P'},
  ]);

  // Simula la búsqueda de datos de la factura
  const buscarFactura = () => {
    // Validar que el campo no esté vacío
    if (!cedula.trim()) {
      setFacturaData(null);
      setHasData(false);
      return;
    }
    
    setLoading(true);
    setFacturaData(null);
    setHasData(false);

    // Simular un retraso en la red
    setTimeout(() => {
      const fullCedula = `${tipoCedula}${cedula.trim()}`;
      const data = FACTURAS_FANTASMA[fullCedula];
      
      if (data) {
        setFacturaData(data);
        setHasData(true);
      } else {
        // En caso de que no se encuentre la cédula
        setFacturaData({
          contrato: 'No encontrado',
          medidor: 'No encontrado',
          monto: 'No hay deuda',
          deuda: 0,
        });
        setHasData(false);
      }
      setLoading(false);
    }, 1500); // 1.5 segundos de carga simulada
  };

  // Habilita el botón de pago si hay datos y la casilla está marcada (simulado)
  useEffect(() => {
    // El botón se activa si hay datos de factura y el monto es mayor a 0
    setIsPayButtonEnabled(hasData && facturaData?.deuda > 0);
  }, [hasData, facturaData]);

  // Manejador del botón de pago
  const handlePay = () => {
    if (isPayButtonEnabled) {
      alert(`Pago de ${facturaData.monto} procesado. ¡Gracias!`);
      // Aquí iría la lógica real de pago
      // Reiniciar el estado después del pago
      setCedula('');
      setFacturaData(null);
      setHasData(false);
      setIsPayButtonEnabled(false);
    }
  };

  return (
    <LinearGradient
      colors={[appColors.gradientStart, appColors.gradientEnd]}
      style={styles.container}
    >
      <StatusBar translucent barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Botón de retroceso en la esquina superior izquierda */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={30} color={appColors.white} />
        </TouchableOpacity>
        
        <ScrollView contentContainerStyle={styles.scrollViewContent}>

          {/* Título y Logo CENTRADOS y más grandes/pequeños */}
          <View style={styles.header}>
            <Image
              source={require('../assets/corpoelec_logo.png')} // Asegúrate de tener esta imagen en assets
              style={styles.serviceLogo}
            />
            <Text style={styles.headerTitle}>Pagar Servicio Eléctrico</Text>
          </View>

          {/* Recuadro de entrada de datos */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Número de Identificación</Text>
            <View style={styles.cedulaInputContainer}>
              {/* DropDownPicker para la lista desplegable */}
              <DropDownPicker
                open={open}
                value={tipoCedula}
                items={items}
                setOpen={setOpen}
                setValue={setTipoCedula}
                setItems={setItems}
                containerStyle={styles.dropdownContainer}
                style={styles.dropdownStyle}
                dropDownContainerStyle={styles.dropdownListStyle}
                textStyle={styles.dropdownText}
                labelStyle={styles.dropdownLabel}
                selectedItemLabelStyle={styles.dropdownSelectedLabel}
                tickIconStyle={{ tintColor: appColors.primary }}
              />
              {/* Campo de texto para el número de identificación */}
              <TextInput
                style={styles.cedulaInput}
                placeholder="Número de Cédula"
                placeholderTextColor={appColors.textSecondary}
                keyboardType="numeric"
                value={cedula}
                onChangeText={setCedula}
                onBlur={buscarFactura}
                returnKeyType="search"
                onSubmitEditing={buscarFactura}
              />
            </View>
            <TouchableOpacity style={styles.searchButton} onPress={buscarFactura}>
              <Ionicons name="search" size={20} color={appColors.white} />
              <Text style={styles.searchButtonText}>Buscar</Text>
            </TouchableOpacity>
          </View>

          {/* Recuadro de datos de la factura */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={appColors.white} />
              <Text style={styles.loadingText}>Buscando...</Text>
            </View>
          ) : facturaData ? (
            <View style={styles.facturaCard}>
              <Text style={styles.facturaTitle}>Detalles de la Factura</Text>
              <View style={styles.facturaRow}>
                <Text style={styles.facturaLabel}>Contrato:</Text>
                <Text style={styles.facturaValue}>{facturaData.contrato}</Text>
              </View>
              <View style={styles.facturaRow}>
                <Text style={styles.facturaLabel}>Nro. Medidor:</Text>
                <Text style={styles.facturaValue}>{facturaData.medidor}</Text>
              </View>
              <View style={styles.facturaMontoContainer}>
                <Text style={styles.montoLabel}>Monto a Pagar:</Text>
                <Text style={styles.montoValue}>{facturaData.monto}</Text>
              </View>
              
              {/* Checkbox para activar el botón de pago (simulado) */}
              {facturaData.deuda > 0 && (
                <TouchableOpacity 
                  style={styles.checkboxContainer} 
                  onPress={() => setIsPayButtonEnabled(!isPayButtonEnabled)}
                >
                  <Ionicons 
                    name={isPayButtonEnabled ? "checkmark-circle" : "ellipse-outline"} 
                    size={24} 
                    color={isPayButtonEnabled ? appColors.green : appColors.textSecondary}
                  />
                  <Text style={styles.checkboxLabel}>Marcar para el pago</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>Ingresa tu número de identificación para buscar la factura.</Text>
            </View>
          )}

        </ScrollView>
      </SafeAreaView>

      {/* Botón de pagar flotante y fijo en la parte inferior */}
      <TouchableOpacity
        style={[styles.payButton, isPayButtonEnabled ? styles.payButtonActive : styles.payButtonDisabled]}
        onPress={handlePay}
        disabled={!isPayButtonEnabled}
      >
        <Ionicons name="cash-outline" size={20} color={appColors.white} />
        <Text style={styles.payButtonText}>Pagar</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
    facturaCard: {
    backgroundColor: appColors.cardBackground,
    borderRadius: 20,
    padding: 15,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  facturaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: appColors.primary,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: appColors.background,
    paddingBottom: 8,
  },
  facturaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  facturaLabel: {
    fontSize: 15,
    color: appColors.textSecondary,
    fontWeight: '600',
  },
  facturaValue: {
    fontSize: 15,
    color: appColors.textPrimary,
    fontWeight: 'bold',
    flexShrink: 1,
    textAlign: 'right',
  },
  facturaMontoContainer: {
    alignItems: 'center',
    marginTop: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: appColors.background,
  },
  montoLabel: {
    fontSize: 16,
    color: appColors.textSecondary,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  montoValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: appColors.red,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
    marginLeft: 10,
    color: appColors.textPrimary,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    minHeight: 200,
  },
  noDataText: {
    fontSize: 16,
        color: appColors.white,
    textAlign: 'center',
    opacity: 0.8,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 25,
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  payButtonActive: {
    backgroundColor: appColors.secondary, // <-- CAMBIO DE VERDE A AZUL
  },
  payButtonDisabled: {
    backgroundColor: appColors.textSecondary,
    opacity: 0.6,
  },
  payButtonText: {
    color: appColors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  safeArea: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    padding: 5,
    borderRadius: 20,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 120, // Espacio para el botón de pago
    flexGrow: 1,
  },
  // --- Estilos para el Encabezado (Logo y Título Centrados) ---
  header: {
    alignItems: 'center', // Centra horizontalmente los elementos
    marginBottom: 30,
    marginTop: 20,
  },
  serviceLogo: {
    width: 120, // <-- Hacemos el logo más grande
    height: 120, // <-- Hacemos el logo más grande
    resizeMode: 'contain',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22, // <-- Hacemos el título más pequeño
    fontWeight: 'bold',
    color: appColors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    textAlign: 'center', // <-- Aseguramos que el texto esté centrado
  },
  inputCard: {
    backgroundColor: appColors.cardBackground,
    borderRadius: 20,
    padding: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginBottom: 20,
    zIndex: 10, // Asegura que el DropDownPicker se muestre encima de otros elementos
  },
  inputLabel: {
    fontSize: 16,
    color: appColors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cedulaInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  // --- Estilos para el DropDownPicker (lista desplegable) ---
  dropdownContainer: {
    width: 80, // Ancho del picker
    marginRight: 10,
    zIndex: 1000, // Asegura que se muestre sobre todo
  },
  dropdownStyle: {
    backgroundColor: appColors.background,
    borderColor: 'transparent', // Sin borde visible
    borderRadius: 12,
    height: 50,
  },
  dropdownListStyle: {
    backgroundColor: appColors.background,
    borderColor: appColors.primary,
    borderRadius: 12,
  },
  dropdownText: {
    fontSize: 18,
    color: appColors.textPrimary,
  },
  dropdownLabel: {
    color: appColors.textPrimary,
  },
  dropdownSelectedLabel: {
    color: appColors.primary,
    fontWeight: 'bold',
  },
  cedulaInput: {
    flex: 1,
    height: 50,
    backgroundColor: appColors.background,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 18,
    color: appColors.textPrimary,
  },
  searchButton: {
    backgroundColor: appColors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 15,
    elevation: 3,
  },
  searchButtonText: {
    color: appColors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 40,
    minHeight: 200,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: appColors.white,
  },
  facturaCard: {
    backgroundColor: appColors.cardBackground,
    borderRadius: 20,
    padding: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  facturaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: appColors.primary,
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: appColors.background,
    paddingBottom: 10,
  },
  facturaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  facturaLabel: {
    fontSize: 16,
    color: appColors.textSecondary,
    fontWeight: '600',
  },
  facturaValue: {
    fontSize: 16,
    color: appColors.textPrimary,
    fontWeight: 'bold',
    flexShrink: 1,
    textAlign: 'right',
  },
  facturaMontoContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: appColors.background,
  },
  montoLabel: {
    fontSize: 18,
    color: appColors.textSecondary,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  montoValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: appColors.red,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontSize: 14, // <-- Etiqueta más pequeña
    marginLeft: 10,
    color: appColors.textPrimary,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    minHeight: 200,
  },
  noDataText: {
    fontSize: 16,
    color: appColors.white,
    textAlign: 'center',
    opacity: 0.8,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12, // <-- Reducimos el relleno para hacerlo más pequeño
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 25,
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  payButtonActive: {
    backgroundColor: appColors.green,
  },
  payButtonDisabled: {
    backgroundColor: appColors.textSecondary,
    opacity: 0.6,
  },
  payButtonText: {
    color: appColors.white,
    fontSize: 16, // <-- Reducimos el tamaño de la fuente de "Pagar"
    fontWeight: 'bold',
    marginLeft: 8, // <-- Reducimos el margen
  },
});

export default CorpoelecScreen;