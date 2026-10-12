import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { adminStore } from '../../../../store/adminStore';
import { BookOpen, ArrowLeft, ChevronRight, Layers } from 'lucide-react-native';

export default function YearScreen() {
  const { year } = useLocalSearchParams();
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      const yearFound = adminStore.summaryData.find(y => String(y.year) === String(year));
      setCourses(yearFound ? yearFound.courses : []);
    }, [year])
  );

  return (
    <ScrollView className="flex-1 bg-slate-50 p-6">
      <TouchableOpacity
        onPress={() => router.back()}
        className="flex-row items-center mb-6 self-start py-1 pr-3"
      >
        <ArrowLeft color="#64748b" size={22} />
        <Text className="text-slate-500 font-bold ml-2 text-base">Volver al Resumen</Text>
      </TouchableOpacity>
      
      <View className="mb-6">
        <View className="bg-indigo-100 self-start px-3 py-1 rounded-full mb-2">
          <Text className="text-indigo-800 font-bold text-xs uppercase tracking-wider">Malla Curricular</Text>
        </View>
        <Text className="text-3xl font-black text-slate-800">Año {year}</Text>
        <Text className="text-slate-500 font-medium text-sm mt-1">
          Selecciona una asignatura para gestionar sus grupos, horarios y cupos.
        </Text>
      </View>

      {courses.length === 0 ? (
        <View className="bg-white p-8 rounded-3xl border border-slate-200 items-center justify-center my-4">
          <BookOpen color="#94a3b8" size={36} className="mb-2 opacity-50" />
          <Text className="text-slate-600 font-bold text-base text-center">No hay asignaturas en este año</Text>
        </View>
      ) : (
        courses.map((course: any) => (
          <TouchableOpacity
            key={course.id}
            activeOpacity={0.7}
            className="bg-white p-5 rounded-3xl shadow-xs border border-slate-200 mb-4 flex-row items-center justify-between"
            onPress={() => router.push(`/(admin)/home/course/${course.id}` as any)}
          >
            <View className="flex-row items-center flex-1 mr-3">
              <View className="bg-indigo-50 p-3 rounded-2xl mr-4 border border-indigo-100">
                <BookOpen color="#4f46e5" size={24} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-black text-slate-800 leading-snug">{course.name}</Text>
                <View className="flex-row items-center mt-1.5 flex-wrap gap-2">
                  <Text className="text-slate-500 text-xs font-semibold">
                    Lab: {course.lab_code || 'N/A'}
                  </Text>
                  <View className="bg-slate-100 px-2 py-0.5 rounded-md flex-row items-center">
                    <Layers color="#64748b" size={12} className="mr-1" />
                    <Text className="text-slate-600 font-bold text-xs">
                      {course.groups?.length || 0} {(course.groups?.length === 1) ? 'grupo' : 'grupos'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <ChevronRight color="#94a3b8" size={22} />
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}
