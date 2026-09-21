# Security Policy

## Design posture

Undercover Identity is **privacy-first by construction**:

- **No backend.** There are no servers, no databases, no API integrations.
- **No network calls.** The core experience makes zero outbound requests. Fonts are bundled locally via Fontsource; audio cues are synthesized on-device by the Web Audio API.
- **No storage of your data.** Uploads, edits, and the generated dossier exist only in memory for the duration of the session and are wiped on `RESET` or page close.
- **No analytics, no cookies, no trackers.**
- **No environment variables are required** — there is no secret material to leak.

This means the standard threat model is: *whatever you type and upload, stays on your device.*

## If you still find a problem

If you believe you have found a security-related bug — something that could leak session data, bypass client-side expectations, or compromise a user — please **do not open a public issue**.

Instead, report it privately by opening a GitHub issue with the `security` label on the repository (private reports surface to maintainers only), or contact the repository owner directly via the issue tracker.

Please include:

1. The affected version or commit
2. A clear, minimal reproduction
3. Your suggested impact assessment

## Disclosure

We aim to acknowledge reports within 5 business days and to act on confirmed issues promptly. Public disclosure happens only after a fix is available.

## Reporting community issues

For non-security bugs and feature requests, please use the regular issue templates.