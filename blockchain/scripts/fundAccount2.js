import { ethers } from "hardhat";

async function main() {
    const [sender] = await ethers.getSigners();

    const recipient = "0xFC2Fa36d4D952C0735C6dfE9741deF422A9a93F8";

    console.log("Sending 10 ETH...");
    console.log("From:", sender.address);
    console.log("To:", recipient);

    const tx = await sender.sendTransaction({
        to: recipient,
        value: ethers.parseEther("10")
    });

    await tx.wait();

    console.log("Successfully sent 10 ETH!");
    console.log("Transaction:", tx.hash);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});