import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export interface WireframeGlobe3DProps {
  className?: string;
  onNodeClick?: (nodeName: string) => void;
}

/**
 * WireframeGlobe3D — Pure Pristine 3D Neural Network Wireframe Globe
 * Features:
 * - 100% transparent background with zero hard bounding boxes or canvas clipping
 * - Delicate electric violet & lavender wireframe latitude/meridian rings with Additive Blending
 * - Fibonacci-distributed neural nodes with synaptic constellation lines
 * - Elegant orbital resonance arc with satellite nodes
 * - Smooth mouse parallax responsiveness & continuous multi-axis rotation
 */
export const WireframeGlobe3D: React.FC<WireframeGlobe3DProps> = ({
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);
  const animFrameId = useRef<number>(0);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    const width = container.clientWidth || 540;
    const height = container.clientHeight || 540;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.4);

    // 2. High-Performance Renderer with 100% Transparent Background
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // 100% alpha transparent
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 3. Globe Root Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Colors
    const primaryViolet = 0x818cf8;  // #818CF8
    const brightLavender = 0xa5b4fc; // #A5B4FC
    const neonCyan = 0x38bdf8;       // #38BDF8
    const pureBlack = 0x000000;

    const R = 2.15; // Sphere Radius calibrated to fit comfortably inside view without clipping

    // ── A. Pure Black Occlusion Core ──
    // Neatly blocks backside lines without showing any visible silhouette or edge against the page
    const coreGeo = new THREE.SphereGeometry(R * 0.985, 48, 48);
    const coreMat = new THREE.MeshBasicMaterial({
      color: pureBlack,
      transparent: true,
      opacity: 0.92,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(coreMesh);

    // ── B. Latitude Wireframe Loops (Additive Electric Violet) ──
    const latitudeCount = 8;
    const latLineMat = new THREE.LineBasicMaterial({
      color: primaryViolet,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      linewidth: 1,
    });

    for (let i = -latitudeCount; i <= latitudeCount; i++) {
      const phi = (i / (latitudeCount + 1)) * (Math.PI / 2);
      const ringRadius = R * Math.cos(phi);
      const ringY = R * Math.sin(phi);

      const segments = 80;
      const ringGeo = new THREE.BufferGeometry();
      const positions = new Float32Array((segments + 1) * 3);

      for (let s = 0; s <= segments; s++) {
        const theta = (s / segments) * Math.PI * 2;
        positions[s * 3] = ringRadius * Math.cos(theta);
        positions[s * 3 + 1] = ringY;
        positions[s * 3 + 2] = ringRadius * Math.sin(theta);
      }

      ringGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const latLine = new THREE.Line(ringGeo, latLineMat);
      globeGroup.add(latLine);
    }

    // ── C. Longitude Meridian Circles (Additive Ethereal Lavender) ──
    const meridianCount = 12;
    const meridianMat = new THREE.LineBasicMaterial({
      color: brightLavender,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      linewidth: 1,
    });

    for (let m = 0; m < meridianCount; m++) {
      const rotY = (m / meridianCount) * Math.PI;
      const segments = 80;
      const meridianGeo = new THREE.BufferGeometry();
      const positions = new Float32Array((segments + 1) * 3);

      for (let s = 0; s <= segments; s++) {
        const theta = (s / segments) * Math.PI * 2;
        positions[s * 3] = R * Math.sin(theta) * Math.cos(rotY);
        positions[s * 3 + 1] = R * Math.cos(theta);
        positions[s * 3 + 2] = R * Math.sin(theta) * Math.sin(rotY);
      }

      meridianGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const meridianLine = new THREE.Line(meridianGeo, meridianMat);
      globeGroup.add(meridianLine);
    }

    // ── D. 3D Neural Network Nodes (Fibonacci Distribution) ──
    const nodeCount = 52;
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const neuralNodes: THREE.Vector3[] = [];

    const nodeInstGeo = new THREE.SphereGeometry(0.032, 12, 12);
    const nodeInstMat = new THREE.MeshBasicMaterial({
      color: 0xc7d2fe,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const nodeAccentMat = new THREE.MeshBasicMaterial({
      color: neonCyan,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });

    for (let i = 0; i < nodeCount; i++) {
      const y = 1 - (i / (nodeCount - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = 2 * Math.PI * i / goldenRatio;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      const pos = new THREE.Vector3(x * (R + 0.02), y * (R + 0.02), z * (R + 0.02));
      neuralNodes.push(pos);

      // Create glowing node mesh
      const isAccent = i % 5 === 0;
      const mesh = new THREE.Mesh(nodeInstGeo, isAccent ? nodeAccentMat : nodeInstMat);
      mesh.position.copy(pos);
      if (isAccent) {
        mesh.scale.set(1.4, 1.4, 1.4);
      }
      globeGroup.add(mesh);
    }

    // ── E. Synaptic Constellation Lines ──
    const lineIndices: number[] = [];
    const maxDistance = R * 0.72;

    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dist = neuralNodes[i].distanceTo(neuralNodes[j]);
        if (dist < maxDistance) {
          lineIndices.push(i, j);
        }
      }
    }

    const netLinePositions = new Float32Array(lineIndices.length * 3);
    for (let k = 0; k < lineIndices.length; k++) {
      const nodeIdx = lineIndices[k];
      const p = neuralNodes[nodeIdx];
      netLinePositions[k * 3] = p.x;
      netLinePositions[k * 3 + 1] = p.y;
      netLinePositions[k * 3 + 2] = p.z;
    }

    const netLineGeo = new THREE.BufferGeometry();
    netLineGeo.setAttribute('position', new THREE.BufferAttribute(netLinePositions, 3));
    const netLineMat = new THREE.LineBasicMaterial({
      color: primaryViolet,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      linewidth: 1,
    });
    const neuralNetLines = new THREE.LineSegments(netLineGeo, netLineMat);
    globeGroup.add(neuralNetLines);

    // Natural orientation
    globeGroup.rotation.x = 0.22;
    globeGroup.rotation.y = 0.45;
    globeGroup.rotation.z = -0.10;

    // Mouse parallax tracking
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      targetMouseX = x * 0.24;
      targetMouseY = y * 0.18;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // Responsive Canvas Resize Observer
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 540;
      const h = container.clientHeight || 540;
      if (w === 0 || h === 0) return;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    // 4. Smooth Cinematic Animation Loop
    let lastTime = performance.now();

    const animate = () => {
      const now = performance.now();
      const delta = (now - lastTime) * 0.001;
      lastTime = now;

      // Mouse easing
      currentMouseX += (targetMouseX - currentMouseX) * 0.06;
      currentMouseY += (targetMouseY - currentMouseY) * 0.06;

      // Smooth multi-axis rotation
      globeGroup.rotation.y += delta * 0.30;
      globeGroup.rotation.x = 0.22 + currentMouseY;
      globeGroup.rotation.z = -0.10 + currentMouseX;

      // Synaptic line breathing
      netLineMat.opacity = 0.26 + Math.sin(now * 0.0018) * 0.08;

      renderer.render(scene, camera);
      animFrameId.current = requestAnimationFrame(animate);
    };

    animFrameId.current = requestAnimationFrame(animate);

    // Cleanup resources
    return () => {
      cancelAnimationFrame(animFrameId.current);
      window.removeEventListener('mousemove', onMouseMove);
      resizeObserver.disconnect();

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.LineSegments) {
          if (obj.geometry) obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else if (obj.material) {
            obj.material.dispose();
          }
        }
      });

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full min-h-[460px] sm:min-h-[540px] lg:min-h-[620px] pointer-events-none select-none flex items-center justify-center ${className}`}
      aria-label="3D Neural Network Wireframe Globe"
    >
      {!hasWebGL && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-72 h-72 rounded-full border border-[#818CF8]/50 flex items-center justify-center">
            <span className="font-mono text-xs text-[#818CF8]">VOXCHAIN 3D NETWORK</span>
          </div>
        </div>
      )}
    </div>
  );
};
