import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface HeroBallotSealCanvasProps {
  className?: string;
}

export const HeroBallotSealCanvas: React.FC<HeroBallotSealCanvasProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webGLSupported, setWebGLSupported] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Check WebGL availability
    try {
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) {
        setWebGLSupported(false);
        return;
      }
    } catch {
      setWebGLSupported(false);
      return;
    }

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Dimensions
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50);
    camera.position.set(0, 0, 8.2);

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
    } catch {
      setWebGLSupported(false);
      return;
    }

    // SCENE GRAPH — SCULPTURAL BALLOT SEAL
    const rootGroup = new THREE.Group();
    // Default architectural angle
    rootGroup.rotation.x = 0.38;
    rootGroup.rotation.y = -0.32;
    scene.add(rootGroup);

    // Track all disposable resources for clean teardown
    const disposables: { geometry?: THREE.BufferGeometry; material?: THREE.Material }[] = [];

    const trackDisposable = (geo?: THREE.BufferGeometry, mat?: THREE.Material) => {
      disposables.push({ geometry: geo, material: mat });
    };

    // Shared Palette Materials
    // 1. Dark Anodized Gunmetal (Outer Chassis)
    const gunmetalMat = new THREE.MeshStandardMaterial({
      color: 0x141414,
      metalness: 0.88,
      roughness: 0.32,
    });
    trackDisposable(undefined, gunmetalMat);

    // 2. Razor Silver Edge (Polished Chamfer Highlight)
    const silverEdgeMat = new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      metalness: 0.98,
      roughness: 0.12,
    });
    trackDisposable(undefined, silverEdgeMat);

    // 3. Matte Black Ceramic (Stepped Layer & Basin)
    const matteCeramicMat = new THREE.MeshStandardMaterial({
      color: 0x090909,
      metalness: 0.18,
      roughness: 0.78,
    });
    trackDisposable(undefined, matteCeramicMat);

    // 4. Fine Grooves & Inset Markings
    const grooveMat = new THREE.MeshStandardMaterial({
      color: 0x040404,
      metalness: 0.5,
      roughness: 0.6,
    });
    trackDisposable(undefined, grooveMat);

    // 5. Polished Silver Indicator Jewel
    const silverJewelMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xd8d8d8,
      emissiveIntensity: 1.5,
      roughness: 0.10,
      metalness: 0.95,
    });
    trackDisposable(undefined, silverJewelMat);

    // 6. Deep Cavity Void
    const voidMat = new THREE.MeshBasicMaterial({
      color: 0x020202,
    });
    trackDisposable(undefined, voidMat);

    // GEOMETRY 1: Heavy Stepped Outer Bezel Ring
    const outerBezelGeo = new THREE.CylinderGeometry(2.45, 2.52, 0.35, 72);
    trackDisposable(outerBezelGeo);
    const outerBezel = new THREE.Mesh(outerBezelGeo, gunmetalMat);
    outerBezel.rotation.x = Math.PI / 2;
    rootGroup.add(outerBezel);

    // GEOMETRY 2: Razor-Thin Polished Silver Chamfer Ring (Catches key-light glint)
    const silverRimGeo = new THREE.TorusGeometry(2.46, 0.024, 16, 72);
    trackDisposable(silverRimGeo);
    const silverRim = new THREE.Mesh(silverRimGeo, silverEdgeMat);
    silverRim.position.z = 0.18;
    rootGroup.add(silverRim);

    // GEOMETRY 3: Secondary Stepped Collar
    const collarGeo = new THREE.CylinderGeometry(2.26, 2.32, 0.38, 72);
    trackDisposable(collarGeo);
    const collar = new THREE.Mesh(collarGeo, matteCeramicMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.z = 0.04;
    rootGroup.add(collar);

    // GEOMETRY 4: Outer Trench Groove
    const trenchGeo = new THREE.TorusGeometry(2.24, 0.02, 16, 72);
    trackDisposable(trenchGeo);
    const trench = new THREE.Mesh(trenchGeo, grooveMat);
    trench.position.z = 0.24;
    rootGroup.add(trench);

    // GEOMETRY 5: Radial Coordinate Index Ticks (36 precision machined tick marks)
    const ticksGroup = new THREE.Group();
    ticksGroup.position.z = 0.24;
    rootGroup.add(ticksGroup);

    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2;
      const isCardinal = i % 9 === 0;
      const tickLength = isCardinal ? 0.18 : 0.09;
      const tickWidth = isCardinal ? 0.024 : 0.012;
      const tickGeo = new THREE.PlaneGeometry(tickWidth, tickLength);
      trackDisposable(tickGeo);
      const tickMesh = new THREE.Mesh(tickGeo, isCardinal ? silverEdgeMat : grooveMat);
      const radius = 2.1;
      tickMesh.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0.01);
      tickMesh.rotation.z = angle + Math.PI / 2;
      ticksGroup.add(tickMesh);
    }

    // GEOMETRY 6: Intermediate Concentric Grooved Disc
    const midDiscGeo = new THREE.CylinderGeometry(1.94, 1.98, 0.32, 64);
    trackDisposable(midDiscGeo);
    const midDisc = new THREE.Mesh(midDiscGeo, gunmetalMat);
    midDisc.rotation.x = Math.PI / 2;
    midDisc.position.z = 0.1;
    rootGroup.add(midDisc);

    // Concentric Machined Line Micro-Grooves
    const groove1Geo = new THREE.TorusGeometry(1.82, 0.012, 16, 64);
    trackDisposable(groove1Geo);
    const groove1 = new THREE.Mesh(groove1Geo, silverEdgeMat);
    groove1.position.z = 0.27;
    rootGroup.add(groove1);

    const groove2Geo = new THREE.TorusGeometry(1.64, 0.01, 16, 64);
    trackDisposable(groove2Geo);
    const groove2 = new THREE.Mesh(groove2Geo, grooveMat);
    groove2.position.z = 0.27;
    rootGroup.add(groove2);

    // GEOMETRY 7: Recessed Central Ballot Basin
    const basinGeo = new THREE.CylinderGeometry(1.42, 1.44, 0.2, 64);
    trackDisposable(basinGeo);
    const basin = new THREE.Mesh(basinGeo, matteCeramicMat);
    basin.rotation.x = Math.PI / 2;
    basin.position.z = 0.18;
    rootGroup.add(basin);

    // Central Basin Inner Edge Ring
    const basinRimGeo = new THREE.TorusGeometry(1.42, 0.018, 16, 64);
    trackDisposable(basinRimGeo);
    const basinRim = new THREE.Mesh(basinRimGeo, silverEdgeMat);
    basinRim.position.z = 0.29;
    rootGroup.add(basinRim);

    // GEOMETRY 8: Central Raised Architectural Ballot Chamber
    const chamberGeo = new THREE.BoxGeometry(1.15, 0.78, 0.12);
    trackDisposable(chamberGeo);
    const chamber = new THREE.Mesh(chamberGeo, gunmetalMat);
    chamber.position.z = 0.32;
    rootGroup.add(chamber);

    // Recessed Ballot Insertion Aperture (The physical voting slot)
    const slotCavityGeo = new THREE.BoxGeometry(0.72, 0.09, 0.14);
    trackDisposable(slotCavityGeo);
    const slotCavity = new THREE.Mesh(slotCavityGeo, voidMat);
    slotCavity.position.set(0, 0.14, 0.34);
    rootGroup.add(slotCavity);

    // Fine Silver Frame around slot
    const slotFrameGeo = new THREE.BoxGeometry(0.78, 0.02, 0.12);
    trackDisposable(slotFrameGeo);
    const slotFrameTop = new THREE.Mesh(slotFrameGeo, silverEdgeMat);
    slotFrameTop.position.set(0, 0.2, 0.34);
    rootGroup.add(slotFrameTop);

    const slotFrameBottom = new THREE.Mesh(slotFrameGeo, silverEdgeMat);
    slotFrameBottom.position.set(0, 0.08, 0.34);
    rootGroup.add(slotFrameBottom);

    // Architectural Monochromatic Ballot Check Mark (Engraved below slot)
    const checkStem1Geo = new THREE.BoxGeometry(0.04, 0.16, 0.04);
    trackDisposable(checkStem1Geo);
    const checkStem1 = new THREE.Mesh(checkStem1Geo, silverEdgeMat);
    checkStem1.position.set(-0.06, -0.15, 0.36);
    checkStem1.rotation.z = -Math.PI / 4;
    rootGroup.add(checkStem1);

    const checkStem2Geo = new THREE.BoxGeometry(0.04, 0.3, 0.04);
    trackDisposable(checkStem2Geo);
    const checkStem2 = new THREE.Mesh(checkStem2Geo, silverEdgeMat);
    checkStem2.position.set(0.08, -0.11, 0.36);
    checkStem2.rotation.z = Math.PI / 4;
    rootGroup.add(checkStem2);

    // GEOMETRY 9: Single Focal Silver Status Jewel LED
    const jewelGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.06, 24);
    trackDisposable(jewelGeo);
    const jewel = new THREE.Mesh(jewelGeo, silverJewelMat);
    jewel.rotation.x = Math.PI / 2;
    // Positioned as a focal indicator on the upper-right machined collar
    jewel.position.set(1.48, 1.48, 0.26);
    rootGroup.add(jewel);

    // Jewel Bezel Ring
    const jewelBezelGeo = new THREE.TorusGeometry(0.075, 0.016, 16, 24);
    trackDisposable(jewelBezelGeo);
    const jewelBezel = new THREE.Mesh(jewelBezelGeo, silverEdgeMat);
    jewelBezel.position.set(1.48, 1.48, 0.28);
    rootGroup.add(jewelBezel);

    // Localized Jewel Point Light (delicate silver glow on surrounding metal only)
    const jewelLight = new THREE.PointLight(0xffffff, 0.65, 1.6);
    jewelLight.position.set(1.48, 1.48, 0.36);
    rootGroup.add(jewelLight);

    // LIGHTING SETUP
    // Key Light: High directional light from top-left creating crisp specular glints on metallic bevels
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.65);
    keyLight.position.set(4.5, 6.0, 5.0);
    scene.add(keyLight);

    // Secondary Grazing Rim Light: Bottom-right to accentuate the cylindrical silhouette
    const rimLight = new THREE.DirectionalLight(0x708090, 0.85);
    rimLight.position.set(-5.0, -4.5, -2.5);
    scene.add(rimLight);

    // Subtle Ambient Fill: Preserves deep black contrast while revealing matte textures
    const ambientLight = new THREE.AmbientLight(0x0e0e0e, 0.6);
    scene.add(ambientLight);

    // DAMPED POINTER INTERACTION & ANIMATION LOOP
    const baseRotX = 0.38;
    const baseRotY = -0.32;
    const targetRotation = { x: baseRotX, y: baseRotY };
    const currentRotation = { x: baseRotX, y: baseRotY };

    let isHovering = false;
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const handlePointerMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return;
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = ((e.clientY - rect.top) / rect.height) * 2 - 1;

      // Restrained max tilt (±0.18 rads = ~10 degrees)
      targetRotation.y = baseRotY + normX * 0.22;
      targetRotation.x = baseRotX - normY * 0.2;
    };

    const handleMouseEnter = () => {
      isHovering = true;
    };

    const handleMouseLeave = () => {
      isHovering = false;
      targetRotation.x = baseRotX;
      targetRotation.y = baseRotY;
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    // Render loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Smooth exponential damping (lerp)
        currentRotation.x += (targetRotation.x - currentRotation.x) * 0.055;
        currentRotation.y += (targetRotation.y - currentRotation.y) * 0.055;

        // Subtle slow harmonic breathing
        const idleX = Math.sin(elapsedTime * 0.7) * 0.02;
        const idleY = Math.cos(elapsedTime * 0.5) * 0.02;

        rootGroup.rotation.x = currentRotation.x + idleX;
        rootGroup.rotation.y = currentRotation.y + idleY;
        rootGroup.rotation.z = Math.sin(elapsedTime * 0.3) * 0.015;

        // Subtle jewel indicator pulse
        jewelLight.intensity = 0.55 + Math.sin(elapsedTime * 2.5) * 0.15;
      }

      if (renderer) {
        renderer.render(scene, camera);
      }
    };

    animate();
    setIsLoaded(true);

    // Responsive Resize Handler
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newWidth, height: newHeight } = entry.contentRect;
        if (newWidth > 0 && newHeight > 0 && renderer) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        }
      }
    });
    resizeObserver.observe(container);

    // Context loss handling
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(animationFrameId);
    };

    const handleContextRestored = () => {
      animate();
    };

    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

    // CLEANUP
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      resizeObserver.disconnect();

      // Dispose all tracked geometries and materials
      disposables.forEach((item) => {
        item.geometry?.dispose();
        item.material?.dispose();
      });

      keyLight.dispose?.();
      rimLight.dispose?.();
      ambientLight.dispose?.();
      jewelLight.dispose?.();

      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center overflow-hidden select-none ${className}`}
      aria-label="3D Sculptural Ballot Seal Visualization"
      role="img"
    >
      {/* Background radial depth glow (strictly restrained to focal center) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(216,255,112,0.04)_0%,transparent_65%)] pointer-events-none" />

      {/* WebGL Canvas */}
      {webGLSupported ? (
        <canvas
          ref={canvasRef}
          className={`w-full h-full block transition-opacity duration-700 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : (
        /* Architectural High-Precision CSS/SVG Fallback when WebGL is unavailable */
        <div className="relative w-56 h-56 rounded-full border border-white/20 bg-[#0D0D0D] flex items-center justify-center shadow-2xl">
          <div className="w-44 h-44 rounded-full border border-white/30 bg-[#121212] flex items-center justify-center relative">
            <div className="w-32 h-32 rounded-full border border-white/10 bg-[#050505] flex flex-col items-center justify-center">
              <div className="w-12 h-1.5 bg-[#FFFFFF] rounded-full mb-3 shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
              <div className="w-8 h-8 rounded border border-white/30 flex items-center justify-center text-xs text-[#FFFFFF] font-mono">
                ✓
              </div>
              <span className="text-[8px] font-mono tracking-widest text-[#A1A1A1] mt-2 uppercase">
                SEALED
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
