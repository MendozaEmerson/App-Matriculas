import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { adminStore } from '../../../../store/adminStore';
import { BookOpen, ArrowLeft, ChevronRight } from 'lucide-react-native';

export default function YearScreen() {
  const { year } = useLocalSearchParams();
  const router = useRouter();
  
  const yearData = adminStore.summaryData.find(y => String(y.year) === String(year));
  const courses = yearData ? yearData.courses : [];

  return (
    <ScrollView className="flex-1 bg-slate-50 p-6">
      <TouchableOpacity onPress={() => router.back()} className="flex-row items-center mb-6">
        <ArrowLeft color="#64748b" size={24} />
        <Text className="text-slate-500 font-bold ml-2">Volver al Resumen</Text>
      </TouchableOpacity>
      
      <Text className="text-3xl font-extrabold text-slate-800 mb-2 mt-2">Año {year}</Text>
      <Text className="text-slate-500 mb-8">Selecciona un curso para ver sus laboratorios y cupos.</Text>

      {courses.map((course: any) => (
        <TouchableOpacity
          key={course.id}
          className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-4 flex-row items-center justify-between"
          onPress={() => router.push(`/(admin)/home/course/${course.id}`)}
        >
          <View className="flex-row items-center flex-1">
            <View className="bg-indigo-50 p-3 rounded-xl mr-4">
              <BookOpen color="#4f46e5" size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-slate-800">{course.name}</Text>
              <Text className="text-slate-500 text-sm mt-1">Lab: {course.lab_code}</Text>
            </View>
          </View>
          <ChevronRight color="#cbd5e1" size={24} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
