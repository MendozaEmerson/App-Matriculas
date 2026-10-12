import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { AuthService } from '../services/AuthService';
import { authStore } from '../store/authStore';

export function useLoginViewModel() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [cui, setCui] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !cui) {
      Alert.alert('Datos incompletos', 'Por favor ingresa tu correo institucional y tu contraseña (CUI).');
      return;
    }

    setLoading(true);
    try {
      const userData = await AuthService.login(email.trim().toLowerCase(), cui.trim());
      
      // Guardar sesión persistente en el dispositivo
      await authStore.saveSession({
        role: userData.role,
        cui: userData.cui || '',
        firstName: userData.first_name || (userData.role === 'admin' ? 'Administrador' : 'Alumno'),
        email: email.trim().toLowerCase(),
      });

      // Redirigir según el rol
      if (userData.role === 'admin') {
        router.replace('/(admin)/home');
      } else {
        router.replace('/(student)');
      }
    } catch (error: any) {
      Alert.alert('Acceso Denegado', error.message);
    } finally {
      setLoading(false);
    }
  };

  return { email, setEmail, cui, setCui, loading, handleLogin };
}
