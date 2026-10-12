import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Linking from 'expo-linking';
import { API_URL } from '../config/api_config';
import { authStore } from '../store/authStore';

export class StudentService {
  static async getMyCourses() {
    const cui = authStore.cui;
    if (!cui) throw new Error("CUI no encontrado en la sesión");
    
    const response = await fetch(`${API_URL}/api/student/${cui}/courses`);
    if (!response.ok) throw new Error('No se pudo obtener los cursos');
    return await response.json();
  }

  static async enroll(groupId: number) {
    const cui = authStore.cui;
    const response = await fetch(`${API_URL}/api/student/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cui, group_id: groupId })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Error al matricularse');
    return data;
  }

  static async downloadConstancia(): Promise<void> {
    const cui = authStore.cui;
    if (!cui) throw new Error("CUI no disponible en la sesión");

    const pdfUrl = `${API_URL}/api/student/${cui}/constancia-pdf`;
    const localUri = `${FileSystem.documentDirectory || FileSystem.cacheDirectory}constancia_matricula_${cui}.pdf`;

    try {
      const downloadResult = await FileSystem.downloadAsync(pdfUrl, localUri);
      if (downloadResult.status !== 200) {
        throw new Error(`Error al descargar el archivo (Status ${downloadResult.status})`);
      }

      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (isSharingAvailable) {
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Constancia Oficial de Matrícula UNSA',
          UTI: 'com.adobe.pdf'
        });
      } else {
        await Linking.openURL(pdfUrl);
      }
    } catch (error: any) {
      console.warn('Error en FileSystem/Sharing, abriendo mediante visor del sistema:', error);
      await Linking.openURL(pdfUrl);
    }
  }
}

