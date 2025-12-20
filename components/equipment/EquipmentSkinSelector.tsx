import React, { useState } from 'react';
import { EquipmentGrade, useEquipmentSkinsByType, useSkin } from './EquipmentSkinSystem';
import { Equipment2DPreview } from './Equipment3DViewer';

interface EquipmentSkinSelectorProps {
  armorType: 'head' | 'chest' | 'gloves' | 'legs' | 'boots';
  currentSkinId: string;
  currentGrade: EquipmentGrade;
  onSelect: (skinId: string, grade: EquipmentGrade) => void;
  onClose: () => void;
}

export const EquipmentSkinSelector: React.FC<EquipmentSkinSelectorProps> = ({
  armorType,
  currentSkinId,
  currentGrade,
  onSelect,
  onClose,
}) => {
  const skins = useEquipmentSkinsByType(armorType);
  const [selectedSkinId, setSelectedSkinId] = useState(currentSkinId);
  const [selectedGrade, setSelectedGrade] = useState<EquipmentGrade>(currentGrade);

  const currentSkin = useSkin(selectedSkinId, 'equipment');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white capitalize">{armorType} Skins</h2>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-white"
          >
            Close
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Skin List */}
          <div>
            <h3 className="text-sm font-bold text-slate-300 uppercase mb-3">Available Skins</h3>
            <div className="space-y-2">
              {skins.map((skin) => (
                <button
                  key={skin.id}
                  onClick={() => setSelectedSkinId(skin.id)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedSkinId === skin.id
                      ? 'bg-purple-900/50 border-purple-500'
                      : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <p className="font-semibold text-white">{skin.name}</p>
                  <p className="text-xs text-slate-400">{skin.description}</p>
                </button>
              ))}
            </div>

            {/* Grade Selector */}
            <div className="mt-6">
              <h3 className="text-sm font-bold text-slate-300 uppercase mb-3">Grade Color</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedGrade('purple')}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 font-semibold transition-all ${
                    selectedGrade === 'purple'
                      ? 'bg-purple-600 border-purple-400 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  🟣 Purple
                </button>
                <button
                  onClick={() => setSelectedGrade('orange')}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 font-semibold transition-all ${
                    selectedGrade === 'orange'
                      ? 'bg-orange-600 border-orange-400 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  🟠 Orange
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div>
            <h3 className="text-sm font-bold text-slate-300 uppercase mb-3">Preview</h3>
            {currentSkin && (
              <div className="space-y-4">
                <Equipment2DPreview skin={currentSkin} grade={selectedGrade} />
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                  <p className="text-sm text-slate-300 mb-2">
                    <span className="font-bold">Name:</span> {currentSkin.name}
                  </p>
                  <p className="text-sm text-slate-300 mb-2">
                    <span className="font-bold">Color:</span> {selectedGrade.charAt(0).toUpperCase() + selectedGrade.slice(1)}
                  </p>
                  <p className="text-sm text-slate-300">
                    <span className="font-bold">Type:</span> {currentSkin.type.charAt(0).toUpperCase() + currentSkin.type.slice(1)}
                  </p>
                </div>
              </div>
            )}
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
              onSelect(selectedSkinId, selectedGrade);
              onClose();
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-semibold"
          >
            Equip Skin
          </button>
        </div>
      </div>
    </div>
  );
};
