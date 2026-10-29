import type { Candidate } from '../types';

export interface CandidateRanking {
  candidate: Candidate;
  count: number;
  percentage: number;
  rank: number;
  isTied: boolean;
  isTopTied: boolean;
}

export interface ElectionOutcome {
  totalVotes: number;
  sortedCandidates: Candidate[];
  topVoteCount: number;
  topCandidates: Candidate[];
  isDraw: boolean;
  hasNoVotes: boolean;
  winner: Candidate | null;
  rankings: CandidateRanking[];
}

/**
 * Computes official election tallies, handles mathematical ties / draws,
 * and eliminates arbitrary tie-breaking where a random candidate wins.
 */
export function computeElectionOutcome(results: Candidate[] = []): ElectionOutcome {
  const totalVotes = results.reduce((acc, c) => acc + Number(c.voteCount || 0n), 0);
  const sortedCandidates = [...results].sort((a, b) => Number(b.voteCount || 0n) - Number(a.voteCount || 0n));

  const topVoteCount = sortedCandidates.length > 0 ? Number(sortedCandidates[0].voteCount || 0n) : 0;
  const topCandidates = sortedCandidates.filter(
    (c) => Number(c.voteCount || 0n) === topVoteCount
  );

  const hasNoVotes = totalVotes === 0;
  // A draw occurs when votes were cast and more than one candidate shares the highest vote count
  const isDraw = !hasNoVotes && topCandidates.length > 1;
  // A winner is only certified if there is no draw, votes exist, and candidate is present
  const winner = !isDraw && !hasNoVotes && sortedCandidates.length > 0 ? sortedCandidates[0] : null;

  const rankings: CandidateRanking[] = sortedCandidates.map((candidate) => {
    const count = Number(candidate.voteCount || 0n);
    const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
    // Standard competition ranking (1224 ranking)
    const rank = sortedCandidates.filter((c) => Number(c.voteCount || 0n) > count).length + 1;
    const isTied = sortedCandidates.filter((c) => Number(c.voteCount || 0n) === count).length > 1;
    const isTopTied = isDraw && count === topVoteCount;

    return {
      candidate,
      count,
      percentage,
      rank,
      isTied,
      isTopTied,
    };
  });

  return {
    totalVotes,
    sortedCandidates,
    topVoteCount,
    topCandidates,
    isDraw,
    hasNoVotes,
    winner,
    rankings,
  };
}

/**
 * Builds a clean, correctly-encoded URL for creating a runoff election.
 * Strips previous runoff markers and properly separates query parameters with `&`.
 */
export function buildReElectionUrl(electionName: string, contractAddress?: `0x${string}`): string {
  const cleanBase = electionName
    .replace(/\s*\(Runoff.*?\)/gi, '')
    .split(/\?|&/)[0]
    .trim();
  const runoffTitle = `${cleanBase} (Runoff Re-election)`;

  const params = new URLSearchParams();
  params.set('name', runoffTitle);
  if (contractAddress) {
    params.set('contract', contractAddress);
  }

  return `/admin/create-election?${params.toString()}`;
}

