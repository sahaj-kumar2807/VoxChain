import { network } from "hardhat";

const connection = await network.create();
const { viem } = connection;

const publicClient = await viem.getPublicClient();

const [admin, voter] = await viem.getWalletClients();

const contractAddress =
    "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const contract = await viem.getContractAt(
    "VoxChain",
    contractAddress
);

console.log("🚀 VoxChain Interaction");
console.log("-------------------------");

console.log("Admin:", admin.account.address);
console.log("Voter:", voter.account.address);

// --------------------------------------------------
// 1. CREATE ELECTION
// --------------------------------------------------

console.log("\n🗳️ Creating election...");

const createTx = await contract.write.createElection([
    "VoxChain College Election",
]);

await publicClient.waitForTransactionReceipt({
    hash: createTx,
});

console.log("✅ Election created!");

const electionCount = await contract.read.electionCount();

console.log("Election ID:", electionCount.toString());

// --------------------------------------------------
// 2. ADD CANDIDATES
// --------------------------------------------------

console.log("\n👥 Adding candidates...");

const candidate1Tx = await contract.write.addCandidate([
    electionCount,
    "Rahul",
]);

await publicClient.waitForTransactionReceipt({
    hash: candidate1Tx,
});

const candidate2Tx = await contract.write.addCandidate([
    electionCount,
    "Aman",
]);

await publicClient.waitForTransactionReceipt({
    hash: candidate2Tx,
});

console.log("✅ Rahul added");
console.log("✅ Aman added");

// --------------------------------------------------
// 3. REGISTER VOTER
// --------------------------------------------------

console.log("\n👤 Registering voter...");

const registerTx = await contract.write.registerVoter([
    electionCount,
    voter.account.address,
]);

await publicClient.waitForTransactionReceipt({
    hash: registerTx,
});

console.log("✅ Voter registered");

// --------------------------------------------------
// 4. START ELECTION
// --------------------------------------------------

console.log("\n🟢 Starting election...");

const startTx = await contract.write.startElection([
    electionCount,
]);

await publicClient.waitForTransactionReceipt({
    hash: startTx,
});

console.log("✅ Election started");

// --------------------------------------------------
// 5. VOTER CASTS VOTE
// --------------------------------------------------

console.log("\n🗳️ Voter casting vote...");

const voterContract = await viem.getContractAt(
    "VoxChain",
    contractAddress,
    {
        client: {
            wallet: voter,
        },
    }
);

const voteTx = await voterContract.write.castVote([
    electionCount,
    2n,
]);

await publicClient.waitForTransactionReceipt({
    hash: voteTx,
});

console.log("✅ Vote successfully cast for Aman");

// --------------------------------------------------
// 6. READ CANDIDATES
// --------------------------------------------------

console.log("\n📊 Current vote counts:");

const candidates = await contract.read.getCandidates([
    electionCount,
]);

for (const candidate of candidates) {
    console.log(
        `${candidate.id.toString()}. ${candidate.name} → ${candidate.voteCount.toString()} votes`
    );
}

// --------------------------------------------------
// 7. CHECK VOTER STATUS
// --------------------------------------------------

const voted = await contract.read.checkHasVoted([
    electionCount,
    voter.account.address,
]);

console.log("\n🔐 Has voter voted?", voted);

// --------------------------------------------------
// 8. END ELECTION
// --------------------------------------------------

console.log("\n🔴 Ending election...");

const endTx = await contract.write.endElection([
    electionCount,
]);

await publicClient.waitForTransactionReceipt({
    hash: endTx,
});

console.log("✅ Election ended");

// --------------------------------------------------
// 9. GET FINAL RESULTS
// --------------------------------------------------

console.log("\n🏆 FINAL RESULTS");

const results = await contract.read.getResults([
    electionCount,
]);

for (const candidate of results) {
    console.log(
        `${candidate.id.toString()}. ${candidate.name} → ${candidate.voteCount.toString()} votes`
    );
}

console.log("\n🎉 VoxChain complete flow executed successfully!");