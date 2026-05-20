'use client';
import { useAnalytics, TimeRange } from '@/hooks/useAnalytics';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ParetoChart from '@/components/charts/ParetoChart';
import TrendChart from '@/components/charts/TrendChart';
import StatusPieChart from '@/components/charts/StatusPieChart';
import RecentActivity from '@/components/dashboard/RecentActivity';
import UrgentAlertsDialog from '@/components/dashboard/UrgentAlertsDialog';
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Loader2,
  TrendingUp,
  TrendingDown,
  LayoutDashboard,
  Trophy,
  Zap,
  ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [range, setRange] = useState<TimeRange>('all');
  const [isUrgentModalOpen, setIsUrgentModalOpen] = useState(false);
  const { stats, loading } = useAnalytics(range);
  const router = useRouter();

  const handleDrillDown = (filter: string, type: 'category' | 'status') => {
    const params = new URLSearchParams();
    if (type === 'category') params.set('category', filter);
    if (type === 'status') params.set('status', filter);
    router.push(`/dashboard/monitoring?${params.toString()}`);
  };

  if (loading || !stats) {
    return (
      <div className="flex h-[60vh] items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-green-600" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <LayoutDashboard size={18} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Operational Intelligence</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Executive Overview</h1>
          <p className="text-slate-500 mt-1 font-medium">Monitoring real-time, performa SLA, dan efisiensi tim lapangan.</p>
          <div className="flex flex-wrap items-center gap-2 pt-3">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
              Periode: {range === 'all' ? 'Seluruh Waktu' : range === '7d' ? '7 Hari Terakhir' : range === '30d' ? '30 Hari Terakhir' : '1 Tahun Terakhir'}
            </span>
          </div>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          {(['7d', '30d', '1y', 'all'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 -mt-2">
        <StatCard 
          title="SLA Compliance" 
          value={`${stats.performance.slaCompliance.toFixed(1)}%`} 
          subValue={range === 'all' ? 'Lifetime resolve' : `On-time resolve (${range})`}
          icon={TrendingUp}
          color="green"
          trend="up"
          change={range === 'all' ? 'Overall' : `${range} rate`}
        />
        <StatCard 
          title="Avg Resolution" 
          value={`${stats.performance.avgResolveTime.toFixed(1)}h`} 
          subValue="Time to resolve"
          icon={Clock}
          color="blue"
          trend="neutral"
          change={range === 'all' ? 'Lifetime Avg' : `${range} Avg`}
        />
        <StatCard 
          title="Active Reports" 
          value={(stats.summary.pending + stats.summary.process).toLocaleString()} 
          subValue="Reports in progress"
          icon={Activity}
          color="amber"
          trend="neutral"
          change={range === 'all' ? 'Total open' : `Opened in ${range}`}
        />
        <StatCard 
          title="Urgent Alerts" 
          value={stats.summary.urgentAlerts.toLocaleString()} 
          subValue="Pending > 48h"
          icon={Zap}
          color="red"
          trend="down"
          change="Critical"
          isAlert={stats.summary.urgentAlerts > 0}
          onClick={() => setIsUrgentModalOpen(true)}
        />
      </div>

      {/* Row 1: Trends & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <TrendChart data={stats.trendData} range={range} />
        </div>
        <div className="lg:col-span-1">
          <StatusPieChart 
            data={stats.statusData} 
            onClick={(status) => handleDrillDown(status, 'status')}
          />
        </div>
      </div>

      {/* Row 2: Analysis & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <ParetoChart 
            data={stats.paretoData} 
            onClick={(cat) => handleDrillDown(cat, 'category')}
          />
        </div>
        
        {/* Mandor Leaderboard */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                <Trophy size={20} />
              </div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Mandor Performance</h3>
            </div>

            <div className="space-y-4">
              {stats.mandorStats.slice(0, 5).map((mandor, i) => (
                <div key={mandor.name} className="p-3.5 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-slate-300">#{i + 1}</span>
                      <span className="text-xs font-black text-slate-800">{mandor.name}</span>
                    </div>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                      mandor.compliance >= 90 ? 'bg-green-50 text-green-700' : 
                      mandor.compliance >= 70 ? 'bg-amber-50 text-amber-700' : 
                      'bg-red-50 text-red-700'
                    }`}>
                      {mandor.compliance.toFixed(0)}% SLA
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-bold text-slate-500">
                    <span>{mandor.completed} Selesai · {mandor.avgTime.toFixed(1)}h avg</span>
                    <span className="text-slate-400">{mandor.active} Aktif</span>
                  </div>
                </div>
              ))}
              {stats.mandorStats.length === 0 && (
                <p className="text-center py-8 text-xs text-slate-400 italic">Belum ada data performa</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <RecentActivity />
        </div>
      </div>

      <UrgentAlertsDialog 
        isOpen={isUrgentModalOpen}
        onClose={() => setIsUrgentModalOpen(false)}
        alerts={stats.urgentAlertData || []}
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  subValue: string;
  change: string;
  icon: React.ElementType;
  trend: 'up' | 'down' | 'neutral';
  color: 'green' | 'amber' | 'blue' | 'red';
  isAlert?: boolean;
  onClick?: () => void;
}

function StatCard({ title, value, subValue, change, icon: Icon, trend, color, isAlert, onClick }: StatCardProps) {
  const colors: Record<string, string> = {
    green: 'bg-green-50 text-green-700 border-green-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white border p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 group ${
        isAlert ? 'border-red-200 ring-2 ring-red-50 animate-pulse' : 'border-slate-200'
      } ${onClick ? 'cursor-pointer hover:border-red-400 hover:ring-4 hover:ring-red-100' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3.5 rounded-2xl ${colors[color]} border transition-transform group-hover:rotate-6`}>
          <Icon size={20} />
        </div>
        <div className={`flex items-center gap-1 text-[9px] font-black ${
          trend === 'up' ? 'text-green-700' : trend === 'down' ? 'text-red-700' : 'text-slate-500'
        } bg-slate-50 px-2 py-1 rounded-full border border-slate-100`}>
          {trend === 'up' && <TrendingUp size={10} />}
          {trend === 'down' && <TrendingDown size={10} />}
          {change}
        </div>
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
