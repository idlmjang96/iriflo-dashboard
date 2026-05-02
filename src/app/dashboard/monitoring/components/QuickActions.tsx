'use client';
import { WorkOrder } from '@/types/firestore';
import { useState } from 'react';
import { 
  MoreHorizontal, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  ShieldAlert,
  CalendarIcon,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { updateWorkOrderStatus } from '@/lib/firestore';

interface QuickActionsProps {
  wo: WorkOrder;
  onSelect: (wo: WorkOrder) => void;
}

export default function QuickActions({ wo, onSelect }: QuickActionsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [completionDate, setCompletionDate] = useState(() => {
    // Default: today's date in YYYY-MM-DD format
    return new Date().toISOString().split('T')[0];
  });

  const handleStatusUpdate = async (newStatus: string) => {
    if (confirm(`Apakah Anda yakin ingin mengubah status WO ${wo.woNumber} menjadi "${newStatus}"?`)) {
      setIsUpdating(true);
      try {
        await updateWorkOrderStatus(wo.id, newStatus, 'Status updated via Quick Actions');
      } catch (error) {
        console.error('Update failed:', error);
        alert('Gagal memperbarui status');
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleCompleteWithDate = async () => {
    setIsUpdating(true);
    try {
      const selectedDate = new Date(completionDate);
      // Set time to end of day (23:59:59) for accurate reporting
      selectedDate.setHours(23, 59, 59, 0);
      
      await updateWorkOrderStatus(
        wo.id, 
        'Selesai', 
        'Status updated via Quick Actions (Admin Override)',
        'Admin',
        selectedDate
      );
      setShowCompletionDialog(false);
    } catch (error) {
      console.error('Update failed:', error);
      alert('Gagal memperbarui status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-xl h-9 w-9 text-slate-500 bg-slate-50 border border-slate-200 hover:text-green-600 hover:bg-green-50 hover:border-green-200 transition-all shadow-sm outline-none">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-5 w-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-white border-slate-100 shadow-lg rounded-xl overflow-hidden p-1">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-slate-400 text-[10px] uppercase tracking-widest font-bold px-4 py-3">Quick Actions</DropdownMenuLabel>
            <DropdownMenuItem 
              onClick={() => onSelect(wo)}
              className="hover:bg-slate-50 focus:bg-slate-50 cursor-pointer gap-2 px-4 py-2.5 text-sm font-medium text-slate-700"
            >
              <Eye size={16} className="text-blue-500" />
              Lihat Detail
            </DropdownMenuItem>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator className="bg-slate-50" />
          
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-slate-400 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 px-4 py-3">
              <ShieldAlert size={14} className="text-amber-500" />
              Admin Override {wo.status === 'Selesai' && '(Locked)'}
            </DropdownMenuLabel>
            
            <DropdownMenuItem 
              onClick={() => handleStatusUpdate('Proses')}
              disabled={wo.status === 'Selesai' || wo.status === 'Proses' || isUpdating}
              className="hover:bg-green-50 focus:bg-green-50 cursor-pointer gap-2 px-4 py-2.5 text-sm font-medium text-green-700"
            >
              <Clock size={16} className="text-green-600" />
              {'Set to "Proses"'}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setShowCompletionDialog(true)}
              disabled={wo.status === 'Selesai' || isUpdating}
              className="hover:bg-green-50 focus:bg-green-50 cursor-pointer gap-2 px-4 py-2.5 text-sm font-medium text-green-700"
            >
              <CheckCircle size={16} className="text-green-600" />
              {'Set to "Selesai"'}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleStatusUpdate('Menunggu')}
              disabled={wo.status === 'Selesai' || wo.status === 'Menunggu' || isUpdating}
              className="hover:bg-amber-50 focus:bg-amber-50 cursor-pointer gap-2 px-4 py-2.5 text-sm font-medium text-amber-700"
            >
              <AlertTriangle size={16} className="text-amber-600" />
              {'Revert to "Menunggu"'}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Completion Date Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="max-w-sm bg-white border-slate-200 rounded-2xl p-0 overflow-hidden shadow-2xl">
          <div className="bg-green-600 p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-white">
                Selesaikan Work Order
              </DialogTitle>
              <DialogDescription className="text-green-100 text-sm mt-1">
                Masukkan tanggal selesai perbaikan untuk <span className="font-bold text-white">{wo.woNumber}</span>
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-6 space-y-5">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                Tanggal Selesai Perbaikan
              </label>
              <div className="relative">
                <CalendarIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="date"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                Maksimal tanggal hari ini. Pilih tanggal saat perbaikan benar-benar selesai di lapangan.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCompletionDialog(false)}
                disabled={isUpdating}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleCompleteWithDate}
                disabled={isUpdating || !completionDate}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-black text-white bg-green-600 hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Selesaikan
                  </>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
