import { network } from "hardhat";
import { formatEther } from "viem";

async function main() {
  console.log("=== VOXCHAIN READ-ONLY SIGNER & SEPOLIA AUDIT ===");

  const connection = await network.create({
    network: "sepolia",
    chainType: "l1",
  });
  const { viem } = connection;
  const publicClient = await viem.getPublicClient();

  // 1. Query RPC Chain ID
  const chainId = await publicClient.getChainId();
  const isChainIdValid = Number(chainId) === 11155111;
  console.log(`CHECK 1 - RPC Chain ID (11155111): ${chainId} [${isChainIdValid ? "PASS" : "FAIL"}]`);

  // 2. Resolve Signer from Hardhat Keystore
  const walletClients = await viem.getWalletClients();
  if (!walletClients || walletClients.length === 0) {
    console.log("CHECK 2 - Signer Derivation: FAIL (No wallet clients configured)");
    process.exit(1);
  }

  const signerAddress = walletClients[0].account.address;
  console.log(`CHECK 2 - Derived Signer Address: ${signerAddress} [PASS]`);

  // 3. Compare with Expected Administrator
  const EXPECTED_ADMIN = "0x23868eB17C8395b5D42dE20369C0b23C3cb8CfFE";
  const isMatch = signerAddress.toLowerCase() === EXPECTED_ADMIN.toLowerCase();
  console.log(`CHECK 3 - Admin Match (${EXPECTED_ADMIN}): [${isMatch ? "PASS" : "FAIL"}]`);

  // 4. Query Sepolia ETH Balance
  const balanceWei = await publicClient.getBalance({ address: signerAddress });
  const balanceEth = formatEther(balanceWei);
  const isSufficient = balanceWei > 5000000000000000n; // > 0.005 ETH
  console.log(`CHECK 4 - Signer Sepolia Balance: ${balanceEth} ETH (${balanceWei.toString()} wei) [${isSufficient ? "PASS" : "FAIL"}]`);

  console.log("=== SUMMARY ===");
  if (isChainIdValid && isMatch && isSufficient) {
    console.log("OVERALL STATUS: ALL CHECKS PASSED - READY FOR SEPOLIA DEPLOYMENT");
  } else {
    console.log("OVERALL STATUS: VERIFICATION FAILED");
  }
}

main().catch((err) => {
  console.error("VERIFICATION_ERROR:", err.message);
  process.exit(1);
});
