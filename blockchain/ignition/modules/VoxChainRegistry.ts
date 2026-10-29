import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const VoxChainRegistryModule = buildModule("VoxChainRegistryModule", (m) => {
  const registry = m.contract("VoxChainRegistry");

  return { registry };
});

export default VoxChainRegistryModule;
