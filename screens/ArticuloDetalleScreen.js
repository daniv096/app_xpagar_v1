// Reemplaza tu archivo actual con este actualizado:
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ArticuloDetalleScreen = ({ route }) => {
  const navigation = useNavigation();
  const { articulo, usu_codigo } = route.params;

  const nombre = articulo.art_nombre;
  const precio = articulo.art_precio;
  const cuotas = articulo.art_cuotas;
  const imagen = articulo.art_imagen;
  const disponible = articulo.art_stock;
  const descripcion = articulo.art_descripcion;
  const garantia = articulo.art_garantia;
  const cliente = usu_codigo;

  //console.log("Cliente:" , cliente);

  const [cantidad, setCantidad] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [compraConfirmada, setCompraConfirmada] = useState(false);

  const cuotaInicial = (precio * cantidad * 0.5).toFixed(2);
  const precioTotal = (precio * cantidad).toFixed(2);
  const montoFinanciar = precio * cantidad - cuotaInicial;
  const cuotaFinanciada = (montoFinanciar / cuotas).toFixed(2);

  const hoy = new Date();
  const fechasCuotas = Array.from({ length: cuotas }, (_, i) => {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() + 15 * (i + 1));
    return fecha.toLocaleDateString();
  });

  const incrementar = () => {
    if (cantidad < disponible) setCantidad(cantidad + 1);
  };

  const disminuir = () => {
    if (cantidad > 1) setCantidad(cantidad - 1);
  };

  const enviarCompra = async () => {
    try {
      const lista_cuotas = fechasCuotas.map((fecha) => ({
        cuo_fecha_pago: fecha,
        cuo_monto: parseFloat(cuotaFinanciada),
      }));
  
      const compraPayload = {
        usu_codigo: cliente, // ID del usuario logueado
        art_codigo: articulo.art_codigo,
        com_cantidad: cantidad,
        com_cuota_inicial: parseFloat(cuotaInicial),
        com_total: parseFloat(precioTotal),
        com_cuotas: cuotas,
      };
  
      const compraRes = await fetch('https://nodejs-mysql-restapi-production-d0f6.up.railway.app/api/createcompra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(compraPayload),
      });
  
      const compraData = await compraRes.json();
      console.log("compra:",compraData );
      if (!compraRes.ok) throw new Error(compraData.message || 'Error en compra');
  
      const compraId = compraData.com_codigo; // viene de la respuesta de la compra
      //console.log("ID compra:", compraData.com_codigo)
      const usu_codigo = cliente; // este debe estar definido en el contexto de tu componente
    
      if (!usu_codigo) {
        throw new Error('Código de usuario (usu_codigo) no definido.');
      }
    
      const cuotasPayload = lista_cuotas.map((cuota, index) => ({
        com_codigo: compraId ,
        usu_codigo: usu_codigo,
        cuo_numero: index + 1,
        cuo_fecha_pago: cuota.cuo_fecha_pago,
        cuo_monto: cuota.cuo_monto,
      }));
     
    
      //console.log('Payload completo para cuotas:', JSON.stringify(cuotasPayload, null, 2));
    
      const cuotasRes = await fetch('https://nodejs-mysql-restapi-production-d0f6.up.railway.app/api/registrarCuotas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuotasPayload),
      });
    
      const cuotasData = await cuotasRes.json();

      //console.log('Payload completo para cuotas:', JSON.stringify({lista_cuotas: cuotasPayload}, null, 2));
    
      if (!cuotasRes.ok) {
        throw new Error(cuotasData.message || 'Error en cuotas');
      }
    
      const saldoPayload = {
        usu_codigo: cliente,
        com_codigo: compraData.com_codigo,
      };
      
      const saldoRes = await fetch('https://nodejs-mysql-restapi-production-d0f6.up.railway.app/api/actualizarSaldo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saldoPayload),
      });
      
      const saldoData = await saldoRes.json();
      //console.log("slado:", saldoData);
      
      if (!saldoRes.ok) throw new Error(saldoData.message || 'Error al actualizar saldo');
      
      // UI Feedback
      setModalVisible(false);
      setCompraConfirmada(true);
      setTimeout(() => setCompraConfirmada(false), 3000);
    } catch (error) {
      Alert.alert('Error', error.message);
      console.error('Error en compra:', error);
    }
  };

  return (
    <LinearGradient colors={['#003366', '#ff6b00']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del Producto</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>{nombre}</Text>
          <Image
            source={typeof imagen === 'string' ? { uri: imagen } : imagen}
            style={styles.productImage}
            resizeMode="contain"
          />
          <View style={styles.counterContainer}>
            <Text style={styles.label}>Cantidad:</Text>
            <View style={styles.counter}>
              <TouchableOpacity onPress={disminuir} style={styles.counterButton}>
                <Text style={styles.counterButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{cantidad}</Text>
              <TouchableOpacity onPress={incrementar} style={styles.counterButton}>
                <Text style={styles.counterButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.stockText}>Disponibles: {disponible}</Text>
          </View>

          <View style={styles.priceCard}>
            <Text style={styles.label}>Precio Total:</Text>
            <Text style={styles.value}>${precioTotal}</Text>
          </View>

          <View style={styles.priceCard}>
            <Text style={styles.label}>Cuota Inicial:</Text>
            <Text style={styles.value}>${cuotaInicial}</Text>
          </View>

          <Text style={styles.subtitle}>Financiado en {cuotas} cuotas:</Text>
          {fechasCuotas.map((fecha, index) => (
            <View key={index} style={styles.cuotaBox}>
              <Text style={styles.cuotaText}>
                Cuota {index + 1}: ${cuotaFinanciada} — {fecha}
              </Text>
            </View>
          ))}

          {descripcion && (
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Descripción del artículo:</Text>
              <Text style={styles.infoText}>{descripcion}</Text>
            </View>
          )}

          {garantia && (
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Garantía:</Text>
              <Text style={styles.infoText}>{garantia}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.buyButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.buyButtonText}>Comprar ahora</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de confirmación */}
      <Modal transparent={true} animationType="fade" visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>¿Confirmar compra?</Text>
            <Text style={styles.modalText}>Producto: {nombre}</Text>
            <Text style={styles.modalText}>Cantidad: {cantidad}</Text>
            <Text style={styles.modalText}>Cuota Inicial: ${cuotaInicial}</Text>
            <Text style={styles.modalText}>Total: ${precioTotal}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#ff6b00' }]}
                onPress={enviarCompra}
              >
                <Text style={styles.modalButtonText}>Sí, confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#ccc' }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Mensaje de confirmación */}
      <Modal transparent={true} visible={compraConfirmada} animationType="fade">
  <View style={styles.successOverlay}>
    <View style={styles.successContainer}>
      <Image
        source={require('../assets/logo.png')} 
        style={styles.successImage}      />
        <Text style={styles.esloganTexto}>Tu compra segura</Text>
      <Image        
        source={require('../assets/vistobueno.png')} 
        style={styles.successImage}
      />
      <Text style={styles.successText}>¡Compra realizada con éxito!</Text>
    </View>
  </View>
</Modal>
    </LinearGradient>
  );
};


const styles = StyleSheet.create({
   container: { flex: 1 },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 15,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: '#ffffff44',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  productImage: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: '#ffffff22',
  },
  priceCard: {
    backgroundColor: '#ffffff33',
    borderRadius: 10,
    padding: 15,
    marginVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  value: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginVertical: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  cuotaBox: {
    backgroundColor: '#ffffffcc',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  cuotaText: {
    fontSize: 16,
    color: '#333',
  },
  infoBox: {
    backgroundColor: '#ffffff22',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#fff',
  },
  counterContainer: {
    marginBottom: 15,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  counterButton: {
    backgroundColor: '#ff6b00',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  counterButtonText: {
    fontSize: 20,
    color: '#fff',
  },
  counterValue: {
    fontSize: 18,
    marginHorizontal: 15,
    color: '#fff',
    fontWeight: 'bold',
  },
  stockText: {
    color: '#ddd',
    marginTop: 5,
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: 'transparent',
  },
  buyButton: {
    backgroundColor: '#ff6b00',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 6,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '85%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  toast: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#003366',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  toastText: {
    color: '#fff',
    fontSize: 16,
  },
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContainer: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  successImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
  },
  esloganTexto: {
    fontSize: 20,
    fontFamily: 'Pacifico_400Regular',
    color: '#ffa500',
  },
});

export default ArticuloDetalleScreen;