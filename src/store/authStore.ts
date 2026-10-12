import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = '@auth_session_unsa';

export interface UserSession {
  role: string;
  cui?: string;
  firstName?: string;
  email?: string;
}

export const authStore = {
  cui: '',
  role: '',
  firstName: '',
  email: '',

  async saveSession(user: UserSession): Promise<void> {
    this.role = user.role;
    this.cui = user.cui || '';
    this.firstName = user.firstName || '';
    this.email = user.email || '';
    try {
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Error al guardar la sesión persistente:', e);
    }
  },

  async loadSession(): Promise<UserSession | null> {
    try {
      const stored = await AsyncStorage.getItem(SESSION_KEY);
      if (stored) {
        const user: UserSession = JSON.parse(stored);
        this.role = user.role;
        this.cui = user.cui || '';
        this.firstName = user.firstName || '';
        this.email = user.email || '';
        return user;
      }
    } catch (e) {
      console.error('Error al cargar la sesión persistente:', e);
    }
    return null;
  },

  async clearSession(): Promise<void> {
    this.cui = '';
    this.role = '';
    this.firstName = '';
    this.email = '';
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
    } catch (e) {
      console.error('Error al limpiar la sesión persistente:', e);
    }
  }
};
