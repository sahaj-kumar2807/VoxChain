import { http, createConfig } from 'wagmi';
import { hardhat, sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// Default Hardhat local contract address from Hardhat deployment/scripts
export const DEFAULT_CONTRACT_ADDRESS: `0x${string}` =
  (import.meta.env.VITE_VOXCHAIN_CONTRACT_ADDRESS as `0x${string}`) ||
  '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export const config = createConfig({
  chains: [hardhat, sepolia],
  connectors: [injected()],
  transports: {
    [hardhat.id]: http('http://127.0.0.1:8545'),
    [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org'),
  },
});

export function getExplorerTxUrl(txHash?: string, chainId?: number): string | null {
  if (!txHash) return null;
  if (chainId === sepolia.id) {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  }
  // For local Hardhat node, there is no public explorer, so we return null or a local hash link
  return null;
}

export function getExplorerAddressUrl(address?: string, chainId?: number): string | null {
  if (!address) return null;
  if (chainId === sepolia.id) {
    return `https://sepolia.etherscan.io/address/${address}`;
  }
  return null;
}
