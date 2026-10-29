import React, { useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { usePublicClient, useAccount } from 'wagmi';
import { useElection } from '../hooks/useElection';
import { useVoxChain } from '../hooks/useVoxChain';
import { VOX_CHAIN_ABI } from '../contracts/voxChainAbi';
import { AdminGuard } from '../components/admin/AdminGuard';
import { VoxCard } from '../components/common/VoxCard';
import { VoxButton } from '../components/common/VoxButton';
import { VoxBadge } from '../components/common/VoxBadge';
import { VoxAlert } from '../components/common/VoxAlert';
import { VoxModal } from '../components/common/VoxModal';
import { cn } from '../utils/cn';
import {
  ArrowLeft,
  Play,
  Square,
  Trophy,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Loader2,
  Lock,
  ShieldAlert,
} from 'lucide-react';
import { parseContractError } from '../hooks/useVoxChainRegistry';

export const AdminControlPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const contractParam = (searchParams.get('contract') as `0x${string}`) || undefined;
  const electionId = Number(id);
  const navigate = useNavigate();
  const publicClient = usePublicClient();
  const { address: userAddress } = useAccount();
  const {
    contractAddress,
    writeContractAsync,
    adminAddress,
    isUserAdmin,
    isAdminLoading,
  } = useVoxChain(contractParam);
  const { election, candidates, isLoading, refetchAll } = useElection(electionId, contractParam);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (isLoading || !election) {
    return (
      <div className="py-24 text-center flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white mb-4" />
        <span className="font-mono text-xs text-zinc-400">Loading Lifecycle Controls for Election #{id}...</span>
      </div>
    );
  }

  const isPending = !election.started && !election.ended;
  const isStarted = election.started && !election.ended;
  const isEnded = election.ended;
  const hasCandidates = candidates.length > 0;
  const contractQuery = contractParam ? `?contract=${contractParam}` : '';

  const handleStartElection = async () => {
    if (!hasCandidates || isProcessing) {
      if (!hasCandidates) {
        setError('Cannot start election: You must add at least one candidate first.');
      }
      return;
    }

    if (!isUserAdmin && adminAddress) {
      setError(
        `Only the designated administrator (${adminAddress.slice(0, 6)}...${adminAddress.slice(-4)}) can start this election.`
      );
      return;
    }

    setIsProcessing(true);
    setError(null);
    setActionSuccess(null);

    try {
      if (!contractAddress) {
        throw new Error('Election smart contract is not configured on this network.');
      }

      const hash = await writeContractAsync({
        address: contractAddress,
        abi: VOX_CHAIN_ABI,
        functionName: 'startElection',
        args: [BigInt(electionId)],
      });

      if (publicClient && hash) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      setActionSuccess('Election successfully started on-chain! Voting window is now OPEN.');
      setIsProcessing(false);
      await refetchAll();
    } catch (err: any) {
      setIsProcessing(false);
      setError(parseContractError(err));
    }
  };

  const handleEndElection = async () => {
    if (isProcessing) return;

    if (!isUserAdmin && adminAddress) {
      setError(
        `Only the designated administrator (${adminAddress.slice(0, 6)}...${adminAddress.slice(-4)}) can conclude this election.`
      );
      return;
    }

    setIsProcessing(true);
    setError(null);
    setActionSuccess(null);

    try {
      if (!contractAddress) {
        throw new Error('Election smart contract is not configured on this network.');
      }

      const hash = await writeContractAsync({
        address: contractAddress,
        abi: VOX_CHAIN_ABI,
        functionName: 'endElection',
        args: [BigInt(electionId)],
      });

      if (publicClient && hash) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      setActionSuccess('Election officially concluded! Cryptographic results are now sealed and certified.');
      setIsProcessing(false);
      await refetchAll();
    } catch (err: any) {
      setIsProcessing(false);
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

        {/* Master Controller Card */}
        <VoxCard variant="layer-1" padding="lg" className="border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                <span className="font-mono text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
                  Election Status & Controls
                </span>
              </div>
              <h1 className="font-display font-bold text-2xl md:text-3xl text-white tracking-tight">
                {election.name}
              </h1>
              <div className="flex items-center gap-3 mt-2 text-xs font-mono text-zinc-500">
                <span>ELECTION ID: #{electionId}</span>
                <span className="text-zinc-700">·</span>
                <span>ROSTER: {candidates.length} CANDIDATE{candidates.length === 1 ? '' : 'S'}</span>
                {contractAddress && (
                  <>
                    <span className="text-zinc-700">·</span>
                    <span>CONTRACT: {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}</span>
                  </>
                )}
              </div>
            </div>
            <div className="shrink-0">
              {isStarted && (
                <VoxBadge variant="success" dot={true} size="md">
                  Voting Window Open
                </VoxBadge>
              )}
              {isEnded && (
                <VoxBadge variant="neutral" size="md">
                  Concluded & Certified
                </VoxBadge>
              )}
              {isPending && (
                <VoxBadge variant="neutral" size="md">
                  Draft (Not Started)
                </VoxBadge>
              )}
            </div>
          </div>
        </VoxCard>

        {/* Sequential Lifecycle Progression Stepper */}
        <div className="flex items-center gap-3 px-1 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors',
                isStarted || isEnded
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : 'bg-white text-black border-white'
              )}
            >
              {isStarted || isEnded ? '✓' : '1'}
            </span>
            <span className={isStarted || isEnded ? 'text-zinc-400' : 'text-white font-semibold'}>
              Phase 1: Open Window
            </span>
          </div>
          <div
            className={cn(
              'flex-1 h-[1px] transition-colors',
              isStarted || isEnded ? 'bg-emerald-500/30' : 'bg-white/10'
            )}
          />
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors',
                isEnded
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : isStarted
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 ring-2 ring-rose-500/20'
                  : 'bg-white/[0.04] border-white/15 text-zinc-600'
              )}
            >
              {isEnded ? '✓' : '2'}
            </span>
            <span
              className={
                isEnded
                  ? 'text-zinc-400'
                  : isStarted
                  ? 'text-rose-200 font-semibold'
                  : 'text-zinc-600'
              }
            >
              Phase 2: Conclude & Seal
            </span>
          </div>
        </div>

        {error && (
          <VoxAlert variant="danger" title="Command Error">
            {error}
          </VoxAlert>
        )}
        {actionSuccess && (
          <VoxAlert variant="success" title="State Updated">
            {actionSuccess}
          </VoxAlert>
        )}

        {!isAdminLoading && adminAddress && !isUserAdmin && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-zinc-300">
              <div className="font-semibold text-amber-300">Admin Account Required for Lifecycle Controls</div>
              <p className="leading-relaxed">
                This election's lifecycle is managed by the designated administrator account. Please switch to the administrator account in your wallet to open polls or conclude this election.
              </p>
            </div>
          </div>
        )}

        {/* Lifecycle Phase Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Phase 1: Start Election Command */}
          <VoxCard
            variant="layer-1"
            padding="lg"
            className={cn(
              'border-white/10 flex flex-col justify-between transition-opacity',
              isEnded ? 'opacity-60' : ''
            )}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center border',
                      isStarted || isEnded
                        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                        : 'bg-white/[0.06] border-white/15 text-white'
                    )}
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-white">
                      1. Open Voting Window
                    </h3>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">
                      Candidate & Voter Lock
                    </span>
                  </div>
                </div>
                {isStarted && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    Active
                  </span>
                )}
              </div>

              <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
                Opens cryptographic voting for all registered voters. Once started, the candidate
                roster and voter registry lock immutably to guarantee integrity.
              </p>

              {/* Phase 1 Checklist */}
              <div className="p-3.5 bg-black/40 rounded-xl border border-white/[0.07] flex flex-col gap-2.5 text-xs font-mono mb-6">
                <div className="flex items-center gap-2.5">
                  {hasCandidates ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <span className={hasCandidates ? 'text-zinc-300' : 'text-amber-300'}>
                    At least 1 candidate added ({candidates.length} registered)
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  {isStarted || isEnded ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-white/20 inline-block shrink-0" />
                  )}
                  <span className={isStarted || isEnded ? 'text-zinc-300' : 'text-zinc-400'}>
                    {isStarted || isEnded
                      ? 'Polls opened and voting initiated'
                      : 'Election not yet started'}
                  </span>
                </div>
              </div>
            </div>

            {/* Phase 1 Action / Status */}
            <div>
              {isPending && (
                <VoxButton
                  variant="primary"
                  className="w-full"
                  disabled={!hasCandidates || isProcessing || (!isAdminLoading && !isUserAdmin && Boolean(adminAddress))}
                  isLoading={isProcessing}
                  loadingText="Opening Polls..."
                  icon={<Play className="w-3.5 h-3.5" />}
                  onClick={handleStartElection}
                >
                  {!isAdminLoading && !isUserAdmin && Boolean(adminAddress)
                    ? 'Admin Wallet Required'
                    : 'Start Election & Open Polls'}
                </VoxButton>
              )}

              {isStarted && (
                <div className="flex items-center justify-between p-3 bg-emerald-500/[0.05] border border-emerald-500/25 rounded-xl font-mono text-xs text-emerald-300">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    <span className="font-semibold text-[11px] tracking-wide">
                      POLLS ACTIVELY ACCEPTING BALLOTS
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400/70 uppercase">Window Live</span>
                </div>
              )}

              {isEnded && (
                <div className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/10 rounded-xl font-mono text-xs text-zinc-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-zinc-500" />
                    <span className="text-[11px]">PHASE 1 COMPLETE · VOTING CONCLUDED</span>
                  </div>
                </div>
              )}
            </div>
          </VoxCard>

          {/* Phase 2: End Election Command */}
          <VoxCard
            variant="layer-1"
            padding="lg"
            className={cn(
              'border-white/10 flex flex-col justify-between transition-opacity',
              isPending ? 'opacity-60' : ''
            )}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center border',
                      isEnded
                        ? 'bg-zinc-800/80 border-white/10 text-zinc-400'
                        : isStarted
                        ? 'bg-rose-500/10 border-rose-500/25 text-rose-300'
                        : 'bg-white/[0.02] border-white/10 text-zinc-600'
                    )}
                  >
                    <Square className={cn('w-4 h-4', isStarted ? 'fill-rose-400/40' : '')} />
                  </div>
                  <div>
                    <h3
                      className={cn(
                        'font-display font-bold text-base',
                        isStarted ? 'text-white' : 'text-zinc-400'
                      )}
                    >
                      2. Close & Seal Election
                    </h3>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">
                      Cryptographic Consensus Seal
                    </span>
                  </div>
                </div>
                {isEnded && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] border border-white/15 text-zinc-300">
                    Sealed
                  </span>
                )}
              </div>

              <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
                Closes the ballot box permanently. No more votes can be cast, and the cryptographic
                results become certified forever on-chain.
              </p>

              {/* Phase 2 Checklist */}
              <div className="p-3.5 bg-black/40 rounded-xl border border-white/[0.07] flex flex-col gap-2.5 text-xs font-mono mb-6">
                <div className="flex items-center gap-2.5">
                  {isStarted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : isEnded ? (
                    <CheckCircle2 className="w-4 h-4 text-zinc-500 shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-white/20 inline-block shrink-0" />
                  )}
                  <span className={isStarted ? 'text-zinc-300' : 'text-zinc-500'}>
                    {isStarted
                      ? 'Voting window is currently active'
                      : isEnded
                      ? 'Voting window concluded'
                      : 'Voting must be active before closing'}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Lock
                    className={cn(
                      'w-4 h-4 shrink-0',
                      isEnded
                        ? 'text-zinc-500'
                        : isStarted
                        ? 'text-rose-400/80'
                        : 'text-zinc-600'
                    )}
                  />
                  <span className={isStarted ? 'text-rose-300/90' : 'text-zinc-500'}>
                    {isEnded
                      ? 'Consensus permanently certified on-chain'
                      : 'Permanent commitment · Irreversible on-chain'}
                  </span>
                </div>
              </div>
            </div>

            {/* Phase 2 Action / Status */}
            <div>
              {isEnded ? (
                <Link to={`/election/${electionId}/results${contractQuery}`} className="w-full block">
                  <VoxButton
                    variant="primary"
                    className="w-full"
                    icon={<Trophy className="w-4 h-4 text-black" />}
                  >
                    View Certified Results
                  </VoxButton>
                </Link>
              ) : isStarted ? (
                <VoxButton
                  variant="danger"
                  size="md"
                  className="w-full shadow-[0_0_24px_rgba(244,63,94,0.18)]"
                  disabled={isProcessing || (!isAdminLoading && !isUserAdmin && Boolean(adminAddress))}
                  isLoading={isProcessing}
                  loadingText="Sealing Results..."
                  icon={<Square className="w-3.5 h-3.5 fill-current" />}
                  onClick={() => setShowConfirmModal(true)}
                >
                  {!isAdminLoading && !isUserAdmin && Boolean(adminAddress)
                    ? 'Admin Wallet Required'
                    : 'Conclude Election & Seal Results'}
                </VoxButton>
              ) : (
                <VoxButton
                  variant="outline"
                  className="w-full opacity-40 cursor-not-allowed"
                  disabled={true}
                  icon={<Lock className="w-3.5 h-3.5" />}
                >
                  Awaiting Election Launch
                </VoxButton>
              )}
            </div>
          </VoxCard>
        </div>

        {/* Confirmation Modal Safeguard */}
        <VoxModal
          isOpen={showConfirmModal}
          onClose={() => !isProcessing && setShowConfirmModal(false)}
          title="Confirm Election Finalization"
          maxWidth="md"
        >
          <div className="flex flex-col gap-5 pt-2">
            <div className="p-4 bg-rose-500/[0.08] border border-rose-500/25 rounded-xl flex items-start gap-3 text-xs font-mono text-rose-300">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="text-white block mb-1">IRREVERSIBLE ON-CHAIN TRANSACTION</strong>
                You are about to permanently close voting for{' '}
                <span className="text-white font-bold">{election.name}</span> (#{electionId}).
                Once confirmed, no additional ballots can ever be cast, and the certified tally will
                be locked forever.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <VoxButton
                variant="outline"
                size="sm"
                disabled={isProcessing}
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel / Keep Open
              </VoxButton>
              <VoxButton
                variant="danger"
                size="sm"
                isLoading={isProcessing}
                loadingText="Sealing Results..."
                icon={<Square className="w-3.5 h-3.5 fill-current" />}
                onClick={async () => {
                  await handleEndElection();
                  setShowConfirmModal(false);
                }}
              >
                Confirm & Seal Now
              </VoxButton>
            </div>
          </div>
        </VoxModal>
      </div>
    </AdminGuard>
  );
};

