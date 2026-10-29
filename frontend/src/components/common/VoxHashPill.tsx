import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { truncateAddress, truncateHash } from '../../utils/formatters';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { getExplorerTxUrl, getExplorerAddressUrl } from '../../contracts/config';
import { useAccount, useChainId } from 'wagmi';

export interface VoxHashPillProps extends React.HTMLAttributes<HTMLDivElement> {
  hash: string;
  type?: 'address' | 'txHash' | 'block';
  truncate?: boolean;
  showCopy?: boolean;
  showExplorerLink?: boolean;
}

export const VoxHashPill: React.FC<VoxHashPillProps> = ({
  className,
  hash,
  type = 'address',
  truncate = true,
  showCopy = true,
  showExplorerLink = true,
  ...props
}) => {
  const [copied, setCopied] = useState(false);
  const { chainId: accountChainId } = useAccount();
  const defaultChainId = useChainId();
  const chainId = accountChainId || defaultChainId;

  const displayText = truncate
    ? type === 'address'
      ? truncateAddress(hash, 4)
      : truncateHash(hash, 6, 4)
    : hash;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const explorerUrl =
    type === 'txHash'
      ? getExplorerTxUrl(hash, chainId)
      : type === 'address'
      ? getExplorerAddressUrl(hash, chainId)
      : null;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 hover:border-[#818CF8]/50 rounded-lg font-mono text-xs text-white transition-all shadow-sm max-w-full',
        className
      )}
      {...props}
    >
      <span className="select-all truncate min-w-0 font-mono tracking-tight" title={hash}>
        {displayText}
      </span>

      {(showCopy || (showExplorerLink && explorerUrl)) && (
        <div className="flex items-center gap-0.5 shrink-0 ml-auto pl-1 print:hidden">
          {showCopy && (
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy hash"
              className="text-zinc-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
              title={copied ? 'Copied to clipboard' : 'Copy to clipboard'}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}

          {showExplorerLink && explorerUrl && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-[#818CF8] p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
              title="View on Explorer"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}
    </div>
  );
};
