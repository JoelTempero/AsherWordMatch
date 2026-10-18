# Word Match v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden the app, add spoken words with a pause, and add phrase sets with two modes.
**Architecture:** Pure, DOM-free logic goes in a new `logic.js`, which is loaded before `app.js` and exports its functions both as browser globals and through `module.exports` for `node --test`. DOM, Firebase and speech wiring stay in `app.js`. No build step.
**Tech Stack:** Vanilla JS, Firebase compat SDK 10.7.1 (app, firestore, **auth**), `node:test` (Node 24, no dependencies), `speechSynthesis`.
**Spec:** `docs/superpowers/specs/2026-10-18-word-match-v2-design.md`

## Global Constraints
- No build step and no npm dependencies. Use Firebase compat 10.7.1 from gstatic only.
- Target iPad Safari, both the home-screen app and the browser. Keep mouse support for desktop testing.
- Login is still `belinda` / `asher` as typed. Protection only needs to stop casual visitors.
- Never write test data to production Firestore. Dev fixtures use ids starting `dev_`, and the save and delete functions refuse those ids.
- No visual redesign. The reshuffle after every match stays.
- Bump the cache-bust version on both script tags (`logic.js?v=N`, `app.js?v=N`) in every task that changes them.
- Commit on branch `v2-health-speech-phrases`. Don't push to `main` before Task 9.

## Review Focus
1. Duplicate words in a set (two "Mum" photos): never two correct cells, never a hang. → Task 1 test `pickOtherWords excludes same-word entries`.
2. Duplicate phrase items (same first and second word): never two correct pictures in mode 2. → Task 7 test `pickPhrasePictures never includes a second correct answer`.
3. iOS returns an empty `getVoices()` until `voiceschanged` fires, and `onend` never fires. → Task 5 tests `speakThen falls back after 4000ms` and `pickVoice returns null for empty list`.
4. Firebase blocked by a school filter or offline: the menu must not sit on "Loading…". Show built-in sets plus the cached sets within 8s. → Task 3 test `withTimeout rejects after ms`, plus a manual check.
5. Capitals, apostrophes and quotes in words ("Nana's", `5" nails`): they render, match and edit correctly. → Task 1 test `escapeHtml escapes quotes`, plus a manual check in Task 6.

---

### Task 1: logic.js + test harness, small-set freeze, HTML escaping (A2, A7a)
**Files:** Create `logic.js`, `tests/logic.test.js`. Modify `index.html:984` to add `<script src="logic.js?v=2">` before `app.js?v=2`. Modify `app.js`: move `shuffleArray` to logic.js and rework `renderCurrentRound` (lines 473–577).
**Produces:** `shuffleArray(arr)`, `escapeHtml(str) -> string` (escapes `& < > " '`), `pickOtherWords(words, current, max=8) -> word[]` (distinct by `.word`, excludes any entry whose `.word === current.word`, shuffled, length ≤ max).
- [ ] **Test:** `pickOtherWords` with 3 words returns 2. With 20 words returns 8. `pickOtherWords excludes same-word entries`: [Mum(a), Mum(b), Dad, Nan] with current Mum(a) returns [Dad, Nan]. `escapeHtml escapes quotes`: `escapeHtml('Nana\'s "x" <b>')` === `'Nana&#39;s &quot;x&quot; &lt;b&gt;'`.
- [ ] Run `node --test tests/`. Expected: FAIL (module missing).
- [ ] Implement logic.js. End it with `if (typeof module !== 'undefined') module.exports = {...}`.
- [ ] Rewrite the grid build. Show `others.length` surrounding cells (from `pickOtherWords`) plus exactly one correct cell, at random positions from `[0,1,2,3,5,6,7,8]`. Leave unused positions as empty `.grid-cell.empty` so the centre stays centred. Remove the infinite `while` and the tempDiv patch-up. Run every word, name and image src that goes into innerHTML through `escapeHtml`, here and in `renderSetList`, `renderAdminSetList` and `renderWordList`.
- [ ] Run `node --test tests/`. Expected: PASS. **Manual:** serve with `npx --yes serve -l 5173 .`, then play a 3-word set and a 4-word set (in dev mode, Task 3). No hang, and exactly one correct cell.
- [ ] Commit `fix: small sets no longer freeze; escape user text`.

### Task 2: Round lock + drag lifecycle (A4, A5)
**Files:** Modify `app.js` `setupDragAndDrop`, `handleDrop`, `setupCropEvents`.
**Produces:** `gameState.roundLocked: boolean`. It's set true on a correct drop and cleared in `renderCurrentRound`. While it's true, `handleStart` and `handleDrop` return immediately.
- [ ] Register the document-level `mousemove/mouseup/touchmove/touchend/touchcancel` handlers **once** (module-level, in `setupEventListeners`). They act on a module-level `drag` object `{el, clone, touchId}`. `setupDragAndDrop` only binds `touchstart`/`mousedown` on the new draggable.
- [ ] Track `touchId` from `changedTouches[0].identifier`. Ignore touches with other ids, and ignore new starts while a drag is active. `touchcancel` removes the clone and resets without scoring.
- [ ] Apply the same register-once approach to the crop tool's document listeners.
- [ ] **Manual (Chrome devtools, iPad emulation):** a fast double-drop on the correct cell scores 1, not 2. Dragging with a second simulated finger leaves no stuck clone. After 30 rounds, `getEventListeners(document).touchend.length` is still 1.
- [ ] Commit `fix: lock input after correct match; no drag listener leak`.

### Task 3: Data robustness (A3, A6, A7b, A7c) + dev fixtures
**Files:** Modify `app.js` data functions (lines 150–205, 1048–1200). Add to `logic.js`. Create `dev-fixtures.js`.
**Produces:** `withTimeout(promise, ms) -> Promise` (rejects with `Error('timeout')`), `estimateSetBytes(set) -> number` (UTF-8 byte length of `JSON.stringify(set)`), `SET_WARN_BYTES = 800000`, `SET_MAX_BYTES = 1000000`.
- [ ] **Test:** `withTimeout rejects after ms` (uses a never-resolving promise and 10ms), `withTimeout passes through value`, `estimateSetBytes` counts multibyte characters (e.g. `'ā'` counts as 2).
- [ ] Run, FAIL. Implement. Run, PASS.
- [ ] `loadCustomSetsFromFirebase`: wrap `get()` in `withTimeout(…, 8000)`. On success, write `wordMatchCustomSets` to localStorage. Wrap every setItem in try/catch and only `console.warn` on quota errors. In `saveSetToFirebase`, only show the "saved locally only" alert when the Firestore write itself failed.
- [ ] `importBackup`: `await saveSetToFirebase(set)` for each new set, then refresh the list.
- [ ] In `saveSet`, if bytes > `SET_WARN_BYTES`, confirm with "This set is getting very large (N KB of 1000 KB)…". If bytes > `SET_MAX_BYTES`, alert and block the save.
- [ ] Give every game and editor `<img>` `onerror` that swaps in an inline neutral SVG placeholder (a grey rounded square). Also set `onerror` to null so it can't loop.
- [ ] `dev-fixtures.js` defines `window.DEV_SETS`: a word set `dev_small` with 3 words using built-in images, and a phrase set `dev_phrase` with 9 items (cow/dog/cat × eating/sleeping/running) whose images are SVG data URIs of emoji plus label. In `init`, if `location.search` has `dev`, inject the script, then append `DEV_SETS` to `customSetsCache` (never saved). `saveSetToFirebase` and `deleteSetFromFirebase` return false for ids starting `dev_`.
- [ ] **Manual:** devtools offline, reload. The menu shows built-ins plus cached sets within about 8s. Import a backup file, reload, and the imported sets persist (use a renamed `dev_`-free test set, then delete it afterwards).
- [ ] Commit `fix: cache on load, real backup import, load timeout, size warning`.

### Task 4: Firebase Auth with the existing login (A1)
**Files:** Modify `index.html` (add `firebase-auth-compat.js` 10.7.1 after firestore, plus a `#familyNote` element in the menu), `app.js` (init, login, logout). Create `firestore.rules`, `firebase.json` (no deploy in this task). Add to `logic.js`.
**Produces:** `toFirebaseCredentials(username, password) -> {email, password}` where email = `` `${username.trim().toLowerCase()}@word-match-game-3c60d.firebaseapp.com` `` and password = `password + '-wordmatch'`. Also `waitForAuthReady() -> Promise<User|null>` (in app.js; resolves on the first `onAuthStateChanged`).
- [ ] **Test:** `toFirebaseCredentials(' Belinda ', 'asher')` → `{email:'belinda@word-match-game-3c60d.firebaseapp.com', password:'asher-wordmatch'}`.
- [ ] Run, FAIL. Implement. Run, PASS.
- [ ] `init` awaits `waitForAuthReady()` before the first load. Show `#familyNote` ("Family sets need the code — tap 🔐") when there's no user, and never block play.
- [ ] `attemptLogin` calls `signInWithEmailAndPassword(...toFirebaseCredentials(...))`. On success: if it was already signed in, open the admin portal. Otherwise reload the sets, hide the note and stay on the menu. On failure, show the existing `#loginError`. Delete the hardcoded check.
- [ ] `logout` only leaves admin. It doesn't call `signOut`.
- [ ] `firestore.rules`: `cardSets/{id}` allows read and write only `if request.auth != null`. `firebase.json` points `firestore.rules` at project `word-match-game-3c60d`.
- [ ] **Joel handoff (blocking for manual test):** enable Email/Password in Firebase console → Authentication. Then create the account with `curl -X POST "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=<apiKey from app.js>" -H "Content-Type: application/json" -d '{"email":"belinda@word-match-game-3c60d.firebaseapp.com","password":"asher-wordmatch"}'`. Expected: JSON with `idToken`.
- [ ] **Manual:** fresh profile shows the note and built-ins. Log in with `belinda`/`asher`, the family sets load, and a reload stays signed in. Tapping 🔐 again asks for the code and then opens admin.
- [ ] Commit `feat: Firebase Auth behind existing login; rules file (not deployed)`.

### Task 5: Words as typed + speech + pause (B1–B3)
**Files:** Modify `index.html:170,195` (remove `text-transform: lowercase`), `app.js` (`handleDrop`, `renderWordList`, `saveSet`). Add to `logic.js`.
**Produces:** `pickVoice(voices) -> SpeechSynthesisVoice|null`, `spokenText(entry) -> string` (`entry.say` trimmed if non-empty, else `entry.word`), and `speakThen(text, done, {synth, voice, wait=setTimeout, clear=clearTimeout}) -> boolean` (false if there's no synth). Constants `HOLD_AFTER_SPEECH_MS = 1500`, `SPEECH_MAX_WAIT_MS = 4000`.
- [ ] **Tests:** `pickVoice` normalises `_` to `-`, prefers en-NZ > en-AU > en-GB > any `en`, and within a language prefers names matching `/enhanced|premium/i`. `pickVoice returns null for empty list`. `speakThen calls done 1500ms after onend, once`. `speakThen falls back after 4000ms` when onend never fires. onerror behaves like onend. With no synth it returns false and doesn't call done. Use a fake synth and a fake clock.
- [ ] Run, FAIL. Implement (`synth.cancel()` before `speak`, rate 0.9). Run, PASS.
- [ ] In `handleDrop` on a correct drop: call `speakThen(spokenText(word), advance, …)` **synchronously**. If it returns false, keep the old 600 / 2000ms timings. Keep the matched cell highlighted (and the word revealed in picture modes) until `advance`. Load voices on `voiceschanged` and cache the result of `pickVoice`.
- [ ] Editor word row: add a "Say it like" input bound to `.say` (optional, saved only if non-empty).
- [ ] **Manual (real iPad if available, else desktop Chrome):** "Hezekiah" with a say-it-like is spoken as written there. Capitals show as typed. The next round starts about 1.5s after speech ends.
- [ ] Commit `feat: speak word on match, hold before reshuffle, words as typed`.

### Task 6: Phrase set data + editor (C1)
**Files:** Modify `app.js` (edit modal, `saveSet`, `renderSetList`), `index.html` (set-type selector in `#editSetModal`). Add to `logic.js`.
**Produces:** `isPhraseSet(set) -> boolean` (`set.type === 'phrase'`), `phraseText(item) -> string` (`` `${first} ${second}` ``). Phrase set shape `{id, name, type:'phrase', items:[{image, first, second, say?}]}`. Word sets are unchanged.
- [ ] **Test:** `isPhraseSet` is true only for `type:'phrase'`. A missing type means false. `phraseText({first:'cow',second:'running'})` === `'cow running'`.
- [ ] Run, FAIL. Implement. Run, PASS.
- [ ] New set: a "Word set / Phrase set" choice (fixed after creation). Phrase rows: image (reuse upload + crop), first, second, say-it-like. Save needs at least 4 complete items. Menu and admin show "N phrases".
- [ ] **Manual:** create a phrase set in dev mode (the save is refused for `dev_` ids, so test the save itself with a real set named "ZZ test", then delete it). Apostrophes survive save and edit.
- [ ] Commit `feat: phrase set type in editor`.

### Task 7: Phrase choice logic (C2/C3 rules)
**Files:** Add to `logic.js` and tests.
**Produces:** `buildChoices(items, target, slot, n=3) -> string[]` (slot is `'first'|'second'`; includes `target[slot]` once plus up to n−1 other distinct values of that slot, shuffled). `pickPhrasePictures(items, target) -> item[]` (≤4 items, target exactly once).
- [ ] **Tests:** `buildChoices` from the 9-item fixture for cow/first → 3 distinct values including 'cow'. With only 2 distinct values → returns 2. `pickPhrasePictures full square`: target cow/running → the result's (first,second) pairs are exactly {cow running, cow X, Y running, Y X} for some X≠running, Y≠cow. `pickPhrasePictures never includes a second correct answer`: items containing a duplicate cow/running → only one cow/running in the result. `partial fallback`: no square possible → it prefers items sharing one word, then others. 4 items → returns 4.
- [ ] Run, FAIL.
- [ ] Implement. Square search: for each B′ ≠ B with (A,B′) present, look for A′ ≠ A with (A′,B) and (A′,B′) present. Shuffle the candidates first so the squares vary. Otherwise rank by number of shared words. Always exclude items whose pair equals the target's.
- [ ] Run, PASS. Commit `feat: phrase choice and distractor logic`.

### Task 8: Phrase modes UI + toggle (C2–C4)
**Files:** Modify `index.html` (two mode buttons `#modePhraseBuild` "🧩 Picture → Phrase" and `#modePhrasePick` "🔎 Phrase → Picture", plus phrase styles), `app.js` (`startGame`, `renderCurrentRound` dispatch, `setGameMode`).
**Consumes:** Task 5 `speakThen`, Task 6 `isPhraseSet`/`phraseText`, Task 7 `buildChoices`/`pickPhrasePictures`, Task 2 `roundLocked`.
- [ ] `gameMode` gains `'phrase-build'|'phrase-pick'`. `startGame` on a phrase set switches to `'phrase-build'` if the current mode isn't a phrase mode, and the reverse switches to `'pic-word'`. The toggle shows only the buttons for the current set type.
- [ ] phrase-build: large picture, two slots, and a choice row of large tap buttons (min 64px). A correct tap fills the slot and moves to the second word. A wrong tap reuses the `.wrong` wobble. When both slots are filled: lock, `speakThen(phraseText or say)`, the existing correct animation, then next.
- [ ] phrase-pick: the phrase text plus a 2×2 grid from `pickPhrasePictures`. Tap to choose. Correct → lock, speak, celebrate, next. Wrong → wobble.
- [ ] **Manual (`?dev`, iPad portrait emulation):** both modes play 10 rounds with no layout overflow at 768×1024 and 375×667. Speech and hold work. Switching between a word set and a phrase set swaps the toggle.
- [ ] Commit `feat: phrase build and phrase pick modes`.

### Task 9: Ship, roll out, lock rules (gated)
- [ ] `node --test tests/` passes. Bump `?v=`. Update `CLAUDE.md` progress.
- [ ] **Ask Joel before pushing.** Merge to `main`, push `origin main`, and confirm the live site loads.
- [ ] **Stop. Joel confirms Belinda has signed in on every iPad** (home-screen app if that's how Asher plays).
- [ ] Only then: `firebase deploy --only firestore:rules --project word-match-game-3c60d`. Verify with `curl -s -o /dev/null -w "%{http_code}" "https://firestore.googleapis.com/v1/projects/word-match-game-3c60d/databases/(default)/documents/cardSets?pageSize=1"`. Expected: `403`.
- [ ] Draft the reply to Belinda (what changed, home-screen tip, the picture brief for phrase sets, and the progress-record idea) as `docs/belinda-reply.md`.
