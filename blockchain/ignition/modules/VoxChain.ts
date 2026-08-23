import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const VoxChainModule = buildModule("VoxChainModule", (m) => {
    const voxChain = m.contract("VoxChain");

    return { voxChain };
});

export default VoxChainModule;