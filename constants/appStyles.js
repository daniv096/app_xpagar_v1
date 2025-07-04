import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Paleta de colores sofisticada y moderna

// ... otros estilos

  // ... el resto de tus estilos

export const appColors = {
  primary: '#0D47A1', // Azul oscuro
  secondary: '#FFB300', // Dorado/Ámbar
  background: '#F5F7FA', // Gris claro para las tarjetas
  cardBackground: '#FFFFFF',
  textPrimary: '#263238',
  textSecondary: '#607D8B',
  success: '#4CAF50',
  gradientStart: '#0055a4', // Tu azul de degradado
  gradientEnd: '#ff6b00',   // Tu naranja de degradado
  gold: '#FFD700',
  lightGold: '#EEE8AA',
  darkGold: '#B8860B',
  green: '#33ff3c',
  red: '#ff3333',
  orangePrimary: '#FFA500',
};

// Estilos reutilizables y modernos
export const appStyles = StyleSheet.create({
  // Estilos del contenedor principal y fondo
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollViewContent: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },

  // Estilos de la tarjeta de crédito
  cardContainer: {
    marginBottom: 25,
    alignItems: 'center',
  },
  creditCard: {
    borderRadius: 15,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    width: width * 0.85,
    height: 180,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  logo: {
    position: 'absolute',
    top: 15,
    right: 20,
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  cardHeader: {
    // Espacio para el logo
  },
  cardTitle: {
    color: appColors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
    marginTop: 10,
  },
  cardAmount: {
    color: appColors.textPrimary,
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardNumber: {
    color: appColors.textSecondary,
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 15,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cardLabel: {
    color: appColors.textSecondary,
    fontSize: 11,
    opacity: 0.7,
    marginBottom: 2,
  },
  cardHolder: {
    color: appColors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  cardExpiry: {
    color: appColors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },

  // Estilos de información y acciones
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: appColors.cardBackground,
    borderRadius: 15,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: (width / 2) - 25,
  },
  infoCardLabel: {
    fontSize: 14,
    color: appColors.textSecondary,
    marginTop: 5,
  },
  infoCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: appColors.textPrimary,
    marginTop: 4,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  viewDetailsText: {
    fontSize: 12,
    color: appColors.textSecondary,
    marginRight: 4,
  },
  levelIndicator: {
    flexDirection: 'row',
    marginTop: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: appColors.cardBackground,
    borderRadius: 15,
    paddingVertical: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 25,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  actionText: {
    fontSize: 12,
    color: appColors.textPrimary,
    marginTop: 6,
    fontWeight: '600',
  },
  
  // Estilos de la barra de búsqueda
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appColors.cardBackground,
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: appColors.textPrimary,
  },

  // Estilos de carruseles y secciones
  sectionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  carouselContainer: {
    paddingRight: 10,
  },
  itemCard: {
    backgroundColor: appColors.cardBackground,
    borderRadius: 15,
    marginRight: 15,
    width: 150,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    resizeMode: 'cover',
  },
  itemInfo: {
    padding: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: appColors.textPrimary,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: appColors.success,
    marginBottom: 8,
  },
  itemCategory: {
    fontSize: 12,
    color: appColors.textSecondary,
    marginBottom: 8,
  },
  buyButton: {
    backgroundColor: appColors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  storeButton: {
    backgroundColor: appColors.secondary,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  storeButtonText: {
    color: appColors.textPrimary,
    fontWeight: 'bold',
    fontSize: 13,
  },

  // Estilos del acordeón
  accordionContainer: {
    marginBottom: 30,
    backgroundColor: appColors.cardBackground,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
  },
  accordionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: appColors.textPrimary,
  },
  accordionBody: {
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  categoryItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
  },
  categoryText: {
    fontSize: 15,
    color: appColors.textPrimary,
  },
  selectedCategoryItem: {
    backgroundColor: appColors.background,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  selectedCategoryText: {
    fontWeight: 'bold',
    color: appColors.primary,
  },
  container: {
    flex: 1, // <<-- ESTE ESTILO ES CRUCIAL
  },
  // ... otros estilos
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollViewContent: {
    paddingTop: 20,
    paddingHorizontal: 16,
    // No se necesita paddingBottom aquí porque se agrega en el ScrollView
  },
});