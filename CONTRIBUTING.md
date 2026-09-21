# Contributing to Undercover Identity

Thank you for wanting to help. This project welcomes contributions of any size — bug reports, design feedback, documentation, or code.

## Ground rules

- **No affiliation claims.** Undercover Identity is an original, fiction-only creative project. Do not add GTA, Rockstar, or Take-Two references, assets, or trademarked material.
- **Privacy by construction.** The application must stay fully client-side: no backend, no analytics, no network calls for the core experience, and no environment variable requirements.
- **No dead code.** Every addition is linted and tested. Keep the editor slot (`src/components/ImageEditor`) as the single seam for any future editor engine swap.

## Getting started

1. Fork the repository and clone it locally.
2. `npm install`
3. Create a feature branch: `git checkout -b feat/your-change`
4. Make your change. Run the full suite before you open a PR:
   - `npm run lint`
   - `npm test`
   - `npm run build`
   - `npm run qa`
5. Commit with a clear, descriptive message (see style below), push, and open a pull request.

## Commit style

Use concise, imperative, conventional-style messages:

- `feat: add a new dossier badge type`
- `fix: ensure codename validation trims whitespace`
- `test: cover reducer GO transitions`
- `docs: clarify deployment options`

## Development checks

| Check | Command | Failure means |
| --- | --- | --- |
| Lint | `npm run lint` | Style or unused-code problems |
| Unit tests | `npm test` | Logic regressions |
| Production build | `npm run build` | Bundling or static-analysis problems |
| QA smoke | `npm run qa` | The built app does not serve correctly |

CI runs all four on every push to a pull request.

## Code conventions

- **Language:** JavaScript (JSX). No TypeScript migrations without a dedicated discussion.
- **Components:** small, single-purpose files under `src/components/<Name>/index.jsx`.
- **State:** session state lives in the reducer (`src/context/identityReducer.js`). Add new state transitions there before reaching for local state.
- **Utilities:** pure functions in `src/utils/` with unit tests in `src/__tests__/`.
- **Styling:** use the design tokens in `src/styles/tokens.css`. Never hard-code brand colors or spacing in components.
- **Audio:** no bundled audio files. Sound cues are synthesized on-device via `src/utils/soundEngine.js` and are disabled by default.

## Reporting issues

Use the issue templates in `.github/ISSUE_TEMPLATE/`. Include browser/OS versions and a clear reproduction path. For security findings, follow [SECURITY.md](SECURITY.md) instead — do not open a public issue.

## Code of conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). Be kind, be specific, and assume good intent.