import { useState, useEffect, useCallback } from 'react';
import { userInventoryScarcityService, UserInventoryScarcityService } from './UserInventoryScarcityService';
import { UserInventoryItem, UserForgeStats, ForgeResult, StakeLevel, EquipmentSlot } from './EquipmentService';
import { formatTimeRemaining } from './EquipmentService';

/**
 * Hook for managing user inventory with scarcity cooldowns
 */
export const useUserInventory = (userId: string) => {
  const [inventory, setInventory] = useState<UserInventoryItem[]>([]);
  const [equippedLoadout, setEquippedLoadout] = useState<UserInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInventory = async () => {
      try {
        setLoading(true);
        const inv = await userInventoryScarcityService.getUserInventory(userId);
        const equipped = await userInventoryScarcityService.getUserEquippedLoadout(userId);
        setInventory(inv);
        setEquippedLoadout(equipped);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load inventory');
      } finally {
        setLoading(false);
      }
    };

    loadInventory();
  }, [userId]);

  const equipItem = useCallback(
    async (instanceId: string, slotType: EquipmentSlot) => {
      try {
        const success = await userInventoryScarcityService.equipUserItem(userId, instanceId, slotType);
        if (success) {
          const equipped = await userInventoryScarcityService.getUserEquippedLoadout(userId);
          setEquippedLoadout(equipped);
        }
        return success;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to equip item');
        return false;
      }
    },
    [userId]
  );

  const unequipItem = useCallback(
    async (slotType: EquipmentSlot) => {
      try {
        const success = await userInventoryScarcityService.unequipUserItem(userId, slotType);
        if (success) {
          const equipped = await userInventoryScarcityService.getUserEquippedLoadout(userId);
          setEquippedLoadout(equipped);
        }
        return success;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to unequip item');
        return false;
      }
    },
    [userId]
  );

  return {
    inventory,
    equippedLoadout,
    loading,
    error,
    equipItem,
    unequipItem,
  };
};

/**
 * Hook for monitoring forge cooldown status
 */
export const useForgeReadiness = (userId: string, refreshIntervalMs: number = 1000) => {
  const [isReady, setIsReady] = useState(false);
  const [timeUntilReady, setTimeUntilReady] = useState(0);
  const [stakeLevel, setStakeLevel] = useState<StakeLevel>('low_stakes');
  const [loading, setLoading] = useState(true);
  const [timeDisplay, setTimeDisplay] = useState('Ready');

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkReadiness = async () => {
      try {
        setLoading(true);
        const readiness = await userInventoryScarcityService.getForgeReadiness(userId);
        setIsReady(readiness.isReady);
        setTimeUntilReady(readiness.timeUntilReady);
        setStakeLevel(readiness.stakeLevel);
        setTimeDisplay(formatTimeRemaining(readiness.timeUntilReady));
      } catch (err) {
        console.error('Failed to check forge readiness:', err);
      } finally {
        setLoading(false);
      }
    };

    // Check immediately
    checkReadiness();

    // Set up interval for live countdown
    if (!isReady) {
      interval = setInterval(() => {
        setTimeUntilReady(prev => {
          const remaining = Math.max(0, prev - refreshIntervalMs);
          setTimeDisplay(formatTimeRemaining(remaining));
          if (remaining === 0) {
            setIsReady(true);
          }
          return remaining;
        });
      }, refreshIntervalMs);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [userId, refreshIntervalMs]);

  return {
    isReady,
    timeUntilReady,
    timeDisplay,
    stakeLevel,
    loading,
  };
};

/**
 * Hook for accessing forge statistics
 */
export const useForgeStats = (userId: string) => {
  const [stats, setStats] = useState<UserForgeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const forgeStats = await userInventoryScarcityService.getUserForgeStats(userId);
        setStats(forgeStats);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load forge stats');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [userId]);

  return { stats, loading, error };
};

/**
 * Hook for recording forge attempts
 */
export const useRecordForge = (userId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recordForge = useCallback(
    async (
      result: ForgeResult,
      stakingBalance: number,
      hasCatalyst: boolean,
      resourcesConsumed?: { gas_shards: number; blueprint_fragments: number }
    ) => {
      try {
        setLoading(true);
        const historyEntry = await userInventoryScarcityService.recordForgeAttempt(
          userId,
          result,
          stakingBalance,
          hasCatalyst,
          resourcesConsumed
        );
        setError(null);
        return historyEntry;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to record forge attempt';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  return { recordForge, loading, error };
};

/**
 * Hook for monitoring forge readiness display
 */
export const useForgeReadinessDisplay = (userId: string) => {
  const [display, setDisplay] = useState({
    status: 'ready' as 'ready' | 'cooldown' | 'locked',
    message: 'Ready to forge!',
    timeRemaining: 'Ready',
    stakeLevel: 'low_stakes' as StakeLevel,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDisplay = async () => {
      try {
        setLoading(true);
        const displayInfo = await userInventoryScarcityService.getForgeReadinessDisplay(userId);
        setDisplay(displayInfo);
      } catch (err) {
        console.error('Failed to load forge readiness display:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDisplay();

    // Update every second for live countdown
    const interval = setInterval(loadDisplay, 1000);
    return () => clearInterval(interval);
  }, [userId]);

  return { ...display, loading };
};

/**
 * Hook for accessing economy metrics
 */
export const useUserEconomyMetrics = (userId: string) => {
  const [metrics, setMetrics] = useState({
    stakeLevel: 'low_stakes' as StakeLevel,
    cooldownDuration: '7d 0h',
    successRate: 0,
    x10CoresGenerated: 0,
    resourcesAvailable: {
      gasShards: 0,
      blueprintFragments: 0,
      catalysts: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        const econ = await userInventoryScarcityService.getUserEconomyMetrics(userId);
        setMetrics(econ);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load economy metrics');
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [userId]);

  return { metrics, loading, error };
};

/**
 * Hook for retrieving forge history
 */
export const useForgeHistory = (userId: string, limit: number = 20) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        const forgeHistory = await userInventoryScarcityService.getUserForgeHistory(userId, limit);
        setHistory(forgeHistory);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load forge history');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [userId, limit]);

  return { history, loading, error };
};
