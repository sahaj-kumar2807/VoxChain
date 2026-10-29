# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Private shareholders, board trustees, and corporate governance administrators. Primary scenario: executing high-stakes proxy votes, resolutions, and leadership elections with verified shareholder registries, cryptographic non-repudiation, and auditability.

## Product Purpose
Deliver an institutional-grade, zero-trust electronic voting protocol that replaces opaque manual or centralized voting with immutable, mathematically verifiable smart-contract consensus. Success is defined by 100% tamper-evident election results, zero administrative ballot manipulation, and clear cryptographic proof for every vote cast.

## Positioning
A deterministic on-chain governance ledger executing directly on Ethereum (Sepolia testnet / EVM) with verified voter allowlisting and cryptographic receipts, with a planned roadmap extension toward zero-knowledge private ballots (zk-SNARK/homomorphic voting).

## Operating Context
- Boardroom annual meetings, special shareholder assemblies, and proxy committee tallies.
- Connected Web3 wallets (MetaMask / EIP-1193) acting as sovereign shareholder credentials.
- Dual environments: Ethereum Sepolia testnet (`chainId: 11155111`) for live institutional testing, and local Hardhat node (`chainId: 31337`) for dev/CI.

## Capabilities and Constraints
- Smart Contract: `VoxChain.sol` (deployed on Sepolia at `0x9ecd0c8cb4aE359EB05B955F9331f5d324b7E025`).
- Deployer / Administrator: `0x23868eB17C8395b5D42dE20369C0b23C3cb8CfFE`.
- Core Capabilities:
  - Election creation (single admin authority).
  - Candidate roster management (pre-start only).
  - Strict voter allowlisting via Ethereum addresses (`registerVoter`).
  - Single-vote-per-voter enforcement on-chain.
  - Lifecycle state machine: Draft -> Started (locked roster/registration) -> Ended (permanent consensus seal).
  - Certified tally exports in JSON.
- Current Transparency Constraint: In the current smart contract, `VoteCast` events and calldata record voter address and candidate choice in plaintext on EVM logs. Complete anonymity is designated as a future zero-knowledge roadmap extension.

## Brand Commitments
- Name: VOXCHAIN
- Tagline: *"Your Voice. Immutable."*
- Design Ethos: Cinematic architectural black canvas (`#050505`, `#090909`), brushed metal, raw graphite, silver accents (`#E5E5E5`, `#FFFFFF`), fine spatial grid lines, monospace tabular technical data.
- Strict Anti-Slop Rules: No lime green, chartreuse, neon, purple/pink SaaS gradients, fake device frames, decorative emojis, or multi-colored feature cards.

## Evidence on Hand
- Deployed Contract on Sepolia: `0x9ecd0c8cb4aE359EB05B955F9331f5d324b7E025`
- Deployment Transaction: `0xc3214b680e16772f2e587c615c0df584247f3b11b9f14da276c4d79ee55e6031`
- Hardhat integration test suite: 12 passing tests (`blockchain/test/VoxChain.test.ts`)
- Design Specification: `frontend/DESIGN_SPECIFICATION.md`

## Product Principles
1. **Mathematical Consensus Over Trust**: Never ask users or auditors to trust an off-chain database or centralized authority; state is derived strictly from EVM execution.
2. **Immutable Non-Repudiation**: Every ballot cast produces an unalterable receipt with block height, transaction hash, and timestamp.
3. **Institutional Dignity**: The interface communicates gravitas, precision, and clarity suitable for corporate boards and high-value civic elections.
4. **Explicit Lifecycle Rigor**: Election stages (draft, open, sealed) are irreversible smart-contract state gates that prevent post-facto tampering.

## Accessibility & Inclusion
- High contrast compliant typography (Outfit display + Inter body + JetBrains Mono data).
- Keyboard-navigable election rosters and review drawers.
- Explicit visual feedback for pending, confirmed, and rejected transactions.
