# Fitbit Integration Setup Guide

## Overview
This guide explains how to integrate the Fitbit API with your BlockDAG-X1 application to fetch real health data from Fitbit Versa 2 and other Fitbit devices.

## Prerequisites
- A Fitbit account (free tier available)
- Fitbit Versa 2 or other Fitbit device
- Fitbit app installed on your phone/device

## Step 1: Register Your Application

1. Go to [Fitbit Developer Console](https://dev.fitbit.com/apps)
2. Sign in with your Fitbit account (create one if needed)
3. Click "Register an App"
4. Fill in the application details:
   - **Application Name**: BlockDAG-X1 Game
   - **Description**: Fitness tracking for game character stats
   - **Application Website**: `http://localhost:5173` (for local dev)
   - **Organization**: Your name/organization
   - **Organization Website**: Your website (or localhost)
   - **Agreement**: Accept the terms
5. For **OAuth 2.0 Application Type**, select:
   - **Personal** (for testing) or **Server** (for production)
6. For **Redirect URL**, enter:
   - Development: `http://localhost:5173/auth/fitbit-callback`
   - Production: `https://yourdomain.com/auth/fitbit-callback`
7. Click "Save"

## Step 2: Get Your Credentials

After registering, you'll receive:
- **Client ID**: Copy this
- **Client Secret**: Copy this (keep it secure!)

## Step 3: Configure Environment Variables

1. Create `.env.local` in your project root (or update if exists):

```bash
VITE_FITBIT_CLIENT_ID=your_client_id_here
VITE_FITBIT_CLIENT_SECRET=your_client_secret_here
```

2. Never commit `.env.local` to git (it's in `.gitignore`)

## Step 4: Set Up OAuth Redirect Handler

The app already includes the callback handler at `/auth/fitbit-callback`. Make sure your app router includes:

```typescript
import { FitbitAuthCallback } from './components/auth/FitbitAuthCallback';

// In your router configuration:
<Route path="/auth/fitbit-callback" element={<FitbitAuthCallback />} />
```

## Step 5: Add Connect Fitbit Button to UI

Update your SmartWatchModal or dashboard to include a Fitbit login button:

```typescript
import fitbitService from '../../services/fitbitService';

const handleConnectFitbit = () => {
  fitbitService.startOAuthFlow();
};

// In your JSX:
<button onClick={handleConnectFitbit}>
  Connect Fitbit Account
</button>
```

## Step 6: Fetch Health Data

Once authenticated, you can fetch data:

```typescript
import fitbitService from '../../services/fitbitService';

// Check if authenticated
if (fitbitService.isAuthenticated()) {
  // Fetch today's data
  const healthData = await fitbitService.getTodayHealthData();
  console.log(healthData);
  // Returns: { steps, stairs, sleepScore, calories, heartRate, activeMinutes, distance, floors }
}

// Or set up continuous sync (every 30 seconds):
const cleanup = fitbitService.setupContinuousSync((data) => {
  // Update UI with new data
  setWatchData(data);
});

// Clean up on unmount:
// cleanup();
```

## Fetched Data Fields

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| steps | number | 0-50000 | Daily steps taken |
| stairs | number | 0-100 | Floors climbed |
| sleepScore | number | 0-100 | Sleep quality score |
| calories | number | 1000-5000 | Calories burned |
| heartRate | number | 40-200 | Resting heart rate |
| activeMinutes | number | 0-1440 | Minutes in active zones |
| distance | number | 0-50 | Distance traveled (miles/km) |
| floors | number | 0-100 | Floors climbed |

## Character Stat Mapping

The fetched data maps to character stats:

```
steps (0-15000) → DEX bonus (max +2)
stairs (0-50) → STR bonus (max +2)
sleepScore (60-95%) → CON bonus (max +2)
calories (1500-3500) → CHA bonus (max +2)
```

## API Scopes

The app requests these Fitbit API scopes:
- `activity`: Steps, calories, active minutes
- `heartrate`: Heart rate data
- `sleep`: Sleep duration and quality
- `profile`: User profile information

## Token Management

The service automatically:
- Stores tokens securely in localStorage
- Refreshes expired tokens
- Retries failed requests with new tokens
- Clears tokens on logout or expiration failure

## Testing with Mock Data

If Fitbit API is unavailable, the service returns mock data:
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

## Troubleshooting

### "OAuth state mismatch" error
- Clear browser cache/localStorage for the domain
- Try again in an incognito window

### "Invalid redirect URI" error
- Make sure redirect URI matches exactly in Fitbit console and `.env`
- For local dev, use exactly: `http://localhost:5173/auth/fitbit-callback`

### "Token expired" error
- Service automatically refreshes tokens
- If persists, log out and reconnect

### No data returned
- Check that Fitbit app on device has synced recent data
- Verify API scope permissions in Fitbit console
- Check browser console for specific API errors

## Production Deployment

1. Register your app with production domain
2. Update redirect URI to production URL
3. Set `VITE_FITBIT_CLIENT_ID` and `VITE_FITBIT_CLIENT_SECRET` in production environment
4. Use "Server" app type instead of "Personal" for production

## API Reference

### `fitbitService.isAuthenticated(): boolean`
Check if user is logged in and token is valid

### `fitbitService.startOAuthFlow(): void`
Redirect to Fitbit login

### `fitbitService.getTodayHealthData(): Promise<FitbitHealthData>`
Fetch today's health metrics

### `fitbitService.getHealthDataForDate(date: string): Promise<FitbitHealthData>`
Fetch data for specific date (YYYY-MM-DD format)

### `fitbitService.setupContinuousSync(callback, interval): () => void`
Set up auto-sync, returns cleanup function

### `fitbitService.logout(): void`
Clear tokens and log out

## Resources

- [Fitbit Developer Documentation](https://dev.fitbit.com/docs/)
- [Web API Reference](https://dev.fitbit.com/docs/web-api/)
- [OAuth 2.0 Guide](https://dev.fitbit.com/docs/oauth2/)
- [Activity Endpoints](https://dev.fitbit.com/docs/activity/)
