import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface SatelliteOrbit {
  mesh: THREE.Mesh;
  angle: number;
  orbitRadius: number;
  orbitSpeed: number;
  yOffset: number;
  opacity: number;
  angularVelocity: THREE.Vector3;
}

/**
 * Cinematic Earth Visor with Animated Clouds and Orbiting Satellites
 */
const CinematicEarthVisor: React.FC<{ className?: string }> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const satellitesRef = useRef<SatelliteOrbit[]>([]);
  const cloudCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cloudTextureRef = useRef<THREE.Texture | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 300;
    const height = containerRef.current.clientHeight || 300;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    camera.position.z = 3.2;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 0.95);
    sunLight.position.set(5, 5, 5);
    scene.add(sunLight);

    // ===== EARTH TEXTURE =====
    const earthCanvas = document.createElement('canvas');
    earthCanvas.width = 2048;
    earthCanvas.height = 1024;
    const earthCtx = earthCanvas.getContext('2d')!;

    // Ocean background
    const oceanGradient = earthCtx.createLinearGradient(0, 0, 0, earthCanvas.height);
    oceanGradient.addColorStop(0, '#1a3a52');
    oceanGradient.addColorStop(0.5, '#1a4d7a');
    oceanGradient.addColorStop(1, '#0d2638');
    earthCtx.fillStyle = oceanGradient;
    earthCtx.fillRect(0, 0, earthCanvas.width, earthCanvas.height);

    // Continents
    earthCtx.fillStyle = '#2d5a2d';
    [
      { x: 300, y: 200, rx: 120, ry: 150 },
      { x: 350, y: 450, rx: 80, ry: 120 },
      { x: 700, y: 150, rx: 90, ry: 75 },
      { x: 950, y: 300, rx: 150, ry: 150 },
      { x: 1200, y: 500, rx: 80, ry: 90 },
    ].forEach(c => {
      earthCtx.beginPath();
      earthCtx.ellipse(c.x, c.y, c.rx, c.ry, 0.2, 0, Math.PI * 2);
      earthCtx.fill();
    });

    const earthTexture = new THREE.CanvasTexture(earthCanvas);
    earthTexture.colorSpace = THREE.SRGBColorSpace;
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      metalness: 0.1,
      roughness: 0.8
    });
    const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 128), earthMaterial);
    earth.rotation.z = 0.4;
    earth.rotation.x = 0.1;
    scene.add(earth);

    // ===== CLOUD TEXTURE (ANIMATED) =====
    const cloudCanvas = document.createElement('canvas');
    cloudCanvas.width = 2048;
    cloudCanvas.height = 1024;
    const cloudCtx = cloudCanvas.getContext('2d')!;
    cloudCanvasRef.current = cloudCanvas;

    const cloudTexture = new THREE.CanvasTexture(cloudCanvas);
    cloudTexture.colorSpace = THREE.SRGBColorSpace;
    cloudTextureRef.current = cloudTexture;
    
    // Function to update clouds
    const updateCloudTexture = (offset: number) => {
      cloudCtx.clearRect(0, 0, cloudCanvas.width, cloudCanvas.height);
      cloudCtx.fillStyle = 'rgba(255, 255, 255, 0.35)';

      // Generate clouds that move across
      for (let i = 0; i < 50; i++) {
        const baseY = 512 + Math.sin(i * 0.15) * 150;
        const cloudX = (i * 80 + offset) % (cloudCanvas.width + 200) - 100;
        const cloudSize = Math.abs(Math.sin(i * 0.25)) * 60 + 40;
        
        cloudCtx.beginPath();
        cloudCtx.ellipse(cloudX, baseY, cloudSize, cloudSize * 0.35, 0, 0, Math.PI * 2);
        cloudCtx.fill();
      }
      cloudTexture.needsUpdate = true;
    };

    updateCloudTexture(0);

    const cloudMaterial = new THREE.MeshStandardMaterial({
      map: cloudTexture,
      metalness: 0,
      roughness: 1,
      transparent: true,
      opacity: 0.45
    });
    const clouds = new THREE.Mesh(new THREE.SphereGeometry(1.01, 128, 128), cloudMaterial);
    clouds.rotation.z = 0.4;
    clouds.rotation.x = 0.1;
    scene.add(clouds);

    // ===== ATMOSPHERE =====
    const atmosphereGeometry = new THREE.SphereGeometry(1.05, 128, 128);
    const atmosphereMaterial = new THREE.MeshStandardMaterial({
      color: 0x4da6ff,
      metalness: 0.3,
      roughness: 0.7,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // ===== VISOR =====
    const visorGeometry = new THREE.SphereGeometry(1.08, 64, 64);
    const visorMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      metalness: 0.95,
      roughness: 0.05,
      transparent: true,
      opacity: 0.08,
      emissive: 0x0066ff,
      emissiveIntensity: 0.1
    });
    const visor = new THREE.Mesh(visorGeometry, visorMaterial);
    scene.add(visor);

    // ===== SATELLITES GROUP =====
    const satelliteGroup = new THREE.Group();
    scene.add(satelliteGroup);

    // Satellite geometry
    const satGeometry = new THREE.SphereGeometry(0.04, 16, 16);
    const satMaterials = [
      new THREE.MeshStandardMaterial({ color: 0xffff99, metalness: 0.9, roughness: 0.1, emissive: 0xffff00, emissiveIntensity: 0.9 }),
      new THREE.MeshStandardMaterial({ color: 0xccddff, metalness: 0.8, roughness: 0.2, emissive: 0x6699ff, emissiveIntensity: 0.7 }),
      new THREE.MeshStandardMaterial({ color: 0xff99cc, metalness: 0.85, roughness: 0.15, emissive: 0xff3366, emissiveIntensity: 0.7 }),
      new THREE.MeshStandardMaterial({ color: 0xffccaa, metalness: 0.9, roughness: 0.1, emissive: 0xffaa00, emissiveIntensity: 0.8 }),
    ];

    // Create multiple orbital layers
    const orbitConfigs = [
      { radius: 1.4, count: 40, speed: 0.008 },
      { radius: 1.65, count: 50, speed: 0.006 },
      { radius: 1.9, count: 60, speed: 0.005 },
      { radius: 2.2, count: 70, speed: 0.004 },
      { radius: 2.5, count: 50, speed: 0.003 }
    ];

    orbitConfigs.forEach(config => {
      for (let i = 0; i < config.count; i++) {
        const mat = satMaterials[i % satMaterials.length].clone();
        const sat = new THREE.Mesh(satGeometry, mat);
        satelliteGroup.add(sat);

        satellitesRef.current.push({
          mesh: sat,
          angle: Math.random() * Math.PI * 2,
          orbitRadius: config.radius,
          orbitSpeed: config.speed,
          yOffset: (Math.random() - 0.5) * 0.4,
          opacity: 0.6 + Math.random() * 0.4,
          angularVelocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.15,
            (Math.random() - 0.5) * 0.15,
            (Math.random() - 0.5) * 0.15
          )
        });
      }
    });

    // ===== ANIMATION LOOP =====
    let frameCount = 0;
    let cloudOffset = 0;

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      frameCount++;

      // Rotate Earth
      earth.rotation.y += 0.0002;

      // Animate clouds
      cloudOffset += 2.0;
      updateCloudTexture(cloudOffset);

      // Update satellites
      satellitesRef.current.forEach(sat => {
        sat.angle += sat.orbitSpeed;

        // Orbital position
        const x = Math.cos(sat.angle) * sat.orbitRadius;
        const y = Math.sin(sat.angle) * sat.orbitRadius * 0.3 + sat.yOffset;
        const z = Math.sin(sat.angle) * sat.orbitRadius * Math.cos(sat.angle * 0.5);

        sat.mesh.position.set(x, y, z);

        // Fade in/out effect based on orbit
        const visibilityWave = Math.sin(frameCount * 0.008 + sat.angle) * 0.5 + 0.5;
        const finalOpacity = visibilityWave * sat.opacity;
        (sat.mesh.material as THREE.MeshStandardMaterial).opacity = finalOpacity;
        (sat.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.4 + finalOpacity * 0.6;

        // Rotation
        sat.mesh.rotation.x += sat.angularVelocity.x;
        sat.mesh.rotation.y += sat.angularVelocity.y;
        sat.mesh.rotation.z += sat.angularVelocity.z;
      });

      // Visor pulsation
      const pulseIntensity = 0.08 + Math.sin(frameCount * 0.01) * 0.02;
      visorMaterial.emissiveIntensity = pulseIntensity;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      // Safely remove canvas if it exists
      try {
        if (renderer && renderer.domElement && renderer.domElement.parentNode === containerRef.current) {
          containerRef.current?.removeChild(renderer.domElement);
        }
      } catch (e) {
        // Silently fail if already removed
      }
      // Dispose Three.js resources
      try {
        renderer.dispose();
        earthGeometry.dispose();
        earthMaterial.dispose();
        cloudTexture.dispose();
        cloudMaterial.dispose();
        atmosphereGeometry.dispose();
        atmosphereMaterial.dispose();
        visorGeometry.dispose();
        visorMaterial.dispose();
        satGeometry.dispose();
        satMaterials.forEach(m => m.dispose());
      } catch (e) {
        // Silently fail if already disposed
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{
        minHeight: '300px',
        width: '100%',
        aspectRatio: '1',
        background: 'radial-gradient(circle, #0a0e27 0%, #000000 70%)',
        boxShadow: 'inset 0 0 60px rgba(0, 255, 255, 0.15), 0 0 30px rgba(0, 221, 255, 0.2)',
        borderRadius: '50%'
      }}
    >
      {/* Visor reflection glint */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '5%',
          left: '15%',
          width: '25%',
          height: '25%',
          background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(10px)'
        }}
      />
    </div>
  );
};

export default CinematicEarthVisor;
