import { http, createConfig } from 'wagmi';
import { hardhat, sepolia } from 'wagmi/chains';
import { injected, coinbaseWallet, walletConnect } from 'wagmi/connectors';

// Deterministic Hardhat local deployment address
export const HARDHAT_CONTRACT_ADDRESS: `0x${string}` =
  (import.meta.env.VITE_HARDHAT_CONTRACT_ADDRESS as `0x${string}`) ||
  '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// Sepolia deployed contract address from environment or deployed ignition artifacts
export const SEPOLIA_CONTRACT_ADDRESS: `0x${string}` =
  (import.meta.env.VITE_VOXCHAIN_CONTRACT_ADDRESS as `0x${string}`) ||
  '0x9ecd0c8cb4aE359EB05B955F9331f5d324b7E025';

// Default contract address for fallback/backwards compatibility
export const DEFAULT_CONTRACT_ADDRESS: `0x${string}` =
  SEPOLIA_CONTRACT_ADDRESS || HARDHAT_CONTRACT_ADDRESS;

// Local Hardhat registry address
export const HARDHAT_REGISTRY_ADDRESS: `0x${string}` =
  (import.meta.env.VITE_HARDHAT_REGISTRY_ADDRESS as `0x${string}`) ||
  '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// Sepolia registry address (from env when deployed, fallback to deployed address)
export const SEPOLIA_REGISTRY_ADDRESS: `0x${string}` =
  (import.meta.env.VITE_VOXCHAIN_REGISTRY_ADDRESS as `0x${string}`) ||
  '0x65F3ec5560B19434f5F043B9227E3F183CaF1630';

export const DEFAULT_REGISTRY_ADDRESS: `0x${string}` =
  SEPOLIA_REGISTRY_ADDRESS || HARDHAT_REGISTRY_ADDRESS;

/**
 * Internal neutral placeholder for the legacy contract metadataURI argument.
 * VoxChain no longer collects metadata URIs from users during organisation registration.
 * This neutral non-empty value satisfies VoxChainRegistry.sol EmptyMetadataURIError() check
 * without implying that external metadata exists.
 */
export const INTERNAL_REGISTRATION_METADATA_PLACEHOLDER = 'voxchain://internal/organisation';

export const SUPPORTED_CHAIN_IDS = [sepolia.id, hardhat.id] as const;

export function isSupportedChain(chainId?: number): boolean {
  if (!chainId) return false;
  return SUPPORTED_CHAIN_IDS.includes(chainId as (typeof SUPPORTED_CHAIN_IDS)[number]);
}

/**
 * Returns the election contract address for the active chain.
 * Strictly returns undefined on Sepolia if not configured in environment.
 */
export function getContractAddress(chainId?: number): `0x${string}` | undefined {
  if (chainId === sepolia.id) {
    return SEPOLIA_CONTRACT_ADDRESS;
  }
  if (chainId === hardhat.id) {
    return HARDHAT_CONTRACT_ADDRESS;
  }
  // When no chainId is passed (e.g. before wallet connection), provide default fallback
  return chainId ? undefined : DEFAULT_CONTRACT_ADDRESS;
}

/**
 * Returns the VoxChainRegistry address for the active chain.
 * Strictly returns undefined on Sepolia if not configured in environment.
 */
export function getRegistryAddress(chainId?: number): `0x${string}` | undefined {
  if (chainId === sepolia.id) {
    return SEPOLIA_REGISTRY_ADDRESS;
  }
  if (chainId === hardhat.id) {
    return HARDHAT_REGISTRY_ADDRESS;
  }
  // When no chainId is passed (e.g. before wallet connection), provide default fallback
  return chainId ? undefined : DEFAULT_REGISTRY_ADDRESS;
}

export const config = createConfig({
  chains: [sepolia, hardhat],
  connectors: [
    injected(),
    coinbaseWallet({ appName: 'VOXCHAIN' }),
    walletConnect({
      projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '3a8170812b534d0ff9d794f19a901d64',
      showQrModal: true,
    }),
  ],
  transports: {
    [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com'),
    [hardhat.id]: http('http://127.0.0.1:8545'),
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
