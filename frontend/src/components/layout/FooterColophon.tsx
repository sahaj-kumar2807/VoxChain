import React from 'react';
import { useVoxChain } from '../../hooks/useVoxChain';
import { VoxHashPill } from '../common/VoxHashPill';
import { ShieldCheck, Cpu } from 'lucide-react';

export const FooterColophon: React.FC = () => {
  const { contractAddress, electionCount } = useVoxChain();

  return (
    <footer className="mt-20 border-t border-vox-border-subtle bg-vox-bg-base/80 backdrop-blur-sm py-12 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-vox-accent-gold" />
            <span className="font-display font-bold text-base text-vox-text-primary">VOXCHAIN</span>
            <span className="text-xs font-mono text-vox-text-muted">v1.0.0-PROD</span>
          </div>
          <p className="text-xs text-vox-text-secondary max-w-sm">
            Institutional-grade decentralized voting protocol with zero-trust cryptographic verification on the Ethereum blockchain.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs font-mono text-vox-text-muted">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-vox-accent-gold" />
            <span>Contract:</span>
            <VoxHashPill hash={contractAddress} type="address" truncate={true} />
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-vox-state-success" />
            <span>Ballots Managed: {electionCount}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
