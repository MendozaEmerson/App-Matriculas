import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function AdminHome() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Estado de Matrículas</Text>
      
      <View style={styles.statCard}>
        <Text style={styles.yearTitle}>Año 1</Text>
        <Text>Inscritos: 120 / Faltan: 30</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.yearTitle}>Año 2</Text>
        <Text>Inscritos: 95 / Faltan: 15</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.yearTitle}>Año 3</Text>
        <Text>Inscritos: 80 / Faltan: 10</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  statCard: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, elevation: 1 },
  yearTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 }
});
