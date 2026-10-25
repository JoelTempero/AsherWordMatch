# Belinda round 2 — plan (2026-10-25)

Source: Belinda's combined email (4 items). Decisions from Joel: proper image storage fix;
iOS 12 cleanup + login error + draft email; family sets readable without sign-in (write stays locked).

## Findings
- Blur root cause: `applyCrop` saves 150×150 JPEG q0.75; main picture shows at 280 CSS px (560 device px on iPad). Built-ins are 492px PNGs.
- Images live as base64 inside the set doc (1MB Firestore cap) → sharp images need their own docs.
- Old iPad: `??` ×2 (logic.js) and `?.` ×1 (app.js) are SyntaxErrors on iOS ≤12; `aspect-ratio`/`clamp()`/`min()` unsupported on iOS <13.1/15. iOS 9 (mini 1) is unrecoverable.
- The "won't log in" iPad runs current code; login failure is swallowed as "Wrong email or password".

## Tasks
1. [x] Plan
2. [x] logic.js + tests: `isImageRef`, `splitSetImages`, `hydrateSetImages`, `speakThen({holdMs})`, `sayTwiceThen`, `buildChoices` n=4, drop `??`
3. [x] app.js storage: images in `cardSets/{id}/images/{key}`; hydrate on game start / edit / export; batch save + orphan cleanup; delete subcollection; Firestore persistence; localStorage keeps stripped docs; crop output 600px q0.85
4. [x] firestore.rules: public read, admin-only write, subcollection covered; deploy
5. [x] Completion flow: say → 2s → say → 1s → advance (both phrase modes)
6. [x] Layout: 3-column phrase-build (2 words | picture+slots | 2 words), bigger cards, nowrap, 2×2 fallback under 600px
7. [x] iOS 12: remove `?.`, CSS fallbacks (font-size before clamp, `@supports not (aspect-ratio)`), login error by cause, `?set=<id>` direct link
8. [x] Bump `?v=10`, tests green, browser check (dev sets), commit, push, deploy rules
9. [x] Draft `docs/belinda-reply-2.txt`; CLAUDE.md wrap-up
