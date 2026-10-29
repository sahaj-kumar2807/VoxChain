import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useVoxChain } from '../hooks/useVoxChain';
import { useVoxChainRegistry } from '../hooks/useVoxChainRegistry';
import { ElectionHubCard } from '../components/voting/ElectionHubCard';
import { VoxBadge } from '../components/common/VoxBadge';
import { VoxButton } from '../components/common/VoxButton';
import { ConnectWalletModal } from '../components/common/ConnectWalletModal';
import { Link } from 'react-router-dom';
import {
  Vote,
  Shield,
  PlusCircle,
  AlertCircle,
  Wallet,
  Activity,
  Cpu,
  CheckCircle2,
  Trophy,
  Lock,
  Layers,
  Building2,
  Crown,
} from 'lucide-react';
import type { ElectionFilter } from '../types';

export const VoterDashboard: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { approvedOrganisations, isSuperAdmin, isOrgAdmin } = useVoxChainRegistry();

  // Selected organisation filter
  const [selectedContract, setSelectedContract] = useState<`0x${string}` | undefined>(undefined);

  const { electionCount, isUserAdmin, orgName, contractAddress } = useVoxChain(selectedContract);
  const [filter, setFilter] = useState<ElectionFilter>('all');
  const [connectModalOpen, setConnectModalOpen] = useState(false);

  const electionIds = Array.from({ length: electionCount }, (_, i) => i + 1).reverse();

  return (
    <div className="flex flex-col gap-8 py-6 relative">
      {/* ── Top Voter Credential Station & Governance Banner ── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/12 hover:border-[#818CF8]/30 bg-gradient-to-b from-[#0D0D14]/95 via-[#08080C]/98 to-[#020204] p-6 sm:p-8 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_20px_50px_rgba(0,0,0,0.8)]">
        {/* Ambient high-contrast electric violet glow */}
        <div className="absolute -top-24 right-0 w-[440px] h-[440px] bg-[radial-gradient(circle,rgba(99,102,241,0.16)_0%,transparent_70%)] pointer-events-none blur-3xl" />
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#818CF8]/70 to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold text-[#A5B4FC] uppercase tracking-widest px-2.5 py-0.5 rounded bg-[#6366F1]/15 border border-[#6366F1]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#818CF8] shadow-[0_0_8px_#818CF8] animate-pulse" />
                Voter Credential Station
              </span>
              {isConnected ? (
                <VoxBadge variant="success" size="sm" dot={true}>
                  Wallet Connected
                </VoxBadge>
              ) : (
                <VoxBadge variant="warning" size="sm">
                  Disconnected
                </VoxBadge>
              )}
              {orgName && (
                <VoxBadge variant="gold" size="sm">
                  {orgName}
                </VoxBadge>
              )}
            </div>

            <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-[#A5B4FC] bg-clip-text text-transparent">
              {orgName ? `${orgName} Elections` : 'Elections & Governance Hub'}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl font-sans">
              Transparent, tamper-proof voting powered by secure blockchain technology.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {isConnected && address ? (
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/15 shadow-inner">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">Voter Active</span>
                  <span className="text-xs text-white font-medium">Ready to Vote</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <VoxButton
                  variant="primary-gold"
                  size="sm"
                  icon={<Wallet className="w-3.5 h-3.5" />}
                  onClick={() => setConnectModalOpen(true)}
                >
                  Connect Wallet
                </VoxButton>
              </div>
            )}

            {isSuperAdmin && (
              <Link to="/super-admin">
                <VoxButton
                  variant="primary-gold"
                  size="sm"
                  icon={<Crown className="w-3.5 h-3.5 text-black" />}
                >
                  Super Admin
                </VoxButton>
              </Link>
            )}

            {(isUserAdmin || isOrgAdmin) && (
              <Link to="/admin">
                <VoxButton
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/[0.08] hover:border-[#818CF8]/50"
                  icon={<PlusCircle className="w-3.5 h-3.5 text-[#818CF8]" />}
                >
                  Org Admin
                </VoxButton>
              </Link>
            )}
          </div>
        </div>

        {/* ── Built-in Live Telemetry Strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 relative z-10">
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors">
            <Layers className="w-4 h-4 text-[#818CF8] shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider">Total Elections</span>
              <span className="text-xs font-mono font-semibold text-white">{electionCount} Available</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors">
            <Building2 className="w-4 h-4 text-[#38BDF8] shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider">Organizations</span>
              <span className="text-xs font-mono font-semibold text-white">
                {approvedOrganisations.length > 0 ? `${approvedOrganisations.length} Verified` : 'All Active'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors">
            <Cpu className="w-4 h-4 text-[#A5B4FC] shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider">Blockchain Network</span>
              <span className="text-xs font-mono font-semibold text-white">Ethereum Sepolia</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors">
            <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider">Your Status</span>
              <span className="text-xs font-mono font-semibold text-white">
                {isConnected ? 'Connected & Ready' : 'Sign in to Vote'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Organisation Browser (when registered organisations exist) ── */}
      {approvedOrganisations.length > 0 && (
        <div className="p-4 bg-[#0A0A10] border border-white/10 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#818CF8]" />
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-300">
              Browse Organisation Ballots:
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedContract || ''}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedContract(val ? (val as `0x${string}`) : undefined);
              }}
              className="bg-[#141420] border border-white/15 text-white font-mono text-xs rounded-lg px-3 py-2 w-full sm:w-64 focus:outline-none focus:border-[#818CF8] cursor-pointer"
            >
              <option value="">Default Platform Ledger</option>
              {approvedOrganisations.map((org) => (
                <option key={org.id.toString()} value={org.contractAddress}>
                  {org.name} (#{org.id.toString()})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ── Filter Bar & Section Heading ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-xl text-white">
              Available Elections
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-[#6366F1]/15 border border-[#6366F1]/30 text-[10px] font-mono text-[#A5B4FC] font-semibold">
              {electionCount} Total
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Select an election below to review verified candidates and cast your ballot.
          </p>
        </div>

        {/* High-Contrast Segmented Filter Controls */}
        <div className="flex items-center gap-1 p-1 bg-[#0A0A10] border border-white/12 rounded-xl shadow-sm">
          {[
            { id: 'all', label: 'All', icon: null },
            { id: 'active', label: 'Active', icon: <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> },
            { id: 'upcoming', label: 'Upcoming', icon: <Lock className="w-3 h-3 text-zinc-400" /> },
            { id: 'concluded', label: 'Concluded', icon: <Trophy className="w-3 h-3 text-[#A5B4FC]" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as ElectionFilter)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-mono capitalize rounded-lg transition-all cursor-pointer ${
                filter === tab.id
                  ? 'bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white border border-[#818CF8]/50 font-semibold shadow-[0_0_20px_rgba(99,102,241,0.45)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Elections Grid ── */}
      {electionCount === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center p-8 bg-[#0A0A10] border border-dashed border-white/15 rounded-2xl shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-[#6366F1]/15 border border-[#818CF8]/30 flex items-center justify-center mb-4">
            <Vote className="w-8 h-8 text-[#A5B4FC]" />
          </div>
          <h3 className="font-display font-bold text-lg text-white mb-1">No Elections Yet</h3>
          <p className="text-xs text-zinc-400 max-w-md mb-6 leading-relaxed">
            No elections have been registered yet on this smart contract. Administrators can launch a new election from the Admin Portal.
          </p>
          {(isUserAdmin || isOrgAdmin) && (
            <Link to="/admin">
              <VoxButton variant="primary-gold" icon={<PlusCircle className="w-4 h-4" />}>
                Go to Admin Portal
              </VoxButton>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {electionIds.map((id) => (
            <ElectionHubCard
              key={id}
              electionId={id}
              filter={filter}
              contractAddress={selectedContract}
            />
          ))}
        </div>
      )}

      {/* Connect Wallet Modal */}
      <ConnectWalletModal
        isOpen={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
      />
    </div>
  );
};
