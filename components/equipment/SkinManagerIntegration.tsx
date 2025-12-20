import React, { useState } from 'react';
import { EquipmentSkinSelector } from './EquipmentSkinSelector';
import { BuildingSkinSelector } from './BuildingSkinSelector';
import { Equipment2DPreview } from './Equipment3DViewer';
import { useSkin } from './EquipmentSkinSystem';
import type { EquipmentGrade } from './EquipmentSkinSystem';

/**
 * Example: Integrated Equipment & Building Skin Manager
 * Shows how to use the skin system throughout your app
 */

export interface PlayerEquipment {
  head: { skinId: string; grade: EquipmentGrade };
  chest: { skinId: string; grade: EquipmentGrade };
  gloves: { skinId: string; grade: EquipmentGrade };
  legs: { skinId: string; grade: EquipmentGrade };
  boots: { skinId: string; grade: EquipmentGrade };
}

interface PlayerCityPresets {
  buildingSkinId: string;
}

interface SkinManagerProps {
  onEquipmentChange?: (equipment: PlayerEquipment) => void;
  onCityChange?: (preset: PlayerCityPresets) => void;
}

export const SkinManager: React.FC<SkinManagerProps> = ({ onEquipmentChange, onCityChange }) => {
  const [equipment, setEquipment] = useState<PlayerEquipment>({
    head: { skinId: 'helm-iron', grade: 'purple' },
    chest: { skinId: 'chest-plate', grade: 'purple' },
    gloves: { skinId: 'gloves-leather', grade: 'purple' },
    legs: { skinId: 'legs-plate', grade: 'purple' },
    boots: { skinId: 'boots-steel', grade: 'purple' },
  });

  const [cityPreset, setCityPreset] = useState<PlayerCityPresets>({
    buildingSkinId: 'house-basic-purple',
  });

  const [showEquipmentSelector, setShowEquipmentSelector] = useState<
    'head' | 'chest' | 'gloves' | 'legs' | 'boots' | null
  >(null);
  const [showBuildingSelector, setShowBuildingSelector] = useState(false);

  const handleEquipmentSelect = (
    type: 'head' | 'chest' | 'gloves' | 'legs' | 'boots',
    skinId: string,
    grade: EquipmentGrade
  ) => {
    const updated = { ...equipment, [type]: { skinId, grade } };
    setEquipment(updated);
    onEquipmentChange?.(updated);
  };

  const handleBuildingSelect = (skinId: string) => {
    const updated = { buildingSkinId: skinId };
    setCityPreset(updated);
    onCityChange?.(updated);
  };

  // Change all equipment to same grade
  const setAllGrade = (grade: EquipmentGrade) => {
    const updated: PlayerEquipment = {
      head: { ...equipment.head, grade },
      chest: { ...equipment.chest, grade },
      gloves: { ...equipment.gloves, grade },
      legs: { ...equipment.legs, grade },
      boots: { ...equipment.boots, grade },
    };
    setEquipment(updated);
    onEquipmentChange?.(updated);
  };

  return (
    <div className="w-full space-y-6">
      {/* Equipment Section */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Character Armor</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setAllGrade('purple')}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded text-white text-sm font-semibold"
            >
              🟣 All Purple
            </button>
            <button
              onClick={() => setAllGrade('orange')}
              className="px-3 py-1 bg-orange-600 hover:bg-orange-500 rounded text-white text-sm font-semibold"
            >
              🟠 All Orange
            </button>
          </div>
        </div>

        {/* Equipment Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {(['head', 'chest', 'gloves', 'legs', 'boots'] as const).map((type) => {
            const item = equipment[type];
            const skin = useSkin(item.skinId, 'equipment');

            return (
              <button
                key={type}
                onClick={() => setShowEquipmentSelector(type)}
                className="flex flex-col items-center gap-2 p-3 bg-slate-700 hover:bg-slate-600 rounded-lg border border-slate-600 transition-colors"
              >
                {skin && (
                  <div className="w-16 h-16">
                    <Equipment2DPreview skin={skin} grade={item.grade} />
                  </div>
                )}
                <p className="text-xs font-semibold text-white capitalize">{type}</p>
                <p className="text-xs text-slate-400">{skin?.name || 'Empty'}</p>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    item.grade === 'purple'
                      ? 'bg-purple-900 text-purple-200'
                      : 'bg-orange-900 text-orange-200'
                  }`}
                >
                  {item.grade}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* City Section */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">City Style</h3>
          <button
            onClick={() => setShowBuildingSelector(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-semibold text-sm"
          >
            Change Theme
          </button>
        </div>

        <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
          <p className="text-slate-400 text-sm mb-2">Current Building Theme:</p>
          <p className="text-white font-semibold">{cityPreset.buildingSkinId}</p>
        </div>
      </div>

      {/* Equipment Selector Modal */}
      {showEquipmentSelector && (
        <EquipmentSkinSelector
          armorType={showEquipmentSelector}
          currentSkinId={equipment[showEquipmentSelector].skinId}
          currentGrade={equipment[showEquipmentSelector].grade}
          onSelect={(skinId, grade) => {
            handleEquipmentSelect(showEquipmentSelector as any, skinId, grade);
          }}
          onClose={() => setShowEquipmentSelector(null)}
        />
      )}

      {/* Building Selector Modal */}
      {showBuildingSelector && (
        <BuildingSkinSelector
          onSelect={handleBuildingSelect}
          onClose={() => setShowBuildingSelector(false)}
        />
      )}
    </div>
  );
};

/**
 * Example: Avatar Display with Current Equipment
 */
interface AvatarDisplayProps {
  equipment: PlayerEquipment;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({ equipment }) => {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border-2 border-slate-700 p-8 text-center">
      <h2 className="text-2xl font-bold text-white mb-6">Your Character</h2>

      <div className="flex justify-center items-center gap-8 mb-8">
        {(['head', 'chest', 'gloves', 'legs', 'boots'] as const).map((type) => {
          const item = equipment[type];
          const skin = useSkin(item.skinId, 'equipment');

          if (!skin) return null;

          return (
            <div key={type} className="flex flex-col items-center">
              <div className="w-20 h-20 mb-2">
                <Equipment2DPreview skin={skin} grade={item.grade} />
              </div>
              <p className="text-xs text-slate-400 capitalize">{type}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
        <p className="text-slate-400 text-sm mb-2">Equipment Theme:</p>
        <div className="flex justify-center gap-2">
          {equipment.head.grade === 'purple' && (
            <span className="px-3 py-1 bg-purple-600 text-white rounded text-sm font-semibold">
              🟣 Purple Grade
            </span>
          )}
          {equipment.head.grade === 'orange' && (
            <span className="px-3 py-1 bg-orange-600 text-white rounded text-sm font-semibold">
              🟠 Orange Grade
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
