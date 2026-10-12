import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { authStore } from '../../store/authStore';
import { GraduationCap, LogOut, Mail, Hash } from 'lucide-react-native';

export default function StudentProfile() {
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar tu sesión de estudiante?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await authStore.clearSession();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-slate-50 p-6 items-center justify-between">
      <View className="w-full items-center mt-8">
        {/* Avatar */}
        <View className="bg-emerald-600 w-24 h-24 rounded-full items-center justify-center shadow-lg border-4 border-emerald-200 mb-4">
          <GraduationCap color="white" size={44} />
        </View>

        <Text className="text-2xl font-black text-slate-800">
          {authStore.firstName || 'Estudiante'}
        </Text>
        <Text className="text-emerald-600 font-bold text-sm mt-0.5">Estudiante Pregrado UNSA</Text>

        {/* Ficha de Información */}
        <View className="bg-white rounded-3xl p-6 w-full shadow-sm border border-slate-200 mt-8">
          <View className="flex-row items-center py-3 border-b border-slate-100">
            <Hash color="#64748b" size={20} className="mr-3" />
            <View>
              <Text className="text-xs font-bold text-slate-400 uppercase">CUI</Text>
              <Text className="text-base font-bold text-slate-800">
                {authStore.cui || 'No especificado'}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center py-3">
            <Mail color="#64748b" size={20} className="mr-3" />
            <View>
              <Text className="text-xs font-bold text-slate-400 uppercase">Correo Institucional</Text>
              <Text className="text-base font-bold text-slate-800">
                {authStore.email || `${authStore.cui}@unsa.edu.pe`}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Botón Cerrar Sesión */}
      <View className="w-full mb-8">
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-500 py-4 px-6 rounded-2xl flex-row items-center justify-center shadow-md active:bg-red-600"
        >
          <LogOut color="white" size={20} className="mr-2" />
          <Text className="text-white font-black text-base">Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
