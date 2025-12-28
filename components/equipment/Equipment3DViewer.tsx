import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
// @ts-ignore - Three.js examples are not fully typed
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EquipmentGrade, EquipmentSkin, applyMaterialColor } from './EquipmentSkinSystem';

interface Equipment3DViewerProps {
  skin: EquipmentSkin;
  grade: EquipmentGrade;
  size?: 'sm' | 'md' | 'lg';
  autoRotate?: boolean;
}

export const Equipment3DViewer: React.FC<Equipment3DViewerProps> = ({
  skin,
  grade,
  size = 'md',
  autoRotate = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sizeConfig = {
    sm: { w: 200, h: 200 },
    md: { w: 400, h: 400 },
    lg: { w: 600, h: 600 },
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const { w, h } = sizeConfig[size];

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
    camera.position.z = 3;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xff00ff, 0.5);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);

    // Load model
    const loader = new GLTFLoader();
    loader.load(
      skin.modelPath,
      (gltf) => {
        const model = gltf.scene;
        modelRef.current = model;

        // Apply color based on grade
        const materialName = skin.materials[grade];
        const color = skin.baseColor[grade];
        applyMaterialColor(model, materialName, color);

        scene.add(model);
        setIsLoading(false);
      },
      undefined,
      (error) => {
        console.error('Failed to load model:', error);
        setError('Failed to load 3D model');
        setIsLoading(false);
      }
    );

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotate && modelRef.current) {
        modelRef.current.rotation.y += 0.005;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      const newW = containerRef.current?.clientWidth || w;
      const newH = containerRef.current?.clientHeight || h;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [skin, grade, size, autoRotate]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className={`bg-slate-900 rounded-lg overflow-hidden border-2 border-slate-700`}
        style={{
          width: sizeConfig[size].w,
          height: sizeConfig[size].h,
        }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-white text-sm">Loading...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Simpler 2D preview for UI (before models are created)
interface Equipment2DPreviewProps {
  skin: EquipmentSkin;
  grade: EquipmentGrade;
}

export const Equipment2DPreview: React.FC<Equipment2DPreviewProps> = ({ skin, grade }) => {
  const color = skin.baseColor[grade];

  return (
    <div className="w-full aspect-square bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border-2 border-slate-700 flex items-center justify-center overflow-hidden">
      <div
        className="w-24 h-24 rounded-lg shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${color}33 0%, ${color}66 100%)`,
          border: `2px solid ${color}`,
        }}
      >
        <div className="w-full h-full flex items-center justify-center text-4xl">
          {skin.type === 'head' && '👑'}
          {skin.type === 'chest' && '🛡️'}
          {skin.type === 'gloves' && '🧤'}
          {skin.type === 'legs' && '👖'}
          {skin.type === 'boots' && '👢'}
        </div>
      </div>
    </div>
  );
};
