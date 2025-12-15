
import React, { useState } from 'react';
import { Miner, MinerStatus } from '../../types';
import { Power, Settings, RefreshCw, Zap, Cpu, Thermometer, Wifi, Sparkles, Pencil, Check, X } from 'lucide-react';

interface MinerCardProps {
  miner: Miner;
  onToggle: (id: string) => void;
  onOptimize: (miner: Miner) => void;
  onUpdateName?: (id: string, newName: string) => void;
  isOptimizing?: boolean;
  disabled?: boolean;
  customButtonLabel?: string;
}

const MinerCard: React.FC<MinerCardProps> = ({ 
  miner, 
  onToggle, 
  onOptimize, 
  onUpdateName,
  isOptimizing = false, 
  disabled = false,
  customButtonLabel 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(miner.name);

  const isActive = miner.status === MinerStatus.MINING;
  const isBooting = miner.status === MinerStatus.BOOTING;
  
  const statusColor = 
    isActive ? 'text-green-400' : 
    isBooting ? 'text-yellow-400' : 
    'text-gray-500';

  const statusBg = 
    isActive ? 'bg-green-500/10 border-green-500/30' : 
    isBooting ? 'bg-yellow-500/10 border-yellow-500/30' : 
    'bg-gray-800/50 border-gray-700/50';

  const glowClass = isActive ? 'shadow-[0_0_15px_rgba(74,222,128,0.1)]' : '';

  const handleSaveName = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateName && tempName.trim()) {
      onUpdateName(miner.id, tempName);
    }
    setIsEditing(false);
  };

  // Disable AI optimize for lightweight/mobile and X10 home blades
  const allowOptimize = !(miner.model === 'X1' || miner.model === 'X10-Blade');

  return (
    <div className={`bg-[#0f172a] rounded-2xl border border-white/5 p-5 relative overflow-hidden transition-all ${glowClass} ${disabled ? 'opacity-60 grayscale pointer-events-none' : ''}`}>
      {isActive && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
            <Zap size={20} className={isActive ? 'fill-current' : ''} />
          </div>
          <div>
            {isEditing ? (
               <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                 <input 
                   type="text"
                   value={tempName}
                   onChange={e => setTempName(e.target.value)}
                   className="bg-gray-800 text-white text-sm px-2 py-1 rounded border border-cyan-500/50 focus:outline-none w-32"
                   autoFocus
                 />
                 <button onClick={handleSaveName} className="p-1 hover:bg-white/10 rounded text-green-400"><Check size={14}/></button>
                 <button onClick={() => { setIsEditing(false); setTempName(miner.name); }} className="p-1 hover:bg-white/10 rounded text-gray-400"><X size={14}/></button>
               </div>
            ) : (
                <div className="flex items-center gap-2 group/edit">
                    <h3 className="text-white font-bold text-lg leading-tight">{miner.name}</h3>
                    {onUpdateName && (
                        <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover/edit:opacity-100 text-gray-500 hover:text-white transition-opacity">
                            <Pencil size={12} />
                        </button>
                    )}
                </div>
            )}
            <p className="text-xs text-gray-500 font-mono mt-0.5 flex items-center gap-1.5">
              {miner.model}
              <span className="w-1 h-1 rounded-full bg-gray-600"></span>
              <span className={statusColor}>{isBooting ? 'BOOTING...' : miner.status}</span>
            </p>
          </div>
        </div>
        
        {/* Toggle Switch */}
        <button 
          onClick={() => onToggle(miner.id)}
          disabled={disabled}
          className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${isActive ? 'bg-green-500' : 'bg-gray-700'}`}
        >
          <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isActive ? 'translate-x-5' : 'translate-x-0'}`}>
             {isBooting && <RefreshCw size={12} className="text-gray-500 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
          </div>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
        <div className="bg-gray-900/50 rounded-xl p-3 border border-white/5">
          <div className="flex items-center gap-2 text-gray-500 text-[10px] uppercase font-bold mb-1">
            <Cpu size={12} /> Hashrate
          </div>
          <div className="text-xl font-mono text-white font-bold">
            {miner.hashrate.toFixed(2)} <span className="text-sm text-gray-500 font-normal">{miner.hashrateUnit}</span>
          </div>
        </div>
        <div className="bg-gray-900/50 rounded-xl p-3 border border-white/5">
          <div className="flex items-center gap-2 text-gray-500 text-[10px] uppercase font-bold mb-1">
            <Thermometer size={12} /> Temp
          </div>
          <div className={`text-xl font-mono font-bold ${miner.temperature > 80 ? 'text-red-400' : 'text-white'}`}>
            {miner.temperature.toFixed(1)}°C
          </div>
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="flex gap-2 relative z-10">
        {isActive ? (
          <>
            {allowOptimize ? (
              <button 
                  onClick={() => onOptimize(miner)}
                  disabled={isOptimizing}
                  className="flex-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all group"
              >
                  {isOptimizing ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {isOptimizing ? 'ANALYZING...' : 'AI OPTIMIZE'}
              </button>
            ) : (
              <div className="flex-1 bg-gray-800/40 rounded-xl border border-white/5 py-2.5 px-4 flex items-center justify-center text-xs text-gray-400 font-bold">
                AI Optimization Unavailable
              </div>
            )}

            <div className="px-3 py-2.5 bg-gray-800 rounded-xl border border-white/5 text-gray-400">
                <Wifi size={16} />
            </div>
          </>
        ) : (
           <button 
             onClick={() => onToggle(miner.id)}
             className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all ${disabled ? 'bg-gray-800 text-gray-500' : 'bg-white text-black hover:bg-gray-200'}`}
           >
             {customButtonLabel || "START MINING"}
           </button>
        )}
      </div>

      {miner.lastOptimization && isActive && (
          <div className="mt-3 pt-3 border-t border-white/5">
              <p className="text-[10px] text-cyan-500/80 flex items-center gap-1.5">
                  <Check size={10} />
                  Running optimized config: {miner.lastOptimization.substring(0, 30)}...
              </p>
          </div>
      )}
    </div>
  );
};

export default MinerCard;
