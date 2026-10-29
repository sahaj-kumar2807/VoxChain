import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi';
import { sepolia, hardhat } from 'wagmi/chains';
import { motion } from 'framer-motion';
import { useVoxChain } from '../../hooks/useVoxChain';
import { ConnectWalletModal } from '../common/ConnectWalletModal';
import { ArrowUpRight, ShieldCheck, Wallet, LogOut, Menu, X, Check } from 'lucide-react';

export interface LandingHeaderProps {
  onOpenConnectModal?: () => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({ onOpenConnectModal }) => {
  const { address, isConnected, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { isUserAdmin } = useVoxChain();

  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleOpenConnect = () => {
    if (onOpenConnectModal) {
      onOpenConnectModal();
    } else {
      setWalletModalOpen(true);
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navLinks = [
    { label: 'Elections', href: '/dashboard', isRoute: true },
    { label: 'How It Works', href: '#how-it-works', isRoute: false },
    { label: 'Metrics', href: '#protocol-metrics', isRoute: false },
    { label: 'Become an Admin', href: '/request-admin', isRoute: true },
    { label: 'Admin', href: '/admin', isRoute: true },
  ];

  const isSepolia = chainId === sepolia.id;
  const isHardhat = chainId === hardhat.id;

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled
          ? 'border-white/10 bg-[#000000]/95 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.8)]'
          : 'border-white/5 bg-[#000000]/80 backdrop-blur-sm'
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-16 sm:h-20 flex items-center justify-between">

        {/* Minimal Wordmark */}
        <Link to="/" className="flex items-center gap-3 group" aria-label="VOXCHAIN Home">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            className="w-8 h-8 rounded-full border border-white/15 bg-[#0A0A12] flex items-center justify-center relative overflow-hidden group-hover:border-[#818CF8]/60 transition-colors shadow-[0_0_12px_rgba(99,102,241,0.2)]"
          >
            <div className="w-3.5 h-3.5 rounded-full border border-[#818CF8]/60 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#818CF8] shadow-[0_0_6px_#818CF8]" />
            </div>
          </motion.div>
          <div className="flex flex-col">
            <span className="font-sans font-bold text-sm tracking-[0.18em] text-white uppercase">
              VOXCHAIN
            </span>
            <span className="font-mono text-[8px] tracking-[0.24em] text-[#94A3B8] -mt-0.5 uppercase hidden sm:block">
              IMMUTABLE VOTING
            </span>
          </div>
        </Link>

        {/* Center Nav — Desktop */}
        <nav aria-label="Landing page sections" className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            link.isRoute ? (
              <Link
                key={link.label}
                to={link.href}
                className="text-xs font-sans uppercase tracking-[0.14em] text-[#94A3B8] hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="text-xs font-sans uppercase tracking-[0.14em] text-[#94A3B8] hover:text-white transition-colors"
              >
                {link.label}
              </a>
            )
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Network Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-[#08080E] text-[10px] font-mono text-[#94A3B8] tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#818CF8] shadow-[0_0_6px_#818CF8] animate-pulse" />
            <span className="text-[#E2E8F0] font-medium">{isSepolia ? 'SEPOLIA' : isHardhat ? 'HARDHAT' : 'EVM'}</span>
          </div>

          {/* Connected Wallet or Connect Action */}
          {isConnected && address ? (
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.94 }}
                onClick={copyAddress}
                title="Copy address"
                className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-[#0A0A10] hover:border-[#818CF8]/50 text-xs font-mono text-white transition-colors cursor-pointer"
              >
                {isUserAdmin && <ShieldCheck className="w-3.5 h-3.5 text-[#818CF8]" />}
                <span>{address.slice(0, 6)}…{address.slice(-4)}</span>
                {copied && <Check className="w-3 h-3 text-[#818CF8]" />}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => disconnect()}
                title="Disconnect wallet"
                className="p-2 rounded-full border border-white/10 bg-[#0A0A10] text-[#94A3B8] hover:text-[#FCA5A5] hover:border-[#FCA5A5]/30 transition-colors cursor-pointer"
                aria-label="Disconnect wallet"
              >
                <LogOut className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.94 }}
              onClick={handleOpenConnect}
              disabled={isConnecting}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/15 bg-[#08080E] hover:border-[#818CF8]/60 text-xs font-sans uppercase tracking-wider text-white transition-colors cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5 text-[#818CF8]" />
              <span>{isConnecting ? 'Connecting…' : 'Connect'}</span>
            </motion.button>
          )}

          {/* Primary Action — Violet Pill */}
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.93 }}>
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-[#6366F1] to-[#818CF8] hover:from-[#4F46E5] hover:to-[#6366F1] text-white text-xs font-sans font-semibold uppercase tracking-[0.14em] transition-all shadow-[0_0_18px_rgba(99,102,241,0.4)] cursor-pointer"
            >
              <span>Launch</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {/* Mobile Menu Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-full border border-white/10 bg-[#0A0A10] text-white hover:border-[#818CF8]/40 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#000000] px-6 py-6 flex flex-col gap-5">
          <nav className="flex flex-col gap-4" aria-label="Mobile landing navigation">
            {navLinks.map((link) => (
              link.isRoute ? (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-sans uppercase tracking-[0.14em] text-[#94A3B8] hover:text-white py-1 border-b border-white/5"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-sans uppercase tracking-[0.14em] text-[#94A3B8] hover:text-white py-1 border-b border-white/5"
                >
                  {link.label}
                </a>
              )
            ))}
          </nav>

          <div className="pt-2 flex flex-col gap-3">
            {isConnected && address ? (
              <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-[#0A0A10] text-xs font-mono">
                <span className="text-white">{address.slice(0, 8)}…{address.slice(-6)}</span>
                <button onClick={() => disconnect()} className="text-xs text-[#FCA5A5] hover:underline">
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleOpenConnect();
                }}
                className="w-full py-3 rounded-full border border-white/15 bg-[#0A0A10] text-xs font-sans uppercase tracking-widest text-white cursor-pointer hover:border-[#818CF8]"
              >
                Connect Wallet
              </button>
            )}
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#6366F1] to-[#818CF8] text-white text-xs font-sans font-semibold uppercase tracking-[0.14em] text-center shadow-[0_0_18px_rgba(99,102,241,0.4)]"
            >
              Enter Voting Portal →
            </Link>
          </div>
        </div>
      )}

      {/* Connect Wallet Modal */}
      <ConnectWalletModal isOpen={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
    </header>
  );
};
