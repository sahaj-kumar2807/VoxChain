import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * ScrollBallotSeal — The signature 3D celestial ballot seal of VOXCHAIN.
 *
 * Implements the continuous 3D narrative inspired by the Stitch design export:
 * A monumental monochromatic lunar granite and brushed-metal sphere with engraved
 * architectural lettering, razor-polished chamfer rings, glowing atmosphere ring,
 * concentric orbital paths, vertical acoustic/harmonic stream lines, orbital consensus
 * satellites, and cosmic data dust particles.
 *
 * 7 Narrative Stages driven by continuous scroll progress:
 * Stage 1 (0.00–0.16): Emergence       — Solitary celestial body in deep obsidian space
 * Stage 2 (0.16–0.32): Orbit Formation — Delicate metallic orbital rings appear
 * Stage 3 (0.32–0.48): Consensus Nodes — Geometric layers and connected nodes emerge
 * Stage 4 (0.48–0.64): Crypto Matrix   — Architectural typography & cryptographic coordinates
 * Stage 5 (0.64–0.80): Enclaves        — Tilted spatial perspective for election governance
 * Stage 6 (0.80–0.92): Telemetry Sync  — Acoustic streams & inter-system alignment
 * Stage 7 (0.92–1.00): Certified Seal  — Stabilized frontal verification seal with halo
 */

export interface ScrollBallotSealProps {
  scrollProgress?: number;
  pointerNormX?: number;
  pointerNormY?: number;
  className?: string;
  isHero?: boolean;
}

interface StageState {
  rotX: number;
  rotY: number;
  rotZ: number;
  posX: number;
  posY: number;
  scale: number;
  keyLightIntensity: number;
  rimLightIntensity: number;
  ambientIntensity: number;
  linesAlpha: number;
  ringAlpha: number;
}

const STAGES: StageState[] = [
  // Stage 1: Emergence — solitary planet, angled mystery, soft illumination
  { rotX: 0.38, rotY: -0.60, rotZ: 0.05, posX: 0.18, posY: -0.08, scale: 0.88, keyLightIntensity: 1.4, rimLightIntensity: 0.7, ambientIntensity: 0.30, linesAlpha: 0.20, ringAlpha: 0.20 },
  // Stage 2: Orbit Formation — orbital paths begin defining geometry
  { rotX: 0.26, rotY: -0.35, rotZ: 0.03, posX: 0.08, posY: -0.05, scale: 0.92, keyLightIntensity: 1.7, rimLightIntensity: 0.9, ambientIntensity: 0.35, linesAlpha: 0.40, ringAlpha: 0.45 },
  // Stage 3: Consensus Nodes — satellite nodes rotate into view
  { rotX: 0.18, rotY: -0.15, rotZ: -0.02, posX: 0.00, posY: 0.00, scale: 0.95, keyLightIntensity: 2.0, rimLightIntensity: 1.1, ambientIntensity: 0.40, linesAlpha: 0.55, ringAlpha: 0.60 },
  // Stage 4: Crypto Matrix — engraved coordinates & architectural typography
  { rotX: 0.12, rotY: 0.20, rotZ: -0.04, posX: -0.12, posY: 0.04, scale: 0.92, keyLightIntensity: 2.2, rimLightIntensity: 1.2, ambientIntensity: 0.42, linesAlpha: 0.70, ringAlpha: 0.75 },
  // Stage 5: Enclaves — tilted spatial perspective
  { rotX: 0.15, rotY: 0.45, rotZ: 0.00, posX: 0.10, posY: 0.02, scale: 0.90, keyLightIntensity: 1.9, rimLightIntensity: 1.0, ambientIntensity: 0.38, linesAlpha: 0.60, ringAlpha: 0.65 },
  // Stage 6: Telemetry Sync — harmonic stream lines and telemetry
  { rotX: 0.08, rotY: 0.12, rotZ: 0.02, posX: 0.00, posY: 0.00, scale: 0.98, keyLightIntensity: 2.4, rimLightIntensity: 1.4, ambientIntensity: 0.45, linesAlpha: 0.85, ringAlpha: 0.85 },
  // Stage 7: Certified Seal — frontal, balanced, iconic stability with glowing atmosphere
  { rotX: 0.05, rotY: 0.00, rotZ: 0.00, posX: 0.00, posY: 0.00, scale: 1.00, keyLightIntensity: 2.6, rimLightIntensity: 1.5, ambientIntensity: 0.50, linesAlpha: 0.95, ringAlpha: 1.00 },
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpState(a: StageState, b: StageState, t: number): StageState {
  return {
    rotX: lerp(a.rotX, b.rotX, t),
    rotY: lerp(a.rotY, b.rotY, t),
    rotZ: lerp(a.rotZ, b.rotZ, t),
    posX: lerp(a.posX, b.posX, t),
    posY: lerp(a.posY, b.posY, t),
    scale: lerp(a.scale, b.scale, t),
    keyLightIntensity: lerp(a.keyLightIntensity, b.keyLightIntensity, t),
    rimLightIntensity: lerp(a.rimLightIntensity, b.rimLightIntensity, t),
    ambientIntensity: lerp(a.ambientIntensity, b.ambientIntensity, t),
    linesAlpha: lerp(a.linesAlpha, b.linesAlpha, t),
    ringAlpha: lerp(a.ringAlpha, b.ringAlpha, t),
  };
}

function getTargetState(scrollProgress: number): StageState {
  const p = Math.max(0, Math.min(1, scrollProgress));
  const stageCount = STAGES.length - 1;
  const stageIndex = p * stageCount;
  const stageFloor = Math.min(Math.floor(stageIndex), stageCount - 1);
  const stageFrac = stageIndex - stageFloor;
  // Smooth cubic ease
  const eased = stageFrac < 0.5 ? 2 * stageFrac * stageFrac : 1 - Math.pow(-2 * stageFrac + 2, 2) / 2;
  return lerpState(STAGES[stageFloor], STAGES[stageFloor + 1], eased);
}

/**
 * Creates procedural texture with fine titanium/granite stippling, crater shading,
 * and engraved VOXCHAIN typography based on the Stitch reference.
 */
function createMonolithTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Base dark titanium / lunar slate
    ctx.fillStyle = '#b0b5be';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Craters & organic relief
    for (let i = 0; i < 280; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const r = Math.random() * 20 + 2;
      const grad = ctx.createRadialGradient(x, y, 1, x, y, r);
      grad.addColorStop(0, 'rgba(30, 34, 42, 0.75)');
      grad.addColorStop(0.7, 'rgba(65, 72, 85, 0.35)');
      grad.addColorStop(1, 'rgba(176, 181, 190, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Micro stippling noise
    for (let i = 0; i < 6000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.18)';
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
    }

    // Technical latitude & longitude grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 64; y < canvas.height; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Engraved VOXCHAIN architectural typography
    ctx.font = '600 36px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(245, 247, 250, 0.92)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Front quadrant
    ctx.fillText('V O X C H A I N', canvas.width * 0.25, canvas.height * 0.5);
    // Back quadrant
    ctx.fillText('V O X C H A I N', canvas.width * 0.75, canvas.height * 0.5);

    // Coordinate technical marks
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(212, 255, 0, 0.75)'; // Subtle signal lime telemetry
    ctx.fillText('0x9ecd…E025 // SEPOLIA 11155111', canvas.width * 0.25, canvas.height * 0.5 + 38);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

export const ScrollBallotSeal: React.FC<ScrollBallotSealProps> = ({
  scrollProgress = 0,
  pointerNormX = 0,
  pointerNormY = 0,
  className = '',
  isHero = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webGLSupported, setWebGLSupported] = useState<boolean | null>(null);

  // References for animation
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rootGroupRef = useRef<THREE.Group | null>(null);
  const sphereMeshRef = useRef<THREE.Mesh | null>(null);
  const linesGroupRef = useRef<THREE.Group | null>(null);
  const satellitesRef = useRef<THREE.Group | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rimLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const animFrameRef = useRef<number>(0);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());

  const currentStateRef = useRef<StageState>({ ...STAGES[0] });
  const pointerRef = useRef({ x: 0, y: 0 });

  const scrollProgressRef = useRef(scrollProgress);
  const pointerNormXRef = useRef(pointerNormX);
  const pointerNormYRef = useRef(pointerNormY);

  useEffect(() => { scrollProgressRef.current = scrollProgress; }, [scrollProgress]);
  useEffect(() => { pointerNormXRef.current = pointerNormX; }, [pointerNormX]);
  useEffect(() => { pointerNormYRef.current = pointerNormY; }, [pointerNormY]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const w = container.clientWidth || 400;
    const h = container.clientHeight || 400;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 50);
    camera.position.set(0, 0, 9.2);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      setWebGLSupported(true);
    } catch {
      setWebGLSupported(false);
      return;
    }
    rendererRef.current = renderer;

    const disposables: (THREE.BufferGeometry | THREE.Material | THREE.Texture)[] = [];
    const track = (...items: (THREE.BufferGeometry | THREE.Material | THREE.Texture)[]) => disposables.push(...items);

    const rootGroup = new THREE.Group();
    rootGroup.rotation.x = STAGES[0].rotX;
    rootGroup.rotation.y = STAGES[0].rotY;
    rootGroup.rotation.z = STAGES[0].rotZ;
    scene.add(rootGroup);
    rootGroupRef.current = rootGroup;

    // ── 1. Vertical Harmonic Acoustic Lines (Reference Artwork Feature) ──
    const linesGroup = new THREE.Group();
    rootGroup.add(linesGroup);
    linesGroupRef.current = linesGroup;

    const lineCount = 32;
    const lineSpacing = 0.18;
    const linesMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: STAGES[0].linesAlpha,
    });
    track(linesMaterial);

    for (let i = 0; i < lineCount; i++) {
      const x = (i - lineCount / 2) * lineSpacing;
      // Parabolic / harmonic height profile flanking the sphere
      const distFromCenter = Math.abs(x) / 3.0;
      const height = Math.max(1.2, 5.2 - Math.pow(distFromCenter, 1.4) * 3.8);
      const lineGeo = new THREE.CylinderGeometry(0.007, 0.007, height, 6);
      track(lineGeo);
      const lineMesh = new THREE.Mesh(lineGeo, linesMaterial);
      lineMesh.position.set(x, 0, -0.6); // Placed slightly behind sphere
      linesGroup.add(lineMesh);
    }

    // ── 2. Core Celestial Sphere with Stippled Brushed Titanium Texture ──
    const monolithTex = createMonolithTexture();
    track(monolithTex);

    const sphereGeo = new THREE.SphereGeometry(1.72, 64, 64);
    track(sphereGeo);
    const sphereMat = new THREE.MeshStandardMaterial({
      map: monolithTex,
      metalness: 0.90,
      roughness: 0.28,
      bumpMap: monolithTex,
      bumpScale: 0.015,
    });
    track(sphereMat);

    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    rootGroup.add(sphereMesh);
    sphereMeshRef.current = sphereMesh;

    // ── 3. Atmospheric Glow Halo Ring (Stitch Feature) ──
    const glowGeo = new THREE.RingGeometry(2.02, 2.24, 64);
    track(glowGeo);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xd4ff00,
      transparent: true,
      opacity: STAGES[0].ringAlpha * 0.22,
      side: THREE.DoubleSide,
    });
    track(glowMat);
    const glowRing = new THREE.Mesh(glowGeo, glowMat);
    glowRing.rotation.x = Math.PI / 2.2;
    rootGroup.add(glowRing);

    // ── 4. Concentric Horizontal Orbital Path Rings (Stitch Reference) ──
    const orbitPathsGroup = new THREE.Group();
    rootGroup.add(orbitPathsGroup);
    [2.65, 3.15, 3.85].forEach((radius, idx) => {
      const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, 2 * Math.PI, false, 0);
      const points = curve.getPoints(96);
      const ringGeometry = new THREE.BufferGeometry().setFromPoints(points);
      track(ringGeometry);
      const ringMaterial = new THREE.LineBasicMaterial({
        color: idx === 1 ? 0xd4ff00 : 0x8a99ad,
        transparent: true,
        opacity: idx === 1 ? 0.35 : 0.20,
      });
      track(ringMaterial);
      const orbitLine = new THREE.Line(ringGeometry, ringMaterial);
      orbitLine.rotation.x = Math.PI / 2.25;
      orbitPathsGroup.add(orbitLine);
    });

    // ── 5. Razor-Polished Chamfer Ring & Outer Track ──
    const ringGeo = new THREE.TorusGeometry(2.18, 0.022, 16, 80);
    track(ringGeo);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xd8d8d8,
      metalness: 0.98,
      roughness: 0.08,
    });
    track(ringMat);

    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.3;
    rootGroup.add(ringMesh);

    const outerRingGeo = new THREE.TorusGeometry(2.45, 0.012, 12, 72);
    track(outerRingGeo);
    const outerRingMat = new THREE.MeshStandardMaterial({
      color: 0x768297,
      metalness: 0.85,
      roughness: 0.35,
    });
    track(outerRingMat);
    const outerRingMesh = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRingMesh.rotation.x = Math.PI / 2.1;
    rootGroup.add(outerRingMesh);

    // ── 6. Orbital Celestial Consensus Nodes (Satellites) ──
    const satellitesGroup = new THREE.Group();
    rootGroup.add(satellitesGroup);
    satellitesRef.current = satellitesGroup;

    const satelliteNodes = [
      { r: 2.65, size: 0.12, speed: 0.55, yOffset: 0.35, color: 0xffffff, isAccent: false },
      { r: 3.15, size: 0.09, speed: -0.42, yOffset: -0.45, color: 0xd4ff00, isAccent: true }, // Signal lime accent node!
      { r: 2.35, size: 0.07, speed: 0.80, yOffset: 0.70, color: 0xc2c6d4, isAccent: false },
    ];

    satelliteNodes.forEach((node) => {
      const satGeo = new THREE.SphereGeometry(node.size, 24, 24);
      track(satGeo);
      const satMat = node.isAccent
        ? new THREE.MeshBasicMaterial({ color: 0xd4ff00 })
        : new THREE.MeshStandardMaterial({
            color: node.color,
            metalness: 0.95,
            roughness: 0.15,
          });
      track(satMat);
      const satMesh = new THREE.Mesh(satGeo, satMat);
      satMesh.userData = { r: node.r, speed: node.speed, yOffset: node.yOffset, angle: Math.random() * Math.PI * 2 };
      satellitesGroup.add(satMesh);
    });

    // ── 7. Cosmic Data Dust Particle Field ──
    const particleCount = 450;
    const pGeo = new THREE.BufferGeometry();
    track(pGeo);
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      pPos[i] = (Math.random() - 0.5) * 16;
      pPos[i + 1] = (Math.random() - 0.5) * 16;
      pPos[i + 2] = (Math.random() - 0.5) * 10;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x9b9da2,
      size: 0.03,
      transparent: true,
      opacity: 0.45,
    });
    track(pMat);
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ── 8. Precision Lighting Setup ──
    // Directional Key Light from top-left
    const keyLight = new THREE.DirectionalLight(0xffffff, STAGES[0].keyLightIntensity);
    keyLight.position.set(5.5, 6.0, 5.0);
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    // Grazing Rim Light from bottom-right with subtle signal lime tint
    const rimLight = new THREE.DirectionalLight(0xd4ff00, STAGES[0].rimLightIntensity);
    rimLight.position.set(-6.0, -4.5, -2.5);
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    // Subtle ambient light with obsidian slate tint
    const ambientLight = new THREE.AmbientLight(0x1b1c1e, STAGES[0].ambientIntensity);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    // ── Animation Loop ──
    let isSealVisible = true;
    const animate = () => {
      if (!isSealVisible) {
        animFrameRef.current = 0;
        return;
      }
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime();

      if (!prefersReducedMotion) {
        const target = getTargetState(scrollProgressRef.current);
        const cs = currentStateRef.current;
        const lerpFactor = 0.045;

        cs.rotX = lerp(cs.rotX, target.rotX, lerpFactor);
        cs.rotY = lerp(cs.rotY, target.rotY, lerpFactor);
        cs.rotZ = lerp(cs.rotZ, target.rotZ, lerpFactor);
        cs.posX = lerp(cs.posX, target.posX, lerpFactor);
        cs.posY = lerp(cs.posY, target.posY, lerpFactor);
        cs.scale = lerp(cs.scale, target.scale, lerpFactor);
        cs.keyLightIntensity = lerp(cs.keyLightIntensity, target.keyLightIntensity, lerpFactor);
        cs.rimLightIntensity = lerp(cs.rimLightIntensity, target.rimLightIntensity, lerpFactor);
        cs.ambientIntensity = lerp(cs.ambientIntensity, target.ambientIntensity, lerpFactor);
        cs.linesAlpha = lerp(cs.linesAlpha, target.linesAlpha, lerpFactor);
        cs.ringAlpha = lerp(cs.ringAlpha, target.ringAlpha, lerpFactor);

        // Pointer responsiveness
        const pxSmooth = lerp(pointerRef.current.x, pointerNormXRef.current, 0.05);
        const pySmooth = lerp(pointerRef.current.y, pointerNormYRef.current, 0.05);
        pointerRef.current = { x: pxSmooth, y: pySmooth };

        // Subtle idle rotation and harmonic breathing
        const idleRot = elapsed * 0.12;

        if (rootGroup) {
          rootGroup.rotation.x = cs.rotX + pySmooth * 0.10;
          rootGroup.rotation.y = cs.rotY + pxSmooth * 0.12;
          rootGroup.rotation.z = cs.rotZ;
          rootGroup.position.x = cs.posX;
          rootGroup.position.y = cs.posY;
          rootGroup.scale.setScalar(cs.scale);
        }

        if (sphereMesh) {
          sphereMesh.rotation.y = idleRot;
        }

        // Rotate particles slowly
        particles.rotation.y = elapsed * 0.015;

        // Orbit satellites
        if (satellitesGroup) {
          satellitesGroup.children.forEach((child) => {
            const u = child.userData;
            const angle = u.angle + elapsed * u.speed;
            child.position.set(Math.cos(angle) * u.r, u.yOffset + Math.sin(angle * 0.5) * 0.2, Math.sin(angle) * u.r);
          });
        }

        // Update lighting and materials
        if (keyLight) keyLight.intensity = cs.keyLightIntensity;
        if (rimLight) rimLight.intensity = cs.rimLightIntensity;
        if (ambientLight) ambientLight.intensity = cs.ambientIntensity;
        linesMaterial.opacity = cs.linesAlpha;
        glowMat.opacity = cs.ringAlpha * 0.22;
      }

      renderer.render(scene, camera);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    const sealObserver = new IntersectionObserver(
      ([entry]) => {
        isSealVisible = entry.isIntersecting;
        if (isSealVisible && !animFrameRef.current) {
          animFrameRef.current = requestAnimationFrame(animate);
        }
      },
      { threshold: 0.05 }
    );
    sealObserver.observe(container);

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      const nw = container.clientWidth || 400;
      const nh = container.clientHeight || 400;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      sealObserver.disconnect();
      resizeObserver.disconnect();
      disposables.forEach((item) => {
        if ('dispose' in item) item.dispose();
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center select-none ${className}`}
      aria-hidden="true"
    >
      {webGLSupported ? (
        <canvas ref={canvasRef} className="w-full h-full block" />
      ) : (
        /* Monolithic Fallback for non-WebGL environments */
        <div className="relative w-64 h-64 flex flex-col items-center justify-center">
          {/* Vertical acoustic lines simulation */}
          <div className="absolute inset-x-0 h-48 flex items-center justify-center gap-1.5 opacity-30 pointer-events-none">
            {Array.from({ length: 19 }).map((_, i) => (
              <span
                key={i}
                className="w-px bg-white"
                style={{ height: `${Math.max(20, 100 - Math.abs(i - 9) * 9)}%` }}
              />
            ))}
          </div>
          {/* Metallic Sphere */}
          <div className="relative w-40 h-40 rounded-full border border-white/20 bg-gradient-to-b from-[#2a2a2a] via-[#101010] to-[#050505] shadow-[0_0_50px_rgba(255,255,255,0.1)] flex flex-col items-center justify-center">
            <span className="font-display font-bold text-xs tracking-[0.25em] text-[#F4F4F4]">
              VOXCHAIN
            </span>
            <span className="font-mono text-[8px] text-[#A5A5A5] tracking-widest mt-1">
              IMMUTABLE
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
