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

if (typeof module !== 'undefined') {
    module.exports = { shuffleArray, escapeHtml, pickOtherWords };
}
