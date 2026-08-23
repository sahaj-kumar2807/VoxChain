import React, { useState } from 'react';
import { VoxDrawer } from '../common/VoxDrawer';
import { VoxButton } from '../common/VoxButton';
import { VoxAlert } from '../common/VoxAlert';
import { VoxHashPill } from '../common/VoxHashPill';
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
            variant="primary-gold"
            disabled={!intentConfirmed || isLoading}
            isLoading={isLoading}
            loadingText="Awaiting MetaMask..."
            icon={<KeyRound className="w-4 h-4" />}
            onClick={onConfirmSign}
          >
            Initiate Wallet Signature →
          </VoxButton>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Irreversible Commitment Warning */}
        <VoxAlert variant="warning" title="Irreversible Blockchain Commitment">
          Once signed in MetaMask and mined onto the Ethereum blockchain, your vote is permanent and immutable. It
          cannot be altered, overwritten, or retracted by any party or election administrator.
        </VoxAlert>

        {/* Verification Summary Card */}
        <div className="bg-vox-surface-2 border border-vox-border-medium rounded-xl p-5 flex flex-col gap-4">
          <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-vox-text-muted">
            Ballot Specification
          </h4>

          <div className="flex justify-between items-center pb-3 border-b border-vox-border-subtle">
            <span className="text-xs text-vox-text-secondary">Target Election:</span>
            <span className="font-display font-semibold text-sm text-vox-text-primary text-right max-w-[260px]">
              {electionName} (#{electionId})
            </span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-vox-border-subtle">
            <span className="text-xs text-vox-text-secondary">Selected Candidate:</span>
            <div className="text-right">
              <span className="font-display font-bold text-sm text-vox-accent-gold block">{candidate.name}</span>
              <span className="font-mono text-[11px] text-vox-text-muted">Candidate ID: #{candidate.id}</span>
            </div>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-vox-border-subtle">
            <span className="text-xs text-vox-text-secondary">Signing Voter Key:</span>
            {voterAddress ? <VoxHashPill hash={voterAddress} type="address" /> : <span>—</span>}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-vox-text-secondary">Smart Contract Function:</span>
            <span className="font-mono text-xs text-vox-state-info bg-vox-surface-3 px-2 py-0.5 rounded">
              castVote({electionId}, {candidate.id})
            </span>
          </div>
        </div>

        {/* Dual Intent Confirmation Checkbox */}
        <div
          onClick={() => setIntentConfirmed(!intentConfirmed)}
          className="flex items-start gap-3 p-4 rounded-xl bg-vox-surface-2/60 border border-vox-border-subtle hover:border-vox-border-medium transition-colors cursor-pointer select-none"
        >
          <div
            className={`w-5 h-5 mt-0.5 rounded border flex items-center justify-center transition-colors shrink-0 ${
              intentConfirmed
                ? 'bg-vox-accent-gold border-vox-accent-gold text-black'
                : 'border-vox-border-medium bg-vox-surface-3'
            }`}
          >
            {intentConfirmed && <CheckCircle2 className="w-4 h-4 fill-black stroke-vox-accent-gold" />}
          </div>
          <div className="text-xs text-vox-text-primary leading-relaxed">
            <strong className="text-vox-accent-gold font-semibold block mb-0.5">Dual Intent Confirmation</strong>
            I confirm that I am casting my vote for <strong>{candidate.name}</strong> and authorize this transaction
            to be committed to the decentralized Ethereum ledger.
          </div>
        </div>
      </div>
    </VoxDrawer>
  );
};
