import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function App() {
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [qrData, setQrData] = useState('');

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Necesitamos tu permiso para usar la cámara</Text>
        <Button onPress={requestPermission} title="Dar permiso" />
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (!scanned) {
      setScanned(true);
      setQrData(data);
      alert(`Código escaneado: ${data}`);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
            <Text style={styles.flipText}>🔄 Voltear cámara</Text>
          </TouchableOpacity>
        </View>
      </CameraView>

      {scanned && (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>📷 Código escaneado:</Text>
          <Text style={styles.qrData}>{qrData}</Text>
          <TouchableOpacity style={styles.rescanButton} onPress={() => setScanned(false)}>
            <Text style={styles.rescanText}>Escanear de nuevo</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // fondo de carga/cámara
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    fontSize: 18,
    padding: 20,
    color: '#fff',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  flipButton: {
    backgroundColor: '#ffffff88',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  flipText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  overlay: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: '#222c',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 10,
  },
  overlayText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  qrData: {
    color: '#0ff',
    fontSize: 18,
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rescanButton: {
    backgroundColor: '#0ff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  rescanText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
