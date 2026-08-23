export interface Election {
  id: bigint;
  name: string;
  started: boolean;
  ended: boolean;
}

export interface Candidate {
  id: bigint;
  name: string;
  voteCount: bigint;
}

export interface CandidateDisplay {
  id: number;
  name: string;
  voteCount: number;
  bio?: string;
  avatarSeed?: string;
}

export interface VoteReceipt {
  electionId: number;
  electionName: string;
  candidateId: number;
  candidateName: string;
  voterAddress: `0x${string}`;
  transactionHash: `0x${string}`;
  blockNumber?: bigint;
  timestamp: string;
  gasUsed?: bigint;
  effectiveGasPrice?: bigint;
}

export type ElectionFilter = 'all' | 'active' | 'upcoming' | 'concluded';
