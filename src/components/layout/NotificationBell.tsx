'use client';
import { useState, useEffect } from 'react';
import { 
  Bell, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { useWorkOrders } from '@/hooks/useWorkOrders';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

export default function NotificationBell() {
  const { data: workOrders } = useWorkOrders();
  const [hasNew, setHasNew] = useState(false);
  
  // Filter for pending approvals (urgent)
  const pendingWOs = workOrders
    .filter(wo => wo.status === 'Menunggu' || wo.status === 'Menunggu Approval')
    .slice(0, 5);

  useEffect(() => {
    if (pendingWOs.length > 0) {
      setHasNew(true);
    }
  }, [pendingWOs.length]);

  return (
    <DropdownMenu onOpenChange={(open) => open && setHasNew(false)}>
      <DropdownMenuTrigger
        render={
          <button className="text-slate-400 hover:text-green-600 transition-colors relative outline-none cursor-pointer">
            <Bell size={20} />
            {hasNew && pendingWOs.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-bounce" />
            )}
          </button>
        }
      />
      
      <DropdownMenuContent className="w-80 bg-white border-slate-200 rounded-2xl shadow-xl p-2 z-[100]" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Notifikasi</span>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-black rounded-full uppercase tracking-tighter">
                {pendingWOs.length} Urgent
              </span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator className="bg-slate-100" />
        
        <div className="max-h-[350px] overflow-y-auto">
          {pendingWOs.length > 0 ? (
            pendingWOs.map((wo) => (
              <DropdownMenuItem key={wo.id} className="p-0 focus:bg-transparent">
                <Link 
                  href={`/dashboard/monitoring?wo=${wo.id}`} 
                  className="flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 w-full"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-1">
                    <Clock size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      Persetujuan Diperlukan: #{wo.woNumber}
                    </p>
                    <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">
                      Laporan di <span className="text-slate-700 font-bold">{wo.location}</span> butuh segera disetujui.
                    </p>
                    <p className="text-[9px] text-slate-400 mt-2 font-medium">
                      {wo.createdAt ? new Date(wo.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="py-10 text-center flex flex-col items-center justify-center opacity-40 grayscale">
              <CheckCircle2 size={40} className="text-green-600 mb-2" />
              <p className="text-xs font-bold text-slate-500">Semua laporan sudah teratasi</p>
            </div>
          )}
        </div>
        
        <DropdownMenuSeparator className="bg-slate-100" />
        
        <Link href="/dashboard/monitoring">
          <DropdownMenuItem className="p-3 text-xs font-black text-green-700 justify-center gap-2 hover:bg-green-50 cursor-pointer rounded-xl m-1 transition-all">
            Lihat Semua Monitoring
            <ExternalLink size={14} />
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
