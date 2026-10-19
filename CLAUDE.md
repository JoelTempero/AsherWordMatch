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

## Code Conventions
- Built-in sets hardcoded in `builtInSets` (app.js); images in `images/words/*.png`
- Custom sets stored in Firestore, cached in `customSetsCache`
- 4 game modes: `match-pic`, `pic-word`, `match-word`, `word-pic`; mode switcher unlocked by long-press lock button
- Admin: image upload + crop/compress, set editor, JSON backup export/import

## Current Progress
- v2 merged to main and pushed 2026-10-20 (live):health pass, Firebase Auth (each admin signs in with their own email),words as typed, speech + hold, phrase sets (Picture→Phrase, Phrase→Picture)
- Spec: `docs/superpowers/specs/2026-10-18-word-match-v2-design.md`; plan: `docs/superpowers/plans/2026-10-18-word-match-v2.md`
- Draft reply to Belinda: `docs/belinda-reply.md` (simple-language rewrite, not sent yet)

## Next Steps (rollout — order matters)
- [x] Joel: enable Email/Password in Firebase console → Authentication
- [x] Two admin accounts created (Joel + Belinda, real emails); rules allow only their UIDs
- [x] Test sign-in locally, then merge to main + push (Pages goes live)
- [ ] Belinda signs in once on every iPad (home-screen icon recommended)
- [ ] ONLY THEN deploy rules: `firebase deploy --only firestore:rules` → verify REST read returns 403
- [ ] Send Belinda the reply; test speech on a real iPad
- [ ] Deferred minors from final review (see session log)

## Session Log
### 2026-10-18
- Created CLAUDE.md; health check found open Firestore (public read), small-set freeze, broken backup import, double-scoring
- Brainstormed + specced + planned + built v2 (9 tasks, 32 unit tests, opus final review; 4 Important fixed)
- Queued Night Rounds `public-repo-audit` (32 public repos, created Nov 2025–Mar 2026)
- 2026-10-20: login switched to real email + password (two admin accounts); rules locked to the two UIDs
- 2026-10-20: seeded "Animals doing things" phrase set into production Firestore (custom_1792447007190, 9 emoji placeholder pictures, no text) for Belinda to edit
- Deferred minors: auth+Firestoretimeouts can stack to ~13s; voiceschanged may not fire on iOS; import doesn't validate set shape; admin onclick uses raw set.id; offline cache silently stops past ~5MB; login error doesn't distinguish network failure

## Key Decisions
- Single-file vanilla app, no build step — keep it that way

## Known Issues
- Old belinda/asher login is in public git history — harmless now (no such account)
- New admins need their UID added to `firestore.rules` and redeployed
- Firestore is publicly readable until rules are deployed (see Next Steps)
- Manifest exists but no service worker → no full offline launch (deliberately out of scope)
- `.DS_Store` committed
