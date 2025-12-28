
import React, { useState } from 'react';
import { Miner, MinerStatus } from '../../types';
import { X, Activity, Zap, Clock, Wifi, Terminal, Settings, Power, ChevronRight, Server, AlertTriangle } from 'lucide-react';

interface AsicDashboardProps {
  miner: Miner;
  onClose: () => void;
  onToggle: (id: string) => void;
  isPremium: boolean;
}

const AsicDashboard: React.FC<AsicDashboardProps> = ({ miner, onClose, onToggle, isPremium }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'config'>('overview');

  const isActive = miner.status === MinerStatus.MINING;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl h-[85vh] bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
           <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${isActive ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-500'}`}>
                 <Server size={24} />
              </div>
              <div>
                 <h2 className="text-2xl font-bold text-white tracking-tight">{miner.name}</h2>
                 <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">{miner.ipAddress || "192.168.x.x"}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${isActive ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-500'}`}>
                        {miner.status}
                    </span>
                 </div>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <button onClick={() => onToggle(miner.id)} className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors ${isActive ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500 text-white hover:bg-green-600'}`}>
                 <Power size={16} />
                 {isActive ? "STOP MINER" : "START MINER"}
              </button>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5">
                 <X size={24} />
              </button>
           </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
           {/* Sidebar */}
           <div className="w-64 bg-slate-900/30 border-r border-white/5 flex flex-col p-4 gap-2">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`w-full p-3 rounded-xl flex items-center gap-3 text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                 <Activity size={18} /> Overview
              </button>
              <button 
                onClick={() => setActiveTab('logs')}
                className={`w-full p-3 rounded-xl flex items-center gap-3 text-sm font-bold transition-all ${activeTab === 'logs' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                 <Terminal size={18} /> System Logs
              </button>
              <button 
                onClick={() => setActiveTab('config')}
                className={`w-full p-3 rounded-xl flex items-center gap-3 text-sm font-bold transition-all ${activeTab === 'config' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                 <Settings size={18} /> Configuration
              </button>
           </div>

           {/* Main Panel */}
           <div className="flex-1 bg-black/20 p-8 overflow-y-auto">
              
              {activeTab === 'overview' && (
                 <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-6">
                       <div className="bg-slate-900 p-5 rounded-2xl border border-white/5 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-10"><Activity size={48} className="text-cyan-400" /></div>
                          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Realtime Hashrate</p>
                          <p className="text-3xl font-mono font-bold text-white">{miner.hashrate.toFixed(2)} <span className="text-lg text-slate-500">TH/s</span></p>
                       </div>
                       <div className="bg-slate-900 p-5 rounded-2xl border border-white/5 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={48} className="text-yellow-400" /></div>
                          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Power Consumption</p>
                          <p className="text-3xl font-mono font-bold text-white">{miner.powerUsage} <span className="text-lg text-slate-500">W</span></p>
                       </div>
                       <div className="bg-slate-900 p-5 rounded-2xl border border-white/5 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-10"><Clock size={48} className="text-green-400" /></div>
                          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Uptime</p>
                          <p className="text-3xl font-mono font-bold text-white">14d 2h</p>
                       </div>
                    </div>

                    <div className="bg-slate-900 rounded-2xl border border-white/5 p-6">
                       <h3 className="text-lg font-bold text-white mb-6">Hashboard Status</h3>
                       <div className="space-y-4">
                          {[1, 2, 3].map(board => (
                             <div key={board} className="flex items-center justify-between bg-black/30 p-4 rounded-xl border border-white/5">
                                <div className="flex items-center gap-4">
                                   <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                   <span className="font-bold text-slate-300">Board #{board}</span>
                                </div>
                                <div className="flex gap-8 text-sm font-mono text-slate-400">
                                   <span>{(miner.hashrate / 3).toFixed(1)} TH/s</span>
                                   <span>{miner.temperature.toFixed(1)}°C</span>
                                   <span className="text-green-400">OK</span>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
              )}

              {activeTab === 'logs' && (
                 <div className="bg-black rounded-xl border border-slate-800 p-4 font-mono text-xs text-slate-400 h-full overflow-y-auto">
                    <p className="text-cyan-400 mb-2">root@x-miner:~# tail -f /var/log/miner.log</p>
                    {isActive ? (
                       <div className="space-y-1">
                          <p>[2023-10-24 10:42:01] INFO: Stratum connection established to pool.blockdag.network</p>
                          <p>[2023-10-24 10:42:02] INFO: Authorized worker: {miner.name}.001</p>
                          <p>[2023-10-24 10:42:05] INFO: Setting frequency to 650MHz</p>
                          <p>[2023-10-24 10:42:15] INFO: Fan speed set to 60%</p>
                          <p>[2023-10-24 10:45:22] INFO: New job received: 0x4a2b...</p>
                          <p className="text-green-400">[2023-10-24 10:45:45] INFO: Share accepted (45ms)</p>
                          <p className="text-green-400">[2023-10-24 10:46:12] INFO: Share accepted (32ms)</p>
                       </div>
                    ) : (
                       <p className="text-red-400">Miner is currently offline.</p>
                    )}
                 </div>
              )}

              {activeTab === 'config' && (
                 <div className="space-y-6">
                    {!isPremium && (
                       <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl flex items-center gap-4">
                          <AlertTriangle className="text-yellow-500" />
                          <div>
                             <h4 className="text-yellow-500 font-bold">Advanced Config Locked</h4>
                             <p className="text-xs text-yellow-500/80">Upgrade to Premium to access overclocking and custom pools.</p>
                          </div>
                       </div>
                    )}
                    
                    <div className={`space-y-4 ${!isPremium ? 'opacity-50 pointer-events-none' : ''}`}>
                       <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-400">Mining Pool URL</label>
                          <input id="miningPoolUrl" name="miningPoolUrl" type="text" value="stratum+tcp://pool.blockdag.network:3333" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white font-mono text-sm" readOnly />
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-sm font-bold text-slate-400">Fan Speed target (%)</label>
                             <input id="fanSpeed" name="fanSpeed" type="number" value="60" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white font-mono text-sm" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-sm font-bold text-slate-400">Max Temp (°C)</label>
                             <input id="maxTemp" name="maxTemp" type="number" value="85" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white font-mono text-sm" />
                          </div>
                       </div>

                       <div className="pt-4 border-t border-white/5 flex justify-end">
                          <button className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                             Save Changes
                          </button>
                       </div>
                    </div>
                 </div>
              )}

           </div>
        </div>
      </div>
    </div>
  );
};

export default AsicDashboard;
