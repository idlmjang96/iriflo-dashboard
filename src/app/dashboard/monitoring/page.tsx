'use client';
import { useState, Suspense } from 'react';
import WOTable from './components/WOTable';
import { Activity, LayoutGrid, ListFilter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MonitoringPage() {
  const [view, setView] = useState<'table' | 'grid'>('table');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-green-700 mb-1">
            <Activity size={18} />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Real-time Feed</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Work Order Monitoring</h1>
          <p className="text-slate-600 mt-1 font-medium">Pantau status pengerjaan dan lakukan intervensi admin secara langsung.</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setView('table')}
            className={`rounded-lg font-bold transition-all ${
              view === 'table' 
                ? 'bg-green-50 text-green-700 hover:bg-green-100 shadow-sm' 
                : 'text-slate-500 hover:text-green-700 hover:bg-green-50/50'
            }`}
          >
            <ListFilter size={16} className="mr-2" />
            Table View
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setView('grid')}
            className={`rounded-lg font-bold transition-all ${
              view === 'grid' 
                ? 'bg-green-50 text-green-700 hover:bg-green-100 shadow-sm' 
                : 'text-slate-500 hover:text-green-700 hover:bg-green-50/50'
            }`}
          >
            <LayoutGrid size={16} className="mr-2" />
            Grid View
          </Button>
        </div>
      </div>

      <div className="relative">
        <Suspense fallback={<div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-green-600" size={32} /></div>}>
          <WOTable view={view} />
        </Suspense>
      </div>
    </div>
  );
}
