const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../logic.js');

const w = (word, image = word + '.png') => ({ word, image });

// --- Task 1 ---
test('pickOtherWords returns all others for a 3-word set', () => {
    const words = [w('a'), w('b'), w('c')];
    const out = L.pickOtherWords(words, words[0]);
    assert.equal(out.length, 2);
    assert.ok(!out.some(x => x.word === 'a'));
});

test('pickOtherWords caps at 8 for a big set', () => {
    const words = Array.from({ length: 20 }, (_, i) => w('w' + i));
    const out = L.pickOtherWords(words, words[5]);
    assert.equal(out.length, 8);
    assert.equal(new Set(out.map(x => x.word)).size, 8);
});

test('pickOtherWords excludes same-word entries', () => {
    const words = [w('Mum', 'a.png'), w('Mum', 'b.png'), w('Dad'), w('Nan')];
    const out = L.pickOtherWords(words, words[0]);
    assert.deepEqual(out.map(x => x.word).sort(), ['Dad', 'Nan']);
});

test('pickOtherWords dedupes repeated other words', () => {
    const words = [w('cat'), w('Dad', '1.png'), w('Dad', '2.png'), w('Nan')];
    const out = L.pickOtherWords(words, words[0]);
    assert.deepEqual(out.map(x => x.word).sort(), ['Dad', 'Nan']);
});

test('escapeHtml escapes quotes', () => {
    assert.equal(L.escapeHtml('Nana\'s "x" <b>'), 'Nana&#39;s &quot;x&quot; &lt;b&gt;');
    assert.equal(L.escapeHtml('a & b'), 'a &amp; b');
    assert.equal(L.escapeHtml(undefined), '');
});
