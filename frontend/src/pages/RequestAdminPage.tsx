import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount, useSwitchChain } from 'wagmi';
import { hardhat, sepolia } from 'wagmi/chains';
import { motion } from 'framer-motion';
import { useVoxChainRegistry } from '../hooks/useVoxChainRegistry';
import { VoxCard } from '../components/common/VoxCard';
import { VoxButton } from '../components/common/VoxButton';
import { VoxBadge } from '../components/common/VoxBadge';
import { VoxHashPill } from '../components/common/VoxHashPill';
import { ConnectWalletModal } from '../components/common/ConnectWalletModal';
import { getExplorerTxUrl, getExplorerAddressUrl, isSupportedChain } from '../contracts/config';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  Wallet,
  Lock,
  ArrowRight,
  Info,
  RefreshCw,
  XCircle,
} from 'lucide-react';

export const RequestAdminPage: React.FC = () => {
  const { address, isConnected, chainId: accountChainId } = useAccount();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const {
    chainId: registryChainId,
    registryAddress,
    isRegistryConfigured,
    allOrganisations,
    requestRegistration,
    txHash,
    isWritePending,
    isConfirming,
    isConfirmed,
    parsedWriteError,
    resetWrite,
    refetchAll,
    isLoading,
  } = useVoxChainRegistry();

  const isWrongNetwork = isConnected && accountChainId !== undefined && !isSupportedChain(accountChainId);
  const isRegistryAvailable = isRegistryConfigured && Boolean(registryAddress);

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [orgDesc, setOrgDesc] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Check if current connected user has existing requests in the registry
  const userPendingOrg = allOrganisations.find(
    (o) =>
      o.status === 1 && // RegistrationStatus.Pending
      address &&
      o.requester.toLowerCase() === address.toLowerCase()
  );

  const userApprovedOrg = allOrganisations.find(
    (o) =>
      o.status === 2 && // RegistrationStatus.Approved
      address &&
      (o.admin.toLowerCase() === address.toLowerCase() ||
        o.requester.toLowerCase() === address.toLowerCase())
  );

  const userRejectedOrg = allOrganisations.find(
    (o) =>
      o.status === 3 && // RegistrationStatus.Rejected
      address &&
      o.requester.toLowerCase() === address.toLowerCase()
  );

  const isTxProcessing = isWritePending || isConfirming;
  const txExplorerUrl = getExplorerTxUrl(txHash, registryChainId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !address) {
      setIsWalletModalOpen(true);
      return;
    }

    const trimmedName = orgName.trim();
    const trimmedDesc = orgDesc.trim();

    if (!trimmedName) {
      setValidationError('Organisation name is required.');
      return;
    }
    if (trimmedName.length < 3) {
      setValidationError('Organisation name must be at least 3 characters.');
      return;
    }
    if (!trimmedDesc) {
      setValidationError('Organisation description is required.');
      return;
    }
    if (trimmedDesc.length < 10) {
      setValidationError('Please provide a descriptive overview (at least 10 characters).');
      return;
    }

    if (isWrongNetwork) {
      setValidationError('Please switch your wallet to a supported network (Ethereum Sepolia or Hardhat Local) to proceed.');
      try {
        await switchChain?.({ chainId: sepolia.id });
      } catch {
        // user rejected network switch in wallet
      }
      return;
    }

    if (!isRegistryAvailable) {
      setValidationError('The VoxChain Registry contract is not configured on this network.');
      return;
    }

    try {
      setValidationError(null);
      await requestRegistration(trimmedName, trimmedDesc);
      setOrgName('');
      setOrgDesc('');
    } catch {
      // Error is caught and surfaced via parsedWriteError
    }
  };

  return (
    <div className="flex flex-col gap-8 py-6 max-w-4xl mx-auto">
      {/* ── Page Header ── */}
      <div className="p-6 sm:p-8 bg-[#0D0D14] border border-white/10 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-[0_16px_40px_rgba(0,0,0,0.8)] relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle,rgba(99,102,241,0.12)_0%,transparent_70%)] blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2.5">
            <Building2 className="w-4 h-4 text-[#818CF8]" />
            <span className="font-mono text-[10px] font-semibold text-[#818CF8] uppercase tracking-widest">
              Civic EVM Registry
            </span>
            <VoxBadge variant="gold" size="sm">
              Admin Onboarding
            </VoxBadge>
          </div>
          <h1 className="font-display font-medium text-2xl sm:text-3xl text-white tracking-tight">
            Become an Organisation Admin
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
            Register your institution, DAO, or university on the VoxChain registry. Upon approval by the platform Super Admin, an isolated smart contract will be deployed with your wallet as the designated administrator.
          </p>
        </div>
      </div>

      {/* ── Transaction Feedback Banners ── */}
      {isTxProcessing && (
        <div className="p-4 bg-[#141422] border border-[#818CF8]/40 rounded-xl flex items-center justify-between gap-4 text-xs font-mono animate-pulse">
          <div className="flex items-center gap-2.5 text-[#A5B4FC]">
            <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
            <span>
              {isWritePending
                ? 'Awaiting wallet signature confirmation...'
                : 'Broadcasting registration request to blockchain...'}
            </span>
          </div>
          {txHash && txExplorerUrl && (
            <a
              href={txExplorerUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[#818CF8] hover:underline"
            >
              <span>View Tx</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {isConfirmed && (
        <div className="p-5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-start justify-between gap-4 text-xs font-mono text-emerald-300">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white text-sm block mb-1">Registration Request Confirmed!</strong>
              <p className="text-emerald-300/90 leading-relaxed">
                Your organisation proposal has been immutably recorded on-chain. It is now awaiting review and cryptographic authorization by the platform Super Admin.
              </p>
            </div>
          </div>
          <VoxButton variant="ghost" size="sm" onClick={() => resetWrite()}>
            Dismiss
          </VoxButton>
        </div>
      )}

      {parsedWriteError && (
        <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-xl flex items-start justify-between gap-4 text-xs font-mono text-rose-300">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Submission Failed:</span>
              <span>{parsedWriteError}</span>
            </div>
          </div>
          <VoxButton variant="ghost" size="sm" onClick={() => resetWrite()}>
            Dismiss
          </VoxButton>
        </div>
      )}

      {/* ── Status View for Connected Users with Existing Applications ── */}
      {isConnected && userPendingOrg && (
        <VoxCard variant="layer-1" padding="lg" className="border-amber-500/30 bg-[#0C0C14]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-display font-medium text-white">{userPendingOrg.name}</h2>
                  <VoxBadge variant="warning" size="sm">Pending Super Admin Review</VoxBadge>
                </div>
                <span className="text-[11px] font-mono text-zinc-400">Request #{userPendingOrg.id.toString()}</span>
              </div>
            </div>
            <div className="flex flex-col sm:items-end">
              <span className="text-[10px] text-zinc-500 font-mono uppercase mb-1">Status</span>
              <span className="text-xs text-amber-300 font-medium">Under Review</span>
            </div>
          </div>

          <div className="py-4 text-xs font-mono text-zinc-300 leading-relaxed">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Proposal Description:</span>
            <p className="bg-[#12121A] p-3 rounded-lg border border-white/05 text-zinc-300 font-sans text-sm">
              {userPendingOrg.description}
            </p>
          </div>

          <div className="p-3 bg-amber-500/05 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-xs text-amber-200/90 font-mono">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Your onboarding request is currently in the review pipeline. Once approved, your dedicated election workspace will be activated.
            </span>
          </div>
        </VoxCard>
      )}

      {isConnected && userApprovedOrg && (
        <VoxCard variant="layer-1" padding="lg" className="border-emerald-500/30 bg-[#0C0C14]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-display font-medium text-white">{userApprovedOrg.name}</h2>
                  <VoxBadge variant="success" size="sm">Approved & Active</VoxBadge>
                </div>
                <span className="text-[11px] font-mono text-zinc-400">Organisation #{userApprovedOrg.id.toString()}</span>
              </div>
            </div>
            <Link to="/admin">
              <VoxButton variant="primary" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                Go to Org Admin Dashboard
              </VoxButton>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 text-xs">
            <div className="p-3 bg-[#12121A] rounded-xl border border-white/05">
              <span className="text-[10px] text-zinc-500 uppercase block mb-1">Admin Status:</span>
              <span className="text-white font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Verified & Assigned
              </span>
            </div>
            <div className="p-3 bg-[#12121A] rounded-xl border border-white/05">
              <span className="text-[10px] text-zinc-500 uppercase block mb-1">Election Workspace:</span>
              <div className="flex items-center justify-between">
                <span className="text-white font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Deployed & Active
                </span>
                {(() => {
                  const url = getExplorerAddressUrl(userApprovedOrg.contractAddress, registryChainId);
                  return url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-400 hover:text-white underline text-[11px] inline-flex items-center gap-1"
                    >
                      <span>Explorer</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : null;
                })()}
              </div>
            </div>
          </div>
        </VoxCard>
      )}

      {isConnected && userRejectedOrg && !userPendingOrg && (
        <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-xl flex items-start gap-3 text-xs font-mono text-rose-300">
          <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block mb-0.5">Previous Request #{userRejectedOrg.id.toString()} Not Approved</strong>
            <span>
              A prior submission for "{userRejectedOrg.name}" was declined during Super Admin review. You may review your requirements and submit an updated application below.
            </span>
          </div>
        </div>
      )}

      {/* ── Request Form Section ── */}
      {(!isConnected || (!userPendingOrg && !userApprovedOrg)) && (
        <VoxCard variant="layer-1" padding="lg" className="border-white/10 bg-[#0C0C12]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-display font-medium text-white mb-1">
                Organisation Registration Form
              </h2>
              <p className="text-xs text-zinc-400">
                Please complete the required details. All submissions are immutably signed by your connected address.
              </p>
            </div>

            {/* Read-Only Connected Requester Wallet */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-[#818CF8]" />
                <span>Applicant Wallet Address (Read-Only)</span>
              </label>
              {isConnected && address ? (
                <div className="flex items-center justify-between p-3 bg-[#12121A] border border-white/10 rounded-xl font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    <VoxHashPill hash={address} type="address" truncate={true} />
                  </div>
                  <span className="text-[10px] text-zinc-500 hidden sm:inline-block">Connected Signer</span>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3.5 bg-[#12121A] border border-dashed border-white/20 rounded-xl text-xs font-mono text-zinc-400">
                  <span>No wallet connected. Connect your wallet to register.</span>
                  <VoxButton
                    variant="outline"
                    size="sm"
                    type="button"
                    icon={<Wallet className="w-3.5 h-3.5" />}
                    onClick={() => setIsWalletModalOpen(true)}
                  >
                    Connect Wallet
                  </VoxButton>
                </div>
              )}
              <span className="text-[10px] text-zinc-500 font-mono mt-1.5 block">
                Derived directly from your connected Web3 provider. This address will be submitted as the applicant and candidate administrator.
              </span>
            </div>

            {/* Organisation Name Input */}
            <div>
              <label htmlFor="orgNameInput" className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5">
                Organisation Name *
              </label>
              <input
                id="orgNameInput"
                type="text"
                value={orgName}
                onChange={(e) => {
                  setOrgName(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="e.g. Apex Governance DAO, Stanford Student Body, Meridian Foundation"
                disabled={isTxProcessing}
                className="w-full bg-[#12121A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#818CF8] focus:ring-1 focus:ring-[#818CF8]/30 transition-all disabled:opacity-50"
              />
            </div>

            {/* Organisation Description Textarea */}
            <div>
              <label htmlFor="orgDescInput" className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5">
                Organisation Description *
              </label>
              <textarea
                id="orgDescInput"
                value={orgDesc}
                onChange={(e) => {
                  setOrgDesc(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                rows={4}
                placeholder="Describe your governance scope, intended elections, voter eligibility criteria, and administrative contact."
                disabled={isTxProcessing}
                className="w-full bg-[#12121A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#818CF8] focus:ring-1 focus:ring-[#818CF8]/30 transition-all disabled:opacity-50"
              />
            </div>

            {/* Governance Isolation Notice */}
            <div className="p-4 bg-[#101018] border border-white/10 rounded-xl flex items-start gap-3 text-xs font-mono text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-[#818CF8] shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="text-white font-medium block mb-0.5">Strict Access-Control Architecture</span>
                <span>
                  Submitting a request registers your proposal in the platform registry. It does not grant instant administrative rights. The platform Super Admin verifies each proposal and, upon approval, assigns an isolated child contract ensuring zero cross-organisation interference.
                </span>
              </div>
            </div>

            {/* Network / Registry Status Callout */}
            {isConnected && (isWrongNetwork || !isRegistryAvailable) && (
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-amber-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    {isWrongNetwork
                      ? `Connected to unsupported network #${accountChainId}. Please switch to Ethereum Sepolia (11155111) or Hardhat Local (31337).`
                      : 'The VoxChain Registry contract is unconfigured on the active network.'}
                  </span>
                </div>
                {isWrongNetwork && (
                  <VoxButton
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => switchChain?.({ chainId: sepolia.id })}
                    isLoading={isSwitchingChain}
                  >
                    Switch to Sepolia (11155111)
                  </VoxButton>
                )}
              </div>
            )}

            {validationError && (
              <p className="text-xs text-rose-400 font-mono flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {validationError}
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
              <Link to="/dashboard" className="text-xs font-mono text-zinc-500 hover:text-white transition-colors">
                ← Return to Elections Dashboard
              </Link>

              {isConnected ? (
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <VoxButton
                    variant="primary"
                    size="md"
                    type="submit"
                    isLoading={isTxProcessing}
                    disabled={isTxProcessing}
                    icon={<Building2 className="w-4 h-4" />}
                  >
                    {isTxProcessing ? 'Submitting to Blockchain...' : 'Submit Onboarding Request'}
                  </VoxButton>
                </div>
              ) : (
                <VoxButton
                  variant="primary"
                  size="md"
                  type="button"
                  icon={<Wallet className="w-4 h-4" />}
                  onClick={() => setIsWalletModalOpen(true)}
                >
                  Connect Wallet to Submit
                </VoxButton>
              )}
            </div>
          </form>
        </VoxCard>
      )}

      {/* Connect Wallet Modal */}
      <ConnectWalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </div>
  );
};
