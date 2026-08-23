import React from 'react';
import { useAccount } from 'wagmi';
import { useVoxChain } from '../../hooks/useVoxChain';
import { VoxCard } from '../common/VoxCard';
import { VoxButton } from '../common/VoxButton';
import { VoxHashPill } from '../common/VoxHashPill';
import { ShieldAlert, KeyRound, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { isConnected } = useAccount();
  const { isUserAdmin, adminAddress, isAdminLoading } = useVoxChain();

  if (isAdminLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-vox-accent-gold" />
        <span className="font-mono text-xs text-vox-text-muted">Verifying Governance Credentials...</span>
      </div>
    );
  }

  if (!isConnected || !isUserAdmin) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <VoxCard variant="layer-1" padding="lg" className="border-vox-state-danger/40 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-vox-state-danger-bg border border-vox-state-danger/40 flex items-center justify-center text-vox-state-danger mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="font-display font-bold text-2xl text-vox-text-primary mb-2">
            Governance Authority Required
          </h2>
          <p className="text-xs text-vox-text-secondary leading-relaxed mb-6">
            This administrative portal requires cryptographic authorization from the smart contract deployer. Only
            the official governance account can manage elections and voter registries.
          </p>

          <div className="p-4 bg-vox-surface-2 rounded-xl border border-vox-border-subtle text-xs mb-6 text-left">
            <span className="font-mono text-[11px] uppercase tracking-wider text-vox-text-muted block mb-1">
              Required Administrator Address:
            </span>
            {adminAddress ? (
              <VoxHashPill hash={adminAddress} type="address" truncate={false} className="w-full justify-between" />
            ) : (
              <span className="font-mono text-vox-text-muted">Loading admin address...</span>
            )}
          </div>

          <div className="flex justify-center gap-3">
            <Link to="/dashboard">
              <VoxButton variant="outline">Return to Voter Portal</VoxButton>
            </Link>
          </div>
        </VoxCard>
      </div>
    );
  }

  return <>{children}</>;
};
