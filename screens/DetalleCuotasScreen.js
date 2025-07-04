// DetalleCuotasScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const DetalleCuotasScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { comercio, cuotas } = route.params;

  const [seleccionadas, setSeleccionadas] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const toggleSeleccion = (id) => {
    setSeleccionadas((prev) =>
      prev.includes(id)
        ? prev.filter((cuotaId) => cuotaId !== id)
        : [...prev, id]
    );
  };

  const pagarCuotas = () => {
    setModalVisible(false);
  
    const cuotasSeleccionadas = cuotas.filter((c) =>
      seleccionadas.includes(c.id)
    );
    const total = cuotasSeleccionadas.reduce((sum, c) => sum + c.monto, 0);
  
    navigation.navigate('ConfirmarPago', {
      comercio,
      cuotas: cuotasSeleccionadas,
      total,
    });
  
    setSeleccionadas([]);
  };

  return (
    <LinearGradient colors={['#FFFDE4', '#005AA7']} style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Detalle de cuotas - {comercio}</Text>
      </View>

      <FlatList
        data={cuotas}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              seleccionadas.includes(item.id) && styles.cardSeleccionada,
            ]}
            onPress={() => toggleSeleccion(item.id)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cuotaText}>💰 Monto: ${item.monto.toFixed(2)}</Text>
              <Ionicons
                name={
                  seleccionadas.includes(item.id)
                    ? 'checkbox'
                    : 'square-outline'
                }
                size={24}
                color="#000"
              />
            </View>
            <Text style={styles.cuotaText}>📅 Vence: {item.vencimiento}</Text>
            <Text style={[
              styles.estado,
              item.estado === 'Vencida' ? styles.vencida :
              item.estado === 'Próxima' ? styles.proxima :
              styles.enCurso
            ]}>
              Estado: {item.estado}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Botón de pago */}
      {seleccionadas.length > 0 && (
        <TouchableOpacity
          style={styles.botonPago}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.botonTexto}>Pagar cuotas seleccionadas</Text>
        </TouchableOpacity>
      )}

      {/* Modal de confirmación */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitulo}>Confirmación de Pago</Text>
            <Text style={styles.modalTexto}>
              ¿Confirmas el pago de {seleccionadas.length} cuota(s)?
            </Text>
            <View style={styles.modalBotones}>
              <TouchableOpacity
                style={[styles.modalBoton, styles.cancelar]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalTextoBoton}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBoton, styles.confirmar]}
                onPress={pagarCuotas}
              >
                <Text style={styles.modalTextoBoton}>Confirmar pago</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 10,
    flexShrink: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  cardSeleccionada: {
    backgroundColor: '#dff9fb',
    borderColor: '#00b894',
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cuotaText: {
    fontSize: 16,
    marginBottom: 4,
  },
  estado: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  vencida: {
    color: '#d63031',
  },
  proxima: {
    color: '#fdcb6e',
  },
  enCurso: {
    color: '#00b894',
  },
  botonPago: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#0984e3',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  botonTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    width: '85%',
    alignItems: 'center',
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalTexto: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalBotones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalBoton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  cancelar: {
    backgroundColor: '#b2bec3',
  },
  confirmar: {
    backgroundColor: '#00b894',
  },
  modalTextoBoton: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default DetalleCuotasScreen;