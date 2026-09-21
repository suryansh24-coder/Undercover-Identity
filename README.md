# Undercover Identity

> **YOUR IDENTITY IS CLASSIFIED.**

A cinematic, session-local intelligence experience built with React + Vite. Enter the system, upload your photograph, craft an undercover cover story, and receive a classified dossier — rendered entirely in your browser. Nothing is uploaded, tracked, or stored anywhere.

```
  UNDERCOVER IDENTITY
  INDEPENDENT INTELLIGENCE DIVISION
  SESSION-LOCAL · NO UPLOADS · NO TRACKING
```

---

## What it does

Undercover Identity is a self-contained, single-page experience that walks an operative through a complete workflow:

| Step | Scene | What happens |
| --- | --- | --- |
| 01 | **Landing** | Cinematic entry screen. Enter the system. |
| 02 | **Security Clearance** | Level-09 clearance induction before dossier access. |
| 03 | **Photograph** | Upload a photo (JPG / PNG / WEBP, ≤12 MB), pre-scaled locally. |
| 04 | **Modify** | Full working in-browser image editor: filters, crop, draw, text, stickers, resize. |
| 05 | **Cover** | Build your undercover identity: codename, operation, specialization, location, clearance, status, case file. |
| 06 | **Decrypt** | Cinematic decryption sequence reveals "IDENTITY LOCATED." |
| 07 | **Dossier** | A full classified dossier document is rendered — download it as a PNG, copy it, or share it. |

The result is a shareable, screen-capturable dossier that merges your photo, your cover story, and procedural details (case file number, document ID, classification band, barcode) into one piece of intelligence-theater.

## Highlights

- **Fully in-browser.** Images never leave the device. Reading, validation, scaling, editing, and dossier composition use Web APIs only (`FileReader`, `<canvas>`, `URL.createObjectURL`).
- **Working, swappable image editor.** The editor lives behind a single lazy-loaded slot component (`src/components/ImageEditor`). It is currently backed by a hand-rolled editor module (`ImageEditorPlaceholder`) and is explicitly **not yet connected to Unlayer** — swapping the engine requires changing one lazy import and nothing else.
- **Cinematic presentation.** Obsidian/ink palette, champagne-gold identity accents, Anton display type, IBM Plex Mono system text, film-grain and scanline atmosphere, custom cursor, tilt + glare on the final document, optional system audio (off by default).
- **Deterministic session state.** A small reducer (`src/context/identityReducer.js`) drives the workflow; every transition, notification, overlay, and reset is explicit and testable.
- **Production quality.** ESLint clean, 32 unit tests, a strict production build, and a QA smoke script that boots `vite preview` and verifies the built assets.

## Project status

| Area | Status |
| --- | --- |
| Experience flow | Complete |
| Image editor (placeholder module) | Complete — real filters/crop/draw/text/stickers |
| Unlayer integration | **Not started by design** (see [docs/unlayer-integration.md](docs/unlayer-integration.md)) |
| Tests | 32 unit tests across validation, reducer, generation utilities |
| CI | GitHub Actions (lint + test + build + QA) |
| Production build | Verified — 0 modules transformed after initial scaffold config, QA smoke 13/13 |

## Getting started

> Requires **Node 18+** (developed on Node 24). No environment variables are required.

```bash
npm install
npm run dev        # start the dev server
```

Open the printed local URL (default `http://localhost:5173`).

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | ESLint across `src/`, configs, and scripts |
| `npm test` | Run the Vitest unit suite |
| `npm run test:watch` | Unit tests in watch mode |
| `npm run qa` | Smoke-test the production build (boots preview, checks assets) |

## Project structure

```
.
├── src/
│   ├── components/        # scenes, primitives, chrome (cursor, nav, toasts)
│   │   ├── ImageEditor/   # THE editor slot + placeholder engine
│   │   ├── Dossier/       # document rendering + export actions
│   │   └── ...
│   ├── context/           # identityReducer + IdentityProvider (session state)
│   ├── data/              # cover details: locations, specializations, levels, statuses
│   ├── hooks/             # small, single-purpose hooks
│   ├── styles/            # design tokens + section stylesheets
│   ├── utils/             # pure, unit-tested utilities
│   └── __tests__/         # Vitest suites
├── docs/                  # architecture, design system, deployment, Unlayer notes
├── scripts/               # qa-smoke.mjs
├── public/                # favicon.svg, og.png
├── index.html
└── vite.config.js
```

## Documentation

- [Architecture](docs/architecture.md)
- [User flow](docs/user-flow.md)
- [Design system](docs/design-system.md)
- [Development guide](docs/development.md)
- [Deployment](docs/deployment.md)
- [Unlayer integration notes](docs/unlayer-integration.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). All contributions are welcome — please open an issue or a pull request.

## Security

Undercover Identity is privacy-first by construction: there is **no backend, no analytics, no storage, and no network calls**. See [SECURITY.md](SECURITY.md) for details and our reporting policy.

## License

Released under the [MIT License](LICENSE). Audio cues are synthesized on-device; no third-party assets are bundled.

---

*Undercover Identity is an original, fiction-only creative project. "Vice City" is used as a fictional setting. This project is not affiliated with, endorsed by, or related to Grand Theft Auto VI, Rockstar Games, or Take-Two Interactive.*