import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';  // Asegúrate de que COLORS esté definido correctamente
import Svg, { Circle } from 'react-native-svg';

export default function SplashScreen({ navigation }) {
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    // Animación de la barra de progreso circular
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 2500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();

    // Navegar a la pantalla de login después de 3 segundos
    const timer = setTimeout(() => {
      navigation.replace('Login');  // Redirige a la pantalla de Login
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <LinearGradient
      colors={[COLORS.primaryBlue, COLORS.primaryOrange]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          {/* Coloca la imagen dentro del logo */}
          <Image source={require('../assets/logo.png')} style={styles.logoImage} />
          <View style={styles.progressContainer}>
            <Svg width="180" height="180">
              <Circle
                cx="90"
                cy="90"
                r="70"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="8"
                fill="none"
              />
              <AnimatedCircle
                cx="90"
                cy="90"
                r="70"
                stroke={COLORS.primaryOrange}
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </Svg>
          </View>
        </View>
        <Text style={styles.title}>Xpagar v1.01</Text>
      </View>
    </LinearGradient>
  );
}

// Componente Circle animado
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 160,
    height: 160,
    backgroundColor: 'white',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  logoImage: {
    width: 140,  // Ajusta el tamaño de la imagen aquí
    height: 50,
    borderRadius: 40,  // Esto hace que la imagen sea circular
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  progressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    
  },
});