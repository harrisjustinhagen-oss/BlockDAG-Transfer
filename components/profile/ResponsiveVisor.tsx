import React from 'react';
import EnhancedVisorDisplay from './EnhancedVisorDisplay';

interface ResponsiveVisorProps {
  /**
   * Container size
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  
  /**
   * Custom CSS classes
   */
  className?: string;
  
  /**
   * Show title/label
   * @default true
   */
  showLabel?: boolean;
  
  /**
   * Custom label text
   * @default 'Space Debris Visualization'
   */
  label?: string;
  
  /**
   * Show info panel
   * @default false
   */
  showInfo?: boolean;
}

/**
 * Responsive Visor Earth Display Component
 * Automatically scales to viewport and container sizes
 * Can be used in dashboards, profiles, or as a full-screen display
 */
const ResponsiveVisor: React.FC<ResponsiveVisorProps> = ({
  size = 'medium',
  className = '',
  showLabel = true,
  label = 'Space Debris Visualization',
  showInfo = false
}) => {
  const sizeMap = {
    small: 'w-48 h-48 sm:w-64 sm:h-64',
    medium: 'w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96',
    large: 'w-80 h-80 sm:w-full sm:h-screen sm:max-w-4xl sm:max-h-4xl lg:w-full lg:h-screen',
    fullscreen: 'w-screen h-screen fixed inset-0'
  };

  const containerSize = sizeMap[size];

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      {/* Label */}
      {showLabel && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-cyan-400 mb-2">{label}</h2>
          {showInfo && (
            <p className="text-sm text-cyan-300/70">
              Real-time space debris tracking simulation
            </p>
          )}
        </div>
      )}

      {/* Visor Display */}
      <div className={containerSize}>
        <EnhancedVisorDisplay />
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="mt-6 max-w-2xl mx-auto px-4">
          <div className="bg-slate-900/50 border border-cyan-500/30 rounded-lg p-4 backdrop-blur">
            <h3 className="text-cyan-400 font-semibold mb-2">About This Visualization</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-3">
              This simulation depicts orbital debris in low Earth orbit (LEO), based on NASA's tracking data from 1957 to 2025. 
              The visualization shows how space debris has accumulated over decades of space exploration.
            </p>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• <span className="text-cyan-400">Earth:</span> Central blue sphere with continental landmasses</li>
              <li>• <span className="text-cyan-400">Debris:</span> Metallic particles in concentric orbital shells</li>
              <li>• <span className="text-cyan-400">Visor:</span> Reflective cyan shell representing observation perspective</li>
              <li>• <span className="text-cyan-400">Decay:</span> Particles gradually spiral inward due to atmospheric drag</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsiveVisor;
