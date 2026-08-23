import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("VoxChain", async () => {

    const { viem } = await network.connect();

    const publicClient = await viem.getPublicClient();
    const [admin, voter1, voter2] = await viem.getWalletClients();

    it("should deploy with the correct admin", async () => {
        const contract = await viem.deployContract("VoxChain");

        const storedAdmin = await publicClient.readContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "admin",
        });

        assert.equal(
            storedAdmin.toLowerCase(),
            admin.account.address.toLowerCase()
        );
    });

    it("admin should be able to create an election", async () => {
        const contract = await viem.deployContract("VoxChain");

        await admin.writeContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "createElection",
            args: ["VoxChain College Election"],
        });

        const election = await publicClient.readContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "getElection",
            args: [1n],
        });

        assert.equal(election[0], 1n);
        assert.equal(election[1], "VoxChain College Election");
        assert.equal(election[2], false);
        assert.equal(election[3], false);
    });

    it("admin should be able to add candidates", async () => {
        const contract = await viem.deployContract("VoxChain");

        await admin.writeContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "createElection",
            args: ["College Election"],
        });

        await admin.writeContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "addCandidate",
            args: [1n, "Rahul"],
        });

        await admin.writeContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "addCandidate",
            args: [1n, "Aman"],
        });

        const candidates = await publicClient.readContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "getCandidates",
            args: [1n],
        });

        assert.equal(candidates.length, 2);
        assert.equal(candidates[0].name, "Rahul");
        assert.equal(candidates[1].name, "Aman");
        assert.equal(candidates[0].voteCount, 0n);
        assert.equal(candidates[1].voteCount, 0n);
    });

    it("admin should be able to register voters", async () => {
        const contract = await viem.deployContract("VoxChain");

        await admin.writeContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "createElection",
            args: ["College Election"],
        });

        await admin.writeContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "registerVoter",
            args: [1n, voter1.account.address],
        });

        const registered = await publicClient.readContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "checkEligibility",
            args: [1n, voter1.account.address],
        });

        assert.equal(registered, true);
    });

    it("registered voter should be able to vote", async () => {
        const contract = await viem.deployContract("VoxChain");

        await admin.writeContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "createElection",
            args: ["College Election"],
        });

        await admin.writeContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "addCandidate",
            args: [1n, "Rahul"],
        });

        await admin.writeContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "addCandidate",
            args: [1n, "Aman"],
        });

        await admin.writeContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "registerVoter",
            args: [1n, voter1.account.address],
        });

        await admin.writeContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "startElection",
            args: [1n],
        });

        await voter1.writeContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "castVote",
            args: [1n, 2n],
        });

        const candidates = await publicClient.readContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "getCandidates",
            args: [1n],
        });

        assert.equal(candidates[0].voteCount, 0n);
        assert.equal(candidates[1].voteCount, 1n);

        const voted = await publicClient.readContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "checkHasVoted",
            args: [1n, voter1.account.address],
        });

        assert.equal(voted, true);
    });
    it("should reject an unregistered voter", async () => {
        const contract = await viem.deployContract("VoxChain");

        await admin.writeContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "createElection",
            args: ["College Election"],
        });

        await admin.writeContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "addCandidate",
            args: [1n, "Rahul"],
        });

        await admin.writeContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "startElection",
            args: [1n],
        });

        await assert.rejects(
            voter1.writeContract({
                address: contract.address,
                abi: contract.abi,
                functionName: "castVote",
                args: [1n, 1n],
            }),
            /Voter is not registered/
        );
    });
    it("should reject a voter who tries to vote twice", async () => {
        const contract = await viem.deployContract("VoxChain");

        await admin.writeContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "createElection",
            args: ["College Election"],
        });

        await admin.writeContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "addCandidate",
            args: [1n, "Rahul"],
        });

        await admin.writeContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "addCandidate",
            args: [1n, "Aman"],
        });

        await admin.writeContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "registerVoter",
            args: [1n, voter1.account.address],
        });

        await admin.writeContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "startElection",
            args: [1n],
        });

        // First vote should succeed
        await voter1.writeContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "castVote",
            args: [1n, 1n],
        });

        // Second vote should fail
        await assert.rejects(
            voter1.writeContract({
                address: contract.address,
                abi: contract.abi,
                functionName: "castVote",
                args: [1n, 2n],
            }),
            /Voter has already voted/
        );
    });
    it("should reject a non-admin from creating an election", async () => {
        const contract = await viem.deployContract("VoxChain");

        await assert.rejects(
            voter1.writeContract({
                address: contract.address,
                abi: contract.abi,
                functionName: "createElection",
                args: ["Unauthorized Election"],
            }),
            /Only admin can create an election/
        );
    });
    it("should reject an invalid candidate", async () => {
    const contract = await viem.deployContract("VoxChain");

    await admin.writeContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "createElection",
        args: ["College Election"],
    });

    await admin.writeContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "addCandidate",
        args: [1n, "Rahul"],
    });

    await admin.writeContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "registerVoter",
        args: [1n, voter1.account.address],
    });

    await admin.writeContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "startElection",
        args: [1n],
    });

    // Election has only Candidate 1
    // Voter tries to vote for Candidate 2
    await assert.rejects(
        voter1.writeContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "castVote",
            args: [1n, 2n],
        }),
        /Invalid candidate/
    );
});
it("should reject adding a candidate after election starts", async () => {
    const contract = await viem.deployContract("VoxChain");

    await admin.writeContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "createElection",
        args: ["College Election"],
    });

    await admin.writeContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "addCandidate",
        args: [1n, "Rahul"],
    });

    await admin.writeContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "startElection",
        args: [1n],
    });

    await assert.rejects(
        admin.writeContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "addCandidate",
            args: [1n, "Aman"],
        }),
        /Election already started/
    );
});
it("should reject voting after election ends", async () => {
    const contract = await viem.deployContract("VoxChain");

    await admin.writeContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "createElection",
        args: ["College Election"],
    });

    await admin.writeContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "addCandidate",
        args: [1n, "Rahul"],
    });

    await admin.writeContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "registerVoter",
        args: [1n, voter1.account.address],
    });

    await admin.writeContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "startElection",
        args: [1n],
    });

    await admin.writeContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "endElection",
        args: [1n],
    });

    await assert.rejects(
        voter1.writeContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "castVote",
            args: [1n, 1n],
        }),
        /Election has ended/
    );
});
it("should reject ending an election before it starts", async () => {
    const contract = await viem.deployContract("VoxChain");

    await admin.writeContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "createElection",
        args: ["College Election"],
    });

    await assert.rejects(
        admin.writeContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "endElection",
            args: [1n],
        }),
        /Election has not started/
    );
});
});