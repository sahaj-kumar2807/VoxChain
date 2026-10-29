import React, { useState } from 'react';
import { VoxDrawer } from '../common/VoxDrawer';
import { VoxButton } from '../common/VoxButton';
import { VoxAlert } from '../common/VoxAlert';
import { KeyRound, ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { CandidateDisplay } from '../../types';

export interface BallotReviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  electionId: number;
  electionName: string;
  candidate: CandidateDisplay | null;
  voterAddress?: `0x${string}`;
  onConfirmSign: () => void;
  isLoading?: boolean;
}

export const BallotReviewDrawer: React.FC<BallotReviewDrawerProps> = ({
  isOpen,
  onClose,
  electionId,
  electionName,
  candidate,
  voterAddress,
  onConfirmSign,
  isLoading = false,
}) => {
  const [intentConfirmed, setIntentConfirmed] = useState(false);

  if (!candidate) return null;

  return (
    <VoxDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Review Ballot & Intent"
      subtitle={`Stage 2 of 6: Cryptographic Verification before signing`}
      width="lg"
      footer={
        <div className="flex items-center justify-between gap-4 w-full">
          <VoxButton variant="outline" onClick={onClose} disabled={isLoading}>
            Back to Selection
          </VoxButton>
          <VoxButton
            variant="primary"
            disabled={!intentConfirmed || isLoading}
            isLoading={isLoading}
            loadingText="Opening Wallet..."
            icon={<KeyRound className="w-4 h-4" />}
            onClick={onConfirmSign}
          >
            Confirm & Submit Vote →
          </VoxButton>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Permanent Vote Notice */}
        <VoxAlert variant="warning" title="Important Notice: Permanent Vote">
          Once confirmed in your wallet, your vote is permanently recorded on the blockchain. It cannot be altered or deleted by anyone, including election administrators.
        </VoxAlert>

        {/* Verification Summary Card */}
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 flex flex-col gap-4">
          <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Review Your Selection
          </h4>

          <div className="flex justify-between items-center pb-3 border-b border-white/10">
            <span className="text-xs text-zinc-400">Election:</span>
            <span className="font-display font-semibold text-sm text-white text-right max-w-[260px]">
              {electionName} (#{electionId})
            </span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-white/10">
            <span className="text-xs text-zinc-400">Selected Candidate:</span>
            <div className="text-right">
              <span className="font-display font-bold text-sm text-[#A5B4FC] block">{candidate.name}</span>
              <span className="font-mono text-[11px] text-zinc-400">Candidate ID: #{candidate.id}</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-400">Voter Authorization:</span>
            <span className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Verified & Ready
            </span>
          </div>
        </div>

        {/* Confirmation Checkbox */}
        <div
          onClick={() => setIntentConfirmed(!intentConfirmed)}
          className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#818CF8]/40 transition-colors cursor-pointer select-none"
        >
          <div
            className={`w-5 h-5 mt-0.5 rounded border flex items-center justify-center transition-colors shrink-0 ${
              intentConfirmed
                ? 'bg-[#6366F1] border-[#818CF8] text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                : 'border-white/20 bg-white/5'
            }`}
          >
            {intentConfirmed && <CheckCircle2 className="w-4 h-4 text-white" />}
          </div>
          <div className="text-xs text-zinc-300 leading-relaxed">
            <strong className="text-white font-semibold block mb-0.5">I Confirm My Vote</strong>
            I confirm that I want to vote for <strong className="text-[#A5B4FC]">{candidate.name}</strong> and understand that my vote cannot be changed once submitted.
          </div>
        </div>
      </div>
    </VoxDrawer>
  );
};
