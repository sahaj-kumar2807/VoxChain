import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { VOX_CHAIN_ABI } from '../contracts/voxChainAbi';
import { DEFAULT_CONTRACT_ADDRESS } from '../contracts/config';

export function useVoxChain() {
  const { address } = useAccount();

  // Read admin address
  const { data: adminAddress, isLoading: isAdminLoading, refetch: refetchAdmin } = useReadContract({
    address: DEFAULT_CONTRACT_ADDRESS,
    abi: VOX_CHAIN_ABI,
    functionName: 'admin',
  });

  // Read total election count
  const { data: electionCount, isLoading: isCountLoading, refetch: refetchCount } = useReadContract({
    address: DEFAULT_CONTRACT_ADDRESS,
    abi: VOX_CHAIN_ABI,
    functionName: 'electionCount',
  });

  // Write contract hook
  const { writeContractAsync, data: txHash, isPending: isWritePending, error: writeError, reset: resetWrite } = useWriteContract();

  // Wait for transaction
  const { isLoading: isConfirming, isSuccess: isConfirmed, data: receipt, error: receiptError } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const isUserAdmin = Boolean(
    address && adminAddress && address.toLowerCase() === adminAddress.toLowerCase()
  );

  return {
    contractAddress: DEFAULT_CONTRACT_ADDRESS,
    adminAddress,
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
