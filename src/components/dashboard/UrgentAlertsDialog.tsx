'use client';
import React, { useEffect } from 'react';
import { X, Clock, AlertTriangle, ArrowRight, MapPin, Tag } from 'lucide-react';
import Link from 'next/link';
import { UrgentAlertItem } from '@/hooks/useAnalytics';

interface UrgentAlertsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: UrgentAlertItem[];
}

export default function UrgentAlertsDialog({ isOpen, onClose, alerts }: UrgentAlertsDialogProps) {
  // Listen for Escape key to close the dialog
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Lock scroll when open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatWaitingDuration = (hours: number) => {
    if (hours < 24) {
      return `${Math.round(hours)} Jam`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    return remainingHours > 0 ? `${days} Hari ${remainingHours} Jam` : `${days} Hari`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden z-10 flex flex-col max-h-[85vh] transition-all duration-300 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-red-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 text-red-700 rounded-xl border border-red-200 animate-pulse">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Peringatan Urgent (Pending &gt; 48 Jam)</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">
                Ada {alerts.length} laporan memerlukan tindakan segera
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className="p-4 rounded-2xl border border-red-100 bg-red-50/10 hover:bg-red-50/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-red-100 text-red-800 text-[10px] font-black tracking-wider uppercase border border-red-200">
                        {alert.woNumber}
                      </span>
                      <span className="text-xs font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                        <Tag size={10} />
                        {alert.category}
                      </span>
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                        <MapPin size={10} />
                        {alert.location}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Clock size={12} className="text-red-500" />
                      <span>Menunggu selama: </span>
                      <span className="text-red-600 font-black text-sm">{formatWaitingDuration(alert.hoursWaiting)}</span>
                    </div>

                    <p className="text-[10px] text-slate-400 font-semibold">
                      Dibuat pada: {alert.createdAt ? new Date(alert.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : 'Unknown Date'}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center">
                    <Link
                      href={`/dashboard/monitoring?search=${alert.woNumber}`}
                      onClick={onClose}
                      className="px-4 py-2 bg-slate-900 text-white hover:bg-red-700 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md hover:translate-x-1"
                    >
                      Proses WO
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center flex flex-col items-center justify-center text-slate-400 opacity-60">
              <Clock size={48} className="mb-3 text-slate-300" />
              <p className="font-bold text-sm">Tidak ada laporan urgent saat ini.</p>
              <p className="text-xs mt-1">Semua laporan tertunda terselesaikan dalam batas SLA &lt; 48 jam.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-slate-500 hover:text-slate-800 text-xs font-black uppercase tracking-wider rounded-xl border border-slate-200 hover:bg-slate-100 transition-all shadow-sm"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
