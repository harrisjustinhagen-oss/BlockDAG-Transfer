# MetaHuman + Avaturn Hybrid Avatar System

## Overview

Your app now supports **TWO seamless avatar creation methods**:

### Option 1: Upload MetaHuman Export (Free, Manual)
- Create avatar in MetaHuman Creator (https://www.unrealengine.com/metahuman)
- Export as `.glb` file
- Upload directly to your profile
- ✅ No API key required
- ✅ Free
- ✅ Full creative control
- Takes 10-15 minutes per avatar

### Option 2: Auto-Generate from Photo (Fast, Automatic)
- Upload a photo
- Click "Generate Avatar"
- AI creates 3D avatar instantly (via Avaturn API)
- ✅ One click
- ✅ Instant
- ⚠️ Requires paid Avaturn API key
- Takes 30 seconds

---

## User Experience

When user creates a new profile, they see **both options side-by-side**:

```
Create New Profile Modal
├─ LEFT: ✨ Upload MetaHuman
│  └─ Choose .glb file from MetaHuman Creator
│
└─ RIGHT: 🎬 Auto-Generate from Photo
   ├─ Upload photo (JPG/PNG)
   └─ Click "Generate Avatar"
```

User can choose whichever they prefer!

---

## Setup (Optional - Only for Auto-Generation)

If you want the auto-generation feature (right side), get an Avaturn API key:

### Step 1: Sign Up for Avaturn
1. Go to: https://avaturn.net/
2. Click **"Get Started"** or **"Sign Up"**
3. Create account
4. Get API key from dashboard

### Step 2: Create `.env.local`
```env
VITE_AVATURN_API_KEY=your_key_from_avaturn
VITE_AVATURN_ENDPOINT=https://api.avaturn.net/
```

### Step 3: Restart Dev Server
```bash
npm run dev
```

### Step 4: Test
- Create new profile
- Try both options:
  - Upload MetaHuman (should work - no API needed)
  - Upload photo and generate (works with API key)

---

## Without API Key

If you skip the API key setup:
- ✅ MetaHuman uploads work perfectly (left side)
- ✅ Photo upload works (right side)
- ⚠️ Photo generation uses mock mode (shows placeholder)
- Perfect for **testing the UI** without paying

---

## How It Works (Technical)

### MetaHuman Flow
```
User uploads .glb file
    ↓
avatarService.validateMetaHumanExport()
    ↓
Checks file format
    ↓
If valid: setAvatarModelData(glbData)
    ↓
AvatarViewer displays 3D model
```

### Photo Auto-Generation Flow
```
User uploads photo
    ↓
User clicks "Generate Avatar"
    ↓
avatarService.generateAvatarFromPhoto(photoBase64)
    ↓
Sends to Avaturn API
    ↓
Avaturn returns .glb model
    ↓
setAvatarModelData(glbData)
    ↓
AvatarViewer displays 3D model
```

### Both flows end up with 3D model displayed!

---

## Pricing Comparison

| Method | Cost | Setup Time | Quality | Control |
|--------|------|-----------|---------|---------|
| **MetaHuman** | FREE ✅ | 15 min | Excellent | Full |
| **Avaturn API** | $9-50/month | 5 min | Very Good | Auto |
| **ReadyPlayer Me** | ❌ Shutting down | - | Good | Auto |

---

## File Structure

```
services/
  └── avatarService.ts         ← Two methods:
                                 - generateAvatarFromPhoto() [Avaturn]
                                 - validateMetaHumanExport() [Free]

components/profile/
  └── AvatarViewer.tsx         ← Displays both

App.tsx                         ← New Profile modal with both options
  └── ProfilePanel
      └── New modal with 2-column layout
```

---

## User Guide

### For Users: Creating a Profile

**Method A: MetaHuman (Free, 15 min)**
1. Go to https://www.unrealengine.com/metahuman
2. Create your avatar (customize face, body, clothes, etc.)
3. Export as `.glb` file
4. In app: Click "Upload MetaHuman"
5. Select your `.glb` file
6. Click "Create Profile"

**Method B: Auto-Generate (Instant)**
1. In app: Click "Auto-Generate from Photo"
2. Take or upload a headshot (JPG/PNG)
3. Click "Generate Avatar"
4. See your 3D avatar appear!
5. Click "Create Profile"

---

## Avaturn API Pricing

For reference (as of late 2024):

| Plan | Cost | Monthly Generations |
|------|------|-------------------|
| Free | $0 | 10 |
| Pro | $19/month | 500 |
| Premium | $49/month | Unlimited |

You only pay if you want auto-generation. MetaHuman uploads are always free!

---

## What Happens at Runtime

### User uploads MetaHuman .glb
```
✅ Works in mock mode (no API)
✅ File validated locally
✅ 3D model displays immediately
```

### User uploads photo (no Avaturn API)
```
✅ Photo loads
✅ Button says "Generate Avatar"
✅ Click → Shows mock success (development)
✅ Falls back gracefully
```

### User uploads photo (with Avaturn API)
```
✅ Photo loads
✅ Click "Generate Avatar"
✅ Progress spinner shows
✅ API request sent to Avaturn
✅ Real 3D model returns
✅ Displays in profile
```

---

## Troubleshooting

### "MetaHuman upload doesn't work"
→ Make sure file is `.glb` format (not `.fbx` or `.uasset`)
→ Right-click file → Properties → Should say "glb" type

### "Photo generation says 'mock mode'"
→ Normal! You don't have Avaturn API key
→ Perfect for testing UI
→ Add API key when ready for real generation

### "3D avatar not showing"
→ Check browser console for errors
→ Verify `.glb` file is valid
→ Try with sample GLB model first

---

## Next Steps

### Now (Required)
- ✅ MetaHuman uploads ready to use
- ✅ Photo uploads ready to use
- ✅ Both display 3D models

### Optional (When Ready)
- Get Avaturn API key for auto-generation
- Add `.env.local` with Avaturn credentials
- Test auto-generation feature
- Monitor API usage/costs

---

## Resources

- **MetaHuman Creator**: https://www.unrealengine.com/metahuman
- **Avaturn**: https://avaturn.net/
- **Three.js**: https://threejs.org/ (for 3D rendering)
- **GLB Format**: https://github.com/KhronosGroup/glTF

---

## Summary

✅ **MetaHuman uploads**: Free, manual, full control  
✅ **Auto-generation**: Fast, one-click, requires Avaturn API  
✅ **Both in one UI**: Users choose their preference  
✅ **Seamless**: Both produce same 3D avatar in profile  
✅ **No breaking changes**: Works without API key  

The system is **production-ready**. Start with MetaHuman uploads (free), add Avaturn API later (optional) for auto-generation!
