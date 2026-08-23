import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useElection } from '../hooks/useElection';
import { useVoxChain } from '../hooks/useVoxChain';
import { VOX_CHAIN_ABI } from '../contracts/voxChainAbi';
import { AdminGuard } from '../components/admin/AdminGuard';
import { VoxCard } from '../components/common/VoxCard';
import { VoxButton } from '../components/common/VoxButton';
import { VoxBadge } from '../components/common/VoxBadge';
import { VoxAlert } from '../components/common/VoxAlert';
import { ArrowLeft, Play, Square, Trophy, CheckCircle2, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';

export const AdminControlPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const electionId = Number(id);
  const navigate = useNavigate();
  const { contractAddress, writeContractAsync } = useVoxChain();
  const { election, candidates, isLoading, refetchAll } = useElection(electionId);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  if (isLoading || !election) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-vox-accent-gold mb-4" />
        <span className="font-mono text-xs text-vox-text-muted">Loading Lifecycle Controls for Election #{id}...</span>
      </div>
    );
  }

  const isPending = !election.started && !election.ended;
  const isStarted = election.started && !election.ended;
  const isEnded = election.ended;
  const hasCandidates = candidates.length > 0;

  const handleStartElection = async () => {
    if (!hasCandidates) {
      setError('Cannot start election: You must add at least one candidate first.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setActionSuccess(null);

    try {
      await writeContractAsync({
        address: contractAddress,
        abi: VOX_CHAIN_ABI,
        functionName: 'startElection',
        args: [BigInt(electionId)],
      });

      setActionSuccess('Election successfully started on-chain! Voting window is now OPEN.');
      setIsProcessing(false);
      refetchAll();
    } catch (err: any) {
      setIsProcessing(false);
      setError(err?.shortMessage || err?.message || 'Transaction failed');
    }
  };

  const handleEndElection = async () => {
    setIsProcessing(true);
    setError(null);
    setActionSuccess(null);

    try {
      await writeContractAsync({
        address: contractAddress,
        abi: VOX_CHAIN_ABI,
        functionName: 'endElection',
        args: [BigInt(electionId)],
      });

      setActionSuccess('Election officially concluded! Cryptographic results are now sealed and certified.');
      setIsProcessing(false);
      refetchAll();
    } catch (err: any) {
      setIsProcessing(false);
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
            <span className="font-mono text-xs font-semibold text-vox-accent-gold uppercase tracking-wider block mb-1">
              On-Chain Lifecycle Controller
            </span>
            <h1 className="font-display font-bold text-2xl text-vox-text-primary">
              {election.name}
            </h1>
          </div>
          <div>
            {isStarted && <VoxBadge variant="success" dot={true}>Voting Window Open</VoxBadge>}
            {isEnded && <VoxBadge variant="gold">Concluded & Certified</VoxBadge>}
            {isPending && <VoxBadge variant="neutral">Draft (Not Started)</VoxBadge>}
          </div>
        </div>

        {error && <VoxAlert variant="danger" title="Command Error">{error}</VoxAlert>}
        {actionSuccess && <VoxAlert variant="success" title="State Updated">{actionSuccess}</VoxAlert>}

        {/* Lifecycle Phase Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Phase 1: Start Election Command */}
          <VoxCard variant="layer-1" padding="lg" className={isStarted || isEnded ? 'opacity-60' : ''}>
            <div className="flex items-center gap-2 mb-2">
              <Play className="w-5 h-5 text-vox-state-success" />
              <h3 className="font-display font-bold text-lg text-vox-text-primary">
                1. Open Voting Window
              </h3>
            </div>
            <p className="text-xs text-vox-text-secondary mb-4 leading-relaxed">
              Invokes smart contract function <code>startElection({electionId})</code>. Locks candidate roster and
              voter registration, and permits registered voters to cast immutable ballots.
            </p>

            {/* Checklist */}
            <div className="p-3.5 bg-vox-surface-2 rounded-xl border border-vox-border-subtle flex flex-col gap-2 text-xs font-mono mb-6">
              <div className="flex items-center gap-2">
                {hasCandidates ? (
                  <CheckCircle2 className="w-4 h-4 text-vox-state-success" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-vox-state-warning" />
                )}
                <span>At least 1 candidate added ({candidates.length} currently)</span>
              </div>
              <div className="flex items-center gap-2">
                {!election.started ? (
                  <CheckCircle2 className="w-4 h-4 text-vox-state-success" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-vox-text-muted" />
                )}
                <span>Election not yet started</span>
              </div>
            </div>

            <VoxButton
              variant="primary-gold"
              className="w-full"
              disabled={!isPending || !hasCandidates || isProcessing}
              isLoading={isProcessing && isPending}
              loadingText="Opening Polls..."
              icon={<Play className="w-4 h-4" />}
              onClick={handleStartElection}
            >
              {isPending ? 'Start Election & Open Polls' : 'Election Already Started'}
            </VoxButton>
          </VoxCard>

          {/* Phase 2: End Election Command */}
          <VoxCard variant="layer-1" padding="lg" className={!isStarted ? 'opacity-60' : ''}>
            <div className="flex items-center gap-2 mb-2">
              <Square className="w-5 h-5 text-vox-state-danger" />
              <h3 className="font-display font-bold text-lg text-vox-text-primary">
                2. Close & Seal Election
              </h3>
            </div>
            <p className="text-xs text-vox-text-secondary mb-4 leading-relaxed">
              Invokes smart contract function <code>endElection({electionId})</code>. Permanently closes the voting
              window, calculates on-chain consensus, and publishes certified results.
            </p>

            <div className="p-3.5 bg-vox-surface-2 rounded-xl border border-vox-border-subtle flex flex-col gap-2 text-xs font-mono mb-6">
              <div className="flex items-center gap-2">
                {isStarted ? (
                  <CheckCircle2 className="w-4 h-4 text-vox-state-success" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-vox-text-muted inline-block" />
                )}
                <span>Voting window must be currently active</span>
              </div>
              <div className="flex items-center gap-2">
                {!isEnded ? (
                  <CheckCircle2 className="w-4 h-4 text-vox-state-success" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-vox-accent-gold" />
                )}
                <span>Irreversible on-chain termination</span>
              </div>
            </div>

            {isEnded ? (
              <Link to={`/election/${electionId}/results`} className="w-full block">
                <VoxButton variant="outline" className="w-full" icon={<Trophy className="w-4 h-4 text-vox-accent-gold" />}>
                  View Certified Results
                </VoxButton>
              </Link>
            ) : (
              <VoxButton
                variant="danger"
                className="w-full"
                disabled={!isStarted || isProcessing}
                isLoading={isProcessing && isStarted}
                loadingText="Sealing Results..."
                icon={<Square className="w-4 h-4" />}
                onClick={handleEndElection}
              >
                Conclude Election & Seal Results
              </VoxButton>
            )}
          </VoxCard>
        </div>
      </div>
    </AdminGuard>
  );
};
