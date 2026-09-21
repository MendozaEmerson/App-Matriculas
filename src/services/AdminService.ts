import { API_URL } from '../config/api_config';
import { Paths, File, FileSystemUploadType } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { ApiResponse } from '../models/ApiResponse';

export class AdminService {
  /**
   * Descarga la plantilla desde el backend
   */
  static async downloadTemplate(type: 'courses' | 'students'): Promise<string> {
    const url = `${API_URL}/api/${type}/template`;
    const timestamp = new Date().getTime();
    const fileName = `plantilla_${type}_${timestamp}.xlsx`;
    const file = new File(Paths.document, fileName);
    
    const result = await File.downloadFileAsync(url, file);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(result.uri);
    }
    
    return result.uri;
  }

  /**
   * Selecciona un archivo Excel del celular
   */
  static async pickExcelFile() {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    return result.assets[0];
  }

  /**
   * Sube el archivo Excel al backend enviándolo de forma nativa
   */
  static async uploadData(type: 'courses' | 'students', fileAsset: any): Promise<ApiResponse> {
    const uploadUrl = `${API_URL}/api/${type}/upload_b64`;
    
    // Leemos el archivo usando el motor nativo de JS y lo convertimos a Blob
    const fileResponse = await fetch(fileAsset.uri);
    const blob = await fileResponse.blob();
    
    // Convertimos el Blob a Base64 usando FileReader (Universal y a prueba de fallos en React Native)
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    // Enviamos un JSON simple y puro (evita todos los bugs nativos de Android con FormData)
    const payload = {
      filename: fileAsset.name || 'archivo.xlsx',
      base64_data: base64Data
    };

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const json = await response.json();
    
    if (response.status < 200 || response.status >= 300) {
      throw new Error(json.detail || 'Error desconocido en el servidor');
    }

    return json as ApiResponse;
  }
}
