# Fitbit API Integration - Quick Start

## 🚀 Quick Setup (5 minutes)

### 1. Get Fitbit Credentials
1. Go to https://dev.fitbit.com/apps
2. Register app (name: "BlockDAG-X1 Game")
3. Copy Client ID and Client Secret

### 2. Add Environment Variables
Create `.env.local`:
```
VITE_FITBIT_CLIENT_ID=your_id
VITE_FITBIT_CLIENT_SECRET=your_secret
```

### 3. Add Fitbit Button to Your UI
```tsx
import fitbitService from '../../services/fitbitService';

<button onClick={() => fitbitService.startOAuthFlow()}>
  🔗 Connect Fitbit
</button>
```

### 4. Fetch Data
```tsx
if (fitbitService.isAuthenticated()) {
  const data = await fitbitService.getTodayHealthData();
  // Use data: steps, stairs, sleepScore, calories, heartRate, activeMinutes
}
```

## 📦 What You Get

```typescript
{
  steps: 8500,           // Daily steps
  stairs: 12,            // Floors climbed
  sleepScore: 78,        // Sleep quality 0-100
  calories: 2250,        // Calories burned
  heartRate: 72,         // Resting heart rate
  activeMinutes: 45,     // Active zone minutes
  distance: 6.5,         // Distance in miles
  floors: 12             // Same as stairs
}
```

## 🎮 Stat Mapping

```
steps → DEX bonus (+2 max)
stairs → STR bonus (+2 max)
sleepScore → CON bonus (+2 max)
calories → CHA bonus (+2 max)
```

## 🔄 Auto-Sync Setup

```tsx
useEffect(() => {
  if (fitbitService.isAuthenticated()) {
    const cleanup = fitbitService.setupContinuousSync((data) => {
      setWatchData(data);  // Update every 30 seconds
    });
    return cleanup;
  }
}, []);
```

## 🔑 Key Functions

| Function | Purpose |
|----------|---------|
| `startOAuthFlow()` | Launch Fitbit login |
| `isAuthenticated()` | Check if logged in |
| `getTodayHealthData()` | Fetch today's data |
| `getHealthDataForDate(date)` | Fetch specific date |
| `setupContinuousSync(callback)` | Auto-sync every 30s |
| `logout()` | Sign out |

## ⚙️ Features

✅ OAuth 2.0 authentication
✅ Automatic token refresh
✅ Secure token storage
✅ Error handling & retry
✅ Mock data fallback
✅ Continuous sync support
✅ TypeScript support

## 🔗 Router Setup

Add to your router:
```tsx
import { FitbitAuthCallback } from './components/auth/FitbitAuthCallback';

<Route path="/auth/fitbit-callback" element={<FitbitAuthCallback />} />
```

## 📚 Full Guide

See `FITBIT_SETUP_GUIDE.md` for detailed setup instructions and troubleshooting.

## 🆘 Troubleshooting

**"OAuth state mismatch"**: Clear localStorage, try incognito
**"Invalid redirect URI"**: Check .env and Fitbit console match exactly
**"No data"**: Sync device to Fitbit app, check API scopes
**"Token expired"**: Auto-refresh works, if fails, logout and reconnect

## 🎯 Next Steps

1. Get Fitbit credentials ✅
2. Add `.env.local` ✅
3. Add connect button to modal
4. Test OAuth flow
5. Implement data display
6. Test with real Versa 2 device
