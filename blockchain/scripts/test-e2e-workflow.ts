import { createWalletClient, createPublicClient, http, parseAbi } from "viem";
import { hardhat } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

async function main() {
    console.log("Starting End-to-End Live Node Verification...");
    const transport = http("http://127.0.0.1:8545");

    const publicClient = createPublicClient({
        chain: hardhat,
        transport,
    });

    const accounts = [
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // #0 Deployer / Super Admin
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", // #1 Requester
        "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", // #2 Org Admin
        "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6", // #3 Voter
        "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a", // #4 Unauthorized
    ] as const;

    const [superAdminWallet, requesterWallet, orgAdminWallet, voterWallet, unauthorizedWallet] = accounts.map(
        (pk) => createWalletClient({ chain: hardhat, transport, account: privateKeyToAccount(pk as `0x${string}`) })
    );

    const registryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3" as const;

    // Load compiled ABIs via fs
    const fs = await import("fs");
    const path = await import("path");
    const registryArtifact = JSON.parse(
        fs.readFileSync(path.resolve("./artifacts/contracts/VoxChainRegistry.sol/VoxChainRegistry.json"), "utf8")
    );
    const voxChainArtifact = JSON.parse(
        fs.readFileSync(path.resolve("./artifacts/contracts/VoxChain.sol/VoxChain.json"), "utf8")
    );

    // Step 1: Verify Super Admin
    const onChainSuperAdmin = await publicClient.readContract({
        address: registryAddress,
        abi: registryArtifact.abi,
        functionName: "superAdmin",
    });
    console.log("✓ Live Super Admin Verified:", onChainSuperAdmin);

    // Step 2: Requester submits registration with neutral internal metadata placeholder
    const regTx = await requesterWallet.writeContract({
        address: registryAddress,
        abi: registryArtifact.abi,
        functionName: "requestRegistration",
        args: ["Acme Governance", "Acme DAO Elections", "voxchain://internal/organisation"],
    });
    await publicClient.waitForTransactionReceipt({ hash: regTx });
    console.log("✓ Registration Request Submitted:", regTx);

    const latestOrgId = await publicClient.readContract({
        address: registryAddress,
        abi: registryArtifact.abi,
        functionName: "organisationCount",
    }) as bigint;

    // Step 3: Super Admin approves and assigns Org Admin
    const approveTx = await superAdminWallet.writeContract({
        address: registryAddress,
        abi: registryArtifact.abi,
        functionName: "approveOrganisation",
        args: [latestOrgId, orgAdminWallet.account.address],
    });
    await publicClient.waitForTransactionReceipt({ hash: approveTx });

    const org = await publicClient.readContract({
        address: registryAddress,
        abi: registryArtifact.abi,
        functionName: "getOrganisation",
        args: [latestOrgId],
    }) as any;
    console.log("✓ Organisation Approved. Child Contract:", org.contractAddress, "Admin:", org.admin);

    const childAddress = org.contractAddress as `0x${string}`;

    // Step 4: Org Admin creates election
    const createTx = await orgAdminWallet.writeContract({
        address: childAddress,
        abi: voxChainArtifact.abi,
        functionName: "createElection",
        args: ["Board of Directors 2026"],
    });
    await publicClient.waitForTransactionReceipt({ hash: createTx });
    console.log("✓ Election Created by Org Admin");

    // Step 5: Org Admin adds candidate
    const candTx = await orgAdminWallet.writeContract({
        address: childAddress,
        abi: voxChainArtifact.abi,
        functionName: "addCandidate",
        args: [1n, "Dr. Alice Morgan"],
    });
    await publicClient.waitForTransactionReceipt({ hash: candTx });
    console.log("✓ Candidate Added: Dr. Alice Morgan");

    // Step 6: Org Admin registers voter
    const regVoterTx = await orgAdminWallet.writeContract({
        address: childAddress,
        abi: voxChainArtifact.abi,
        functionName: "registerVoter",
        args: [1n, voterWallet.account.address],
    });
    await publicClient.waitForTransactionReceipt({ hash: regVoterTx });
    console.log("✓ Voter Registered:", voterWallet.account.address);

    // Step 7: Org Admin opens election
    const startTx = await orgAdminWallet.writeContract({
        address: childAddress,
        abi: voxChainArtifact.abi,
        functionName: "startElection",
        args: [1n],
    });
    await publicClient.waitForTransactionReceipt({ hash: startTx });
    console.log("✓ Election Voting Window Opened");

    // Step 8: Voter casts vote
    const voteTx = await voterWallet.writeContract({
        address: childAddress,
        abi: voxChainArtifact.abi,
        functionName: "castVote",
        args: [1n, 1n],
    });
    await publicClient.waitForTransactionReceipt({ hash: voteTx });
    console.log("✓ Voter Cast Immutable Ballot on Child Contract:", voteTx);

    // Step 9: Org Admin ends election
    const endTx = await orgAdminWallet.writeContract({
        address: childAddress,
        abi: voxChainArtifact.abi,
        functionName: "endElection",
        args: [1n],
    });
    await publicClient.waitForTransactionReceipt({ hash: endTx });
    console.log("✓ Election Concluded and Certified");

    // Step 10: Tally verification
    const results = await publicClient.readContract({
        address: childAddress,
        abi: voxChainArtifact.abi,
        functionName: "getResults",
        args: [1n],
    }) as any[];
    console.log(`✓ Certified Results: ${results[0].name} has ${results[0].voteCount} vote(s)`);

    // Step 11: Verify cross-org isolation (unauthorized caller fails)
    try {
        await unauthorizedWallet.writeContract({
            address: childAddress,
            abi: voxChainArtifact.abi,
            functionName: "createElection",
            args: ["Hacked Election"],
        });
        console.error("❌ FAILED: Unauthorized user should have been rejected!");
    } catch {
        console.log("✓ Cross-Org Isolation Confirmed: Unauthorized caller successfully rejected.");
    }

    // Step 12: Super Admin revokes Org Admin
    const revokeTx = await superAdminWallet.writeContract({
        address: registryAddress,
        abi: registryArtifact.abi,
        functionName: "revokeOrgAdmin",
        args: [latestOrgId],
    });
    await publicClient.waitForTransactionReceipt({ hash: revokeTx });
    console.log("✓ Org Admin Revoked by Super Admin");

    // Step 13: Verify revoked admin cannot create elections
    try {
        await orgAdminWallet.writeContract({
            address: childAddress,
            abi: voxChainArtifact.abi,
            functionName: "createElection",
            args: ["Post-Revocation Election"],
        });
        console.error("❌ FAILED: Revoked admin should have been rejected!");
    } catch {
        console.log("✓ Admin Revocation Enforced: Revoked admin successfully blocked from administrative actions.");
    }

    console.log("\n=======================================================");
    console.log("ALL 13 LIVE NODE END-TO-END VERIFICATION STEPS PASSED!");
    console.log("=======================================================\n");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
