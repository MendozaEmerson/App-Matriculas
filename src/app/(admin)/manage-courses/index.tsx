import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function ManageCoursesIndex() {
  const years = [1, 2, 3, 4, 5];

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>Seleccione el año que desea modificar:</Text>
      {years.map((year) => (
        <TouchableOpacity key={year} style={styles.card}>
          <Text style={styles.cardText}>Editar Año {year}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  instruction: { fontSize: 16, marginBottom: 20 },
  card: { backgroundColor: '#e9ecef', padding: 20, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#dee2e6' },
  cardText: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#495057' }
});
