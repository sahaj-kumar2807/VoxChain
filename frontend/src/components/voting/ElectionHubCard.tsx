import React from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useElection } from '../../hooks/useElection';
import { VoxCard } from '../common/VoxCard';
import { VoxBadge } from '../common/VoxBadge';
import { VoxButton } from '../common/VoxButton';
import { Vote, Trophy, Lock, CheckCircle2, ArrowRight } from 'lucide-react';

export interface ElectionHubCardProps {
  electionId: number;
}

export const ElectionHubCard: React.FC<ElectionHubCardProps> = ({ electionId }) => {
  const { address, isConnected } = useAccount();
  const { election, candidates, isEligible, hasVoted, isLoading } = useElection(electionId);

  if (isLoading || !election) {
    return (
      <VoxCard variant="layer-1" padding="md" className="animate-pulse">
        <div className="h-5 bg-vox-surface-3 rounded w-1/3 mb-4" />
        <div className="h-7 bg-vox-surface-3 rounded w-3/4 mb-3" />
        <div className="h-4 bg-vox-surface-3 rounded w-1/2 mb-6" />
        <div className="h-10 bg-vox-surface-3 rounded w-full" />
      </VoxCard>
    );
  }

  const isStarted = election.started && !election.ended;
  const isEnded = election.ended;
  const isPending = !election.started && !election.ended;

  return (
    <VoxCard variant="interactive" padding="lg" className="flex flex-col justify-between">
      <div>
        {/* Top Status & ID */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-xs font-semibold text-vox-text-muted">
            BALLOT ID #{electionId.toString().padStart(2, '0')}
          </span>

          {isStarted && (
            <VoxBadge variant="success" dot={true}>
              Voting Open
            </VoxBadge>
          )}
          {isEnded && (
            <VoxBadge variant="gold" dot={false}>
              Concluded
            </VoxBadge>
          )}
          {isPending && (
            <VoxBadge variant="neutral" dot={false}>
              Upcoming
            </VoxBadge>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-xl text-vox-text-primary mb-2 line-clamp-2">
          {election.name}
        </h3>

        {/* Candidate Count */}
        <div className="flex items-center gap-4 text-xs font-mono text-vox-text-secondary mb-6">
          <span>{candidates.length} Registered Candidate{candidates.length === 1 ? '' : 's'}</span>
          {isConnected && isEligible && (
            <span className="text-vox-state-success flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Eligible
            </span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-vox-border-subtle">
        {isEnded ? (
          <Link to={`/election/${electionId}/results`} className="w-full block">
            <VoxButton variant="outline" size="md" className="w-full" icon={<Trophy className="w-4 h-4 text-vox-accent-gold" />}>
              View Certified Results
            </VoxButton>
          </Link>
        ) : hasVoted ? (
          <div className="flex items-center justify-between p-3 rounded-lg bg-vox-state-success-bg border border-vox-state-success/30 text-xs text-vox-state-success font-semibold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Ballot Sealed on Chain
            </span>
            <Link to={`/election/${electionId}`} className="text-vox-accent-gold hover:underline font-mono">
              View
            </Link>
          </div>
        ) : isStarted ? (
          <Link to={`/election/${electionId}`} className="w-full block">
            <VoxButton variant="primary-gold" size="md" className="w-full" icon={<Vote className="w-4 h-4" />}>
              {isEligible ? 'Cast Your Ballot →' : 'View Ballot Details'}
            </VoxButton>
          </Link>
        ) : (
          <Link to={`/election/${electionId}`} className="w-full block">
            <VoxButton variant="outline" size="md" className="w-full" icon={<Lock className="w-4 h-4" />}>
              View Preview (Not Started)
            </VoxButton>
          </Link>
        )}
      </div>
    </VoxCard>
  );
};
