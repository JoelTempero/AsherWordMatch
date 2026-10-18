// Dev-only test sets. Loaded only when the URL has ?dev - never saved to Firebase (ids start with dev_).

(function() {
    // Simple placeholder picture: emoji + label on a pastel square
    function pic(emoji, label, bg) {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150">` +
            `<rect width="150" height="150" rx="16" fill="${bg}"/>` +
            `<text x="75" y="80" font-size="64" text-anchor="middle">${emoji}</text>` +
            `<text x="75" y="130" font-size="16" text-anchor="middle" font-family="sans-serif">${label}</text></svg>`;
        return 'data:image/svg+xml,' + encodeURIComponent(svg);
    }

    const animals = { cow: '🐄', dog: '🐕', cat: '🐈' };
    const actions = { eating: ['🍽️', '#FFE0B2'], sleeping: ['💤', '#D1C4E9'], running: ['👟', '#C8E6C9'] };
    const items = [];
    for (const [first, a] of Object.entries(animals)) {
        for (const [second, [b, bg]] of Object.entries(actions)) {
            items.push({ image: pic(a + b, `${first} ${second}`, bg), first, second });
        }
    }

    window.DEV_SETS = [
        {
            id: 'dev_small',
            name: 'DEV: 3 words',
            words: [
                { word: 'ball', image: 'images/words/ball.png' },
                { word: 'cat', image: 'images/words/cat.png' },
                { word: 'dog', image: 'images/words/dog.png' }
            ]
        },
        {
            id: 'dev_tricky',
            name: 'DEV: tricky words',
            words: [
                { word: 'Mum', image: pic('👩', 'Mum 1', '#F8BBD0') },
                { word: 'Mum', image: pic('👩‍🦰', 'Mum 2', '#F8BBD0') },
                { word: 'Dad', image: pic('👨', 'Dad', '#BBDEFB') },
                { word: "Nana's", image: pic('👵', "Nana's", '#FFF9C4') },
                { word: '5" nails', image: pic('🔩', 'nails', '#CFD8DC') },
                { word: 'Hezekiah', image: pic('👦', 'Hezekiah', '#C8E6C9'), say: 'Hez-uh-KYE-uh' },
                { word: 'broken', image: 'images/words/does-not-exist.png' }
            ]
        },
        {
            id: 'dev_phrase',
            name: 'DEV: phrases',
            type: 'phrase',
            items
        }
    ];
})();
