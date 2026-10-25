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
- v2.1 (2026-10-25, v=10): Belinda round 2 — pictures stored per-doc at 600px, say-twice hold, 4-choice side layout, public read, `?set=<id>` direct link, iOS 12 syntax/CSS fallbacks, login error by cause
- Image storage: uploaded pictures live in `cardSets/{setId}/images/{key}` (`{data: dataURL}`); set doc holds `img:<key>`; `splitSetImages`/`hydrateSetImages` in logic.js; Firestore persistence (IndexedDB) caches offline; localStorage keeps stripped set docs only. Old inline-image sets still work and split on next save
- Admin login: real email + password (Joel, Belinda). Sign-in is only needed to edit; 🔐 asks for the password only once a device is signed in
- Firestore rules deployed 2026-10-25: anyone can read cardSets + images (anon read 200, anon write 403); only the two admin UIDs can write
- Starter phrase set "Animals doing things" (custom_1792447007190) in Firestore — Belinda has ~24 phrases in it, all at the old 150px size (need re-upload to be sharp)
- Reply to Belinda ready: `docs/belinda-reply-2.txt` (not sent)

## Next Steps
1. Joel: send Belinda `docs/belinda-reply-2.txt`
2. Belinda: re-upload her phrase pictures (old ones were saved at 150px); send iPad mini models + iOS versions; report the new login error text if sign-in still fails
3. Test on a real iPad: side layout at portrait width, say-twice timing, offline play after first load, admin edit on a set that's been split
4. If Belinda's mini is iOS 12: confirm Firebase SDK 10.7.1 actually runs there (syntax is clean now; SDK support untested)
5. Optional deferred minors — auth+Firestore timeouts can stack; voiceschanged may not fire on iOS; import doesn't validate set shape; admin onclick uses raw set.id; `.phrase-main-picture` height fallback on iOS 12 phones is fixed 320px
6. Later: progress record idea; raise choices from 4 when Belinda asks

## Session Log
### 2026-10-25
- Belinda round 2 (combined email): blur root cause = 150px crop output; fixed with per-image Firestore docs (600px q0.85) + persistence; rules opened to public read (Joel's call)
- Say-twice completion (2s/1s), phrase-build 3-column layout with 4 big nowrap choices (2×2 under picture on phones), `?set=` link, iOS 12 cleanup (`??`/`?.`, clamp/aspect-ratio fallbacks), login error messages
- Verified real save/hydrate/re-save/delete round trip against production with a throwaway set from the signed-in localhost tab; 41 unit tests green
- Plan: `docs/superpowers/plans/2026-10-25-belinda-round-2.md`

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
