/**
 * HextechCrystal - A lightweight 3D League of Legends themed component
 * Uses Three.js with @react-three/fiber for a floating Hextech crystal
 */

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Torus, Octahedron } from '@react-three/drei';
import * as THREE from 'three';

interface HextechCrystalProps {
  className?: string;
  autoRotate?: boolean;
  scale?: number;
}

/**
 * Main Hextech crystal component - an octahedron with glowing edges
 */
function Crystal({ autoRotate = true, scale = 1 }: { autoRotate?: boolean; scale?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
    if (innerRef.current && autoRotate) {
      innerRef.current.rotation.y = -state.clock.elapsedTime * 0.5;
      // Pulsing scale effect
      innerRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
    }
  });

  // Hextech blue color
  const hextechColor = '#0AC8B9';
  const goldColor = '#C89B3C';

  return (
    <group scale={scale}>
      {/* Outer octahedron crystal frame */}
      <Octahedron
        ref={meshRef}
        args={[1, 0]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial
          color={hextechColor}
          metalness={0.8}
          roughness={0.2}
          emissive={hextechColor}
          emissiveIntensity={0.3}
          wireframe
        />
      </Octahedron>

      {/* Inner glowing core */}
      <Sphere ref={innerRef} args={[0.4, 16, 16]}>
        <meshStandardMaterial
          color={goldColor}
          metalness={0.9}
          roughness={0.1}
          emissive={goldColor}
          emissiveIntensity={0.5}
        />
      </Sphere>

      {/* Orbital rings */}
      <Torus
        args={[1.4, 0.02, 16, 100]}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial
          color={goldColor}
          metalness={0.7}
          roughness={0.3}
          emissive={goldColor}
          emissiveIntensity={0.2}
        />
      </Torus>

      <Torus
        args={[1.8, 0.015, 16, 100]}
        rotation={[Math.PI / 3, 0, 0]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial
          color={hextechColor}
          metalness={0.7}
          roughness={0.3}
          emissive={hextechColor}
          emissiveIntensity={0.2}
        />
      </Torus>
    </group>
  );
}

/**
 * Scene with lights and camera
 */
function CrystalScene({ autoRotate = true, scale = 1 }: { autoRotate?: boolean; scale?: number }) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  return (
    <>
      {/* Camera */}
      <perspectiveCamera
        ref={cameraRef}
        fov={50}
        position={[0, 0, 5]}
      />

      {/* Lights */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color={new THREE.Color('#C89B3C')} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color={new THREE.Color('#0AC8B9')} />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.5}
        color={new THREE.Color('#C89B3C')}
        castShadow
      />

      {/* Crystal */}
      <Crystal autoRotate={autoRotate} scale={scale} />

      {/* Subtle orbit controls for interaction */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
      />
    </>
  );
}

/**
 * HextechCrystal component - League of Legends themed 3D crystal
 *
 * Usage:
 * ```tsx
 * <HextechCrystal className="w-64 h-64" autoRotate={true} scale={1.5} />
 * ```
 */
export function HextechCrystal({
  className = '',
  autoRotate = true,
  scale = 1,
}: HextechCrystalProps) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        className="w-full h-full"
      >
        <CrystalScene autoRotate={autoRotate} scale={scale} />
      </Canvas>
    </div>
  );
}
