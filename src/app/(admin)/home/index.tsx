import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, ChevronRight } from 'lucide-react-native';
import { useSummaryViewModel } from '../../../viewmodels/useSummaryViewModel';

export default function AdminSummaryScreen() {
  const router = useRouter();
  const { data, loading, error } = useSummaryViewModel();

  if (loading && data.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50 p-6">
        <Text className="text-red-500 text-center font-bold">{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-50 p-6">
      <Text className="text-3xl font-extrabold text-slate-800 mb-2 mt-4">Resumen Académico</Text>
      <Text className="text-slate-500 mb-8">Selecciona un año para ver los cursos de laboratorio.</Text>

      <View className="flex-row flex-wrap justify-between">
        {data.map((yearData) => (
          <TouchableOpacity
            key={yearData.year}
            className="bg-white w-[48%] p-6 rounded-3xl shadow-sm border border-slate-100 mb-4 items-center justify-center"
            onPress={() => router.push(`/(admin)/home/year/${yearData.year}`)}
          >
            <View className="bg-indigo-100 p-4 rounded-full mb-4">
              <Calendar color="#4f46e5" size={32} />
            </View>
            <Text className="text-2xl font-bold text-slate-800">Año {yearData.year}</Text>
            <Text className="text-slate-500 text-sm mt-1">{yearData.courses.length} Cursos</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {data.length === 0 && !loading && (
        <View className="items-center justify-center py-10">
          <Text className="text-slate-400">No hay cursos registrados. Ve a Gestión de Datos para subir el Excel.</Text>
        </View>
      )}
    </ScrollView>
  );
}
