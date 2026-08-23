import { useReadContract, useAccount } from 'wagmi';
import { VOX_CHAIN_ABI } from '../contracts/voxChainAbi';
import { DEFAULT_CONTRACT_ADDRESS } from '../contracts/config';
import type { Election, Candidate } from '../types';

export function useElection(electionId?: number) {
  const { address } = useAccount();
  const validId = typeof electionId === 'number' && electionId > 0;
  const bigId = validId ? BigInt(electionId) : undefined;

  // Read election details
  const {
    data: rawElection,
    isLoading: isElectionLoading,
    refetch: refetchElection,
    error: electionError,
  } = useReadContract({
    address: DEFAULT_CONTRACT_ADDRESS,
    abi: VOX_CHAIN_ABI,
    functionName: 'getElection',
    args: bigId ? [bigId] : undefined,
    query: {
      enabled: validId,
    },
  });

  // Read candidates
  const {
    data: rawCandidates,
    isLoading: isCandidatesLoading,
    refetch: refetchCandidates,
    error: candidatesError,
  } = useReadContract({
    address: DEFAULT_CONTRACT_ADDRESS,
    abi: VOX_CHAIN_ABI,
    functionName: 'getCandidates',
    args: bigId ? [bigId] : undefined,
    query: {
      enabled: validId,
    },
  });

  // Check voter eligibility
  const {
    data: isEligible,
    isLoading: isEligibilityLoading,
    refetch: refetchEligibility,
  } = useReadContract({
    address: DEFAULT_CONTRACT_ADDRESS,
    abi: VOX_CHAIN_ABI,
    functionName: 'checkEligibility',
    args: bigId && address ? [bigId, address] : undefined,
    query: {
      enabled: Boolean(validId && address),
    },
  });

  // Check if voter has voted
  const {
    data: hasVoted,
    isLoading: isHasVotedLoading,
    refetch: refetchHasVoted,
  } = useReadContract({
    address: DEFAULT_CONTRACT_ADDRESS,
    abi: VOX_CHAIN_ABI,
    functionName: 'checkHasVoted',
    args: bigId && address ? [bigId, address] : undefined,
    query: {
      enabled: Boolean(validId && address),
    },
  });

  // Read results if ended
  const isEnded = Boolean(rawElection && rawElection[3]);
  const {
    data: rawResults,
    isLoading: isResultsLoading,
    refetch: refetchResults,
  } = useReadContract({
    address: DEFAULT_CONTRACT_ADDRESS,
    abi: VOX_CHAIN_ABI,
    functionName: 'getResults',
    args: bigId ? [bigId] : undefined,
    query: {
      enabled: Boolean(validId && isEnded),
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
