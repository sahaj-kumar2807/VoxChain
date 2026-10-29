import React from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useElection } from '../hooks/useElection';
import { useVoxChain } from '../hooks/useVoxChain';
import { VoxCard } from '../components/common/VoxCard';
import { VoxBadge } from '../components/common/VoxBadge';
import { VoxButton } from '../components/common/VoxButton';
import { VoxAlert } from '../components/common/VoxAlert';
import { Trophy, CheckCircle2, AlertTriangle, ArrowLeft, ArrowRight, User, Scale } from 'lucide-react';
import { computeElectionOutcome } from '../utils/electionUtils';

export const ElectionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const contractParam = (searchParams.get('contract') as `0x${string}`) || undefined;
  const electionId = Number(id);
  const { isConnected, address } = useAccount();
  const { contractAddress } = useVoxChain(contractParam);
  const { election, candidates, results, isEligible, hasVoted, isLoading } = useElection(electionId, contractParam);

  if (isLoading || !election) {
    return (
      <div className="py-24 text-center flex flex-col items-center justify-center">
        <div className="w-7 h-7 rounded-full border-2 border-white/20 border-t-white animate-spin mb-4" />
        <span className="font-mono text-xs text-[#A5A5A5]">Fetching On-Chain Election #{id}...</span>
      </div>
    );
  }

  const isStarted = election.started && !election.ended;
  const isEnded = election.ended;
  const isPending = !election.started && !election.ended;

  const outcome = computeElectionOutcome(results);
  const isDraw = isEnded && outcome.isDraw;

  return (
    <div className="flex flex-col gap-10 py-6 max-w-5xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#727272]">
        <Link to="/dashboard" className="hover:text-white transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Elections Hub
        </Link>
        <span>/</span>
        <span className="text-[#A5A5A5]">Election #{electionId}</span>
      </div>

      {/* Main Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 bg-[#101010] border border-white/16 rounded-2xl shadow-[var(--shadow-ambient)]">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-[#171717] text-[#D8D8D8] border border-white/[0.09]">
              BALLOT #{electionId.toString().padStart(2, '0')}
            </span>
            {isStarted && <VoxBadge variant="success" dot={true}>Voting Open</VoxBadge>}
            {isDraw && <VoxBadge variant="warning" dot={true}>Draw · Re-election Required</VoxBadge>}
            {isEnded && !isDraw && <VoxBadge variant="gold">Concluded</VoxBadge>}
            {isPending && <VoxBadge variant="neutral">Upcoming</VoxBadge>}
          </div>
          <h1 className="font-display font-medium text-3xl sm:text-4xl text-[#F4F4F4] mb-2 tracking-tight">
            {election.name}
          </h1>
          <p className="text-xs text-zinc-400">
            Official Ballot · Secure On-Chain Voting
          </p>
        </div>

        {/* Primary Action Button */}
        <div>
          {isEnded ? (
            <Link to={`/election/${electionId}/results${contractParam ? `?contract=${contractParam}` : ''}`}>
              <VoxButton
                variant={isDraw ? 'primary' : 'primary'}
                className={isDraw ? 'bg-amber-400 hover:bg-amber-300 text-black border-amber-400 font-bold' : ''}
                icon={isDraw ? <Scale className="w-4 h-4 text-black" /> : <Trophy className="w-4 h-4" />}
              >
                {isDraw ? 'View Draw Results' : 'View Certified Results'}
              </VoxButton>
            </Link>
          ) : hasVoted ? (
            <div className="p-3 bg-[#6EE7B7]/08 border border-[#6EE7B7]/25 rounded-xl flex items-center gap-2 text-xs font-semibold text-[#6EE7B7]">
              <CheckCircle2 className="w-4 h-4" />
              <span>You Have Voted</span>
            </div>
          ) : isStarted ? (
            <Link to={`/election/${electionId}/vote${contractParam ? `?contract=${contractParam}` : ''}`}>
              <VoxButton variant="primary" size="lg" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                {isEligible ? 'Proceed to Ballot →' : 'View Candidate Roster'}
              </VoxButton>
            </Link>
          ) : (
            <VoxBadge variant="neutral" size="md">
              Election Not Yet Started
            </VoxBadge>
          )}
        </div>
      </div>

      {/* Draw Notice Alert */}
      {isDraw && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs font-mono text-amber-200">
          <Scale className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-white block font-sans text-sm mb-0.5">Election Result: DRAW (Deadlock)</strong>
            This election concluded in a tie for 1st place with {outcome.topVoteCount} votes each between{' '}
            <span className="text-white font-semibold">
              {outcome.topCandidates.map((c) => c.name).join(' & ')}
            </span>
            . To maintain electoral integrity, no single candidate is declared winner. A re-election must be held.
          </div>
        </div>
      )}

      {/* Grid: 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Candidate Roster */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-medium text-xl text-[#F4F4F4] tracking-tight">
              Registered Candidate Roster ({candidates.length})
            </h3>
            <span className="font-mono text-xs text-[#727272]">Verified on Blockchain</span>
          </div>

          <div className="flex flex-col gap-4">
            {candidates.length === 0 ? (
              <VoxCard variant="layer-1" padding="lg" className="text-center text-xs text-[#727272] border-white/10">
                No candidates registered for this election yet.
              </VoxCard>
            ) : (
              candidates.map((cand) => (
                <VoxCard key={cand.id.toString()} variant="layer-2" padding="md" className="flex items-start gap-4 border-white/10">
                  <div className="w-10 h-10 rounded-lg bg-[#171717] border border-white/16 flex items-center justify-center text-[#D8D8D8] shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-display font-semibold text-base text-[#F4F4F4]">{cand.name}</h4>
                      <span className="font-mono text-xs text-[#727272]">Candidate #{cand.id.toString()}</span>
                    </div>
                    <p className="text-xs text-[#A5A5A5] leading-relaxed">
                      Official nominee registered for this election.
                    </p>
                  </div>
                </VoxCard>
              ))
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Eligibility & Status */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <VoxCard variant="layer-1" padding="lg" className="flex flex-col gap-5 border-white/10">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#D8D8D8]">
              Your Voter Status
            </h3>

            {isConnected && address ? (
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-white/[0.08]">
                  <span className="text-[#A5A5A5]">Wallet Status:</span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Connected
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-white/[0.08]">
                  <span className="text-[#A5A5A5]">Eligible to Vote:</span>
                  {isEligible ? (
                    <span className="text-[#6EE7B7] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Registered
                    </span>
                  ) : (
                    <span className="text-[#FCD34D] font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Not Registered
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-white/[0.08]">
                  <span className="text-[#A5A5A5]">Voting Status:</span>
                  {hasVoted ? (
                    <span className="text-[#6EE7B7] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Already Voted
                    </span>
                  ) : (
                    <span className="text-[#727272] font-mono">Not Voted Yet</span>
                  )}
                </div>
              </div>
            ) : (
              <VoxAlert variant="info" title="Wallet Not Connected">
                Connect your wallet to check if you are registered to vote in this election.
              </VoxAlert>
            )}

            {/* Status Summary */}
            <div className="pt-4 border-t border-white/[0.08] flex flex-col gap-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-[#A5A5A5]">Election Status:</span>
                <span className={election.ended ? 'text-[#D8D8D8]' : election.started ? 'text-[#6EE7B7]' : 'text-[#A5A5A5]'}>
                  {election.ended ? 'Concluded' : election.started ? 'Live & Active' : 'Upcoming'}
                </span>
              </div>
            </div>
          </VoxCard>
        </div>
      </div>
    </div>
  );
};
