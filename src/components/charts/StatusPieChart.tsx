'use client';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import ChartWrapper from './ChartWrapper';

interface StatusPieChartProps {
  data: { name: string; value: number; color: string }[];
  onClick?: (status: string) => void;
}

export default function StatusPieChart({ data, onClick }: StatusPieChartProps) {
  // Update colors to match new redesign
  const themedData = data.map(item => {
    if (item.name === 'Menunggu') return { ...item, color: '#FFC107' };
    if (item.name === 'Aktif') return { ...item, color: '#2196F3' };
    if (item.name === 'Selesai') return { ...item, color: '#4CAF50' };
    return item;
  });

  return (
    <ChartWrapper 
      title="Distribusi Status" 
      description="Klik segmen grafik untuk memfilter"
    >
      <PieChart>
        <Pie
          data={themedData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          className="cursor-pointer"
          onClick={(data) => {
            if (onClick && data && data.name) onClick(data.name);
          }}
        >
          {themedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36} 
          iconType="circle"
          formatter={(value) => <span className="text-slate-500 text-xs font-bold">{value}</span>}
        />
      </PieChart>
    </ChartWrapper>
  );
}
