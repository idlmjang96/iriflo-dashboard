'use client';
import { ReactNode, useState, useEffect, useRef } from 'react';
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    if (typeof ResizeObserver === 'undefined') {
      setIsReady(true);
      return;
    }

    const updateReadyState = () => {
      const rect = node.getBoundingClientRect();
      setIsReady(rect.width > 0 && rect.height > 0);
    };

    updateReadyState();

    const observer = new ResizeObserver(() => {
      updateReadyState();
    });

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all flex flex-col group min-w-0">
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest group-hover:text-green-700 transition-colors">{title}</h3>}
          {description && <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-wider">{description}</p>}
        </div>
      )}
      <div 
        ref={containerRef}
        className="w-full relative min-h-[100px]" 
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        {isReady ? (
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
