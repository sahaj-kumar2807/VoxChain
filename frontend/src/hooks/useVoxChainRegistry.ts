import { useMemo, useEffect } from 'react';
import {
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useChainId,
} from 'wagmi';
import { hardhat, sepolia } from 'wagmi/chains';
import { VOX_CHAIN_REGISTRY_ABI } from '../contracts/voxChainRegistryAbi';
import { getRegistryAddress, isSupportedChain, INTERNAL_REGISTRATION_METADATA_PLACEHOLDER } from '../contracts/config';
import { Organisation, RegistrationStatus, UserPlatformRole } from '../types/registry';

export function parseContractError(error: unknown): string {
  if (!error) return 'An unknown error occurred.';
  const errObj = error as any;
  const message = `${errObj?.shortMessage || ''} ${errObj?.message || ''} ${errObj?.cause?.message || ''} ${String(error)}`;

  if (message.includes('OnlySuperAdminError') || message.includes('Only Super Admin')) {
    return 'Action rejected: Connected wallet does not possess Super Admin governance authority.';
  }
  if (message.includes('ZeroAddressError') || message.includes('InvalidAdminAddressError')) {
    return 'Action rejected: The designated address cannot be the zero address (0x0).';
  }
  if (message.includes('AlreadySuperAdminError')) {
    return 'Action rejected: The specified address is already the active Super Admin.';
  }
  if (message.includes('OnlyPendingSuperAdminError')) {
    return 'Action rejected: Only the nominated pending Super Admin can accept ownership.';
  }
  if (message.includes('NoPendingTransferError')) {
    return 'Action rejected: There is no pending ownership transfer to cancel.';
  }
  if (message.includes('EmptyNameError')) {
    return 'Validation error: Organisation name cannot be empty.';
  }
  if (message.includes('EmptyDescriptionError')) {
    return 'Validation error: Organisation description cannot be empty.';
  }
  if (message.includes('EmptyMetadataURIError')) {
    return 'Validation error: Organisation metadata URI cannot be empty.';
  }
  if (message.includes('InvalidOrgIdError')) {
    return 'Validation error: Invalid organisation ID provided.';
  }
  if (message.includes('OrgNotPendingError')) {
    return 'Action rejected: Organisation is not in Pending status.';
  }
  if (message.includes('OrgNotActiveOrRevokedError')) {
    return 'Action rejected: Administrator replacement requires an Approved or Revoked organisation.';
  }
  if (message.includes('SameAdminAddressError')) {
    return 'Validation error: New administrator address is identical to current administrator.';
  }
  if (message.includes('OrgNotActiveError')) {
    return 'Action rejected: Revocation requires an active Approved organisation.';
  }
  if (message.includes('AdminAlreadyRevokedError')) {
    return 'Action rejected: Organisation administrator is already revoked.';
  }
  if (message.includes('nonce too low') || message.includes('NONCE_EXPIRED')) {
    return 'Wallet Nonce Desync: MetaMask submitted a transaction with an outdated nonce (tx was already mined). In MetaMask, go to Settings → Advanced → Clear activity tab data (or refresh the page) to resync your transaction queue.';
  }
  if (message.includes('replacement transaction underpriced')) {
    return 'Pending transaction collision: A previous transaction is still pending in MetaMask. Go to Settings → Advanced → Clear activity tab data and try again.';
  }
  if (message.includes('insufficient funds')) {
    return 'Insufficient funds: Your wallet does not have enough Sepolia testnet ETH to pay the gas fee for this transaction.';
  }
  if (message.includes('Only admin can add candidates') || message.includes('Only admin can register voters') || message.includes('Only admin can start election') || message.includes('Only admin can end election') || message.includes('Only admin can create an election') || message.includes('Only admin')) {
    return 'Action rejected: Connected wallet is not the designated administrator of this contract.';
  }
  if (message.includes('Election already started')) {
    return 'Action rejected: This election has already started. Candidates and voters cannot be modified once voting opens.';
  }
  if (message.includes('Election already ended') || message.includes('Election has ended')) {
    return 'Action rejected: This election has already ended.';
  }
  if (message.includes('Election has not started')) {
    return 'Action rejected: This election has not started yet.';
  }
  if (message.includes('Add at least one candidate')) {
    return 'Action rejected: Please add at least one candidate before starting the election.';
  }
  if (message.includes('Voter already registered')) {
    return 'Action rejected: This wallet address is already registered as an eligible voter.';
  }
  if (message.includes('Voter is not registered')) {
    return 'Action rejected: Your wallet address is not registered as an eligible voter for this election.';
  }
  if (message.includes('Voter has already voted')) {
    return 'Action rejected: You have already cast your ballot in this election.';
  }
  if (message.includes('Candidate name cannot be empty')) {
    return 'Validation error: Candidate name cannot be empty.';
  }
  if (message.includes('Election name cannot be empty')) {
    return 'Validation error: Election name cannot be empty.';
  }
  if (message.includes('Invalid candidate')) {
    return 'Action rejected: Invalid candidate selected.';
  }
  if (message.includes('User rejected the request') || message.includes('User denied transaction signature')) {
    return 'Transaction cancelled by user.';
  }

  // Fallback to cleaner message
  const detailsMatch = message.match(/Details: (.*?)(?:\n|$)/);
  if (detailsMatch && detailsMatch[1]) {
    return detailsMatch[1];
  }

  return errObj?.shortMessage || message.slice(0, 220);
}

export function useVoxChainRegistry() {
  const { address, chainId: accountChainId, isConnected } = useAccount();
  const defaultChainId = useChainId();
  const chainId = isSupportedChain(accountChainId)
    ? accountChainId
    : isSupportedChain(defaultChainId)
    ? defaultChainId
    : sepolia.id;

  const configuredRegistryAddress = getRegistryAddress(chainId);
  const isRegistryConfigured = Boolean(
    configuredRegistryAddress &&
    configuredRegistryAddress !== '0x0000000000000000000000000000000000000000'
  );
  const registryAddress = isRegistryConfigured ? configuredRegistryAddress : undefined;

  // 1. Read Super Admin address
  const {
    data: superAdminAddress,
    isLoading: isSuperAdminLoading,
    refetch: refetchSuperAdmin,
  } = useReadContract({
    address: registryAddress,
    abi: VOX_CHAIN_REGISTRY_ABI,
    functionName: 'superAdmin',
    chainId,
    query: {
      enabled: isRegistryConfigured,
      staleTime: 10_000,
    },
  });

  // 2. Read Pending Super Admin address
  const {
    data: pendingSuperAdminAddress,
    isLoading: isPendingSuperAdminLoading,
    refetch: refetchPendingSuperAdmin,
  } = useReadContract({
    address: registryAddress,
    abi: VOX_CHAIN_REGISTRY_ABI,
    functionName: 'pendingSuperAdmin',
    chainId,
    query: {
      enabled: isRegistryConfigured,
      staleTime: 10_000,
    },
  });

  // 3. Read total organisation count
  const {
    data: orgCountBigInt,
    isLoading: isOrgCountLoading,
    refetch: refetchOrgCount,
  } = useReadContract({
    address: registryAddress,
    abi: VOX_CHAIN_REGISTRY_ABI,
    functionName: 'organisationCount',
    chainId,
    query: {
      enabled: isRegistryConfigured,
      staleTime: 10_000,
    },
  });

  const totalOrgCount = orgCountBigInt ? Number(orgCountBigInt) : 0;

  // 4. Multicall read of all organisations from 1 to organisationCount
  const orgCalls = useMemo(() => {
    if (totalOrgCount === 0 || !isRegistryConfigured || !registryAddress) return [];
    return Array.from({ length: totalOrgCount }, (_, idx) => ({
      address: registryAddress,
      abi: VOX_CHAIN_REGISTRY_ABI,
      functionName: 'getOrganisation' as const,
      args: [BigInt(idx + 1)],
      chainId,
    }));
  }, [totalOrgCount, isRegistryConfigured, registryAddress, chainId]);

  const {
    data: orgMulticallResults,
    isLoading: isOrgsLoading,
    refetch: refetchOrgs,
  } = useReadContracts({
    contracts: orgCalls,
    query: {
      enabled: orgCalls.length > 0,
      staleTime: 10_000,
    },
  });

  // Parse organisation records
  const allOrganisations = useMemo<Organisation[]>(() => {
    if (!orgMulticallResults) return [];
    const orgs: Organisation[] = [];
    for (const result of orgMulticallResults) {
      if (result.status === 'success' && result.result) {
        const item = result.result as {
          id: bigint;
          name: string;
          description: string;
          metadataURI: string;
          requester: `0x${string}`;
          status: number;
          admin: `0x${string}`;
          contractAddress: `0x${string}`;
        };
        orgs.push({
          id: item.id,
          name: item.name,
          description: item.description,
          metadataURI: item.metadataURI,
          requester: item.requester,
          status: item.status as RegistrationStatus,
          admin: item.admin,
          contractAddress: item.contractAddress,
        });
      }
    }
    return orgs;
  }, [orgMulticallResults]);

  // Filtered views
  const pendingOrganisations = useMemo(
    () => allOrganisations.filter((o) => o.status === RegistrationStatus.Pending),
    [allOrganisations]
  );
  const approvedOrganisations = useMemo(
    () => allOrganisations.filter((o) => o.status === RegistrationStatus.Approved),
    [allOrganisations]
  );
  const rejectedOrganisations = useMemo(
    () => allOrganisations.filter((o) => o.status === RegistrationStatus.Rejected),
    [allOrganisations]
  );
  const revokedOrganisations = useMemo(
    () => allOrganisations.filter((o) => o.status === RegistrationStatus.Revoked),
    [allOrganisations]
  );

  // User Roles
  const isSuperAdmin = Boolean(
    isConnected &&
      address &&
      superAdminAddress &&
      address.toLowerCase() === (superAdminAddress as string).toLowerCase()
  );

  const isPendingSuperAdmin = Boolean(
    isConnected &&
      address &&
      pendingSuperAdminAddress &&
      pendingSuperAdminAddress !== '0x0000000000000000000000000000000000000000' &&
      address.toLowerCase() === (pendingSuperAdminAddress as string).toLowerCase()
  );

  const adminOrganisations = useMemo(() => {
    if (!isConnected || !address) return [];
    return approvedOrganisations.filter(
      (o) => o.admin.toLowerCase() === address.toLowerCase()
    );
  }, [isConnected, address, approvedOrganisations]);

  const isOrgAdmin = adminOrganisations.length > 0;

  const userRole: UserPlatformRole = useMemo(() => {
    if (!isConnected || !address) return 'anonymous';
    if (isSuperAdmin) return 'superAdmin';
    if (isOrgAdmin) return 'orgAdmin';
    return 'voter';
  }, [isConnected, address, isSuperAdmin, isOrgAdmin]);

  // Write contract hook
  const {
    writeContractAsync,
    data: txHash,
    isPending: isWritePending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    data: receipt,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash: txHash });

  // Unified refetch
  const refetchAll = async () => {
    await Promise.all([
      refetchSuperAdmin(),
      refetchPendingSuperAdmin(),
      refetchOrgCount(),
      refetchOrgs(),
    ]);
  };

  // Auto-refetch on transaction confirmation to prevent stale role data
  useEffect(() => {
    if (isConfirmed) {
      refetchAll();
    }
  }, [isConfirmed]);

  // Guard write actions against unconfigured registry
  const assertRegistryReady = () => {
    if (!isRegistryConfigured || !registryAddress) {
      const net = chainId === sepolia.id ? 'Sepolia' : chainId === hardhat.id ? 'Hardhat' : `Chain #${chainId}`;
      throw new Error(`Registry smart contract is not configured on ${net}. Set VITE_VOXCHAIN_REGISTRY_ADDRESS to enable platform actions.`);
    }
  };

  // Safe mutation wrappers
  const requestRegistration = async (
    name: string,
    description: string,
    metadataURI?: string
  ) => {
    assertRegistryReady();
    const internalUri = metadataURI?.trim() || INTERNAL_REGISTRATION_METADATA_PLACEHOLDER;
    return await writeContractAsync({
      address: registryAddress!,
      abi: VOX_CHAIN_REGISTRY_ABI,
      functionName: 'requestRegistration',
      args: [name, description, internalUri],
    });
  };

  const approveOrganisation = async (orgId: bigint, adminWallet: `0x${string}`) => {
    assertRegistryReady();
    return await writeContractAsync({
      address: registryAddress!,
      abi: VOX_CHAIN_REGISTRY_ABI,
      functionName: 'approveOrganisation',
      args: [orgId, adminWallet],
    });
  };

  const rejectOrganisation = async (orgId: bigint, reason: string) => {
    assertRegistryReady();
    return await writeContractAsync({
      address: registryAddress!,
      abi: VOX_CHAIN_REGISTRY_ABI,
      functionName: 'rejectOrganisation',
      args: [orgId, reason],
    });
  };

  const replaceOrgAdmin = async (orgId: bigint, newAdmin: `0x${string}`) => {
    assertRegistryReady();
    return await writeContractAsync({
      address: registryAddress!,
      abi: VOX_CHAIN_REGISTRY_ABI,
      functionName: 'replaceOrgAdmin',
      args: [orgId, newAdmin],
    });
  };

  const revokeOrgAdmin = async (orgId: bigint) => {
    assertRegistryReady();
    return await writeContractAsync({
      address: registryAddress!,
      abi: VOX_CHAIN_REGISTRY_ABI,
      functionName: 'revokeOrgAdmin',
      args: [orgId],
    });
  };

  const transferSuperAdmin = async (newSuperAdmin: `0x${string}`) => {
    assertRegistryReady();
    return await writeContractAsync({
      address: registryAddress!,
      abi: VOX_CHAIN_REGISTRY_ABI,
      functionName: 'transferSuperAdmin',
      args: [newSuperAdmin],
    });
  };

  const acceptSuperAdmin = async () => {
    assertRegistryReady();
    return await writeContractAsync({
      address: registryAddress!,
      abi: VOX_CHAIN_REGISTRY_ABI,
      functionName: 'acceptSuperAdmin',
    });
  };

  const cancelSuperAdminTransfer = async () => {
    assertRegistryReady();
    return await writeContractAsync({
      address: registryAddress!,
      abi: VOX_CHAIN_REGISTRY_ABI,
      functionName: 'cancelSuperAdminTransfer',
    });
  };

  return {
    chainId,
    registryAddress,
    isRegistryConfigured,
    superAdminAddress: superAdminAddress as `0x${string}` | undefined,
    pendingSuperAdminAddress: pendingSuperAdminAddress as `0x${string}` | undefined,
    totalOrgCount,
    allOrganisations,
    pendingOrganisations,
    approvedOrganisations,
    rejectedOrganisations,
    revokedOrganisations,
    adminOrganisations,
    isSuperAdmin,
    isPendingSuperAdmin,
    isOrgAdmin,
    userRole,
    isLoading: isSuperAdminLoading || isPendingSuperAdminLoading || isOrgCountLoading || isOrgsLoading,
    refetchAll,
    // Mutations
    requestRegistration,
    approveOrganisation,
    rejectOrganisation,
    replaceOrgAdmin,
    revokeOrgAdmin,
    transferSuperAdmin,
    acceptSuperAdmin,
    cancelSuperAdminTransfer,
    // Tx Status
    txHash,
    isWritePending,
    writeError,
    parsedWriteError: writeError ? parseContractError(writeError) : null,
    resetWrite,
    isConfirming,
    isConfirmed,
    receipt,
    receiptError,
  };
}
