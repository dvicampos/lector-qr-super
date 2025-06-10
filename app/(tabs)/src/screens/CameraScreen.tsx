import React, { useState, useContext, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Alert, Modal
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { parse } from 'date-fns';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CameraScreen() {
  const { escuelasupervisor, setEscuelaSupervisor, token, setToken } = useContext(AuthContext);

  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [qrData, setQrData] = useState('');
  const [modalVisible, setModalVisible] = useState(true);
  const [password, setPassword] = useState('');
  const [temperatura, setTemperatura] = useState('');
  const [comentariosAdicionales, setComentariosAdicionales] = useState('');
  const [filteredCAIs, setFilteredCAIs] = useState([]);

  const fetchCAIs = async (search: string) => {
    try {
      const res = await fetch(`http://192.168.0.12:8000/api/cais/?search=${search}`);
      const data = await res.json();
      setFilteredCAIs(data);
    } catch (error) {
      console.error('Error al obtener CAIs:', error);
    }
  };

  useEffect(() => {
    const loadEscuelaSupervisor = async () => {
      try {
        const stored = await AsyncStorage.getItem('escuelasupervisor');
        if (stored && stored.trim().length > 0) {
          setEscuelaSupervisor(stored);
          setModalVisible(false);
        } else {
          setModalVisible(true); // Asegura que el modal se muestre si no hay CAI guardado
        }
      } catch (error) {
        console.error('Error al cargar escuela supervisor:', error);
      }
    };
    loadEscuelaSupervisor();
  }, []);


  const handleModalClose = async () => {
    if (password.trim() !== escuelasupervisor.trim()) {
      Alert.alert('Error', 'La contraseña debe coincidir con el nombre del CAI seleccionado.');
      return;
    }

    await AsyncStorage.setItem('escuelasupervisor', escuelasupervisor);
    setModalVisible(false);
  };

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Necesitamos permiso para usar la cámara</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text style={{ color: '#0ff' }}>Dar permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraFacing = () => setFacing((prev) => (prev === 'back' ? 'front' : 'back'));

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (!scanned) {
      setScanned(true);
      setQrData(data);
      alert(`Código escaneado: ${data}`);
    }
  };

  const enviarAsistencia = async () => {
    if (!temperatura) {
      Alert.alert('Campo requerido', 'Por favor ingresa la temperatura.');
      return;
    }

    try {
      const parsedData = JSON.parse(qrData);
      const fechaStr = parsedData.fecha;
      const horaStr = parsedData.hora.replace(/\s+/g, ' ').trim();
      const fechaHora = parse(`${fechaStr} ${horaStr}`, "d/M/yyyy h:mm:ss a", new Date());

      const formattedData = {
        nombre_persona: parsedData.nombre,
        apellidos: parsedData.apellidos,
        cai: parsedData.cai,
        fecha_hora: fechaHora,
        escuelasupervisor,
        temperatura,
        comentarios_adicionales: comentariosAdicionales,
      };

      const response = await fetch('http://192.168.0.12:8000/api/asistencias/registrar/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData),
      });

      const result = await response.json();
      alert(result.message || 'No se pudo registrar la asistencia');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al enviar asistencia');
    }
  };

  return (
    <View style={styles.container}>
      {/* MODAL SELECCIÓN DE CAI */}
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
              placeholder="Buscar CAI..."
              placeholderTextColor="#aaa"
            />

            {filteredCAIs.length > 0 && (
              <ScrollView style={{ maxHeight: 150, width: '100%' }}>
                {filteredCAIs.map((cai) => (
                  <TouchableOpacity
                    key={cai.id}
                    onPress={() => {
                      setEscuelaSupervisor(cai.nombre);
                      setFilteredCAIs([]);
                    }}
                    style={styles.caiItem}
                  >
                    <Text>{cai.nombre}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Confirmar CAI como contraseña"
              placeholderTextColor="#aaa"
              secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleModalClose}>
              <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* CÁMARA */}
      <CameraView
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
            <Text style={styles.flipText}>🔄 Voltear cámara</Text>
          </TouchableOpacity>
          {escuelasupervisor && (
            <View style={styles.supervisorContainer}>
              <Text style={styles.supervisorText}>Supervisor: {escuelasupervisor}</Text>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => {
                  setToken(null);
                  setEscuelaSupervisor('');
                  AsyncStorage.removeItem('escuelasupervisor');
                }}
              >
                <Text style={styles.logoutText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </CameraView>

      {scanned && (
        <View style={styles.formContainer}>
          <Text style={styles.title}>Datos escaneados</Text>
          <Text>QR: {qrData}</Text>

          <TextInput
            style={styles.input}
            placeholder="Temperatura"
            value={temperatura}
            onChangeText={setTemperatura}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Comentarios adicionales"
            value={comentariosAdicionales}
            onChangeText={setComentariosAdicionales}
          />

          <TouchableOpacity style={styles.button} onPress={enviarAsistencia}>
            <Text style={styles.buttonText}>Enviar asistencia</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#999' }]}
            onPress={() => {
              setScanned(false);
              setQrData('');
              setTemperatura('');
              setComentariosAdicionales('');
            }}
          >
            <Text style={styles.buttonText}>Escanear otro QR</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: '2%' },
  camera: { flex: 1 },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  flipButton: { padding: 10 },
  flipText: { color: '#0ff', fontWeight: 'bold' },
  logoutButton: { marginTop: 5 },
  logoutText: { color: '#f00', fontWeight: 'bold' },
  formContainer: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: {
    backgroundColor: '#eee',
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#0ff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: { color: '#000', fontWeight: 'bold' },
  message: { color: '#0ff', textAlign: 'center', margin: 20 },
  supervisorContainer: {
    alignItems: 'flex-end',
  },
  supervisorText: {
    color: '#0ff',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  caiItem: {
    padding: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
});


// import React, { useState, useContext, useEffect } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
// import { CameraView, useCameraPermissions } from 'expo-camera';
// import { parse, format } from 'date-fns';
// import { AuthContext } from '../context/AuthContext';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export default function CameraScreen() {
//   const { escuelasupervisor, token, setToken, setEscuelaSupervisor } = useContext(AuthContext);

//   const [facing, setFacing] = useState<'back' | 'front'>('back');
//   const [permission, requestPermission] = useCameraPermissions();
//   const [scanned, setScanned] = useState(false);
//   const [qrData, setQrData] = useState('');
//   const [modalVisible, setModalVisible] = useState(true);
//   const [temperatura, setTemperatura] = useState('');
//   const [comentariosAdicionales, setComentariosAdicionales] = useState('');
//   const [filteredCAIs, setFilteredCAIs] = useState([]);

//   const fetchCAIs = async (search) => {
//     try {
//       const response = await fetch(`http://192.168.0.12:8000/api/cais/?search=${search}`);
//       const data = await response.json();
//       setFilteredCAIs(data);
//     } catch (error) {
//       console.error('Error al obtener CAIs:', error);
//     }
//   };

//   useEffect(() => {
//     const loadEscuelaSupervisor = async () => {
//       try {
//         const storedEscuela = await AsyncStorage.getItem('escuelasupervisor');
//         if (storedEscuela) {
//           setEscuelaSupervisor(storedEscuela);
//         }
//       } catch (error) {
//         console.error('Error al cargar escuela supervisor:', error);
//       }
//     };
//     loadEscuelaSupervisor();
//   }, []);


//   if (!permission) return <View style={styles.container} />;
//   if (!permission.granted) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.message}>Necesitamos permiso para usar la cámara</Text>
//         <TouchableOpacity onPress={requestPermission}>
//           <Text style={{ color: '#0ff' }}>Dar permiso</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   const toggleCameraFacing = () => setFacing((prev) => (prev === 'back' ? 'front' : 'back'));

//   const handleBarCodeScanned = ({ data }: { data: string }) => {
//     if (!scanned) {
//       setScanned(true);
//       setQrData(data);
//       alert(`Código escaneado: ${data}`);
//     }
//   };

//   const enviarAsistencia = async () => {
//     if (!temperatura) {
//       Alert.alert('Campo requerido', 'Por favor ingresa la temperatura.');
//       return;
//     }

//     try {
//       const parsedData = JSON.parse(qrData);
//       const fechaStr = parsedData.fecha;
//       const horaStr = parsedData.hora.replace(/\s+/g, ' ').trim();
//       const fechaHora = parse(`${fechaStr} ${horaStr}`, "d/M/yyyy h:mm:ss a", new Date());

//       const formattedData = {
//         nombre_persona: parsedData.nombre,
//         apellidos: parsedData.apellidos,
//         cai: parsedData.cai,
//         fecha_hora: fechaHora,
//         escuelasupervisor: escuelasupervisor,
//         temperatura: temperatura,
//         comentarios_adicionales: comentariosAdicionales,
//       };

//       const response = await fetch('http://192.168.0.12:8000/api/asistencias/registrar/', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formattedData),
//       });

//       const result = await response.json();
//       alert(result.message || 'No se pudo registrar la asistencia');
//     } catch (error) {
//       console.error('Error:', error);
//       alert('Error al enviar asistencia');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <CameraView
//         style={styles.camera}
//         facing={facing}
//         onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
//       >
//         <View style={styles.buttonContainer}>
//           <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
//             <Text style={styles.flipText}>🔄 Voltear cámara</Text>
//           </TouchableOpacity>
          
//           {escuelasupervisor && (
//             <View style={styles.supervisorContainer}>
//               <Text style={styles.supervisorText}>Supervisor: {escuelasupervisor}</Text>
//               <TouchableOpacity
//                 style={styles.logoutButton}
//                 onPress={() => {
//                   setToken(null);
//                   setEscuelaSupervisor('');
//                 }}
//               >
//                 <Text style={styles.logoutText}>Cerrar sesión</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>
//       </CameraView>

//       {scanned && (
//         <View style={styles.formContainer}>
//           <Text style={styles.title}>Datos escaneados</Text>
//           <Text>QR: {qrData}</Text>

//           <TextInput
//             style={styles.input}
//             placeholder="Temperatura"
//             value={temperatura}
//             onChangeText={setTemperatura}
//             keyboardType="numeric"
//           />
//           <TextInput
//             style={styles.input}
//             placeholder="Comentarios adicionales"
//             value={comentariosAdicionales}
//             onChangeText={setComentariosAdicionales}
//           />

//           <TouchableOpacity style={styles.button} onPress={enviarAsistencia}>
//             <Text style={styles.buttonText}>Enviar asistencia</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.button, { backgroundColor: '#999' }]}
//             onPress={() => {
//               setScanned(false);
//               setQrData('');
//               setTemperatura('');
//               setComentariosAdicionales('');
//             }}
//           >
//             <Text style={styles.buttonText}>Escanear otro QR</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#000', padding: '2%'},
//   camera: { flex: 1 },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     padding: 10,
//     backgroundColor: 'rgba(0,0,0,0.5)'
//   },
//   flipButton: { padding: 10 },
//   flipText: { color: '#0ff', fontWeight: 'bold' },
//   logoutButton: { marginTop: 5 },
//   logoutText: { color: '#f00', fontWeight: 'bold' },
//   formContainer: { padding: 20, backgroundColor: '#fff' },
//   title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
//   input: {
//     backgroundColor: '#eee',
//     marginBottom: 10,
//     padding: 10,
//     borderRadius: 8
//   },
//   button: {
//     backgroundColor: '#0ff',
//     padding: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginBottom: 10
//   },
//   buttonText: { color: '#000', fontWeight: 'bold' },
//   message: { color: '#0ff', textAlign: 'center', margin: 20 },
//   supervisorContainer: {
//     alignItems: 'flex-end'
//   },
//   supervisorText: {
//     color: '#0ff',
//     fontSize: 12,
//     fontWeight: 'bold',
//     marginBottom: 5
//   }
// });
