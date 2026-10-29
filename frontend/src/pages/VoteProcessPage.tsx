import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAccount, useWaitForTransactionReceipt, useChainId, useSwitchChain } from 'wagmi';
import { hardhat, sepolia } from 'wagmi/chains';
import { useElection } from '../hooks/useElection';
import { useVoxChain } from '../hooks/useVoxChain';
import { VOX_CHAIN_ABI } from '../contracts/voxChainAbi';
import { getContractAddress, isSupportedChain } from '../contracts/config';
import { VotingStepper } from '../components/voting/VotingStepper';
import { CandidateCard } from '../components/voting/CandidateCard';
import { BallotReviewDrawer } from '../components/voting/BallotReviewDrawer';
import { SealCeremony3D } from '../components/voting/SealCeremony3D';
import { ImmutableReceipt } from '../components/voting/ImmutableReceipt';
import { VoxButton } from '../components/common/VoxButton';
import { VoxAlert } from '../components/common/VoxAlert';
import { VoxHashPill } from '../components/common/VoxHashPill';
import { VoxCard } from '../components/common/VoxCard';
import { formatGasUsed, formatGweiPrice, formatEthFee } from '../utils/formatters';
import { ArrowLeft, ArrowRight, ShieldCheck, AlertCircle, KeyRound, Loader2 } from 'lucide-react';
import { parseContractError } from '../hooks/useVoxChainRegistry';
import type { VoteReceipt } from '../types';

export const VoteProcessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const contractParam = (searchParams.get('contract') as `0x${string}`) || undefined;
  const electionId = Number(id);
  const navigate = useNavigate();
  const { address, isConnected, chainId: accountChainId } = useAccount();
  const defaultChainId = useChainId();
  const chainId = accountChainId || defaultChainId;
  const { switchChainAsync } = useSwitchChain();
  const { contractAddress, writeContractAsync } = useVoxChain(contractParam);
  const { election, candidates, isEligible, hasVoted, isLoading, refetchAll } = useElection(electionId, contractParam);

  // Voting Lifecycle State: 1 to 6
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [txError, setTxError] = useState<string | null>(null);
  const [confirmedReceipt, setConfirmedReceipt] = useState<VoteReceipt | null>(null);

  // Wait for transaction receipt
  const {
    data: receipt,
    isLoading: isMining,
    isSuccess: isMined,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const selectedCandidate =
    candidates.find((c) => Number(c.id) === selectedCandidateId) || null;

  const candidateDisplay = selectedCandidate
    ? {
      id: Number(selectedCandidate.id),
      name: selectedCandidate.name,
      voteCount: Number(selectedCandidate.voteCount),
    }
    : null;

  const targetContractAddress = contractAddress || getContractAddress(chainId);
  const overviewUrl = `/election/${electionId}${contractParam ? `?contract=${contractParam}` : ''}`;

  // Handle stage transitions during mining
  useEffect(() => {
    if (txHash && isMining) {
      setCurrentStep(5); // Mining block
    }
  }, [txHash, isMining]);

  // Handle successful vote commit
  useEffect(() => {
    if (isMined && receipt && selectedCandidate && election && address && txHash && !confirmedReceipt) {
      setCurrentStep(6); // Sealed
      const receiptObj: VoteReceipt = {
        electionId,
        electionName: election.name,
        candidateId: Number(selectedCandidate.id),
        candidateName: selectedCandidate.name,
        voterAddress: address,
        transactionHash: txHash,
        contractAddress: targetContractAddress,
        blockNumber: receipt.blockNumber,
        timestamp: new Date().toUTCString(),
        gasUsed: receipt.gasUsed,
        effectiveGasPrice: receipt.effectiveGasPrice,
      };
      setConfirmedReceipt(receiptObj);
      refetchAll();
    }
  }, [isMined, receipt, targetContractAddress, electionId, election, address, txHash, selectedCandidate, refetchAll, confirmedReceipt]);

  // Execute on-chain castVote
  const handleInitiateSignature = async () => {
    if (!selectedCandidateId || !address || isSigning || Boolean(txHash)) return;
    setIsSigning(true);
    setTxError(null);
    setCurrentStep(3); // Awaiting Signature

    try {
      // Validate that connected network is supported
      if (!isSupportedChain(chainId)) {
        throw new Error(
          `Unsupported network (Chain ID: ${chainId}). Please switch your wallet to Hardhat Local (31337) or Sepolia testnet (11155111).`
        );
      }

      // Ensure contract address corresponds to child contract or active chain default
      if (!targetContractAddress) {
        if (chainId === sepolia.id) {
          throw new Error(
            'Sepolia election contract is not configured. Please set VITE_VOXCHAIN_CONTRACT_ADDRESS with your deployed Sepolia contract address or select a verified organisation.'
          );
        }
        throw new Error('No smart contract configured for this network.');
      }

      // Cast the vote on active chain
      const hash = await writeContractAsync({
        address: targetContractAddress,
        abi: VOX_CHAIN_ABI,
        functionName: 'castVote',
        args: [BigInt(electionId), BigInt(selectedCandidateId)],
      });

      setTxHash(hash);
      setIsReviewOpen(false);
      setIsSigning(false);
      setCurrentStep(4); // Broadcasting in Mempool
    } catch (err: any) {
      setIsSigning(false);
      const msg = parseContractError(err);
      setTxError(msg);
      setCurrentStep(2); // Return to review on error
    }
  };

  if (isLoading || !election) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white mb-4" />
        <span className="font-mono text-xs text-vox-text-muted">Loading Ballot #{id}...</span>
      </div>
    );
  }

  // Guard: If not connected or ineligible
  if (!isConnected) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <VoxAlert variant="warning" title="Wallet Authentication Required">
          Please connect your Ethereum wallet in the header to participate in this ballot.
        </VoxAlert>
      </div>
    );
  }

  if (!isSupportedChain(chainId)) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <VoxAlert variant="warning" title="Unsupported Network">
          Your wallet is connected to an unsupported network (Chain ID: {chainId}).
          Please switch your wallet to Hardhat Local (31337) or Sepolia (11155111) in MetaMask or via the header network selector.
        </VoxAlert>
      </div>
    );
  }

  if (chainId === sepolia.id && !targetContractAddress) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <VoxAlert variant="warning" title="Sepolia Contract Not Configured">
          VoxChain is running on Sepolia, but no Sepolia contract address is configured yet.
          Please deploy the contract to Sepolia and set <code className="font-mono">VITE_VOXCHAIN_CONTRACT_ADDRESS</code> or select a verified organisation.
        </VoxAlert>
      </div>
    );
  }

  if (!isEligible && !hasVoted) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <VoxCard variant="layer-1" padding="lg" className="border-vox-state-warning/40 text-center">
          <AlertCircle className="w-12 h-12 text-vox-state-warning mx-auto mb-3" />
          <h3 className="font-display font-bold text-xl text-vox-text-primary mb-2">You Are Not Registered Yet</h3>
          <p className="text-xs text-vox-text-secondary mb-6 leading-relaxed">
            Your wallet address (<code>{address}</code>) has not been added to the voter list for this election.
            Please ask the election administrator to register your address so you can cast your ballot.
          </p>
          <Link to={overviewUrl}>
            <VoxButton variant="outline">Back to Election Overview</VoxButton>
          </Link>
        </VoxCard>
      </div>
    );
  }

  if (hasVoted && currentStep < 6) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <VoxCard variant="layer-1" padding="lg" className="border-vox-state-success/40 text-center">
          <ShieldCheck className="w-12 h-12 text-vox-state-success mx-auto mb-3" />
          <h3 className="font-display font-bold text-xl text-vox-text-primary mb-2">You Have Already Voted</h3>
          <p className="text-xs text-vox-text-secondary mb-6 leading-relaxed">
            Your vote has already been successfully recorded on the blockchain for Election #{electionId}.
            Each registered voter may only vote once to ensure fair results.
          </p>
          <Link to={overviewUrl}>
            <VoxButton variant="primary">View Election State</VoxButton>
          </Link>
        </VoxCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-6 max-w-5xl mx-auto print:p-0 print:m-0 print:max-w-none print:gap-0">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between border-b border-vox-border-subtle pb-4 print:hidden">
        <div className="flex items-center gap-2 text-xs font-mono text-vox-text-muted">
          <Link to={overviewUrl} className="hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Ballot Overview
          </Link>
          <span>/</span>
          <span className="text-vox-text-secondary">Cast Vote</span>
        </div>
        <span className="font-mono text-xs text-[#D8D8D8] font-semibold">
          {election.name} (#{electionId})
        </span>
      </div>

      {/* 6-Stage Progress Stepper */}
      <div className="print:hidden">
        <VotingStepper currentStep={currentStep} />
      </div>

      {/* Error Banner */}
      {txError && (
        <VoxAlert variant="danger" title="Transaction Error">
          {txError}
        </VoxAlert>
      )}

      {/* STAGE 1: Candidate Selection */}
      {currentStep === 1 && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="font-display font-bold text-2xl text-vox-text-primary">
              Step 1: Select Your Candidate
            </h2>
            <p className="text-xs text-vox-text-secondary">
              Review candidate agendas and select one individual. You will verify your selection in the next step.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((cand) => (
              <CandidateCard
                key={cand.id.toString()}
                candidate={{
                  id: Number(cand.id),
                  name: cand.name,
                  voteCount: Number(cand.voteCount),
                }}
                isSelected={selectedCandidateId === Number(cand.id)}
                onSelect={(candId) => setSelectedCandidateId(candId)}
              />
            ))}
          </div>

          {/* Sticky Bottom Action Bar */}
          <div className="sticky bottom-4 z-20 p-4 bg-vox-surface-1/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="text-xs">
              <span className="text-vox-text-muted block">Current Selection:</span>
              <span className="font-display font-semibold text-sm text-[#F4F4F4]">
                {selectedCandidate ? selectedCandidate.name : 'No candidate selected yet'}
              </span>
            </div>

            <VoxButton
              variant="primary"
              size="lg"
              disabled={!selectedCandidateId}
              onClick={() => {
                setCurrentStep(2);
                setIsReviewOpen(true);
              }}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Review Ballot & Sign →
            </VoxButton>
          </div>
        </div>
      )}

      {/* STAGE 3: MetaMask Signature Prompt Stage */}
      {currentStep === 3 && (
        <VoxCard variant="layer-1" padding="lg" className="text-center py-16 max-w-lg mx-auto flex flex-col items-center border-white/16">
          <div className="w-16 h-16 rounded-full bg-white/10 border border-white/25 flex items-center justify-center text-white mb-6 animate-pulse">
            <KeyRound className="w-8 h-8" />
          </div>
          <h3 className="font-display font-medium text-2xl text-vox-text-primary mb-2">
            Confirm in Your Wallet
          </h3>
          <p className="text-xs text-vox-text-secondary max-w-sm mb-6 leading-relaxed">
            Please check your wallet prompt and approve the transaction to securely cast your ballot.
          </p>
          <div className="p-3 bg-vox-surface-2 rounded-lg border border-vox-border-subtle font-mono text-xs text-vox-text-muted">
            Waiting for wallet confirmation...
          </div>
        </VoxCard>
      )}

      {/* STAGE 4 & 5: Transaction Submission & Confirmation */}
      {(currentStep === 4 || currentStep === 5) && (
        <VoxCard variant="layer-1" padding="lg" className="max-w-xl mx-auto py-12 flex flex-col items-center text-center border-white/16">
          <div className="w-16 h-16 rounded-full bg-white/10 border border-white/25 flex items-center justify-center text-white mb-6">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>

          <h3 className="font-display font-medium text-2xl text-vox-text-primary mb-2">
            {currentStep === 4 ? 'Submitting Your Vote' : 'Confirming on Blockchain'}
          </h3>

          <p className="text-xs text-vox-text-secondary max-w-md mb-8 leading-relaxed">
            Your vote is being securely recorded on the network. This usually takes just a few seconds.
          </p>

          {/* Live Status Box */}
          <div className="w-full bg-vox-surface-2 border border-vox-border-subtle rounded-xl p-5 font-mono text-xs flex flex-col gap-3 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-vox-border-subtle">
              <span className="text-vox-text-muted">Transaction ID:</span>
              {txHash ? <VoxHashPill hash={txHash} type="txHash" /> : <span>Processing...</span>}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-vox-text-muted">Status:</span>
              <span className="text-[#D8D8D8] font-semibold animate-pulse">
                {currentStep === 4 ? 'Submitting vote...' : 'Awaiting confirmation...'}
              </span>
            </div>
          </div>
        </VoxCard>
      )}

      {/* STAGE 6: Immutable Seal Ceremony & Verifiable Receipt */}
      {currentStep === 6 && confirmedReceipt && (
        <div className="flex flex-col gap-8 print:gap-0">
          {/* 3D Rotating Seal Ceremony */}
          <div className="text-center relative -mt-4 print:hidden">
            <SealCeremony3D />
            <div className="relative -mt-6 sm:-mt-8 flex flex-col items-center gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-semibold shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Vote Confirmed on Blockchain (Block #{confirmedReceipt.blockNumber?.toString() || 'Confirmed'})</span>
              </div>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
                Vote Successfully Recorded!
              </h2>
              <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                Your ballot has been securely verified and recorded on the blockchain. Your vote is safe, permanent, and tamper-proof.
              </p>
            </div>
          </div>

          {/* Official Cryptographic Receipt Certificate */}
          <ImmutableReceipt receipt={confirmedReceipt} />

          {/* Navigation Action */}
          <div className="flex justify-center mt-4 print:hidden">
            <Link to="/dashboard">
              <VoxButton variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
                Return to Elections Hub
              </VoxButton>
            </Link>
          </div>
        </div>
      )}

      {/* Ballot Review Slide-over Drawer */}
      <BallotReviewDrawer
        isOpen={isReviewOpen}
        onClose={() => {
          setIsReviewOpen(false);
          setCurrentStep(1);
        }}
        electionId={electionId}
        electionName={election.name}
        candidate={candidateDisplay}
        voterAddress={address}
        onConfirmSign={handleInitiateSignature}
        isLoading={isSigning}
      />
    </div>
  );
};
