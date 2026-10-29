export enum VoterRequestStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

export interface VoterRegistrationRequest {
  id: string;
  voterAddress: `0x${string}`;
  voterName: string;
  identityInfo?: string;
  justification?: string;
  electionId: number;
  electionName: string;
  contractAddress: `0x${string}`;
  orgName?: string;
  status: VoterRequestStatus;
  createdAt: number;
  reviewedAt?: number;
  reviewedBy?: `0x${string}`;
  rejectionReason?: string;
  approvalTxHash?: `0x${string}`;
}
