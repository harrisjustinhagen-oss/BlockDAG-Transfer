import React, { useState } from 'react';
import { Tier } from '../../services/ModifierService';
import { rollChestRewardModifiers, formatRolledModifiers } from '../../services/ModifierService';

type MarketplaceTab = 'catalyst_cores' | 'repair_kits' | 'x10_cores' | 'equipment';

type Listing = {
  listing_id: string;
  seller_id: string;
  seller_name: string;
  item_type: string;
  quantity: number;
  price_per_unit: number;
  total_price: number;
  time_remaining: string;
  // Equipment-only fields
  item_name?: string;
  tier?: Tier;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userBalance: number;
};

export const MarketplaceModal: React.FC<Props> = ({ isOpen, onClose, userId, userBalance }) => {
  const [activeTab, setActiveTab] = useState<MarketplaceTab>('catalyst_cores');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [showPurchaseConfirm, setShowPurchaseConfirm] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [rolledPreview, setRolledPreview] = useState<string[]>([]);

  // Mock listings data - replace with real API calls
  const mockListings: Record<MarketplaceTab, Listing[]> = {
    catalyst_cores: [
      {
        listing_id: '1',
        seller_id: 'siphon-player-1',
        seller_name: 'Logistics Master',
        item_type: 'catalyst_core',
        quantity: 50,
        price_per_unit: 5000,
        total_price: 5000,
        time_remaining: '5 days',
      },
      {
        listing_id: '2',
        seller_id: 'siphon-player-2',
        seller_name: 'Gas Refiner',
        item_type: 'catalyst_core',
        quantity: 25,
        price_per_unit: 5500,
        total_price: 5500,
        time_remaining: '3 days',
      },
      {
        listing_id: '3',
        seller_id: 'siphon-player-3',
        seller_name: 'Transaction Master',
        item_type: 'catalyst_core',
        quantity: 100,
        price_per_unit: 4800,
        total_price: 4800,
        time_remaining: '6 days',
      },
    ],
    repair_kits: [
      {
        listing_id: '4',
        seller_id: 'architect-player-1',
        seller_name: 'Builder',
        item_type: 'repair_kit',
        quantity: 30,
        price_per_unit: 2500,
        total_price: 2500,
        time_remaining: '7 days',
      },
      {
        listing_id: '5',
        seller_id: 'architect-player-2',
        seller_name: 'Craftsman',
        item_type: 'repair_kit',
        quantity: 15,
        price_per_unit: 2000,
        total_price: 2000,
        time_remaining: '4 days',
      },
    ],
    x10_cores: [
      {
        listing_id: '6',
        seller_id: 'vault-player-1',
        seller_name: 'High Roller',
        item_type: 'x10_core',
        quantity: 5,
        price_per_unit: 50000,
        total_price: 50000,
        time_remaining: '2 days',
      },
      {
        listing_id: '7',
        seller_id: 'vault-player-2',
        seller_name: 'Power Grid',
        item_type: 'x10_core',
        quantity: 3,
        price_per_unit: 48000,
        total_price: 48000,
        time_remaining: '6 days',
      },
    ],
    equipment: [
      {
        listing_id: '8',
        seller_id: 'vault-player-3',
        seller_name: 'Set Broker',
        item_type: 'equipment',
        item_name: 'Vault Helm',
        tier: 'blue',
        quantity: 1,
        price_per_unit: 32000,
        total_price: 32000,
        time_remaining: '2 days',
      },
      {
        listing_id: '9',
        seller_id: 'architect-player-3',
        seller_name: 'Master Builder',
        item_type: 'equipment',
        item_name: 'Architect Boots',
        tier: 'purple',
        quantity: 1,
        price_per_unit: 41000,
        total_price: 41000,
        time_remaining: '5 days',
      },
      {
        listing_id: '10',
        seller_id: 'broker-player-4',
        seller_name: 'Syndicate Vendor',
        item_type: 'equipment',
        item_name: 'Broker Ring',
        tier: 'orange',
        quantity: 1,
        price_per_unit: 65000,
        total_price: 65000,
        time_remaining: '6 days',
      },
    ],
  };

  const listings = mockListings[activeTab];

  const handleBuyClick = (listing: Listing) => {
    setSelectedListing(listing);
    setSelectedQuantity(1);
    setShowPurchaseConfirm(true);
    // If equipment, pre-roll modifiers preview
    if (listing.item_type === 'equipment' && listing.tier) {
      const mods = rollChestRewardModifiers(listing.tier);
      setRolledPreview(formatRolledModifiers(mods));
    } else {
      setRolledPreview([]);
    }
  };

  const calculateTotal = (listing: Listing, qty: number) => {
    return listing.price_per_unit * qty;
  };

  const handleConfirmPurchase = () => {
    if (selectedListing) {
      const total = calculateTotal(selectedListing, selectedQuantity);
      console.log(
        `Purchasing ${selectedQuantity} × ${selectedListing.item_type} for ${total} BDAG from ${selectedListing.seller_name}`
      );
      if (selectedListing.item_type === 'equipment' && selectedListing.tier) {
        // Final roll at purchase
        const finalMods = formatRolledModifiers(rollChestRewardModifiers(selectedListing.tier));
        setRolledPreview(finalMods);
      }
      setShowPurchaseConfirm(false);
      setSelectedListing(null);
      // TODO: Integrate with blockchain/backend
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-4xl bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-cyan-600/30 rounded-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-gradient-to-br from-slate-900 to-slate-950 pb-2">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏪</span>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Marketplace
            </h2>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600 text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {showPurchaseConfirm && selectedListing ? (
          /* Purchase Confirmation */
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-cyan-500/50 rounded-xl p-6 max-w-md w-full">
              <h3 className="text-2xl font-bold text-cyan-400 mb-4">
                Confirm Purchase
              </h3>

              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-4">
                <p className="text-sm text-slate-400 mb-1">Item</p>
                <p className="text-lg font-bold text-white capitalize">
                  {selectedListing.item_type.replace('_', ' ')}{selectedListing.item_type === 'equipment' && selectedListing.item_name ? ` — ${selectedListing.item_name}` : ''}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-1">Quantity</p>
                  <input
                    type="number"
                    min={1}
                    max={selectedListing.quantity}
                    value={selectedQuantity}
                    onChange={e => setSelectedQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white font-bold"
                  />
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-1">Price per Unit</p>
                  <p className="text-lg font-bold text-amber-400">
                    {selectedListing.price_per_unit.toLocaleString()} BDAG
                  </p>
                </div>
              </div>

              {selectedListing.item_type === 'equipment' && (
                <div className="bg-slate-800/50 border border-emerald-600/40 rounded-lg p-4 mb-4">
                  <p className="text-sm text-slate-400 mb-1">Rolled Modifiers (preview)</p>
                  {rolledPreview.length === 0 ? (
                    <p className="text-slate-500">Preview will roll on purchase.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {rolledPreview.map((txt, i) => (
                        <span key={i} className="px-2 py-1 rounded bg-slate-700 text-slate-200 text-xs border border-slate-600">
                          {txt}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-4">
                <p className="text-sm text-slate-400 mb-1">Total Cost</p>
                <p className="text-3xl font-bold text-amber-400">
                  {calculateTotal(selectedListing, selectedQuantity).toLocaleString()} BDAG
                </p>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6">
                <p className="text-sm text-slate-400 mb-1">Your Balance</p>
                <p className={`text-xl font-bold ${
                  userBalance >= calculateTotal(selectedListing, selectedQuantity)
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}>
                  {userBalance.toLocaleString()} BDAG
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPurchaseConfirm(false)}
                  className="flex-1 px-4 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPurchase}
                  disabled={userBalance < calculateTotal(selectedListing, selectedQuantity)}
                  className={`flex-1 px-4 py-3 rounded-lg font-bold transition-colors ${
                    userBalance >= calculateTotal(selectedListing, selectedQuantity)
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white cursor-pointer'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                  }`}
                >
                  Confirm Purchase
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* User Balance */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                Your Balance
              </p>
              <p className="text-3xl font-bold text-amber-400">
                {userBalance.toLocaleString()} BDAG
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-700">
              {(['catalyst_cores', 'repair_kits', 'x10_cores', 'equipment'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setSelectedQuantity(1);
                  }}
                  className={`px-4 py-3 font-bold border-b-2 transition-all ${
                    activeTab === tab
                      ? 'border-cyan-500 text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {tab === 'catalyst_cores' && '⚡ Catalyst Cores'}
                  {tab === 'repair_kits' && '🔧 Repair Kits'}
                  {tab === 'x10_cores' && '💎 X10 Cores'}
                  {tab === 'equipment' && '🧰 Equipment'}
                </button>
              ))}
            </div>

            {/* Listings */}
            <div className="space-y-3">
              {listings.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-lg">No listings available</p>
                </div>
              ) : (
                listings.map(listing => (
                  <div
                    key={listing.listing_id}
                    className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:bg-slate-800/70 hover:border-slate-600 transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Seller</p>
                        <p className="text-lg font-bold text-cyan-400">
                          {listing.seller_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400 mb-1">Available</p>
                        <p className="text-lg font-bold text-white">
                          {listing.quantity} units
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Price/Unit</p>
                        <p className="font-bold text-amber-400">
                          {listing.price_per_unit.toLocaleString()} BDAG
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Expires</p>
                        <p className="font-bold text-slate-300">
                          {listing.time_remaining}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400 mb-1">Stock Rating</p>
                        <p className="font-bold text-green-400">
                          {'★'.repeat(Math.min(5, Math.ceil(listing.quantity / 20)))}
                        </p>
                      </div>
                    </div>

                    {listing.item_type === 'equipment' && listing.tier && (
                      <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-3 mb-3">
                        <p className="text-xs text-slate-400 mb-1">Tier</p>
                        <p className="font-bold text-slate-200">{listing.tier.toUpperCase()}</p>
                        <p className="text-xs text-slate-500 mt-1">Modifiers roll on purchase according to tier ranges.</p>
                      </div>
                    )}

                    <button
                      onClick={() => handleBuyClick(listing)}
                      className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold transition-all"
                    >
                      🛒 Buy Now
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Info Footer */}
            <div className="mt-6 p-3 bg-slate-800/30 border border-slate-700 rounded-lg">
              <p className="text-xs text-slate-400">
                💡 <span className="text-slate-300">Marketplace Info:</span> Listings expire after 7 days. Catalyst Cores from Siphon players. Repair Kits from Architect players. X10 Cores from Vault players.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MarketplaceModal;
