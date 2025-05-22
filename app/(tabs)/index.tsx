import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { Modal, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { format, parse } from 'date-fns';
import { ScrollView } from 'react-native';

export default function App() {
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [qrData, setQrData] = useState('');
  const [escuelasupervisor, setEscuelaSupervisor] = useState('');
  const [modalVisible, setModalVisible] = useState(true); // Estado para mostrar el modal
  const [filteredCAIs, setFilteredCAIs] = useState([]);
  const [password, setPassword] = useState('');

  const fetchCAIs = async (search) => {
    try {
      const response = await fetch(`http://192.168.0.8:8000/api/cais/?search=${search}`);
      const data = await response.json();
      setFilteredCAIs(data); // Asegúrate de que la API responda con una lista de CAIs
    } catch (error) {
      console.error('Error al obtener CAIs:', error);
    }
  };


  // Cargar comentario desde AsyncStorage al iniciar la app
  useEffect(() => {
    const loadEscuelaSupervisor = async () => {
      const storedloadEscuelaSupervisor = await AsyncStorage.getItem('escuelasupervisor');
      if (storedloadEscuelaSupervisor) {
        setEscuelaSupervisor(storedloadEscuelaSupervisor); // Si existe en el storage, lo carga
        setModalVisible(false); // Si ya hay comentario guardado, no mostramos el modal
      }
    };
    loadEscuelaSupervisor();
  }, []);

  // Guardar comentario en AsyncStorage cuando se cierra el modal
  const handleModalClose = async () => {
    if (password.trim() !== escuelasupervisor.trim()) {
      alert('La contraseña debe ser igual al nombre del CAI seleccionado.');
      return;
    }

    await AsyncStorage.setItem('escuelasupervisor', escuelasupervisor); // Guarda el comentario
    setModalVisible(false); // Cierra el modal
  };

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

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (!scanned) {
      setScanned(true);
      setQrData(data);

      alert(`Código escaneado: ${data}`);

      try {
        const parsedData = JSON.parse(data); // Se asegura que los datos están en formato JSON
        console.log(`${parsedData.fecha} ${parsedData.hora}`)
        // fechas
        const fechaStr = parsedData.fecha;  // '9/4/2025'
        const horaStr = parsedData.hora;    // '7:10:01 p.m.'
        const horaStrNormalizada = horaStr.replace(/\s+/g, ' ').trim();
        const fechaHoraStr = `${fechaStr} ${horaStrNormalizada}`;  // '9/4/2025 7:10:01 p.m.'
        const fechaHora = parse(fechaHoraStr, "d/M/yyyy h:mm:ss a", new Date());

        // Ahora, formateamos la fecha combinada en el formato correcto
        const fechaFormateada = format(fechaHora, "yyyy-MM-dd HH:mm:ss.SSSxxx");
        console.log(fechaFormateada);
        // Modificamos el objeto para que coincida con los campos de Django
        const formattedData = {
          nombre_persona: parsedData.nombre,
          apellidos: parsedData.apellidos,
          cai: parsedData.cai,
          fecha_hora: fechaHora,
          escuelasupervisor: escuelasupervisor, // Comentario con persistencia
        };

        const response = await fetch('http://192.168.0.8:8000/api/asistencias/registrar/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formattedData),
        });

        const result = await response.json();
        if (result.message) {
          alert(result.message); // Mensaje de éxito o error
        } else {
          alert('No se pudo registrar la asistencia.');
        }
      } catch (error) {
        console.error('Error al registrar asistencia:', error);
        alert('Error al registrar asistencia');
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Modal para ingresar el comentario */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Selecciona tu CAI</Text>

            <TextInput
            style={styles.input}
            value={escuelasupervisor}
            onChangeText={(text) => {
              setEscuelaSupervisor(text);
              fetchCAIs(text);
            }}
            placeholder="Escribe para buscar..."
            placeholderTextColor="#ccc"
            />

            {filteredCAIs.length > 0 && (
            <View style={{ maxHeight: '40%', marginTop: 10 }}>
              <ScrollView>
                {filteredCAIs.map((cai) => (
                  <TouchableOpacity
                    key={cai.id}
                    style={styles.caiItem}
                    onPress={() => {
                      setEscuelaSupervisor(cai.nombre);
                      setFilteredCAIs([]);
                    }}
                  >
                    <Text>{cai.nombre}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            )}

            <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Confirma el CAI como contraseña"
            placeholderTextColor="#ccc"
            secureTextEntry
            />

            <TouchableOpacity
            style={styles.saveButton}
            onPress={handleModalClose}
            >
            <Text style={styles.saveText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Cámara */}
      <CameraView
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
            <Text style={styles.flipText}>🔄 Voltear cámara</Text>
          </TouchableOpacity>
          {/* Mostrar comentario debajo del botón */}
          {escuelasupervisor && <Text style={styles.EscuelaSupervisorText}>CAI: {escuelasupervisor}</Text>}
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
  EscuelaSupervisorText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
    fontWeight: 'bold',
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
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#0ff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  saveText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  caiItem: {
    backgroundColor: '#eee',
    padding: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    width: '100%',
  },  
});
