import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';

const AvisosScreen = ({ setPantallaActual }) => {
  const [avisos, setAvisos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAvisos = async () => {
      try {
        const response = await fetch('http://192.168.0.12:8000/api/avisos/'); // API de avisos
        const data = await response.json();
        setAvisos(data.avisos);
      } catch (error) {
        console.error('Error fetching avisos:', error);
      } finally {
        setIsLoading(false); // Finaliza la carga
      }
    };

    fetchAvisos();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📢 Avisos</Text>
      
      {isLoading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={avisos}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.avisoContainer}>
              <Text style={styles.avisoTitle}>{item.titulo}</Text>
              <Text style={styles.avisoDescription}>{item.descripcion}</Text>
              <Text style={styles.avisoDate}>📅 {item.fecha}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyList}>No hay avisos disponibles por ahora.</Text>
          }
        />
      )}

      {/* Botones de redirección */}
      <View style={styles.navigationButtons}>
        <TouchableOpacity style={styles.button} onPress={() => setPantallaActual('inicio')}>
          <Text style={styles.buttonText}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setPantallaActual('hijos')}>
          <Text style={styles.buttonText}>Hijos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  avisoContainer: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  avisoTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#007bff',
  },
  avisoDescription: {
    fontSize: 16,
    marginTop: 5,
    color: '#555',
  },
  avisoDate: {
    fontSize: 14,
    color: '#888',
    marginTop: 10,
    fontStyle: 'italic',
  },
  emptyList: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 50,
  },
  navigationButtons: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AvisosScreen;