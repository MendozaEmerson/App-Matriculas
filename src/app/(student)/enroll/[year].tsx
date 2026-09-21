import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function YearLabs() {
  const { year } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Laboratorios - Año {year}</Text>
      <View style={styles.labItem}>
        <Text style={styles.labName}>Laboratorio de Física I</Text>
        <Text style={styles.labDetails}>Aula: A-301 | Cupos: 5/20</Text>
      </View>
      <View style={styles.labItem}>
        <Text style={styles.labName}>Laboratorio de Programación</Text>
        <Text style={styles.labDetails}>Aula: Lab-1 | Cupos: 0/30 (Lleno)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  labItem: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  labName: { fontSize: 16, fontWeight: 'bold' },
  labDetails: { fontSize: 14, color: '#666', marginTop: 5 }
});
