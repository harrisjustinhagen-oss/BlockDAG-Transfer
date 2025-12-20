# UE5 Skin System Guide

## Overview

This system allows you to:
1. **Create armor/equipment skins in UE5** - Unique models for each armor type
2. **Create building skins in UE5** - Unique styles for purple/orange buildings
3. **Swap between colors** - Purple and Orange variants load dynamically
4. **Export from UE5** - Use glTF format, load in Three.js in your web app

---

## Workflow: Creating Equipment Skins in UE5

### Step 1: Design Your Armor Model
1. Create a new mesh in UE5 for each armor type:
   - Head → Helm model
   - Chest → Breastplate model
   - Gloves → Gauntlets model
   - Legs → Leggings model
   - Boots → Boots model

### Step 2: Create Material Instances
For **each armor type**, create 2 material instances:
- `[Armor]_Purple` - Purple colored variant
- `[Armor]_Orange` - Orange colored variant

Example for Iron Helm:
```
IronHelm_Purple
  - Base Color: #9333ea (Purple)
  - Metallic: 0.8
  - Roughness: 0.2

IronHelm_Orange
  - Base Color: #ea580c (Orange)
  - Metallic: 0.8
  - Roughness: 0.2
```

### Step 3: Apply Materials to Mesh
1. Select the armor mesh
2. In Details → Materials, assign the appropriate material
3. Make sure material names match your database (see `EquipmentSkinSystem.tsx`)

### Step 4: Export as glTF
```
1. Select mesh in World Outliner
2. Edit → Export Selected
3. Choose: glTF Binary (.glb)
4. Output: /public/assets/models/armor/[armor-name].glb
5. Enable: Bake Animation, Export Materials, Export Textures
```

### Step 5: Update Database
Edit `EquipmentSkinSystem.tsx` and add to `EQUIPMENT_SKINS`:

```typescript
{
  id: 'helm-iron',
  name: 'Iron Helm',
  type: 'head',
  modelPath: '/assets/models/armor/iron-helm.glb',  // Your export path
  materials: {
    purple: 'IronHelm_Purple',  // Material name in UE5
    orange: 'IronHelm_Orange',
  },
  description: 'Classic iron helmet',
  baseColor: {
    purple: '#9333ea',
    orange: '#ea580c',
  },
}
```

---

## Workflow: Creating Building Skins in UE5

### Step 1: Design Base Building Models
Create building meshes:
- `house-basic.glb` - Small house
- `tower.glb` - Tower
- `market.glb` - Market building
- `farm.glb` - Farm building

### Step 2: Create Purple & Orange Material Sets

For each building, create materials:
```
HouseWalls_Purple
HouseWalls_Orange
HouseAccents_Purple
HouseAccents_Orange
```

**Purple** colors:
- Walls: `#9333ea`
- Accents: `#d8b4fe`

**Orange** colors:
- Walls: `#ea580c`
- Accents: `#fed7aa`

### Step 3: Create Two Variants

Create two versions of each building:
1. **Purple Grade Version** - Use purple materials
2. **Orange Grade Version** - Use orange materials

### Step 4: Export Both Versions

```
1. Select purple building
2. Edit → Export Selected
3. Output: /public/assets/models/buildings/house-basic.glb
4. Repeat for orange version (same filename, materials already swapped)
```

### Step 5: Update Database

Edit `EquipmentSkinSystem.tsx` and add to `BUILDING_SKINS`:

```typescript
{
  id: 'house-basic-purple',
  name: 'Purple Cottage',
  grade: 'purple',
  modelPath: '/assets/models/buildings/house-basic.glb',
  materials: {
    base: 'HouseWalls',
    accent: 'HouseAccents',
  },
  colors: {
    base: '#9333ea',
    accent: '#d8b4fe',
  },
  description: 'Basic residential house',
}
```

---

## Using Skins in Your App

### Equipment Skin Selector

```tsx
import { EquipmentSkinSelector } from '@/components/equipment/EquipmentSkinSelector';

export function MyComponent() {
  const [showSelector, setShowSelector] = useState(false);

  return (
    <>
      <button onClick={() => setShowSelector(true)}>
        Choose Helmet Skin
      </button>

      {showSelector && (
        <EquipmentSkinSelector
          armorType="head"
          currentSkinId="helm-iron"
          currentGrade="purple"
          onSelect={(skinId, grade) => {
            console.log('Selected:', skinId, grade);
          }}
          onClose={() => setShowSelector(false)}
        />
      )}
    </>
  );
}
```

### Building Skin Selector

```tsx
import { BuildingSkinSelector } from '@/components/equipment/BuildingSkinSelector';

export function CityBuilder() {
  const [showSelector, setShowSelector] = useState(false);

  return (
    <>
      <button onClick={() => setShowSelector(true)}>
        Choose Building Style
      </button>

      {showSelector && (
        <BuildingSkinSelector
          onSelect={(skinId) => {
            console.log('Selected building:', skinId);
          }}
          onClose={() => setShowSelector(false)}
        />
      )}
    </>
  );
}
```

---

## File Structure

```
public/assets/models/
├── armor/
│   ├── iron-helm.glb
│   ├── chest-plate.glb
│   ├── gloves-leather.glb
│   ├── legs-plate.glb
│   └── boots-steel.glb
└── buildings/
    ├── house-basic.glb
    ├── tower.glb
    ├── market.glb
    └── farm.glb

components/equipment/
├── EquipmentSkinSystem.tsx       # Database & hooks
├── Equipment3DViewer.tsx         # 3D model display
├── EquipmentSkinSelector.tsx     # Armor selector UI
└── BuildingSkinSelector.tsx      # Building selector UI
```

---

## Material Color Swapping

The system automatically swaps colors based on grade:

```typescript
// When user selects a skin + grade:
applyMaterialColor(mesh, 'IronHelm_Purple', '#9333ea');
// or
applyMaterialColor(mesh, 'IronHelm_Orange', '#ea580c');
```

---

## Best Practices

### Color Consistency
- **Purple Theme**: `#9333ea` (base) → `#d8b4fe` (accent)
- **Orange Theme**: `#ea580c` (base) → `#fed7aa` (accent)

### Model Optimization
1. Keep models under 1MB each (use LOD in UE5)
2. Bake lighting in UE5 to reduce load time
3. Use optimized textures (2K max)
4. Name materials clearly (e.g., `ChestPlate_Purple`)

### Testing
1. Export a test model
2. Place in `/public/assets/models/test/`
3. Load and test in 3D viewer
4. Check material names match database

---

## Troubleshooting

### Model Not Loading
- Check file path in database matches actual export location
- Verify `.glb` file exists in public folder
- Check browser console for errors

### Materials Not Swapping Color
- Verify material name in database matches UE5 material name
- Ensure material has proper base color property
- Check that materials are exported with the model

### Low Performance
- Reduce model polygon count in UE5
- Use simpler textures
- Bake lighting instead of real-time
- Disable auto-rotate for Performance

---

## Next Steps

1. ✅ Create your first armor model in UE5
2. ✅ Export as glTF (binary)
3. ✅ Place in `/public/assets/models/armor/`
4. ✅ Update `EQUIPMENT_SKINS` database
5. ✅ Test in Equipment Skin Selector
6. ✅ Repeat for other armor types
7. ✅ Create building models
8. ✅ Export building models
9. ✅ Update `BUILDING_SKINS` database
10. ✅ Test in Building Skin Selector

Your armor and buildings are now fully customizable with purple/orange themes!
