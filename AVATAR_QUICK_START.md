# 3D Avatar Quick Start

## TL;DR - Get Started in 5 Minutes

### 1. Choose Avatar Service
Pick one:
- **ReadyPlayer Me** (Free): https://readyplayer.me/ ← **RECOMMENDED**
- **Avaturn**: https://avaturn.net/
- **Pinscreen**: Enterprise

### 2. Get API Key
Sign up and generate an API key from your chosen service.

### 3. Create `.env.local`
```env
VITE_AVATAR_SDK_API_KEY=your_key_here
VITE_AVATAR_SDK_ENDPOINT=https://api.readyplayer.me/
```

### 4. Restart Dev Server
```bash
npm run dev
```

### 5. Test It
1. Open app → Profile → New Profile
2. Upload a headshot image (PNG/JPG)
3. Click "Generate 3D Avatar"
4. See 3D spinning avatar!

---

## What You Get

✅ 3D avatar generation from photos  
✅ Rotating 3D model in profile  
✅ Avatar persistence in localStorage  
✅ Fallback to static images  
✅ Error handling and mock mode  
✅ Three.js rendering with lighting  

---

## How It Works (Simple)

```
Upload Photo → Send to Avatar SDK → Get 3D Model → Display with Three.js
```

---

## API Configuration by Service

### ReadyPlayer Me
```env
VITE_AVATAR_SDK_API_KEY=your_api_key
VITE_AVATAR_SDK_ENDPOINT=https://api.readyplayer.me/
```

### Avaturn
```env
VITE_AVATAR_SDK_API_KEY=your_api_key
VITE_AVATAR_SDK_ENDPOINT=https://api.avaturn.net/
```

### Pinscreen
```env
VITE_AVATAR_SDK_API_KEY=your_api_key
VITE_AVATAR_SDK_ENDPOINT=https://your-pinscreen-endpoint.com
```

---

## Default Behavior (No API Key)

If you don't add an API key, the app:
- ✅ Still generates avatars (mock mode)
- ✅ Shows success messages
- ✅ Allows UI testing
- ✅ Returns placeholder data

Perfect for development before API integration!

---

## Key Files

| File | Purpose |
|------|---------|
| `services/avatarService.ts` | Avatar generation API calls |
| `components/profile/AvatarViewer.tsx` | 3D avatar display (Three.js) |
| `App.tsx` | Profile panel integration |
| `.env.local` | API credentials |

---

## Troubleshooting

**Q: Avatar generation doesn't work**  
A: Check `.env.local` has correct API key and endpoint

**Q: 3D model not showing**  
A: Verify the API returns valid GLB format

**Q: Still seeing static image**  
A: Model generation failed - check browser console for errors

**Q: Want to use mock mode for testing?**  
A: Don't add API key - mock mode activates automatically

---

## Next: Real Implementation

Once API is working, you can customize:
- Lighting (brighter/darker)
- Rotation speed (faster/slower)
- Model size (bigger/smaller)
- Container style (colors, glow effects)

See `AVATAR_IMPLEMENTATION_GUIDE.md` for full details.

---

## Support

- Three.js docs: https://threejs.org/docs/
- Avatar SDK docs: Check your chosen service
- Browser console: Shows detailed error messages
