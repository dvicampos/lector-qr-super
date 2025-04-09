import { CameraView, useCameraPermissions } from 'expo-camera'; // Importa CameraView en lugar de Camera
import { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function App() {
  const [facing, setFacing] = useState<'back' | 'front'>('back');  // Usamos 'back' y 'front' para cambiar la cámara
  const [permission, requestPermission] = useCameraPermissions();  // Se solicita permiso de cámara
  const [scanned, setScanned] = useState(false);  // Estado para verificar si ya se escaneó un código
  const [qrData, setQrData] = useState('');  // Estado para almacenar los datos del código QR escaneado

  if (!permission) {
    // Si aún estamos solicitando permisos de cámara
    return <View />;
  }

  if (!permission.granted) {
    // Si no se ha otorgado el permiso
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Necesitamos tu permiso para mostrar la cámara</Text>
        <Button onPress={requestPermission} title="Dar permiso" />
      </View>
    );
  }

  // Función para cambiar la cámara (delante o atrás)
  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  // Función para manejar el escaneo del código QR
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    console.log('Código QR escaneado:', data);  // Agrega un console.log para verificar si el escaneo está funcionando
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
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}  // Solo escanear si no se ha escaneado previamente
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Voltear cámara</Text>
          </TouchableOpacity>
        </View>
      </CameraView>

      {scanned && (
        <View style={styles.overlay}>
          <Text style={styles.text}>Código: {qrData}</Text>
          <Button title="Escanear de nuevo" onPress={() => setScanned(false)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
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
});
