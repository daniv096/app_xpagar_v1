import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const ConfirmarPagoScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { comercio, cuotas, total } = route.params;

  const manejarMetodoPago = (metodo) => {
    Alert.alert(
      "Método de pago seleccionado",
      `Has seleccionado "${metodo}" para pagar ${cuotas.length} cuota(s) por $${total.toFixed(2)} en ${comercio}.`
    );
    // Aquí puedes implementar navegación, redirección o integración de pago real
  };

  return (
    <LinearGradient colors={['#FFFDE4', '#005AA7']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Confirmar Pago</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>🛍️ Comercio:</Text>
        <Text style={styles.value}>{comercio}</Text>

        <Text style={styles.label}>💸 Total a pagar:</Text>
        <Text style={styles.value}>${total.toFixed(2)}</Text>

        <Text style={styles.label}>📅 Cuotas seleccionadas:</Text>
        <Text style={styles.value}>{cuotas.length} cuota(s)</Text>

        <Text style={[styles.label, { marginTop: 20 }]}>💳 Métodos de pago:</Text>

        {['Transferencia', 'Pago Móvil', 'Depósito USD', 'Efectivo'].map((metodo, index) => (
          <TouchableOpacity
            key={index}
            style={styles.botonMetodo}
            onPress={() => manejarMetodoPago(metodo)}
          >
            <Text style={styles.botonTexto}>{metodo}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#000',
  },
  content: {
    backgroundColor: '#ffffffcc',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
  },
  value: {
    fontSize: 18,
    color: '#2d3436',
    marginBottom: 4,
  },
  botonMetodo: {
    marginTop: 10,
    paddingVertical: 14,
    backgroundColor: '#0984e3',
    borderRadius: 12,
    alignItems: 'center',
  },
  botonTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ConfirmarPagoScreen;