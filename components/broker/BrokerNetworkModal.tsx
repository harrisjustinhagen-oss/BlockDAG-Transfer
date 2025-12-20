import React, { useState, useEffect } from 'react';

type NetworkBroadcast = {
  broadcast_id: string;
  broadcaster_name: string;
  broadcaster_set: string;
  boost_type: 'forge_success' | 'repair_discount' | 'fee_reduction';
  boost_value: number;
  affected_friend_count: number;
  time_remaining: string;
  is_active: boolean;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
};

export const BrokerNetworkModal: React.FC<Props> = ({ isOpen, onClose, userId }) => {
  const [broadcasts, setBroadcasts] = useState<NetworkBroadcast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with real API calls
    const mockBroadcasts: NetworkBroadcast[] = [
      {
        broadcast_id: '1',
        broadcaster_name: 'Syndicate Master',
        broadcaster_set: 'BROKER',
        boost_type: 'forge_success',
        boost_value: 0.1,
        affected_friend_count: 15,
        time_remaining: '1h 45m',
        is_active: true,
      },
      {
        broadcast_id: '2',
        broadcaster_name: 'Network Hub',
        broadcaster_set: 'BROKER',
        boost_type: 'repair_discount',
        boost_value: 0.05,
        affected_friend_count: 8,
        time_remaining: '32m',
        is_active: true,
      },
      {
        broadcast_id: '3',
        broadcaster_name: 'Fee Waiver',
        broadcaster_set: 'BROKER',
        boost_type: 'fee_reduction',
        boost_value: 0.15,
        affected_friend_count: 22,
        time_remaining: '2h 10m',
        is_active: true,
      },
    ];

    setLoading(false);
    setBroadcasts(mockBroadcasts);
  }, [userId]);

  if (!isOpen) return null;

  const getBoostIcon = (boostType: string) => {
    switch (boostType) {
      case 'forge_success':
        return '⚒️';
      case 'repair_discount':
        return '🔧';
      case 'fee_reduction':
        return '💰';
      default:
        return '✨';
    }
  };

  const getBoostLabel = (boostType: string) => {
    switch (boostType) {
      case 'forge_success':
        return 'Forge Success Boost';
      case 'repair_discount':
        return 'Repair Discount';
      case 'fee_reduction':
        return 'Fee Reduction';
      default:
        return 'Boost';
    }
  };

  const getBoostColor = (boostType: string) => {
    switch (boostType) {
      case 'forge_success':
        return 'from-amber-500 to-orange-500';
      case 'repair_discount':
        return 'from-blue-500 to-cyan-500';
      case 'fee_reduction':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-purple-500 to-pink-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-3xl bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-purple-600/30 rounded-xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🤝</span>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              Broker Network
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
            <p className="text-slate-300">Loading network status...</p>
          </div>
        ) : broadcasts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-2xl mb-2">📡</p>
            <p className="text-slate-300">No active broadcasts from your friends</p>
            <p className="text-sm text-slate-400 mt-2">
              Your Broker friends will send you boosts when you're connected!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {broadcasts.map(broadcast => (
              <div
                key={broadcast.broadcast_id}
                className={`border-2 border-purple-500/30 rounded-lg p-5 transition-all ${
                  broadcast.is_active
                    ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 shadow-lg shadow-purple-500/20'
                    : 'bg-slate-800/30 opacity-50'
                }`}
              >
                {/* Top Row: Broadcaster + Status */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Broadcaster</p>
                    <p className="text-xl font-bold text-white">
                      {broadcast.broadcaster_name}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-1 rounded bg-purple-600/30 border border-purple-500/50 text-xs text-purple-300">
                        {broadcast.broadcaster_set}
                      </span>
                      {broadcast.is_active && (
                        <span className="px-2 py-1 rounded bg-green-600/30 border border-green-500/50 text-xs text-green-300 flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          Active
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-slate-400 mb-1">Friends Affected</p>
                    <p className="text-3xl font-bold text-purple-300">
                      {broadcast.affected_friend_count}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">in network</p>
                  </div>
                </div>

                {/* Boost Display */}
                <div
                  className={`bg-gradient-to-r ${getBoostColor(
                    broadcast.boost_type
                  )} rounded-lg p-4 mb-4`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{getBoostIcon(broadcast.boost_type)}</span>
                      <div>
                        <p className="text-sm text-white/80">
                          {getBoostLabel(broadcast.boost_type)}
                        </p>
                        <p className="text-2xl font-bold text-white">
                          +{(broadcast.boost_value * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-white">
                      <p className="text-sm">Time Remaining</p>
                      <p className="text-2xl font-bold">{broadcast.time_remaining}</p>
                    </div>
                  </div>
                </div>

                {/* Boost Description */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                  <p className="text-sm text-slate-300">
                    {broadcast.boost_type === 'forge_success' &&
                      `✅ You have +${(broadcast.boost_value * 100).toFixed(0)}% chance increase to forge success!`}
                    {broadcast.boost_type === 'repair_discount' &&
                      `🔧 Repair costs are reduced by ${(broadcast.boost_value * 100).toFixed(0)}%!`}
                    {broadcast.boost_type === 'fee_reduction' &&
                      `💰 Transaction fees are reduced by ${(broadcast.boost_value * 100).toFixed(0)}%!`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Network Info */}
        <div className="mt-6 p-4 bg-slate-800/30 border border-slate-700 rounded-lg">
          <p className="text-xs text-slate-400 mb-2">
            💡 <span className="text-slate-300 font-bold">How Broker Network Works:</span>
          </p>
          <ul className="text-xs text-slate-400 space-y-1 ml-4">
            <li>• Broker players broadcast bonuses to their friend list</li>
            <li>• +10% forge success boost for 2 hours</li>
            <li>• Bulk purchase discount (5% off X10 Cores)</li>
            <li>• Earn 0.5% commission on all friends' marketplace transactions</li>
            <li>• Build your syndicate for network effects!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BrokerNetworkModal;
