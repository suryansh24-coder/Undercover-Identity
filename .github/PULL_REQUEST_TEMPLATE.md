name: Pull Request Template
description: Standard PR description for Undercover Identity
labels: []
---

## What changed

Brief description of the change.

## Why

What motivated the change.

## What to check

- [ ] `npm run lint` passes (0 errors)
- [ ] `npm test` passes (32 tests)
- [ ] `npm run build` succeeds
- [ ] `npm run qa` passes (production smoke checks)
- [ ] Image editor slot (`src/components/ImageEditor/index.jsx`) is unchanged (unless the change is deliberately editor-related)
- [ ] No new network requests in the core experience
- [ ] No new environment variables required

## Screenshots / notes

If applicable.