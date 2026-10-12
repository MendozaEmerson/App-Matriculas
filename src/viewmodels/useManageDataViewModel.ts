import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { AdminService } from '../services/AdminService';
import { SummaryService } from '../services/SummaryService';
import { adminStore } from '../store/adminStore';
import { UploadResult, UploadHistoryItem, DuplicatedItem } from '../models/UploadLog';

export function useManageDataViewModel() {
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Resultados de la última subida
  const [coursesResult, setCoursesResult] = useState<UploadResult | null>(null);
  const [studentsResult, setStudentsResult] = useState<UploadResult | null>(null);

  // Historial de subidas
  const [coursesHistory, setCoursesHistory] = useState<UploadHistoryItem[]>([]);
  const [studentsHistory, setStudentsHistory] = useState<UploadHistoryItem[]>([]);

  // Estado del modal de duplicados
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDuplicatedItems, setModalDuplicatedItems] = useState<DuplicatedItem[]>([]);

  const loadHistories = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const [coursesH, studentsH] = await Promise.all([
        AdminService.getUploadHistory('courses'),
        AdminService.getUploadHistory('students'),
      ]);
      setCoursesHistory(coursesH);
      setStudentsHistory(studentsH);

      // Si hay cargas previas y no hay resultado reciente, usar la más reciente para mostrar estadísticas iniciales
      if (coursesH.length > 0 && !coursesResult) {
        const latest = coursesH[0];
        setCoursesResult({
          filename: latest.filename,
          status: 'success',
          total_rows: latest.total_rows,
          created_count: latest.created_count,
          duplicated_count: latest.duplicated_count,
          duplicated_items: latest.duplicated_items || [],
          message: `Última carga guardada: ${latest.created_count} nuevos, ${latest.duplicated_count} duplicados.`,
        });
      }

      if (studentsH.length > 0 && !studentsResult) {
        const latest = studentsH[0];
        setStudentsResult({
          filename: latest.filename,
          status: 'success',
          total_rows: latest.total_rows,
          created_count: latest.created_count,
          duplicated_count: latest.duplicated_count,
          duplicated_items: latest.duplicated_items || [],
          message: `Última carga guardada: ${latest.created_count} nuevos, ${latest.duplicated_count} duplicados.`,
        });
      }
    } catch (e) {
      console.error('Error cargando historial de cargas:', e);
    } finally {
      setLoadingHistory(false);
    }
  }, [coursesResult, studentsResult]);

  useEffect(() => {
    loadHistories();
  }, [loadHistories]);

  const handleDownloadTemplate = async (type: 'courses' | 'students') => {
    try {
      const uri = await AdminService.downloadTemplate(type);
      console.log('Plantilla descargada en:', uri);
    } catch (error) {
      console.error(error);
      Alert.alert('Error de Conexión', 'No se pudo descargar la plantilla. Verifica que el backend esté encendido.');
    }
  };

  const handleUploadFile = async (type: 'courses' | 'students') => {
    try {
      const fileAsset = await AdminService.pickExcelFile();
      if (!fileAsset) return;

      if (type === 'courses') setLoadingCourses(true);
      else setLoadingStudents(true);

      const response = await AdminService.uploadData(type, fileAsset);

      if (type === 'courses') {
        setCoursesResult(response);
        // Sincronizar el store jerárquico de admin
        try {
          const updatedSummary = await SummaryService.getSummary();
          adminStore.summaryData = updatedSummary;
        } catch (_) {}
      } else {
        setStudentsResult(response);
      }

      // Recargar historiales
      await loadHistories();

      Alert.alert(
        '¡Carga Procesada! 📊',
        `${response.message}\n\n• Nuevos agregados: ${response.created_count}\n• Duplicados omitidos: ${response.duplicated_count}`
      );
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error en la carga', error.message || 'No se pudo conectar con el servidor.');
    } finally {
      if (type === 'courses') setLoadingCourses(false);
      else setLoadingStudents(false);
    }
  };

  const openDuplicatedModal = (title: string, items: DuplicatedItem[]) => {
    setModalTitle(title);
    setModalDuplicatedItems(items);
    setIsModalVisible(true);
  };

  const closeDuplicatedModal = () => {
    setIsModalVisible(false);
    setModalDuplicatedItems([]);
  };

  return {
    loadingCourses,
    loadingStudents,
    loadingHistory,
    coursesResult,
    studentsResult,
    coursesHistory,
    studentsHistory,
    isModalVisible,
    modalTitle,
    modalDuplicatedItems,
    handleDownloadTemplate,
    handleUploadFile,
    openDuplicatedModal,
    closeDuplicatedModal,
    refreshHistory: loadHistories,
  };
}
