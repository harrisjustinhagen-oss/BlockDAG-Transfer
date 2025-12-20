import React from 'react';

// Equipment skin definitions - Strategic 5 Set System
export type EquipmentGrade = 'purple' | 'orange';
export type EquipmentSet = 'mint' | 'vault' | 'siphon' | 'architect' | 'broker';
export type EquipmentType = 'head' | 'chest' | 'gloves' | 'legs' | 'boots';

export interface EquipmentSkin {
  id: string;
  name: string;
  set: EquipmentSet;
  type: EquipmentType;
  modelPath: string;
  materials: {
    purple: string;
    orange: string;
  };
  description: string;
  baseColor: {
    purple: string;
    orange: string;
  };
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface SetBonusInfo {
  set: EquipmentSet;
  name: string;
  individual: string;
  pieces3: {
    title: string;
    description: string;
  };
  pieces5: {
    title: string;
    description: string;
  };
  color: string;
}

export interface BuildingSkin {
  id: string;
  name: string;
  grade: EquipmentGrade;
  modelPath: string;
  materials: {
    base: string;
    accent: string;
  };
  colors: {
    base: string; // Hex color
    accent: string;
  };
  description: string;
}

// ========================================
// SET 1: THE MINT (The Spender)
// ========================================
const MINT_EQUIPMENT: EquipmentSkin[] = [
  {
    id: 'mint-helm',
    name: 'Mint Crown',
    set: 'mint',
    type: 'head',
    modelPath: '/public/assets/models/armor/mint_helm.glb',
    materials: { purple: 'MintHelm_Purple', orange: 'MintHelm_Orange' },
    description: 'Golden crown adorned with cash symbols. +1% BDAG Cashback',
    baseColor: { purple: '#9333ea', orange: '#ea580c' },
    rarity: 'rare',
  },
  {
    id: 'mint-chest',
    name: 'Merchant\'s Vest',
    set: 'mint',
    type: 'chest',
    modelPath: '/public/assets/models/armor/mint_chest.glb',
    materials: { purple: 'MintChest_Purple', orange: 'MintChest_Orange' },
    description: 'Elegant vest for high-value traders. +1% BDAG Cashback',
    baseColor: { purple: '#9333ea', orange: '#ea580c' },
    rarity: 'epic',
  },
  {
    id: 'mint-gloves',
    name: 'Cashier\'s Hands',
    set: 'mint',
    type: 'gloves',
    modelPath: '/public/assets/models/armor/mint_gloves.glb',
    materials: { purple: 'MintGloves_Purple', orange: 'MintGloves_Orange' },
    description: 'Gloves that count money perfectly. +1% BDAG Cashback',
    baseColor: { purple: '#9333ea', orange: '#ea580c' },
    rarity: 'uncommon',
  },
  {
    id: 'mint-legs',
    name: 'Spender\'s Pants',
    set: 'mint',
    type: 'legs',
    modelPath: '/public/assets/models/armor/mint_legs.glb',
    materials: { purple: 'MintLegs_Purple', orange: 'MintLegs_Orange' },
    description: 'Pants with deep pockets for transactions. +1% BDAG Cashback',
    baseColor: { purple: '#9333ea', orange: '#ea580c' },
    rarity: 'rare',
  },
  {
    id: 'mint-boots',
    name: 'Commerce Treads',
    set: 'mint',
    type: 'boots',
    modelPath: '/public/assets/models/armor/mint_boots.glb',
    materials: { purple: 'MintBoots_Purple', orange: 'MintBoots_Orange' },
    description: 'Boots that tread the marketplace. +1% BDAG Cashback',
    baseColor: { purple: '#9333ea', orange: '#ea580c' },
    rarity: 'legendary',
  },
];

// ========================================
// SET 2: THE VAULT (The Power Grid)
// ========================================
const VAULT_EQUIPMENT: EquipmentSkin[] = [
  {
    id: 'vault-helm',
    name: 'Forge Crown',
    set: 'vault',
    type: 'head',
    modelPath: '/public/assets/models/armor/vault_helm.glb',
    materials: { purple: 'VaultHelm_Purple', orange: 'VaultHelm_Orange' },
    description: 'Crown that channels staking power. +0.75% Staking APY',
    baseColor: { purple: '#9333ea', orange: '#ea580c' },
    rarity: 'epic',
  },
  {
    id: 'vault-chest',
    name: 'Power Grid Armor',
    set: 'vault',
    type: 'chest',
    modelPath: '/public/assets/models/armor/vault_chest.glb',
    materials: { purple: 'VaultChest_Purple', orange: 'VaultChest_Orange' },
    description: 'Armor that harnesses mining energy. +0.75% Staking APY',
    baseColor: { purple: '#9333ea', orange: '#ea580c' },
    rarity: 'legendary',
  },
  {
    id: 'vault-gloves',
    name: 'Core Handler Gloves',
    set: 'vault',
    type: 'gloves',
    modelPath: '/public/assets/models/armor/vault_gloves.glb',
    materials: { purple: 'VaultGloves_Purple', orange: 'VaultGloves_Orange' },
    description: 'Gloves for handling X1/X10 Cores. +0.75% Staking APY',
    baseColor: { purple: '#9333ea', orange: '#ea580c' },
    rarity: 'rare',
  },
  {
    id: 'vault-legs',
    name: 'Reactor Leggings',
    set: 'vault',
    type: 'legs',
    modelPath: '/public/assets/models/armor/vault_legs.glb',
    materials: { purple: 'VaultLegs_Purple', orange: 'VaultLegs_Orange' },
    description: 'Leggings powered by the forge. +0.75% Staking APY',
    baseColor: { purple: '#9333ea', orange: '#ea580c' },
    rarity: 'epic',
  },
  {
    id: 'vault-boots',
    name: 'Forge Treads',
    set: 'vault',
    type: 'boots',
    modelPath: '/public/assets/models/armor/vault_boots.glb',
    materials: { purple: 'VaultBoots_Purple', orange: 'VaultBoots_Orange' },
    description: 'Boots immune to mining heat. +0.75% Staking APY',
    baseColor: { purple: '#9333ea', orange: '#ea580c' },
    rarity: 'rare',
  },
];

// ========================================
// SET 3: THE SIPHON (The Logistics)
// ========================================
const SIPHON_EQUIPMENT: EquipmentSkin[] = [
  {
    id: 'siphon-helm',
    name: 'Gas Extractor Crown',
    set: 'siphon',
    type: 'head',
    modelPath: '/public/assets/models/armor/siphon_helm.glb',
    materials: { purple: 'SiphonHelm_Purple', orange: 'SiphonHelm_Orange' },
    description: 'Crown that harvests gas shards. -15% Transaction Fees',
    baseColor: { purple: '#9333ea', orange: '#ea580c' },
    rarity: 'rare',
  },
  {
    id: 'siphon-chest',
    name: 'Logistics Harness',
    set: 'siphon',
    type: 'chest',
    modelPath: '/public/assets/models/armor/siphon_chest.glb',
    materials: { purple: 'SiphonChest_Purple', orange: 'SiphonChest_Orange' },
    description: 'Harness for managing supply chains. -15% Transaction Fees',
    baseColor: { purple: '#9333ea', orange: '#ea580c' },
    rarity: 'epic',
  },
  {
    id: 'siphon-gloves',
    name: 'Refiner\'s Hands',
    set: 'siphon',
    type: 'gloves',
    modelPath: '/public/assets/models/armor/siphon_gloves.glb',
    materials: { purple: 'SiphonGloves_Purple', orange: 'SiphonGloves_Orange' },
    description: 'Gloves for refining gas into cores. -15% Transaction Fees',
    baseColor: { purple: '#9333ea', orange: '#ea580c' },
    rarity: 'uncommon',
  },
  {
    id: 'siphon-legs',
    name: 'Pipeline Leggings',
    set: 'siphon',
    type: 'legs',
    modelPath: '/public/assets/models/armor/siphon_legs.glb',
    materials: { purple: 'SiphonLegs_Purple', orange: 'SiphonLegs_Orange' },
    description: 'Leggings that channel transactions. -15% Transaction Fees',
    baseColor: { purple: '#9333ea', orange: '#ea580c' },
    rarity: 'rare',
  },
  {
    id: 'siphon-boots',
    name: 'Market Treads',
    set: 'siphon',
    type: 'boots',
    modelPath: '/public/assets/models/armor/siphon_boots.glb',
    materials: { purple: 'SiphonBoots_Purple', orange: 'SiphonBoots_Orange' },
    description: 'Boots that tap into fee savings. -15% Transaction Fees',
    baseColor: { purple: '#9333ea', orange: '#ea580c' },
    rarity: 'legendary',
  },
];

// ========================================
// SET 4: THE ARCHITECT (The Master Builder)
// ========================================
const ARCHITECT_EQUIPMENT: EquipmentSkin[] = [
  {
    id: 'architect-helm',
    name: 'Builder\'s Blueprint Crown',
    set: 'architect',
    type: 'head',
    modelPath: '/public/assets/models/armor/architect_helm.glb',
    materials: { purple: 'ArchitectHelm_Purple', orange: 'ArchitectHelm_Orange' },
    description: 'Crown that envisions construction. -10% Crafting Costs',
    baseColor: { purple: '#9333ea', orange: '#ea580c' },
    rarity: 'epic',
  },
  {
    id: 'architect-chest',
    name: 'Master Builder\'s Suit',
    set: 'architect',
    type: 'chest',
    modelPath: '/public/assets/models/armor/architect_chest.glb',
    materials: { purple: 'ArchitectChest_Purple', orange: 'ArchitectChest_Orange' },
    description: 'Suit for managing mega-projects. -10% Crafting Costs',
    baseColor: { purple: '#9333ea', orange: '#ea580c' },
    rarity: 'legendary',
  },
  {
    id: 'architect-gloves',
    name: 'Blueprint Hands',
    set: 'architect',
    type: 'gloves',
    modelPath: '/public/assets/models/armor/architect_gloves.glb',
    materials: { purple: 'ArchitectGloves_Purple', orange: 'ArchitectGloves_Orange' },
    description: 'Gloves that craft repairs. -10% Crafting Costs',
    baseColor: { purple: '#9333ea', orange: '#ea580c' },
    rarity: 'rare',
  },
  {
    id: 'architect-legs',
    name: 'Construction Leggings',
    set: 'architect',
    type: 'legs',
    modelPath: '/public/assets/models/armor/architect_legs.glb',
    materials: { purple: 'ArchitectLegs_Purple', orange: 'ArchitectLegs_Orange' },
    description: 'Leggings grounded in industrial zones. -10% Crafting Costs',
    baseColor: { purple: '#9333ea', orange: '#ea580c' },
    rarity: 'epic',
  },
  {
    id: 'architect-boots',
    name: 'Service Board Treads',
    set: 'architect',
    type: 'boots',
    modelPath: '/public/assets/models/armor/architect_boots.glb',
    materials: { purple: 'ArchitectBoots_Purple', orange: 'ArchitectBoots_Orange' },
    description: 'Boots that serve and repair. -10% Crafting Costs',
    baseColor: { purple: '#9333ea', orange: '#ea580c' },
    rarity: 'uncommon',
  },
];

// ========================================
// SET 5: THE BROKER (The Influencer)
// ========================================
const BROKER_EQUIPMENT: EquipmentSkin[] = [
  {
    id: 'broker-helm',
    name: 'Syndicate Crown',
    set: 'broker',
    type: 'head',
    modelPath: '/public/assets/models/armor/broker_helm.glb',
    materials: { purple: 'BrokerHelm_Purple', orange: 'BrokerHelm_Orange' },
    description: 'Crown that leads the network. +0.5% Network Commission',
    baseColor: { purple: '#9333ea', orange: '#ea580c' },
    rarity: 'legendary',
  },
  {
    id: 'broker-chest',
    name: 'Influencer\'s Suit',
    set: 'broker',
    type: 'chest',
    modelPath: '/public/assets/models/armor/broker_chest.glb',
    materials: { purple: 'BrokerChest_Purple', orange: 'BrokerChest_Orange' },
    description: 'Suit that broadcasts power. +0.5% Network Commission',
    baseColor: { purple: '#9333ea', orange: '#ea580c' },
    rarity: 'epic',
  },
  {
    id: 'broker-gloves',
    name: 'Network Handler Gloves',
    set: 'broker',
    type: 'gloves',
    modelPath: '/public/assets/models/armor/broker_gloves.glb',
    materials: { purple: 'BrokerGloves_Purple', orange: 'BrokerGloves_Orange' },
    description: 'Gloves that connect and leverage. +0.5% Network Commission',
    baseColor: { purple: '#9333ea', orange: '#ea580c' },
    rarity: 'rare',
  },
  {
    id: 'broker-legs',
    name: 'Commission Leggings',
    set: 'broker',
    type: 'legs',
    modelPath: '/public/assets/models/armor/broker_legs.glb',
    materials: { purple: 'BrokerLegs_Purple', orange: 'BrokerLegs_Orange' },
    description: 'Leggings that track commissions. +0.5% Network Commission',
    baseColor: { purple: '#9333ea', orange: '#ea580c' },
    rarity: 'epic',
  },
  {
    id: 'broker-boots',
    name: 'Wholesale Treads',
    set: 'broker',
    type: 'boots',
    modelPath: '/public/assets/models/armor/broker_boots.glb',
    materials: { purple: 'BrokerBoots_Purple', orange: 'BrokerBoots_Orange' },
    description: 'Boots for bulk market movement. +0.5% Network Commission',
    baseColor: { purple: '#9333ea', orange: '#ea580c' },
    rarity: 'rare',
  },
];

// Combine all equipment
export const EQUIPMENT_SKINS: EquipmentSkin[] = [
  ...MINT_EQUIPMENT,
  ...VAULT_EQUIPMENT,
  ...SIPHON_EQUIPMENT,
  ...ARCHITECT_EQUIPMENT,
  ...BROKER_EQUIPMENT,
];

// ========================================
// SET BONUSES DATABASE
// ========================================
export const SET_BONUSES: SetBonusInfo[] = [
  {
    set: 'mint',
    name: 'The Mint',
    individual: '+1% BDAG Cashback on real-world purchases',
    pieces3: {
      title: 'Instant Liquidity',
      description: 'Removes the standard 3-day verification period for cashback rewards',
    },
    pieces5: {
      title: 'Commercial Hub',
      description: 'Unlocks Commercial Zones in SIM City. 10% of your real-world fiat spending is "mirrored" as building materials (Steel/Concrete)',
    },
    color: '#10b981',
  },
  {
    set: 'vault',
    name: 'The Vault',
    individual: '+0.75% Staking APY on BDAG',
    pieces3: {
      title: 'Forge Access',
      description: 'Unlocks the ability to forge X1 PoE Cores for mobile mining',
    },
    pieces5: {
      title: 'High-Stakes Core Forge',
      description: '48h cooldown, 40% base success to create X10 Overdrive Core (200 BDAG/day). Consume Gas Shards for 100% success. Gear immune to decay during forging',
    },
    color: '#3b82f6',
  },
  {
    set: 'siphon',
    name: 'The Siphon',
    individual: '-15% Transaction/Swap Fees (Multiplicative)',
    pieces3: {
      title: 'Gas Refining',
      description: 'Transactions generate Gas Shards (Non-tradeable until refined)',
    },
    pieces5: {
      title: 'Logistics Master',
      description: 'Bundle Gas Shards into Refined Siphon Cores and sell on marketplace for BDAG',
    },
    color: '#f59e0b',
  },
  {
    set: 'architect',
    name: 'The Architect',
    individual: '-10% Construction & Crafting Costs',
    pieces3: {
      title: 'Industrial Scouting',
      description: 'Real-world GPS movement in Industrial Zones grants Blueprint Fragments',
    },
    pieces5: {
      title: 'The Service Board',
      description: 'Craft Nano-Repair Cores using Fragments and sell for BDAG. Auto-repairs own gear; 25% discount for Friends List members',
    },
    color: '#ec4899',
  },
  {
    set: 'broker',
    name: 'The Broker',
    individual: '+0.5% Network Commission on all friend rewards',
    pieces3: {
      title: 'Social Frictionless',
      description: 'Friends receive 50% gas fee waiver when receiving P2P transfers from you',
    },
    pieces5: {
      title: 'The Syndicate',
      description: 'Broadcast "Set Multiplier" to boost all Vault friends\' Forge Success Rate by 10% for 2h. Buy Cores in bulk at 5% discount',
    },
    color: '#a855f7',
  },
];

// Building skins database
export const BUILDING_SKINS: BuildingSkin[] = [
  {
    id: 'house-basic-purple',
    name: 'Purple Cottage',
    grade: 'purple',
    modelPath: '/public/assets/models/buildings/house-basic.glb',
    materials: {
      base: 'HouseWalls',
      accent: 'HouseAccents',
    },
    colors: {
      base: '#9333ea',
      accent: '#d8b4fe',
    },
    description: 'Basic residential house',
  },
  {
    id: 'house-basic-orange',
    name: 'Orange Cottage',
    grade: 'orange',
    modelPath: '/public/assets/models/buildings/house-basic.glb',
    materials: {
      base: 'HouseWalls',
      accent: 'HouseAccents',
    },
    colors: {
      base: '#ea580c',
      accent: '#fed7aa',
    },
    description: 'Basic residential house',
  },
  {
    id: 'tower-purple',
    name: 'Purple Tower',
    grade: 'purple',
    modelPath: '/public/assets/models/buildings/tower.glb',
    materials: {
      base: 'TowerWalls',
      accent: 'TowerAccents',
    },
    colors: {
      base: '#7c3aed',
      accent: '#a78bfa',
    },
    description: 'Defensive tower',
  },
  {
    id: 'tower-orange',
    name: 'Orange Tower',
    grade: 'orange',
    modelPath: '/public/assets/models/buildings/tower.glb',
    materials: {
      base: 'TowerWalls',
      accent: 'TowerAccents',
    },
    colors: {
      base: '#c2410c',
      accent: '#fb923c',
    },
    description: 'Defensive tower',
  },
];

// ========================================
// UTILITY HOOKS & HELPERS
// ========================================

export const useSkin = (skinId: string, type: 'equipment' | 'building' = 'equipment') => {
  if (type === 'equipment') {
    return EQUIPMENT_SKINS.find((skin) => skin.id === skinId);
  }
  return BUILDING_SKINS.find((skin) => skin.id === skinId);
};

export const useEquipmentBySet = (set: EquipmentSet) => {
  return EQUIPMENT_SKINS.filter((skin) => skin.set === set);
};

export const useEquipmentSkinsByType = (type: EquipmentType) => {
  return EQUIPMENT_SKINS.filter((skin) => skin.type === type);
};

export const useBuildingSkinsByGrade = (grade: EquipmentGrade) => {
  return BUILDING_SKINS.filter((skin) => skin.grade === grade);
};

export const getSetBonus = (set: EquipmentSet): SetBonusInfo | undefined => {
  return SET_BONUSES.find((bonus) => bonus.set === set);
};

export const applyMaterialColor = (mesh: any, materialName: string, color: string) => {
  if (!mesh) return;
  if (mesh.material && mesh.material.name === materialName) {
    mesh.material.color.setStyle(color);
  }
  if (mesh.children) {
    mesh.children.forEach((child: any) => {
      applyMaterialColor(child, materialName, color);
    });
  }
};
