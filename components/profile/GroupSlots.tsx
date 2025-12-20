import React from 'react';
import { useGroupBuffs } from '../../hooks/useGroupBuffs';
import { PER_SLOT_BUFFS } from '../../services/GroupBuffService';
import { EquipmentSet } from '../../services/EquipmentSkinSystem';
import { groupApi } from '../../services/groupApi';

const SETS: EquipmentSet[] = ['mint', 'vault', 'siphon', 'architect', 'broker'];

type Listing = {
  id: string;
  userId: string;
  message: string;
  rate?: string;
  expiresAt?: string;
  createdAt: string;
};

export const GroupSlots: React.FC<{ handle: string }> = ({ handle }) => {
  const { slots, totalsText, activeBuffs, setInvite, confirmSlot, revokeSlot } = useGroupBuffs({ storageKey: 'groupSlots:v1', handle, api: {
    getSlots: groupApi.getSlots,
    setInvite: groupApi.setInvite,
    acceptSlot: groupApi.acceptSlot,
    revokeSlot: groupApi.revokeSlot,
  } });

  const [board, setBoard] = React.useState<Listing[]>([]);
  const [listingUser, setListingUser] = React.useState('');
  const [listingMessage, setListingMessage] = React.useState('');
  const [listingRate, setListingRate] = React.useState('');
  const [boardLoading, setBoardLoading] = React.useState(false);
  const [equippedSets, setEquippedSets] = React.useState<EquipmentSet[]>([]);

  React.useEffect(() => {
    const loadBoard = async () => {
      setBoardLoading(true);
      try {
        const listings = await groupApi.getListings();
        setBoard(listings);
      } catch (err) {
        console.error('Failed to load rental board', err);
      } finally {
        setBoardLoading(false);
      }
    };
    loadBoard();
  }, []);

  const addListing = async () => {
    const userId = listingUser.trim() || handle;
    const message = listingMessage.trim();
    const rate = listingRate.trim();
    if (!userId || !message) return;
    try {
      await groupApi.postListing({ handle: userId, message, rate });
      const listings = await groupApi.getListings();
      setBoard(listings);
    } catch (err) {
      console.error('Failed to post listing', err);
    }
    setListingUser('');
    setListingMessage('');
    setListingRate('');
  };

  const removeListing = async (id: string) => {
    try {
      await groupApi.deleteListing(id);
      setBoard(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      console.error('Failed to remove listing', err);
    }
  };

  React.useEffect(() => {
    const loadEquipped = async () => {
      try {
        const sets = await groupApi.getEquippedSets(handle);
        setEquippedSets(sets.filter((s): s is EquipmentSet => SETS.includes(s as EquipmentSet)));
      } catch (err) {
        console.error('Failed to load equipped sets', err);
      }
    };
    loadEquipped();
  }, [handle]);

  const toggleEquippedSet = (set: EquipmentSet) => {
    setEquippedSets(prev => {
      const next = prev.includes(set) ? prev.filter(s => s !== set) : [...prev, set];
      groupApi.saveEquippedSets({ handle, sets: next });
      return next;
    });
  };

  const colorForSet = (set: string) => {
    switch (set) {
      case 'mint':
        return 'from-emerald-600/30 to-emerald-900/30 border-emerald-500/40';
      case 'vault':
        return 'from-cyan-600/30 to-cyan-900/30 border-cyan-500/40';
      case 'siphon':
        return 'from-green-600/30 to-green-900/30 border-green-500/40';
      case 'architect':
        return 'from-orange-600/30 to-orange-900/30 border-orange-500/40';
      case 'broker':
        return 'from-purple-600/30 to-purple-900/30 border-purple-500/40';
      default:
        return 'from-slate-700/30 to-slate-900/30 border-slate-600/40';
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Team Slots</h3>
        <p className="text-slate-400 text-sm">Invite friends per set to gain small group buffs</p>
      </div>

      <div className="mb-5 bg-slate-800/60 border border-slate-700 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-white font-semibold">Rental Board</p>
          <span className="text-[11px] text-slate-400">List yourself for 7d team rentals</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-2">
          <input
            className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white md:col-span-2"
            placeholder="Your handle / wallet"
            value={listingUser}
            onChange={e => setListingUser(e.target.value)}
          />
          <input
            className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white md:col-span-3"
            placeholder="Availability, sets, expectations"
            value={listingMessage}
            onChange={e => setListingMessage(e.target.value)}
          />
          <input
            className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white"
            placeholder="Rate (BDAG)"
            value={listingRate}
            onChange={e => setListingRate(e.target.value)}
          />
        </div>
        <button
          className="px-3 py-2 bg-emerald-600 text-white rounded text-sm font-semibold hover:bg-emerald-500"
          onClick={addListing}
        >
          Post listing
        </button>

        {boardLoading && <p className="text-[11px] text-slate-400 mt-2">Loading listings…</p>}
        {board.length > 0 && (
          <div className="mt-3 max-h-52 overflow-y-auto space-y-2 pr-1">
            {board.map(listing => {
              const postedMinutes = Math.max(1, Math.floor((Date.now() - new Date(listing.createdAt).getTime()) / (1000 * 60)));
              return (
                <div key={listing.id} className="bg-slate-900 border border-slate-700 rounded p-2 text-sm flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 text-white font-semibold">
                      <span>{listing.userId}</span>
                      {listing.rate && <span className="text-xs bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded border border-emerald-500/40">{listing.rate} BDAG</span>}
                    </div>
                    <p className="text-slate-300 text-xs mt-1">{listing.message}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Posted {postedMinutes}m ago</p>
                  </div>
                  <button className="text-[11px] text-slate-400 hover:text-red-300" onClick={() => removeListing(listing.id)}>Remove</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mb-4">
        <p className="text-xs text-slate-400 uppercase tracking-wide">Equipped sets (validation)</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {SETS.map(set => {
            const active = equippedSets.includes(set);
            return (
              <button
                key={set}
                onClick={() => toggleEquippedSet(set)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                  active
                    ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-200'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {set}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-slate-500 mt-2">Confirm only applies when the corresponding set is marked equipped.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {slots.map((slot, i) => {
          const buff = PER_SLOT_BUFFS[slot.set as keyof typeof PER_SLOT_BUFFS];
          const isEquipped = equippedSets.includes(slot.set);
          const expired = slot.expiresAt ? slot.expiresAt < Date.now() : false;
          const canConfirm = isEquipped && !!slot.invitedId && !expired;
          return (
            <div
              key={i}
              className={`bg-gradient-to-r ${colorForSet(slot.set)} rounded-lg p-4 border`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-xs">Slot</p>
                  <p className="text-white font-bold text-lg uppercase">{slot.set}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-300 text-xs">Buff</p>
                  <p className="text-emerald-300 font-bold text-sm">{buff.label}</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <input
                    placeholder="Invite username / wallet"
                    value={slot.invitedId || ''}
                    onChange={e => setInvite(i, e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <button
                  onClick={() => canConfirm ? confirmSlot(i) : undefined}
                  disabled={!canConfirm}
                  className={`px-3 py-2 rounded font-bold text-xs transition-colors ${
                    slot.confirmedWearing
                      ? 'bg-emerald-600 text-white'
                      : canConfirm
                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        : 'bg-slate-900 text-slate-600 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  {slot.confirmedWearing ? 'Active ✅' : canConfirm ? 'Confirm Wearing' : (expired ? 'Re-invite (expired)' : 'Equip set first')}
                </button>
              </div>

              {slot.invitedId && (
                <p className="mt-2 text-xs text-slate-400">Invited: {slot.invitedId}</p>
              )}

              {!isEquipped && (
                <p className="mt-1 text-[11px] text-amber-300">Requires this set equipped before applying buff.</p>
              )}

              {slot.confirmedWearing && slot.expiresAt && (
                <div className="mt-1 text-[11px] text-emerald-300">
                  Expires in {Math.max(0, slot.expiresAt - Date.now()) / 1000 / 60 / 60 < 24
                    ? `${Math.max(0, Math.floor((slot.expiresAt - Date.now()) / (1000 * 60 * 60)))}h`
                    : `${Math.max(0, Math.floor((slot.expiresAt - Date.now()) / (1000 * 60 * 60 * 24)))}d`}
                </div>
              )}

              {expired && (
                <div className="mt-1 text-[11px] text-red-300">Expired — invite again to reactivate.</div>
              )}

              {(slot.invitedId || slot.confirmedWearing) && (
                <div className="mt-2 flex gap-2 text-[11px]">
                  <button
                    className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-300 hover:bg-slate-700"
                    onClick={() => revokeSlot(i)}
                  >
                    Clear slot
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
        <p className="text-slate-300 text-xs">Group Buff Totals</p>
        <div className="grid grid-cols-5 gap-2 mt-2">
          {totalsText.map((t, idx) => (
            <div key={idx} className="text-center">
              <p className="text-xs text-slate-400">{t.label}</p>
              <p className="text-sm font-bold text-white">{t.valueText}</p>
            </div>
          ))}
        </div>
        {activeBuffs.length === 0 && (
          <p className="mt-2 text-xs text-slate-500">No active buffs. Confirm wearing to apply.</p>
        )}
      </div>
    </div>
  );
};

export default GroupSlots;
