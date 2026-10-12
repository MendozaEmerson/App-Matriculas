import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useStudentCoursesViewModel } from '../../viewmodels/useStudentCoursesViewModel';
import { AlertCircle, CheckCircle2, BookOpen, ShieldCheck, Download } from 'lucide-react-native';

export default function MisCursosScreen() {
  const {
    data,
    loading,
    downloadingPdf,
    canDownloadConstancia,
    isFullyEnrolled,
    handleDownloadConstancia,
  } = useStudentCoursesViewModel();

  if (loading && data.pending.length === 0 && data.enrolled.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-50 p-6">
      <Text className="text-3xl font-extrabold text-slate-800 mb-6 mt-2">Resumen Académico</Text>

      {/* Cursos por Matricular */}
      <View className="mb-8">
        <View className="flex-row items-center mb-4">
          <AlertCircle color="#dc2626" size={24} />
          <Text className="text-xl font-bold text-red-600 ml-2">Cursos por Matricular</Text>
        </View>
        
        {data.pending.length === 0 ? (
          <Text className="text-slate-500 italic">No tienes matrículas pendientes.</Text>
        ) : (
          data.pending.map((course: any) => (
            <View key={course.id} className="bg-white p-5 rounded-2xl shadow-sm border border-red-100 mb-4">
              <Text className="text-lg font-bold text-slate-800">{course.name}</Text>
              <Text className="text-slate-500 text-sm mb-3">Lab: {course.lab_code}</Text>
              
              <View className="flex-row flex-wrap gap-2">
                {course.groups.map((g: any) => (
                  <View key={g.id} className={`px-3 py-1.5 rounded-lg border ${g.is_full ? 'bg-slate-100 border-slate-200 opacity-50' : 'bg-emerald-50 border-emerald-200'}`}>
                    <Text className={`font-bold ${g.is_full ? 'text-slate-500' : 'text-emerald-700'}`}>Grupo {g.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </View>

      {/* Cursos Matriculados */}
      <View className="mb-8">
        <View className="flex-row items-center mb-4">
          <CheckCircle2 color="#059669" size={24} />
          <Text className="text-xl font-bold text-emerald-600 ml-2">Laboratorios Matriculados</Text>
        </View>
        
        {data.enrolled.length === 0 ? (
          <Text className="text-slate-500 italic">Aún no te has matriculado en ningún laboratorio.</Text>
        ) : (
          data.enrolled.map((course: any) => (
            <View key={course.id} className="bg-emerald-50 p-5 rounded-2xl shadow-sm border border-emerald-100 mb-4 flex-row items-center">
              <View className="bg-emerald-100 p-3 rounded-xl mr-4">
                <BookOpen color="#059669" size={24} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-emerald-900">{course.name}</Text>
                <Text className="text-emerald-700 font-semibold mt-1">Grupo {course.enrolled_group.name} • {course.enrolled_group.schedule_range}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Sección Descargar Constancia Oficial de Matrícula (PDF) */}
      {canDownloadConstancia && (
        <View className="mb-12 bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm">
          <View className="flex-row items-center mb-3">
            <View className="bg-emerald-100 p-3 rounded-2xl mr-3">
              <ShieldCheck color="#059669" size={28} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-black text-slate-800">
                {isFullyEnrolled ? '¡Matrícula Completa!' : 'Proceso de Matrícula Concluido'}
              </Text>
              <Text className="text-xs font-semibold text-emerald-700 mt-0.5">
                {isFullyEnrolled
                  ? 'Has registrado todos tus laboratorios con éxito.'
                  : 'Las asignaturas pendientes no disponen de vacantes.'}
              </Text>
            </View>
          </View>

          <Text className="text-slate-500 text-sm leading-5 mb-5">
            Descarga tu constancia oficial con membrete universitario, datos personales y la relación de laboratorios y horarios asignados.
          </Text>

          <TouchableOpacity
            onPress={handleDownloadConstancia}
            disabled={downloadingPdf}
            className="bg-emerald-600 active:bg-emerald-700 py-4 px-6 rounded-2xl flex-row items-center justify-center shadow-md"
          >
            {downloadingPdf ? (
              <>
                <ActivityIndicator color="white" size="small" className="mr-3" />
                <Text className="text-white font-extrabold text-base">
                  Generando Constancia Oficial...
                </Text>
              </>
            ) : (
              <>
                <Download color="white" size={22} className="mr-2" />
                <Text className="text-white font-extrabold text-base">
                  Descargar Constancia de Matrícula (PDF)
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

