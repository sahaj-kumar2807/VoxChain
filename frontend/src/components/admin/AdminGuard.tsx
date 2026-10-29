import React from 'react';
import { useAccount } from 'wagmi';
import { useSearchParams, Link } from 'react-router-dom';
import { useVoxChain } from '../../hooks/useVoxChain';
import { useVoxChainRegistry } from '../../hooks/useVoxChainRegistry';
import { VoxCard } from '../common/VoxCard';
import { VoxButton } from '../common/VoxButton';
import { VoxHashPill } from '../common/VoxHashPill';
import { ShieldAlert, Loader2, ArrowLeft } from 'lucide-react';

export interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const [searchParams] = useSearchParams();
  const contractParam = (searchParams.get('contract') as `0x${string}`) || undefined;
  const { isConnected, address } = useAccount();
  const { isUserAdmin, adminAddress, isAdminLoading } = useVoxChain(contractParam);
  const {
    isOrgAdmin,
    isSuperAdmin,
    adminOrganisations,
    isLoading: isRegistryLoading,
  } = useVoxChainRegistry();

  if (isAdminLoading || isRegistryLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#818CF8]" />
        <span className="font-mono text-xs text-zinc-400">
          Verifying Governance Credentials...
        </span>
      </div>
    );
  }

  // If a specific contract is requested, verify authority for that specific contract
  const isAuthorizedForTargetContract = contractParam
    ? isSuperAdmin ||
      isUserAdmin ||
      adminOrganisations.some(
        (o) => o.contractAddress.toLowerCase() === contractParam.toLowerCase()
      )
    : isUserAdmin || isOrgAdmin || isSuperAdmin;

  if (!isConnected || !isAuthorizedForTargetContract) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <VoxCard
          variant="layer-1"
          padding="lg"
          className="border-rose-500/30 text-center bg-[#0C0C12]"
        >
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <h2 className="font-display font-bold text-2xl text-white mb-2">
            Governance Authority Required
          </h2>

          <p className="text-xs text-zinc-400 leading-relaxed mb-6">
            {contractParam
              ? 'Your connected wallet does not hold administrator authority for this specific organisation contract. Multi-organisation governance restricts administrative actions to the assigned administrator.'
              : 'This administrative portal requires cryptographic authorization as an assigned Organisation Administrator or platform Super Admin.'}
          </p>

          <div className="p-4 bg-[#14141E] rounded-xl border border-white/10 text-xs mb-6 text-left">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 block mb-1.5">
              {contractParam ? 'Designated Organisation Administrator:' : 'Election Contract Administrator:'}
            </span>

            {adminAddress ? (
              <VoxHashPill
                hash={adminAddress}
                type="address"
                truncate={true}
              />
            ) : (
              <span className="font-mono text-zinc-500">
                Loading admin address...
              </span>
            )}
          </div>

          <div className="flex justify-center gap-3">
            <Link to="/dashboard">
              <VoxButton variant="outline" icon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Return to Voter Portal
              </VoxButton>
            </Link>
          </div>
        </VoxCard>
      </div>
    );
  }

  return <>{children}</>;
};