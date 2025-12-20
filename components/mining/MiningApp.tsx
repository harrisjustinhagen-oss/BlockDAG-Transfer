
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { INITIAL_MINERS, MODEL_SPECS } from './constants';
import { Miner, MinerStatus, OptimizationResult } from '../../types';
import MinerCard from './MinerCard';
import StatsChart from './StatsChart';
import AsicDashboard from './AsicDashboard';
import { getMinerOptimization } from '../../services/geminiService';
import { Cpu, Server, Bell, Sparkles, X, Crown, Plus, QrCode, Wifi, Smartphone, Watch, ChevronDown, ChevronRight, Box, FileCode, Download, Zap, Lock, Check, Pencil } from 'lucide-react';

// Inline Component for Collapsible Sections
const CollapsibleSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  extraAction?: React.ReactNode;
}> = ({ title, icon, count, isOpen, onToggle, children, extraAction }) => {
  return (
    <div className="mb-4 bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden transition-all duration-300">
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isOpen ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-800 text-gray-400'}`}>
            {icon}
          </div>
          <div className="text-left">
            <h3 className="font-bold text-white text-lg">{title}</h3>
            <p className="text-xs text-gray-500">{count} Devices Connected</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           {extraAction}
           {isOpen ? <ChevronDown className="text-gray-400" /> : <ChevronRight className="text-gray-500" />}
        </div>
      </button>
      
      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 p-5 pt-0' : 'grid-rows-[0fr] opacity-0 p-0'}`}>
        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

// New Component for ASIC List Rows
const AsicListRow: React.FC<{
  miner: Miner;
  onUpdateName: (id: string, newName: string) => void;
  onClick: () => void;
}> = ({ miner, onUpdateName, onClick }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(miner.name);

  const handleSaveName = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (tempName.trim()) {
      onUpdateName(miner.id, tempName);
    }
    setIsEditing(false);
  };

  const isX100 = miner.model.includes('X100');
  const isOnline = miner.status === MinerStatus.MINING;

  return (
    <div 
      onClick={onClick}
      className="group flex items-center justify-between p-4 bg-gray-800/40 border border-white/5 rounded-xl hover:bg-gray-800 hover:border-cyan-500/30 transition-all cursor-pointer"
    >
      <div className="flex items-center gap-4 flex-1">
        {/* Status Indicator */}
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-600'}`}></div>
        
        {/* Icon based on model */}
        <div className={`p-2 rounded-lg ${isX100 ? 'bg-amber-500/10 text-amber-500' : 'bg-purple-500/10 text-purple-500'}`}>
          <Server size={20} />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3">
             {isEditing ? (
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <input 
                  type="text" 
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="bg-gray-900 text-white font-bold text-sm rounded border border-cyan-500 px-2 py-1 w-full max-w-[150px] focus:outline-none"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                       e.stopPropagation();
                       onUpdateName(miner.id, tempName);
                       setIsEditing(false);
                    }
                  }}
                />
                <button onClick={handleSaveName} className="text-green-400 hover:bg-white/10 p-1 rounded"><Check size={14}/></button>
                <button onClick={(e) => { e.stopPropagation(); setIsEditing(false); setTempName(miner.name); }} className="text-gray-400 hover:bg-white/10 p-1 rounded"><X size={14}/></button>
              </div>
             ) : (
              <div className="flex items-center gap-2 group/edit">
                <span className="font-bold text-white text-sm">{miner.name}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                  className="opacity-0 group-hover/edit:opacity-100 text-gray-500 hover:text-white transition-opacity"
                >
                  <Pencil size={12} />
                </button>
              </div>
             )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
              isX100 
                ? 'border-amber-500/30 text-amber-500 bg-amber-500/10' 
                : 'border-purple-500/30 text-purple-400 bg-purple-500/10'
            }`}>
              {isX100 ? 'MODEL X100' : 'MODEL X30'}
            </span>
            {isOnline && <span className="text-[10px] text-gray-500 font-mono">{miner.hashrate.toFixed(1)} TH/s</span>}
          </div>
        </div>
      </div>

      <ChevronRight size={18} className="text-gray-600 group-hover:text-cyan-400 transition-colors" />
    </div>
  );
};

const MiningApp: React.FC = () => {
  const [miners, setMiners] = useState<Miner[]>(INITIAL_MINERS);
  const [chartData, setChartData] = useState<Array<{ time: string; total: number; x30: number; x100: number; power: number; activeUnits: number }>>([]);
  const [optimizingId, setOptimizingId] = useState<string | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  // Layout State
  const [isX10Open, setIsX10Open] = useState(false);
  const [isAsicsOpen, setIsAsicsOpen] = useState(false);

  // Ad and Premium State
  const [showAd, setShowAd] = useState(false);
  const [adSeconds, setAdSeconds] = useState(5);
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Add Device State
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [addDeviceMode, setAddDeviceMode] = useState<'select' | 'camera' | 'wifi'>('select');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ASIC Dashboard State
  const [selectedAsic, setSelectedAsic] = useState<Miner | null>(null);
  const [showFirmwareModal, setShowFirmwareModal] = useState(false);

  // Notification State
  const [notification, setNotification] = useState<{title: string, message: string} | null>(null);
  
  // Electricity Cost State
  const [electricityCost, setElectricityCost] = useState<number>(0.12); // Default $0.12 per kWh
  const [showCostModal, setShowCostModal] = useState(false);
  const [tempCost, setTempCost] = useState<string>('0.12');

  // Overheat Tracking State (prevents notification spam)
  const overheatNotifiedRef = useRef<Set<string>>(new Set());
  
  // Temperature thresholds for ASICs
  const OVERHEAT_THRESHOLD = 88; // °C - critical temperature for ASICs

  const sendNotification = (title: string, message: string) => {
    // In-App Toast
    setNotification({ title, message });
    setTimeout(() => setNotification(null), 6000);
  };

  const handleActivatePremium = (plan: 'monthly' | 'annual') => {
    setIsPremium(true);
    setShowPremiumModal(false);
    const perk = plan === 'annual' ? 'Annual: save 2 months + priority feature access.' : 'Monthly: cancel anytime.';
    sendNotification('Premium Unlocked', `${plan === 'annual' ? '$100/yr' : '$10/mo'} — ${perk}`);
  };

  // Helper to format remaining time
  const formatTimeRemaining = (expiry: number) => {
    const diff = expiry - Date.now();
    if (diff <= 0) return "00:00:00";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const [x1TimeRemaining, setX1TimeRemaining] = useState<string>("");

  // Simulation Logic & Timer
  useEffect(() => {
    const interval = setInterval(() => {
      const nowTime = new Date();
      const timeString = `${nowTime.getHours()}:${nowTime.getMinutes()}:${nowTime.getSeconds()}`;
      const nowTs = Date.now();

      setMiners(prevMiners => {
        let totalHashrate = 0;
        let x30Hashrate = 0;
        let x100Hashrate = 0;
        let notificationTriggered = false;

        const updatedMiners = prevMiners.map(miner => {
          // X1 Mobile Session Logic
          if (miner.id === 'x1-local' && miner.status === MinerStatus.MINING) {
             if (miner.sessionEndTime && nowTs > miner.sessionEndTime) {
               // Session Expired
               notificationTriggered = true;
               return { ...miner, status: MinerStatus.OFFLINE, sessionEndTime: undefined };
             }
          }

          if (miner.status === MinerStatus.BOOTING) {
             // Simulate boot delay completion randomly
             if (Math.random() > 0.7) {
               // For X1, set the session end time if just finished booting
               if (miner.id === 'x1-local' && !miner.sessionEndTime) {
                 return { 
                   ...miner, 
                   status: MinerStatus.MINING, 
                   sessionEndTime: Date.now() + 24 * 60 * 60 * 1000 // 24 Hours
                 };
               }
               return { ...miner, status: MinerStatus.MINING };
             }
             return miner;
          }

          if (miner.status === MinerStatus.MINING) {
            if (miner.id === 'x1-local') {
               // Don't add to TH/s total
               return miner;
            }

            const specs = MODEL_SPECS[miner.model];
            // Fluctuate hashrate +/- 5%
            const variance = (Math.random() * 0.1) - 0.05;
            const newHash = Math.max(0, specs.maxHash * (1 + variance));
            const newPower = specs.maxPower * (0.9 + (newHash / specs.maxHash) * 0.1);
            
            // Random temp fluctuation
            const tempChange = (Math.random() * 2) - 1;
            let newTemp = miner.temperature + tempChange;
            if (newTemp < 60) newTemp += 1.5;
            if (newTemp > 85) newTemp -= 1.5;

            // Overheat detection for ASICs (X30 and X100)
            if ((miner.model === 'X30-Core' || miner.model === 'X100-Mainframe') && newTemp >= OVERHEAT_THRESHOLD) {
              if (!overheatNotifiedRef.current.has(miner.id)) {
                overheatNotifiedRef.current.add(miner.id);
                notificationTriggered = true;
                // Store the overheating miner info for notification
                setTimeout(() => {
                  sendNotification(
                    "⚠️ ASIC Overheating",
                    `${miner.name} (${miner.model}) has reached critical temperature: ${newTemp.toFixed(1)}°C. Reduce load or improve cooling immediately.`
                  );
                }, 0);
              }
            } else if (newTemp < OVERHEAT_THRESHOLD - 5) {
              // Clear notification flag when temp drops below threshold by 5°C
              overheatNotifiedRef.current.delete(miner.id);
            }

            // Only add to Total Hashrate if it's not using BDAG/h (X10 uses BDAG/h)
            if (miner.hashrateUnit !== 'BDAG/h') {
              totalHashrate += newHash;
              // Track X30 and X100 separately
              if (miner.model === 'X30-Core') {
                x30Hashrate += newHash;
              } else if (miner.model === 'X100-Mainframe') {
                x100Hashrate += newHash;
              }
            }

            return {
              ...miner,
              hashrate: newHash,
              powerUsage: Math.floor(newPower),
              temperature: parseFloat(newTemp.toFixed(1))
            };
          } else {
            // Cooling down
            let newTemp = miner.temperature - 0.5;
            if (newTemp < 20) newTemp = 20;
            return {
              ...miner,
              hashrate: miner.id === 'x1-local' ? 0.75 : 0, 
              powerUsage: 0,
              temperature: parseFloat(newTemp.toFixed(1))
            };
          }
        });

        if (notificationTriggered) {
          setTimeout(() => {
            sendNotification("Session Complete", "X1 Mobile mining session has ended. Restart to continue earning BDAG.");
          }, 0);
        }

        // Update chart data
        setChartData(prev => {
          const totalPower = updatedMiners.reduce((acc, m) => acc + m.powerUsage, 0);
          const activeCount = updatedMiners.filter(m => m.status === MinerStatus.MINING).length;
          const newData = [...prev, { 
            time: timeString, 
            total: Math.floor(totalHashrate),
            x30: Math.floor(x30Hashrate),
            x100: Math.floor(x100Hashrate),
            power: totalPower,
            activeUnits: activeCount
          }];
          if (newData.length > 20) newData.shift();
          return newData;
        });

        // Sync selected ASIC for dashboard
        if (selectedAsic) {
          const updatedSelected = updatedMiners.find(m => m.id === selectedAsic.id);
          if (updatedSelected) {
            setSelectedAsic(updatedSelected);
          }
        }

        return updatedMiners;
      });
      
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedAsic]);

  // Separate effect for X1 Timer UI updates
  useEffect(() => {
    const timerInterval = setInterval(() => {
      const x1 = miners.find(m => m.id === 'x1-local');
      if (x1 && x1.status === MinerStatus.MINING && x1.sessionEndTime) {
        setX1TimeRemaining(formatTimeRemaining(x1.sessionEndTime));
      } else {
        setX1TimeRemaining("");
      }
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [miners]);

  const toggleMiner = useCallback((id: string) => {
    setMiners(prev => prev.map(m => {
      if (m.id !== id) return m;
      if (m.status === MinerStatus.MINING || m.status === MinerStatus.BOOTING) {
        return { ...m, status: MinerStatus.OFFLINE, sessionEndTime: undefined };
      }
      return { ...m, status: MinerStatus.BOOTING };
    }));
  }, []);

  const handleUpdateName = useCallback((id: string, newName: string) => {
    setMiners(prev => prev.map(m => 
      m.id === id ? { ...m, name: newName } : m
    ));
  }, []);

  // Ad Timer Logic
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (showAd) {
      if (adSeconds > 0) {
        timer = setTimeout(() => setAdSeconds(s => s - 1), 1000);
      } else {
        setShowAd(false);
        // Start X1 directly with 24h session - bypass toggle to prevent race condition
        setMiners(prev => prev.map(m => {
          if (m.id === 'x1-local') {
             return { 
               ...m, 
               status: MinerStatus.MINING, 
               sessionEndTime: Date.now() + 24 * 60 * 60 * 1000 // 24 Hours
             };
          }
          return m;
        }));
      }
    }
    return () => clearTimeout(timer);
  }, [showAd, adSeconds]);

  // Intercept X1 start for Ad check
  const handleMinerToggle = (id: string) => {
    const miner = miners.find(m => m.id === id);
    if (!miner) return;

    if (id === 'x1-local' && miner.status === MinerStatus.OFFLINE && !isPremium) {
      setAdSeconds(5);
      setShowAd(true);
      return;
    }
    
    // Check dependency for X10
    if (miner.model === 'X10-Blade' && miner.status === MinerStatus.OFFLINE) {
        const x1 = miners.find(m => m.id === 'x1-local');
        if (!x1 || x1.status !== MinerStatus.MINING) {
            return;
        }
    }

    // ASICs require premium, not X1
    if (['X30-Core', 'X100-Mainframe'].includes(miner.model) && !isPremium) {
      sendNotification("Premium Required", "ASIC miners require Premium subscription to operate.");
      return;
    }

    toggleMiner(id);
  };

  const handleOptimization = useCallback(async (miner: Miner) => {
    setOptimizingId(miner.id);
    try {
      const result = await getMinerOptimization(miner);
      setOptimizationResult(result);
      setShowResultModal(true);
      
      // Apply "optimization" text to miner
      setMiners(prev => prev.map(m => 
        m.id === miner.id 
          ? { ...m, lastOptimization: result.recommendation } 
          : m
      ));
    } catch (e) {
      console.error(e);
    } finally {
      setOptimizingId(null);
    }
  }, []);

  // Camera handling
  const startCamera = async () => {
    setAddDeviceMode('camera');
    try {
      // Safety check for navigator.mediaDevices
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } else {
        console.warn("Camera API not available in this environment.");
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const closeAddDeviceModal = () => {
    stopCamera();
    setShowAddDeviceModal(false);
    setAddDeviceMode('select');
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Categorize Miners
  const internalMiner = miners.find(m => m.id === 'x1-local');
  const x10Miners = miners.filter(m => m.model === 'X10-Blade');
  const asicMiners = miners.filter(m => ['X30-Core', 'X100-Mainframe'].includes(m.model));

  const totalHash = miners.reduce((acc, m) => {
    if (m.hashrateUnit === 'BDAG/h') return acc;
    return acc + m.hashrate;
  }, 0);
  
  const totalPower = miners.reduce((acc, m) => acc + m.powerUsage, 0);
  const activeUnits = miners.filter(m => m.status === MinerStatus.MINING).length;
  const x1IsActive = internalMiner?.status === MinerStatus.MINING;

  return (
    <div className="min-h-screen pb-20 font-sans relative bg-slate-950 text-white">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[300] w-[90%] max-w-sm animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-gray-900/90 backdrop-blur-md border border-cyan-500/50 text-white p-4 rounded-2xl shadow-2xl flex items-start gap-4">
            <div className="p-2 bg-cyan-500/20 rounded-full text-cyan-400 shrink-0">
              <Bell size={20} className="animate-pulse-fast" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-cyan-400 mb-1 flex items-center gap-2">
                {notification.title}
                <span className="text-[10px] bg-white/10 px-1.5 rounded text-gray-300">NOW</span>
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed">{notification.message}</p>
              <div className="flex gap-2 mt-2">
                 <Smartphone size={12} className="text-gray-500" />
                 <Watch size={12} className="text-gray-500" />
                 <span className="text-[10px] text-gray-500">Sent to connected devices</span>
              </div>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="text-gray-500 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Ad Overlay */}
      {showAd && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
           <div className="bg-slate-900 p-8 rounded-3xl border border-white/10 max-w-sm w-full relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-cyan-500"></div>
             <div className="mb-6">
                <Sparkles size={48} className="mx-auto text-cyan-400 mb-4 animate-pulse" />
                <h2 className="text-2xl font-bold text-white mb-2">SPONSORS AD HERE</h2>
                <p className="text-gray-400">Please wait while we initialize your mining session...</p>
             </div>
             <div className="text-5xl font-mono font-bold text-cyan-500 mb-4">
               {adSeconds}
             </div>
             <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
               <div 
                  className="bg-cyan-500 h-full transition-all duration-1000 ease-linear"
                  style={{ width: `${(adSeconds / 5) * 100}%` }}
               ></div>
             </div>
             <p className="mt-4 text-xs text-gray-500">Upgrade to Premium to skip ads</p>
           </div>
        </div>
      )}

      {/* Premium Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-[210] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/20 rounded-2xl shadow-2xl max-w-lg w-full p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div>
                <p className="text-xs text-amber-400 font-bold uppercase tracking-[0.2em]">Premium Access</p>
                <h3 className="text-2xl font-bold text-white">Unlock the full X Series</h3>
                <p className="text-sm text-slate-300">$10/mo or $100/yr (2 months free)</p>
              </div>
              <button onClick={() => setShowPremiumModal(false)} className="text-slate-500 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 relative z-10">
              {[ 
                'Start all in X Series X10',
                'Remote mining software for X30 / X100',
                'Craft Legendary Templates to sell for BDAG',
                'No ads — uninterrupted sessions',
                'Premium leveling rewards (exclusive)',
                'Vote in DAO decisions'
              ].map(item => (
                <div key={item} className="flex items-start gap-2 bg-slate-800/60 border border-white/5 rounded-lg p-3">
                  <span className="mt-0.5 text-emerald-400">•</span>
                  <p className="text-sm text-slate-100 leading-tight">{item}</p>
                </div>
              ))}
            </div>

            <div className="bg-slate-800/60 border border-amber-500/20 rounded-xl p-4 mb-4 relative z-10">
              <p className="text-sm text-white font-semibold mb-2">Incentives to upgrade</p>
              <ul className="text-sm text-slate-200 space-y-1 list-disc list-inside">
                <li>Annual plan saves $20 vs monthly (effectively 2 free months).</li>
                <li>Priority access to new firmware, templates, and DAO votes.</li>
                <li>Bonus BDAG drop for Premium streaks and referral boosts.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 relative z-10">
              <button
                onClick={() => handleActivatePremium('monthly')}
                className="flex-1 px-4 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/30 transition-colors"
              >
                Activate $10/mo
              </button>
              <button
                onClick={() => handleActivatePremium('annual')}
                className="flex-1 px-4 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/30 transition-colors"
              >
                Activate $100/yr (best value)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tighter text-white">
            <span className="text-cyan-500">X<sup className="text-xs">3</sup></span> MINER
          </h1>
          <p className="text-[10px] text-gray-500 font-mono tracking-widest">MANAGEMENT CONSOLE v2.4</p>
        </div>
        <div className="flex gap-4 items-center">
          <button 
            onClick={() => setShowPremiumModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${isPremium ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white'}`}
          >
            <Crown size={14} className={isPremium ? 'fill-amber-500' : ''} />
            {isPremium ? 'PREMIUM' : 'GET PREMIUM'}
          </button>
        </div>
      </header>

      <main className="px-4 pt-6 max-w-lg mx-auto">
        {/* Global Status Badge */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-950 p-4 rounded-2xl border border-white/5 relative overflow-hidden">
             <div className="text-gray-400 text-xs font-bold mb-1 relative z-10">NETWORK HASHRATE</div>
             <div className="text-2xl font-mono font-bold text-white tracking-tight relative z-10">
               {totalHash.toFixed(1)} <span className="text-sm text-gray-500">TH/s</span>
             </div>
             {/* Mini Sparkline Graph */}
             <div className="relative h-10 flex items-end gap-[2px] mt-2 bg-black/20 rounded-lg p-1">
               {chartData.length >= 2 ? (
                 <>
                   {chartData.slice(-15).map((point, i) => {
                     const maxInView = Math.max(...chartData.slice(-15).map(d => d.total), 1);
                     const height = (point.total / maxInView) * 100;
                     return (
                       <div 
                         key={i}
                         className="flex-1 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-sm transition-all duration-300"
                         style={{ height: `${Math.max(height, 10)}%` }}
                       ></div>
                     );
                   })}
                 </>
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-600">
                   Collecting data...
                 </div>
               )}
             </div>
          </div>
          <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-950 p-4 rounded-2xl border border-white/5">
             <div className="text-gray-400 text-xs font-bold mb-1">ACTIVE UNITS</div>
             <div className="text-2xl font-mono font-bold text-white tracking-tight">
               {activeUnits}<span className="text-gray-600">/</span>{miners.length}
             </div>
          </div>
          <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-white/5 relative overflow-hidden">
             {/* Content */}
             <div className="p-4 flex flex-col h-full">
               <div className="text-gray-400 text-xs font-bold mb-1">POWER USAGE</div>
               <div className="text-2xl font-mono font-bold text-white tracking-tight">
                 {totalPower.toLocaleString()} <span className="text-sm text-gray-500">W</span>
               </div>
               
               {/* Profit/Day Section */}
               <div className="mt-auto pt-2 border-t border-white/5 flex items-center justify-between">
                 <div>
                   <div className="text-[9px] text-gray-500 uppercase font-bold">Profit/Day</div>
                   <div className="text-sm font-bold text-green-400">
                     {(() => {
                       // Calculate total BDAG mined per day using fixed rates from MODEL_SPECS
                       const activeMining = miners.filter(m => m.status === MinerStatus.MINING);
                       const bdagPerDay = activeMining.reduce((acc, m) => {
                         const specs = MODEL_SPECS[m.model];
                         return acc + (specs?.bdagPerDay || 0);
                       }, 0);
                       
                       // Calculate revenue from BDAG at $0.05
                       const revenue = bdagPerDay * 0.05;
                       
                       // Calculate electricity cost (power in W -> kW, * 24h, * cost per kWh)
                       const powerCost = (totalPower / 1000) * 24 * electricityCost;
                       
                       // Calculate profit
                       const profit = revenue - powerCost;
                       
                       return profit >= 0 
                         ? `+$${profit.toFixed(2)}`
                         : `-$${Math.abs(profit).toFixed(2)}`;
                     })()}
                   </div>
                 </div>
                 <button 
                   onClick={() => {
                     setTempCost(electricityCost.toString());
                     setShowCostModal(true);
                   }}
                   className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                   title="Set electricity cost"
                 >
                   <Zap size={16} className="text-amber-500 group-hover:text-amber-400" />
                 </button>
               </div>
             </div>
          </div>
        </div>

        <StatsChart data={chartData} />

        {/* Section: Internal X1 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 px-2">
            <Cpu className="text-cyan-500" size={20} />
            <h2 className="text-lg font-bold text-white">INTERNAL MINER</h2>
          </div>
          {internalMiner && (
            <MinerCard 
              miner={internalMiner} 
              onToggle={handleMinerToggle} 
              onOptimize={handleOptimization}
              isOptimizing={optimizingId === internalMiner.id}
              customButtonLabel={
                internalMiner.status === MinerStatus.MINING 
                  ? (x1TimeRemaining ? `ACTIVE ${x1TimeRemaining}` : "ACTIVE...") 
                  : "Start X1"
              }
            />
          )}
        </div>

        {/* Section: X10 Home Miners (Collapsible) */}
        <CollapsibleSection
          title="X10 HOME MINERS"
          icon={<Box size={24} />}
          count={x10Miners.length}
          isOpen={isX10Open}
          onToggle={() => setIsX10Open(!isX10Open)}
        >
          <div className="space-y-4 pt-4">
            {x10Miners.map(miner => {
              const isDisabled = !x1IsActive;
              return (
                <MinerCard 
                  key={miner.id} 
                  miner={miner} 
                  onToggle={handleMinerToggle}
                  onOptimize={handleOptimization}
                  onUpdateName={handleUpdateName}
                  isOptimizing={optimizingId === miner.id}
                  disabled={isDisabled}
                  customButtonLabel={isDisabled ? 'X1 ACTIVATION REQUIRED' : undefined}
                />
              );
            })}
            
            {/* Add Device Button for X10 specifically */}
            <button
              onClick={() => setShowAddDeviceModal(true)}
              className="w-full py-4 rounded-xl border-2 border-dashed border-gray-700 bg-gray-800/30 text-gray-400 font-bold hover:text-white hover:border-cyan-500 hover:bg-cyan-500/10 transition-all flex items-center justify-center gap-2 group"
            >
              <div className="bg-gray-800 p-2 rounded-full group-hover:bg-cyan-500 text-white transition-colors">
                <Plus size={20} />
              </div>
              <span>ADD NEW X10 DEVICE</span>
            </button>
          </div>
        </CollapsibleSection>

        {/* Section: ASICS (X30 & X100) (Collapsible) */}
        <CollapsibleSection
          title="ASICS"
          icon={<Server size={24} />}
          count={asicMiners.length}
          isOpen={isAsicsOpen}
          onToggle={() => setIsAsicsOpen(!isAsicsOpen)}
        >
          <div className="space-y-2 pt-4">
             {/* ASIC Flash File Option - Always Available */}
             <div 
               onClick={() => setShowFirmwareModal(true)}
               className="group flex items-center justify-between p-4 bg-gray-800/40 border border-white/5 rounded-xl hover:bg-gray-800 hover:border-cyan-500/30 transition-all cursor-pointer mb-2"
             >
               <div className="flex items-center gap-4">
                 <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                   <FileCode size={20} />
                 </div>
                 <div>
                    <div className="font-bold text-white text-sm">ASIC Flash File</div>
                    <div className="text-[10px] text-gray-500">Latest firmware updates</div>
                 </div>
               </div>
               <ChevronRight size={18} className="text-gray-600 group-hover:text-cyan-500 transition-colors" />
             </div>

            {asicMiners.map(miner => (
              <AsicListRow 
                key={miner.id} 
                miner={miner} 
                onUpdateName={handleUpdateName}
                onClick={() => setSelectedAsic(miner)}
              />
            ))}
          </div>
        </CollapsibleSection>

      </main>

      {/* ASIC PRO DASHBOARD MODAL */}
      {selectedAsic && (
        <AsicDashboard 
          miner={selectedAsic} 
          onClose={() => setSelectedAsic(null)} 
          onToggle={handleMinerToggle}
          isPremium={isPremium}
        />
      )}

      {/* FIRMWARE DOWNLOAD MODAL */}
      {showFirmwareModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-gray-900 w-full max-w-md rounded-2xl border border-white/10 p-0 shadow-2xl overflow-hidden relative z-50">
              <div className="bg-gradient-to-r from-blue-900/50 to-gray-900 p-6 border-b border-white/5 relative">
                 <button 
                   onClick={() => setShowFirmwareModal(false)}
                   className="absolute top-4 right-4 text-gray-400 hover:text-white"
                 >
                   <X size={20} />
                 </button>
                 <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-500 p-2 rounded-lg text-white">
                      <FileCode size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white">ASIC Firmware</h3>
                 </div>
                 <p className="text-sm text-gray-400">Latest stable release for X-Series miners</p>
              </div>
              
              <div className="p-6 space-y-6">
                 <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                       <span className="text-gray-500 text-sm">Version</span>
                       <span className="text-white font-mono font-bold">v3.4.2-stable</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                       <span className="text-gray-500 text-sm">Release Date</span>
                       <span className="text-white font-mono">Oct 24, 2024</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                       <span className="text-gray-500 text-sm">Size</span>
                       <span className="text-white font-mono">14.5 MB</span>
                    </div>
                 </div>

                 <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <h4 className="text-blue-400 font-bold text-xs uppercase mb-2 flex items-center gap-2">
                       <Zap size={12} />
                       New Features
                    </h4>
                    <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                       <li>Optimization for X100 Cluster hashboards</li>
                       <li>Reduced power consumption by 5%</li>
                       <li>Fixed fan curve logic for high temps</li>
                    </ul>
                 </div>

                 <button 
                   disabled={!isPremium}
                   onClick={() => {
                      sendNotification("Download Started", "Firmware v3.4.2 is downloading to your device.");
                      setShowFirmwareModal(false);
                   }}
                   className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                      isPremium 
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                   }`}
                 >
                    {isPremium ? (
                       <>
                         <Download size={20} />
                         DOWNLOAD FIRMWARE
                       </>
                    ) : (
                       <>
                         <Lock size={18} />
                         PREMIUM ONLY
                       </>
                    )}
                 </button>
                 {!isPremium && (
                    <p className="text-center text-xs text-gray-500">
                       Firmware updates are exclusive to premium members.
                    </p>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Add Device Modal */}
      {showAddDeviceModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus size={20} className="text-cyan-500" />
                ADD NEW DEVICE
              </h3>
              <button 
                onClick={closeAddDeviceModal}
                className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {addDeviceMode === 'select' && (
                <div className="grid grid-cols-1 gap-4">
                  <button 
                    onClick={startCamera}
                    className="flex items-center gap-4 p-5 rounded-2xl bg-gray-800 border border-gray-700 hover:border-cyan-500 hover:bg-gray-800/80 transition-all group text-left"
                  >
                    <div className="p-4 rounded-xl bg-cyan-500/10 text-cyan-500 group-hover:scale-110 transition-transform">
                      <QrCode size={32} />
                    </div>
                    <div>
                      <div className="font-bold text-white text-lg">Scan QR Code</div>
                      <div className="text-sm text-gray-400">Use camera to scan device code</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => setAddDeviceMode('wifi')}
                    className="flex items-center gap-4 p-5 rounded-2xl bg-gray-800 border border-gray-700 hover:border-cyan-500 hover:bg-gray-800/80 transition-all group text-left"
                  >
                    <div className="p-4 rounded-xl bg-cyan-500/10 text-cyan-500 group-hover:scale-110 transition-transform">
                      <Wifi size={32} />
                    </div>
                    <div>
                      <div className="font-bold text-white text-lg">Scan Network</div>
                      <div className="text-sm text-gray-400">Find discoverable devices via WiFi</div>
                    </div>
                  </button>
                </div>
              )}

              {addDeviceMode === 'camera' && (
                <div className="flex flex-col items-center">
                  <div className="relative w-full aspect-square bg-black rounded-2xl overflow-hidden border border-white/10 mb-4">
                     <video 
                       ref={videoRef} 
                       autoPlay 
                       playsInline 
                       className="w-full h-full object-cover" 
                     />
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <div className="w-64 h-64 border-2 border-cyan-500/50 rounded-lg relative">
                          <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-cyan-500 -mt-1 -ml-1"></div>
                          <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-cyan-500 -mt-1 -mr-1"></div>
                          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-cyan-500 -mb-1 -ml-1"></div>
                          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-cyan-500 -mb-1 -mr-1"></div>
                          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-cyan-500/50 animate-pulse"></div>
                       </div>
                     </div>
                     <div className="absolute bottom-4 left-0 right-0 text-center">
                        <span className="bg-black/50 px-3 py-1 rounded-full text-xs text-white backdrop-blur-md">Scanning...</span>
                     </div>
                  </div>
                  <p className="text-center text-sm text-gray-400 mb-4">
                    Point your camera at the QR code located on the back of your X-Series Miner.
                  </p>
                  <button onClick={() => setAddDeviceMode('select')} className="text-white hover:text-cyan-500 text-sm font-bold">
                    CANCEL SCAN
                  </button>
                </div>
              )}

              {addDeviceMode === 'wifi' && (
                <div className="flex flex-col items-center py-8">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-cyan-500/20 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 bg-cyan-500/10 rounded-full animate-pulse delay-75"></div>
                    <div className="relative p-6 bg-gray-800 rounded-full border border-cyan-500 text-cyan-500">
                      <Wifi size={48} className="animate-pulse" />
                    </div>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Scanning Network...</h4>
                  <p className="text-sm text-gray-400 text-center max-w-xs mb-8">
                    Searching for X-Series miners on your local network. Ensure your device is powered on.
                  </p>
                  <button onClick={() => setAddDeviceMode('select')} className="text-white hover:text-cyan-500 text-sm font-bold">
                    CANCEL SEARCH
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Optimization Result Modal */}
      {showResultModal && optimizationResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-cyan-500/30 p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
            
            <button 
              onClick={() => setShowResultModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-full bg-cyan-500/10 text-cyan-500">
                <Sparkles size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">AI Optimization</h3>
                <p className="text-xs text-gray-400 font-mono">GEMINI ANALYSIS COMPLETE</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                <p className="text-sm text-gray-300 leading-relaxed">
                  {optimizationResult.recommendation}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                 <div className="bg-slate-950 p-3 rounded-lg text-center border border-white/5">
                    <div className="text-[10px] text-gray-500 uppercase">Clock</div>
                    <div className="font-mono font-bold text-cyan-500">{optimizationResult.tuningAdjustments.clockSpeed}</div>
                 </div>
                 <div className="bg-slate-950 p-3 rounded-lg text-center border border-white/5">
                    <div className="text-[10px] text-gray-500 uppercase">Voltage</div>
                    <div className="font-mono font-bold text-cyan-500">{optimizationResult.tuningAdjustments.voltage}</div>
                 </div>
                 <div className="bg-slate-950 p-3 rounded-lg text-center border border-white/5">
                    <div className="text-[10px] text-gray-500 uppercase">Fan Curve</div>
                    <div className="font-mono font-bold text-cyan-500">{optimizationResult.tuningAdjustments.fanSpeed}</div>
                 </div>
              </div>
            </div>

            <button 
              onClick={() => setShowResultModal(false)}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-xl transition-colors"
            >
              APPLY NEW CONFIGURATION
            </button>
          </div>
        </div>
      )}

      {/* Electricity Cost Modal */}
      {showCostModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 w-full max-w-sm rounded-2xl border border-white/10 p-0 shadow-2xl overflow-hidden relative">
            <div className="bg-gradient-to-r from-amber-900/50 to-slate-900 p-6 border-b border-white/5 relative">
              <button 
                onClick={() => setShowCostModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-amber-500 p-2 rounded-lg text-white">
                  <Zap size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">Electricity Cost</h3>
              </div>
              <p className="text-sm text-gray-400">Set your cost per kilowatt-hour</p>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <label className="text-xs text-gray-400 uppercase font-bold block mb-2">Cost per kWh ($)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                  <input 
                    type="number"
                    step="0.01"
                    min="0"
                    value={tempCost}
                    onChange={(e) => setTempCost(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 pl-8 py-3 text-white font-mono text-lg focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder="0.12"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Average US rate: $0.12/kWh</p>
              </div>

              <button 
                onClick={() => {
                  const cost = parseFloat(tempCost);
                  if (!isNaN(cost) && cost >= 0) {
                    setElectricityCost(cost);
                    setShowCostModal(false);
                    sendNotification("Cost Updated", `Electricity cost set to $${cost.toFixed(3)}/kWh`);
                  }
                }}
                className="w-full py-3 rounded-xl font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all flex items-center justify-center gap-2"
              >
                <Zap size={20} />
                SAVE COST
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiningApp;
