import { useState, useCallback, useEffect } from 'react';
import { equipmentService, EquipmentItem, PlayerEquipment, EquipmentSlot } from './EquipmentService';

/**
 * Hook for managing player equipment inventory
 */
export const usePlayerEquipment = (playerId: string) => {
  const [inventory, setInventory] = useState<PlayerEquipment[]>([]);
  const [equippedSet, setEquippedSet] = useState<PlayerEquipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load inventory on mount or when playerId changes
  useEffect(() => {
    const loadInventory = async () => {
      try {
        setLoading(true);
        const inv = await equipmentService.getPlayerInventory(playerId);
        const equipped = await equipmentService.getPlayerEquippedSet(playerId);
        setInventory(inv);
        setEquippedSet(equipped);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load inventory');
      } finally {
        setLoading(false);
      }
    };

    loadInventory();
  }, [playerId]);

  const equipItem = useCallback(
    async (itemId: string, slotType: EquipmentSlot) => {
      try {
        const success = await equipmentService.equipItem(playerId, itemId, slotType);
        if (success) {
          const equipped = await equipmentService.getPlayerEquippedSet(playerId);
          setEquippedSet(equipped);
        }
        return success;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to equip item');
        return false;
      }
    },
    [playerId]
  );

  const unequipItem = useCallback(
    async (slotType: EquipmentSlot) => {
      try {
        const success = await equipmentService.unequipItem(playerId, slotType);
        if (success) {
          const equipped = await equipmentService.getPlayerEquippedSet(playerId);
          setEquippedSet(equipped);
        }
        return success;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to unequip item');
        return false;
      }
    },
    [playerId]
  );

  const addItem = useCallback(
    async (itemId: string) => {
      try {
        const newItem = await equipmentService.addEquipmentToInventory(playerId, itemId);
        setInventory(prev => [...prev, newItem]);
        return newItem;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add item');
        return null;
      }
    },
    [playerId]
  );

  const repairItem = useCallback(
    async (itemId: string, amount?: number) => {
      try {
        const newDurability = await equipmentService.repairEquipment(playerId, itemId, amount);
        
        // Update inventory state
        setInventory(prev =>
          prev.map(item =>
            item.item_id === itemId ? { ...item, durability_current: newDurability } : item
          )
        );
        
        return newDurability;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to repair item');
        return 0;
      }
    },
    [playerId]
  );

  const getItemCondition = useCallback(
    async (itemId: string) => {
      try {
        return await equipmentService.getEquipmentCondition(playerId, itemId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get item condition');
        return 0;
      }
    },
    [playerId]
  );

  return {
    inventory,
    equippedSet,
    loading,
    error,
    equipItem,
    unequipItem,
    addItem,
    repairItem,
    getItemCondition,
  };
};

/**
 * Hook for calculating active set bonuses
 */
export const useSetBonuses = (playerId: string) => {
  const [bonuses, setBonuses] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const { equippedSet } = usePlayerEquipment(playerId);

  useEffect(() => {
    const calculateBonuses = async () => {
      try {
        setLoading(true);
        const calculatedBonuses = await equipmentService.getActiveSetBonuses(playerId);
        setBonuses(calculatedBonuses);
      } catch (err) {
        console.error('Failed to calculate bonuses:', err);
      } finally {
        setLoading(false);
      }
    };

    calculateBonuses();
  }, [playerId, equippedSet]);

  return { bonuses, loading };
};

/**
 * Hook for fetching available equipment items by set
 */
export const useEquipmentBySet = (setType: string) => {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEquipment = async () => {
      try {
        setLoading(true);
        const items = await equipmentService.getEquipmentBySet(setType as any);
        setEquipment(items);
      } catch (err) {
        console.error('Failed to load equipment:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEquipment();
  }, [setType]);

  return { equipment, loading };
};

/**
 * Hook for durability management
 */
export const useDurabilityManagement = (playerId: string, itemId: string) => {
  const [condition, setCondition] = useState(100);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCondition = async () => {
      try {
        setLoading(true);
        const cond = await equipmentService.getEquipmentCondition(playerId, itemId);
        setCondition(cond);
      } catch (err) {
        console.error('Failed to load condition:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCondition();
  }, [playerId, itemId]);

  const takeDamage = useCallback(
    async (damageAmount: number) => {
      try {
        const newDurability = await equipmentService.reduceDurability(
          playerId,
          itemId,
          damageAmount
        );
        const newCondition = await equipmentService.getEquipmentCondition(playerId, itemId);
        setCondition(newCondition);
        return newDurability;
      } catch (err) {
        console.error('Failed to apply damage:', err);
        return condition;
      }
    },
    [playerId, itemId, condition]
  );

  const repair = useCallback(
    async (amount: number = 100) => {
      try {
        await equipmentService.repairEquipment(playerId, itemId, amount);
        const newCondition = await equipmentService.getEquipmentCondition(playerId, itemId);
        setCondition(newCondition);
        return newCondition;
      } catch (err) {
        console.error('Failed to repair:', err);
        return condition;
      }
    },
    [playerId, itemId, condition]
  );

  return { condition, loading, takeDamage, repair };
};
