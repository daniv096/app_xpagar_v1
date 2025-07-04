import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Platform, LayoutAnimation, UIManager, ActivityIndicator, Animated, FlatList, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialIcons, Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { jwtDecode } from 'jwt-decode';
import { API_URL } from '@env'; 

// Importa los estilos y colores reutilizables
import { appStyles, appColors } from '../constants/appStyles'; 

// Habilitar LayoutAnimation en Android para transiciones fluidas
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// URL base para las imágenes estáticas. ¡TU IP LOCAL!
const IMAGES_BASE_URL = 'http://192.168.1.4:5501/img_public/'; 

// IMAGEN DE FALLBACK LOCAL PARA ARTÍCULOS (ruta corregida)
const LOCAL_FALLBACK_ARTICLE_IMAGE = require('../assets/sample.png'); 

// IMAGEN DE FALLBACK LOCAL PARA TIENDAS (nueva)
const LOCAL_FALLBACK_STORE_IMAGE = require('../assets/sample_tiendas.png'); 

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

  // --- NUEVOS ESTADOS PARA HISTORIAL DE COMPRAS Y CUOTAS ---
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [loadingPurchaseHistory, setLoadingPurchaseHistory] = useState(true);
  const [showPurchaseHistory, setShowPurchaseHistory] = useState(false);
  const [expandedPurchaseId, setExpandedPurchaseId] = useState(null); // Para expandir/colapsar detalles de una compra

  const route = useRoute();
  const navigation = useNavigation();
  const { token } = route.params || {};

  // --- Estados y valores animados para la rotación de la tarjeta ---
  const animatedValue = useRef(new Animated.Value(0)).current; // 0 for front, 1 for back
  const [isFlipped, setIsFlipped] = useState(false); // Tracks if the card is currently showing the "back" side

  let userId = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.id;
    } catch (e) {
      // console.error('Token inválido o malformado', e);
    }
  }
  
  // console.log(`API URL: ${API_URL}, User ID: ${userId}`);

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

        // console.log('✅ Datos de usuario cargados correctamente:', data);
      } else {
        // console.warn('⚠️ El backend devolvió un objeto vacío o nulo para el usuario.');
      }
    } catch (error) {
      // console.error('❌ Error al obtener los datos del usuario:', error);
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
      // console.error('Error al obtener los artículos:', error);
    }
  };

  const fetchTiendas = async () => {
    try {
      const response = await fetch(`${API_URL}/api/tiendas`);
      const data = await response.json();
      setTiendas(data);
      setFilteredTiendas(data);
    } catch (error) {
      // console.error('Error al obtener las tiendas:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/categoria`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      // console.error('Error cargando categorías:', error);
    }
  };

  // --- NUEVA FUNCIÓN: Obtener Historial de Compras ---
  const fetchPurchaseHistory = useCallback(async () => {
    try {
      setLoadingPurchaseHistory(true);
      if (!userId) {
        console.warn("fetchPurchaseHistory: No hay userId para obtener el historial de compras.");
        setPurchaseHistory([]);
        return;
      }
      const response = await fetch(`${API_URL}/api/purchase/${userId}`, {
        headers: {
          // 'Authorization': `Bearer ${token}`, // Si tu API requiere token para esta ruta
        },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setPurchaseHistory(data);
      } else {
        setPurchaseHistory([]);
        console.warn("fetchPurchaseHistory: Respuesta inesperada del historial de compras:", data);
      }
    } catch (error) {
      console.error("Error al obtener el historial de compras:", error);
      setPurchaseHistory([]);
    } finally {
      setLoadingPurchaseHistory(false);
    }
  }, [userId, token]); // Depende de userId y token

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
      tienda.TIE_NOMBRE.toLowerCase().includes(query.toLowerCase()) || 
      tienda.TIE_DESCRI.toLowerCase().includes(query.toLowerCase()) 
    );
    setFilteredTiendas(filtered);
  };

  // --- Función para la animación de la tarjeta de crédito/avance ---
  const flipCard = () => {
    if (isFlipped) { // Si actualmente muestra la parte trasera, voltea al frente (0 grados)
      Animated.spring(animatedValue, {
        toValue: 0,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start(() => setIsFlipped(false));
    } else { // Si actualmente muestra el frente, voltea a la parte trasera (180 grados)
      Animated.spring(animatedValue, {
        toValue: 1,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start(() => setIsFlipped(true));
    }
  };

  // Interpolación para la rotación en Y para el lado frontal
  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  // Interpolación para la rotación en Y para el lado trasero
  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'], // Empieza en 180, va a 360 (que es 0 visualmente)
  });

  // Interpolación para la opacidad del lado frontal (se desvanece a medida que gira)
  const frontOpacity = animatedValue.interpolate({
    inputRange: [0, 0.49, 0.51, 1],
    outputRange: [1, 1, 0, 0], // Permanece en 1 hasta casi la mitad, luego va a 0
  });

  // Interpolación para la opacidad del lado trasero (aparece a medida que gira)
  const backOpacity = animatedValue.interpolate({
    inputRange: [0, 0.49, 0.51, 1],
    outputRange: [0, 0, 1, 1], // Permanece en 0 hasta casi la mitad, luego va a 1
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
    opacity: frontOpacity,
    // Asegura que backfaceVisibility siempre sea un objeto de estilo
    ...(Platform.OS === 'android' ? { backfaceVisibility: 'hidden' } : {}),
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
    opacity: backOpacity,
    // Asegura que backfaceVisibility siempre sea un objeto de estilo
    ...(Platform.OS === 'android' ? { backfaceVisibility: 'hidden' } : {}),
    position: 'absolute', // Posiciona la tarjeta trasera sobre la frontal
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  };


  // Función para construir la URL completa de la imagen o usar el fallback local
  // ¡Modificado para añadir un timestamp y forzar la recarga!
  const getImageUrl = (relativePath, isStore = false) => {
    if (!relativePath) {
      return isStore ? LOCAL_FALLBACK_STORE_IMAGE : LOCAL_FALLBACK_ARTICLE_IMAGE;
    }
    const cleanedPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
    // Añade un timestamp como parámetro de consulta para forzar la recarga
    const fullUrl = `${IMAGES_BASE_URL}${cleanedPath}?t=${new Date().getTime()}`;
    return { uri: fullUrl }; // Retorna un objeto URI para imágenes de red
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Este hook se ejecuta cada vez que la pantalla del Dashboard entra en foco.
  // Es el mecanismo principal para refrescar los datos, incluyendo los historiales.
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        setLoading(true);
        fetchUserData(); // Recarga los datos del usuario (saldos MIC_CREART, MIC_CREBIL)
        fetchArticulos(); // Recargar artículos al enfocar
        fetchTiendas();   // Recargar tiendas al enfocar
        fetchPurchaseHistory(); // Recargar historial de compras y sus cuotas
      }
      return () => {
        // Opcional: limpiar estados o listeners si es necesario al desenfocar
      };
    }, [userId, fetchPurchaseHistory]) // Depende de userId y fetchPurchaseHistory
  );

  // --- Renderizado de elementos del historial de compras ---
  const renderPurchaseItem = ({ item }) => (
    <View style={styles.purchaseItemCard}>
      <TouchableOpacity onPress={() => setExpandedPurchaseId(item.purchase_id === expandedPurchaseId ? null : item.purchase_id)}>
        <View style={styles.purchaseHeader}>
          <Text style={styles.purchaseTitle}>Compra #{item.purchase_id}</Text>
          <Ionicons 
            name={item.purchase_id === expandedPurchaseId ? 'chevron-up-outline' : 'chevron-down-outline'} 
            size={24} 
            color={appColors.textPrimary} 
          />
        </View>
        <Text style={styles.purchaseInfo}>Artículo: {item.articulo_id}</Text> {/* Podrías buscar el nombre del artículo aquí */}
        <Text style={styles.purchaseInfo}>Total: ${parseFloat(item.total_price).toFixed(2)}</Text>
        <Text style={styles.purchaseInfo}>Cuotas: {item.num_installments}</Text>
        <Text style={styles.purchaseInfo}>Fecha: {new Date(item.purchase_date).toLocaleDateString()}</Text>
        <Text style={[styles.purchaseStatus, { color: item.status === 'Completed' ? appColors.green : appColors.orangePrimary }]}>
          Estado: {item.status}
        </Text>
      </TouchableOpacity>

      {item.purchase_id === expandedPurchaseId && item.installments && item.installments.length > 0 && (
        <View style={styles.installmentsDetailContainer}>
          <Text style={styles.installmentsDetailTitle}>Detalle de Cuotas:</Text>
          {item.installments.map((installment) => (
            <View key={installment.installment_id} style={styles.installmentRow}>
              <View>
                <Text style={styles.installmentText}>Cuota #{installment.installment_number}</Text>
                <Text style={styles.installmentText}>Monto: ${parseFloat(installment.amount_due).toFixed(2)}</Text>
                <Text style={styles.installmentText}>Vence: {new Date(installment.due_date).toLocaleDateString()}</Text>
              </View>
              <View style={styles.installmentActions}>
                <Text style={[styles.installmentStatus, { color: installment.payment_status === 'Paid' ? appColors.green : appColors.red }]}>
                  {installment.payment_status}
                </Text>
                {installment.payment_status === 'Pending' && (
                  <TouchableOpacity 
                    style={styles.payInstallmentButton}
                    onPress={() => navigation.navigate('CreditInstallmentBreakdownScreen', { // NAVEGA A LA NUEVA PANTALLA
                      installment: installment, 
                      userId: userId,
                    })}
                  >
                    <Text style={styles.payInstallmentButtonText}>Pagar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );


  if (loading) {
    return (
      <LinearGradient colors={[appColors.gradientStart, appColors.gradientEnd]} style={appStyles.loadingContainer}>
        <ActivityIndicator size="large" color={appColors.white} />
        <Text style={appStyles.loadingText}>Cargando tu experiencia...</Text>
      </LinearGradient>
    );
  }
  
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

  const userFullName = `${userData.REG_NOMBRE || ''} ${userData.REG_APELLIDO || ''}`;
  const creditAmount = userData.MIC_CREART ? parseFloat(userData.MIC_CREART).toFixed(2) : '0.00';
  const walletBalance = userData.MIC_CREBIL ? parseFloat(userData.MIC_CREBIL).toFixed(2) : '0.00';
  const advanceAmount = userData.MIC_CREAVA ? parseFloat(userData.MIC_CREAVA).toFixed(2) : '0.00'; // Saldo de avance
  const points = userData.PUNTOS || 0;

  return (
    <LinearGradient colors={[appColors.gradientStart, appColors.gradientEnd]} style={appStyles.container}>
      <SafeAreaView style={appStyles.safeArea} edges={['top']}>
        <StatusBar style="light" backgroundColor="transparent" translucent />
        <ScrollView contentContainerStyle={appStyles.scrollViewContent}>

          {/* Tarjeta de Crédito / Avance (con efecto de rotación) */}
          <TouchableOpacity onPress={flipCard} style={appStyles.cardContainer}>
            {/* Lado Frontal (Crédito) */}
            <Animated.View style={[appStyles.creditCardAnimated, frontAnimatedStyle]}>
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
                <View style={appStyles.cardHeader}>
                  <Text style={appStyles.cardTitle}>Crédito Disponible</Text>
                </View>
                <Text style={appStyles.cardAmount}>
                  ${creditAmount}
                </Text>
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
            </Animated.View>

            {/* Lado Trasero (Avance) */}
            <Animated.View style={[appStyles.creditCardAnimated, backAnimatedStyle]}>
              <LinearGradient
                colors={[appColors.warmOrange, appColors.darkRed]} // Colores cálidos
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={appStyles.creditCard}
              >
                <Image
                  source={require('../assets/logo.png')} 
                  style={appStyles.logo}
                />
                <View style={appStyles.cardHeader}>
                  <Text style={[appColors.cardTitle, { color: appColors.gold }]}>Avance de Efectivo</Text>
                </View>
                <Text style={[appColors.cardAmount, { color: appColors.gold }]}>
                  ${advanceAmount}
                </Text>
                <Text style={[appColors.cardNumber, { color: appColors.gold }]}>**** **** **** 2345</Text>
                <View style={appStyles.cardDetails}>
                  <View>
                    <Text style={appStyles.cardLabel}>Titular</Text>
                    <Text style={[appColors.cardHolder, { color: appColors.gold }]}>{userFullName}</Text>
                  </View>
                  <View>
                    <Text style={[appColors.cardLabel, { color: appColors.gold }]}>xPagar</Text>
                    <Text style={[appColors.cardExpiry, { color: appColors.gold }]}>Avance</Text>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>

          {/* Saldo y Nivel de Puntos */}
          <View style={appStyles.infoRow}>
            <View style={appStyles.infoCard}>
              <MaterialCommunityIcons name="account-cash-outline" size={24} color={appColors.textPrimary} />
              <Text style={appStyles.infoCardLabel}>Saldo Billetera</Text> 
              <Text style={appStyles.infoCardValue}>${walletBalance}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Billetera', { token: token })} style={appStyles.viewDetailsButton}>
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
            <TouchableOpacity style={appStyles.actionButton} onPress={() => navigation.navigate('DiarioCredito', { token: token })}>
              <Ionicons name="cart-outline" size={28} color={appColors.primary} />
              <Text style={appStyles.actionText}>Diario</Text>
            </TouchableOpacity>
            <TouchableOpacity style={appStyles.actionButton} onPress={() => navigation.navigate('Billetera', { token: token })}>
              <Ionicons name="wallet-outline" size={28} color={appColors.primary} />
              <Text style={appStyles.actionText}>Billetera</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={appStyles.actionButton} 
              onPress={() => navigation.navigate('AvanceEfectivoScreen', { 
                userId: userId, 
                userWalletBalance: walletBalance, // Pasa el saldo de la billetera si se necesita
                availableAdvanceAmount: advanceAmount // Pasa el saldo de avance
              })}
            >
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
                <TouchableOpacity 
                  key={articulo.PRO_CODIGO} 
                  style={appStyles.itemCard} 
                  onPress={() => navigation.navigate('ConfirmPurchaseScreen', { articulo: articulo, userId: userId })} 
                >
                  <Image 
                    source={getImageUrl(articulo.PRO_IMAGEN1, false)} // isStore = false para artículos
                    style={appStyles.itemImage}
                    resizeMode="contain" 
                    onError={(e) => { /* console.log('ERROR LOADING ARTICLE IMAGE:', e.nativeEvent.error, 'URL:', getImageUrl(articulo.PRO_IMAGEN1, false)); */ }} 
                  />
                  <View style={appStyles.itemInfo}>
                    <Text style={appStyles.itemName} numberOfLines={1}>{articulo.PRO_DESCRI}</Text>
                    <Text style={appStyles.itemPrice}>${parseFloat(articulo.PRO_PRECIO).toFixed(2)}</Text>
                    <TouchableOpacity 
                      style={appStyles.buyButton} 
                      onPress={() => navigation.navigate('ConfirmPurchaseScreen', { articulo: articulo, userId: userId })} 
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
                <TouchableOpacity 
                  key={tienda.TIE_CODIGO} 
                  style={appStyles.itemCard} 
                  onPress={() => navigation.navigate('StoreDetail', { store: tienda })} 
                >
                  <Image 
                    source={getImageUrl(tienda.TIE_IMAGEN1, true)} // isStore = true para tiendas
                    style={appStyles.itemImage}
                    resizeMode="contain" 
                    onError={(e) => { /* console.log('ERROR LOADING STORE IMAGE:', e.nativeEvent.error, 'URL:', getImageUrl(tienda.TIE_IMAGEN1, true)); */ }} 
                  />
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
                    <Text style={[appStyles.categoryText, selectedCategory === item.CAT_DESCRI && appColors.selectedCategoryText]}>{item.CAT_DESCRI}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* --- NUEVA SECCIÓN: Historial de Compras y Cuotas --- */}
          <View style={styles.purchaseHistoryContainer}>
            <TouchableOpacity style={styles.purchaseHistoryHeader} onPress={() => setShowPurchaseHistory(!showPurchaseHistory)}>
              <Text style={styles.purchaseHistoryTitle}>Historial de Compras y Cuotas</Text>
              <Ionicons name={showPurchaseHistory ? 'chevron-up-outline' : 'chevron-down-outline'} size={24} color={appColors.textPrimary} />
            </TouchableOpacity>
            {showPurchaseHistory && (
              <View style={styles.purchaseHistoryBody}>
                {loadingPurchaseHistory ? (
                  <ActivityIndicator size="large" color={appColors.primary} style={{ paddingVertical: 20 }} />
                ) : purchaseHistory.length > 0 ? (
                  <FlatList
                    data={purchaseHistory}
                    keyExtractor={(item) => item.purchase_id.toString()}
                    renderItem={renderPurchaseItem}
                    contentContainerStyle={styles.purchaseListContent}
                    scrollEnabled={false} // Para que el ScrollView principal maneje el scroll
                  />
                ) : (
                  <Text style={styles.noPurchaseHistoryText}>No tienes compras registradas aún.</Text>
                )}
              </View>
            )}
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  // Estilos existentes de DashboardScreen (omitiendo los que ya están en appStyles)
  // ...
  // --- NUEVOS ESTILOS PARA HISTORIAL DE COMPRAS ---
  purchaseHistoryContainer: {
    backgroundColor: appColors.cardBackground,
    marginHorizontal: 16,
    borderRadius: 15,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    marginBottom: 30,
    overflow: 'hidden',
  },
  purchaseHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    backgroundColor: appColors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  purchaseHistoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: appColors.textPrimary,
  },
  purchaseHistoryBody: {
    padding: 18,
    backgroundColor: appColors.background,
  },
  purchaseListContent: {
    paddingBottom: 10,
  },
  purchaseItemCard: {
    backgroundColor: appColors.cardBackground,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: appColors.lightGray,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  purchaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  purchaseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: appColors.primary,
  },
  purchaseInfo: {
    fontSize: 14,
    color: appColors.textSecondary,
    marginBottom: 3,
  },
  purchaseStatus: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 5,
  },
  installmentsDetailContainer: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: appColors.lightGray,
  },
  installmentsDetailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: appColors.textPrimary,
    marginBottom: 10,
  },
  installmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: appColors.lightGray,
  },
  installmentText: {
    fontSize: 13,
    color: appColors.textPrimary,
  },
  installmentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  installmentStatus: {
    fontSize: 13,
    fontWeight: 'bold',
    marginRight: 10,
  },
  payInstallmentButton: {
    backgroundColor: appColors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  payInstallmentButtonText: {
    color: appColors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  noPurchaseHistoryText: {
    fontSize: 15,
    color: appColors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default DashboardScreen;
