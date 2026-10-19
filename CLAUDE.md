# Asher Word Match

## Overview
- **Client**: Personal (for Asher; admin user is Belinda)
- **Type**: PWA — kids' picture/word matching game with an admin portal for custom word sets
- **Status**: Live (GitHub Pages, `/AsherWordMatch/`)

## Playbooks In Use
Read from Brain at session start. Do not copy into this project.
Brain path: `D:/Sidequest Digital/Dev Projects/Brain/playbooks/`

### Always (load every session)
- `playbooks/JoelTempero.md` — working profile
- `playbooks/TokenDiscipline.md` — token hygiene

### Current phase: Maintenance
- (none — small tweaks only)

### Available (load when phase changes)
- Security, Accessibility, ErrorHandling, Testing, DesignSystem, Deployment

## Tech Stack
- **Frontend**: Vanilla HTML/CSS/JS — `index.html` (markup + inline CSS), `app.js` (DOM/Firebase/speech), `logic.js` (pure, tested)
- **Backend/DB**: Firebase Firestore + Auth (compat SDK 10.7.1, loaded at runtime by `loadFirebase()`), project `word-match-game-3c60d`; localStorage offline copy; rules in `firestore.rules`
- **Hosting**: GitHub Pages (`origin` = JoelTempero/AsherWordMatch); `sq-backup` remote = auto backups
- **Fonts**: Fredoka + Nunito (Google Fonts)

## Build & Dev Commands
- No build. Serve: `npx --yes serve -l 5173 .` → http://localhost:5173/?dev (`?dev` adds never-saved test sets)
- Test: `node --test tests/*.test.js` (pure logic in `logic.js`)
- Bump `?v=N` on the logic.js/app.js script tags when changing them (iPad cache-bust)
- Deploy: push to `origin/main`.
- Rules: `npx firebase-tools deploy --only firestore:rules --project word-match-game-3c60d --account leojfx@gmail.com` (project is owned by leojfx@gmail.com, not joel@tempero.nz)

## Code Conventions
- Built-in sets hardcoded in `builtInSets` (app.js); images in `images/words/*.png`
- Custom sets stored in Firestore, cached in `customSetsCache`
- 4 game modes: `match-pic`, `pic-word`, `match-word`, `word-pic`; mode switcher unlocked by long-press lock button
- Admin: image upload + crop/compress, set editor, JSON backup export/import

## Current Progress
- v2 live on main (2026-10-20): health pass, words as typed, speech + hold, phrase sets (Picture→Phrase, Phrase→Picture)
- Admin login: real email + password (Joel, Belinda). First sign-in on a device unlocks family sets; after that 🔐 asks for the password only
- Firestore rules deployed: only the two admin UIDs can read/write; anonymous read → 403; self sign-up disabled
- Starter phrase set "Animals doing things" seeded in Firestore (emoji placeholders, no text)
- Reply to Belinda ready: `docs/belinda-reply.txt` (paste into email; not sent yet)

## Next Steps
1. Joel: send Belinda `docs/belinda-reply.txt`, and her password separately
2. Belinda signs in once on every iPad — until then those iPads show built-in sets only (on-screen note tells her)
3. Test speech + phrase modes on a real iPad (voice choice, emoji placeholder rendering, password-only admin box)
4. When Belinda sends real phrase pictures: help her swap them into "Animals doing things"
5. Optional: deferred minors — auth+Firestore timeouts can stack to ~13s; voiceschanged may not fire on iOS; import doesn't validate set shape; admin onclick uses raw set.id; offline cache silently stops past ~5MB; login error doesn't distinguish network failure
6. Later: progress record idea (pending Belinda's reply)

## Session Log
### 2026-10-20
- Login switched to real email + password (two admin accounts); rules locked to the two UIDs and deployed
- Text-free placeholder phrase pictures; seeded "Animals doing things" (custom_1792447007190) into production
- Merged v2 to main, pushed, Pages live (v=9); password-only admin box once a device is signed in
- Belinda reply rewritten in simple language + plain-text copy
- Gotcha: Firebase project is owned by leojfx@gmail.com — CLI deploys need `--account leojfx@gmail.com`

### 2026-10-18
- Created CLAUDE.md; health check found open Firestore (public read), small-set freeze, broken backup import, double-scoring
- Brainstormed + specced + planned + built v2 (9 tasks, 32 unit tests, opus final review; 4 Important fixed)
- Queued Night Rounds `public-repo-audit` (32 public repos, created Nov 2025–Mar 2026)

## Key Decisions
- Single-file vanilla app, no build step — keep it that way
- Phrases are a set type inside the same app, not a separate app
- Rules lock to UIDs, not emails (keeps Belinda's Gmail out of the public repo)
- Locked rules before Belinda signed in on iPads (Joel's call; gap is self-explaining via the on-screen note)

## Known Issues
- New admins need their UID added to `firestore.rules` and redeployed
- Old belinda/asher login is in public git history — harmless (no such account)
- Manifest exists but no service worker → no full offline launch (deliberately out of scope)
- `.DS_Store` committed
