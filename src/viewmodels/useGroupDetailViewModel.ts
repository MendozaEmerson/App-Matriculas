import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { GroupService } from '../services/GroupService';
import { SummaryService } from '../services/SummaryService';
import { adminStore } from '../store/adminStore';
import { GroupDetail } from '../models/Group';

export function useGroupDetailViewModel(groupId: number, onSuccessDelete?: () => void) {
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form field states
  const [name, setName] = useState<string>('');
  const [scheduleRange, setScheduleRange] = useState<string>('');
  const [initialVacancies, setInitialVacancies] = useState<string>('');

  const loadGroup = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await GroupService.getGroup(groupId);
      setGroup(data);
      setName(data.name);
      setScheduleRange(data.schedule_range || '');
      setInitialVacancies(String(data.initial_vacancies));
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos del grupo');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (groupId) {
      loadGroup();
    }
  }, [groupId, loadGroup]);

  const toggleEdit = () => {
    if (isEditing && group) {
      // Revertir a valores guardados al cancelar edición
      setName(group.name);
      setScheduleRange(group.schedule_range || '');
      setInitialVacancies(String(group.initial_vacancies));
    }
    setIsEditing(!isEditing);
  };

  const saveChanges = async (): Promise<boolean> => {
    if (!name.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa un nombre para el grupo (ej. A, B).');
      return false;
    }

    const vacNum = parseInt(initialVacancies, 10);
    if (isNaN(vacNum) || vacNum < 0) {
      Alert.alert('Vacantes inválidas', 'El número de vacantes debe ser un valor entero positivo.');
      return false;
    }

    try {
      setSaving(true);
      await GroupService.updateGroup(groupId, {
        name: name.trim(),
        schedule_range: scheduleRange.trim(),
        initial_vacancies: vacNum,
      });

      // Refrescar el store global de resumen para mantener sincronizada toda la jerarquía
      const updatedSummary = await SummaryService.getSummary();
      adminStore.summaryData = updatedSummary;

      // Actualizar datos del grupo actual
      await loadGroup();
      setIsEditing(false);
      Alert.alert('Guardado', 'Los datos del grupo han sido actualizados con éxito.');
      return true;
    } catch (err: any) {
      Alert.alert('Error al guardar', err.message || 'Ocurrió un error al guardar los cambios.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Eliminar Grupo',
      `¿Estás seguro de que deseas eliminar el Grupo "${group?.name || ''}"? Esta acción desvinculará a los alumnos matriculados y no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar Grupo',
          style: 'destructive',
          onPress: executeDelete,
        },
      ]
    );
  };

  const executeDelete = async () => {
    try {
      setDeleting(true);
      await GroupService.deleteGroup(groupId);

      // Refrescar el store global de resumen
      const updatedSummary = await SummaryService.getSummary();
      adminStore.summaryData = updatedSummary;

      Alert.alert('Eliminado', 'El grupo ha sido eliminado correctamente.', [
        {
          text: 'Aceptar',
          onPress: () => {
            if (onSuccessDelete) {
              onSuccessDelete();
            }
          },
        },
      ]);
    } catch (err: any) {
      Alert.alert('Error al eliminar', err.message || 'No se pudo eliminar el grupo.');
    } finally {
      setDeleting(false);
    }
  };

  return {
    group,
    loading,
    saving,
    deleting,
    isEditing,
    error,
    name,
    setName,
    scheduleRange,
    setScheduleRange,
    initialVacancies,
    setInitialVacancies,
    toggleEdit,
    saveChanges,
    confirmDelete,
    refresh: loadGroup,
  };
}
