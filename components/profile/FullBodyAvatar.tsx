import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { AvatarData } from './AvatarCustomizer';

interface FullBodyAvatarProps {
  avatarSettings: AvatarData;
  size?: 'small' | 'medium';
  autoRotate?: boolean;
}

const FullBodyAvatar: React.FC<FullBodyAvatarProps> = ({
  avatarSettings,
  size = 'small',
  autoRotate = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const avatarGroupRef = useRef<THREE.Group | null>(null);
  const animationIdRef = useRef<number | null>(null);

  const sizeMap = {
    small: { width: 200, height: 400 },
    medium: { width: 280, height: 500 }
  };

  const dimensions = sizeMap[size];

  const createFullBodyAvatar = (group: THREE.Group, data: AvatarData) => {
    // Clear existing children
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    // Head (sphere)
    const headGeometry = new THREE.SphereGeometry(0.35, 48, 48);
    let headMaterial: THREE.Material;

    if (data.faceImageData) {
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
          const texturedMaterial = new THREE.MeshStandardMaterial({ 
            map: texture,
            metalness: 0.1,
            roughness: 0.8
          });
          head.material = texturedMaterial;
        }
      };
      img.src = data.faceImageData;
      
      headMaterial = new THREE.MeshStandardMaterial({
        color: data.skinTone,
        metalness: 0.1,
        roughness: 0.8
      });
    } else {
      headMaterial = new THREE.MeshStandardMaterial({
        color: data.skinTone,
        metalness: 0.1,
        roughness: 0.8
      });
    }

    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.5;
    group.add(head);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.08, 32, 32);
    const eyeMaterial = new THREE.MeshStandardMaterial({
      color: data.eyeColor,
      metalness: 0.3,
      roughness: 0.4
    });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.12, 2.7, 0.3);
    group.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.12, 2.7, 0.3);
    group.add(rightEye);

    // Hair
    const hairGeometry = getHairGeometry(data.hairStyle);
    const hairMaterial = new THREE.MeshStandardMaterial({
      color: data.hairColor,
      metalness: 0.1,
      roughness: 0.7
    });
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.position.y = 2.9;
    group.add(hair);

    // Torso (body)
    const torsoGeometry = new THREE.BoxGeometry(0.5, 1.2, 0.3);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: data.clothingColor,
      metalness: 0.05,
      roughness: 0.9
    });
    const torso = new THREE.Mesh(torsoGeometry, bodyMaterial);
    torso.position.y = 1.2;
    group.add(torso);

    // Left Arm
    const armGeometry = new THREE.BoxGeometry(0.15, 1, 0.2);
    const armMaterial = new THREE.MeshStandardMaterial({
      color: data.skinTone,
      metalness: 0.1,
      roughness: 0.8
    });

    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.4, 1.5, 0);
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.4, 1.5, 0);
    group.add(rightArm);

    // Left Leg
    const legGeometry = new THREE.BoxGeometry(0.18, 1.2, 0.2);
    const legMaterial = new THREE.MeshStandardMaterial({
      color: '#2c2c2c',
      metalness: 0.05,
      roughness: 0.9
    });

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.18, 0, 0);
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.18, 0, 0);
    group.add(rightLeg);

    // Feet
    const feetGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.3);
    const feetMaterial = new THREE.MeshStandardMaterial({
      color: '#1a1a1a',
      metalness: 0.1,
      roughness: 0.9
    });

    const leftFoot = new THREE.Mesh(feetGeometry, feetMaterial);
    leftFoot.position.set(-0.18, -0.65, 0.05);
    group.add(leftFoot);

    const rightFoot = new THREE.Mesh(feetGeometry, feetMaterial);
    rightFoot.position.set(0.18, -0.65, 0.05);
    group.add(rightFoot);
  };

  const getHairGeometry = (style: string): THREE.BufferGeometry => {
    switch (style) {
      case 'short':
        return new THREE.SphereGeometry(0.4, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.5);
      case 'medium':
        return new THREE.SphereGeometry(0.42, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6);
      case 'long':
        return new THREE.ConeGeometry(0.4, 0.8, 32);
      case 'curly':
        const geometry = new THREE.SphereGeometry(0.45, 16, 16);
        const positions = geometry.attributes.position as THREE.BufferAttribute;
        const posArray = positions.array as Float32Array;
        for (let i = 0; i < posArray.length; i += 3) {
          posArray[i] += (Math.random() - 0.5) * 0.15;
          posArray[i + 1] += (Math.random() - 0.5) * 0.15;
          posArray[i + 2] += (Math.random() - 0.5) * 0.15;
        }
        positions.needsUpdate = true;
        return geometry;
      default:
        return new THREE.SphereGeometry(0.4, 32, 32);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e293b);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      dimensions.width / dimensions.height,
      0.1,
      1000
    );
    camera.position.z = 3.5;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(dimensions.width, dimensions.height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(3, 5, 3);
    scene.add(directionalLight);

    // Avatar group
    const avatarGroup = new THREE.Group();
    scene.add(avatarGroup);
    avatarGroupRef.current = avatarGroup;

    // Create initial avatar
    createFullBodyAvatar(avatarGroup, avatarSettings);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      if (autoRotate && avatarGroup) {
        avatarGroup.rotation.y += 0.01;
        // Slight bob motion
        const originalY = avatarGroup.position.y;
        avatarGroup.position.y = originalY + Math.sin(Date.now() * 0.002) * 0.1;
      }
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [dimensions, autoRotate]);

  // Update avatar when settings change
  useEffect(() => {
    if (avatarGroupRef.current) {
      createFullBodyAvatar(avatarGroupRef.current, avatarSettings);
    }
  }, [avatarSettings]);

  return (
    <div
      ref={containerRef}
      className="rounded-lg overflow-hidden border-2 border-cyan-500 shadow-lg shadow-cyan-500/20"
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
      }}
    />
  );
};

export default FullBodyAvatar;
