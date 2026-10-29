import { useReadContract, useAccount, useChainId } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { VOX_CHAIN_ABI } from '../contracts/voxChainAbi';
import { getContractAddress, isSupportedChain } from '../contracts/config';
import type { Election, Candidate } from '../types';

export function useElection(electionId?: number, contractAddressOverride?: `0x${string}`) {
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
  const validId = typeof electionId === 'number' && electionId > 0;
  const bigId = validId ? BigInt(electionId) : undefined;

  // Read election details
  const {
    data: rawElection,
    isLoading: isElectionLoading,
    refetch: refetchElection,
    error: electionError,
  } = useReadContract({
    address: activeContractAddress,
    abi: VOX_CHAIN_ABI,
    functionName: 'getElection',
    args: bigId ? [bigId] : undefined,
    chainId,
    query: {
      enabled: Boolean(validId && activeContractAddress),
      staleTime: 5_000,
    },
  });

  // Read candidates
  const {
    data: rawCandidates,
    isLoading: isCandidatesLoading,
    refetch: refetchCandidates,
    error: candidatesError,
  } = useReadContract({
    address: activeContractAddress,
    abi: VOX_CHAIN_ABI,
    functionName: 'getCandidates',
    args: bigId ? [bigId] : undefined,
    chainId,
    query: {
      enabled: Boolean(validId && activeContractAddress),
      staleTime: 5_000,
    },
  });

  // Check voter eligibility
  const {
    data: isEligible,
    isLoading: isEligibilityLoading,
    refetch: refetchEligibility,
  } = useReadContract({
    address: activeContractAddress,
    abi: VOX_CHAIN_ABI,
    functionName: 'checkEligibility',
    args: bigId && address ? [bigId, address] : undefined,
    chainId,
    query: {
      enabled: Boolean(validId && address && activeContractAddress),
      staleTime: 5_000,
    },
  });

  // Check if voter has voted
  const {
    data: hasVoted,
    isLoading: isHasVotedLoading,
    refetch: refetchHasVoted,
  } = useReadContract({
    address: activeContractAddress,
    abi: VOX_CHAIN_ABI,
    functionName: 'checkHasVoted',
    args: bigId && address ? [bigId, address] : undefined,
    chainId,
    query: {
      enabled: Boolean(validId && address && activeContractAddress),
      staleTime: 5_000,
    },
  });

  // Read results if ended
  const isEnded = Boolean(rawElection && rawElection[3]);
  const {
    data: rawResults,
    isLoading: isResultsLoading,
    refetch: refetchResults,
  } = useReadContract({
    address: activeContractAddress,
    abi: VOX_CHAIN_ABI,
    functionName: 'getResults',
    args: bigId ? [bigId] : undefined,
    chainId,
    query: {
      enabled: Boolean(validId && isEnded && activeContractAddress),
      staleTime: 10_000,
    },
  });

  const election: Election | null = rawElection
    ? {
        id: rawElection[0],
        name: rawElection[1],
        started: rawElection[2],
        ended: rawElection[3],
      }
    : null;

  const candidates: Candidate[] = (rawCandidates as Candidate[]) || [];
  const results: Candidate[] = (rawResults as Candidate[]) || candidates;

  const refetchAll = async () => {
    await Promise.all([
      refetchElection(),
      refetchCandidates(),
      refetchEligibility(),
      refetchHasVoted(),
      refetchResults(),
    ]);
  };

  return {
    contractAddress: activeContractAddress,
    election,
    candidates,
    results,
    isEligible: Boolean(isEligible),
    hasVoted: Boolean(hasVoted),
    isLoading: isElectionLoading || isCandidatesLoading,
    isEligibilityLoading,
    isHasVotedLoading,
    isResultsLoading,
    electionError,
    candidatesError,
    refetchAll,
  };
}
