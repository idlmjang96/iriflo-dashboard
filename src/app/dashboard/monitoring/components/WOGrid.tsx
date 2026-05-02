'use client';
import { WorkOrder } from '@/types/firestore';
import StatusBadge from './StatusBadge';
import QuickActions from './QuickActions';
import { MapPin, Tag, Calendar, Clock, ChevronRight } from 'lucide-react';

interface WOGridProps {
  data: WorkOrder[];
  onOpenModal: (wo: WorkOrder) => void;
}

export default function WOGrid({ data, onOpenModal }: WOGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((wo) => (
        <div 
          key={wo.id}
          onClick={() => onOpenModal(wo)}
          className="group bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
        >
          {/* Status Indicator Bar */}
          <div className={`absolute top-0 left-0 w-full h-1.5 ${
            wo.status === 'Selesai' ? 'bg-green-500' : 
            wo.status === 'Proses' ? 'bg-blue-500' : 
            'bg-amber-500'
          }`} />

          <div className="flex justify-between items-start mb-6">
            <div className="space-y-1 selectable">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Work Order</span>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">{wo.woNumber}</h3>
            </div>
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <StatusBadge status={wo.status || 'Menunggu'} />
              <QuickActions wo={wo} onSelect={onOpenModal} />
            </div>
          </div>

          <div className="space-y-4 selectable">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-900 text-sm font-bold">
                <MapPin size={16} className="text-green-700" />
                {wo.location}
              </div>
              {wo.reservoir && (
                <div className="flex items-center gap-2 text-blue-700 text-[10px] font-black uppercase tracking-wider ml-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  RSV: {wo.reservoir}
                </div>
              )}
            </div>

            <p className="text-slate-500 text-xs font-medium line-clamp-2 min-h-[32px]">
              {wo.description || 'Tidak ada deskripsi tambahan.'}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold">
                  <Tag size={14} className="text-slate-300" />
                  {wo.category}
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold">
                  <Calendar size={14} className="text-slate-300" />
                  {wo.createdAt ? new Date(wo.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                </div>
              </div>
            </div>
          </div>

          {/* Hover Arrow */}
          <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
             <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                <ChevronRight size={18} />
             </div>
          </div>
        </div>
      ))}
    </div>
  );
}
