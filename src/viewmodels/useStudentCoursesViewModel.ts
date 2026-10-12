import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { StudentService } from '../services/StudentService';
import { studentStore } from '../store/studentStore';
import { useFocusEffect } from 'expo-router';

export function useStudentCoursesViewModel() {
  const [data, setData] = useState(studentStore.data);
  const [loading, setLoading] = useState(false);
  const [enrollingId, setEnrollingId] = useState<number | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

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

  const isFullyEnrolled = useMemo(() => {
    return data.pending.length === 0 && data.enrolled.length > 0;
  }, [data]);

  const isPendingBlockedByCapacity = useMemo(() => {
    return (
      data.enrolled.length > 0 &&
      data.pending.length > 0 &&
      data.pending.every(
        (course: any) =>
          course.groups &&
          course.groups.length > 0 &&
          course.groups.every((g: any) => g.is_full || g.available_vacancies <= 0)
      )
    );
  }, [data]);

  const canDownloadConstancia = useMemo(() => {
    return isFullyEnrolled || isPendingBlockedByCapacity;
  }, [isFullyEnrolled, isPendingBlockedByCapacity]);

  const handleDownloadConstancia = async () => {
    setDownloadingPdf(true);
    try {
      await StudentService.downloadConstancia();
    } catch (error: any) {
      Alert.alert('Descarga de Constancia', error.message || 'No se pudo generar la constancia en este momento.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCourses();
    }, [])
  );

  return {
    data,
    loading,
    enrollingId,
    downloadingPdf,
    canDownloadConstancia,
    isFullyEnrolled,
    isPendingBlockedByCapacity,
    refresh: fetchCourses,
    handleEnroll,
    handleDownloadConstancia,
  };
}

