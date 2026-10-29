export enum RegistrationStatus {
  None = 0,
  Pending = 1,
  Approved = 2,
  Rejected = 3,
  Revoked = 4,
}

export interface Organisation {
  id: bigint;
  name: string;
  description: string;
  metadataURI: string;
  requester: `0x${string}`;
  status: RegistrationStatus;
  admin: `0x${string}`;
  contractAddress: `0x${string}`;
}

export type UserPlatformRole = 'superAdmin' | 'orgAdmin' | 'voter' | 'anonymous';
