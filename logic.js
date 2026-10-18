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

if (typeof module !== 'undefined') {
    module.exports = {
        shuffleArray, escapeHtml, pickOtherWords,
        withTimeout, estimateSetBytes, SET_WARN_BYTES, SET_MAX_BYTES,
        toFirebaseCredentials
    };
}
