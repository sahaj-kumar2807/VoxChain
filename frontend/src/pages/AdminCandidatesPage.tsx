import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useElection } from '../hooks/useElection';
import { useVoxChain } from '../hooks/useVoxChain';
import { VOX_CHAIN_ABI } from '../contracts/voxChainAbi';
import { AdminGuard } from '../components/admin/AdminGuard';
import { VoxCard } from '../components/common/VoxCard';
import { VoxInput } from '../components/common/VoxInput';
import { VoxButton } from '../components/common/VoxButton';
import { VoxBadge } from '../components/common/VoxBadge';
import { VoxAlert } from '../components/common/VoxAlert';
import { ArrowLeft, UserPlus, Users, Loader2, CheckCircle2, User } from 'lucide-react';

export const AdminCandidatesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const electionId = Number(id);
  const { contractAddress, writeContractAsync } = useVoxChain();
  const { election, candidates, isLoading, refetchAll } = useElection(electionId);

  const [candidateName, setCandidateName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (isLoading || !election) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-vox-accent-gold mb-4" />
        <span className="font-mono text-xs text-vox-text-muted">Loading Election #{id}...</span>
      </div>
    );
  }

  const isLocked = election.started || election.ended;

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim()) {
      setError('Candidate name cannot be empty');
      return;
    }

    setIsAdding(true);
    setError(null);
    setSuccess(false);

    try {
      await writeContractAsync({
        address: contractAddress,
        abi: VOX_CHAIN_ABI,
        functionName: 'addCandidate',
        args: [BigInt(electionId), candidateName.trim()],
      });

      setSuccess(true);
      setCandidateName('');
      setIsAdding(false);
      refetchAll();
    } catch (err: any) {
      setIsAdding(false);
      setError(err?.shortMessage || err?.message || 'Transaction failed');
    }
  };

  return (
    <AdminGuard>
      <div className="max-w-4xl mx-auto py-8 flex flex-col gap-8">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between border-b border-vox-border-subtle pb-4">
          <Link to="/admin" className="flex items-center gap-1.5 text-xs font-mono text-vox-text-muted hover:text-vox-accent-gold">
            <ArrowLeft className="w-4 h-4" /> Governance Command
          </Link>
          <span className="font-mono text-xs text-vox-text-secondary">
            Election: {election.name} (#{electionId})
          </span>
        </div>

        {/* Header */}
        <div className="p-6 bg-vox-surface-1 border border-vox-border-medium rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-vox-accent-gold" />
              <span className="font-mono text-xs font-semibold text-vox-accent-gold uppercase tracking-wider">
                Ballot Configuration
              </span>
            </div>
            <h1 className="font-display font-bold text-2xl text-vox-text-primary">
              Candidate Roster Management
            </h1>
          </div>
          <div>
            {election.started && <VoxBadge variant="success" dot={true}>Election Started (Locked)</VoxBadge>}
            {election.ended && <VoxBadge variant="gold">Election Ended (Locked)</VoxBadge>}
            {!election.started && !election.ended && (
              <VoxBadge variant="neutral">Roster Open for Editing</VoxBadge>
            )}
          </div>
        </div>

        {/* Lock Warning if Started */}
        {isLocked && (
          <VoxAlert variant="warning" title="Candidate Roster Locked">
            This election has already started or concluded. By smart contract design, no additional candidates can be
            added once voting opens.
          </VoxAlert>
        )}

        {/* Grid: Add Form + Current Roster */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Add Candidate Form (5 cols) */}
          {!isLocked && (
            <div className="md:col-span-5">
              <VoxCard variant="layer-1" padding="lg">
                <h3 className="font-display font-bold text-lg text-vox-text-primary mb-2">
                  Add Candidate
                </h3>
                <p className="text-xs text-vox-text-secondary mb-4 leading-relaxed">
                  Appends candidate to on-chain array calling <code>addCandidate({electionId}, name)</code>.
                </p>

                {error && <VoxAlert variant="danger" title="Error" className="mb-3">{error}</VoxAlert>}
                {success && <VoxAlert variant="success" title="Candidate Added" className="mb-3">Candidate registered on-chain!</VoxAlert>}

                <form onSubmit={handleAddCandidate} className="flex flex-col gap-4">
                  <VoxInput
                    label="Candidate Full Name"
                    placeholder="e.g. Dr. Helena Vance"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    disabled={isAdding}
                  />

                  <VoxButton
                    variant="primary-gold"
                    type="submit"
                    isLoading={isAdding}
                    loadingText="Committing Tx..."
                    disabled={!candidateName.trim()}
                    icon={<UserPlus className="w-4 h-4" />}
                  >
                    Add Candidate to Ballot
                  </VoxButton>
                </form>
              </VoxCard>
            </div>
          )}

          {/* Candidate List (7 cols or full if locked) */}
          <div className={isLocked ? 'md:col-span-12' : 'md:col-span-7'}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-bold text-lg text-vox-text-primary">
                Current Registered Candidates ({candidates.length})
              </h3>
            </div>

            <div className="flex flex-col gap-3">
              {candidates.length === 0 ? (
                <VoxCard variant="layer-2" padding="lg" className="text-center text-xs text-vox-text-muted">
                  No candidates registered yet. Add at least 1 candidate before starting the election.
                </VoxCard>
              ) : (
                candidates.map((c) => (
                  <VoxCard key={c.id.toString()} variant="layer-2" padding="md" className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-vox-surface-3 border border-vox-border-subtle flex items-center justify-center text-vox-accent-gold font-mono font-bold text-xs">
                        #{c.id.toString()}
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-sm text-vox-text-primary">{c.name}</h4>
                        <span className="font-mono text-[11px] text-vox-text-muted">
                          Smart Contract Candidate ID: {c.id.toString()}
                        </span>
                      </div>
                    </div>

                    {election.ended && (
                      <span className="font-mono font-bold text-xs text-vox-accent-gold">
                        {Number(c.voteCount)} Votes
                      </span>
                    )}
                  </VoxCard>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
};
