'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import ChartWrapper from './ChartWrapper';

interface ParetoChartProps {
  data: { name: string; count: number }[];
  onClick?: (category: string) => void;
}

export default function ParetoChart({ data, onClick }: ParetoChartProps) {
  return (
    <ChartWrapper 
      title="Pareto Kerusakan" 
      description="Klik batang grafik untuk memfilter detail"
      height={400}
    >
      <BarChart 
        data={data} 
        layout="vertical" 
        margin={{ left: 5, right: 10 }}
        onClick={(state) => {
          if (state && state.activeLabel && onClick) {
            onClick(String(state.activeLabel));
          }
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
        <YAxis 
          dataKey="name" 
          type="category" 
          stroke="#64748b" 
          fontSize={10} 
          width={100}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip 
          cursor={{ fill: '#f8fafc' }}
          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          itemStyle={{ color: '#15803d', fontWeight: 'bold' }}
        />
<Bar dataKey="count" radius={[0, 4, 4, 0]} className="cursor-pointer">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={index < 3 ? '#4A7C59' : '#cbd5e1'} />
          ))}
        </Bar>
      </BarChart>
    </ChartWrapper>
  );
}
