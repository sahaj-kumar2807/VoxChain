import React from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useElection } from '../../hooks/useElection';
import { VoxBadge } from '../common/VoxBadge';
import { VoxButton } from '../common/VoxButton';
import { Vote, Trophy, Lock, CheckCircle2, ArrowRight, Users, ShieldCheck, Sparkles } from 'lucide-react';
import type { ElectionFilter } from '../../types';

export interface ElectionHubCardProps {
  electionId: number;
  filter?: ElectionFilter;
  contractAddress?: `0x${string}`;
}

export const ElectionHubCard: React.FC<ElectionHubCardProps> = ({
  electionId,
  filter = 'all',
  contractAddress,
}) => {
  const { isConnected } = useAccount();
  const { election, candidates, isEligible, hasVoted, isLoading } = useElection(
    electionId,
    contractAddress
  );

  if (isLoading || !election) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-stone-800/80 bg-gradient-to-b from-[#181618]/90 to-[#0F0E11]/95 p-6 sm:p-7 animate-pulse shadow-lg">
        <div className="h-5 bg-stone-800/80 rounded w-1/3 mb-4" />
        <div className="h-8 bg-stone-800/60 rounded w-3/4 mb-3" />
        <div className="h-4 bg-stone-800/50 rounded w-1/2 mb-6" />
        <div className="h-10 bg-stone-800/70 rounded w-full" />
      </div>
    );
  }

  const isStarted = election.started && !election.ended;
  const isEnded = election.ended;
  const isPending = !election.started && !election.ended;

  if (filter === 'active' && !isStarted) return null;
  if (filter === 'upcoming' && !isPending) return null;
  if (filter === 'concluded' && !isEnded) return null;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-white/12 hover:border-[#818CF8]/60 bg-gradient-to-b from-[#0E0E16]/95 via-[#08080C]/98 to-[#030305] p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_-10px_rgba(99,102,241,0.22)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_12px_36px_rgba(0,0,0,0.8)] overflow-hidden">
      {/* Top ambient electric violet hairline */}
      <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#818CF8]/70 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

      {/* Subtle hover spotlight in corner */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#6366F1]/15 rounded-full blur-2xl pointer-events-none group-hover:bg-[#6366F1]/25 transition-all duration-500" />

      <div className="relative z-10">
        {/* Top Status & Ballot Tag */}
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/10 text-[10px] font-mono font-semibold text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-[#818CF8] shadow-[0_0_8px_#818CF8]" />
            <span>BALLOT #{electionId.toString().padStart(2, '0')}</span>
          </div>

          {isStarted && (
            <VoxBadge variant="success" dot={true}>
              Voting Open
            </VoxBadge>
          )}
          {isEnded && (
            <VoxBadge variant="gold" dot={false} className="flex items-center gap-1">
              <Trophy className="w-3 h-3 text-[#A5B4FC]" />
              <span>Concluded</span>
            </VoxBadge>
          )}
          {isPending && (
            <VoxBadge variant="neutral" dot={false} className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-zinc-400" />
              <span>Upcoming</span>
            </VoxBadge>
          )}
        </div>

        {/* Civic Protocol Kicker */}
        <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#818CF8] font-semibold block mb-1">
          Civic Consensus Balloting
        </span>

        {/* Title */}
        <h3 className="font-display font-bold text-xl sm:text-2xl text-white group-hover:text-[#A5B4FC] transition-colors line-clamp-2 mb-3.5 tracking-tight">
          {election.name}
        </h3>

        {/* Metadata Chips: Candidate Count & Voter Eligibility */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-[11px] font-mono text-zinc-300">
            <Users className="w-3.5 h-3.5 text-[#818CF8]" />
            <span>{candidates.length} Candidate{candidates.length === 1 ? '' : 's'}</span>
          </div>

          {isConnected && isEligible && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-mono text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Eligible</span>
            </div>
          )}

          {isConnected && !isEligible && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/[0.02] border border-white/10 text-[11px] font-mono text-zinc-500">
              <span>Not Registered</span>
            </div>
          )}
        </div>

        {/* Subtle Civic Lifecycle Tracker */}
        <div className="pt-2 pb-1">
          <div className="w-full bg-white/[0.08] rounded-full h-1 overflow-hidden">
            {isStarted ? (
              <div className="h-full bg-gradient-to-r from-emerald-500 via-[#6366F1] to-[#38BDF8] rounded-full animate-pulse w-full" />
            ) : isEnded ? (
              <div className="h-full bg-gradient-to-r from-[#6366F1] to-[#818CF8] rounded-full w-full" />
            ) : (
              <div className="h-full bg-white/20 rounded-full w-1/4" />
            )}
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mt-2">
            <span>
              {isStarted
                ? 'Voting is Live'
                : isEnded
                ? 'Official Results Certified'
                : 'Not Started Yet'}
            </span>
            <span className={isStarted ? 'text-emerald-400 font-semibold' : isEnded ? 'text-[#A5B4FC] font-semibold' : 'text-zinc-500'}>
              {isStarted ? 'Active' : isEnded ? 'Finalized' : 'Upcoming'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      {(() => {
        const query = contractAddress ? `?contract=${contractAddress}` : '';
        return (
          <div className="pt-5 mt-5 border-t border-white/10 relative z-10">
            {isEnded ? (
              <Link to={`/election/${electionId}/results${query}`} className="w-full block">
                <VoxButton
                  variant="outline"
                  size="md"
                  className="w-full border-white/20 bg-white/[0.04] hover:bg-[#6366F1]/15 text-white hover:border-[#818CF8] shadow-sm"
                  icon={<Trophy className="w-4 h-4 text-[#818CF8]" />}
                >
                  View Certified Results
                </VoxButton>
              </Link>
            ) : hasVoted ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 font-semibold shadow-[0_0_16px_rgba(16,185,129,0.2)]">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Ballot Sealed on Chain</span>
                </span>
                <Link
                  to={`/election/${electionId}${query}`}
                  className="text-white hover:text-[#A5B4FC] transition-colors hover:underline font-mono text-[11px] flex items-center gap-1"
                >
                  <span>View</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ) : isStarted ? (
              <Link to={`/election/${electionId}${query}`} className="w-full block">
                <VoxButton
                  variant="primary-gold"
                  size="md"
                  className="w-full !text-black font-extrabold tracking-wider"
                  icon={isEligible ? <Sparkles className="w-4 h-4 text-black" /> : <Vote className="w-4 h-4 text-black" />}
                >
                  {isEligible ? 'Cast Your Ballot →' : 'View Ballot Details'}
                </VoxButton>
              </Link>
            ) : (
              <Link to={`/election/${electionId}${query}`} className="w-full block">
                <VoxButton
                  variant="outline"
                  size="md"
                  className="w-full text-zinc-400 border-white/10 hover:border-white/25"
                  icon={<Lock className="w-4 h-4 text-zinc-500" />}
                >
                  View Preview (Not Started)
                </VoxButton>
              </Link>
            )}
          </div>
        );
      })()}
    </div>
  );
};

