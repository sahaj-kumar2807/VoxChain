import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function CryptographicSealCore() {
  const crystalRef = useRef<THREE.Mesh>(null);
  const crystalWireRef = useRef<THREE.Mesh>(null);
  const cageRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Group>(null);
  const ring2Ref = useRef<THREE.Group>(null);
  const innerOrbRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // Dignified, smooth levitation & rotation
    if (crystalRef.current) {
      crystalRef.current.rotation.y += delta * 0.45;
      crystalRef.current.rotation.x = Math.sin(t * 0.8) * 0.12;
      crystalRef.current.position.y = Math.sin(t * 1.2) * 0.06;
    }
    if (crystalWireRef.current) {
      crystalWireRef.current.rotation.y += delta * 0.45;
      crystalWireRef.current.rotation.x = Math.sin(t * 0.8) * 0.12;
      crystalWireRef.current.position.y = Math.sin(t * 1.2) * 0.06;
    }

    // Outer protective cage counter-rotates gently
    if (cageRef.current) {
      cageRef.current.rotation.y -= delta * 0.22;
      cageRef.current.rotation.z += delta * 0.15;
      cageRef.current.position.y = Math.sin(t * 1.2) * 0.06;
    }

    // Inner glowing core soft harmonic breathing
    if (innerOrbRef.current) {
      const scale = 1 + Math.sin(t * 2.2) * 0.08;
      innerOrbRef.current.scale.set(scale, scale, scale);
      innerOrbRef.current.position.y = Math.sin(t * 1.2) * 0.06;
    }

    // Astrolabe consensus rings gyroscopic rotation
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x += delta * 0.28;
      ring1Ref.current.rotation.y += delta * 0.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= delta * 0.24;
      ring2Ref.current.rotation.z += delta * 0.32;
    }

    // Celestial starlight motes slow orbital drift
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.12;
      particlesRef.current.rotation.x = Math.sin(t * 0.4) * 0.06;
    }
  });

  // Orbital consensus particles bounded safely inside camera view
  const particleCount = 64;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      // Keep radius between 1.2 and 2.15 so it never hits the canvas edges
      const radius = 1.35 + Math.random() * 0.8;
      pos[i * 3] = Math.cos(theta) * Math.cos(phi) * radius;
      pos[i * 3 + 1] = Math.sin(phi) * radius;
      pos[i * 3 + 2] = Math.sin(theta) * Math.cos(phi) * radius;
    }
    return pos;
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* ── Central Luminous Crypto Diamond: Deep Obsidian-Indigo Facets ── */}
      <mesh ref={crystalRef}>
        <octahedronGeometry args={[0.85, 0]} />
        <meshStandardMaterial
          color="#1E1B4B"
          emissive="#312E81"
          emissiveIntensity={0.4}
          metalness={0.92}
          roughness={0.12}
        />
      </mesh>

      {/* ── Diamond Facet Edge Wireframe Accent (Crisp Geometric Reflection) ── */}
      <mesh ref={crystalWireRef}>
        <octahedronGeometry args={[0.852, 0]} />
        <meshStandardMaterial
          color="#818CF8"
          emissive="#6366F1"
          emissiveIntensity={0.6}
          wireframe={true}
          transparent={true}
          opacity={0.35}
        />
      </mesh>

      {/* ── Inner Cryptographic Singularity (Soft Pulse Core) ── */}
      <mesh ref={innerOrbRef}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshBasicMaterial color="#E0F2FE" />
      </mesh>

      {/* ── Outer Protective Geodesic Cage (Whisper-Thin Cyan Lines) ── */}
      <mesh ref={cageRef}>
        <icosahedronGeometry args={[1.28, 0]} />
        <meshStandardMaterial
          color="#38BDF8"
          emissive="#0284C7"
          emissiveIntensity={0.3}
          wireframe={true}
          transparent={true}
          opacity={0.32}
          metalness={0.9}
          roughness={0.15}
        />
      </mesh>

      {/* ── Gyroscopic Consensus Ring 1 (Whisper-thin Cyan Astrolabe) ── */}
      <group ref={ring1Ref}>
        <mesh>
          <torusGeometry args={[1.52, 0.008, 16, 120]} />
          <meshStandardMaterial
            color="#38BDF8"
            emissive="#0284C7"
            emissiveIntensity={0.5}
            transparent={true}
            opacity={0.55}
            metalness={0.95}
            roughness={0.1}
          />
        </mesh>
        {/* Live validation satellite node 1 */}
        <mesh position={[1.52, 0, 0]}>
          <sphereGeometry args={[0.026, 16, 16]} />
          <meshBasicMaterial color="#38BDF8" />
        </mesh>
      </group>

      {/* ── Gyroscopic Consensus Ring 2 (Delicate Electric Violet Astrolabe) ── */}
      <group ref={ring2Ref}>
        <mesh>
          <torusGeometry args={[1.78, 0.009, 16, 120]} />
          <meshStandardMaterial
            color="#A5B4FC"
            emissive="#6366F1"
            emissiveIntensity={0.55}
            transparent={true}
            opacity={0.5}
            metalness={0.95}
            roughness={0.1}
          />
        </mesh>
        {/* Live validation satellite node 2 */}
        <mesh position={[0, 1.78, 0]}>
          <sphereGeometry args={[0.028, 16, 16]} />
          <meshBasicMaterial color="#A5B4FC" />
        </mesh>
      </group>

      {/* ── Subtle Quantum Starlight Motes (Soft Floating Dust) ── */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.032}
          color="#C7D2FE"
          transparent={true}
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export const SealCeremony3D: React.FC = () => {
  return (
    <div className="w-full h-80 sm:h-96 md:h-[400px] relative flex items-center justify-center overflow-visible select-none">
      {/* ── Seamless Ambient Cosmic Horizon (Merges 100% with Deep Black Background) ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Center Volumetric Indigo/Cyan Radial Nebula */}
        <div className="w-[450px] sm:w-[600px] h-[300px] sm:h-[380px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.11)_0%,rgba(56,189,248,0.04)_42%,transparent_70%)] blur-3xl" />
        
        {/* Delicate Celestial Telemetry Horizon Line */}
        <div className="absolute w-64 sm:w-[460px] h-[1px] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
        <div className="absolute w-32 sm:w-[260px] h-[1px] bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent blur-[1px]" />
      </div>

      {/* ── 3D Canvas with 360° Radial Vignette Mask (Zero Hard Clipping Edges) ── */}
      <div
        className="w-full h-full relative"
        style={{
          WebkitMaskImage: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,1) 45%, rgba(0,0,0,0.7) 72%, transparent 95%)',
          maskImage: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,1) 45%, rgba(0,0,0,0.7) 72%, transparent 95%)',
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 6.6], fov: 42 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.65} />
          {/* Key Directional Rim Light */}
          <directionalLight position={[4, 5, 5]} intensity={1.8} color="#FFFFFF" />
          {/* Subtle Cyan Accents */}
          <pointLight position={[-3, 2, 2]} intensity={2.0} color="#38BDF8" distance={8} />
          {/* Subtle Electric Violet Backlight */}
          <pointLight position={[3, -3, -2]} intensity={2.2} color="#818CF8" distance={8} />
          {/* Core Luminous Warmth */}
          <pointLight position={[0, 0, 0]} intensity={1.5} color="#FFFFFF" distance={3} />

          <CryptographicSealCore />
        </Canvas>
      </div>
    </div>
  );
};
