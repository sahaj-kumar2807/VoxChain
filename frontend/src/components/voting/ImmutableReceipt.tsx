import React from 'react';
import { VoxHashPill } from '../common/VoxHashPill';
import { VoxButton } from '../common/VoxButton';
import { Download, Printer, CheckCircle2, ShieldCheck } from 'lucide-react';
import type { VoteReceipt } from '../../types';

export interface ImmutableReceiptProps {
  receipt: VoteReceipt;
}

export const ImmutableReceipt: React.FC<ImmutableReceiptProps> = ({ receipt }) => {
  const downloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(receipt, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `voxchain-ballot-${receipt.electionId}-${receipt.voterAddress.slice(0, 8)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-vox-surface-1 border border-vox-state-success/40 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Subtle Background Watermark */}
      <div className="absolute -right-8 -bottom-8 opacity-5 text-vox-state-success pointer-events-none">
        <ShieldCheck className="w-64 h-64" />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-vox-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-vox-state-success-bg border border-vox-state-success/40 flex items-center justify-center text-vox-state-success">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="font-mono text-xs font-semibold text-vox-state-success uppercase tracking-wider block">
              Official Cryptographic Receipt
            </span>
            <h3 className="font-display font-bold text-xl text-vox-text-primary">
              Immutable Ballot Certificate
            </h3>
          </div>
        </div>
        <div className="text-right">
          <span className="font-mono text-xs text-vox-text-muted block">Committed Timestamp</span>
          <span className="font-mono text-xs font-semibold text-vox-text-secondary">{receipt.timestamp}</span>
        </div>
      </div>

      {/* Certificate Matrix Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6 text-xs">
        <div className="p-3.5 bg-vox-surface-2 rounded-lg border border-vox-border-subtle flex flex-col gap-1">
          <span className="text-vox-text-muted font-mono uppercase tracking-wider">Election Name</span>
          <span className="font-display font-semibold text-sm text-vox-text-primary">{receipt.electionName}</span>
          <span className="font-mono text-[11px] text-vox-text-muted">Election ID: #{receipt.electionId}</span>
        </div>

        <div className="p-3.5 bg-vox-surface-2 rounded-lg border border-vox-border-subtle flex flex-col gap-1">
          <span className="text-vox-text-muted font-mono uppercase tracking-wider">Candidate Selected</span>
          <span className="font-display font-bold text-sm text-vox-accent-gold">{receipt.candidateName}</span>
          <span className="font-mono text-[11px] text-vox-text-muted">Candidate ID: #{receipt.candidateId}</span>
        </div>

        <div className="p-3.5 bg-vox-surface-2 rounded-lg border border-vox-border-subtle flex flex-col gap-1">
          <span className="text-vox-text-muted font-mono uppercase tracking-wider">Voter Wallet Credential</span>
          <VoxHashPill hash={receipt.voterAddress} type="address" truncate={false} className="w-fit" />
        </div>

        <div className="p-3.5 bg-vox-surface-2 rounded-lg border border-vox-border-subtle flex flex-col gap-1">
          <span className="text-vox-text-muted font-mono uppercase tracking-wider">Transaction Hash</span>
          <VoxHashPill hash={receipt.transactionHash} type="txHash" truncate={true} className="w-fit" />
          {receipt.blockNumber !== undefined ? (
            <span className="font-mono text-[11px] text-vox-text-muted">Block #{receipt.blockNumber.toString()}</span>
          ) : null}
        </div>
      </div>

      {/* Verification Notice */}
      <div className="p-4 bg-vox-surface-2/80 border border-vox-border-subtle rounded-xl text-xs text-vox-text-secondary leading-relaxed mb-6">
        <strong className="text-vox-text-primary block mb-1">Mathematical Consensus Guarantee:</strong>
        This vote has been cryptographically recorded by smart contract function <code>castVote()</code> and emitted
        via <code>event VoteCast({receipt.electionId}, {receipt.candidateId}, {receipt.voterAddress.slice(0, 8)}...)</code>.
        It is verifiable by any node on the network.
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-end gap-3 print:hidden">
        <VoxButton variant="outline" size="sm" icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
          Print Certificate
        </VoxButton>
        <VoxButton variant="primary-gold" size="sm" icon={<Download className="w-4 h-4" />} onClick={downloadJson}>
          Download JSON Proof
        </VoxButton>
      </div>
    </div>
  );
};
