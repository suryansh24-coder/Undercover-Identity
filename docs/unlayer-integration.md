# Unlayer react-image-editor integration

> **Status: NOT integrated.** This document is the plan for the next phase.
> The current editor works and ships without Unlayer.

## Why the slot exists

`src/components/ImageEditor/index.jsx` was designed so the entire editor can be
replaced by swapping a single lazy import — no changes to scenes, state, save
handlers, or styling required.

Current backing: `ImageEditorPlaceholder` (a hand-rolled module with real
filters, crop, draw, text, stickers, undo/reset, and resize, rendered on
`<canvas>` and exported via `renderComposite`).

Target backing: `@unlayer/react-image-editor`.

## The contract (must be preserved)

```jsx
<ImageEditorSlot
  source={dataUrl}              // string — the uploaded/session image
  onSave={(dataUrl, changed) => unit()}   // dataUrl: string, changed: boolean
  onCancel={() => unit()}
/>
```

- `source` — the image to open in the editor.
- `onSave` — called with the final image as a data URL plus whether the user
  made any changes. The scene then commits `setEdited(dataUrl, changed)` and
  advances to `identity`.
- `onCancel` — user returns to `upload` without saving.

## Swap steps

1. `npm install @unlayer/react-image-editor`
2. In `src/components/ImageEditor/index.jsx`, replace the lazy target:

   ```js
   // before
   const PlaceholderEditor = lazy(() =>
     import('./ImageEditorPlaceholder').then((mod) => ({ default: mod.default }))
   )

   // after
   import ReactImageEditor from '@unlayer/react-image-editor'
   ```

3. Rename `PlaceholderEditor` usage to `ReactImageEditor` and pass its
   documented props:
   - `source={source}`
   - `onSave={onSave}` — map Unlayer's export to `(dataUrl, changed)`.
   - `onCancel={onCancel}`
4. Remove `ImageEditorPlaceholder.jsx`, its co-located CSS usage, and the
   now-unused `presets.js` / `renderEngine.js` pieces (keep shareable camera
   presets if you want them as default export options).
5. Delete the obsolete tests/chunks that referenced the placeholder if any.

## Suggested defaults

Unlayer ships size/quality defaults. To keep the dossier crisp we recommend:

- Export format: PNG
- Max width based on the current `RESIZE_PRESETS` scale behavior (2060px on a
  1600px auto-scaled ingest) — roughly double-resolution export,
  quality 0.92.

## Risks / notes

- **Bundle size.** Unlayer adds a large vendored chunk. It will be lazy-loaded
  in the same slot, so the main bundle is unaffected; verify the chunk splits
  correctly (one separate async chunk) after the swap.
- **Styling.** Unlayer renders its own chrome. Apply the editor's themed
  wrapper classes (`editor-tools`, `editor-panel`, etc.) sparingly; prefer
  Unlayer's theme config so the toolbars match the design tokens.
- **SSR none.** This app is client-rendered only, so no guard is needed.
- **License.** Review Unlayer's licensing terms for commercial use before
  shipping it to production.

## Acceptance criteria for the swap

- [ ] Flow unchanged: upload → editor → save → cover → decrypt → dossier
- [ ] `onSave` produces a data URL that round-trips through the dossier photo
- [ ] `npm run lint`, `npm test`, `npm run build`, `npm run qa` all pass
- [ ] Editor chunk still lazy-loads (separate async asset)
- [ ] CHANGELOG entry under `[Unreleased]` moved to released