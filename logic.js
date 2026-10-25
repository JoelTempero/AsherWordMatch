// Word Match Game - pure logic (no DOM, no Firebase)
// Loaded in the browser before app.js, and by node --test via module.exports.

// Shuffle array helper (in place)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Escape text before it goes into innerHTML or an attribute
function escapeHtml(str) {
    return String(str == null ? '' : str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Words count as the same if they only differ by capitals or spaces ("Mum " / "mum")
function wordKey(word) {
    return String(word == null ? '' : word).trim().toLowerCase();
}

function sameWord(a, b) {
    return wordKey(a) === wordKey(b);
}

// Pick up to `max` other words for the grid: distinct by word, never the current word
function pickOtherWords(words, current, max = 8) {
    const seen = new Set([wordKey(current.word)]);
    const others = [];
    for (const w of shuffleArray([...words])) {
        const key = wordKey(w.word);
        if (seen.has(key)) continue;
        seen.add(key);
        others.push(w);
    }
    return others.slice(0, max);
}

// Firestore docs max out at 1MB; warn well before that
const SET_WARN_BYTES = 800000;
const SET_MAX_BYTES = 1000000;

// Reject if a promise takes longer than ms (e.g. Firebase blocked by a school filter)
function withTimeout(promise, ms) {
    let timer;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('timeout')), ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// Approximate stored size of a set (UTF-8 bytes of its JSON)
function estimateSetBytes(set) {
    return new TextEncoder().encode(JSON.stringify(set)).length;
}

// --- Image storage ---
// Uploaded pictures (data URLs) are stored one per doc in cardSets/{setId}/images/{key},
// and the set doc points at them with "img:<key>". Built-in file paths stay inline.
const IMAGE_REF = 'img:';

function isImageRef(image) {
    return typeof image === 'string' && image.indexOf(IMAGE_REF) === 0;
}

function isDataUrl(image) {
    return typeof image === 'string' && image.indexOf('data:') === 0;
}

function setEntryList(set) {
    return set.items ? 'items' : 'words';
}

function defaultImageKey() {
    return 'i' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Split a set into the small doc to store plus { key: dataUrl } for its pictures.
// Existing pictures keep their key (entry.imageKey) so re-saving doesn't rewrite them.
function splitSetImages(set, newKey = defaultImageKey) {
    const list = setEntryList(set);
    const images = {};
    const entries = (set[list] || []).map(entry => {
        const { imageKey, ...rest } = entry;
        if (!isDataUrl(entry.image)) return rest;
        const key = imageKey || newKey();
        images[key] = entry.image;
        return { ...rest, image: IMAGE_REF + key };
    });
    return { doc: { ...set, [list]: entries }, images };
}

// Put the pictures back into a stored doc; unknown refs are left as-is (they fall back to grey)
function hydrateSetImages(doc, images) {
    const list = setEntryList(doc);
    const entries = (doc[list] || []).map(entry => {
        if (!isImageRef(entry.image)) return entry;
        const key = entry.image.slice(IMAGE_REF.length);
        if (!(key in images)) return entry;
        return { ...entry, image: images[key], imageKey: key };
    });
    return { ...doc, [list]: entries };
}

function needsImages(set) {
    return (set[setEntryList(set)] || []).some(entry => isImageRef(entry.image));
}

// Admins sign in with their real email; the password is used exactly as typed
function toFirebaseCredentials(email, password) {
    return {
        email: email.trim().toLowerCase(),
        password
    };
}

// --- Phrase sets ---
function isPhraseSet(set) {
    return set.type === 'phrase';
}

function phraseText(item) {
    return `${item.first} ${item.second}`;
}

// Distinct by wordKey, keeping the first spelling seen
function distinctWords(values) {
    const seen = new Set();
    return values.filter(v => {
        const key = wordKey(v);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

// Word choices for one slot ('first' | 'second'): the right word plus up to n-1 others from the set
function buildChoices(items, target, slot, n = 4) {
    const others = shuffleArray(distinctWords(items.map(it => it[slot])).filter(v => !sameWord(v, target[slot])));
    return shuffleArray([target[slot], ...others.slice(0, n - 1)]);
}

// Up to 4 pictures for "read the phrase, pick the picture".
// Best case is the square target (A,B) + (A,B') + (A',B) + (A',B'), so both words must be read.
function pickPhrasePictures(items, target) {
    const isPair = (it, first, second) => sameWord(it.first, first) && sameWord(it.second, second);
    const pool = items.filter(it => !isPair(it, target.first, target.second));
    const find = (first, second) => pool.find(it => isPair(it, first, second));

    const otherSeconds = shuffleArray(distinctWords(pool.filter(it => sameWord(it.first, target.first)).map(it => it.second)));
    for (const second of otherSeconds) {
        const otherFirsts = shuffleArray(distinctWords(pool.filter(it => sameWord(it.second, target.second)).map(it => it.first)));
        for (const first of otherFirsts) {
            const diagonal = find(first, second);
            if (diagonal) {
                return shuffleArray([target, find(target.first, second), find(first, target.second), diagonal]);
            }
        }
    }

    // No full square: prefer pictures sharing a word with the target, one per phrase
    const shared = it => (sameWord(it.first, target.first) ? 1 : 0) + (sameWord(it.second, target.second) ? 1 : 0);
    const seen = new Set();
    const picks = shuffleArray([...pool])
        .sort((a, b) => shared(b) - shared(a))
        .filter(it => {
            const key = wordKey(it.first) + '|' + wordKey(it.second);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .slice(0, 3);
    return shuffleArray([target, ...picks]);
}

// --- Speech ---
const HOLD_AFTER_SPEECH_MS = 1500;
const SPEECH_MAX_WAIT_MS = 4000;
const VOICE_LANGS = ['en-nz', 'en-au', 'en-gb'];

// Best English voice: NZ, then AU, then GB, then any English; enhanced/premium first
function pickVoice(voices) {
    const english = (voices || []).filter(v => /^en/i.test(v.lang));
    if (!english.length) return null;
    const langRank = v => {
        const i = VOICE_LANGS.indexOf(v.lang.replace('_', '-').toLowerCase());
        return i === -1 ? VOICE_LANGS.length : i;
    };
    const qualityRank = v => (/enhanced|premium/i.test(v.name) ? 0 : 1);
    return [...english].sort((a, b) => langRank(a) - langRank(b) || qualityRank(a) - qualityRank(b))[0];
}

// What to say for a word: the "say it like" spelling if Belinda set one
function spokenText(entry) {
    const say = (entry.say || '').trim();
    return say || entry.word;
}

// Speak text, then call done once: holdMs (1.5s) after speech ends, or after 4s if iOS never reports the end.
// Returns false (and never calls done) when speech isn't available.
function speakThen(text, done, { synth, voice = null, wait = setTimeout, clear = clearTimeout, holdMs = HOLD_AFTER_SPEECH_MS } = {}) {
    if (!synth) return false;
    let finished = false;
    const finish = () => {
        if (finished) return;
        finished = true;
        done();
    };
    const fallback = wait(finish, SPEECH_MAX_WAIT_MS);
    const ended = () => {
        if (finished) return;
        clear(fallback);
        wait(finish, holdMs);
    };

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
    }
    utterance.onend = ended;
    utterance.onerror = ended;
    if (synth.speaking || synth.pending) synth.cancel();
    synth.speak(utterance);
    return true;
}

// After a completed phrase: say it, pause 2s, say it again, pause 1s, then done
const REPEAT_PAUSE_MS = 2000;
const AFTER_REPEAT_MS = 1000;
function sayTwiceThen(text, done, env = {}) {
    return speakThen(text, () => {
        if (!speakThen(text, done, { ...env, holdMs: AFTER_REPEAT_MS })) done();
    }, { ...env, holdMs: REPEAT_PAUSE_MS });
}

// Wrap a delayed callback so it does nothing once the round has moved on
function onlyIfCurrent(token, getCurrent, fn) {
    return () => {
        if (getCurrent() === token) fn();
    };
}

if (typeof module !== 'undefined') {
    module.exports = {
        shuffleArray, escapeHtml, wordKey, sameWord, pickOtherWords, onlyIfCurrent,
        withTimeout, estimateSetBytes, SET_WARN_BYTES, SET_MAX_BYTES,
        isImageRef, splitSetImages, hydrateSetImages, needsImages,
        toFirebaseCredentials,
        isPhraseSet, phraseText, buildChoices, pickPhrasePictures,
        pickVoice, spokenText, speakThen, sayTwiceThen, HOLD_AFTER_SPEECH_MS, SPEECH_MAX_WAIT_MS
    };
}
