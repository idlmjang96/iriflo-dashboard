'use client';
import { WorkOrder } from '@/types/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import StatusBadge from './StatusBadge';
import { 
  MapPin, 
  Tag, 
  Calendar, 
  User, 
  FileText, 
  Droplets,
  MessageSquare,
  ShieldCheck,
  LucideIcon
} from 'lucide-react';

interface WODetailModalProps {
  wo: WorkOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function WODetailModal({ wo, isOpen, onClose }: WODetailModalProps) {
  if (!wo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white border-slate-200 text-slate-900 rounded-3xl p-0 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        <div className="bg-green-600 p-8 text-white relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Droplets size={120} />
          </div>
          <DialogHeader className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/30 backdrop-blur-sm">
                Work Order Details
              </span>
              <StatusBadge status={wo.status || 'Menunggu'} />
            </div>
            <DialogTitle className="text-3xl font-black tracking-tight text-white">
              {wo.woNumber}
            </DialogTitle>
            <DialogDescription className="text-green-50/80 font-medium">
              Informasi lengkap laporan kerusakan dari lapangan.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left Column: Core Info */}
            <div className="space-y-8">
              <section>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">
                  Deskripsi Kerusakan
                </label>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex gap-4 shadow-sm italic text-slate-700 leading-relaxed">
                  <FileText className="text-green-600 shrink-0 mt-1" size={20} />
                  <p className="text-sm font-medium">
                    &ldquo;{wo.uraian || wo.description || 'Tidak ada deskripsi rinci'}&rdquo;
                  </p>
                </div>
              </section>

              <div className="grid grid-cols-1 gap-6">
                <InfoItem 
                  icon={MapPin} 
                  label="Lokasi" 
                  value={wo.location} 
                  iconColor="text-red-600"
                  bgColor="bg-red-50"
                />
                {wo.reservoir && (
                  <InfoItem 
                    icon={Droplets} 
                    label="Reservoir" 
                    value={wo.reservoir} 
                    iconColor="text-blue-600"
                    bgColor="bg-blue-50"
                  />
                )}
                <InfoItem 
                  icon={Tag} 
                  label="Kategori" 
                  value={wo.category} 
                  iconColor="text-amber-600"
                  bgColor="bg-amber-50"
                />
              </div>
            </div>

            {/* Right Column: Personnel & Meta */}
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-6">
                <InfoItem 
                  icon={User} 
                  label="Nama Pelapor" 
                  value={wo.pelaporNama || wo.createdBy || 'Anonymous'} 
                  iconColor="text-emerald-600"
                  bgColor="bg-emerald-50"
                />
                <InfoItem 
                  icon={Calendar} 
                  label="Waktu Laporan" 
                  value={wo.createdAt ? new Date(wo.createdAt).toLocaleString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  }) : '-'} 
                  iconColor="text-indigo-600"
                  bgColor="bg-indigo-50"
                />
              </div>
 
              <div className="pt-6 border-t border-slate-100">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">
                  Petugas Berwenang
                </label>
                <div className="space-y-4">
                  <PersonnelItem 
                    label="Mandor Lapangan"
                    name={wo.mandorNama || 'Belum ditugaskan'}
                    icon={User}
                  />
                  <PersonnelItem 
                    label="Atasan Penyetuju"
                    name={wo.atasanNama || 'Belum disetujui'}
                    icon={ShieldCheck}
                  />
                </div>
              </div>
 
              {wo.catatan && (
                <div className="pt-6 border-t border-slate-100">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">
                    Catatan Penyelesaian
                  </label>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-600 flex gap-2">
                    <MessageSquare size={14} className="shrink-0 mt-0.5 text-slate-400" />
                    <span>{wo.catatan}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
          <button 
            onClick={onClose}
            className="px-8 py-3 rounded-xl bg-slate-900 text-white text-sm font-black transition-all hover:bg-slate-800 shadow-lg shadow-slate-900/20 active:scale-95"
          >
            Tutup Detail
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface InfoItemProps {
  icon: LucideIcon;
  label: string;
  value?: string;
  iconColor: string;
  bgColor: string;
}

function InfoItem({ icon: Icon, label, value, iconColor, bgColor }: InfoItemProps) {
  return (
    <div className="flex items-start gap-4">
      <div className={`p-3 rounded-2xl ${bgColor} ${iconColor} border border-current/10 shadow-sm`}>
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
          {label}
        </span>
        <span className="text-sm text-slate-800 font-bold leading-tight">{value}</span>
      </div>
    </div>
  );
}

interface PersonnelItemProps {
  label: string;
  name?: string;
  icon: LucideIcon;
}

function PersonnelItem({ label, name, icon: Icon }: PersonnelItemProps) {
  const isAssigned = name && name !== 'Belum ditugaskan' && name !== 'Belum disetujui';
  
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${isAssigned ? 'bg-green-50 border-green-100 text-green-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className={`text-xs font-bold ${isAssigned ? 'text-slate-800' : 'text-slate-400 italic'}`}>{name}</p>
      </div>
    </div>
  );
}
