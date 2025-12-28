/**
 * Bluetooth Service for Smart Watch Discovery and Connection
 * Supports Web Bluetooth API for discovering and connecting to smartwatches
 */

export interface BluetoothDevice {
  name: string;
  id: string;
  rssi?: number; // Signal strength
  type: 'smartwatch' | 'fitness' | 'unknown';
}

// Common smartwatch UUIDs and manufacturers
const SMARTWATCH_MANUFACTURERS = [
  { name: 'Fitbit', uuids: ['fitbit'], keywords: ['Versa', 'Sense', 'Inspire'] },
  { name: 'Apple', uuids: ['apple'], keywords: ['Watch', 'Series'] },
  { name: 'Samsung', uuids: ['samsung'], keywords: ['Galaxy Watch', 'Gear'] },
  { name: 'Garmin', uuids: ['garmin'], keywords: ['Garmin', 'Epix'] },
  { name: 'Xiaomi', uuids: ['xiaomi'], keywords: ['Mi Band', 'Band'] },
  { name: 'Fossil', uuids: ['fossil'], keywords: ['Fossil', 'Sport', 'Gen'] },
  { name: 'Google', uuids: ['google'], keywords: ['Pixel Watch'] }
];

const GENERIC_SMARTWATCH_UUIDS = [
  '0000180a-0000-1000-8000-00805f9b34fb', // Device Information
  '0000180d-0000-1000-8000-00805f9b34fb', // Heart Rate
  '0000181d-0000-1000-8000-00805f9b34fb', // Weight Scale
];

/**
 * Detect if a device name/info suggests it's a smartwatch
 */
function isSmartwatchDevice(name: string, manufacturerData?: any): boolean {
  const lowerName = name.toLowerCase();
  
  // Check against known smartwatch keywords
  for (const manufacturer of SMARTWATCH_MANUFACTURERS) {
    for (const keyword of manufacturer.keywords) {
      if (lowerName.includes(keyword.toLowerCase())) {
        return true;
      }
    }
  }
  
  // Generic smartwatch patterns
  const patterns = /watch|versa|sense|band|inspire|garmin|gear|pixel|fossil/i;
  return patterns.test(name);
}

/**
 * Scan for Bluetooth devices using Web Bluetooth API
 * Only returns devices that match smartwatch profiles
 */
export async function scanForSmartWatches(): Promise<BluetoothDevice[]> {
  if (!navigator.bluetooth) {
    console.warn('Web Bluetooth API not supported in this browser');
    return [];
  }

  try {
    console.log('Initiating Bluetooth device request...');

    // Request all GATT services that are typically on smartwatches
    const device = await navigator.bluetooth.requestDevice({
      filters: [
        { services: ['generic_access'] },
        { namePrefix: 'Versa' },
        { namePrefix: 'Galaxy Watch' },
        { namePrefix: 'Pixel Watch' },
        { namePrefix: 'Watch Series' },
        { namePrefix: 'Garmin' },
        { namePrefix: 'Fossil' },
        { namePrefix: 'Mi Band' },
        { namePrefix: 'Wear OS' },
      ],
      optionalServices: GENERIC_SMARTWATCH_UUIDS,
    });

    console.log('Device selected:', device.name, device.id);

    if (device && device.name && isSmartwatchDevice(device.name)) {
      return [
        {
          name: device.name || 'Unknown Device',
          id: device.id,
          type: 'smartwatch',
        }
      ];
    }

    return [];
  } catch (error) {
    if (error instanceof DOMException && error.name === 'NotFoundError') {
      console.log('No Bluetooth device selected');
    } else {
      console.error('Bluetooth scanning error:', error);
    }
    return [];
  }
}

/**
 * Connect to a specific Bluetooth device
 */
export async function connectToSmartWatch(deviceId: string): Promise<any> {
  if (!navigator.bluetooth) {
    throw new Error('Web Bluetooth API not supported');
  }

  try {
    // This would require the device to be in the paired list
    // In practice, Web Bluetooth requires user to select device through requestDevice
    console.log('Connecting to device:', deviceId);
    return null; // Placeholder - real implementation requires device selection
  } catch (error) {
    console.error('Connection error:', error);
    throw error;
  }
}

/**
 * Get paired Bluetooth devices (requires persistent permission)
 * Note: This is limited in browsers - returns devices from previous requests
 */
export async function getPairedSmartWatches(): Promise<BluetoothDevice[]> {
  if (!navigator.bluetooth) {
    return [];
  }

  try {
    const devices = await navigator.bluetooth.getAvailability();
    if (!devices) {
      return [];
    }

    // Note: The Web Bluetooth API doesn't provide direct access to paired devices list
    // This is a limitation for privacy reasons
    // We'll simulate returning devices based on successful previous connections
    return [];
  } catch (error) {
    console.error('Error getting paired devices:', error);
    return [];
  }
}

/**
 * Mock function for testing - simulates smartwatch discovery
 * Returns common smartwatch models
 */
export function getMockSmartWatches(): BluetoothDevice[] {
  return [
    { name: 'Versa 2', id: 'fitbit-versa-2', type: 'smartwatch' },
    { name: 'Galaxy Watch 5', id: 'samsung-galaxy-5', type: 'smartwatch' },
    { name: 'Pixel Watch', id: 'google-pixel-watch', type: 'smartwatch' },
    { name: 'Watch Series 8', id: 'apple-series-8', type: 'smartwatch' },
    { name: 'Garmin Epix Gen 2', id: 'garmin-epix', type: 'smartwatch' },
  ];
}

/**
 * Filter to show only smartwatches from a device list
 */
export function filterSmartWatches(devices: BluetoothDevice[]): BluetoothDevice[] {
  return devices.filter(device => {
    if (device.type === 'smartwatch') return true;
    return isSmartwatchDevice(device.name);
  });
}

/**
 * Check if Bluetooth is available on the device
 */
export async function isBluetoothAvailable(): Promise<boolean> {
  if (!navigator.bluetooth) {
    return false;
  }

  try {
    return await navigator.bluetooth.getAvailability();
  } catch (error) {
    console.error('Error checking Bluetooth availability:', error);
    return false;
  }
}

/**
 * Get detailed device info if connected
 */
export async function getConnectedDeviceInfo(gattServer: any): Promise<any> {
  try {
    const deviceInfoService = await gattServer.getPrimaryService('0000180a-0000-1000-8000-00805f9b34fb');
    if (!deviceInfoService) {
      return null;
    }

    const manufacturerCharacteristic = await deviceInfoService.getCharacteristic('00002a29-0000-1000-8000-00805f9b34fb');
    const value = await manufacturerCharacteristic.readValue();
    
    return {
      manufacturer: new TextDecoder().decode(value),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting device info:', error);
    return null;
  }
}

/**
 * Fetch smartwatch health data via Bluetooth GATT services
 * Simulates reading from typical smartwatch health services
 */
export async function fetchSmartWatchData(deviceName: string): Promise<any> {
  console.log('Attempting to fetch data from:', deviceName);

  // Simulate fetching data from common smartwatch services
  // In a real implementation, this would read GATT characteristics
  try {
    // For now, generate realistic mock data based on device type
    const baseData = {
      steps: Math.floor(Math.random() * 15000) + 2000,
      stairs: Math.floor(Math.random() * 50) + 5,
      sleepScore: Math.floor(Math.random() * 30) + 60,
      calories: Math.floor(Math.random() * 2000) + 1500,
      heartRate: Math.floor(Math.random() * 40) + 60,
      activeMinutes: Math.floor(Math.random() * 60) + 10,
    };

    console.log('Fetched data from', deviceName, ':', baseData);
    return baseData;
  } catch (error) {
    console.error('Error fetching smartwatch data:', error);
    return null;
  }
}

/**
 * Continuously sync smartwatch data
 * Updates periodically (every 30 seconds) to get latest metrics
 */
export function setupSmartWatchSync(
  deviceName: string,
  onDataUpdate: (data: any) => void,
  interval: number = 30000
): () => void {
  console.log('Setting up sync for:', deviceName);

  const syncInterval = setInterval(async () => {
    try {
      const data = await fetchSmartWatchData(deviceName);
      if (data) {
        onDataUpdate(data);
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
  }, interval);

  // Return cleanup function
  return () => {
    clearInterval(syncInterval);
    console.log('Stopped syncing:', deviceName);
  };
}

/**
 * Listen for device connection/disconnection events
 */
export function setupBluetoothEventListeners(
  onConnect: (device: BluetoothDevice) => void,
  onDisconnect: (deviceId: string) => void
): () => void {
  if (!navigator.bluetooth) {
    console.warn('Web Bluetooth API not available');
    return () => {};
  }

  // Note: Web Bluetooth doesn't provide system-wide events
  // This would need to be implemented at application level
  
  return () => {
    // Cleanup function
  };
}
