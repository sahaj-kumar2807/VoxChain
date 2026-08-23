import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { VoxButton } from '../components/common/VoxButton';
import { VoxBadge } from '../components/common/VoxBadge';
import { VoxCard } from '../components/common/VoxCard';
import { VoxHashPill } from '../components/common/VoxHashPill';
import { useVoxChain } from '../hooks/useVoxChain';
import { ShieldCheck, Vote, Cpu, CheckCircle2, Lock, ArrowRight, Activity, Users } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { contractAddress, electionCount } = useVoxChain();

  return (
    <div className="flex flex-col gap-24 py-8">
      {/* Hero Section */}
      <section className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-7 flex flex-col items-start"
        >
          <div className="flex items-center gap-2 mb-4">
            <VoxBadge variant="gold" dot={true}>
              Ethereum Smart Contract
            </VoxBadge>
            <span className="text-xs font-mono text-vox-text-muted">VoxChain.sol</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight leading-[1.08] text-vox-text-primary mb-6">
            Your Voice.<br />
            <span className="text-vox-accent-gold drop-shadow-[0_0_25px_rgba(245,158,11,0.25)]">
              Immutable.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-vox-text-secondary leading-relaxed max-w-xl mb-8">
            An institutional-grade decentralized electronic voting protocol. Zero-trust wallet authentication,
            tamper-proof smart contract ballots, and transparent on-chain mathematical consensus.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link to="/dashboard">
              <VoxButton size="lg" variant="primary-gold" icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
                Enter Voting Portal
              </VoxButton>
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <VoxButton size="lg" variant="outline" icon={<Cpu className="w-4 h-4" />}>
                Contract: VoxChain.sol
              </VoxButton>
            </a>
          </div>
        </motion.div>

        {/* Live Protocol Telemetry Monolith */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="lg:col-span-5"
        >
          <VoxCard variant="layer-1" padding="lg" className="border-vox-border-strong bg-gradient-to-b from-vox-surface-1 to-vox-surface-2 relative overflow-hidden">
            {/* Header Telemetry Pill */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-vox-border-subtle">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-vox-state-success animate-pulse" />
                <span className="font-mono text-xs font-semibold text-vox-state-success uppercase tracking-wider">
                  EVM Consensus Active
                </span>
              </div>
              <VoxBadge variant="neutral" size="sm">
                Block Finality
              </VoxBadge>
            </div>

            {/* Telemetry Matrix */}
            <div className="flex flex-col gap-3.5 font-mono text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-vox-border-subtle">
                <span className="text-vox-text-muted">Smart Contract:</span>
                <VoxHashPill hash={contractAddress} type="address" truncate={true} />
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-vox-border-subtle">
                <span className="text-vox-text-muted">Total Elections:</span>
                <span className="text-vox-accent-gold font-bold">{electionCount} Ballots Registered</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-vox-border-subtle">
                <span className="text-vox-text-muted">Execution Model:</span>
                <span className="text-vox-text-primary">EVM State Machine</span>
              </div>

              <div className="flex justify-between items-center py-1.5">
                <span className="text-vox-text-muted">Consensus Integrity:</span>
                <span className="text-vox-state-success font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Verifiable
                </span>
              </div>
            </div>

            {/* Quick Link Card */}
            <div className="mt-6 pt-4 border-t border-vox-border-subtle">
              <Link to="/dashboard" className="block text-center text-xs font-semibold text-vox-accent-gold hover:underline">
                View Active Elections On-Chain →
              </Link>
            </div>
          </VoxCard>
        </motion.div>
      </section>

      {/* Protocol Architecture Features */}
      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <VoxBadge variant="gold" size="sm" className="w-fit">
            01 // ARCHITECTURAL PILLARS
          </VoxBadge>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-vox-text-primary">
            How VOXCHAIN Re-engineers Democratic Trust
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <VoxCard variant="interactive" padding="lg">
            <div className="w-10 h-10 rounded-lg bg-vox-accent-gold-glow border border-vox-accent-gold/40 flex items-center justify-center text-vox-accent-gold mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-vox-text-primary mb-2">
              Cryptographic Identity
            </h3>
            <p className="text-xs text-vox-text-secondary leading-relaxed">
              Every voter is authenticated through their unique Ethereum public key. Pre-registered allowlists prevent
              unauthorized participation and strictly eliminate duplicate ballots.
            </p>
          </VoxCard>

          <VoxCard variant="interactive" padding="lg">
            <div className="w-10 h-10 rounded-lg bg-vox-state-success-bg border border-vox-state-success/40 flex items-center justify-center text-vox-state-success mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-vox-text-primary mb-2">
              Unalterable State
            </h3>
            <p className="text-xs text-vox-text-secondary leading-relaxed">
              Votes are committed directly into immutable EVM storage slots. No central database admin, server, or
              election authority can alter a vote once committed to a block.
            </p>
          </VoxCard>

          <VoxCard variant="interactive" padding="lg">
            <div className="w-10 h-10 rounded-lg bg-vox-state-info-bg border border-vox-state-info/40 flex items-center justify-center text-vox-state-info mb-4">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-vox-text-primary mb-2">
              Transparent Consensus
            </h3>
            <p className="text-xs text-vox-text-secondary leading-relaxed">
              Once voting concludes, smart contract function <code>getResults()</code> delivers an instant,
              mathematically verified tally accessible to all citizens and audit nodes.
            </p>
          </VoxCard>
        </div>
      </section>

      {/* Protocol Metrics Bar */}
      <section className="p-8 bg-vox-surface-1 border border-vox-border-medium rounded-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <span className="font-display font-bold text-3xl sm:text-4xl text-vox-accent-gold block mb-1">
              {electionCount}
            </span>
            <span className="font-mono text-xs uppercase tracking-wider text-vox-text-muted">Total Elections</span>
          </div>
          <div>
            <span className="font-display font-bold text-3xl sm:text-4xl text-vox-state-success block mb-1">
              100%
            </span>
            <span className="font-mono text-xs uppercase tracking-wider text-vox-text-muted">On-Chain Finality</span>
          </div>
          <div>
            <span className="font-display font-bold text-3xl sm:text-4xl text-vox-state-info block mb-1">
              0
            </span>
            <span className="font-mono text-xs uppercase tracking-wider text-vox-text-muted">Central Servers</span>
          </div>
          <div>
            <span className="font-display font-bold text-3xl sm:text-4xl text-vox-text-primary block mb-1">
              24/7
            </span>
            <span className="font-mono text-xs uppercase tracking-wider text-vox-text-muted">Network Verification</span>
          </div>
        </div>
      </section>
    </div>
  );
};
