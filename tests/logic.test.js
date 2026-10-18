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

// --- Task 3 ---
test('withTimeout rejects after ms', async () => {
    await assert.rejects(L.withTimeout(new Promise(() => {}), 10), /timeout/);
});

test('withTimeout passes through value', async () => {
    assert.equal(await L.withTimeout(Promise.resolve(42), 1000), 42);
});

test('estimateSetBytes counts UTF-8 bytes', () => {
    const ascii = L.estimateSetBytes({ a: 'x' });
    const macron = L.estimateSetBytes({ a: 'ā' });
    assert.equal(ascii, JSON.stringify({ a: 'x' }).length);
    assert.equal(macron, ascii + 1);
});

test('set size limits', () => {
    assert.equal(L.SET_WARN_BYTES, 800000);
    assert.equal(L.SET_MAX_BYTES, 1000000);
});

// --- Task 4 ---
test('toFirebaseCredentials maps the existing login', () => {
    assert.deepEqual(L.toFirebaseCredentials(' Belinda ', 'asher'), {
        email: 'belinda@word-match-game-3c60d.firebaseapp.com',
        password: 'asher-wordmatch'
    });
});

// --- Task 5 ---
const v = (lang, name = lang) => ({ lang, name });

test('pickVoice prefers en-NZ > en-AU > en-GB > en', () => {
    assert.equal(L.pickVoice([v('en-US'), v('en-GB'), v('en_AU'), v('fr-FR')]).lang, 'en_AU');
    assert.equal(L.pickVoice([v('en-US'), v('en-GB'), v('en-NZ')]).lang, 'en-NZ');
    assert.equal(L.pickVoice([v('fr-FR'), v('en-US')]).lang, 'en-US');
    assert.equal(L.pickVoice([v('fr-FR')]), null);
});

test('pickVoice prefers enhanced within a language', () => {
    const picked = L.pickVoice([v('en-AU', 'Karen'), v('en-AU', 'Karen (Enhanced)'), v('en-GB', 'Daniel (Premium)')]);
    assert.equal(picked.name, 'Karen (Enhanced)');
});

test('pickVoice returns null for empty list', () => {
    assert.equal(L.pickVoice([]), null);
    assert.equal(L.pickVoice(undefined), null);
});

test('spokenText uses say-it-like when set', () => {
    assert.equal(L.spokenText({ word: 'Hezekiah', say: ' Hez-uh-KYE-uh ' }), 'Hez-uh-KYE-uh');
    assert.equal(L.spokenText({ word: 'Hezekiah', say: '  ' }), 'Hezekiah');
    assert.equal(L.spokenText({ word: 'dog' }), 'dog');
});

// Fake speech synth + clock
function fakeEnv() {
    const timers = [];
    let now = 0;
    const synth = { spoken: [], cancelled: 0, cancel() { this.cancelled++; }, speak(u) { this.spoken.push(u); } };
    const wait = (fn, ms) => { const t = { fn, at: now + ms, done: false }; timers.push(t); return t; };
    const clear = (t) => { if (t) t.done = true; };
    const advance = (ms) => {
        now += ms;
        for (const t of timers.filter(t => !t.done && t.at <= now)) { t.done = true; t.fn(); }
    };
    return { synth, wait, clear, advance };
}
global.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };

test('speakThen calls done 1500ms after onend, once', () => {
    const env = fakeEnv();
    let calls = 0;
    assert.equal(L.speakThen('dog', () => calls++, env), true);
    const u = env.synth.spoken[0];
    assert.equal(u.text, 'dog');
    assert.equal(u.rate, 0.9);
    env.advance(800); u.onend();
    env.advance(1499); assert.equal(calls, 0);
    env.advance(1); assert.equal(calls, 1);
    env.advance(10000); assert.equal(calls, 1);
});

test('speakThen falls back after 4000ms', () => {
    const env = fakeEnv();
    let calls = 0;
    L.speakThen('dog', () => calls++, env);
    env.advance(3999); assert.equal(calls, 0);
    env.advance(1); assert.equal(calls, 1);
    env.synth.spoken[0].onend?.();
    env.advance(5000); assert.equal(calls, 1);
});

test('speakThen treats onerror like onend', () => {
    const env = fakeEnv();
    let calls = 0;
    L.speakThen('dog', () => calls++, env);
    env.synth.spoken[0].onerror();
    env.advance(1500); assert.equal(calls, 1);
});

test('speakThen without synth returns false', () => {
    let calls = 0;
    assert.equal(L.speakThen('dog', () => calls++, { synth: null }), false);
    assert.equal(calls, 0);
});

// --- Task 6 ---
test('isPhraseSet only for type phrase', () => {
    assert.equal(L.isPhraseSet({ type: 'phrase', items: [] }), true);
    assert.equal(L.isPhraseSet({ words: [] }), false);
    assert.equal(L.isPhraseSet({ type: 'word', words: [] }), false);
});

test('phraseText joins first and second', () => {
    assert.equal(L.phraseText({ first: 'cow', second: 'running' }), 'cow running');
});

// --- Task 7 ---
const p = (first, second, image = `${first}_${second}.png`) => ({ first, second, image });
const nine = [];
for (const a of ['cow', 'dog', 'cat']) for (const b of ['eating', 'sleeping', 'running']) nine.push(p(a, b));
const key = it => `${it.first} ${it.second}`;

test('buildChoices gives target plus 2 distinct others', () => {
    for (let i = 0; i < 20; i++) {
        const c = L.buildChoices(nine, nine[0], 'first');
        assert.equal(c.length, 3);
        assert.equal(new Set(c).size, 3);
        assert.ok(c.includes('cow'));
        const s = L.buildChoices(nine, nine[0], 'second');
        assert.ok(s.includes('eating'));
        assert.equal(new Set(s).size, 3);
    }
});

test('buildChoices with only 2 distinct values returns 2', () => {
    const items = [p('cow', 'eating'), p('dog', 'eating'), p('cow', 'running'), p('dog', 'running')];
    assert.deepEqual(L.buildChoices(items, items[0], 'first').sort(), ['cow', 'dog']);
});

test('pickPhrasePictures full square', () => {
    for (let i = 0; i < 30; i++) {
        const target = nine[2]; // cow running
        const out = L.pickPhrasePictures(nine, target);
        assert.equal(out.length, 4);
        assert.equal(out.filter(it => key(it) === 'cow running').length, 1);
        const others = out.filter(it => key(it) !== 'cow running');
        const X = others.find(it => it.first === 'cow').second;
        const Y = others.find(it => it.second === 'running').first;
        assert.notEqual(X, 'running');
        assert.notEqual(Y, 'cow');
        assert.deepEqual(new Set(out.map(key)), new Set(['cow running', `cow ${X}`, `${Y} running`, `${Y} ${X}`]));
    }
});

test('pickPhrasePictures never includes a second correct answer', () => {
    const items = [...nine, p('cow', 'running', 'cow_running_2.png')];
    for (let i = 0; i < 30; i++) {
        const out = L.pickPhrasePictures(items, items[2]);
        assert.equal(out.filter(it => key(it) === 'cow running').length, 1);
        assert.ok(out.includes(items[2]));
    }
});

test('pickPhrasePictures partial fallback prefers shared words', () => {
    // No square possible for cow running: no (X, running) and (X, Y) pair both present
    const items = [p('cow', 'running'), p('cow', 'eating'), p('dog', 'sleeping'), p('red', 'car'), p('blue', 'bus')];
    for (let i = 0; i < 30; i++) {
        const out = L.pickPhrasePictures(items, items[0]);
        assert.equal(out.length, 4);
        assert.equal(out[0] === items[0] || out.includes(items[0]), true);
        assert.ok(out.includes(items[1])); // shares "cow"
    }
});

test('pickPhrasePictures with 4 items returns 4', () => {
    const items = [p('a', 'b'), p('c', 'd'), p('e', 'f'), p('g', 'h')];
    assert.equal(L.pickPhrasePictures(items, items[0]).length, 4);
});
