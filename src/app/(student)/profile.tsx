import { View, Text, StyleSheet, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function StudentProfile() {
  const router = useRouter();

  const handleLogout = () => {
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarPlaceholder} />
      <Text style={styles.name}>Juan Pérez (Alumno)</Text>
      <Text style={styles.code}>Código: 20261234</Text>
      
      <View style={styles.buttonContainer}>
         <Button title="Cerrar Sesión" color="#FF3B30" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 20, paddingTop: 40 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#ccc', marginBottom: 20 },
  name: { fontSize: 22, fontWeight: 'bold' },
  code: { fontSize: 16, color: '#666', marginTop: 5 },
  buttonContainer: { marginTop: 40, width: '100%' }
});
