import { useEffect } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount, useChainId } from 'wagmi';
import { hardhat, sepolia } from 'wagmi/chains';
import { VOX_CHAIN_ABI } from '../contracts/voxChainAbi';
import { getContractAddress, isSupportedChain } from '../contracts/config';

export function useVoxChain(contractAddressOverride?: `0x${string}`) {
  const { address, chainId: accountChainId } = useAccount();
  const defaultChainId = useChainId();
  const chainId = isSupportedChain(accountChainId)
    ? accountChainId
    : isSupportedChain(defaultChainId)
    ? defaultChainId
    : sepolia.id;
  const resolvedAddress = contractAddressOverride || getContractAddress(chainId);
  const isContractConfigured = Boolean(
    resolvedAddress &&
    resolvedAddress !== '0x0000000000000000000000000000000000000000'
  );
  const activeContractAddress = isContractConfigured ? resolvedAddress : undefined;

  // Read admin address
  const { data: adminAddress, isLoading: isAdminLoading, refetch: refetchAdmin } = useReadContract({
    address: activeContractAddress,
    abi: VOX_CHAIN_ABI,
    functionName: 'admin',
    chainId,
    query: {
      enabled: isContractConfigured,
      staleTime: 10_000,
    },
  });

  // Read organisation name
  const { data: orgName, isLoading: isOrgNameLoading } = useReadContract({
    address: activeContractAddress,
    abi: VOX_CHAIN_ABI,
    functionName: 'orgName',
    chainId,
    query: {
      enabled: isContractConfigured,
      staleTime: 10_000,
    },
  });

  // Read total election count
  const { data: electionCount, isLoading: isCountLoading, refetch: refetchCount } = useReadContract({
    address: activeContractAddress,
    abi: VOX_CHAIN_ABI,
    functionName: 'electionCount',
    chainId,
    query: {
      enabled: isContractConfigured,
      staleTime: 10_000,
    },
  });

  // Write contract hook
  const { writeContractAsync, data: txHash, isPending: isWritePending, error: writeError, reset: resetWrite } = useWriteContract();

  // Wait for transaction
  const { isLoading: isConfirming, isSuccess: isConfirmed, data: receipt, error: receiptError } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Auto-refetch on transaction confirmation to prevent stale admin/count
  useEffect(() => {
    if (isConfirmed) {
      refetchAdmin();
      refetchCount();
    }
  }, [isConfirmed]);

  const isUserAdmin = Boolean(
    address &&
    adminAddress &&
    typeof adminAddress === 'string' &&
    adminAddress !== '0x0000000000000000000000000000000000000000' &&
    address.toLowerCase() === adminAddress.toLowerCase()
  );

  return {
    contractAddress: activeContractAddress,
    isContractConfigured,
    adminAddress: adminAddress as `0x${string}` | undefined,
    orgName: typeof orgName === 'string' ? orgName : undefined,
    isOrgNameLoading,
    isAdminLoading,
    isUserAdmin,
    electionCount: electionCount ? Number(electionCount) : 0,
    isCountLoading,
    refetchAdmin,
    refetchCount,
    writeContractAsync,
    txHash,
    isWritePending,
    writeError,
    resetWrite,
    isConfirming,
    isConfirmed,
    receipt,
    receiptError,
  };
}
