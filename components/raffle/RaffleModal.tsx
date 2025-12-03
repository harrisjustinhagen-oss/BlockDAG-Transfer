
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Users, Ticket, Trophy, RefreshCw, Wallet, ArrowUpRight, TrendingUp, X, Gift, Crown, Star, Medal, Clock, Hash, ChevronRight, ArrowLeft, Hexagon, Zap, BarChart3, ShieldCheck, Loader2, Activity, CreditCard, Info, Globe, Terminal, CheckCircle2, Code } from 'lucide-react';

interface RaffleModalProps {
    isOpen: boolean;
    onClose: () => void;
    userBdagBalance: number;
    setUserBdagBalance: (val: number) => void;
}

// --- Types ---
enum RaffleState {
  IDLE = 'IDLE',
  DRAWING = 'DRAWING',
  COMPLETED = 'COMPLETED'
}

interface Participant {
  id: string;
  name: string;
  ticketCount: number;
  joinedAt: Date;
}

interface Winner extends Participant {
  rank: number;
  prizeAmount: number;
  transactionHash: string;
}

interface RaffleHistoryEntry {
  id: string;
  date: string;
  totalPool: number;
  winners: Winner[];
}

interface RaffleStats {
  totalPool: number;
  payoutPool: number;
  grantPool: number;
  buybackPool: number;
  winnerCount: number;
}

// --- Mocks & Data ---
const MOCK_NAMES = [
  "Block_Master", "DAG_Miner", "Crypto_King", "Chain_Link", "Node_Operator",
  "Ledger_Legend", "Hash_Hero", "Token_Titan", "Satoshi_Seeker", "Web3_Warrior",
  "DeFi_Dude", "Smart_Contractor", "Gas_Guzzler", "Altcoin_Ace", "Bull_Runner",
  "Hodl_Hero", "Moon_Mission", "Rocket_Rider", "Wallet_Watcher", "Key_Keeper",
  "Secure_Signer", "P2P_Peer", "Network_Ninja", "Consensus_Captain", "Genesis_Block"
];

const getRandomName = () => MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];

const PAYOUT_TIERS = [
  { 
    id: 'tier1',
    name: "Grand Jackpot", 
    rangeLabel: "1st Place", 
    count: 1, 
    poolPercent: 0.25, 
    icon: Crown,
    colorClass: "text-rose-500",
    bgGradient: "bg-gradient-to-r from-rose-500/20 to-transparent",
    border: "border-rose-500/50",
    glow: "shadow-[0_0_10px_rgba(244,63,94,0.5)]"
  },
  { 
    id: 'tier2',
    name: "Diamond Tier", 
    rangeLabel: "2nd - 5th", 
    count: 4, 
    poolPercent: 0.20, 
    icon: Star,
    colorClass: "text-purple-500",
    bgGradient: "bg-gradient-to-r from-purple-500/20 to-transparent",
    border: "border-purple-500/50",
    glow: "shadow-[0_0_10px_rgba(168,85,247,0.5)]"
  },
  { 
    id: 'tier3',
    name: "Gold Tier", 
    rangeLabel: "6th - 20th", 
    count: 15, 
    poolPercent: 0.25, 
    icon: Medal,
    colorClass: "text-amber-400",
    bgGradient: "bg-gradient-to-r from-amber-400/20 to-transparent",
    border: "border-amber-400/50",
    glow: "shadow-[0_0_10px_rgba(251,191,36,0.5)]"
  },
  { 
    id: 'tier4',
    name: "Silver Tier", 
    rangeLabel: "21st - 50th", 
    count: 30, 
    poolPercent: 0.30, 
    icon: Gift,
    colorClass: "text-cyan-400",
    bgGradient: "bg-gradient-to-r from-cyan-400/20 to-transparent",
    border: "border-cyan-400/50",
    glow: "shadow-[0_0_10px_rgba(34,211,238,0.5)]"
  },
];

// --- Sub Components ---

const DistributionChart = ({ stats }: { stats: RaffleStats }) => {
    return (
        <div className="w-full h-48 flex items-end justify-center gap-4 relative">
             <div className="flex flex-col items-center gap-2 group w-16">
                 <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">80%</span>
                 <div className="w-12 bg-rose-500 rounded-t-lg shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all h-[80%] hover:brightness-110"></div>
                 <span className="text-[10px] font-bold text-rose-500 uppercase">Payout</span>
             </div>
             <div className="flex flex-col items-center gap-2 group w-16">
                 <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">12%</span>
                 <div className="w-12 bg-cyan-400 rounded-t-lg shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all h-[12%] hover:brightness-110"></div>
                 <span className="text-[10px] font-bold text-cyan-400 uppercase">Grant</span>
             </div>
             <div className="flex flex-col items-center gap-2 group w-16">
                 <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">8%</span>
                 <div className="w-12 bg-purple-500 rounded-t-lg shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all h-[8%] hover:brightness-110"></div>
                 <span className="text-[10px] font-bold text-purple-500 uppercase">Burn</span>
             </div>
        </div>
    );
};

const GrantAdvisor = ({ grantPoolAmount, isVisible }: { grantPoolAmount: number, isVisible: boolean }) => {
    if(!isVisible) return null;
    return (
        <div className="mt-8 border border-cyan-500/20 bg-cyan-950/20 rounded-xl p-4 flex items-start gap-4 animate-fadeIn">
            <div className="p-2 bg-cyan-500/10 rounded-full">
                <Info className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
                <h4 className="text-sm font-bold text-cyan-300 uppercase tracking-wide mb-1">Grant Pool Advisor</h4>
                <p className="text-sm text-slate-300">
                    The Grant Pool has accumulated <span className="text-white font-bold">${grantPoolAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span> this month.
                    This fund supports community proposals voted on by the DAO.
                </p>
            </div>
        </div>
    );
};

const BlockDAGRaffleContract = {
    executeBatchPayout: async (winners: Winner[], pool: number, logCallback: (msg: string) => void): Promise<Winner[]> => {
        logCallback(`[INIT] Connecting to BlockDAG Network...`);
        await new Promise(resolve => setTimeout(resolve, 800));
        logCallback(`[AUTH] Verifying contract owner permissions... SUCCESS`);
        await new Promise(resolve => setTimeout(resolve, 600));
        logCallback(`[CALC] Verifying randomness (VRF) seed...`);
        await new Promise(resolve => setTimeout(resolve, 800));
        logCallback(`[CALC] Batch processing ${winners.length} addresses...`);
        
        const finalizedWinners = await Promise.all(winners.map(async (w, i) => {
            await new Promise(r => setTimeout(r, Math.random() * 100));
            if(i % 5 === 0) logCallback(`[TX] Processing batch ${Math.floor(i/5) + 1}...`);
            return {
                ...w,
                transactionHash: `0x${Array(64).fill(0).map(() => Math.floor(Math.random()*16).toString(16)).join('').substring(0, 16)}...`
            };
        }));

        logCallback(`[DONE] ${winners.length} Payouts Confirmed. Gas used: 0.045 BDAG.`);
        logCallback(`[EVENT] EmissionCompleted(poolId=4421, total=${pool})`);
        return finalizedWinners;
    }
};


// --- Main Modal Component ---

export const RaffleModal: React.FC<RaffleModalProps> = ({ isOpen, onClose, userBdagBalance, setUserBdagBalance }) => {
    // State
    const [pool, setPool] = useState<number>(12500);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [raffleState, setRaffleState] = useState<RaffleState>(RaffleState.IDLE);
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [raffleHistory, setRaffleHistory] = useState<RaffleHistoryEntry[]>([]);
    const [activeTab, setActiveTab] = useState<'buy' | 'history'>('buy');
    const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(10);
    const [contractLogs, setContractLogs] = useState<string[]>([]);
    const logsEndRef = useRef<HTMLDivElement>(null);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [bdagPrice, setBdagPrice] = useState<number>(0.05);
    const [isPriceLoading, setIsPriceLoading] = useState(false);

    // Constants
    const BDAG_PORTION_USD = 2.50;
    const CASH_PORTION_USD = 7.50;

    // Effects
    useEffect(() => {
        // Price Simulation
        const fetchPrice = async () => {
            setIsPriceLoading(true);
            await new Promise(resolve => setTimeout(resolve, 500));
            setBdagPrice(0.05 + (Math.random() * 0.005 - 0.0025)); // Fluctuate slightly
            setIsPriceLoading(false);
        };
        fetchPrice();
    }, []);

    const bdagRequired = useMemo(() => {
        const price = bdagPrice > 0 ? bdagPrice : 0.05;
        return Math.round(BDAG_PORTION_USD / price);
    }, [BDAG_PORTION_USD, bdagPrice]);

    const totalTicketValue = CASH_PORTION_USD + BDAG_PORTION_USD;

    const stats: RaffleStats = useMemo(() => {
        return {
          totalPool: pool,
          payoutPool: pool * 0.80,
          grantPool: pool * 0.12,
          buybackPool: pool * 0.08,
          winnerCount: 50
        };
    }, [pool]);

    const topPrize = stats.payoutPool * PAYOUT_TIERS[0].poolPercent;

    useEffect(() => {
        if (logsEndRef.current) {
          logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [contractLogs]);

    // Initial Data
    useEffect(() => {
        if (!isOpen) return;

        const initialParticipants: Participant[] = Array.from({ length: 142 }).map((_, i) => ({
          id: `user-${i}`,
          name: getRandomName(),
          ticketCount: 1,
          joinedAt: new Date(Date.now() - Math.random() * 10000000)
        }));
        setParticipants(initialParticipants);
    }, [isOpen]);

    // Timer
    useEffect(() => {
        if (!isOpen || raffleState !== RaffleState.IDLE) return;
        const timer = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        return () => clearInterval(timer);
    }, [isOpen, raffleState]);

    // Logic
    const calculateWinnersLogic = useCallback((poolAmount: number, participantList: Participant[]) => {
        const shuffled = [...participantList].sort(() => 0.5 - Math.random());
        const payoutPool = poolAmount * 0.80;
        const maxWinners = 50;
        const selectedWinnersRaw = shuffled.slice(0, maxWinners);
        
        let currentRank = 1;
        const preparedWinners: Winner[] = [];
    
        for (const tier of PAYOUT_TIERS) {
          const tierPool = payoutPool * tier.poolPercent;
          const prizePerWinner = tierPool / tier.count;
          const tierWinnerCount = tier.count;
          const tierWinners = selectedWinnersRaw.slice(currentRank - 1, currentRank - 1 + tierWinnerCount);
    
          tierWinners.forEach((p, idx) => {
            preparedWinners.push({
              ...p,
              rank: currentRank + idx,
              prizeAmount: prizePerWinner,
              transactionHash: 'PENDING'
            });
          });
          currentRank += tierWinnerCount;
        }
        return preparedWinners.sort((a, b) => a.rank - b.rank);
    }, []);

    const handleBuyTicket = useCallback(async () => {
        if (userBdagBalance < bdagRequired) {
          alert(`Insufficient BDAG Balance! You need ${bdagRequired} BDAG.`);
          return;
        }
        setIsPurchasing(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setPool(prev => prev + totalTicketValue);
        setUserBdagBalance(userBdagBalance - bdagRequired); // Update prop-like state locally or via callback
        
        const newParticipant: Participant = {
          id: `user-${Date.now()}`,
          name: "You",
          ticketCount: 1,
          joinedAt: new Date()
        };
        setParticipants(prev => [newParticipant, ...prev]);
        setIsPurchasing(false);
    }, [userBdagBalance, bdagRequired, totalTicketValue, setUserBdagBalance]);

    const handleDrawWinners = useCallback(async () => {
        if (participants.length === 0) return;
        setRaffleState(RaffleState.DRAWING);
        setContractLogs([]);
    
        try {
          const preparedWinners = calculateWinnersLogic(pool, participants);
          const finalizedWinners = await BlockDAGRaffleContract.executeBatchPayout(
            preparedWinners,
            stats.payoutPool,
            (log) => setContractLogs(prev => [...prev, log])
          );
          
          const newHistoryId = `raffle-${Date.now()}`;
          const newHistoryEntry: RaffleHistoryEntry = {
            id: newHistoryId,
            date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric', hour: '2-digit', minute:'2-digit' }).toUpperCase(),
            totalPool: pool,
            winners: finalizedWinners
          };
          
          setRaffleHistory(prev => [newHistoryEntry, ...prev]);
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          setActiveTab('history');
          setSelectedHistoryId(newHistoryId);
    
          // Reset
          setPool(12500); 
          setParticipants(Array.from({ length: 50 }).map((_, i) => ({
            id: `new-user-${i}`,
            name: getRandomName(),
            ticketCount: 1,
            joinedAt: new Date()
          }))); 
          setRaffleState(RaffleState.IDLE);
          setTimeLeft(10); 
    
        } catch (error) {
          console.error("Contract failed", error);
          setContractLogs(prev => [...prev, `[ERROR] Transaction Failed: ${error}`]);
          setRaffleState(RaffleState.IDLE);
        }
    }, [participants, pool, calculateWinnersLogic, stats.payoutPool]);

    // Timer Auto-Trigger
    useEffect(() => {
        if (timeLeft === 0 && raffleState === RaffleState.IDLE && isOpen) {
             // Optional: Auto draw or just sit at 0
             // handleDrawWinners(); 
        }
    }, [timeLeft, raffleState, isOpen]); 

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md overflow-hidden p-4 sm:p-6" onClick={onClose}>
            <div className="w-full h-full max-w-7xl bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col relative" onClick={e => e.stopPropagation()}>
                
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-6 right-6 z-50 p-2 bg-slate-900/80 rounded-full text-slate-400 hover:text-white hover:bg-rose-500 transition-all border border-white/10">
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="border-b border-white/10 bg-slate-900/60 p-4 sm:px-8 h-20 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="relative w-10 h-10">
                            {/* Simple BlockDAG Logo SVG */}
                            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]">
                                <path d="M50 8 L88 28 V72 L50 92 L12 72 V28 Z" fill="none" stroke="#F43F5E" strokeWidth="3" />
                                <circle cx="50" cy="50" r="4" fill="#F43F5E" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 uppercase leading-none">BlockDAG</h1>
                            <span className="text-[10px] font-bold text-rose-500 tracking-[0.3em] uppercase">Community Raffle</span>
                        </div>
                    </div>
                     <div className="hidden sm:flex items-center gap-3 bg-white/5 border border-white/10 rounded-full py-1.5 px-4">
                        <div className="bg-purple-500/20 p-1.5 rounded-full">
                            <Wallet className="w-4 h-4 text-purple-500" />
                        </div>
                        <div className="flex flex-col items-end leading-none">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Your Balance</span>
                            <span className="text-sm font-bold text-white">{userBdagBalance.toLocaleString()} BDAG</span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-8 scrollbar-hide">
                    
                    {/* Hero Section */}
                    <div className="text-center mb-12 animate-fadeIn">
                        <div className="inline-flex items-center gap-2 px-5 py-2 mb-6 border border-amber-400/30 bg-amber-400/10 text-amber-400 text-xs font-bold uppercase tracking-widest rounded-full shadow-[0_0_15px_rgba(251,191,36,0.2)]">
                            <Trophy className="w-4 h-4" />
                            Monthly Prize Pool
                        </div>
                        <div className="relative inline-block mb-8">
                            <span className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-rose-500 via-purple-500 to-cyan-400 tracking-tighter drop-shadow-[0_10px_20px_rgba(139,92,246,0.3)]">
                                ${pool.toLocaleString()}
                            </span>
                        </div>
                        
                        <div className="flex flex-col items-center gap-6">
                            <div className="flex items-center gap-0 text-sm font-bold border border-white/10 rounded-full bg-slate-900/40 backdrop-blur-sm overflow-hidden divide-x divide-white/10 shadow-lg">
                                <div className="flex items-center gap-2 text-white px-6 py-3">
                                    <Users className="w-4 h-4 text-purple-500" />
                                    <span>{participants.length} ENTRIES</span>
                                </div>
                                <div className="flex items-center gap-2 text-white px-6 py-3">
                                    <Clock className="w-4 h-4 text-cyan-400" />
                                    <span className="font-mono">{formatTime(timeLeft)}</span>
                                </div>
                            </div>
                            <button onClick={() => setShowPayoutModal(true)} className="group flex items-center gap-2 px-6 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-rose-500/50 text-white text-xs font-bold uppercase tracking-widest transition-all">
                                View Payout Tiers <ChevronRight className="w-4 h-4 text-rose-500" />
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {/* Winner Pool */}
                        <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5 relative overflow-hidden group hover:border-rose-500/50 transition-all">
                            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-50"></div>
                            <Trophy className="absolute -top-4 -right-4 w-24 h-24 text-rose-500 opacity-10 group-hover:opacity-20 transition-all transform rotate-12" />
                            <div className="flex items-center gap-2 text-rose-500 mb-4 relative z-10">
                                <Activity className="w-4 h-4" /> <span className="font-bold text-sm uppercase tracking-wider">Winners (80%)</span>
                            </div>
                            <div className="text-3xl font-black text-white mb-4 relative z-10">${stats.payoutPool.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                            <div className="border-t border-white/10 pt-3 relative z-10">
                                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">Top Prize</span>
                                <span className="text-lg font-black text-rose-500">${topPrize.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                            </div>
                        </div>

                         {/* Grants Pool */}
                         <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5 relative overflow-hidden group hover:border-cyan-400/50 transition-all">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-transparent opacity-50"></div>
                            <Zap className="absolute -top-4 -right-4 w-24 h-24 text-cyan-400 opacity-10 group-hover:opacity-20 transition-all transform rotate-12" />
                            <div className="flex items-center gap-2 text-cyan-400 mb-4 relative z-10">
                                <Zap className="w-4 h-4" /> <span className="font-bold text-sm uppercase tracking-wider">Grants (12%)</span>
                            </div>
                            <div className="text-3xl font-black text-white mb-4 relative z-10">${stats.grantPool.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                            <div className="border-t border-white/10 pt-3 relative z-10">
                                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">Purpose</span>
                                <span className="text-sm font-bold text-cyan-400 uppercase">Ecosystem Growth</span>
                            </div>
                        </div>

                        {/* Buybacks */}
                         <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5 relative overflow-hidden group hover:border-purple-500/50 transition-all">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-50"></div>
                            <RefreshCw className="absolute -top-4 -right-4 w-24 h-24 text-purple-500 opacity-10 group-hover:opacity-20 transition-all transform rotate-12" />
                            <div className="flex items-center gap-2 text-purple-500 mb-4 relative z-10">
                                <TrendingUp className="w-4 h-4" /> <span className="font-bold text-sm uppercase tracking-wider">Buybacks (8%)</span>
                            </div>
                            <div className="text-3xl font-black text-white mb-4 relative z-10">${stats.buybackPool.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                            <div className="border-t border-white/10 pt-3 relative z-10">
                                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">Mechanism</span>
                                <span className="text-sm font-bold text-purple-500 uppercase">Deflationary Burn</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                        {/* Chart Area */}
                        <div className="lg:col-span-1 bg-slate-900/50 rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center shadow-lg">
                            <h3 className="text-white font-bold mb-4 w-full text-left tracking-wide text-xs uppercase flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-rose-500" /> Distribution
                            </h3>
                            <DistributionChart stats={stats} />
                        </div>

                        {/* Interactive Tab Area */}
                        <div className="lg:col-span-2 bg-slate-900/50 rounded-2xl border border-white/5 flex flex-col overflow-hidden shadow-lg relative min-h-[400px]">
                            {/* Tabs */}
                            <div className="flex border-b border-white/10 bg-slate-900">
                                <button 
                                    onClick={() => { setActiveTab('buy'); setSelectedHistoryId(null); }}
                                    className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'buy' ? 'text-white bg-rose-500/10 border-b-2 border-rose-500' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    <Ticket className={`w-4 h-4 ${activeTab === 'buy' ? 'text-rose-500' : ''}`} /> Buy Tickets
                                </button>
                                <button 
                                    onClick={() => setActiveTab('history')}
                                    className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'history' ? 'text-white bg-cyan-400/10 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    <Clock className={`w-4 h-4 ${activeTab === 'history' ? 'text-cyan-400' : ''}`} /> History
                                </button>
                            </div>

                            <div className="p-6 flex-1 flex flex-col relative">
                                {/* Buy Tab */}
                                {activeTab === 'buy' && (
                                    <>
                                        {raffleState === RaffleState.DRAWING ? (
                                            <div className="flex-1 flex flex-col h-full animate-fadeIn">
                                                {/* Terminal View */}
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                                    <div className="ml-auto flex items-center gap-2 text-cyan-400 text-xs font-mono">
                                                        <ShieldCheck className="w-3 h-3" /> SECURE CONNECTION
                                                    </div>
                                                </div>
                                                <div className="flex-1 bg-black/80 rounded-lg border border-cyan-400/30 p-4 font-mono text-xs overflow-hidden flex flex-col shadow-inner">
                                                    <div className="flex items-center gap-2 text-rose-500 mb-3 border-b border-white/10 pb-2">
                                                        <Terminal className="w-3 h-3" /> <span className="uppercase tracking-widest font-bold">BlockDAG Contract v2.1</span>
                                                    </div>
                                                    <div className="flex-1 overflow-y-auto space-y-1.5 pr-2" ref={logsEndRef}>
                                                        {contractLogs.map((log, i) => (
                                                            <div key={i} className="break-all">
                                                                <span className="text-cyan-400 mr-2">{'>'}</span>
                                                                <span className={log.includes('ERROR') ? 'text-red-500' : log.includes('SUCCESS') ? 'text-green-400 font-bold' : log.includes('EVENT') ? 'text-purple-400' : 'text-slate-400'}>{log}</span>
                                                            </div>
                                                        ))}
                                                        <div ref={logsEndRef} />
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex justify-between items-center text-xs text-slate-400 uppercase tracking-wider">
                                                    <span className="flex items-center gap-2"><Activity className="w-3 h-3 animate-bounce text-rose-500" /> Executing...</span>
                                                    <span>~5s</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex flex-col justify-center items-center text-center animate-fadeIn">
                                                <div className="mb-4 relative group">
                                                    <div className="absolute inset-0 bg-rose-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                                    <Hexagon className="w-20 h-20 text-rose-500 fill-slate-900 stroke-[1.5] relative z-10" />
                                                    <Ticket className="w-8 h-8 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20" />
                                                </div>
                                                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">Get Your Tickets</h3>
                                                <p className="text-slate-400 mb-8 max-w-sm text-sm">Revenue-Driven Strategy: Sustainable growth through a hybrid entry model.</p>
                                                
                                                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 mb-4 p-4 bg-slate-800/50 border border-white/10 rounded-2xl shadow-inner w-full max-w-md">
                                                    <div className="flex flex-col items-center flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <CreditCard className="w-4 h-4 text-cyan-400" />
                                                            <span className="text-2xl font-black text-white">${CASH_PORTION_USD.toFixed(2)}</span>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Cash (USD)</span>
                                                    </div>
                                                    <div className="text-slate-500 font-bold text-lg">+</div>
                                                    <div className="flex flex-col items-center flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <Hexagon className="w-4 h-4 text-purple-500" />
                                                            <span className="text-2xl font-black text-purple-500">{isPriceLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : bdagRequired}</span>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">BDAG Coins</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mb-6 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                                    <Globe className="w-3 h-3 text-cyan-400" />
                                                    <span>{isPriceLoading ? "Fetching Price..." : `1 BDAG ≈ $${bdagPrice.toFixed(4)} USD`}</span>
                                                </div>

                                                <div className="flex flex-col gap-4 w-full max-w-xs items-center">
                                                    <button onClick={handleBuyTicket} disabled={isPurchasing || isPriceLoading} className="w-full bg-gradient-to-r from-rose-500 to-purple-600 hover:to-rose-500 text-white rounded-xl px-6 py-3 shadow-lg shadow-rose-900/30 border border-white/10 disabled:opacity-70 disabled:cursor-not-allowed transition-all">
                                                        {isPurchasing ? <div className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Processing...</div> : <div className="flex items-center justify-center gap-2"><span className="font-bold uppercase tracking-wider text-sm">Buy Ticket</span> <ArrowUpRight className="w-4 h-4" /></div>}
                                                    </button>
                                                    <button onClick={handleDrawWinners} className="text-xs text-slate-500 hover:text-white transition-colors font-mono font-bold uppercase tracking-widest border-b border-dashed border-slate-700 hover:border-white pb-0.5">
                                                        [ Admin: Initiate Draw ]
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* History Tab */}
                                {activeTab === 'history' && (
                                    <div className="h-full flex flex-col">
                                        {!selectedHistoryId ? (
                                            <div className="space-y-3 overflow-y-auto pr-2 scrollbar-thin">
                                                {raffleHistory.length === 0 ? (
                                                    <div className="text-center py-12 text-slate-600 font-bold uppercase tracking-widest border border-dashed border-white/5 rounded-xl">
                                                        No history found
                                                    </div>
                                                ) : (
                                                    raffleHistory.map(h => (
                                                        <button key={h.id} onClick={() => setSelectedHistoryId(h.id)} className="w-full bg-slate-800/30 hover:bg-white/5 border border-white/5 hover:border-cyan-400/30 rounded-xl p-4 flex items-center justify-between group transition-all">
                                                            <div className="flex items-center gap-4">
                                                                <div className="p-2.5 bg-white/5 rounded-lg text-slate-400 group-hover:text-cyan-400 transition-colors"><Hash className="w-4 h-4" /></div>
                                                                <div className="text-left">
                                                                    <h4 className="font-bold text-white text-sm tracking-wide group-hover:text-cyan-400 transition-colors">{h.date}</h4>
                                                                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">POOL: <span className="text-white font-bold">${h.totalPool.toLocaleString()}</span></p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <div className="text-right hidden sm:block">
                                                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">Top Prize</p>
                                                                    <p className="text-cyan-400 font-bold font-mono">${(h.totalPool * 0.8 * 0.25).toLocaleString(undefined, {maximumFractionDigits:0})}</p>
                                                                </div>
                                                                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400" />
                                                            </div>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col h-full animate-fadeIn">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <button onClick={() => setSelectedHistoryId(null)} className="p-1.5 bg-white/5 border border-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-4 h-4" /></button>
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-white text-sm tracking-wide">{raffleHistory.find(h => h.id === selectedHistoryId)?.date}</h3>
                                                        <div className="flex items-center gap-1.5 text-cyan-400 mt-0.5"><CheckCircle2 className="w-3 h-3" /> <p className="text-[10px] font-bold uppercase tracking-widest">Confirmed</p></div>
                                                    </div>
                                                </div>
                                                <div className="flex-1 bg-white/5 border border-white/5 rounded-xl flex flex-col overflow-hidden">
                                                    <div className="grid grid-cols-12 gap-2 p-3 bg-black/20 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">
                                                        <div className="col-span-2 text-center">Rank</div>
                                                        <div className="col-span-5">User</div>
                                                        <div className="col-span-5 text-right">Prize</div>
                                                    </div>
                                                    <div className="overflow-y-auto flex-1 scrollbar-thin">
                                                        {raffleHistory.find(h => h.id === selectedHistoryId)?.winners.map(w => (
                                                            <div key={w.id} className="grid grid-cols-12 gap-2 p-2 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors items-center text-xs group">
                                                                <div className="col-span-2 flex justify-center">
                                                                    <div className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold rounded-md border ${w.rank === 1 ? 'bg-rose-500/20 text-rose-500 border-rose-500/50' : w.rank <= 5 ? 'bg-purple-500/20 text-purple-500 border-purple-500/50' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>{w.rank}</div>
                                                                </div>
                                                                <div className="col-span-5 font-bold text-white truncate group-hover:text-cyan-400 transition-colors uppercase">{w.name}</div>
                                                                <div className="col-span-5 text-right text-rose-500 font-bold">${w.prizeAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <GrantAdvisor grantPoolAmount={stats.grantPool} isVisible={raffleState === RaffleState.COMPLETED || stats.grantPool > 1000} />
                </div>
            </div>

            {/* Payout Structure Modal */}
            {showPayoutModal && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowPayoutModal(false)}></div>
                    <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
                        <div className="flex justify-between items-center p-5 border-b border-white/10 bg-slate-900">
                            <h2 className="text-base font-bold text-white tracking-widest uppercase flex items-center gap-2"><Trophy className="w-4 h-4 text-rose-500" /> Prize Structure</h2>
                            <button onClick={() => setShowPayoutModal(false)} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            <div className="mb-6 p-6 bg-gradient-to-br from-slate-800 to-slate-900 border border-rose-500/30 rounded-xl text-center">
                                <p className="text-rose-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-1">Total Winner Pool</p>
                                <p className="text-4xl font-black text-white">${stats.payoutPool.toLocaleString()}</p>
                            </div>
                            <div className="space-y-3">
                                {PAYOUT_TIERS.map((tier) => {
                                    const tierTotal = stats.payoutPool * tier.poolPercent;
                                    const perWinner = tierTotal / tier.count;
                                    return (
                                        <div key={tier.id} className={`relative overflow-hidden border ${tier.border} rounded-xl bg-slate-800/50 p-4 flex items-center justify-between`}>
                                            <div className={`absolute inset-0 ${tier.bgGradient} opacity-20`}></div>
                                            <div className="flex items-center gap-4 relative z-10">
                                                <div className={`p-2 rounded-lg border border-white/10 ${tier.colorClass} bg-slate-900`}><tier.icon className="w-4 h-4 fill-current" /></div>
                                                <div>
                                                    <h4 className={`font-bold text-sm ${tier.colorClass} tracking-wide`}>{tier.name}</h4>
                                                    <div className="flex items-center gap-2 text-[10px] text-white font-medium mt-0.5">
                                                        <span className="bg-slate-900/50 px-1.5 py-0.5 rounded border border-white/10 text-slate-400 uppercase tracking-wider">{tier.rangeLabel}</span>
                                                        <span className="text-slate-500 font-bold">{tier.count} Winner{tier.count > 1 ? 's' : ''}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right relative z-10">
                                                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">Payout Each</p>
                                                <p className="text-base font-bold text-white">${perWinner.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
