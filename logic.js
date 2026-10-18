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
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Pick up to `max` other words for the grid: distinct by word, never the current word
function pickOtherWords(words, current, max = 8) {
    const seen = new Set([current.word]);
    const others = [];
    for (const w of shuffleArray([...words])) {
        if (seen.has(w.word)) continue;
        seen.add(w.word);
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

// The login screen stays username/password; Firebase needs an email and 6+ char password
function toFirebaseCredentials(username, password) {
    return {
        email: `${username.trim().toLowerCase()}@word-match-game-3c60d.firebaseapp.com`,
        password: password + '-wordmatch'
    };
}

// --- Phrase sets ---
function isPhraseSet(set) {
    return set.type === 'phrase';
}

function phraseText(item) {
    return `${item.first} ${item.second}`;
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

// Speak text, then call done once: 1.5s after speech ends, or after 4s if iOS never reports the end.
// Returns false (and never calls done) when speech isn't available.
function speakThen(text, done, { synth, voice = null, wait = setTimeout, clear = clearTimeout } = {}) {
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
        wait(finish, HOLD_AFTER_SPEECH_MS);
    };

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
    }
    utterance.onend = ended;
    utterance.onerror = ended;
    synth.cancel();
    synth.speak(utterance);
    return true;
}

if (typeof module !== 'undefined') {
    module.exports = {
        shuffleArray, escapeHtml, pickOtherWords,
        withTimeout, estimateSetBytes, SET_WARN_BYTES, SET_MAX_BYTES,
        toFirebaseCredentials,
        isPhraseSet, phraseText,
        pickVoice, spokenText, speakThen, HOLD_AFTER_SPEECH_MS, SPEECH_MAX_WAIT_MS
    };
}
