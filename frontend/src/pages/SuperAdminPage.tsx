import React, { useState } from 'react';
import { isAddress } from 'viem';
import { useAccount, useChainId } from 'wagmi';
import { useVoxChainRegistry } from '../hooks/useVoxChainRegistry';
import { SuperAdminGuard } from '../components/admin/SuperAdminGuard';
import { VoxCard } from '../components/common/VoxCard';
import { VoxBadge } from '../components/common/VoxBadge';
import { VoxButton } from '../components/common/VoxButton';
import { VoxHashPill } from '../components/common/VoxHashPill';
import { VoxModal } from '../components/common/VoxModal';
import { getExplorerTxUrl, getExplorerAddressUrl } from '../contracts/config';
import {
  ShieldCheck,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  UserX,
  ExternalLink,
  PlusCircle,
  ArrowRightLeft,
  RefreshCw,
  FileText,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { Organisation } from '../types/registry';

export const SuperAdminPage: React.FC = () => {
  const chainId = useChainId();
  const { address } = useAccount();
  const {
    registryAddress,
    isRegistryConfigured,
    superAdminAddress,
    pendingSuperAdminAddress,
    totalOrgCount,
    pendingOrganisations,
    approvedOrganisations,
    rejectedOrganisations,
    revokedOrganisations,
    isPendingSuperAdmin,
    isLoading,
    refetchAll,
    // Mutations
    requestRegistration,
    approveOrganisation,
    rejectOrganisation,
    replaceOrgAdmin,
    revokeOrgAdmin,
    transferSuperAdmin,
    acceptSuperAdmin,
    cancelSuperAdminTransfer,
    // Tx Status
    txHash,
    isWritePending,
    isConfirming,
    isConfirmed,
    parsedWriteError,
    resetWrite,
  } = useVoxChainRegistry();

  // Modals state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organisation | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'replace' | 'revoke' | null>(null);

  // Form states
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDesc, setNewOrgDesc] = useState('');

  const [targetAdminAddress, setTargetAdminAddress] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [newSuperAdminInput, setNewSuperAdminInput] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const resetModals = () => {
    setSelectedOrg(null);
    setActionType(null);
    setShowRegisterModal(false);
    setShowTransferModal(false);
    setValidationError(null);
    setTargetAdminAddress('');
    setRejectionReason('');
    setNewSuperAdminInput('');
    setNewOrgName('');
    setNewOrgDesc('');
  };

  const openApproveModal = (org: Organisation) => {
    setSelectedOrg(org);
    setActionType('approve');
    setTargetAdminAddress(org.requester);
    setValidationError(null);
  };

  const openRejectModal = (org: Organisation) => {
    setSelectedOrg(org);
    setActionType('reject');
    setRejectionReason('');
    setValidationError(null);
  };

  const openReplaceModal = (org: Organisation) => {
    setSelectedOrg(org);
    setActionType('replace');
    setTargetAdminAddress('');
    setValidationError(null);
  };

  const openRevokeModal = (org: Organisation) => {
    setSelectedOrg(org);
    setActionType('revoke');
    setValidationError(null);
  };

  // Handlers
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) {
      setValidationError('Organisation name is required.');
      return;
    }
    if (!newOrgDesc.trim()) {
      setValidationError('Organisation description is required.');
      return;
    }

    try {
      setValidationError(null);
      await requestRegistration(newOrgName.trim(), newOrgDesc.trim());
      resetModals();
    } catch {
      // error handled by hook
    }
  };

  const handleApprove = async () => {
    if (!selectedOrg) return;
    if (!isAddress(targetAdminAddress)) {
      setValidationError('Please enter a valid Ethereum address.');
      return;
    }
    try {
      setValidationError(null);
      await approveOrganisation(selectedOrg.id, targetAdminAddress as `0x${string}`);
      resetModals();
    } catch {
      // error handled by hook
    }
  };

  const handleReject = async () => {
    if (!selectedOrg) return;
    if (!rejectionReason.trim()) {
      setValidationError('A rejection reason is required.');
      return;
    }
    try {
      setValidationError(null);
      await rejectOrganisation(selectedOrg.id, rejectionReason.trim());
      resetModals();
    } catch {
      // error handled by hook
    }
  };

  const handleReplaceAdmin = async () => {
    if (!selectedOrg) return;
    if (!isAddress(targetAdminAddress)) {
      setValidationError('Please enter a valid Ethereum address.');
      return;
    }
    if (selectedOrg.admin && targetAdminAddress.toLowerCase() === selectedOrg.admin.toLowerCase()) {
      setValidationError('New administrator cannot be identical to current administrator.');
      return;
    }
    try {
      setValidationError(null);
      await replaceOrgAdmin(selectedOrg.id, targetAdminAddress as `0x${string}`);
      resetModals();
    } catch {
      // error handled by hook
    }
  };

  const handleRevokeAdmin = async () => {
    if (!selectedOrg) return;
    try {
      setValidationError(null);
      await revokeOrgAdmin(selectedOrg.id);
      resetModals();
    } catch {
      // error handled by hook
    }
  };

  const handleTransferSuperAdmin = async () => {
    if (!isAddress(newSuperAdminInput)) {
      setValidationError('Please enter a valid Ethereum address.');
      return;
    }
    if (superAdminAddress && newSuperAdminInput.toLowerCase() === superAdminAddress.toLowerCase()) {
      setValidationError('Cannot transfer to current Super Admin address.');
      return;
    }
    try {
      setValidationError(null);
      await transferSuperAdmin(newSuperAdminInput as `0x${string}`);
      resetModals();
    } catch {
      // error handled by hook
    }
  };

  const isTxProcessing = isWritePending || isConfirming;
  const txExplorerUrl = getExplorerTxUrl(txHash, chainId);

  return (
    <SuperAdminGuard>
      <div className="flex flex-col gap-8 py-6 max-w-6xl mx-auto">
        {/* Header telemetry */}
        <div className="p-6 bg-[#0D0D14] border border-white/10 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-[0_16px_40px_rgba(0,0,0,0.8)]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-[#818CF8]" />
              <span className="font-mono text-[10px] font-semibold text-[#818CF8] uppercase tracking-widest">
                Platform Super Admin
              </span>
              <VoxBadge variant="gold" size="sm">
                Registry Controller
              </VoxBadge>
            </div>
            <h1 className="font-display font-medium text-2xl sm:text-3xl text-white tracking-tight">
              Multi-Organisation Governance
            </h1>
            <p className="text-xs font-mono text-zinc-400 mt-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              <span>Platform Registry Online</span>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-500">Ethereum Sepolia Network</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <VoxButton
              variant="primary"
              size="md"
              icon={<PlusCircle className="w-4 h-4" />}
              onClick={() => setShowRegisterModal(true)}
              disabled={!isRegistryConfigured}
            >
              Submit Org Request
            </VoxButton>
          </div>
        </div>

        {/* Unconfigured Registry Warning */}
        {!isRegistryConfigured && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-3 text-xs text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <strong className="text-white block mb-0.5">Registry Contract Unconfigured on this Network</strong>
              <span>
                Actions are disabled because no registry address was detected. Deploy the contract or configure{' '}
                <code className="font-mono text-amber-300">VITE_VOXCHAIN_REGISTRY_ADDRESS</code>.
              </span>
            </div>
          </div>
        )}

        {/* Transaction Feedback Banner */}
        {isTxProcessing && (
          <div className="p-4 bg-[#141422] border border-[#818CF8]/40 rounded-xl flex items-center justify-between gap-4 text-xs font-mono animate-pulse">
            <div className="flex items-center gap-2.5 text-[#A5B4FC]">
              <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
              <span>
                {isWritePending ? 'Awaiting wallet confirmation...' : 'Confirming on EVM blockchain...'}
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
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between gap-4 text-xs font-mono text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Transaction confirmed successfully on-chain.</span>
            </div>
            <VoxButton variant="ghost" size="sm" onClick={() => { resetWrite(); refetchAll(); }}>
              Dismiss
            </VoxButton>
          </div>
        )}

        {parsedWriteError && (
          <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-xl flex items-start justify-between gap-4 text-xs font-mono text-rose-300">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Execution Reverted:</span>
                <span>{parsedWriteError}</span>
              </div>
            </div>
            <VoxButton variant="ghost" size="sm" onClick={() => resetWrite()}>
              Dismiss
            </VoxButton>
          </div>
        )}

        {/* Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <VoxCard variant="layer-1" padding="md" className="border-white/10 bg-[#0C0C12]">
            <div className="flex items-center justify-between text-zinc-500 text-[10px] font-mono uppercase tracking-wider mb-2">
              <span>Total Orgs</span>
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div className="text-2xl font-display font-bold text-white">{totalOrgCount}</div>
          </VoxCard>

          <VoxCard variant="layer-1" padding="md" className="border-amber-500/20 bg-[#0C0C12]">
            <div className="flex items-center justify-between text-amber-400 text-[10px] font-mono uppercase tracking-wider mb-2">
              <span>Pending Requests</span>
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="text-2xl font-display font-bold text-amber-300">{pendingOrganisations.length}</div>
          </VoxCard>

          <VoxCard variant="layer-1" padding="md" className="border-emerald-500/20 bg-[#0C0C12]">
            <div className="flex items-center justify-between text-emerald-400 text-[10px] font-mono uppercase tracking-wider mb-2">
              <span>Approved Orgs</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="text-2xl font-display font-bold text-emerald-300">{approvedOrganisations.length}</div>
          </VoxCard>

          <VoxCard variant="layer-1" padding="md" className="border-rose-500/20 bg-[#0C0C12]">
            <div className="flex items-center justify-between text-rose-400 text-[10px] font-mono uppercase tracking-wider mb-2">
              <span>Revoked / Frozen</span>
              <XCircle className="w-3.5 h-3.5" />
            </div>
            <div className="text-2xl font-display font-bold text-rose-300">{revokedOrganisations.length}</div>
          </VoxCard>
        </div>

        {/* Super Admin Ownership & Transfer Panel */}
        <VoxCard variant="layer-1" padding="lg" className="border-white/10 bg-[#0C0C12]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <KeyRound className="w-4 h-4 text-[#818CF8]" />
                <h2 className="font-display font-medium text-lg text-white">Super Admin Ownership</h2>
              </div>
              <p className="text-xs text-zinc-400">
                Managed via cryptographic two-step ownership protocol to eliminate unauthorized or accidental transfer.
              </p>
            </div>
            <VoxButton
              variant="outline"
              size="sm"
              icon={<ArrowRightLeft className="w-3.5 h-3.5" />}
              onClick={() => setShowTransferModal(true)}
            >
              Transfer Ownership
            </VoxButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-[#12121A] rounded-xl border border-white/05 text-xs font-mono">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">
                Active Super Admin:
              </span>
              <VoxHashPill hash={superAdminAddress || ''} type="address" truncate={true} />
            </div>

            <div className="p-3 bg-[#12121A] rounded-xl border border-white/05 text-xs font-mono">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                  Pending Super Admin:
                </span>
                {pendingSuperAdminAddress && pendingSuperAdminAddress !== '0x0000000000000000000000000000000000000000' && (
                  <VoxBadge variant="warning" size="sm">Pending Acceptance</VoxBadge>
                )}
              </div>
              {pendingSuperAdminAddress && pendingSuperAdminAddress !== '0x0000000000000000000000000000000000000000' ? (
                <div className="flex items-center justify-between gap-2">
                  <VoxHashPill hash={pendingSuperAdminAddress} type="address" />
                  <div className="flex items-center gap-1.5">
                    {isPendingSuperAdmin ? (
                      <VoxButton variant="success" size="sm" onClick={() => acceptSuperAdmin()}>
                        Accept Role
                      </VoxButton>
                    ) : (
                      <VoxButton variant="danger" size="sm" onClick={() => cancelSuperAdminTransfer()}>
                        Cancel Transfer
                      </VoxButton>
                    )}
                  </div>
                </div>
              ) : (
                <span className="text-zinc-600 text-xs">No transfer pending</span>
              )}
            </div>
          </div>
        </VoxCard>

        {/* Pending Requests Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-medium text-xl text-white flex items-center gap-2">
              <span>Registration Requests</span>
              <VoxBadge variant="warning" size="sm">{pendingOrganisations.length} Pending</VoxBadge>
            </h2>
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">Review Pipeline</span>
          </div>

          {pendingOrganisations.length === 0 ? (
            <VoxCard variant="layer-1" padding="lg" className="text-center py-12 border-white/10 bg-[#0C0C12]">
              <p className="text-xs text-zinc-500">No pending organisation registration requests awaiting review.</p>
            </VoxCard>
          ) : (
            <div className="overflow-x-auto bg-[#0C0C12] border border-white/10 rounded-2xl shadow-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-[#12121A] text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                    <th className="p-4">ID</th>
                    <th className="p-4">Organisation Name</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Requester</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/05 font-mono text-xs">
                  {pendingOrganisations.map((org) => (
                    <tr key={org.id.toString()} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-bold text-zinc-400">#{org.id.toString()}</td>
                      <td className="p-4 font-display font-medium text-white">{org.name}</td>
                      <td className="p-4 text-zinc-400 max-w-xs truncate" title={org.description}>{org.description}</td>
                      <td className="p-4"><VoxHashPill hash={org.requester} type="address" /></td>
                      <td className="p-4">
                        <VoxBadge variant="warning" dot={true}>Pending Review</VoxBadge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <VoxButton
                            variant="success"
                            size="sm"
                            icon={<UserCheck className="w-3.5 h-3.5" />}
                            onClick={() => openApproveModal(org)}
                          >
                            Approve
                          </VoxButton>
                          <VoxButton
                            variant="danger"
                            size="sm"
                            icon={<UserX className="w-3.5 h-3.5" />}
                            onClick={() => openRejectModal(org)}
                          >
                            Reject
                          </VoxButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Approved Organisations Directory */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-medium text-xl text-white flex items-center gap-2">
              <span>Approved Organisations</span>
              <VoxBadge variant="success" size="sm">{approvedOrganisations.length} Active</VoxBadge>
            </h2>
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">On-Chain Deployments</span>
          </div>

          {approvedOrganisations.length === 0 ? (
            <VoxCard variant="layer-1" padding="lg" className="text-center py-12 border-white/10 bg-[#0C0C12]">
              <p className="text-xs text-zinc-500">No organisations have been approved yet.</p>
            </VoxCard>
          ) : (
            <div className="overflow-x-auto bg-[#0C0C12] border border-white/10 rounded-2xl shadow-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-[#12121A] text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                    <th className="p-4">ID</th>
                    <th className="p-4">Organisation</th>
                    <th className="p-4">Assigned Admin</th>
                    <th className="p-4">Election Contract</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Administrative Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/05 font-mono text-xs">
                  {approvedOrganisations.map((org) => {
                    const explorerUrl = getExplorerAddressUrl(org.contractAddress, chainId);
                    return (
                      <tr key={org.id.toString()} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 font-bold text-zinc-400">#{org.id.toString()}</td>
                        <td className="p-4">
                          <div className="font-display font-medium text-white">{org.name}</div>
                          <div className="text-[10px] text-zinc-500 truncate max-w-xs">{org.description}</div>
                        </td>
                        <td className="p-4">
                          <VoxHashPill hash={org.admin} type="address" />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <VoxHashPill hash={org.contractAddress} type="address" />
                            {explorerUrl && (
                              <a href={explorerUrl} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <VoxBadge variant="success" dot={true}>Active</VoxBadge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <VoxButton
                              variant="outline"
                              size="sm"
                              icon={<ArrowRightLeft className="w-3 h-3" />}
                              onClick={() => openReplaceModal(org)}
                            >
                              Replace Admin
                            </VoxButton>
                            <VoxButton
                              variant="danger"
                              size="sm"
                              icon={<UserX className="w-3 h-3" />}
                              onClick={() => openRevokeModal(org)}
                            >
                              Revoke
                            </VoxButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Revoked Organisations (if any) */}
        {revokedOrganisations.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-medium text-xl text-rose-300 flex items-center gap-2">
                <span>Revoked / Frozen Organisations</span>
                <VoxBadge variant="danger" size="sm">{revokedOrganisations.length}</VoxBadge>
              </h2>
              <span className="font-mono text-[10px] text-rose-400 uppercase tracking-wider">Admin Action Required</span>
            </div>

            <div className="overflow-x-auto bg-[#0C0C12] border border-rose-500/20 rounded-2xl shadow-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-[#1A1215] text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                    <th className="p-4">ID</th>
                    <th className="p-4">Organisation</th>
                    <th className="p-4">Contract Address</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Restoration Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/05 font-mono text-xs">
                  {revokedOrganisations.map((org) => (
                    <tr key={org.id.toString()} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-bold text-zinc-400">#{org.id.toString()}</td>
                      <td className="p-4">
                        <div className="font-display font-medium text-white">{org.name}</div>
                        <div className="text-[10px] text-zinc-500">{org.description}</div>
                      </td>
                      <td className="p-4">
                        <VoxHashPill hash={org.contractAddress} type="address" />
                      </td>
                      <td className="p-4">
                        <VoxBadge variant="danger">Revoked</VoxBadge>
                      </td>
                      <td className="p-4">
                        <VoxButton
                          variant="primary"
                          size="sm"
                          icon={<UserCheck className="w-3 h-3" />}
                          onClick={() => openReplaceModal(org)}
                        >
                          Assign Replacement Admin
                        </VoxButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Declined Requests History (if any) */}
        {rejectedOrganisations.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-medium text-xl text-zinc-300 flex items-center gap-2">
                <span>Declined Requests</span>
                <VoxBadge variant="danger" size="sm">{rejectedOrganisations.length}</VoxBadge>
              </h2>
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">Historical Audit</span>
            </div>

            <div className="overflow-x-auto bg-[#0C0C12] border border-white/10 rounded-2xl shadow-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-[#12121A] text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                    <th className="p-4">ID</th>
                    <th className="p-4">Organisation</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Requester</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/05 font-mono text-xs">
                  {rejectedOrganisations.map((org) => (
                    <tr key={org.id.toString()} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-bold text-zinc-400">#{org.id.toString()}</td>
                      <td className="p-4 font-display font-medium text-zinc-300">{org.name}</td>
                      <td className="p-4 text-zinc-400 max-w-xs truncate" title={org.description}>{org.description}</td>
                      <td className="p-4"><VoxHashPill hash={org.requester} type="address" /></td>
                      <td className="p-4"><VoxBadge variant="danger" dot={true}>Declined</VoxBadge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Register Request */}
        <VoxModal
          isOpen={showRegisterModal}
          onClose={resetModals}
          title="Register New Organisation"
          subtitle="Submit an onboarding request to the VoxChain platform registry."
          maxWidth="md"
        >
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                Organisation Name *
              </label>
              <input
                type="text"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="e.g. Apex Governance DAO"
                className="w-full bg-[#12121A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#818CF8]"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                Description *
              </label>
              <textarea
                value={newOrgDesc}
                onChange={(e) => setNewOrgDesc(e.target.value)}
                rows={3}
                placeholder="e.g. Shareholder corporate governance and board resolutions"
                className="w-full bg-[#12121A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#818CF8]"
              />
            </div>

            {validationError && (
              <p className="text-xs text-rose-400 font-mono flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {validationError}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <VoxButton variant="ghost" size="sm" type="button" onClick={resetModals}>
                Cancel
              </VoxButton>
              <VoxButton variant="primary" size="sm" type="submit" isLoading={isTxProcessing}>
                Submit Request
              </VoxButton>
            </div>
          </form>
        </VoxModal>

        {/* Modal: Approve Organisation */}
        <VoxModal
          isOpen={actionType === 'approve' && Boolean(selectedOrg)}
          onClose={resetModals}
          title={`Approve Organisation #${selectedOrg?.id.toString()}`}
          subtitle={`Assign an administrator wallet and deploy an isolated election contract for "${selectedOrg?.name}".`}
          maxWidth="md"
        >
          <div className="flex flex-col gap-4">
            <div className="p-3 bg-[#12121A] rounded-lg border border-white/05 text-xs font-mono">
              <span className="text-[10px] text-zinc-500 uppercase block mb-1">Requester:</span>
              <VoxHashPill hash={selectedOrg?.requester || ''} type="address" />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                Designated Administrator Wallet Address *
              </label>
              <input
                type="text"
                value={targetAdminAddress}
                onChange={(e) => setTargetAdminAddress(e.target.value)}
                placeholder="0x..."
                className="w-full bg-[#12121A] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#818CF8]"
              />
              <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                Pre-filled with applicant address. You can designate any authorized administrator key.
              </span>
            </div>

            {validationError && (
              <p className="text-xs text-rose-400 font-mono flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {validationError}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <VoxButton variant="ghost" size="sm" onClick={resetModals}>
                Cancel
              </VoxButton>
              <VoxButton variant="success" size="sm" onClick={handleApprove} isLoading={isTxProcessing}>
                Confirm & Deploy Contract
              </VoxButton>
            </div>
          </div>
        </VoxModal>

        {/* Modal: Reject Organisation */}
        <VoxModal
          isOpen={actionType === 'reject' && Boolean(selectedOrg)}
          onClose={resetModals}
          title={`Reject Organisation #${selectedOrg?.id.toString()}`}
          subtitle={`Mark the registration request for "${selectedOrg?.name}" as rejected.`}
          maxWidth="md"
        >
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="e.g. Failed institutional compliance standards or missing verification proofs"
                className="w-full bg-[#12121A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            {validationError && (
              <p className="text-xs text-rose-400 font-mono flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {validationError}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <VoxButton variant="ghost" size="sm" onClick={resetModals}>
                Cancel
              </VoxButton>
              <VoxButton variant="danger" size="sm" onClick={handleReject} isLoading={isTxProcessing}>
                Confirm Rejection
              </VoxButton>
            </div>
          </div>
        </VoxModal>

        {/* Modal: Replace Admin */}
        <VoxModal
          isOpen={actionType === 'replace' && Boolean(selectedOrg)}
          onClose={resetModals}
          title={`Replace Administrator for "${selectedOrg?.name}"`}
          subtitle="Replaces the organisation administrator key in both the registry and child election contract."
          maxWidth="md"
        >
          <div className="flex flex-col gap-4">
            {selectedOrg?.admin && selectedOrg.admin !== '0x0000000000000000000000000000000000000000' && (
              <div className="p-3 bg-[#12121A] rounded-lg border border-white/05 text-xs font-mono">
                <span className="text-[10px] text-zinc-500 uppercase block mb-1">Current Administrator:</span>
                <VoxHashPill hash={selectedOrg.admin} type="address" />
              </div>
            )}

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                New Administrator Wallet Address *
              </label>
              <input
                type="text"
                value={targetAdminAddress}
                onChange={(e) => setTargetAdminAddress(e.target.value)}
                placeholder="0x..."
                className="w-full bg-[#12121A] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#818CF8]"
              />
            </div>

            {validationError && (
              <p className="text-xs text-rose-400 font-mono flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {validationError}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <VoxButton variant="ghost" size="sm" onClick={resetModals}>
                Cancel
              </VoxButton>
              <VoxButton variant="primary" size="sm" onClick={handleReplaceAdmin} isLoading={isTxProcessing}>
                Confirm Replacement
              </VoxButton>
            </div>
          </div>
        </VoxModal>

        {/* Modal: Revoke Admin */}
        <VoxModal
          isOpen={actionType === 'revoke' && Boolean(selectedOrg)}
          onClose={resetModals}
          title={`Revoke Administrator for "${selectedOrg?.name}"`}
          subtitle="Freezes all administrative capabilities in the child contract."
          maxWidth="md"
        >
          <div className="flex flex-col gap-4">
            <div className="p-3.5 bg-rose-950/20 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-mono flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-1">Impact Warning:</span>
                <span>
                  Revoking this administrator will freeze candidate creation, voter allowlisting, and election start/end
                  operations. Ongoing voter casting in active elections will continue uninterrupted.
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#12121A] rounded-lg border border-white/05 text-xs font-mono">
              <span className="text-[10px] text-zinc-500 uppercase block mb-1">Administrator to Revoke:</span>
              <VoxHashPill hash={selectedOrg?.admin || ''} type="address" />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <VoxButton variant="ghost" size="sm" onClick={resetModals}>
                Cancel
              </VoxButton>
              <VoxButton variant="danger" size="sm" onClick={handleRevokeAdmin} isLoading={isTxProcessing}>
                Confirm Revocation
              </VoxButton>
            </div>
          </div>
        </VoxModal>

        {/* Modal: Transfer Super Admin */}
        <VoxModal
          isOpen={showTransferModal}
          onClose={resetModals}
          title="Initiate Super Admin Transfer"
          subtitle="Nominate a new Super Admin. Ownership is not transferred until the nominee calls acceptSuperAdmin."
          maxWidth="md"
        >
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                New Super Admin Wallet Address *
              </label>
              <input
                type="text"
                value={newSuperAdminInput}
                onChange={(e) => setNewSuperAdminInput(e.target.value)}
                placeholder="0x..."
                className="w-full bg-[#12121A] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#818CF8]"
              />
            </div>

            {validationError && (
              <p className="text-xs text-rose-400 font-mono flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {validationError}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <VoxButton variant="ghost" size="sm" onClick={resetModals}>
                Cancel
              </VoxButton>
              <VoxButton variant="primary" size="sm" onClick={handleTransferSuperAdmin} isLoading={isTxProcessing}>
                Initiate Transfer
              </VoxButton>
            </div>
          </div>
        </VoxModal>
      </div>
    </SuperAdminGuard>
  );
};
