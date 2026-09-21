import { useState } from 'react';
import { Alert } from 'react-native';
import { AdminService } from '../services/AdminService';

export function useManageDataViewModel() {
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const handleDownloadTemplate = async (type: 'courses' | 'students') => {
    try {
      const uri = await AdminService.downloadTemplate(type);
      console.log('Plantilla descargada en:', uri);
    } catch (error) {
      console.error(error);
      Alert.alert('Error de Conexión', 'No se pudo descargar la plantilla. Verifica que el backend esté encendido.');
    }
  };

  const handleUploadFile = async (type: 'courses' | 'students') => {
    try {
      const fileAsset = await AdminService.pickExcelFile();
      if (!fileAsset) return;

      // Iniciar estado de carga
      if (type === 'courses') setLoadingCourses(true);
      else setLoadingStudents(true);

      const response = await AdminService.uploadData(type, fileAsset);
      
      Alert.alert('¡Carga Exitosa! 🎉', response.message);

    } catch (error: any) {
      console.error(error);
      Alert.alert('Error en la carga', error.message || 'No se pudo conectar con el servidor.');
    } finally {
      // Detener estado de carga
      if (type === 'courses') setLoadingCourses(false);
      else setLoadingStudents(false);
    }
  };

  return {
    loadingCourses,
    loadingStudents,
    handleDownloadTemplate,
    handleUploadFile
  };
}
