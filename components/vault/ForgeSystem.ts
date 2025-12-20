import React, { useState, useCallback } from 'react';

// ========================================
// FORGE SYSTEM TYPES
// ========================================

export type CatalystType = 'gas_shard' | 'blueprint_fragment' | 'none';
export type ForgeStakeLevel = 'high_stakes' | 'low_stakes'; // ≥50k BDAG vs <50k
export type ForgeResult = 'success' | 'failure' | 'pending' | 'cooldown_active';

export interface ForgeState {
  lastForgeTime: number | null; // Timestamp of last attempt
  cooldownMinutes: number; // 2880 (48h) or 10080 (7d)
  x10CoresGenerated: number;
  gasShards: number;
  blueprintFragments: number;
  forgeHistory: ForgeAttempt[];
}

export interface ForgeAttempt {
  timestamp: number;
  stakeLevel: ForgeStakeLevel;
  catalyst: CatalystType;
  result: 'success' | 'failure';
  successRate: number;
}

export interface ForgeConfig {
  baseSuccessRate: number; // 0.40 (40%)
  catalystSuccessRate: number; // 1.0 (100%)
  highStakesCooldownMs: number; // 172800000 (48h)
  lowStakesCooldownMs: number; // 604800000 (7d)
  highStakesThreshold: number; // 50000 BDAG
  resourceLossOnFailure: {
    gasShards: number;
    blueprintFragments: number;
  };
}

export interface ForgeReadiness {
  isReady: boolean;
  timeUntilReady: number; // milliseconds
  reason: string; // "Ready" | "Cooldown active" | "etc"
  canAttempt: boolean;
}

// ========================================
// FORGE CONFIGURATION
// ========================================

export const DEFAULT_FORGE_CONFIG: ForgeConfig = {
  baseSuccessRate: 0.40, // 40% base success
  catalystSuccessRate: 1.0, // 100% with catalyst
  highStakesCooldownMs: 172800000, // 48 hours
  lowStakesCooldownMs: 604800000, // 7 days (168 hours)
  highStakesThreshold: 50000, // BDAG
  resourceLossOnFailure: {
    gasShards: 100,
    blueprintFragments: 50,
  },
};

// ========================================
// FORGE LOGIC FUNCTIONS
// ========================================

/**
 * Determine cooldown based on staking balance
 */
export const determineStakeLevel = (
  stakingBalance: number,
  threshold: number = DEFAULT_FORGE_CONFIG.highStakesThreshold
): ForgeStakeLevel => {
  return stakingBalance >= threshold ? 'high_stakes' : 'low_stakes';
};

/**
 * Get cooldown duration in milliseconds based on stake level
 */
export const getCooldownMs = (
  stakeLevel: ForgeStakeLevel,
  config: ForgeConfig = DEFAULT_FORGE_CONFIG
): number => {
  return stakeLevel === 'high_stakes'
    ? config.highStakesCooldownMs
    : config.lowStakesCooldownMs;
};

/**
 * Calculate success rate based on catalyst
 */
export const calculateSuccessRate = (
  hasCatalyst: boolean,
  config: ForgeConfig = DEFAULT_FORGE_CONFIG
): number => {
  return hasCatalyst ? config.catalystSuccessRate : config.baseSuccessRate;
};

/**
 * Simulate forge attempt
 */
export const simulateForgeAttempt = (
  successRate: number
): 'success' | 'failure' => {
  return Math.random() <= successRate ? 'success' : 'failure';
};

/**
 * Check if forge is ready to attempt
 */
export const checkForgeReadiness = (
  lastForgeTime: number | null,
  cooldownMs: number,
  now: number = Date.now()
): ForgeReadiness => {
  if (lastForgeTime === null) {
    return {
      isReady: true,
      timeUntilReady: 0,
      reason: 'Never forged before',
      canAttempt: true,
    };
  }

  const timeSinceLastForge = now - lastForgeTime;
  const timeUntilReady = Math.max(0, cooldownMs - timeSinceLastForge);

  if (timeUntilReady === 0) {
    return {
      isReady: true,
      timeUntilReady: 0,
      reason: 'Ready',
      canAttempt: true,
    };
  }

  return {
    isReady: false,
    timeUntilReady,
    reason: `Cooldown active: ${formatTimeRemaining(timeUntilReady)}`,
    canAttempt: false,
  };
};

/**
 * Format milliseconds to readable time string
 */
export const formatTimeRemaining = (ms: number): string => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

/**
 * Process forge attempt and return new state
 */
export const processForgeAttempt = (
  currentState: ForgeState,
  stakingBalance: number,
  catalyst: CatalystType,
  config: ForgeConfig = DEFAULT_FORGE_CONFIG
): {
  newState: ForgeState;
  result: ForgeResult;
  details: {
    stakeLevel: ForgeStakeLevel;
    successRate: number;
    attempt: 'success' | 'failure' | 'cooldown_active';
  };
} => {
  const now = Date.now();

  // Check cooldown
  const stakeLevel = determineStakeLevel(stakingBalance, config.highStakesThreshold);
  const cooldownMs = getCooldownMs(stakeLevel, config);
  const readiness = checkForgeReadiness(currentState.lastForgeTime, cooldownMs, now);

  if (!readiness.canAttempt) {
    return {
      newState: currentState,
      result: 'cooldown_active',
      details: {
        stakeLevel,
        successRate: 0,
        attempt: 'cooldown_active',
      },
    };
  }

  // Calculate success rate
  const hasCatalyst = catalyst !== 'none';
  const successRate = calculateSuccessRate(hasCatalyst, config);

  // Simulate attempt
  const attemptResult = simulateForgeAttempt(successRate);

  // Update state
  let newState = { ...currentState, lastForgeTime: now };

  if (attemptResult === 'success') {
    newState.x10CoresGenerated += 1;
  } else {
    // Resource loss on failure
    newState.gasShards = Math.max(
      0,
      newState.gasShards - config.resourceLossOnFailure.gasShards
    );
    newState.blueprintFragments = Math.max(
      0,
      newState.blueprintFragments - config.resourceLossOnFailure.blueprintFragments
    );
  }

  // Consume catalyst
  if (hasCatalyst) {
    if (catalyst === 'gas_shard') {
      newState.gasShards = Math.max(0, newState.gasShards - 1);
    } else if (catalyst === 'blueprint_fragment') {
      newState.blueprintFragments = Math.max(0, newState.blueprintFragments - 1);
    }
  }

  // Add to history
  newState.forgeHistory = [
    ...newState.forgeHistory,
    {
      timestamp: now,
      stakeLevel,
      catalyst,
      result: attemptResult,
      successRate,
    },
  ].slice(-20); // Keep last 20 attempts

  return {
    newState,
    result: attemptResult === 'success' ? 'success' : 'failure',
    details: {
      stakeLevel,
      successRate,
      attempt: attemptResult,
    },
  };
};

/**
 * Add catalysts to forge state
 */
export const addCatalysts = (
  state: ForgeState,
  gasShards: number = 0,
  blueprintFragments: number = 0
): ForgeState => {
  return {
    ...state,
    gasShards: state.gasShards + gasShards,
    blueprintFragments: state.blueprintFragments + blueprintFragments,
  };
};

// ========================================
// REACT HOOKS
// ========================================

export const useForgeSystem = (initialState?: Partial<ForgeState>) => {
  const [forgeState, setForgeState] = useState<ForgeState>({
    lastForgeTime: null,
    cooldownMinutes: 0,
    x10CoresGenerated: 0,
    gasShards: 0,
    blueprintFragments: 0,
    forgeHistory: [],
    ...initialState,
  });

  const attemptForge = useCallback(
    (stakingBalance: number, catalyst: CatalystType = 'none') => {
      const result = processForgeAttempt(forgeState, stakingBalance, catalyst);
      setForgeState(result.newState);
      return result;
    },
    [forgeState]
  );

  const addCatalyst = useCallback(
    (gasShards: number = 0, blueprintFragments: number = 0) => {
      setForgeState((prev) => addCatalysts(prev, gasShards, blueprintFragments));
    },
    []
  );

  const getReadiness = useCallback(
    (stakingBalance: number) => {
      const stakeLevel = determineStakeLevel(stakingBalance);
      const cooldownMs = getCooldownMs(stakeLevel);
      return checkForgeReadiness(forgeState.lastForgeTime, cooldownMs);
    },
    [forgeState.lastForgeTime]
  );

  const resetForge = useCallback(() => {
    setForgeState({
      lastForgeTime: null,
      cooldownMinutes: 0,
      x10CoresGenerated: 0,
      gasShards: 0,
      blueprintFragments: 0,
      forgeHistory: [],
    });
  }, []);

  return {
    forgeState,
    attemptForge,
    addCatalyst,
    getReadiness,
    resetForge,
    setForgeState,
  };
};

/**
 * Hook to track cooldown timer
 */
export const useForgeCountdown = (
  lastForgeTime: number | null,
  cooldownMs: number,
  onReady?: () => void
) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  React.useEffect(() => {
    if (lastForgeTime === null) {
      setTimeRemaining(0);
      return;
    }

    const updateTimer = () => {
      const readiness = checkForgeReadiness(lastForgeTime, cooldownMs);
      setTimeRemaining(readiness.timeUntilReady);

      if (readiness.timeUntilReady === 0 && onReady) {
        onReady();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lastForgeTime, cooldownMs, onReady]);

  return timeRemaining;
};

export default {
  determineStakeLevel,
  getCooldownMs,
  calculateSuccessRate,
  simulateForgeAttempt,
  checkForgeReadiness,
  formatTimeRemaining,
  processForgeAttempt,
  addCatalysts,
  useForgeSystem,
  useForgeCountdown,
};
