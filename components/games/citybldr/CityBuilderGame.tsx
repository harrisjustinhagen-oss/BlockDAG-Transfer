import React, { useState, useEffect } from 'react';
import { PrismIcon } from '../../icons/PrismIcon';
import { WoodIcon } from '../../icons/WoodIcon';
import { IronIcon } from '../../icons/IronIcon';

type Building = {
  id: string;
  type: 'residential' | 'commercial' | 'industrial' | 'park' | 'road' | 'empty';
  level: number;
  x: number;
  y: number;
};

type Resources = {
  prism: number;
  wood: number;
  iron: number;
  population: number;
};

type BuildingType = {
  type: Building['type'];
  name: string;
  icon: string;
  cost: { prism: number; wood: number; iron: number };
  description: string;
  color: string;
};

const BUILDING_TYPES: BuildingType[] = [
  { type: 'residential', name: 'House', icon: '🏠', cost: { prism: 10, wood: 5, iron: 0 }, description: 'Generates population', color: 'bg-green-600' },
  { type: 'commercial', name: 'Shop', icon: '🏪', cost: { prism: 20, wood: 3, iron: 2 }, description: 'Generates Prism', color: 'bg-blue-600' },
  { type: 'industrial', name: 'Factory', icon: '🏭', cost: { prism: 30, wood: 10, iron: 15 }, description: 'Produces materials', color: 'bg-gray-600' },
  { type: 'park', name: 'Park', icon: '🌳', cost: { prism: 5, wood: 2, iron: 0 }, description: 'Increases happiness', color: 'bg-green-400' },
  { type: 'road', name: 'Road', icon: '🛣️', cost: { prism: 2, wood: 0, iron: 1 }, description: 'Connects buildings', color: 'bg-gray-400' },
];

const GRID_SIZE = 12;

type Props = {
  onClose: () => void;
};

export const CityBuilderGame: React.FC<Props> = ({ onClose }) => {
  const [grid, setGrid] = useState<Building[][]>([]);
  const [resources, setResources] = useState<Resources>({ prism: 100, wood: 50, iron: 25, population: 0 });
  const [selectedBuildingType, setSelectedBuildingType] = useState<Building['type'] | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);

  // Initialize empty grid
  useEffect(() => {
    const newGrid: Building[][] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      const row: Building[] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        row.push({ id: `${x}-${y}`, type: 'empty', level: 0, x, y });
      }
      newGrid.push(row);
    }
    setGrid(newGrid);

    // Load saved city if exists
    const saved = localStorage.getItem('cityBuilderSave');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.grid && data.resources) {
          setGrid(data.grid);
          setResources(data.resources);
        }
      } catch (e) {
        console.error('Failed to load saved city', e);
      }
    }
  }, []);

  // Auto-save
  useEffect(() => {
    if (grid.length === 0) return;
    const saveData = { grid, resources };
    localStorage.setItem('cityBuilderSave', JSON.stringify(saveData));
  }, [grid, resources]);

  // Income generation (every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      let prismIncome = 0;
      let woodIncome = 0;
      let ironIncome = 0;
      let popIncome = 0;

      grid.forEach(row => {
        row.forEach(building => {
          if (building.type === 'commercial') {
            prismIncome += 2 * (building.level + 1);
          } else if (building.type === 'industrial') {
            woodIncome += 1 * (building.level + 1);
            ironIncome += 1 * (building.level + 1);
          } else if (building.type === 'residential') {
            popIncome += 1 * (building.level + 1);
          }
        });
      });

      setResources(prev => ({
        prism: prev.prism + prismIncome,
        wood: prev.wood + woodIncome,
        iron: prev.iron + ironIncome,
        population: prev.population + popIncome,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [grid]);

  const canAfford = (cost: { prism: number; wood: number; iron: number }) => {
    return resources.prism >= cost.prism && resources.wood >= cost.wood && resources.iron >= cost.iron;
  };

  const handleCellClick = (x: number, y: number) => {
    if (!selectedBuildingType) {
      setSelectedCell({ x, y });
      return;
    }

    const building = grid[y][x];
    if (building.type !== 'empty') {
      alert('Cell already occupied!');
      return;
    }

    const buildingInfo = BUILDING_TYPES.find(b => b.type === selectedBuildingType);
    if (!buildingInfo) return;

    if (!canAfford(buildingInfo.cost)) {
      alert('Not enough resources!');
      return;
    }

    // Place building
    const newGrid = [...grid];
    newGrid[y][x] = { id: `${x}-${y}`, type: selectedBuildingType, level: 1, x, y };
    setGrid(newGrid);

    // Deduct resources
    setResources(prev => ({
      ...prev,
      prism: prev.prism - buildingInfo.cost.prism,
      wood: prev.wood - buildingInfo.cost.wood,
      iron: prev.iron - buildingInfo.cost.iron,
    }));

    setSelectedBuildingType(null);
  };

  const handleUpgrade = () => {
    if (!selectedCell) return;
    const { x, y } = selectedCell;
    const building = grid[y][x];
    
    if (building.type === 'empty') {
      alert('No building to upgrade!');
      return;
    }

    const upgradeCost = {
      prism: 15 * (building.level + 1),
      wood: 8 * (building.level + 1),
      iron: 5 * (building.level + 1),
    };

    if (!canAfford(upgradeCost)) {
      alert('Not enough resources to upgrade!');
      return;
    }

    const newGrid = [...grid];
    newGrid[y][x] = { ...building, level: building.level + 1 };
    setGrid(newGrid);

    setResources(prev => ({
      ...prev,
      prism: prev.prism - upgradeCost.prism,
      wood: prev.wood - upgradeCost.wood,
      iron: prev.iron - upgradeCost.iron,
    }));
  };

  const handleDemolish = () => {
    if (!selectedCell) return;
    const { x, y } = selectedCell;
    const building = grid[y][x];
    
    if (building.type === 'empty') return;

    const newGrid = [...grid];
    newGrid[y][x] = { id: `${x}-${y}`, type: 'empty', level: 0, x, y };
    setGrid(newGrid);
    setSelectedCell(null);
  };

  const getBuildingIcon = (building: Building) => {
    if (building.type === 'empty') return '';
    const info = BUILDING_TYPES.find(b => b.type === building.type);
    return info?.icon || '';
  };

  const getBuildingColor = (building: Building) => {
    if (building.type === 'empty') return 'bg-green-900/30';
    const info = BUILDING_TYPES.find(b => b.type === building.type);
    return info?.color || 'bg-gray-500';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">City Builder</h1>
          <button
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded font-semibold"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {/* Resources */}
        <div className="mt-3 flex gap-4 text-white">
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded">
            <PrismIcon className="w-5 h-5 text-purple-400" />
            <span className="font-bold">{resources.prism}</span>
            <span className="text-xs text-slate-400">Prism</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded">
            <WoodIcon className="w-5 h-5 text-amber-600" />
            <span className="font-bold">{resources.wood}</span>
            <span className="text-xs text-slate-400">Wood</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded">
            <IronIcon className="w-5 h-5 text-slate-400" />
            <span className="font-bold">{resources.iron}</span>
            <span className="text-xs text-slate-400">Iron</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded">
            <span className="text-xl">👥</span>
            <span className="font-bold">{resources.population}</span>
            <span className="text-xs text-slate-400">Population</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Building Selection Panel */}
        <div className="w-64 bg-slate-900 border-r border-slate-700 p-4 overflow-y-auto">
          <h2 className="text-lg font-bold text-white mb-3">Buildings</h2>
          <div className="flex flex-col gap-2">
            {BUILDING_TYPES.map(building => (
              <button
                key={building.type}
                className={`p-3 rounded text-left transition-colors ${
                  selectedBuildingType === building.type
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
                onClick={() => setSelectedBuildingType(building.type)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{building.icon}</span>
                  <span className="font-semibold">{building.name}</span>
                </div>
                <div className="text-xs text-slate-300 mb-2">{building.description}</div>
                <div className="text-xs flex gap-2 items-center">
                  <span className="flex items-center gap-1">
                    <PrismIcon className="w-3 h-3 text-purple-400" />
                    {building.cost.prism}
                  </span>
                  <span className="flex items-center gap-1">
                    <WoodIcon className="w-3 h-3 text-amber-600" />
                    {building.cost.wood}
                  </span>
                  <span className="flex items-center gap-1">
                    <IronIcon className="w-3 h-3 text-slate-400" />
                    {building.cost.iron}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {selectedCell && grid[selectedCell.y]?.[selectedCell.x]?.type !== 'empty' && (
            <div className="mt-6 pt-4 border-t border-slate-700">
              <h3 className="text-white font-semibold mb-2">Selected Building</h3>
              <div className="bg-slate-800 p-3 rounded mb-2">
                <div className="text-2xl mb-1">{getBuildingIcon(grid[selectedCell.y][selectedCell.x])}</div>
                <div className="text-white text-sm">Level {grid[selectedCell.y][selectedCell.x].level}</div>
              </div>
              <button
                className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded mb-2"
                onClick={handleUpgrade}
              >
                ⬆️ Upgrade
              </button>
              <button
                className="w-full px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded"
                onClick={handleDemolish}
              >
                💥 Demolish
              </button>
            </div>
          )}
        </div>

        {/* City Grid */}
        <div className="flex-1 overflow-auto p-8 bg-gradient-to-br from-green-900 to-green-950">
          <div className="inline-block">
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 60px)` }}>
              {grid.map((row, y) =>
                row.map((building, x) => (
                  <div
                    key={`${x}-${y}`}
                    className={`
                      w-[60px] h-[60px] rounded border-2 cursor-pointer transition-all
                      ${getBuildingColor(building)}
                      ${hoveredCell?.x === x && hoveredCell?.y === y ? 'border-yellow-400 scale-105' : 'border-slate-600'}
                      ${selectedCell?.x === x && selectedCell?.y === y ? 'ring-2 ring-cyan-400' : ''}
                      flex items-center justify-center text-3xl relative
                    `}
                    onClick={() => handleCellClick(x, y)}
                    onMouseEnter={() => setHoveredCell({ x, y })}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    {getBuildingIcon(building)}
                    {building.level > 1 && (
                      <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-1 rounded-bl">
                        {building.level}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-slate-900 border-t border-slate-700 p-2 text-center text-xs text-slate-400">
        Select a building type, then click on the grid to place it • Click a building to select it, then upgrade or demolish
      </div>
    </div>
  );
};

export default CityBuilderGame;
