export const VOX_CHAIN_REGISTRY_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AdminAlreadyRevokedError",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "AlreadySuperAdminError",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EmptyDescriptionError",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EmptyMetadataURIError",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EmptyNameError",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EmptyReasonError",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidAdminAddressError",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidOrgIdError",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NoPendingTransferError",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "OnlyPendingSuperAdminError",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "OnlySuperAdminError",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "OrgNotActiveError",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "OrgNotActiveOrRevokedError",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "OrgNotPendingError",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "SameAdminAddressError",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ZeroAddressError",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "orgId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "oldAdmin",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newAdmin",
        "type": "address"
      }
    ],
    "name": "OrganisationAdminReplaced",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "orgId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "oldAdmin",
        "type": "address"
      }
    ],
    "name": "OrganisationAdminRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "orgId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "admin",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "contractAddress",
        "type": "address"
      }
    ],
    "name": "OrganisationApproved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "orgId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "reason",
        "type": "string"
      }
    ],
    "name": "OrganisationRejected",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "orgId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "requester",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "metadataURI",
        "type": "string"
      }
    ],
    "name": "RegistrationRequested",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "currentSuperAdmin",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "pendingSuperAdmin",
        "type": "address"
      }
    ],
    "name": "SuperAdminTransferInitiated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousSuperAdmin",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newSuperAdmin",
        "type": "address"
      }
    ],
    "name": "SuperAdminTransferred",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "acceptSuperAdmin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_orgId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_adminWallet",
        "type": "address"
      }
    ],
    "name": "approveOrganisation",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "cancelSuperAdminTransfer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_orgId",
        "type": "uint256"
      }
    ],
    "name": "getOrganisation",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "metadataURI",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "requester",
            "type": "address"
          },
          {
            "internalType": "enum VoxChainRegistry.RegistrationStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "admin",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "contractAddress",
            "type": "address"
          }
        ],
        "internalType": "struct VoxChainRegistry.Organisation",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "organisationCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "organisations",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "metadataURI",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "requester",
        "type": "address"
      },
      {
        "internalType": "enum VoxChainRegistry.RegistrationStatus",
        "name": "status",
        "type": "uint8"
      },
      {
        "internalType": "address",
        "name": "admin",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "contractAddress",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pendingSuperAdmin",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_orgId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_reason",
        "type": "string"
      }
    ],
    "name": "rejectOrganisation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_orgId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_newAdmin",
        "type": "address"
      }
    ],
    "name": "replaceOrgAdmin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_metadataURI",
        "type": "string"
      }
    ],
    "name": "requestRegistration",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_orgId",
        "type": "uint256"
      }
    ],
    "name": "revokeOrgAdmin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "superAdmin",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_newSuperAdmin",
        "type": "address"
      }
    ],
    "name": "transferSuperAdmin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
