import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useStudentCoursesViewModel } from '../../viewmodels/useStudentCoursesViewModel';
import { Calendar } from 'lucide-react-native';

export default function EnrollScreen() {
  const { data, loading, enrollingId, handleEnroll } = useStudentCoursesViewModel();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  if (loading && data.pending.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  // Agrupar cursos pendientes por año
  const coursesByYear: Record<number, any[]> = {};
  data.pending.forEach((course: any) => {
    if (!coursesByYear[course.year]) {
      coursesByYear[course.year] = [];
    }
    coursesByYear[course.year].push(course);
  });

  const years = Object.keys(coursesByYear).map(Number).sort();

  return (
    <ScrollView className="flex-1 bg-slate-50 p-6">
      <Text className="text-3xl font-extrabold text-slate-800 mb-2 mt-2">Matricularse</Text>
      <Text className="text-slate-500 mb-8">Selecciona el año y elige tu horario de laboratorio.</Text>

      {years.length === 0 && !loading ? (
        <View className="items-center mt-10">
          <Text className="text-slate-500 italic text-center text-lg">No tienes cursos pendientes de matrícula.</Text>
        </View>
      ) : (
        years.map(year => (
          <View key={year} className="mb-6">
            <TouchableOpacity 
              className={`flex-row items-center p-4 rounded-2xl ${selectedYear === year ? 'bg-indigo-600' : 'bg-white shadow-sm border border-slate-200'}`}
              onPress={() => setSelectedYear(selectedYear === year ? null : year)}
            >
              <Calendar color={selectedYear === year ? "white" : "#4f46e5"} size={24} className="mr-4" />
              <Text className={`text-xl font-bold flex-1 ${selectedYear === year ? 'text-white' : 'text-slate-800'}`}>Año {year}</Text>
              <Text className={selectedYear === year ? 'text-indigo-200' : 'text-slate-500 font-semibold'}>
                {coursesByYear[year].length} Cursos pendientes
              </Text>
            </TouchableOpacity>

            {/* Lista de cursos de este año si está seleccionado */}
            {selectedYear === year && (
              <View className="mt-4 pl-4 border-l-2 border-indigo-200">
                {coursesByYear[year].map((course: any) => (
                  <View key={course.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-4">
                    <Text className="text-lg font-bold text-slate-800">{course.name}</Text>
                    <Text className="text-slate-500 mb-4 font-semibold">Código Lab: {course.lab_code}</Text>

                    {course.groups.map((group: any) => (
                      <View key={group.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-3 flex-row items-center justify-between">
                        <View className="flex-1 mr-4">
                          <Text className="font-bold text-slate-800 text-base">Grupo {group.name}</Text>
                          <Text className="text-slate-500 text-sm mt-1">{group.schedule_range}</Text>
                        </View>
                        
                        <View className="items-end">
                          <View className={`px-2 py-1 rounded-md mb-2 border ${group.is_full ? 'bg-red-100 border-red-200' : 'bg-emerald-100 border-emerald-200'}`}>
                            <Text className={`text-xs font-bold ${group.is_full ? 'text-red-700' : 'text-emerald-700'}`}>
                              {group.initial_vacancies - group.available_vacancies}/{group.initial_vacancies} {group.is_full ? 'Lleno' : 'Disp.'}
                            </Text>
                          </View>
                          <TouchableOpacity
                            className={`px-4 py-2 rounded-lg ${group.is_full ? 'bg-slate-300' : 'bg-indigo-600'}`}
                            disabled={group.is_full || enrollingId !== null}
                            onPress={() => handleEnroll(group.id)}
                          >
                            {enrollingId === group.id ? (
                              <ActivityIndicator color="white" size="small" />
                            ) : (
                              <Text className={`font-bold ${group.is_full ? 'text-slate-500' : 'text-white'}`}>Matricular</Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}
