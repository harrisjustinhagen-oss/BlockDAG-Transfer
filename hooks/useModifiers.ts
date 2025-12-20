import { useMemo, useState, useCallback } from 'react';
import {
  Tier,
  RolledModifier,
  rollModifiersForTier,
  rollChestRewardModifiers,
  rollCraftingModifiers,
  formatRolledModifiers,
} from '../services/ModifierService';

export const useModifiers = (tier: Tier) => {
  const [lastRoll, setLastRoll] = useState<RolledModifier[]>([]);

  const rollGuaranteed = useCallback(() => {
    const mods = rollModifiersForTier(tier);
    setLastRoll(mods);
    return mods;
  }, [tier]);

  const rollChest = useCallback(() => {
    const mods = rollChestRewardModifiers(tier);
    setLastRoll(mods);
    return mods;
  }, [tier]);

  const rollCraft = useCallback(() => {
    const mods = rollCraftingModifiers(tier);
    setLastRoll(mods);
    return mods;
  }, [tier]);

  const asText = useMemo(() => formatRolledModifiers(lastRoll), [lastRoll]);

  return {
    lastRoll,
    asText,
    rollGuaranteed,
    rollChest,
    rollCraft,
  };
};
