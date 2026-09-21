import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { UploadCloud, Download, FileSpreadsheet, Users, BookOpen } from 'lucide-react-native';
import { API_URL } from '../../../config/api_config';

export default function ManageDataScreen() {
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Función para descargar la plantilla desde el backend
  const downloadTemplate = async (type: 'courses' | 'students') => {
    try {
      const url = `${API_URL}/api/${type}/template`;
      const timestamp = new Date().getTime();
      const fileName = `plantilla_${type}_${timestamp}.xlsx`;
      const file = new File(Paths.document, fileName);
      
      const result = await File.downloadFileAsync(url, file);

      // Abrir el menú de compartir/guardar nativo del celular
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri);
      } else {
        Alert.alert('Éxito', `Archivo guardado en: ${result.uri}`);
      }
    } catch (error) {
      Alert.alert('Error de Conexión', 'No se pudo descargar la plantilla. Verifica que el backend esté encendido.');
      console.error(error);
    }
  };

  // Función para subir el Excel al backend
  const uploadFile = async (type: 'courses' | 'students') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;
      
      const file = result.assets[0];

      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      } as any);

      if (type === 'courses') setLoadingCourses(true);
      else setLoadingStudents(true);

      const response = await fetch(`${API_URL}/api/${type}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const json = await response.json();

      if (response.ok) {
        Alert.alert('¡Carga Exitosa! 🎉', json.message);
      } else {
        Alert.alert('Error en el archivo', json.detail || 'Asegúrate de estar usando la plantilla correcta.');
      }
    } catch (error) {
      Alert.alert('Error de Red', 'No se pudo conectar con el servidor. Revisa tu red local.');
      console.error(error);
    } finally {
      if (type === 'courses') setLoadingCourses(false);
      else setLoadingStudents(false);
    }
  };

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
          onPress={() => downloadTemplate('courses')}
        >
          <Download color="#475569" size={20} className="mr-3" />
          <Text className="text-slate-700 font-bold">Descargar Plantilla</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="flex-row items-center justify-center bg-blue-600 p-4 rounded-xl active:bg-blue-700 shadow-sm"
          onPress={() => uploadFile('courses')}
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
          onPress={() => downloadTemplate('students')}
        >
          <FileSpreadsheet color="#475569" size={20} className="mr-3" />
          <Text className="text-slate-700 font-bold">Descargar Plantilla</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="flex-row items-center justify-center bg-emerald-600 p-4 rounded-xl active:bg-emerald-700 shadow-sm"
          onPress={() => uploadFile('students')}
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
