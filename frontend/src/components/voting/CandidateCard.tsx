import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { Check, User } from 'lucide-react';
import type { CandidateDisplay } from '../../types';

export interface CandidateCardProps {
  candidate: CandidateDisplay;
  isSelected: boolean;
  onSelect: (id: number) => void;
  disabled?: boolean;
  showVoteCount?: boolean;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  isSelected,
  onSelect,
  disabled = false,
  showVoteCount = false,
}) => {
  return (
    <motion.div
      whileHover={!disabled ? { y: -3, transition: { duration: 0.15 } } : {}}
      whileTap={!disabled ? { scale: 0.99 } : {}}
      onClick={() => !disabled && onSelect(candidate.id)}
      className={cn(
        'relative flex flex-col justify-between p-6 rounded-xl border transition-all duration-200 cursor-pointer select-none bg-vox-surface-1 shadow-vox-card',
        isSelected
          ? 'border-vox-accent-gold ring-1 ring-vox-accent-gold shadow-vox-active bg-vox-surface-2'
          : 'border-vox-border-subtle hover:border-vox-border-medium hover:bg-vox-surface-2',
        disabled && 'opacity-60 cursor-not-allowed hover:border-vox-border-subtle hover:bg-vox-surface-1'
      )}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-vox-surface-3 text-vox-accent-gold border border-vox-border-subtle">
            CANDIDATE #{candidate.id.toString().padStart(2, '0')}
          </span>

          {/* Radio Indicator */}
          <div
            className={cn(
              'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
              isSelected
                ? 'border-vox-accent-gold bg-vox-accent-gold text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                : 'border-vox-border-medium bg-vox-surface-2'
            )}
          >
            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
        </div>

        {/* Candidate Avatar & Name */}
        <div className="flex items-center gap-3.5 mb-3">
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-vox-surface-3 to-vox-surface-4 border border-vox-border-medium flex items-center justify-center text-vox-text-secondary">
            <User className="w-5 h-5 text-vox-accent-gold" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-vox-text-primary group-hover:text-vox-accent-gold transition-colors">
              {candidate.name}
            </h3>
            <span className="text-xs font-mono text-vox-text-muted">Verified Ballot Entry</span>
          </div>
        </div>

        {/* Bio / Agenda Description */}
        <p className="text-xs text-vox-text-secondary leading-relaxed line-clamp-3">
          {candidate.bio ||
            'Civic candidate committed to transparent governance, protocol security, and decentralized democratic consensus.'}
        </p>
      </div>

      {/* Footer / Vote Count if Ended */}
      {showVoteCount && (
        <div className="mt-4 pt-3 border-t border-vox-border-subtle flex items-center justify-between">
          <span className="text-xs font-mono text-vox-text-muted">Votes Recorded:</span>
          <span className="font-mono font-bold text-sm text-vox-accent-gold tabular-nums">
            {candidate.voteCount.toLocaleString()} votes
          </span>
        </div>
      )}
    </motion.div>
  );
};
