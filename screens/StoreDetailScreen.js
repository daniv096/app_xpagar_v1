import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Background from '../constants/Background';
import { SafeAreaView } from 'react-native-safe-area-context';

const StoreDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { store } = route.params;

  const [articulos, setArticulos] = useState([]);

  const fetchArticulos = async () => {
    try {
      const response = await fetch(`https://nodejs-mysql-restapi-production-d0f6.up.railway.app/api/artxtienda/${store.tie_codigo}`);
      const data = await response.json();
      setArticulos(data);
    } catch (error) {
      console.error('Error al obtener los artículos de la tienda:', error);
    }
  };

  useEffect(() => {
    fetchArticulos();
  }, [store]);

  const renderItem = ({ item }) => (
    <View style={styles.articuloCard}>
      <Image
        source={{ uri: item.art_imagen || 'https://via.placeholder.com/150' }}
        style={styles.articuloImage}
      />
      <Text style={styles.articuloName} numberOfLines={1}>{item.art_nombre}</Text>
      <Text style={styles.articuloPrice}>${item.art_precio}</Text>
      <TouchableOpacity style={styles.verMasButton}>
        <Text style={styles.verMasText}>Comprar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Background>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>{store.tie_nombre}</Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          <Image
            source={{ uri: store.tie_imagen || 'https://via.placeholder.com/300x150' }}
            style={styles.storeImage}
          />
          <Text style={styles.description}>{store.tie_titulo}</Text>
          <Text style={styles.address}>{store.tie_direccion}</Text>

          {articulos.length > 0 ? (
            <FlatList
              data={articulos}
              keyExtractor={(item) => item.art_codigo.toString()}
              numColumns={2}
              renderItem={renderItem}
              contentContainerStyle={styles.articulosContainer}
              scrollEnabled={false} // importante: desactivamos scroll interno del FlatList
            />
          ) : (
            <Text style={styles.noArticulos}>No hay artículos disponibles</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </Background>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  storeImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#fff',
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  address: {
    fontSize: 14,
    color: '#ccc',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  articulosContainer: {
    paddingHorizontal: 10,
  },
  articuloCard: {
    backgroundColor: '#fff',
    margin: 8,
    flex: 1,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    elevation: 3,
  },
  articuloImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  articuloName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  articuloPrice: {
    fontSize: 14,
    color: '#ff6b00',
    marginTop: 5,
  },
  verMasButton: {
    backgroundColor: '#0055a4',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginTop: 8,
  },
  verMasText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  noArticulos: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default StoreDetailScreen;