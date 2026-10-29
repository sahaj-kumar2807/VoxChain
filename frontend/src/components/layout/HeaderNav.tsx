import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { hardhat, sepolia } from 'wagmi/chains';
import { motion } from 'framer-motion';
import { VoxButton } from '../common/VoxButton';
import { VoxBadge } from '../common/VoxBadge';
import { VoxHashPill } from '../common/VoxHashPill';
import { ConnectWalletModal } from '../common/ConnectWalletModal';
import { useVoxChain } from '../../hooks/useVoxChain';
import { useVoxChainRegistry } from '../../hooks/useVoxChainRegistry';
import { Wallet, ShieldCheck, LogOut, ChevronDown, Check, Menu, X, Building2, Crown } from 'lucide-react';
import { cn } from '../../utils/cn';

export const HeaderNav: React.FC = () => {
  const location = useLocation();
  const { address, isConnected, isConnecting, chainId: accountChainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const defaultChainId = useChainId();
  const chainId = accountChainId || defaultChainId;
  const { switchChain } = useSwitchChain();
  const { isUserAdmin } = useVoxChain();
  const { isSuperAdmin, isOrgAdmin } = useVoxChainRegistry();

  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [showNetworkMenu, setShowNetworkMenu] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close menus on outside click
  useEffect(() => {
    const close = () => {
      setShowWalletMenu(false);
      setShowNetworkMenu(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const isNetworkSupported = chainId === hardhat.id || chainId === sepolia.id;
  const currentNetworkName =
    chainId === hardhat.id
      ? 'Hardhat'
      : chainId === sepolia.id
      ? 'Sepolia'
      : 'Unsupported';

  const navLinks = [
    { name: 'Elections', path: '/dashboard' },
    { name: 'Become an Admin', path: '/request-admin' },
    ...(isUserAdmin || isOrgAdmin ? [{ name: 'Org Admin', path: '/admin' }] : []),
    ...(isSuperAdmin ? [{ name: 'Super Admin', path: '/super-admin' }] : []),
  ];

  const handleMenuClick = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#000000]/95 backdrop-blur-xl transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* ── Wordmark ── */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0" aria-label="VOXCHAIN home">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            className="w-7 h-7 rounded border border-white/20 bg-[#0A0A10] flex items-center justify-center group-hover:border-[#818CF8]/60 shadow-[0_0_12px_rgba(99,102,241,0.25)] transition-all"
          >
            <div className="w-3.5 h-3.5 rounded-full border border-[#818CF8]/50 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#818CF8]" />
            </div>
          </motion.div>
          <span className="font-display font-bold text-sm tracking-[0.14em] text-white uppercase">
            VOXCHAIN
          </span>
          <VoxBadge variant="gold" size="sm" className="hidden sm:inline-flex">
            Secure Voting
          </VoxBadge>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden md:flex items-center gap-1.5" aria-label="Application navigation">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
            return (
              <motion.div key={link.path} whileHover={{ y: -1 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to={link.path}
                  className={cn(
                    'px-3.5 py-1.5 rounded-md text-[11px] font-mono uppercase tracking-widest transition-all duration-150 block',
                    isActive
                      ? 'bg-[#6366F1]/15 text-[#A5B4FC] border border-[#6366F1]/40 shadow-[0_0_14px_rgba(99,102,241,0.25)] font-semibold'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                  )}
                >
                  {link.name}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* ── Controls ── */}
        <div className="flex items-center gap-2" onClick={handleMenuClick}>

          {/* Network pill */}
          {isConnected && (
            <div className="relative hidden sm:block">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => { e.stopPropagation(); setShowNetworkMenu(!showNetworkMenu); setShowWalletMenu(false); }}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-[10px] font-mono uppercase tracking-widest transition-colors cursor-pointer',
                  isNetworkSupported
                    ? 'bg-[#0D0D14] border-white/10 text-zinc-300 hover:border-white/25'
                    : 'bg-[#FCA5A5]/08 border-[#FCA5A5]/30 text-[#FCA5A5] animate-pulse'
                )}
                aria-haspopup="true"
                aria-expanded={showNetworkMenu}
              >
                <span className={cn('w-1.5 h-1.5 rounded-full shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)]', isNetworkSupported ? 'bg-[#34D399]' : 'bg-[#FCA5A5]')} />
                <span>{currentNetworkName}</span>
                <ChevronDown className="w-2.5 h-2.5 text-zinc-500" />
              </motion.button>

              {showNetworkMenu && (
                <div className="absolute right-0 mt-1.5 w-44 bg-[#0D0D14] border border-white/15 rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.9)] p-1.5 z-50">
                  <div className="text-[9px] font-mono uppercase tracking-widest text-zinc-400 px-2 py-1">
                    Select Network
                  </div>
                  {[{ chain: hardhat, label: 'Hardhat (Local)' }, { chain: sepolia, label: 'Sepolia Testnet' }].map(({ chain, label }) => (
                    <motion.button
                      key={chain.id}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { switchChain?.({ chainId: chain.id }); setShowNetworkMenu(false); }}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded text-[11px] font-mono hover:bg-white/[0.08] text-left transition-colors cursor-pointer"
                    >
                      <span className={chainId === chain.id ? 'text-white font-semibold' : 'text-zinc-400'}>{label}</span>
                      {chainId === chain.id && <Check className="w-3 h-3 text-[#34D399] shrink-0" />}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Wallet button */}
          {isConnected && address ? (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => { e.stopPropagation(); setShowWalletMenu(!showWalletMenu); setShowNetworkMenu(false); }}
                className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 bg-[#0D0D14] hover:bg-[#151522] border border-white/15 hover:border-[#818CF8]/50 rounded-lg transition-all cursor-pointer shadow-[0_0_12px_rgba(0,0,0,0.5)]"
                aria-haspopup="true"
                aria-expanded={showWalletMenu}
              >
                {/* Monochromatic address avatar with electric violet border */}
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#6366F1]/40 to-[#1E1B4B] border border-[#818CF8]/40 flex items-center justify-center text-[9px] font-mono font-bold text-[#A5B4FC]">
                  {address.slice(2, 4).toUpperCase()}
                </div>
                <span className="font-mono text-[11px] text-white">
                  {address.slice(0, 6)}…{address.slice(-4)}
                </span>
                {isSuperAdmin && (
                  <span title="Platform Super Admin" className="inline-flex items-center">
                    <Crown className="w-3.5 h-3.5 text-[#818CF8] shrink-0" />
                  </span>
                )}
                {!isSuperAdmin && (isUserAdmin || isOrgAdmin) && (
                  <span title="Organisation Administrator" className="inline-flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </span>
                )}
              </motion.button>

              {showWalletMenu && (
                <div className="absolute right-0 mt-1.5 w-72 sm:w-80 bg-[#0D0D14] border border-white/15 rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.95)] p-3.5 z-50">
                  <div className="mb-3 pb-2.5 border-b border-white/10">
                    <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-widest text-zinc-400 mb-2">
                      <span>Connected Wallet</span>
                      <span className="flex items-center gap-1 text-emerald-400 text-[9px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Active
                      </span>
                    </div>
                    <VoxHashPill hash={address} type="address" truncate={true} className="w-full text-[11px]" />
                    {isSuperAdmin && (
                      <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-[#A5B4FC] font-mono">
                        <Crown className="w-3.5 h-3.5 text-[#818CF8]" />
                        <span>Platform Super Admin</span>
                      </div>
                    )}
                    {!isSuperAdmin && (isUserAdmin || isOrgAdmin) && (
                      <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Organisation Administrator</span>
                      </div>
                    )}
                    {!isSuperAdmin && !isUserAdmin && !isOrgAdmin && (
                      <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
                        <span>Role: Voter / Shareholder</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => { disconnect(); setShowWalletMenu(false); }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-[11px] font-mono text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Disconnect Wallet</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <VoxButton
              size="sm"
              variant="outline"
              isLoading={isConnecting}
              loadingText="Connecting"
              icon={<Wallet className="w-3.5 h-3.5" />}
              onClick={() => setShowConnectModal(true)}
            >
              Connect
            </VoxButton>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-1.5 rounded border border-white/10 bg-[#101010] text-[#F5F5F5] hover:border-white/25 transition-colors cursor-pointer"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/07 bg-[#050505] px-4 py-5 flex flex-col gap-4">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'px-3 py-2 rounded text-xs font-mono uppercase tracking-widest transition-colors',
                  location.pathname === link.path
                    ? 'bg-[#1a1a1a] text-[#F5F5F5] border border-white/10'
                    : 'text-[#A3A3A3] hover:text-[#F5F5F5]'
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Connect Wallet Modal */}
      <ConnectWalletModal isOpen={showConnectModal} onClose={() => setShowConnectModal(false)} />
    </header>
  );
};
