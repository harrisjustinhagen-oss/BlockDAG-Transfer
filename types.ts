
import React from 'react';

export type ActiveView = 'wallet' | 'apps' | 'games' | 'profile' | 'sponsors' | 'inventory' | 'quests' | 'marketplace';

export interface Reward {
  type: 'resource';
  id: string;
  name: string;
  icon: React.ReactElement<{ className?: string }>;
  quantity: number | [number, number];
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  unlocked: boolean;
  icon: React.ReactElement<{ className?: string }>;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  reward: Reward[];
  isClaimed: boolean;
}

export interface Task {
  id: string;
  description: string;
  type: 'daily' | 'weekly';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  reward: Reward[];
  isComplete: (watchData: any, party: string[]) => boolean;
  isClaimed: boolean;
}

export type TerrainType = 'grass' | 'water' | 'forest' | 'mountain' | 'hills' | 'desert';

export interface TerrainTile {
  id: string;
  type: TerrainType;
}

export interface Receipt {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  items: { name: string; quantity: number; price: number }[];
}

export interface DaoProposal {
  id: string;
  title: string;
  description: string;
  votesFor: number;
  votesAgainst: number;
  endDate: string;
}

// Mining Types
export enum MinerStatus {
  OFFLINE = 'OFFLINE',
  BOOTING = 'BOOTING',
  MINING = 'MINING',
  ERROR = 'ERROR'
}

export type DeviceType = 'mobile' | 'home' | 'asic';

export interface Miner {
  id: string;
  name: string;
  model: string; 
  type: DeviceType;
  status: MinerStatus;
  hashrate: number; 
  hashrateUnit: 'H/s' | 'TH/s' | 'BDAG/h';
  temperature: number;
  powerUsage: number; 
  efficiency?: number;
  ipAddress?: string;
  uptime?: number;
  sessionEndTime?: number; 
  lastOptimization?: string;
}

export interface OptimizationResult {
  recommendation: string;
  tuningAdjustments: {
    clockSpeed: string;
    voltage: string;
    fanSpeed: string;
  };
}
