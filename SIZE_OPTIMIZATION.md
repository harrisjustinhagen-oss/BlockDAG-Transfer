# App Size Optimization & UE5 Setup

## Current App Size Analysis

Run this to see your app's current size breakdown:

```bash
npm run build
npm run analyze
```

## Size Reduction Strategies Implemented

### 1. Code Splitting ✅
- Games load only when opened
- Three.js loads separately
- Mining components lazy loaded

### 2. Tree Shaking ✅
- Unused code automatically removed
- Production console.logs removed

### 3. Asset Optimization
```bash
# Compress images
npm install -D vite-plugin-imagemin
```

### 4. UE5 Integration (Zero Added Size)

#### Quick Setup:

**Step 1: Enable UE5 in .env**
```bash
VITE_UE5_ENABLED=true
VITE_UE5_SERVER_URL=ws://localhost:8888
```

**Step 2: Setup UE5 Server**

1. Download UE5 (Free): https://www.unrealengine.com/download
2. Create/Open City Builder Project
3. Enable Pixel Streaming Plugin:
   - Edit → Plugins → Search "Pixel Streaming" → Enable
4. Package for Server:
   - File → Package Project → Windows/Linux
5. Run with Pixel Streaming:
   ```
   YourGame.exe -PixelStreamingURL=ws://localhost:8888
   ```

**Step 3: Start Signaling Server**
```bash
cd Engine/Samples/PixelStreaming/WebServers/SignallingWebServer
npm install
node cirrus.js
```

**Step 4: Test**
- Visit your app
- Open City Builder
- Click "BLD (UE5 Graphics)"
- Should stream from UE5!

---

## Cloud Deployment (Production)

### AWS Setup (Cheapest: ~$50/month)

1. Launch EC2 Instance:
   - Type: g4dn.xlarge (GPU for UE5)
   - OS: Windows Server 2022
   - Storage: 100GB SSD

2. Install UE5 & Deploy:
   ```powershell
   # Upload your packaged UE5 build
   # Install NVIDIA drivers
   # Setup Pixel Streaming
   ```

3. Update .env:
   ```
   VITE_UE5_SERVER_URL=wss://your-ec2-ip:8888
   ```

### Cost Comparison

| Hosting | Monthly Cost | Users Supported |
|---------|-------------|-----------------|
| AWS EC2 g4dn.xlarge | $50-80 | 1-5 concurrent |
| AWS EC2 g4dn.4xlarge | $200-300 | 10-20 concurrent |
| Self-hosted dedicated | $100-200 | Unlimited* |

*Depends on your server specs

---

## Without UE5 (Keep app minimal)

Your app will work great without UE5! Current features:
- ✅ Three.js 3D globe
- ✅ All games work offline
- ✅ Total size: ~8-15 MB
- ✅ Works on slow connections

To keep it minimal:
1. Don't enable UE5 (leave VITE_UE5_ENABLED=false)
2. Continue using Three.js
3. Optimize images with WebP

---

## Build for Production

```bash
# Build optimized app
npm run build

# Check size
npm run analyze

# Preview production build
npm run preview
```

Expected sizes:
- **Without UE5**: 8-15 MB
- **With UE5 support**: 8-15 MB (same! UE5 code is <100KB)
- **UE5 runs on server**: 0 MB added to user download

---

## Performance Tips

1. **Lazy Loading** (Already implemented)
   - City Builder only loads when opened
   - Saves ~2MB initial load

2. **Image Compression**
   ```bash
   # Convert PNGs to WebP (60% smaller)
   npm install -g sharp-cli
   sharp -i public/assets/*.png -o public/assets-webp/ -f webp
   ```

3. **Enable Compression**
   ```bash
   # Add to vite.config.ts
   vite-plugin-compression
   ```

---

## Testing

Test your app size:
```bash
npm run build
cd dist
python -m http.server 8080
```

Then check Network tab in DevTools:
- Initial load should be <3MB
- Full app <15MB

---

## Need Help?

- UE5 Pixel Streaming: https://docs.unrealengine.com/5.0/en-US/pixel-streaming-in-unreal-engine/
- Vite Optimization: https://vitejs.dev/guide/build.html
- Three.js Performance: https://threejs.org/manual/#en/optimize-lots-of-objects
