import { useMemo, useState, useCallback, useEffect } from 'react';
import { EquipmentSet } from '../services/EquipmentSkinSystem';
import { SlotState, computeGroupBuffs, formatTotals } from '../services/GroupBuffService';

export interface GroupApi {
  getSlots: (handle: string) => Promise<SlotState[]>;
  setInvite: (args: { handle: string; set: string; invitedId: string }) => Promise<void>;
  acceptSlot: (args: { invitedHandle: string; set: string }) => Promise<void>;
  revokeSlot: (args: { handle: string; set: string }) => Promise<void>;
}

const DEFAULT_SLOTS: SlotState[] = [
  { set: 'mint' },
  { set: 'vault' },
  { set: 'siphon' },
  { set: 'architect' },
  { set: 'broker' },
];

const DEFAULT_STORAGE_KEY = 'groupSlots:v1';
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const useGroupBuffs = (options?: { storageKey?: string; handle?: string; api?: GroupApi }) => {
  const storageKey = options?.storageKey || DEFAULT_STORAGE_KEY;
  const handle = options?.handle;
  const api = options?.api;

  const [slots, setSlots] = useState<SlotState[]>(() => {
    if (api && handle) return DEFAULT_SLOTS; // will load from API
    if (typeof window === 'undefined') return DEFAULT_SLOTS;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return DEFAULT_SLOTS;
      const parsed = JSON.parse(raw) as SlotState[];
      const ordered = DEFAULT_SLOTS.map(base => parsed.find(p => p.set === base.set) || base);
      return ordered;
    } catch (err) {
      console.error('Failed to load group slots, using defaults', err);
      return DEFAULT_SLOTS;
    }
  });

  const loadFromApi = useCallback(async () => {
    if (!api || !handle) return;
    try {
      const remote = await api.getSlots(handle);
      const ordered = DEFAULT_SLOTS.map(base => {
        const found = remote.find(r => r.set === base.set);
        if (!found) return base;
        return { ...found, confirmedWearing: found.accepted || found.confirmedWearing } as SlotState;
      });
      setSlots(ordered);
    } catch (err) {
      console.error('Failed to load slots from API', err);
    }
  }, [api, handle]);

  useEffect(() => {
    if (api && handle) return; // backend is source of truth
    try {
      localStorage.setItem(storageKey, JSON.stringify(slots));
    } catch (err) {
      console.error('Failed to persist group slots', err);
    }
  }, [slots, storageKey, api, handle]);

  // Enforce single-team rule: a given invitedId may only exist in one slot
  const setInvite = useCallback(async (index: number, invitedId: string) => {
    const trimmed = invitedId.trim();
    if (api && handle) {
      if (!trimmed) {
        // clear via revoke
        const set = DEFAULT_SLOTS[index].set;
        await api.revokeSlot({ handle, set });
        await loadFromApi();
        return;
      }
      await api.setInvite({ handle, set: DEFAULT_SLOTS[index].set, invitedId: trimmed });
      await loadFromApi();
      return;
    }

    setSlots(prev => prev.map((s, i) => {
      if (i === index) {
        return { ...s, invitedId: trimmed || undefined, accepted: false, confirmedWearing: false, expiresAt: undefined };
      }
      if (trimmed && s.invitedId === trimmed) {
        return { ...s, invitedId: undefined, accepted: false, confirmedWearing: false, expiresAt: undefined };
      }
      return s;
    }));
  }, [api, handle, loadFromApi]);

  const confirmSlot = useCallback(async (index: number) => {
    if (api && handle) {
      const target = slots[index];
      if (!target?.invitedId) return;
      await api.acceptSlot({ invitedHandle: target.invitedId, set: target.set });
      await loadFromApi();
      return;
    }
    const expiresAt = Date.now() + WEEK_MS;
    setSlots(prev => prev.map((s, i) => (i === index ? { ...s, confirmedWearing: true, accepted: true, expiresAt } : s)));
  }, [api, handle, slots, loadFromApi]);

  const revokeSlot = useCallback(async (index: number) => {
    if (api && handle) {
      await api.revokeSlot({ handle, set: slots[index].set });
      await loadFromApi();
      return;
    }
    setSlots(prev => prev.map((s, i) => (i === index ? { ...s, confirmedWearing: false, accepted: false, expiresAt: undefined, invitedId: undefined } : s)));
  }, [api, handle, slots, loadFromApi]);

  // Expire stale slots on load (local-only)
  useEffect(() => {
    if (api && handle) return;
    const now = Date.now();
    setSlots(prev => prev.map(slot => {
      if (slot.expiresAt && slot.expiresAt < now) {
        return { ...slot, invitedId: undefined, confirmedWearing: false, accepted: false, expiresAt: undefined };
      }
      return slot;
    }));
  }, [api, handle]);

  // Initial load from API if provided
  useEffect(() => {
    loadFromApi();
  }, [loadFromApi]);

  const { totals, activeBuffs } = useMemo(() => computeGroupBuffs(slots), [slots]);
  const totalsText = useMemo(() => formatTotals(totals), [totals]);

  return {
    slots,
    totals,
    totalsText,
    activeBuffs,
    setInvite,
    confirmSlot,
    revokeSlot,
    setSlots,
  };
};
