import React from 'react';
import { useVoxChain } from '../../hooks/useVoxChain';
import { HeroBallotSealCanvas } from './HeroBallotSealCanvas';
import { ShieldCheck, Cpu, ArrowUpRight } from 'lucide-react';

export const HeroGeometricGrid: React.FC = () => {
  const { contractAddress, electionCount } = useVoxChain();

  return (
    <div
      className="relative w-full max-w-xl mx-auto lg:max-w-none border border-white/10 bg-[#080808] rounded-xl overflow-hidden select-none shadow-[0_24px_80px_rgba(0,0,0,0.7)] transition-all duration-300"
      style={{ perspective: '1200px' }}
    >
      {/* Corner crosshairs — Architectural precision */}
      <span className="absolute top-2.5 left-2.5 text-[9px] font-mono text-white/30 z-20 pointer-events-none select-none">+</span>
      <span className="absolute top-2.5 right-2.5 text-[9px] font-mono text-white/30 z-20 pointer-events-none select-none">+</span>
      <span className="absolute bottom-2.5 left-2.5 text-[9px] font-mono text-white/30 z-20 pointer-events-none select-none">+</span>
      <span className="absolute bottom-2.5 right-2.5 text-[9px] font-mono text-white/30 z-20 pointer-events-none select-none">+</span>

      {/* Modular Architectural Grid Matrix */}
      <div className="grid grid-cols-3 sm:grid-cols-4 grid-rows-4 h-full min-h-[460px] sm:min-h-[520px]">
        {/* Row 1, Col 1: Etched frequency cell */}
        <div className="border-r border-b border-white/10 p-3 sm:p-4 flex flex-col justify-between bg-[#050505] relative">
          <span className="text-[9px] font-mono text-[#707070] tracking-widest">[GRID.01]</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFFFFF]" />
            <span className="text-[8px] font-mono text-[#A1A1A1] uppercase tracking-wider">ONLINE</span>
          </div>
        </div>

        {/* Row 1, Col 2: Machined Geometric Semicircle Accent */}
        <div className="border-r border-b border-white/10 p-4 flex items-center justify-center bg-[#0D0D0D] relative group">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-white/15 relative overflow-hidden flex flex-col justify-end">
            <div className="w-full h-1/2 bg-white/5 border-t border-white/20 bg-etched-lines" />
          </div>
        </div>

        {/* Row 1, Col 3: Calibrated Linework Frequency */}
        <div className="border-r border-b border-white/10 p-3.5 bg-etched-lines hidden sm:flex flex-col justify-between">
          <span className="text-[9px] font-mono text-[#707070]">[FREQ.60HZ]</span>
          <div className="flex gap-1 items-end h-4">
            <span className="w-1 h-2 bg-white/20" />
            <span className="w-1 h-3.5 bg-white/40" />
            <span className="w-1 h-1.5 bg-white" />
          </div>
        </div>

        {/* Row 1, Col 4: Consensus Telemetry */}
        <div className="border-b border-white/10 p-3 sm:p-4 flex flex-col justify-between bg-[#0D0D0D]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFFFFF] animate-pulse" />
            <span className="text-[9px] font-mono text-[#F5F5F5] uppercase tracking-wider">
              CONSENSUS
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#707070]">SEPOLIA // 11155111</span>
        </div>

        {/* Row 2 & 3, Col 1 & 2: Central 3D Sculptural Ballot Seal Stage */}
        <div className="col-span-2 row-span-2 border-r border-b border-white/10 relative bg-[#050505] flex flex-col items-center justify-center p-2 sm:p-4">
          {/* Subtle perimeter crosshair lines inside stage */}
          <div className="absolute inset-x-4 top-1/2 h-px bg-white/[0.04] pointer-events-none" />
          <div className="absolute inset-y-4 left-1/2 w-px bg-white/[0.04] pointer-events-none" />

          {/* WebGL 3D Canvas Object */}
          <div className="w-full h-full min-h-[240px] sm:min-h-[280px]">
            <HeroBallotSealCanvas />
          </div>

          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[8px] font-mono text-[#707070] pointer-events-none">
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-white" />
              <span>ARTIFACT // THREE.JS WEBGL</span>
            </span>
            <span className="text-white/30 uppercase tracking-widest hidden sm:inline">PHYSICALLY BASED SHADER</span>
          </div>
        </div>

        {/* Row 2, Col 3 & 4: Allowlist Registry Specification */}
        <div className="col-span-1 sm:col-span-2 border-b border-white/10 p-4 sm:p-5 flex flex-col justify-between bg-[#0D0D0D]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#A1A1A1]">
                [SPEC.01 // ACCESS]
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#A1A1A1]" />
            </div>
            <h4 className="font-sans font-semibold text-sm text-[#F5F5F5] mb-1">
              Allowlist Registry
            </h4>
            <p className="font-mono text-xs text-[#A1A1A1] leading-relaxed">
              Pre-registered wallet credentials enforce one-vote-per-identity at the EVM bytecode level.
            </p>
          </div>
          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-[#707070]">
            <span>RULE: UNIQUE_PUBLIC_KEY</span>
            <span className="text-[#F5F5F5]">ENFORCED</span>
          </div>
        </div>

        {/* Row 3, Col 3 & 4: Instant EVM Finality Card */}
        <div className="col-span-1 sm:col-span-2 border-b border-white/10 p-4 sm:p-5 flex flex-col justify-between bg-[#080808]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-mono uppercase tracking-wider text-[#A1A1A1]">
                SECURITY
              </span>
              <Cpu className="w-3.5 h-3.5 text-[#D8D8D8]" />
            </div>
            <h4 className="font-sans font-semibold text-sm text-[#F5F5F5] mb-1">
              Tamper-Proof Voting
            </h4>
            <p className="font-sans text-xs text-[#A1A1A1] leading-relaxed">
              No database or administrator can alter votes once submitted to the blockchain.
            </p>
          </div>
          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-[#707070]">
            <span>PERMANENT RECORD</span>
            <span className="text-[#D8D8D8]">100% AUDITABLE</span>
          </div>
        </div>

        {/* Row 4, Col 1: Fine Precision Quarter-Circle Graphic */}
        <div className="border-r border-white/10 p-3 flex items-center justify-center bg-[#050505] relative">
          <div className="w-10 h-10 rounded-tl-full border-t border-l border-white/20 bg-white/[0.03]" />
        </div>

        {/* Row 4, Col 2: Live On-Chain Elections Counter */}
        <div className="border-r border-white/10 p-3 sm:p-4 flex flex-col justify-between bg-[#0D0D0D]">
          <span className="text-[9px] font-mono text-[#707070] uppercase">BALLOTS REGISTERED</span>
          <span className="text-xl sm:text-2xl font-mono font-bold text-[#F5F5F5]">
            {electionCount}
          </span>
          <span className="text-[8px] font-mono text-[#707070]">ON-CHAIN ELECTIONS</span>
        </div>

        {/* Row 4, Col 3 & 4: Contract Explorer Link Cell */}
        <div className="col-span-1 sm:col-span-2 p-3 sm:p-4 flex flex-col justify-between bg-[#080808]">
          <span className="text-[9px] font-mono text-[#707070] uppercase">SEPOLIA ADDRESS</span>
          <div className="font-mono text-xs text-[#F5F5F5] truncate my-1">
            {contractAddress}
          </div>
          <a
            href={`https://sepolia.etherscan.io/address/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-mono text-[#A1A1A1] hover:text-[#FFFFFF] transition-colors flex items-center gap-1 group"
          >
            <span>Inspect Contract on Etherscan</span>
            <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  );
};
