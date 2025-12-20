import React, { useState } from 'react';
import { BuildingSkin, useBuildingSkinsByGrade, EquipmentGrade } from './EquipmentSkinSystem';

interface BuildingSkinSelectorProps {
  onSelect: (skinId: string) => void;
  onClose: () => void;
}

export const BuildingSkinSelector: React.FC<BuildingSkinSelectorProps> = ({ onSelect, onClose }) => {
  const [selectedGrade, setSelectedGrade] = useState<EquipmentGrade>('purple');
  const [selectedSkinId, setSelectedSkinId] = useState<string | null>(null);

  const skins = useBuildingSkinsByGrade(selectedGrade);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-xl border border-slate-700 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Building Skins</h2>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-white"
          >
            Close
          </button>
        </div>

        {/* Grade Tabs */}
        <div className="sticky top-16 bg-slate-800 border-b border-slate-700 p-4 flex gap-2">
          <button
            onClick={() => setSelectedGrade('purple')}
            className={`flex-1 py-2 px-4 rounded-lg border-2 font-semibold transition-all ${
              selectedGrade === 'purple'
                ? 'bg-purple-600 border-purple-400 text-white'
                : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
            }`}
          >
            🟣 Purple Buildings
          </button>
          <button
            onClick={() => setSelectedGrade('orange')}
            className={`flex-1 py-2 px-4 rounded-lg border-2 font-semibold transition-all ${
              selectedGrade === 'orange'
                ? 'bg-orange-600 border-orange-400 text-white'
                : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
            }`}
          >
            🟠 Orange Buildings
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-sm font-bold text-slate-300 uppercase mb-4">Select Building Style</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {skins.map((skin) => (
              <button
                key={skin.id}
                onClick={() => setSelectedSkinId(skin.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedSkinId === skin.id
                    ? 'bg-opacity-50 border-2 scale-105'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
                style={{
                  backgroundColor: `${skin.colors.base}20`,
                  borderColor: selectedSkinId === skin.id ? skin.colors.base : '#404854',
                }}
              >
                {/* Building preview box */}
                <div
                  className="w-full aspect-square rounded-lg mb-2 flex items-center justify-center text-3xl shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${skin.colors.base} 0%, ${skin.colors.accent} 100%)`,
                  }}
                >
                  🏠
                </div>
                <p className="font-semibold text-sm text-white">{skin.name}</p>
                <p className="text-xs text-slate-400">{skin.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700 p-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (selectedSkinId) {
                onSelect(selectedSkinId);
                onClose();
              }
            }}
            disabled={!selectedSkinId}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-semibold"
          >
            Apply Skin
          </button>
        </div>
      </div>
    </div>
  );
};

// Building preview component for City BLDR
interface BuildingPreviewProps {
  skinId: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BuildingPreview: React.FC<BuildingPreviewProps> = ({ skinId, size = 'md' }) => {
  const skins = [...useBuildingSkinsByGrade('purple'), ...useBuildingSkinsByGrade('orange')];
  const skin = skins.find((s) => s.id === skinId);

  if (!skin) return null;

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-lg shadow-lg flex items-center justify-center cursor-pointer hover:shadow-xl transition-shadow`}
      style={{
        background: `linear-gradient(135deg, ${skin.colors.base} 0%, ${skin.colors.accent} 100%)`,
      }}
      title={skin.name}
    >
      <span className="text-2xl md:text-3xl">🏢</span>
    </div>
  );
};
