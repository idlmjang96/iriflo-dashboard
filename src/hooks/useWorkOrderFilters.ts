'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { WorkOrder } from '@/types/firestore';

interface UseWorkOrderFiltersProps {
  workOrders: WorkOrder[];
  initialStatus?: string;
  initialCategory?: string;
  isUrgentFilter?: boolean;
  itemsPerPage?: number;
}

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: keyof WorkOrder | 'createdAt';
  direction: SortDirection;
}

export function useWorkOrderFilters({
  workOrders,
  initialStatus = '',
  initialCategory = '',
  isUrgentFilter = false,
  itemsPerPage = 10
}: UseWorkOrderFiltersProps) {
  const [searchQuery, setSearchQuery] = useState(initialStatus || initialCategory);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ 
    key: 'createdAt', 
    direction: 'desc' 
  });

  // Sync searchQuery with URL parameters (for drill-down)
  useEffect(() => {
    if (initialStatus || initialCategory) {
      setSearchQuery(initialStatus || initialCategory);
    }
  }, [initialStatus, initialCategory]);

  const handleSort = useCallback((key: keyof WorkOrder | 'createdAt') => {
    setSortConfig(prev => {
      let direction: SortDirection = 'asc';
      if (prev && prev.key === key && prev.direction === 'asc') {
        direction = 'desc';
      }
      return { key, direction };
    });
    setCurrentPage(1); // Reset to first page on sort
  }, []);

  const updateSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const filteredOrders = useMemo(() => {
    return workOrders.filter(wo => {
      // Check for Urgent Filter (> 48 hours and pending)
      if (isUrgentFilter) {
        const isPending = wo.status === 'Menunggu' || wo.status === 'Menunggu Approval';
        if (!isPending || !wo.createdAt) return false;
        const hoursDiff = (new Date().getTime() - new Date(wo.createdAt).getTime()) / (1000 * 60 * 60);
        if (hoursDiff <= 48) return false;
      }

      // Check for Status Filter from URL parameter
      const isStatusFiltered = initialStatus && searchQuery === initialStatus;
      const matchesStatus = isStatusFiltered
        ? (
            wo.status === initialStatus || 
            (initialStatus === 'Menunggu' && wo.status === 'Menunggu Approval') ||
            (initialStatus === 'Aktif' && (wo.status === 'Proses' || wo.status === 'Proses Perbaikan' || wo.status === 'Disetujui'))
          )
        : true;

      // Check for Category Filter from URL parameter
      const isCategoryFiltered = initialCategory && searchQuery === initialCategory;
      const matchesCategory = isCategoryFiltered 
        ? (wo.category === initialCategory)
        : true;

      // Check for Search Query (Text search)
      const searchTerms = searchQuery.toLowerCase();
      const isUrlFiltered = isStatusFiltered || isCategoryFiltered;
      
      const matchesText = isUrlFiltered ? true : (
        (wo.woNumber?.toLowerCase() || '').includes(searchTerms) ||
        (wo.location?.toLowerCase() || '').includes(searchTerms) ||
        (wo.description?.toLowerCase() || '').includes(searchTerms) ||
        (wo.status?.toLowerCase() || '').includes(searchTerms) ||
        (wo.reservoir ? (
          wo.reservoir.toLowerCase().includes(searchTerms) || 
          wo.reservoir.toLowerCase().replace(/\s/g, '').includes(searchTerms.replace(/\s/g, '')) ||
          `rsv${wo.reservoir.toLowerCase().replace(/\s/g, '')}`.includes(searchTerms.replace(/\s/g, ''))
        ) : false)
      );

      return matchesStatus && matchesCategory && matchesText;
    });
  }, [workOrders, searchQuery, isUrgentFilter, initialStatus, initialCategory]);

  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      if (!sortConfig) return 0;
      
      const key = sortConfig.key;
      const valA = a[key] ?? '';
      const valB = b[key] ?? '';

      if (valA === valB) return 0;
      
      // Handle dates
      if (key === 'createdAt') {
        const dateA = valA ? new Date(valA).getTime() : 0;
        const dateB = valB ? new Date(valB).getTime() : 0;
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }

      // Handle strings
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      
      return sortConfig.direction === 'asc' 
        ? strA.localeCompare(strB) 
        : strB.localeCompare(strA);
    });
  }, [filteredOrders, sortConfig]);

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    return sortedOrders.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [sortedOrders, currentPage, itemsPerPage]);

  return {
    searchQuery,
    setSearchQuery: updateSearchQuery,
    currentPage,
    setCurrentPage,
    sortConfig,
    handleSort,
    filteredCount: sortedOrders.length,
    totalPages,
    paginatedOrders
  };
}
