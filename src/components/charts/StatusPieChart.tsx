'use client';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
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

  const renderLabel = (props: any) => {
    const {
      x,
      y,
      textAnchor,
      percent,
      name,
    } = props;

    const showLabel = name === 'Aktif' || percent >= 0.1;

    if (!showLabel) return null;

    return (
      <text
        x={x}
        y={y}
        textAnchor={textAnchor}
        dominantBaseline="central"
        fill="#334155"
        fontSize={11}
        fontWeight={800}
      >
        {name}
      </text>
    );
  };

  return (
    <div className="space-y-4">
      <ChartWrapper 
        title="Distribusi Status" 
        description="Klik segmen grafik untuk memfilter"
      >
        <PieChart margin={{ top: 20, right: 72, bottom: 20, left: 72 }}>
          <Pie
            data={themedData}
            cx="50%"
            cy="50%"
            innerRadius={58}
            outerRadius={78}
            paddingAngle={5}
            dataKey="value"
            className="cursor-pointer"
            labelLine={false}
            label={renderLabel}
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
        </PieChart>
      </ChartWrapper>
    </div>
  );
}
