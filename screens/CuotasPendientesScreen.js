import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const cuotasPorTienda = [
  {
    comercio: 'Tienda XYZ',
    color: '#ff4d4d',
    cuotas: [
      { id: '1', monto: 15.0, vencimiento: '01/05/2025', estado: 'Vencida' },
      { id: '2', monto: 15.0, vencimiento: '10/05/2025', estado: 'Próxima' },
      { id: '3', monto: 10.0, vencimiento: '22/05/2025', estado: 'En curso' },
    ],
  },
  {
    comercio: 'Farmacia ABC',
    color: '#ffcc00',
    cuotas: [
      { id: '4', monto: 12.0, vencimiento: '05/05/2025', estado: 'Próxima' },
      { id: '5', monto: 11.0, vencimiento: '15/05/2025', estado: 'Próxima' },
      { id: '6', monto: 12.0, vencimiento: '25/05/2025', estado: 'En curso' },
    ],
  },
  {
    comercio: 'Ropa Urbana',
    color: '#4cd137',
    cuotas: [
      { id: '7', monto: 20.0, vencimiento: '10/05/2025', estado: 'En curso' },
      { id: '8', monto: 15.0, vencimiento: '20/05/2025', estado: 'Próxima' },
      { id: '9', monto: 10.0, vencimiento: '30/05/2025', estado: 'Próxima' },
    ],
  },
  {
    comercio: 'Ropa Urbana 333',
    color: '#4cd137',
    cuotas: [
      { id: '7', monto: 20.0, vencimiento: '10/05/2025', estado: 'En curso' },
      { id: '8', monto: 15.0, vencimiento: '20/05/2025', estado: 'Próxima' },
      { id: '9', monto: 10.0, vencimiento: '30/05/2025', estado: 'Próxima' },
    ],
  },
  {
    comercio: 'Farmacia Farmatodo',
    color: '#ffcc00',
    cuotas: [
      { id: '4', monto: 12.0, vencimiento: '05/05/2025', estado: 'Próxima' },
      { id: '5', monto: 11.0, vencimiento: '15/05/2025', estado: 'Próxima' },
      { id: '6', monto: 12.0, vencimiento: '25/05/2025', estado: 'En curso' },
    ],
  },
];

const CuotasPendientesScreen = () => {
  const navigation = useNavigation();

  const totalCuotas = cuotasPorTienda.reduce((acc, tienda) => acc + tienda.cuotas.length, 0);
  const totalMonto = cuotasPorTienda.reduce(
    (acc, tienda) => acc + tienda.cuotas.reduce((suma, cuota) => suma + cuota.monto, 0),
    0
  );

  return (
    <LinearGradient colors={['#005AA7', '#FFFDE4']} style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Cuotas Pendientes</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>Total cuotas: {totalCuotas}</Text>
          <Text style={styles.summaryText}>Total: ${totalMonto.toFixed(2)}</Text>
        </View>

        {cuotasPorTienda.map((item) => (
          <View key={item.comercio} style={[styles.card, { borderLeftColor: item.color }]}>
            <View style={styles.cardRow}>
              <Ionicons name="storefront" size={24} color="black" />
              <Text style={styles.cardTitle}>{item.comercio}</Text>
            </View>
            <Text style={styles.cardDetail}>🧾 Cuotas: {item.cuotas.length}</Text>
            <Text style={styles.cardDetail}>
              💵 Total: ${item.cuotas.reduce((s, c) => s + c.monto, 0).toFixed(2)}
            </Text>
            <TouchableOpacity
              style={styles.btnDetalle}
              onPress={() =>
                navigation.navigate('DetalleCuotasScreen', {
                  comercio: item.comercio,
                  cuotas: item.cuotas,
                })
              }
            >
              <Text style={styles.btnText}>Ver detalle</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#000',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  summaryBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardDetail: {
    fontSize: 14,
    marginVertical: 2,
  },
  btnDetalle: {
    marginTop: 10,
    backgroundColor: '#005AA7',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default CuotasPendientesScreen;
