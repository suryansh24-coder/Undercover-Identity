# Design system

Undercover Identity has an original "Vice City" intelligence-theater aesthetic:
obsidian surfaces, champagne-gold identity accents, crimson classification
marks, and a film-grain/scanline atmosphere. It is fiction-only and not
affiliated with any game franchise.

## Tokens — `src/styles/tokens.css`

### Color

| Token | Value | Use |
| --- | --- | --- |
| `--c-obsidian` | `#05060a` | Primary stage background |
| `--c-ink` | `#0d0f14` | Cards, panels |
| `--c-graphite` | `#151822` | Elevated surfaces |
| `--c-cool` | `#edeef2` | Headline / primary text |
| `--c-silver` | `#98a0af` | Secondary text |
| `--c-muted` | `#5c6472` | De-emphasized text |
| `--c-champagne` | `#c9a86a` | Identity accent (gold) |
| `--c-champagne-bright` | `#e4ca92` | Hover / bright gold |
| `--c-champagne-deep` | `#8f7448` | Deep gold, borders |
| `--c-crimson` | `#b3131f` | Classification red |
| `--c-crimson-deep` | `#7f0d16` | Dossier ink red |
| `--c-crimson-bright` | `#ff4d5f` | Error accent |
| `--paper` / `--paper-deep` | warm cream | Dossier document |

### Typography

| Token | Font | Use |
| --- | --- | --- |
| `--font-display` | Anton | Titles, codenames, classification |
| `--font-sans` | Inter | UI + document body |
| `--font-mono` | IBM Plex Mono | System labels, metadata, form fields |
| `--font-serif` | Cormorant Garamond | Dossier detail values, signatures |

### Space / radius / motion

- Spacing scale in `--sp-*` units (0.25rem base), border radius `--r-*`.
- Motion: `--dur-fast` (120ms), `--dur-med` (300ms), `--dur-slow` (700ms)
  with easing `--ease-out`.
- Breakpoints: `720px`, `1080px`, `1400px`.

## Signature pieces

- **Terminal cards** — console chrome with window dots and a mono header.
- **System labels** — `▸`/icon + spaced-caps mono kicker above headings.
- **Stepper** — numbered progress rail (Photograph → Modify → Cover).
- **Buttons** — primary (gold glow), ghost (hairline), crimson (danger/reset),
  goldLine; magnetic hover; busy spinner state.
- **Custom cursor** — a crosshair/ring that scales on interactive targets;
  disabled on touch and reduced motion.
- **3D document** — perspective tilt following the pointer, squash-and-stretch
  settle, and a pointer-tracking glare highlight on the dossier.
- **Atmosphere** — fixed grid, drifting gold particle field (canvas), scanline
  sweep, vignette, and film grain; all decorative, `aria-hidden`, and reduced
  when motion is off.

## Dossier document

The document is treated as a physical artifact: cream paper, perforation line,
a red classification tape, embossed office header, giant watermark, barcode,
metadata grid, signatures, a double-border rubber stamp, and a redaction
block. It is styled in `src/styles/dossier.css`.

## Accessibility

- Semantic `<section>` per scene with `aria-label`.
- Skip-to-content link, focus-visible outlines, `sr-only` utilities.
- All motion keyframes are disabled under `prefers-reduced-motion`.
- Live regions announce form errors and decrypt progress.
- Color contrast is maintained for text on both dark stages and the paper.