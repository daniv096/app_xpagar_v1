// Background.js
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

const Background = ({ children }) => {
  return (
    <LinearGradient
      colors={['#0055a4', '#ff6b00']} // Aquí puedes modificar los colores
      style={styles.background}
    >
      {children} {/* Aquí es donde se insertarán los contenidos de cada pantalla */}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center', // Puedes ajustarlo según necesites
  },
});

export default Background;