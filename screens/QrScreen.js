import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated, Easing } from 'react-native';
import { CameraView, useCameraPermissions, Camera } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';

const QrScreen = () => {
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [flash, setFlash] = useState(Camera?.FlashMode?.off); // Nuevo estado para flash
  const scanAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    } else {
      startScanAnimation();
    }
  }, [permission]);

  const startScanAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnimation, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnimation, {
          toValue: 0,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const playBeep = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/beep.mp3')
    );
    await sound.playAsync();
  };

  const validateQRData = (data) => {
    try {
      const parsed = JSON.parse(data);
      return ['object', 'array'].includes(typeof parsed) || Array.isArray(parsed);
    } catch {
      return /^https?:\/\/|www\./.test(data);
    }
  };

  const handleScan = async ({ data }) => {
    if (!scanned) {
      setScanned(true);
      setQrData(data);

      await playBeep();

      const tipo = validateQRData(data)
        ? (data.startsWith('{') ? 'JSON válido' : 'URL')
        : 'Texto plano';

      Alert.alert(
        'Código escaneado',
        `Tipo: ${tipo}\nContenido:\n${data}`,
        [
          { text: 'Escanear otro', onPress: () => setScanned(false) },
          { text: 'Cerrar', onPress: () => navigation.goBack(), style: 'cancel' },
        ],
        { cancelable: true }
      );
    }
  };

  const toggleFlash = () => {
    setFlash(
      flash === Camera?.FlashMode?.torch
        ? Camera?.FlashMode?.off
        : Camera?.FlashMode?.torch
    );
  };

  if (!permission) {
    return <View style={styles.center}><Text>Solicitando permisos...</Text></View>;
  }

  if (!permission.granted) {
    return <View style={styles.center}><Text>Permiso de cámara denegado</Text></View>;
  }

  const animatedStyle = {
    transform: [
      {
        translateY: scanAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 200],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={handleScan}
        flash={flash}
      />

      {/* Marco de escaneo con animación */}
      <View style={styles.scanBox}>
        <Animated.View style={[styles.scanLine, animatedStyle]} />
      </View>

      {/* Botones de control siempre visibles */}
      <View style={styles.topControls}>
        <TouchableOpacity onPress={toggleFlash} style={styles.controlButton}>
          <Text style={styles.controlText}>
            {flash === Camera?.FlashMode?.torch ? '🔦 Apagar' : '🔦 Encender'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.controlButton}>
          <Text style={styles.controlText}>❌ Cerrar</Text>
        </TouchableOpacity>
      </View>

      {/* Overlay solo si se escaneó */}
      {scanned && (
        <View style={styles.overlay}>
          <Text style={styles.dataText}>QR Detectado</Text>
          <TouchableOpacity style={styles.button} onPress={() => setScanned(false)}>
            <Text style={styles.buttonText}>Escanear otro</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.closeButton]} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scanBox: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    width: '80%',
    height: 220,
    borderWidth: 2,
    borderColor: '#00FF00',
    borderRadius: 10,
    overflow: 'hidden',
  },
  scanLine: {
    height: 3,
    width: '100%',
    backgroundColor: 'red',
    position: 'absolute',
    top: 0,
  },
  topControls: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  controlText: {
    color: '#fff',
    fontSize: 14,
  },
  overlay: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  dataText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#0055a4',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#ff6b00',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default QrScreen;