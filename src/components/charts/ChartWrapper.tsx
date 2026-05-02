'use client';
import { ReactNode, useState, useEffect } from 'react';
import { ResponsiveContainer } from 'recharts';

interface ChartWrapperProps {
  children: ReactNode;
  height?: number | string;
  title?: string;
  description?: string;
}

export default function ChartWrapper({ 
  children, 
  height = 300, 
  title, 
  description 
}: ChartWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Small delay to ensure container has measured dimensions
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all flex flex-col group min-w-0">
      {(title || description) && (
        <div className="mb-6">
          {title && <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest group-hover:text-green-700 transition-colors">{title}</h3>}
          {description && <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-wider">{description}</p>}
        </div>
      )}
      <div className="w-full relative min-h-[100px]" style={{ height: typeof height === 'number' ? `${height}px` : height }}>
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            {children as React.ReactElement}
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl" />
        )}
      </div>
    </div>
  );
}
