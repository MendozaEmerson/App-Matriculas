import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function EnrollIndex() {
  const router = useRouter();
  const years = [1, 2, 3, 4, 5];

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>Selecciona un año para ver los laboratorios disponibles:</Text>
      {years.map((year) => (
        <TouchableOpacity 
          key={year} 
          style={styles.card}
          onPress={() => router.push(`/(student)/enroll/${year}`)}
        >
          <Text style={styles.cardText}>Año {year}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  instruction: { fontSize: 16, marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 10, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  cardText: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' }
});
