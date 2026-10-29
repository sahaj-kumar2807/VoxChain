import { VoterRegistrationRequest, VoterRequestStatus } from '../types/voterRequest';

const STORAGE_KEY = 'voxchain_voter_registration_requests_v1';
const BROADCAST_CHANNEL_NAME = 'voxchain_voter_requests_channel';

// Default initial seed requests for demo and immediate testing
const INITIAL_SEED_REQUESTS: VoterRegistrationRequest[] = [
  {
    id: 'vr-1718000001',
    voterAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    voterName: 'Alex Mercer',
    identityInfo: 'ID: GOV-89412 · Faculty of Law',
    justification: 'Registered delegate requesting voting credentials for General Governance Assembly.',
    electionId: 1,
    electionName: 'Platform Governance & Constitution Ballot',
    contractAddress: '0x9ecd0c8cb4aE359EB05B955F9331f5d324b7E025',
    orgName: 'Platform Global',
    status: VoterRequestStatus.Pending,
    createdAt: Date.now() - 3600000 * 2, // 2 hours ago
  },
  {
    id: 'vr-1718000002',
    voterAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    voterName: 'Sophia Chen',
    identityInfo: 'Student ID: STU-55209',
    justification: 'First-time student voter requesting credential authorization for Election #1.',
    electionId: 1,
    electionName: 'Platform Governance & Constitution Ballot',
    contractAddress: '0x9ecd0c8cb4aE359EB05B955F9331f5d324b7E025',
    orgName: 'Platform Global',
    status: VoterRequestStatus.Pending,
    createdAt: Date.now() - 3600000 * 5, // 5 hours ago
  },
  {
    id: 'vr-1718000003',
    voterAddress: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    voterName: 'Marcus Vance',
    identityInfo: 'Employee ID: EMP-1033',
    justification: 'Executive council voter enrollment request.',
    electionId: 1,
    electionName: 'Platform Governance & Constitution Ballot',
    contractAddress: '0x9ecd0c8cb4aE359EB05B955F9331f5d324b7E025',
    orgName: 'Platform Global',
    status: VoterRequestStatus.Pending,
    createdAt: Date.now() - 3600000 * 24, // 1 day ago
  },
];

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      return new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    } catch {
      return null;
    }
  }
  return null;
}

export function getVoterRequests(): VoterRegistrationRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Initialize with seed requests
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_REQUESTS));
      return INITIAL_SEED_REQUESTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read voter requests from storage:', err);
    return [];
  }
}

export function saveAllVoterRequests(requests: VoterRegistrationRequest[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    const channel = getBroadcastChannel();
    if (channel) {
      channel.postMessage({ type: 'SYNC_VOTER_REQUESTS' });
      channel.close();
    }
    // Also dispatch custom window event for same-tab updates
    window.dispatchEvent(new Event('voxchain_voter_requests_updated'));
  } catch (err) {
    console.error('Failed to save voter requests to storage:', err);
  }
}

export function submitVoterRequest(
  data: Omit<VoterRegistrationRequest, 'id' | 'createdAt' | 'status'>
): VoterRegistrationRequest {
  const current = getVoterRequests();

  // Check if there is an existing pending request for this voter + election + contract
  const existingIndex = current.findIndex(
    (r) =>
      r.voterAddress.toLowerCase() === data.voterAddress.toLowerCase() &&
      r.electionId === data.electionId &&
      r.contractAddress.toLowerCase() === data.contractAddress.toLowerCase() &&
      r.status === VoterRequestStatus.Pending
  );

  const newRequest: VoterRegistrationRequest = {
    ...data,
    id: `vr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    status: VoterRequestStatus.Pending,
    createdAt: Date.now(),
  };

  if (existingIndex >= 0) {
    // Update existing pending request
    current[existingIndex] = newRequest;
  } else {
    current.unshift(newRequest);
  }

  saveAllVoterRequests(current);
  return newRequest;
}

export function approveVoterRequest(
  id: string,
  txHash?: `0x${string}`,
  adminAddress?: `0x${string}`
): VoterRegistrationRequest | null {
  const current = getVoterRequests();
  const index = current.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const updated: VoterRegistrationRequest = {
    ...current[index],
    status: VoterRequestStatus.Approved,
    reviewedAt: Date.now(),
    reviewedBy: adminAddress,
    approvalTxHash: txHash,
  };

  current[index] = updated;
  saveAllVoterRequests(current);
  return updated;
}

export function rejectVoterRequest(
  id: string,
  reason: string,
  adminAddress?: `0x${string}`
): VoterRegistrationRequest | null {
  const current = getVoterRequests();
  const index = current.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const updated: VoterRegistrationRequest = {
    ...current[index],
    status: VoterRequestStatus.Rejected,
    reviewedAt: Date.now(),
    reviewedBy: adminAddress,
    rejectionReason: reason,
  };

  current[index] = updated;
  saveAllVoterRequests(current);
  return updated;
}

export function deleteVoterRequest(id: string): void {
  const current = getVoterRequests();
  const filtered = current.filter((r) => r.id !== id);
  saveAllVoterRequests(filtered);
}

export function subscribeVoterRequests(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback();
    }
  };

  const handleCustom = () => callback();

  window.addEventListener('storage', handleStorage);
  window.addEventListener('voxchain_voter_requests_updated', handleCustom);

  let channel: BroadcastChannel | null = null;
  if ('BroadcastChannel' in window) {
    try {
      channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channel.onmessage = () => callback();
    } catch {
      channel = null;
    }
  }

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener('voxchain_voter_requests_updated', handleCustom);
    if (channel) {
      channel.close();
    }
  };
}
