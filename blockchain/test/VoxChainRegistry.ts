import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("VoxChainRegistry & Multi-Organisation Governance", async () => {
    const { viem } = await network.connect();
    const publicClient = await viem.getPublicClient();
    const [
        superAdmin,
        newSuperAdmin,
        orgAdminA,
        orgAdminB,
        voter1,
        voter2,
        unauthorizedUser
    ] = await viem.getWalletClients();

    const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

    const deployRegistry = async () => {
        return await viem.deployContract("VoxChainRegistry");
    };

    it("should deploy with the deployer as initial Super Admin", async () => {
        const registry = await deployRegistry();
        const currentSuperAdmin = await publicClient.readContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "superAdmin",
        });

        assert.equal(
            currentSuperAdmin.toLowerCase(),
            superAdmin.account.address.toLowerCase()
        );
    });

    it("should handle safe two-step Super Admin transfer", async () => {
        const registry = await deployRegistry();

        // 1. Non-superAdmin cannot initiate transfer
        await assert.rejects(
            unauthorizedUser.writeContract({
                address: registry.address,
                abi: registry.abi,
                functionName: "transferSuperAdmin",
                args: [newSuperAdmin.account.address],
            }),
            /OnlySuperAdminError/
        );

        // 2. Reject zero address
        await assert.rejects(
            superAdmin.writeContract({
                address: registry.address,
                abi: registry.abi,
                functionName: "transferSuperAdmin",
                args: [ZERO_ADDRESS],
            }),
            /ZeroAddressError/
        );

        // 3. Reject transfer to self
        await assert.rejects(
            superAdmin.writeContract({
                address: registry.address,
                abi: registry.abi,
                functionName: "transferSuperAdmin",
                args: [superAdmin.account.address],
            }),
            /AlreadySuperAdminError/
        );

        // 4. Initiate valid transfer
        await superAdmin.writeContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "transferSuperAdmin",
            args: [newSuperAdmin.account.address],
        });

        const pending = await publicClient.readContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "pendingSuperAdmin",
        });
        assert.equal(pending.toLowerCase(), newSuperAdmin.account.address.toLowerCase());

        // 5. Unauthorized caller cannot accept
        await assert.rejects(
            unauthorizedUser.writeContract({
                address: registry.address,
                abi: registry.abi,
                functionName: "acceptSuperAdmin",
            }),
            /OnlyPendingSuperAdminError/
        );

        // 6. Pending admin accepts transfer
        await newSuperAdmin.writeContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "acceptSuperAdmin",
        });

        const updatedSuperAdmin = await publicClient.readContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "superAdmin",
        });
        const clearedPending = await publicClient.readContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "pendingSuperAdmin",
        });

        assert.equal(updatedSuperAdmin.toLowerCase(), newSuperAdmin.account.address.toLowerCase());
        assert.equal(clearedPending, ZERO_ADDRESS);
    });

    it("should allow Super Admin to cancel a pending transfer", async () => {
        const registry = await deployRegistry();

        await superAdmin.writeContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "transferSuperAdmin",
            args: [newSuperAdmin.account.address],
        });

        await superAdmin.writeContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "cancelSuperAdminTransfer",
        });

        const pending = await publicClient.readContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "pendingSuperAdmin",
        });
        assert.equal(pending, ZERO_ADDRESS);
    });

    it("should validate organisation registration requests and reject invalid inputs", async () => {
        const registry = await deployRegistry();

        // Empty name
        await assert.rejects(
            unauthorizedUser.writeContract({
                address: registry.address,
                abi: registry.abi,
                functionName: "requestRegistration",
                args: ["", "Description", "ipfs://meta"],
            }),
            /EmptyNameError/
        );

        // Empty description
        await assert.rejects(
            unauthorizedUser.writeContract({
                address: registry.address,
                abi: registry.abi,
                functionName: "requestRegistration",
                args: ["Org Name", "", "ipfs://meta"],
            }),
            /EmptyDescriptionError/
        );

        // Empty metadataURI
        await assert.rejects(
            unauthorizedUser.writeContract({
                address: registry.address,
                abi: registry.abi,
                functionName: "requestRegistration",
                args: ["Org Name", "Description", ""],
            }),
            /EmptyMetadataURIError/
        );

        // Valid registration request
        await unauthorizedUser.writeContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "requestRegistration",
            args: ["Acme Corp", "Shareholder governance", "ipfs://acme-metadata"],
        });

        const orgCount = await publicClient.readContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "organisationCount",
        });
        assert.equal(orgCount, 1n);

        const org = await publicClient.readContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "getOrganisation",
            args: [1n],
        });

        assert.equal(org.id, 1n);
        assert.equal(org.name, "Acme Corp");
        assert.equal(org.description, "Shareholder governance");
        assert.equal(org.metadataURI, "ipfs://acme-metadata");
        assert.equal(org.requester.toLowerCase(), unauthorizedUser.account.address.toLowerCase());
        assert.equal(org.status, 1); // 1 = Pending
        assert.equal(org.admin, ZERO_ADDRESS);
        assert.equal(org.contractAddress, ZERO_ADDRESS);
    });

    it("should allow Super Admin to approve registration and deploy isolated VoxChain contract", async () => {
        const registry = await deployRegistry();

        await unauthorizedUser.writeContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "requestRegistration",
            args: ["Alpha DAO", "DAO Governance", "ipfs://alpha"],
        });

        // Non-superAdmin cannot approve
        await assert.rejects(
            unauthorizedUser.writeContract({
                address: registry.address,
                abi: registry.abi,
                functionName: "approveOrganisation",
                args: [1n, orgAdminA.account.address],
            }),
            /OnlySuperAdminError/
        );

        // Reject zero admin address
        await assert.rejects(
            superAdmin.writeContract({
                address: registry.address,
                abi: registry.abi,
                functionName: "approveOrganisation",
                args: [1n, ZERO_ADDRESS],
            }),
            /InvalidAdminAddressError/
        );

        // Valid approval by Super Admin
        await superAdmin.writeContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "approveOrganisation",
            args: [1n, orgAdminA.account.address],
        });

        const org = await publicClient.readContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "getOrganisation",
            args: [1n],
        });

        assert.equal(org.status, 2); // 2 = Approved
        assert.equal(org.admin.toLowerCase(), orgAdminA.account.address.toLowerCase());
        assert.notEqual(org.contractAddress, ZERO_ADDRESS);

        // Verify child contract state
        const childContractAbi = (await viem.getContractAt("VoxChain", org.contractAddress)).abi;
        const childAdmin = await publicClient.readContract({
            address: org.contractAddress,
            abi: childContractAbi,
            functionName: "admin",
        });
        const childRegistry = await publicClient.readContract({
            address: org.contractAddress,
            abi: childContractAbi,
            functionName: "registry",
        });
        const childOrgId = await publicClient.readContract({
            address: org.contractAddress,
            abi: childContractAbi,
            functionName: "orgId",
        });
        const childOrgName = await publicClient.readContract({
            address: org.contractAddress,
            abi: childContractAbi,
            functionName: "orgName",
        });

        assert.equal(childAdmin.toLowerCase(), orgAdminA.account.address.toLowerCase());
        assert.equal(childRegistry.toLowerCase(), registry.address.toLowerCase());
        assert.equal(childOrgId, 1n);
        assert.equal(childOrgName, "Alpha DAO");
    });

    it("should allow Super Admin to reject organisation requests with a reason", async () => {
        const registry = await deployRegistry();

        await unauthorizedUser.writeContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "requestRegistration",
            args: ["Fraud Corp", "Invalid entity", "ipfs://fraud"],
        });

        // Non-superAdmin cannot reject
        await assert.rejects(
            unauthorizedUser.writeContract({
                address: registry.address,
                abi: registry.abi,
                functionName: "rejectOrganisation",
                args: [1n, "Non-compliant entity"],
            }),
            /OnlySuperAdminError/
        );

        // Empty reason rejected
        await assert.rejects(
            superAdmin.writeContract({
                address: registry.address,
                abi: registry.abi,
                functionName: "rejectOrganisation",
                args: [1n, ""],
            }),
            /EmptyReasonError/
        );

        // Super Admin rejects
        await superAdmin.writeContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "rejectOrganisation",
            args: [1n, "Failed verification standards"],
        });

        const org = await publicClient.readContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "getOrganisation",
            args: [1n],
        });

        assert.equal(org.status, 3); // 3 = Rejected
    });

    it("should enforce child contract authentication on setAdmin and reject unauthorized direct calls", async () => {
        const registry = await deployRegistry();

        await unauthorizedUser.writeContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "requestRegistration",
            args: ["Direct Call Test Org", "Test", "ipfs://direct"],
        });

        await superAdmin.writeContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "approveOrganisation",
            args: [1n, orgAdminA.account.address],
        });

        const org = await publicClient.readContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "getOrganisation",
            args: [1n],
        });

        const childContract = await viem.getContractAt("VoxChain", org.contractAddress);

        // Attacker directly calling setAdmin on child contract must revert
        await assert.rejects(
            unauthorizedUser.writeContract({
                address: childContract.address,
                abi: childContract.abi,
                functionName: "setAdmin",
                args: [unauthorizedUser.account.address],
            }),
            /Only registry can update admin/
        );
    });

    it("should allow Super Admin to replace and revoke organisation administrators atomically", async () => {
        const registry = await deployRegistry();

        await unauthorizedUser.writeContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "requestRegistration",
            args: ["Beta Corp", "Enterprise Governance", "ipfs://beta"],
        });

        await superAdmin.writeContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "approveOrganisation",
            args: [1n, orgAdminA.account.address],
        });

        const org = await publicClient.readContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "getOrganisation",
            args: [1n],
        });

        const childContract = await viem.getContractAt("VoxChain", org.contractAddress);

        // Replace admin with orgAdminB
        await superAdmin.writeContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "replaceOrgAdmin",
            args: [1n, orgAdminB.account.address],
        });

        const updatedAdminChild = await publicClient.readContract({
            address: childContract.address,
            abi: childContract.abi,
            functionName: "admin",
        });
        assert.equal(updatedAdminChild.toLowerCase(), orgAdminB.account.address.toLowerCase());

        // Revoke admin
        await superAdmin.writeContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "revokeOrgAdmin",
            args: [1n],
        });

        const revokedOrg = await publicClient.readContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "getOrganisation",
            args: [1n],
        });
        assert.equal(revokedOrg.status, 4); // 4 = Revoked
        assert.equal(revokedOrg.admin, ZERO_ADDRESS);

        const revokedChildAdmin = await publicClient.readContract({
            address: childContract.address,
            abi: childContract.abi,
            functionName: "admin",
        });
        assert.equal(revokedChildAdmin, ZERO_ADDRESS);

        // While admin is revoked, administrative operations are frozen
        await assert.rejects(
            orgAdminB.writeContract({
                address: childContract.address,
                abi: childContract.abi,
                functionName: "createElection",
                args: ["Frozen Election"],
            }),
            /Only admin can create an election/
        );

        // Restoration: Assign a new admin
        await superAdmin.writeContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "replaceOrgAdmin",
            args: [1n, orgAdminA.account.address],
        });

        const restoredOrg = await publicClient.readContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "getOrganisation",
            args: [1n],
        });
        assert.equal(restoredOrg.status, 2); // 2 = Approved
        assert.equal(restoredOrg.admin.toLowerCase(), orgAdminA.account.address.toLowerCase());

        // Restored admin can create elections
        await orgAdminA.writeContract({
            address: childContract.address,
            abi: childContract.abi,
            functionName: "createElection",
            args: ["Restored Election"],
        });

        const count = await publicClient.readContract({
            address: childContract.address,
            abi: childContract.abi,
            functionName: "electionCount",
        });
        assert.equal(count, 1n);
    });

    it("should prevent Organisation A admin from managing Organisation B elections", async () => {
        const registry = await deployRegistry();

        // Register Org A
        await unauthorizedUser.writeContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "requestRegistration",
            args: ["Org A", "First Org", "ipfs://orga"],
        });
        await superAdmin.writeContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "approveOrganisation",
            args: [1n, orgAdminA.account.address],
        });

        // Register Org B
        await unauthorizedUser.writeContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "requestRegistration",
            args: ["Org B", "Second Org", "ipfs://orgb"],
        });
        await superAdmin.writeContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "approveOrganisation",
            args: [2n, orgAdminB.account.address],
        });

        const orgA = await publicClient.readContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "getOrganisation",
            args: [1n],
        });
        const orgB = await publicClient.readContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "getOrganisation",
            args: [2n],
        });

        const childA = await viem.getContractAt("VoxChain", orgA.contractAddress);
        const childB = await viem.getContractAt("VoxChain", orgB.contractAddress);

        // OrgAdminA creates election in Org A -> succeeds
        await orgAdminA.writeContract({
            address: childA.address,
            abi: childA.abi,
            functionName: "createElection",
            args: ["Org A Election"],
        });

        // OrgAdminA attempts to create election in Org B -> must revert
        await assert.rejects(
            orgAdminA.writeContract({
                address: childB.address,
                abi: childB.abi,
                functionName: "createElection",
                args: ["Malicious Org B Election"],
            }),
            /Only admin can create an election/
        );

        // OrgAdminB attempts to add candidate in Org A -> must revert
        await assert.rejects(
            orgAdminB.writeContract({
                address: childA.address,
                abi: childA.abi,
                functionName: "addCandidate",
                args: [1n, "Unauthorized Candidate"],
            }),
            /Only admin can add candidates/
        );
    });

    it("should prevent organisation admins from escalating to Super Admin", async () => {
        const registry = await deployRegistry();

        await unauthorizedUser.writeContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "requestRegistration",
            args: ["Org A", "Desc", "ipfs://a"],
        });
        await superAdmin.writeContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "approveOrganisation",
            args: [1n, orgAdminA.account.address],
        });

        // OrgAdminA cannot transfer superAdmin
        await assert.rejects(
            orgAdminA.writeContract({
                address: registry.address,
                abi: registry.abi,
                functionName: "transferSuperAdmin",
                args: [orgAdminA.account.address],
            }),
            /OnlySuperAdminError/
        );

        // OrgAdminA cannot approve an organisation
        await assert.rejects(
            orgAdminA.writeContract({
                address: registry.address,
                abi: registry.abi,
                functionName: "approveOrganisation",
                args: [1n, orgAdminA.account.address],
            }),
            /OnlySuperAdminError/
        );

        // OrgAdminA cannot revoke an organisation admin
        await assert.rejects(
            orgAdminA.writeContract({
                address: registry.address,
                abi: registry.abi,
                functionName: "revokeOrgAdmin",
                args: [1n],
            }),
            /OnlySuperAdminError/
        );
    });

    it("should enforce independent voter eligibility across organisations", async () => {
        const registry = await deployRegistry();

        // Org A and Org B
        await unauthorizedUser.writeContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "requestRegistration",
            args: ["Org A", "Desc", "ipfs://a"],
        });
        await superAdmin.writeContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "approveOrganisation",
            args: [1n, orgAdminA.account.address],
        });

        await unauthorizedUser.writeContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "requestRegistration",
            args: ["Org B", "Desc", "ipfs://b"],
        });
        await superAdmin.writeContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "approveOrganisation",
            args: [2n, orgAdminB.account.address],
        });

        const orgA = await publicClient.readContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "getOrganisation",
            args: [1n],
        });
        const orgB = await publicClient.readContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "getOrganisation",
            args: [2n],
        });

        const childA = await viem.getContractAt("VoxChain", orgA.contractAddress);
        const childB = await viem.getContractAt("VoxChain", orgB.contractAddress);

        // Setup Org A Election
        await orgAdminA.writeContract({
            address: childA.address,
            abi: childA.abi,
            functionName: "createElection",
            args: ["Org A General"],
        });
        await orgAdminA.writeContract({
            address: childA.address,
            abi: childA.abi,
            functionName: "addCandidate",
            args: [1n, "Candidate A1"],
        });
        await orgAdminA.writeContract({
            address: childA.address,
            abi: childA.abi,
            functionName: "registerVoter",
            args: [1n, voter1.account.address],
        });
        await orgAdminA.writeContract({
            address: childA.address,
            abi: childA.abi,
            functionName: "startElection",
            args: [1n],
        });

        // Setup Org B Election
        await orgAdminB.writeContract({
            address: childB.address,
            abi: childB.abi,
            functionName: "createElection",
            args: ["Org B General"],
        });
        await orgAdminB.writeContract({
            address: childB.address,
            abi: childB.abi,
            functionName: "addCandidate",
            args: [1n, "Candidate B1"],
        });
        // Note: voter1 is NOT registered in Org B
        await orgAdminB.writeContract({
            address: childB.address,
            abi: childB.abi,
            functionName: "startElection",
            args: [1n],
        });

        // Voter 1 can vote in Org A
        await voter1.writeContract({
            address: childA.address,
            abi: childA.abi,
            functionName: "castVote",
            args: [1n, 1n],
        });
        const hasVotedA = await publicClient.readContract({
            address: childA.address,
            abi: childA.abi,
            functionName: "checkHasVoted",
            args: [1n, voter1.account.address],
        });
        assert.equal(hasVotedA, true);

        // Voter 1 attempts to vote in Org B -> must revert
        await assert.rejects(
            voter1.writeContract({
                address: childB.address,
                abi: childB.abi,
                functionName: "castVote",
                args: [1n, 1n],
            }),
            /Voter is not registered/
        );
    });

    it("should allow ongoing election voting to continue even if administrator is revoked", async () => {
        const registry = await deployRegistry();

        await unauthorizedUser.writeContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "requestRegistration",
            args: ["Continuity Corp", "Desc", "ipfs://continuity"],
        });
        await superAdmin.writeContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "approveOrganisation",
            args: [1n, orgAdminA.account.address],
        });

        const org = await publicClient.readContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "getOrganisation",
            args: [1n],
        });
        const child = await viem.getContractAt("VoxChain", org.contractAddress);

        // Admin prepares and starts election
        await orgAdminA.writeContract({
            address: child.address,
            abi: child.abi,
            functionName: "createElection",
            args: ["Board of Directors"],
        });
        await orgAdminA.writeContract({
            address: child.address,
            abi: child.abi,
            functionName: "addCandidate",
            args: [1n, "Alice"],
        });
        await orgAdminA.writeContract({
            address: child.address,
            abi: child.abi,
            functionName: "addCandidate",
            args: [1n, "Bob"],
        });
        await orgAdminA.writeContract({
            address: child.address,
            abi: child.abi,
            functionName: "registerVoter",
            args: [1n, voter1.account.address],
        });
        await orgAdminA.writeContract({
            address: child.address,
            abi: child.abi,
            functionName: "registerVoter",
            args: [1n, voter2.account.address],
        });
        await orgAdminA.writeContract({
            address: child.address,
            abi: child.abi,
            functionName: "startElection",
            args: [1n],
        });

        // Super Admin revokes administrator during active voting
        await superAdmin.writeContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "revokeOrgAdmin",
            args: [1n],
        });

        // Registered voters can STILL cast votes during admin revocation
        await voter1.writeContract({
            address: child.address,
            abi: child.abi,
            functionName: "castVote",
            args: [1n, 1n],
        });

        await voter2.writeContract({
            address: child.address,
            abi: child.abi,
            functionName: "castVote",
            args: [1n, 2n],
        });

        const candidates = await publicClient.readContract({
            address: child.address,
            abi: child.abi,
            functionName: "getCandidates",
            args: [1n],
        });
        assert.equal(candidates[0].voteCount, 1n);
        assert.equal(candidates[1].voteCount, 1n);

        // Revoked admin cannot end the election
        await assert.rejects(
            orgAdminA.writeContract({
                address: child.address,
                abi: child.abi,
                functionName: "endElection",
                args: [1n],
            }),
            /Only admin can end election/
        );

        // Super Admin assigns replacement administrator
        await superAdmin.writeContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "replaceOrgAdmin",
            args: [1n, orgAdminB.account.address],
        });

        // Replacement administrator can end the election
        await orgAdminB.writeContract({
            address: child.address,
            abi: child.abi,
            functionName: "endElection",
            args: [1n],
        });

        const results = await publicClient.readContract({
            address: child.address,
            abi: child.abi,
            functionName: "getResults",
            args: [1n],
        });
        assert.equal(results[0].voteCount, 1n);
        assert.equal(results[1].voteCount, 1n);
    });

    it("should support multiple concurrent elections within the same organisation contract", async () => {
        const registry = await deployRegistry();

        await unauthorizedUser.writeContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "requestRegistration",
            args: ["Multi Election Corp", "Multiple Elections", "ipfs://multi"],
        });
        await superAdmin.writeContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "approveOrganisation",
            args: [1n, orgAdminA.account.address],
        });

        const org = await publicClient.readContract({
            address: registry.address,
            abi: registry.abi,
            functionName: "getOrganisation",
            args: [1n],
        });
        const child = await viem.getContractAt("VoxChain", org.contractAddress);

        // Create Election 1
        await orgAdminA.writeContract({
            address: child.address,
            abi: child.abi,
            functionName: "createElection",
            args: ["Election 1: Board"],
        });

        // Create Election 2
        await orgAdminA.writeContract({
            address: child.address,
            abi: child.abi,
            functionName: "createElection",
            args: ["Election 2: Compensation"],
        });

        const count = await publicClient.readContract({
            address: child.address,
            abi: child.abi,
            functionName: "electionCount",
        });
        assert.equal(count, 2n);

        // Setup Election 1
        await orgAdminA.writeContract({
            address: child.address,
            abi: child.abi,
            functionName: "addCandidate",
            args: [1n, "Candidate 1A"],
        });
        await orgAdminA.writeContract({
            address: child.address,
            abi: child.abi,
            functionName: "registerVoter",
            args: [1n, voter1.account.address],
        });
        await orgAdminA.writeContract({
            address: child.address,
            abi: child.abi,
            functionName: "startElection",
            args: [1n],
        });

        // Setup Election 2
        await orgAdminA.writeContract({
            address: child.address,
            abi: child.abi,
            functionName: "addCandidate",
            args: [2n, "Candidate 2A"],
        });
        await orgAdminA.writeContract({
            address: child.address,
            abi: child.abi,
            functionName: "registerVoter",
            args: [2n, voter2.account.address],
        });
        await orgAdminA.writeContract({
            address: child.address,
            abi: child.abi,
            functionName: "startElection",
            args: [2n],
        });

        // Voter 1 votes in Election 1
        await voter1.writeContract({
            address: child.address,
            abi: child.abi,
            functionName: "castVote",
            args: [1n, 1n],
        });

        // Voter 2 votes in Election 2
        await voter2.writeContract({
            address: child.address,
            abi: child.abi,
            functionName: "castVote",
            args: [2n, 1n],
        });

        const voted1 = await publicClient.readContract({
            address: child.address,
            abi: child.abi,
            functionName: "checkHasVoted",
            args: [1n, voter1.account.address],
        });
        const voted2 = await publicClient.readContract({
            address: child.address,
            abi: child.abi,
            functionName: "checkHasVoted",
            args: [2n, voter2.account.address],
        });

        assert.equal(voted1, true);
        assert.equal(voted2, true);
    });
});
