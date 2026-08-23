import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useElection } from '../hooks/useElection';
import { useVoxChain } from '../hooks/useVoxChain';
import { VoxCard } from '../components/common/VoxCard';
import { VoxBadge } from '../components/common/VoxBadge';
import { VoxButton } from '../components/common/VoxButton';
import { VoxHashPill } from '../components/common/VoxHashPill';
import { Trophy, ArrowLeft, Download, ShieldCheck, CheckCircle2, Award, User } from 'lucide-react';

export const ResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const electionId = Number(id);
  const { contractAddress } = useVoxChain();
  const { election, results, isLoading } = useElection(electionId);

  if (isLoading || !election) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-vox-accent-gold border-t-transparent animate-spin mb-4" />
        <span className="font-mono text-xs text-vox-text-muted">Fetching Certified Tallies for Election #{id}...</span>
      </div>
    );
  }

  // Calculate total votes
  const totalVotes = results.reduce((acc, c) => acc + Number(c.voteCount), 0);

  // Find winner(s)
  const sortedCandidates = [...results].sort((a, b) => Number(b.voteCount) - Number(a.voteCount));
  const winner = sortedCandidates[0] || null;

  const downloadResultsJson = () => {
    const exportData = {
      electionId,
      electionName: election.name,
      contractAddress,
      totalVotes,
      certifiedAt: new Date().toUTCString(),
      results: sortedCandidates.map((c) => ({
        candidateId: Number(c.id),
        name: c.name,
        voteCount: Number(c.voteCount),
        percentage: totalVotes > 0 ? ((Number(c.voteCount) / totalVotes) * 100).toFixed(2) + '%' : '0%',
      })),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `voxchain-election-${electionId}-certified-results.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="flex flex-col gap-10 py-6 max-w-5xl mx-auto">
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between border-b border-vox-border-subtle pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-vox-text-muted">
          <Link to={`/election/${electionId}`} className="hover:text-vox-accent-gold flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Ballot Overview
          </Link>
          <span>/</span>
          <span className="text-vox-text-secondary">Certified Results</span>
        </div>
        <VoxBadge variant="gold" dot={false}>
          Official Tally Sealed
        </VoxBadge>
      </div>

      {/* Main Results Title Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 bg-vox-surface-1 border border-vox-border-medium rounded-2xl">
        <div>
          <span className="font-mono text-xs font-semibold text-vox-accent-gold uppercase tracking-wider block mb-2">
            On-Chain Certified Results
          </span>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-vox-text-primary mb-2">
            {election.name}
          </h1>
          <p className="text-xs font-mono text-vox-text-muted">
            Total Certified Ballots: <strong className="text-vox-text-primary">{totalVotes} Votes</strong> · Contract:{' '}
            <VoxHashPill hash={contractAddress} type="address" />
          </p>
        </div>

        <VoxButton variant="primary-gold" icon={<Download className="w-4 h-4" />} onClick={downloadResultsJson}>
          Export Certified Tally (JSON)
        </VoxButton>
      </div>

      {/* Winner Podium Highlight */}
      {winner && totalVotes > 0 && (
        <VoxCard variant="layer-1" padding="lg" className="border-vox-accent-gold/50 bg-gradient-to-r from-vox-surface-1 via-vox-surface-2 to-vox-surface-1 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-vox-accent-gold-glow border border-vox-accent-gold flex items-center justify-center text-vox-accent-gold shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <Trophy className="w-10 h-10" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <span className="font-mono text-xs font-semibold text-vox-accent-gold uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1 mb-1">
                <Award className="w-4 h-4" /> Elected Candidate
              </span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-vox-text-primary mb-1">
                {winner.name}
              </h2>
              <p className="text-xs font-mono text-vox-text-secondary">
                Secured <strong className="text-vox-accent-gold">{Number(winner.voteCount)} votes</strong> (
                {((Number(winner.voteCount) / totalVotes) * 100).toFixed(1)}% of total vote)
              </p>
            </div>
          </div>
        </VoxCard>
      )}

      {/* Detailed Tally Matrix */}
      <div className="flex flex-col gap-6">
        <h3 className="font-display font-bold text-xl text-vox-text-primary">
          Full Candidate Tally Breakdown
        </h3>

        <div className="flex flex-col gap-4">
          {sortedCandidates.map((cand, index) => {
            const count = Number(cand.voteCount);
            const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
            const isTop = index === 0 && totalVotes > 0;

            return (
              <VoxCard key={cand.id.toString()} variant="layer-2" padding="md" className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg font-mono text-xs font-bold flex items-center justify-center ${
                        isTop
                          ? 'bg-vox-accent-gold text-black'
                          : 'bg-vox-surface-3 text-vox-text-muted border border-vox-border-subtle'
                      }`}
                    >
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-base text-vox-text-primary">{cand.name}</h4>
                      <span className="font-mono text-[11px] text-vox-text-muted">Candidate ID: #{cand.id.toString()}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-base text-vox-text-primary block tabular-nums">
                      {count.toLocaleString()} votes
                    </span>
                    <span className="font-mono text-xs text-vox-text-muted">{percentage.toFixed(1)}%</span>
                  </div>
                </div>

                {/* Animated Horizontal Progress Bar */}
                <div className="w-full bg-vox-surface-3 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isTop
                        ? 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                        : 'bg-vox-state-info'
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
