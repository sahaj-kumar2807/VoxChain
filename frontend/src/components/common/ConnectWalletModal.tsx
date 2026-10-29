import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useConnect, useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, ExternalLink, AlertCircle, Loader2, ArrowRight, ShieldCheck, Check, Smartphone, Globe } from 'lucide-react';

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedError {
  title: string;
  message: string;
  installUrl?: string;
  installLabel?: string;
  isPending?: boolean;
}

function parseWeb3Error(err: unknown, walletName?: string, fallbackInstallUrl?: string): ParsedError {
  console.error(`[VOXCHAIN] ${walletName || 'Wallet'} error details:`, err);

  if (!err) {
    return {
      title: 'Connection Failed',
      message: 'Could not connect to your wallet. Please try again.',
      installUrl: fallbackInstallUrl,
      installLabel: fallbackInstallUrl ? `Get ${walletName || 'Wallet'}` : undefined,
    };
  }

  let rawMsg = '';
  let code: number | string | undefined = undefined;

  if (typeof err === 'string') {
    rawMsg = err;
  } else if (typeof err === 'object' && err !== null) {
    const obj = err as Record<string, unknown>;

    if (typeof obj.shortMessage === 'string') {
      rawMsg = obj.shortMessage;
    } else if (typeof obj.details === 'string') {
      rawMsg = obj.details;
    } else if (typeof obj.message === 'string' && obj.message !== '[object Object]') {
      rawMsg = obj.message;
    }

    if (obj.cause && typeof obj.cause === 'object') {
      const cause = obj.cause as Record<string, unknown>;
      if (!rawMsg && typeof cause.shortMessage === 'string') rawMsg = cause.shortMessage;
      if (!rawMsg && typeof cause.message === 'string' && cause.message !== '[object Object]') rawMsg = cause.message;
      if (cause.code !== undefined) code = cause.code as number | string;
    }

    if (obj.code !== undefined) {
      code = obj.code as number | string;
    }

    if (!rawMsg || rawMsg === '[object Object]') {
      try {
        rawMsg = JSON.stringify(err);
      } catch {
        rawMsg = '';
      }
    }
  }

  const combined = `${rawMsg} ${String(code || '')}`.toLowerCase();

  // 1. User Rejected / Closed Modal
  if (
    code === 4001 ||
    code === '4001' ||
    combined.includes('4001') ||
    combined.includes('user rejected') ||
    combined.includes('rejected') ||
    combined.includes('user denied') ||
    combined.includes('user cancelled') ||
    combined.includes('closed modal')
  ) {
    return {
      title: 'Sign-in Cancelled',
      message: `The connection request was closed in ${walletName || 'your wallet'}.`,
    };
  }

  // 2. Pending Request in Wallet
  if (
    code === -32002 ||
    code === '-32002' ||
    combined.includes('-32002') ||
    combined.includes('already pending') ||
    combined.includes('resource unavailable')
  ) {
    return {
      title: 'Action Required in Wallet',
      message: `A connection request is pending. Please open ${walletName || 'your wallet'} to approve it.`,
      isPending: true,
    };
  }

  // 3. Provider / Wallet Not Found
  if (combined.includes('not found') || combined.includes('no provider') || combined.includes('connectornotfound')) {
    return {
      title: `${walletName || 'Wallet'} Not Detected`,
      message: `No active extension found for ${walletName || 'this wallet'} in your browser. You can install it or open its official download page below.`,
      installUrl: fallbackInstallUrl,
      installLabel: `Get ${walletName || 'Wallet'}`,
    };
  }

  // 4. Chain Switch / Unsupported Chain
  if (code === 4902 || combined.includes('4902') || combined.includes('unrecognized chain') || combined.includes('switch chain')) {
    return {
      title: 'Switch Network',
      message: 'Please switch your wallet network to Ethereum Sepolia to access VoxChain.',
    };
  }

  return {
    title: 'Connection Issue',
    message: rawMsg && rawMsg !== '[object Object]' && rawMsg.length < 200
      ? rawMsg
      : `Failed to connect with ${walletName || 'wallet'}. Please make sure your wallet is unlocked and try again.`,
    installUrl: fallbackInstallUrl,
    installLabel: fallbackInstallUrl ? `Get ${walletName || 'Wallet'}` : undefined,
  };
}

export const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({ isOpen, onClose }) => {
  const { connectors, connectAsync, isPending } = useConnect();
  const { isConnected, address } = useAccount();
  const [errorDetails, setErrorDetails] = useState<ParsedError | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  // Reset errors when modal is opened
  useEffect(() => {
    if (isOpen) {
      setErrorDetails(null);
      setConnectingId(null);
    }
  }, [isOpen]);

  const anyWin = typeof window !== 'undefined' ? (window as any) : undefined;
  const isMetaMaskDetected = Boolean(
    anyWin && (
      anyWin.ethereum?.isMetaMask ||
      anyWin.ethereum?.providers?.some((p: any) => p.isMetaMask)
    )
  );

  const isCoinbaseDetected = Boolean(
    anyWin && (
      anyWin.coinbaseWalletExtension ||
      anyWin.ethereum?.isCoinbaseWallet ||
      anyWin.ethereum?.providers?.some((p: any) => p.isCoinbaseWallet)
    )
  );

  const hasInjected = Boolean(anyWin?.ethereum);

  const handleConnect = async (
    connector: (typeof connectors)[number] | undefined,
    walletName: string,
    installUrl: string
  ) => {
    try {
      setErrorDetails(null);

      if (!connector) {
        window.open(installUrl, '_blank', 'noopener,noreferrer');
        return;
      }

      setConnectingId(connector.id);

      // Connect strictly through the selected connector (no global window.ethereum hijack)
      await connectAsync({ connector });
      onClose();
    } catch (err: unknown) {
      console.error(`[VOXCHAIN] ${walletName} connection failed:`, err);
      setErrorDetails(parseWeb3Error(err, walletName, installUrl));
    } finally {
      setConnectingId(null);
    }
  };

  if (!isOpen || !mounted) return null;

  // ── Curate and Deduplicate Wallet Options ──
  // 1. MetaMask
  const metaMaskConnector =
    connectors.find((c) => c.id === 'io.metamask' || c.name.toLowerCase() === 'metamask') ||
    connectors.find((c) => c.name.toLowerCase().includes('metamask')) ||
    (isMetaMaskDetected ? connectors.find((c) => c.id === 'injected') : undefined);

  // 2. Coinbase Wallet
  const coinbaseConnector = connectors.find(
    (c) =>
      c.id.toLowerCase().includes('coinbase') ||
      c.name.toLowerCase().includes('coinbase')
  );

  // 3. WalletConnect (supports Trust Wallet, Rainbow, mobile apps via QR code)
  const walletConnectConnector = connectors.find(
    (c) =>
      c.id.toLowerCase().includes('walletconnect') ||
      c.name.toLowerCase().includes('walletconnect')
  );

  // 4. Other Injected Wallets (e.g. Rabby, Brave, Phantom, if present and not MetaMask/Coinbase)
  const otherConnectors = connectors.filter((c) => {
    const isMM = c.id === metaMaskConnector?.id || c.name.toLowerCase().includes('metamask');
    const isCB = c.id === coinbaseConnector?.id || c.name.toLowerCase().includes('coinbase');
    const isWC = c.id === walletConnectConnector?.id || c.name.toLowerCase().includes('walletconnect');
    return !isMM && !isCB && !isWC;
  });

  interface WalletOption {
    id: string;
    name: string;
    subtitle: string;
    badge?: string;
    connector?: (typeof connectors)[number];
    icon: React.ReactNode;
    officialUrl: string;
    installLabel: string;
    onClick: () => void;
  }

  const walletOptions: WalletOption[] = [];

  // MetaMask Option
  walletOptions.push({
    id: 'metamask',
    name: 'MetaMask',
    subtitle: isMetaMaskDetected || metaMaskConnector ? 'Ready to connect' : 'Popular browser extension & mobile app',
    badge: isMetaMaskDetected ? 'Detected' : undefined,
    connector: metaMaskConnector,
    officialUrl: 'https://metamask.io/download/',
    installLabel: 'Install MetaMask',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
        <path d="M21.5 7.5L13.8 2.3C13.3 2 12.7 2 12.2 2.3L4.5 7.5C4.2 7.7 4 8 4 8.4L2.1 14.8C1.9 15.6 2.3 16.4 3.1 16.7L12 21.5L20.9 16.7C21.7 16.4 22.1 15.6 21.9 14.8L20 8.4C20 8 19.8 7.7 21.5 7.5Z" fill="#E2761B" stroke="#E2761B" strokeWidth="0.5"/>
        <path d="M12 21.5L7.5 13.5L12 9.5L16.5 13.5L12 21.5Z" fill="#E4761B"/>
        <path d="M2.5 15L7.5 13.5L4 8.5L2.5 15Z" fill="#E4761B"/>
        <path d="M21.5 15L16.5 13.5L20 8.5L21.5 15Z" fill="#E4761B"/>
        <path d="M7.5 13.5L12 17.5L16.5 13.5L12 15.5L7.5 13.5Z" fill="#D7C1B3"/>
        <circle cx="8.5" cy="12.5" r="1.5" fill="#233447"/>
        <circle cx="15.5" cy="12.5" r="1.5" fill="#233447"/>
      </svg>
    ),
    onClick: () => {
      if (metaMaskConnector) {
        handleConnect(metaMaskConnector, 'MetaMask', 'https://metamask.io/download/');
      } else if (hasInjected) {
        const fallback = connectors.find((c) => c.id === 'injected');
        handleConnect(fallback, 'MetaMask', 'https://metamask.io/download/');
      } else {
        window.open('https://metamask.io/download/', '_blank', 'noopener,noreferrer');
      }
    },
  });

  // Coinbase Wallet Option
  walletOptions.push({
    id: 'coinbase',
    name: 'Coinbase Wallet',
    subtitle: isCoinbaseDetected ? 'Ready to connect' : 'Mobile app & browser extension',
    badge: isCoinbaseDetected ? 'Detected' : undefined,
    connector: coinbaseConnector,
    officialUrl: 'https://www.coinbase.com/wallet/downloads',
    installLabel: 'Install Coinbase Wallet',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#0052FF" />
        <rect x="8.5" y="8.5" width="7" height="7" rx="1.5" fill="white" />
      </svg>
    ),
    onClick: () => handleConnect(coinbaseConnector, 'Coinbase Wallet', 'https://www.coinbase.com/wallet/downloads'),
  });

  // WalletConnect Option (Mobile QR code, Trust Wallet, Rainbow, etc.)
  walletOptions.push({
    id: 'walletconnect',
    name: 'WalletConnect',
    subtitle: 'Scan QR code with Trust Wallet, Rainbow, or any mobile app',
    connector: walletConnectConnector,
    officialUrl: 'https://walletconnect.com/explorer',
    installLabel: 'Explore Supported Wallets',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="12" fill="#3B99FC" />
        <path
          d="M7.2 9.6C9.85 7 14.15 7 16.8 9.6L17.3 10.1C17.5 10.3 17.5 10.7 17.3 10.9L16 12.2C15.9 12.3 15.7 12.3 15.6 12.2L14.8 11.4C13.25 9.85 10.75 9.85 9.2 11.4L8.4 12.2C8.3 12.3 8.1 12.3 8 12.2L6.7 10.9C6.5 10.7 6.5 10.3 6.7 10.1L7.2 9.6ZM19.2 12L20.4 13.2C20.6 13.4 20.6 13.8 20.4 14L15.6 18.8C15.4 19 15 19 14.8 18.8L12.7 16.7C12.6 16.6 12.4 16.6 12.3 16.7L10.2 18.8C10 19 9.6 19 9.4 18.8L4.6 14C4.4 13.8 4.4 13.4 4.6 13.2L5.8 12C6 11.8 6.4 11.8 6.6 12L8.7 14.1C8.8 14.2 9 14.2 9.1 14.1L11.2 12C11.4 11.8 11.8 11.8 12 12L14.1 14.1C14.2 14.2 14.4 14.2 14.5 14.1L16.6 12C16.8 11.8 17.2 11.8 17.4 12H19.2Z"
          fill="white"
        />
      </svg>
    ),
    onClick: () => handleConnect(walletConnectConnector, 'WalletConnect', 'https://walletconnect.com/explorer'),
  });

  // Other announced browser wallets (Rabby, Phantom, Brave, etc.)
  otherConnectors.forEach((conn) => {
    // Skip redundant injected if MetaMask is already shown
    if (conn.id === 'injected' && isMetaMaskDetected) return;

    walletOptions.push({
      id: conn.id,
      name: conn.name === 'Injected' ? 'Browser Wallet' : conn.name,
      subtitle: 'Installed browser extension',
      connector: conn,
      officialUrl: 'https://ethereum.org/en/wallets/',
      installLabel: 'Learn More',
      icon: (
        <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
          <Globe className="w-3.5 h-3.5" />
        </div>
      ),
      onClick: () => handleConnect(conn, conn.name, 'https://ethereum.org/en/wallets/'),
    });
  });

  return createPortal(
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="connect-wallet-title"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 14 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md my-auto rounded-2xl bg-[#0D0F14] border border-[#292D33] p-6 sm:p-7 shadow-[0_24px_80px_rgba(0,0,0,0.95)] z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1C212B] pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 id="connect-wallet-title" className="font-display font-bold text-lg text-white">
                  Connect Wallet
                </h3>
                <span className="text-xs text-zinc-400 block">
                  Choose your digital wallet to sign in
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg border border-[#292D33] bg-[#121316] text-[#768297] hover:text-[#E3E2E5] hover:border-white/30 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Extension Detection Banner */}
          {!hasInjected && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs leading-relaxed text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold mb-1 text-white">Don't have a wallet yet?</p>
                <p className="text-zinc-300 text-xs mb-2.5">
                  You can install MetaMask for free in your browser, or scan with a mobile wallet like Trust Wallet.
                </p>
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  <span>Install MetaMask</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* Error Notice */}
          {errorDetails && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="flex-1">
                <p className="font-semibold text-rose-200 mb-1">{errorDetails.title}</p>
                <p className="text-xs text-rose-300/90 mb-2.5">{errorDetails.message}</p>
                {errorDetails.installUrl && (
                  <a
                    href={errorDetails.installUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-semibold transition-colors"
                  >
                    <span>{errorDetails.installLabel || 'Open Official Download Page'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {errorDetails.isPending && (
                  <span className="text-[11px] text-amber-300 block font-semibold mt-2">
                    Tip: Look at the top-right toolbar of Chrome / Brave for your wallet notification.
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Connected state notice */}
          {isConnected && address && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Connected: {address.slice(0, 6)}…{address.slice(-4)}</span>
              </div>
              <span className="text-[11px] text-zinc-400">Sepolia Testnet</span>
            </div>
          )}

          {/* Curated Wallet Options with Direct Official Links */}
          <div className="flex flex-col gap-2.5 mb-5">
            {walletOptions.map((wallet) => {
              const isBusy = isPending && connectingId === wallet.connector?.id;

              return (
                <motion.div
                  key={wallet.id}
                  onClick={wallet.onClick}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 26 }}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[#292D33] bg-[#121316] hover:bg-[#181B22] hover:border-emerald-500/50 hover:shadow-[0_12px_28px_rgba(0,0,0,0.8),0_0_18px_rgba(16,185,129,0.18)] cursor-pointer group text-left select-none"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#07080A] border border-[#292D33] flex items-center justify-center shrink-0 group-hover:border-emerald-500/40 group-hover:scale-105 transition-all">
                      {wallet.icon}
                    </div>
                    <div className="flex flex-col items-start min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-white group-hover:text-emerald-300 transition-colors">
                          {wallet.name}
                        </span>
                        {wallet.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            {wallet.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-zinc-400 truncate max-w-[210px] sm:max-w-[240px]">
                        {wallet.subtitle}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {/* Direct Official Link / Install Shortcut */}
                    <a
                      href={wallet.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      title={`Open official ${wallet.name} site / download`}
                      className="px-2 py-1 rounded-md border border-white/10 bg-[#161820] text-[11px] font-mono text-zinc-400 hover:text-emerald-300 hover:border-emerald-500/40 hover:bg-[#1E232E] transition-all flex items-center gap-1 group/btn"
                    >
                      <span>Get</span>
                      <ExternalLink className="w-3 h-3 group-hover/btn:text-emerald-400 transition-colors" />
                    </a>

                    {/* Connect Trigger */}
                    <div className="w-6 h-6 flex items-center justify-center">
                      {isBusy ? (
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Pending approval reminder if connecting */}
          {isPending && (
            <div className="mb-4 p-3 rounded-lg bg-[#121316] border border-[#292D33] text-center text-xs text-zinc-300 animate-pulse">
              Please check your wallet pop-up or mobile device to approve connection.
            </div>
          )}

          {/* Direct Wallet Links Helper Box */}
          <div className="mb-4 p-3 rounded-xl bg-[#090A0E] border border-white/5 text-xs text-zinc-400">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-1.5">
              Official Wallet Download & Documentation:
            </span>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono">
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-emerald-400 inline-flex items-center gap-1 transition-colors"
              >
                <span>MetaMask</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <span className="text-zinc-700">•</span>
              <a
                href="https://www.coinbase.com/wallet/downloads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-emerald-400 inline-flex items-center gap-1 transition-colors"
              >
                <span>Coinbase Wallet</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <span className="text-zinc-700">•</span>
              <a
                href="https://walletconnect.com/explorer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-emerald-400 inline-flex items-center gap-1 transition-colors"
              >
                <span>WalletConnect</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          {/* Footer Guidance */}
          <div className="pt-3 border-t border-[#1C212B] flex items-center justify-between text-xs text-zinc-400">
            <span>Network: Ethereum Sepolia</span>
            <a
              href="https://ethereum.org/en/wallets/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-emerald-400 transition-colors flex items-center gap-1 hover:underline"
            >
              <span>What is a wallet?</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
