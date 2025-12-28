# Smart Watch Connection & Integration Guide

## Overview
The BlockDAG application now supports Bluetooth-enabled smartwatch connectivity. Users can scan for, connect to, and interact with their smartwatches to track fitness data and sync with their game progress.

## Supported Smartwatches
- **Fitbit**: Versa 2, Sense, Inspire series
- **Apple**: Watch Series (all versions)
- **Samsung**: Galaxy Watch, Gear series
- **Garmin**: All Epix and Fenix models
- **Google**: Pixel Watch
- **Xiaomi**: Mi Band series
- **Fossil**: All smartwatch models

## How It Works

### 1. Bluetooth Discovery
When you open the Smart Watch modal, the application uses the **Web Bluetooth API** to discover nearby smartwatches:

```typescript
// Scans for devices with known smartwatch name prefixes
const device = await navigator.bluetooth.requestDevice({
  filters: [
    { namePrefix: 'Versa' },
    { namePrefix: 'Galaxy Watch' },
    { namePrefix: 'Pixel Watch' },
    // ... more filters
  ]
});
```

### 2. Device Filtering
The `bluetoothService` automatically filters devices to show **only smartwatches**:
- Uses device name patterns (contains 'watch', 'versa', 'band', etc.)
- Checks against known manufacturer fingerprints
- Verifies GATT services typical of fitness devices

### 3. Connection Management
Once connected, the watch data is:
- Stored in application state (`connectedWatch`)
- Synced with game character stats (steps → DEX, stairs → STR, sleep → CON, calories → CHA)
- Persisted across sessions using localStorage (future enhancement)

## API Reference

### `bluetoothService.ts`

#### `scanForSmartWatches(): Promise<BluetoothDevice[]>`
Initiates a Bluetooth scan for smartwatch devices.

**Returns**: Array of discovered smartwatch devices
**Throws**: If Web Bluetooth API not available

#### `isSmartwatchDevice(name: string, manufacturerData?: any): boolean`
Determines if a device name/info indicates it's a smartwatch.

#### `filterSmartWatches(devices: BluetoothDevice[]): BluetoothDevice[]`
Filters a device list to return only smartwatches.

#### `isBluetoothAvailable(): Promise<boolean>`
Checks if the device has Bluetooth capability.

#### `getMockSmartWatches(): BluetoothDevice[]`
Returns mock smartwatch devices for testing/development.

## UI Components

### SmartWatchModal
Located in `App.tsx`, handles the entire smartwatch connection flow:

**States**:
- **Not Connected**: Shows "Scan for Smart Watches" button
- **Scanning**: Displays spinner and "Searching nearby devices..."
- **Found Devices**: Lists all discovered smartwatches with connect buttons
- **Connected**: Shows device name, connection status, disconnect option

**Props**:
```typescript
{
  isOpen: boolean;           // Modal visibility
  onClose: () => void;       // Close handler
  connectedWatch: string | null;  // Currently connected device name
  onConnect: (device: string) => void;  // Connection handler
  onDisconnect: () => void;  // Disconnection handler
}
```

## Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Yes | Full Web Bluetooth support |
| Edge | ✅ Yes | Chromium-based, full support |
| Firefox | ⚠️ Partial | Requires flag, limited support |
| Safari | ❌ No | WebBluetooth not supported |
| Mobile Chrome | ✅ Yes | Android 6.0+ |
| Mobile Safari | ❌ No | iOS restrictions |

## Fallback Behavior

If Web Bluetooth API is not available:
1. The app displays an informational message
2. Shows mock smartwatch devices for UI testing
3. Allows users to experience the interface without hardware

## Data Sync

Connected smartwatch data affects character stats:

```
Steps (daily)           → DEX bonus (5k-10k range)
Stairs (daily)          → STR bonus (10-20 range)
Sleep Score (%)         → CON bonus (70-85 range)
Calories (daily)        → CHA bonus (1500-2000 range)
Heart Rate (bpm)        → Monitored for player health
```

## Security & Privacy

- ✅ User explicitly selects devices to connect
- ✅ No automatic device pairing
- ✅ Encrypted Bluetooth communication (OS-level)
- ✅ Users can disconnect anytime
- ✅ No storage of sensitive health data

## Testing

### With Real Hardware
1. Ensure smartwatch is powered and in pairing mode
2. Click "Scan for Smart Watches"
3. Select your device from the list
4. Confirm pairing on the smartwatch

### Without Hardware
The app automatically falls back to mock devices:
- Versa 2
- Galaxy Watch 5
- Pixel Watch
- Watch Series 8
- Garmin Epix Gen 2

## Future Enhancements

- [ ] Continuous heart rate monitoring
- [ ] Sleep cycle tracking and analysis
- [ ] Workout detection and logging
- [ ] Real-time notifications to smartwatch
- [ ] Offline sync queue for disconnections
- [ ] Multi-device support (up to 3 watches)
- [ ] Cloud backup of health data
- [ ] Wearable companion app for smartwatches

## Troubleshooting

### Device not appearing in scan
- **Solution**: Ensure Bluetooth is enabled on PC and watch is in pairing mode
- **Alternative**: Check browser compatibility (Chrome/Edge recommended)

### Connection fails
- **Solution**: Disconnect other Bluetooth devices, retry scan
- **Note**: Some watches require PIN confirmation on device itself

### Data not syncing
- **Solution**: Close and reopen the SmartWatchModal to trigger fresh sync
- **Check**: Ensure watch has recent data (updates hourly)

## References

- [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)
- [GATT Services](https://www.bluetooth.com/specifications/gatt/)
- [Fitbit API Documentation](https://dev.fitbit.com/build/reference/web-api/)
