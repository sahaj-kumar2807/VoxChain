import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAccount, useWaitForTransactionReceipt, useChainId, useSwitchChain } from 'wagmi';
import { hardhat } from 'wagmi/chains';
import { useElection } from '../hooks/useElection';
import { useVoxChain } from '../hooks/useVoxChain';
import { VOX_CHAIN_ABI } from '../contracts/voxChainAbi';
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
import confetti from 'canvas-confetti';
import type { VoteReceipt } from '../types';

export const VoteProcessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const electionId = Number(id);
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  console.log("VOXCHAIN DEBUG - chainId:", chainId);
  console.log("VOXCHAIN DEBUG - Hardhat ID:", hardhat.id);
  const { contractAddress, writeContractAsync } = useVoxChain();
  const { election, candidates, isEligible, hasVoted, isLoading, refetchAll } = useElection(electionId);

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

  // Handle stage transitions during mining
  useEffect(() => {
    if (txHash && isMining) {
      setCurrentStep(5); // Mining block
    }
  }, [txHash, isMining]);

  // Handle successful vote commit
  useEffect(() => {
    if (isMined && receipt && selectedCandidate && election && address && txHash) {
      setCurrentStep(6); // Sealed
      const receiptObj: VoteReceipt = {
        electionId,
        electionName: election.name,
        candidateId: Number(selectedCandidate.id),
        candidateName: selectedCandidate.name,
        voterAddress: address,
        transactionHash: txHash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date().toUTCString(),
        gasUsed: receipt.gasUsed,
        effectiveGasPrice: receipt.effectiveGasPrice,
      };
      setConfirmedReceipt(receiptObj);
      refetchAll();

      // Trigger celebratory confetti effect
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#10B981', '#FBBF24'],
        });
      } catch {
        // Fallback
      }
    }
  }, [isMined, receipt]);

  // Execute on-chain castVote
  const handleInitiateSignature = async () => {
    if (!selectedCandidateId || !address) return;
    setIsSigning(true);
    setTxError(null);
    setCurrentStep(3); // Awaiting Signature

    try {
      // Make sure MetaMask is actually on Hardhat Local
      if (chainId !== hardhat.id) {
        await switchChainAsync({
          chainId: hardhat.id,
        });
      }

      // Cast the vote on Hardhat Local
      const hash = await writeContractAsync({
        address: contractAddress,
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
      const msg = err?.shortMessage || err?.message || 'Transaction rejected by user in MetaMask';
      setTxError(msg);
      setCurrentStep(2); // Return to review on error
    }
  };

  if (isLoading || !election) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-vox-accent-gold mb-4" />
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

  if (!isEligible && !hasVoted) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <VoxCard variant="layer-1" padding="lg" className="border-vox-state-warning/40 text-center">
          <AlertCircle className="w-12 h-12 text-vox-state-warning mx-auto mb-3" />
          <h3 className="font-display font-bold text-xl text-vox-text-primary mb-2">Voter Not Registered</h3>
          <p className="text-xs text-vox-text-secondary mb-6 leading-relaxed">
            Your connected wallet address (<code>{address}</code>) is not on the voter allowlist for this election.
            Please contact the election administrator to register your address before the ballot begins.
          </p>
          <Link to={`/election/${electionId}`}>
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
          <h3 className="font-display font-bold text-xl text-vox-text-primary mb-2">Ballot Already Cast</h3>
          <p className="text-xs text-vox-text-secondary mb-6 leading-relaxed">
            Your cryptographic vote has already been committed to the blockchain for Election #{electionId}. Each voter
            address may only submit one immutable ballot.
          </p>
          <Link to={`/election/${electionId}`}>
            <VoxButton variant="primary-gold">View Election State</VoxButton>
          </Link>
        </VoxCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-6 max-w-5xl mx-auto">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between border-b border-vox-border-subtle pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-vox-text-muted">
          <Link to={`/election/${electionId}`} className="hover:text-vox-accent-gold flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Ballot Overview
          </Link>
          <span>/</span>
          <span className="text-vox-text-secondary">Cast Vote</span>
        </div>
        <span className="font-mono text-xs text-vox-accent-gold font-semibold">
          {election.name} (#{electionId})
        </span>
      </div>

      {/* 6-Stage Progress Stepper */}
      <VotingStepper currentStep={currentStep} />

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
          <div className="sticky bottom-4 z-20 p-4 bg-vox-surface-1/95 backdrop-blur-md border border-vox-border-strong rounded-xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="text-xs">
              <span className="text-vox-text-muted block">Current Selection:</span>
              <span className="font-display font-bold text-sm text-vox-accent-gold">
                {selectedCandidate ? selectedCandidate.name : 'No candidate selected yet'}
              </span>
            </div>

            <VoxButton
              variant="primary-gold"
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
        <VoxCard variant="layer-1" padding="lg" className="text-center py-16 max-w-lg mx-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-vox-accent-gold-glow border border-vox-accent-gold/40 flex items-center justify-center text-vox-accent-gold mb-6 animate-pulse">
            <KeyRound className="w-8 h-8" />
          </div>
          <h3 className="font-display font-bold text-2xl text-vox-text-primary mb-2">
            Awaiting Signature in MetaMask
          </h3>
          <p className="text-xs text-vox-text-secondary max-w-sm mb-6 leading-relaxed">
            Please check your browser extension pop-up. Confirm smart contract function{' '}
            <code>castVote({electionId}, {selectedCandidateId})</code> to authorize broadcasting.
          </p>
          <div className="p-3 bg-vox-surface-2 rounded-lg border border-vox-border-subtle font-mono text-xs text-vox-text-muted">
            Status: Requesting EIP-1193 Signature...
          </div>
        </VoxCard>
      )}

      {/* STAGE 4 & 5: Mempool Broadcasting & Mining Telemetry */}
      {(currentStep === 4 || currentStep === 5) && (
        <VoxCard variant="layer-1" padding="lg" className="max-w-xl mx-auto py-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-vox-state-info-bg border border-vox-state-info/40 flex items-center justify-center text-vox-state-info mb-6">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>

          <h3 className="font-display font-bold text-2xl text-vox-text-primary mb-2">
            {currentStep === 4 ? 'Broadcasting to Mempool' : 'Mining into Ethereum Block'}
          </h3>

          <p className="text-xs text-vox-text-secondary max-w-md mb-8 leading-relaxed">
            Your cryptographic ballot has been broadcast to network validator nodes. Waiting for inclusion in the next block.
          </p>

          {/* Live Telemetry Box */}
          <div className="w-full bg-vox-surface-2 border border-vox-border-subtle rounded-xl p-5 font-mono text-xs flex flex-col gap-3 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-vox-border-subtle">
              <span className="text-vox-text-muted">Transaction Hash:</span>
              {txHash ? <VoxHashPill hash={txHash} type="txHash" /> : <span>Generating...</span>}
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-vox-border-subtle">
              <span className="text-vox-text-muted">Smart Contract:</span>
              <VoxHashPill hash={contractAddress} type="address" />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-vox-text-muted">Consensus Status:</span>
              <span className="text-vox-accent-gold font-semibold animate-pulse">
                {currentStep === 4 ? 'Propagating Tx...' : 'Awaiting 1 Block Confirmation...'}
              </span>
            </div>
          </div>
        </VoxCard>
      )}

      {/* STAGE 6: Immutable Seal Ceremony & Verifiable Receipt */}
      {currentStep === 6 && confirmedReceipt && (
        <div className="flex flex-col gap-8">
          {/* 3D Rotating Seal Ceremony */}
          <div className="text-center">
            <SealCeremony3D />
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-vox-text-primary mt-2">
              Ballot Immutably Sealed
            </h2>
            <p className="text-xs font-mono text-vox-state-success mt-1">
              ✓ Smart Contract State Committed (Block #{confirmedReceipt.blockNumber?.toString() || 'Mined'})
            </p>
          </div>

          {/* Official Cryptographic Receipt Certificate */}
          <ImmutableReceipt receipt={confirmedReceipt} />

          {/* Navigation Action */}
          <div className="flex justify-center mt-4">
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
