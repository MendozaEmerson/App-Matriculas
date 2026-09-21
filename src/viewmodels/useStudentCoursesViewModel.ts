import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { StudentService } from '../services/StudentService';
import { studentStore } from '../store/studentStore';
import { useFocusEffect } from 'expo-router';

export function useStudentCoursesViewModel() {
  const [data, setData] = useState(studentStore.data);
  const [loading, setLoading] = useState(false);
  const [enrollingId, setEnrollingId] = useState<number | null>(null);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const result = await StudentService.getMyCourses();
      studentStore.data = result;
      setData(result);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (groupId: number) => {
    setEnrollingId(groupId);
    try {
      const response = await StudentService.enroll(groupId);
      Alert.alert('¡Matrícula Exitosa! 🎉', response.message);
      // Recargar datos para actualizar la UI
      await fetchCourses();
    } catch (err: any) {
      Alert.alert('Error de Matrícula', err.message);
    } finally {
      setEnrollingId(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCourses();
    }, [])
  );

  return { data, loading, enrollingId, refresh: fetchCourses, handleEnroll };
}
