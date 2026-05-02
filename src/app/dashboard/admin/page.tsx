'use client';
import { useState, useEffect } from 'react';
import { subscribeToActivityLogs } from '@/lib/firestore';
import { ActivityLog } from '@/types/firestore';
import { 
  ShieldAlert, 
  History, 
  Clock, 
  ArrowRight,
  Info,
  Loader2,
  UserCheck
} from 'lucide-react';

export default function AdminPanelPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToActivityLogs((newLogs) => {
      setLogs(newLogs);
      setLoading(false);
    }, 50);

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-green-600" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <div className="flex items-center gap-2 text-green-700 mb-1">
          <ShieldAlert size={18} />
          <span className="text-xs font-black uppercase tracking-[0.2em]">Security & Audit</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Control Panel</h1>
        <p className="text-slate-600 mt-1 font-medium">Audit trail seluruh intervensi manual yang dilakukan oleh Admin.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 text-green-700 rounded-lg border border-green-100">
              <History size={20} />
            </div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Activity Logs (Recent 50)</h3>
          </div>
          <span className="text-[10px] font-black text-green-700 uppercase tracking-widest px-3 py-1 bg-green-50 border border-green-100 rounded-full">
            Live Updates Enabled
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {logs.map((log) => (
            <div key={log.id} className="p-6 hover:bg-slate-50 transition-colors group">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1 w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shadow-sm group-hover:bg-white transition-colors">
                    <UserCheck size={18} />
                  </div>
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-slate-900 font-black text-sm">{log.adminName}</span>
                      <span className="text-slate-300 text-xs">—</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider">
                        {log.type.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Work Order</span>
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-mono text-[10px] border border-slate-200">{log.woId || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={12} className="text-slate-400" />
                        <span className="text-xs text-slate-500 font-bold">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString('id-ID', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          }) : '-'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 max-w-fit">
                      <span className="text-slate-500 font-bold text-sm line-through decoration-slate-300 decoration-2">{log.oldValue || 'None'}</span>
                      <ArrowRight size={16} className="text-slate-300" />
                      <span className="text-green-700 font-black text-sm">{log.newValue}</span>
                    </div>
                  </div>
                </div>

                <div className="md:max-w-[300px] w-full">
                  <div className="flex items-start gap-2 text-slate-600 bg-amber-50/50 p-4 rounded-xl border border-amber-100 italic">
                    <Info size={16} className="shrink-0 text-amber-500 mt-0.5" />
                    <span className="text-xs leading-relaxed font-medium">"{log.reason}"</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {logs.length === 0 && (
            <div className="py-24 text-center">
              <History size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-500 font-bold">Belum ada catatan aktivitas admin</p>
              <p className="text-xs text-slate-400 mt-1">Aktivitas admin akan muncul secara real-time di sini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
