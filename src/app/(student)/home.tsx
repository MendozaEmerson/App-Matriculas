import { View, Text, StyleSheet } from 'react-native';

export default function StudentHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cursos Matriculados</Text>
      <Text>Aquí verás la lista de cursos en los que estás inscrito actualmente.</Text>
      {/* TODO: Add cards mapping */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});
