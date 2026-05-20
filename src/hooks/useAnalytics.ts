import { useWorkOrders } from './useWorkOrders';
import { useMemo } from 'react';
import { SLA_TARGETS } from '@/constants/dashboard';

export type TimeRange = '7d' | '30d' | '1y' | 'all';

export interface UrgentAlertItem {
  id: string;
  woNumber: string;
  location: string;
  category: string;
  status: string;
  createdAt: Date | null;
  hoursWaiting: number;
}

export function useAnalytics(range: TimeRange = 'all') {
  const { data: workOrders, loading, error } = useWorkOrders();

  const stats = useMemo(() => {
    if (!workOrders || workOrders.length === 0) return {
      summary: { total: 0, pending: 0, process: 0, completed: 0, urgentAlerts: 0 },
      performance: { avgResolveTime: 0, slaCompliance: 0 },
      paretoData: [],
      trendData: [],
      statusData: [],
      mandorStats: [],
      urgentAlertData: []
    };

    // Filter work orders based on range for performance metrics
    const now = new Date();
    const filteredWorkOrders = workOrders.filter(wo => {
      if (range === 'all') return true;
      if (!wo.createdAt) return false;
      
      const createdDate = new Date(wo.createdAt);
      const diffTime = now.getTime() - createdDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      if (range === '7d') return diffDays <= 7;
      if (range === '30d') return diffDays <= 30;
      if (range === '1y') return diffDays <= 365;
      return true;
    });

    const total = filteredWorkOrders.length;
    // For pending/process we still show current active count regardless of range? 
    // Usually Summary Cards show the "NOW" state. 
    // But let's follow the range for consistency in this view.
    const pending = filteredWorkOrders.filter(wo => 
      wo.status === 'Menunggu' || wo.status === 'Menunggu Approval'
    ).length;
    const process = filteredWorkOrders.filter(wo => 
      wo.status === 'Proses' || wo.status === 'Proses Perbaikan' || wo.status === 'Disetujui'
    ).length;
    const completed = filteredWorkOrders.filter(wo => 
      wo.status === 'Selesai'
    ).length;

    // SLA Calculations (using filtered data)
    let totalResolveTime = 0;
    let resolvedCount = 0;
    let slaCompliantCount = 0;
    
    const mandorMap: Record<string, { total: number; completed: number; totalTime: number; compliant: number }> = {};

    filteredWorkOrders.forEach(wo => {
      if (wo.status === 'Selesai' && wo.createdAt && wo.tglSelesai) {
        const created = new Date(wo.createdAt).getTime();
        const finished = new Date(wo.tglSelesai).getTime();
        const resolveTimeHours = (finished - created) / (1000 * 60 * 60);
        
        if (resolveTimeHours > 0) {
          totalResolveTime += resolveTimeHours;
          resolvedCount++;

          const target = SLA_TARGETS[wo.category || ''] || SLA_TARGETS['Default'];
          const isCompliant = resolveTimeHours <= target.resolve;
          if (isCompliant) slaCompliantCount++;

          // Mandor Stats
          const mandorName = wo.mandorNama || 'Unknown';
          if (!mandorMap[mandorName]) {
            mandorMap[mandorName] = { total: 0, completed: 0, totalTime: 0, compliant: 0 };
          }
          mandorMap[mandorName].completed++;
          mandorMap[mandorName].totalTime += resolveTimeHours;
          if (isCompliant) mandorMap[mandorName].compliant++;
        }
      }

      // Track active workload for mandors (in this range)
      if (wo.status !== 'Selesai') {
        const mandorName = wo.mandorNama || 'Unknown';
        if (mandorName !== 'Belum ditugaskan' && mandorName !== 'Unknown') {
          if (!mandorMap[mandorName]) {
            mandorMap[mandorName] = { total: 0, completed: 0, totalTime: 0, compliant: 0 };
          }
          mandorMap[mandorName].total++;
        }
      }
    });

    const avgResolveTime = resolvedCount > 0 ? totalResolveTime / resolvedCount : 0;
    const slaCompliance = resolvedCount > 0 ? (slaCompliantCount / resolvedCount) * 100 : 0;

    const mandorStats = Object.entries(mandorMap).map(([name, m]) => ({
      name,
      completed: m.completed,
      active: m.total,
      avgTime: m.completed > 0 ? m.totalTime / m.completed : 0,
      compliance: m.completed > 0 ? (m.compliant / m.completed) * 100 : 0
    })).sort((a, b) => b.completed - a.completed);

    // Urgent Alerts: Pending more than 48 hours (from the filtered set)
    const urgentAlertData = filteredWorkOrders.filter(wo => {
      const isPending = wo.status === 'Menunggu' || wo.status === 'Menunggu Approval';
      if (!isPending || !wo.createdAt) return false;
      
      const createdDate = new Date(wo.createdAt).getTime();
      const hoursDiff = (now.getTime() - createdDate) / (1000 * 60 * 60);
      return hoursDiff > 48; 
    }).map(wo => {
      const createdDate = wo.createdAt ? new Date(wo.createdAt) : null;
      const hoursWaiting = createdDate
        ? (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60)
        : 0;

      return {
        id: wo.id,
        woNumber: wo.woNumber || wo.nomor || 'NO-ID',
        location: wo.location || 'Unknown Location',
        category: wo.category || 'Uncategorized',
        status: wo.status || 'Menunggu',
        createdAt: createdDate,
        hoursWaiting,
      };
    }).sort((a, b) => b.hoursWaiting - a.hoursWaiting);

    const urgentAlerts = urgentAlertData.length;

    // Pareto data (Categories)
    const categoryCounts: Record<string, number> = {};
    filteredWorkOrders.forEach(wo => {
      const cat = wo.category || 'Uncategorized';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const paretoData = Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Trend data based on range
    let trendData: { date: string; count: number }[] = [];

    const getTrendByDate = (targetDates: string[]) => {
      const counts: Record<string, number> = {};
      filteredWorkOrders.forEach(wo => {
        if (!wo.createdAt) return;
        try {
          const dateKey = new Date(wo.createdAt).toISOString().split('T')[0];
          counts[dateKey] = (counts[dateKey] || 0) + 1;
        } catch (e) {}
      });
      return targetDates.map(date => ({ date, count: counts[date] || 0 }));
    };

    if (range === '7d' || range === '30d') {
      const days = range === '7d' ? 7 : 30;
      const dateList = [...Array(days)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (days - 1 - i));
        return d.toISOString().split('T')[0];
      });
      trendData = getTrendByDate(dateList);
    } else if (range === '1y') {
      const monthsMap: Record<string, number> = {};
      filteredWorkOrders.forEach(wo => {
        if (!wo.createdAt) return;
        try {
          const monthKey = new Date(wo.createdAt).toISOString().slice(0, 7);
          monthsMap[monthKey] = (monthsMap[monthKey] || 0) + 1;
        } catch (e) {}
      });

      const monthList = [...Array(12)].map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (11 - i));
        return d.toISOString().slice(0, 7);
      });

      trendData = monthList.map(monthKey => ({
        date: monthKey + '-01',
        count: monthsMap[monthKey] || 0
      }));
    } else if (range === 'all') {
      const monthsMap: Record<string, number> = {};
      filteredWorkOrders.forEach(wo => {
        if (!wo.createdAt) return;
        try {
          const monthKey = new Date(wo.createdAt).toISOString().slice(0, 7);
          monthsMap[monthKey] = (monthsMap[monthKey] || 0) + 1;
        } catch (e) {}
      });

      trendData = Object.entries(monthsMap)
        .map(([monthKey, count]) => ({ date: monthKey + '-01', count }))
        .sort((a, b) => a.date.localeCompare(b.date));
    }

    // Status Distribution
    const statusData = [
      { name: 'Menunggu', value: pending, color: '#f59e0b' }, // Amber
      { name: 'Aktif', value: process, color: '#6366f1' },    // Indigo
      { name: 'Selesai', value: completed, color: '#10b981' }, // Emerald
    ].filter(s => s.value > 0);

    return {
      summary: { total, pending, process, completed, urgentAlerts },
      performance: { avgResolveTime, slaCompliance },
      paretoData,
      trendData,
      statusData,
      mandorStats,
      urgentAlertData
    };
  }, [workOrders, range]);

  return { stats, loading, error };
}
