import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import CameraScreen from './src/screens/CameraScreen'; // 👈 asegúrate que esté importado correctamente

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
    return (
        <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Camera" component={CameraScreen} /> {/* 👈 ESTA ES LA CLAVE */}
        </Stack.Navigator>
    );
}
