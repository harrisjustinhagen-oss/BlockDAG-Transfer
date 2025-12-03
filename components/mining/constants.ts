
import { Miner, MinerStatus } from '../../types';

export const MODEL_SPECS: Record<string, { maxHash: number; maxPower: number; efficiency: number }> = {
  'X1': { maxHash: 0.25, maxPower: 5, efficiency: 0 }, 
  'X10-Blade': { maxHash: 100, maxPower: 250, efficiency: 2.5 }, 
  'X30-Core': { maxHash: 8.5, maxPower: 3400, efficiency: 400 }, 
  'X100-Mainframe': { maxHash: 200, maxPower: 5000, efficiency: 25 }
};

export const INITIAL_MINERS: Miner[] = [
  {
    id: 'x1-local',
    name: 'My Phone',
    model: 'X1',
    type: 'mobile',
    status: MinerStatus.OFFLINE,
    hashrate: 0,
    hashrateUnit: 'BDAG/h',
    temperature: 32.5,
    powerUsage: 0
  },
  {
    id: 'x10-home-1',
    name: 'Living Room Node',
    model: 'X10-Blade',
    type: 'home',
    status: MinerStatus.OFFLINE,
    hashrate: 0, 
    hashrateUnit: 'BDAG/h',
    temperature: 24.0,
    powerUsage: 0
  },
  {
    id: 'asic-01',
    name: 'Garage Rack 1',
    model: 'X30-Core',
    type: 'asic',
    status: MinerStatus.MINING,
    hashrate: 8.2,
    hashrateUnit: 'TH/s',
    temperature: 72.0,
    powerUsage: 3100,
    ipAddress: '192.168.1.105',
    uptime: 145000
  },
  {
    id: 'asic-cluster-alpha',
    name: 'Mining Farm A',
    model: 'X100-Mainframe',
    type: 'asic',
    status: MinerStatus.OFFLINE,
    hashrate: 0,
    hashrateUnit: 'TH/s',
    temperature: 20.0,
    powerUsage: 0,
    ipAddress: '10.0.0.5'
  }
];
