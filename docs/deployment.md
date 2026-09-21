# Deployment

Undercover Identity is a fully static site. The entire application is
client-side — there is no server runtime, no environment configuration, and
no secrets. It can be served from any static file host.

## Build

```bash
npm install
npm run build
```

Output lands in `dist/`. Verify it locally before shipping:

```bash
npm run preview   # serves dist/ locally
npm run qa        # boots preview and asserts the assets serve correctly
```

## Options

### GitHub Pages

1. Build locally, or let CI build (see `.github/workflows/ci.yml`).
2. Publish the contents of `dist/` to `gh-pages` (`gh-pages`, `wrangler
   pages deploy dist`, or any tool that pushes a folder).

Because everything runs in the browser, the site works from any path —
but the OG image and favicon in `index.html` use absolute paths (`/og.png`,
`/favicon.svg`). For project-page URLs (`/repo/`), set `base` in
`vite.config.js` to `'/repo/'` and rebuild so those asset URLs resolve.

### Cloudflare Pages / Netlify / Vercel

- Build command: `npm run build`
- Output directory: `dist`
- No environment variables are required.

### Any static server / CDN

Copy `dist/` to your server root. The app issues no runtime requests beyond
its own bundled assets, so relative hosting works as long as `base` matches
your mount path.

## Content security

The app never sets remote CSP headers itself. If your host sets a CSP, the
inline elements you may need to allow are:

- `img-src 'self' data: blob:` — uploaded photos and canvas exports
- `font-src 'self'` — bundled font sheets
- `connect-src 'self'` — nothing remote is fetched, but keep this tight

## SEO / social

`index.html` ships Open Graph and Twitter card meta with `/og.png`
(1200×630). Confirm the asset is re-uploaded if you move hosts.

## No-tracking promise

Deployments must not add analytics or external beacons: the project's privacy
posture is part of its identity (see `SECURITY.md`).