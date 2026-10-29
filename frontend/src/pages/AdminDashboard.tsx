import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useChainId, useAccount } from 'wagmi';
import { useVoxChain } from '../hooks/useVoxChain';
import { useElection } from '../hooks/useElection';
import { useVoxChainRegistry } from '../hooks/useVoxChainRegistry';
import { AdminGuard } from '../components/admin/AdminGuard';
import { VoxCard } from '../components/common/VoxCard';
import { VoxBadge } from '../components/common/VoxBadge';
import { VoxButton } from '../components/common/VoxButton';
import { getExplorerAddressUrl, getContractAddress } from '../contracts/config';
import {
  PlusCircle,
  ShieldCheck,
  Users,
  UserPlus,
  Trophy,
  Settings,
  Building2,
  ChevronDown,
  ExternalLink,
  Layers,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';
import { Organisation } from '../types/registry';

const AdminElectionRow: React.FC<{ electionId: number; contractAddress?: `0x${string}` }> = ({
  electionId,
  contractAddress,
}) => {
  const { election, candidates, isLoading } = useElection(electionId, contractAddress);

  if (isLoading || !election) {
    return (
      <tr className="border-b border-white/[0.06] animate-pulse">
        <td className="p-4"><div className="h-3 bg-[#202020] rounded w-8" /></td>
        <td className="p-4"><div className="h-3 bg-[#202020] rounded w-48" /></td>
        <td className="p-4"><div className="h-3 bg-[#202020] rounded w-20" /></td>
        <td className="p-4"><div className="h-3 bg-[#202020] rounded w-20" /></td>
        <td className="p-4"><div className="h-7 bg-[#202020] rounded w-32" /></td>
      </tr>
    );
  }

  const isStarted = election.started && !election.ended;
  const isEnded = election.ended;
  const isPending = !election.started && !election.ended;
  const contractQuery = contractAddress ? `?contract=${contractAddress}` : '';

  return (
    <tr className="border-b border-white/[0.06] hover:bg-[#171717] transition-colors">
      <td className="p-4 font-mono font-bold text-[11px] text-[#D8D8D8]">
        #{electionId.toString().padStart(2, '0')}
      </td>
      <td className="p-4 font-display font-medium text-sm text-[#F5F5F5]">{election.name}</td>
      <td className="p-4 font-mono text-[11px] text-[#A3A3A3]">{candidates.length} Candidates</td>
      <td className="p-4">
        {isStarted && <VoxBadge variant="success" dot={true}>Active</VoxBadge>}
        {isEnded && <VoxBadge variant="neutral">Ended</VoxBadge>}
        {isPending && <VoxBadge variant="neutral">Draft</VoxBadge>}
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          {isPending && (
            <>
              <Link to={`/admin/election/${electionId}/candidates${contractQuery}`}>
                <VoxButton variant="outline" size="sm" icon={<Users className="w-3.5 h-3.5" />}>
                  Candidates
                </VoxButton>
              </Link>
              <Link to={`/admin/election/${electionId}/voters${contractQuery}`}>
                <VoxButton variant="outline" size="sm" icon={<UserPlus className="w-3.5 h-3.5" />}>
                  Voters
                </VoxButton>
              </Link>
            </>
          )}
          <Link to={`/admin/election/${electionId}/control${contractQuery}`}>
            <VoxButton variant="primary" size="sm" icon={<Settings className="w-3.5 h-3.5" />}>
              Manage Election
            </VoxButton>
          </Link>
          {isEnded && (
            <Link to={`/election/${electionId}/results${contractQuery}`}>
              <VoxButton variant="outline" size="sm" icon={<Trophy className="w-3.5 h-3.5" />}>
                Results
              </VoxButton>
            </Link>
          )}
        </div>
      </td>
    </tr>
  );
};

export const AdminDashboard: React.FC = () => {
  const chainId = useChainId();
  const { address: userAddress } = useAccount();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryContract = (searchParams.get('contract') as `0x${string}`) || undefined;

  const defaultContract = getContractAddress(chainId);

  const {
    adminOrganisations,
    approvedOrganisations,
    isSuperAdmin,
    isOrgAdmin,
  } = useVoxChainRegistry();

  // Determine available organisations for this user
  const selectableOrgs = isSuperAdmin ? approvedOrganisations : adminOrganisations;

  // Selected organisation: 'platform' or org id string
  const [selectedOrgId, setSelectedOrgId] = useState<string>('platform');

  useEffect(() => {
    if (queryContract) {
      if (defaultContract && queryContract.toLowerCase() === defaultContract.toLowerCase()) {
        setSelectedOrgId('platform');
        return;
      }
      const matching = selectableOrgs.find(
        (o) => o.contractAddress.toLowerCase() === queryContract.toLowerCase()
      );
      if (matching) {
        setSelectedOrgId(matching.id.toString());
        return;
      }
    } else {
      // If no query contract is in the URL, default to platform if available and user is superAdmin or admin
      if (defaultContract && isSuperAdmin) {
        setSelectedOrgId('platform');
      } else if (selectableOrgs.length > 0) {
        setSelectedOrgId(selectableOrgs[0].id.toString());
      } else {
        setSelectedOrgId('platform');
      }
    }
  }, [selectableOrgs, queryContract, defaultContract, isSuperAdmin]);

  const isPlatformSelected = selectedOrgId === 'platform';

  const activeOrg: Organisation | undefined = isPlatformSelected
    ? undefined
    : selectableOrgs.find((o) => o.id.toString() === selectedOrgId);

  const activeContractAddress = isPlatformSelected
    ? defaultContract
    : (activeOrg?.contractAddress || queryContract);

  const { electionCount, adminAddress, orgName, isUserAdmin, isAdminLoading } = useVoxChain(activeContractAddress);
  const electionIds = Array.from({ length: electionCount }, (_, i) => i + 1).reverse();
  const createElectionUrl = activeContractAddress
    ? `/admin/create-election?contract=${activeContractAddress}`
    : '/admin/create-election';

  const explorerUrl = getExplorerAddressUrl(activeContractAddress, chainId);

  return (
    <AdminGuard>
      <div className="flex flex-col gap-8 py-6 max-w-6xl mx-auto">
        {/* Organisation Selector */}
        {(selectableOrgs.length > 0 || (isSuperAdmin && defaultContract)) && (
          <div className="p-4 bg-[#0E0E16] border border-white/10 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#818CF8]" />
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                Select Active Workspace:
              </span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedOrgId}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedOrgId(val);
                  if (val === 'platform') {
                    if (defaultContract) {
                      setSearchParams({ contract: defaultContract });
                    } else {
                      setSearchParams({});
                    }
                  } else {
                    const selected = selectableOrgs.find((o) => o.id.toString() === val);
                    if (selected) {
                      setSearchParams({ contract: selected.contractAddress });
                    }
                  }
                }}
                className="bg-[#141420] border border-white/15 text-white font-mono text-xs rounded-lg px-3 py-2 w-full sm:w-80 focus:outline-none focus:border-[#818CF8] cursor-pointer"
              >
                {defaultContract && (
                  <option value="platform">
                    ★ Primary Platform Workspace
                  </option>
                )}
                {selectableOrgs.map((org) => (
                  <option key={org.id.toString()} value={org.id.toString()}>
                    #{org.id.toString()} — {org.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Observation Mode Alert if viewing an organisation not owned by connected wallet */}
        {!isUserAdmin && !isAdminLoading && adminAddress && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-zinc-300">
              <div className="font-semibold text-amber-300">Observation Mode Active</div>
              <p className="leading-relaxed">
                You are currently viewing {activeOrg ? <strong>{activeOrg.name}</strong> : 'this organisation'} in spectator mode. To create new elections or manage candidates and voters on this contract, switch to the administrator account in your wallet, or reassign the administrator in the{' '}
                <Link to="/super-admin" className="underline text-indigo-400 hover:text-indigo-300">
                  Super Admin portal
                </Link>.
              </p>
            </div>
          </div>
        )}

        {/* Admin header */}
        <div className="p-6 bg-[#101010] border border-white/[0.10] rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldCheck className="w-4 h-4 text-[#818CF8]" />
              <span className="font-mono text-[10px] font-semibold text-[#818CF8] uppercase tracking-wider">
                {activeOrg ? `Organisation Admin — ${activeOrg.name}` : 'Primary Platform Admin'}
              </span>
              {activeOrg && (
                <VoxBadge variant="success" size="sm">
                  Verified Org
                </VoxBadge>
              )}
            </div>
            <h1 className="font-display font-medium text-2xl sm:text-3xl text-[#F5F5F5] tracking-tight">
              {activeOrg?.name || orgName || 'Election Management'}
            </h1>
            {activeOrg?.description && (
              <p className="text-xs text-zinc-400 mt-1 max-w-xl">{activeOrg.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2 text-xs text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Workspace Active & Secure</span>
              {explorerUrl && (
                <>
                  <span>·</span>
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-zinc-400 hover:text-white underline text-[11px] inline-flex items-center gap-1"
                  >
                    <span>View on Blockchain Explorer</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </>
              )}
            </div>
          </div>
          <Link to={createElectionUrl}>
            <VoxButton
              variant="primary"
              size="lg"
              icon={<PlusCircle className="w-4 h-4" />}
            >
              Create New Election
            </VoxButton>
          </Link>
        </div>

        {/* Elections table */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="font-display font-medium text-xl text-[#F5F5F5]">
              Managed Elections ({electionCount})
            </h2>
            <span className="font-mono text-[10px] text-[#707070] uppercase tracking-wider">Live</span>
          </div>

          {electionCount === 0 ? (
            <VoxCard variant="layer-1" padding="lg" className="text-center py-16">
              <p className="text-sm text-[#A3A3A3] mb-4">No elections exist in this organisation contract yet.</p>
              <Link to={createElectionUrl}>
                <VoxButton variant="primary" icon={<PlusCircle className="w-4 h-4" />}>
                  Create First Election
                </VoxButton>
              </Link>
            </VoxCard>
          ) : (
            <div className="overflow-x-auto bg-[#101010] border border-white/[0.10] rounded-xl shadow-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.07] bg-[#171717] text-[9px] font-mono uppercase tracking-widest text-[#707070]">
                    <th className="p-4">ID</th>
                    <th className="p-4">Election Name</th>
                    <th className="p-4">Roster</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Administration Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {electionIds.map((id) => (
                    <AdminElectionRow
                      key={id}
                      electionId={id}
                      contractAddress={activeContractAddress}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
};
