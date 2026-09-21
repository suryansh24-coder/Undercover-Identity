# Architecture

Undercover Identity is a single-page React application with no backend. All
processing happens locally in the browser.

## Stack

- **React 18** (`react`, `react-dom`) — UI
- **Vite 5** — build tooling and dev server
- **Vitest 2 + jsdom + Testing Library** — unit tests
- **ESLint 9** with React flat config, react-hooks, react-refresh — static analysis
- **html-to-image** — dossier PNG export (DOM → canvas → PNG)
- **Fontsource packages** — Anton, Inter, IBM Plex Mono, Cormorant Garamond (bundled locally, zero network)

No runtime environment variables are required.

## Module map

```
React root (main.jsx)
└── App (ErrorBoundary)
    └── IdentityProvider (context/IdentityContext)
        └── Shell
            ├── BackgroundEffects   decorative canvas + CSS atmosphere
            ├── CustomCursor        pointer styling
            ├── Navigation          procedural header
            ├── SceneRouter         step switch (state.step)
            │   └── per-step scene components
            ├── SystemMeta          corner chrome, clock, sound toggle
            ├── Toast               notifications
            └── TransitionOverlay   boot/reset overlay
```

`SceneRouter` renders one of: Landing, SecurityClearance, PhotoUpload,
EditorScene + ImageEditorSlot, IdentityForm, DecryptBridge +
DecryptionSequence, or Dossier.

## State model

A single reducer (`src/context/identityReducer.js`) owns the session:

```
step:        'landing' | 'security' | 'upload' | 'editor' | 'identity' | 'decrypt' | 'dossier'
uploadedImage, editedImage, editorHadChanges
identity, dossier
overlay, error, toast
soundEnabled, booted
```

Actions: `GO`, `SET_UPLOAD`, `CLEAR_UPLOAD`, `SET_EDITED`, `SET_IDENTITY`,
`SET_DOSSIER`, `SHOW_OVERLAY`, `HIDE_OVERLAY`, `SET_ERROR`, `CLEAR_ERROR`,
`NOTIFY`, `DISMISS_TOAST`, `TOGGLE_SOUND`, `BOOTED`, `RESET`.

`RESET` rebuilds from `INITIAL_STATE` while deliberately preserving the
sound preference — the only cross-session user choice.

Components consume state through `useIdentity()` / `useStep()` from
`src/context/IdentityContext.jsx`.

## Editor slot

`src/components/ImageEditor/index.jsx` is the **single seam** between the
application and the image editor:

```jsx
<ImageEditorSlot
  source={editedImage || uploadedImage.dataUrl}
  onSave={(dataUrl, changed) => ...}   // → identity step
  onCancel={() => ...}                 // → upload step
/>
```

The slot lazy-loads `ImageEditorPlaceholder` today. Swapping in
`@unlayer/react-image-editor` means pointing the lazy import at the Unlayer
component and mapping its export callback — nothing else in the app changes.
See [unlayer-integration.md](unlayer-integration.md).

## Dossier generation

`src/utils/dossierGeneration.js` is pure and deterministic (random IDs aside):

- `securityLevelFor(clearanceLevel)` — LEVEL 02–04 → RESTRICTED, 05–08 →
  SECRET, 09–10 → TOP SECRET.
- `generateDossier(identity)` — builds document metadata.
- `buildIdentityFromForm(values)` — trims and uppercases form input into the
  identity record shown on the document.

The dossier is rendered as a styled document (`DossierDocument`) inside a
3D tilt wrapper. Export uses `html-to-image` on a ref to that document:
`dossierNodeToBlob` → `downloadBlob`, plus typed-text clipboard copy and
`navigator.share` fallbacks in `src/utils/downloadDossier.js` /
`src/utils/shareIdentity.js`.

## Sound

`src/utils/soundEngine.js` synthesizes cues with the Web Audio API (no audio
files). `useOptionalSound(soundEnabled)` gates playback behind the toggle,
which defaults to off and never autoplays.

## Data flow summary

```
upload file → validate → FileReader → downscale preview
────────────→ editor slot ──────────→ edited data URL (state)
cover form → validate → build identity + dossier (state)
────→ decrypt scene → dossier scene → html-to-image PNG download / copy / share
```

## Testing strategy

Pure utilities are unit-tested directly (validation, generation, formatting,
reducer). React components are kept thin so behavior concentrates in these
testable modules. The production build additionally goes through
`scripts/qa-smoke.mjs`, which boots `vite preview` and asserts assets serve
correctly and no `console.log`/`console.debug` remains in the bundle.

## Performance notes

- Fonts: subsets are emitted per unicode range by Fontsource; the browser
  fetches only latin/greek/cyrillic ranges it needs.
- Editor engine is lazy-loaded so the main bundle stays small
  (~66 KB gzip total for the app chunk).
- Images are pre-scaled to ≤1600px on ingestion to keep canvas work and
  export fast.