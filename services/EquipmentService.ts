import { EquipmentSet } from './EquipmentSkinSystem';

export type EquipmentSlot = 'HEAD' | 'BODY' | 'HANDS' | 'FEET' | 'ACCESSORY';
export type EquipmentRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type StakeLevel = 'high_stakes' | 'low_stakes';
export type ForgeResult = 'success' | 'failure';

export interface EquipmentItem {
  item_id: string;
  set_type: EquipmentSet;
  slot_type: EquipmentSlot;
  base_modifier_value: number; // e.g., 0.75 for Vault APY, -0.15 for Siphon fees
  durability_max: number;
  durability_current: number;
  rarity: EquipmentRarity;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface PlayerEquipment {
  player_id: string;
  item_id: string;
  slot_type: EquipmentSlot;
  equipped: boolean;
  durability_current: number;
  acquired_at: string;
}

export interface UserInventoryItem {
  instance_id: string;
  user_id: string;
  item_id: string;
  current_durability: number;
  is_active: boolean;
  last_forge_timestamp?: string;
  next_available_forge?: string;
  quantity: number;
  equipped_slot?: EquipmentSlot;
  acquired_at: string;
  updated_at: string;
}

export interface UserForgeStats {
  user_id: string;
  staking_balance: number;
  stake_level: StakeLevel;
  total_forges_completed: number;
  total_forge_successes: number;
  total_forge_failures: number;
  success_rate: number;
  last_forge_success_time?: string;
  x10_cores_generated: number;
  gas_shards_balance: number;
  blueprint_fragments_balance: number;
  catalysts_owned: number;
  updated_at: string;
}

export interface ForgeHistoryEntry {
  forge_id: string;
  user_id: string;
  item_id?: string;
  forge_timestamp: string;
  stake_level: StakeLevel;
  had_catalyst: boolean;
  result: ForgeResult;
  gas_shards_consumed: number;
  blueprint_fragments_consumed: number;
  x10_cores_gained: number;
  success_rate: number;
  cooldown_duration_ms: number;
  next_available_forge: string;
  staking_balance_at_forge: number;
}

export interface EquipmentService {
  // Equipment Item Queries
  getEquipmentBySet(setType: EquipmentSet): Promise<EquipmentItem[]>;
  getEquipmentBySlot(slotType: EquipmentSlot): Promise<EquipmentItem[]>;
  getEquipmentItem(itemId: string): Promise<EquipmentItem | null>;
  
  // Player Equipment Inventory
  getPlayerInventory(playerId: string): Promise<PlayerEquipment[]>;
  getPlayerEquippedSet(playerId: string): Promise<PlayerEquipment[]>;
  equipItem(playerId: string, itemId: string, slotType: EquipmentSlot): Promise<boolean>;
  unequipItem(playerId: string, slotType: EquipmentSlot): Promise<boolean>;
  addEquipmentToInventory(playerId: string, itemId: string): Promise<PlayerEquipment>;
  
  // Durability Management
  reduceDurability(playerId: string, itemId: string, damageAmount: number): Promise<number>;
  repairEquipment(playerId: string, itemId: string, amount?: number): Promise<number>;
  getEquipmentCondition(playerId: string, itemId: string): Promise<number>; // 0-100%
  
  // Set Bonuses
  calculateSetBonus(equippedItems: PlayerEquipment[]): Promise<Record<string, number>>;
  getActiveSetBonuses(playerId: string): Promise<Record<string, number>>;
  
  // User Inventory with Scarcity Logic
  getUserInventory(userId: string): Promise<UserInventoryItem[]>;
  getUserEquippedLoadout(userId: string): Promise<UserInventoryItem[]>;
  equipUserItem(userId: string, instanceId: string, slotType: EquipmentSlot): Promise<boolean>;
  unequipUserItem(userId: string, slotType: EquipmentSlot): Promise<boolean>;
  
  // Forge Scarcity Management
  getUserForgeStats(userId: string): Promise<UserForgeStats>;
  determineStakeLevel(stakingBalance: number, threshold?: number): StakeLevel;
  getForgeReadiness(userId: string): Promise<{
    isReady: boolean;
    timeUntilReady: number; // milliseconds
    stakeLevel: StakeLevel;
    nextForgeTime?: string;
  }>;
  recordForgeAttempt(
    userId: string,
    result: ForgeResult,
    stakingBalance: number,
    hasCatalyst: boolean,
    resourcesConsumed?: { gas_shards: number; blueprint_fragments: number }
  ): Promise<ForgeHistoryEntry>;
  updateForgeReadiness(userId: string, cooldownMs: number): Promise<Date>;
}

/**
 * Mock Equipment Service for development
 * Replace with actual database calls in production
 */
export const createEquipmentService = (): EquipmentService => {
  // Mock database: equipment_items
  const equipmentDatabase: Record<string, EquipmentItem> = {
    // MINT Set
    'mint-helm': {
      item_id: 'mint-helm',
      set_type: 'mint',
      slot_type: 'HEAD',
      base_modifier_value: 0.01,
      durability_max: 100,
      durability_current: 100,
      rarity: 'uncommon',
      name: 'Mint Helm',
      description: 'Purple helm granting +1% BDAG cashback',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    'mint-chest': {
      item_id: 'mint-chest',
      set_type: 'mint',
      slot_type: 'BODY',
      base_modifier_value: 0.01,
      durability_max: 100,
      durability_current: 100,
      rarity: 'uncommon',
      name: 'Mint Chest',
      description: 'Purple chest piece granting +1% BDAG cashback',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    // ... more items would be loaded from database
  };

  // Mock database: player_equipment
  const playerInventory: Record<string, PlayerEquipment[]> = {};

  return {
    async getEquipmentBySet(setType: EquipmentSet): Promise<EquipmentItem[]> {
      return Object.values(equipmentDatabase).filter(item => item.set_type === setType);
    },

    async getEquipmentBySlot(slotType: EquipmentSlot): Promise<EquipmentItem[]> {
      return Object.values(equipmentDatabase).filter(item => item.slot_type === slotType);
    },

    async getEquipmentItem(itemId: string): Promise<EquipmentItem | null> {
      return equipmentDatabase[itemId] || null;
    },

    async getPlayerInventory(playerId: string): Promise<PlayerEquipment[]> {
      return playerInventory[playerId] || [];
    },

    async getPlayerEquippedSet(playerId: string): Promise<PlayerEquipment[]> {
      const inventory = playerInventory[playerId] || [];
      return inventory.filter(item => item.equipped);
    },

    async equipItem(playerId: string, itemId: string, slotType: EquipmentSlot): Promise<boolean> {
      if (!playerInventory[playerId]) {
        playerInventory[playerId] = [];
      }

      const inventory = playerInventory[playerId];
      
      // Unequip any existing item in this slot
      inventory.forEach(item => {
        if (item.slot_type === slotType) {
          item.equipped = false;
        }
      });

      // Equip new item
      const targetItem = inventory.find(item => item.item_id === itemId);
      if (targetItem) {
        targetItem.equipped = true;
        return true;
      }
      return false;
    },

    async unequipItem(playerId: string, slotType: EquipmentSlot): Promise<boolean> {
      if (!playerInventory[playerId]) return false;
      
      const item = playerInventory[playerId].find(
        item => item.slot_type === slotType && item.equipped
      );
      if (item) {
        item.equipped = false;
        return true;
      }
      return false;
    },

    async addEquipmentToInventory(playerId: string, itemId: string): Promise<PlayerEquipment> {
      if (!playerInventory[playerId]) {
        playerInventory[playerId] = [];
      }

      const equipment: PlayerEquipment = {
        player_id: playerId,
        item_id: itemId,
        slot_type: 'HEAD', // Will be set based on item
        equipped: false,
        durability_current: 100,
        acquired_at: new Date().toISOString(),
      };

      // Get slot from equipment item
      const item = equipmentDatabase[itemId];
      if (item) {
        equipment.slot_type = item.slot_type;
        equipment.durability_current = item.durability_max;
      }

      playerInventory[playerId].push(equipment);
      return equipment;
    },

    async reduceDurability(playerId: string, itemId: string, damageAmount: number): Promise<number> {
      if (!playerInventory[playerId]) return 100;

      const item = playerInventory[playerId].find(e => e.item_id === itemId);
      if (item) {
        item.durability_current = Math.max(0, item.durability_current - damageAmount);
      }
      return item?.durability_current || 100;
    },

    async repairEquipment(playerId: string, itemId: string, amount: number = 100): Promise<number> {
      if (!playerInventory[playerId]) return 100;

      const item = playerInventory[playerId].find(e => e.item_id === itemId);
      const equipment = equipmentDatabase[itemId];
      
      if (item && equipment) {
        item.durability_current = Math.min(equipment.durability_max, item.durability_current + amount);
      }
      return item?.durability_current || 100;
    },

    async getEquipmentCondition(playerId: string, itemId: string): Promise<number> {
      if (!playerInventory[playerId]) return 100;

      const item = playerInventory[playerId].find(e => e.item_id === itemId);
      const equipment = equipmentDatabase[itemId];
      
      if (item && equipment) {
        return Math.round((item.durability_current / equipment.durability_max) * 100);
      }
      return 100;
    },

    async calculateSetBonus(equippedItems: PlayerEquipment[]): Promise<Record<string, number>> {
      const bonuses: Record<string, number> = {
        cashback: 0,
        staking_apy: 0,
        transaction_fee_discount: 0,
        crafting_cost_discount: 0,
        network_commission: 0,
      };

      for (const equippedItem of equippedItems) {
        const item = equipmentDatabase[equippedItem.item_id];
        if (!item) continue;

        // Apply base modifier
        switch (item.set_type) {
          case 'mint':
            bonuses.cashback += item.base_modifier_value;
            break;
          case 'vault':
            bonuses.staking_apy += item.base_modifier_value;
            break;
          case 'siphon':
            bonuses.transaction_fee_discount += Math.abs(item.base_modifier_value);
            break;
          case 'architect':
            bonuses.crafting_cost_discount += Math.abs(item.base_modifier_value);
            break;
          case 'broker':
            bonuses.network_commission += item.base_modifier_value;
            break;
        }

        // Apply durability penalty (degraded items are less effective)
        const condition = equippedItem.durability_current / 100;
        if (condition < 1.0) {
          Object.keys(bonuses).forEach(key => {
            bonuses[key] *= condition;
          });
        }
      }

      return bonuses;
    },

    async getActiveSetBonuses(playerId: string): Promise<Record<string, number>> {
      const equippedItems = await this.getPlayerEquippedSet(playerId);
      return this.calculateSetBonus(equippedItems);
    },
  };
};

// Export singleton instance for use throughout the app
export const equipmentService = createEquipmentService();

/**
 * Forge Scarcity Configuration
 * Controls cooldown scaling based on staking balance
 */
export const FORGE_SCARCITY_CONFIG = {
  // Stake levels
  HIGH_STAKES_THRESHOLD: 50000, // BDAG
  HIGH_STAKES_COOLDOWN_MS: 172800000, // 48 hours
  LOW_STAKES_COOLDOWN_MS: 604800000, // 7 days
  
  // Success rates
  BASE_SUCCESS_RATE: 0.40, // 40% without catalyst
  CATALYST_SUCCESS_RATE: 1.0, // 100% with catalyst
  
  // Resource costs
  GAS_SHARDS_COST: 100,
  BLUEPRINT_FRAGMENTS_COST: 50,
  
  // Cooldown modifiers by result
  SUCCESS_COOLDOWN_PENALTY: 1.0, // Normal cooldown
  FAILURE_COOLDOWN_PENALTY: 1.2, // 20% longer on failure
};

/**
 * Helper: Determine stake level based on balance
 */
export function determineStakeLevel(balance: number, threshold: number = FORGE_SCARCITY_CONFIG.HIGH_STAKES_THRESHOLD): StakeLevel {
  return balance >= threshold ? 'high_stakes' : 'low_stakes';
}

/**
 * Helper: Get cooldown milliseconds for a stake level
 */
export function getCooldownMs(stakeLevel: StakeLevel, onFailure: boolean = false): number {
  const baseCooldown = stakeLevel === 'high_stakes'
    ? FORGE_SCARCITY_CONFIG.HIGH_STAKES_COOLDOWN_MS
    : FORGE_SCARCITY_CONFIG.LOW_STAKES_COOLDOWN_MS;
  
  return Math.round(baseCooldown * (onFailure ? FORGE_SCARCITY_CONFIG.FAILURE_COOLDOWN_PENALTY : FORGE_SCARCITY_CONFIG.SUCCESS_COOLDOWN_PENALTY));
}

/**
 * Helper: Format milliseconds to human-readable time
 */
export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'Ready';
  
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}
