import React from 'react';
import EnhancedVisorDisplay from './EnhancedVisorDisplay';
import Avatar3DPreview from './Avatar3DPreview';
import { AvatarData } from './AvatarCustomizer';

interface ProfileDisplayProps {
  avatarSettings?: AvatarData;
  showVisor?: boolean;
  layout?: 'side-by-side' | 'stacked' | 'overlay';
  className?: string;
}

/**
 * Integrated Profile Display Component
 * Shows avatar alongside or overlaid with space junk visor Earth
 */
const ProfileDisplay: React.FC<ProfileDisplayProps> = ({
  avatarSettings,
  showVisor = true,
  layout = 'side-by-side',
  className = ''
}) => {
  if (layout === 'overlay') {
    return (
      <div className={`relative w-full max-w-2xl mx-auto ${className}`}>
        {/* Visor background */}
        <div className="relative aspect-square rounded-full overflow-hidden">
          <div className="absolute inset-0">
            <EnhancedVisorDisplay className="w-full h-full" />
          </div>
          
          {/* Avatar overlay centered on visor */}
          {avatarSettings && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Avatar3DPreview
                avatarSettings={avatarSettings}
                size="medium"
                autoRotate={true}
                className="transform scale-50"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (layout === 'stacked') {
    return (
      <div className={`flex flex-col items-center gap-6 ${className}`}>
        {/* Visor */}
        {showVisor && (
          <div className="w-full max-w-md">
            <h3 className="text-center text-cyan-400 font-semibold mb-4">Space Status</h3>
            <EnhancedVisorDisplay className="w-full aspect-square" />
          </div>
        )}

        {/* Avatar below */}
        {avatarSettings && (
          <div className="w-full max-w-md">
            <h3 className="text-center text-cyan-400 font-semibold mb-4">Profile Avatar</h3>
            <div className="flex justify-center">
              <Avatar3DPreview
                avatarSettings={avatarSettings}
                size="large"
                autoRotate={true}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default: side-by-side layout
  return (
    <div className={`grid grid-cols-2 gap-8 items-center ${className}`}>
      {/* Avatar on left */}
      {avatarSettings && (
        <div className="flex flex-col items-center">
          <h3 className="text-cyan-400 font-semibold mb-4">You</h3>
          <Avatar3DPreview
            avatarSettings={avatarSettings}
            size="large"
            autoRotate={true}
          />
        </div>
      )}

      {/* Visor on right */}
      {showVisor && (
        <div className="flex flex-col items-center">
          <h3 className="text-cyan-400 font-semibold mb-4">Space Status</h3>
          <div className="w-64 h-64">
            <EnhancedVisorDisplay />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDisplay;
