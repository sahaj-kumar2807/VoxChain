import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useVoxChain } from '../hooks/useVoxChain';
import { ElectionHubCard } from '../components/voting/ElectionHubCard';
import { VoxBadge } from '../components/common/VoxBadge';
import { VoxHashPill } from '../components/common/VoxHashPill';
import { VoxButton } from '../components/common/VoxButton';
import { Link } from 'react-router-dom';
import { Vote, Shield, PlusCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import type { ElectionFilter } from '../types';

export const VoterDashboard: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { electionCount, isUserAdmin } = useVoxChain();
  const [filter, setFilter] = useState<ElectionFilter>('all');

  // Generate list of election IDs based on contract electionCount
  const electionIds = Array.from({ length: electionCount }, (_, i) => i + 1).reverse();

  return (
    <div className="flex flex-col gap-10 py-6">
      {/* Voter Telemetry Top Banner */}
      <div className="p-6 bg-vox-surface-1 border border-vox-border-medium rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-xs font-semibold text-vox-accent-gold uppercase tracking-wider">
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
          </div>
          <h2 className="font-display font-bold text-2xl text-vox-text-primary">
            Elections & Governance Hub
          </h2>
        </div>

        {/* Voter Status Pill */}
        <div className="flex items-center gap-3">
          {isConnected && address ? (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-vox-surface-2 border border-vox-border-subtle">
              <Shield className="w-4 h-4 text-vox-accent-gold" />
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-vox-text-muted">Authenticated Public Key</span>
                <VoxHashPill hash={address} type="address" truncate={true} showExplorerLink={false} />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-mono text-vox-text-muted">
              <AlertCircle className="w-4 h-4 text-vox-state-warning" />
              <span>Connect wallet to verify eligibility on smart contract</span>
            </div>
          )}

          {isUserAdmin && (
            <Link to="/admin">
              <VoxButton variant="primary-gold" size="sm" icon={<PlusCircle className="w-4 h-4" />}>
                Admin Portal
              </VoxButton>
            </Link>
          )}
        </div>
      </div>

      {/* Filter Tabs & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-vox-border-subtle pb-4">
        <div>
          <h3 className="font-display font-bold text-xl text-vox-text-primary">
            Available Ballots ({electionCount})
          </h3>
          <p className="text-xs text-vox-text-secondary">
            Verified smart contract elections registered on <code>VoxChain.sol</code>
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-vox-surface-1 border border-vox-border-subtle rounded-lg">
          {(['all', 'active', 'upcoming', 'concluded'] as ElectionFilter[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 text-xs font-mono capitalize rounded-md transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-vox-surface-3 text-vox-accent-gold font-bold'
                  : 'text-vox-text-secondary hover:text-vox-text-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Elections Grid */}
      {electionCount === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center p-8 bg-vox-surface-1 border border-dashed border-vox-border-medium rounded-2xl">
          <Vote className="w-12 h-12 text-vox-text-muted mb-4 opacity-40" />
          <h4 className="font-display font-bold text-lg text-vox-text-primary mb-1">
            No Elections Registered Yet
          </h4>
          <p className="text-xs text-vox-text-secondary max-w-md mb-6">
            The smart contract currently contains zero elections. The contract administrator can initialize elections
            using the Governance Portal.
          </p>
          {isUserAdmin && (
            <Link to="/admin/create-election">
              <VoxButton variant="primary-gold" icon={<PlusCircle className="w-4 h-4" />}>
                Create First Election
              </VoxButton>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {electionIds.map((id) => (
            <ElectionHubCard key={id} electionId={id} />
          ))}
        </div>
      )}
    </div>
  );
};
