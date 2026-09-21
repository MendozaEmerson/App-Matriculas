import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { UploadCloud, Download, FileSpreadsheet, Users, BookOpen } from 'lucide-react-native';
import { useManageDataViewModel } from '../../../viewmodels/useManageDataViewModel';

export default function ManageDataScreen() {
  const { 
    loadingCourses, 
    loadingStudents, 
    handleDownloadTemplate, 
    handleUploadFile 
  } = useManageDataViewModel();

  return (
    <ScrollView className="flex-1 bg-slate-50 p-6">
      <Text className="text-3xl font-extrabold text-slate-800 mb-2 mt-4">Gestión de Datos</Text>
      <Text className="text-slate-500 mb-8">Descarga plantillas y sube la información masiva al sistema.</Text>

      {/* Tarjeta de Cursos */}
      <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6">
        <View className="flex-row items-center mb-6">
          <View className="bg-blue-100 p-3 rounded-2xl mr-4">
            <BookOpen color="#2563eb" size={28} />
          </View>
          <View>
            <Text className="text-xl font-bold text-slate-800">Cursos y Grupos</Text>
            <Text className="text-slate-500 text-sm">Años, semestres y vacantes</Text>
          </View>
        </View>

        <TouchableOpacity 
          className="flex-row items-center justify-center bg-slate-100 p-4 rounded-xl mb-3 border border-slate-200"
          onPress={() => handleDownloadTemplate('courses')}
        >
          <Download color="#475569" size={20} className="mr-3" />
          <Text className="text-slate-700 font-bold">Descargar Plantilla</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="flex-row items-center justify-center bg-blue-600 p-4 rounded-xl active:bg-blue-700 shadow-sm"
          onPress={() => handleUploadFile('courses')}
          disabled={loadingCourses}
        >
          {loadingCourses ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <UploadCloud color="white" size={20} className="mr-3" />
              <Text className="text-white font-bold text-lg">Subir Archivo (.xlsx)</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Tarjeta de Estudiantes */}
      <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-12">
        <View className="flex-row items-center mb-6">
          <View className="bg-emerald-100 p-3 rounded-2xl mr-4">
            <Users color="#059669" size={28} />
          </View>
          <View>
            <Text className="text-xl font-bold text-slate-800">Estudiantes</Text>
            <Text className="text-slate-500 text-sm">Alumnos y matrículas</Text>
          </View>
        </View>

        <TouchableOpacity 
          className="flex-row items-center justify-center bg-slate-100 p-4 rounded-xl mb-3 border border-slate-200"
          onPress={() => handleDownloadTemplate('students')}
        >
          <FileSpreadsheet color="#475569" size={20} className="mr-3" />
          <Text className="text-slate-700 font-bold">Descargar Plantilla</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="flex-row items-center justify-center bg-emerald-600 p-4 rounded-xl active:bg-emerald-700 shadow-sm"
          onPress={() => handleUploadFile('students')}
          disabled={loadingStudents}
        >
          {loadingStudents ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <UploadCloud color="white" size={20} className="mr-3" />
              <Text className="text-white font-bold text-lg">Subir Archivo (.xlsx)</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
