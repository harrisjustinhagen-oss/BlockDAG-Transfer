import React, { useState, useEffect } from 'react';
import { useForgeReadiness, useForgeStats, useRecordForge, useForgeReadinessDisplay, useUserEconomyMetrics } from '../../hooks/useUserInventoryScarcity';
import { FORGE_SCARCITY_CONFIG } from '../../services/EquipmentService';
import { useModifiers } from '../../hooks/useModifiers';
import { Tier } from '../../services/ModifierService';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  stakingBalance: number; // User's current BDAG staking balance
};

export const ForgeModal: React.FC<Props> = ({ isOpen, onClose, userId, stakingBalance }) => {
  const [showResult, setShowResult] = useState(false);
  const [forgeResult, setForgeResult] = useState<{
    success: boolean;
    message: string;
    x10CoresGained: number;
    resourcesConsumed: { gas_shards: number; blueprint_fragments: number };
  } | null>(null);

  // Hooks for forge data
  const { isReady, timeDisplay, stakeLevel, loading: readinessLoading } = useForgeReadiness(userId);
  const { stats, loading: statsLoading } = useForgeStats(userId);
  const { recordForge, loading: recordLoading } = useRecordForge(userId);
  const display = useForgeReadinessDisplay(userId);
  const { metrics } = useUserEconomyMetrics(userId);
  // Assume item tier derived from stake level for demo: blue for low, orange for high
  const assumedTier: Tier = stakeLevel === 'high_stakes' ? 'orange' : 'blue';
  const { rollCraft, asText } = useModifiers(assumedTier);

  // Determine success rate based on catalyst availability
  const hasCatalyst = (stats?.catalysts_owned || 0) > 0;
  const successRate = hasCatalyst ? 1.0 : FORGE_SCARCITY_CONFIG.BASE_SUCCESS_RATE;
  const successPercentage = Math.round(successRate * 100);

  // Can attempt forge if: ready + has resources
  const canAttempt =
    isReady &&
    (stats?.gas_shards_balance || 0) >= FORGE_SCARCITY_CONFIG.GAS_SHARDS_COST &&
    !recordLoading;

  const handleAttemptForge = async () => {
    try {
      // Determine if forge succeeds
      const rand = Math.random();
      const success = rand < successRate;

      // Record attempt
      const history = await recordForge(
        success ? 'success' : 'failure',
        stakingBalance,
        hasCatalyst,
        {
          gas_shards: FORGE_SCARCITY_CONFIG.GAS_SHARDS_COST,
          blueprint_fragments: FORGE_SCARCITY_CONFIG.BLUEPRINT_FRAGMENTS_COST,
        }
      );

      // Roll modifiers if success (crafting reward modifiers)
      const rolledText = success ? rollCraft().map(t => t).join(', ') : '';

      // Show result
      setForgeResult({
        success,
        message: success 
          ? '🎉 Forge Successful! X10 Core Generated!' 
          : '❌ Forge Failed. Resources Lost.',
        x10CoresGained: success ? 1 : 0,
        resourcesConsumed: {
          gas_shards: FORGE_SCARCITY_CONFIG.GAS_SHARDS_COST,
          blueprint_fragments: FORGE_SCARCITY_CONFIG.BLUEPRINT_FRAGMENTS_COST,
        },
      });
      setShowResult(true);

      // Auto-close result after 3 seconds
      setTimeout(() => {
        setShowResult(false);
        setForgeResult(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to attempt forge:', err);
    }
  };

  if (!isOpen) return null;

  const loading = readinessLoading || statsLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-2xl bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-amber-600/30 rounded-xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚒️</span>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              Forge Overdrive
            </h2>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600 text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin text-4xl mb-2">⚙️</div>
            <p className="text-slate-300">Loading forge data...</p>
          </div>
        ) : showResult && forgeResult ? (
          /* Result Display */
          <div
            className={`text-center py-12 rounded-lg border-2 ${
              forgeResult.success
                ? 'bg-green-900/20 border-green-500/50'
                : 'bg-red-900/20 border-red-500/50'
            }`}
          >
            <div className="text-6xl mb-4">
              {forgeResult.success ? '✨' : '💥'}
            </div>
            <p className="text-3xl font-bold text-white mb-2">
              {forgeResult.message}
            </p>
            {forgeResult.success && (
              <p className="text-lg text-green-300 mb-4">
                +{forgeResult.x10CoresGained} X10 Core Generated!
              </p>
            )}
            <p className="text-sm text-slate-400">
              Resources Consumed: {forgeResult.resourcesConsumed.gas_shards} Gas Shards, {forgeResult.resourcesConsumed.blueprint_fragments} Fragments
            </p>
          </div>
        ) : (
          <>
            {/* Stake Status Section */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                  Staking Balance
                </p>
                <p className="text-2xl font-bold text-cyan-400">
                  {stakingBalance.toLocaleString()} BDAG
                </p>
              </div>

              <div className={`bg-slate-800/50 border rounded-lg p-4 ${
                stakeLevel === 'high_stakes'
                  ? 'border-amber-500/50'
                  : 'border-blue-500/50'
              }`}>
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                  Stake Level
                </p>
                <p className={`text-2xl font-bold ${
                  stakeLevel === 'high_stakes'
                    ? 'text-amber-400'
                    : 'text-blue-400'
                }`}>
                  {stakeLevel === 'high_stakes' ? 'HIGH' : 'LOW'}
                </p>
              </div>
            </div>

            {/* Cooldown & Status Section */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">
                Forge Status
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-lg font-bold ${
                    display.status === 'ready'
                      ? 'text-green-400'
                      : display.status === 'cooldown'
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  }`}>
                    {display.status === 'ready'
                      ? '✅ Ready to Forge!'
                      : display.status === 'cooldown'
                      ? '⏱️ Cooldown Active'
                      : '🔒 Cannot Forge'}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    {display.message}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-mono text-amber-400">
                    {display.timeRemaining}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {stakeLevel === 'high_stakes' ? '48h' : '7d'} cooldown
                  </p>
                </div>
              </div>
            </div>

            {/* Resources Section */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">
                  Gas Shards
                </p>
                <div className="flex items-baseline gap-2">
                  <p className={`text-2xl font-bold ${
                    (stats?.gas_shards_balance || 0) >= FORGE_SCARCITY_CONFIG.GAS_SHARDS_COST
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}>
                    {stats?.gas_shards_balance || 0}
                  </p>
                  <p className="text-sm text-slate-500">
                    / {FORGE_SCARCITY_CONFIG.GAS_SHARDS_COST}
                  </p>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">
                  Blueprints
                </p>
                <div className="flex items-baseline gap-2">
                  <p className={`text-2xl font-bold ${
                    (stats?.blueprint_fragments_balance || 0) >= FORGE_SCARCITY_CONFIG.BLUEPRINT_FRAGMENTS_COST
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}>
                    {stats?.blueprint_fragments_balance || 0}
                  </p>
                  <p className="text-sm text-slate-500">
                    / {FORGE_SCARCITY_CONFIG.BLUEPRINT_FRAGMENTS_COST}
                  </p>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">
                  Catalysts
                </p>
                <p className={`text-2xl font-bold ${
                  hasCatalyst ? 'text-amber-400' : 'text-slate-500'
                }`}>
                  {stats?.catalysts_owned || 0}
                </p>
              </div>
            </div>

            {/* Success Rate Section */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-3">
                Success Rate
              </p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        hasCatalyst
                          ? 'bg-gradient-to-r from-green-500 to-green-400'
                          : 'bg-gradient-to-r from-yellow-500 to-orange-400'
                      }`}
                      style={{ width: `${successPercentage}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    {successPercentage}%
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {hasCatalyst ? '✨ Catalyst Used' : 'No Catalyst'}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400 mb-1">X10 Cores</p>
                <p className="text-xl font-bold text-cyan-400">
                  {stats?.x10_cores_generated || 0}
                </p>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400 mb-1">Success Rate</p>
                <p className="text-xl font-bold text-green-400">
                  {stats?.success_rate ? (stats.success_rate * 100).toFixed(1) : 0}%
                </p>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400 mb-1">Total Forges</p>
                <p className="text-xl font-bold text-purple-400">
                  {stats?.total_forges_completed || 0}
                </p>
              </div>
            </div>

            {/* Rolled Modifiers (on success) */}
            {showResult && forgeResult?.success && (
              <div className="bg-slate-800/50 border border-emerald-600/40 rounded-lg p-3 mb-4">
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Reward Modifiers</p>
                <p className="text-sm text-emerald-300">{asText.join(' • ')}</p>
              </div>
            )}

            {/* Forge Button */}
            <button
              onClick={handleAttemptForge}
              disabled={!canAttempt}
              className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
                canAttempt
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white cursor-pointer shadow-lg'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
              }`}
            >
              {recordLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⚙️</span>
                  Forging...
                </span>
              ) : (
                <span>
                  ⚒️ Attempt Forge
                  {!canAttempt && (
                    <span className="text-sm block mt-1">
                      {!isReady ? 'Cooldown Active' : 'Insufficient Resources'}
                    </span>
                  )}
                </span>
              )}
            </button>

            {/* Info Footer */}
            <div className="mt-4 p-3 bg-slate-800/30 border border-slate-700 rounded-lg">
              <p className="text-xs text-slate-400">
                💡 <span className="text-slate-300">Forge Mechanics:</span> High-Stakes (≥50k BDAG) = 48h cooldown. Low-Stakes = 7d cooldown. Failures cost +20% cooldown time.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgeModal;
