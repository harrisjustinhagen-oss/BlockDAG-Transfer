/**
 * Avatar Generation Service
 * Supports two avatar sources:
 * 1. Automatic: Photo-to-avatar generation via Avaturn API
 * 2. Manual: MetaHuman Creator exports (.glb uploads)
 */

interface AvatarGenerationRequest {
  imageBase64: string;
  userId?: string;
}

interface AvatarGenerationResponse {
  success: boolean;
  modelUrl?: string; // URL to .glb or .fbx file
  modelData?: string; // Base64 encoded model data
  error?: string;
  avatarId?: string;
  isMockMode?: boolean; // Indicates this is a placeholder for UI testing
}

interface MetaHumanValidationResponse {
  success: boolean;
  modelData?: string; // Base64 GLB data
  error?: string;
}

/**
 * Configuration for Avatar Services
 * 
 * For AUTOMATIC generation (Avaturn):
 * VITE_AVATURN_API_KEY=your_key_from_avaturn.net
 * VITE_AVATURN_ENDPOINT=https://api.avaturn.net/
 * 
 * For MANUAL uploads (MetaHuman):
 * No configuration needed - just validate .glb files
 * 
 * Users can choose:
 * - Upload MetaHuman export (.glb file) - instant
 * - Upload photo for automatic generation - fast
 */

const AVATURN_API_KEY = (import.meta as any).env?.VITE_AVATURN_API_KEY || '';
const AVATURN_ENDPOINT = (import.meta as any).env?.VITE_AVATURN_ENDPOINT || 'https://api.avaturn.net/';
const USE_MOCK_AVATAR = !AVATURN_API_KEY; // Fallback to mock if no API key

export const avatarService = {
  /**
   * Generate 3D avatar from photo using Avaturn API
   * Automatic photo-to-avatar conversion
   */
  async generateAvatarFromPhoto(imageBase64: string): Promise<AvatarGenerationResponse> {
    try {
      // If no API key configured, use mock avatar generation
      if (USE_MOCK_AVATAR) {
        console.warn('Avaturn API not configured. Using mock avatar. Set VITE_AVATURN_API_KEY to enable real generation.');
        return generateMockAvatar();
      }

      // Strip data URL prefix if present
      let imageData = imageBase64;
      if (imageData.startsWith('data:')) {
        imageData = imageData.split(',')[1];
      }

      const response = await fetch(`${AVATURN_ENDPOINT}api/v1/avatar/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': AVATURN_API_KEY,
        },
        body: JSON.stringify({
          imageBase64: imageData,
          outputFormat: 'glb',
          quality: 'high',
        }),
      });

      if (!response.ok) {
        throw new Error(`Avatar generation failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        modelUrl: data.modelUrl || data.url,
        modelData: data.modelData || data.glbBase64,
        avatarId: data.avatarId || data.id,
      };
    } catch (error) {
      console.error('Avatar generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate avatar from photo',
      };
    }
  },

  /**
   * Validate and process MetaHuman Creator export (.glb file)
   * Manual avatar upload from MetaHuman
   */
  async validateMetaHumanExport(glbBase64: string): Promise<MetaHumanValidationResponse> {
    try {
      // Basic validation - check if it's valid GLB format
      if (!glbBase64) {
        return {
          success: false,
          error: 'No GLB file data provided',
        };
      }

      // GLB files should start with specific header
      if (!glbBase64.includes('data:application/octet-stream') && !glbBase64.startsWith('data:model/gltf-binary')) {
        // Could be raw base64, check for glTF magic number
        try {
          const base64Part = glbBase64.includes(',') ? glbBase64.split(',')[1] : glbBase64;
          const binary = atob(base64Part.substring(0, 20));
          if (!binary.includes('glTF')) {
            return {
              success: false,
              error: 'Invalid GLB format. Please export from MetaHuman Creator as .glb file.',
            };
          }
        } catch (e) {
          return {
            success: false,
            error: 'Failed to validate GLB file. Make sure it\'s a valid MetaHuman export.',
          };
        }
      }

      // If validation passes, return the data
      return {
        success: true,
        modelData: glbBase64,
      };
    } catch (error) {
      console.error('MetaHuman validation error:', error);
      return {
        success: false,
        error: 'Failed to validate MetaHuman export',
      };
    }
  },

  /**
   * Download 3D model from URL and convert to base64
   */
  async downloadModel(modelUrl: string): Promise<string> {
    try {
      const response = await fetch(modelUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Model download error:', error);
      throw error;
    }
  },

  /**
   * Validate if model data is valid GLB
   */
  isValidGLB(data: string): boolean {
    if (!data.includes('data:application/octet-stream;base64,')) {
      return false;
    }
    // GLB files start with specific magic number (0x46546C67 = 'glTF')
    try {
      const base64Part = data.split(',')[1];
      const binary = atob(base64Part.substring(0, 20));
      return binary.includes('glTF');
    } catch {
      return false;
    }
  },
};

/**
 * Mock avatar generation for development/testing
 * Returns placeholder data for UI testing when no API key is configured
 */
function generateMockAvatar(): AvatarGenerationResponse {
  // Generate a placeholder avatar ID for the profile
  // In mock mode, we show a message instead of a 3D model
  return {
    success: true,
    avatarId: `mock_${Date.now()}`,
    modelData: 'MOCK_PLACEHOLDER', // Marker for UI to detect mock mode
    isMockMode: true, // Flag to indicate this is mock data
    error: undefined,
  };
}

/**
 * Setup instructions for Avatar SDK
 * 
 * 1. Choose your Avatar SDK:
 *    - ReadyPlayer Me: https://readyplayer.me/
 *    - Avaturn: https://avaturn.net/
 *    - Pinscreen: Custom enterprise
 * 
 * 2. Get API credentials and add to .env.local:
 *    VITE_AVATAR_SDK_API_KEY=your_api_key_here
 *    VITE_AVATAR_SDK_ENDPOINT=https://your-api-endpoint.com
 * 
 * 3. Update the API request in generateAvatar() to match your SDK's spec
 * 
 * 4. Test with sample image
 */
