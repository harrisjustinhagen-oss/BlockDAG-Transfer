# Visor Earth Display - Integration Guide

## Components Created

### 1. **EnhancedVisorDisplay.tsx** (Core)
The main 3D visualization component showing Earth with space debris in a visor effect.

**Features:**
- Realistic Earth with procedural continents
- 400+ space debris particles in multiple orbital shells
- Orbital decay effects (particles spiral inward)
- Visor glass reflection effects with cyan glow
- Pulsating glow animation

**Basic Usage:**
```tsx
import EnhancedVisorDisplay from './components/profile/EnhancedVisorDisplay';

<EnhancedVisorDisplay className="w-96 h-96" />
```

---

### 2. **ProfileDisplay.tsx** (Composite)
Combines avatar with visor in three different layouts.

**Props:**
- `avatarSettings` - Avatar customization data
- `showVisor` - Toggle visor display
- `layout` - 'side-by-side' | 'stacked' | 'overlay'

**Usage Examples:**

```tsx
// Side-by-side layout (default)
<ProfileDisplay
  avatarSettings={userData}
  layout="side-by-side"
/>

// Stacked vertically
<ProfileDisplay
  avatarSettings={userData}
  layout="stacked"
/>

// Avatar overlaid on visor
<ProfileDisplay
  avatarSettings={userData}
  layout="overlay"
/>
```

---

### 3. **ResponsiveVisor.tsx** (Adaptive)
Responsive wrapper that automatically scales to different screen sizes.

**Props:**
- `size` - 'small' | 'medium' | 'large' | 'fullscreen'
- `showLabel` - Show title (default: true)
- `label` - Custom title text
- `showInfo` - Show information panel
- `className` - Custom CSS classes

**Usage Examples:**

```tsx
// Small widget for dashboard
<ResponsiveVisor size="small" />

// Medium display with label
<ResponsiveVisor size="medium" showLabel={true} />

// Full-screen with info
<ResponsiveVisor
  size="fullscreen"
  showLabel={true}
  showInfo={true}
  label="Space Status Monitor"
/>

// Large with custom styling
<ResponsiveVisor
  size="large"
  className="my-8"
  showInfo={true}
/>
```

---

## Integration Examples

### In Profile Page
```tsx
import ProfileDisplay from './components/profile/ProfileDisplay';

export default function ProfilePage() {
  const avatarData = { /* avatar settings */ };
  
  return (
    <div className="p-8">
      <h1>My Profile</h1>
      <ProfileDisplay
        avatarSettings={avatarData}
        layout="side-by-side"
      />
    </div>
  );
}
```

### In Dashboard
```tsx
import ResponsiveVisor from './components/profile/ResponsiveVisor';

export default function Dashboard() {
  return (
    <div className="grid grid-cols-3 gap-6 p-8">
      <ResponsiveVisor size="small" />
      <ResponsiveVisor size="medium" showLabel={true} />
      <ResponsiveVisor size="medium" showInfo={true} />
    </div>
  );
}
```

### Full-Screen View
```tsx
import ResponsiveVisor from './components/profile/ResponsiveVisor';

export default function SpaceMonitor() {
  return (
    <ResponsiveVisor
      size="fullscreen"
      showLabel={true}
      showInfo={true}
      label="Low Earth Orbit Status"
    />
  );
}
```

---

## Responsive Sizing

All components use Tailwind CSS and are fully responsive:

### EnhancedVisorDisplay
```tsx
{/* Custom container sizing */}
<div className="w-96 h-96 sm:w-full sm:h-screen">
  <EnhancedVisorDisplay />
</div>
```

### ResponsiveVisor Built-in Sizes
- **small**: 192px → 256px (sm) - Dashboard widgets
- **medium**: 256px → 384px (sm) → 384px (lg) - Main displays
- **large**: 320px → full width - Large screens
- **fullscreen**: Full viewport - Immersive displays

---

## Performance Optimization

The visualization is optimized for:
- ✅ Smooth 60 FPS animation
- ✅ Proper Three.js resource cleanup
- ✅ Responsive resize handling
- ✅ Mobile-friendly rendering
- ✅ Progressive enhancement (degrades gracefully)

**Performance Tips:**
1. Use `small` size on mobile devices
2. Limit number of instances on same page
3. Consider lazy-loading for off-screen components
4. Use container queries for responsive behavior

---

## Customization

### Modify Debris Appearance
In `EnhancedVisorDisplay.tsx`:
```tsx
// Change orbital shells (default: [1.3, 1.6, 2.0, 2.4])
const orbitalShells = [1.2, 1.5, 1.8, 2.1, 2.4];

// Change particles per shell (default: 100)
const particlesPerShell = 150;

// Modify debris colors
debrisMaterials[0] = new THREE.MeshStandardMaterial({
  color: 0xff6600, // Change color
  metalness: 0.8,
  roughness: 0.2
});
```

### Modify Earth Appearance
```tsx
// In createEarthTexture() function, adjust continent colors
ctx.fillStyle = '#ff6600'; // Custom land color

// Or modify visor glow
const visorMaterial = new THREE.MeshStandardMaterial({
  color: 0xff00ff, // Change glow color
  emissive: 0xff0088
});
```

---

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers with WebGL support

Three.js handles rendering fallbacks for older browsers.

---

## Troubleshooting

### Black screen
- Check WebGL is enabled
- Verify container has dimensions
- Check browser console for errors

### Low performance
- Reduce debris particle count
- Use smaller container size
- Lower pixel ratio on mobile

### Visor not visible
- Ensure container has `overflow: hidden`
- Check opacity values in materials
- Verify lighting is set up

