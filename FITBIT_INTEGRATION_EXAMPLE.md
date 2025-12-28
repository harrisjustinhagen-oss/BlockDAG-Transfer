# SmartWatch Modal Integration with Fitbit API

## Integration Example

Here's how to add Fitbit support to your SmartWatchModal component:

```typescript
import fitbitService from '../../services/fitbitService';

// In your SmartWatchModal component:

const handleConnectFitbit = () => {
  // Start OAuth flow
  fitbitService.startOAuthFlow();
};

const handleDisconnectFitbit = () => {
  fitbitService.logout();
  setConnectedWatch(null);
};

const checkFitbitConnection = async () => {
  if (fitbitService.isAuthenticated()) {
    try {
      // Fetch initial data
      const data = await fitbitService.getTodayHealthData();
      
      setConnectedWatch('Fitbit Versa 2');
      setWatchData({
        ...watchData,
        steps: data.steps,
        stairs: data.stairs,
        sleepScore: data.sleepScore,
        calories: data.calories
      });
      
      // Set up continuous sync
      const cleanup = fitbitService.setupContinuousSync((newData) => {
        setWatchData(prev => ({
          ...prev,
          steps: newData.steps,
          stairs: newData.stairs,
          sleepScore: newData.sleepScore,
          calories: newData.calories
        }));
      });
      
      // Store cleanup function for later
      (window as any).__fitbitSyncCleanup = cleanup;
      
      setShowSmartWatchModal(false);
    } catch (error) {
      console.error('Failed to connect Fitbit:', error);
      setError('Failed to sync Fitbit data');
    }
  }
};

useEffect(() => {
  // Check if already authenticated with Fitbit
  checkFitbitConnection();
}, []);

// In your JSX, replace mock Bluetooth section with:
return (
  <>
    {/* OAuth Connection Method */}
    <div className="mb-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
      <h4 className="font-bold text-white mb-2">Fitbit Account</h4>
      <p className="text-xs text-slate-400 mb-3">
        Connect your Fitbit Versa 2 to sync real health data
      </p>
      
      {fitbitService.isAuthenticated() ? (
        <div className="space-y-2">
          <p className="text-green-500 text-sm">✓ Fitbit Connected</p>
          <button
            onClick={handleDisconnectFitbit}
            className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition"
          >
            Disconnect Fitbit
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnectFitbit}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition"
        >
          🔗 Connect Fitbit
        </button>
      )}
    </div>

    {/* Existing Bluetooth Methods */}
    {/* ... keep your existing specific scan, generic scan, manual entry options ... */}
  </>
);
```

## Complete SmartWatchModal with Fitbit

Here's a minimal example of how the SmartWatchModal should look with Fitbit integrated:

```typescript
import { useState, useEffect } from 'react';
import fitbitService from '../../services/fitbitService';

interface SmartWatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (device: string) => void;
}

export const SmartWatchModal = ({ isOpen, onClose, onConnect }: SmartWatchModalProps) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fitbitAuth, setFitbitAuth] = useState(false);

  useEffect(() => {
    // Check Fitbit auth on modal open
    setFitbitAuth(fitbitService.isAuthenticated());
  }, [isOpen]);

  const handleConnectFitbit = async () => {
    if (fitbitService.isAuthenticated()) {
      try {
        setLoading(true);
        // Fetch initial data to verify connection
        const data = await fitbitService.getTodayHealthData();
        console.log('Fitbit data:', data);
        
        // Notify parent component
        onConnect('Fitbit Versa 2');
        onClose();
      } catch (err) {
        setError('Failed to sync Fitbit data');
      } finally {
        setLoading(false);
      }
    } else {
      // Start OAuth flow
      fitbitService.startOAuthFlow();
    }
  };

  const handleDisconnectFitbit = () => {
    fitbitService.logout();
    setFitbitAuth(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-slate-900 rounded-xl p-6 max-w-md w-full border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-4">Connect Smartwatch</h2>

        {/* Fitbit Section */}
        <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-blue-600/30">
          <h3 className="font-bold text-white mb-2">Fitbit Versa 2</h3>
          <p className="text-xs text-slate-400 mb-4">
            Sync real health data from your Fitbit device
          </p>
          
          {fitbitAuth ? (
            <div className="space-y-2">
              <p className="text-green-500 text-sm font-semibold">✓ Authenticated</p>
              <button
                onClick={() => {
                  handleConnectFitbit();
                }}
                disabled={loading}
                className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition disabled:opacity-50"
              >
                {loading ? 'Syncing...' : 'Sync Fitbit Data'}
              </button>
              <button
                onClick={handleDisconnectFitbit}
                className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded font-semibold transition text-sm"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnectFitbit}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition"
            >
              🔗 Login to Fitbit
            </button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Existing Bluetooth Methods */}
        <div className="space-y-3 mb-6">
          {/* Keep your existing Bluetooth scanning options here */}
          <p className="text-slate-400 text-sm">Or use Bluetooth for other wearables</p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};
```

## Integration Steps

1. **Import Fitbit Service**
   ```typescript
   import fitbitService from '../../services/fitbitService';
   ```

2. **Add Fitbit UI Section** to your SmartWatchModal with:
   - Login button (if not authenticated)
   - Sync button (if authenticated)
   - Disconnect button
   - Status indicator

3. **Handle Authentication**
   ```typescript
   if (fitbitService.isAuthenticated()) {
     // Show sync options
   } else {
     // Show login button
   }
   ```

4. **Fetch and Display Data**
   ```typescript
   const data = await fitbitService.getTodayHealthData();
   onConnect('Fitbit Versa 2');
   ```

5. **Set Up Continuous Sync**
   ```typescript
   const cleanup = fitbitService.setupContinuousSync((data) => {
     updateWatchData(data);
   });
   ```

## UI Components Needed

Add these UI elements to SmartWatchModal:

```tsx
// Fitbit Connection Card
<div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-blue-600/30">
  <h3 className="font-bold text-white mb-2">Fitbit Versa 2</h3>
  <p className="text-xs text-slate-400 mb-4">
    Connect your Fitbit device for real health data
  </p>
  {/* Status or buttons here */}
</div>

// Authentication Status
{fitbitService.isAuthenticated() && (
  <div className="p-2 bg-green-900/30 border border-green-700/50 rounded">
    <p className="text-green-400 text-sm">✓ Fitbit Authenticated</p>
  </div>
)}

// Error Display
{error && (
  <div className="p-3 bg-red-900/30 border border-red-700/50 rounded text-red-400">
    {error}
  </div>
)}
```

## State Management

Add to your App component:

```typescript
const [fitbitConnected, setFitbitConnected] = useState(false);
const [fitbitLastSync, setFitbitLastSync] = useState<Date | null>(null);

const handleConnectFitbit = async () => {
  if (fitbitService.isAuthenticated()) {
    const data = await fitbitService.getTodayHealthData();
    
    setWatchData(prev => ({
      ...prev,
      steps: data.steps,
      stairs: data.stairs,
      sleepScore: data.sleepScore,
      calories: data.calories
    }));
    
    setFitbitConnected(true);
    setFitbitLastSync(new Date());
    
    // Set up continuous sync
    const cleanup = fitbitService.setupContinuousSync((newData) => {
      setWatchData(prev => ({
        ...prev,
        steps: newData.steps,
        stairs: newData.stairs,
        sleepScore: newData.sleepScore,
        calories: newData.calories
      }));
      setFitbitLastSync(new Date());
    });
    
    (window as any).__fitbitSyncCleanup = cleanup;
  }
};
```

## Cleanup

On component unmount:

```typescript
useEffect(() => {
  return () => {
    // Stop Fitbit sync
    const cleanup = (window as any).__fitbitSyncCleanup;
    if (cleanup) cleanup();
  };
}, []);
```

## Environment Variables Required

In `.env.local`:
```
VITE_FITBIT_CLIENT_ID=your_id
VITE_FITBIT_CLIENT_SECRET=your_secret
```

And add OAuth callback route:
```tsx
<Route path="/auth/fitbit-callback" element={<FitbitAuthCallback />} />
```

That's it! Your SmartWatchModal now has Fitbit integration. 🎉
