import { API_URL } from '../config/api_config';
import { GroupDetail, UpdateGroupDTO } from '../models/Group';

export class GroupService {
  static async getGroup(groupId: number): Promise<GroupDetail> {
    const response = await fetch(`${API_URL}/api/courses/groups/${groupId}`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al obtener datos del grupo');
    }
    return await response.json();
  }

  static async updateGroup(groupId: number, data: UpdateGroupDTO): Promise<any> {
    const response = await fetch(`${API_URL}/api/courses/groups/${groupId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al actualizar el grupo');
    }
    return await response.json();
  }

  static async deleteGroup(groupId: number): Promise<any> {
    const response = await fetch(`${API_URL}/api/courses/groups/${groupId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al eliminar el grupo');
    }
    return await response.json();
  }

  static async createGroup(courseId: number, data: UpdateGroupDTO): Promise<any> {
    const response = await fetch(`${API_URL}/api/courses/${courseId}/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al crear el grupo');
    }
    return await response.json();
  }
}
