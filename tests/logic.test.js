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
