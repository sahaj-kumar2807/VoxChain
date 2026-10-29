import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface VoxIntroSplashProps {
  /** Duration in seconds to show the intro before transitioning (default: 2.6) */
  duration?: number;
  /** Callback fired when the intro animation finishes */
  onComplete?: () => void;
  /** Target text to display (default: "VOXCHAIN") */
  title?: string;
}

export const VoxIntroSplash: React.FC<VoxIntroSplashProps> = ({
  duration = 2.6,
  onComplete,
  title = 'VOXCHAIN',
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Subtle organic mouse parallax
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x: nx, y: ny });
  };

  useEffect(() => {
    // Auto dismiss after duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        setTimeout(onComplete, 450); // Allow cinematic fade
      }
    }, duration * 1000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') {
        setIsVisible(false);
        if (onComplete) onComplete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [duration, onComplete]);

  const handleSkip = () => {
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  const letters = title.split('');
  const subtitleWords = [
    { text: 'Transparent', dot: '#38BDF8' },
    { text: 'Honest', dot: '#818CF8' },
    { text: 'Tamper-proof', dot: '#10B981' },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          key="vox-intro-splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.04,
            filter: 'blur(8px)',
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#000000] text-white overflow-hidden select-none cursor-default"
          style={{ perspective: '1200px' }}
        >
          {/* Deep Space Black Nebula Glows */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.16) 0%, rgba(79, 70, 229, 0.06) 38%, transparent 68%),
                radial-gradient(circle at 50% 45%, rgba(56, 189, 248, 0.08) 0%, transparent 52%),
                radial-gradient(circle at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.95) 100%)
              `,
            }}
          />

          {/* Starfield Particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[
              { top: '18%', left: '22%', size: 'w-1.5 h-1.5', delay: 0.2, color: 'bg-[#818CF8]/70' },
              { top: '28%', right: '20%', size: 'w-1 h-1', delay: 0.5, color: 'bg-[#38BDF8]/60' },
              { bottom: '24%', left: '26%', size: 'w-1.5 h-1.5', delay: 0.8, color: 'bg-white/70' },
              { bottom: '30%', right: '24%', size: 'w-1 h-1', delay: 0.3, color: 'bg-[#818CF8]/60' },
              { top: '48%', left: '15%', size: 'w-1 h-1', delay: 0.6, color: 'bg-[#38BDF8]/50' },
              { top: '52%', right: '14%', size: 'w-1.5 h-1.5', delay: 0.4, color: 'bg-white/60' },
            ].map((star, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: star.delay }}
                className={`absolute rounded-full ${star.size} ${star.color} shadow-[0_0_8px_rgba(255,255,255,0.4)]`}
                style={{ top: star.top, left: star.left, right: star.right, bottom: star.bottom }}
              />
            ))}
          </div>

          {/* Futuristic Concentric Orbital Rings */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              transform: `rotateX(${mousePos.y * -4}deg) rotateY(${mousePos.x * 5}deg)`,
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Center Violet Halo Core */}
            <div className="w-[320px] h-[320px] sm:w-[480px] sm:h-[480px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.12)_0%,rgba(14,165,233,0.04)_45%,transparent_70%)] blur-2xl" />

            {/* Inner Orbital Ring with Glowing Nodes */}
            <motion.div
              initial={{ scale: 0.88, opacity: 0, rotate: -25 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] rounded-full border border-[#818CF8]/25"
            >
              {/* Electric Violet Arc Accent */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'conic-gradient(from 120deg, transparent 0deg, rgba(129, 140, 248, 0.4) 40deg, transparent 80deg)',
                  maskImage: 'radial-gradient(circle, transparent 69%, black 70%)',
                  WebkitMaskImage: 'radial-gradient(circle, transparent 69%, black 70%)',
                }}
              />
              {/* Orbital Satellite Node */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#818CF8] shadow-[0_0_12px_#818CF8]" />
            </motion.div>

            {/* Middle Dashed Telemetry Ring */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0, rotate: 20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 1.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="absolute w-[440px] h-[440px] sm:w-[620px] sm:h-[620px] rounded-full border border-dashed border-white/12"
            >
              <div className="absolute bottom-0 right-1/4 translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#38BDF8] shadow-[0_0_10px_#38BDF8]" />
            </motion.div>

            {/* Outer Whisper Orbit */}
            <div className="absolute w-[540px] h-[540px] sm:w-[760px] sm:h-[760px] rounded-full border border-white/[0.04]" />
          </div>

          {/* Protocol HUD Header & Telemetry */}
          <div className="absolute top-6 left-6 right-6 hidden sm:flex items-center justify-between text-[9px] font-mono tracking-[0.2em] text-zinc-500 pointer-events-none z-20">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#818CF8] shadow-[0_0_8px_#818CF8] animate-pulse" />
              <span>VOXCHAIN_PROTOCOL // EVM_SEPOLIA</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <span>CONSENSUS:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                VERIFIED
              </span>
            </div>
          </div>

          {/* Centerpiece Container */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto"
            style={{
              transform: `rotateX(${mousePos.y * -3}deg) rotateY(${mousePos.x * 4}deg) translateZ(20px)`,
              transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Top Electric Violet Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: -14, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0D0D18]/90 border border-[#818CF8]/30 mb-8 shadow-[0_0_24px_rgba(99,102,241,0.22)] backdrop-blur-md"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#818CF8] shadow-[0_0_8px_#818CF8] animate-pulse" />
              <span className="font-sans text-[10px] tracking-[0.22em] text-[#C7D2FE] uppercase font-semibold">
                SECURE DIGITAL GOVERNANCE
              </span>
            </motion.div>

            {/* Kinetic Appearing Animation for "VOXCHAIN" Title */}
            <div className="relative select-none flex items-center justify-center overflow-visible py-2">
              <motion.h1
                className="font-display font-extrabold text-5xl sm:text-7xl md:text-8xl lg:text-9xl uppercase leading-none tracking-[0.24em] flex justify-center"
                style={{
                  filter: 'drop-shadow(0 0 35px rgba(99,102,241,0.35)) drop-shadow(0 14px 28px rgba(0,0,0,0.9))',
                }}
              >
                {letters.map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{
                      opacity: 0,
                      y: 35,
                      scale: 0.82,
                      filter: 'blur(12px)',
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      filter: 'blur(0px)',
                    }}
                    transition={{
                      duration: 0.85,
                      delay: 0.2 + index * 0.065,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="inline-block relative"
                    style={{
                      background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 48%, #C7D2FE 82%, #818CF8 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.h1>
            </div>

            {/* Subtitle with Staggered Appearing Words & Colored Bullets */}
            <motion.div
              initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 sm:gap-4 font-mono text-xs sm:text-sm text-[#94A3B8] tracking-[0.2em] mt-6 font-medium uppercase"
            >
              {subtitleWords.map((item, idx) => (
                <React.Fragment key={item.text}>
                  <motion.span
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.85 + idx * 0.12 }}
                    className="hover:text-white transition-colors"
                  >
                    {item.text}
                  </motion.span>
                  {idx < subtitleWords.length - 1 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.9 + idx * 0.12 }}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: item.dot,
                        boxShadow: `0 0 8px ${item.dot}`,
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
            </motion.div>

            {/* Electric Violet to Cyan Laser Scanning Line */}
            <div className="w-44 sm:w-60 h-[1.5px] bg-white/10 mt-8 relative overflow-hidden rounded-full">
              <motion.div
                initial={{ width: '0%', left: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: duration, ease: [0.16, 1, 0.3, 1] }}
                className="h-full bg-gradient-to-r from-[#6366F1] via-[#818CF8] to-[#38BDF8] shadow-[0_0_14px_rgba(129,140,248,0.9)]"
              />
            </div>
          </motion.div>

          {/* Minimalist Skip Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="absolute bottom-6 right-6 z-30"
          >
            <button
              onClick={handleSkip}
              className="px-3.5 py-1.5 rounded-full border border-white/15 bg-[#0A0A12]/80 hover:bg-[#121220] hover:border-[#818CF8]/50 text-zinc-400 hover:text-white font-mono text-[10px] tracking-[0.16em] uppercase transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,0,0,0.8)]"
            >
              <span>Skip</span>
              <span className="text-[8px] text-[#818CF8]">[ESC]</span>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
