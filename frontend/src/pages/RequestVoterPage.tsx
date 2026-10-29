import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAccount, useReadContract, useChainId } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoxChain } from '../hooks/useVoxChain';
import { useVoxChainRegistry } from '../hooks/useVoxChainRegistry';
import { VOX_CHAIN_ABI } from '../contracts/voxChainAbi';
import { isSupportedChain, getExplorerTxUrl } from '../contracts/config';
import { VoxCard } from '../components/common/VoxCard';
import { VoxButton } from '../components/common/VoxButton';
import { VoxBadge } from '../components/common/VoxBadge';
import { VoxHashPill } from '../components/common/VoxHashPill';
import { ConnectWalletModal } from '../components/common/ConnectWalletModal';
import {
  VoterRegistrationRequest,
  VoterRequestStatus,
} from '../types/voterRequest';
import {
  getVoterRequests,
  submitVoterRequest,
  deleteVoterRequest,
  subscribeVoterRequests,
} from '../utils/voterRequestsStorage';
import {
  UserCheck,
  UserPlus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  ExternalLink,
  Wallet,
  ArrowRight,
  Vote,
  Sparkles,
  RefreshCw,
  Building2,
  Trash2,
} from 'lucide-react';

export const RequestVoterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedElection = searchParams.get('election');
  const preselectedContract = searchParams.get('contract') as `0x${string}` | null;

  const { address, isConnected, chainId: accountChainId } = useAccount();
  const defaultChainId = useChainId();
  const chainId = isSupportedChain(accountChainId)
    ? accountChainId
    : isSupportedChain(defaultChainId)
    ? defaultChainId
    : sepolia.id;

  const { approvedOrganisations } = useVoxChainRegistry();

  // Selected contract (defaults to preselectedContract or default contract)
  const [selectedContract, setSelectedContract] = useState<`0x${string}` | undefined>(
    preselectedContract || undefined
  );

  const { electionCount, orgName, contractAddress } = useVoxChain(selectedContract);

  // Form State
  const [targetElectionId, setTargetElectionId] = useState<number>(
    preselectedElection ? Number(preselectedElection) : 1
  );
  const [voterName, setVoterName] = useState('');
  const [identityInfo, setIdentityInfo] = useState('');
  const [justification, setJustification] = useState('');
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // Local storage state of requests
  const [allRequests, setAllRequests] = useState<VoterRegistrationRequest[]>([]);

  useEffect(() => {
    setAllRequests(getVoterRequests());
    const unsubscribe = subscribeVoterRequests(() => {
      setAllRequests(getVoterRequests());
    });
    return unsubscribe;
  }, []);

  // Update target election when count or preselected change
  useEffect(() => {
    if (preselectedElection) {
      setTargetElectionId(Number(preselectedElection));
    } else if (electionCount > 0 && targetElectionId > electionCount) {
      setTargetElectionId(1);
    }
  }, [electionCount, preselectedElection]);

  // Read current target election name from contract
  const { data: targetElectionData } = useReadContract({
    address: contractAddress,
    abi: VOX_CHAIN_ABI,
    functionName: 'elections',
    args: [BigInt(targetElectionId || 1)],
    chainId,
    query: {
      enabled: Boolean(contractAddress && targetElectionId > 0),
    },
  });

  const electionNameFromContract = targetElectionData
    ? (targetElectionData as [bigint, string, boolean, boolean])[1]
    : `Election #${targetElectionId}`;

  // Check on-chain eligibility for connected address
  const { data: onChainEligible, refetch: refetchEligibility } = useReadContract({
    address: contractAddress,
    abi: VOX_CHAIN_ABI,
    functionName: 'checkEligibility',
    args: address && targetElectionId ? [BigInt(targetElectionId), address] : undefined,
    chainId,
    query: {
      enabled: Boolean(isConnected && address && contractAddress && targetElectionId > 0),
    },
  });

  const isAlreadyRegisteredOnChain = Boolean(onChainEligible);

  // Filter requests submitted by this connected wallet
  const myRequests = allRequests.filter(
    (r) => address && r.voterAddress.toLowerCase() === address.toLowerCase()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!isConnected || !address) {
      setFormError('Please connect your Web3 wallet first to submit a voter request.');
      return;
    }

    if (!voterName.trim()) {
      setFormError('Please enter your full name or voting identity.');
      return;
    }

    if (!contractAddress) {
      setFormError('Election contract address is not configured.');
      return;
    }

    setIsSubmitting(true);

    try {
      submitVoterRequest({
        voterAddress: address,
        voterName: voterName.trim(),
        identityInfo: identityInfo.trim() || undefined,
        justification: justification.trim() || undefined,
        electionId: targetElectionId,
        electionName: electionNameFromContract || `Election #${targetElectionId}`,
        contractAddress,
        orgName: orgName || 'VoxChain Platform',
      });

      setFormSuccess('Voter registration request submitted successfully! The administrator will review your application.');
      setVoterName('');
      setIdentityInfo('');
      setJustification('');
      setAllRequests(getVoterRequests());
    } catch (err: any) {
      setFormError(err?.message || 'Failed to submit voter request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRequest = (id: string) => {
    deleteVoterRequest(id);
    setAllRequests(getVoterRequests());
  };

  return (
    <div className="max-w-4xl mx-auto py-8 flex flex-col gap-8">
      {/* ── Top Header ── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#101018] via-[#0A0A10] to-[#050508] p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold text-emerald-400 uppercase tracking-widest px-2.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30">
                <UserPlus className="w-3.5 h-3.5" />
                Voter Self-Registration
              </span>
              <VoxBadge variant="gold" size="sm">
                Decentralized Access
              </VoxBadge>
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
              Raise Request to Become a Voter
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
              Apply directly to the election administrator to have your wallet authorized on-chain.
              No manual off-chain verification required.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <VoxButton variant="outline" size="sm" icon={<Vote className="w-3.5 h-3.5" />}>
                View Active Elections
              </VoxButton>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Left Column: Form & Election Selector (7 Cols) ── */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Wallet Status Card */}
          <VoxCard variant="layer-1" padding="md" className="border-white/10 bg-[#0C0D12]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                    Connected Wallet Address
                  </span>
                  {isConnected && address ? (
                    <VoxHashPill hash={address} type="address" truncate={true} />
                  ) : (
                    <span className="text-xs text-zinc-400 font-mono">No wallet connected</span>
                  )}
                </div>
              </div>

              {!isConnected ? (
                <VoxButton
                  variant="primary"
                  size="sm"
                  onClick={() => setIsWalletModalOpen(true)}
                  icon={<Wallet className="w-3.5 h-3.5" />}
                >
                  Connect Wallet
                </VoxButton>
              ) : (
                <VoxBadge variant="success" size="sm" dot={true}>
                  Connected
                </VoxBadge>
              )}
            </div>
          </VoxCard>

          {/* Registration Form Card */}
          <VoxCard variant="layer-1" padding="lg" className="border-white/10 bg-[#0D0E14] relative">
            <h2 className="font-display font-semibold text-lg text-white mb-1 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              <span>Voter Application Form</span>
            </h2>
            <p className="text-xs text-zinc-400 mb-6">
              Select the ballot you wish to participate in and provide your credentials.
            </p>

            {formSuccess && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>{formSuccess}</p>
              </div>
            )}

            {formError && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p>{formError}</p>
              </div>
            )}

            {/* If already registered on-chain, display celebratory banner */}
            {isConnected && isAlreadyRegisteredOnChain && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs">
                <div className="flex items-center gap-2 font-semibold text-emerald-300 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Your Wallet is Already Registered On-Chain!</span>
                </div>
                <p className="text-zinc-300 leading-relaxed mb-3">
                  You are verified as an eligible voter for <strong>{electionNameFromContract}</strong>. You can cast your ballot whenever voting opens.
                </p>
                <Link to={`/election/${targetElectionId}`}>
                  <VoxButton variant="primary" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Go to Election Ballot
                  </VoxButton>
                </Link>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Organisation Selector (if multiple exist) */}
              {approvedOrganisations.length > 0 && (
                <div>
                  <label className="font-mono text-xs text-zinc-300 uppercase tracking-wider block mb-1.5">
                    Organisation Contract
                  </label>
                  <select
                    value={selectedContract || ''}
                    onChange={(e) => {
                      const val = e.target.value as `0x${string}`;
                      setSelectedContract(val ? val : undefined);
                    }}
                    className="w-full bg-[#12141C] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-colors font-mono"
                  >
                    <option value="">Default Platform Election Hub</option>
                    {approvedOrganisations.map((org) => (
                      <option key={org.id.toString()} value={org.contractAddress}>
                        {org.name} ({org.contractAddress.slice(0, 8)}...{org.contractAddress.slice(-6)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Target Election Selector */}
              <div>
                <label className="font-mono text-xs text-zinc-300 uppercase tracking-wider block mb-1.5">
                  Target Election Ballot <span className="text-rose-400">*</span>
                </label>
                <select
                  value={targetElectionId}
                  onChange={(e) => setTargetElectionId(Number(e.target.value))}
                  className="w-full bg-[#12141C] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-colors font-sans"
                >
                  {electionCount === 0 && (
                    <option value={1}>Election #1 (No other elections currently deployed)</option>
                  )}
                  {Array.from({ length: Math.max(electionCount, 1) }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      Election #{num} {num === targetElectionId && targetElectionData ? `· ${electionNameFromContract}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Voter Full Name */}
              <div>
                <label className="font-mono text-xs text-zinc-300 uppercase tracking-wider block mb-1.5">
                  Full Name / Legal Identity <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe / Sarah Connor"
                  value={voterName}
                  onChange={(e) => setVoterName(e.target.value)}
                  className="w-full bg-[#12141C] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              {/* Identification / Badge No. */}
              <div>
                <label className="font-mono text-xs text-zinc-300 uppercase tracking-wider block mb-1.5">
                  Identification / Student ID / Badge No. (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Student ID: 2026-ENG-4910 or Passport No."
                  value={identityInfo}
                  onChange={(e) => setIdentityInfo(e.target.value)}
                  className="w-full bg-[#12141C] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              {/* Justification / Note */}
              <div>
                <label className="font-mono text-xs text-zinc-300 uppercase tracking-wider block mb-1.5">
                  Note to Administrator (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide any context regarding your eligibility for this election..."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  className="w-full bg-[#12141C] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <VoxButton
                  type="submit"
                  variant="primary"
                  className="w-full justify-center"
                  disabled={isSubmitting || !isConnected}
                  icon={isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                >
                  {isSubmitting ? 'Submitting Application...' : 'Submit Voter Registration Request'}
                </VoxButton>

                {!isConnected && (
                  <span className="text-[11px] font-mono text-zinc-500 text-center block mt-2">
                    Please connect your wallet above before submitting.
                  </span>
                )}
              </div>
            </form>
          </VoxCard>
        </div>

        {/* ── Right Column: My Applications & Guidance (5 Cols) ── */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Applications Status Card */}
          <VoxCard variant="layer-1" padding="lg" className="border-white/10 bg-[#0C0D12] flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#818CF8]" />
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-white">
                  My Voter Applications
                </h3>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                {myRequests.length} {myRequests.length === 1 ? 'Record' : 'Records'}
              </span>
            </div>

            {!isConnected ? (
              <div className="py-8 text-center text-xs text-zinc-500">
                Connect your wallet to track your submitted voter registration requests.
              </div>
            ) : myRequests.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500 leading-relaxed">
                You haven't submitted any voter registration requests yet. Fill in the form on the left to apply.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {myRequests.map((req) => {
                  const txUrl = getExplorerTxUrl(req.approvalTxHash, chainId);

                  return (
                    <div
                      key={req.id}
                      className="p-3.5 rounded-xl border border-white/10 bg-[#12131A] flex flex-col gap-2.5 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-xs text-white">
                              {req.voterName}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400">
                              Ballot #{req.electionId}
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-400 block mt-0.5 truncate max-w-[220px]">
                            {req.electionName}
                          </span>
                        </div>

                        {/* Status Badge */}
                        {req.status === VoterRequestStatus.Pending && (
                          <VoxBadge variant="warning" size="sm" dot={true}>
                            Pending
                          </VoxBadge>
                        )}
                        {req.status === VoterRequestStatus.Approved && (
                          <VoxBadge variant="success" size="sm" dot={true}>
                            Approved
                          </VoxBadge>
                        )}
                        {req.status === VoterRequestStatus.Rejected && (
                          <VoxBadge variant="danger" size="sm">
                            Rejected
                          </VoxBadge>
                        )}
                      </div>

                      {req.identityInfo && (
                        <span className="text-[11px] font-mono text-zinc-400 bg-black/30 px-2 py-1 rounded">
                          {req.identityInfo}
                        </span>
                      )}

                      {/* Status Details */}
                      {req.status === VoterRequestStatus.Pending && (
                        <p className="text-[11px] text-amber-300/80 leading-relaxed">
                          Under administrator review. Your wallet address is queued for on-chain registration.
                        </p>
                      )}

                      {req.status === VoterRequestStatus.Approved && (
                        <div className="flex flex-col gap-1.5 pt-1 border-t border-emerald-500/20 text-[11px] text-emerald-300">
                          <span className="font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            Registered On-Chain!
                          </span>
                          {txUrl && (
                            <a
                              href={txUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 hover:underline"
                            >
                              <span>View Registration Tx</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                          <Link to={`/election/${req.electionId}`} className="mt-1">
                            <VoxButton variant="primary" size="sm" className="w-full justify-center">
                              Enter Ballot
                            </VoxButton>
                          </Link>
                        </div>
                      )}

                      {req.status === VoterRequestStatus.Rejected && (
                        <div className="pt-1 border-t border-rose-500/20 text-[11px] text-rose-300 leading-relaxed">
                          <span className="font-semibold block mb-0.5">Rejection Reason:</span>
                          {req.rejectionReason || 'Application did not meet election eligibility criteria.'}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1.5 border-t border-white/5">
                        <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                        {req.status === VoterRequestStatus.Pending && (
                          <button
                            onClick={() => handleDeleteRequest(req.id)}
                            className="text-zinc-500 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
                            title="Cancel request"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Cancel</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </VoxCard>

          {/* How It Works Guidance Box */}
          <VoxCard variant="layer-1" padding="md" className="border-white/10 bg-[#090A0E] text-xs text-zinc-400">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold block mb-2">
              Workflow Overview
            </span>
            <ol className="list-decimal list-inside space-y-2 text-zinc-300 leading-relaxed">
              <li>
                <strong>Connect Wallet:</strong> Your cryptographic address serves as your unique voter identity.
              </li>
              <li>
                <strong>Submit Application:</strong> Select your ballot and submit your credential details.
              </li>
              <li>
                <strong>Admin On-Chain Approval:</strong> The election super admin reviews your request and directly adds your address to the smart contract.
              </li>
              <li>
                <strong>Vote Immutably:</strong> Once approved, visit the ballot box to cast your secret, verifiable vote.
              </li>
            </ol>
          </VoxCard>
        </div>
      </div>

      <ConnectWalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </div>
  );
};
