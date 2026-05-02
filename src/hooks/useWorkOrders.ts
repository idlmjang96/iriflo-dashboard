'use client';
import { useState, useEffect } from 'react';
import { subscribeToWorkOrders } from '@/lib/firestore';
import { WorkOrder } from '@/types/firestore';

interface WorkOrderFilters {
  status?: string;
  limit?: number;
}

export function useWorkOrders(filters?: WorkOrderFilters) {
  const [data, setData] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    let isMounted = true;

    try {
      const unsubscribe = subscribeToWorkOrders((newData) => {
        if (!isMounted) return;

        // Double check data validity
        const validatedData = newData.map(wo => ({
          ...wo,
          woNumber: wo.woNumber || 'NO-ID',
          location: wo.location || 'Unknown Location',
          category: wo.category || 'Uncategorized',
          status: wo.status || 'Menunggu'
        }));

        // Custom Sorting: Active WOs first, Selesai at the bottom
        const sortedData = [...validatedData].sort((a, b) => {
          const priority: Record<string, number> = {
            'Menunggu': 1,
            'Disetujui': 2,
            'Proses': 3,
            'Selesai': 4
          };

          const pA = priority[a.status || 'Menunggu'] || 99;
          const pB = priority[b.status || 'Menunggu'] || 99;

          if (pA !== pB) return pA - pB;

          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

        setData(sortedData);
        setLoading(false);
        setError(null);
      }, filters);

      return () => {
        isMounted = false;
        unsubscribe();
      };
    } catch (err) {
      console.error('Firestore Subscription Error:', err);
      requestAnimationFrame(() => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Gagal terhubung ke database');
          setLoading(false);
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  return { 
    data, 
    loading, 
    error,
    isEmpty: !loading && data.length === 0 
  };
}
