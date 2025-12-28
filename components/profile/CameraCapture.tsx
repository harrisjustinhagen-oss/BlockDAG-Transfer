import React, { useRef, useEffect, useState } from 'react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      setError(null);
      setErrorType(null);
      console.log('Starting camera...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      console.log('Stream obtained:', stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        // Wait for video to load before showing
        videoRef.current.oncanplay = () => {
          console.log('Video ready to play');
          setIsReady(true);
          videoRef.current?.play().catch(e => console.error('Play error:', e));
        };
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      
      if (err?.name === 'NotAllowedError') {
        setErrorType('permission_denied');
        setError('Camera access was denied. Please allow camera access to use this feature.');
      } else if (err?.name === 'NotFoundError') {
        setErrorType('no_camera');
        setError('No camera found on your device.');
      } else {
        setErrorType('other');
        setError(`Camera error: ${err?.message || 'Unknown error'}`);
      }
    }
  };

  useEffect(() => {
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          console.log('Stopping track:', track.kind);
          track.stop();
        });
        streamRef.current = null;
      }
    };
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Set canvas to match video dimensions
        canvas.width = video.videoWidth || 1920;
        canvas.height = video.videoHeight || 1080;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Draw video frame
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Get image data as JPEG
          const imageData = canvas.toDataURL('image/jpeg', 0.85);
          console.log('Photo captured');

          // Stop camera
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }

          onCapture(imageData);
        }
      } catch (err) {
        console.error('Capture error:', err);
        setError('Failed to capture photo. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    onCancel();
  };

  const getPermissionInstructions = () => {
    // Try to detect browser
    const ua = navigator.userAgent;
    if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) {
      return {
        browser: 'Chrome',
        steps: [
          '1. Click the lock icon in the address bar',
          '2. Find "Camera" and change it to "Allow"',
          '3. Refresh the page'
        ]
      };
    } else if (ua.indexOf('Firefox') > -1) {
      return {
        browser: 'Firefox',
        steps: [
          '1. Click the info icon (ⓘ) in the address bar',
          '2. Scroll to find "Camera" permission',
          '3. Click the X to clear the block',
          '4. Refresh the page'
        ]
      };
    } else if (ua.indexOf('Edg') > -1) {
      return {
        browser: 'Microsoft Edge',
        steps: [
          '1. Click the lock icon in the address bar',
          '2. Find "Camera" and change it to "Allow"',
          '3. Refresh the page'
        ]
      };
    } else if (ua.indexOf('Safari') > -1) {
      return {
        browser: 'Safari',
        steps: [
          '1. Go to Safari → Settings (or Preferences)',
          '2. Go to Websites → Camera',
          '3. Find this website and set to "Allow"',
          '4. Refresh the page'
        ]
      };
    }
    return {
      browser: 'Your Browser',
      steps: [
        'Look for a permission icon in your address bar',
        'Find the Camera permission and set it to Allow',
        'Refresh this page'
      ]
    };
  };

  if (error && errorType === 'permission_denied') {
    const instructions = getPermissionInstructions();
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-2xl p-8 max-w-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">🔒</div>
            <h3 className="text-xl font-bold text-white">Camera Access Denied</h3>
          </div>
          
          <p className="text-slate-300 mb-6">
            We need camera access to capture your face for the avatar. Here's how to allow it:
          </p>

          <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-700">
            <p className="text-sm font-semibold text-cyan-300 mb-3">
              Instructions for {instructions.browser}:
            </p>
            <ul className="space-y-2">
              {instructions.steps.map((step, idx) => (
                <li key={idx} className="text-sm text-slate-300">
                  {step}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={startCamera}
              className="flex-1 px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold transition-all"
            >
              🔄 Try Again
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error && errorType !== 'permission_denied') {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-xl p-6 max-w-md text-center">
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 flex justify-between items-center">
        <h2 className="text-white text-lg font-bold">Position Your Face</h2>
        <button
          onClick={handleCancel}
          className="text-white text-2xl hover:text-red-400 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Video Container with Guide Box */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />

        {isReady && (
          <>
            {/* Yellow Guide Box - Face Frame */}
            <div
              className="absolute border-4 border-yellow-400 rounded-2xl shadow-2xl"
              style={{
                width: '280px',
                height: '400px',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 20px rgba(250, 204, 21, 0.5), inset 0 0 20px rgba(250, 204, 21, 0.2)'
              }}
            >
              {/* Corner accents */}
              <div
                className="absolute w-6 h-6 border-t-4 border-l-4 border-yellow-400"
                style={{ top: '-8px', left: '-8px' }}
              />
              <div
                className="absolute w-6 h-6 border-t-4 border-r-4 border-yellow-400"
                style={{ top: '-8px', right: '-8px' }}
              />
              <div
                className="absolute w-6 h-6 border-b-4 border-l-4 border-yellow-400"
                style={{ bottom: '-8px', left: '-8px' }}
              />
              <div
                className="absolute w-6 h-6 border-b-4 border-r-4 border-yellow-400"
                style={{ bottom: '-8px', right: '-8px' }}
              />
            </div>

            {/* Guide Text */}
            <div className="absolute top-24 left-0 right-0 text-center text-yellow-300 font-bold text-sm">
              Center your head in the yellow box
            </div>

            {/* Center dot */}
            <div
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 10px rgba(250, 204, 21, 0.8)'
              }}
            />
          </>
        )}

        {/* Darkening overlay on sides */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 280px 400px at center, transparent 0%, rgba(0, 0, 0, 0.4) 100%)`
          }}
        />
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 flex gap-3 justify-center">
        {isReady && (
          <>
            <button
              onClick={capturePhoto}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-green-600/50"
            >
              📸 Capture Photo
            </button>
            <button
              onClick={handleCancel}
              className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-all"
            >
              Cancel
            </button>
          </>
        )}
        {!isReady && (
          <div className="text-yellow-300 text-center">
            <div className="text-sm font-semibold">Initializing camera...</div>
            <div className="text-xs text-yellow-200 mt-1">Please allow camera access if prompted</div>
          </div>
        )}
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;
