import React, { useState, useEffect } from 'react';
import { useAccount, useChainId, usePublicClient, useWriteContract } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoxChain } from '../hooks/useVoxChain';
import { useVoxChainRegistry, parseContractError } from '../hooks/useVoxChainRegistry';
import { AdminGuard } from '../components/admin/AdminGuard';
import { VoxCard } from '../components/common/VoxCard';
import { VoxBadge } from '../components/common/VoxBadge';
import { VoxButton } from '../components/common/VoxButton';
import { VoxHashPill } from '../components/common/VoxHashPill';
import { VoxModal } from '../components/common/VoxModal';
import { VOX_CHAIN_ABI } from '../contracts/voxChainAbi';
import { isSupportedChain, getExplorerTxUrl } from '../contracts/config';
import {
  VoterRegistrationRequest,
  VoterRequestStatus,
} from '../types/voterRequest';
import {
  getVoterRequests,
  approveVoterRequest,
  rejectVoterRequest,
  subscribeVoterRequests,
} from '../utils/voterRequestsStorage';
import {
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  ExternalLink,
  Search,
  Filter,
  Check,
  X,
  Loader2,
  RefreshCw,
  Building2,
  Vote,
  Sparkles,
} from 'lucide-react';

export const ApproveVotersPage: React.FC = () => {
  const { address, isConnected, chainId: accountChainId } = useAccount();
  const defaultChainId = useChainId();
  const chainId = isSupportedChain(accountChainId)
    ? accountChainId
    : isSupportedChain(defaultChainId)
    ? defaultChainId
    : sepolia.id;

  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { isSuperAdmin, isOrgAdmin, approvedOrganisations } = useVoxChainRegistry();

  // Voter requests state
  const [requests, setRequests] = useState<VoterRegistrationRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedElectionFilter, setSelectedElectionFilter] = useState<string>('all');

  // Approval / Rejection Transaction States
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Reject Modal state
  const [rejectingRequest, setRejectingRequest] = useState<VoterRegistrationRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('Application did not meet election eligibility criteria.');

  useEffect(() => {
    setRequests(getVoterRequests());
    const unsubscribe = subscribeVoterRequests(() => {
      setRequests(getVoterRequests());
    });
    return unsubscribe;
  }, []);

  // Filter requests
  const filteredRequests = requests.filter((req) => {
    // Status tab filter
    if (activeTab === 'pending' && req.status !== VoterRequestStatus.Pending) return false;
    if (activeTab === 'approved' && req.status !== VoterRequestStatus.Approved) return false;
    if (activeTab === 'rejected' && req.status !== VoterRequestStatus.Rejected) return false;

    // Election filter
    if (selectedElectionFilter !== 'all') {
      const matchKey = `${req.contractAddress}-${req.electionId}`;
      if (matchKey !== selectedElectionFilter) return false;
    }

    // Search query filter (address, name, or identity)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchAddress = req.voterAddress.toLowerCase().includes(query);
      const matchName = req.voterName.toLowerCase().includes(query);
      const matchIdentity = req.identityInfo?.toLowerCase().includes(query) || false;
      if (!matchAddress && !matchName && !matchIdentity) return false;
    }

    return true;
  });

  const pendingCount = requests.filter((r) => r.status === VoterRequestStatus.Pending).length;
  const approvedCount = requests.filter((r) => r.status === VoterRequestStatus.Approved).length;
  const rejectedCount = requests.filter((r) => r.status === VoterRequestStatus.Rejected).length;

  // Handle on-chain approval & registration
  const handleApproveAndRegister = async (req: VoterRegistrationRequest) => {
    if (!isConnected || !address) {
      setActionError('Please connect your administrator wallet to execute on-chain voter registration.');
      return;
    }

    setProcessingId(req.id);
    setActionError(null);
    setActionSuccess(null);

    try {
      // 1. Submit on-chain transaction calling registerVoter(electionId, voterAddress)
      const txHash = await writeContractAsync({
        address: req.contractAddress,
        abi: VOX_CHAIN_ABI,
        functionName: 'registerVoter',
        args: [BigInt(req.electionId), req.voterAddress],
      });

      // 2. Wait for confirmation receipt
      if (publicClient && txHash) {
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      }

      // 3. Mark request as approved in persistent storage
      approveVoterRequest(req.id, txHash, address);
      setRequests(getVoterRequests());

      setActionSuccess(
        `Voter ${req.voterName} (${req.voterAddress.slice(0, 6)}...${req.voterAddress.slice(-4)}) successfully registered on-chain for Ballot #${req.electionId}!`
      );
    } catch (err: any) {
      console.error('Failed to register voter on-chain:', err);
      setActionError(parseContractError(err));
    } finally {
      setProcessingId(null);
    }
  };

  // Handle rejection
  const handleConfirmReject = () => {
    if (!rejectingRequest) return;

    rejectVoterRequest(rejectingRequest.id, rejectReason, address);
    setRequests(getVoterRequests());
    setActionSuccess(`Request from ${rejectingRequest.voterName} was rejected.`);
    setRejectingRequest(null);
  };

  return (
    <AdminGuard>
      <div className="max-w-5xl mx-auto py-8 flex flex-col gap-8">
        {/* ── Top Header ── */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#101018] via-[#0A0A10] to-[#050508] p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#818CF8]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold text-[#A5B4FC] uppercase tracking-widest px-2.5 py-0.5 rounded bg-[#6366F1]/15 border border-[#6366F1]/30">
                  <UserCheck className="w-3.5 h-3.5" />
                  Voter Verification Terminal
                </span>
                <VoxBadge variant="gold" size="sm">
                  Administrator Oversight
                </VoxBadge>
              </div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
                Approve & Register Voters
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
                Review voter credential requests submitted by users and authorize them on-chain with one click.
                Eliminates manual address copying and verifies voter eligibility instantly.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <VoxButton
                variant="outline"
                size="sm"
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={() => setRequests(getVoterRequests())}
              >
                Refresh Queue
              </VoxButton>
            </div>
          </div>
        </div>

        {/* ── Stats Metric Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <VoxCard variant="layer-1" padding="md" className="border-white/10 bg-[#0C0D12]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
              Total Applications
            </span>
            <span className="font-display font-bold text-2xl text-white">
              {requests.length}
            </span>
          </VoxCard>

          <VoxCard variant="layer-1" padding="md" className="border-amber-500/30 bg-[#0C0D12]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block mb-1">
              Pending Approval
            </span>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-2xl text-amber-300">
                {pendingCount}
              </span>
              {pendingCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </div>
          </VoxCard>

          <VoxCard variant="layer-1" padding="md" className="border-emerald-500/30 bg-[#0C0D12]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block mb-1">
              Approved On-Chain
            </span>
            <span className="font-display font-bold text-2xl text-emerald-300">
              {approvedCount}
            </span>
          </VoxCard>

          <VoxCard variant="layer-1" padding="md" className="border-rose-500/30 bg-[#0C0D12]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 block mb-1">
              Rejected
            </span>
            <span className="font-display font-bold text-2xl text-rose-300">
              {rejectedCount}
            </span>
          </VoxCard>
        </div>

        {/* Action feedback banners */}
        {actionSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-emerald-200">{actionSuccess}</p>
            </div>
            <button
              onClick={() => setActionSuccess(null)}
              className="text-emerald-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {actionError && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-rose-200 mb-0.5">Registration Failed</p>
              <p className="text-rose-300/90">{actionError}</p>
            </div>
            <button
              onClick={() => setActionError(null)}
              className="text-rose-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Filters & Search Controls ── */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0F1016] border border-white/10 self-start">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'pending'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Pending</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-[10px] text-amber-200">
                {pendingCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('approved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'approved'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Approved</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-[10px] text-emerald-200">
                {approvedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'rejected'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Rejected</span>
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500/30 text-[10px] text-rose-200">
                {rejectedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white/15 text-white border border-white/25 font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All ({requests.length})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[260px]">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search voter address or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0F1016] border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#818CF8]/50 transition-colors font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── Requests List ── */}
        <div className="flex flex-col gap-3">
          {filteredRequests.length === 0 ? (
            <VoxCard variant="layer-1" padding="lg" className="border-white/10 bg-[#0C0D12] text-center py-14">
              <UserCheck className="w-10 h-10 mx-auto text-zinc-600 mb-3" />
              <h3 className="font-display font-semibold text-base text-zinc-300 mb-1">
                No Voter Requests in this View
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                {activeTab === 'pending'
                  ? 'All voter registration requests have been processed.'
                  : 'No requests matched your filter or search criteria.'}
              </p>
            </VoxCard>
          ) : (
            filteredRequests.map((req) => {
              const isProcessingThis = processingId === req.id;
              const txUrl = getExplorerTxUrl(req.approvalTxHash, chainId);

              return (
                <VoxCard
                  key={req.id}
                  variant="layer-1"
                  padding="md"
                  className={`border-white/10 bg-[#0D0E15] transition-all hover:border-white/20 ${
                    req.status === VoterRequestStatus.Pending ? 'border-amber-500/25' : ''
                  }`}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    {/* Left: Voter Information */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        {req.status === VoterRequestStatus.Pending && (
                          <Clock className="w-5 h-5 text-amber-400" />
                        )}
                        {req.status === VoterRequestStatus.Approved && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        )}
                        {req.status === VoterRequestStatus.Rejected && (
                          <XCircle className="w-5 h-5 text-rose-400" />
                        )}
                      </div>

                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-semibold text-sm text-white">
                            {req.voterName}
                          </span>
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#6366F1]/15 text-[#A5B4FC] border border-[#6366F1]/30">
                            Ballot #{req.electionId}
                          </span>
                          {req.status === VoterRequestStatus.Pending && (
                            <VoxBadge variant="warning" size="sm" dot={true}>
                              Pending Review
                            </VoxBadge>
                          )}
                          {req.status === VoterRequestStatus.Approved && (
                            <VoxBadge variant="success" size="sm" dot={true}>
                              On-Chain Registered
                            </VoxBadge>
                          )}
                          {req.status === VoterRequestStatus.Rejected && (
                            <VoxBadge variant="danger" size="sm">
                              Rejected
                            </VoxBadge>
                          )}
                        </div>

                        {/* Voter Wallet Address */}
                        <div className="flex items-center gap-2">
                          <VoxHashPill hash={req.voterAddress} type="address" truncate={true} />
                          <span className="text-[10px] font-mono text-zinc-500">
                            • {req.electionName}
                          </span>
                        </div>

                        {req.identityInfo && (
                          <span className="text-xs text-zinc-300 font-mono mt-0.5">
                            {req.identityInfo}
                          </span>
                        )}

                        {req.justification && (
                          <p className="text-xs text-zinc-400 mt-1 italic leading-relaxed">
                            "{req.justification}"
                          </p>
                        )}

                        {req.status === VoterRequestStatus.Rejected && req.rejectionReason && (
                          <span className="text-xs text-rose-300 mt-1">
                            Rejection Note: {req.rejectionReason}
                          </span>
                        )}

                        {/* Approval Tx Hash link */}
                        {req.status === VoterRequestStatus.Approved && txUrl && (
                          <a
                            href={txUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 hover:underline mt-1"
                          >
                            <span>Verified on Sepolia Etherscan</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
                      {req.status === VoterRequestStatus.Pending && (
                        <>
                          <VoxButton
                            variant="primary"
                            size="sm"
                            disabled={isProcessingThis}
                            onClick={() => handleApproveAndRegister(req)}
                            icon={
                              isProcessingThis ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )
                            }
                          >
                            {isProcessingThis ? 'Registering On-Chain...' : 'Approve & Register Voter'}
                          </VoxButton>

                          <VoxButton
                            variant="outline"
                            size="sm"
                            disabled={isProcessingThis}
                            onClick={() => {
                              setRejectingRequest(req);
                              setRejectReason('Application did not meet election eligibility criteria.');
                            }}
                            className="text-rose-400 hover:text-rose-300 hover:border-rose-500/40"
                            icon={<X className="w-3.5 h-3.5" />}
                          >
                            Reject
                          </VoxButton>
                        </>
                      )}

                      {req.status === VoterRequestStatus.Approved && (
                        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/25">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Eligible to Vote</span>
                        </div>
                      )}

                      {req.status === VoterRequestStatus.Rejected && (
                        <span className="text-xs font-mono text-zinc-500">
                          Application Denied
                        </span>
                      )}
                    </div>
                  </div>
                </VoxCard>
              );
            })
          )}
        </div>

        {/* ── Rejection Confirmation Modal ── */}
        <VoxModal
          isOpen={Boolean(rejectingRequest)}
          onClose={() => setRejectingRequest(null)}
          title="Reject Voter Request"
          maxWidth="md"
        >
          <div className="flex flex-col gap-4">
            <p className="text-xs text-zinc-300 leading-relaxed">
              Are you sure you want to reject the voter registration request from{' '}
              <strong className="text-white">{rejectingRequest?.voterName}</strong>?
            </p>

            <div>
              <label className="font-mono text-xs text-zinc-400 uppercase tracking-wider block mb-1.5">
                Rejection Reason (Visible to Voter)
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-[#12141C] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500/50 transition-colors resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <VoxButton
                variant="outline"
                size="sm"
                onClick={() => setRejectingRequest(null)}
              >
                Cancel
              </VoxButton>

              <VoxButton
                variant="primary"
                size="sm"
                onClick={handleConfirmReject}
                className="bg-rose-600 hover:bg-rose-500 text-white border-rose-500"
              >
                Confirm Rejection
              </VoxButton>
            </div>
          </div>
        </VoxModal>
      </div>
    </AdminGuard>
  );
};
