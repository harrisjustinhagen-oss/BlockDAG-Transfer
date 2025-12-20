import { EquipmentSet } from './EquipmentSkinSystem';

export type GroupBuffType =
  | 'cashback_pct'
  | 'staking_apy_pct'
  | 'fee_reduction_pct'
  | 'crafting_cost_pct'
  | 'forge_success_pct';

export interface GroupBuff {
  key: GroupBuffType;
  value: number; // percentage as decimal, e.g., 0.002 for 0.2%
  sourceSet: EquipmentSet;
  label: string; // human readable
}

export interface GroupBuffTotals {
  cashback_pct: number;
  staking_apy_pct: number;
  fee_reduction_pct: number;
  crafting_cost_pct: number;
  forge_success_pct: number;
}

export interface SlotState {
  set: EquipmentSet;
  invitedId?: string; // username / wallet id
  confirmedWearing?: boolean; // toggled when friend is wearing the set
  accepted?: boolean; // invite accepted
  expiresAt?: number; // epoch ms when buff expires
}

// Small, economy-safe per-slot buffs
export const PER_SLOT_BUFFS: Record<EquipmentSet, GroupBuff> = {
  mint: {
    key: 'cashback_pct',
    value: 0.002, // +0.2%
    sourceSet: 'mint',
    label: '+0.2% BDAG cashback',
  },
  vault: {
    key: 'staking_apy_pct',
    value: 0.0015, // +0.15%
    sourceSet: 'vault',
    label: '+0.15% staking APY',
  },
  siphon: {
    key: 'fee_reduction_pct',
    value: 0.03, // -3%
    sourceSet: 'siphon',
    label: '-3% transaction fees',
  },
  architect: {
    key: 'crafting_cost_pct',
    value: 0.02, // -2%
    sourceSet: 'architect',
    label: '-2% crafting costs',
  },
  broker: {
    key: 'forge_success_pct',
    value: 0.02, // +2% forge success
    sourceSet: 'broker',
    label: '+2% forge success chance',
  },
};

// Caps to prevent economy-breaking stacking
export const GROUP_BUFF_CAPS: GroupBuffTotals = {
  cashback_pct: 0.01, // +1% max
  staking_apy_pct: 0.0075, // +0.75% max
  fee_reduction_pct: 0.15, // -15% max
  crafting_cost_pct: 0.10, // -10% max
  forge_success_pct: 0.10, // +10% max
};

export function computeGroupBuffs(slots: SlotState[]): { totals: GroupBuffTotals; activeBuffs: GroupBuff[] } {
  const totals: GroupBuffTotals = {
    cashback_pct: 0,
    staking_apy_pct: 0,
    fee_reduction_pct: 0,
    crafting_cost_pct: 0,
    forge_success_pct: 0,
  };

  const activeBuffs: GroupBuff[] = [];

  for (const slot of slots) {
    const now = Date.now();
    if (!slot.confirmedWearing) continue; // only applied when wearing
    if (!slot.accepted) continue; // must be accepted
    if (slot.expiresAt && slot.expiresAt < now) continue; // must be within validity window
    const buff = PER_SLOT_BUFFS[slot.set];
    activeBuffs.push(buff);
    switch (buff.key) {
      case 'cashback_pct':
        totals.cashback_pct += buff.value;
        break;
      case 'staking_apy_pct':
        totals.staking_apy_pct += buff.value;
        break;
      case 'fee_reduction_pct':
        totals.fee_reduction_pct += buff.value;
        break;
      case 'crafting_cost_pct':
        totals.crafting_cost_pct += buff.value;
        break;
      case 'forge_success_pct':
        totals.forge_success_pct += buff.value;
        break;
    }
  }

  // Apply caps
  totals.cashback_pct = Math.min(totals.cashback_pct, GROUP_BUFF_CAPS.cashback_pct);
  totals.staking_apy_pct = Math.min(totals.staking_apy_pct, GROUP_BUFF_CAPS.staking_apy_pct);
  totals.fee_reduction_pct = Math.min(totals.fee_reduction_pct, GROUP_BUFF_CAPS.fee_reduction_pct);
  totals.crafting_cost_pct = Math.min(totals.crafting_cost_pct, GROUP_BUFF_CAPS.crafting_cost_pct);
  totals.forge_success_pct = Math.min(totals.forge_success_pct, GROUP_BUFF_CAPS.forge_success_pct);

  return { totals, activeBuffs };
}

export function formatTotals(totals: GroupBuffTotals): Array<{ label: string; valueText: string }> {
  return [
    { label: 'Cashback', valueText: `${(totals.cashback_pct * 100).toFixed(1)}%` },
    { label: 'Staking APY', valueText: `${(totals.staking_apy_pct * 100).toFixed(2)}%` },
    { label: 'Fee Reduction', valueText: `${(totals.fee_reduction_pct * 100).toFixed(0)}%` },
    { label: 'Crafting Cost', valueText: `${(totals.crafting_cost_pct * 100).toFixed(0)}%` },
    { label: 'Forge Success', valueText: `${(totals.forge_success_pct * 100).toFixed(0)}%` },
  ];
}
