
import React, { useState, useRef, useEffect, ReactNode, useMemo } from 'react';
import { ActiveView, Task, Badge as BadgeType, Receipt, DaoProposal } from './types';
import { auth as firebaseAuth } from './services/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import CinemagraphLoginScreen from './components/auth/CinemagraphLoginScreen';
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
import CityBldrModal from './components/games/citybldr/CityBldrModal';
import CityBuilderGame from './components/games/citybldr/CityBuilderGame';
import GroupSlots from './components/profile/GroupSlots';
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
import fitbitService from './services/fitbitService'; // Import Fitbit service
import { RaffleModal } from './components/raffle/RaffleModal'; // Import new RaffleModal
import MiningApp from './components/mining/MiningApp'; // Import new MiningApp
import AvatarViewer from './components/profile/AvatarViewer'; // Import 3D avatar viewer
import { avatarService } from './services/avatarService'; // Import avatar generation service
import { AvatarCustomizer, AvatarData } from './components/profile/AvatarCustomizer'; // Import avatar customizer
import Avatar3DPreview from './components/profile/Avatar3DPreview'; // Import avatar 3D preview
import FullBodyAvatar from './components/profile/FullBodyAvatar'; // Import full body avatar
import SmartAvatarGenerator from './components/profile/SmartAvatarGenerator'; // Import smart avatar generator

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

    const iconElement = item ? React.cloneElement(item.icon, { className: 'w-8 h-8 text-teal-300' }) : null;

    return (
        <div
            className={`aspect-square rounded-lg flex flex-col items-center justify-center p-2 text-center transition-colors relative ${
                item
                    ? `bg-slate-700/50 bg-opacity-50 border cursor-pointer hover:bg-slate-700 ${borderColorClass}`
                    : 'bg-slate-900/50 border-2 border-dashed border-[var(--border-interactive)] opacity-50'
            }`}
        >
            {item ? (
                <>
                    <div className="flex items-center justify-center w-10 h-10 text-teal-300">
                        {iconElement}
                    </div>
                    <div className="mt-2 text-xs font-semibold text-[var(--text-primary)] leading-tight text-center break-words">
                        {item.name}
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)]">x{item.quantity}</div>
                </>
            ) : (
                <span className="text-[10px] text-[var(--text-secondary)]">Empty</span>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-full mx-auto animate-fadeIn">
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

const NavButton: React.FC<NavButtonProps> = ({ icon, label, isActive, onClick, activeColor }) => {
    const iconElement = React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: 'w-7 h-7 md:w-6 md:h-6' }) : icon;
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center w-full h-20 md:h-16 touch-none select-none transition-colors duration-200 ${
                isActive ? activeColor : 'text-[var(--text-secondary)]'
            }`}
            aria-label={label}
        >
            {iconElement}
            <span className="text-xs mt-1">{label}</span>
        </button>
    );
};

const WalletPanel = ({ 
    bdagBalance, 
    onOpenTransactions, 
    onOpenTaxes, 
    onOpenTapToPay,
    walletAddress,
    onConnectWallet,
    onDisconnectWallet,
    walletError,
    isConnectingWallet,
    onBack
}: { 
    bdagBalance: number, 
    onOpenTransactions: () => void, 
    onOpenTaxes: () => void,
    onOpenTapToPay: () => void,
    walletAddress: string | null,
    onConnectWallet: () => void,
    onDisconnectWallet: () => void,
    walletError: string | null,
    isConnectingWallet: boolean,
    onBack: () => void
}) => {
    const BDAG_PRICE_USD = 0.05;
    const usdValue = bdagBalance * BDAG_PRICE_USD;

    return (
        <div className="p-6 text-center animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={onBack}
                        className="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Back</span>
                    </button>
                    <h2 className="text-2xl font-bold text-cyan-300">Wallet</h2>
                </div>
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

const GamesPanel = ({ onOpenCastModal, onOpenGroupModal, onOpenJoustingModal, onOpenHeartsGame, onOpenTriviaGame, onOpenFamilyPack, onOpenCityBldr }: any) => {
    const [activeTab, setActiveTab] = useState<'freeToPlay' | 'purchased' | 'trending'>('freeToPlay');

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

            {/* City BLDR - Large Rectangle with Cityscape Background */}
            <div className="mb-8 max-w-4xl mx-auto">
                <button 
                    onClick={() => { if (typeof onOpenCityBldr === 'function') onOpenCityBldr(); }} 
                    className="w-full h-32 relative overflow-hidden rounded-xl shadow-2xl hover:shadow-cyan-500/50 transition-all hover:scale-[1.02] group"
                >
                    {/* Animated Cityscape Background */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-cyan-900/40 to-cyan-700">
                        {/* Sky with gradient */}
                        <div className="absolute inset-0 bg-gradient-to-b from-orange-400/30 via-purple-500/20 to-transparent"></div>
                        
                        {/* Skyscrapers */}
                        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-1 px-4">
                            {/* Building 1 */}
                            <div className="w-12 h-20 bg-slate-800 relative border-t-2 border-cyan-400/50 group-hover:h-24 transition-all">
                                <div className="absolute top-2 left-1 right-1 grid grid-cols-2 gap-[2px]">
                                    <div className="w-2 h-2 bg-yellow-300/80"></div>
                                    <div className="w-2 h-2 bg-yellow-300/80"></div>
                                    <div className="w-2 h-2 bg-yellow-300/60"></div>
                                    <div className="w-2 h-2 bg-yellow-300/80"></div>
                                </div>
                            </div>
                            
                            {/* Building 2 - Tallest */}
                            <div className="w-16 h-28 bg-slate-700 relative border-t-2 border-cyan-400 group-hover:h-32 transition-all">
                                <div className="absolute top-1 w-full">
                                    <div className="w-4 h-4 bg-cyan-400 mx-auto animate-pulse"></div>
                                </div>
                                <div className="absolute top-6 left-1 right-1 grid grid-cols-3 gap-[2px]">
                                    <div className="w-2 h-2 bg-yellow-300/80"></div>
                                    <div className="w-2 h-2 bg-yellow-300/90"></div>
                                    <div className="w-2 h-2 bg-yellow-300/80"></div>
                                    <div className="w-2 h-2 bg-yellow-300/70"></div>
                                    <div className="w-2 h-2 bg-yellow-300/80"></div>
                                    <div className="w-2 h-2 bg-yellow-300/90"></div>
                                </div>
                            </div>
                            
                            {/* Building 3 */}
                            <div className="w-14 h-24 bg-slate-800 relative border-t-2 border-cyan-400/50 group-hover:h-28 transition-all">
                                <div className="absolute top-3 left-1 right-1 grid grid-cols-2 gap-[2px]">
                                    <div className="w-2 h-2 bg-yellow-300/80"></div>
                                    <div className="w-2 h-2 bg-yellow-300/70"></div>
                                    <div className="w-2 h-2 bg-yellow-300/90"></div>
                                    <div className="w-2 h-2 bg-yellow-300/80"></div>
                                </div>
                            </div>
                            
                            {/* Building 4 */}
                            <div className="w-10 h-16 bg-slate-900 relative border-t-2 border-cyan-400/40 group-hover:h-20 transition-all">
                                <div className="absolute top-2 left-1 right-1 grid grid-cols-2 gap-[2px]">
                                    <div className="w-2 h-2 bg-yellow-300/70"></div>
                                    <div className="w-2 h-2 bg-yellow-300/80"></div>
                                </div>
                            </div>
                            
                            {/* Building 5 */}
                            <div className="w-12 h-22 bg-slate-800 relative border-t-2 border-cyan-400/50 group-hover:h-26 transition-all">
                                <div className="absolute top-3 left-1 right-1 grid grid-cols-2 gap-[2px]">
                                    <div className="w-2 h-2 bg-yellow-300/80"></div>
                                    <div className="w-2 h-2 bg-yellow-300/80"></div>
                                    <div className="w-2 h-2 bg-yellow-300/70"></div>
                                    <div className="w-2 h-2 bg-yellow-300/90"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Content Overlay */}
                    <div className="relative z-10 h-full flex items-center justify-between px-8">
                        <div className="flex items-center gap-4">
                            <CityIcon className="w-12 h-12 text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.7)]" />
                            <div className="text-left">
                                <div className="text-3xl font-bold text-white drop-shadow-lg">City BLDR</div>
                                <div className="text-sm text-cyan-200">Build your metropolis</div>
                            </div>
                        </div>
                        <div className="text-cyan-300 text-2xl font-bold animate-pulse">▶</div>
                    </div>
                </button>
            </div>

            <div className="border-b border-[var(--border-color)] mb-8 max-w-4xl mx-auto"></div>

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
                <button
                    onClick={() => setActiveTab('trending')}
                    className={`px-6 py-2 font-semibold transition-colors ${activeTab === 'trending' ? 'text-orange-400 border-b-2 border-orange-400' : 'text-[var(--text-secondary)]'}`}
                >
                    Trending
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
                            <UsersIcon className="w-16 h-16 text-purple-400 flex-shrink-0" />
                            <div>
                                <h3 className="text-xl font-bold text-[var(--text-primary)]">Community Pack</h3>
                                <p className="text-sm text-[var(--text-secondary)]">Games created and shared by the BlockDAG community.</p>
                            </div>
                        </div>
                        <div className="mt-4 text-center">
                            <button
                                className="w-full px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg shadow-md hover:bg-purple-600 transition-colors"
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
            {activeTab === 'trending' && (
                <div className="max-w-4xl mx-auto animate-fadeIn">
                    <p className="text-[var(--text-secondary)] mb-6">Most popular games based on community likes.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-[var(--bg-panel)] rounded-lg p-6 backdrop-blur-sm text-left">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-2xl font-bold text-yellow-400">#1</span>
                                <div className="flex items-center gap-1 text-rose-400">
                                    <HeartIcon className="w-5 h-5 fill-current" />
                                    <span className="font-bold">12.4K</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <JoustingIcon className="w-16 h-16 text-orange-400 flex-shrink-0" />
                                <div>
                                    <h3 className="text-xl font-bold text-[var(--text-primary)]">Jousting Champions</h3>
                                    <p className="text-sm text-[var(--text-secondary)]">Medieval combat at its finest!</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <button
                                    onClick={onOpenJoustingModal}
                                    className="w-full px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-md hover:bg-orange-600 transition-colors"
                                >
                                    Play Now
                                </button>
                            </div>
                        </div>

                        <div className="bg-[var(--bg-panel)] rounded-lg p-6 backdrop-blur-sm text-left">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-2xl font-bold text-gray-400">#2</span>
                                <div className="flex items-center gap-1 text-rose-400">
                                    <HeartIcon className="w-5 h-5 fill-current" />
                                    <span className="font-bold">9.8K</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <CityIcon className="w-16 h-16 text-cyan-400 flex-shrink-0" />
                                <div>
                                    <h3 className="text-xl font-bold text-[var(--text-primary)]">City BLDR</h3>
                                    <p className="text-sm text-[var(--text-secondary)]">Build your metropolis!</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <button
                                    onClick={onOpenCityBldr}
                                    className="w-full px-6 py-3 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600 transition-colors"
                                >
                                    Play Now
                                </button>
                            </div>
                        </div>

                        <div className="bg-[var(--bg-panel)] rounded-lg p-6 backdrop-blur-sm text-left">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-2xl font-bold text-amber-600">#3</span>
                                <div className="flex items-center gap-1 text-rose-400">
                                    <HeartIcon className="w-5 h-5 fill-current" />
                                    <span className="font-bold">8.2K</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <HeartIcon className="w-16 h-16 text-rose-400 flex-shrink-0" />
                                <div>
                                    <h3 className="text-xl font-bold text-[var(--text-primary)]">Hearts</h3>
                                    <p className="text-sm text-[var(--text-secondary)]">Classic card game strategy!</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <button
                                    onClick={onOpenHeartsGame}
                                    className="w-full px-6 py-3 bg-rose-500 text-white font-semibold rounded-lg shadow-md hover:bg-rose-600 transition-colors"
                                >
                                    Play Now
                                </button>
                            </div>
                        </div>

                        <div className="bg-[var(--bg-panel)] rounded-lg p-6 backdrop-blur-sm text-left">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-2xl font-bold text-gray-500">#4</span>
                                <div className="flex items-center gap-1 text-rose-400">
                                    <HeartIcon className="w-5 h-5 fill-current" />
                                    <span className="font-bold">7.1K</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <TriviaIcon className="w-16 h-16 text-teal-400 flex-shrink-0" />
                                <div>
                                    <h3 className="text-xl font-bold text-[var(--text-primary)]">Trivia Challenge</h3>
                                    <p className="text-sm text-[var(--text-secondary)]">Test your knowledge!</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <button
                                    onClick={onOpenTriviaGame}
                                    className="w-full px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg shadow-md hover:bg-teal-600 transition-colors"
                                >
                                    Play Now
                                </button>
                            </div>
                        </div>

                        <div className="bg-[var(--bg-panel)] rounded-lg p-6 backdrop-blur-sm text-left">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-2xl font-bold text-gray-500">#5</span>
                                <div className="flex items-center gap-1 text-rose-400">
                                    <HeartIcon className="w-5 h-5 fill-current" />
                                    <span className="font-bold">5.6K</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <FolderIcon className="w-16 h-16 text-yellow-400 flex-shrink-0" />
                                <div>
                                    <h3 className="text-xl font-bold text-[var(--text-primary)]">Family Pack</h3>
                                    <p className="text-sm text-[var(--text-secondary)]">Fun for the whole family!</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <button
                                    onClick={onOpenFamilyPack}
                                    className="w-full px-6 py-3 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 transition-colors"
                                >
                                    Open Pack
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <img src="/assets/games-illustration.svg" alt="Games Illustration" className="mx-auto mt-8 w-64 h-64" />
        </div>
    );
};

const SponsorsPanel = () => (
    <div className="p-6 text-center animate-fadeIn">
        <h2 className="text-2xl font-bold mb-4 text-yellow-300">Sponsors</h2>
        <p className="text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">Sponsor buttons open to the app they want designed for fan interaction. Or website. Encourage live streams of their events for premium users. That can cast to the television.</p>
        
        <div className="max-w-4xl mx-auto bg-[var(--bg-panel)] rounded-lg p-4 backdrop-blur-sm border border-[var(--border-color)]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <a href="https://www.alpinef1.com/" target="_blank" rel="noopener noreferrer" className="relative flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-lg aspect-video bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 overflow-hidden">
                    <img 
                        src="/assets/bwt-alpine-blockdag.jpg?v=1" 
                        alt="BWT Alpine F1 Team and BlockDAG Partner" 
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={(e) => {
                            console.error('JPG failed, trying PNG');
                            e.currentTarget.src = '/assets/bwt-alpine-blockdag.png?v=1';
                            e.currentTarget.onerror = () => {
                                console.error('PNG also failed');
                                e.currentTarget.style.display = 'none';
                            };
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"></div>
                    <div className="absolute bottom-2 left-4 z-10">
                        <span className="bg-pink-500 text-white text-lg font-bold px-3 py-1 rounded-md shadow-lg">BWT</span>
                    </div>
                </a>
                
                <a
                    href="https://www.inter.it/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-lg overflow-hidden aspect-video bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                    <img
                        src="/assets/inter-milan-blockdag.jpg?v=1"
                        alt="Inter Milan and BlockDAG Partner"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={(e) => {
                            console.error('JPG failed, trying PNG');
                            e.currentTarget.src = '/assets/inter-milan-blockdag.png?v=1';
                            e.currentTarget.onerror = () => {
                                console.error('PNG also failed');
                                e.currentTarget.style.display = 'none';
                            };
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"></div>
                    <div className="absolute bottom-2 left-4 z-10">
                        <span className="bg-blue-600 text-white text-lg font-bold px-3 py-1 rounded-md shadow-lg">Inter Milan</span>
                    </div>
                </a>

                <a
                    href="https://www.ufc.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-lg overflow-hidden aspect-video bg-gradient-to-br from-gray-900 via-red-800 to-black shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                    <img
                        src="/assets/UFC_BlockdagX1.jpg?v=1"
                        alt="UFC and BlockDAG Partner"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={(e) => {
                            console.error('JPG failed, trying PNG');
                            e.currentTarget.src = '/assets/UFC_BlockdagX1.png?v=1';
                            e.currentTarget.onerror = () => {
                                console.error('PNG also failed');
                                e.currentTarget.style.display = 'none';
                            };
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
                    <div className="absolute bottom-2 left-4 z-10">
                        <span className="bg-red-700 text-white text-lg font-bold px-3 py-1 rounded-md shadow-lg">UFC</span>
                    </div>
                </a>

                <a
                    href="https://www.seattleorcas.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-lg overflow-hidden aspect-video bg-gradient-to-br from-teal-700 to-blue-900 shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                    <img
                        src="/assets/Blockdag_x1_Sponsor_Orca.png?v=1"
                        alt="Seattle Orcas and BlockDAG Partner"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={(e) => {
                            console.error('PNG failed, trying JPG');
                            e.currentTarget.src = '/assets/Blockdag_x1_Sponsor_Orca.jpg?v=1';
                            e.currentTarget.onerror = () => {
                                console.error('Both formats failed');
                                e.currentTarget.style.display = 'none';
                            };
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
                    <div className="absolute bottom-2 left-4 z-10">
                        <span className="bg-teal-600 text-white text-lg font-bold px-3 py-1 rounded-md shadow-lg">Seattle Orcas</span>
                    </div>
                </a>

                <a
                    href="https://www.seawolves.rugby/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-lg overflow-hidden aspect-video bg-gradient-to-br from-blue-800 to-indigo-900 shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                    <img
                        src="/assets/blockdag x1 seawolves.png?v=1"
                        alt="Seawolves and BlockDAG Partner"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={(e) => {
                            console.error('PNG failed, trying JPG');
                            e.currentTarget.src = '/assets/blockdag x1 seawolves.jpg?v=1';
                            e.currentTarget.onerror = () => {
                                console.error('Both formats failed');
                                e.currentTarget.style.display = 'none';
                            };
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
                    <div className="absolute bottom-2 left-4 z-10">
                        <span className="bg-blue-700 text-white text-lg font-bold px-3 py-1 rounded-md shadow-lg">Seawolves</span>
                    </div>
                </a>
            </div>
        </div>
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

const InventoryPanel = ({ inventory, onEquip, onOpenSmartWatch, connectedWatch, watchData, tasks, onOpenCraft }: { inventory: (InventoryItem | TemplateItem)[], onEquip: (item: InventoryItem | TemplateItem) => void, onOpenSmartWatch: () => void, connectedWatch: string | null, watchData: any, tasks: Task[], onOpenCraft: () => void }) => {
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
            {/* Left Sidebar moved to Profile: Active Gear and Stats removed from Inventory */}
            {/* Main Content Area */}
            <div className="flex-grow flex flex-col">
                <div className="flex justify-between items-center mb-6">
                     <h2 className="text-3xl font-bold text-teal-300">Inventory</h2>
                     <div className="flex items-center gap-3">
                        <button 
                            onClick={onOpenCraft}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-md transition-colors"
                        >
                            Craft Equipment
                        </button>
                     </div>
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
                            <h3 className="text-lg font-bold text-[var(--text-secondary)] mb-3 border-b border-[var(--border-color)] pb-1">Common Resources</h3>
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
    const [bluetoothAvailable, setBluetoothAvailable] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [manualDeviceName, setManualDeviceName] = useState('');
    const [showManualInput, setShowManualInput] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

    useEffect(() => {
        if(isOpen && !connectedWatch) {
            setDevices([]);
            setIsScanning(false);
            checkBluetoothAvailability();
        }
    }, [isOpen, connectedWatch]);

    const checkBluetoothAvailability = async () => {
        const available = navigator.bluetooth !== undefined;
        setBluetoothAvailable(available);
        if (!available) {
            setError('Bluetooth not available on this device');
        }
    };

    const handleConnect = (deviceName: string) => {
        // Start syncing data from the watch
        startWatchSync(deviceName);
        onConnect(deviceName);
    };

    const startWatchSync = async (deviceName: string) => {
        console.log('Starting watch data sync for:', deviceName);
        try {
            const { fetchSmartWatchData } = await import('./services/bluetoothService');
            
            // Fetch initial data
            const data = await fetchSmartWatchData(deviceName);
            if (data) {
                console.log('Fetched initial data:', data);
                // This will be handled by parent component through onConnect
            }
            
            setLastSyncTime(new Date());
            setError(null);
        } catch (err) {
            console.error('Failed to sync watch data:', err);
            setError('Connected but failed to sync data. Check console.');
        }
    };

    const handleGenericScan = async () => {
        setIsScanning(true);
        setDevices([]);
        setError(null);

        try {
            if (!navigator.bluetooth) {
                setError('Bluetooth not supported. Using mock devices for demonstration.');
                const { getMockSmartWatches } = await import('./services/bluetoothService');
                setTimeout(() => {
                    const mockDevices = getMockSmartWatches();
                    setDevices(mockDevices.map(d => d.name));
                    setIsScanning(false);
                }, 1500);
                return;
            }

            console.log('Starting generic Bluetooth scan (no name filters)...');

            // Generic scan without strict name filters
            try {
                const device = await navigator.bluetooth.requestDevice({
                    filters: [
                        { services: ['generic_access'] },
                    ],
                    optionalServices: [
                        '0000180a-0000-1000-8000-00805f9b34fb',
                        '0000180d-0000-1000-8000-00805f9b34fb',
                        '0000181d-0000-1000-8000-00805f9b34fb',
                    ]
                });

                if (device && device.name) {
                    console.log('Found device:', device.name);
                    setDevices(prev => [...prev, device.name!]);
                } else {
                    setError('Device selected but no name found. Try manual entry.');
                }
            } catch (err: any) {
                if (err.name === 'NotFoundError') {
                    setError('No devices found. Make sure your watch is turned on and discoverable.');
                } else {
                    throw err;
                }
            }

            setIsScanning(false);
        } catch (err: any) {
            console.error('Scan error:', err);
            setError(`Scan failed: ${err.message || 'Unknown error'}`);
            setIsScanning(false);
        }
    };

    const handleScan = async () => {
        setIsScanning(true);
        setDevices([]);
        setError(null);

        try {
            if (!navigator.bluetooth) {
                setError('Bluetooth not supported. Using mock devices for demonstration.');
                const { getMockSmartWatches } = await import('./services/bluetoothService');
                setTimeout(() => {
                    const mockDevices = getMockSmartWatches();
                    setDevices(mockDevices.map(d => d.name));
                    setIsScanning(false);
                }, 1500);
                return;
            }

            console.log('Starting Bluetooth scan with specific filters...');

            try {
                const device = await navigator.bluetooth.requestDevice({
                    filters: [
                        { namePrefix: 'Versa' },
                        { namePrefix: 'Galaxy Watch' },
                        { namePrefix: 'Pixel Watch' },
                        { namePrefix: 'Watch Series' },
                        { namePrefix: 'Garmin' },
                        { namePrefix: 'Fossil' },
                        { namePrefix: 'Mi Band' },
                        { namePrefix: 'Wear OS' },
                    ],
                    optionalServices: [
                        '0000180a-0000-1000-8000-00805f9b34fb',
                        '0000180d-0000-1000-8000-00805f9b34fb'
                    ]
                });

                if (device && device.name) {
                    console.log('Found device:', device.name);
                    setDevices(prev => [...prev, device.name!]);
                }
            } catch (filterError: any) {
                console.log('Specific filter error:', filterError.message);
                
                if (filterError.name === 'NotFoundError') {
                    setError('No smartwatches with standard names found. Try "Generic Scan" or manual entry.');
                } else {
                    throw filterError;
                }
            }

            setIsScanning(false);
        } catch (err: any) {
            console.error('Scan error:', err);
            
            if (err.name === 'NotFoundError') {
                setError('No smartwatches found. Make sure your watch is in pairing mode.');
            } else if (err.name === 'SecurityError') {
                setError('Bluetooth permission denied. Check browser settings.');
            } else {
                setError(`Scan failed: ${err.message || 'Unknown error'}`);
            }
            setIsScanning(false);
        }
    };

    const handleManualConnect = () => {
        if (manualDeviceName.trim()) {
            handleConnect(manualDeviceName.trim());
            setManualDeviceName('');
            setShowManualInput(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
            <div className="bg-[var(--bg-panel-solid)] p-6 rounded-2xl w-full max-w-md m-4 border border-[var(--border-color)] shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-teal-300 flex items-center gap-2">
                        <SmartWatchIcon className="w-6 h-6" /> Smart Watch
                    </h2>
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-white text-2xl font-bold"
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg text-yellow-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Fitbit OAuth Section */}
                <div className="mb-6 p-4 bg-blue-900/20 border border-blue-600/50 rounded-xl">
                    <h3 className="font-bold text-blue-300 mb-2 flex items-center gap-2">
                        <span>📱</span> Fitbit Account
                    </h3>
                    <p className="text-xs text-slate-400 mb-3">
                        Connect your real Fitbit device for automatic health data sync
                    </p>
                    {fitbitService.isAuthenticated() ? (
                        <div className="space-y-2">
                            <div className="p-2 bg-green-900/20 border border-green-600/50 rounded-lg text-green-300 text-sm">
                                ✓ Fitbit Connected
                            </div>
                            <button 
                                onClick={async () => {
                                    try {
                                        const data = await fitbitService.getTodayHealthData();
                                        if (data) {
                                            alert(`Health Data Synced!\nSteps: ${data.steps}\nCalories: ${data.calories}\nSleep Score: ${data.sleepScore}`);
                                            // Update character stats based on health data
                                            const dexBonus = Math.floor(data.steps / 7500 * 2);
                                            const strBonus = Math.floor(data.stairs / 25 * 2);
                                            const conBonus = Math.max(0, (data.sleepScore - 60) / 17.5);
                                            const chaBonus = Math.floor((data.calories - 1500) / 1000 * 2);
                                            console.log(`Stat Bonuses - DEX: +${dexBonus}, STR: +${strBonus}, CON: +${conBonus.toFixed(1)}, CHA: +${chaBonus}`);
                                        }
                                    } catch (err) {
                                        console.error('Error syncing health data:', err);
                                        alert('Failed to sync health data');
                                    }
                                }}
                                className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors text-sm"
                            >
                                🔄 Sync Health Data
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => fitbitService.startOAuthFlow()}
                            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors text-sm"
                        >
                            🔗 Connect Fitbit Account
                        </button>
                    )}
                </div>

                {connectedWatch ? (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50">
                            <SmartWatchIcon className="w-10 h-10 text-green-400" />
                        </div>
                        <p className="text-lg font-semibold text-white mb-2">{connectedWatch}</p>
                        <p className="text-sm text-green-400 mb-2 flex items-center justify-center gap-1">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            Connected via Bluetooth
                        </p>
                        {lastSyncTime && (
                            <p className="text-xs text-slate-400 mb-6">
                                Last sync: {lastSyncTime.toLocaleTimeString()}
                            </p>
                        )}
                        <button 
                            onClick={onDisconnect} 
                            className="px-4 py-2 bg-red-500/20 text-red-300 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                            Disconnect Device
                        </button>
                    </div>
                ) : (
                    <div>
                        {!bluetoothAvailable && (
                            <div className="text-center py-8 bg-slate-800/50 rounded-lg p-4 mb-4">
                                <p className="text-slate-400 mb-4">⚠️ Bluetooth is not available on your device</p>
                                <p className="text-sm text-slate-500">Note: You're seeing mock smartwatch devices for testing</p>
                            </div>
                        )}

                        {!isScanning && devices.length === 0 ? (
                            <div className="text-center py-8 space-y-4">
                                <p className="text-slate-400">Make sure your smartwatch is nearby and discoverable.</p>
                                
                                {!showManualInput ? (
                                    <div className="space-y-3">
                                        <button 
                                            onClick={handleScan}
                                            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-900/20"
                                        >
                                            Scan for Smart Watches
                                        </button>
                                        
                                        <button 
                                            onClick={handleGenericScan}
                                            className="w-full px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold rounded-xl transition-colors text-sm"
                                        >
                                            Generic Scan (Any Device)
                                        </button>
                                        
                                        <button 
                                            onClick={() => setShowManualInput(true)}
                                            className="w-full px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold rounded-xl transition-colors text-sm"
                                        >
                                            Enter Device Name Manually
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={manualDeviceName}
                                            onChange={(e) => setManualDeviceName(e.target.value)}
                                            placeholder="e.g., Versa 2, Galaxy Watch, etc."
                                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                                            onKeyPress={(e) => e.key === 'Enter' && handleManualConnect()}
                                        />
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={handleManualConnect}
                                                disabled={!manualDeviceName.trim()}
                                                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
                                            >
                                                Connect
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setShowManualInput(false);
                                                    setManualDeviceName('');
                                                }}
                                                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <p className="text-slate-400 mb-4 flex items-center gap-2">
                                    {isScanning ? (
                                        <>
                                            <span className="animate-spin inline-block">⟳</span>
                                            Scanning for smartwatches...
                                        </>
                                    ) : (
                                        <>
                                            📱 Available Smartwatches:
                                        </>
                                    )}
                                </p>
                                <div className="space-y-2 min-h-[150px]">
                                    {devices.length > 0 ? (
                                        devices.map((device, idx) => (
                                            <button 
                                                key={idx} 
                                                onClick={() => handleConnect(device)} 
                                                className="w-full p-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-left flex items-center justify-between group transition-all hover:border-cyan-500"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <SmartWatchIcon className="w-5 h-5 text-cyan-400" />
                                                    <span className="font-semibold text-slate-200">{device}</span>
                                                </div>
                                                <span className="text-xs bg-slate-900 text-slate-400 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Connect →
                                                </span>
                                            </button>
                                        ))
                                    ) : isScanning ? (
                                        <div className="text-center py-6 text-slate-500">
                                            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                            Searching nearby devices...
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 text-slate-500">
                                            No smartwatches found. Try again.
                                        </div>
                                    )}
                                </div>
                                {!isScanning && devices.length > 0 && (
                                    <button 
                                        onClick={handleScan}
                                        className="w-full mt-4 py-2 text-sm text-blue-400 hover:text-blue-300 border border-blue-500/30 rounded-lg hover:border-blue-500 transition-colors"
                                    >
                                        Scan Again
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// Simple Craft Equipment Modal (stub)
const CraftEquipmentModal = ({ isOpen, onClose, inventory }: { isOpen: boolean; onClose: () => void; inventory: (InventoryItem | TemplateItem)[] }) => {
    if (!isOpen) return null;
    const resources = inventory.filter((i:any) => i.type === 'resource');
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
            <div className="relative z-10 w-[92%] max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-xl p-5">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-white">Craft Equipment</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
                </div>
                <p className="text-sm text-slate-400 mb-4">Select a recipe and use resources to craft new equipment. Feature preview.</p>
                <div className="mb-4">
                    <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Resources</h4>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto pr-1">
                        {resources.length === 0 && (<p className="text-xs text-slate-500">No resources available.</p>)}
                        {resources.map((r:any) => (
                            <div key={r.id} className="flex items-center gap-2 bg-slate-800/60 border border-slate-700 rounded p-2">
                                <div className="w-6 h-6 flex items-center justify-center text-slate-300">{r.icon}</div>
                                <div className="text-xs">
                                    <p className="text-white font-semibold leading-tight">{r.name}</p>
                                    <p className="text-slate-400">Qty: {r.quantity ?? 0}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                    <button onClick={onClose} className="px-3 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded">
                        Close
                    </button>
                    <button disabled className="px-3 py-2 text-sm bg-purple-600/60 text-white rounded opacity-60 cursor-not-allowed" title="Coming soon">
                        Craft
                    </button>
                </div>
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

const FamilyPackModal = ({ isOpen, onClose, onPlayGame, party, friends, onProposeWager }: { isOpen: boolean; onClose: () => void; onPlayGame: (game: string) => void; party: string[]; friends: any[]; onProposeWager: (friendName: string, gameId: string) => void; }) => {
    if (!isOpen) return null;

    const eligibleFriends = (friends || []).filter((f: any) => party.includes(f.name));
    const [selectedFriend, setSelectedFriend] = React.useState<string>('');

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

                <div className="mb-4 bg-slate-800/60 border border-slate-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-white font-semibold">5 BDAG Wager</p>
                        <span className="text-[11px] text-slate-400">Friends in your group</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <select
                            className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white"
                            value={selectedFriend}
                            onChange={e => setSelectedFriend(e.target.value)}
                        >
                            <option value="">Select friend</option>
                            {eligibleFriends.map((f: any) => (
                                <option key={f.name} value={f.name}>{f.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => selectedFriend && onProposeWager(selectedFriend, 'family-pack')}
                            disabled={!selectedFriend}
                            className={`px-4 py-2 rounded bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-500 transition-colors disabled:opacity-50`}
                        >
                            Propose 5 BDAG wager
                        </button>
                    </div>
                    {eligibleFriends.length === 0 && (
                        <p className="text-[11px] text-amber-300 mt-2">Need a friend who is also in your group to wager.</p>
                    )}
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

// QR / Tap-to-Pay modal
const QrPaymentModal = ({ isOpen, onClose, onPayment, walletAddress, onConnectWallet, sendBdag }: any) => {
    const [merchant, setMerchant] = React.useState('');
    const [amount, setAmount] = React.useState('');
    const [status, setStatus] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!isOpen) {
            setMerchant(''); setAmount(''); setStatus(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handlePay = async () => {
        setStatus('Preparing transaction...');
        try {
            if (!walletAddress) {
                setStatus('Please connect your wallet');
                return;
            }
            // send on-chain transfer
            setStatus('Sending transaction to MetaMask...');
            await sendBdag(merchant, amount);
            setStatus('Transaction confirmed — payment sent');
            // update app receipts / balances via callback
            onPayment(parseFloat(amount), merchant || 'Merchant');
            setTimeout(() => {
                onClose();
            }, 1200);
        } catch (err: any) {
            setStatus('Payment failed: ' + (err?.message || 'Unknown error'));
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-900 rounded-xl w-full max-w-md p-4" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-2">Tap to Pay (BDAG)</h3>
                <label className="text-xs text-slate-400">Merchant Address</label>
                <input className="w-full bg-slate-800/60 p-2 rounded mt-1 mb-3" value={merchant} onChange={e => setMerchant(e.target.value)} placeholder="0x..." />
                <label className="text-xs text-slate-400">Amount (BDAG)</label>
                <input className="w-full bg-slate-800/60 p-2 rounded mt-1 mb-3" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 10" type="number" />

                {!walletAddress ? (
                    <div className="flex gap-2">
                        <button onClick={onConnectWallet} className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded">Connect Wallet</button>
                        <button onClick={onClose} className="flex-1 bg-slate-700 text-white py-2 rounded">Cancel</button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={handlePay} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded">Pay {amount || ''} BDAG</button>
                        <button onClick={onClose} className="flex-1 bg-slate-700 text-white py-2 rounded">Cancel</button>
                    </div>
                )}

                {status && <p className="text-sm text-slate-300 mt-3">{status}</p>}
            </div>
        </div>
    );
};
const TransactionsModal = ({ isOpen, onClose, receipts }: any) => {
    const [filterMode, setFilterMode] = React.useState<'all' | 'year' | 'month'>('all');
    const [selectedYear, setSelectedYear] = React.useState<string>('');
    const [selectedMonth, setSelectedMonth] = React.useState<string>('');

    React.useEffect(() => {
        if (!isOpen) {
            setFilterMode('all');
            setSelectedYear('');
            setSelectedMonth('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const years = Array.from(new Set(receipts.map((r: any) => new Date(r.date).getFullYear()))).sort((a: any, b: any) => b - a);
    const months = [
        'January','February','March','April','May','June','July','August','September','October','November','December'
    ];

    const filtered = receipts.filter((r: any) => {
        if (filterMode === 'all') return true;
        const d = new Date(r.date);
        if (filterMode === 'year') {
            if (!selectedYear) return true;
            return String(d.getFullYear()) === selectedYear;
        }
        if (filterMode === 'month') {
            if (!selectedYear && !selectedMonth) return true;
            const yearMatch = selectedYear ? String(d.getFullYear()) === selectedYear : true;
            const monthMatch = selectedMonth ? String(d.getMonth()) === selectedMonth : true;
            return yearMatch && monthMatch;
        }
        return true;
    });

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start md:items-center justify-center p-4 overflow-auto" onClick={onClose}>
            <div className="bg-slate-900 rounded-xl w-full max-w-2xl p-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold">Transactions</h3>
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-400">Filter</label>
                        <select className="bg-slate-800/60 text-sm p-1 rounded" value={filterMode} onChange={e => setFilterMode(e.target.value as any)}>
                            <option value="all">All time</option>
                            <option value="year">By year</option>
                            <option value="month">By month</option>
                        </select>
                    </div>
                </div>

                {filterMode === 'year' && (
                    <div className="flex gap-2 items-center mb-3">
                        <label className="text-xs text-slate-400">Year</label>
                        <select className="bg-slate-800/60 text-sm p-1 rounded" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                            <option value="">(All years)</option>
                            {years.map((y: any) => <option key={y} value={String(y)}>{y}</option>)}
                        </select>
                    </div>
                )}

                {filterMode === 'month' && (
                    <div className="flex gap-2 items-center mb-3">
                        <label className="text-xs text-slate-400">Month</label>
                        <select className="bg-slate-800/60 text-sm p-1 rounded" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
                            <option value="">(All months)</option>
                            {months.map((m, idx) => <option key={m} value={String(idx)}>{m}</option>)}
                        </select>
                        <label className="text-xs text-slate-400">Year</label>
                        <select className="bg-slate-800/60 text-sm p-1 rounded" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                            <option value="">(All years)</option>
                            {years.map((y: any) => <option key={y} value={String(y)}>{y}</option>)}
                        </select>
                    </div>
                )}

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-700 rounded">
                    {filtered.length === 0 ? (
                        <div className="p-4 text-center text-slate-400">No transactions for selected filter.</div>
                    ) : filtered.map((r: any) => (
                        <div key={r.id} className="p-3 flex items-center justify-between">
                            <div>
                                <div className="font-semibold text-sm">{r.merchant}</div>
                                <div className="text-xs text-slate-400">{new Date(r.date).toLocaleString()}</div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-white">{r.amount} BDAG</div>
                                <div className="text-xs text-slate-400">{r.items?.length ? `${r.items.length} items` : ''}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <button onClick={() => { setFilterMode('all'); setSelectedMonth(''); setSelectedYear(''); }} className="px-3 py-1 text-sm bg-slate-800 rounded">Reset</button>
                    <button onClick={onClose} className="px-4 py-1 bg-cyan-500 text-white rounded">Close</button>
                </div>
            </div>
        </div>
    );
};
const TaxModal = ({ isOpen, onClose, receipts, balance }: any) => {
    if (!isOpen) return null;

    // Normalize trades from receipts. Expect receipts that represent trades to include:
    // { id, action: 'buy'|'sell', token: 'BDAG', quantity: number, pricePerUnit: number, date }
    const trades = (receipts || []).filter((r: any) => r.action === 'buy' || r.action === 'sell');

    // Helper: parse date
    const toDate = (d: any) => new Date(d);

    // FIFO matching: match sells to earliest unmatched buys
    type Lot = { qty: number; price: number; date: Date; id?: string };
    const buyQueue: Lot[] = [];
    const breakdown: Array<any> = [];

    const sorted = trades.slice().sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (const t of sorted) {
        const date = toDate(t.date);
        const qty = Number(t.quantity || 0);
        const price = Number(t.pricePerUnit || 0);
        if (t.action === 'buy') {
            if (qty > 0) buyQueue.push({ qty, price, date, id: t.id });
        } else if (t.action === 'sell') {
            let remaining = qty;
            let sellPrice = price;
            while (remaining > 0 && buyQueue.length > 0) {
                const lot = buyQueue[0];
                const matched = Math.min(remaining, lot.qty);
                const gainPerUnit = sellPrice - lot.price;
                const gain = gainPerUnit * matched;
                const holdingDays = Math.floor((date.getTime() - lot.date.getTime()) / (1000 * 60 * 60 * 24));
                breakdown.push({
                    sellId: t.id,
                    buyId: lot.id,
                    token: t.token || 'BDAG',
                    qty: matched,
                    buyPrice: lot.price,
                    sellPrice: sellPrice,
                    gain,
                    holdingDays,
                    buyDate: lot.date.toISOString(),
                    sellDate: date.toISOString(),
                });
                // consume
                lot.qty -= matched;
                if (lot.qty <= 0) buyQueue.shift();
                remaining -= matched;
            }
            // If there are sells without matching buys, record as unmatched (treated as full gain on proceeds)
            if (remaining > 0) {
                const gain = sellPrice * remaining; // conservative: assume cost basis 0
                breakdown.push({
                    sellId: t.id,
                    buyId: null,
                    token: t.token || 'BDAG',
                    qty: remaining,
                    buyPrice: 0,
                    sellPrice: sellPrice,
                    gain,
                    holdingDays: 0,
                    buyDate: null,
                    sellDate: date.toISOString(),
                });
            }
        }
    }

    const shortTerm = breakdown.filter(b => b.holdingDays < 365).reduce((s, b) => s + b.gain, 0);
    const longTerm = breakdown.filter(b => b.holdingDays >= 365).reduce((s, b) => s + b.gain, 0);
    const totalGain = shortTerm + longTerm;

    const exportCsv = () => {
        const header = ['sellId','buyId','token','qty','buyPrice','sellPrice','gain','holdingDays','buyDate','sellDate'];
        const rows = breakdown.map(b => header.map(h => (b[h] ?? '')).join(','));
        const csv = [header.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'capital_gains.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    // Tax form generation
    const [selectedTaxYear, setSelectedTaxYear] = React.useState<string>('');
    const [showForm, setShowForm] = React.useState(false);

    // Tax rate configuration (percent)
    const [shortRatePct, setShortRatePct] = React.useState<number>(() => {
        try { const v = localStorage.getItem('taxRateShort'); return v ? parseFloat(v) : 35; } catch { return 35; }
    });
    const [longRatePct, setLongRatePct] = React.useState<number>(() => {
        try { const v = localStorage.getItem('taxRateLong'); return v ? parseFloat(v) : 15; } catch { return 15; }
    });

    React.useEffect(() => {
        try { localStorage.setItem('taxRateShort', String(shortRatePct)); localStorage.setItem('taxRateLong', String(longRatePct)); } catch (e) { /* ignore */ }
    }, [shortRatePct, longRatePct]);

    const availableYears = Array.from(new Set(breakdown.map((b: any) => new Date(b.sellDate).getFullYear()))).sort((a: any,b:any)=>b-a);
    React.useEffect(() => {
        if (!selectedTaxYear && availableYears.length > 0) setSelectedTaxYear(String(availableYears[0]));
    }, [availableYears]);

    const gainsForYear = (year: string) => breakdown.filter((b: any) => new Date(b.sellDate).getFullYear() === Number(year));

    const buildForm = (year: string) => {
        const entries = gainsForYear(year);
        const proceeds = entries.reduce((s:any,e:any)=>s + (e.sellPrice * e.qty), 0);
        const costBasis = entries.reduce((s:any,e:any)=>s + (e.buyPrice * e.qty), 0);
        const gainsShort = entries.filter((e:any)=>e.holdingDays<365).reduce((s:any,e:any)=>s+e.gain,0);
        const gainsLong = entries.filter((e:any)=>e.holdingDays>=365).reduce((s:any,e:any)=>s+e.gain,0);
        return {
            taxpayer: walletAddress || username || 'Unknown',
            taxYear: year,
            totalProceeds: proceeds,
            totalCostBasis: costBasis,
            totalGain: proceeds - costBasis,
            shortTerm: gainsShort,
            longTerm: gainsLong,
            entries
        };
    };

    const printForm = (formData: any) => {
        const w = window.open('', '_blank', 'noopener,noreferrer');
        if (!w) return;
        const html = `<!doctype html><html><head><meta charset="utf-8"><title>Mock Tax Form</title><style>body{font-family:Arial,Helvetica,sans-serif;background:#0f1724;color:#e6eef8;padding:24px} .card{background:#0b1220;padding:18px;border-radius:8px} h1{font-size:20px} table{width:100%;border-collapse:collapse} td,th{padding:8px;border-bottom:1px solid #1f2937}</style></head><body><div class="card"><h1>Mock Capital Gains Tax Form - ${formData.taxYear}</h1><p><strong>Taxpayer:</strong> ${formData.taxpayer}</p><table><tr><th>Item</th><th>Value</th></tr><tr><td>Total Proceeds</td><td>${formData.totalProceeds.toFixed(4)} BDAG</td></tr><tr><td>Total Cost Basis</td><td>${formData.totalCostBasis.toFixed(4)} BDAG</td></tr><tr><td>Total Gain</td><td>${formData.totalGain.toFixed(4)} BDAG</td></tr><tr><td>Short-term Gains</td><td>${formData.shortTerm.toFixed(4)} BDAG</td></tr><tr><td>Long-term Gains</td><td>${formData.longTerm.toFixed(4)} BDAG</td></tr></table><h3>Detail</h3><table><tr><th>Qty</th><th>Buy</th><th>Sell</th><th>Gain</th><th>Holding Days</th></tr>${formData.entries.map((e:any)=>`<tr><td>${e.qty}</td><td>${e.buyPrice.toFixed(4)}</td><td>${e.sellPrice.toFixed(4)}</td><td>${e.gain.toFixed(4)}</td><td>${e.holdingDays}</td></tr>`).join('')}</table></div></body></html>`;
        w.document.write(html);
        w.document.close();
        w.focus();
        w.print();
    };

    const downloadJson = (formData: any) => {
        const blob = new Blob([JSON.stringify(formData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tax_form_${formData.taxYear}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start md:items-center justify-center p-4 overflow-auto" onClick={onClose}>
            <div className="bg-slate-900 rounded-xl w-full max-w-3xl p-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold">Tax Summary</h3>
                    <div className="flex gap-2">
                        <button onClick={exportCsv} className="px-3 py-1 bg-slate-800 rounded text-sm">Export CSV</button>
                        <button onClick={onClose} className="px-3 py-1 bg-cyan-500 rounded text-sm text-white">Close</button>
                    </div>
                </div>

                {breakdown.length === 0 ? (
                    <div className="p-4 text-slate-400">No buy/sell trades found in your transaction history. Add trades with `action: 'buy'|'sell', quantity, pricePerUnit` to receipts for tax calculation.</div>
                ) : (
                    <div>
                        <div className="grid grid-cols-3 gap-4 mb-3">
                            <div className="bg-slate-800 p-3 rounded">
                                <div className="text-xs text-slate-400">Short-term Gains</div>
                                <div className="font-bold text-white">{shortTerm.toFixed(4)} BDAG</div>
                            </div>
                            <div className="bg-slate-800 p-3 rounded">
                                <div className="text-xs text-slate-400">Long-term Gains</div>
                                <div className="font-bold text-white">{longTerm.toFixed(4)} BDAG</div>
                            </div>
                            <div className="bg-slate-800 p-3 rounded">
                                <div className="text-xs text-slate-400">Total Gain</div>
                                <div className="font-bold text-white">{totalGain.toFixed(4)} BDAG</div>
                            </div>
                        </div>

                        <div className="mb-3 flex items-center gap-2">
                            <label className="text-xs text-slate-400">Tax Year</label>
                            <select className="bg-slate-800/60 text-sm p-1 rounded" value={selectedTaxYear} onChange={e=>setSelectedTaxYear(e.target.value)}>
                                <option value="">(All years summary)</option>
                                {availableYears.map((y:any)=>(<option key={y} value={String(y)}>{y}</option>))}
                            </select>
                            <button className="ml-auto px-3 py-1 bg-emerald-600 rounded text-sm text-white" onClick={()=>{ setShowForm(true); if(!selectedTaxYear && availableYears.length>0) setSelectedTaxYear(String(availableYears[0])); }}>Generate Form</button>
                        </div>

                        {showForm && (
                            (() => {
                                const year = selectedTaxYear || String(availableYears[0] || new Date().getFullYear());
                                const formData = buildForm(year);
                                return (
                                    <div className="bg-slate-800 p-3 rounded mb-3">
                                        <h4 className="font-bold">Mock Tax Form — {formData.taxYear}</h4>
                                        <div className="grid grid-cols-2 gap-4 mt-2">
                                            <div>
                                                <div className="text-xs text-slate-400">Taxpayer</div>
                                                <div className="font-semibold">{formData.taxpayer}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-400">Reporting Year</div>
                                                <div className="font-semibold">{formData.taxYear}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-400">Total Proceeds</div>
                                                <div className="font-semibold">{formData.totalProceeds.toFixed(4)} BDAG</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-400">Total Cost Basis</div>
                                                <div className="font-semibold">{formData.totalCostBasis.toFixed(4)} BDAG</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-400">Short-term Gain</div>
                                                <div className="font-semibold">{formData.shortTerm.toFixed(4)} BDAG</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-400">Long-term Gain</div>
                                                <div className="font-semibold">{formData.longTerm.toFixed(4)} BDAG</div>
                                            </div>
                                        </div>

                                        <div className="mt-3 grid grid-cols-3 gap-3 items-end">
                                            <div>
                                                <div className="text-xs text-slate-400">Short-term tax rate (%)</div>
                                                <input id="shortRatePct" name="shortRatePct" type="number" min="0" step="0.1" className="w-full bg-slate-700 p-1 rounded mt-1 text-sm" value={shortRatePct} onChange={e=>setShortRatePct(parseFloat(e.target.value||'0'))} />
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-400">Long-term tax rate (%)</div>
                                                <input id="longRatePct" name="longRatePct" type="number" min="0" step="0.1" className="w-full bg-slate-700 p-1 rounded mt-1 text-sm" value={longRatePct} onChange={e=>setLongRatePct(parseFloat(e.target.value||'0'))} />
                                            </div>
                                            <div className="bg-slate-900 p-2 rounded">
                                                <div className="text-xs text-slate-400">Estimated Tax Due</div>
                                                <div className="font-bold">{((formData.shortTerm * (shortRatePct/100)) + (formData.longTerm * (longRatePct/100))).toFixed(4)} BDAG</div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 justify-end mt-3">
                                            <button onClick={()=>printForm(formData)} className="px-3 py-1 bg-blue-600 rounded text-sm text-white">Print Form</button>
                                            <button onClick={()=>downloadJson(formData)} className="px-3 py-1 bg-slate-700 rounded text-sm">Download JSON</button>
                                        </div>
                                    </div>
                                );
                            })()
                        )}

                        <div className="max-h-80 overflow-y-auto divide-y divide-slate-700 rounded">
                            {breakdown.map((b, idx) => (
                                <div key={idx} className="p-3 flex items-center justify-between">
                                    <div>
                                        <div className="font-semibold text-sm">{b.token} — {b.qty} units</div>
                                        <div className="text-xs text-slate-400">Bought: {b.buyDate ? new Date(b.buyDate).toLocaleDateString() : '—'} • Sold: {new Date(b.sellDate).toLocaleDateString()}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm">Gain: <span className="font-bold">{b.gain.toFixed(4)} BDAG</span></div>
                                        <div className="text-xs text-slate-400">Holding: {b.holdingDays} days</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
const DAOModal = ({ isOpen, onClose, isPremium }: any) => { if(!isOpen) return null; return null; };
const JoustingModeModal = ({ isOpen, onClose }: any) => { if(!isOpen) return null; return null; };
const LevelRewardsModal = ({ isOpen, onClose, currentLevel }: any) => { if(!isOpen) return null; return null; };
const PremiumModal = ({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: (plan: 'monthly' | 'annual') => void; }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[210] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-900 border border-amber-500/20 rounded-2xl shadow-2xl max-w-lg w-full p-6 relative overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
                <div className="flex items-center justify-between mb-3 relative z-10">
                    <div>
                        <p className="text-xs text-amber-400 font-bold uppercase tracking-[0.2em]">Premium Access</p>
                        <h3 className="text-2xl font-bold text-white">Unlock the full X Series</h3>
                        <p className="text-sm text-slate-300">$10/mo or $100/yr (2 months free)</p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white">
                        <XMarkIcon className="w-5 h-5" />
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
                        onClick={() => onConfirm('monthly')}
                        className="flex-1 px-4 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/30 transition-colors"
                    >
                        Activate $10/mo
                    </button>
                    <button
                        onClick={() => onConfirm('annual')}
                        className="flex-1 px-4 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/30 transition-colors"
                    >
                        Activate $100/yr (best value)
                    </button>
                </div>
            </div>
        </div>
    );
};

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

const FriendsPanel = ({ friends, party, user }: any) => {
    return (
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-24 space-y-6">
            {/* TEAM BUFFS: Group Slots */}
            <div>
                <GroupSlots handle={user} />
            </div>

            {/* FRIENDS LIST */}
            <div>
                <h3 className="text-lg font-bold text-indigo-300 mb-3">Friends ({friends.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {friends.map((friend: any) => (
                        <div key={friend.id} className="bg-[var(--bg-panel)] p-2.5 rounded-lg flex items-center justify-between border border-[var(--border-color)]">
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${friend.isBlockdagFriend ? 'bg-indigo-600' : 'bg-slate-600'}`}>
                                    {friend.name[0]}
                                </div>
                                <div>
                                    <p className="font-semibold text-xs text-white">{friend.name}</p>
                                    <div className="flex items-center gap-1">
                                        <div className={`w-2 h-2 rounded-full ${friend.status === 'online' ? 'bg-green-500' : 'bg-slate-500'}`}></div>
                                        <span className="text-xs text-slate-400 capitalize">{friend.status}</span>
                                    </div>
                                </div>
                            </div>
                            {friend.isBlockdagFriend && (
                                <div className="bg-indigo-500/20 p-1 rounded" title="BlockDAG User">
                                    <BlockDAGIcon className="w-3 h-3 text-indigo-400" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ProfilePanel = ({ user, badges, tasks, friends, watchData, party, onClaimTask, onClaimBadge, claimedXpInfo, onOpenLevelRewards, isPremium, onActivatePremium, onEditProfile, onNewProfile, onOpenSmartWatch, connectedWatch, bdagBalance, onOpenWallet, walletAddress, onLogout }: any) => {
    const [showProfileMenu, setShowProfileMenu] = React.useState(false);
    const [showEditModal, setShowEditModal] = React.useState(false);
    const [showNewModal, setShowNewModal] = React.useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
    const [showAvatarCustomizer, setShowAvatarCustomizer] = React.useState(false);
    const [editName, setEditName] = React.useState<string>(user || '');
    const [editBio, setEditBio] = React.useState<string>('');
    const [editEmail, setEditEmail] = React.useState<string>('');
    const [editLocation, setEditLocation] = React.useState<string>('');
    const [editAvatarUrl, setEditAvatarUrl] = React.useState<string | null>(null);
    const [newName, setNewName] = React.useState<string>('');
    const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
    const [avatarModelData, setAvatarModelData] = React.useState<string | null>(null); // 3D model data
    const videoRef = React.useRef<HTMLVideoElement | null>(null);
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
    const [streamActive, setStreamActive] = React.useState(false);
    const [capturedDataUrl, setCapturedDataUrl] = React.useState<string | null>(null);
    const [pixelStreamingUrl, setPixelStreamingUrl] = React.useState<string>('http://localhost:3001');
    const [ue5HeadshotDataUrl, setUe5HeadshotDataUrl] = React.useState<string | null>(null);
    const [isGeneratingAvatar, setIsGeneratingAvatar] = React.useState(false);
    const [avatarGenerationError, setAvatarGenerationError] = React.useState<string | null>(null);

    React.useEffect(() => { 
        setEditName(user || '');
        try {
            const storedBio = localStorage.getItem(`profileBio:${user}`);
            const storedEmail = localStorage.getItem(`profileEmail:${user}`);
            const storedLocation = localStorage.getItem(`profileLocation:${user}`);
            setEditBio(storedBio || '');
            setEditEmail(storedEmail || '');
            setEditLocation(storedLocation || '');
        } catch (e) { console.error(e); }
    }, [user]);

    const openEdit = () => { 
        setShowProfileMenu(false); 
        setEditAvatarUrl(avatarUrl);
        setUe5HeadshotDataUrl(null);
        setShowEditModal(true); 
    };
    const openNew = () => { 
        setShowProfileMenu(false); 
        setUe5HeadshotDataUrl(null);
        setAvatarModelData(null);
        setAvatarGenerationError(null);
        setNewName('');
        setShowAvatarCustomizer(true);
    };

    const handleAvatarCreated = (avatarData: AvatarData) => {
        // Store avatar settings as JSON string
        const avatarSettings = JSON.stringify(avatarData);
        setAvatarModelData(avatarSettings);
        setShowAvatarCustomizer(false);
    };

    const saveEdit = () => {
        try { 
            onEditProfile?.(editName);
            // Save personal info
            localStorage.setItem(`profileBio:${editName}`, editBio);
            localStorage.setItem(`profileEmail:${editName}`, editEmail);
            localStorage.setItem(`profileLocation:${editName}`, editLocation);
            // Save avatar if updated
            if (editAvatarUrl) {
                localStorage.setItem(`profileAvatar:${editName}`, editAvatarUrl);
                setAvatarUrl(editAvatarUrl);
            }
        } catch (e) { console.error(e); }
        setShowEditModal(false);
    };
    const saveNew = () => {
        try {
            onNewProfile?.(newName);
            // persist avatar customizer settings for this profile
            if (avatarModelData) {
                try { localStorage.setItem(`profileAvatarSettings:${newName}`, avatarModelData); } catch (e) { console.error(e); }
            }
        } catch (e) { }
        setNewName('');
        setAvatarModelData(null);
        setAvatarGenerationError(null);
        setShowNewModal(false);
    };

    const generateAvatarFrom3D = async () => {
        if (!ue5HeadshotDataUrl) {
            setAvatarGenerationError('Please upload a headshot first');
            return;
        }
        
        setIsGeneratingAvatar(true);
        setAvatarGenerationError(null);
        
        try {
            // Extract base64 from data URL if needed
            let imageData = ue5HeadshotDataUrl;
            if (imageData.startsWith('data:')) {
                imageData = imageData.split(',')[1];
            }
            
            // Call avatar service to generate 3D avatar from photo
            const response = await avatarService.generateAvatarFromPhoto(imageData);
            
            if (response.success && response.modelData) {
                // Check if this is mock mode (no API key configured)
                if (response.isMockMode || response.modelData === 'MOCK_PLACEHOLDER') {
                    setAvatarGenerationError('Mock mode: Add VITE_AVATURN_API_KEY to generate real avatars. Using photo as preview.');
                    // In mock mode, use the photo as the avatar instead
                    setAvatarUrl(ue5HeadshotDataUrl);
                    setAvatarModelData(null); // Don't try to load 3D model
                } else {
                    setAvatarModelData(response.modelData);
                    // Also save static image for preview
                    setAvatarUrl(ue5HeadshotDataUrl);
                }
            } else {
                setAvatarGenerationError(response.error || 'Failed to generate avatar');
            }
        } catch (error: any) {
            setAvatarGenerationError(error.message || 'Avatar generation failed');
            console.error('Avatar generation error:', error);
        } finally {
            setIsGeneratingAvatar(false);
        }
    };

    const startStream = async () => {
        try {
            const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
            if (videoRef.current) {
                videoRef.current.srcObject = s;
                // play may reject in some contexts; swallow error
                try { await videoRef.current.play(); } catch {}
                setStreamActive(true);
            }
        } catch (err) {
            console.error('Camera start failed', err);
        }
    };

    const stopStream = () => {
        try {
            const stream = videoRef.current?.srcObject as MediaStream | null;
            if (stream) {
                stream.getTracks().forEach(t => t.stop());
            }
            if (videoRef.current) videoRef.current.srcObject = null;
        } catch (e) {
            console.error(e);
        } finally {
            setStreamActive(false);
        }
    };

    const capturePhoto = () => {
        try {
            const video = videoRef.current;
            if (!video) return;
            const canvas = canvasRef.current || document.createElement('canvas');
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 640;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            // draw center square crop
            const size = Math.min(canvas.width, canvas.height);
            const sx = (canvas.width - size) / 2;
            const sy = (canvas.height - size) / 2;
            ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
            const dataUrl = canvas.toDataURL('image/png');
            setCapturedDataUrl(dataUrl);
        } catch (e) {
            console.error('capture failed', e);
        }
    };

    const handleHeadshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                setUe5HeadshotDataUrl(result);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error('avatar upload failed', err);
        }
    };

    const handleEditAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                setEditAvatarUrl(result);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error('avatar upload failed', err);
        }
    };

    const handleMetaHumanGLBUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            
            // Validate it's a .glb file
            if (!file.name.endsWith('.glb') && file.type !== 'application/octet-stream') {
                setAvatarGenerationError('Please upload a .glb file from MetaHuman Creator');
                return;
            }

            const reader = new FileReader();
            reader.onload = async () => {
                const result = reader.result as string;
                setIsGeneratingAvatar(true);
                setAvatarGenerationError(null);
                
                try {
                    // Validate the GLB file
                    const validation = await avatarService.validateMetaHumanExport(result);
                    if (validation.success && validation.modelData) {
                        setAvatarModelData(validation.modelData);
                        // Also set a preview thumbnail
                        setAvatarUrl(null);
                        setAvatarGenerationError(null);
                    } else {
                        setAvatarGenerationError(validation.error || 'Invalid GLB file');
                    }
                } catch (error: any) {
                    setAvatarGenerationError(error.message || 'Failed to load MetaHuman export');
                } finally {
                    setIsGeneratingAvatar(false);
                }
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error('MetaHuman upload failed', err);
            setAvatarGenerationError('Failed to upload MetaHuman export');
        }
    };

    React.useEffect(() => {
        // load avatar for current user
        try {
            const storedSettings = localStorage.getItem(`profileAvatarSettings:${user}`);
            if (storedSettings) setAvatarModelData(storedSettings);
            else setAvatarModelData(null);
        } catch (e) { console.error(e); }
    }, [user]);

    return (
        <div className="p-4 md:p-6 animate-fadeIn overflow-y-auto">
            {/* WALLET BUTTON */}
            <div className="mb-4">
                <button
                    onClick={onOpenWallet}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300"
                >
                    <WalletIcon className="w-4 h-4" />
                    <span className="text-sm font-semibold">Wallet</span>
                    {walletAddress && (
                        <span className="ml-2 text-[10px] font-mono text-green-400">
                            {walletAddress.slice(0, 4)}...{walletAddress.slice(-3)}
                        </span>
                    )}
                </button>
            </div>

            {/* HEADER: Picture, Name, XP Bar */}
            <div className="flex flex-col items-center gap-4 mb-6 pb-4 border-b border-slate-700/50">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:justify-between">
                    {/* Avatar Section */}
                    <div className="flex-shrink-0 relative">
                        {/* Show 3D Avatar Preview if we have JSON avatar settings, otherwise show static image */}
                        {avatarModelData && avatarModelData.startsWith('{') ? (
                            (() => {
                                try {
                                    const settings = JSON.parse(avatarModelData) as AvatarData;
                                    return (
                                        <Avatar3DPreview 
                                            avatarSettings={settings}
                                            size="medium"
                                            autoRotate={true}
                                        />
                                    );
                                } catch {
                                    // If parsing fails, show fallback
                                    return (
                                        <div className="w-20 h-20 bg-slate-700 rounded-full overflow-hidden border-4 border-cyan-500 shadow-lg shadow-cyan-500/20">
                                            {avatarUrl ? (
                                                <img src={avatarUrl} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                                                    <ProfileIcon className="w-12 h-12" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                }
                            })()
                        ) : avatarModelData ? (
                            <AvatarViewer 
                                modelData={avatarModelData}
                                size="medium"
                                isLoading={false}
                                onError={(err) => console.error('Avatar viewer error:', err)}
                            />
                        ) : (
                            <div className="w-20 h-20 bg-slate-700 rounded-full overflow-hidden border-4 border-cyan-500 shadow-lg shadow-cyan-500/20">
                                {avatarUrl ? (
                                    <img src={avatarUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                                        <ProfileIcon className="w-12 h-12" />
                                    </div>
                                )}
                            </div>
                        )}
                        {/* Edit controls relocated to header actions for clarity */}

                        {showEditModal && (
                            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={()=>setShowEditModal(false)}>
                                <div className="bg-slate-900 rounded-xl w-full max-w-xl p-4 max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
                                    <h3 className="text-lg font-bold mb-3">Edit Profile</h3>
                                    
                                    {/* Avatar Section */}
                                    <div className="mb-4 bg-slate-800/50 p-3 rounded">
                                        <label className="text-xs text-slate-400 block mb-2">Avatar</label>
                                        <div className="flex items-center gap-3">
                                            {editAvatarUrl ? (
                                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-500">
                                                    <img src={editAvatarUrl} className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-500 bg-slate-800 flex items-center justify-center">
                                                    <ProfileIcon className="w-8 h-8 text-slate-500" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <input id="avatarUpload" name="avatarUpload" type="file" accept="image/*" onChange={handleEditAvatarUpload} className="w-full text-xs" />
                                                <p className="text-[10px] text-slate-400 mt-1">Upload UE5 exported headshot (PNG/JPG)</p>
                                            </div>
                                        </div>
                                        {editAvatarUrl && (
                                            <button onClick={()=>setEditAvatarUrl(null)} className="mt-2 text-xs text-red-400 hover:text-red-300">Remove Avatar</button>
                                        )}
                                    </div>

                                    {/* Display Name */}
                                    <div className="mb-3">
                                        <label className="text-xs text-slate-400 block mb-1">Display Name</label>
                                        <input id="editName" name="editName" type="text" className="w-full bg-slate-800/60 p-2 rounded" value={editName} onChange={e=>setEditName(e.target.value)} />
                                    </div>

                                    {/* Bio */}
                                    <div className="mb-3">
                                        <label className="text-xs text-slate-400 block mb-1">Bio</label>
                                        <textarea id="editBio" name="editBio" className="w-full bg-slate-800/60 p-2 rounded h-20 resize-none" value={editBio} onChange={e=>setEditBio(e.target.value)} placeholder="Tell us about yourself..." />
                                    </div>

                                    {/* Email */}
                                    <div className="mb-3">
                                        <label className="text-xs text-slate-400 block mb-1">Email</label>
                                        <input id="editEmail" name="editEmail" type="email" className="w-full bg-slate-800/60 p-2 rounded" value={editEmail} onChange={e=>setEditEmail(e.target.value)} placeholder="your@email.com" />
                                    </div>

                                    {/* Location */}
                                    <div className="mb-4">
                                        <label className="text-xs text-slate-400 block mb-1">Location</label>
                                        <input id="editLocation" name="editLocation" type="text" className="w-full bg-slate-800/60 p-2 rounded" value={editLocation} onChange={e=>setEditLocation(e.target.value)} placeholder="City, Country" />
                                    </div>

                                    <div className="flex gap-2 justify-end">
                                        <button onClick={()=>setShowEditModal(false)} className="px-3 py-1 bg-slate-700 rounded">Cancel</button>
                                        <button onClick={saveEdit} className="px-3 py-1 bg-cyan-500 text-white rounded">Save</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showNewModal && (
                            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={()=>{ setAvatarGenerationError(null); setShowNewModal(false); }}>
                                <div className="bg-slate-900 rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
                                    <h3 className="text-xl font-bold mb-1 text-white">✨ Create New Profile</h3>
                                    <p className="text-xs text-slate-400 mb-4">Enter your profile name to get started</p>

                                    {/* Profile Name */}
                                    <div className="mb-4">
                                        <label className="text-xs font-semibold text-slate-300 block mb-2">Profile Name</label>
                                        <input 
                                            className="w-full bg-slate-800/60 p-2 rounded text-white placeholder-slate-500" 
                                            value={newName} 
                                            onChange={e=>setNewName(e.target.value)} 
                                            placeholder="Enter your profile name"
                                        />
                                    </div>

                                    {/* Open Customizer Button */}
                                    <button
                                        onClick={() => setShowAvatarCustomizer(true)}
                                        disabled={!newName}
                                        className="w-full px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 mb-4"
                                    >
                                        🎨 Customize Avatar
                                    </button>

                                    {/* Avatar Status */}
                                    {avatarModelData && (
                                        <div className="bg-emerald-500/20 border border-emerald-500/50 rounded p-3 mb-4">
                                            <p className="text-xs text-emerald-300 text-center">✓ Avatar Customized!</p>
                                        </div>
                                    )}

                                    {/* Error Display */}
                                    {avatarGenerationError && (
                                        <div className="w-full bg-red-500/20 border border-red-500/50 rounded p-2 text-xs text-red-300 mb-4">
                                            ⚠️ {avatarGenerationError}
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 justify-end">
                                        <button 
                                            onClick={()=>{ setAvatarGenerationError(null); setShowNewModal(false); }} 
                                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={saveNew} 
                                            disabled={!newName || !avatarModelData}
                                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all"
                                        >
                                            Create Profile
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Avatar Customizer Modal */}
                        {showAvatarCustomizer && (
                            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
                                <div onClick={e=>e.stopPropagation()}>
                                    <SmartAvatarGenerator
                                        onAvatarCreate={handleAvatarCreated}
                                        onCancel={() => setShowAvatarCustomizer(false)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Name, Level, XP Info */}
                    <div className="flex-grow text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                            <h2 className="text-2xl font-bold text-white">{user}</h2>
                            {isPremium && (
                                <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded">PREMIUM</span>
                            )}
                        </div>
                        <p className="text-sm text-slate-400 mb-2">Level {Math.floor(watchData.xp / 1000) + 1} • <span className="text-cyan-400 font-mono">{watchData.xp} XP</span></p>
                        
                        {/* XP Progress Bar */}
                        <div className="w-full max-w-xs mx-auto sm:mx-0 bg-slate-800/50 rounded-full h-2 overflow-hidden border border-slate-700/50">
                            <div 
                                className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${(watchData.xp % 1000) / 10}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <button 
                            onClick={openEdit}
                            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded flex items-center gap-1 whitespace-nowrap"
                        >
                            <PencilIcon className="w-3 h-3" />
                            Edit Profile
                        </button>
                        <button 
                            onClick={openNew}
                            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded whitespace-nowrap"
                        >
                            New Profile
                        </button>
                        {!isPremium && (
                            <button 
                                onClick={onActivatePremium}
                                className="text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/50 px-2.5 py-1.5 rounded transition-colors whitespace-nowrap"
                            >
                                Premium
                            </button>
                        )}
                        <button 
                            onClick={onOpenSmartWatch}
                            className={`text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded border transition-all whitespace-nowrap ${connectedWatch ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                        >
                            <SmartWatchIcon className="w-3 h-3" />
                            <span className="font-bold">{connectedWatch ? 'Connected' : 'Watch'}</span>
                        </button>
                        <button 
                            onClick={() => setShowLogoutConfirm(true)}
                            className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50 px-2.5 py-1.5 rounded transition-colors whitespace-nowrap flex items-center gap-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* STATS ROW: Quick stats */}
            <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl p-3 mb-6">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <SmartWatchIcon className="w-4 h-4 text-cyan-400" />
                        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">How ya feeling?</p>
                    </div>
                    <span className="text-[11px] text-slate-500">Daily snapshot</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2">
                        <p className="text-[11px] text-slate-400 flex items-center gap-1"><SmartWatchIcon className="w-3 h-3 text-green-400" />Steps</p>
                        <p className="text-base font-mono font-bold text-white leading-tight">{watchData.steps.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2">
                        <p className="text-[11px] text-slate-400 flex items-center gap-1"><QuestsIcon className="w-3 h-3 text-blue-400" />Sleep</p>
                        <p className="text-base font-mono font-bold text-white leading-tight">{watchData.sleepScore || 0}%</p>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2">
                        <p className="text-[11px] text-slate-400 flex items-center gap-1"><QuestsIcon className="w-3 h-3 text-amber-400" />Stairs</p>
                        <p className="text-base font-mono font-bold text-white leading-tight">{watchData.stairs?.toLocaleString?.() || watchData.stairs || 0}</p>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2">
                        <p className="text-[11px] text-slate-400 flex items-center gap-1"><QuestsIcon className="w-3 h-3 text-red-400" />Calories</p>
                        <p className="text-base font-mono font-bold text-white leading-tight">{watchData.calories?.toLocaleString?.() || watchData.calories || 0}</p>
                    </div>
                </div>
            </div>

            {/* VITALS & AVATAR: Side-by-side layout */}
            <div className="mb-6 grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Vitals - Shrunk to left side */}
                <div className="lg:col-span-1">
                    <div className="bg-gradient-to-r from-slate-900 via-slate-900/80 to-slate-950 border border-slate-800 rounded-xl p-3 h-full">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <HeartIcon className="w-3.5 h-3.5 text-red-400" />
                                <p className="text-[10px] text-slate-300 font-semibold uppercase tracking-[0.1em]">Vitals</p>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            {(() => {
                                const vitals = [
                                    { label: 'Health', valueText: '100/100 HP', percent: 100, barClass: 'bg-red-500/80', icon: <HeartIcon className="w-3 h-3 text-red-300" /> },
                                    { label: 'Armor', valueText: '0 DEF', percent: 0, barClass: 'bg-blue-400/80', icon: <ShieldIcon className="w-3 h-3 text-blue-300" /> },
                                    { label: 'Speed', valueText: '0% SPD', percent: 0, barClass: 'bg-yellow-400/80', icon: <span className="text-yellow-300 text-[10px] font-bold">⚡</span> },
                                ];
                                return vitals.map(v => (
                                    <div key={v.label} className="space-y-0.5">
                                        <div className="flex items-center justify-between text-[9px] text-slate-300">
                                            <div className="flex items-center gap-1">
                                                {v.icon}
                                                <span className="font-semibold uppercase">{v.label}</span>
                                            </div>
                                            <span className="font-mono text-slate-200 text-[8px]">{v.valueText}</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-slate-900/70 border border-slate-800 overflow-hidden">
                                            <div className={`${v.barClass} h-full`} style={{ width: `${Math.min(100, Math.max(0, v.percent))}%` }}></div>
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </div>

                {/* Full Body Avatar - Right side */}
                <div className="lg:col-span-3">
                    {avatarModelData && avatarModelData.startsWith('{') ? (
                        (() => {
                            try {
                                const settings = JSON.parse(avatarModelData) as AvatarData;
                                return (
                                    <FullBodyAvatar 
                                        avatarSettings={settings}
                                        size="small"
                                        autoRotate={true}
                                    />
                                );
                            } catch {
                                return (
                                    <div className="rounded-lg border-2 border-cyan-500/50 h-96 flex items-center justify-center bg-slate-900/50">
                                        <p className="text-slate-400 text-sm">Avatar not available</p>
                                    </div>
                                );
                            }
                        })()
                    ) : (
                        <div className="rounded-lg border-2 border-cyan-500/50 h-96 flex items-center justify-center bg-slate-900/50">
                            <p className="text-slate-400 text-sm">Create avatar to see preview</p>
                        </div>
                    )}
                </div>
            </div>

            {/* GEAR & STATS: Compact 2-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                {/* Active Gear - smaller */}
                <div className="bg-[var(--bg-panel)]/60 rounded-lg p-3 border border-[var(--border-color)]">
                    <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase">Gear</h3>
                    <div className="flex flex-wrap gap-2">
                        <EquipmentSlot label="Head" icon={<HelmIcon className="w-5 h-5 text-cyan-300" />} className="flex-1 min-w-[60px]" />
                        <EquipmentSlot label="Chest" icon={<ChestIcon className="w-5 h-5 text-purple-300" />} className="flex-1 min-w-[60px]" />
                        <EquipmentSlot label="Gloves" icon={<GlovesIcon className="w-5 h-5 text-yellow-300" />} className="flex-1 min-w-[60px]" />
                        <EquipmentSlot label="Legs" icon={<LegsIcon className="w-5 h-5 text-blue-300" />} className="flex-1 min-w-[60px]" />
                        <EquipmentSlot label="Boots" icon={<BootsIcon className="w-5 h-5 text-orange-300" />} className="flex-1 min-w-[60px]" />
                    </div>
                </div>

                {/* Stats - compact grid */}
                <div className="lg:col-span-2 bg-[var(--bg-panel)]/60 rounded-lg p-3 border border-[var(--border-color)]">
                    <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase">Stats</h3>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5">
                        {(() => {
                           const calculateBonus = (value: number, tier1: number, tier2: number) => {
                              if (value >= tier2) return 2; if (value >= tier1) return 1; return 0;
                           };
                           const calculateIntBonus = () => {
                              const t1 = tasks?.find((t:any) => t.id === 'daily-game-1')?.isClaimed; 
                              const t3 = tasks?.find((t:any) => t.id === 'daily-game-3')?.isClaimed; 
                              let b = 0; if (t1) b += 1; if (t3) b += 1; return b;
                           };
                           const bonuses = {
                              STR: calculateBonus(watchData?.stairs || 0, 10, 20),
                              DEX: calculateBonus(watchData?.steps || 0, 5000, 10000),
                              CON: calculateBonus(watchData?.sleepScore || 0, 70, 85),
                              INT: calculateIntBonus(),
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
                           return stats.map((stat:any) => (
                             <div key={stat.label} className="relative group flex flex-col items-center justify-center gap-0.5 bg-slate-900/60 px-2 py-1.5 rounded border border-slate-700/50 hover:bg-slate-800/80 transition-colors cursor-help">
                                <span className="font-bold text-slate-400 text-xs">{stat.label}</span>
                                <div className="flex items-center gap-0.5">
                                    <span className={`font-mono font-bold text-sm ${stat.bonus > 0 ? 'text-green-400' : 'text-slate-200'}`}>{stat.value}</span>
                                    {stat.bonus > 0 && <span className="text-[9px] text-green-500 font-bold">+{stat.bonus}</span>}
                                </div>
                                {stat.source !== '-' && (
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-xs p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-slate-700">
                                    <p className="font-bold">{stat.source}</p>
                                    <p className="text-slate-400 text-[11px]">{stat.metric}</p>
                                    {stat.bonus > 0 ? <p className="text-green-400 text-[11px]">+{stat.bonus} bonus</p> : <p className="text-slate-500 text-[11px]">-</p>}
                                  </div>
                                )}
                             </div>
                           ));
                        })()}
                    </div>
                </div>
            </div>

            {/* TASKS & BADGES: Side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div>
                     <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-bold text-cyan-300">Daily Tasks</h3>
                        <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">4h 12m left</span>
                     </div>
                     <div className="space-y-2">
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
                    <h3 className="text-lg font-bold text-yellow-300 mb-3">Badges</h3>
                    <BadgesView badges={badges} onClaimBadge={onClaimBadge} />
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4" onClick={() => setShowLogoutConfirm(false)}>
                    <div className="bg-slate-900 border border-red-500/30 rounded-xl w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-white">Confirm Logout</h3>
                        </div>
                        
                        <p className="text-slate-300 mb-6">Are you sure you want to logout? You'll need to sign in again to access your account.</p>
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    setShowLogoutConfirm(false);
                                    onLogout?.();
                                }}
                                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default function App() {
    // IMPORTANT: All hooks MUST be called unconditionally at the top
    // Do NOT use early returns before declaring all hooks
    
    useEffect(() => {
        console.log('App mounted');
        
        // Handle Fitbit OAuth callback
        const handleFitbitCallback = async () => {
          // Remove hash fragment (#_=_) that Fitbit might add
          if (window.location.hash) {
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
          }
          
          const params = new URLSearchParams(window.location.search);
          const code = params.get('code');
          const state = params.get('state');
          const error = params.get('error');
          
          if (code && state) {
            console.log('Fitbit OAuth callback detected, exchanging code for token...');
            try {
              const success = await fitbitService.handleOAuthCallback(code, state);
              if (success) {
                console.log('✓ Fitbit authentication successful!');
                // Clean up the URL
                window.history.replaceState({}, document.title, window.location.pathname);
                // Show success message
                alert('Fitbit connected successfully! You can now sync your health data.');
              } else {
                console.error('Fitbit OAuth callback failed');
                alert('Failed to connect Fitbit. Please try again.');
              }
            } catch (err) {
              console.error('Error handling Fitbit callback:', err);
              alert('Error connecting to Fitbit. Please try again.');
            }
          } else if (error) {
            console.error('Fitbit OAuth error:', error);
            alert(`Fitbit connection failed: ${error}`);
          }
        };
        
        handleFitbitCallback();
    }, []);
    
    // Auto-sync Fitbit data every 30 seconds
    useEffect(() => {
      const syncFitbitData = async () => {
        if (fitbitService.isAuthenticated()) {
          try {
            const data = await fitbitService.getTodayHealthData();
            if (data) {
              setWatchData(prev => ({
                ...prev,
                steps: data.steps || prev.steps,
                stairs: data.stairs || prev.stairs,
                sleepScore: data.sleepScore || prev.sleepScore,
                calories: data.calories || prev.calories
              }));
              console.log('✓ Fitbit data synced:', data);
            }
          } catch (err) {
            console.error('Error syncing Fitbit data:', err);
          }
        }
      };
      
      // Sync immediately on mount if authenticated
      syncFitbitData();
      
      // Then sync every 30 seconds
      const interval = setInterval(syncFitbitData, 30000);
      return () => clearInterval(interval);
    }, []);
    
    // Auth state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [username, setUsername] = useState('Guest');
    
    // View and UI state
    const [activeView, setActiveView] = useState<ActiveView>('profile');
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
    const [wagerRequest, setWagerRequest] = useState<null | { game: string; from: string; to: string; amount: number; status: 'pending' | 'accepted' | 'declined'; initiator: 'self' | 'friend' }>(null);
    const [showCityBldr, setShowCityBldr] = useState(false);
    const [showCraftModal, setShowCraftModal] = useState(false);
    
    // Lifted state
    const [raffleTickets, setRaffleTickets] = useState(5);
    const [connectedWatch, setConnectedWatch] = useState<string | null>(null);
    
    // Games state
    const [activeGame, setActiveGame] = useState<'hearts' | 'trivia' | 'sketchit' | 'uno' | 'citybldr' | null>(null);
    
    // Data state - declare ALL useState before any conditional code
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
        { id: '1', name: 'Building', quantity: 5, icon: <IronIcon />, type: 'resource' },
        { id: '2', name: 'Equipment', quantity: 12, icon: <WoodIcon />, type: 'resource' },
        { id: '4', name: 'Blue Template', quantity: 1, icon: <TemplateIcon className="w-10 h-10 text-blue-400" />, type: 'template' },
        { id: '5', name: 'Purple Template', quantity: 1, icon: <TemplateIcon className="w-10 h-10 text-purple-400" />, type: 'template' },
        { id: '6', name: 'Orange Template', quantity: 1, icon: <TemplateIcon className="w-10 h-10 text-orange-400" />, type: 'template' },
        { id: '7', name: 'Prism', quantity: 100, icon: <PrismIcon />, type: 'universal' },
        // Backpack Equipment - Purple Tier
        { id: 'helm-iron-purple', name: 'Iron Helm (Purple)', quantity: 1, icon: <HelmIcon />, type: 'equipment', rarity: 'common' },
        { id: 'chest-plate-purple', name: 'Steel Breastplate (Purple)', quantity: 1, icon: <ChestIcon />, type: 'equipment', rarity: 'uncommon' },
        { id: 'gloves-leather-purple', name: 'Leather Gloves (Purple)', quantity: 1, icon: <GlovesIcon />, type: 'equipment', rarity: 'rare' },
        { id: 'legs-plate-purple', name: 'Plate Leggings (Purple)', quantity: 1, icon: <LegsIcon />, type: 'equipment', rarity: 'epic' },
        { id: 'boots-steel-purple', name: 'Steel Boots (Purple)', quantity: 1, icon: <BootsIcon />, type: 'equipment', rarity: 'legendary' },
        // Backpack Equipment - Orange Tier
        { id: 'helm-iron-orange', name: 'Iron Helm (Orange)', quantity: 1, icon: <HelmIcon />, type: 'equipment', rarity: 'common' },
        { id: 'chest-plate-orange', name: 'Steel Breastplate (Orange)', quantity: 1, icon: <ChestIcon />, type: 'equipment', rarity: 'uncommon' },
        { id: 'gloves-leather-orange', name: 'Leather Gloves (Orange)', quantity: 1, icon: <GlovesIcon />, type: 'equipment', rarity: 'rare' },
        { id: 'legs-plate-orange', name: 'Plate Leggings (Orange)', quantity: 1, icon: <LegsIcon />, type: 'equipment', rarity: 'epic' },
        { id: 'boots-steel-orange', name: 'Steel Boots (Orange)', quantity: 1, icon: <BootsIcon />, type: 'equipment', rarity: 'legendary' },
    ]);

    const [badges, setBadges] = useState<BadgeType[]>([
         {
            id: 1,
            name: "Early Adopter",
            description: "Joined BlockDAG Network in the early phase.",
            unlocked: true,
            icon: <EarlyAdopterBadgeIcon />,
            difficulty: 'Easy',
            reward: [
                { type: 'resource', id: 'prism', name: 'Prism', icon: <PrismIcon />, quantity: 500 },
                { type: 'resource', id: 'xp', name: 'XP', icon: <SparklesIcon />, quantity: 100 }
            ],
            isClaimed: true
        },
    ]);

    const [tasks, setTasks] = useState<Task[]>([
        {
            id: 'daily-login',
            description: 'Log in to the app',
            type: 'daily',
            difficulty: 'Easy',
            reward: [{ type: 'resource', id: 'iron_ore', name: 'Building', icon: <IronIcon />, quantity: 5 }],
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

    const [receipts, setReceipts] = useState<Receipt[]>(() => {
        try {
            const raw = localStorage.getItem('receipts');
            if (raw) return JSON.parse(raw) as Receipt[];
        } catch (e) {
            console.error('Failed to parse receipts from localStorage', e);
        }
        return [
            { id: '1', merchant: 'Star Coffee', amount: 15.5, date: new Date().toISOString(), items: [] },
            { id: '2', merchant: 'Game Store', amount: 59.99, date: new Date(Date.now() - 86400000).toISOString(), items: [] },
        ];
    });

    const [claimedXpInfo, setClaimedXpInfo] = useState<{ taskId: string; xp: number } | null>(null);
    
    // Check Firebase auth state on mount
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
        if (user) {
          setIsAuthenticated(true);
          setCurrentUserId(user.uid);
        } else {
          setIsAuthenticated(false);
          setCurrentUserId(null);
        }
        setAuthLoading(false);
      });
      
      return () => unsubscribe();
    }, []);

    // Fetch profile displayName separately
    useEffect(() => {
      if (currentUserId) {
        (async () => {
          try {
            const db = getFirestore();
            const profileDoc = await getDoc(doc(db, 'profiles', currentUserId));
            console.log('Profile doc exists:', profileDoc.exists());
            if (profileDoc.exists()) {
              const profileData = profileDoc.data();
              console.log('Profile data:', profileData);
              const displayName = profileData.displayName || 'Guest';
              console.log('Setting username to:', displayName);
              setUsername(displayName);
            } else {
              console.log('Profile doc does not exist');
              setUsername('Guest');
            }
          } catch (err) {
            console.error('Error fetching profile:', err);
            setUsername('Guest');
          }
        })();
      }
    }, [currentUserId]);

    // Save receipts to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('receipts', JSON.stringify(receipts));
        } catch (e) {
            console.error('Failed to save receipts to localStorage', e);
        }
    }, [receipts]);

    // Clear claimed XP info after 2 seconds
    useEffect(() => {
        if (claimedXpInfo) {
            const timer = setTimeout(() => setClaimedXpInfo(null), 2000);
            return () => clearTimeout(timer);
        }
    }, [claimedXpInfo]);
    
    // Check wallet connection on mount
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

    const handleLoginSuccess = (userId: string, userName: string) => {
      setCurrentUserId(userId);
      setUsername(userName);
      setIsAuthenticated(true);
    };

    const handleLogout = async () => {
      try {
        await signOut(firebaseAuth);
        setIsAuthenticated(false);
        setCurrentUserId(null);
        setUsername('Guest');
      } catch (error) {
        console.error('Logout error:', error);
      }
    };

    // Show loading screen if auth is still loading
    if (authLoading) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-slate-400">Loading...</p>
          </div>
        </div>
      );
    }

    // Show login screen if not authenticated
    if (!isAuthenticated) {
      return <CinemagraphLoginScreen onLoginSuccess={handleLoginSuccess} />;
    }

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

    // BDAG token info - replace `address` with the real deployed token contract address
    const BDAG_TOKEN = {
        address: '0x0000000000000000000000000000000000000000', // TODO: replace with real BDAG token address
        symbol: 'BDAG',
        decimals: 18,
        image: '/assets/bdag-token.svg'
    };

    const addBdagTokenToWallet = async () => {
        try {
            if (!window.ethereum) return false;
            const wasAdded = await window.ethereum.request?.({
                method: 'wallet_watchAsset',
                params: {
                    type: 'ERC20',
                    options: {
                        address: BDAG_TOKEN.address,
                        symbol: BDAG_TOKEN.symbol,
                        decimals: BDAG_TOKEN.decimals,
                        image: window.location.origin + BDAG_TOKEN.image,
                    },
                },
            });
            return !!wasAdded;
        } catch (err) {
            console.error('addBdagTokenToWallet error', err);
            return false;
        }
    };

    const sendBdagOnChain = async (to: string, amount: string) => {
        if (!window.ethereum) throw new Error('No wallet available');
        if (!BDAG_TOKEN.address || BDAG_TOKEN.address === '0x0000000000000000000000000000000000000000') throw new Error('BDAG token address not configured');
        try {
            const { ethers } = await import('ethers');
            const provider = new ethers.BrowserProvider(window.ethereum as any);
            const signer = await provider.getSigner();
            const erc20Abi = [
                'function transfer(address to, uint256 amount) returns (bool)'
            ];
            const contract = new ethers.Contract(BDAG_TOKEN.address, erc20Abi, signer);
            const value = ethers.parseUnits(amount.toString(), BDAG_TOKEN.decimals);
            const tx = await contract.transfer(to, value);
            await tx.wait();
            return tx;
        } catch (err) {
            console.error('sendBdagOnChain error', err);
            throw err;
        }
    };

    const handleConnectWallet = async () => {
        setWalletError(null);
        if (!window.ethereum) {
            setWalletError('MetaMask not found. Please install the MetaMask browser extension.');
            return;
        }

        try {
            setIsConnectingWallet(true);
            const accounts: string[] = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts && accounts.length > 0) {
                setWalletAddress(accounts[0]);
                // Prompt to add BDAG token to MetaMask (best-effort)
                const added = await addBdagTokenToWallet();
                if (!added) {
                    // optional: let the user know token add was declined
                    console.info('BDAG token not added to wallet (user declined or unsupported).');
                }
            }
        } catch (err: any) {
            console.error('connect wallet error', err);
            setWalletError(err?.message || 'Failed to connect to wallet');
        } finally {
            setIsConnectingWallet(false);
        }
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

    const handlePurchasePremium = (plan: 'monthly' | 'annual') => {
        setIsPremium(true);
        setShowPremiumModal(false);
        const perk = plan === 'annual' ? 'Annual: save 2 months + priority feature access.' : 'Monthly: cancel anytime.';
        try { alert?.(`Premium Unlocked\n${plan === 'annual' ? '$100/yr' : '$10/mo'} — ${perk}`); } catch {}
    };

    const handleConnectWatch = async (device: string) => {
        setConnectedWatch(device);
        setShowSmartWatchModal(false);
        
        // Fetch smartwatch data
        try {
            const { fetchSmartWatchData, setupSmartWatchSync } = await import('./services/bluetoothService');
            
            // Get initial data
            const initialData = await fetchSmartWatchData(device);
            if (initialData) {
                console.log('Updating watchData with:', initialData);
                setWatchData(prev => ({
                    ...prev,
                    steps: initialData.steps || prev.steps,
                    stairs: initialData.stairs || prev.stairs,
                    sleepScore: initialData.sleepScore || prev.sleepScore,
                    calories: initialData.calories || prev.calories,
                }));
            }
            
            // Set up continuous sync every 30 seconds
            const cleanup = setupSmartWatchSync(device, (data: any) => {
                console.log('Synced watch data:', data);
                setWatchData(prev => ({
                    ...prev,
                    steps: data.steps || prev.steps,
                    stairs: data.stairs || prev.stairs,
                    sleepScore: data.sleepScore || prev.sleepScore,
                    calories: data.calories || prev.calories,
                }));
            });
            
            // Store cleanup function for when disconnected
            (window as any).__watchSyncCleanup = cleanup;
        } catch (err) {
            console.error('Failed to connect watch:', err);
        }
    };

    const handleDisconnectWatch = () => {
        // Clean up sync interval
        if ((window as any).__watchSyncCleanup) {
            (window as any).__watchSyncCleanup();
            (window as any).__watchSyncCleanup = null;
        }
        setConnectedWatch(null);
    };

    const handleInviteFriend = (friendName: string) => {
        if (party.length < 5 && !party.includes(friendName)) {
            setParty(prev => [...prev, friendName]);
        }
    };

    const handleProposeWager = (friendName: string, gameId: string) => {
        if (!party.includes(friendName) || !friends.find((f: any) => f.name === friendName)) {
            alert('You can only wager with friends who are in your group.');
            return;
        }
        setWagerRequest({ game: gameId, from: username, to: friendName, amount: 5, status: 'pending', initiator: 'self' });
    };

    const handleRespondToWager = (accept: boolean) => {
        if (!wagerRequest) return;
        if (!accept) {
            setWagerRequest(null);
            return;
        }
        setWagerRequest(prev => prev ? { ...prev, status: 'accepted' } : prev);
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

    if (activeGame === 'citybldr') {
        return <CityBuilderGame onClose={handleGameExit} />;
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
                    onBack={() => setActiveView('profile')}
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
                    onOpenCityBldr={() => setShowCityBldr(true)}
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
                    onEditProfile={(newName: string) => setUsername(newName)}
                    onNewProfile={(newName: string) => setUsername(newName)}
                    onOpenSmartWatch={() => setShowSmartWatchModal(true)}
                    connectedWatch={connectedWatch}
                    bdagBalance={bdagBalance}
                    onOpenWallet={() => setActiveView('wallet')}
                    walletAddress={walletAddress}
                    onLogout={handleLogout}
                />;
            case 'friends':
                return <FriendsPanel 
                    friends={friends}
                    party={party}
                    user={username}
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
                    onOpenCraft={() => setShowCraftModal(true)}
                />;
            default:
                return <div className="p-6 text-center">Coming Soon</div>;
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-white font-sans overflow-hidden">
            {/* Top Bar */}
            <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-3 md:p-4 flex items-center justify-between z-10">
                <div className="relative">
                    <button 
                        onClick={() => setIsPortalMenuOpen(!isPortalMenuOpen)}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
                    >
                        <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center border border-cyan-500/50">
                            <BlockDAGIcon className="w-5 h-5 text-cyan-400" />
                        </div>
                        <h1 className="font-bold text-base md:text-lg tracking-tight">
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
                            <div className="border-t border-slate-700"></div>
                            <button 
                                className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/10 transition-colors font-semibold"
                                onClick={() => {
                                    setIsPortalMenuOpen(false);
                                    handleLogout();
                                }}
                            >
                                🚪 Logout
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow overflow-y-auto pb-20 scrollbar-hide">
                <div className="max-w-full w-full px-4 sm:px-6 md:max-w-4xl mx-auto">
                    {wagerRequest && (
                        <div className="mb-4 bg-slate-900/80 border border-emerald-500/30 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="space-y-1">
                                <p className="text-sm text-white font-semibold">5 BDAG Wager • {wagerRequest.game}</p>
                                {wagerRequest.status === 'accepted' ? (
                                    <p className="text-xs text-emerald-300">Locked in with {wagerRequest.to}. Good luck!</p>
                                ) : wagerRequest.initiator === 'self' ? (
                                    <p className="text-xs text-slate-300">Waiting for {wagerRequest.to} to accept.</p>
                                ) : (
                                    <p className="text-xs text-slate-300">{wagerRequest.from} challenged you to a 5 BDAG wager.</p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                {wagerRequest.status === 'pending' && wagerRequest.initiator === 'friend' && (
                                    <>
                                        <button onClick={() => handleRespondToWager(true)} className="px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded hover:bg-emerald-500">Accept</button>
                                        <button onClick={() => handleRespondToWager(false)} className="px-3 py-1.5 text-xs font-bold bg-slate-800 text-slate-300 rounded border border-slate-700 hover:bg-slate-700">Decline</button>
                                    </>
                                )}
                                {wagerRequest.status === 'pending' && wagerRequest.initiator === 'self' && (
                                    <button onClick={() => setWagerRequest(null)} className="px-3 py-1.5 text-xs font-bold bg-slate-800 text-slate-300 rounded border border-slate-700 hover:bg-slate-700">Cancel</button>
                                )}
                                {wagerRequest.status === 'accepted' && (
                                    <button onClick={() => setWagerRequest(null)} className="px-3 py-1.5 text-xs font-bold bg-slate-800 text-slate-300 rounded border border-slate-700 hover:bg-slate-700">Dismiss</button>
                                )}
                            </div>
                        </div>
                    )}
                    {renderActiveView()}
                </div>
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 pb-safe z-20">
                <div className="flex justify-around items-center max-w-2xl mx-auto">
                    <NavButton 
                        icon={<ProfileIcon className="w-6 h-6" />} 
                        label="Profile" 
                        isActive={activeView === 'profile'} 
                        onClick={() => setActiveView('profile')} 
                        activeColor="text-blue-400"
                    />
                    <NavButton 
                        icon={<AppsIcon className="w-6 h-6" />} 
                        label="Apps" 
                        isActive={activeView === 'apps'} 
                        onClick={() => setActiveView('apps')} 
                        activeColor="text-purple-400"
                    />
                    <NavButton 
                        icon={<UsersIcon className="w-6 h-6" />} 
                        label="Friends" 
                        isActive={activeView === 'friends'} 
                        onClick={() => setActiveView('friends')} 
                        activeColor="text-pink-400"
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
            <QrPaymentModal isOpen={showTapToPay} onClose={() => setShowTapToPay(false)} onPayment={handlePayment} walletAddress={walletAddress} onConnectWallet={handleConnectWallet} sendBdag={sendBdagOnChain} />
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
            <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} onConfirm={handlePurchasePremium} />
            <SmartWatchModal isOpen={showSmartWatchModal} onClose={() => setShowSmartWatchModal(false)} connectedWatch={connectedWatch} onConnect={handleConnectWatch} onDisconnect={handleDisconnectWatch} />
            <CraftEquipmentModal isOpen={showCraftModal} onClose={() => setShowCraftModal(false)} inventory={inventory} />
            <GroupModal isOpen={showGroupModal} onClose={() => setShowGroupModal(false)} party={party} friends={friends} onInvite={handleInviteFriend} onKick={handleRemoveFromParty} />
            <FamilyPackModal isOpen={showFamilyPackModal} onClose={() => setShowFamilyPackModal(false)} onPlayGame={handlePlayGame} party={party} friends={friends} onProposeWager={handleProposeWager} />
            <CityBldrModal isOpen={showCityBldr} onClose={() => setShowCityBldr(false)} onLaunch={() => setActiveGame('citybldr')} />

        </div>
    );
}













