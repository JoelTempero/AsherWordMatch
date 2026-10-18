# Word Match v2 — Health Pass, Spoken Words, Phrase Sets

**Date:** 2026-10-18
**App:** Asher Word Match (vanilla `index.html` + `app.js`, Firebase Firestore, GitHub Pages at joeltempero.github.io/AsherWordMatch)

## Why

Asher (a young reader) uses this on several iPads, some of them school-managed. Belinda (her family) maintains the word sets, including family photos and names. Asher sometimes picks this over the commercial "Special Words" app, so the game works and she likes it. This was an early build, and the goal is to make it solid for the long term, then add two things Belinda asked for:

1. **Email 1:** show words exactly as typed, say the word aloud on a correct match, and pause before moving on.
2. **Email 2:** read two-word phrases ("cow running"), built from words Asher already knows, with funny pictures Belinda will supply.

Build in this order: **A → B → C.** Each part is shippable on its own.

## Goals / Non-goals / Anti-goals

**Goals**
- Fix the quietly-broken things (below) without changing how the game looks or plays.
- Family photos are no longer readable or editable by strangers.
- Spoken confirmation on every correct match.
- Phrase sets with two modes, built so "red car / blue bus" works later with no code changes.

**Non-goals (explicitly out for now)**
- Full offline launch (service worker). Joel chose to leave it out.
- Recording Asher's results or progress. This will be offered to Belinda as a future idea.
- Recorded or AI-generated audio clips. The iPad's built-in voice only.
- Any visual redesign.

**Anti-goals (failure even if it works)**
- Asher ever sees a login screen, or a teacher has to deal with accounts or Apple IDs.
- Belinda's existing family sets get lost or stop loading during the rollout.
- The reshuffle after every match goes away. Belinda explicitly likes that the whole grid reshuffles every time.
- Belinda has to learn a new login. She keeps typing `belinda` / `asher`.

## Part A — Health pass

### A1. Lock down the data (decided by Joel)
- Use Firebase Auth (Email/Password) with **one account**. The login screen stays the same (username + password fields). The app builds the email from the username (e.g. `belinda@<fixed-domain>`). The password sent to Firebase is the typed password plus a fixed pad, because Firebase needs 6+ characters and "asher" is 5. **Belinda keeps typing `belinda` / `asher`.** Remove the hardcoded check in `attemptLogin()`.
- Firebase keeps the iPad signed in (local persistence). Once an iPad is signed in, Asher never sees a login.
- **Not signed in:** the menu shows built-in sets only, and the existing 🔐 Login button signs in. After sign-in, go back to the menu with the family sets loaded.
- **Signed in:** the Login button still asks for the code before opening the admin portal, so Asher can't wander into editing. Verify it by re-running sign-in with the typed credentials.
- **Protection level (decided by Joel):** the aim is to stop casual visitors only. `belinda`/`asher` is already in the public git history, so someone reading the repo could sign in. That's accepted as low stakes. Don't add secrets or change the code.
- Firestore rules: `cardSets` read/write only when `request.auth != null`. Keep `firestore.rules` and `firebase.json` in the repo.
- **Rollout order matters:** (1) ship the new app with the old rules still open, (2) Belinda signs in on each iPad, in whichever context Asher plays (the home-screen app and Safari keep separate storage), (3) only then deploy the locked rules. Deploying the rules first would blank the family sets on every iPad.
- **Who does what (my call):** Claude does the Firebase console work via the Firebase MCP (enable Email/Password, create the account, deploy rules). The rules deploy is a separate, gated step: it only runs after Joel confirms Belinda has signed in on every iPad.
- **Signed-out recovery (my call):** Safari evicts site storage after ~7 days unvisited (home-screen apps are exempt), and school-managed iPads may clear storage. When signed out, show a small, adult-facing note on the menu ("Family sets need the code — tap 🔐"). Asher still gets the built-in sets, never a blocking login screen. The reply to Belinda recommends playing from the home-screen icon.
- Add a cache-busting version query on the `app.js` script tag so iPads pick up the new code.
- Logout: decide whether "Logout" in admin just leaves admin (likely) or fully signs the iPad out. Fully signing out would hide the family sets, so I'd make it leave admin only. *(my call)*

### A2. Small sets freeze the app
`renderCurrentRound()` loops forever when a set has fewer than 9 **distinct** words (`while (otherWords.length < 8)`). The editor allows 3, and duplicate names with different photos also count against it. Fix: show as many cells as there are distinct other words, with the grid still centred. Must not hang with 3 words or with duplicate words.

### A3. Backup import doesn't persist
`importBackup()` calls `saveCustomSets()`, which only writes to localStorage, and the next menu load overwrites it from Firestore. Fix: write imported sets to Firestore.

### A4. Double-matching during the success delay
After a correct drop, the centre item can be dragged again before `nextRound()` runs. That double-scores and skips a word. Fix: ignore input from a correct drop until the next round renders. Part B makes this window longer, so this fix is a prerequisite.

### A5. Drag robustness
- `setupDragAndDrop()` adds `document` listeners every round and never removes them. Fix so they don't pile up (e.g. register once, or remove them on re-render).
- Handle `touchcancel`, and ignore a second finger while dragging, so the drag clone can't get stuck on screen.
- The crop tool has the same listener leak (admin only, low priority).

### A6. Offline copy
`loadCustomSetsFromFirebase()` writes localStorage only on save, never on a successful load, so read-only iPads have no offline copy. Fix: cache to localStorage after every successful load. Handle storage-full errors without surfacing a misleading "saved locally only" alert.

### A7. Minor
- Words containing `"` break the editor `value="..."` attribute. Escape output where words or names go into HTML.
- Missing or broken images: show a neutral fallback instead of the broken-image icon.
- Each set is one Firestore doc (1MB max), with images inline as base64 (~5–10KB each). Warn in the editor when a set is approaching the limit, rather than failing on save.

## Part B — Belinda's email 1

### B1. Words as typed
Remove the two `text-transform: lowercase` rules in `index.html` (around lines 170 and 195). Built-in words are already lowercase. Existing custom words typed with capitals will now show capitals. That's expected, and Belinda can edit them.

### B2. Speak on correct match (decided: iPad voice)
- Use `speechSynthesis`. Voice preference: en-NZ → en-AU → en-GB → any English, preferring enhanced or premium voices when present. Use a slightly slow rate (~0.9).
- Call `speak()` synchronously inside the drop handler, because iOS requires a user gesture. Don't call it from a timeout.
- Each word gets an optional **"say it like"** field in the editor (e.g. "Hez-uh-KYE-uh"). Speak that if it's set, otherwise speak the word as displayed.
- Applies to all four existing modes.

### B3. Pause before moving on
On a correct match, keep the matched picture and word highlighted while the word is spoken, plus ~1.5s after speech ends, then reshuffle as now. iOS `onend` is unreliable, so add a max-wait fallback (~4s). If speech is unavailable, keep today's timings (0.6s / 2s).

## Part C — Phrase sets (Belinda's email 2)

### C1. Shape (decided: extension, not a separate app)
- A new set type, **phrase set**, sits in the same menu and editor. Word sets are unchanged. A missing `type` means a word set, so existing data needs no migration.
- Data: `{ type: 'phrase', name, items: [{ image, first, second, say? }] }`. Tags are generic, "first word" and "second word", not "animal"/"action". This makes "red car" work later.
- The editor asks for the set type when creating a new set. A phrase row has an image, a first word, a second word, and an optional say-it-like. Minimum 4 items to save.
- Starter content will be cow/dog/cat × eating/sleeping/running (9 pictures), supplied by Belinda **after** the build. Test with placeholder images. Don't leave test sets in production Firestore.

### C2. Mode 1 — picture → build the phrase (the default; she starts here)
- The picture shows large. Under it are two empty slots: `___ ___`.
- Below that is a small row of first-word choices: the correct word plus 2 other distinct first-words from the set. *(3 choices is my call.)*
- She **taps** a choice. *(Tap rather than drag is my call. A two-step build is simpler by tapping.)* A correct tap fills slot 1. A wrong tap wobbles, like today's wrong-match feedback.
- Then second-word choices appear, built the same way.
- When both slots are filled, speak the full phrase, celebrate (reuse or extend the existing correct animation), hold the phrase visible (same rules as B3), then go to the next picture.

### C3. Mode 2 — phrase → pick the picture
- The phrase shows ("cow running") with 4 pictures in a 2×2 grid.
- The distractors form the "read both words" square: target (A,B) plus (A,B′), (A′,B) and (A′,B′), using B′ and A′ chosen so that all three exist in the set.
- If no complete square exists, fill with the best partial matches (shares one word), then any others. It must never show two correct answers.
- A correct pick speaks the phrase, celebrates and pauses (B3 rules).

### C4. Mode switching
The existing lock button and mode toggle stay. When a phrase set is being played, the toggle shows the two phrase modes instead of the four word modes.

## Constraints
- Keep vanilla JS, a single `app.js`, no build step, Firebase compat SDK via CDN.
- iPad Safari (including the home-screen app) is the target. Desktop mouse support stays for testing.
- Deploy is a push to `origin/main` (GitHub Pages). The repo is public. Nothing secret goes in it (the Firebase web config is fine).
- Production Firestore is the live family data. Never delete or overwrite existing sets while testing.

## Left to the builder
- Code structure inside `app.js`, the exact celebration visuals, placeholder images, layout of the phrase slots and choice row (it must fit portrait iPad and be usable by a small child: big tap targets), how the 1MB warning is measured, the fixed email domain and password pad, and the testing approach (no test framework exists today).
