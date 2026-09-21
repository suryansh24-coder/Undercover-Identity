# User flow

Undercover Identity is a linear, cinematic experience with one optional
escape hatch per step. This is the complete journey an operative takes.

## Step map

```
LANDING → SECURITY → UPLOAD → EDITOR → COVER → DECRYPT → DOSSIER
 (tr01)                       (tr03)   (tr05)   (tr07)
```

All transition animations are skipped when the user prefers reduced motion.

## 01 — Landing

- Cinematic title, tagline, system identifiers, "ENTER THE SYSTEM" entry.
- Atmosphere: concentric rings, radar/targeting geometry, an encrypted
  micro-text telemetry strip, and cursor-responsive lighting (fine pointers
  only; disabled under reduced motion).
- Entry fires a seven-line secure-channel transition before the clearance
  scene.
- Details: no images, no input.
- Exit path: none (entry required).

## 02 — Security Clearance

- Level-09 induction passage; "ACCESS GRANTED" confirms eligibility and
  issues the OPERATION NIGHTFALL mission briefing (your identity has been
  compromised — forge a new cover).
- Exit path: back to landing via "Return".

## 03 — Photograph

- Upload a JPG / PNG / WEBP image, ≤ 12 MB. Drops and pastes are accepted.
- The file is validated, read, and pre-scaled to ≤1600px locally.
- A preview card shows the selected image plus file metadata; "Modify" or
  "Regenerate" (pick again) actions.
- Exit paths: back to clearance, or cancel the selection and clear it.

## 04 — Editor

- The **Identity Modification Terminal** hosts the full Unlayer editor:
  filters, crop, draw, text, shapes, stickers, resize.
- A pipeline strip tracks SOURCE IMAGE → COVER IDENTITY → CLASSIFICATION
  (UNVERIFIED until save).
- Tool rail docks on the right; canvas in the center; options panel beside
  the rail (stacks below on mobile).
- **Save & Continue** briefly shows the completion frame (image integrity
  verified, simulated 97.4% identity match) before committing the edited data
  URL and advancing to Cover.
- **Cancel / Return to Upload** discards edits to the session image and
  returns to Photograph.
- If the session has no photograph (e.g. a direct browser reload into this
  step), the scene shows a contained recovery view.

## 05 — Cover (identity form)

- Fields: codename, operation, specialization (suggested), location
  (suggested), clearance level, operative status, case file number
  (auto-issued, regenerable), plus optional associates / vehicle / trait.
- Per-field validation runs on breach of rules; the classify action marks all
  fields touched and surfaces a failure toast for required-field errors.
- "Classify Identity" validates, builds the identity + dossier deterministically,
  and advances to the decrypt scene.
- Exit path: back to the editor.

## 06 — Decrypt

- Autonomous two-phase sequence: the cover is CLASSIFIED (five lines), then
  DECRYPTED (six lines) with a progress rail and noise fragments, finishing
  with a "MATCH FOUND / IDENTITY CONFIRMED" scan reveal before auto-advancing
  to the dossier.
- Skippable after the first beat via the on-screen "SKIP" action or the
  Escape key; reduced-motion users get an automatic fast path.

## 07 — Dossier

- The classified document is rendered with 3D tilt + pointer glare.
- **Download Dossier** — exports the document node to a PNG via html-to-image.
- **Copy Identity** — writes the dossier text (headings + identity + metadata)
  to the clipboard.
- **Share / Share · Copy** — uses the Web Share API when available, else
  copies a `#`-anchored summary to the clipboard.
- **Create New Identity** — plays a wipe cue and resets the session while
  keeping the sound preference.

## Guard rails

- The step order is enforced by the reducer: steps cannot be skipped forward.
- Resetting from any point returns to Landing with a "SESSION WIPED · NEW
  OPERATIVE" toast.
- All data lives in React state; nothing is persisted across reloads.