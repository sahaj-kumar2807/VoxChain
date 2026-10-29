# DESIGN SYSTEM SPECIFICATION — VOXCHAIN

<!-- impeccable:design-schema 1 -->

## Visual World: Cinematic Monolithic Space & Brushed Metal Architecture

VOXCHAIN is an institutional-grade on-chain governance ledger. The aesthetic is deep obsidian black, architectural, minimal, precise, and cinematic — combining brutalist negative space with astronomical precision and brushed metallic materiality.

### 1. Global Locked Design Tokens

```css
:root {
  color-scheme: dark;

  --background: #050505;
  --background-secondary: #090909;
  --surface: #101010;
  --surface-elevated: #171717;

  --text-primary: #F4F4F4;
  --text-secondary: #A5A5A5;
  --text-muted: #727272;

  --border-subtle: rgba(255, 255, 255, 0.09);
  --border-default: rgba(255, 255, 255, 0.16);
  --border-strong: rgba(255, 255, 255, 0.25);

  --accent: #E5E5E5;
  --accent-hover: #FFFFFF;

  --metal-dark: #242424;
  --metal-mid: #777777;
  --metal-light: #D8D8D8;

  --shadow-ambient: 0 24px 80px rgba(0, 0, 0, 0.65);
  --shadow-modal: 0 32px 96px rgba(0, 0, 0, 0.85);
}
```

### 2. Color Governance & Surface Rules

- **Black Ratio**: $\ge$90% of the visible viewport reads as pure obsidian black or near-black (`#050505`, `#090909`, `#101010`, `#171717`).
- **Contrast**: High-clarity white (`#F4F4F4`) and soft silver-gray (`#A5A5A5`) provide primary and secondary readability.
- **Silver & Metal Accents**: Accents are strictly brushed silver, graphite, and pure white (`#E5E5E5`, `#FFFFFF`, `#D8D8D8`, `#777777`).
- **Absolute Bans**: Absolutely NO chartreuse, lime green, neon green, gold/amber, purple/pink gradients, rainbow effects, or per-page tint shifts.
- **Architectural Surfaces**: Surfaces (`#101010`) and elevated containers (`#171717`) provide physical depth without visual clutter.
- **Precision Hairlines**: `rgba(255, 255, 255, 0.09)` and `rgba(255, 255, 255, 0.16)` define structural borders.

### 3. Typography Hierarchy

- **Editorial Display**: Playfair Display / Cormorant / Instrument Serif italic for expressive display highlights (*Immutable.*).
- **Primary Headings**: Space Grotesk / Inter (`500`, `600`, `700`) with tight tracking (`-0.03em`) for uppercase architectural headlines.
- **Body & Controls**: Inter / Plus Jakarta Sans (`400`, `500`) with comfortable reading metrics for application workflows.
- **Telemetry & Hashes**: IBM Plex Mono / JetBrains Mono (`400`, `500`) for EVM addresses, transaction hashes, block numbers, and gas telemetry.

### 4. Cinematic 3D Art Direction — The Monolithic Celestial Ballot Seal

- **Form**: A signature spherical metallic monolith and concentric ballot seal featuring micro-engraved circular ridges, physical surface texture (brushed titanium / lunar granite), and surrounding vertical harmonic spatial resonance lines.
- **Lighting**: Cinematic directional silver key light casting grazing specular glints across the metal bevels, rim light separating the silhouette from the deep obsidian void.
- **Continuous 5-Stage Narrative**: One unified 3D object interpolating through shared scroll progress:
  1. *Emerge from the Void*: Slow rotation revealing brushed surface texture and vertical acoustic lines.
  2. *Cryptographic Sharding*: Splitting into concentric planetary rings and verification nodes.
  3. *Zero-Knowledge Proof Assembly*: Alignment of geometry into an impenetrable cryptographic core.
  4. *Immutable Blockchain Seal*: Permanent locking of the consensus state.
  5. *Decentralized Governance Lattice*: Final resting pose framing the application launch CTA.
- **Performance & Fallbacks**: Strict exponential damping (lerp), canvas frame throttling, GPU cleanup on unmount, and complete static geometric fallback when WebGL or `prefers-reduced-motion` is detected.
