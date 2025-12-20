import React, { useMemo, useState } from 'react';
import { Tier } from '../../services/ModifierService';
import { useModifiers } from '../../hooks/useModifiers';

export type LootChestProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultTier?: Tier;
  onClaim?: (tier: Tier, modifiers: { key: string; value: number }[]) => void;
};

const TIERS: Tier[] = ['white', 'green', 'blue', 'purple', 'orange'];

export const LootChestModal: React.FC<LootChestProps> = ({ isOpen, onClose, defaultTier = 'blue', onClaim }) => {
  const [tier, setTier] = useState<Tier>(defaultTier);
  const { lastRoll, asText, rollChest } = useModifiers(tier);

  const titleColor = useMemo(() => {
    switch (tier) {
      case 'white':
        return 'text-slate-200';
      case 'green':
        return 'text-emerald-400';
      case 'blue':
        return 'text-cyan-400';
      case 'purple':
        return 'text-purple-400';
      case 'orange':
        return 'text-amber-400';
      default:
        return 'text-white';
    }
  }, [tier]);

  if (!isOpen) return null;

  const handleOpenChest = () => {
    rollChest();
  };

  const handleClaim = () => {
    if (onClaim) onClaim(tier, lastRoll.map(m => ({ key: m.key, value: m.value })));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-xl bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-indigo-600/30 rounded-xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-3xl font-bold ${titleColor}`}>Loot Chest</h2>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600 text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tier selector */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {TIERS.map(t => (
            <button
              key={t}
              onClick={() => setTier(t)}
              className={`px-3 py-2 rounded border transition-all ${
                tier === t ? 'border-indigo-500 bg-slate-800 text-white' : 'border-slate-700 bg-slate-800/40 text-slate-300'
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Description */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-4">
          <p className="text-sm text-slate-300">
            Open a {tier.toUpperCase()} tier chest to roll modifiers according to its rarity. Legendary chests guarantee an extra modifier.
          </p>
        </div>

        {/* Result panel */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6 min-h-[84px]">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Rolled Modifiers</p>
          {asText.length === 0 ? (
            <p className="text-slate-500">No modifiers yet. Click "Open Chest" to roll.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {asText.map((txt, i) => (
                <span key={i} className="px-2 py-1 rounded bg-slate-700 text-slate-200 text-xs border border-slate-600">
                  {txt}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleOpenChest}
            className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-bold"
          >
            🎁 Open Chest
          </button>
          <button
            onClick={handleClaim}
            disabled={asText.length === 0}
            className={`flex-1 px-4 py-3 rounded-lg font-bold transition-colors ${
              asText.length > 0
                ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
            }`}
          >
            ✅ Claim
          </button>
        </div>

        <div className="mt-4 p-3 bg-slate-800/30 border border-slate-700 rounded-lg">
          <p className="text-xs text-slate-400">
            💡 Tier Rules: Green = 1 modifier, Blue = 2, Purple = 3 (+chance for +1), Orange = 3 (+1 guaranteed). Values roll within tier ranges.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LootChestModal;
