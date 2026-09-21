import { Tabs } from 'expo-router';
import { PieChart, Settings, UserCircle } from 'lucide-react-native';

export default function AdminLayout() {
  return (
    <Tabs screenOptions={{ 
      tabBarActiveTintColor: '#059669', // emerald-600
      headerShown: true,
      tabBarStyle: { paddingBottom: 5, paddingTop: 5 }
    }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Resumen',
          tabBarIcon: ({ color }) => <PieChart size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="manage-courses"
        options={{
          title: 'Administrar',
          headerShown: false,
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <UserCircle size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
