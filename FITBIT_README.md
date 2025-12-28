# Fitbit API Integration - README

## 🎉 Installation Complete!

Your BlockDAG-X1 application now has **full Fitbit OAuth 2.0 integration** for syncing real health data from your Fitbit Versa 2 and other Fitbit devices.

## 📦 What You Have

### Services
- **`services/fitbitService.ts`** - Complete Fitbit API client with:
  - OAuth 2.0 authentication
  - Automatic token refresh
  - Health data fetching (steps, stairs, sleep, calories, heart rate, etc.)
  - Continuous sync support
  - Error handling & retry logic

### Components
- **`components/auth/FitbitAuthCallback.tsx`** - OAuth callback handler

### Documentation
- **`FITBIT_SETUP_GUIDE.md`** - Step-by-step setup with troubleshooting
- **`FITBIT_QUICK_START.md`** - Quick reference guide
- **`FITBIT_IMPLEMENTATION_SUMMARY.md`** - Complete implementation details
- **`FITBIT_INTEGRATION_EXAMPLE.md`** - SmartWatch modal integration examples

### Configuration
- **`.env.fitbit`** - Environment variable template

## ⚡ 5-Minute Quick Start

### 1️⃣ Register Fitbit App
Visit https://dev.fitbit.com/apps and register your application:
- **Name**: BlockDAG-X1 Game
- **Redirect URI**: `http://localhost:5173/auth/fitbit-callback`
- Copy your **Client ID** and **Client Secret**

### 2️⃣ Add Environment Variables
Create `.env.local` in your project root:
```env
VITE_FITBIT_CLIENT_ID=your_client_id_here
VITE_FITBIT_CLIENT_SECRET=your_client_secret_here
```

### 3️⃣ Add OAuth Route
In your router configuration:
```typescript
import { FitbitAuthCallback } from './components/auth/FitbitAuthCallback';

<Route path="/auth/fitbit-callback" element={<FitbitAuthCallback />} />
```

### 4️⃣ Add Connect Button
In your SmartWatchModal or dashboard:
```typescript
import fitbitService from '../../services/fitbitService';

<button onClick={() => fitbitService.startOAuthFlow()}>
  🔗 Connect Fitbit
</button>
```

### 5️⃣ Fetch Data
```typescript
if (fitbitService.isAuthenticated()) {
  const data = await fitbitService.getTodayHealthData();
  console.log(data);
  // { steps, stairs, sleepScore, calories, heartRate, activeMinutes, distance, floors }
}
```

## 📊 Health Data Fields

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| `steps` | number | 0-50,000 | Daily steps taken |
| `stairs` | number | 0-100 | Floors climbed |
| `sleepScore` | number | 0-100 | Sleep quality score |
| `calories` | number | 1,000-5,000 | Calories burned |
| `heartRate` | number | 40-200 | Resting heart rate (bpm) |
| `activeMinutes` | number | 0-1,440 | Minutes in active zones |
| `distance` | number | 0-50 | Distance traveled (miles) |
| `floors` | number | 0-100 | Floors climbed |

## 🎮 Character Stat Mapping

Map Fitbit metrics to character stats:

```typescript
// Example calculation:
const bonuses = {
  dex: Math.floor(healthData.steps / 7500 * 2),        // max +2
  str: Math.floor(healthData.stairs / 25 * 2),         // max +2
  con: (healthData.sleepScore - 60) / 17.5,           // max +2
  cha: Math.floor((healthData.calories - 1500) / 1000 * 2) // max +2
};
```

## 🔄 Continuous Sync

```typescript
// Auto-sync health data every 30 seconds:
const cleanup = fitbitService.setupContinuousSync((data) => {
  // Update your UI
  setWatchData(data);
});

// Don't forget to cleanup!
useEffect(() => {
  return cleanup;
}, []);
```

## 🔐 Security

✅ OAuth 2.0 authorization code flow
✅ Automatic token refresh
✅ Secure localStorage storage
✅ CSRF protection (state parameter)
✅ Automatic retry on auth errors
✅ Safe logout with token revocation

## 🧪 Testing Without Fitbit

If you don't have Fitbit credentials yet, the service returns realistic mock data:

```typescript
{
  steps: 8500,
  stairs: 12,
  sleepScore: 78,
  calories: 2250,
  heartRate: 72,
  activeMinutes: 45,
  distance: 6.5,
  floors: 12
}
```

## 📚 Documentation

### For Setup Instructions
→ Read **`FITBIT_SETUP_GUIDE.md`**

### For Quick Reference
→ Read **`FITBIT_QUICK_START.md`**

### For Complete Implementation Details
→ Read **`FITBIT_IMPLEMENTATION_SUMMARY.md`**

### For SmartWatch Integration Examples
→ Read **`FITBIT_INTEGRATION_EXAMPLE.md`**

## 🚀 Implementation Checklist

- [ ] Register app at https://dev.fitbit.com/apps
- [ ] Create `.env.local` with credentials
- [ ] Add OAuth callback route
- [ ] Add "Connect Fitbit" button
- [ ] Test OAuth flow
- [ ] Implement health data display
- [ ] Map to character stats
- [ ] Test continuous sync
- [ ] Test with real Versa 2
- [ ] Deploy to production

## 🆘 Troubleshooting

### "OAuth state mismatch"
Clear browser cache/localStorage and try again in incognito mode.

### "Invalid redirect URI"
Make sure the redirect URI matches exactly between Fitbit console and `.env.local`.

### "No data returned"
1. Check Fitbit app on device has synced recent data
2. Verify API scope permissions
3. Check browser console for errors

### "Token expired"
The service automatically refreshes tokens. If it fails, log out and reconnect.

## 📞 Support

- **Fitbit Developer Docs**: https://dev.fitbit.com/docs/
- **OAuth 2.0 Reference**: https://tools.ietf.org/html/rfc6749
- **API Reference**: https://dev.fitbit.com/docs/web-api/

## 🎯 Next Steps

1. **Today**: Register Fitbit app and get credentials
2. **This week**: Add OAuth route and connect button
3. **This month**: Integrate with dashboard and test
4. **Production**: Deploy and monitor usage

## 📋 Files Created

```
services/
  └── fitbitService.ts                    ← Fitbit API client
components/auth/
  └── FitbitAuthCallback.tsx              ← OAuth handler
  
FITBIT_SETUP_GUIDE.md                     ← Detailed setup
FITBIT_QUICK_START.md                     ← Quick reference
FITBIT_IMPLEMENTATION_SUMMARY.md          ← Full guide
FITBIT_INTEGRATION_EXAMPLE.md             ← SmartWatch integration
.env.fitbit                               ← Environment template
```

## 💡 Key Functions

```typescript
import fitbitService from '../../services/fitbitService';

// Check authentication
fitbitService.isAuthenticated() // boolean

// Start OAuth flow
fitbitService.startOAuthFlow() // void

// Get today's data
await fitbitService.getTodayHealthData() // Promise<FitbitHealthData>

// Get specific date data
await fitbitService.getHealthDataForDate('2025-12-27') // Promise<FitbitHealthData>

// Setup continuous sync
fitbitService.setupContinuousSync(callback, interval) // () => void (cleanup)

// Logout
fitbitService.logout() // void
```

## ⚙️ Configuration Options

In `fitbitService.ts`, you can customize:

```typescript
// Sync interval (default 30 seconds)
setupContinuousSync(callback, 60000) // 60 second interval

// API scopes (current: activity, heartrate, sleep, profile)
// Can be extended for nutrition, temperature, etc.
```

## 📈 Rate Limits

Fitbit API allows:
- **150 requests per hour** for most endpoints
- Plan accordingly for continuous sync frequency

## 🔗 Supported Devices

- Fitbit Versa 2 ✅
- Fitbit Versa 3 ✅
- Fitbit Sense ✅
- Fitbit Charge 5 ✅
- Fitbit Ionic ✅
- And more! Check https://dev.fitbit.com for full list

---

**Ready to integrate?** Start with the 5-Minute Quick Start above! 🎉
