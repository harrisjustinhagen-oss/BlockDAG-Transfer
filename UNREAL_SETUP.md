# Unreal Engine 5 Integration Guide

## Overview
This guide explains how to integrate UE5 graphics into City Builder while keeping your app size minimal.

## Option 1: Pixel Streaming (RECOMMENDED)
**App Size Impact: 0 MB** ✅

### How it works:
- UE5 runs on a cloud server (AWS, Azure, or your own)
- Server streams video to your web app via WebRTC
- User inputs sent back to server
- No UE5 code in your app

### Setup Steps:

1. **Build UE5 Project with Pixel Streaming Plugin:**
   ```
   - Open your City Builder project in UE5
   - Enable "Pixel Streaming" plugin
   - Package project for Windows/Linux Server
   - Deploy to cloud (AWS EC2, Azure VM, or dedicated server)
   ```

2. **Start Signaling Server:**
   ```bash
   cd YourUE5Project/Samples/PixelStreaming/WebServers/SignallingWebServer
   npm install
   node cirrus.js
   ```

3. **Configure in your app:**
   ```typescript
   // Set your UE5 server URL
   const UE5_SERVER = process.env.VITE_UE5_SERVER_URL || 'ws://your-server:8888';
   ```

### Pros:
- ✅ Zero app size increase
- ✅ Full UE5 graphics quality
- ✅ Works on any device (even low-end phones)
- ✅ Easy to update (just update server)

### Cons:
- ❌ Requires server/cloud hosting ($50-200/month)
- ❌ Network latency (50-150ms)
- ❌ Requires internet connection

---

## Option 2: Three.js with UE5 Assets
**App Size Impact: 10-50 MB** ⚠️

### How it works:
- Export optimized models/textures from UE5
- Use Three.js (already in your app) for rendering
- Progressive loading of assets

### Setup Steps:

1. **Export from UE5:**
   - Export models as glTF (.glb)
   - Compress textures (WebP, basis)
   - Use LOD (Level of Detail) models

2. **Implement lazy loading:**
   ```typescript
   // Only load when user opens City Builder
   const CityBuilderModule = lazy(() => import('./components/games/citybldr/CityBldrWithAssets'));
   ```

### Pros:
- ✅ Works offline
- ✅ No server costs
- ✅ Low latency

### Cons:
- ⚠️ Adds 10-50MB to app
- ⚠️ Limited graphics quality vs native UE5
- ⚠️ Initial download time

---

## Option 3: Hybrid Approach
**App Size Impact: 5-15 MB + Server**

### Strategy:
1. Use Three.js for basic gameplay
2. Load UE5 Pixel Streaming for:
   - Cutscenes
   - High-quality preview mode
   - Special events

### Implementation:
```typescript
<CityBuilder 
  mode="threejs"  // Default: lightweight
  onPreviewMode={() => switchToUE5Stream()}  // On-demand: high quality
/>
```

---

## Recommended Architecture

```
┌─────────────────────────────────────┐
│         Your Web App (React)         │
│          Size: ~5MB base             │
├─────────────────────────────────────┤
│                                      │
│  ┌──────────────┐  ┌──────────────┐│
│  │   Three.js   │  │  UE5 Pixel   ││
│  │  Basic Mode  │  │   Streaming  ││
│  │              │  │  (Optional)   ││
│  │   Offline    │  │   On-demand  ││
│  └──────────────┘  └──────────────┘│
│                                      │
└─────────────────────────────────────┘
```

---

## Cost Comparison

| Option | Setup Cost | Monthly Cost | App Size |
|--------|-----------|--------------|----------|
| Pixel Streaming | $0 | $50-200 | 0 MB |
| Three.js Assets | $0 | $0 | 10-50 MB |
| Hybrid | $0 | $30-100 | 5-15 MB |

---

## Code Splitting for Size Optimization

Even without UE5, optimize your current app:

```typescript
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three', 'react-globe.gl'],
          'games': ['./components/games/*'],
          'mining': ['./components/mining/*']
        }
      }
    }
  }
}
```

This ensures City Builder code only loads when needed!

---

## Next Steps

1. **Test Pixel Streaming** - Set up a basic UE5 Pixel Streaming demo
2. **Measure bandwidth** - Test with your users' typical network speeds
3. **Implement fallback** - Use Three.js if Pixel Streaming unavailable
4. **Progressive enhancement** - Start simple, add UE5 later

---

## Support Resources

- [UE5 Pixel Streaming Docs](https://docs.unrealengine.com/5.0/en-US/pixel-streaming-in-unreal-engine/)
- [AWS GameLift for UE5](https://aws.amazon.com/gamelift/)
- [Three.js Performance Tips](https://discoverthreejs.com/tips-and-tricks/)
