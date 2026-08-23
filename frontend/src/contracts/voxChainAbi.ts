export const VOX_CHAIN_ABI = [
  {
    type: 'function',
    name: 'admin',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'electionCount',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getElection',
    inputs: [{ name: '_electionId', type: 'uint256', internalType: 'uint256' }],
    outputs: [
      { name: 'id', type: 'uint256', internalType: 'uint256' },
      { name: 'name', type: 'string', internalType: 'string' },
      { name: 'started', type: 'bool', internalType: 'bool' },
      { name: 'ended', type: 'bool', internalType: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getCandidates',
    inputs: [{ name: '_electionId', type: 'uint256', internalType: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        internalType: 'struct VoxChain.Candidate[]',
        components: [
          { name: 'id', type: 'uint256', internalType: 'uint256' },
          { name: 'name', type: 'string', internalType: 'string' },
          { name: 'voteCount', type: 'uint256', internalType: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'checkEligibility',
    inputs: [
      { name: '_electionId', type: 'uint256', internalType: 'uint256' },
      { name: '_voter', type: 'address', internalType: 'address' },
    ],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'checkHasVoted',
    inputs: [
      { name: '_electionId', type: 'uint256', internalType: 'uint256' },
      { name: '_voter', type: 'address', internalType: 'address' },
    ],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'createElection',
    inputs: [{ name: '_name', type: 'string', internalType: 'string' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'addCandidate',
    inputs: [
      { name: '_electionId', type: 'uint256', internalType: 'uint256' },
      { name: '_name', type: 'string', internalType: 'string' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'registerVoter',
    inputs: [
      { name: '_electionId', type: 'uint256', internalType: 'uint256' },
      { name: '_voter', type: 'address', internalType: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'startElection',
    inputs: [{ name: '_electionId', type: 'uint256', internalType: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'endElection',
    inputs: [{ name: '_electionId', type: 'uint256', internalType: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'castVote',
    inputs: [
      { name: '_electionId', type: 'uint256', internalType: 'uint256' },
      { name: '_candidateId', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getResults',
    inputs: [{ name: '_electionId', type: 'uint256', internalType: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        internalType: 'struct VoxChain.Candidate[]',
        components: [
          { name: 'id', type: 'uint256', internalType: 'uint256' },
          { name: 'name', type: 'string', internalType: 'string' },
          { name: 'voteCount', type: 'uint256', internalType: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  // Events
  {
    type: 'event',
    name: 'ElectionCreated',
    inputs: [
      { name: 'electionId', type: 'uint256', indexed: false },
      { name: 'name', type: 'string', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'CandidateAdded',
    inputs: [
      { name: 'electionId', type: 'uint256', indexed: false },
      { name: 'candidateId', type: 'uint256', indexed: false },
      { name: 'name', type: 'string', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'VoterRegistered',
    inputs: [
      { name: 'electionId', type: 'uint256', indexed: false },
      { name: 'voter', type: 'address', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'ElectionStarted',
    inputs: [{ name: 'electionId', type: 'uint256', indexed: false }],
  },
  {
    type: 'event',
    name: 'ElectionEnded',
    inputs: [{ name: 'electionId', type: 'uint256', indexed: false }],
  },
  {
    type: 'event',
    name: 'VoteCast',
    inputs: [
      { name: 'electionId', type: 'uint256', indexed: false },
      { name: 'candidateId', type: 'uint256', indexed: false },
      { name: 'voter', type: 'address', indexed: false },
    ],
  },
] as const;
