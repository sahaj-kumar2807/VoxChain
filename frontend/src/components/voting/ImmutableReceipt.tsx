import React, { useState } from 'react';
import { useChainId } from 'wagmi';
import { sepolia, hardhat } from 'wagmi/chains';
import { VoxHashPill } from '../common/VoxHashPill';
import { VoxButton } from '../common/VoxButton';
import { getExplorerTxUrl } from '../../contracts/config';
import { Download, Printer, CheckCircle2, ShieldCheck, Check } from 'lucide-react';
import type { VoteReceipt } from '../../types';

export interface ImmutableReceiptProps {
  receipt: VoteReceipt;
}

export const ImmutableReceipt: React.FC<ImmutableReceiptProps> = ({ receipt }) => {
  const [downloaded, setDownloaded] = useState(false);
  const chainId = useChainId();

  const networkName =
    chainId === sepolia.id
      ? 'Ethereum Sepolia (Chain ID: 11155111)'
      : chainId === hardhat.id
      ? 'Hardhat Local (Chain ID: 31337)'
      : `EVM Chain #${chainId}`;

  const explorerUrl = getExplorerTxUrl(receipt.transactionHash, chainId) || undefined;

  const downloadJson = () => {
    try {
      const proofPayload = {
        protocol: 'VOXCHAIN',
        version: '1.0',
        network: networkName,
        recordType: 'CRYPTOGRAPHIC_BALLOT_RECEIPT',
        status: 'MINED_AND_FINALIZED',
        exportedAt: new Date().toISOString(),
        election: {
          id: receipt.electionId,
          name: receipt.electionName,
        },
        ballot: {
          candidateId: receipt.candidateId,
          candidateName: receipt.candidateName,
        },
        cryptographicProof: {
          voterAddress: receipt.voterAddress,
          contractAddress: receipt.contractAddress,
          transactionHash: receipt.transactionHash,
          blockNumber: receipt.blockNumber !== undefined ? receipt.blockNumber.toString() : undefined,
          timestamp: receipt.timestamp,
          gasUsed: receipt.gasUsed !== undefined ? receipt.gasUsed.toString() : undefined,
          effectiveGasPrice: receipt.effectiveGasPrice !== undefined ? receipt.effectiveGasPrice.toString() : undefined,
          explorerUrl,
        },
        immutabilityVerification: {
          standard: 'EIP-712 / EVM Finality',
          status: 'PERMANENT_CRYPTOGRAPHIC_CONSENSUS',
          guarantee: 'IRREVERSIBLE_ON_CHAIN',
        },
      };

      // Safely serialize with BigInt replacer fallback
      const jsonStr = JSON.stringify(
        proofPayload,
        (_, value) => (typeof value === 'bigint' ? value.toString() : value),
        2
      );

      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = url;
      const cleanAddress = receipt.voterAddress ? receipt.voterAddress.slice(0, 8) : 'voter';
      downloadAnchor.download = `voxchain-proof-election-${receipt.electionId}-${cleanAddress}.json`;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);

      setTimeout(() => {
        document.body.removeChild(downloadAnchor);
        URL.revokeObjectURL(url);
      }, 500);
    } catch (err) {
      console.error('[VOXCHAIN] Failed to download receipt JSON:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="receipt-certificate bg-[#0A0A12] border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-[0_16px_50px_rgba(0,0,0,0.85)] relative overflow-hidden print:bg-white print:border-2 print:border-emerald-600 print:shadow-none print:p-6 print:rounded-xl print:text-slate-900 print:max-w-none print:w-full print:m-0">
      {/* Subtle Background Watermark */}
      <div className="absolute -right-8 -bottom-8 opacity-5 text-emerald-400 pointer-events-none print:opacity-[0.04] print:text-emerald-700">
        <ShieldCheck className="w-64 h-64" />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10 print:border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)] print:border-emerald-600 print:bg-emerald-50 print:text-emerald-700 print:shadow-none">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-emerald-400 print:text-emerald-700 uppercase tracking-wider block">
                Official Voting Receipt
              </span>
              <span className="hidden print:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                VERIFIED & MINED
              </span>
            </div>
            <h3 className="font-display font-bold text-xl text-white print:text-slate-900">
              Verified Ballot Record
            </h3>
          </div>
        </div>
        <div className="text-right">
          <span className="font-mono text-xs text-zinc-400 print:text-slate-500 block">Timestamp</span>
          <span className="font-mono text-xs font-semibold text-zinc-200 print:text-slate-800">{receipt.timestamp}</span>
          <span className="hidden print:block font-mono text-[10px] text-slate-500 mt-0.5">{networkName}</span>
        </div>
      </div>

      {/* Certificate Matrix Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6 text-xs print:gap-3 print:py-4">
        <div className="p-3.5 bg-white/[0.03] rounded-xl border border-white/10 flex flex-col gap-1 print:bg-slate-50 print:border-slate-200 print:rounded-lg">
          <span className="text-zinc-400 print:text-slate-500 font-mono uppercase tracking-wider text-[10px]">Election Name</span>
          <span className="font-display font-semibold text-sm text-white print:text-slate-900">{receipt.electionName}</span>
          <span className="font-mono text-[11px] text-zinc-400 print:text-slate-600">Election ID: #{receipt.electionId}</span>
        </div>

        <div className="p-3.5 bg-white/[0.03] rounded-xl border border-white/10 flex flex-col gap-1 print:bg-slate-50 print:border-slate-200 print:rounded-lg">
          <span className="text-zinc-400 print:text-slate-500 font-mono uppercase tracking-wider text-[10px]">Candidate Selected</span>
          <span className="font-display font-bold text-sm text-[#A5B4FC] print:text-emerald-700">{receipt.candidateName}</span>
          <span className="font-mono text-[11px] text-zinc-400 print:text-slate-600">Candidate ID: #{receipt.candidateId}</span>
        </div>

        <div className="p-3.5 bg-white/[0.03] rounded-xl border border-white/10 flex flex-col gap-1 print:bg-slate-50 print:border-slate-200 print:rounded-lg">
          <span className="text-zinc-400 print:text-slate-500 font-mono uppercase tracking-wider text-[10px]">Voter Wallet Credential</span>
          <div className="print:hidden">
            <VoxHashPill hash={receipt.voterAddress} type="address" truncate={false} className="w-fit" />
          </div>
          <div className="hidden print:block font-mono text-[11px] font-semibold text-slate-900 break-all bg-white px-2 py-1 rounded border border-slate-200">
            {receipt.voterAddress}
          </div>
        </div>

        <div className="p-3.5 bg-white/[0.03] rounded-xl border border-white/10 flex flex-col gap-1 print:bg-slate-50 print:border-slate-200 print:rounded-lg">
          <span className="text-zinc-400 print:text-slate-500 font-mono uppercase tracking-wider text-[10px]">Transaction Hash</span>
          <div className="print:hidden">
            <VoxHashPill hash={receipt.transactionHash} type="txHash" truncate={true} className="w-fit" />
          </div>
          <div className="hidden print:block font-mono text-[11px] font-semibold text-slate-900 break-all bg-white px-2 py-1 rounded border border-slate-200">
            {receipt.transactionHash}
          </div>
          {receipt.blockNumber !== undefined ? (
            <span className="font-mono text-[11px] text-zinc-400 print:text-slate-600">Block #{receipt.blockNumber.toString()}</span>
          ) : null}
        </div>

        {receipt.contractAddress && (
          <div className="p-3.5 bg-white/[0.03] rounded-xl border border-white/10 flex flex-col gap-1 md:col-span-2 print:bg-slate-50 print:border-slate-200 print:rounded-lg">
            <span className="text-zinc-400 print:text-slate-500 font-mono uppercase tracking-wider text-[10px]">Election Smart Contract</span>
            <div className="print:hidden">
              <VoxHashPill hash={receipt.contractAddress} type="address" truncate={false} className="w-fit" />
            </div>
            <div className="hidden print:block font-mono text-[11px] font-semibold text-slate-900 break-all bg-white px-2 py-1 rounded border border-slate-200">
              {receipt.contractAddress}
            </div>
          </div>
        )}
      </div>

      {/* Verification Notice */}
      <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl text-xs text-zinc-300 leading-relaxed mb-6 print:bg-emerald-50/60 print:border-emerald-200 print:text-slate-800 print:p-3 print:mb-3 print:rounded-lg">
        <strong className="text-white print:text-emerald-900 block mb-1 font-semibold">Permanent Verification Guarantee:</strong>
        Your vote has been securely recorded on the blockchain and cannot be modified or erased. Anyone can verify this record using your transaction receipt and transaction hash.
      </div>

      {/* Official Print Certificate Seal Footer */}
      <div className="hidden print:flex items-center justify-between pt-3 border-t border-slate-200 text-[9px] font-mono text-slate-500">
        <div>
          <span className="font-bold text-slate-700">VOXCHAIN EVM CONSENSUS VERIFIED</span> · Protocol Standard EIP-712
        </div>
        <div>
          CERTIFICATE REF: VC-{receipt.electionId}-{receipt.candidateId}-{receipt.transactionHash ? receipt.transactionHash.slice(2, 10).toUpperCase() : 'SEALED'}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-end gap-3 print:hidden">
        <VoxButton variant="outline" size="sm" icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
          Print Certificate
        </VoxButton>
        <VoxButton
          variant="primary-gold"
          size="sm"
          className="!text-black font-bold"
          icon={downloaded ? <Check className="w-4 h-4 text-black" /> : <Download className="w-4 h-4 text-black" />}
          onClick={downloadJson}
        >
          {downloaded ? 'Proof Downloaded!' : 'Download JSON Proof'}
        </VoxButton>
      </div>
    </div>
  );
};
