# Development guide

## Requirements

- Node 18+ (developed against Node 24)
- npm (lockfile committed as `package-lock.json`)

No environment variables are required to develop, build, test, or run this
project.

## Quick start

```bash
npm install
npm run dev
```

Open the URL printed by Vite (default `http://localhost:5173`).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Type-checkless production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint over `src/`, configs, and scripts |
| `npm test` | One-shot Vitest run (jsdom) |
| `npm run test:watch` | Vitest watch mode |
| `npm run qa` | Smoke test the production build (boots preview, asserts assets) |

## Conventions

- **JSX, not TypeScript.** Keep it idiomatic ES2022.
- **One component per folder** — `src/components/<Name>/index.jsx`, with
  private helper components co-located in the same folder.
- **Session state through the reducer.** Add new transitions to
  `src/context/identityReducer.js` and expose actions via
  `IdentityContext`. Reserve component-local `useState` for ephemeral UI.
- **Pure utils get tests.** Anything in `src/utils/` with logic should have a
  matching suite in `src/__tests__/`.
- **Design tokens only.** No magic colors/spacing in components — extend
  `src/styles/tokens.css` instead.
- **No dead code.** Unused imports, params, and vars are lint errors.

## Verification checklist (run before pushing)

```bash
npm run lint
npm test
npm run build
npm run qa
```

CI runs the same four on every PR.

## Testing notes

- Tests use jsdom. `src/test/setup.js` wires `@testing-library/jest-dom`.
- Reducer and utility tests avoid UI rendering, keeping them fast
  (~3–4s for the whole suite).
- To add a test suite: create `src/__tests__/<name>.test.js` and import
  directly from source modules.

## Working on the image editor

The editor lives in `src/components/ImageEditor/` with two files:

- `index.jsx` — the slot (lazy loading, error recovery). Do not change callers.
- `UnlayerEditor.jsx` — thin adapter over the official
  `@unlayer/react-image-editor` (scene chrome + prop mapping).

The wrapper renders Unlayer's own editor UI in its dark theme. To adjust the
toolset, set `options.features.imageEditor.tools` in `UnlayerEditor.jsx`. See
[docs/unlayer-integration.md](unlayer-integration.md).

## Troubleshooting

- **`npm install` fails on esbuild postinstall** — on restricted systems run
  `npm approve-scripts esbuild` after install (trusted package scripts).
- **Port already in use** — Vite auto-increments; for `vite preview` use
  `npm run preview -- --port 4174 --strictPort`.
- **Lint warnings about hooks exports** — the two
  `react-refresh/only-export-components` warnings in `IdentityContext.jsx`
  are expected (a provider + hooks in one file) and are non-blocking.