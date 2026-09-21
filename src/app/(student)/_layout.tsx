import { Tabs } from 'expo-router';
import { BookOpen, CalendarPlus, UserCircle } from 'lucide-react-native';

export default function StudentLayout() {
  return (
    <Tabs screenOptions={{ 
      tabBarActiveTintColor: '#2563eb', // blue-600 
      headerShown: true,
      tabBarStyle: { paddingBottom: 5, paddingTop: 5 }
    }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Mis Cursos',
          tabBarIcon: ({ color }) => <BookOpen size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="enroll"
        options={{
          title: 'Matrícula',
          headerShown: false, 
          tabBarIcon: ({ color }) => <CalendarPlus size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Mi Perfil',
          tabBarIcon: ({ color }) => <UserCircle size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
