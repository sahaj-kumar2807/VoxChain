import React from 'react';
import { Link } from 'react-router-dom';
import { useVoxChain } from '../hooks/useVoxChain';
import { useElection } from '../hooks/useElection';
import { AdminGuard } from '../components/admin/AdminGuard';
import { VoxCard } from '../components/common/VoxCard';
import { VoxBadge } from '../components/common/VoxBadge';
import { VoxButton } from '../components/common/VoxButton';
import { VoxHashPill } from '../components/common/VoxHashPill';
import { PlusCircle, ShieldCheck, Users, UserPlus, Play, Square, Trophy, Settings } from 'lucide-react';

const AdminElectionRow: React.FC<{ electionId: number }> = ({ electionId }) => {
  const { election, candidates, isLoading } = useElection(electionId);

  if (isLoading || !election) {
    return (
      <tr className="border-b border-vox-border-subtle animate-pulse">
        <td className="p-4"><div className="h-4 bg-vox-surface-3 rounded w-8" /></td>
        <td className="p-4"><div className="h-4 bg-vox-surface-3 rounded w-48" /></td>
        <td className="p-4"><div className="h-4 bg-vox-surface-3 rounded w-20" /></td>
        <td className="p-4"><div className="h-4 bg-vox-surface-3 rounded w-20" /></td>
        <td className="p-4"><div className="h-8 bg-vox-surface-3 rounded w-32" /></td>
      </tr>
    );
  }

  const isStarted = election.started && !election.ended;
  const isEnded = election.ended;
  const isPending = !election.started && !election.ended;

  return (
    <tr className="border-b border-vox-border-subtle hover:bg-vox-surface-2/60 transition-colors">
      <td className="p-4 font-mono font-bold text-xs text-vox-accent-gold">
        #{electionId.toString().padStart(2, '0')}
      </td>
      <td className="p-4 font-display font-semibold text-sm text-vox-text-primary">
        {election.name}
      </td>
      <td className="p-4 font-mono text-xs text-vox-text-secondary">
        {candidates.length} Candidates
      </td>
      <td className="p-4">
        {isStarted && <VoxBadge variant="success" dot={true}>Active</VoxBadge>}
        {isEnded && <VoxBadge variant="gold">Ended</VoxBadge>}
        {isPending && <VoxBadge variant="neutral">Draft</VoxBadge>}
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          {isPending && (
            <>
              <Link to={`/admin/election/${electionId}/candidates`}>
                <VoxButton variant="outline" size="sm" icon={<Users className="w-3.5 h-3.5" />}>
                  Candidates
                </VoxButton>
              </Link>
              <Link to={`/admin/election/${electionId}/voters`}>
                <VoxButton variant="outline" size="sm" icon={<UserPlus className="w-3.5 h-3.5" />}>
                  Voters
                </VoxButton>
              </Link>
            </>
          )}
          <Link to={`/admin/election/${electionId}/control`}>
            <VoxButton variant="primary-gold" size="sm" icon={<Settings className="w-3.5 h-3.5" />}>
              Lifecycle Command
            </VoxButton>
          </Link>
          {isEnded && (
            <Link to={`/election/${electionId}/results`}>
              <VoxButton variant="outline" size="sm" icon={<Trophy className="w-3.5 h-3.5" />}>
                Results
              </VoxButton>
            </Link>
          )}
        </div>
      </td>
    </tr>
  );
};

export const AdminDashboard: React.FC = () => {
  const { electionCount, adminAddress, contractAddress } = useVoxChain();
  const electionIds = Array.from({ length: electionCount }, (_, i) => i + 1).reverse();

  return (
    <AdminGuard>
      <div className="flex flex-col gap-10 py-6 max-w-6xl mx-auto">
        {/* Admin Header */}
        <div className="p-6 bg-vox-surface-1 border border-vox-border-medium rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldCheck className="w-4 h-4 text-vox-accent-gold" />
              <span className="font-mono text-xs font-semibold text-vox-accent-gold uppercase tracking-wider">
                Governance Command Center
              </span>
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-vox-text-primary">
              Election Administrator Portal
            </h1>
            <p className="text-xs font-mono text-vox-text-muted mt-1">
              Admin: <VoxHashPill hash={adminAddress || ''} type="address" />
            </p>
          </div>

          <Link to="/admin/create-election">
            <VoxButton variant="primary-gold" size="lg" icon={<PlusCircle className="w-5 h-5" />}>
              Create New Election
            </VoxButton>
          </Link>
        </div>

        {/* Master Management Table */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-bold text-xl text-vox-text-primary">
              All Managed Elections ({electionCount})
            </h3>
            <span className="font-mono text-xs text-vox-text-muted">On-Chain State</span>
          </div>

          {electionCount === 0 ? (
            <VoxCard variant="layer-1" padding="lg" className="text-center py-16">
              <p className="text-sm text-vox-text-secondary mb-4">No elections exist in the contract yet.</p>
              <Link to="/admin/create-election">
                <VoxButton variant="primary-gold" icon={<PlusCircle className="w-4 h-4" />}>
                  Create First Election
                </VoxButton>
              </Link>
            </VoxCard>
          ) : (
            <div className="overflow-x-auto bg-vox-surface-1 border border-vox-border-medium rounded-xl shadow-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-vox-border-subtle bg-vox-surface-2/60 text-[11px] font-mono uppercase tracking-wider text-vox-text-muted">
                    <th className="p-4">ID</th>
                    <th className="p-4">Election Name</th>
                    <th className="p-4">Roster</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Administration Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {electionIds.map((id) => (
                    <AdminElectionRow key={id} electionId={id} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
};
