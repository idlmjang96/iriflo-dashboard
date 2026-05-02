'use client';
import { useEffect, useState } from 'react';
import { subscribeToActivityLogs } from '@/lib/firestore';
import { ActivityLog } from '@/types/firestore';
import { Clock, ShieldAlert, User, CheckCircle2, History } from 'lucide-react';

export default function RecentActivity() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToActivityLogs((data) => {
      setLogs(data.slice(0, 5)); // Only show top 5
      setLoading(false);
    }, 10);

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 h-[400px] flex items-center justify-center">
        <Clock className="animate-spin text-slate-300" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[400px]">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <History size={16} className="text-green-600" />
            Audit Trail
          </h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Aktivitas admin terbaru</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
            <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${
              log.type === 'STATUS_OVERRIDE' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
            }`}>
              {log.type === 'STATUS_OVERRIDE' ? <ShieldAlert size={20} /> : <User size={20} />}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <p className="text-sm font-black text-slate-900 truncate">
                  {log.adminName}
                </p>
                <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap ml-2">
                  {log.timestamp ? new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5 line-clamp-2">
                Mengubah status <span className="font-bold text-slate-900">#{log.woId?.substring(0, 8)}</span> ke <span className="text-green-700 font-bold">"{log.newValue}"</span>
              </p>
              <div className="mt-2 flex items-center gap-2">
                 <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase tracking-tighter">
                   Reason: {log.reason || 'No reason provided'}
                 </span>
              </div>
            </div>
          </div>
        ))}
        
        {logs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50 italic py-20">
            <Clock size={40} className="mb-2" />
            <p className="text-sm font-bold">Belum ada aktivitas tercatat</p>
          </div>
        )}
      </div>
    </div>
  );
}
