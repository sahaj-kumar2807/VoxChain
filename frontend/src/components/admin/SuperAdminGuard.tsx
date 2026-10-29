import React from 'react';
import { useAccount, useChainId } from 'wagmi';
import { sepolia, hardhat } from 'wagmi/chains';
import { useVoxChainRegistry } from '../../hooks/useVoxChainRegistry';
import { VoxCard } from '../common/VoxCard';
import { VoxButton } from '../common/VoxButton';
import { VoxHashPill } from '../common/VoxHashPill';
import { ShieldAlert, Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface SuperAdminGuardProps {
  children: React.ReactNode;
}

export const SuperAdminGuard: React.FC<SuperAdminGuardProps> = ({ children }) => {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { isSuperAdmin, superAdminAddress, isLoading, isRegistryConfigured } = useVoxChainRegistry();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#818CF8]" />
        <span className="font-mono text-xs text-zinc-400">
          Verifying Platform Super Admin Credentials...
        </span>
      </div>
    );
  }

  const networkName = chainId === sepolia.id ? 'Ethereum Sepolia' : chainId === hardhat.id ? 'Hardhat Local' : `Chain #${chainId}`;

  if (!isRegistryConfigured) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <VoxCard
          variant="layer-1"
          padding="lg"
          className="border-amber-500/30 text-center bg-[#0C0C12]"
        >
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <h2 className="font-display font-bold text-2xl text-white mb-2">
            Registry Contract Unconfigured
          </h2>

          <p className="text-xs text-zinc-400 leading-relaxed mb-6">
            The multi-organisation registry contract has not been configured on <strong className="text-zinc-200">{networkName}</strong>.
            Platform administrative actions are locked to prevent errors and loss of gas.
          </p>

          <div className="p-4 bg-[#14141E] rounded-xl border border-white/10 text-xs mb-6 text-left">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 block mb-1.5">
              Required Configuration:
            </span>
            <code className="font-mono text-[11px] text-[#818CF8] break-all block">
              VITE_VOXCHAIN_REGISTRY_ADDRESS=0x...
            </code>
          </div>

          <div className="flex justify-center gap-3">
            <Link to="/dashboard">
              <VoxButton variant="outline" icon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Return to Election Portal
              </VoxButton>
            </Link>
          </div>
        </VoxCard>
      </div>
    );
  }

  if (!isConnected || !isSuperAdmin) {
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
            Platform Super Admin Authority Required
          </h2>

          <p className="text-xs text-zinc-400 leading-relaxed mb-6">
            This governance terminal is reserved strictly for the designated platform
            owner of VoxChainRegistry. It authorizes multi-organisation onboarding,
            administrator assignments, and platform-wide registry oversight.
          </p>

          <div className="p-4 bg-[#14141E] rounded-xl border border-white/10 text-xs mb-6 text-left">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 block mb-1.5">
              Verified Platform Super Admin:
            </span>

            {superAdminAddress ? (
              <VoxHashPill
                hash={superAdminAddress}
                type="address"
                truncate={true}
              />
            ) : (
              <span className="font-mono text-zinc-500">
                Registry not reachable or loading...
              </span>
            )}
          </div>

          <div className="flex justify-center gap-3">
            <Link to="/dashboard">
              <VoxButton variant="outline" icon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Return to Election Portal
              </VoxButton>
            </Link>
          </div>
        </VoxCard>
      </div>
    );
  }

  return <>{children}</>;
};
