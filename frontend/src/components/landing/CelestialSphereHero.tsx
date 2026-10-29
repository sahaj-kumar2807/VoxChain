import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface CelestialSphereHeroProps {
  className?: string;
  scrollProgress?: number;
}

/**
 * Procedural texture generator creating a high-resolution lunar/titanium
 * planetary surface with authentic stone stippling, crater contours,
 * and bold architectural stencil typography.
 */
function createCelestialTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const w = canvas.width;
  const h = canvas.height;

  // 1. Base Slate / Lunar Titanium Gradient
  const baseGrad = ctx.createLinearGradient(0, 0, w, h);
  baseGrad.addColorStop(0, '#989ea8');
  baseGrad.addColorStop(0.35, '#b0b6c0');
  baseGrad.addColorStop(0.7, '#8f95a0');
  baseGrad.addColorStop(1, '#a2a8b3');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. Diagonal Natural Striations & Mineral Veins
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
  ctx.lineWidth = 1.5;
  for (let i = -w; i < w * 2; i += 18) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + h * 0.8, h);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(20, 24, 30, 0.05)';
  ctx.lineWidth = 2.5;
  for (let i = -w; i < w * 2; i += 42) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + h * 0.45, h);
    ctx.stroke();
  }
  ctx.restore();

  // 3. Procedural Craters and Mineral Depressions
  for (let i = 0; i < 420; i++) {
    const cx = Math.random() * w;
    const cy = Math.random() * h;
    const radius = Math.random() * 26 + 3;

    const craterGrad = ctx.createRadialGradient(
      cx - radius * 0.25,
      cy - radius * 0.25,
      radius * 0.1,
      cx,
      cy,
      radius
    );
    craterGrad.addColorStop(0, 'rgba(32, 38, 48, 0.80)');
    craterGrad.addColorStop(0.5, 'rgba(68, 76, 90, 0.45)');
    craterGrad.addColorStop(0.85, 'rgba(145, 152, 163, 0.2)');
    craterGrad.addColorStop(1, 'rgba(180, 185, 195, 0)');

    ctx.fillStyle = craterGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Raised crater rim specular highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = Math.max(1, radius * 0.08);
    ctx.beginPath();
    ctx.arc(cx - radius * 0.1, cy - radius * 0.1, radius * 0.95, Math.PI * 0.75, Math.PI * 1.6);
    ctx.stroke();
  }

  // 4. Micro Stippling Stone Grain Noise
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  const numNoise = 85000;
  for (let i = 0; i < numNoise; i++) {
    const idx = (Math.floor(Math.random() * h) * w + Math.floor(Math.random() * w)) * 4;
    const val = (Math.random() - 0.5) * 55;
    data[idx] = Math.min(255, Math.max(0, data[idx] + val));
    data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + val));
    data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + val));
  }
  ctx.putImageData(imgData, 0, 0);

  // 5. Engraved Architectural Typography (pure VOXCHAIN lettering)
  const drawStencilLabel = (centerX: number, centerY: number, text: string) => {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const spaced = text.split('').join('  ');

    // Subtle dark inset shadow
    ctx.font = '700 58px "Space Grotesk", "Inter", sans-serif';
    ctx.fillStyle = 'rgba(10, 14, 20, 0.92)';
    ctx.fillText(spaced, centerX, centerY + 2);

    // Main cutout typography in matte obsidian
    ctx.fillStyle = 'rgba(18, 22, 28, 0.98)';
    ctx.fillText(spaced, centerX, centerY);

    // Top subtle bevel highlight
    ctx.font = '700 58px "Space Grotesk", "Inter", sans-serif';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.strokeText(spaced, centerX, centerY - 1);

    ctx.restore();
  };

  drawStencilLabel(w * 0.25, h * 0.5, 'VOXCHAIN');
  drawStencilLabel(w * 0.75, h * 0.5, 'VOXCHAIN');

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}

/**
 * Creates soft circular particle glow sprite for white meteoroids and stars
 */
function createGlowSpriteTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.85)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.25)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
  }
  return new THREE.CanvasTexture(canvas);
}

export const CelestialSphereHero: React.FC<CelestialSphereHeroProps> = ({
  className = '',
  scrollProgress = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const scrollProgressRef = useRef(scrollProgress);
  useEffect(() => {
    scrollProgressRef.current = scrollProgress;
  }, [scrollProgress]);

  // Dynamic animation refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const sphereMeshRef = useRef<THREE.Mesh | null>(null);
  const rootGroupRef = useRef<THREE.Group | null>(null);

  // Interaction & rotation physics
  const pointerRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const dragRef = useRef({
    isDragging: false,
    prevX: 0,
    prevY: 0,
    velX: 0,
    velY: 0,
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    dragRef.current.isDragging = true;
    dragRef.current.prevX = e.clientX;
    dragRef.current.prevY = e.clientY;
    dragRef.current.velX = 0;
    dragRef.current.velY = 0;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragRef.current.isDragging && rootGroupRef.current) {
      const deltaX = e.clientX - dragRef.current.prevX;
      const deltaY = e.clientY - dragRef.current.prevY;
      dragRef.current.velX = deltaX * 0.006;
      dragRef.current.velY = deltaY * 0.006;
      dragRef.current.prevX = e.clientX;
      dragRef.current.prevY = e.clientY;

      rootGroupRef.current.rotation.y += dragRef.current.velX;
      rootGroupRef.current.rotation.x = Math.max(
        -0.8,
        Math.min(0.8, rootGroupRef.current.rotation.x + dragRef.current.velY)
      );
    } else {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        pointerRef.current.targetX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointerRef.current.targetY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    dragRef.current.isDragging = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 700;

    // ── 1. Scene, Camera & WebGL Renderer ──
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0, 9.4);

    let renderer: THREE.WebGLRenderer;
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
      renderer.toneMappingExposure = 1.25;
    } catch (e) {
      console.error('WebGL init error:', e);
      return;
    }

    const disposables: (THREE.BufferGeometry | THREE.Material | THREE.Texture)[] = [];
    const track = <T extends THREE.BufferGeometry | THREE.Material | THREE.Texture>(item: T): T => {
      disposables.push(item);
      return item;
    };

    // Master Group for 3D sphere system
    const rootGroup = new THREE.Group();
    rootGroup.rotation.x = 0.12;
    rootGroup.rotation.y = -0.22;
    scene.add(rootGroup);
    rootGroupRef.current = rootGroup;

    // Position sphere on right half on desktop, centered on mobile
    const updateSpherePosition = (aspect: number) => {
      if (aspect >= 1.05) {
        rootGroup.position.x = Math.min(3.7, Math.max(2.5, aspect * 1.6));
        rootGroup.position.y = 0.05;
        rootGroup.scale.setScalar(1.0);
      } else {
        rootGroup.position.x = 0;
        rootGroup.position.y = -1.6;
        rootGroup.scale.setScalar(0.82);
      }
    };
    updateSpherePosition(width / height);

    // ── 2. The 3D Sphere Ball (Celestial Monolith / Planet) ──
    const sphereTex = track(createCelestialTexture());
    const sphereGeo = track(new THREE.SphereGeometry(2.15, 64, 64));
    const sphereMat = track(
      new THREE.MeshStandardMaterial({
        map: sphereTex,
        bumpMap: sphereTex,
        bumpScale: 0.035,
        metalness: 0.22,
        roughness: 0.62,
      })
    );

    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    rootGroup.add(sphereMesh);
    sphereMeshRef.current = sphereMesh;

    // ── 3. Evolving White Meteoroids: Orbiting Moonlets ──
    const glowTex = track(createGlowSpriteTexture());
    const orbitingGroup = new THREE.Group();
    rootGroup.add(orbitingGroup);

    interface OrbitNode {
      mesh: THREE.Mesh;
      sprite: THREE.Sprite;
      r: number;
      speed: number;
      angle: number;
      yOffset: number;
      tiltX: number;
      tiltZ: number;
    }

    const orbitConfigs = [
      { r: 2.18, size: 0.11, speed: 0.45, yOffset: 1.90, tiltX: 0.1, tiltZ: 0.05 },
      { r: 2.24, size: 0.09, speed: -0.38, yOffset: 1.65, tiltX: -0.15, tiltZ: 0.2 },
      { r: 2.75, size: 0.08, speed: 0.65, yOffset: 0.4, tiltX: 0.35, tiltZ: -0.3 },
      { r: 2.95, size: 0.07, speed: -0.52, yOffset: -0.9, tiltX: -0.25, tiltZ: 0.4 },
      { r: 3.4, size: 0.06, speed: 0.32, yOffset: -0.2, tiltX: 0.5, tiltZ: 0.1 },
    ];

    const orbitNodes: OrbitNode[] = orbitConfigs.map((cfg, idx) => {
      const orbGeo = track(new THREE.SphereGeometry(cfg.size, 32, 32));
      const orbMat = track(
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0xffffff,
          emissiveIntensity: 0.95,
          roughness: 0.1,
          metalness: 0.1,
        })
      );
      const orbMesh = new THREE.Mesh(orbGeo, orbMat);

      const spriteMat = track(
        new THREE.SpriteMaterial({
          map: glowTex,
          color: 0xffffff,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
        })
      );
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(cfg.size * 5, cfg.size * 5, 1);
      orbMesh.add(sprite);

      orbitingGroup.add(orbMesh);

      return {
        mesh: orbMesh,
        sprite,
        r: cfg.r,
        speed: cfg.speed,
        angle: (idx * Math.PI * 2) / orbitConfigs.length,
        yOffset: cfg.yOffset,
        tiltX: cfg.tiltX,
        tiltZ: cfg.tiltZ,
      };
    });

    // ── 4. Evolving White Meteoroids: Dynamic Streaking Comets Spanning Full Screen ──
    const MAX_STREAKS = 22;
    interface MeteorStreak {
      active: boolean;
      headPos: THREE.Vector3;
      velocity: THREE.Vector3;
      length: number;
      life: number;
      maxLife: number;
      line: THREE.Line;
      geo: THREE.BufferGeometry;
      headMesh: THREE.Mesh;
    }

    const streaksGroup = new THREE.Group();
    scene.add(streaksGroup);

    const streakList: MeteorStreak[] = [];

    const streakHeadGeo = track(new THREE.SphereGeometry(0.045, 16, 16));
    const streakHeadMat = track(
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );

    for (let i = 0; i < MAX_STREAKS; i++) {
      const geo = track(new THREE.BufferGeometry());
      const positions = new Float32Array([0, 0, 0, 0, 0, 0]);
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const lineMat = track(
        new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.75,
          linewidth: 2,
        })
      );
      const line = new THREE.Line(geo, lineMat);

      const headMesh = new THREE.Mesh(streakHeadGeo, streakHeadMat);
      streaksGroup.add(line);
      streaksGroup.add(headMesh);

      streakList.push({
        active: false,
        headPos: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        length: 1.2,
        life: 0,
        maxLife: 1,
        line,
        geo,
        headMesh,
      });
    }

    const spawnStreak = () => {
      const streak = streakList.find((s) => !s.active);
      if (!streak) return;

      streak.active = true;
      streak.life = 0;
      streak.maxLife = 1.2 + Math.random() * 1.0;
      streak.length = 1.0 + Math.random() * 1.6;

      // Spawn across the full wide background (from -18 to +18)
      const startX = (Math.random() - 0.5) * 36;
      const startY = 7.0 + Math.random() * 3.0;
      const startZ = (Math.random() - 0.5) * 6.0;
      streak.headPos.set(startX, startY, startZ);

      const speed = 6.0 + Math.random() * 3.5;
      streak.velocity.set(
        (Math.random() - 0.5) * 0.8,
        -speed,
        (Math.random() - 0.5) * 0.4
      );

      streak.line.visible = true;
      streak.headMesh.visible = true;
    };

    for (let i = 0; i < 5; i++) {
      setTimeout(() => spawnStreak(), i * 250);
    }

    let spawnTimer = 0;
    const updateStreaks = (delta: number) => {
      spawnTimer += delta;
      if (spawnTimer > 0.38) {
        spawnTimer = 0;
        if (Math.random() > 0.25) {
          spawnStreak();
        }
      }

      streakList.forEach((streak) => {
        if (!streak.active) {
          streak.line.visible = false;
          streak.headMesh.visible = false;
          return;
        }

        streak.life += delta;
        if (streak.life >= streak.maxLife || streak.headPos.y < -6.5) {
          streak.active = false;
          streak.line.visible = false;
          streak.headMesh.visible = false;
          return;
        }

        streak.headPos.addScaledVector(streak.velocity, delta);
        streak.headMesh.position.copy(streak.headPos);

        const tailPos = streak.headPos
          .clone()
          .sub(streak.velocity.clone().normalize().multiplyScalar(streak.length));

        const positions = streak.geo.attributes.position.array as Float32Array;
        positions[0] = streak.headPos.x;
        positions[1] = streak.headPos.y;
        positions[2] = streak.headPos.z;
        positions[3] = tailPos.x;
        positions[4] = tailPos.y;
        positions[5] = tailPos.z;
        streak.geo.attributes.position.needsUpdate = true;

        const progress = streak.life / streak.maxLife;
        const opacity = Math.sin(progress * Math.PI) * 0.85;
        (streak.line.material as THREE.LineBasicMaterial).opacity = opacity;
      });
    };

    // ── 5. Full-Background Cosmic Star Dust & Stardust Swarm ──
    // Spreads across the entire viewport width and height to merge completely with the background
    const starCount = 1400;
    const starGeo = track(new THREE.BufferGeometry());
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 44;     // Full wide screen span
      starPos[i + 1] = (Math.random() - 0.5) * 26; // Full height span
      starPos[i + 2] = (Math.random() - 0.5) * 14 - 1.0;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = track(
      new THREE.PointsMaterial({
        map: glowTex,
        color: 0xffffff,
        size: 0.075,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // ── 6. Directional Lighting Setup ──
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(8.5, 6.0, 5.0);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.2);
    rimLight.position.set(-8.0, -3.5, -2.5);
    scene.add(rimLight);

    const ambientLight = new THREE.AmbientLight(0x22262e, 0.7);
    scene.add(ambientLight);

    // Passive scroll tracking inside Three.js loop to avoid re-rendering React
    let targetScroll = 0;
    const onScroll = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      targetScroll = docH > 0 ? window.scrollY / docH : 0;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ── 7. Reusable math objects (zero allocations per frame) ──
    const tempPos = new THREE.Vector3();
    const axisX = new THREE.Vector3(1, 0, 0);
    const axisZ = new THREE.Vector3(0, 0, 1);

    const clock = new THREE.Clock();
    let animId = 0;
    let isVisible = true;

    const animate = () => {
      if (!isVisible) {
        animId = 0;
        return;
      }
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth pointer parallax
      pointerRef.current.x += (pointerRef.current.targetX - pointerRef.current.x) * 0.045;
      pointerRef.current.y += (pointerRef.current.targetY - pointerRef.current.y) * 0.045;

      // Smooth scroll lerp
      scrollProgressRef.current = THREE.MathUtils.lerp(scrollProgressRef.current, targetScroll, 0.08);
      const sp = scrollProgressRef.current;

      // Inertial damping after dragging
      if (!dragRef.current.isDragging) {
        dragRef.current.velX *= 0.92;
        dragRef.current.velY *= 0.92;
        rootGroup.rotation.y += dragRef.current.velX;
        rootGroup.rotation.x += dragRef.current.velY;

        // Continuous subtle axial spin + dynamic scroll rotation
        sphereMesh.rotation.y += delta * 0.16 + sp * 0.05;

        // Gentle breathing tilt tracking pointer + scroll storytelling progression
        const targetRotX = 0.12 - pointerRef.current.y * 0.18 + sp * 0.45;
        const targetRotZ = pointerRef.current.x * 0.08 - sp * 0.35;
        rootGroup.rotation.x = THREE.MathUtils.lerp(rootGroup.rotation.x, targetRotX, 0.04);
        rootGroup.rotation.z = THREE.MathUtils.lerp(rootGroup.rotation.z, targetRotZ, 0.04);
      }

      // Update Orbiting White Meteoroid Nodes (zero garbage collection allocations)
      orbitNodes.forEach((node) => {
        node.angle += delta * node.speed;
        const x = Math.cos(node.angle) * node.r;
        const z = Math.sin(node.angle) * node.r;
        const y = node.yOffset + Math.sin(node.angle * 1.5) * 0.18;

        tempPos.set(x, y, z);
        tempPos.applyAxisAngle(axisX, node.tiltX);
        tempPos.applyAxisAngle(axisZ, node.tiltZ);

        node.mesh.position.copy(tempPos);

        const pulse = 1.0 + Math.sin(elapsed * 4.0 + node.angle) * 0.2;
        node.sprite.scale.set(0.55 * pulse, 0.55 * pulse, 1);
      });

      // Update Streaking Meteoroids
      updateStreaks(delta);

      // Star dust slow axial drift + deep vertical scroll parallax
      starField.position.y = -sp * 5.2;
      starField.rotation.y = elapsed * 0.015 + sp * 0.35;

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // Pause rendering when hero is scrolled out of viewport
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animId) {
          clock.getDelta();
          animId = requestAnimationFrame(animate);
        }
      },
      { threshold: 0.02 }
    );
    intersectionObserver.observe(container);

    // Resize Observer to keep layout responsive
    const resizeObserver = new ResizeObserver(() => {
      const nw = container.clientWidth || window.innerWidth;
      const nh = container.clientHeight || 700;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
      updateSpherePosition(nw / nh);
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', onScroll);
      intersectionObserver.disconnect();
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
      className={`relative w-full h-full select-none bg-transparent ${className}`}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-full block cursor-grab active:cursor-grabbing touch-none bg-transparent"
      />
    </div>
  );
};
