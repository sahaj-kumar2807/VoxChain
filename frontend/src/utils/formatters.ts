import { formatEther, formatGwei } from 'viem';

export function truncateAddress(address?: string, chars = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function truncateHash(hash?: string, leading = 6, trailing = 4): string {
  if (!hash) return '';
  if (hash.length <= leading + trailing + 2) return hash;
  return `${hash.slice(0, leading + 2)}...${hash.slice(-trailing)}`;
}

export function formatGasUsed(gas?: bigint): string {
  if (!gas) return '—';
  return Number(gas).toLocaleString('en-US');
}

export function formatEthFee(gasUsed?: bigint, gasPrice?: bigint): string {
  if (!gasUsed || !gasPrice) return '—';
  const totalWei = gasUsed * gasPrice;
  const eth = formatEther(totalWei);
  return `${Number(eth).toFixed(6)} ETH`;
}

export function formatGweiPrice(gasPrice?: bigint): string {
  if (!gasPrice) return '—';
  return `${Number(formatGwei(gasPrice)).toFixed(2)} Gwei`;
}
