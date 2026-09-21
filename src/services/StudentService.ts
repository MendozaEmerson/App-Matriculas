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
}
