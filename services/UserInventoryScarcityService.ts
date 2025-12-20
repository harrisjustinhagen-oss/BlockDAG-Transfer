import { UserInventoryItem, UserForgeStats, ForgeHistoryEntry, ForgeResult, StakeLevel, EquipmentSlot } from './EquipmentService';
import { determineStakeLevel, getCooldownMs, formatTimeRemaining, FORGE_SCARCITY_CONFIG } from './EquipmentService';

/**
 * User Inventory Scarcity Service
 * Manages forge cooldowns based on staking balance
 * Implements scarcity logic to prevent oversupply
 */
export class UserInventoryScarcityService {
  // Mock data stores
  private userInventory: Map<string, UserInventoryItem[]> = new Map();
  private userForgeStats: Map<string, UserForgeStats> = new Map();
  private forgeHistory: Map<string, ForgeHistoryEntry[]> = new Map();

  /**
   * Get user's inventory with scarcity cooldown information
   */
  async getUserInventory(userId: string): Promise<UserInventoryItem[]> {
    return this.userInventory.get(userId) || [];
  }

  /**
   * Get user's equipped items (loadout)
   */
  async getUserEquippedLoadout(userId: string): Promise<UserInventoryItem[]> {
    const inventory = this.userInventory.get(userId) || [];
    return inventory.filter(item => item.equipped_slot && item.is_active);
  }

  /**
   * Equip an item to a slot
   */
  async equipUserItem(userId: string, instanceId: string, slotType: EquipmentSlot): Promise<boolean> {
    const inventory = this.userInventory.get(userId) || [];
    
    // Unequip existing item in this slot
    inventory.forEach(item => {
      if (item.equipped_slot === slotType) {
        item.equipped_slot = undefined;
      }
    });

    // Equip new item
    const targetItem = inventory.find(item => item.instance_id === instanceId);
    if (targetItem) {
      targetItem.equipped_slot = slotType;
      targetItem.updated_at = new Date().toISOString();
      return true;
    }
    return false;
  }

  /**
   * Unequip an item from a slot
   */
  async unequipUserItem(userId: string, slotType: EquipmentSlot): Promise<boolean> {
    const inventory = this.userInventory.get(userId) || [];
    const item = inventory.find(i => i.equipped_slot === slotType);
    
    if (item) {
      item.equipped_slot = undefined;
      item.updated_at = new Date().toISOString();
      return true;
    }
    return false;
  }

  /**
   * Get user's forge statistics
   */
  async getUserForgeStats(userId: string): Promise<UserForgeStats> {
    const stats = this.userForgeStats.get(userId) || {
      user_id: userId,
      staking_balance: 0,
      stake_level: 'low_stakes',
      total_forges_completed: 0,
      total_forge_successes: 0,
      total_forge_failures: 0,
      success_rate: 0,
      x10_cores_generated: 0,
      gas_shards_balance: 0,
      blueprint_fragments_balance: 0,
      catalysts_owned: 0,
      updated_at: new Date().toISOString(),
    };

    return stats;
  }

  /**
   * Check if user is ready to forge
   * Determines readiness based on stake-level cooldown
   */
  async getForgeReadiness(userId: string): Promise<{
    isReady: boolean;
    timeUntilReady: number;
    stakeLevel: StakeLevel;
    nextForgeTime?: string;
  }> {
    const stats = await this.getUserForgeStats(userId);
    const stakeLevel = determineStakeLevel(stats.staking_balance);
    
    // Find next available forge time across all inventory items
    const inventory = await this.getUserInventory(userId);
    const nextForgeTime = Math.max(
      ...inventory
        .filter(item => item.next_available_forge)
        .map(item => new Date(item.next_available_forge!).getTime()),
      0
    );

    const now = Date.now();
    const timeUntilReady = Math.max(0, nextForgeTime - now);
    const isReady = timeUntilReady === 0;

    return {
      isReady,
      timeUntilReady,
      stakeLevel,
      nextForgeTime: isReady ? undefined : new Date(nextForgeTime).toISOString(),
    };
  }

  /**
   * Record a forge attempt and update cooldown
   * Implements scarcity prevention through stake-based cooldowns
   */
  async recordForgeAttempt(
    userId: string,
    result: ForgeResult,
    stakingBalance: number,
    hasCatalyst: boolean,
    resourcesConsumed?: { gas_shards: number; blueprint_fragments: number }
  ): Promise<ForgeHistoryEntry> {
    // Determine stake level
    const stakeLevel = determineStakeLevel(stakingBalance);
    
    // Calculate cooldown based on result
    const baseCooldown = getCooldownMs(stakeLevel, result === 'failure');
    const successRate = hasCatalyst ? 1.0 : 0.40;
    
    // Create history entry
    const historyEntry: ForgeHistoryEntry = {
      forge_id: `forge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      forge_timestamp: new Date().toISOString(),
      stake_level: stakeLevel,
      had_catalyst: hasCatalyst,
      result,
      gas_shards_consumed: resourcesConsumed?.gas_shards || 0,
      blueprint_fragments_consumed: resourcesConsumed?.blueprint_fragments || 0,
      x10_cores_gained: result === 'success' ? 1 : 0,
      success_rate: successRate,
      cooldown_duration_ms: baseCooldown,
      next_available_forge: new Date(Date.now() + baseCooldown).toISOString(),
      staking_balance_at_forge: stakingBalance,
    };

    // Store history
    const history = this.forgeHistory.get(userId) || [];
    history.push(historyEntry);
    this.forgeHistory.set(userId, history.slice(-100)); // Keep last 100 forges

    // Update forge stats
    const stats = await this.getUserForgeStats(userId);
    stats.total_forges_completed += 1;
    stats.total_forge_successes += result === 'success' ? 1 : 0;
    stats.total_forge_failures += result === 'failure' ? 1 : 0;
    stats.success_rate = stats.total_forges_completed > 0 
      ? stats.total_forge_successes / stats.total_forges_completed 
      : 0;
    
    if (result === 'success') {
      stats.x10_cores_generated += 1;
      stats.last_forge_success_time = new Date().toISOString();
    }
    
    stats.gas_shards_balance = Math.max(0, (stats.gas_shards_balance || 0) - (resourcesConsumed?.gas_shards || 0));
    stats.blueprint_fragments_balance = Math.max(0, (stats.blueprint_fragments_balance || 0) - (resourcesConsumed?.blueprint_fragments || 0));
    stats.updated_at = new Date().toISOString();
    
    this.userForgeStats.set(userId, stats);

    // Update all inventory items' next forge time
    const inventory = this.userInventory.get(userId) || [];
    const nextForgeTime = new Date(Date.now() + baseCooldown);
    inventory.forEach(item => {
      item.next_available_forge = nextForgeTime.toISOString();
      item.last_forge_timestamp = new Date().toISOString();
      item.updated_at = new Date().toISOString();
    });

    return historyEntry;
  }

  /**
   * Update forge readiness (manually set next forge time)
   * Useful for admin operations or test scenarios
   */
  async updateForgeReadiness(userId: string, cooldownMs: number): Promise<Date> {
    const nextForgeTime = new Date(Date.now() + cooldownMs);
    const inventory = this.userInventory.get(userId) || [];
    
    inventory.forEach(item => {
      item.next_available_forge = nextForgeTime.toISOString();
      item.updated_at = new Date().toISOString();
    });

    return nextForgeTime;
  }

  /**
   * Get forge history for a user
   */
  async getUserForgeHistory(userId: string, limit: number = 20): Promise<ForgeHistoryEntry[]> {
    const history = this.forgeHistory.get(userId) || [];
    return history.slice(-limit).reverse();
  }

  /**
   * Get cooldown status in human-readable format
   */
  async getForgeReadinessDisplay(userId: string): Promise<{
    status: 'ready' | 'cooldown' | 'locked';
    message: string;
    timeRemaining: string;
    stakeLevel: StakeLevel;
  }> {
    const readiness = await this.getForgeReadiness(userId);
    const stats = await this.getUserForgeStats(userId);
    
    let status: 'ready' | 'cooldown' | 'locked' = 'ready';
    let message = 'Ready to forge!';
    
    if (!readiness.isReady) {
      status = 'cooldown';
      message = `Cooldown: ${formatTimeRemaining(readiness.timeUntilReady)}`;
    }

    if (stats.gas_shards_balance < FORGE_SCARCITY_CONFIG.GAS_SHARDS_COST) {
      status = 'locked';
      message = `Need ${FORGE_SCARCITY_CONFIG.GAS_SHARDS_COST} Gas Shards (have ${stats.gas_shards_balance})`;
    }

    return {
      status,
      message,
      timeRemaining: formatTimeRemaining(readiness.timeUntilReady),
      stakeLevel: readiness.stakeLevel,
    };
  }

  /**
   * Get economy metrics for the user
   */
  async getUserEconomyMetrics(userId: string): Promise<{
    stakeLevel: StakeLevel;
    cooldownDuration: string;
    successRate: number;
    x10CoresGenerated: number;
    resourcesAvailable: {
      gasShards: number;
      blueprintFragments: number;
      catalysts: number;
    };
  }> {
    const stats = await this.getUserForgeStats(userId);
    const readiness = await this.getForgeReadiness(userId);
    const cooldownMs = readiness.stakeLevel === 'high_stakes'
      ? FORGE_SCARCITY_CONFIG.HIGH_STAKES_COOLDOWN_MS
      : FORGE_SCARCITY_CONFIG.LOW_STAKES_COOLDOWN_MS;

    return {
      stakeLevel: readiness.stakeLevel,
      cooldownDuration: formatTimeRemaining(cooldownMs),
      successRate: stats.success_rate,
      x10CoresGenerated: stats.x10_cores_generated,
      resourcesAvailable: {
        gasShards: stats.gas_shards_balance,
        blueprintFragments: stats.blueprint_fragments_balance,
        catalysts: stats.catalysts_owned,
      },
    };
  }
}

// Export singleton instance
export const userInventoryScarcityService = new UserInventoryScarcityService();
