import React, { useState, useEffect, useContext } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CAISelectionScreen() {
  const { escuelasupervisor, setEscuelaSupervisor } = useContext(AuthContext);
  const [filteredCAIs, setFilteredCAIs] = useState([]);
  const [password, setPassword] = useState('');

  const fetchCAIs = async (search) => {
    try {
      const response = await fetch(`http://192.168.0.12:8000/api/cais/?search=${search}`);
      const data = await response.json();
      setFilteredCAIs(data);
    } catch (error) {
      console.error('Error fetching CAIs:', error);
    }
  };

  useEffect(() => {
    if (escuelasupervisor) {
      fetchCAIs(escuelasupervisor);
    }
  }, []);

  const handleSave = async () => {
    if (password.trim() !== escuelasupervisor.trim()) {
      Alert.alert('Error', 'La contraseña debe ser igual al nombre del CAI seleccionado.');
      return;
    }
    await AsyncStorage.setItem('escuelasupervisor', escuelasupervisor);
    Alert.alert('Guardado', 'CAI guardado correctamente.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecciona tu CAI</Text>

      <TextInput
        style={styles.input}
        placeholder="Buscar CAI"
        value={escuelasupervisor}
        onChangeText={(text) => {
          setEscuelaSupervisor(text);
          fetchCAIs(text);
        }}
      />

      {filteredCAIs.length > 0 && (
        <ScrollView style={{ maxHeight: 150, marginBottom: 10 }}>
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
      )}

      <TextInput
        style={styles.input}
        placeholder="Confirma CAI como contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Guardar CAI</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20 },
  title: { fontSize:20, fontWeight:'bold', marginBottom:15, textAlign:'center' },
  input: { backgroundColor:'#eee', marginBottom:15, padding:10, borderRadius:8 },
  caiItem: { padding:10, backgroundColor:'#ddd', marginBottom:5, borderRadius:6 },
  button: { backgroundColor:'#0ff', padding:15, borderRadius:8, alignItems:'center' },
  buttonText: { fontWeight:'bold', color:'#000' },
});
