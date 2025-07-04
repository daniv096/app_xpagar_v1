import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const CreditAppDashboard = () => {
  return (
    <LinearGradient
      colors={['#1E90FF', '#FF8C00']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header con saldo */}
        <View style={styles.header}>
          <Text style={styles.balanceLabel}>Saldo Disponible</Text>
          <Text style={styles.balanceAmount}>$218.00</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.buttonText}>Recargar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.buttonText}>Retirar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sección de acciones rápidas */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Haz más, gana más</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction}>
              <View style={styles.quickActionIcon} />
              <Text style={styles.quickActionText}>Recompensas</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <View style={styles.quickActionIcon} />
              <Text style={styles.quickActionText}>Referir amigos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <View style={styles.quickActionIcon} />
              <Text style={styles.quickActionText}>Avance de efectivo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Búsqueda y categorías */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Compra en cuotas</Text>
          <TouchableOpacity style={styles.searchBar}>
            <Text style={styles.searchText}>Buscar productos o tiendas...</Text>
          </TouchableOpacity>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
            <TouchableOpacity style={styles.category}>
              <Text style={styles.categoryText}>Vehículos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.category}>
              <Text style={styles.categoryText}>Electrodomésticos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.category}>
              <Text style={styles.categoryText}>Tecnología</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.category}>
              <Text style={styles.categoryText}>Hogar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Ofertas destacadas */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ofertas para ti</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.offerCard}>
              <View style={styles.offerImage} />
              <Text style={styles.offerTitle}>KitchenAid Pro</Text>
              <Text style={styles.offerPrice}>$250.00</Text>
              <Text style={styles.offerOldPrice}>$650.00</Text>
            </View>
            <View style={styles.offerCard}>
              <View style={styles.offerImage} />
              <Text style={styles.offerTitle}>Fire TV Stick</Text>
              <Text style={styles.offerPrice}>$58.00</Text>
              <Text style={styles.offerOldPrice}>$80.00</Text>
            </View>
          </ScrollView>
        </View>

        {/* Tiendas afiliadas */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tiendas disponibles</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Ver más</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.storeGrid}>
            <TouchableOpacity style={styles.storeItem}>
              <View style={styles.storeLogo} />
              <Text style={styles.storeName}>Albi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.storeItem}>
              <View style={styles.storeLogo} />
              <Text style={styles.storeName}>Globo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.storeItem}>
              <View style={styles.storeLogo} />
              <Text style={styles.storeName}>TecnoShop</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 16,
  },
  balanceLabel: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
  },
  balanceAmount: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  actionButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAll: {
    color: '#FF8C00',
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    width: '30%',
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    marginBottom: 8,
  },
  quickActionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#555',
  },
  searchBar: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  searchText: {
    color: '#888',
  },
  categories: {
    marginBottom: 8,
  },
  category: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  categoryText: {
    color: '#333',
    fontSize: 14,
  },
  offerCard: {
    width: 150,
    marginRight: 16,
  },
  offerImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 8,
  },
  offerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  offerPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF8C00',
  },
  offerOldPrice: {
    fontSize: 12,
    color: '#888',
    textDecorationLine: 'line-through',
  },
  storeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  storeItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
  },
  storeLogo: {
    width: 60,
    height: 60,
    backgroundColor: '#f0f0f0',
    borderRadius: 30,
    marginBottom: 8,
  },
  storeName: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default CreditAppDashboard;