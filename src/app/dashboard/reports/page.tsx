'use client';
import { useState, useMemo } from 'react';
import { useWorkOrders } from '@/hooks/useWorkOrders';
import { convertToCSV, downloadCSV } from '@/utils/export';
import { 
  FileDown, 
  Filter, 
  Search, 
  Calendar, 
  MapPin, 
  Tag,
  Loader2,
  FileText,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StatusBadge from '../monitoring/components/StatusBadge';

export default function ReportsPage() {
  const { data: workOrders, loading } = useWorkOrders();
  
  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Extract unique categories for filter
  const categories = useMemo(() => {
    const cats = new Set(workOrders.map(wo => wo.category || 'Uncategorized'));
    return ['All', ...Array.from(cats)];
  }, [workOrders]);

  const filteredData = useMemo(() => {
    const searchTerms = search.toLowerCase();
    const normalizedSearch = searchTerms.replace(/\s/g, '');

    return workOrders.filter(wo => {
      // Robust Search (ID, Location, Description, Reservoir)
      const matchesText = (wo.woNumber?.toLowerCase() || '').includes(searchTerms) || 
                          (wo.location?.toLowerCase() || '').includes(searchTerms) ||
                          (wo.description?.toLowerCase() || '').includes(searchTerms) ||
                          (wo.reservoir ? (
                            wo.reservoir.toLowerCase().includes(searchTerms) || 
                            wo.reservoir.toLowerCase().replace(/\s/g, '').includes(normalizedSearch) ||
                            `rsv${wo.reservoir.toLowerCase().replace(/\s/g, '')}`.includes(normalizedSearch)
                          ) : false);

      const matchStatus = statusFilter === 'All' || 
                         wo.status === statusFilter || 
                         (statusFilter === 'Menunggu' && wo.status === 'Menunggu Approval');
      const matchCategory = categoryFilter === 'All' || (wo.category || 'Uncategorized') === categoryFilter;
      
      let matchDate = true;
      if (dateFrom && wo.createdAt) {
        matchDate = matchDate && new Date(wo.createdAt) >= new Date(dateFrom);
      }
      if (dateTo && wo.createdAt) {
        const dTo = new Date(dateTo);
        dTo.setHours(23, 59, 59, 999);
        matchDate = matchDate && new Date(wo.createdAt) <= dTo;
      }

      return matchesText && matchStatus && matchCategory && matchDate;
    });
  }, [workOrders, search, statusFilter, categoryFilter, dateFrom, dateTo]);

  const handleExport = () => {
    const csv = convertToCSV(filteredData);
    const fileName = `IRIFLO_Report_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csv, fileName);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-green-600" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-green-700 mb-1">
            <FileText size={18} />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Reporting System</span>
          </div>
          <h1 className="text-3xl font-extrabold text-green-900 tracking-tight">Reports & Export</h1>
          <p className="text-slate-600 mt-1 font-medium">Filter data laporan dan unduh dalam format CSV untuk dokumentasi.</p>
        </div>

        <Button 
          onClick={handleExport}
          disabled={filteredData.length === 0}
          className="bg-green-700 hover:bg-green-800 text-white font-black h-12 px-6 rounded-xl shadow-lg shadow-green-700/20 transition-all flex gap-2"
        >
          <FileDown size={20} />
          Ekspor CSV ({filteredData.length})
        </Button>
      </div>

      {/* Advanced Filter Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-slate-800 font-black text-sm mb-6 uppercase tracking-widest">
          <Filter size={16} className="text-green-700" />
          Filter Parameter
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Search */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cari WO / Lokasi</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ID atau Lokasi..." 
                className="pl-10 bg-slate-50 border-slate-200 text-slate-900 font-medium"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Status</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 rounded-md bg-slate-50 border border-slate-200 text-slate-900 font-medium text-sm px-3 focus:ring-2 focus:ring-green-500/50 focus:outline-none"
            >
              <option value="All">Semua Status</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Disetujui">Disetujui</option>
              <option value="Proses">Proses</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          {/* Date From */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Dari Tanggal</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full h-10 rounded-md bg-slate-50 border border-slate-200 text-slate-900 font-medium text-sm pl-10 pr-3 focus:ring-2 focus:ring-green-500/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Date To */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sampai Tanggal</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full h-10 rounded-md bg-slate-50 border border-slate-200 text-slate-900 font-medium text-sm pl-10 pr-3 focus:ring-2 focus:ring-green-500/50 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-[10px] font-black text-slate-700 uppercase tracking-widest w-[15%]">WO Number</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-700 uppercase tracking-widest w-[25%]">Lokasi</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-700 uppercase tracking-widest w-[15%]">Kategori</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-700 uppercase tracking-widest w-[12%]">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-700 uppercase tracking-widest w-[15%]">Tgl Laporan</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-700 uppercase tracking-widest text-right w-[18%]">Tgl Selesai</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(wo => (
              <tr key={wo.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors selectable">
                <td className="px-6 py-4 text-sm font-black text-slate-900">{wo.woNumber}</td>
                <td className="px-6 py-4 text-sm text-slate-900 font-bold">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-green-700" />
                      {wo.location}
                    </div>
                    {wo.reservoir && (
                      <div className="text-[10px] text-blue-700 font-black uppercase tracking-wider ml-5">
                        RSV: {wo.reservoir}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-slate-400" />
                    {wo.category}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <StatusBadge status={wo.status || 'Menunggu'} />
                </td>
                <td className="px-6 py-4 text-sm text-slate-800 font-bold">
                  {wo.createdAt ? new Date(wo.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                </td>
                <td className="px-6 py-4 text-sm text-right">
                  {wo.tglSelesai ? (
                    <span className="inline-flex items-center gap-1.5 text-green-700 font-bold">
                      <CheckCircle size={14} />
                      {new Date(wo.tglSelesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic text-xs">Belum selesai</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
