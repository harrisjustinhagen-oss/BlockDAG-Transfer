# Fitbit Integration - Visual Guide

## 🎯 What You'll See in Your App

### SmartWatchModal - New Fitbit Section

```
┌─────────────────────────────────────────┐
│  ⌚ Smart Watch              [✕]        │
├─────────────────────────────────────────┤
│                                         │
│  ┌─ 📱 Fitbit Account ──────────────┐  │
│  │ Connect your real Fitbit device  │  │
│  │ for automatic health data sync   │  │
│  │                                  │  │
│  │  [🔗 Connect Fitbit Account]    │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌─ Bluetooth Methods ───────────────┐  │
│  │                                   │  │
│  │ [Scan for Smart Watches]          │  │
│  │ [Generic Scan (Any Device)]       │  │
│  │ [Enter Device Name Manually]      │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

## 🔄 Connection Flow Diagram

```
User clicks 
"Connect Fitbit Account"
       ↓
[🔗 Fitbit Button Click]
       ↓
Window opens: https://www.fitbit.com/oauth2/authorize
       ↓
[User enters Fitbit credentials]
       ↓
[User clicks "Authorize"]
       ↓
Redirects to: http://localhost:3001/?code=XXX&state=XXX
       ↓
App detects OAuth parameters
       ↓
Exchanges code for access token
       ↓
✓ Success message: "Fitbit connected successfully!"
       ↓
Token stored in localStorage
       ↓
Ready to fetch health data!
```

## 📊 Data Flow After Connection

```
┌─────────────────────────────────┐
│  fitbitService.isAuthenticated()│
│  (checks token in localStorage) │
└────────────┬────────────────────┘
             │ true
             ↓
┌─────────────────────────────────┐
│  fitbitService.getTodayHealthData()
│  (fetches from Fitbit API)      │
└────────────┬────────────────────┘
             ↓
     ┌───────────────────┐
     ↓                   ↓
  steps              stairs
  8500               12
  
  calories          sleepScore
  2250              78
  
  heartRate         activeMinutes
  72                45
  
  distance          floors
  6.5               12
     │                   │
     └───────────────────┘
             ↓
┌──────────────────────────────────┐
│ Update Character Stats:          │
│ DEX +2 (from steps)              │
│ STR +2 (from stairs)             │
│ CON +2 (from sleep)              │
│ CHA +2 (from calories)           │
└──────────────────────────────────┘
```

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────┐
│           Your Application                  │
│  (Client ID: 23TV6D)                       │
└────────────────┬────────────────────────────┘
                 │
                 │ 1. Click "Connect"
                 ↓
┌─────────────────────────────────────────────┐
│        Fitbit OAuth Server                   │
│  https://www.fitbit.com/oauth2/authorize   │
│  (User enters credentials here)             │
└────────────────┬────────────────────────────┘
                 │
                 │ 2. Redirect with code
                 ↓
┌─────────────────────────────────────────────┐
│      Your App Receives Code + State         │
│  http://localhost:3001/?code=X&state=Y    │
└────────────────┬────────────────────────────┘
                 │
                 │ 3. Exchange code for token
                 ↓
┌─────────────────────────────────────────────┐
│        Fitbit Token Server                   │
│  https://api.fitbit.com/oauth2/token       │
│  (uses Client Secret)                       │
└────────────────┬────────────────────────────┘
                 │
                 │ 4. Return access token
                 ↓
┌─────────────────────────────────────────────┐
│     Store in localStorage                    │
│  (with expiry time for refresh)             │
│                                             │
│  access_token: "xxx..."                    │
│  refresh_token: "yyy..."                   │
│  expires_at: 1735372800                    │
└─────────────────────────────────────────────┘
```

## 🎮 Game Integration Example

After getting Fitbit data, integrate with your game:

```typescript
import fitbitService from './services/fitbitService';

// In your SmartWatchModal or Dashboard:
const handleSyncFitbit = async () => {
  if (fitbitService.isAuthenticated()) {
    const healthData = await fitbitService.getTodayHealthData();
    
    // Calculate stat bonuses
    const dexBonus = Math.floor(healthData.steps / 7500 * 2);
    const strBonus = Math.floor(healthData.stairs / 25 * 2);
    const conBonus = (healthData.sleepScore - 60) / 17.5;
    const chaBonus = Math.floor((healthData.calories - 1500) / 1000 * 2);
    
    // Update character
    updateCharacter({
      baseStats: {
        dex: 10 + dexBonus,
        str: 10 + strBonus,
        con: 10 + conBonus,
        cha: 10 + chaBonus
      },
      lastFitbitSync: new Date(),
      fitbitMetrics: healthData
    });
  }
};
```

## 📱 What Fitbit Data You Get

| Metric | Range | Used For |
|--------|-------|----------|
| **steps** | 0-50,000 | DEX stat bonus |
| **stairs** | 0-100 | STR stat bonus |
| **sleepScore** | 0-100 | CON stat bonus |
| **calories** | 1000-5000 | CHA stat bonus |
| **heartRate** | 40-200 | Health indicator |
| **activeMinutes** | 0-1440 | Activity level |
| **distance** | 0-50 miles | Travel tracking |
| **floors** | 0-100 | Climbing activity |

## ⚡ Key Interactions

### Click to Connect:
```
User sees: [🔗 Connect Fitbit Account]
           Click!
           ↓
           Opens Fitbit login in new tab/window
           User authenticates
           Redirects back to app
           ✓ Success!
```

### Check Authentication:
```typescript
// Anywhere in your app:
if (fitbitService.isAuthenticated()) {
  console.log('✓ User has valid Fitbit token');
  
  const data = await fitbitService.getTodayHealthData();
  // Use data...
} else {
  console.log('User not authenticated with Fitbit');
  // Show login button
}
```

### Continuous Sync:
```typescript
// Auto-update stats every 30 seconds:
useEffect(() => {
  const cleanup = fitbitService.setupContinuousSync((data) => {
    // Update UI in real-time
    setWatchData(data);
    updateStats(data);
  });
  
  return cleanup; // Cleanup on unmount
}, []);
```

## 🧪 Testing Steps

1. **Open SmartWatchModal**
   - Click the ⌚ icon in your app
   
2. **Click Fitbit Button**
   - Button: "🔗 Connect Fitbit Account"
   - Located at top of modal
   
3. **Fitbit Login**
   - Window opens to Fitbit
   - Username: your@email.com
   - Password: your_fitbit_password
   
4. **Authorize**
   - Click "Allow" or "Authorize"
   
5. **Confirm Success**
   - Browser redirects back to app
   - See message: "Fitbit connected successfully!"
   - Check console: "✓ Fitbit authentication successful!"
   - URL is clean: `http://localhost:3001/` (no code params)

6. **Verify Data**
   ```javascript
   // In browser console:
   fitbitService.isAuthenticated()  // Should be: true
   await fitbitService.getTodayHealthData()  // Returns health data
   ```

## 🎯 Next Steps After Connection

1. ✅ Connection works - test with real Fitbit
2. ✅ Get access token - stored automatically
3. **→ Fetch health data** - call `getTodayHealthData()`
4. **→ Display on dashboard** - show stats to user
5. **→ Update character** - apply stat bonuses
6. **→ Set up sync** - auto-update every 30 seconds

---

**Everything is configured! Just click the button and test!** 🚀
