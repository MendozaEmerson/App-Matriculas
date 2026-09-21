import { Redirect } from 'expo-router';

export default function Index() {
  // Aquí en el futuro leeremos el estado de autenticación (Zustand, Context, etc.)
  // Por ahora redirigimos al login por defecto
  return <Redirect href="/(auth)/login" />;
}
