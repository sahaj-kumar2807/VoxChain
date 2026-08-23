import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function RotatingSeal() {
  const meshRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.75;
      meshRef.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.15;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z -= delta * 0.5;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y -= delta * 0.2;
    }
  });

  // Create subtle orbital particles
  const particleCount = 48;
  const positions = React.useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = 2.2 + Math.random() * 0.8;
      pos[i * 3] = Math.cos(theta) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 1.2;
      pos[i * 3 + 2] = Math.sin(theta) * radius;
    }
    return pos;
  }, []);

  return (
    <group>
      {/* Center Seal Monolith */}
      <group ref={meshRef}>
        {/* Main Coin Cylinder */}
        <mesh>
          <cylinderGeometry args={[1.5, 1.5, 0.18, 32]} />
          <meshStandardMaterial
            color="#D97706"
            metalness={0.85}
            roughness={0.2}
            emissive="#78350F"
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Inner Emerald Beacon Core */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[1.1, 1.1, 0.05, 32]} />
          <meshStandardMaterial
            color="#10B981"
            metalness={0.6}
            roughness={0.1}
            emissive="#059669"
            emissiveIntensity={0.6}
          />
        </mesh>

        {/* Outer Beveled Frame Ring */}
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.7, 0.06, 16, 64]} />
          <meshStandardMaterial
            color="#F59E0B"
            metalness={0.9}
            roughness={0.15}
            emissive="#F59E0B"
            emissiveIntensity={0.4}
          />
        </mesh>
      </group>

      {/* Orbital Consensus Nodes */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.06} color="#10B981" transparent opacity={0.7} />
      </points>
    </group>
  );
}

export const SealCeremony3D: React.FC = () => {
  return (
    <div className="w-full h-56 sm:h-64 relative flex items-center justify-center pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#FFFBEB" />
        <pointLight position={[-10, -5, -5]} intensity={0.8} color="#10B981" />
        <RotatingSeal />
      </Canvas>
    </div>
  );
};
