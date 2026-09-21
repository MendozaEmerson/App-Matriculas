import { Stack } from 'expo-router';

export default function EnrollLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Años Académicos' }} />
      <Stack.Screen name="[year]" options={{ title: 'Selección de Laboratorios' }} />
    </Stack>
  );
}
