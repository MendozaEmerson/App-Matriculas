import { Stack } from 'expo-router';

export default function ManageCoursesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Gestión de Cursos y Años' }} />
    </Stack>
  );
}
