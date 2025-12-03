
import React from 'react';

const StatsChart = ({ data }: { data: { time: string; value: number }[] }) => {
  if (data.length < 2) return (
    <div className="h-40 bg-gray-900/50 rounded-xl border border-white/5 flex flex-col items-center justify-center text-gray-500 text-xs mb-6">
        <span className="animate-pulse">Initializing metrics...</span>
    </div>
  );

  const maxVal = Math.max(...data.map(d => d.value), 10);
  const minVal = Math.min(...data.map(d => d.value));
  const range = maxVal - minVal || 1;
  
  return (
    <div className="h-40 bg-gray-900/50 rounded-xl border border-white/5 p-4 relative overflow-hidden mb-6">
      <div className="absolute top-2 left-4 text-[10px] text-gray-500 font-bold tracking-widest">NETWORK HASHRATE (TH/s)</div>
      
      {/* Grid Lines */}
      <div className="absolute inset-0 top-8 px-4 flex flex-col justify-between pointer-events-none opacity-20">
          <div className="w-full h-px bg-white/30"></div>
          <div className="w-full h-px bg-white/30"></div>
          <div className="w-full h-px bg-white/30"></div>
      </div>

      <div className="flex items-end justify-between h-full w-full gap-1 pt-6">
        {data.map((point, i) => {
          const heightPercentage = ((point.value - minVal) / range) * 80 + 10; // Ensure at least 10% height
          return (
            <div key={i} className="flex-1 flex flex-col justify-end group relative min-w-[4px]">
                <div 
                  className="bg-gradient-to-t from-cyan-500/20 to-cyan-400 w-full rounded-t-sm transition-all duration-500 ease-out hover:brightness-125"
                  style={{ height: `${heightPercentage}%` }}
                ></div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 border border-white/20 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none transition-opacity shadow-lg">
                    <span className="font-mono font-bold text-cyan-300">{point.value.toFixed(1)}</span>
                    <span className="text-gray-400 ml-1">TH/s</span>
                    <div className="text-[8px] text-gray-500 mt-0.5">{point.time}</div>
                </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatsChart;
