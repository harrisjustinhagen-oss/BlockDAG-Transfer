export type Tier = 'white' | 'green' | 'blue' | 'purple' | 'orange';
export type ModifierKey = 'STR' | 'CON' | 'DEX' | 'INT' | 'WIS' | 'ARMOR';

export interface ModifierRange {
  min: number;
  max: number;
}

export interface RolledModifier {
  key: ModifierKey;
  value: number;
}

export interface RollOptions {
  includeArmor?: boolean; // default true
  extraCount?: number; // optionally add extra modifiers beyond guaranteed
  disallowDuplicates?: boolean; // default true
}

// Map tier -> guaranteed number of modifiers
export const GUARANTEED_MODIFIERS: Record<Tier, number> = {
  white: 0,
  green: 1,
  blue: 2,
  purple: 3,
  orange: 3,
};

// Human-friendly tier metadata
export const TIER_INFO: Record<Tier, { level: number; name: string }> = {
  white: { level: 1, name: 'Common' },
  green: { level: 2, name: 'Tempered' },
  blue: { level: 3, name: 'Rare' },
  purple: { level: 4, name: 'Very Rare' },
  orange: { level: 5, name: 'Legendary' },
};

// Value ranges per modifier by tier, based on provided sheet
export const MODIFIER_RANGES: Record<ModifierKey, Partial<Record<Tier, ModifierRange>>> = {
  STR: {
    green: { min: 1, max: 1 },
    blue: { min: 1, max: 2 },
    purple: { min: 2, max: 4 },
    orange: { min: 3, max: 5 },
  },
  CON: {
    green: { min: 1, max: 1 },
    blue: { min: 1, max: 2 },
    purple: { min: 2, max: 4 },
    orange: { min: 3, max: 5 },
  },
  DEX: {
    green: { min: 1, max: 1 },
    blue: { min: 1, max: 2 },
    purple: { min: 2, max: 4 },
    orange: { min: 3, max: 5 },
  },
  INT: {
    green: { min: 1, max: 1 },
    blue: { min: 1, max: 2 },
    purple: { min: 2, max: 4 },
    orange: { min: 3, max: 5 },
  },
  WIS: {
    green: { min: 1, max: 1 },
    blue: { min: 1, max: 2 },
    purple: { min: 2, max: 4 },
    orange: { min: 3, max: 5 },
  },
  ARMOR: {
    green: { min: 2, max: 4 },
    blue: { min: 4, max: 6 },
    purple: { min: 6, max: 8 },
    orange: { min: 8, max: 10 },
  },
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickUnique<T>(arr: T[], count: number): T[] {
  const copy = [...arr];
  const result: T[] = [];
  const picks = Math.min(count, copy.length);
  for (let i = 0; i < picks; i++) {
    const idx = randomInt(0, copy.length - 1);
    result.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return result;
}

/**
 * Get all modifier keys that have valid ranges for the given tier
 */
export function getEligibleModifiers(tier: Tier, includeArmor: boolean = true): ModifierKey[] {
  const keys: ModifierKey[] = ['STR', 'CON', 'DEX', 'INT', 'WIS'];
  if (includeArmor) keys.push('ARMOR');
  return keys.filter(k => MODIFIER_RANGES[k][tier] !== undefined);
}

/**
 * Roll a single modifier value for the given tier and key
 */
export function rollModifierValue(tier: Tier, key: ModifierKey): number {
  const range = MODIFIER_RANGES[key][tier];
  if (!range) throw new Error(`No range for ${key} at tier ${tier}`);
  return randomInt(range.min, range.max);
}

/**
 * Roll modifiers for an item based on its tier.
 * - Uses guaranteed counts per tier
 * - Randomly selects unique modifier keys from eligible list
 * - Rolls a value within tier range for each selected key
 */
export function rollModifiersForTier(tier: Tier, options: RollOptions = {}): RolledModifier[] {
  const includeArmor = options.includeArmor ?? true;
  const disallowDuplicates = options.disallowDuplicates ?? true;
  const baseCount = GUARANTEED_MODIFIERS[tier];
  const extraCount = options.extraCount ?? 0; // caller can pass +1 for orange if desired
  const targetCount = baseCount + extraCount;

  const eligible = getEligibleModifiers(tier, includeArmor);
  if (targetCount === 0 || eligible.length === 0) return [];

  const selectedKeys = disallowDuplicates
    ? pickUnique(eligible, targetCount)
    : Array.from({ length: targetCount }, () => eligible[randomInt(0, eligible.length - 1)]);

  return selectedKeys.map(key => ({ key, value: rollModifierValue(tier, key) }));
}

/**
 * Convenience: roll modifiers for a chest reward with sensible extras.
 * - Purple: +0-1 random extra modifier
 * - Orange: +1 guaranteed extra modifier
 */
export function rollChestRewardModifiers(tier: Tier): RolledModifier[] {
  let extra = 0;
  if (tier === 'purple') extra = Math.random() < 0.5 ? 1 : 0; // 50% chance for +1
  if (tier === 'orange') extra = 1; // always +1
  return rollModifiersForTier(tier, { extraCount: extra });
}

/**
 * Convenience: roll modifiers for crafting.
 * - No extras by default (uses guaranteed only)
 */
export function rollCraftingModifiers(tier: Tier): RolledModifier[] {
  return rollModifiersForTier(tier);
}

/**
 * Apply rolled modifiers to a display string.
 */
export function formatRolledModifiers(mods: RolledModifier[]): string[] {
  return mods.map(m => `${m.key} +${m.value}`);
}

// Example usage:
// const mods = rollModifiersForTier('blue');
// console.log(mods); // e.g., [{ key: 'STR', value: 2 }, { key: 'ARMOR', value: 4 }]
