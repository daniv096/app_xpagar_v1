import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, FlatList, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';


const colors = {
    primary: '#0055a4',
    secondary: '#ff6b00',
    textLight: '#fff',
    textMuted: '#ccc',
  };

const DiarioCreditoScreen = () => {
  const [loading, setLoading] = useState(true);
  const [saldoDisponible, setSaldoDisponible] = useState(1500.00); // Simulado
  const [movimientos, setMovimientos] = useState([]);
  const [mostrarMovimientos, setMostrarMovimientos] = useState(false);

  // Datos de tiendas ficticias con sus imágenes
  const tiendas = [
    { id: '1', nombre: 'Pollera', imagen: 'https://via.placeholder.com/100x100' },
    { id: '2', nombre: 'Cafetería', imagen: 'https://via.placeholder.com/100x100' },
    { id: '3', nombre: 'Ferretería', imagen: 'https://via.placeholder.com/100x100' },
    { id: '4', nombre: 'Farmacias', imagen: 'https://via.placeholder.com/100x100' },
    { id: '5', nombre: 'Ropa', imagen: 'https://via.placeholder.com/100x100' },
    { id: '6', nombre: 'Zapatería', imagen: 'https://via.placeholder.com/100x100' },
    { id: '7', nombre: 'Librería', imagen: 'https://via.placeholder.com/100x100' },
    { id: '8', nombre: 'Juguetería', imagen: 'https://via.placeholder.com/100x100' },
    { id: '9', nombre: 'Bazar', imagen: 'https://via.placeholder.com/100x100' },
    { id: '10', nombre: 'Tecnología', imagen: 'https://via.placeholder.com/100x100' },
    { id: '11', nombre: 'Perfumería', imagen: 'https://via.placeholder.com/100x100' },
    { id: '12', nombre: 'Joyería', imagen: 'https://via.placeholder.com/100x100' },
  ];

  useEffect(() => {
    setTimeout(() => {
      setMovimientos([
        { id: 1, descripcion: 'Compra en Tienda X', monto: -50.00, fecha: '2025-04-28' },
        { id: 2, descripcion: 'Pago recibido', monto: 100.00, fecha: '2025-04-28' },
        { id: 3, descripcion: 'Compra en Supermercado', monto: -30.50, fecha: '2025-04-27' },
        { id: 4, descripcion: 'Compra en Cafetería', monto: -15.25, fecha: '2025-04-27' },
      ]);
      setLoading(false);
    }, 2000); // 2 segundos de "carga"
  }, []);

  const toggleMovimientos = () => {
    setMostrarMovimientos(!mostrarMovimientos);
  };

  // Función para renderizar las tiendas
  const renderTienda = ({ item }) => (
    <View style={styles.tiendaCard}>
      <Image source={{ uri: item.imagen }} style={styles.tiendaImage} />
      <Text style={styles.tiendaName}>{item.nombre}</Text>
      <TouchableOpacity style={styles.pagarButton}>
        <Text style={styles.pagarButtonText}>Pagar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={[colors.primary, colors.secondary]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.textLight} />
        ) : (
          <>
            {/* Tarjeta de Saldo Disponible con Animación */}
            <Animatable.View
              animation="fadeInUpBig"
              duration={1000}
              delay={500}
              style={styles.card}
            >
              <Text style={styles.title}>Saldo Disponible</Text>
              <Text style={styles.saldo}>${saldoDisponible.toFixed(2)}</Text>

              <TouchableOpacity style={styles.button} onPress={toggleMovimientos}>
                <Text style={styles.buttonText}>
                  {mostrarMovimientos ? 'Ocultar Movimientos' : 'Ver Movimientos'}
                </Text>
              </TouchableOpacity>
            </Animatable.View>

            {/* Movimientos con Animación */}
            {mostrarMovimientos && (
              <Animatable.View
                animation="fadeInUpBig"
                duration={1000}
                delay={800}
                style={styles.movimientosContainer}
              >
                {movimientos.map((mov) => (
                  <Animatable.View
                    key={mov.id}
                    animation="fadeInUpBig"
                    duration={500}
                    delay={100 * mov.id} // Animación escalonada
                    style={styles.movimientoCard}
                  >
                    <Text style={styles.movimientoDescripcion}>{mov.descripcion}</Text>
                    <Text style={[styles.movimientoMonto, { color: mov.monto < 0 ? '#ff4d4d' : '#4caf50' }]}>
                      {mov.monto < 0 ? '-' : '+'}${Math.abs(mov.monto).toFixed(2)}
                    </Text>
                    <Text style={styles.movimientoFecha}>{mov.fecha}</Text>
                  </Animatable.View>
                ))}
              </Animatable.View>
            )}

            {/* Sección de Tiendas */}
            <Text style={styles.tiendaSectionTitle}>Tiendas</Text>
            <FlatList
              data={tiendas}
              renderItem={renderTienda}
              keyExtractor={(item) => item.id}
              numColumns={3} // 3 elementos por fila
              columnWrapperStyle={styles.columnWrapper} // Estilo para manejar el espaciado entre columnas
            />
          </>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
    gradient: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        marginTop: 40, // Aumentamos el margen superior para bajar más la tarjeta
        marginHorizontal: 15, // Márgenes laterales
        elevation: 5, // Sombra Android
        shadowColor: '#000', // Sombra iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    title: {
      fontSize: 20,
      color: colors.textLight,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    saldo: {
      fontSize: 36,
      color: colors.textMuted,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    movimientosContainer: {
      marginTop: 10,
    },
    movimientoCard: {
      backgroundColor: 'white',
      borderRadius: 15,
      padding: 15,
      marginBottom: 12,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    movimientoDescripcion: {
      fontSize: 16,
      color: colors.textMuted,
      marginBottom: 5,
    },
    movimientoMonto: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    movimientoFecha: {
      fontSize: 12,
      color: colors.textLight,
      marginTop: 5,
    },
    tiendaSectionTitle: {
      fontSize: 22,
      color: colors.textLight,
      fontWeight: 'bold',
      marginTop: 30,
      marginBottom: 10,
    },
    columnWrapper: {
      justifyContent: 'space-between',
      marginHorizontal: 10, // Agregado para los márgenes laterales
    },
    tiendaCard: {
      backgroundColor: 'white',
      borderRadius: 10,
      paddingVertical: 15,
      paddingHorizontal: 10,
      marginBottom: 20,
      marginRight: 10,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      alignItems: 'center',
      flex: 1, // Aseguramos que cada tarjeta ocupe el mismo espacio
      marginBottom: 10, // Evitamos que las tarjetas se amontonen
    },
    tiendaImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 10,
      resizeMode: 'cover', // Asegura que la imagen mantenga su proporción
    },
    tiendaName: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: 'bold',
      marginBottom: 10,
      textAlign: 'center', // Centra el nombre
    },
    pagarButton: {
      backgroundColor: colors.primary,
      paddingVertical: 5,
      paddingHorizontal: 15,
      borderRadius: 8,
    },
    pagarButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
    },
  });

export default DiarioCreditoScreen;