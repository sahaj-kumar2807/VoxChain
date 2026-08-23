import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { truncateAddress, truncateHash } from '../../utils/formatters';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { getExplorerTxUrl, getExplorerAddressUrl } from '../../contracts/config';
import { useChainId } from 'wagmi';

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
  const chainId = useChainId();

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
        'inline-flex items-center gap-1.5 px-2.5 py-1 bg-vox-surface-2 hover:bg-vox-surface-3 border border-vox-border-subtle hover:border-vox-border-medium rounded-md font-mono text-xs text-vox-text-primary transition-colors',
        className
      )}
      {...props}
    >
      <span className="select-all">{displayText}</span>

      {showCopy && (
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy hash"
          className="text-vox-text-muted hover:text-vox-accent-gold p-0.5 rounded transition-colors"
          title={copied ? 'Copied to clipboard' : 'Copy to clipboard'}
        >
          {copied ? <Check className="w-3.5 h-3.5 text-vox-state-success" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      )}

      {showExplorerLink && explorerUrl && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-vox-text-muted hover:text-vox-accent-gold p-0.5 rounded transition-colors"
          title="View on Explorer"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
};
