import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { adminStore } from '../../../../store/adminStore';
import { ArrowLeft, Users } from 'lucide-react-native';

export default function CourseScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  // Buscar el curso dentro del store global
  let course: any = null;
  for (const yearData of adminStore.summaryData) {
    const found = yearData.courses.find((c: any) => String(c.id) === String(id));
    if (found) {
      course = found;
      break;
    }
  }

  if (!course) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <Text>Curso no encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-50 p-6">
      <TouchableOpacity onPress={() => router.back()} className="flex-row items-center mb-6">
        <ArrowLeft color="#64748b" size={24} />
        <Text className="text-slate-500 font-bold ml-2">Volver a los Cursos</Text>
      </TouchableOpacity>
      
      <Text className="text-3xl font-extrabold text-slate-800 mb-2 mt-2 leading-tight">{course.name}</Text>
      <Text className="text-slate-500 mb-8 font-semibold">Código Lab: {course.lab_code} • Semestre {course.semester}</Text>

      {course.groups.map((group: any) => (
        <View key={group.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-4 flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className="bg-slate-100 p-3 rounded-xl mr-4">
              <Users color="#64748b" size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-slate-800">Grupo {group.name}</Text>
              <Text className="text-slate-500 text-sm mt-1">{group.schedule_range}</Text>
            </View>
          </View>
          
          <View className={`px-4 py-2 rounded-full ml-2 ${group.is_full ? 'bg-red-100 border border-red-200' : 'bg-emerald-100 border border-emerald-200'}`}>
            <Text className={`font-bold text-sm ${group.is_full ? 'text-red-700' : 'text-emerald-700'}`}>
              {group.initial_vacancies - group.available_vacancies}/{group.initial_vacancies} {group.is_full ? 'Llenos' : 'Ocupados'}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
