// Word Match Game - Main Application

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBrCFsYhxXDnLegqWC96yEJDf6bfWmxqlI",
    authDomain: "word-match-game-3c60d.firebaseapp.com",
    projectId: "word-match-game-3c60d",
    storageBucket: "word-match-game-3c60d.firebasestorage.app",
    messagingSenderId: "92490958010",
    appId: "1:92490958010:web:63270d510ae3fbb81d2e83"
};

// Initialize Firebase
// Firebase is loaded by loadFirebase() at startup; db/auth stay null if it's blocked or offline
let db = null;
let auth = null;
const FIREBASE_SDK = 'https://www.gstatic.com/firebasejs/10.7.1/';

// Load the Firebase SDK without blocking the page (a school filter can block gstatic)
async function loadFirebase() {
    try {
        await withTimeout((async () => {
            await loadScript(FIREBASE_SDK + 'firebase-app-compat.js');
            await Promise.all([
                loadScript(FIREBASE_SDK + 'firebase-firestore-compat.js'),
                loadScript(FIREBASE_SDK + 'firebase-auth-compat.js')
            ]);
        })(), 8000);
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        auth = firebase.auth();
    } catch (e) {
        console.warn('Firebase unavailable - using built-in and cached sets:', e);
    }
}

// Resolves once Firebase has restored any saved sign-in on this device
function waitForAuthReady() {
    if (!auth) return Promise.resolve(null);
    const ready= new Promise(resolve => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            unsubscribe();
            resolve(user);
        });
    });
    return withTimeout(ready, 5000).catch(() => null);
}

// Small adult-facing hint when this device isn't signed in
function updateFamilyNote() {
    const note = document.getElementById('familyNote');
    if (note) note.hidden = !!(auth && auth.currentUser);
}

// Cache for custom sets (loaded from Firebase)
let customSetsCache = [];
let isDataLoaded = false;

// Default card sets (built-in starter packs - can be overridden in Firebase)
const builtInSets = [
    {
        id: 'all_words',
        name: 'All Words',
        isBuiltIn: true,
        words: [
            { word: 'ball', image: 'images/words/ball.png' },
            { word: 'book', image: 'images/words/book.png' },
            { word: 'dolly', image: 'images/words/dolly.png' },
            { word: 'car', image: 'images/words/car.png' },
            { word: 'bird', image: 'images/words/bird.png' },
            { word: 'dog', image: 'images/words/dog.png' },
            { word: 'cat', image: 'images/words/cat.png' },
            { word: 'fish', image: 'images/words/fish.png' },
            { word: 'flower', image: 'images/words/flower.png' },
            { word: 'keys', image: 'images/words/keys.png' },
            { word: 'cup', image: 'images/words/cup.png' },
            { word: 'brush', image: 'images/words/brush.png' },
            { word: 'coat', image: 'images/words/coat.png' },
            { word: 'shoes', image: 'images/words/shoes.png' },
            { word: 'hat', image: 'images/words/hat.png' },
            { word: 'socks', image: 'images/words/socks.png' },
            { word: 'duck', image: 'images/words/duck.png' },
            { word: 'pig', image: 'images/words/pig.png' },
            { word: 'sheep', image: 'images/words/sheep.png' },
            { word: 'cow', image: 'images/words/cow.png' },
            { word: 'apple', image: 'images/words/apple.png' },
            { word: 'banana', image: 'images/words/banana.png' },
            { word: 'biscuit', image: 'images/words/biscuit.png' },
            { word: 'drink', image: 'images/words/drink.png' },
            { word: 'bed', image: 'images/words/bed.png' },
            { word: 'chair', image: 'images/words/chair.png' },
            { word: 'table', image: 'images/words/table.png' },
            { word: 'bath', image: 'images/words/bath.png' },
            { word: 'eyes', image: 'images/words/eyes.png' },
            { word: 'mouth', image: 'images/words/mouth.png' },
            { word: 'hair', image: 'images/words/hair.png' },
            { word: 'nose', image: 'images/words/nose.png' },
            { word: 'spoon', image: 'images/words/spoon.png' },
            { word: 'bag', image: 'images/words/bag.png' },
            { word: 'phone', image: 'images/words/phone.png' },
            { word: 'bricks', image: 'images/words/bricks.png' },
            { word: 'eating', image: 'images/words/eating.png' },
            { word: 'sleeping', image: 'images/words/sleeping.png' },
            { word: 'drinking', image: 'images/words/drinking.png' },
            { word: 'brushing', image: 'images/words/brushing.png' },
            { word: 'sitting', image: 'images/words/sitting.png' },
            { word: 'washing', image: 'images/words/washing.png' },
            { word: 'walking', image: 'images/words/walking.png' },
            { word: 'crying', image: 'images/words/crying.png' },
            { word: 'television', image: 'images/words/television.png' },
            { word: 'light', image: 'images/words/light.png' },
            { word: 'balloon', image: 'images/words/balloon.png' },
            { word: 'box', image: 'images/words/box.png' },
            { word: 'bubbles', image: 'images/words/bubbles.png' },
            { word: 'big', image: 'images/words/big.png' },
            { word: 'splashing', image: 'images/words/splashing.png' },
            { word: 'little', image: 'images/words/little.png' },
            { word: 'garden', image: 'images/words/garden.png' },
            { word: 'star', image: 'images/words/star.png' },
            { word: 'house', image: 'images/words/house.png' },
            { word: 'tree', image: 'images/words/tree.png' },
            { word: 'jumping', image: 'images/words/jumping.png' },
            { word: 'playing', image: 'images/words/playing.png' },
            { word: 'running', image: 'images/words/running.png' },
            { word: 'kissing', image: 'images/words/kissing.png' },
            { word: 'clapping', image: 'images/words/clapping.png' },
            { word: 'reading', image: 'images/words/reading.png' },
            { word: 'cutting', image: 'images/words/cutting.png' },
            { word: 'throwing', image: 'images/words/throwing.png' },
            { word: 'towel', image: 'images/words/towel.png' },
            { word: 'soap', image: 'images/words/soap.png' },
            { word: 'toothbrush', image: 'images/words/toothbrush.png' },
            { word: 'teeth', image: 'images/words/teeth.png' },
            { word: 'bread', image: 'images/words/bread.png' },
            { word: 'dinner', image: 'images/words/dinner.png' },
            { word: 'juice', image: 'images/words/juice.png' },
            { word: 'yoghurt', image: 'images/words/yoghurt.png' },
            { word: 'chicken', image: 'images/words/chicken.png' },
            { word: 'monkey', image: 'images/words/monkey.png' },
            { word: 'rabbit', image: 'images/words/rabbit.png' },
            { word: 'horse', image: 'images/words/horse.png' },
            { word: 'dress', image: 'images/words/dress.png' },
            { word: 'jumper', image: 'images/words/jumper.png' },
            { word: 'boots', image: 'images/words/boots.png' },
            { word: 'trousers', image: 'images/words/trousers.png' },
            { word: 'foot', image: 'images/words/foot.png' },
            { word: 'tummy', image: 'images/words/tummy.png' },
            { word: 'hand', image: 'images/words/hand.png' },
            { word: 'ear', image: 'images/words/ear.png' },
            { word: 'up', image: 'images/words/up.png' },
            { word: 'down', image: 'images/words/down.png' },
            { word: 'swing', image: 'images/words/swing.png' },
            { word: 'bike', image: 'images/words/bike.png' },
            { word: 'boat', image: 'images/words/boat.png' },
            { word: 'bus', image: 'images/words/bus.png' },
            { word: 'aeroplane', image: 'images/words/aeroplane.png' },
            { word: 'train', image: 'images/words/train.png' },
            { word: 'wet', image: 'images/words/wet.png' },
            { word: 'dirty', image: 'images/words/dirty.png' },
            { word: 'hot', image: 'images/words/hot.png' },
            { word: 'cold', image: 'images/words/cold.png' }
        ]
    }
];

// Best available voice (iOS loads voices late, so refresh on voiceschanged)
let speechVoice = null;

function loadVoice() {
    if (window.speechSynthesis) {
        speechVoice = pickVoice(window.speechSynthesis.getVoices());
    }
}

// Say text then call advance; false when this device can't speak
function speakAndThen(text, advance) {
    return speakThen(text, advance, { synth: window.speechSynthesis || null, voice: speechVoice });
}

// Neutral grey square for pictures that fail to load
const FALLBACK_IMG = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150"><rect width="150" height="150" rx="16" fill="#E0E0E0"/></svg>'
);

function imgFallback(img) {
    img.onerror = null;
    img.src = FALLBACK_IMG;
}

// Game state
let gameState = {
    currentSet: null,
    currentWordIndex: 0,
    score: 0,
    wordsToPlay: [],
    usedWords: [],
    isAdmin: false,
    roundLocked: false,
    roundSeq: 0, // bumped whenever a round is drawn or the game is left
    gameMode: 'pic-word', // 'match-pic', 'pic-word', 'match-word', 'word-pic'
    modesUnlocked: false
};

// Lock button state
let lockHoldTimer = null;
let lockHoldStart = 0;

// Get custom sets from cache (loaded from Firebase)
function getCustomSets() {
    return customSetsCache;
}

// Dev test sets (?dev) are never saved anywhere
function isDevSet(setId) {
    return String(setId).startsWith('dev_');
}

// Keep an offline copy of the sets on this device
function cacheSetsLocally() {
    try {
        const realSets = customSetsCache.filter(s => !isDevSet(s.id));
        localStorage.setItem('wordMatchCustomSets', JSON.stringify(realSets));
    } catch (e) {
        console.warn('Could not cache sets locally:', e);
    }
}

function readLocalSets() {
    try {
        const stored = localStorage.getItem('wordMatchCustomSets');
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.warn('Could not read local sets:', e);
        return [];
    }
}

// Load custom sets from Firebase (falls back to the offline copy)
async function loadCustomSetsFromFirebase() {
    try {
        if (!db) throw new Error('Firebase unavailable');
        const snapshot = await withTimeout(db.collection('cardSets').get(), 8000);
        customSetsCache = [];
        snapshot.forEach(doc => {
            customSetsCache.push({ id: doc.id, ...doc.data() });
        });
        cacheSetsLocally();
        console.log('Loaded', customSetsCache.length, 'custom sets from Firebase');
    } catch (e) {
        console.error('Error loading from Firebase:', e);
        customSetsCache = readLocalSets();
    }
    if (window.DEV_SETS) {
        customSetsCache.push(...window.DEV_SETS);
    }
    isDataLoaded = true;
    return customSetsCache;
}

// Save a single set to Firebase
async function saveSetToFirebase(set) {
    if (isDevSet(set.id)) {
        alert('Dev test sets are never saved.');
        return false;
    }
    try {
        if (!db) throw new Error('No connection to Firebase');
        await db.collection('cardSets').doc(set.id).set(set);
    } catch (e) {
        console.error('Error saving to Firebase:', e);
        alert('Error saving: ' + e.message + '\nChanges kept on this iPad only.');
        cacheSetsLocally();
        return false;
    }
    cacheSetsLocally();
    return true;
}

// Delete a set from Firebase
async function deleteSetFromFirebase(setId) {
    if (isDevSet(setId)) return false;
    try {
        if (!db) throw new Error('No connection to Firebase');
        await db.collection('cardSets').doc(setId).delete();
    } catch (e) {
        console.error('Error deleting from Firebase:', e);
        alert('Error deleting: ' + e.message);
        return false;
    }
    cacheSetsLocally();
    return true;
}

// Get all sets - custom sets override built-in sets with same ID
function getAllSets() {
    const customSets = getCustomSets();
    const customIds = customSets.map(s => s.id);
    
    // Get built-in sets that haven't been customized
    const unmodifiedBuiltIns = builtInSets.filter(s => !customIds.includes(s.id));
    
    // Return built-ins first, then custom (custom ones with built-in IDs will replace originals)
    return [...unmodifiedBuiltIns, ...customSets];
}

// Check if a set is a built-in set (original or edited version)
function isBuiltInSet(setId) {
    return builtInSets.some(s => s.id === setId);
}

// Get the original built-in set (for reset functionality)
function getOriginalBuiltInSet(setId) {
    return builtInSets.find(s => s.id === setId);
}

// DOM Elements - initialized in init()
let menuScreen, gameScreen, completeScreen, setList, gameGrid;
let scoreValue, currentSetName, progressFill, progressText;
let finalScore, loginModal, adminPortal, editSetModal;

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Initialize the app
async function init() {
    console.log('Initializing Word Match Game...');
    
    // Get DOM elements
    menuScreen = document.getElementById('menuScreen');
    gameScreen = document.getElementById('gameScreen');
    completeScreen = document.getElementById('completeScreen');
    setList = document.getElementById('setList');
    gameGrid = document.getElementById('gameGrid');
    scoreValue = document.getElementById('scoreValue');
    currentSetName = document.getElementById('currentSetName');
    progressFill = document.getElementById('progressFill');
    progressText = document.getElementById('progressText');
    finalScore = document.getElementById('finalScore');
    loginModal = document.getElementById('loginModal');
    adminPortal = document.getElementById('adminPortal');
    editSetModal = document.getElementById('editSetModal');
    
    console.log('DOM elements loaded, setList:', setList);
    
    // Playable straight away: built-in sets plus this device's cached copy
    customSetsCache = readLocalSets();
    renderSetList();
    setupEventListeners();

    // Voices
    loadVoice();
    if (window.speechSynthesis) {
        window.speechSynthesis.addEventListener('voiceschanged', loadVoice);
    }

    try {
        // Dev test sets (never saved) - only with ?dev in the URL
        if (new URLSearchParams(location.search).has('dev')) {
            await loadScript('dev-fixtures.js');
        }

        // Firebase, then any saved sign-in (family sets need it)
        await loadFirebase();
        await waitForAuthReady();
        updateFamilyNote();

        // Load data from Firebase (falls back to the cached copy)
        await loadCustomSetsFromFirebase();
        renderSetList();
        console.log('Initialization complete!');
    } catch (e) {
        console.error('Init error:', e);
        updateFamilyNote();
    }
}

// "12 words" / "9 phrases"
function setCountLabel(set) {
    return set.items ? `${set.items.length} phrases` : `${set.words.length} words`;
}

// Render the set selection list
function renderSetList() {
    const sets = getAllSets();
    console.log('Rendering sets:', sets.length);
    
    if (!setList) {
        console.error('setList element not found!');
        return;
    }
    
    setList.innerHTML = sets.map(set => `
        <div class="set-card" data-set-id="${escapeHtml(set.id)}">
            <h3>${escapeHtml(set.name)}</h3>
            <p>${setCountLabel(set)}</p>
        </div>
    `).join('');

    // Add click listeners
    document.querySelectorAll('.set-card').forEach(card => {
        card.addEventListener('click', () => {
            startGame(card.dataset.setId);
        });
    });
    
    console.log('Set cards rendered:', document.querySelectorAll('.set-card').length);
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('menuBtn').addEventListener('click', showMenu);
    document.getElementById('menuBtn2').addEventListener('click', showMenu);
    document.getElementById('playAgainBtn').addEventListener('click', () => {
        startGame(gameState.currentSet.id);
    });
    document.getElementById('refreshBtn').addEventListener('click', refreshData);
    document.getElementById('loginBtn').addEventListener('click', showLoginModal);
    document.getElementById('cancelLogin').addEventListener('click', hideLoginModal);
    document.getElementById('submitLogin').addEventListener('click', attemptLogin);
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('addSetBtn').addEventListener('click', () => showEditSetModal());
    document.getElementById('cancelEditSet').addEventListener('click', hideEditSetModal);
    document.getElementById('saveSetBtn').addEventListener('click', saveSet);
    document.getElementById('addWordBtn').addEventListener('click', addWordRow);
    document.getElementById('setTypeInput').addEventListener('change', (e) => changeSetType(e.target.value));
    document.getElementById('exportBtn').addEventListener('click', exportBackup);
    document.getElementById('importFile').addEventListener('change', importBackup);

    // Lock button - hold for 3 seconds to unlock modes
    const lockBtn = document.getElementById('lockBtn');
    lockBtn.addEventListener('touchstart', startLockHold, { passive: false });
    lockBtn.addEventListener('mousedown', startLockHold);
    lockBtn.addEventListener('touchend', endLockHold);
    lockBtn.addEventListener('mouseup', endLockHold);
    lockBtn.addEventListener('mouseleave', endLockHold);

    // Mode toggle buttons
    document.getElementById('modeMatchPic').addEventListener('click', () => setGameMode('match-pic'));
    document.getElementById('modePicWord').addEventListener('click', () => setGameMode('pic-word'));
    document.getElementById('modeMatchWord').addEventListener('click', () => setGameMode('match-word'));
    document.getElementById('modeWordPic').addEventListener('click', () => setGameMode('word-pic'));
    document.getElementById('modePhraseBuild').addEventListener('click', () => setGameMode('phrase-build'));
    document.getElementById('modePhrasePick').addEventListener('click', () => setGameMode('phrase-pick'));

    // Drag handlers live on the document once, not per round
    document.addEventListener('touchmove', moveDrag, { passive: false });
    document.addEventListener('touchend', endDrag);
    document.addEventListener('touchcancel', cancelDrag);
    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('mouseup', endDrag);

    // Enter key for login
    document.getElementById('passwordInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') attemptLogin();
    });
}

// Lock button hold functions
function startLockHold(e) {
    e.preventDefault();
    
    // If already unlocked, don't start a new hold timer
    if (gameState.modesUnlocked) {
        return;
    }
    
    lockHoldStart = Date.now();
    const lockBtn = document.getElementById('lockBtn');
    lockBtn.classList.add('unlocking');
    
    lockHoldTimer = setTimeout(() => {
        // 3 seconds held - unlock modes
        gameState.modesUnlocked = true;
        lockBtn.classList.remove('unlocking');
        lockBtn.classList.add('unlocked');
        lockBtn.textContent = '🔓';
        document.getElementById('modeToggle').classList.add('visible');
    }, 3000);
}

function endLockHold() {
    const lockBtn = document.getElementById('lockBtn');
    
    // If we were in the process of unlocking (not yet unlocked), cancel it
    if (lockHoldTimer && !gameState.modesUnlocked) {
        clearTimeout(lockHoldTimer);
        lockHoldTimer = null;
        lockBtn.classList.remove('unlocking');
    }
    
    // If already unlocked and user taps, lock it
    if (gameState.modesUnlocked && (Date.now() - lockHoldStart < 500)) {
        lockModes();
    }
}

function lockModes() {
    gameState.modesUnlocked = false;
    const lockBtn = document.getElementById('lockBtn');
    lockBtn.classList.remove('unlocked');
    lockBtn.textContent = '🔒';
    document.getElementById('modeToggle').classList.remove('visible');
}

// Update game mode state and the toggle buttons (no re-render)
function applyGameMode(mode) {
    gameState.gameMode = mode;

    // Update button states
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));

    const modeMap = {
        'match-pic': 'modeMatchPic',
        'pic-word': 'modePicWord',
        'match-word': 'modeMatchWord',
        'word-pic': 'modeWordPic',
        'phrase-build': 'modePhraseBuild',
        'phrase-pick': 'modePhrasePick'
    };
    document.getElementById(modeMap[mode]).classList.add('active');
}

function isPhraseMode(mode) {
    return mode.startsWith('phrase-');
}

// Only show the mode buttons that fit this kind of set
function showModesFor(set) {
    const kind = isPhraseSet(set) ? 'phrase' : 'word';
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.hidden = btn.dataset.kind !== kind;
    });
}

// Set game mode
function setGameMode(mode) {
    applyGameMode(mode);

    // Lock modesafter selection
    lockModes();
    
    // Re-render current round with new mode
    if (gameState.currentSet) {
        renderCurrentRound();
    }
}

// Refresh data from Firebase
async function refreshData() {
    const btn = document.getElementById('refreshBtn');
    btn.style.transform = 'rotate(360deg)';
    btn.style.transition = 'transform 0.5s';
    
    await loadCustomSetsFromFirebase();
    renderSetList();
    
    setTimeout(() => {
        btn.style.transform = '';
    }, 500);
}

// Show menu screen
async function showMenu() {
    // Stop any pending "next round" and speech from the game being left
    gameState.roundSeq++;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    menuScreen.classList.add('active');
    completeScreen.classList.remove('active');
    gameScreen.style.display = 'none';
    
    // Refresh data from Firebase when returning to menu
    await loadCustomSetsFromFirebase();
    renderSetList();
}

// Start a game with selected set
function startGame(setId) {
    const sets = getAllSets();
    const set = sets.find(s => s.id === setId);
    if (!set) return;

    // Phrase sets and word sets have their own modes
    if (isPhraseSet(set) && !isPhraseMode(gameState.gameMode)) {
        applyGameMode('phrase-build');
    } else if (!isPhraseSet(set) && isPhraseMode(gameState.gameMode)) {
        applyGameMode('pic-word');
    }
    showModesFor(set);

    gameState.currentSet = set;
    gameState.score = 0;
    gameState.currentWordIndex = 0;

    // Shuffle ALL words (or phrases) in the set
    gameState.wordsToPlay = shuffleArray([...setEntries(set)]);
    gameState.usedWords = [];

    currentSetName.textContent = set.name;
    scoreValue.textContent = '0';
    updateProgress();

    menuScreen.classList.remove('active');
    gameScreen.style.display = 'flex';

    nextRound();
}

// Setup next round
function nextRound() {
    if (gameState.currentWordIndex >= gameState.wordsToPlay.length) {
        // All words done - reshuffle and start again
        gameState.wordsToPlay = shuffleArray([...setEntries(gameState.currentSet)]);
        gameState.currentWordIndex = 0;
    }

    renderCurrentRound();
}

// A set's playable entries: words, or phrase items
function setEntries(set) {
    return set.items || set.words;
}

// Render current round based on game mode
function renderCurrentRound() {
    gameState.roundSeq++;
    const isPhrase = isPhraseSet(gameState.currentSet);
    gameGrid.classList.toggle('phrase-mode', isPhrase);
    if (isPhrase) {
        renderPhraseRound();
        return;
    }

    const currentWord= gameState.wordsToPlay[gameState.currentWordIndex];
    const mode = gameState.gameMode;
    
    // Up to 8 distinct other words; small sets just leave some cells empty
    const otherWords = pickOtherWords(gameState.currentSet.words, currentWord);

    // Grid positions (0-8, with 4 being center) - correct word goes in the first shuffled slot
    const positions = shuffleArray([0, 1, 2, 3, 5, 6, 7, 8]);
    const cellWords = {};
    cellWords[positions[0]] = currentWord;
    otherWords.forEach((w, i) => { cellWords[positions[i + 1]] = w; });

    // Determine what to show in center and surrounding cells based on mode:
    // match-pic: center=picture, surround=pictures (match picture to picture)
    // pic-word: center=picture, surround=words (match picture to word)
    // match-word: center=word, surround=words (match word to word)
    // word-pic: center=word, surround=pictures (match word to picture)
    
    const centerIsPicture = (mode === 'match-pic' || mode === 'pic-word');
    const surroundIsPicture = (mode === 'match-pic' || mode === 'word-pic');
    const currentText = escapeHtml(currentWord.word);
    
    let gridHTML = '';
    for (let i = 0; i < 9; i++) {
        if (i === 4) {
            // Center cell - draggable
            if (centerIsPicture) {
                gridHTML += `
                    <div class="grid-cell center-cell" data-position="4">
                        <div class="picture-container">
                            <img src="${escapeHtml(currentWord.image)}" alt="" onerror="imgFallback(this)" class="draggable-picture" id="draggablePic" data-word="${currentText}">
                        </div>
                    </div>
                `;
            } else {
                // Word in center - style like outside word cards
                gridHTML += `
                    <div class="grid-cell center-cell center-word-cell" data-position="4">
                        <span class="word draggable-picture" id="draggablePic" data-word="${currentText}">${currentText}</span>
                    </div>
                `;
            }
            continue;
        }

        const word = cellWords[i];
        if (!word) {
            gridHTML += `<div class="grid-cell empty" data-position="${i}"></div>`;
            continue;
        }
        const isCorrect = sameWord(word.word, currentWord.word);
        const text = escapeHtml(word.word);
        
        if (surroundIsPicture) {
            // Surrounding cells show pictures
            gridHTML += `
                <div class="grid-cell word-cell picture-mode" data-position="${i}" data-word="${text}" data-correct="${isCorrect}">
                    <img src="${escapeHtml(word.image)}" alt="" onerror="imgFallback(this)">
                    <div class="word-reveal"><span class="word">${text}</span></div>
                </div>
            `;
        } else {
            // Surrounding cells show words
            gridHTML += `
                <div class="grid-cell word-cell" data-position="${i}" data-word="${text}" data-correct="${isCorrect}">
                    <span class="word">${text}</span>
                </div>
            `;
        }
    }

    gameGrid.innerHTML = gridHTML;
    gameState.roundLocked = false;
    setupDragAndDrop();
}

// Active drag: { el, clone, touchId } - one at a time
let drag = null;

// Bind drag start on this round's draggable (document-level handlers are bound once)
function setupDragAndDrop() {
    const draggable = document.getElementById('draggablePic');
    if (!draggable) return;
    draggable.addEventListener('touchstart', startDrag, { passive: false });
    draggable.addEventListener('mousedown', startDrag);
}

// Find this drag's point in a touch or mouse event (null if the event isn't ours)
function dragPoint(e) {
    if (!e.changedTouches) return drag.touchId === null ? e : null;
    return Array.from(e.changedTouches).find(t => t.identifier === drag.touchId) || null;
}

function startDrag(e) {
    e.preventDefault();
    // Ignore a second finger, or anything while the round is finishing
    if (drag || gameState.roundLocked) return;

    const el = e.currentTarget;
    const touch = e.changedTouches ? e.changedTouches[0] : e;

    // Create clone for dragging
    const clone = el.cloneNode(true);
    clone.removeAttribute('id');
    clone.classList.add('drag-clone');
    clone.style.width = el.offsetWidth + 'px';
    clone.style.height = el.offsetHeight + 'px';
    clone.style.left = (touch.clientX - el.offsetWidth / 2) + 'px';
    clone.style.top = (touch.clientY - el.offsetHeight / 2) + 'px';
    document.body.appendChild(clone);

    drag = { el, clone, touchId: e.changedTouches ? touch.identifier : null };
    el.classList.add('dragging');
    
    // Highlight potential drop targets
    document.querySelectorAll('.word-cell').forEach(cell => cell.classList.add('drop-target'));
}

function moveDrag(e) {
    if (!drag) return;
    const point = dragPoint(e);
    if (!point) return;
    e.preventDefault();
    drag.clone.style.left = (point.clientX - drag.clone.offsetWidth / 2) + 'px';
    drag.clone.style.top = (point.clientY - drag.clone.offsetHeight / 2) + 'px';
}

function clearDrag() {
    drag.clone.remove();
    drag.el.classList.remove('dragging');
    document.querySelectorAll('.word-cell').forEach(cell => cell.classList.remove('drop-target'));
    drag = null;
}

function endDrag(e) {
    if (!drag) return;
    const point = dragPoint(e);
    if (!point) return;
    clearDrag();

    // Check which cell was dropped on
    const dropTarget = document.elementFromPoint(point.clientX, point.clientY);
    const targetCell = dropTarget?.closest('.word-cell');
    if (targetCell) {
        handleDrop(targetCell, targetCell.dataset.correct === 'true');
    }
}

// iOS can cancel a touch (notification, gesture) - drop the clone without scoring
function cancelDrag(e) {
    if (!drag || !dragPoint(e)) return;
    clearDrag();
}

// Handle drop result
function handleDrop(cell, isCorrect) {
    if (gameState.roundLocked) return;

    if (isCorrect) {
        // Success! Lock input until the next round renders
        gameState.roundLocked = true;
        cell.classList.add('correct');
        gameState.score += 1;
        scoreValue.textContent = gameState.score;

        // Show word reveal when surrounding cells are pictures (match-pic or word-pic modes)
        const surroundIsPicture = (gameState.gameMode === 'match-pic' || gameState.gameMode === 'word-pic');
        
        if (surroundIsPicture) {
            const wordReveal = cell.querySelector('.word-reveal');
            if (wordReveal) {
                wordReveal.classList.add('show');
            }
        }
        const advance = onlyIfCurrent(gameState.roundSeq, () => gameState.roundSeq, advanceRound);
        // Say the word(must start inside the touch handler on iOS), hold, then reshuffle.
        // Without speech, keep the old delays - longer when surrounding cells are pictures
        const word = gameState.wordsToPlay[gameState.currentWordIndex];
        if (!speakAndThen(spokenText(word), advance)) {
            setTimeout(advance, surroundIsPicture ? 2000 : 600);
        }
    } else {
        // Wrong answer
        cell.classList.add('wrong');
        
        setTimeout(() => {
            cell.classList.remove('wrong');
        }, 400);
    }
}

function advanceRound() {
    gameState.currentWordIndex++;
    updateProgress();
    nextRound();
}

// Brief red wobble for a wrong choice
function wobble(el) {
    el.classList.add('wrong');
    setTimeout(() => {
        el.classList.remove('wrong');
    }, 400);
}

// --- Phrase rounds ---

// phrase-build: picture, two empty slots, tap the first word then the second
// phrase-pick: phrase text, tap the matching picture from 4
function renderPhraseRound() {
    const item = gameState.wordsToPlay[gameState.currentWordIndex];
    gameState.roundLocked = false;

    if (gameState.gameMode === 'phrase-pick') {
        const pictures = pickPhrasePictures(gameState.currentSet.items, item);
        gameGrid.innerHTML = `
            <div class="phrase-round">
                <div class="phrase-text">${escapeHtml(phraseText(item))}</div>
                <div class="phrase-pictures">
                    ${pictures.map((pic, i) => `
                        <button class="grid-cell phrase-picture" data-index="${i}">
                            <img src="${escapeHtml(pic.image)}" alt="" onerror="imgFallback(this)">
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        gameGrid.querySelectorAll('.phrase-picture').forEach(btn => {
            btn.addEventListener('click', () => pickPhrasePicture(btn, pictures[btn.dataset.index] === item));
        });
        return;
    }

    gameGrid.innerHTML = `
        <div class="phrase-round">
            <div class="grid-cell phrase-main-picture">
                <img src="${escapeHtml(item.image)}" alt="" onerror="imgFallback(this)">
            </div>
            <div class="phrase-slots">
                <span class="phrase-slot" id="phraseSlotFirst"></span>
                <span class="phrase-slot" id="phraseSlotSecond"></span>
            </div>
            <div class="phrase-choices" id="phraseChoices"></div>
        </div>
    `;
    renderPhraseChoices('first');
}

function renderPhraseChoices(slot) {
    const item = gameState.wordsToPlay[gameState.currentWordIndex];
    const choices = buildChoices(gameState.currentSet.items, item, slot);
    const container = document.getElementById('phraseChoices');
    container.innerHTML = choices.map(choice => `
        <button class="grid-cell phrase-choice">${escapeHtml(choice)}</button>
    `).join('');
    container.querySelectorAll('.phrase-choice').forEach((btn, i) => {
        btn.addEventListener('click', () => choosePhraseWord(btn, slot, choices[i]));
    });
}

function choosePhraseWord(btn, slot, choice) {
    if (gameState.roundLocked) return;
    const item = gameState.wordsToPlay[gameState.currentWordIndex];
    if (!sameWord(choice, item[slot])) {
        wobble(btn);
        return;
    }

    const slotEl = document.getElementById(slot === 'first' ? 'phraseSlotFirst' : 'phraseSlotSecond');
    slotEl.textContent = choice;
    slotEl.classList.add('filled');

    if (slot === 'first') {
        renderPhraseChoices('second');
        return;
    }
    document.getElementById('phraseChoices').innerHTML = '';
    completePhraseRound(document.querySelector('.phrase-main-picture'));
}

function pickPhrasePicture(btn, isCorrect) {
    if (gameState.roundLocked) return;
    if (isCorrect) {
        completePhraseRound(btn);
    } else {
        wobble(btn);
    }
}

// Celebrate, say the whole phrase (inside the tap, for iOS), hold, then move on
function completePhraseRound(cell) {
    gameState.roundLocked = true;
    cell.classList.add('correct');
    gameState.score += 1;
    scoreValue.textContent = gameState.score;

    const item = gameState.wordsToPlay[gameState.currentWordIndex];
    const text = spokenText({ word: phraseText(item), say: item.say });
    const advance = onlyIfCurrent(gameState.roundSeq, () => gameState.roundSeq, advanceRound);
    if (!speakAndThen(text, advance)) {
        setTimeout(advance, 2000);
    }
}

// Update progress bar
function updateProgress() {
    const total = gameState.wordsToPlay.length;
    const current = gameState.currentWordIndex;
    const percent = (current / total) * 100;
    
    progressFill.style.width = percent + '%';
    progressText.textContent = `${current} / ${total}`;
}

// Show completion screen
function showComplete() {
    gameScreen.style.display = 'none';
    completeScreen.classList.add('active');
    finalScore.textContent = `You got ${gameState.score} stars!`;
}

// Login functionality
function showLoginModal() {
    loginModal.classList.add('active');
    document.getElementById('usernameInput').value = '';
    document.getElementById('passwordInput').value = '';
    document.getElementById('loginError').style.display = 'none';
}

function hideLoginModal() {
    loginModal.classList.remove('active');
}

// First sign-in on a device unlocks the family sets; after that the code opens admin
async function attemptLogin() {
    const username = document.getElementById('usernameInput').value;
    const password = document.getElementById('passwordInput').value;
    const wasSignedIn = !!(auth && auth.currentUser);

    try {
        if (!auth) throw new Error('Firebase unavailable');
        const creds = toFirebaseCredentials(username, password);
        await auth.signInWithEmailAndPassword(creds.email, creds.password);
    } catch (e) {
        console.error('Login failed:', e);
        document.getElementById('loginError').style.display = 'block';
        return;
    }

    hideLoginModal();
    updateFamilyNote();
    if (wasSignedIn) {
        gameState.isAdmin = true;
        showAdminPortal();
    } else {
        await loadCustomSetsFromFirebase();
        renderSetList();
    }
}

function logout() {
    gameState.isAdmin = false;
    adminPortal.classList.remove('active');
    menuScreen.classList.add('active');
}

// Admin Portal
function showAdminPortal() {
    menuScreen.classList.remove('active');
    adminPortal.classList.add('active');
    renderAdminSetList();
}

function renderAdminSetList() {
    const allSets = getAllSets();
    const adminSetList = document.getElementById('adminSetList');

    if (allSets.length === 0) {
        adminSetList.innerHTML = '<p style="color: #888; text-align: center;">No card sets available.</p>';
        return;
    }

    adminSetList.innerHTML = allSets.map(set => {
        const isBuiltIn = isBuiltInSet(set.id);
        const isModified = isBuiltIn && getCustomSets().some(s => s.id === set.id);
        const badge = isBuiltIn ? `<span style="font-size: 0.7rem; background: ${isModified ? '#FF9800' : '#4CAF50'}; color: white; padding: 2px 6px; border-radius: 8px; margin-left: 8px;">${isModified ? 'Modified' : 'Starter'}</span>` : '';
        
        return `
        <div class="set-item" data-set-id="${escapeHtml(set.id)}">
            <div class="set-item-info">
                <h4>${escapeHtml(set.name)}${badge}</h4>
                <span>${setCountLabel(set)}</span>
            </div>
            <div class="set-item-actions">
                <button class="btn-icon btn-edit" onclick="editSet('${set.id}')">✏️</button>
                ${isBuiltIn && isModified ? `<button class="btn-icon" style="background: #FF9800; color: white;" onclick="resetSet('${set.id}')" title="Reset to original">↺</button>` : ''}
                ${!isBuiltIn ? `<button class="btn-icon btn-delete" onclick="deleteSet('${set.id}')">🗑️</button>` : ''}
            </div>
        </div>
    `}).join('');
}

let editingSetId = null;
let editingWords = [];
let editingType = 'word'; // 'word' | 'phrase'

// Switching type on a new set starts its list fresh
function changeSetType(type) {
    editingType = type;
    editingWords = [];
    renderWordList();
}

function showEditSetModal(setId = null) {
    editingSetId = setId;
    const modal = document.getElementById('editSetModal');
    const title = document.getElementById('editSetTitle');
    const nameInput = document.getElementById('setNameInput');

    if (setId) {
        // Editing existing set - find it from all sets
        const allSets = getAllSets();
        const set = allSets.find(s => s.id === setId);
        if (set) {
            title.textContent = 'Edit Card Set';
            nameInput.value = set.name;
            editingType = isPhraseSet(set) ? 'phrase' : 'word';
            editingWords = (set.items || set.words).map(w => ({...w})); // Deep copy
        }
    } else {
        // New set
        title.textContent = 'New Card Set';
        nameInput.value = '';
        editingType = 'word';
        editingWords = [];
    }

    // Type is chosen once, when the set is created
    const typeInput = document.getElementById('setTypeInput');
    typeInput.value = editingType;
    typeInput.disabled = !!setId;

    renderWordList();
    modal.classList.add('active');
}

function hideEditSetModal() {
    editSetModal.classList.remove('active');
    editingSetId = null;
    editingWords = [];
}

function renderWordList() {
    const wordList = document.getElementById('wordList');
    document.getElementById('addWordBtn').textContent = editingType === 'phrase' ? '+ Add Phrase' : '+ Add Word';

    // Phrase rows: two words; word rows: one word
    const textInputs = (word, index) => editingType === 'phrase'
        ? `<input type="text" value="${escapeHtml(word.first)}" placeholder="First word" onchange="updateWord(${index}, 'first', this.value)">
            <input type="text" value="${escapeHtml(word.second)}" placeholder="Second word" onchange="updateWord(${index}, 'second', this.value)">`
        : `<input type="text" value="${escapeHtml(word.word)}" placeholder="Word" onchange="updateWord(${index}, 'word', this.value)">`;
    
    wordList.innerHTML = editingWords.map((word, index) => `
        <div class="word-item" data-index="${index}">
            ${textInputs(word, index)}
            <input type="text" class="say-input" value="${escapeHtml(word.say || '')}" placeholder="Say it like (optional)" onchange="updateWord(${index}, 'say', this.value)">
            <label class="upload-btn">
                📷 Image
                <input type="file" accept="image/*" onchange="handleImageUpload(${index}, this)">
            </label>
            ${word.image ? `<img src="${escapeHtml(word.image)}" class="preview" alt="" onerror="imgFallback(this)">` : '<div class="preview"></div>'}
            <button class="btn-remove-word" onclick="removeWord(${index})">×</button>
        </div>
    `).join('');
}

function addWordRow() {
    editingWords.push(editingType === 'phrase' ? { first: '', second: '', image: '' } : { word: '', image: '' });
    renderWordList();
}

function removeWord(index) {
    editingWords.splice(index, 1);
    renderWordList();
}

function updateWord(index, field, value) {
    editingWords[index][field] = value;
}

function handleImageUpload(index, input) {
    const file = input.files[0];
    if (!file) return;

    // Accept any image - we'll compress it during crop
    const reader = new FileReader();
    reader.onload = (e) => {
        // First resize large images before showing crop modal
        compressImageForCrop(e.target.result, (compressedSrc) => {
            showCropModal(compressedSrc, index);
        });
    };
    reader.readAsDataURL(file);
}

// Compress image before cropping if it's too large
function compressImageForCrop(src, callback) {
    const img = new Image();
    img.onload = function() {
        // If image is reasonably sized, use as-is
        if (img.width <= 1200 && img.height <= 1200) {
            callback(src);
            return;
        }
        
        // Resize large images for the crop preview
        const canvas = document.createElement('canvas');
        const maxSize = 1200;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
            if (width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
            }
        } else {
            if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
            }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        callback(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = src;
}

// Crop modal state
let cropState = {
    imageIndex: null,
    x: 0,
    y: 0,
    scale: 1,
    isDragging: false,
    startX: 0,
    startY: 0,
    imgWidth: 0,
    imgHeight: 0
};

function showCropModal(imageSrc, index) {
    cropState.imageIndex = index;
    cropState.scale = 1;
    cropState.x = 0;
    cropState.y = 0;
    
    const modal = document.getElementById('cropModal');
    const img = document.getElementById('cropImage');
    const slider = document.getElementById('zoomSlider');
    
    slider.value = 1;
    
    img.onload = function() {
        cropState.imgWidth = img.naturalWidth;
        cropState.imgHeight = img.naturalHeight;
        
        // Fit image to container initially
        const container = document.getElementById('cropContainer');
        const containerSize = 280;
        const minDim = Math.min(cropState.imgWidth, cropState.imgHeight);
        cropState.scale = containerSize / minDim;
        
        // Center the image
        cropState.x = (containerSize - cropState.imgWidth * cropState.scale) / 2;
        cropState.y = (containerSize - cropState.imgHeight * cropState.scale) / 2;
        
        updateCropImage();
        slider.value = 1;
    };
    
    img.src = imageSrc;
    modal.classList.add('active');
    
    setupCropEvents();
}

function updateCropImage() {
    const img = document.getElementById('cropImage');
    img.style.transform = `translate(${cropState.x}px, ${cropState.y}px) scale(${cropState.scale})`;
}

let cropEventsBound = false;

function setupCropEvents() {
    const slider = document.getElementById('zoomSlider');

    // Zoom slider
    slider.oninput = function() {
        const containerSize = 280;
        const minDim = Math.min(cropState.imgWidth, cropState.imgHeight);
        const baseScale = containerSize / minDim;
        cropState.scale = baseScale * parseFloat(this.value);
        updateCropImage();
    };
    
    // Cancel button
    document.getElementById('cancelCrop').onclick = () => {
        document.getElementById('cropModal').classList.remove('active');
    };
    
    // Apply button
    document.getElementById('applyCrop').onclick = applyCrop;

    // Drag listeners only need binding once
    if (cropEventsBound) return;
    cropEventsBound = true;
    const container = document.getElementById('cropContainer');
    
    const handleStart = (e) => {
        e.preventDefault();
        cropState.isDragging = true;
        const point = e.touches ? e.touches[0] : e;
        cropState.startX = point.clientX - cropState.x;
        cropState.startY = point.clientY - cropState.y;
    };
    
    const handleMove = (e) => {
        if (!cropState.isDragging) return;
        e.preventDefault();
        const point = e.touches ? e.touches[0] : e;
        cropState.x = point.clientX - cropState.startX;
        cropState.y = point.clientY - cropState.startY;
        updateCropImage();
    };
    
    const handleEnd = () => {
        cropState.isDragging = false;
    };
    
    container.addEventListener('mousedown', handleStart);
    container.addEventListener('touchstart', handleStart, { passive: false });
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);
    document.addEventListener('touchcancel', handleEnd);
}

function applyCrop() {
    const img = document.getElementById('cropImage');
    const containerSize = 280;
    const outputSize = 150; // Smaller output for better storage (150x150 is plenty for game)
    
    const canvas = document.createElement('canvas');
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext('2d');
    
    // Calculate what portion of the image is visible
    const sourceX = -cropState.x / cropState.scale;
    const sourceY = -cropState.y / cropState.scale;
    const sourceSize = containerSize / cropState.scale;
    
    ctx.drawImage(
        img,
        sourceX, sourceY, sourceSize, sourceSize,
        0, 0, outputSize, outputSize
    );
    
    // Compress to JPEG at 75% quality - keeps file size small
    const croppedImage = canvas.toDataURL('image/jpeg', 0.75);
    editingWords[cropState.imageIndex].image = croppedImage;
    
    document.getElementById('cropModal').classList.remove('active');
    renderWordList();
}

async function saveSet() {
    const name = document.getElementById('setNameInput').value.trim();
    
    if (!name) {
        alert('Please enter a set name!');
        return;
    }

    // Keep "say it like" only when filled in
    const tidySay = ({ say, ...w }) => (say && say.trim() ? { ...w, say: say.trim() } : w);
    const id = editingSetId || 'custom_' + Date.now();
    let setToSave;

    if (editingType === 'phrase') {
        const validItems = editingWords
            .map(w => ({ ...w, first: (w.first || '').trim(), second: (w.second || '').trim() }))
            .filter(w => w.first && w.second && w.image)
            .map(tidySay);
        if (validItems.length < 4) {
            alert('Please add at least 4 complete phrases (two words and a picture each)!');
            return;
        }
        setToSave = { id: id, name: name, type: 'phrase', items: validItems };
    } else {
        // Filter out incomplete words
        const validWords = editingWords
            .map(w => ({ ...w, word: (w.word || '').trim() }))
            .filter(w => w.word && w.image)
            .map(tidySay);
        if (validWords.length < 3) {
            alert('Please add at least 3 complete word/image pairs!');
            return;
        }
        setToSave = editingSetId
            ? { id: id, name: name, words: validWords, isBuiltIn: isBuiltInSet(editingSetId) }
            : { id: id, name: name, words: validWords };
    }

    // Firestore docs max out at 1MB (pictures are stored inside the set)
    const bytes = estimateSetBytes(setToSave);
    const kb = Math.round(bytes / 1000);
    if (bytes > SET_MAX_BYTES) {
        alert(`This set is too large to save (${kb} KB of 1000 KB). Try splitting it into two sets.`);
        return;
    }
    if (bytes > SET_WARN_BYTES && !confirm(`This set is getting very large (${kb} KB of 1000 KB). Save anyway?`)) {
        return;
    }

    const index = customSetsCache.findIndex(s => s.id === setToSave.id);
    if (index !== -1) {
        customSetsCache[index] = setToSave;
    } else {
        customSetsCache.push(setToSave);
    }

    // Save to Firebase
    await saveSetToFirebase(setToSave);
    
    hideEditSetModal();
    renderAdminSetList();
}

// Make these functions globally accessible
window.editSet = function(setId) {
    showEditSetModal(setId);
};

window.deleteSet = async function(setId) {
    if (confirm('Are you sure you want to delete this set?')) {
        customSetsCache = customSetsCache.filter(s => s.id !== setId);
        await deleteSetFromFirebase(setId);
        renderAdminSetList();
    }
};

window.resetSet = async function(setId) {
    const originalSet = getOriginalBuiltInSet(setId);
    if (originalSet && confirm(`Reset "${originalSet.name}" back to the original ${originalSet.words.length} words?`)) {
        customSetsCache = customSetsCache.filter(s => s.id !== setId);
        await deleteSetFromFirebase(setId);
        renderAdminSetList();
    }
};

window.updateWord = updateWord;
window.handleImageUpload = handleImageUpload;
window.removeWord = removeWord;

// Export backup - downloads custom sets as JSON file
function exportBackup() {
    const customSets = getCustomSets();
    
    if (customSets.length === 0) {
        alert('No custom card sets to export!');
        return;
    }
    
    const backup = {
        version: 1,
        exportDate: new Date().toISOString(),
        sets: customSets
    };
    
    const dataStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `word-match-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Backup downloaded! Keep this file safe.');
}

// Import backup - restores custom sets from JSON file
function importBackup(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const backup = JSON.parse(e.target.result);
            
            // Validate backup structure
            if (!backup.sets || !Array.isArray(backup.sets)) {
                throw new Error('Invalid backup file format');
            }
            
            const existingSets = getCustomSets();
            const existingIds = existingSets.map(s => s.id);
            
            // Check for duplicates
            const newSets = backup.sets.filter(s => !existingIds.includes(s.id));
            const duplicates = backup.sets.length - newSets.length;
            
            if (newSets.length === 0) {
                alert('All sets in this backup already exist!');
                return;
            }
            
            let message = `Import ${newSets.length} card set(s)?`;
            if (duplicates > 0) {
                message += `\n(${duplicates} duplicate(s) will be skipped)`;
            }
            
            if (confirm(message)) {
                for (const set of newSets) {
                    customSetsCache.push(set);
                    await saveSetToFirebase(set);
                }
                renderAdminSetList();
                alert(`Successfully imported ${newSets.length} card set(s)!`);
            }
        } catch (err) {
            alert('Error reading backup file: ' + err.message);
        }
    };
    reader.readAsText(file);
    
    // Reset file input so same file can be selected again
    event.target.value = '';
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
