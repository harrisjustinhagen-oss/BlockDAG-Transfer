# 3D Avatar Implementation Guide

This guide explains how to use the 3D avatar generation and display system integrated into BlockDAG X1.

## Overview

The avatar system allows users to:
1. Upload a headshot image (from UE5 avatar creator or other source)
2. Generate a 3D avatar model using an Avatar SDK
3. Display the 3D avatar in the profile (rotating, interactive 3D model)
4. Save and persist avatar models in localStorage

## Architecture

### Components

#### 1. **AvatarViewer.tsx** (`components/profile/AvatarViewer.tsx`)
- React component that renders 3D models using Three.js
- Displays GLB/GLTF format 3D avatar models
- Features:
  - Auto-rotation (Y-axis spin)
  - Ambient + directional lighting
  - Model centering and scaling
  - Circular container matching profile UI
  - Loading spinner
  - Error handling
- Props:
  - `modelData` (string): Base64-encoded GLB model data
  - `modelUrl` (string): URL to .glb/.gltf file (alternative to modelData)
  - `isLoading` (boolean): Show loading spinner
  - `onError` (function): Error callback
  - `size` ('small'|'medium'|'large'): Container size

#### 2. **avatarService.ts** (`services/avatarService.ts`)
- Service layer for Avatar SDK integration
- Methods:
  - `generateAvatar(imageBase64)`: Generate 3D avatar from photo
  - `downloadModel(modelUrl)`: Fetch and convert model to base64
  - `isValidGLB(data)`: Validate GLB format
- Configuration via environment variables:
  - `VITE_AVATAR_SDK_API_KEY`: API key from your Avatar SDK
  - `VITE_AVATAR_SDK_ENDPOINT`: API endpoint URL
- Falls back to mock avatar generation if API not configured

#### 3. **ProfilePanel** (in `App.tsx`)
- Integrated into existing profile UI
- New state variables:
  - `avatarModelData`: 3D model data (base64 GLB)
  - `isGeneratingAvatar`: Generation in progress flag
  - `avatarGenerationError`: Error messages
- New modal sections in "Create New Profile":
  - Avatar generation button
  - Progress indicator
  - Success/error messages
- Avatar display:
  - Shows 3D viewer if model data exists
  - Falls back to static image
  - Falls back to default icon

## Setup Instructions

### Step 1: Choose Your Avatar SDK

Select one of these services:

#### **Option A: ReadyPlayer Me** (Recommended - Free tier available)
- Website: https://readyplayer.me/
- Sign up and create an API account
- Great documentation and free tier
- Supports web and mobile avatars

#### **Option B: Avaturn**
- Website: https://avaturn.net/
- API documentation: https://avaturn.net/developer
- Focuses on photorealistic avatars
- Paid tier starting at ~$9/month

#### **Option C: Pinscreen / Itseez3D**
- Enterprise solution
- Contact sales for pricing
- Most powerful and customizable
- Best for large-scale applications

### Step 2: Get API Credentials

For your chosen service, obtain:
1. API Key (authentication token)
2. API Endpoint URL
3. API Documentation for request/response format

### Step 3: Configure Environment Variables

Create or update `.env.local` in the project root:

```env
VITE_AVATAR_SDK_API_KEY=your_api_key_here
VITE_AVATAR_SDK_ENDPOINT=https://your-api-endpoint.com
```

**Example for ReadyPlayer Me:**
```env
VITE_AVATAR_SDK_API_KEY=abc123def456xyz
VITE_AVATAR_SDK_ENDPOINT=https://api.readyplayer.me/
```

### Step 4: Update Avatar SDK Request Format

Edit `services/avatarService.ts`, in the `generateAvatar()` method:

```typescript
async generateAvatar(imageBase64: string): Promise<AvatarGenerationResponse> {
  try {
    // ... existing mock check ...

    const response = await fetch(`${AVATAR_SDK_ENDPOINT}/api/avatar/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AVATAR_SDK_API_KEY}`,
      },
      body: JSON.stringify({
        image: imageBase64,
        format: 'glb', // Request GLB format for Three.js
        // Add any service-specific parameters here
        // e.g., quality, style, gender, etc.
      }),
    });

    // ... response handling ...
  }
}
```

Update this based on your Avatar SDK's actual API spec:
- Request endpoint path
- Header names and format
- Request body structure
- Response body structure

### Step 5: Test Avatar Generation

1. Start the development server:
```bash
npm run dev
```

2. Navigate to Profile tab
3. Click "New Profile"
4. Upload a headshot image
5. Click "Generate 3D Avatar"
6. Monitor console for errors

**In Mock Mode** (no API key configured):
- Generation succeeds but returns placeholder data
- Useful for UI testing without real API

## Data Flow

### Avatar Creation Flow

```
User selects "New Profile"
    ↓
User uploads headshot image (PNG/JPG)
    ↓
User clicks "Generate 3D Avatar" button
    ↓
avatarService.generateAvatar(imageBase64) called
    ↓
API request sent to Avatar SDK with image
    ↓
Avatar SDK processes image, returns 3D model (GLB)
    ↓
Response received: { success: true, modelData: "base64_glb_data" }
    ↓
avatarModelData state updated
    ↓
AvatarViewer component re-renders with 3D model
    ↓
User sees rotating 3D avatar in modal
    ↓
User clicks "Create" to save profile
    ↓
Both static image and 3D model saved to localStorage
```

### Avatar Display Flow

```
Profile loads
    ↓
Load avatarUrl from localStorage (static image)
    ↓
Load avatarModelData from localStorage (3D GLB)
    ↓
If modelData exists:
  ↓ Display AvatarViewer (3D rotating head)
Else if avatarUrl exists:
  ↓ Display static image
Else:
  ↓ Display default ProfileIcon
```

## Storage

### localStorage Keys

- `profileAvatar:{username}`: Static image (data URL)
- `profileAvatarModel:{username}`: 3D model data (base64 GLB)
- `profileBio:{username}`: User bio text
- `profileEmail:{username}`: User email
- `profileLocation:{username}`: User location

**Note:** localStorage has ~5MB limit. For large models, consider:
- IndexedDB for larger storage
- Server-side storage (database)
- Cloud storage (S3, etc.)

## API Request Examples

### ReadyPlayer Me Example

```bash
curl -X POST https://api.readyplayer.me/api/avatar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "image": "base64_image_data_here",
    "format": "glb"
  }'
```

Response:
```json
{
  "avatarId": "unique_id",
  "modelUrl": "https://models.readyplayer.me/...",
  "modelData": "base64_glb_data"
}
```

### Avaturn Example

```bash
curl -X POST https://api.avaturn.net/api/gens/male/image2avatar \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "imageBase64": "base64_image_data_here",
    "outputFormat": "glb"
  }'
```

## Error Handling

### Common Issues

#### 1. **"Avatar SDK not configured" warning**
- **Cause**: `VITE_AVATAR_SDK_API_KEY` not set
- **Solution**: Add API key to `.env.local` and restart dev server

#### 2. **"Failed to generate avatar" error**
- **Cause**: Invalid image, API quota exceeded, or API misconfiguration
- **Solution**:
  - Verify image is valid JPG/PNG
  - Check API credentials
  - Review API documentation for request format
  - Check API quota/limits

#### 3. **3D Avatar not displaying**
- **Cause**: Invalid GLB format or Three.js issue
- **Solution**:
  - Verify model data is valid GLB
  - Check browser console for Three.js errors
  - Test with sample GLB model

#### 4. **Model Too Large for localStorage**
- **Cause**: GLB model exceeds 5MB localStorage limit
- **Solution**:
  - Use server-side storage instead
  - Compress GLB with Draco compression
  - Store URL instead of base64 data

## Advanced Configuration

### Model Compression

For large models, use Draco compression:

```typescript
// In AvatarViewer.tsx
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');
loader.setDRACOLoader(dracoLoader);
```

### Custom Lighting

Edit `AvatarViewer.tsx` to customize lighting:

```typescript
// Ambient light (overall brightness)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);

// Directional light (sun-like)
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7);
```

### Custom Rotation Speed

Edit auto-rotation in `AvatarViewer.tsx`:

```typescript
// In animation loop
if (modelRef.current) {
  modelRef.current.rotation.y += 0.005; // Change this value
  // Lower = slower, Higher = faster
}
```

## Testing Without API

### Mock Mode Development

When `VITE_AVATAR_SDK_API_KEY` is not set:
- Avatar generation always succeeds
- Returns mock data with placeholder avatar ID
- Useful for UI/UX testing
- Switch to real API when ready

### Test with Sample GLB File

1. Find a sample GLB file (search "free GLB models")
2. Convert to base64
3. Pass to AvatarViewer as `modelData` prop

```typescript
// For testing only
const testGLB = "base64_sample_glb_data_here";
<AvatarViewer modelData={testGLB} />
```

## Integration with UE5 Avatar Creator

The system is designed to work with UE5 MetaHuman/Pixel Streaming:

1. User opens UE5 avatar creator (external link)
2. User designs and exports headshot (PNG/JPG)
3. User uploads exported image in the profile modal
4. System generates 3D avatar from the headshot
5. 3D avatar displays in profile circle

**Future Enhancement:** Direct integration with UE5 Pixel Streaming for real-time avatar preview.

## Performance Considerations

### Optimization Tips

1. **Model Loading**
   - Preload models in background
   - Cache models in browser storage
   - Use compressed GLB format

2. **Rendering**
   - Use device pixel ratio for mobile
   - Reduce lighting complexity for low-end devices
   - Implement LOD (Level of Detail)

3. **Storage**
   - Compress GLB files with Draco
   - Store URLs instead of base64 when possible
   - Implement cache strategy

### Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (with some WebGL limitations)
- Mobile: Works but may be performance-intensive

## Troubleshooting Guide

| Issue | Cause | Solution |
|-------|-------|----------|
| Avatar generation hangs | Network timeout | Check API endpoint and network |
| 3D model is black/invisible | Lighting issue | Adjust AmbientLight intensity |
| Model is too small/large | Auto-scaling issue | Adjust scale factor in AvatarViewer |
| Can't upload image | File type | Ensure JPG or PNG format |
| Model data not persisting | localStorage full | Clear old data or use server storage |
| Three.js errors in console | Import path issue | Verify GLTFLoader import path |

## Next Steps

1. **Choose Avatar SDK** → Sign up and get API key
2. **Configure .env.local** → Add credentials
3. **Test Generation** → Upload test image and verify
4. **Customize UI** → Adjust sizing, colors, animations
5. **Optimize Performance** → Monitor and improve
6. **Deploy to Production** → Set environment variables in hosting

## Support & Resources

### Documentation
- Three.js: https://threejs.org/docs/
- ReadyPlayer Me: https://docs.readyplayer.me/
- Avaturn: https://docs.avaturn.net/
- GLB Format: https://www.khronos.org/gltf/

### Example Projects
- Three.js Examples: https://threejs.org/examples/
- React Three Fiber: https://docs.pmnd.rs/react-three-fiber/

### API Alternatives
- Microsoft Roblox Avatars
- Character Creator 3
- MetaHuman from Epic Games
- Mixamo (character models)

## File Structure

```
BlockDAG-Transfer/
├── components/
│   └── profile/
│       ├── AvatarViewer.tsx          ← 3D model renderer
│       └── GroupSlots.tsx
├── services/
│   ├── avatarService.ts              ← Avatar generation service
│   └── mockFirebase.ts
├── App.tsx                           ← Profile panel integration
├── .env.local.example               ← Environment template
└── AVATAR_IMPLEMENTATION_GUIDE.md    ← This file
```

## Version History

- **v1.0** (Current)
  - Basic 3D avatar generation
  - Three.js rendering
  - localStorage persistence
  - Mock mode for development
  - Support for ReadyPlayer Me, Avaturn, Pinscreen

## Future Enhancements

- [ ] Real-time UE5 Pixel Streaming preview
- [ ] Avatar animation/emotion expressions
- [ ] Custom avatar colors and styles
- [ ] Avatar marketplace integration
- [ ] Animation library (walking, dancing, etc.)
- [ ] Multiplayer avatar interactions
- [ ] VRM (Virtual Reality Metaverse) avatar format support
- [ ] Mobile AR avatar preview
- [ ] Avatar NFT minting

---

**Last Updated:** 2025
**Maintainer:** BlockDAG Development Team
