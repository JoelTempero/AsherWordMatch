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
- **Frontend**: Vanilla HTML/CSS/JS — `index.html` (markup + inline CSS), `app.js` (all logic)
- **Backend/DB**: Firebase Firestore (compat SDK 10.7.1 via CDN), project `word-match-game-3c60d`; localStorage fallback
- **Hosting**: GitHub Pages (`origin` = JoelTempero/AsherWordMatch); `sq-backup` remote = auto backups
- **Fonts**: Fredoka + Nunito (Google Fonts)

## Build & Dev Commands
- No build. Serve the folder statically (e.g. `npx serve .`) and open `index.html`.
- Deploy: push to `origin/main`.

## Code Conventions
- Built-in sets hardcoded in `builtInSets` (app.js); images in `images/words/*.png`
- Custom sets stored in Firestore, cached in `customSetsCache`
- 4 game modes: `match-pic`, `pic-word`, `match-word`, `word-pic`; mode switcher unlocked by long-press lock button
- Admin: image upload + crop/compress, set editor, JSON backup export/import

## Current Progress
- Game, 4 modes, admin portal, Firebase sync, backup/restore all working
- 20-word-per-set limit removed from admin (last real change)

## Next Steps
- [ ] Decide what to work on (see Known Issues for candidates)

## Session Log
### 2026-10-18
- Created CLAUDE.md from folder scan

## Key Decisions
- Single-file vanilla app, no build step — keep it that way

## Known Issues
- Admin login is hardcoded client-side (`belinda`/`asher` in app.js) — fine for a family app, not real security; Firestore rules unknown
- Manifest exists but no service worker → not installable offline as a true PWA
- `.DS_Store` committed
