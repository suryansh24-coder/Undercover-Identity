# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- (no entries yet)

## [0.2.0] — 2026-09-21

### Added

- **Unlayer integration.** The editor slot now loads the official
  `@unlayer/react-image-editor@1.0.2` (dark theme, all default tools,
  AI assistant disabled). Wrapper + CDN embed script are lazy-loaded on first
  editor mount; image processing stays local.
- Graceful editor recovery: suspense fallback while mounting, fatal panel for
  render-time / wrapper failures (`onError`), and a targeted recovery panel
  for image decode failures (`onLoadError`) — each with reload / try-again /
  return-to-upload actions.

### Changed

- Removed the hand-rolled editor engine (`ImageEditorPlaceholder.jsx`,
  `presets.js`, `renderEngine.js`) in favor of the Unlayer adapter
  (`src/components/ImageEditor/UnlayerEditor.jsx`). The `ImageEditorSlot`
  API is unchanged; the rest of the application is untouched.
- Editor save output is now Unlayer's flattened canvas (crop, resize,
  filters, draw, text, shapes, stickers, frames), which flows unchanged into
  the final dossier.

## [0.1.0] — 2026-09-21

### Added

- Full seven-step experience: Landing, Security Clearance, Photograph Upload,
  Image Editor, Cover Identity, Decryption Sequence, Classified Dossier.
- Working in-browser placeholder image editor behind a single lazy-loaded slot:
  filters (7 tones), crop with guides, freehand draw, text overlay, stickers,
  resize presets, undo/reset, live save export.
- Local image pipeline: validation (type + 12 MB limit), FileReader decode,
  canvas downscale preview, all in-browser.
- Identity intake with per-field validation: codename, operation,
  specialization, location, clearance level, status, auto-issued case file
  number, plus optional associates / vehicle / trait.
- Classified dossier document: classification band, procedural identities,
  barcode, metadata grid, signatures, stamp, redactions, watermark.
- Export actions: download dossier as PNG (html-to-image), copy identity to
  clipboard, Web Share / copy fallback.
- Session state via a deterministic reducer (`identityReducer`) with
  transitions, notifications, overlays, and a full session reset.
- Design system: obsidian/champagne/crimson tokens, Anton + Inter + IBM Plex
  Mono + Cormorant Garamond, reduced-motion support, custom cursor, magnetic
  buttons, 3D tilt with pointer-glow on the document.
- Optional synthesized audio cues (Web Audio API), off by default.
- Quality gates: 32 unit tests (Vitest), ESLint with React flat config
  (0 errors), production build verified, and a `scripts/qa-smoke.mjs` smoke
  test that checks the built assets over `vite preview`.
- Documentation: architecture, user flow, design system, development,
  deployment, and Unlayer integration plans.

### Notes

- The image editor is currently backed by a placeholder module. Unlayer is
  **not yet integrated** — this is intentional and tracked under
  [Unreleased].
- No environment variables are required. No network calls are made.