'use client';
import React, { useState } from 'react';
import { useAnalytics, TimeRange } from '@/hooks/useAnalytics';
import ParetoChart from '@/components/charts/ParetoChart';
import TrendChart from '@/components/charts/TrendChart';
import StatusPieChart from '@/components/charts/StatusPieChart';
import { 
  BarChart3, 
  Activity, 
  CheckCircle2, 
  Clock,
  Loader2,
  Trophy,
  Zap,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AnalyticsPage() {
  const [range, setRange] = useState<TimeRange>('7d');
  const { stats, loading } = useAnalytics(range);
  const router = useRouter();

  const handleDrillDown = (filter: string, type: 'category' | 'status') => {
    // Redirect to monitoring with filters
    const params = new URLSearchParams();
    if (type === 'category') params.set('category', filter);
    if (type === 'status') params.set('status', filter);
    router.push(`/dashboard/monitoring?${params.toString()}`);
  };

  if (loading || !stats) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-green-600" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-green-700 mb-1">
            <BarChart3 size={18} />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Operational Insights</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Performance Analytics</h1>
          <p className="text-slate-600 mt-1 font-medium">Analisa SLA, efisiensi Mandor, dan tren kerusakan infrastruktur.</p>
        </div>

        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          {(['7d', '30d', '1y', 'all'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                range === r 
                  ? 'bg-green-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* SLA & Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Avg Resolution Time" 
          value={`${stats.performance.avgResolveTime.toFixed(1)}h`} 
          subValue="Time to resolve"
          icon={Clock}
          color="blue"
        />
        <StatCard 
          title="SLA Compliance" 
          value={`${stats.performance.slaCompliance.toFixed(1)}%`} 
          subValue="On-time completion"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard 
          title="Urgent Alerts" 
          value={stats.summary.urgentAlerts} 
          subValue="Pending > 48h"
          icon={Zap}
          color="amber"
          isAlert={stats.summary.urgentAlerts > 0}
        />
        <StatCard 
          title="Active Workload" 
          value={stats.summary.process + stats.summary.pending} 
          subValue="WOs in progress"
          icon={Activity}
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <TrendChart data={stats.trendData} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ParetoChart 
              data={stats.paretoData} 
              onClick={(cat) => handleDrillDown(cat, 'category')}
            />
            <StatusPieChart 
              data={stats.statusData} 
              onClick={(status) => handleDrillDown(status, 'status')}
            />
          </div>
        </div>

        {/* Mandor Leaderboard */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                <Trophy size={20} />
              </div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Mandor Performance</h3>
            </div>

            <div className="space-y-4">
              {stats.mandorStats.slice(0, 6).map((mandor, i) => (
                <div key={mandor.name} className="p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-slate-300">#{i + 1}</span>
                      <span className="text-sm font-black text-slate-800">{mandor.name}</span>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      mandor.compliance >= 90 ? 'bg-green-50 text-green-700' : 
                      mandor.compliance >= 70 ? 'bg-amber-50 text-amber-700' : 
                      'bg-red-50 text-red-700'
                    }`}>
                      {mandor.compliance.toFixed(0)}% SLA
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                    <div className="flex gap-4">
                      <span>{mandor.completed} Selesai</span>
                      <span>{mandor.active} Aktif</span>
                    </div>
                    <span>{mandor.avgTime.toFixed(1)}h avg</span>
                  </div>
                  <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        mandor.compliance >= 90 ? 'bg-green-500' : 
                        mandor.compliance >= 70 ? 'bg-amber-500' : 
                        'bg-red-500'
                      }`}
                      style={{ width: `${mandor.compliance}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-6 py-3 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-green-200 hover:text-green-600 transition-all flex items-center justify-center gap-2">
              Lihat Semua Tim <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  subValue: string;
  icon: React.ElementType;
  color: 'blue' | 'amber' | 'emerald' | 'indigo';
  isAlert?: boolean;
}

function StatCard({ title, value, subValue, icon: Icon, color, isAlert }: StatCardProps) {
  const colors: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
  };

  return (
    <div className={`bg-white border p-6 rounded-3xl shadow-sm transition-all hover:shadow-md ${isAlert ? 'border-red-200 ring-2 ring-red-50' : 'border-slate-200'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${colors[color] || colors.blue} border shadow-sm`}>
          <Icon size={20} />
        </div>
        {isAlert && (
          <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        )}
      </div>
      <div>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{title}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
          <span className="text-[10px] font-bold text-slate-400">{subValue}</span>
        </div>
      </div>
    </div>
  );
}
