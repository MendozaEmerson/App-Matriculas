import { useState, useEffect, useCallback } from 'react';
import { SummaryService } from '../services/SummaryService';
import { adminStore } from '../store/adminStore';
import { useFocusEffect } from 'expo-router';

export function useSummaryViewModel() {
  const [data, setData] = useState<any[]>(adminStore.summaryData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await SummaryService.getSummary();
      adminStore.summaryData = result;
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Usamos useFocusEffect para que recargue la data cada vez que entremos a la pestaña
  useFocusEffect(
    useCallback(() => {
      fetchSummary();
    }, [])
  );

  return { data, loading, error, refresh: fetchSummary };
}
