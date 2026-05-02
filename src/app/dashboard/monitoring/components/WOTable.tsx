'use client';

import { useWorkOrders } from '@/hooks/useWorkOrders';
import { useState, useEffect, useRef } from 'react';
import { WorkOrder } from '@/types/firestore';
import StatusBadge from './StatusBadge';
import QuickActions from './QuickActions';
import WODetailModal from './WODetailModal';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Tag, Calendar, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import WOGrid from './WOGrid';
import { useSearchParams } from 'next/navigation';
import { Pagination } from '@/components/common/Pagination';
import { useWorkOrderFilters, SortConfig } from '@/hooks/useWorkOrderFilters';

export default function WOTable({ view = 'table' }: { view?: 'table' | 'grid' }) {
  const searchParams = useSearchParams();
  const { data: workOrders, loading } = useWorkOrders();
  
  const initialStatus = searchParams.get('status') || '';
  const initialCategory = searchParams.get('category') || '';
  const isUrgentFilter = searchParams.get('filter') === 'urgent';
  const targetWoId = searchParams.get('wo');

  const {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    sortConfig,
    handleSort,
    filteredCount,
    totalPages,
    paginatedOrders
  } = useWorkOrderFilters({
    workOrders,
    initialStatus,
    initialCategory,
    isUrgentFilter,
    itemsPerPage: 10
  });

  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const processedWoRef = useRef<string | null>(null);

  // Auto-open WO from URL parameter (deferred to avoid cascading renders)
  useEffect(() => {
    if (!targetWoId || workOrders.length === 0 || processedWoRef.current === targetWoId) return;

    const targetWo = workOrders.find(wo => wo.id === targetWoId);
    if (targetWo) {
      processedWoRef.current = targetWoId;
      requestAnimationFrame(() => {
        setSelectedWO(targetWo);
        setIsModalOpen(true);
        if (targetWo.woNumber) {
          setSearchQuery(targetWo.woNumber);
        }
      });
    }
  }, [targetWoId, workOrders, setSearchQuery]);

  const handleOpenModal = (wo: WorkOrder) => {
    setSelectedWO(wo);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full bg-slate-100 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <Input 
            placeholder="Cari berdasarkan ID, Lokasi, atau Deskripsi..." 
            className="pl-10 bg-slate-50 border-slate-200 text-slate-900 h-11 focus:ring-green-500/50 transition-all font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* View Content */}
      {view === 'table' ? (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-x-auto shadow-sm">
          <Table>
            <TableHeader className="bg-slate-100/50">
              <TableRow className="border-slate-200 hover:bg-transparent">
                <TableColumnHeader 
                  label="Work Order" 
                  columnKey="woNumber" 
                  sortConfig={sortConfig} 
                  onSort={handleSort} 
                  className="w-[20%]"
                />
                <TableColumnHeader 
                  label="Lokasi & Kategori" 
                  columnKey="location" 
                  sortConfig={sortConfig} 
                  onSort={handleSort} 
                  className="w-[45%]"
                />
                <TableColumnHeader 
                  label="Status Operasional" 
                  columnKey="status" 
                  sortConfig={sortConfig} 
                  onSort={handleSort} 
                  className="w-[20%]"
                />
                <TableColumnHeader 
                  label="Waktu" 
                  columnKey="createdAt" 
                  sortConfig={sortConfig} 
                  onSort={handleSort} 
                  className="w-[15%]"
                />
                <TableHead className="w-[5%] px-6 py-4"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map((wo) => (
                <WOTableRow 
                  key={wo.id} 
                  wo={wo} 
                  onOpen={handleOpenModal} 
                />
              ))}
            </TableBody>
          </Table>

          {/* Pagination Controls inside Table Container */}
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100">
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
              totalItems={filteredCount}
              itemsPerPage={10}
              currentCount={paginatedOrders.length}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <WOGrid data={paginatedOrders} onOpenModal={handleOpenModal} />
          
          {/* Pagination for Grid */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
              totalItems={filteredCount}
              itemsPerPage={10}
              currentCount={paginatedOrders.length}
            />
          </div>
        </div>
      )}

      {paginatedOrders.length === 0 && (
        <div className="py-20 text-center">
          <Search className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-600 font-bold">Tidak ada Work Order yang ditemukan</p>
        </div>
      )}

      {/* Detail Modal */}
      <WODetailModal 
        wo={selectedWO} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}

function SortIcon({ column, sortConfig }: { column: keyof WorkOrder | 'createdAt', sortConfig: SortConfig | null }) {
  if (sortConfig?.key !== column) return <ArrowUpDown size={12} className="ml-1 opacity-20 group-hover:opacity-100" />;
  return sortConfig.direction === 'asc' 
    ? <ArrowUp size={12} className="ml-1 text-green-600" /> 
    : <ArrowDown size={12} className="ml-1 text-green-600" />;
}

interface TableColumnHeaderProps {
  label: string;
  columnKey: keyof WorkOrder | 'createdAt';
  sortConfig: SortConfig | null;
  onSort: (key: keyof WorkOrder | 'createdAt') => void;
  className?: string;
}

function TableColumnHeader({ label, columnKey, sortConfig, onSort, className }: TableColumnHeaderProps) {
  return (
    <TableHead 
      className={`text-slate-700 font-black uppercase text-[10px] tracking-widest px-6 py-4 cursor-pointer group ${className}`}
      onClick={() => onSort(columnKey)}
    >
      <div className="flex items-center">
        {label}
        <SortIcon column={columnKey} sortConfig={sortConfig} />
      </div>
    </TableHead>
  );
}

interface WOTableRowProps {
  wo: WorkOrder;
  onOpen: (wo: WorkOrder) => void;
}

function WOTableRow({ wo, onOpen }: WOTableRowProps) {
  return (
    <TableRow 
      onClick={() => onOpen(wo)}
      className="border-slate-100 hover:bg-slate-50 transition-colors group cursor-pointer"
    >
      <TableCell className="px-6 py-5">
        <div className="flex flex-col selectable">
          <span className="text-slate-900 font-black tracking-tight">{wo.woNumber}</span>
          <span className="text-slate-600 text-xs mt-1 font-medium line-clamp-1 max-w-[250px]">{wo.description}</span>
        </div>
      </TableCell>
      <TableCell className="px-6 py-5">
        <div className="space-y-1.5 selectable">
          <div className="flex items-center gap-2 text-slate-900 text-sm font-bold">
            <MapPin size={14} className="text-green-700" />
            {wo.location}
          </div>
          {wo.reservoir && (
            <div className="flex items-center gap-2 text-blue-700 text-[10px] font-black uppercase tracking-wider ml-5">
              <span>RSV: {wo.reservoir}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-slate-600 text-xs font-medium">
            <Tag size={14} className="text-slate-400" />
            {wo.category}
          </div>
        </div>
      </TableCell>
      <TableCell className="px-6 py-5 text-left">
        <StatusBadge status={wo.status || 'Menunggu'} />
      </TableCell>
      <TableCell className="px-6 py-5">
        <div className="flex items-center gap-2 text-slate-700 text-sm font-bold">
          <Calendar size={14} className="text-slate-400" />
          {wo.createdAt ? new Date(wo.createdAt).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short'
          }) : '-'}
        </div>
      </TableCell>
      <TableCell className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
        <QuickActions wo={wo} onSelect={onOpen} />
      </TableCell>
    </TableRow>
  );
}
