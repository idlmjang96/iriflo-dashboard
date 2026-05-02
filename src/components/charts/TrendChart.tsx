'use client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import ChartWrapper from './ChartWrapper';

interface TrendChartProps {
  data: { date: string; count: number }[];
  range?: string;
}

export default function TrendChart({ data, range = '7d' }: TrendChartProps) {
  const getDescriptions = () => {
    switch (range) {
      case '7d': return 'Volume laporan harian dalam 7 hari terakhir';
      case '30d': return 'Volume laporan harian dalam 30 hari terakhir';
      case '1y': return 'Volume laporan bulanan dalam 1 tahun terakhir';
      case 'all': return 'Total volume laporan sejak awal sistem';
      default: return 'Volume laporan';
    }
  };

  const formatXAxis = (val: string) => {
    const d = new Date(val);
    if (range === '1y' || range === 'all') {
      return d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
    }
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  return (
    <ChartWrapper 
      title="Tren Laporan" 
      description={getDescriptions()}
    >
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4A7C59" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#4A7C59" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis 
          dataKey="date" 
          stroke="#94a3b8" 
          fontSize={10} 
          axisLine={false}
          tickLine={false}
          tickFormatter={formatXAxis}
        />
        <YAxis stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          labelStyle={{ color: '#475569', fontWeight: 'bold', marginBottom: '4px' }}
        />
        <Area 
          type="monotone" 
          dataKey="count" 
          stroke="#4A7C59" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorCount)" 
        />
      </AreaChart>
    </ChartWrapper>
  );
}
