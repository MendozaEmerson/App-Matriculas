import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { adminStore } from '../store/adminStore';
import { SummaryService } from '../services/SummaryService';
import { GroupService } from '../services/GroupService';

export function useCourseDetailViewModel(courseId: number | string) {
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form for new group
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupSchedule, setNewGroupSchedule] = useState('');
  const [newGroupVacancies, setNewGroupVacancies] = useState('20');

  const findAndSetCourse = useCallback(() => {
    for (const yearData of adminStore.summaryData) {
      const found = yearData.courses?.find((c: any) => String(c.id) === String(courseId));
      if (found) {
        setCourse(found);
        return;
      }
    }
    setCourse(null);
  }, [courseId]);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const summary = await SummaryService.getSummary();
      adminStore.summaryData = summary;
      for (const yearData of summary) {
        const found = yearData.courses?.find((c: any) => String(c.id) === String(courseId));
        if (found) {
          setCourse(found);
          break;
        }
      }
    } catch (err: any) {
      console.error('Error al refrescar curso:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useFocusEffect(
    useCallback(() => {
      findAndSetCourse();
      refresh();
    }, [findAndSetCourse, refresh])
  );

  const confirmDeleteGroup = (groupId: number, groupName: string) => {
    Alert.alert(
      'Eliminar Grupo',
      `¿Deseas eliminar el Grupo ${groupName}? Esta acción es permanente.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await GroupService.deleteGroup(groupId);
              await refresh();
              Alert.alert('Éxito', `Grupo ${groupName} eliminado correctamente.`);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'No se pudo eliminar el grupo.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      Alert.alert('Error', 'Ingresa una letra o nombre para el grupo (ej. A, B, C).');
      return;
    }
    const vacNum = parseInt(newGroupVacancies, 10);
    if (isNaN(vacNum) || vacNum <= 0) {
      Alert.alert('Error', 'Ingresa un número válido de vacantes.');
      return;
    }

    try {
      setCreating(true);
      await GroupService.createGroup(Number(courseId), {
        name: newGroupName.trim(),
        schedule_range: newGroupSchedule.trim(),
        initial_vacancies: vacNum,
      });

      setNewGroupName('');
      setNewGroupSchedule('');
      setNewGroupVacancies('20');
      setShowAddModal(false);
      await refresh();
      Alert.alert('Éxito', `Grupo ${newGroupName.trim()} creado correctamente.`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo crear el grupo.');
    } finally {
      setCreating(false);
    }
  };

  return {
    course,
    loading,
    creating,
    showAddModal,
    setShowAddModal,
    newGroupName,
    setNewGroupName,
    newGroupSchedule,
    setNewGroupSchedule,
    newGroupVacancies,
    setNewGroupVacancies,
    confirmDeleteGroup,
    handleCreateGroup,
    refresh,
  };
}
