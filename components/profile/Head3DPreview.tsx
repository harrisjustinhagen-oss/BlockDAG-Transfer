import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Head3DPreviewProps {
  faceImageData: string; // Base64 encoded face image
  onClose?: () => void;
  onRetake?: () => void;
}

const Head3DPreview: React.FC<Head3DPreviewProps> = ({ faceImageData, onClose, onRetake }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const headRef = useRef<THREE.Mesh | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [textureLoaded, setTextureLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 2.5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting - important for realistic head rendering
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.1);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create head with face texture
    const headGeometry = new THREE.SphereGeometry(1, 64, 64);

    // Create texture from base64 image using canvas
    const img = new Image();
    img.onload = () => {
      console.log('Image loaded, creating texture');
      
      // Create canvas and draw image
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Fill with skin tone background first
        ctx.fillStyle = '#fdbcb4';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Calculate aspect ratio and draw image centered
        const imgAspect = img.width / img.height;
        let drawWidth = canvas.width;
        let drawHeight = canvas.width / imgAspect;
        
        if (drawHeight > canvas.height) {
          drawHeight = canvas.height;
          drawWidth = canvas.height * imgAspect;
        }
        
        const x = (canvas.width - drawWidth) / 2;
        const y = (canvas.height - drawHeight) / 2;
        
        // Draw the image
        ctx.drawImage(img, x, y, drawWidth, drawHeight);
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.flipY = false;
        
        // Create material with face texture
        const headMaterial = new THREE.MeshStandardMaterial({
          map: texture,
          metalness: 0.05,
          roughness: 0.6,
          side: THREE.FrontSide
        });
        
        // Update head material
        if (headRef.current) {
          headRef.current.material = headMaterial;
          setTextureLoaded(true);
          console.log('Texture applied to head');
        }
      }
    };
    
    img.onerror = () => {
      console.error('Failed to load image from base64');
    };
    
    img.src = faceImageData;

    // Fallback material while loading
    const loadingMaterial = new THREE.MeshStandardMaterial({
      color: 0xfdbcb4,
      metalness: 0.05,
      roughness: 0.6
    });
    
    const head = new THREE.Mesh(headGeometry, loadingMaterial);
    scene.add(head);
    headRef.current = head;

    // Animation loop
    const animationId = requestAnimationFrame(function animate() {
      animationIdRef.current = requestAnimationFrame(animate);

      if (headRef.current) {
        headRef.current.rotation.y += 0.008;
        // Slight bobbing motion
        headRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.2;
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
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      headGeometry.dispose();
      loadingMaterial.dispose();
    };
  }, [faceImageData]);

  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-white">
            🎭 3D Head Preview
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors text-2xl"
            >
              ✕
            </button>
          )}
        </div>

        {/* Main content - Grid with preview and photo */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 mb-4 overflow-hidden">
          {/* 3D Preview Container */}
          <div className="md:col-span-2">
            <div
              ref={containerRef}
              className="flex-1 rounded-xl overflow-hidden border-2 border-cyan-500 shadow-lg shadow-cyan-500/20 min-h-[400px]"
            />
            {!textureLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-cyan-300 text-sm font-semibold">Loading texture...</div>
              </div>
            )}
          </div>

          {/* Captured Photo & Info */}
          <div className="flex flex-col gap-4">
            {/* Photo Thumbnail */}
            <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
              <p className="text-xs font-semibold text-slate-300 mb-2">Captured Photo</p>
              <div className="rounded-lg overflow-hidden border-2 border-cyan-500/50 bg-black">
                <img 
                  src={faceImageData} 
                  alt="Captured face"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 flex-1">
              <p className="text-xs font-semibold text-cyan-300 mb-2">Preview Info</p>
              <ul className="text-xs text-slate-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">✓</span>
                  <span>Your face is being mapped to the 3D head</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">✓</span>
                  <span>The head rotates to show different angles</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">✓</span>
                  <span>You can still customize hair, colors, and body</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 text-center">
          <p className="text-sm text-cyan-300 font-semibold">
            {textureLoaded ? '✓ Face texture applied!' : 'Applying face texture to head...'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            The head rotates and bobs to show your face from different angles
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          {onRetake && (
            <button
              onClick={onRetake}
              className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-all"
            >
              🔄 Retake Photo
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition-all"
            >
              Continue to Customize Avatar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Head3DPreview;
