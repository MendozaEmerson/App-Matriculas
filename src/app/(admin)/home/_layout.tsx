import { Stack } from 'expo-router';

export default function HomeStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="year/[year]" />
      <Stack.Screen name="course/[id]" />
    </Stack>
  );
}
