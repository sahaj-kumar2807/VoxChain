import React, { useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { usePublicClient, useAccount } from 'wagmi';
import { useElection } from '../hooks/useElection';
import { useVoxChain } from '../hooks/useVoxChain';
import { useVoxChainRegistry } from '../hooks/useVoxChainRegistry';
import { VOX_CHAIN_ABI } from '../contracts/voxChainAbi';
import { AdminGuard } from '../components/admin/AdminGuard';
import { VoxCard } from '../components/common/VoxCard';
import { VoxInput } from '../components/common/VoxInput';
import { VoxButton } from '../components/common/VoxButton';
import { VoxBadge } from '../components/common/VoxBadge';
import { VoxAlert } from '../components/common/VoxAlert';
import { ArrowLeft, UserPlus, Users, Loader2, CheckCircle2, User, ShieldAlert } from 'lucide-react';
import { parseContractError } from '../hooks/useVoxChainRegistry';

export const AdminCandidatesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const contractParam = (searchParams.get('contract') as `0x${string}`) || undefined;
  const electionId = Number(id);
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const { isSuperAdmin } = useVoxChainRegistry();
  const {
    contractAddress,
    writeContractAsync,
    adminAddress,
    isUserAdmin,
    isAdminLoading,
  } = useVoxChain(contractParam);
  const { election, candidates, isLoading, refetchAll } = useElection(electionId, contractParam);

  const [candidateName, setCandidateName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (isLoading || !election) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white mb-4" />
        <span className="font-mono text-xs text-vox-text-muted">Loading Election #{id}...</span>
      </div>
    );
  }

  const isLocked = election.started || election.ended;

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim() || isAdding) {
      if (!candidateName.trim()) {
        setError('Candidate name cannot be empty');
      }
      return;
    }

    if (!isUserAdmin && adminAddress) {
      setError(
        `Only the designated administrator (${adminAddress.slice(0, 6)}...${adminAddress.slice(-4)}) can add candidates to this ballot.`
      );
      return;
    }

    setIsAdding(true);
    setError(null);
    setSuccess(false);

    try {
      if (!contractAddress) {
        throw new Error('Election smart contract is not configured on this network.');
      }

      const hash = await writeContractAsync({
        address: contractAddress,
        abi: VOX_CHAIN_ABI,
        functionName: 'addCandidate',
        args: [BigInt(electionId), candidateName.trim()],
      });

      if (publicClient && hash) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      setSuccess(true);
      setCandidateName('');
      setIsAdding(false);
      await refetchAll();
    } catch (err: any) {
      setIsAdding(false);
      setError(parseContractError(err));
    }
  };

  return (
    <AdminGuard>
      <div className="max-w-4xl mx-auto py-8 flex flex-col gap-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <Link
            to={contractParam ? `/admin?contract=${contractParam}` : '/admin'}
            className="flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Admin Dashboard</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <span>Election #{electionId}</span>
            <span className="text-zinc-700">·</span>
            <span className="text-zinc-300 font-medium">{election.name}</span>
          </div>
        </div>

        {/* Master Header Card */}
        <VoxCard variant="layer-1" padding="lg" className="border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Users className="w-3.5 h-3.5 text-zinc-400" />
                <span className="font-mono text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
                  Ballot Configuration
                </span>
              </div>
              <h1 className="font-display font-bold text-2xl md:text-3xl text-white tracking-tight">
                Candidate Roster Management
              </h1>
              <div className="flex items-center gap-3 mt-2 text-xs font-mono text-zinc-500">
                <span>ELECTION ID: #{electionId}</span>
                <span className="text-zinc-700">·</span>
                <span>REGISTERED: {candidates.length} CANDIDATE{candidates.length === 1 ? '' : 'S'}</span>
              </div>
            </div>
            <div className="shrink-0">
              {election.started && <VoxBadge variant="success" dot={true}>Voting Window Open (Locked)</VoxBadge>}
              {election.ended && <VoxBadge variant="neutral">Election Ended (Locked)</VoxBadge>}
              {!election.started && !election.ended && (
                <VoxBadge variant="neutral">Roster Open for Editing</VoxBadge>
              )}
            </div>
          </div>
        </VoxCard>

        {/* Lock Warning if Started */}
        {isLocked && (
          <VoxAlert variant="warning" title="Candidate Roster Locked">
            This election has already started or concluded. No additional candidates can be added once voting opens.
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
                  Register a candidate name to appear on this election's ballot.
                </p>

                {!isAdminLoading && adminAddress && !isUserAdmin && (
                  <div className="mb-4 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-zinc-300 space-y-1.5">
                    <div className="flex items-center gap-2 text-amber-400 font-semibold">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>Admin Account Required</span>
                    </div>
                    <p className="leading-relaxed">
                      Only the designated administrator can add candidates to this ballot. Please switch to the administrator account in your wallet.
                    </p>
                  </div>
                )}

                {error && <VoxAlert variant="danger" title="Error" className="mb-3">{error}</VoxAlert>}
                {success && <VoxAlert variant="success" title="Candidate Added" className="mb-3">Candidate registered successfully!</VoxAlert>}

                <form onSubmit={handleAddCandidate} className="flex flex-col gap-4">
                  <VoxInput
                    label="Candidate Full Name"
                    placeholder="e.g. Dr. Helena Vance"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    disabled={isAdding || (!isAdminLoading && !isUserAdmin && Boolean(adminAddress))}
                  />

                  <VoxButton
                    variant="primary"
                    type="submit"
                    isLoading={isAdding}
                    loadingText="Adding candidate..."
                    disabled={!candidateName.trim() || (!isAdminLoading && !isUserAdmin && Boolean(adminAddress))}
                    icon={<UserPlus className="w-4 h-4" />}
                  >
                    {!isAdminLoading && !isUserAdmin && Boolean(adminAddress)
                      ? 'Admin Wallet Required'
                      : 'Add Candidate to Ballot'}
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
                      <div className="w-9 h-9 rounded-lg bg-vox-surface-3 border border-vox-border-subtle flex items-center justify-center text-[#D8D8D8] font-mono font-bold text-xs">
                        #{c.id.toString()}
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-sm text-vox-text-primary">{c.name}</h4>
                        <span className="font-mono text-[11px] text-vox-text-muted">
                          Candidate #{c.id.toString()}
                        </span>
                      </div>
                    </div>

                    {election.ended && (
                      <span className="font-mono font-bold text-xs text-[#FFFFFF]">
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
