
import React from 'react';

const StatsChart = ({ data }: { data: { time: string; total: number; x30: number; x100: number }[] }) => {
  if (data.length < 2) return (
    <div className="h-40 bg-gray-900/50 rounded-xl border border-white/5 flex flex-col items-center justify-center text-gray-500 text-xs mb-6">
        <span className="animate-pulse">Initializing metrics...</span>
    </div>
  );

  const maxVal = Math.max(...data.map(d => d.total), 10);
  const minVal = Math.min(...data.map(d => d.total), 0);
  // Add padding to range for better visual movement (20% padding on each side)
  const rawRange = maxVal - minVal || 1;
  const paddedMin = minVal - rawRange * 0.1;
  const paddedMax = maxVal + rawRange * 0.1;
  const range = paddedMax - paddedMin;
  
  return (
    <div className="h-48 bg-gray-900/50 rounded-xl border border-white/5 p-4 relative overflow-hidden mb-6">
      <div className="absolute top-2 left-4 text-[10px] text-gray-500 font-bold tracking-widest">NETWORK HASHRATE (TH/s)</div>
      
      {/* Legend */}
      <div className="absolute top-2 right-4 flex items-center gap-3 text-[9px] font-bold">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
          <span className="text-cyan-400">TOTAL</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-purple-400"></div>
          <span className="text-purple-400">X30</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-amber-400"></div>
          <span className="text-amber-400">X100</span>
        </div>
      </div>
      
      {/* Grid Lines */}
      <div className="absolute inset-0 top-10 px-4 flex flex-col justify-between pointer-events-none opacity-20">
          <div className="w-full h-px bg-white/30"></div>
          <div className="w-full h-px bg-white/30"></div>
          <div className="w-full h-px bg-white/30"></div>
      </div>

      <div className="relative h-full w-full pt-8">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {(() => {
            const width = 100;
            const height = 100;
            const step = width / (data.length - 1);
            
            // Generate path for Total line (Cyan)
            const totalPath = data.map((point, i) => {
              const x = i * step;
              const y = height - ((point.total - paddedMin) / range) * 85;
              return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
            }).join(' ');
            
            // Generate path for X30 line (Purple)
            const x30Path = data.map((point, i) => {
              const x = i * step;
              const y = height - ((point.x30 - paddedMin) / range) * 85;
              return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
            }).join(' ');
            
            // Generate path for X100 line (Amber)
            const x100Path = data.map((point, i) => {
              const x = i * step;
              const y = height - ((point.x100 - paddedMin) / range) * 85;
              return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
            }).join(' ');
            
            return (
              <>
                {/* Total line - Cyan */}
                <path
                  d={totalPath}
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                  className="transition-all duration-300"
                />
                {/* X30 line - Purple */}
                {data.some(d => d.x30 > 0) && (
                  <path
                    d={x30Path}
                    fill="none"
                    stroke="#c084fc"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                    className="transition-all duration-300"
                  />
                )}
                {/* X100 line - Amber */}
                {data.some(d => d.x100 > 0) && (
                  <path
                    d={x100Path}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                    className="transition-all duration-300"
                  />
                )}
                {/* Data points for hover */}
                {data.map((point, i) => {
                  const x = (i * step);
                  const yTotal = height - ((point.total - minVal) / range) * 85;
                  return (
                    <g key={i}>
                      <circle
                        cx={x}
                        cy={yTotal}
                        r="1.5"
                        fill="#22d3ee"
                        className="opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                      />
                    </g>
                  );
                })}
              </>
            );
          })()}
        </svg>
      </div>
    </div>
  );
};

export default StatsChart;
