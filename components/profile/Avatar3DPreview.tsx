import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { AvatarData } from './AvatarCustomizer';

interface Avatar3DPreviewProps {
  avatarSettings: AvatarData;
  size?: 'small' | 'medium' | 'large';
  autoRotate?: boolean;
  className?: string;
}

const Avatar3DPreview: React.FC<Avatar3DPreviewProps> = ({
  avatarSettings,
  size = 'medium',
  autoRotate = true,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const avatarGroupRef = useRef<THREE.Group | null>(null);
  const animationIdRef = useRef<number | null>(null);

  // Get dimensions based on size prop
  const sizeMap = {
    small: { width: 80, height: 80 },
    medium: { width: 120, height: 120 },
    large: { width: 160, height: 160 }
  };

  const dimensions = sizeMap[size];

  const createAvatar = (group: THREE.Group, data: AvatarData) => {
    // Clear existing children
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    // Head with optional face texture
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
    head.position.y = 0.2;
    group.add(head);

    // Left Eye
    const eyeGeometry = new THREE.SphereGeometry(0.12, 16, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({
      color: data.eyeColor,
      metalness: 0.3,
      roughness: 0.4
    });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.2, 0.5, 0.5);
    group.add(leftEye);

    // Right Eye
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.2, 0.5, 0.5);
    group.add(rightEye);

    // Hair - choose geometry based on style
    const hairGeometry = getHairGeometry(data.hairStyle);
    const hairMaterial = new THREE.MeshStandardMaterial({
      color: data.hairColor,
      metalness: 0.1,
      roughness: 0.7
    });
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.position.y = 1.1;
    group.add(hair);

    // Body
    const bodyGeometry = getBodyGeometry(data.bodyType);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: data.clothingColor,
      metalness: 0.05,
      roughness: 0.9
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = -0.6;
    group.add(body);
  };

  const getHairGeometry = (style: string): THREE.BufferGeometry => {
    switch (style) {
      case 'short':
        return new THREE.SphereGeometry(0.7, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6);
      case 'medium':
        return new THREE.SphereGeometry(0.75, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.7);
      case 'long':
        return new THREE.ConeGeometry(0.65, 1.2, 32);
      case 'curly':
        const geometry = new THREE.SphereGeometry(0.8, 16, 16);
        const positions = geometry.attributes.position as THREE.BufferAttribute;
        const posArray = positions.array as Float32Array;
        for (let i = 0; i < posArray.length; i += 3) {
          posArray[i] += (Math.random() - 0.5) * 0.3;
          posArray[i + 1] += (Math.random() - 0.5) * 0.3;
          posArray[i + 2] += (Math.random() - 0.5) * 0.3;
        }
        positions.needsUpdate = true;
        return geometry;
      default:
        return new THREE.SphereGeometry(0.7, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6);
    }
  };

  const getBodyGeometry = (type: string): THREE.BufferGeometry => {
    const height = 1.0;
    let width = 0.6;
    let depth = 0.35;

    if (type === 'slim') {
      width = 0.5;
      depth = 0.3;
    } else if (type === 'athletic') {
      width = 0.7;
      depth = 0.4;
    }

    return new THREE.BoxGeometry(width, height, depth);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e293b);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, dimensions.width / dimensions.height, 0.1, 1000);
    camera.position.z = 2;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(dimensions.width, dimensions.height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Avatar group
    const avatarGroup = new THREE.Group();
    scene.add(avatarGroup);
    avatarGroupRef.current = avatarGroup;

    // Create initial avatar
    createAvatar(avatarGroup, avatarSettings);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      if (autoRotate && avatarGroup) {
        avatarGroup.rotation.y += 0.01;
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
      createAvatar(avatarGroupRef.current, avatarSettings);
    }
  }, [avatarSettings]);

  return (
    <div
      ref={containerRef}
      className={`rounded-full overflow-hidden border-4 border-cyan-500 shadow-lg shadow-cyan-500/20 inline-block ${className}`}
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`
      }}
    />
  );
};

export default Avatar3DPreview;
