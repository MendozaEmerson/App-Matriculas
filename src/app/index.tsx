import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { authStore } from '../store/authStore';

export default function Index() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkSavedSession() {
      try {
        const session = await authStore.loadSession();
        if (session && session.role === 'admin') {
          router.replace('/(admin)/home');
          return;
        } else if (session && session.role === 'student') {
          router.replace('/(student)');
          return;
        }
      } catch (e) {
        console.error('Error verificando sesión guardada:', e);
      } finally {
        setChecking(false);
      }

      // Si no hay sesión o falló, ir al login
      router.replace('/(auth)/login');
    }

    checkSavedSession();
  }, [router]);

  return (
    <View className="flex-1 justify-center items-center bg-slate-900">
      <ActivityIndicator size="large" color="#6366f1" />
      <Text className="text-slate-400 font-bold text-sm mt-4">Iniciando App Matrículas...</Text>
    </View>
  );
}
