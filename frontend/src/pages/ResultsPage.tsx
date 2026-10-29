import React from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useElection } from '../hooks/useElection';
import { useVoxChain } from '../hooks/useVoxChain';
import { VoxCard } from '../components/common/VoxCard';
import { VoxBadge } from '../components/common/VoxBadge';
import { VoxButton } from '../components/common/VoxButton';
import { Trophy, ArrowLeft, Download, Award } from 'lucide-react';

export const ResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const contractParam = (searchParams.get('contract') as `0x${string}`) || undefined;
  const electionId = Number(id);
  const { contractAddress } = useVoxChain(contractParam);
  const { election, results, isLoading } = useElection(electionId, contractParam);

  if (isLoading || !election) {
    return (
      <div className="py-24 text-center flex flex-col items-center justify-center">
        <div className="w-7 h-7 rounded-full border-2 border-white/20 border-t-white animate-spin mb-4" />
        <span className="font-mono text-xs text-[#A5A5A5]">Loading certified election results...</span>
      </div>
    );
  }

  // Calculate total votes
  const totalVotes = results.reduce((acc, c) => acc + Number(c.voteCount), 0);

  // Find winner(s)
  const sortedCandidates = [...results].sort((a, b) => Number(b.voteCount) - Number(a.voteCount));
  const winner = sortedCandidates[0] || null;

  const downloadResultsJson = () => {
    try {
      const exportData = {
        electionId,
        electionName: election.name,
        contractAddress,
        totalVotes,
        certifiedAt: new Date().toISOString(),
        winner: winner ? { id: Number(winner.id), name: winner.name, voteCount: Number(winner.voteCount) } : null,
        results: sortedCandidates.map((c) => ({
          candidateId: Number(c.id),
          name: c.name,
          voteCount: Number(c.voteCount),
          percentage: totalVotes > 0 ? ((Number(c.voteCount) / totalVotes) * 100).toFixed(2) + '%' : '0%',
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
    <div className="flex flex-col gap-10 py-6 max-w-5xl mx-auto">
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
        <VoxBadge variant="silver" dot={false}>
          Official Tally Sealed
        </VoxBadge>
      </div>

      {/* Main Results Title Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 bg-[#101010] border border-white/16 rounded-2xl shadow-[var(--shadow-ambient)]">
        <div>
          <span className="font-mono text-xs font-semibold text-[#D8D8D8] uppercase tracking-wider block mb-2">
            On-Chain Certified Results
          </span>
          <h1 className="font-display font-medium text-3xl sm:text-4xl text-[#F4F4F4] mb-2 tracking-tight">
            {election.name}
          </h1>
          <p className="text-xs font-mono text-[#727272]">
            Total Certified Ballots: <strong className="text-[#F4F4F4]">{totalVotes} Votes</strong> · <span className="text-emerald-400">Verified & Sealed</span>
          </p>
        </div>

        <VoxButton variant="primary" icon={<Download className="w-4 h-4" />} onClick={downloadResultsJson}>
          Export Certified Tally (JSON)
        </VoxButton>
      </div>

      {/* Winner Podium Highlight */}
      {winner && totalVotes > 0 && (
        <VoxCard variant="layer-1" padding="lg" className="border-white/25 bg-gradient-to-r from-[#101010] via-[#171717] to-[#101010] relative overflow-hidden shadow-[var(--shadow-ambient)]">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-[#1c1c1c] border border-white/20 flex items-center justify-center text-[#F4F4F4] shrink-0 shadow-inner">
              <Trophy className="w-10 h-10" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <span className="font-mono text-xs font-semibold text-[#D8D8D8] uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1 mb-1">
                <Award className="w-4 h-4" /> Elected Candidate
              </span>
              <h2 className="font-display font-medium text-2xl sm:text-3xl text-[#F4F4F4] mb-1">
                {winner.name}
              </h2>
              <p className="text-xs font-mono text-[#A5A5A5]">
                Secured <strong className="text-[#FFFFFF]">{Number(winner.voteCount)} votes</strong> (
                {((Number(winner.voteCount) / totalVotes) * 100).toFixed(1)}% of total vote)
              </p>
            </div>
          </div>
        </VoxCard>
      )}

      {/* Detailed Tally Matrix */}
      <div className="flex flex-col gap-6">
        <h3 className="font-display font-medium text-xl text-[#F4F4F4] tracking-tight">
          Full Candidate Tally Breakdown
        </h3>

        <div className="flex flex-col gap-4">
          {sortedCandidates.map((cand, index) => {
            const count = Number(cand.voteCount);
            const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
            const isTop = index === 0 && totalVotes > 0;

            return (
              <VoxCard key={cand.id.toString()} variant="layer-2" padding="md" className="flex flex-col gap-3 border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg font-mono text-xs font-bold flex items-center justify-center ${
                        isTop
                          ? 'bg-[#F4F4F4] text-black shadow-sm'
                          : 'bg-[#171717] text-[#727272] border border-white/[0.09]'
                      }`}
                    >
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-base text-[#F4F4F4]">{cand.name}</h4>
                      <span className="font-mono text-[11px] text-[#727272]">Candidate ID: #{cand.id.toString()}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-base text-[#F4F4F4] block tabular-nums">
                      {count.toLocaleString()} votes
                    </span>
                    <span className="font-mono text-xs text-[#727272]">{percentage.toFixed(1)}%</span>
                  </div>
                </div>

                {/* Animated Horizontal Progress Bar */}
                <div className="w-full bg-[#171717] border border-white/[0.06] rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isTop
                        ? 'bg-[#F4F4F4]'
                        : 'bg-[#555555]'
                    }`}
                    style={{ width: `${percentage}%` }}
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
