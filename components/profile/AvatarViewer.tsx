import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore - Three.js examples are not fully typed
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface AvatarViewerProps {
  modelData?: string; // Base64 GLB data
  modelUrl?: string; // URL to GLB file
  isLoading?: boolean;
  onError?: (error: string) => void;
  size?: 'small' | 'medium' | 'large';
}

/**
 * 3D Avatar Viewer Component
 * Displays GLB/GLTF models using Three.js
 * Renders 3D head avatar with auto-rotation
 */
export const AvatarViewer: React.FC<AvatarViewerProps> = ({
  modelData,
  modelUrl,
  isLoading = false,
  onError,
  size = 'medium',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const [isModelLoaded, setIsModelLoaded] = React.useState(false);

  const sizeMap = {
    small: { width: 120, height: 120 },
    medium: { width: 200, height: 200 },
    large: { width: 320, height: 320 },
  };

  const dimensions = sizeMap[size];

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e293b); // slate-900

    const camera = new THREE.PerspectiveCamera(
      75,
      dimensions.width / dimensions.height,
      0.1,
      1000
    );
    camera.position.z = 2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(dimensions.width, dimensions.height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    sceneRef.current = scene;
    rendererRef.current = renderer;

    // Load model if provided
    if (modelData || modelUrl) {
      loadModel(modelData || modelUrl, scene);
    }

    // Animation loop with auto-rotation
    const animationId = requestAnimationFrame(function animate() {
      requestAnimationFrame(animate);

      if (modelRef.current) {
        modelRef.current.rotation.y += 0.005; // Auto-rotate head
      }

      renderer.render(scene, camera);
    });

    // Handle window resize
    const handleResize = () => {
      if (containerRef.current) {
        camera.aspect = dimensions.width / dimensions.height;
        camera.updateProjectionMatrix();
        renderer.setSize(dimensions.width, dimensions.height);
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
  }, [dimensions]);

  const loadModel = (data: string, scene: THREE.Scene) => {
    setIsModelLoaded(false);

    try {
      const loader = new GLTFLoader();

      // Handle base64 data URI
      if (data.startsWith('data:')) {
        loader.load(data, onModelLoaded, onProgress, (error) => {
          const errorMsg = `Failed to load model: ${error.message}`;
          onError?.(errorMsg);
          setIsModelLoaded(false);
        });
      } else {
        // Handle URL
        loader.load(data, onModelLoaded, onProgress, (error) => {
          const errorMsg = `Failed to load model: ${error.message}`;
          onError?.(errorMsg);
          setIsModelLoaded(false);
        });
      }

      function onModelLoaded(gltf: any) {
        // Remove old model
        if (modelRef.current) {
          scene.remove(modelRef.current);
        }

        const model = gltf.scene;

        // Center and scale model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        model.position.sub(center);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.5 / maxDim;
        model.scale.multiplyScalar(scale);

        scene.add(model);
        modelRef.current = model;
        setIsModelLoaded(true);
      }

      function onProgress(event: ProgressEvent) {
        // You can use this for a progress bar if needed
        const percentComplete = (event.loaded / event.total) * 100;
        console.log(`Avatar loading: ${percentComplete.toFixed(2)}%`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      onError?.(errorMsg);
      setIsModelLoaded(false);
    }
  };

  return (
    <div className="relative">
      <div
        ref={containerRef}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          borderRadius: '50%',
          overflow: 'hidden',
          border: '3px solid rgb(34, 211, 238)',
          boxShadow: '0 0 20px rgba(34, 211, 238, 0.3)',
        }}
      />
      {(isLoading || !isModelLoaded) && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-800/50"
          style={{
            width: dimensions.width,
            height: dimensions.height,
          }}
        >
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-1"></div>
            <p className="text-xs text-slate-400">Loading avatar...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarViewer;
