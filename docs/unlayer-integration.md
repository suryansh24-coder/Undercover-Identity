# Unlayer react-image-editor integration

> **Status: DONE.** `@unlayer/react-image-editor@1.0.2` is live behind the
> existing editor slot. This document describes the actual implementation.

## Package

- **`@unlayer/react-image-editor` 1.0.2** (MIT, official Unlayer wrapper)
- Peer dependency: `react >= 18` (project runs React 18.3.1)
- Only dependency added at the app level: none extra — the wrapper declares
  its own single type dependency.

The wrapper (≈9 KB) lazy-loads the full editor from Unlayer's CDN
(`https://cdn.unlayer.com/image-editor/embed.js`) the first time the editor
scene mounts, then drives it via `window.ImageEditor.createEditor`. Core tools
(crop, resize, filter, draw, text, shapes, stickers, frame) work without an
API key; the optional AI Assistant (which needs a `projectId`) stays disabled.

## Architecture

```
EditorScene (App.jsx)
└── ImageEditorSlot  src/components/ImageEditor/index.jsx
    • owns loading (React.lazy), load-error and fatal states
    • still the ONLY seam the rest of the app talks to
    └── UnlayerEditor.jsx   (lazy chunk)
        • renders the step-02 chrome (header + Return action)
        • hosts <ImageEditor> from @unlayer/react-image-editor
```

Nothing outside `src/components/ImageEditor/` was modified for the swap. The
old hand-rolled engine (`ImageEditorPlaceholder.jsx`, `presets.js`,
`renderEngine.js`) was deleted.

## The contract (unchanged, still honored)

```jsx
<ImageEditorSlot
  source={state.editedImage || state.uploadedImage.dataUrl}
  onSave={(dataUrl, changed) => { actions.setEdited(dataUrl, changed); actions.go('identity') }}
  onCancel={() => actions.go('upload')}
/>
```

- `source` — data URL of the photographed (or already-edited) image.
- `onSave(dataUrl, changed)` — called with Unlayer's export.
- `onCancel()` — returns to the upload scene.

## How image data flows through the editor

```
PhotoUpload         → FileReader + local downscale → state.uploadedImage.dataUrl
EditorScene         → source = state.editedImage ?? uploadedImage.dataUrl
<ImageEditor image=…>  Unlayer decodes the data URL into its canvas
user edits          → crop/resize/filter/draw/text/shapes/stickers/frame
user presses Save   → Unlayer onSave({ dataUrl, blob })
ImageEditorSlot     → onSave(dataUrl, true) → actions.setEdited(dataUrl, true)
IdentityForm        → validate + build identity/dossier → decrypt →
DossierDocument     → <img src={state.editedImage}> (the EDITED image)
```

Because `onSave` forwards Unlayer's flattened canvas data URL verbatim, the
final dossier always uses the edited image — never the original upload.

## Configuration in use

```js
options: { theme: 'dark' }
minHeight: 560
style: { width: '100%', minHeight: 'min(72vh, 680px)' }
```

- Dark theme matches the obsidian/champagne design language.
- All default tools stay enabled (crop, resize, filter, draw, text, shapes,
  stickers, frame). AI Assistant is disabled (no `projectId`).
- `data-export-skip` on the host keeps `html-to-image` from ever capturing
  the editor (defensive; editor is not mounted on the dossier scene).

## Loading, error, and recovery handling (`ImageEditorSlot`)

| Situation | Behavior |
| --- | --- |
| Editor chunk loading | `Suspense` fallback: pulsing dot + "MOUNTING EDITOR MODULE…" |
| Render-time crash | `EditorLoadingBoundary` → fatal panel with "Reload Editor" / "Return to Upload" |
| Wrapper-level failure (`onError`) | Fatal panel showing the reported message; Reload Editor remounts (fresh `key`, Unlayer destroys + recreates the editor) |
| Image decode/CORS/404 failure (`onLoadError`) | Fatal panel: "Try Again" or "Return to Upload" |
| Missing `source` (e.g. reload into step 04) | Fatal panel with "Return to Upload" |

Remounting uses a `retryKey` bump as the `key` on the lazy editor, which
forces a clean Unlayer destroy/recreate cycle. Cancel is always routed to
`onCancel()` → `actions.go('upload')`, so application state is untouched.

## Limitations

- **Runtime CDN dependency.** The embedding script is fetched from
  `cdn.unlayer.com` on first editor mount. The rest of the app (landing →
  upload → cover → decrypt → dossier) still makes zero network requests; the
  editor chunk + CDN script load only when the editor scene is entered.
  `options.offline = true` skips editor API calls but still requires the CDN
  embed script (and a `licenseUrl` for paid offline entitlements), so it is
  not enabled.
- **Editor UI is Unlayer's.** Tool rail, icons, and panels come from the
  editor's own dark chrome rather than the hand-rolled toolbars it replaced.
  The surrounding scene, stepper, and typography are unchanged.
- **License review.** Unlayer's editor is MIT-licensed; verify current terms
  before shipping commercially (free tier / paid licenses).

## Rollback

Restore the deleted placeholder files and flip the lazy import back to
`./ImageEditorPlaceholder`; no other application code is coupled to Unlayer.