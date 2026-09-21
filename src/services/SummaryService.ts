import { API_URL } from '../config/api_config';

export class SummaryService {
  static async getSummary() {
    const response = await fetch(`${API_URL}/api/admin/summary`);
    if (!response.ok) {
      throw new Error('No se pudo obtener el resumen del servidor');
    }
    return await response.json();
  }
}
