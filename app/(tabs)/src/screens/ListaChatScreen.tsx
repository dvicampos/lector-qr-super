import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios';

const ListaChatScreen = ({ token, setPantallaActual, abrirChatConUsuario }: 
  { token: string, setPantallaActual: (pantalla: string) => void, abrirChatConUsuario: (usuario: any) => void }) => {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const response = await axios.get('http://192.168.0.12:8000/api/lista_usuarios/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsuarios(response.data.usuarios || response.data);
      } catch (err) {
        console.error("Error al cargar usuarios:", err);
      }
    };

    cargarUsuarios();
  }, [token]);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.usuarioCard}
      onPress={() => abrirChatConUsuario(item)}
    >
      <Text style={styles.usuarioText}>Usuario: {item.username}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Usuarios del Chat</Text>
      {usuarios.length === 0 ? (
        <Text style={styles.noUsuarios}>No hay usuarios disponibles</Text>
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.lista}
        />
      )}
      <TouchableOpacity style={styles.boton} onPress={() => setPantallaActual('inicio')}>
        <Text style={styles.textoBoton}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7', padding: 20, justifyContent: 'center' },
  titulo: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333', textAlign: 'center' },
  lista: { paddingBottom: 20 },
  usuarioCard: {
    backgroundColor: '#fff', padding: 15, marginVertical: 8, borderRadius: 10,
    shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 1 },
    shadowRadius: 5, elevation: 3,
  },
  usuarioText: { fontSize: 18, color: '#444' },
  noUsuarios: { textAlign: 'center', fontSize: 16, color: '#999' },
  boton: { backgroundColor: '#007AFF', paddingVertical: 15, borderRadius: 10, marginTop: 20, alignItems: 'center' },
  textoBoton: { color: 'white', fontWeight: 'bold', fontSize: 18 },
});

export default ListaChatScreen;


// import React, { useEffect, useState } from 'react';
// import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
// import axios from 'axios';

// const ListaChatScreen = ({ token, setPantallaActual }: { token: string, setPantallaActual: (pantalla: string) => void }) => {
//   const [usuarios, setUsuarios] = useState([]);

//   useEffect(() => {
//     const cargarUsuarios = async () => {
//       try {
//         const response = await axios.get('http://192.168.0.12:8000/api/usuarios_chat/', {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         setUsuarios(response.data.usuarios || response.data);
//       } catch (err) {
//         console.error("Error al cargar usuarios:", err);
//       }
//     };

//     cargarUsuarios();
//   }, [token]);

//   const renderItem = ({ item }: { item: any }) => (
//     <View style={styles.usuarioCard}>
//       <Text style={styles.usuarioText}>Usuario: {item.username}</Text>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <Text style={styles.titulo}>Usuarios del Chat</Text>
//       {usuarios.length === 0 ? (
//         <Text style={styles.noUsuarios}>No hay usuarios disponibles</Text>
//       ) : (
//         <FlatList
//           data={usuarios}
//           keyExtractor={(item) => item.id.toString()}
//           renderItem={renderItem}
//           contentContainerStyle={styles.lista}
//         />
//       )}
//       <TouchableOpacity style={styles.boton} onPress={() => setPantallaActual('inicio')}>
//         <Text style={styles.textoBoton}>Volver</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f2f2f7',
//     padding: 20,
//     justifyContent: 'center',
//   },
//   titulo: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     color: '#333',
//     textAlign: 'center',
//   },
//   lista: {
//     paddingBottom: 20,
//   },
//   usuarioCard: {
//     backgroundColor: '#fff',
//     padding: 15,
//     marginVertical: 8,
//     borderRadius: 10,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 1 },
//     shadowRadius: 5,
//     elevation: 3,
//   },
//   usuarioText: {
//     fontSize: 18,
//     color: '#444',
//   },
//   noUsuarios: {
//     textAlign: 'center',
//     fontSize: 16,
//     color: '#999',
//   },
//   boton: {
//     backgroundColor: '#007AFF',
//     paddingVertical: 15,
//     borderRadius: 10,
//     marginTop: 20,
//     alignItems: 'center',
//   },
//   textoBoton: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 18,
//   },
// });

// export default ListaChatScreen;
