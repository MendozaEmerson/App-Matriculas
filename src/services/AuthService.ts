import { API_URL } from '../config/api_config';

export class AuthService {
  static async login(email: string, cui: string) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: cui })
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Error en inicio de sesión');
    }
    return data;
  }
}
