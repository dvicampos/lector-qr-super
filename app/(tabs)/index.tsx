import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { BarCodeScanningResult } from 'expo-camera/build/Camera.types';

export default function HomeScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [qrData, setQrData] = useState('');
  const cameraRef = useRef<Camera | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = (result: BarCodeScanningResult) => {
    if (!scanned) {
      setScanned(true);
      setQrData(result.data);
      alert(`Código escaneado: ${result.data}`);
    }
  };

  if (hasPermission === null) {
    return <Text>Solicitando permiso de cámara...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No se otorgó permiso para usar la cámara</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFillObject}
        type={CameraType.back}
        onBarCodeScanned={handleBarCodeScanned}
        barCodeScannerSettings={{
          barCodeTypes: ['qr', 'ean13', 'ean8', 'code39', 'code128'],
        }}
        ref={cameraRef}
      />
      {scanned && (
        <View style={styles.overlay}>
          <Text style={styles.text}>Código: {qrData}</Text>
          <Button title={'Escanear de nuevo'} onPress={() => setScanned(false)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#000000aa',
    padding: 20,
    borderRadius: 10,
  },
  text: {
    color: 'white',
    marginBottom: 10,
    fontSize: 16,
  },
});
