import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { hardhat, sepolia } from 'wagmi/chains';
import { VoxButton } from '../common/VoxButton';
import { VoxBadge } from '../common/VoxBadge';
import { VoxHashPill } from '../common/VoxHashPill';
import { useVoxChain } from '../../hooks/useVoxChain';
import { Wallet, ShieldCheck, Sun, Moon, LogOut, ChevronDown, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

export const HeaderNav: React.FC = () => {
  const location = useLocation();
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { isUserAdmin } = useVoxChain();

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [showNetworkMenu, setShowNetworkMenu] = useState(false);

  useEffect(() => {
    const savedTheme = (localStorage.getItem('vox_theme') as 'dark' | 'light') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('vox_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const isNetworkSupported = chainId === hardhat.id || chainId === sepolia.id;
  const currentNetworkName =
    chainId === hardhat.id ? 'Hardhat (Local)' : chainId === sepolia.id ? 'Sepolia' : 'Unsupported';

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Elections', path: '/dashboard' },
    ...(isUserAdmin ? [{ name: 'Admin Portal', path: '/admin' }] : []),
  ];

  return (
    <header className="sticky top-4 z-40 max-w-6xl mx-auto px-4 w-full">
      <div className="flex items-center justify-between px-4 py-2.5 bg-vox-surface-1/90 backdrop-blur-md border border-vox-border-medium rounded-full shadow-lg">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-2.5 h-2.5 rounded-full bg-vox-accent-gold shadow-[0_0_10px_rgba(245,158,11,0.8)] group-hover:scale-125 transition-transform" />
          <span className="font-display font-bold text-lg tracking-tight text-vox-text-primary">
            VOX<span className="text-vox-accent-gold">CHAIN</span>
          </span>
          <VoxBadge variant="neutral" size="sm" className="hidden sm:inline-flex">
            Civic EVM
          </VoxBadge>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150',
                  isActive
                    ? 'bg-vox-surface-3 text-vox-accent-gold border border-vox-border-active'
                    : 'text-vox-text-secondary hover:text-vox-text-primary hover:bg-vox-surface-2'
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls & Wallet Connection */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle visual theme"
            className="p-2 text-vox-text-muted hover:text-vox-accent-gold hover:bg-vox-surface-2 rounded-full transition-colors cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Network Selector Pill */}
          {isConnected && (
            <div className="relative">
              <button
                onClick={() => setShowNetworkMenu(!showNetworkMenu)}
                className={cn(
                  'hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-mono border transition-colors cursor-pointer',
                  isNetworkSupported
                    ? 'bg-vox-surface-2 border-vox-border-subtle text-vox-text-secondary hover:border-vox-border-medium'
                    : 'bg-vox-state-danger-bg border-vox-state-danger text-vox-state-danger animate-pulse'
                )}
              >
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    isNetworkSupported ? 'bg-vox-state-success' : 'bg-vox-state-danger'
                  )}
                />
                <span>{currentNetworkName}</span>
                <ChevronDown className="w-3 h-3 text-vox-text-muted" />
              </button>

              {showNetworkMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-vox-surface-1 border border-vox-border-strong rounded-xl shadow-xl p-1.5 z-50">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-vox-text-muted px-2.5 py-1">
                    Select Network
                  </div>
                  <button
                    onClick={() => {
                      switchChain?.({ chainId: hardhat.id });
                      setShowNetworkMenu(false);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-vox-surface-2 text-left font-mono"
                  >
                    <span>Hardhat (Local)</span>
                    {chainId === hardhat.id && <Check className="w-3.5 h-3.5 text-vox-state-success" />}
                  </button>
                  <button
                    onClick={() => {
                      switchChain?.({ chainId: sepolia.id });
                      setShowNetworkMenu(false);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-vox-surface-2 text-left font-mono"
                  >
                    <span>Sepolia Testnet</span>
                    {chainId === sepolia.id && <Check className="w-3.5 h-3.5 text-vox-state-success" />}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Wallet Button */}
          {isConnected && address ? (
            <div className="relative">
              <button
                onClick={() => setShowWalletMenu(!showWalletMenu)}
                className="flex items-center gap-2 pl-2 pr-3 py-1 bg-vox-surface-2 hover:bg-vox-surface-3 border border-vox-border-medium rounded-full transition-all cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center text-[10px] font-bold text-black">
                  {address.slice(2, 4).toUpperCase()}
                </div>
                <span className="font-mono text-xs font-medium text-vox-text-primary">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
                {isUserAdmin && (
                  <span title="Admin Credentials Active">
                    <ShieldCheck className="w-3.5 h-3.5 text-vox-accent-gold shrink-0" />
                  </span>
                )}
              </button>

              {showWalletMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-vox-surface-1 border border-vox-border-strong rounded-xl shadow-xl p-3 z-50">
                  <div className="mb-3 pb-2 border-b border-vox-border-subtle">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-vox-text-muted">
                      Connected Wallet
                    </div>
                    <div className="mt-1">
                      <VoxHashPill hash={address} type="address" truncate={false} className="w-full justify-between" />
                    </div>
                    {isUserAdmin && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-vox-accent-gold font-mono">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Contract Administrator</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      disconnect();
                      setShowWalletMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-vox-state-danger hover:bg-vox-state-danger-bg rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Disconnect Wallet</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <VoxButton
              size="sm"
              variant="primary-gold"
              isLoading={isConnecting}
              loadingText="Connecting..."
              icon={<Wallet className="w-4 h-4" />}
              onClick={() => {
                const injectedConnector = connectors.find((c) => c.id === 'injected') || connectors[0];
                if (injectedConnector) {
                  connect({ connector: injectedConnector });
                }
              }}
            >
              Connect Wallet
            </VoxButton>
          )}
        </div>
      </div>
    </header>
  );
};
