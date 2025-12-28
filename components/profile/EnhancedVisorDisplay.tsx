import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface DebrisParticle {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  angularVelocity: THREE.Vector3;
  orbitHeight: number;
  decayRate: number;
  age: number;
}

const EnhancedVisorDisplay: React.FC<{ className?: string }> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const debrisParticlesRef = useRef<DebrisParticle[]>([]);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera - slightly inside the sphere for visor effect
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    camera.position.z = 3.2;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 0.9);
    sunLight.position.set(5, 5, 5);
    scene.add(sunLight);

    // Create Earth with more detailed texture
    const earthGeometry = new THREE.SphereGeometry(1, 128, 128);
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Ocean gradient
    const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    oceanGradient.addColorStop(0, '#1a3a52');
    oceanGradient.addColorStop(0.5, '#1a4d7a');
    oceanGradient.addColorStop(1, '#0d2638');
    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Land masses
    ctx.fillStyle = '#2d5a2d';
    const continents = [
      { x: 300, y: 200, rx: 120, ry: 150 }, // North America
      { x: 350, y: 450, rx: 80, ry: 120 }, // South America
      { x: 700, y: 150, rx: 90, ry: 75 }, // Europe/Africa
      { x: 950, y: 300, rx: 150, ry: 150 }, // Asia
      { x: 1200, y: 500, rx: 80, ry: 90 }, // Australia
    ];

    continents.forEach(continent => {
      ctx.beginPath();
      ctx.ellipse(continent.x, continent.y, continent.rx, continent.ry, 0.2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Add atmospheric haze
    ctx.strokeStyle = 'rgba(100, 150, 200, 0.3)';
    ctx.lineWidth = 30;
    ctx.beginPath();
    ctx.arc(1024, 512, 950, 0, Math.PI * 2);
    ctx.stroke();

    const earthTexture = new THREE.CanvasTexture(canvas);
    earthTexture.colorSpace = THREE.SRGBColorSpace;
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      metalness: 0.1,
      roughness: 0.8
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.rotation.z = 0.4;
    earth.rotation.x = 0.1;
    scene.add(earth);

    // Atmosphere glow
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

    // Visor glass outer shell
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

    // Create realistic space debris
    const debrisGroup = new THREE.Group();
    scene.add(debrisGroup);

    const debrisGeometries = [
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.TetrahedronGeometry(0.8),
      new THREE.OctahedronGeometry(0.7),
      new THREE.ConeGeometry(0.6, 1.2, 8),
      new THREE.CylinderGeometry(0.5, 0.5, 1.5, 8)
    ];

    const debrisMaterials = [
      new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2, emissive: 0x444444, emissiveIntensity: 0.3 }),
      new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.7, roughness: 0.3, emissive: 0x555555, emissiveIntensity: 0.3 }),
      new THREE.MeshStandardMaterial({ color: 0xbbbbbb, metalness: 0.9, roughness: 0.1, emissive: 0x333333, emissiveIntensity: 0.3 }),
      new THREE.MeshStandardMaterial({ color: 0xffdd99, metalness: 0.6, roughness: 0.4, emissive: 0xffaa00, emissiveIntensity: 0.5 }),
    ];

    // Generate debris in concentric orbital shells
    const orbitalShells = [1.3, 1.6, 2.0, 2.4];
    const particlesPerShell = 100;

    orbitalShells.forEach((shellRadius, shellIndex) => {
      for (let i = 0; i < particlesPerShell; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 2;
        const radiusVariation = (Math.random() - 0.5) * 0.3;

        const x = Math.cos(theta) * Math.sin(phi) * (shellRadius + radiusVariation);
        const y = Math.sin(theta) * (shellRadius + radiusVariation);
        const z = Math.cos(phi) * Math.sin(theta) * (shellRadius + radiusVariation);

        const geometryIndex = Math.floor(Math.random() * debrisGeometries.length);
        const materialIndex = Math.floor(Math.random() * debrisMaterials.length);
        
        const debris = new THREE.Mesh(
          debrisGeometries[geometryIndex],
          debrisMaterials[materialIndex].clone()
        );

        const scale = Math.random() * 0.08 + 0.04;
        debris.scale.set(scale, scale, scale);
        debris.position.set(x, y, z);
        debris.rotation.set(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        );
        debrisGroup.add(debris);

        debrisParticlesRef.current.push({
          mesh: debris,
          position: new THREE.Vector3(x, y, z),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.015,
            (Math.random() - 0.5) * 0.015,
            (Math.random() - 0.5) * 0.015
          ),
          rotation: debris.rotation.clone(),
          angularVelocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.08,
            (Math.random() - 0.5) * 0.08,
            (Math.random() - 0.5) * 0.08
          ),
          orbitHeight: shellRadius,
          decayRate: 0.99998 - shellIndex * 0.00001,
          age: 0
        });
      }
    });

    // Animation
    let frameCount = 0;
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      frameCount++;

      // Rotate Earth slowly for lifelike feel
      earth.rotation.y += 0.0004;

      // Update debris particles
      debrisParticlesRef.current.forEach((particle) => {
        // Update position
        particle.position.add(particle.velocity);
        particle.mesh.position.copy(particle.position);

        // Update rotation
        particle.rotation.x += particle.angularVelocity.x;
        particle.rotation.y += particle.angularVelocity.y;
        particle.rotation.z += particle.angularVelocity.z;
        particle.mesh.rotation.copy(particle.rotation);

        // Orbital decay
        const distance = particle.position.length();
        if (distance > 0.05) {
          particle.position.normalize().multiplyScalar(distance * particle.decayRate);
        } else {
          // Reset particle
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.random() * Math.PI * 2;
          const radiusVariation = (Math.random() - 0.5) * 0.3;
          const shellRadius = particle.orbitHeight;

          particle.position.set(
            Math.cos(theta) * Math.sin(phi) * (shellRadius + radiusVariation),
            Math.sin(theta) * (shellRadius + radiusVariation),
            Math.cos(phi) * Math.sin(theta) * (shellRadius + radiusVariation)
          );
        }

        particle.age++;
      });

      // Subtle visor glow pulsation
      const pulseIntensity = 0.05 + Math.sin(frameCount * 0.01) * 0.02;
      visorMaterial.emissiveIntensity = pulseIntensity;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
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
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
      earthGeometry.dispose();
      earthMaterial.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      visorGeometry.dispose();
      visorMaterial.dispose();
      debrisGeometries.forEach(g => g.dispose());
      debrisMaterials.forEach(m => m.dispose());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{
        minHeight: '400px',
        aspectRatio: '1',
        background: 'radial-gradient(circle, #0a0e27 0%, #000000 70%)',
        boxShadow: 'inset 0 0 60px rgba(0, 255, 255, 0.15), 0 0 30px rgba(0, 221, 255, 0.2), inset -20px -20px 40px rgba(0, 0, 0, 0.5)',
        borderRadius: '50%'
      }}
    >
      {/* Visor reflection glint - top left */}
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

export default EnhancedVisorDisplay;
