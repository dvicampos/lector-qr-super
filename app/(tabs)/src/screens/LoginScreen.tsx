import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
    Login: undefined;
    Camera: undefined;
};

const LoginScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        await AsyncStorage.clear();

        try {
            const response = await axios.post('http://192.168.0.12:8000/api/token/', {
                username,
                password,
            });

            const token = response.data.access;
            await AsyncStorage.setItem('token', token);
            console.log("TOKEN GUARDADO EN ASYNCSTORAGE:", token);

            navigation.navigate('Camera');

        } catch (err: any) {
            console.log("Error de login:", err);
            if (err.response && err.response.status === 401) {
                setError('Usuario o contraseña incorrectos');
            } else {
                setError('Error de conexión');
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Iniciar sesión</Text>
            <TextInput
                placeholder="Usuario"
                value={username}
                onChangeText={setUsername}
                style={styles.input}
            />
            <TextInput
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <View style={styles.buttonContainer}>
                <Button title="Iniciar sesión" onPress={handleLogin} color="#007bff" />
            </View>
        </View>
    );
};


// import React, { useState } from 'react';
// import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// // interface Props {
// //     onLoginSuccess: (token: string) => void;
// // }

// interface Props {
//     onLoginSuccess?: (token: string) => void; // Nota el "?"
// }

// const LoginScreen: React.FC<Props> = ({ onLoginSuccess }) => {
//     const [username, setUsername] = useState('');
//     const [password, setPassword] = useState('');
//     const [error, setError] = useState('');

    
//     const handleLogin = async () => {
//         await AsyncStorage.clear(); // solo para debug/test

//         try {
//             const response = await axios.post('http://192.168.0.12:8000/api/token/', {
//                 username,
//                 password,
//             });
//             const token = response.data.access;

//             // 👇 Este await es CLAVE
//             await AsyncStorage.setItem('token', token);
//             console.log("TOKEN GUARDADO EN ASYNCSTORAGE:", token);

//             // Solo después de guardar, llamas a onLoginSuccess
//             onLoginSuccess?.(token);

//         } catch (err: any) {
//             console.log("Error de login:", err);
//             if (err.response && err.response.status === 401) {
//                 setError('Usuario o contraseña incorrectos');
//             } else {
//                 setError('Error de conexión');
//             }
//         }
//     };


//     return (
//         <View style={styles.container}>
//             <Text style={styles.title}>Iniciar sesión</Text>
//             <TextInput
//                 placeholder="Usuario"
//                 value={username}
//                 onChangeText={setUsername}
//                 style={styles.input}
//             />
//             <TextInput
//                 placeholder="Contraseña"
//                 value={password}
//                 onChangeText={setPassword}
//                 secureTextEntry
//                 style={styles.input}
//             />
//             {error ? <Text style={styles.errorText}>{error}</Text> : null}
//             <View style={styles.buttonContainer}>
//                 <Button title="Iniciar sesión" onPress={handleLogin} color="#007bff" />
//             </View>
//         </View>
//     );
// };

const styles = StyleSheet.create({
    container: {
        padding: 20,
        marginTop: 100,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
    },
    buttonContainer: {
        marginTop: 10,
        borderRadius: 8,
        overflow: 'hidden',
    },
});

export default LoginScreen;
