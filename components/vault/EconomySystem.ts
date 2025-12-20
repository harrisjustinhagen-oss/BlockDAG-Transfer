import React from 'react';
import { EquipmentSet } from './EquipmentSkinSystem';

// ========================================
// ECONOMY & MARKETPLACE TYPES
// ========================================

export type CoreType = 'x1_poe' | 'x10_overdrive' | 'catalyst_siphon' | 'nano_repair';
export type TransactionType = 'buy' | 'sell' | 'forge' | 'repair' | 'commission';

export interface Marketplace {
  catalystCores: MarketListing[];
  x10Cores: MarketListing[];
  repairKits: MarketListing[];
  transactionHistory: Transaction[];
}

export interface MarketListing {
  id: string;
  seller: string;
  coreType: CoreType;
  quantity: number;
  pricePerUnit: number; // In BDAG
  listingTime: number;
  expires: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  from: string;
  to: string;
  coreType: CoreType;
  quantity: number;
  priceTotal: number;
  timestamp: number;
  setBonus?: EquipmentSet; // Which set bonus was used
}

export interface SetUltimateBonus {
  set: EquipmentSet;
  name: string;
  description: string;
  economicRole: string;
  unlocked: boolean; // 5-piece requirement met
}

export interface NetworkBroadcast {
  id: string;
  broadcaster: string; // Broker player
  set: 'broker';
  boostType: 'forge_success' | 'repair_discount' | 'fee_reduction';
  boostValue: number; // e.g., 0.10 for +10%
  affectedFriends: string[];
  durationMs: number;
  startTime: number;
  active: boolean;
}

export interface SetEconomyState {
  // Mint: Commercial Hub
  mintRealSpending: number; // USD spent
  mintMaterialsGenerated: {
    steel: number;
    concrete: number;
  };

  // Vault: High-Stakes Forge
  vaultX10CoresOwned: number;
  vaultLastForgeTime: number | null;

  // Siphon: Refinery
  siphonGasShardsRefined: number;
  siphonCatalystCoresListing: MarketListing[];
  siphonMarketplaceEarnings: number; // Total BDAG earned

  // Architect: Service Board
  architectRepairKitsListing: MarketListing[];
  architectServiceBoardEarnings: number; // Total BDAG earned
  architectFriendDiscountRate: number; // 0.25 (25%)

  // Broker: Syndicate
  brokerActiveNetworkBroadcasts: NetworkBroadcast[];
  brokerBulkCoreDiscountRate: number; // 0.05 (5%)
  brokerNetworkCommissionRate: number; // 0.005 (0.5%)
}

export interface CompleteSetEconomyData {
  playerName: string;
  stakingBalance: number;
  sets: {
    mint?: SetEconomyState;
    vault?: SetEconomyState;
    siphon?: SetEconomyState;
    architect?: SetEconomyState;
    broker?: SetEconomyState;
  };
  marketplace: Marketplace;
  networkBroadcasts: NetworkBroadcast[];
}

// ========================================
// SET ULTIMATE BONUSES DATABASE
// ========================================

export const SET_ULTIMATE_BONUSES: SetUltimateBonus[] = [
  {
    set: 'mint',
    name: 'Commercial Hub',
    description:
      '10% of real-world fiat spending is mirrored as SIM City building materials (Steel/Concrete)',
    economicRole: 'The Spender: Injects fiat liquidity into ecosystem',
    unlocked: false,
  },
  {
    set: 'vault',
    name: 'High-Stakes Forge',
    description:
      'Craft X10 Overdrive Cores (200 BDAG/day). 40% base success, 100% with Catalyst Cores from Siphon',
    economicRole:
      'The Power Grid: Core production hub, drives mining economy',
    unlocked: false,
  },
  {
    set: 'siphon',
    name: 'Refinery',
    description:
      'Refine Gas Shards into Catalyst Cores and sell on marketplace. Catalysts guarantee Vault forge success',
    economicRole: 'The Logistics: Supply chain for core economy',
    unlocked: false,
  },
  {
    set: 'architect',
    name: 'Service Board',
    description:
      'Craft Nano-Repair Cores and sell on marketplace. 25% discount for Friends List members',
    economicRole:
      'The Master Builder: Maintenance economy, auto-repairs own gear',
    unlocked: false,
  },
  {
    set: 'broker',
    name: 'Syndicate',
    description:
      'Broadcast "Set Multiplier" to boost all Vault friends\' Forge Success Rate by 10% for 2h. Buy Cores in bulk at 5% discount',
    economicRole:
      'The Influencer: Network leverage, bulk market access, commission earning',
    unlocked: false,
  },
];

// ========================================
// ECONOMY CALCULATIONS
// ========================================

/**
 * Mint: Generate building materials from real spending
 */
export const generateMintMaterials = (
  realSpendingUSD: number,
  conversionRate: number = 0.10 // 10%
): { steel: number; concrete: number } => {
  const totalMaterials = Math.floor(realSpendingUSD * conversionRate);
  return {
    steel: Math.floor(totalMaterials * 0.6),
    concrete: Math.floor(totalMaterials * 0.4),
  };
};

/**
 * Siphon: Calculate catalyst core yield from gas shards
 */
export const calculateSiphonYield = (
  gasShards: number,
  conversionRate: number = 0.5 // 2 gas shards = 1 catalyst core
): number => {
  return Math.floor(gasShards * conversionRate);
};

/**
 * Siphon: List catalyst cores on marketplace
 */
export const listCatalystCores = (
  sellerId: string,
  quantity: number,
  pricePerUnit: number,
  listingDurationMs: number = 604800000 // 7 days
): MarketListing => {
  const now = Date.now();
  return {
    id: `catalyst-${sellerId}-${now}`,
    seller: sellerId,
    coreType: 'catalyst_siphon',
    quantity,
    pricePerUnit,
    listingTime: now,
    expires: now + listingDurationMs,
  };
};

/**
 * Architect: List repair kits on marketplace
 */
export const listRepairKits = (
  sellerId: string,
  quantity: number,
  pricePerUnit: number,
  listingDurationMs: number = 604800000
): MarketListing => {
  const now = Date.now();
  return {
    id: `repair-${sellerId}-${now}`,
    seller: sellerId,
    coreType: 'nano_repair',
    quantity,
    pricePerUnit,
    listingTime: now,
    expires: now + listingDurationMs,
  };
};

/**
 * Broker: Apply bulk discount when buying cores
 */
export const calculateBrokerBulkPrice = (
  basePrice: number,
  quantity: number,
  discountRate: number = 0.05 // 5% discount
): number => {
  return Math.floor(basePrice * quantity * (1 - discountRate));
};

/**
 * Broker: Calculate network commission from friend rewards
 */
export const calculateBrokerCommission = (
  friendRewardAmount: number,
  commissionRate: number = 0.005 // 0.5%
): number => {
  return Math.floor(friendRewardAmount * commissionRate);
};

/**
 * Broker: Create network broadcast for forge success boost
 */
export const createNetworkBroadcast = (
  broadcasterId: string,
  affectedFriends: string[],
  boostValue: number = 0.10, // +10% forge success
  durationMs: number = 7200000 // 2 hours
): NetworkBroadcast => {
  const now = Date.now();
  return {
    id: `broadcast-${broadcasterId}-${now}`,
    broadcaster: broadcasterId,
    set: 'broker',
    boostType: 'forge_success',
    boostValue,
    affectedFriends,
    durationMs,
    startTime: now,
    active: true,
  };
};

/**
 * Check if marketplace listing is expired
 */
export const isListingExpired = (listing: MarketListing): boolean => {
  return Date.now() > listing.expires;
};

/**
 * Process marketplace purchase
 */
export const processPurchase = (
  buyerId: string,
  listing: MarketListing,
  quantityToPurchase: number
): {
  success: boolean;
  transaction: Transaction | null;
  reason: string;
} => {
  if (isListingExpired(listing)) {
    return {
      success: false,
      transaction: null,
      reason: 'Listing expired',
    };
  }

  if (quantityToPurchase > listing.quantity) {
    return {
      success: false,
      transaction: null,
      reason: 'Insufficient quantity available',
    };
  }

  const totalPrice = listing.pricePerUnit * quantityToPurchase;
  const transaction: Transaction = {
    id: `txn-${Date.now()}-${Math.random()}`,
    type: 'buy',
    from: buyerId,
    to: listing.seller,
    coreType: listing.coreType,
    quantity: quantityToPurchase,
    priceTotal: totalPrice,
    timestamp: Date.now(),
  };

  return {
    success: true,
    transaction,
    reason: 'Purchase successful',
  };
};

// ========================================
// ECONOMY SIMULATION
// ========================================

export interface EconomySnapshot {
  timestamp: number;
  totalMarketplaceVolume: number; // Total BDAG traded
  catalystCorePrice: number; // Average price
  repairKitPrice: number; // Average price
  x10CorePrice: number; // Average price
  activeNetworkBroadcasts: number;
  totalTransactions: number;
}

/**
 * Generate economy snapshot
 */
export const generateEconomySnapshot = (
  marketplace: Marketplace
): EconomySnapshot => {
  const totalVolume = marketplace.transactionHistory.reduce(
    (sum, txn) => sum + txn.priceTotal,
    0
  );

  const catalystListings = marketplace.catalystCores;
  const catalystPrice =
    catalystListings.length > 0
      ? Math.floor(
          catalystListings.reduce((sum, l) => sum + l.pricePerUnit, 0) /
            catalystListings.length
        )
      : 0;

  const repairListings = marketplace.repairKits;
  const repairPrice =
    repairListings.length > 0
      ? Math.floor(
          repairListings.reduce((sum, l) => sum + l.pricePerUnit, 0) /
            repairListings.length
        )
      : 0;

  const x10Listings = marketplace.x10Cores;
  const x10Price =
    x10Listings.length > 0
      ? Math.floor(
          x10Listings.reduce((sum, l) => sum + l.pricePerUnit, 0) /
            x10Listings.length
        )
      : 0;

  return {
    timestamp: Date.now(),
    totalMarketplaceVolume: totalVolume,
    catalystCorePrice: catalystPrice,
    repairKitPrice: repairPrice,
    x10CorePrice: x10Price,
    activeNetworkBroadcasts: 0,
    totalTransactions: marketplace.transactionHistory.length,
  };
};

// ========================================
// ECONOMIC INTERCONNECTIONS
// ========================================

/**
 * Demonstrates the economic loop between sets
 * Flow: Siphon produces Catalysts → Vault buys to guarantee X10 forges → X10 Cores valuable on market →
 *        Architect repairs gear → Broker takes commission → Broker buffs Vault friends
 */
export const describeEconomicFlow = (): string => {
  return `
BLOCKDAG ECONOMY LOOP (5-Set Interdependency):

1. SIPHON (Refinery) → Creates Catalyst Cores
   - Generates Gas Shards from transactions
   - Refines into Catalyst Cores
   - Lists on marketplace

2. VAULT (High-Stakes Forge) → Buys Catalysts
   - Purchases Catalyst Cores from Siphon
   - Guarantees X10 Overdrive Core creation
   - High demand keeps Catalyst prices stable

3. X10 CORE VALUE → Market drives Vault demand
   - X10 Cores worth 200 BDAG/day mining
   - Creates demand for Forge access
   - Siphon catalysts become essential

4. ARCHITECT (Service Board) → Maintains ecosystem
   - Sells Repair Kits for gear maintenance
   - Auto-repairs own equipment
   - Earns BDAG from community repairs

5. BROKER (Syndicate) → Leverages network
   - Broadcasts forge success boost to Vault friends
   - Buys Cores in bulk at 5% discount
   - Earns network commission (0.5%) on friend rewards
   - Sells redistributed Cores at markup

6. MINT (Commercial Hub) → Injects liquidity
   - Converts real USD to building materials
   - Creates economic floor
   - Brings external value into ecosystem

SCARCITY MECHANISM:
- Siphon controls catalyst supply (limited by transaction volume)
- Vault controls X10 Core supply (limited by cooldown + success rate)
- Architect controls repair access (limited by listing availability)
- Economy self-balances through supply/demand
  `;
};

export default {
  generateMintMaterials,
  calculateSiphonYield,
  listCatalystCores,
  listRepairKits,
  calculateBrokerBulkPrice,
  calculateBrokerCommission,
  createNetworkBroadcast,
  isListingExpired,
  processPurchase,
  generateEconomySnapshot,
  describeEconomicFlow,
};
