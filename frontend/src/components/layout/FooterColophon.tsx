import React from 'react';
import { useVoxChain } from '../../hooks/useVoxChain';

export const FooterColophon: React.FC = () => {
  const { electionCount } = useVoxChain();

  return (
    <footer className="mt-20 border-t border-white/10 bg-[#000000] py-10 px-4 relative z-10">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#818CF8] shadow-[0_0_8px_#818CF8]" />
            <span className="font-mono font-bold text-[11px] tracking-[0.16em] text-white uppercase">
              VOXCHAIN
            </span>
            <span className="text-[9px] font-mono text-zinc-500 tracking-widest">v1.0</span>
          </div>
          <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
            Secure, transparent voting and governance powered by decentralized blockchain technology.
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-1.5 text-xs text-zinc-400 font-sans">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-zinc-200 font-medium">Network Online</span>
          </div>
          <div className="text-zinc-400 text-xs">
            {electionCount} Active & Past Elections
          </div>
          <div className="text-zinc-500 text-[11px]">
            Ethereum Sepolia Network
          </div>
        </div>
      </div>
    </footer>
  );
};
