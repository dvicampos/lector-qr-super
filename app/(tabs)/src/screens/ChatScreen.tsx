import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import axios from 'axios';

const ChatScreen = ({
  token,
  usuario,
  setPantallaActual,
}: {
  token: string;
  usuario: any;
  setPantallaActual: (pantalla: string) => void;
}) => {
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');

  const cargarMensajes = async () => {
    try {
      const res = await axios.get(`http://192.168.0.12:8000/api/chat/${usuario.id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMensajes(res.data);
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    }
  };

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim()) return;
    try {
      await axios.post(
        `http://192.168.0.12:8000/api/chat/${usuario.id}/`,
        { contenido: nuevoMensaje },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNuevoMensaje('');
      cargarMensajes();
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    }
  };

  useEffect(() => {
    cargarMensajes();
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Chat con {usuario.username}</Text>

      <FlatList
        data={mensajes}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageContainer,
              item.emisor_username === usuario.username
                ? styles.myMessage // ✅ El mío: IZQUIERDA
                : styles.otherMessage, // ✅ Otro: DERECHA
            ]}
          >
            <Text style={styles.username}>{item.emisor_username}</Text>
            <Text style={styles.messageText}>{item.contenido}</Text>
          </View>
        )}
        contentContainerStyle={styles.messagesList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={nuevoMensaje}
          onChangeText={setNuevoMensaje}
          placeholder="Escribe tu mensaje..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.sendButton} onPress={enviarMensaje}>
          <Text style={styles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setPantallaActual('chats')}
      >
        <Text style={styles.backButtonText}>Volver</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    padding: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  messagesList: {
    flexGrow: 1,
    paddingBottom: 10,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  myMessage: {
    backgroundColor: '#DCF8C6', // verde claro
    alignSelf: 'flex-start', // ✅ IZQUIERDA
  },
  otherMessage: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-end', // ✅ DERECHA
  },
  username: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#0084FF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 15,
    alignSelf: 'center',
  },
  backButtonText: {
    color: '#888',
    fontSize: 16,
  },
});

export default ChatScreen;
