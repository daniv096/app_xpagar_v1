import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ScrollView,
  StatusBar,
  Image,
  ActivityIndicator, 
  Alert, 
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native'; 
import { jwtDecode } from 'jwt-decode'; 
import { API_URL } from '@env'; 

// Para depuración: Verifica el valor de API_URL al inicio
console.log('BilleteraScreen - API_URL desde @env:', API_URL);

import { appStyles, appColors } from '../constants/appStyles'; 

const BilleteraScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [accion, setAccion] = useState("");
  const [monto, setMonto] = useState("");
  const [exitoVisible, setExitoVisible] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const navigation = useNavigation();
  const route = useRoute(); 

  const [userData, setUserData] = useState(null);
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [userError, setUserError] = useState(null);
  const [walletHistory, setWalletHistory] = useState([]); 
  const [loadingHistory, setLoadingHistory] = useState(true); 

  const { token } = route.params || {}; 
  let userId = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.id;
    } catch (e) {
      console.error('Token inválido o malformado en BilleteraScreen', e);
    }
  }
  
  const fetchUserData = async () => {
    try {
      setLoadingUserData(true);
      setUserError(null);
      if (!userId) {
        throw new Error('ID de usuario no disponible.');
      }
      // Asegúrate de que API_URL esté definido antes de usarlo
      if (!API_URL) {
        throw new Error('API_URL no está definida. Revisa tu archivo .env y la configuración de Babel.');
      }

      const response = await fetch(`${API_URL}/api/getUsuarioDetalle/${userId}`);
      const data = await response.json();

      if (data && Object.keys(data).length > 0) {
        setUserData(data);
        console.log('✅ Datos de usuario cargados correctamente en BilleteraScreen:', data);
      } else {
        console.warn('⚠️ El backend devolvió un objeto vacío o nulo para el usuario en BilleteraScreen.');
        setUserError('No se encontraron datos de usuario.');
      }
    } catch (error) {
      console.error('❌ Error al obtener los datos del usuario en BilleteraScreen:', error);
      setUserError('Error al cargar los datos del perfil. Intenta de nuevo: ' + error.message);
      Alert.alert('Error', 'No se pudieron cargar tus datos de usuario. Revisa tu conexión o la configuración de API_URL.');
    } finally {
      setLoadingUserData(false);
    }
  };

  const fetchWalletHistory = async () => {
    try {
      setLoadingHistory(true);
      if (!userId) {
        console.warn('No hay ID de usuario para cargar el historial de la billetera.');
        setWalletHistory([]); 
        return;
      }
      // Asegúrate de que API_URL esté definido antes de usarlo
      if (!API_URL) {
        throw new Error('API_URL no está definida. Revisa tu archivo .env y la configuración de Babel.');
      }
      const response = await fetch(`${API_URL}/api/xp/walletHistory/${userId}`);
      if (!response.ok) {
        throw new Error('No se pudo obtener el historial de la billetera.');
      }
      const data = await response.json();
      setWalletHistory(data);
    } catch (error) {
      console.error('Error al obtener el historial de la billetera:', error);
      Alert.alert('Error', 'No se pudo cargar el historial de la billetera: ' + error.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        fetchUserData();
        fetchWalletHistory(); 
        
      } else {
        setLoadingUserData(false);
        setLoadingHistory(false);
        setUserError('No se pudo obtener el ID de usuario para cargar los datos.');
      }
    }, [userId]) 
  );

  const [services, setServices] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [selectedService, setSelectedService] = useState(null); 
  const [providersModalVisible, setProvidersModalVisible] = useState(false); 
  
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        // Asegúrate de que API_URL esté definido antes de usarlo
        if (!API_URL) {
          throw new Error('API_URL no está definida. Revisa tu archivo .env y la configuración de Babel.');
        }
        const response = await fetch(`${API_URL}/api/xp/services`); 

        if (!response.ok) {
          throw new Error('No se pudieron obtener los servicios');
        }

        const data = await response.json();
        
        const formattedServices = data.map(service => {
            let iconName;
            let color;
            switch (service.slug) {
                case 'luz':
                    iconName = 'flash';
                    color = '#FFEB3B';
                    break;
                case 'agua':
                    iconName = 'water';
                    color = '#2196F3';
                    break;
                case 'internet':
                    iconName = 'wifi';
                    color = '#00BCD4';
                    break;
                case 'telefono':
                    iconName = 'phone-in-talk';
                    color = '#4CAF50';
                    break;
                case 'gas':
                    iconName = 'fire';
                    color = '#FF5722';
                    break;
                case 'tv':
                    iconName = 'television';
                    color = '#9C27B0';
                    break;
                default:
                    iconName = 'help-circle-outline'; 
                    color = '#78909C';
            }
            return {
                ...service,
                icon: iconName,
                color: color,
            };
        });

        setServices(formattedServices);
        setError(null); 
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('No se pudo cargar la lista de servicios. Intenta de nuevo más tarde: ' + err.message);
        Alert.alert('Error de conexión', 'No se pudo conectar con el servidor para obtener los servicios. Revisa tu conexión o el estado del backend, y asegúrate de que API_URL esté definida.');
      } finally {
        setIsLoading(false); 
      }
    };

    fetchServices();
  }, [API_URL]); // <--- API_URL añadido a las dependencias
  
  const handleServicePress = (service) => {
    if (!service.providers || service.providers.length === 0) {
        Alert.alert("Próximamente", `El servicio de ${service.name} aún no tiene proveedores disponibles.`);
        return;
    }
    setSelectedService(service);
    setProvidersModalVisible(true);
  };

  const handleProviderPress = (provider) => {
    setProvidersModalVisible(false);
    
    const screenMapping = {
        'corpoelec': 'CorpoelecScreen',
        'cantv': 'TelefonoPaymentScreen', 
        'movistar': 'TelefonoPaymentScreen', 
        'movilnet': 'TelefonoPaymentScreen', 
        'digitel': 'TelefonoPaymentScreen', 
    };

    const screenName = screenMapping[provider.slug];

    if (screenName) {
        navigation.navigate(screenName, { 
            providerData: provider,
            userWalletBalance: userData?.MIC_CREBIL, 
            userId: userId 
        }); 
    } else {
        Alert.alert("Próximamente", `La pantalla de pago para ${provider.name} aún no está disponible.`);
    }
  };

  const abrirModal = (tipoAccion) => {
    setAccion(tipoAccion);
    setMonto("");
    setModalVisible(true);
  };

  const confirmarAccion = () => {
    setModalVisible(false);
    setExitoVisible(true);
    setTimeout(() => {
      setExitoVisible(false);
    }, 1500);
  };

  const renderMovimiento = ({ item }) => {
    const esPositivo = item.amount >= 0; 
    const formattedAmount = `${esPositivo ? '+' : '-'}$${Math.abs(item.amount).toFixed(2)}`;
    const descriptionText = item.description || 'Movimiento desconocido';
    const dateText = item.date ? new Date(item.date).toLocaleDateString() : 'Fecha desconocida';

    return (
      <View style={billeteraStyles.movimientoCard}>
        <View style={billeteraStyles.movimientoIcono}>
          <Ionicons
            name={esPositivo ? "arrow-up-circle-outline" : "arrow-down-circle-outline"}
            size={28}
            color={esPositivo ? appColors.green : appColors.red}
          />
        </View>
        <View style={billeteraStyles.movimientoDetalle}>
          <Text style={billeteraStyles.movimientoDescripcion}>{descriptionText}</Text>
          <Text style={billeteraStyles.movimientoFecha}>{dateText}</Text>
        </View>
        <Text
          style={[
            billeteraStyles.movimientoMonto,
            { color: esPositivo ? appColors.green : appColors.red }, // Lógica de color ya implementada
          ]}
        >
          {formattedAmount}
        </Text>
      </View>
    );
  };

  if (loadingUserData) {
    return (
      <LinearGradient colors={[appColors.gradientStart, appColors.gradientEnd]} style={appStyles.loadingContainer}>
        <ActivityIndicator size="large" color={appColors.white} />
        <Text style={appStyles.loadingText}>Cargando datos de billetera...</Text>
      </LinearGradient>
    );
  }

  if (userError) {
    return (
      <LinearGradient colors={[appColors.gradientStart, appColors.gradientEnd]} style={appStyles.errorContainer}>
        <Text style={appStyles.errorText}>{userError}</Text>
        <TouchableOpacity onPress={fetchUserData} style={appStyles.retryButton}>
          <Text style={appStyles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const userFullName = `${userData?.REG_NOMBRE || ''} ${userData?.REG_APELLIDO || ''}`;
  const walletBalance = userData?.MIC_CREBIL != null ? parseFloat(userData.MIC_CREBIL).toFixed(2) : '0.00';

  return (
    <LinearGradient
      colors={[appColors.gradientStart, appColors.gradientEnd]}
      style={billeteraStyles.container}
    >
      <StatusBar
        backgroundColor="transparent"
        translucent
        barStyle="light-content"
      />

      <SafeAreaView style={billeteraStyles.safeArea} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={billeteraStyles.scrollViewContent}>

          {/* Tarjeta de Crédito Reutilizada */}
          <View style={appStyles.cardContainer}>
            <LinearGradient
              colors={[appColors.gold, appColors.darkGold]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={appStyles.creditCard}
            >
              <Image
                source={require('../assets/logo.png')}
                style={appStyles.logo}
              />
              <View>
                <Text style={appStyles.cardTitle}>Saldo de Billetera</Text>
              </View>
              <Text style={appStyles.cardAmount}>${walletBalance}</Text>
              <Text style={appStyles.cardNumber}>**** **** **** 1234</Text>
              <View style={appStyles.cardDetails}>
                <View>
                  <Text style={appStyles.cardLabel}>Titular</Text>
                  <Text style={appStyles.cardHolder}>{userFullName}</Text>
                </View>
                <View>
                  <Text style={appColors.cardLabel}>xPagar</Text> 
                  <Text style={appColors.cardExpiry}>Billetera</Text> 
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Sección de Pagos Rápidos */}
          <View style={billeteraStyles.quickActionsContainer}>
            <TouchableOpacity 
              style={billeteraStyles.actionButton} 
              onPress={() => {
                console.log('Valor de userId al navegar a RecargaScreen:', userId); 
                navigation.navigate('RecargaScreen', { userId: userId ? String(userId) : '' }); 
              }}
            >
              {/* Se ha eliminado el espacio/salto de línea entre Ionicons y Text para evitar la advertencia */}
              <Ionicons name="add-circle-outline" size={30} color={appColors.primary} /><Text style={billeteraStyles.actionText}>Recargar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={billeteraStyles.actionButton} 
              onPress={() => navigation.navigate('EnviarScreen', { 
                userId: userId ? String(userId) : '', 
                userWalletBalance: userData?.MIC_CREBIL // Pasa el saldo actual
              })}
            >
              <Ionicons name="send-outline" size={30} color={appColors.primary} />
              <Text style={billeteraStyles.actionText}>Enviar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={billeteraStyles.actionButton} 
              onPress={() => navigation.navigate('PagarScreen', { 
                userId: userId ? String(userId) : '', 
                userWalletBalance: userData?.MIC_CREBIL // Pasa el saldo actual
              })}
            >
              <Ionicons name="scan-outline" size={30} color={appColors.primary} />
              <Text style={billeteraStyles.actionText}>Pagar</Text>
            </TouchableOpacity>

          </View>

          {/* Sección de Pago de Servicios */}
          <Text style={appStyles.sectionTitle}>Pagar Servicios</Text>
          <View style={billeteraStyles.serviciosGrid}>
            {isLoading ? (
              <ActivityIndicator size="large" color={appColors.primary} style={billeteraStyles.loadingIndicator} />
            ) : error ? (
              <Text style={billeteraStyles.errorText}>{error}</Text>
            ) : (
              services.map(servicio => (
                <TouchableOpacity
                  key={servicio.id}
                  style={billeteraStyles.servicioButton}
                  onPress={() => handleServicePress(servicio)} 
                >
                  <View style={[billeteraStyles.servicioIconCircle, { backgroundColor: servicio.color }]}>
                    <MaterialCommunityIcons name={servicio.icon} size={30} color={appColors.white} />
                  </View>
                  <Text style={billeteraStyles.servicioText}>{servicio.name}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Historial de Movimientos */}
          <View style={billeteraStyles.historialContainer}>
            <TouchableOpacity
              onPress={() => setMostrarHistorial(!mostrarHistorial)}
              style={billeteraStyles.historialHeader}
            >
              <Text style={billeteraStyles.historialTitle}>
                {mostrarHistorial ? "Ocultar Historial" : "Ver Historial"}
              </Text>
              <Ionicons
                name={mostrarHistorial ? "chevron-up" : "chevron-down"}
                size={24}
                color={appColors.textPrimary}
              />
            </TouchableOpacity>

            {mostrarHistorial && (
              loadingHistory ? (
                <ActivityIndicator size="small" color={appColors.primary} style={{ paddingVertical: 20 }} />
              ) : walletHistory.length > 0 ? (
                <FlatList
                  data={walletHistory}
                  keyExtractor={(item) => item.id.toString()} 
                  renderItem={renderMovimiento}
                  contentContainerStyle={billeteraStyles.movimientosList}
                  scrollEnabled={false}
                />
              ) : (
                <Text style={billeteraStyles.noHistoryText}>No hay movimientos registrados.</Text>
              )
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Modales existentes */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={billeteraStyles.modalContainer}>
          <View style={billeteraStyles.modalContent}>
            <Text style={billeteraStyles.modalTitle}>{accion}</Text>
            <TextInput
              style={billeteraStyles.input}
              placeholder="Monto"
              placeholderTextColor={appColors.textSecondary}
              keyboardType="numeric"
              value={monto}
              onChangeText={setMonto}
            />
            <TouchableOpacity
              style={billeteraStyles.confirmButton}
              onPress={confirmarAccion}
            >
              <Text style={billeteraStyles.confirmButtonText}>Confirmar {accion}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                billeteraStyles.cancelButton,
                { marginTop: 10 },
              ]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={billeteraStyles.confirmButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={exitoVisible} transparent animationType="fade">
        <View style={billeteraStyles.successModalContainer}>
          <View style={billeteraStyles.successModalContent}>
            <Ionicons name="checkmark-circle" size={80} color={appColors.green} />
            <Text style={billeteraStyles.successText}>¡{accion} Exitosa!</Text>
          </View>
        </View>
      </Modal>

      {/* MODAL PARA MOSTRAR SUB-SERVICIOS */}
      <Modal
        visible={providersModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setProvidersModalVisible(false)}
      >
        <View style={billeteraStyles.modalContainer}>
          <View style={billeteraStyles.modalContent}>
            <Text style={billeteraStyles.modalTitle}>{selectedService?.name} - Proveedores</Text>
            {selectedService?.providers.length > 0 ? (
                <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
                    {selectedService.providers.map(provider => (
                        <TouchableOpacity
                            key={provider.id}
                            style={billeteraStyles.providerButton}
                            onPress={() => handleProviderPress(provider)}
                        >
                            {provider.logo_url && (
                                <Image source={{ uri: provider.logo_url }} style={billeteraStyles.providerLogo} />
                            )}
                            <Text style={billeteraStyles.providerText}>{provider.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            ) : (
                <Text style={billeteraStyles.noProvidersText}>No hay proveedores activos para este servicio.</Text>
            )}
            <TouchableOpacity
                style={billeteraStyles.cancelButton}
                onPress={() => setProvidersModalVisible(false)}
            >
                <Text style={billeteraStyles.confirmButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const billeteraStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 30,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: appColors.cardBackground,
    marginHorizontal: 16,
    borderRadius: 15,
    paddingVertical: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginTop: 10,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  actionText: {
    color: appColors.textPrimary,
    marginTop: 8,
    fontWeight: '600',
    fontSize: 14,
  },
  
  serviciosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    backgroundColor: appColors.cardBackground,
    marginHorizontal: 16,
    padding: 15,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginBottom: 20,
  },
  servicioButton: {
    alignItems: 'center',
    width: '25%', 
    marginVertical: 10,
  },
  servicioIconCircle: {
    width: 55,
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  servicioText: {
    fontSize: 12,
    fontWeight: '600',
    color: appColors.textPrimary,
    textAlign: 'center',
  },
  loadingIndicator: {
    paddingVertical: 30,
    width: '100%',
  },
  errorText: {
    color: appColors.red,
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
    fontWeight: '600',
  },
  historialContainer: {
    marginHorizontal: 16,
    backgroundColor: appColors.cardBackground,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginBottom: 30,
    overflow: 'hidden',
  },
  historialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    backgroundColor: appColors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  historialTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: appColors.textPrimary,
  },
  movimientosList: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 20,
  },
  movimientoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
  },
  movimientoIcono: {
    marginRight: 15,
  },
  movimientoDetalle: {
    flex: 1,
  },
  movimientoDescripcion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: appColors.textPrimary,
  },
  movimientoFecha: {
    fontSize: 12,
    color: appColors.textSecondary,
    marginTop: 2,
  },
  movimientoMonto: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: appColors.cardBackground,
    width: '85%',
    padding: 25,
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: appColors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: appColors.textSecondary,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    color: appColors.textPrimary,
    backgroundColor: appColors.background,
  },
  confirmButton: {
    backgroundColor: appColors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: appColors.textSecondary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: appColors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  successModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContent: {
    backgroundColor: appColors.cardBackground,
    padding: 40,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  successText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    color: appColors.textPrimary,
  },
  providerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appColors.background,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  providerText: {
    fontSize: 16,
    fontWeight: '600',
    color: appColors.textPrimary,
  },
  noProvidersText: {
    fontSize: 15,
    color: appColors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  noHistoryText: { 
    fontSize: 15,
    color: appColors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  }
});

export default BilleteraScreen;
