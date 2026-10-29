import React from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useElection } from '../hooks/useElection';
import { useVoxChain } from '../hooks/useVoxChain';
import { VoxCard } from '../components/common/VoxCard';
import { VoxBadge } from '../components/common/VoxBadge';
import { VoxButton } from '../components/common/VoxButton';
import {
  Trophy,
  ArrowLeft,
  Download,
  Award,
  Scale,
  RefreshCw,
  Users,
} from 'lucide-react';
import { computeElectionOutcome, buildReElectionUrl } from '../utils/electionUtils';

export const ResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const contractParam = (searchParams.get('contract') as `0x${string}`) || undefined;
  const electionId = Number(id);
  const { contractAddress, isUserAdmin } = useVoxChain(contractParam);
  const { election, results, isLoading } = useElection(electionId, contractParam);

  if (isLoading || !election) {
    return (
      <div className="py-24 text-center flex flex-col items-center justify-center">
        <div className="w-7 h-7 rounded-full border-2 border-white/20 border-t-white animate-spin mb-4" />
        <span className="font-mono text-xs text-[#A5A5A5]">Loading certified election results...</span>
      </div>
    );
  }

  // Calculate election tally outcome with proper draw / tie detection
  const {
    totalVotes,
    topVoteCount,
    topCandidates,
    isDraw,
    hasNoVotes,
    winner,
    rankings,
  } = computeElectionOutcome(results);

  const reElectionUrl = buildReElectionUrl(election.name, contractParam);

  const downloadResultsJson = () => {
    try {
      const exportData = {
        electionId,
        electionName: election.name,
        contractAddress,
        totalVotes,
        certifiedAt: new Date().toISOString(),
        outcome: isDraw ? 'DRAW' : winner ? 'DECIDED' : 'NO_VOTES',
        isDraw,
        reelectionRequired: isDraw,
        winner: winner ? { id: Number(winner.id), name: winner.name, voteCount: Number(winner.voteCount) } : null,
        tiedCandidates: isDraw
          ? topCandidates.map((c) => ({
              candidateId: Number(c.id),
              name: c.name,
              voteCount: Number(c.voteCount),
            }))
          : [],
        results: rankings.map((r) => ({
          candidateId: Number(r.candidate.id),
          name: r.candidate.name,
          voteCount: r.count,
          percentage: r.percentage.toFixed(2) + '%',
          rank: r.rank,
          isTied: r.isTied,
        })),
      };

      const jsonStr = JSON.stringify(
        exportData,
        (_, value) => (typeof value === 'bigint' ? value.toString() : value),
        2
      );
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voxchain-election-${electionId}-results.json`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 500);
    } catch (err) {
      console.error('[VOXCHAIN] Failed to download results JSON:', err);
    }
  };

  return (
    <div className="flex flex-col gap-8 py-6 max-w-4xl mx-auto">
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between border-b border-white/[0.09] pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-[#727272]">
          <Link
            to={contractParam ? `/election/${electionId}?contract=${contractParam}` : `/election/${electionId}`}
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Ballot Overview
          </Link>
          <span>/</span>
          <span className="text-[#A5A5A5]">Certified Results</span>
        </div>
        {isDraw ? (
          <VoxBadge variant="warning" dot={true}>
            Tally Sealed: Draw
          </VoxBadge>
        ) : (
          <VoxBadge variant="silver" dot={false}>
            Official Tally Sealed
          </VoxBadge>
        )}
      </div>

      {/* Main Results Title Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 p-6 sm:p-7 bg-[#101010] border border-white/14 rounded-2xl shadow-[var(--shadow-ambient)]">
        <div>
          <span className="font-mono text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
            On-Chain Certified Results
          </span>
          <h1 className="font-display font-medium text-2xl sm:text-3xl text-[#F4F4F4] mb-1.5 tracking-tight">
            {election.name}
          </h1>
          <p className="text-xs font-mono text-zinc-400">
            Total Ballots: <strong className="text-white">{totalVotes} Votes</strong> ·{' '}
            {isDraw ? (
              <span className="text-amber-400 font-semibold">Tie Detected</span>
            ) : (
              <span className="text-emerald-400">Verified & Sealed</span>
            )}
          </p>
        </div>

        <VoxButton variant="outline" size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={downloadResultsJson}>
          Export Tally (JSON)
        </VoxButton>
      </div>

      {/* DRAW STATE: Clean, Uncrowded Re-election Banner */}
      {isDraw && (
        <VoxCard
          variant="layer-1"
          padding="lg"
          className="border-amber-500/40 bg-gradient-to-r from-[#17120a] via-[#1c150b] to-[#17120a] relative overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.1)]"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                <Scale className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    ELECTION DRAW · TIE DETECTED
                  </span>
                </div>
                <h2 className="font-display font-semibold text-xl sm:text-2xl text-white mb-1.5">
                  Re-election Required
                </h2>
                <p className="text-xs text-zinc-300 leading-relaxed max-w-lg">
                  <strong className="text-white">
                    {topCandidates.map((c) => c.name).join(' and ')}
                  </strong>{' '}
                  tied for 1st place with <strong className="text-amber-300">{topVoteCount} votes</strong> each.
                  VoxChain protocol prevents random winner selection; a runoff ballot must decide the winner.
                </p>
              </div>
            </div>

            <Link to={reElectionUrl} className="shrink-0 w-full md:w-auto">
              <VoxButton
                variant="primary"
                size="md"
                icon={<RefreshCw className="w-4 h-4 text-black" />}
                className="w-full md:w-auto bg-amber-400 hover:bg-amber-300 text-black border-amber-400 font-bold whitespace-nowrap shadow-sm"
              >
                Schedule Runoff Election →
              </VoxButton>
            </Link>
          </div>
        </VoxCard>
      )}

      {/* SINGLE WINNER PODIUM */}
      {!isDraw && winner && totalVotes > 0 && (
        <VoxCard
          variant="layer-1"
          padding="lg"
          className="border-white/20 bg-gradient-to-r from-[#101010] via-[#171717] to-[#101010] relative overflow-hidden shadow-[var(--shadow-ambient)]"
        >
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.06] border border-white/20 flex items-center justify-center text-white shrink-0">
              <Trophy className="w-8 h-8" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <span className="font-mono text-[11px] font-semibold text-zinc-300 uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1 mb-1">
                <Award className="w-3.5 h-3.5" /> Elected Candidate
              </span>
              <h2 className="font-display font-medium text-2xl text-white mb-1">
                {winner.name}
              </h2>
              <p className="text-xs font-mono text-zinc-400">
                Secured <strong className="text-white">{Number(winner.voteCount)} votes</strong> (
                {((Number(winner.voteCount) / totalVotes) * 100).toFixed(1)}% of total vote)
              </p>
            </div>
          </div>
        </VoxCard>
      )}

      {/* ZERO VOTES CAST */}
      {hasNoVotes && (
        <VoxCard variant="layer-1" padding="lg" className="border-white/10 text-center py-8">
          <div className="max-w-md mx-auto flex flex-col items-center gap-2">
            <Users className="w-8 h-8 text-zinc-500 mb-1" />
            <h3 className="font-display text-lg text-white font-medium">No Votes Recorded</h3>
            <p className="text-xs font-mono text-zinc-400">
              The election closed with zero ballots cast.
            </p>
          </div>
        </VoxCard>
      )}

      {/* Detailed Tally Matrix */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-medium text-lg text-white tracking-tight">
            Candidate Tally Breakdown
          </h3>
          {isDraw && (
            <span className="text-xs font-mono text-amber-400 flex items-center gap-1.5 font-medium">
              <Scale className="w-3.5 h-3.5" /> Deadlock on Rank #1
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {rankings.map((r) => {
            const isTopWinner = !isDraw && r.rank === 1 && totalVotes > 0;
            const isTopTied = r.isTopTied;

            return (
              <VoxCard
                key={r.candidate.id.toString()}
                variant="layer-2"
                padding="md"
                className={`flex flex-col gap-3 transition-colors ${
                  isTopTied
                    ? 'border-amber-500/35 bg-gradient-to-r from-amber-500/[0.04] to-transparent'
                    : isTopWinner
                    ? 'border-white/20'
                    : 'border-white/8'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`min-w-8 px-2 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center ${
                        isTopTied
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : isTopWinner
                          ? 'bg-white text-black'
                          : 'bg-[#171717] text-zinc-400 border border-white/[0.08]'
                      }`}
                    >
                      {isTopTied ? '#1 (Tie)' : `#${r.rank}${r.isTied ? ' (Tie)' : ''}`}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-semibold text-sm sm:text-base text-white">
                          {r.candidate.name}
                        </h4>
                        {isTopTied && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            DRAW
                          </span>
                        )}
                        {isTopWinner && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-white text-black">
                            ELECTED
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-zinc-500">
                        Candidate ID: #{r.candidate.id.toString()}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-sm sm:text-base text-white block tabular-nums">
                      {r.count.toLocaleString()} votes
                    </span>
                    <span className={`font-mono text-xs ${isTopTied ? 'text-amber-400 font-semibold' : 'text-zinc-400'}`}>
                      {r.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Horizontal Progress Bar */}
                <div className="w-full bg-[#171717] border border-white/[0.06] rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isTopTied
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                        : isTopWinner
                        ? 'bg-white'
                        : 'bg-zinc-600'
                    }`}
                    style={{ width: `${r.percentage}%` }}
                  />
                </div>
              </VoxCard>
            );
          })}
        </div>
      </div>
    </div>
  );
};
