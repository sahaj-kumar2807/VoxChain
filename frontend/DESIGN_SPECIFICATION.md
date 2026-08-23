# VOXCHAIN — Developer Handoff & Technical Design Specification
**Project:** VOXCHAIN (*"Your Voice. Immutable."*)
**Status:** Approved Phase 1 Design Specification
**Target Stack:** React 19 + TypeScript + Vite + Tailwind CSS + Lucide React + Viem / Wagmi + Framer Motion
**Smart Contract Target:** `blockchain/contracts/VoxChain.sol` (Already deployed / tested)

---

## Table of Contents
1. [Core Design Philosophy & Hallmark Compliance](#1-core-design-philosophy--hallmark-compliance)
2. [Design Tokens & Tailwind CSS Configuration](#2-design-tokens--tailwind-css-configuration)
3. [Typography System & Google Fonts](#3-typography-system--google-fonts)
4. [Component Architecture & TypeScript Interfaces](#4-component-architecture--typescript-interfaces)
5. [Smart Contract Integration Architecture (`VoxChain.sol`)](#5-smart-contract-integration-architecture-voxchainsol)
6. [15-Screen Detailed Blueprint & State Machines](#6-15-screen-detailed-blueprint--state-machines)
7. [Motion Physics & Transaction Sequence Engine](#7-motion-physics--transaction-sequence-engine)
8. [Responsive Breakpoints & Touch Adaptation](#8-responsive-breakpoints--touch-adaptation)

---

## 1. Core Design Philosophy & Hallmark Compliance

VOXCHAIN is designed as an **institutional-grade civic ledger**. To ensure the final implementation feels authentic, authoritative, and distinctive, all frontend code must strictly follow these rules:

### Hallmark Anti-AI-Slop Rules for Developers
- ❌ **No Purple/Pink Gradient Backgrounds**: Use solid obsidian slate (`#07090E` / `#0E131F`) with subtle 1px hairline borders (`rgba(255,255,255,0.08)`).
- ❌ **No Fake Browser / Phone Chrome**: Render content directly on the high-contrast canvas.
- ❌ **No Emojis as UI Icons**: Always use `lucide-react` SVG icons with `strokeWidth={1.75}`.
- ❌ **No Layout-Shifting Transitions**: Reserve space for loaders and skeletons.
- ❌ **No Italic Words in Headings**: Display type is strictly Roman (`font-style: normal`).
- ❌ **No Proportional Numbers for Hashes/Timestamps**: Always apply `tabular-nums` / `font-mono` on numbers, hashes, addresses, and counters.

---

## 2. Design Tokens & Tailwind CSS Configuration

### 2.1 `tailwind.config.ts` Extension

```typescript
import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        vox: {
          bg: {
            base: 'var(--vox-bg-base)',
            'base-light': '#F8FAFC',
          },
          surface: {
            1: 'var(--vox-surface-1)',
            2: 'var(--vox-surface-2)',
            3: 'var(--vox-surface-3)',
            4: 'var(--vox-surface-4)',
          },
          border: {
            subtle: 'var(--vox-border-subtle)',
            medium: 'var(--vox-border-medium)',
            strong: 'var(--vox-border-strong)',
            active: 'var(--vox-border-active)',
          },
          text: {
            primary: 'var(--vox-text-primary)',
            secondary: 'var(--vox-text-secondary)',
            muted: 'var(--vox-text-muted)',
            disabled: 'var(--vox-text-disabled)',
          },
          accent: {
            gold: 'var(--vox-accent-gold)',
            'gold-hover': 'var(--vox-accent-gold-hover)',
            'gold-glow': 'var(--vox-accent-gold-glow)',
          },
          state: {
            success: 'var(--vox-state-success)',
            'success-bg': 'var(--vox-state-success-bg)',
            warning: 'var(--vox-state-warning)',
            'warning-bg': 'var(--vox-state-warning-bg)',
            danger: 'var(--vox-state-danger)',
            'danger-bg': 'var(--vox-state-danger-bg)',
            info: 'var(--vox-state-info)',
            'info-bg': 'var(--vox-state-info-bg)',
          },
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
      },
      boxShadow: {
        'vox-card': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'vox-active': '0 0 0 1px var(--vox-border-active), 0 8px 30px -4px rgba(245, 158, 11, 0.15)',
        'vox-modal': '0 24px 60px -12px rgba(0, 0, 0, 0.8)',
      },
      transitionTimingFunction: {
        'vox-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'vox-in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      transitionDuration: {
        instant: '75ms',
        fast: '150ms',
        normal: '250ms',
        complex: '450ms',
        ceremony: '800ms',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

---

## 3. Typography System & Google Fonts

Import the following Google Fonts in `src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap');

:root {
  --vox-bg-base: #07090E;
  --vox-surface-1: #0E131F;
  --vox-surface-2: #161D2E;
  --vox-surface-3: #1E273D;
  --vox-surface-4: #28334E;
  --vox-border-subtle: rgba(255, 255, 255, 0.08);
  --vox-border-medium: rgba(255, 255, 255, 0.16);
  --vox-border-strong: rgba(255, 255, 255, 0.28);
  --vox-border-active: rgba(245, 158, 11, 0.55);
  --vox-text-primary: #F8FAFC;
  --vox-text-secondary: #94A3B8;
  --vox-text-muted: #64748B;
  --vox-text-disabled: #334155;
  --vox-accent-gold: #F59E0B;
  --vox-accent-gold-hover: #D97706;
  --vox-accent-gold-glow: rgba(245, 158, 11, 0.15);
  --vox-state-success: #10B981;
  --vox-state-success-bg: rgba(16, 185, 129, 0.10);
  --vox-state-warning: #F59E0B;
  --vox-state-warning-bg: rgba(245, 158, 11, 0.10);
  --vox-state-danger: #EF4444;
  --vox-state-danger-bg: rgba(239, 68, 68, 0.10);
  --vox-state-info: #0EA5E9;
  --vox-state-info-bg: rgba(14, 165, 233, 0.10);
}
```

---

## 4. Component Architecture & TypeScript Interfaces

### 4.1 Core Components Tree
```
src/
├── components/
│   ├── common/
│   │   ├── VoxButton.tsx
│   │   ├── VoxBadge.tsx
│   │   ├── VoxHashPill.tsx
│   │   ├── VoxInput.tsx
│   │   ├── VoxModal.tsx
│   │   ├── VoxDrawer.tsx
│   │   └── VoxToast.tsx
│   ├── layout/
│   │   ├── HeaderNav.tsx
│   │   ├── FooterColophon.tsx
│   │   └── TelemetryBar.tsx
│   ├── voting/
│   │   ├── CandidateCard.tsx
│   │   ├── VotingStepper.tsx
│   │   ├── BallotReviewDrawer.tsx
│   │   ├── TransactionWatcher.tsx
│   │   └── ImmutableReceipt.tsx
│   └── admin/
│       ├── ElectionTable.tsx
│       ├── CreateElectionModal.tsx
│       ├── AddCandidateModal.tsx
│       ├── RegisterVoterModal.tsx
│       └── ResultsTallyView.tsx
```

### 4.2 Primary Component Interfaces

```typescript
// VoxButton.tsx Props
export interface VoxButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary-gold' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

// CandidateCard.tsx Props
export interface CandidateData {
  id: number;
  name: string;
  voteCount?: number;
  bio?: string;
  avatarSeed?: string;
}

export interface CandidateCardProps {
  candidate: CandidateData;
  isSelected: boolean;
  onSelect: (id: number) => void;
  disabled?: boolean;
  showVoteCount?: boolean;
}

// VoxHashPill.tsx Props
export interface VoxHashPillProps {
  hash: string;
  type?: 'address' | 'txHash' | 'block';
  truncate?: boolean;
  showCopy?: boolean;
  showExplorerLink?: boolean;
  explorerUrl?: string;
}
```

---

## 5. Smart Contract Integration Architecture (`VoxChain.sol`)

### 5.1 Contract Interface Mappings
The frontend communicates directly with `VoxChain.sol`:

| Frontend View / Action | Smart Contract Function / Event | Expected Arguments | Return Types |
| :--- | :--- | :--- | :--- |
| **Check Admin Status** | `admin()` (public var) | None | `address` |
| **Fetch Total Elections** | `electionCount()` (public var) | None | `uint256` |
| **Fetch Single Election** | `getElection(uint256)` | `_electionId` | `(id, name, started, ended)` |
| **Fetch Candidates** | `getCandidates(uint256)` | `_electionId` | `Candidate[] (id, name, voteCount)` |
| **Check Voter Eligibility** | `checkEligibility(uint256, address)` | `_electionId, _voter` | `bool` |
| **Check Has Voted** | `checkHasVoted(uint256, address)` | `_electionId, _voter` | `bool` |
| **Create Election** | `createElection(string)` | `_name` | Emits `ElectionCreated(id, name)` |
| **Add Candidate** | `addCandidate(uint256, string)` | `_electionId, _name` | Emits `CandidateAdded(electionId, candidateId, name)` |
| **Register Voter** | `registerVoter(uint256, address)` | `_electionId, _voter` | Emits `VoterRegistered(electionId, voter)` |
| **Start Election** | `startElection(uint256)` | `_electionId` | Emits `ElectionStarted(electionId)` |
| **End Election** | `endElection(uint256)` | `_electionId` | Emits `ElectionEnded(electionId)` |
| **Cast Vote** | `castVote(uint256, uint256)` | `_electionId, _candidateId` | Emits `VoteCast(electionId, candidateId, voter)` |
| **Fetch Final Results** | `getResults(uint256)` | `_electionId` | `Candidate[]` (Requires `ended == true`) |

---

## 6. 15-Screen Detailed Blueprint & State Machines

### 1. Landing Page (`/`)
- Public discovery, high-impact branding, real-time contract statistics, CTA to open dashboard.

### 2. Wallet Connection Modal
- Triggers on unauthenticated actions; auto-detects MetaMask / EIP-1193 providers, verifies chain ID, displays eligibility status.

### 3. Voter Dashboard (`/dashboard`)
- Displays registered credentials, list of active and past elections with status pills (`VOTING OPEN`, `NOT STARTED`, `CONCLUDED`).

### 4. Election Details (`/election/:id`)
- Full constitutional details of election, candidate list, eligibility checklist, countdown timer.

### 5. Candidate Selection (`/election/:id/vote`)
- 6-Stage Stepper at Stage 1; candidate cards with 3D tilt and radio selection; bottom sticky bar showing selected candidate.

### 6. Ballot Review Drawer
- Slide-over drawer; confirms candidate name & ID; displays irreversible commitment warning; requires explicit intent checkbox.

### 7. Wallet Signature State
- Cryptographic vault graphic; real-time guidance while MetaMask prompt is active; retry trigger if user closes wallet modal.

### 8. Mempool Broadcasting & Mining
- Live Tx Hash display; latency timer; radial block mining spinner; live gas telemetry.

### 9. Immutable Vote Success (`/election/:id/receipt`)
- Rotating emerald seal celebration; printable/downloadable cryptographic ballot certificate with hash and block number.

### 10. Admin Governance Portal (`/admin`)
- Accessible only if `connectedAddress === contract.admin()`; overview metrics of all elections; management table.

### 11. Create Election Wizard (`/admin/create-election`)
- Form to initialize a new election on-chain with live preview card.

### 12. Candidate Management (`/admin/election/:id/candidates`)
- Add candidates before election starts; dynamic roster table with assigned IDs.

### 13. Voter Registration (`/admin/election/:id/voters`)
- Single and batch address registration; live eligibility tester.

### 14. Live Election Command (`/admin/election/:id/control`)
- Pre-flight checklist; start election button; live turnout telemetry; end election button.

### 15. Certified Election Results (`/election/:id/results`)
- Winner podium; animated horizontal bar graphs; full event audit log of all cast votes.

---

## 7. Motion Physics & Transaction Sequence Engine

- **Durations:** Instant `75ms`, Fast `150ms`, Normal `250ms`, Complex `450ms`, Ceremony `800ms`.
- **Easing:** Strict exponential ease-out `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Reduced Motion:** When `prefers-reduced-motion: reduce` is active, all animated transforms convert to instant opacity swaps.

---

## 8. Responsive Breakpoints

- **Mobile (320px–480px):** Single-column layout; fixed bottom voting CTA; horizontal scrolling steppers.
- **Tablet (481px–1024px):** 2-column candidate grids; slide-over drawers occupy 60% viewport width.
- **Desktop (1025px+):** 3-column candidate grids; full split-screen telemetry and master-detail dashboards.
