import React, { useRef, useEffect, useState } from 'react';

interface PhotoEditorProps {
  onPhotoCapture: (photoDataUrl: string, editedPhotoDataUrl: string) => void;
  onCancel: () => void;
  isOpen: boolean;
}

interface EditSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  grayscale: number;
  sepia: number;
  rotation: number;
}

export const PhotoEditor: React.FC<PhotoEditorProps> = ({ onPhotoCapture, onCancel, isOpen }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [editSettings, setEditSettings] = useState<EditSettings>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    blur: 0,
    grayscale: 0,
    sepia: 0,
    rotation: 0,
  });

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Camera access failed:', err);
      alert('Camera access denied. Please allow camera permissions.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      setCameraActive(false);
    }
  };

  // Capture photo from video
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw center square crop (like profile pictures)
    const size = Math.min(canvas.width, canvas.height);
    const sx = (canvas.width - size) / 2;
    const sy = (canvas.height - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);

    canvas.width = size;
    canvas.height = size;

    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedPhoto(photoDataUrl);
    stopCamera();
  };

  // Apply filters and return edited photo
  const applyFilters = () => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !capturedPhoto) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Apply filters using CSS filter string
      const filterString = `
        brightness(${editSettings.brightness}%)
        contrast(${editSettings.contrast}%)
        saturate(${editSettings.saturation}%)
        hue-rotate(${editSettings.hue}deg)
        blur(${editSettings.blur}px)
        grayscale(${editSettings.grayscale}%)
        sepia(${editSettings.sepia}%)
      `;

      ctx.filter = filterString;

      // Apply rotation
      if (editSettings.rotation !== 0) {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((editSettings.rotation * Math.PI) / 180);
        ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2);
        ctx.restore();
      } else {
        ctx.drawImage(img, 0, 0);
      }
    };
    img.src = capturedPhoto;
  };

  // Update preview when settings change
  useEffect(() => {
    if (capturedPhoto) {
      applyFilters();
    }
  }, [editSettings, capturedPhoto]);

  const handleSettingChange = (key: keyof EditSettings, value: number) => {
    setEditSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleFinish = () => {
    if (!capturedPhoto || !previewCanvasRef.current) return;

    const editedPhotoDataUrl = previewCanvasRef.current.toDataURL('image/jpeg', 0.9);
    onPhotoCapture(capturedPhoto, editedPhotoDataUrl);
  };

  const resetEdits = () => {
    setEditSettings({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hue: 0,
      blur: 0,
      grayscale: 0,
      sepia: 0,
      rotation: 0,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4">
        <h3 className="text-lg font-bold mb-4 text-white">📸 Photo Editor</h3>

        {!capturedPhoto ? (
          // Camera capture mode
          <div className="space-y-4">
            {!cameraActive ? (
              <div className="text-center space-y-3">
                <p className="text-slate-400">Ready to take your photo?</p>
                <button
                  onClick={startCamera}
                  className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition-all"
                >
                  📷 Start Camera
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-black rounded-lg overflow-hidden aspect-square">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={capturePhoto}
                    className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold"
                  >
                    ✓ Capture Photo
                  </button>
                  <button
                    onClick={() => {
                      stopCamera();
                      onCancel();
                    }}
                    className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="border-t border-slate-700 pt-4">
              <p className="text-xs text-slate-400 mb-2">Or upload existing photo:</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const photoDataUrl = event.target?.result as string;
                      setCapturedPhoto(photoDataUrl);
                      stopCamera();
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full text-xs text-slate-400"
              />
            </div>
          </div>
        ) : (
          // Photo editing mode
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Preview */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-300">Preview</p>
                <div className="bg-black rounded-lg overflow-hidden aspect-square">
                  <canvas
                    ref={previewCanvasRef}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <div>
                  <label className="text-xs font-semibold text-slate-300">
                    Brightness: {editSettings.brightness}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={editSettings.brightness}
                    onChange={(e) => handleSettingChange('brightness', Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">
                    Contrast: {editSettings.contrast}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={editSettings.contrast}
                    onChange={(e) => handleSettingChange('contrast', Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">
                    Saturation: {editSettings.saturation}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={editSettings.saturation}
                    onChange={(e) => handleSettingChange('saturation', Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">
                    Hue: {editSettings.hue}°
                  </label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={editSettings.hue}
                    onChange={(e) => handleSettingChange('hue', Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">
                    Blur: {editSettings.blur}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={editSettings.blur}
                    onChange={(e) => handleSettingChange('blur', Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">
                    Grayscale: {editSettings.grayscale}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editSettings.grayscale}
                    onChange={(e) => handleSettingChange('grayscale', Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">
                    Sepia: {editSettings.sepia}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editSettings.sepia}
                    onChange={(e) => handleSettingChange('sepia', Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">
                    Rotation: {editSettings.rotation}°
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={editSettings.rotation}
                    onChange={(e) => handleSettingChange('rotation', Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded cursor-pointer"
                  />
                </div>

                <button
                  onClick={resetEdits}
                  className="w-full text-xs py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-all"
                >
                  ↺ Reset All
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 justify-end pt-4 border-t border-slate-700">
              <button
                onClick={() => {
                  setCapturedPhoto(null);
                  resetEdits();
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
              >
                Back
              </button>
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleFinish}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all"
              >
                ✓ Use This Photo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden canvas for capture and editing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default PhotoEditor;
