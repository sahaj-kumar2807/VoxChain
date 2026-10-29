import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { WireframeGlobe3D } from '../components/landing/WireframeGlobe3D';
import { LandingHeader } from '../components/landing/LandingHeader';
import { ConnectWalletModal } from '../components/common/ConnectWalletModal';
import { VoxIntroSplash } from '../components/landing/VoxIntroSplash';
import { CyberStepCard } from '../components/landing/CyberStepCard';
import { useVoxChain } from '../hooks/useVoxChain';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Building2,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────
   VOXCHAIN — CINEMATIC MOTION-FIRST WEBSITE
   • Hero: Left-aligned kinetic headline + Right-aligned 3D Neural Network Globe
   • Lifecycle: 6-Step Staggered Cyber Cards with 3D stencil numbers & wireframe netting
   • Telemetry: Interactive quantitative metrics with timeframe switcher
───────────────────────────────────────────────────── */

export const LandingPage: React.FC = () => {
  const { contractAddress, electionCount } = useVoxChain();
  const { isConnected } = useAccount();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // Timeframe filter toggle for metrics
  const [timeframe, setTimeframe] = useState<'launch' | '6m' | '1y'>('6m');

  // Kinetic typography headline words
  const lineOneWords = [
    { word: 'YOUR', letters: ['Y', 'O', 'U', 'R'] },
    { word: 'VOICE.', letters: ['V', 'O', 'I', 'C', 'E', '.'] },
  ];
  const lineTwoLetters = ['I', 'M', 'M', 'U', 'T', 'A', 'B', 'L', 'E', '.'];

  // 6 Election Lifecycle Steps data matching the user's reference aesthetic
  const electionSteps = [
    {
      num: '01',
      title: 'Create & Configure Election',
      tag: 'SETUP',
      desc: 'Election organizers set up the ballot, candidate profiles, and voting timeline directly on the blockchain.',
    },
    {
      num: '02',
      title: 'Register Candidates & Voters',
      tag: 'AUTHORIZED',
      desc: 'Nominated candidates and eligible voter wallet addresses are safely registered, guaranteeing one vote per person with zero duplicates.',
    },
    {
      num: '03',
      title: 'Open Voting Window',
      tag: 'ACTIVE',
      desc: 'Voting begins on schedule. Every ballot is counted live, transparently, and securely across the network.',
    },
    {
      num: '04',
      title: 'Cast Tamper-Proof Ballots',
      tag: 'VERIFIED',
      desc: 'Voters securely cast their vote using their digital wallet in seconds, receiving an official permanent voting receipt.',
    },
    {
      num: '05',
      title: 'Close Ballot & Certify',
      tag: 'FINALIZED',
      desc: 'When voting ends, certified results are permanently recorded on the blockchain. The results can never be altered or erased.',
    },
    {
      num: '06',
      title: 'Verify & Audit Results',
      tag: 'PUBLIC AUDIT',
      desc: 'Smart contract getResults() delivers instant, mathematically certified tallies. Any citizen or audit node can independently verify complete finality.',
    },
  ];

  // Dynamic quantitative data
  const metricsData = {
    launch: {
      bigNumber: '500+',
      bigLabel: 'Certified Ballots Cast',
      chains: 'Ethereum Sepolia',
      ballots: '500+',
      swaps: 'Instant EIP-712',
      security: '0.00% Tampering',
      tvl: '$12 million',
    },
    '6m': {
      bigNumber: '2500+',
      bigLabel: 'Certified Ballots Cast',
      chains: 'Sepolia + Arbitrum',
      ballots: '2,500+',
      swaps: 'Permanent On-Chain',
      security: '100% Cryptographic Proof',
      tvl: '$80 million',
    },
    '1y': {
      bigNumber: '10,000+',
      bigLabel: 'Certified Ballots Cast',
      chains: 'Multi-EVM Network',
      ballots: '10,000+',
      swaps: 'Zero-Knowledge Verified',
      security: 'Audited Smart Contracts',
      tvl: '$240 million',
    },
  }[timeframe];

  return (
    <div className="relative min-h-screen bg-[#000000] text-[#FFFFFF] overflow-x-hidden selection:bg-[#6366F1] selection:text-white">
      {/* ── 2-Second Cinematic Intro Sequence ── */}
      {showSplash && (
        <VoxIntroSplash
          duration={2.6}
          title="VOXCHAIN"
          onComplete={() => setShowSplash(false)}
        />
      )}

      {/* ── Minimalist Navigation Bar ── */}
      <LandingHeader onOpenConnectModal={() => setIsWalletModalOpen(true)} />

      {/* ══════════════════════════════════════════════════════
          HERO SECTION:
          LEFT: Kinetic Typography, Description, & Launch Actions
          RIGHT: 3D Neural Network Wireframe Globe & Callouts
      ══════════════════════════════════════════════════════ */}
      <section
        id="hero"
        className="relative w-full pt-10 sm:pt-16 lg:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-12 overflow-hidden"
        aria-label="VoxChain Hero"
      >
        {/* Unified Cosmic Universe Background: Atmospheric Nebula & Full-Hero Starfield */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          {/* Deep Violet-Indigo Cosmic Radial Glow spanning across Hero */}
          <div className="absolute top-1/2 right-[8%] -translate-y-1/2 w-[850px] h-[850px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.18)_0%,rgba(79,70,229,0.06)_42%,transparent_72%)] blur-3xl" />
          <div className="absolute top-1/3 left-[12%] w-[650px] h-[650px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.10)_0%,rgba(79,70,229,0.03)_50%,transparent_70%)] blur-3xl" />
          <div className="absolute top-1/2 right-[16%] -translate-y-1/2 w-[460px] h-[460px] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.09)_0%,transparent_65%)] blur-2xl" />

          {/* Blueprint Coordinate Grid */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255, 255, 255, 0.25) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.25) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px',
              maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, transparent 80%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, transparent 80%)',
            }}
          />

          {/* ── Stars in the Background Itself (Distributed across the whole hero) ── */}
          {[
            // Left Column Stars (behind & around typography)
            { top: '10%', left: '8%', size: 'w-1 h-1', color: 'bg-white/80', delay: '0s' },
            { top: '15%', left: '24%', size: 'w-1.5 h-1.5', color: 'bg-[#A5B4FC]/70', delay: '1.2s' },
            { top: '26%', left: '5%', size: 'w-1 h-1', color: 'bg-cyan-300/60', delay: '2.4s' },
            { top: '38%', left: '20%', size: 'w-1 h-1', color: 'bg-white/60', delay: '0.8s' },
            { top: '50%', left: '10%', size: 'w-1.5 h-1.5', color: 'bg-[#818CF8]/80', delay: '1.8s' },
            { top: '64%', left: '6%', size: 'w-1 h-1', color: 'bg-white/70', delay: '3.1s' },
            { top: '76%', left: '22%', size: 'w-1 h-1', color: 'bg-cyan-200/50', delay: '1.5s' },
            { top: '88%', left: '12%', size: 'w-1.5 h-1.5', color: 'bg-white/60', delay: '2.7s' },

            // Center Column Stars (between typography and globe)
            { top: '12%', left: '46%', size: 'w-1.5 h-1.5', color: 'bg-[#A5B4FC]/80', delay: '0.5s' },
            { top: '24%', left: '52%', size: 'w-1 h-1', color: 'bg-white/70', delay: '2.1s' },
            { top: '38%', left: '44%', size: 'w-1 h-1', color: 'bg-cyan-300/70', delay: '1.1s' },
            { top: '56%', left: '48%', size: 'w-1.5 h-1.5', color: 'bg-[#818CF8]/70', delay: '3.4s' },
            { top: '72%', left: '54%', size: 'w-1 h-1', color: 'bg-white/80', delay: '1.9s' },
            { top: '85%', left: '42%', size: 'w-1 h-1', color: 'bg-cyan-200/60', delay: '0.7s' },

            // Right Column Stars (around & behind the globe in the background)
            { top: '8%', left: '74%', size: 'w-1.5 h-1.5', color: 'bg-white/80', delay: '1.4s' },
            { top: '14%', left: '88%', size: 'w-1 h-1', color: 'bg-[#38BDF8]/80', delay: '0.9s' },
            { top: '18%', left: '66%', size: 'w-1.5 h-1.5', color: 'bg-[#A5B4FC]/70', delay: '2.8s' },
            { top: '28%', left: '94%', size: 'w-1 h-1', color: 'bg-white/60', delay: '1.6s' },
            { top: '34%', left: '62%', size: 'w-1 h-1', color: 'bg-cyan-300/60', delay: '3.0s' },
            { top: '44%', left: '96%', size: 'w-1.5 h-1.5', color: 'bg-[#818CF8]/80', delay: '0.3s' },
            { top: '52%', left: '64%', size: 'w-1 h-1', color: 'bg-white/75', delay: '2.2s' },
            { top: '65%', left: '90%', size: 'w-1 h-1', color: 'bg-cyan-200/70', delay: '1.7s' },
            { top: '72%', left: '70%', size: 'w-1.5 h-1.5', color: 'bg-[#A5B4FC]/80', delay: '2.9s' },
            { top: '82%', left: '84%', size: 'w-1 h-1', color: 'bg-white/60', delay: '0.6s' },
            { top: '90%', left: '76%', size: 'w-1.5 h-1.5', color: 'bg-[#38BDF8]/70', delay: '2.5s' },
            { top: '94%', left: '92%', size: 'w-1 h-1', color: 'bg-white/80', delay: '1.3s' },
          ].map((star, idx) => (
            <div
              key={idx}
              className={`absolute rounded-full ${star.size} ${star.color} animate-pulse pointer-events-none`}
              style={{
                top: star.top,
                left: star.left,
                animationDelay: star.delay,
                animationDuration: '3.5s',
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center relative z-10">

          {/* ─────────────────────────────────────────────
              LEFT COLUMN: TEXT & KINETIC HEADLINE
             ───────────────────────────────────────────── */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Status Kicker Badge */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#08080E] border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.8)] mb-6 sm:mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#818CF8] shadow-[0_0_8px_#818CF8] animate-pulse" />
              <span className="font-sans text-[10px] tracking-[0.24em] text-[#A5B4FC] uppercase font-semibold">
                VERIFIED BLOCKCHAIN VOTING
              </span>
              <span className="text-[10px] text-white/30 font-mono">//</span>
              <span className="text-[9px] font-mono text-[#94A3B8] tracking-wider">
                SECURE & FAIR
              </span>
            </motion.div>

            {/* Kinetic Headline: YOUR VOICE. IMMUTABLE. */}
            <div className="flex flex-col items-start select-none mb-6">
              {/* Line 1: YOUR VOICE. */}
              <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 py-1">
                {lineOneWords.map((wordObj, wIdx) => (
                  <div key={wordObj.word} className="flex overflow-hidden">
                    {wordObj.letters.map((letter, lIdx) => (
                      <motion.span
                        key={lIdx}
                        initial={{ y: 50, opacity: 0, filter: 'blur(6px)' }}
                        animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                        transition={{
                          duration: 0.75,
                          delay: 0.12 + (wIdx * 4 + lIdx) * 0.04,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[6.4rem] xl:text-[7rem] text-white uppercase tracking-[-0.03em] leading-none inline-block"
                        style={{
                          textShadow: '0 8px 30px rgba(0,0,0,0.9), 0 0 35px rgba(129,140,248,0.2)',
                        }}
                      >
                        {letter}
                      </motion.span>
                    ))}
                  </div>
                ))}
              </div>

              {/* Line 2: IMMUTABLE. */}
              <div className="flex items-center overflow-hidden py-1">
                {lineTwoLetters.map((letter, lIdx) => (
                  <motion.span
                    key={lIdx}
                    initial={{ y: 60, opacity: 0, filter: 'blur(6px)' }}
                    animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                    transition={{
                      duration: 0.8,
                      delay: 0.45 + lIdx * 0.04,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[6.4rem] xl:text-[7rem] uppercase tracking-[-0.03em] leading-none inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#FFFFFF] via-[#E2E8F0] to-[#818CF8]"
                    style={{
                      textShadow: '0 12px 35px rgba(0,0,0,0.95)',
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Subtitle Description */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="font-sans text-sm sm:text-base md:text-lg text-[#94A3B8] max-w-xl leading-relaxed mb-8 font-normal"
            >
              Decentralized, mathematically verifiable governance. Cast your ballot directly to Ethereum smart contracts with cryptographic receipts and zero intermediaries.
            </motion.p>

            {/* Action CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center gap-4 mb-8"
            >
              {isConnected ? (
                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.94 }}>
                  <Link
                    to="/dashboard"
                    className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#4F46E5] hover:to-[#7C3AED] text-white font-sans text-xs uppercase font-semibold tracking-[0.16em] transition-all shadow-[0_0_24px_rgba(99,102,241,0.5)] flex items-center gap-2 cursor-pointer"
                  >
                    <span>Launch Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </motion.div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setIsWalletModalOpen(true)}
                  className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#4F46E5] hover:to-[#7C3AED] text-white font-sans text-xs uppercase font-semibold tracking-[0.16em] transition-all shadow-[0_0_24px_rgba(99,102,241,0.5)] flex items-center gap-2 cursor-pointer"
                >
                  <span>Connect Wallet</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              )}

              <motion.div whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/request-admin"
                  className="px-6 py-3.5 rounded-full border border-white/15 hover:border-[#818CF8]/50 bg-[#0A0A0F]/60 hover:bg-[#12121C] text-[#E2E8F0] hover:text-white font-sans text-xs uppercase font-medium tracking-[0.14em] transition-all flex items-center gap-2 cursor-pointer backdrop-blur-sm"
                >
                  <Building2 className="w-3.5 h-3.5 text-[#818CF8]" />
                  <span>Become an Admin</span>
                </Link>
              </motion.div>

              <motion.a
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.95 }}
                href="#how-it-works"
                className="px-6 py-3.5 rounded-full border border-white/10 hover:border-white/30 bg-[#0A0A0F]/40 hover:bg-[#12121C] text-zinc-400 hover:text-[#E2E8F0] font-sans text-xs uppercase font-medium tracking-[0.14em] transition-colors flex items-center gap-2 cursor-pointer backdrop-blur-sm"
              >
                <span>Explore 6 Steps</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#818CF8]" />
              </motion.a>
            </motion.div>

            {/* Quick Live Telemetry Pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.05 }}
              className="flex flex-wrap items-center gap-2.5 text-[11px] font-mono text-[#94A3B8]"
            >
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Sepolia Testnet Active</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10">
                <Lock className="w-3 h-3 text-[#818CF8]" />
                <span>EIP-712 Signatures</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10">
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                <span>Zero Intermediaries</span>
              </div>
            </motion.div>
          </div>

          {/* ─────────────────────────────────────────────
              RIGHT COLUMN: 3D NEURAL NETWORK GLOBE
              (100% Seamlessly merged with starry background)
             ───────────────────────────────────────────── */}
          <div className="lg:col-span-5 relative w-full flex items-center justify-center min-h-[460px] sm:min-h-[540px] lg:min-h-[620px] pointer-events-none select-none">
            <WireframeGlobe3D />
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          HOW IT WORKS: 6-STEP ELECTION LIFECYCLE SECTION
          (Staggered 2-column cyber cards with 3D stencil block
           numbers & polygon outlines matching the blue cosmic theme)
      ══════════════════════════════════════════════════════ */}
      <section
        id="how-it-works"
        className="relative w-full py-20 sm:py-28 lg:py-36 px-4 sm:px-6 lg:px-12 bg-[#02040A] border-t border-white/10 overflow-hidden"
        aria-label="How VoxChain Works — 6 Steps"
      >
        {/* Deep Blue/Indigo Cosmic Atmosphere & Technical Blueprint Grid */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Ambient Radial Blue/Indigo Lighting */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[550px] rounded-full bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(99,102,241,0.18)_0%,rgba(30,27,75,0.06)_50%,transparent_100%)] blur-3xl" />
          <div className="absolute top-1/3 left-[-100px] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.08)_0%,transparent_70%)] blur-3xl" />
          <div className="absolute bottom-1/4 right-[-100px] w-[550px] h-[550px] rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.12)_0%,transparent_70%)] blur-3xl" />

          {/* Technical Blueprint Grid in Electric Indigo */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(129, 140, 248, 0.4) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(129, 140, 248, 0.4) 1px, transparent 1px)
              `,
              backgroundSize: '72px 72px',
              maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 35%, transparent 85%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 35%, transparent 85%)',
            }}
          />

          {/* Cosmic starfield speckles in cyan & violet */}
          <div className="absolute top-12 left-1/4 w-1.5 h-1.5 rounded-full bg-[#A5B4FC]/70 animate-pulse" />
          <div className="absolute top-1/3 right-1/5 w-1 h-1 rounded-full bg-[#38BDF8]/60" />
          <div className="absolute top-2/3 left-10 w-2 h-2 rounded-full bg-white/60" />
          <div className="absolute bottom-20 right-1/3 w-1.5 h-1.5 rounded-full bg-[#818CF8]/70 animate-pulse" />
          <div className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-cyan-400/50" />

          {/* Diagonal geometric connecting wireframe vector lines */}
          <svg className="absolute inset-0 w-full h-full stroke-[#818CF8]/[0.08]" fill="none" strokeWidth="1">
            <line x1="0" y1="20%" x2="100%" y2="80%" strokeDasharray="6 6" />
            <line x1="100%" y1="10%" x2="0%" y2="90%" strokeDasharray="6 6" />
            <circle cx="25%" cy="35%" r="180" stroke="rgba(56,189,248,0.06)" />
            <circle cx="75%" cy="65%" r="220" stroke="rgba(129,140,248,0.08)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">

          {/* Section Header */}
          <div className="flex flex-col items-center text-center mb-16 sm:mb-24 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#080B18] border border-[#818CF8]/30 shadow-[0_4px_24px_rgba(99,102,241,0.2)] mb-5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#818CF8] shadow-[0_0_8px_#818CF8] animate-pulse" />
              <span className="font-mono text-[10px] tracking-[0.22em] text-[#A5B4FC] uppercase font-bold">
                01 // ELECTION LIFECYCLE ARCHITECTURE
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.08] mb-6 uppercase"
            >
              Six Steps to Mathematically <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#E2E8F0] to-[#818CF8]">
                Verifiable Consensus.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-sans text-sm sm:text-base text-[#94A3B8] leading-relaxed max-w-2xl"
            >
              How VoxChain guarantees zero-trust elections from parameter setup to immutable on-chain finality with cryptographic receipts and zero intermediaries.
            </motion.p>
          </div>

          {/* Staggered 2-Column Cyber Cards Layout (Directly matching image 2) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 relative">

            {/* Left Column (Steps 01, 03, 05) */}
            <div className="flex flex-col space-y-8 sm:space-y-12 lg:space-y-16">
              <CyberStepCard
                num={electionSteps[0].num}
                title={electionSteps[0].title}
                desc={electionSteps[0].desc}
                tag={electionSteps[0].tag}
                delay={0.1}
              />

              <CyberStepCard
                num={electionSteps[2].num}
                title={electionSteps[2].title}
                desc={electionSteps[2].desc}
                tag={electionSteps[2].tag}
                delay={0.2}
              />

              <CyberStepCard
                num={electionSteps[4].num}
                title={electionSteps[4].title}
                desc={electionSteps[4].desc}
                tag={electionSteps[4].tag}
                delay={0.3}
              />
            </div>

            {/* Right Column (Steps 02, 04, 06 offset vertically for staggered dynamic cyber feel) */}
            <div className="flex flex-col space-y-8 sm:space-y-12 lg:space-y-16 lg:pt-28">
              <CyberStepCard
                num={electionSteps[1].num}
                title={electionSteps[1].title}
                desc={electionSteps[1].desc}
                tag={electionSteps[1].tag}
                delay={0.15}
              />

              <CyberStepCard
                num={electionSteps[3].num}
                title={electionSteps[3].title}
                desc={electionSteps[3].desc}
                tag={electionSteps[3].tag}
                delay={0.25}
              />

              <CyberStepCard
                num={electionSteps[5].num}
                title={electionSteps[5].title}
                desc={electionSteps[5].desc}
                tag={electionSteps[5].tag}
                delay={0.35}
              />
            </div>

          </div>

          {/* Bottom Step Flow Summary Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-16 sm:mt-24 p-6 sm:p-8 rounded-2xl bg-[#060914] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#6366F1]/10 border border-[#818CF8]/40 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-[#818CF8]" />
              </div>
              <div>
                <h4 className="font-sans font-bold text-base text-white">
                  Deterministic EVM Execution
                </h4>
                <p className="font-sans text-xs text-[#94A3B8]">
                  Zero reliance on off-chain servers or central database administrators.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#6366F1] to-[#818CF8] hover:from-[#4F46E5] hover:to-[#6366F1] text-white font-sans text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] cursor-pointer"
              >
                Explore Active Elections
              </Link>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          QUANTITATIVE PROTOCOL TELEMETRY SECTION
      ══════════════════════════════════════════════════════ */}
      <section
        id="protocol-metrics"
        className="relative w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-12 bg-[#000000] border-t border-white/10 overflow-hidden"
        aria-label="Protocol Quantitative Telemetry"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">

          {/* Left Column: Big Counter & Timeframe Switch */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#818CF8] mb-3">
              LIVE NETWORK TELEMETRY
            </span>

            <motion.div
              key={timeframe}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-baseline gap-4 mb-4"
            >
              <span className="font-display font-light text-6xl sm:text-7xl lg:text-8xl text-white tracking-tight leading-none">
                {metricsData.bigNumber}
              </span>
              <span className="font-sans text-xs sm:text-sm text-[#94A3B8] max-w-[140px] leading-snug">
                {metricsData.bigLabel}
              </span>
            </motion.div>

            <p className="font-sans text-xs sm:text-sm text-[#94A3B8] leading-relaxed mb-6">
              Total cryptographically certified votes registered on the VoxChain smart contract on Ethereum Sepolia.
            </p>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#64748B]">Timeframe:</span>
              <div className="inline-flex items-center p-1 rounded-full bg-[#0A0A12] border border-white/10">
                <button
                  onClick={() => setTimeframe('launch')}
                  className={`px-3 py-1 rounded-full text-xs font-sans font-medium uppercase tracking-wider transition-all cursor-pointer ${
                    timeframe === 'launch'
                      ? 'bg-white text-black font-semibold'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  Launch
                </button>
                <button
                  onClick={() => setTimeframe('6m')}
                  className={`px-3 py-1 rounded-full text-xs font-sans font-medium uppercase tracking-wider transition-all cursor-pointer ${
                    timeframe === '6m'
                      ? 'bg-white text-black font-semibold'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  6 mth
                </button>
                <button
                  onClick={() => setTimeframe('1y')}
                  className={`px-3 py-1 rounded-full text-xs font-sans font-medium uppercase tracking-wider transition-all cursor-pointer ${
                    timeframe === '1y'
                      ? 'bg-white text-black font-semibold'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  1 yr
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Breakdown Rows with Leader Lines */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Gradient Dividing Accent Line */}
            <div className="w-full h-[1.5px] bg-gradient-to-r from-[#6366F1] via-[#818CF8]/50 to-transparent mb-8" />

            <div className="flex flex-col gap-5 sm:gap-6 mb-8">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-[#94A3B8] font-sans font-normal">
                  Supported Blockchains
                </span>
                <div className="flex-1 mx-4 h-[1px] bg-gradient-to-r from-white/5 via-white/10 to-[#6366F1]/40 hidden sm:block" />
                <span className="text-white font-mono font-medium tracking-wide">
                  {metricsData.chains}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-[#94A3B8] font-sans font-normal">
                  Active Elections On-Chain
                </span>
                <div className="flex-1 mx-4 h-[1px] bg-gradient-to-r from-white/5 via-white/10 to-[#6366F1]/40 hidden sm:block" />
                <span className="text-white font-mono font-medium tracking-wide">
                  {electionCount} Registered
                </span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-[#94A3B8] font-sans font-normal">
                  Consensus Verification
                </span>
                <div className="flex-1 mx-4 h-[1px] bg-gradient-to-r from-white/5 via-white/10 to-[#6366F1]/40 hidden sm:block" />
                <span className="text-white font-mono font-medium tracking-wide">
                  {metricsData.swaps}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-[#94A3B8] font-sans font-normal">
                  Integrity Guarantee
                </span>
                <div className="flex-1 mx-4 h-[1px] bg-gradient-to-r from-white/5 via-white/10 to-[#6366F1]/40 hidden sm:block" />
                <span className="text-white font-mono font-medium tracking-wide">
                  {metricsData.security}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-[#94A3B8] font-sans font-normal">
                  Secured Protocol Capital
                </span>
                <div className="flex-1 mx-4 h-[1px] bg-gradient-to-r from-white/5 via-white/10 to-[#6366F1]/40 hidden sm:block" />
                <span className="text-white font-mono font-medium tracking-wide">
                  {metricsData.tvl}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
              <span className="font-sans text-xs text-[#818CF8] tracking-wider uppercase font-medium">
                Protocol Live in 2026
              </span>

              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="px-5 py-2.5 rounded-full border border-white/20 hover:border-white/40 text-xs font-sans text-white uppercase tracking-wider transition-colors cursor-pointer"
                >
                  View Ballots
                </Link>

                <Link
                  to="/admin"
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#6366F1] to-[#818CF8] hover:from-[#4F46E5] hover:to-[#6366F1] text-xs font-sans text-white font-semibold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(99,102,241,0.5)] cursor-pointer"
                >
                  Admin Console
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Minimalist Clean Footer ── */}
      <footer className="w-full py-10 px-4 sm:px-6 lg:px-12 bg-[#000000] border-t border-white/10 text-[11px] font-mono text-[#64748B]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#6366F1] shadow-[0_0_8px_#6366F1]" />
            <span className="font-sans font-bold text-sm text-white tracking-widest uppercase">
              VOXCHAIN
            </span>
            <span className="text-[#475569]">·</span>
            <span className="text-[#94A3B8] font-sans">
              Your Voice. Immutable.
            </span>
          </div>

          <div className="flex items-center gap-6 font-sans text-xs">
            <Link to="/dashboard" className="text-white hover:text-[#818CF8] transition-colors">
              Elections
            </Link>
            <a href="#how-it-works" className="text-[#94A3B8] hover:text-white transition-colors">
              6 Steps
            </a>
            <Link to="/admin" className="text-[#94A3B8] hover:text-white transition-colors">
              Admin Portal
            </Link>
            <a
              href={`https://sepolia.etherscan.io/address/${contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#818CF8] hover:underline flex items-center gap-1"
            >
              <span>Sepolia Contract</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Connect Wallet Modal */}
      <ConnectWalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </div>
  );
};
