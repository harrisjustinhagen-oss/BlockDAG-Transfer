
import React, { useState, useRef, useEffect, ReactNode, useMemo } from 'react';
import { ActiveView, Task, Badge as BadgeType, Receipt, DaoProposal } from './types';
import { WalletIcon } from './components/icons/WalletIcon';
import { AppsIcon } from './components/icons/AppsIcon';
import { GamesIcon } from './components/icons/GamesIcon';
import { ProfileIcon } from './components/icons/ProfileIcon';
import { QrCodeIcon } from './components/icons/QrCodeIcon';
import { SponsorsIcon } from './components/icons/SponsorsIcon';
import { CastIcon } from './components/icons/CastIcon';
import { DeFiIcon } from './components/icons/DeFiIcon';
import { JoustingIcon } from './components/icons/JoustingIcon';
import { InventoryIcon } from './components/icons/InventoryIcon';
import { QuestsIcon } from './components/icons/AchievementsIcon';
import { HelmIcon } from './components/icons/HelmIcon';
import { ChestIcon } from './components/icons/ChestIcon';
import { LegsIcon } from './components/icons/LegsIcon';
import { BootsIcon } from './components/icons/BootsIcon';
import { CityIcon } from './components/icons/CityIcon';
import { BadgeIcon } from './components/icons/BadgeIcon';
import { SwordIcon } from './components/icons/SwordIcon';
import { ShieldIcon } from './components/icons/ShieldIcon';
import { JoustingTrophyIcon } from './components/icons/JoustingTrophyIcon';
import { GenesisSteedIcon } from './components/icons/GenesisSteedIcon';
import { EarlyAdopterBadgeIcon } from './components/icons/EarlyAdopterBadgeIcon';
import { BlockDAGIcon } from './components/icons/BlockDAGIcon';
import { CameraIcon } from './components/icons/CameraIcon';
import { HeartIcon } from './components/icons/HeartIcon';
import { HeartsGame } from './components/games/hearts/HeartsGame';
import { PrismIcon } from './components/icons/PrismIcon';
import { WoodIcon } from './components/icons/WoodIcon';
import { IronIcon } from './components/icons/IronIcon';
import { ClothIcon } from './components/icons/ClothIcon';
import { DebitCardIcon } from './components/icons/DebitCardIcon';
import { TriviaIcon } from './components/icons/TriviaIcon';
import { TriviaGame } from './components/games/trivia/TriviaGame';
import { RaffleIcon } from './components/icons/RaffleIcon';
import { XSeriesIcon } from './components/icons/XSeriesIcon';
import { PastPurchasesIcon } from './components/icons/PastPurchasesIcon';
import { PaymentSuccessIcon } from './components/icons/PaymentSuccessIcon';
import { ClipboardIcon } from './components/icons/ClipboardIcon';
import { ArrowDownTrayIcon } from './components/icons/ArrowDownTrayIcon';
import { LockIcon } from './components/icons/LockIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { TicketIcon } from './components/icons/TicketIcon';
import { TemplateIcon } from './components/icons/TemplateIcon';
import { SmartWatchIcon } from './components/icons/SmartWatchIcon';
import { GlovesIcon } from './components/icons/GlovesIcon';
import { UsersIcon } from './components/icons/UsersIcon';
import { FolderIcon } from './components/icons/FolderIcon';
import { SketchItGame } from './components/games/sketchit/SketchItGame';
import { UnoGame } from './components/games/uno/UnoGame';
import { auth, db, User } from './services/mockFirebase'; // Import mock services
import { RaffleModal } from './components/raffle/RaffleModal'; // Import new RaffleModal
import MiningApp from './components/mining/MiningApp'; // Import new MiningApp

declare global {
    interface Window {
        ethereum?: any;
    }
    interface Navigator {
        bluetooth?: any;
    }
}

interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
    icon: React.ReactElement<{ className?: string }>;
    type: 'resource' | 'equipment' | 'universal';
    rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

interface TemplateItem {
    id: string;
    name: string;
    quantity: number;
    icon: React.ReactElement<{ className?: string }>;
    type: 'template';
}

interface Friend {
  id: number | string;
  name: string;
  status: 'online' | 'offline';
  isBlockdagFriend: boolean;
}

// --- Helper Components ---

const PencilIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const XMarkIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const StarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
);

const StatBonusIcon = ({ stat, value }: { stat: string, value: number }) => (
  <div className="flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600 rounded px-2 py-0.5 shadow-[0_0_10px_rgba(34,211,238,0.1)]">
    <span className="text-[10px] font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400">+{value} {stat}</span>
  </div>
);

const InventorySlot: React.FC<{ item: (InventoryItem | TemplateItem) | null }> = ({ item }) => {
    const rarityBorderColors = {
        common: 'border-slate-600',
        uncommon: 'border-green-500',
        rare: 'border-blue-500',
        epic: 'border-purple-500',
        legendary: 'border-orange-500',
    };

    const isEquipmentWithRarity = item && item.type === 'equipment' && 'rarity' in item && item.rarity;
    const isUniversal = item && item.type === 'universal';
    
    const borderColorClass = isEquipmentWithRarity 
        ? rarityBorderColors[item.rarity as keyof typeof rarityBorderColors] 
        : isUniversal 
            ? 'border-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.3)]' 
            : 'border-[var(--border-interactive)]';

    return (
        <div className={`aspect-square rounded-lg flex flex-col items-center justify-center p-2 text-center transition-colors relative ${
            item ? `bg-slate-700/50 bg-opacity-50 border cursor-pointer hover:bg-slate-700 ${borderColorClass}` : 'bg-slate-900/50 border-2 border-dashed border-[var(--border-interactive)] opacity-50'
        }`}>
            {item ? (
                <>
                    {React.cloneElement(item.icon, { className: item.icon.props.className || 'w-10 h-10' })}
                    <span className="text-xs font-semibold text-[var(--text-primary)] mt-1 truncate w-full">{item.name}</span>
                    {item.quantity > 1 && (
                        <span className="absolute bottom-1 right-1 text-xs font-mono bg-slate-800 text-white px-1.5 py-0.5 rounded">
                            {item.quantity}
                        </span>
                    )}
                </>
            ) : (
                <div />
            )}
        </div>
    );
};

const TaskItem: React.FC<{ 
    task: Task, 
    onClaimTask: (id: string) => void, 
    watchData: any, 
    party: string[],
    claimedXpInfo: { taskId: string; xp: number } | null 
}> = ({ task, onClaimTask, watchData, party, claimedXpInfo }) => {
    const isComplete = task.isComplete(watchData, party);
    return (
        <div className={`relative bg-[var(--bg-panel)] p-4 rounded-lg flex items-center justify-between gap-4 transition-opacity ${task.isComplete(watchData, party) ? '' : 'opacity-70'}`}>
            <div>
                <p className="font-semibold text-[var(--text-primary)]">{task.description}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        task.difficulty === 'Easy' ? 'bg-green-500/50 text-green-300' :
                        task.difficulty === 'Medium' ? 'bg-yellow-500/50 text-yellow-300' :
                        'bg-red-500/50 text-red-300'
                    }`}>{task.difficulty}</span>
                     <div className="flex items-center gap-x-3 gap-y-1 flex-wrap">
                        {task.reward.map((r, index) => {
                            const isStatReward = r.id.startsWith('int_boost');

                            if (isStatReward) {
                                return <div key={index}>{r.icon}</div>;
                            }

                            const quantityText = Array.isArray(r.quantity) 
                                ? `+${r.quantity[0]}-${r.quantity[1]}` 
                                : `+${r.quantity}`;
                            
                            const colorClass = 'text-cyan-300';

                            return (
                                <span key={index} className={`text-xs font-semibold flex items-center gap-1 ${colorClass}`}>
                                    {React.cloneElement(r.icon, { className: "w-4 h-4" })} {quantityText}
                                </span>
                            );
                        })}
                    </div>
                </div>
            </div>
             {claimedXpInfo && claimedXpInfo.taskId === task.id && (
                <div className="absolute top-1/2 right-32 -translate-y-1/2 animate-xp-gain pointer-events-none">
                    <span className="text-lg font-bold text-green-400 whitespace-nowrap" style={{textShadow: '0 0 8px rgba(74, 222, 128, 0.7)'}}>
                        +{claimedXpInfo.xp} XP
                    </span>
                </div>
            )}
            <button 
                onClick={() => onClaimTask(task.id)}
                disabled={!isComplete || task.isClaimed}
                className="px-4 py-2 text-sm font-semibold rounded-lg shadow-md transition-colors w-28 text-center bg-rose-500 text-white hover:bg-rose-600 disabled:bg-[var(--bg-disabled)] disabled:cursor-not-allowed disabled:text-[var(--text-disabled)]"
            >
                {task.isClaimed ? 'Claimed' : isComplete ? 'Claim' : 'Incomplete'}
            </button>
        </div>
    );
};

const Badge: React.FC<{ badge: BadgeType, onClaim: (id: number) => void }> = ({ badge, onClaim }) => {
    const { icon, name, description, unlocked, difficulty, reward, isClaimed } = badge;
    
    const difficultyColors = {
        'Easy': 'border-green-500/50',
        'Medium': 'border-yellow-500/50',
        'Hard': 'border-red-500/50',
    };

    return (
        <div className={`bg-[var(--bg-interactive)]/50 p-3 rounded-lg flex flex-col items-center text-center transition-opacity relative border-2 ${unlocked ? difficultyColors[difficulty] : 'border-transparent'} ${!unlocked ? 'opacity-50' : ''}`}>
            <div className={`w-16 h-16 mb-2 flex items-center justify-center rounded-full ${unlocked ? 'bg-amber-500/20' : 'bg-slate-600'}`}>
                {React.cloneElement(icon, { className: `w-10 h-10 ${unlocked ? 'text-amber-400' : 'text-slate-400'}` })}
            </div>
            <h4 className="font-bold text-sm text-[var(--text-primary)]">{name}</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1 h-10">{description}</p>
            
            {unlocked && (
                <div className="w-full mt-3 pt-2 border-t border-[var(--border-color)]">
                    <p className="text-xs font-bold text-amber-300 mb-1">Reward</p>
                    {reward.map((r, index) => (
                         <span key={index} className="text-xs font-semibold flex items-center justify-center gap-1 text-cyan-300">
                            {React.cloneElement(r.icon, { className: "w-4 h-4" })} +{Array.isArray(r.quantity) ? r.quantity.join('-') : r.quantity}
                        </span>
                    ))}
                     <button
                        onClick={() => onClaim(badge.id)}
                        disabled={isClaimed}
                        className="mt-2 w-full px-2 py-1 text-xs font-bold rounded-md transition-colors bg-amber-500 text-white hover:bg-amber-600 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:text-slate-400"
                    >
                        {isClaimed ? 'Claimed' : 'Claim'}
                    </button>
                </div>
            )}
        </div>
    );
};

const BadgesView: React.FC<{ badges: BadgeType[], onClaimBadge: (id: number) => void }> = ({ badges, onClaimBadge }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto animate-fadeIn">
            {badges.map(badge => (
                <Badge key={badge.id} badge={badge} onClaim={onClaimBadge} />
            ))}
        </div>
    );
};

interface NavButtonProps {
    icon: ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
    activeColor: string;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, isActive, onClick, activeColor }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full h-16 transition-colors duration-200 ${
      isActive ? activeColor : 'text-[var(--text-secondary)]'
    }`}
    aria-label={label}
  >
    {icon}
    <span className="text-xs mt-1">{label}</span>
  </button>
);

const WalletPanel = ({ 
    bdagBalance, 
    onOpenTransactions, 
    onOpenTaxes, 
    onOpenTapToPay,
    walletAddress,
    onConnectWallet,
    onDisconnectWallet,
    walletError,
    isConnectingWallet
}: { 
    bdagBalance: number, 
    onOpenTransactions: () => void, 
    onOpenTaxes: () => void,
    onOpenTapToPay: () => void,
    walletAddress: string | null,
    onConnectWallet: () => void,
    onDisconnectWallet: () => void,
    walletError: string | null,
    isConnectingWallet: boolean
}) => {
    const BDAG_PRICE_USD = 0.05;
    const usdValue = bdagBalance * BDAG_PRICE_USD;

    return (
        <div className="p-6 text-center animate-fadeIn">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-cyan-300">Wallet</h2>
                {walletAddress ? (
                     <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-3 py-1.5 rounded-full">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-mono text-green-400 font-bold">
                                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                            </span>
                        </div>
                        <button 
                            onClick={onDisconnectWallet}
                            className="text-xs text-red-400 hover:text-red-300 hover:underline"
                        >
                            Disconnect
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={onConnectWallet}
                        disabled={isConnectingWallet}
                        className={`flex items-center gap-2 border text-orange-400 px-3 py-1.5 rounded-full transition-all text-xs font-bold ${isConnectingWallet ? 'bg-orange-900/20 border-orange-500/30 cursor-wait' : 'bg-orange-600/20 hover:bg-orange-600/40 border-orange-500/50'}`}
                    >
                         {isConnectingWallet ? (
                             <>
                                <span className="w-3 h-3 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></span>
                                Connecting...
                             </>
                         ) : (
                             <>
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20.5 6H3.5C2.67157 6 2 6.67157 2 7.5V18.5C2 19.3284 2.67157 20 3.5 20H20.5C21.3284 20 22 19.3284 22 18.5V7.5C22 6.67157 21.3284 6 20.5 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M22 11H18.5C17.6716 11 17 11.6716 17 12.5V13.5C17 14.3284 17.6716 15 18.5 15H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Connect Wallet
                             </>
                         )}
                    </button>
                )}
            </div>

            {walletError && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm flex items-center gap-2 text-left">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{walletError}</span>
                </div>
            )}
            
            <div className="bg-[var(--bg-panel)] rounded-lg p-6 mb-6 backdrop-blur-sm border border-[var(--border-color-translucent)]">
                <p className="text-lg text-[var(--text-secondary)]">Total Balance</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <BlockDAGIcon className="w-8 h-8 text-cyan-400" />
                    <p className="text-4xl font-mono font-bold text-[var(--text-primary)]">
                        {bdagBalance.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                    </p>
                </div>
                <p className="text-xl font-mono text-slate-300 mt-1">
                    ≈ ${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </p>
                
                <div className="mt-6 pt-4 border-t border-[var(--border-color)]">
                    <div className="flex items-center justify-center gap-3">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <p className="text-md font-mono text-[var(--text-secondary)]">
                            1 BDAG = ${BDAG_PRICE_USD.toFixed(2)} USD
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Tap to Pay Button */}
            <button 
                onClick={onOpenTapToPay}
                className="w-full max-w-md mx-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all mb-4 shadow-lg shadow-cyan-900/20 transform active:scale-95"
            >
                <DebitCardIcon className="w-6 h-6" />
                <span className="text-lg">Tap to Pay</span>
            </button>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
                <button 
                    onClick={onOpenTransactions}
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold py-3 px-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all shadow-lg"
                >
                    <PastPurchasesIcon className="w-6 h-6 text-slate-400" />
                    <span className="text-sm">Transactions</span>
                </button>
                
                <button 
                    onClick={onOpenTaxes}
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold py-3 px-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all shadow-lg"
                >
                    <ClipboardIcon className="w-6 h-6 text-slate-400" />
                    <span className="text-sm">Taxes</span>
                </button>
            </div>
        </div>
    );
};

const AppsPanel = ({ onOpenRaffle, onOpenMining }: { onOpenRaffle: () => void, onOpenMining: () => void }) => {
    const spotlightApps = [
        {
            name: "ChainCanvas",
            description: "Create, mint, and trade AI-generated art directly on-chain. Zero gas fees for creators.",
            icon: <CameraIcon className="w-12 h-12 text-blue-400" />,
            tag: "New",
            colorClass: "border-blue-500/50 hover:border-blue-400"
        },
        {
            name: "YieldVault Pro",
            description: "Advanced yield aggregation strategies for maximizing your DeFi returns across multiple protocols.",
            icon: <DeFiIcon className="w-12 h-12 text-green-400" />,
            tag: "Trending",
            colorClass: "border-green-500/50 hover:border-green-400"
        }
    ];
    
    const featuredApps = [
         {
            name: "X1 Miner Series",
            description: "Manage your X10, X1, and cloud mining instances. Monitor hashrate and rewards.",
            icon: <XSeriesIcon className="w-12 h-12 text-cyan-400" />,
            action: onOpenMining,
             tag: "Essential",
            colorClass: "border-cyan-500/50 hover:border-cyan-400"
        },
        {
            name: "Monthly Raffle",
            description: "Enter the monthly draw for a chance to win big. 90% payout to winners.",
            icon: <RaffleIcon className="w-12 h-12 text-pink-400" />,
            action: onOpenRaffle,
            tag: "Rewards",
            colorClass: "border-pink-500/50 hover:border-pink-400"
        }
    ];

    const apps = [
      {
        name: "DeFi Hub",
        description: "Access decentralized exchanges, lending platforms, and yield farming protocols.",
        icon: <DeFiIcon className="w-12 h-12 text-purple-400" />
      },
      {
        name: "Block Explorer",
        description: "Track transactions, view wallet histories, and analyze on-chain data.",
        icon: <CastIcon className="w-12 h-12 text-purple-400" />
      }
    ];

    return (
        <div className="p-6 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4 text-center text-purple-300">BlockDAG Ecosystem</h2>
            <p className="text-lg text-center text-[var(--text-primary)] font-bold tracking-[0.2em] uppercase mb-8 opacity-90">
                Engage - Build - Grow
            </p>
            <p className="text-[var(--text-secondary)] mb-8 text-center max-w-2xl mx-auto">Explore the decentralized future. Access powerful tools, games, and services powered by BlockDAG.</p>
            
            <div className="max-w-4xl mx-auto mb-10">
                <h3 className="text-xl font-bold text-cyan-300 mb-4 text-center">Featured</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {featuredApps.map((app) => (
                        <div key={app.name} onClick={app.action} className={`relative bg-[var(--bg-panel)] rounded-lg p-6 backdrop-blur-sm text-left flex items-start gap-4 hover:bg-slate-800/70 transition-all duration-200 cursor-pointer border-2 ${app.colorClass}`}>
                            <div className="flex-shrink-0 mt-1">
                                {app.icon}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[var(--text-primary)]">{app.name}</h3>
                                <p className="text-sm text-[var(--text-secondary)] mt-1">{app.description}</p>
                            </div>
                             <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full ${app.tag === 'Essential' ? 'bg-cyan-500/50 text-cyan-200' : 'bg-pink-500/50 text-pink-200'}`}>
                                {app.tag}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="max-w-4xl mx-auto mb-10">
                <h3 className="text-xl font-bold text-yellow-300 mb-4 text-center">Spotlight</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {spotlightApps.map((app) => (
                        <div key={app.name} className={`relative bg-[var(--bg-panel)] rounded-lg p-6 backdrop-blur-sm text-left flex items-start gap-4 hover:bg-slate-800/70 transition-all duration-200 cursor-pointer border-2 ${app.colorClass}`}>
                            <div className="flex-shrink-0 mt-1">
                                {app.icon}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[var(--text-primary)]">{app.name}</h3>
                                <p className="text-sm text-[var(--text-secondary)] mt-1">{app.description}</p>
                            </div>
                            <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full ${app.tag === 'New' ? 'bg-blue-500/50 text-blue-300' : 'bg-green-500/50 text-green-300'}`}>
                                {app.tag}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {apps.map((app) => (
                    <div key={app.name} className="bg-[var(--bg-panel)] rounded-lg p-6 backdrop-blur-sm text-left flex items-start gap-4 hover:bg-slate-800/70 transition-colors duration-200 cursor-pointer border border-[var(--border-color-translucent)]">
                        <div className="flex-shrink-0">
                            {app.icon}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-[var(--text-primary)]">{app.name}</h3>
                            <p className="text-sm text-[var(--text-secondary)] mt-1">{app.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const GamesPanel = ({ onOpenCastModal, onOpenGroupModal, onOpenJoustingModal, onOpenHeartsGame, onOpenTriviaGame, onOpenFamilyPack }: any) => {
    const [activeTab, setActiveTab] = useState<'freeToPlay' | 'purchased'>('freeToPlay');

    const purchasedGames = [
        {
            name: "Domain Tycoon",
            description: "Build and manage your own digital city on the BlockDAG network.",
            icon: <CityIcon className="w-16 h-16 text-teal-400 flex-shrink-0" />,
            action: () => {} 
        },
        {
            name: "Blade & Block",
            description: "An on-chain RPG where your items are true assets. Battle, craft, and trade.",
            icon: <SwordIcon className="w-16 h-16 text-rose-400 flex-shrink-0" />,
            action: () => {}
        }
    ];

    return (
        <div className="p-6 text-center animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4 text-orange-300">Games</h2>
            <p className="text-[var(--text-secondary)] mb-6">Explore the world of Web3 gaming.</p>
            
            <div className="flex flex-col gap-4 justify-center items-center mb-8">
                <button onClick={onOpenCastModal} className="px-6 py-3 bg-[var(--bg-interactive)] text-[var(--text-primary)] font-semibold rounded-lg shadow-md hover:bg-[var(--bg-interactive-hover)] transition-colors flex items-center gap-2">
                    <CastIcon className="w-6 h-6" />
                    Cast to TV
                </button>
                <button onClick={onOpenGroupModal} className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-2">
                    <UsersIcon className="w-6 h-6" />
                    Group Up
                </button>
            </div>

            <div className="flex justify-center border-b border-[var(--border-color)] mb-8 max-w-4xl mx-auto">
                <button
                    onClick={() => setActiveTab('freeToPlay')}
                    className={`px-6 py-2 font-semibold transition-colors ${activeTab === 'freeToPlay' ? 'text-orange-400 border-b-2 border-orange-400' : 'text-[var(--text-secondary)]'}`}
                >
                    Free To Play
                </button>
                <button
                    onClick={() => setActiveTab('purchased')}
                    className={`px-6 py-2 font-semibold transition-colors ${activeTab === 'purchased' ? 'text-orange-400 border-b-2 border-orange-400' : 'text-[var(--text-secondary)]'}`}
                >
                    Purchased
                </button>
            </div>

            {activeTab === 'freeToPlay' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto animate-fadeIn">
                    <div className="bg-[var(--bg-panel)] rounded-lg p-6 backdrop-blur-sm text-left">
                        <div className="flex items-center gap-4">
                            <FolderIcon className="w-16 h-16 text-yellow-400 flex-shrink-0" />
                            <div>
                                <h3 className="text-xl font-bold text-[var(--text-primary)]">Family Pack</h3>
                                <p className="text-sm text-[var(--text-secondary)]">Collection of easy games for up to 5 players.</p>
                            </div>
                        </div>
                        <div className="mt-4 text-center">
                            <button
                                onClick={onOpenFamilyPack}
                                className="w-full px-6 py-3 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 transition-colors"
                            >
                                Open Pack
                            </button>
                        </div>
                    </div>

                    <div className="bg-[var(--bg-panel)] rounded-lg p-6 backdrop-blur-sm text-left">
                        <div className="flex items-center gap-4">
                            <JoustingIcon className="w-16 h-16 text-orange-400 flex-shrink-0" />
                            <div>
                                <h3 className="text-xl font-bold text-[var(--text-primary)]">Jousting Champions</h3>
                                <p className="text-sm text-[var(--text-secondary)]">Form a party, play solo vs bots, or find a random match!</p>
                            </div>
                        </div>
                        <div className="mt-4 text-center">
                            <button
                                onClick={onOpenJoustingModal}
                                className="w-full px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-md hover:bg-orange-600 transition-colors"
                            >
                                Play
                            </button>
                        </div>
                    </div>

                    <div className="bg-[var(--bg-panel)] rounded-lg p-6 backdrop-blur-sm text-left">
                        <div className="flex items-center gap-4">
                            <HeartIcon className="w-16 h-16 text-rose-400 flex-shrink-0" />
                            <div>
                                <h3 className="text-xl font-bold text-[var(--text-primary)]">Hearts</h3>
                                <p className="text-sm text-[var(--text-secondary)]">Classic 4-player trick-taking card game. Avoid points!</p>
                            </div>
                        </div>
                        <div className="mt-4 text-center">
                            <button
                                onClick={onOpenHeartsGame}
                                className="w-full px-6 py-3 bg-rose-500 text-white font-semibold rounded-lg shadow-md hover:bg-rose-500 transition-colors"
                            >
                                Play (Free)
                            </button>
                        </div>
                    </div>

                    <div className="bg-[var(--bg-panel)] rounded-lg p-6 backdrop-blur-sm text-left">
                        <div className="flex items-center gap-4">
                            <TriviaIcon className="w-16 h-16 text-teal-400 flex-shrink-0" />
                            <div>
                                <h3 className="text-xl font-bold text-[var(--text-primary)]">Trivia Challenge</h3>
                                <p className="text-sm text-[var(--text-secondary)]">Test your knowledge against friends or bots in this fast-paced quiz game.</p>
                            </div>
                        </div>
                        <div className="mt-4 text-center">
                            <button
                                onClick={onOpenTriviaGame}
                                className="w-full px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg shadow-md hover:bg-teal-600 transition-colors"
                            >
                                Play
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {activeTab === 'purchased' && (
                 <div className="max-w-4xl mx-auto animate-fadeIn">
                    <p className="text-[var(--text-secondary)] mb-6">Games purchased from the App store will appear here.</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {purchasedGames.map(game => (
                             <div key={game.name} className="bg-[var(--bg-panel)] rounded-lg p-6 backdrop-blur-sm text-left">
                                <div className="flex items-center gap-4">
                                    {game.icon}
                                    <div>
                                        <h3 className="text-xl font-bold text-[var(--text-primary)]">{game.name}</h3>
                                        <p className="text-sm text-[var(--text-secondary)]">{game.description}</p>
                                    </div>
                                </div>
                                <div className="mt-4 text-center">
                                    <button
                                        onClick={game.action}
                                        className="w-full px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-colors"
                                    >
                                        Play
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
            )}

            <img src="https://storage.googleapis.com/aai-web-samples/apps/web3-wallet/games-illustration.svg" alt="Games Illustration" className="mx-auto mt-8 w-64 h-64" />
        </div>
    );
};

const SponsorsPanel = () => (
    <div className="p-6 text-center animate-fadeIn">
        <h2 className="text-2xl font-bold mb-4 text-yellow-300">Sponsors</h2>
        <p className="text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">Sponsor buttons open to the app they want designed for fan interaction. Or website. Encourage live streams of their events for premium users. That can cast to the television.</p>
        
        <div className="max-w-4xl mx-auto bg-[var(--bg-panel)] rounded-lg p-4 backdrop-blur-sm border border-[var(--border-color)]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <a href="https://www.alpinef1.com/" target="_blank" rel="noopener noreferrer" className="relative block group focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-lg overflow-hidden aspect-video">
                    <img 
                        src="https://i.postimg.cc/NMy20WdM/alpine-blockdag-sponsor.png" 
                        alt="BWT Alpine F1 Team and BlockDAG Partner" 
                        className="rounded-lg w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                    />
                    <div className="absolute bottom-2 left-4">
                        <span className="bg-pink-500 text-white text-lg font-bold px-3 py-1 rounded-md shadow-lg">BWT</span>
                    </div>
                </a>
                
                <a href="#" target="_blank" rel="noopener noreferrer" className="relative block group focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-lg overflow-hidden aspect-video">
                    <img 
                        src="https://i.postimg.cc/13Y7z4Yz/inter-milan-logo.jpg" 
                        alt="Inter Milan Partner" 
                        className="rounded-lg w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                    />
                    <div className="absolute bottom-2 left-4">
                        <span className="bg-blue-600 text-white text-lg font-bold px-3 py-1 rounded-md shadow-lg">Inter Milan</span>
                    </div>
                </a>

                <a href="#" target="_blank" rel="noopener noreferrer" className="relative block group focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-lg overflow-hidden aspect-video">
                    <img 
                        src="https://i.postimg.cc/7Zp608bJ/ufc-logo.jpg" 
                        alt="UFC Partner" 
                        className="rounded-lg w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                    />
                    <div className="absolute bottom-2 left-4">
                        <span className="bg-gray-800 text-white text-lg font-bold px-3 py-1 rounded-md shadow-lg">UFC</span>
                    </div>
                </a>
            </div>
        </div>

        <img src="https://storage.googleapis.com/aai-web-samples/apps/web3-wallet/sponsors-illustration.svg" alt="Sponsors Illustration" className="mx-auto w-64 h-64 mt-12" />
    </div>
);

const EquipmentSlot = ({ label, icon, className = '' }: any) => (
    <div className={`flex flex-col items-center space-y-1 ${className}`}>
        <div className="w-10 h-10 bg-[var(--bg-panel)] rounded-lg border-2 border-[var(--border-color)] flex items-center justify-center cursor-pointer hover:border-green-400 transition-colors">
            {icon}
        </div>
        <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">{label}</span>
    </div>
);

const InventoryPanel = ({ inventory, onEquip, onOpenSmartWatch, connectedWatch, watchData, tasks }: { inventory: (InventoryItem | TemplateItem)[], onEquip: (item: InventoryItem | TemplateItem) => void, onOpenSmartWatch: () => void, connectedWatch: string | null, watchData: any, tasks: Task[] }) => {
    const universal = inventory.filter(item => item.type === 'universal');
    const resources = inventory.filter(item => item.type === 'resource');
    const equipment = inventory.filter(item => item.type === 'equipment');
    const templates = inventory.filter(item => item.type === 'template');
    
    // Character Stats Logic
    const calculateBonus = (val: number, t1: number, t2: number) => {
        if (val >= t2) return 2;
        if (val >= t1) return 1;
        return 0;
    };

    const calculateIntBonus = () => {
        const task1 = tasks.find(t => t.id === 'daily-game-1')?.isClaimed;
        const task3 = tasks.find(t => t.id === 'daily-game-3')?.isClaimed;
        let bonus = 0;
        if (task1) bonus += 1;
        if (task3) bonus += 1;
        return bonus;
    };

    const intBonus = calculateIntBonus();

    const bonuses = {
        STR: calculateBonus(watchData?.stairs || 0, 10, 20),
        DEX: calculateBonus(watchData?.steps || 0, 5000, 10000),
        CON: calculateBonus(watchData?.sleepScore || 0, 70, 85),
        INT: intBonus,
        WIS: 0,
        CHA: calculateBonus(watchData?.calories || 0, 1500, 2000)
    };

    const stats = [
        { label: 'STR', value: 0 + bonuses.STR, bonus: bonuses.STR, source: 'Stairs', metric: `${watchData?.stairs || 0} floors` },
        { label: 'DEX', value: 0 + bonuses.DEX, bonus: bonuses.DEX, source: 'Steps', metric: `${(watchData?.steps || 0).toLocaleString()}` },
        { label: 'CON', value: 0 + bonuses.CON, bonus: bonuses.CON, source: 'Sleep', metric: `${watchData?.sleepScore || 0}%` },
        { label: 'INT', value: 0 + bonuses.INT, bonus: bonuses.INT, source: 'Daily Quests', metric: 'Games Played' },
        { label: 'WIS', value: 0, bonus: 0, source: '-' },
        { label: 'CHA', value: 0 + bonuses.CHA, bonus: bonuses.CHA, source: 'Calories', metric: `${watchData?.calories || 0}` },
    ];

    return (
        <div className="p-4 md:p-6 animate-fadeIn h-full flex flex-col md:flex-row gap-6">
            {/* Left Sidebar - Active Gear and Stats */}
            <div className="flex-shrink-0 flex flex-col gap-4">
                 <div className="bg-[var(--bg-panel)]/80 backdrop-blur-sm rounded-2xl p-4 border border-[var(--border-color)] flex flex-row md:flex-col items-center gap-4 shadow-xl">
                    <h3 className="hidden md:block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider rotate-180 md:rotate-0" style={{writingMode: 'vertical-rl', textOrientation: 'mixed'}}>Active Gear</h3>
                    <div className="flex flex-row md:flex-col gap-3">
                        <EquipmentSlot label="Head" icon={<HelmIcon className="w-6 h-6 text-cyan-300" />} />
                        <EquipmentSlot label="Chest" icon={<ChestIcon className="w-6 h-6 text-purple-300" />} />
                        <EquipmentSlot label="Gloves" icon={<GlovesIcon className="w-6 h-6 text-yellow-300" />} />
                        <EquipmentSlot label="Legs" icon={<LegsIcon className="w-6 h-6 text-blue-300" />} />
                        <EquipmentSlot label="Boots" icon={<BootsIcon className="w-6 h-6 text-orange-300" />} />
                    </div>
                </div>

                {/* Character Stats Section */}
                <div className="bg-[var(--bg-panel)]/80 backdrop-blur-sm rounded-2xl p-4 border border-[var(--border-color)] shadow-xl w-full md:w-auto">
                    <h3 className="text-xs font-bold text-[var(--text-secondary)] mb-3 text-center uppercase tracking-wider">Stats</h3>
                    <div className="flex flex-wrap md:flex-col gap-2 justify-center">
                        {stats.map((stat) => (
                            <div key={stat.label} className="relative group flex items-center justify-between gap-3 bg-slate-900/50 px-3 py-1.5 rounded border border-slate-700/50 w-full min-w-[100px] hover:bg-slate-800/80 transition-colors">
                                <span className="font-bold text-slate-400 text-xs">{stat.label}</span>
                                <div className="flex items-center gap-1">
                                    <span className={`font-mono font-bold text-sm ${stat.bonus > 0 ? 'text-green-400' : 'text-slate-200'}`}>
                                        {stat.value}
                                    </span>
                                    {stat.bonus > 0 && (
                                        <span className="text-[10px] text-green-500 font-bold">+{stat.bonus}</span>
                                    )}
                                </div>
                                {stat.source !== '-' && (
                                     <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-slate-900 text-white text-xs p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-slate-700">
                                        <p className="font-bold">{stat.source}</p>
                                        <p className="text-slate-400">{stat.metric}</p>
                                        {stat.bonus > 0 ? <p className="text-green-400">Active Bonus: +{stat.bonus}</p> : <p className="text-slate-500">No bonus active</p>}
                                     </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow flex flex-col">
                <div className="flex justify-between items-center mb-6">
                     <h2 className="text-3xl font-bold text-teal-300">Inventory</h2>
                     <button 
                        onClick={onOpenSmartWatch}
                        className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all ${connectedWatch ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                    >
                        <SmartWatchIcon className="w-5 h-5" />
                        <span className="font-bold text-sm">{connectedWatch || "Connect Watch"}</span>
                    </button>
                </div>

                <div className="space-y-8 overflow-y-auto pr-2 pb-20 custom-scrollbar">
                    {universal.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-3 border-b border-purple-500/30 pb-1">Universal Resources</h3>
                            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                                {universal.map((item, idx) => (
                                    <div key={idx} onClick={() => onEquip(item)}>
                                        <InventorySlot item={item} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {resources.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-[var(--text-secondary)] mb-3 border-b border-[var(--border-color)] pb-1">Resources</h3>
                            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                                {resources.map((item, idx) => (
                                    <div key={idx} onClick={() => onEquip(item)}>
                                        <InventorySlot item={item} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {equipment.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-[var(--text-secondary)] mb-3 border-b border-[var(--border-color)] pb-1">Equipment</h3>
                            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                                {equipment.map((item, idx) => (
                                    <div key={idx} onClick={() => onEquip(item)}>
                                        <InventorySlot item={item} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {templates.length > 0 && (
                        <div>
                             <h3 className="text-lg font-bold text-[var(--text-secondary)] mb-3 border-b border-[var(--border-color)] pb-1">Templates</h3>
                            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                                {templates.map((item, idx) => (
                                    <div key={idx} onClick={() => onEquip(item)}>
                                        <InventorySlot item={item} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {inventory.length === 0 && (
                        <p className="text-center text-slate-500 py-8">Your inventory is empty.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const SmartWatchModal = ({ isOpen, onClose, connectedWatch, onConnect, onDisconnect }: { isOpen: boolean; onClose: () => void; connectedWatch: string | null; onConnect: (device: string) => void; onDisconnect: () => void }) => {
    if (!isOpen) return null;
    const [isScanning, setIsScanning] = useState(false);
    const [devices, setDevices] = useState<string[]>([]);

    useEffect(() => {
        if(isOpen && !connectedWatch) {
            setDevices([]);
            setIsScanning(false);
        }
    }, [isOpen, connectedWatch]);

    const handleScan = () => {
        setIsScanning(true);
        setDevices([]);
        // Simulate scanning
        setTimeout(() => {
            setDevices(["Ultra Watch Series 9", "Pixel Watch 3", "Galaxy Watch 6"]);
            setIsScanning(false);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
            <div className="bg-[var(--bg-panel-solid)] p-6 rounded-2xl w-full max-w-md m-4 border border-[var(--border-color)] shadow-2xl" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4 text-teal-300 flex items-center gap-2">
                    <SmartWatchIcon className="w-6 h-6" /> Smart Watch
                </h2>
                {connectedWatch ? (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50">
                            <SmartWatchIcon className="w-10 h-10 text-green-400" />
                        </div>
                        <p className="text-lg font-semibold text-white mb-2">{connectedWatch}</p>
                        <p className="text-sm text-green-400 mb-6">● Connected via Bluetooth</p>
                        <button onClick={onDisconnect} className="px-4 py-2 bg-red-500/20 text-red-300 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-colors">
                            Disconnect Device
                        </button>
                    </div>
                ) : (
                    <div>
                         {!isScanning && devices.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-slate-400 mb-6">Ensure your watch is in pairing mode.</p>
                                <button 
                                    onClick={handleScan}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-900/20"
                                >
                                    Scan for Devices
                                </button>
                            </div>
                        ) : (
                            <>
                                <p className="text-slate-400 mb-4 flex items-center gap-2">
                                    {isScanning ? <span className="animate-spin">⟳</span> : null}
                                    {isScanning ? "Scanning for devices..." : "Available Devices:"}
                                </p>
                                <div className="space-y-2 min-h-[150px]">
                                    {devices.map((device, idx) => (
                                        <button key={idx} onClick={() => onConnect(device)} className="w-full p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-left flex items-center justify-between group transition-all">
                                            <span className="font-semibold text-slate-200">{device}</span>
                                            <span className="text-xs bg-slate-900 text-slate-500 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Connect</span>
                                        </button>
                                    ))}
                                    {isScanning && devices.length === 0 && (
                                         <div className="text-center py-4 text-slate-500 italic">Searching...</div>
                                    )}
                                </div>
                                {!isScanning && (
                                     <button onClick={handleScan} className="mt-4 text-sm text-blue-400 hover:underline">Rescan</button>
                                )}
                            </>
                        )}
                    </div>
                )}
                 <button onClick={onClose} className="mt-6 w-full py-3 bg-slate-800 text-slate-400 font-bold rounded-xl hover:bg-slate-700 transition-colors">
                    Close
                </button>
            </div>
        </div>
    );
};

const GroupModal = ({ isOpen, onClose, party, friends, onInvite, onKick }: { isOpen: boolean; onClose: () => void; party: string[]; friends: Friend[]; onInvite: (name: string) => void; onKick: (name: string) => void }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
            <div className="bg-[var(--bg-panel-solid)] p-6 rounded-2xl w-full max-w-md m-4 border border-[var(--border-color)] shadow-2xl" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-indigo-300 flex items-center gap-2">
                    <UsersIcon className="w-6 h-6" /> Party Management
                </h2>
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Current Party ({party.length}/5)</h3>
                    <div className="space-y-2">
                        {party.map((member, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/30 p-3 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                                        {member.substring(0, 1)}
                                    </div>
                                    <span className="font-semibold text-white">{member}</span>
                                    {member === 'You' && <span className="text-xs bg-indigo-500 text-white px-1.5 py-0.5 rounded">Leader</span>}
                                </div>
                                {member !== 'You' && (
                                    <button onClick={() => onKick(member)} className="text-xs text-red-400 hover:text-red-300 hover:underline">Remove</button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Online Friends</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {friends.filter(f => f.status === 'online' && !party.includes(f.name)).length === 0 ? (
                            <p className="text-slate-500 text-sm italic">No online friends available.</p>
                        ) : (
                            friends.filter(f => f.status === 'online' && !party.includes(f.name)).map((friend) => (
                                <div key={friend.id} className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span className="text-slate-200">{friend.name}</span>
                                    </div>
                                    <button onClick={() => onInvite(friend.name)} disabled={party.length >= 5} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded transition-colors disabled:opacity-50">Invite</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <button onClick={onClose} className="mt-6 w-full py-3 bg-slate-800 text-slate-400 font-bold rounded-xl hover:bg-slate-700 transition-colors">Close</button>
            </div>
        </div>
    );
};

const FamilyPackModal = ({ isOpen, onClose, onPlayGame }: { isOpen: boolean; onClose: () => void; onPlayGame: (game: string) => void }) => {
    if (!isOpen) return null;

    const games = [
        { name: "Uno Online", players: "2-5 Players", icon: <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">U</div>, id: 'uno' },
        { name: "Bingo Party", players: "1-5 Players", icon: <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">B</div>, id: 'bingo' },
        { name: "Sketch It", players: "3-5 Players", icon: <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">S</div>, id: 'sketchit' },
        { name: "Word Guess", players: "2-5 Players", icon: <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">W</div>, id: 'wordguess' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
            <div className="bg-[var(--bg-panel-solid)] p-6 rounded-2xl w-full max-w-md m-4 border border-[var(--border-color)] shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4 border border-slate-700">
                        <FolderIcon className="w-8 h-8 text-yellow-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Family Pack</h2>
                    <p className="text-slate-400 text-sm">Fun games for everyone!</p>
                </div>

                <div className="space-y-3">
                    {games.map((game, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-slate-700 hover:bg-slate-800 transition-colors">
                            <div className="flex items-center gap-4">
                                {game.icon}
                                <div>
                                    <h3 className="font-bold text-white">{game.name}</h3>
                                    <p className="text-xs text-slate-400">{game.players}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                    if (game.id === 'sketchit') {
                                        onPlayGame('sketchit');
                                    } else if (game.id === 'uno') {
                                        onPlayGame('uno');
                                    } else {
                                        alert("Game coming soon!");
                                    }
                                }}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-md"
                            >
                                Play
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Placeholder modals to prevent build errors
const QrPaymentModal = ({ isOpen, onClose, onPayment }: any) => { if(!isOpen) return null; return null; };
const TransactionsModal = ({ isOpen, onClose, receipts }: any) => { if(!isOpen) return null; return null; };
const TaxModal = ({ isOpen, onClose, receipts, balance }: any) => { if(!isOpen) return null; return null; };
const DAOModal = ({ isOpen, onClose, isPremium }: any) => { if(!isOpen) return null; return null; };
const JoustingModeModal = ({ isOpen, onClose }: any) => { if(!isOpen) return null; return null; };
const LevelRewardsModal = ({ isOpen, onClose, currentLevel }: any) => { if(!isOpen) return null; return null; };
const PremiumModal = ({ isOpen, onClose, onConfirm, balance }: any) => { if(!isOpen) return null; return null; };

const MiningModal = ({ isOpen, onClose, isPremium }: { isOpen: boolean, onClose: () => void, isPremium: boolean }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md overflow-hidden animate-fadeIn" onClick={onClose}>
            <div className="relative w-full h-full flex flex-col" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-6 right-6 z-[60] p-2 bg-slate-900/80 rounded-full text-slate-400 hover:text-white hover:bg-cyan-500 transition-all border border-white/10">
                    <XMarkIcon className="w-5 h-5" />
                </button>
                <div className="flex-1 overflow-y-auto">
                    <MiningApp />
                </div>
            </div>
        </div>
    );
};

const ProfilePanel = ({ user, badges, tasks, friends, watchData, party, onClaimTask, onClaimBadge, claimedXpInfo, onOpenLevelRewards, isPremium, onActivatePremium }: any) => {
    return (
        <div className="p-4 md:p-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row gap-6 mb-8 items-center md:items-start">
                <div className="flex-shrink-0 relative">
                     <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-700 rounded-full overflow-hidden border-4 border-cyan-500 shadow-lg shadow-cyan-500/20">
                        <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                             <ProfileIcon className="w-16 h-16" />
                        </div>
                     </div>
                     <button className="absolute bottom-0 right-0 bg-slate-800 p-2 rounded-full border border-slate-600 hover:bg-slate-700 transition-colors">
                        <PencilIcon className="w-4 h-4 text-white" />
                     </button>
                </div>
                <div className="flex-grow text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                        <h2 className="text-3xl font-bold text-white">{user}</h2>
                        {isPremium && (
                            <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                                PREMIUM
                            </span>
                        )}
                    </div>
                    <p className="text-slate-400 mb-4 flex items-center justify-center md:justify-start gap-2">
                        <span>Level {Math.floor(watchData.xp / 1000) + 1} Explorer</span>
                        <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                        <span className="text-cyan-400 font-mono">{watchData.xp} XP</span>
                    </p>
                    
                     <div className="w-full max-w-md bg-slate-800/50 rounded-full h-3 mb-4 overflow-hidden border border-slate-700/50">
                        <div 
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full transition-all duration-1000 ease-out relative"
                            style={{ width: `${(watchData.xp % 1000) / 10}%` }}
                        >
                             <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
                        </div>
                    </div>
                    
                    {!isPremium && (
                         <button 
                            onClick={onActivatePremium}
                            className="text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/50 px-3 py-1.5 rounded transition-colors"
                        >
                            Upgrade to Premium
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                 <div className="bg-[var(--bg-panel)] p-5 rounded-xl border border-[var(--border-color)]">
                    <div className="flex items-center gap-3 mb-2">
                         <div className="p-2 bg-green-500/20 rounded-lg">
                             <SmartWatchIcon className="w-6 h-6 text-green-400" />
                         </div>
                         <h3 className="font-bold text-slate-200">Activity</h3>
                    </div>
                    <p className="text-2xl font-mono font-bold text-white">{watchData.steps.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">Steps Today</p>
                 </div>
                 
                 <div className="bg-[var(--bg-panel)] p-5 rounded-xl border border-[var(--border-color)] cursor-pointer hover:bg-slate-800/80 transition-colors" onClick={onOpenLevelRewards}>
                    <div className="flex items-center gap-3 mb-2">
                         <div className="p-2 bg-purple-500/20 rounded-lg">
                             <StarIcon className="w-6 h-6 text-purple-400" />
                         </div>
                         <h3 className="font-bold text-slate-200">Level Progress</h3>
                    </div>
                    <p className="text-2xl font-mono font-bold text-white">{Math.floor(watchData.xp / 1000) + 1}</p>
                    <p className="text-xs text-slate-400">Current Level</p>
                 </div>

                 <div className="bg-[var(--bg-panel)] p-5 rounded-xl border border-[var(--border-color)]">
                    <div className="flex items-center gap-3 mb-2">
                         <div className="p-2 bg-blue-500/20 rounded-lg">
                             <QuestsIcon className="w-6 h-6 text-blue-400" />
                         </div>
                         <h3 className="font-bold text-slate-200">Total XP</h3>
                    </div>
                    <p className="text-2xl font-mono font-bold text-white">{watchData.xp.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">Lifetime Experience</p>
                 </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-cyan-300">Daily Tasks</h3>
                        <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">Resets in 4h 12m</span>
                     </div>
                     <div className="space-y-3">
                        {tasks.map((task: any) => (
                            <TaskItem 
                                key={task.id} 
                                task={task} 
                                onClaimTask={onClaimTask} 
                                watchData={watchData}
                                party={party}
                                claimedXpInfo={claimedXpInfo}
                            />
                        ))}
                     </div>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-yellow-300 mb-4">Badges & Achievements</h3>
                    <BadgesView badges={badges} onClaimBadge={onClaimBadge} />
                </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-[var(--border-color)]">
                 <h3 className="text-xl font-bold text-indigo-300 mb-4">Friends ({friends.length})</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                     {friends.map((friend: any) => (
                         <div key={friend.id} className="bg-[var(--bg-panel)] p-3 rounded-lg flex items-center justify-between border border-[var(--border-color)]">
                             <div className="flex items-center gap-3">
                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${friend.isBlockdagFriend ? 'bg-indigo-600' : 'bg-slate-600'}`}>
                                     {friend.name[0]}
                                 </div>
                                 <div>
                                     <p className="font-semibold text-sm text-white">{friend.name}</p>
                                     <div className="flex items-center gap-1">
                                         <div className={`w-2 h-2 rounded-full ${friend.status === 'online' ? 'bg-green-500' : 'bg-slate-500'}`}></div>
                                         <span className="text-xs text-slate-400 capitalize">{friend.status}</span>
                                     </div>
                                 </div>
                             </div>
                             {friend.isBlockdagFriend && (
                                 <div className="bg-indigo-500/20 p-1.5 rounded" title="BlockDAG User">
                                     <BlockDAGIcon className="w-4 h-4 text-indigo-400" />
                                 </div>
                             )}
                         </div>
                     ))}
                 </div>
            </div>
        </div>
    );
};


export default function App() {
    const [username, setUsername] = useState('Guest');
    const [activeView, setActiveView] = useState<ActiveView>('wallet');
    const [bdagBalance, setBdagBalance] = useState(12500.0000);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [walletError, setWalletError] = useState<string | null>(null);
    const [isConnectingWallet, setIsConnectingWallet] = useState(false);
    const [isPortalMenuOpen, setIsPortalMenuOpen] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const pendingDaoDecisions = 4;
    
    // Modals state
    const [showTransactions, setShowTransactions] = useState(false);
    const [showTaxes, setShowTaxes] = useState(false);
    const [showTapToPay, setShowTapToPay] = useState(false);
    const [showMining, setShowMining] = useState(false);
    const [showRaffle, setShowRaffle] = useState(false);
    const [showJoustingMode, setShowJoustingMode] = useState(false);
    const [showDaoModal, setShowDaoModal] = useState(false);
    const [showLevelRewards, setShowLevelRewards] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [showSmartWatchModal, setShowSmartWatchModal] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [showFamilyPackModal, setShowFamilyPackModal] = useState(false);
    
    // Lifted state
    const [raffleTickets, setRaffleTickets] = useState(5);
    const [connectedWatch, setConnectedWatch] = useState<string | null>(null);
    
    // Games state
    const [activeGame, setActiveGame] = useState<'hearts' | 'trivia' | 'sketchit' | 'uno' | null>(null);
    

    // Data
    const [watchData, setWatchData] = useState({ 
        steps: 8500, 
        xp: 2450,
        stairs: 12,
        sleepScore: 78,
        calories: 2250,
        gamesPlayed: 0 
    });
    const [party, setParty] = useState(['You', 'Alice', 'Bob', 'Charlie']);
    
    const [inventory, setInventory] = useState<(InventoryItem | TemplateItem)[]>([
        { id: '1', name: 'Iron Ore', quantity: 5, icon: <IronIcon />, type: 'resource' },
        { id: '2', name: 'Wood Log', quantity: 12, icon: <WoodIcon />, type: 'resource' },
        { id: '3', name: 'Cloth', quantity: 3, icon: <ClothIcon />, type: 'resource' },
        { id: '4', name: 'Blue Template', quantity: 1, icon: <TemplateIcon className="w-10 h-10 text-blue-400" />, type: 'template' },
        { id: '5', name: 'Purple Template', quantity: 1, icon: <TemplateIcon className="w-10 h-10 text-purple-400" />, type: 'template' },
        { id: '6', name: 'Orange Template', quantity: 1, icon: <TemplateIcon className="w-10 h-10 text-orange-400" />, type: 'template' },
        { id: '7', name: 'Prism', quantity: 100, icon: <PrismIcon />, type: 'universal' },
    ]);

    const [badges, setBadges] = useState<BadgeType[]>([
         {
            id: 1,
            name: "Early Adopter",
            description: "Joined BlockDAG Network in the early phase.",
            unlocked: true,
            icon: <EarlyAdopterBadgeIcon />,
            difficulty: 'Easy',
            reward: [{ type: 'resource', id: 'bdag', name: 'BDAG', icon: <BlockDAGIcon />, quantity: 100 }],
            isClaimed: true
        },
    ]);

    const [tasks, setTasks] = useState<Task[]>([
        {
            id: 'daily-login',
            description: 'Log in to the app',
            type: 'daily',
            difficulty: 'Easy',
            reward: [{ type: 'resource', id: 'iron_ore', name: 'Iron Ore', icon: <IronIcon />, quantity: 5 }],
            isComplete: () => true,
            isClaimed: false
        },
        {
            id: 'daily-game-1',
            description: 'Play 1 Game',
            type: 'daily',
            difficulty: 'Easy',
            reward: [{ type: 'resource', id: 'int_boost_1', name: '+1 INT', icon: <StatBonusIcon stat="INT" value={1} />, quantity: 1 }],
            isComplete: (data) => data.gamesPlayed >= 1,
            isClaimed: false
        },
        {
            id: 'daily-game-3',
            description: 'Play 3 Games',
            type: 'daily',
            difficulty: 'Medium',
            reward: [{ type: 'resource', id: 'int_boost_2', name: '+1 INT', icon: <StatBonusIcon stat="INT" value={1} />, quantity: 1 }],
            isComplete: (data) => data.gamesPlayed >= 3,
            isClaimed: false
        },
    ]);
    
    const [friends] = useState<Friend[]>([
        { id: 1, name: "Alice", status: 'online', isBlockdagFriend: true },
        { id: 2, name: "Bob", status: 'offline', isBlockdagFriend: true },
        { id: 3, name: "Charlie", status: 'online', isBlockdagFriend: false },
        { id: 4, name: "Dave", status: 'online', isBlockdagFriend: true },
        { id: 5, name: "Eve", status: 'online', isBlockdagFriend: false },
    ]);

    const [receipts, setReceipts] = useState<Receipt[]>([
        { id: '1', merchant: 'Star Coffee', amount: 15.50, date: new Date().toISOString(), items: [] },
        { id: '2', merchant: 'Game Store', amount: 59.99, date: new Date(Date.now() - 86400000).toISOString(), items: [] },
    ]);

    const [claimedXpInfo, setClaimedXpInfo] = useState<{ taskId: string; xp: number } | null>(null);


    // Effects
    useEffect(() => {
        if (claimedXpInfo) {
            const timer = setTimeout(() => setClaimedXpInfo(null), 2000);
            return () => clearTimeout(timer);
        }
    }, [claimedXpInfo]);
    
    useEffect(() => {
        const checkConnection = async () => {
            if (typeof window.ethereum !== 'undefined') {
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    if (accounts.length > 0) {
                        setWalletAddress(accounts[0]);
                    }
                } catch (err) {
                    console.error("Error checking wallet connection:", err);
                }
            }
        };
        checkConnection();
        
        if (typeof window.ethereum !== 'undefined') {
             window.ethereum.on('accountsChanged', (accounts: string[]) => {
                 if (accounts.length > 0) {
                     setWalletAddress(accounts[0]);
                 } else {
                     setWalletAddress(null);
                 }
             });
        }
    }, []);

    const handleClaimTask = (taskId: string) => {
        setTasks(prev => prev.map(t => {
            if (t.id === taskId) {
                t.reward.forEach(r => {
                    if (r.id === 'bdag') {
                        setBdagBalance(b => b + (r.quantity as number));
                    } else if (r.id === 'xp') {
                         setWatchData(w => ({ ...w, xp: w.xp + (r.quantity as number) }));
                         setClaimedXpInfo({ taskId, xp: (r.quantity as number) });
                    } else if (r.id.startsWith('int_boost')) {
                        // INT boosts are handled by isClaimed status in InventoryPanel
                        // We might want to show a visual indicator here
                         setClaimedXpInfo({ taskId, xp: 0 }); // Trick to trigger animation if we wanted, or separate state
                    } else {
                         setInventory(prevInv => {
                             const existingIndex = prevInv.findIndex(i => i.name === r.name);
                             if (existingIndex >= 0) {
                                 const updated = [...prevInv];
                                 updated[existingIndex] = { ...updated[existingIndex], quantity: updated[existingIndex].quantity + (r.quantity as number) };
                                 return updated;
                             } else {
                                 return [...prevInv, {
                                     id: r.id,
                                     name: r.name,
                                     quantity: (r.quantity as number),
                                     icon: r.icon,
                                     type: 'resource'
                                 } as InventoryItem];
                             }
                         });
                    }
                });
                return { ...t, isClaimed: true };
            }
            return t;
        }));
    };

    const handleClaimBadge = (badgeId: number) => {
        setBadges(prev => prev.map(b => {
            if (b.id === badgeId) {
                b.reward.forEach(r => {
                    if (r.id === 'bdag') setBdagBalance(bal => bal + (r.quantity as number));
                });
                return { ...b, isClaimed: true };
            }
            return b;
        }));
    };

    const handlePayment = async (amount: number, merchant: string) => {
         setBdagBalance(prev => prev - amount);
         setReceipts(prev => [{ id: Date.now().toString(), merchant, amount, date: new Date().toISOString(), items: [] }, ...prev]);
    };

    const handleConnectWallet = async () => {
        setIsConnectingWallet(true);
        setTimeout(() => { setIsConnectingWallet(false); setWalletAddress("0x123...abc"); }, 1000);
    };

    const handleDisconnectWallet = () => {
        setWalletAddress(null);
        setWalletError(null);
    };

    const handleBuyRaffleTicket = () => {
        if (bdagBalance >= 200) {
            setBdagBalance(prev => prev - 200);
            setRaffleTickets(prev => prev + 1);
        }
    };

    const handleActivatePremium = () => {
        setShowPremiumModal(true);
    };

    const handlePurchasePremium = (cost: number) => {
        if (bdagBalance >= cost) {
            setBdagBalance(prev => prev - cost);
            setIsPremium(true);
            setShowPremiumModal(false);
        }
    };

    const handleConnectWatch = (device: string) => {
        setConnectedWatch(device);
        setShowSmartWatchModal(false);
    };

    const handleDisconnectWatch = () => {
        setConnectedWatch(null);
    };

    const handleInviteFriend = (friendName: string) => {
        if (party.length < 5 && !party.includes(friendName)) {
            setParty(prev => [...prev, friendName]);
        }
    };

    const handleRemoveFromParty = (memberName: string) => {
        setParty(prev => prev.filter(p => p !== memberName));
    };

    const handlePlayGame = (game: string) => {
        if (game === 'sketchit') {
            setShowFamilyPackModal(false);
            setActiveGame('sketchit');
        } else if (game === 'uno') {
            setShowFamilyPackModal(false);
            setActiveGame('uno');
        }
    };
    
    const handleGameExit = () => {
        setWatchData(prev => ({ ...prev, gamesPlayed: (prev.gamesPlayed || 0) + 1 }));
        setActiveGame(null);
    };
    
    if (activeGame === 'hearts') {
        return <HeartsGame onExit={handleGameExit} />;
    }

    if (activeGame === 'trivia') {
        return <TriviaGame party={party} onExit={handleGameExit} />;
    }
    
    if (activeGame === 'sketchit') {
        return <SketchItGame onExit={handleGameExit} />;
    }

    if (activeGame === 'uno') {
        return <UnoGame onExit={handleGameExit} />;
    }

    const renderActiveView = () => {
        switch (activeView) {
            case 'wallet':
                return <WalletPanel 
                    bdagBalance={bdagBalance}
                    onOpenTransactions={() => setShowTransactions(true)}
                    onOpenTaxes={() => setShowTaxes(true)}
                    onOpenTapToPay={() => setShowTapToPay(true)}
                    walletAddress={walletAddress}
                    onConnectWallet={handleConnectWallet}
                    onDisconnectWallet={handleDisconnectWallet}
                    walletError={walletError}
                    isConnectingWallet={isConnectingWallet}
                />;
            case 'apps':
                return <AppsPanel 
                    onOpenRaffle={() => setShowRaffle(true)}
                    onOpenMining={() => setShowMining(true)}
                />;
            case 'games':
                return <GamesPanel 
                    onOpenCastModal={() => { /* Placeholder */ }}
                    onOpenGroupModal={() => setShowGroupModal(true)}
                    onOpenJoustingModal={() => setShowJoustingMode(true)}
                    onOpenHeartsGame={() => setActiveGame('hearts')}
                    onOpenTriviaGame={() => setActiveGame('trivia')}
                    onOpenFamilyPack={() => setShowFamilyPackModal(true)}
                />;
            case 'profile':
                return <ProfilePanel 
                    user={username}
                    badges={badges}
                    tasks={tasks}
                    friends={friends}
                    watchData={watchData}
                    party={party}
                    onClaimTask={handleClaimTask}
                    onClaimBadge={handleClaimBadge}
                    claimedXpInfo={claimedXpInfo}
                    onOpenLevelRewards={() => setShowLevelRewards(true)}
                    isPremium={isPremium}
                    onActivatePremium={handleActivatePremium}
                />;
            case 'sponsors':
                return <SponsorsPanel />;
            case 'inventory':
                return <InventoryPanel 
                    inventory={inventory}
                    onEquip={() => {}}
                    onOpenSmartWatch={() => setShowSmartWatchModal(true)}
                    connectedWatch={connectedWatch}
                    watchData={watchData}
                    tasks={tasks}
                />;
            default:
                return <div className="p-6 text-center">Coming Soon</div>;
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-white font-sans overflow-hidden">
            {/* Top Bar */}
            <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-4 flex items-center justify-between z-10">
                <div className="relative">
                    <button 
                        onClick={() => setIsPortalMenuOpen(!isPortalMenuOpen)}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
                    >
                        <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center border border-cyan-500/50">
                            <BlockDAGIcon className="w-5 h-5 text-cyan-400" />
                        </div>
                        <h1 className="font-bold text-lg tracking-tight">
                            BlockDAG <span className="text-cyan-400 font-light">Portal {pendingDaoDecisions > 0 && <span className="text-red-400">({pendingDaoDecisions})</span>}</span>
                        </h1>
                    </button>
                    
                    {isPortalMenuOpen && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-fadeIn">
                            <button 
                                className="w-full px-4 py-3 text-left text-slate-200 hover:bg-slate-700 transition-colors flex justify-between items-center group"
                                onClick={() => {
                                    setIsPortalMenuOpen(false);
                                    setShowDaoModal(true);
                                }}
                            >
                                <span className="font-semibold">DAO</span>
                                {pendingDaoDecisions > 0 && (
                                    <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full border border-red-500/30 group-hover:bg-red-500/30">
                                        {pendingDaoDecisions}
                                    </span>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow overflow-y-auto pb-20 scrollbar-hide">
                {renderActiveView()}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 pb-safe z-20">
                <div className="flex justify-around items-center max-w-2xl mx-auto">
                    <NavButton 
                        icon={<WalletIcon className="w-6 h-6" />} 
                        label="Wallet" 
                        isActive={activeView === 'wallet'} 
                        onClick={() => setActiveView('wallet')} 
                        activeColor="text-cyan-400"
                    />
                    <NavButton 
                        icon={<AppsIcon className="w-6 h-6" />} 
                        label="Apps" 
                        isActive={activeView === 'apps'} 
                        onClick={() => setActiveView('apps')} 
                        activeColor="text-purple-400"
                    />
                    <NavButton 
                        icon={<ProfileIcon className="w-6 h-6" />} 
                        label="Profile" 
                        isActive={activeView === 'profile'} 
                        onClick={() => setActiveView('profile')} 
                        activeColor="text-blue-400"
                    />
                    <NavButton 
                        icon={<GamesIcon className="w-6 h-6" />} 
                        label="Games" 
                        isActive={activeView === 'games'} 
                        onClick={() => setActiveView('games')} 
                        activeColor="text-orange-400"
                    />
                     <NavButton 
                        icon={<InventoryIcon className="w-6 h-6" />} 
                        label="Inventory" 
                        isActive={activeView === 'inventory'} 
                        onClick={() => setActiveView('inventory')} 
                        activeColor="text-teal-400"
                    />
                     <NavButton 
                        icon={<SponsorsIcon className="w-6 h-6" />} 
                        label="Partners" 
                        isActive={activeView === 'sponsors'} 
                        onClick={() => setActiveView('sponsors')} 
                        activeColor="text-yellow-400"
                    />
                </div>
            </nav>

            {/* Modals */}
            <TransactionsModal isOpen={showTransactions} onClose={() => setShowTransactions(false)} receipts={receipts} />
            <TaxModal isOpen={showTaxes} onClose={() => setShowTaxes(false)} receipts={receipts} balance={bdagBalance} />
            <QrPaymentModal isOpen={showTapToPay} onClose={() => setShowTapToPay(false)} onPayment={handlePayment} />
            <MiningModal isOpen={showMining} onClose={() => setShowMining(false)} isPremium={isPremium} />
            <RaffleModal 
                isOpen={showRaffle} 
                onClose={() => setShowRaffle(false)}
                userBdagBalance={bdagBalance}
                setUserBdagBalance={setBdagBalance}
            />
            <JoustingModeModal isOpen={showJoustingMode} onClose={() => setShowJoustingMode(false)} />
            <DAOModal isOpen={showDaoModal} onClose={() => setShowDaoModal(false)} isPremium={isPremium} />
            <LevelRewardsModal isOpen={showLevelRewards} onClose={() => setShowLevelRewards(false)} currentLevel={Math.floor(watchData.xp / 1000) + 1} />
            <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} onConfirm={handlePurchasePremium} balance={bdagBalance} />
            <SmartWatchModal isOpen={showSmartWatchModal} onClose={() => setShowSmartWatchModal(false)} connectedWatch={connectedWatch} onConnect={handleConnectWatch} onDisconnect={handleDisconnectWatch} />
            <GroupModal isOpen={showGroupModal} onClose={() => setShowGroupModal(false)} party={party} friends={friends} onInvite={handleInviteFriend} onKick={handleRemoveFromParty} />
            <FamilyPackModal isOpen={showFamilyPackModal} onClose={() => setShowFamilyPackModal(false)} onPlayGame={handlePlayGame} />

        </div>
    );
}
