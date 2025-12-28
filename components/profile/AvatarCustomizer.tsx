import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import CameraCapture from './CameraCapture';
import Head3DPreview from './Head3DPreview';

interface AvatarCustomizerProps {
  onAvatarCreate: (avatarData: AvatarData) => void;
  onCancel: () => void;
}

export interface AvatarData {
  skinTone: string;
  hairStyle: 'short' | 'medium' | 'long' | 'curly';
  hairColor: string;
  eyeColor: string;
  bodyType: 'slim' | 'average' | 'athletic';
  clothingColor: string;
  faceImageData?: string; // Base64 encoded face image
}

const defaultAvatarData: AvatarData = {
  skinTone: '#fdbcb4',
  hairStyle: 'medium',
  hairColor: '#3d2817',
  eyeColor: '#8b4513',
  bodyType: 'average',
  clothingColor: '#4a90e2',
};

const hairStyles = ['short', 'medium', 'long', 'curly'] as const;
const bodyTypes = ['slim', 'average', 'athletic'] as const;

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({ onAvatarCreate, onCancel }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const avatarGroupRef = useRef<THREE.Group | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [avatarData, setAvatarData] = useState<AvatarData>(defaultAvatarData);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showHeadPreview, setShowHeadPreview] = useState(false);
  const [faceImageUrl, setFaceImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e293b);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    // Avatar group
    const avatarGroup = new THREE.Group();
    scene.add(avatarGroup);
    avatarGroupRef.current = avatarGroup;

    // Create initial avatar
    createAvatar(avatarGroup, avatarData);

    // Animation loop
    const animationId = requestAnimationFrame(function animate() {
      requestAnimationFrame(animate);
      if (avatarGroup) {
        avatarGroup.rotation.y += 0.005;
      }
      renderer.render(scene, camera);
    });

    // Handle resize
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const createAvatar = (group: THREE.Group, data: AvatarData) => {
    // Clear previous avatar
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    // Head (sphere) with optional face texture
    const headGeometry = new THREE.SphereGeometry(0.6, 32, 32);
    let headMaterial: THREE.Material;

    if (data.faceImageData) {
      // Create texture from face image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = 512;
        canvas.height = 512;
        if (ctx) {
          ctx.drawImage(img, 0, 0, 512, 512);
          const texture = new THREE.CanvasTexture(canvas);
          texture.flipY = false;
          const texturedMaterial = new THREE.MeshStandardMaterial({ map: texture });
          head.material = texturedMaterial;
        }
      };
      img.src = data.faceImageData;
      
      headMaterial = new THREE.MeshStandardMaterial({ color: data.skinTone });
    } else {
      headMaterial = new THREE.MeshStandardMaterial({ color: data.skinTone });
    }

    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0.2;
    group.add(head);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.12, 16, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: data.eyeColor });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.2, 0.5, 0.5);
    group.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.2, 0.5, 0.5);
    group.add(rightEye);

    // Hair
    const hairGeometry = getHairGeometry(data.hairStyle);
    const hairMaterial = new THREE.MeshStandardMaterial({ color: data.hairColor });
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.position.y = 0.9;
    group.add(hair);

    // Body
    const bodyGeometry = getBodyGeometry(data.bodyType);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: data.clothingColor });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = -0.6;
    group.add(body);
  };

  const getHairGeometry = (style: string): THREE.BufferGeometry => {
    switch (style) {
      case 'short':
        return new THREE.SphereGeometry(0.65, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.5);
      case 'medium':
        return new THREE.SphereGeometry(0.7, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6);
      case 'long':
        return new THREE.ConeGeometry(0.7, 1.2, 32);
      case 'curly':
        const curlyGeometry = new THREE.SphereGeometry(0.75, 16, 16);
        // Add some roughness by slightly deforming vertices
        const positions = curlyGeometry.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += (Math.random() - 0.5) * 0.1;
          positions[i + 1] += (Math.random() - 0.5) * 0.1;
          positions[i + 2] += (Math.random() - 0.5) * 0.1;
        }
        return curlyGeometry;
      default:
        return new THREE.SphereGeometry(0.7, 32, 32);
    }
  };

  const getBodyGeometry = (type: string): THREE.BufferGeometry => {
    switch (type) {
      case 'slim':
        return new THREE.BoxGeometry(0.5, 1, 0.3);
      case 'average':
        return new THREE.BoxGeometry(0.6, 1, 0.35);
      case 'athletic':
        return new THREE.BoxGeometry(0.7, 1, 0.4);
      default:
        return new THREE.BoxGeometry(0.6, 1, 0.35);
    }
  };

  // Camera capture functions
  const handleOpenCamera = () => {
    setShowCameraModal(true);
  };

  const handleCameraCapture = (imageData: string) => {
    console.log('Face captured from camera');
    setFaceImageUrl(imageData);
    
    const newData = { ...avatarData, faceImageData: imageData };
    setAvatarData(newData);
    
    if (avatarGroupRef.current) {
      createAvatar(avatarGroupRef.current, newData);
    }
    
    setShowCameraModal(false);
    setShowHeadPreview(true);
  };

  const handleCameraCancel = () => {
    setShowCameraModal(false);
  };

  const handleRetakePhoto = () => {
    setShowHeadPreview(false);
    setShowCameraModal(true);
  };

  const removeFaceImage = () => {
    setFaceImageUrl(null);
    const newData = { ...avatarData, faceImageData: undefined };
    setAvatarData(newData);
    
    if (avatarGroupRef.current) {
      createAvatar(avatarGroupRef.current, newData);
    }
  };

  const handleCustomizationChange = (key: keyof AvatarData, value: any) => {
    const newData = { ...avatarData, [key]: value };
    setAvatarData(newData);

    if (avatarGroupRef.current) {
      createAvatar(avatarGroupRef.current, newData);
    }
  };

  const handleReset = () => {
    setAvatarData(defaultAvatarData);
    if (avatarGroupRef.current) {
      createAvatar(avatarGroupRef.current, defaultAvatarData);
    }
  };

  const handleConfirm = () => {
    onAvatarCreate(avatarData);
  };

  return (
    <div className="bg-slate-900 rounded-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
      <h3 className="text-2xl font-bold mb-1 text-white">🎨 Create Your Avatar</h3>
      <p className="text-xs text-slate-400 mb-4">Customize and preview your character in real-time</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* 3D Preview */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <p className="text-sm font-semibold text-slate-300 mb-2">3D Preview</p>
          <div
            ref={containerRef}
            className="w-full h-96 rounded-lg overflow-hidden bg-slate-900"
          />
        </div>

        {/* Customization Options */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {/* Camera Capture Section */}
          <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-cyan-700/50 rounded-lg p-3">
            <label className="text-xs font-semibold text-cyan-300 block mb-2">📸 Capture Face Photo</label>
            <div className="space-y-2">
              {faceImageUrl ? (
                <div className="flex items-center gap-2">
                  <img src={faceImageUrl} alt="Captured face" className="w-12 h-12 rounded border border-cyan-500" />
                  <div className="flex-1">
                    <p className="text-xs text-cyan-300 font-semibold">Face captured ✓</p>
                    <p className="text-[10px] text-slate-400">Applied to avatar head</p>
                  </div>
                  <button
                    onClick={removeFaceImage}
                    className="text-xs px-2 py-1 bg-red-900/50 hover:bg-red-800 text-red-300 rounded transition-all"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleOpenCamera}
                  className="w-full text-xs py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded transition-all font-semibold"
                >
                  📷 Open Camera
                </button>
              )}
            </div>
          </div>

          {/* Skin Tone */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Skin Tone</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={avatarData.skinTone}
                onChange={(e) => handleCustomizationChange('skinTone', e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <span className="text-xs text-slate-400">{avatarData.skinTone}</span>
            </div>
          </div>

          {/* Hair Style */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Hair Style</label>
            <select
              value={avatarData.hairStyle}
              onChange={(e) => handleCustomizationChange('hairStyle', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-xs"
            >
              {hairStyles.map((style) => (
                <option key={style} value={style}>
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Hair Color */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Hair Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={avatarData.hairColor}
                onChange={(e) => handleCustomizationChange('hairColor', e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <span className="text-xs text-slate-400">{avatarData.hairColor}</span>
            </div>
          </div>

          {/* Eye Color */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Eye Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={avatarData.eyeColor}
                onChange={(e) => handleCustomizationChange('eyeColor', e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <span className="text-xs text-slate-400">{avatarData.eyeColor}</span>
            </div>
          </div>

          {/* Body Type */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Body Type</label>
            <select
              value={avatarData.bodyType}
              onChange={(e) => handleCustomizationChange('bodyType', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-xs"
            >
              {bodyTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Clothing Color */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Clothing Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={avatarData.clothingColor}
                onChange={(e) => handleCustomizationChange('clothingColor', e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <span className="text-xs text-slate-400">{avatarData.clothingColor}</span>
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="w-full text-xs py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-all"
          >
            ↺ Reset to Default
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end border-t border-slate-700 pt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition-all"
        >
          ✓ Create Avatar
        </button>
      </div>

      {/* Fullscreen Camera Modal */}
      {showCameraModal && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onCancel={handleCameraCancel}
        />
      )}

      {/* 3D Head Preview Modal */}
      {showHeadPreview && faceImageUrl && (
        <Head3DPreview
          faceImageData={faceImageUrl}
          onClose={() => setShowHeadPreview(false)}
          onRetake={handleRetakePhoto}
        />
      )}

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default AvatarCustomizer;
