import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';

interface SpaceDebris {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  size: number;
  rotation: THREE.Euler;
  rotationVelocity: THREE.Vector3;
}

const VisorEarthDisplay: React.FC<{ className?: string }> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const earthRef = useRef<THREE.Mesh | null>(null);
  const debrisRef = useRef<SpaceDebris[]>([]);
  const debrisGroupRef = useRef<THREE.Group | null>(null);
  const animationIdRef = useRef<number | null>(null);

  // Generate procedural Earth texture
  const createEarthTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Ocean
    ctx.fillStyle = '#1a4d7a';
    ctx.fillRect(0, 0, 512, 256);

    // Add land masses (simplified continents)
    ctx.fillStyle = '#2d5a2d';
    
    // North America
    ctx.beginPath();
    ctx.ellipse(100, 60, 40, 50, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // South America
    ctx.beginPath();
    ctx.ellipse(120, 140, 25, 40, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Europe
    ctx.beginPath();
    ctx.ellipse(220, 50, 30, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Africa
    ctx.beginPath();
    ctx.ellipse(260, 110, 40, 50, 0, 0, Math.PI * 2);
    ctx.fill();

    // Asia
    ctx.beginPath();
    ctx.ellipse(340, 70, 60, 50, 0, 0, Math.PI * 2);
    ctx.fill();

    // Australia
    ctx.beginPath();
    ctx.ellipse(380, 160, 25, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    // Add some clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      const size = Math.random() * 30 + 10;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  };

  // Generate random space debris
  const generateSpaceDebris = (count: number = 300) => {
    const debris: SpaceDebris[] = [];
    
    for (let i = 0; i < count; i++) {
      // Create particles in various orbital shells around Earth
      const orbitRadius = 1.5 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 2;

      debris.push({
        position: new THREE.Vector3(
          Math.cos(theta) * Math.sin(phi) * orbitRadius,
          Math.sin(theta) * orbitRadius,
          Math.cos(phi) * Math.sin(theta) * orbitRadius
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        size: Math.random() * 0.02 + 0.005,
        rotation: new THREE.Euler(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        ),
        rotationVelocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.05
        )
      });
    }

    return debris;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // Camera setup
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 3.5;
    cameraRef.current = camera;

    // Renderer setup with transparency
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Create Earth
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
    const earthTexture = createEarthTexture();
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      metalness: 0.1,
      roughness: 0.8
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.rotation.z = 0.3; // Tilt Earth axis
    scene.add(earth);
    earthRef.current = earth;

    // Create debris group
    const debrisGroup = new THREE.Group();
    scene.add(debrisGroup);
    debrisGroupRef.current = debrisGroup;

    // Generate space debris
    const debris = generateSpaceDebris(300);
    debrisRef.current = debris;

    // Create debris meshes - use instanced rendering for performance
    const debrisGeometries = [
      new THREE.BoxGeometry(0.03, 0.03, 0.03),
      new THREE.TetrahedronGeometry(0.02),
      new THREE.OctahedronGeometry(0.02),
      new THREE.SphereGeometry(0.02, 8, 8)
    ];

    const debrisMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.7,
      roughness: 0.3,
      emissive: 0x111111
    });

    debris.forEach((debrisItem, index) => {
      const geometry = debrisGeometries[index % debrisGeometries.length];
      const mesh = new THREE.Mesh(geometry, debrisMaterial);
      mesh.position.copy(debrisItem.position);
      mesh.scale.set(debrisItem.size * 50, debrisItem.size * 50, debrisItem.size * 50);
      mesh.rotation.copy(debrisItem.rotation);
      debrisGroup.add(mesh);
    });

    // Create visor overlay effect
    const visorGeometry = new THREE.SphereGeometry(1.05, 32, 32);
    const visorMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ddff,
      metalness: 0.95,
      roughness: 0.1,
      transparent: true,
      opacity: 0.1,
      side: THREE.FrontSide
    });
    const visor = new THREE.Mesh(visorGeometry, visorMaterial);
    scene.add(visor);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      // Rotate Earth
      if (earthRef.current) {
        earthRef.current.rotation.y += 0.0003;
      }

      // Update debris
      if (debrisGroupRef.current) {
        debrisGroupRef.current.children.forEach((mesh, index) => {
          if (index < debrisRef.current.length) {
            const debrisItem = debrisRef.current[index];

            // Update position with orbital decay effect
            debrisItem.position.add(debrisItem.velocity);
            mesh.position.copy(debrisItem.position);

            // Update rotation
            debrisItem.rotation.x += debrisItem.rotationVelocity.x;
            debrisItem.rotation.y += debrisItem.rotationVelocity.y;
            debrisItem.rotation.z += debrisItem.rotationVelocity.z;
            mesh.rotation.copy(debrisItem.rotation);

            // Slight orbital drag - particles slowly spiral inward
            const distance = debrisItem.position.length();
            if (distance > 0.1) {
              debrisItem.position.normalize().multiplyScalar(distance * 0.9998);
            } else {
              // Reset particle to new orbit
              const theta = Math.random() * Math.PI * 2;
              const phi = Math.random() * Math.PI * 2;
              const orbitRadius = 1.5 + Math.random() * 2.5;
              debrisItem.position.set(
                Math.cos(theta) * Math.sin(phi) * orbitRadius,
                Math.sin(theta) * orbitRadius,
                Math.cos(phi) * Math.sin(theta) * orbitRadius
              );
            }
          }
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
      earthGeometry.dispose();
      earthMaterial.dispose();
      debrisGeometries.forEach(g => g.dispose());
      debrisMaterial.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full rounded-full overflow-hidden ${className}`}
      style={{
        minHeight: '300px',
        background: 'radial-gradient(circle, #1a1a2e 0%, #000000 100%)',
        boxShadow: 'inset 0 0 40px rgba(0, 221, 255, 0.2), 0 0 20px rgba(0, 221, 255, 0.1)'
      }}
    >
      {/* Visor glint effect */}
      <div
        className="absolute top-0 left-1/4 w-1/3 h-1/2 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
          filter: 'blur(8px)',
          transform: 'translate(-50%, -50%)'
        }}
      />
    </div>
  );
};

export default VisorEarthDisplay;
