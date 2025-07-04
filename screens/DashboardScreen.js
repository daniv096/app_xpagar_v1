import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Platform, LayoutAnimation, UIManager, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialIcons, Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { jwtDecode } from 'jwt-decode';
import { API_URL } from '@env';

// Importa los estilos y colores reutilizables
import { appStyles, appColors } from '../constants/appStyles'; // <<-- TU RUTA DE IMPORTACIÓN

// Habilitar LayoutAnimation en Android para transiciones fluidas
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DashboardScreen = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [articulos, setArticulos] = useState([]);
  const [tiendas, setTiendas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredTiendas, setFilteredTiendas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLevel, setUserLevel] = useState(1);

  const route = useRoute();
  const navigation = useNavigation();
  const { token } = route.params || {};

  let userId = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.id;
    } catch (e) {
      console.error('Token inválido o malformado', e);
    }
  }
  
  console.log(`API URL: ${API_URL}, User ID: ${userId}`);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const fetchUserData = async () => {
    try {
      if (!userId) return;

      const response = await fetch(`${API_URL}/api/getUsuarioDetalle/${userId}`);
      const data = await response.json();

      if (data && Object.keys(data).length > 0) {
        setUserData(data);
        const creditAmount = parseFloat(data.MIC_CREART || 0); // Usar MIC_CREART para crédito
        if (creditAmount > 5000) setUserLevel(5);
        else if (creditAmount > 3000) setUserLevel(4);
        else if (creditAmount > 1500) setUserLevel(3);
        else if (creditAmount > 500) setUserLevel(2);
        else setUserLevel(1);

        console.log('✅ Datos de usuario cargados correctamente:', data);
      } else {
        console.warn('⚠️ El backend devolvió un objeto vacío o nulo para el usuario.');
      }
    } catch (error) {
      console.error('❌ Error al obtener los datos del usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticulos = async () => {
    try {
      const response = await fetch(`${API_URL}/api/articulos`);
      const data = await response.json();
      setArticulos(data);
    } catch (error) {
      console.error('Error al obtener los artículos:', error);
    }
  };

  const fetchTiendas = async () => {
    try {
      const response = await fetch(`${API_URL}/api/tiendas`);
      const data = await response.json();
      setTiendas(data);
      setFilteredTiendas(data);
    } catch (error) {
      console.error('Error al obtener las tiendas:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/categoria`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  const filterTiendasByCategory = (category) => {
    if (category === 'Todas' || category === selectedCategory) {
      setFilteredTiendas(tiendas);
      setSelectedCategory(null);
    } else {
      const filtered = tiendas.filter((tienda) => tienda.CAT_DESCRI === category);
      setFilteredTiendas(filtered);
      setSelectedCategory(category);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = tiendas.filter((tienda) =>
      tienda.TIE_NOMBRE.toLowerCase().includes(query.toLowerCase()) || // Buscar por nombre de tienda
      tienda.TIE_DESCRI.toLowerCase().includes(query.toLowerCase()) // Buscar por descripción/categoría de tienda
    );
    setFilteredTiendas(filtered);
  };

  // NUEVA FUNCIÓN: Manejar la compra de un artículo
  const handleBuyArticle = (articulo) => {
    if (!userId) {
      alert("Debes iniciar sesión para comprar artículos."); // Usar un modal personalizado en producción
      navigation.navigate('Login'); // Redirigir al login
      return;
    }
    // Navegar a la nueva pantalla de confirmación de compra
    navigation.navigate('ConfirmPurchaseScreen', { 
      articulo: articulo, 
      userId: userId 
    });
  };

  useEffect(() => {
    fetchCategories();
    fetchArticulos();
    fetchTiendas();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        setLoading(true);
        fetchUserData();
      }
    }, [userId])
  );

  // Muestra el mensaje de carga mientras loading es true
  if (loading) {
    return (
      <LinearGradient colors={[appColors.gradientStart, appColors.gradientEnd]} style={appStyles.loadingContainer}>
        <ActivityIndicator size="large" color={appColors.white} />
        <Text style={appStyles.loadingText}>Cargando tu experiencia...</Text>
      </LinearGradient>
    );
  }
  
  // Si no hay datos de usuario, muestra un mensaje de error
  if (!userData) {
    return (
      <LinearGradient colors={[appColors.gradientStart, appColors.gradientEnd]} style={appStyles.errorContainer}>
        <Text style={appStyles.errorText}>No se pudieron cargar tus datos. Intenta de nuevo más tarde.</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={appStyles.retryButton}>
          <Text style={appStyles.retryButtonText}>Ir a Iniciar Sesión</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  // Cuando los datos están listos, muestra todo el dashboard
  const userFullName = `${userData.REG_NOMBRE || ''} ${userData.REG_APELLIDO || ''}`;
  const creditAmount = userData.MIC_CREART ? parseFloat(userData.MIC_CREART).toFixed(2) : '0.00';
  const walletBalance = userData.MIC_CREBIL ? parseFloat(userData.MIC_CREBIL).toFixed(2) : '0.00'; // Saldo de billetera
  const points = userData.PUNTOS || 0;

  return (
    <LinearGradient colors={[appColors.gradientStart, appColors.gradientEnd]} style={appStyles.container}>
      <SafeAreaView style={appStyles.safeArea} edges={['top']}>
        <StatusBar style="light" backgroundColor="transparent" translucent />
        <ScrollView contentContainerStyle={appStyles.scrollViewContent}>

          {/* Tarjeta de Crédito */}
          <View style={appStyles.cardContainer}>
            <LinearGradient
              colors={[appColors.gold, appColors.darkGold]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={appStyles.creditCard}
            >
              <Image
                source={require('../assets/logo.png')} // <<-- TU RUTA DE LOGO
                style={appStyles.logo}
              />
              <View style={appStyles.cardHeader}>
                <Text style={appStyles.cardTitle}>Crédito Disponible</Text>
              </View>
              <Text style={appStyles.cardAmount}>${creditAmount}</Text>
              <Text style={appStyles.cardNumber}>**** **** **** 2345</Text>
              <View style={appStyles.cardDetails}>
                <View>
                  <Text style={appStyles.cardLabel}>Titular</Text>
                  <Text style={appStyles.cardHolder}>{userFullName}</Text>
                </View>
                <View>
                  <Text style={appStyles.cardLabel}>Vence</Text>
                  <Text style={appStyles.cardExpiry}>12/28</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Saldo y Nivel de Puntos */}
          <View style={appStyles.infoRow}>
            <View style={appStyles.infoCard}>
              <MaterialCommunityIcons name="account-cash-outline" size={24} color={appColors.textPrimary} />
              <Text style={appStyles.infoCardLabel}>Saldo Billetera</Text> {/* Cambiado a saldo de billetera */}
              <Text style={appStyles.infoCardValue}>${walletBalance}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Billetera')} style={appStyles.viewDetailsButton}>
                <Text style={appStyles.viewDetailsText}>Ver Billetera</Text>
                <Ionicons name="arrow-forward-outline" size={16} color={appColors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={appStyles.infoCard}>
              <MaterialCommunityIcons name="star-circle-outline" size={24} color={appColors.secondary} />
              <Text style={appStyles.infoCardLabel}>Nivel de Puntos</Text>
              <Text style={appStyles.infoCardValue}>{`Nivel ${userLevel}`}</Text>
              <View style={appStyles.levelIndicator}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Ionicons
                    key={index}
                    name={index < userLevel ? 'star' : 'star-outline'}
                    size={18}
                    color={index < userLevel ? appColors.secondary : appColors.textSecondary}
                    style={{ marginHorizontal: 2 }}
                  />
                ))}
              </View>
            </View>
          </View>
          
          {/* Acciones Rápidas */}
          <View style={appStyles.actionsContainer}>
            <TouchableOpacity style={appStyles.actionButton} onPress={() => navigation.navigate('DiarioCredito')}>
              <Ionicons name="cart-outline" size={28} color={appColors.primary} />
              <Text style={appStyles.actionText}>Diario</Text>
            </TouchableOpacity>
            <TouchableOpacity style={appStyles.actionButton} onPress={() => navigation.navigate('Billetera')}>
              <Ionicons name="wallet-outline" size={28} color={appColors.primary} />
              <Text style={appStyles.actionText}>Billetera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={appStyles.actionButton} onPress={() => navigation.navigate('AvanceEfectivoScreen')}>
              <Ionicons name="cash-outline" size={28} color={appColors.primary} />
              <Text style={appStyles.actionText}>Avance</Text>
            </TouchableOpacity>
            <TouchableOpacity style={appStyles.actionButton} onPress={() => navigation.navigate('QrScreen')}>
              <Ionicons name="qr-code-outline" size={28} color={appColors.primary} />
              <Text style={appStyles.actionText}>QR</Text>
            </TouchableOpacity>
          </View>

          {/* Barra de Búsqueda */}
          <View style={appStyles.searchBar}>
            <Ionicons name="search" size={20} color={appColors.textSecondary} />
            <TextInput
              style={appStyles.searchInput}
              placeholder="Buscar tiendas o artículos..."
              placeholderTextColor={appColors.textSecondary}
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
          
          {/* Carrusel de Artículos */}
          <View style={appStyles.sectionContainer}>
            <Text style={appStyles.sectionTitle}>Descubre Artículos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={appStyles.carouselContainer}>
              {articulos.map((articulo) => (
                <TouchableOpacity key={articulo.PRO_CODIGO} style={appStyles.itemCard} onPress={() => navigation.navigate('ArticuloDetalle', { articulo, userId })}>
                  <Image source={{ uri: articulo.PRO_IMAGEN1 || 'https://placehold.co/150x150/E0E0E0/000000?text=No+Image' }} style={appStyles.itemImage}/>
                  <View style={appStyles.itemInfo}>
                    <Text style={appStyles.itemName} numberOfLines={1}>{articulo.PRO_DESCRI}</Text>
                    <Text style={appStyles.itemPrice}>${parseFloat(articulo.PRO_PRECIO).toFixed(2)}</Text>
                    {/* Botón Comprar modificado para navegar a ConfirmPurchaseScreen */}
                    <TouchableOpacity 
                      style={appStyles.buyButton} 
                      onPress={() => handleBuyArticle(articulo)}
                    >
                      <Text style={appStyles.buyButtonText}>Comprar</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Carrusel de Tiendas */}
          <View style={appStyles.sectionContainer}>
            <Text style={appStyles.sectionTitle}>Tiendas Afiliadas</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={appStyles.carouselContainer}>
              {filteredTiendas.map((tienda) => (
                <TouchableOpacity key={tienda.TIE_CODIGO} style={appStyles.itemCard} onPress={() => navigation.navigate('StoreDetail', { store: tienda })}>
                  <Image source={{ uri: tienda.TIE_IMAGEN1 || 'https://placehold.co/150x150/E0E0E0/000000?text=No+Image' }} style={appStyles.itemImage}/>
                  <View style={appStyles.itemInfo}>
                    <Text style={appStyles.itemName} numberOfLines={1}>{tienda.TIE_NOMBRE}</Text>
                    <Text style={appStyles.itemCategory}>{tienda.TIE_DESCRI}</Text>
                    <TouchableOpacity style={appStyles.storeButton}>
                      <Text style={appStyles.storeButtonText}>Ver Tienda</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Categorías Expandibles */}
          <View style={appStyles.accordionContainer}>
            <TouchableOpacity style={appStyles.accordionHeader} onPress={toggleExpand}>
              <Text style={appStyles.accordionHeaderText}>Explorar por Categoría</Text>
              <Ionicons name={expanded ? 'chevron-up-outline' : 'chevron-down-outline'} size={24} color={appColors.textPrimary} />
            </TouchableOpacity>
            {expanded && (
              <View style={appStyles.accordionBody}>
                {categories.map((item) => (
                  <TouchableOpacity
                    key={item.CAT_CODIGO}
                    style={[appStyles.categoryItem, selectedCategory === item.CAT_DESCRI && appStyles.selectedCategoryItem]}
                    onPress={() => filterTiendasByCategory(item.CAT_DESCRI)}
                  >
                    <Text style={[appStyles.categoryText, selectedCategory === item.CAT_DESCRI && appStyles.selectedCategoryText]}>{item.CAT_DESCRI}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default DashboardScreen;
