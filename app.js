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
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

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

// Game state
let gameState = {
    currentSet: null,
    currentWordIndex: 0,
    score: 0,
    wordsToPlay: [],
    usedWords: [],
    isAdmin: false,
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

// Load custom sets from Firebase
async function loadCustomSetsFromFirebase() {
    try {
        const snapshot = await db.collection('cardSets').get();
        customSetsCache = [];
        snapshot.forEach(doc => {
            customSetsCache.push({ id: doc.id, ...doc.data() });
        });
        isDataLoaded = true;
        console.log('Loaded', customSetsCache.length, 'custom sets from Firebase');
        return customSetsCache;
    } catch (e) {
        console.error('Error loading from Firebase:', e);
        // Fallback to localStorage if offline
        const stored = localStorage.getItem('wordMatchCustomSets');
        customSetsCache = stored ? JSON.parse(stored) : [];
        isDataLoaded = true;
        return customSetsCache;
    }
}

// Save a single set to Firebase
async function saveSetToFirebase(set) {
    try {
        await db.collection('cardSets').doc(set.id).set(set);
        // Also cache locally for offline use
        localStorage.setItem('wordMatchCustomSets', JSON.stringify(customSetsCache));
        return true;
    } catch (e) {
        console.error('Error saving to Firebase:', e);
        alert('Error saving: ' + e.message + '\nChanges saved locally only.');
        localStorage.setItem('wordMatchCustomSets', JSON.stringify(customSetsCache));
        return false;
    }
}

// Delete a set from Firebase
async function deleteSetFromFirebase(setId) {
    try {
        await db.collection('cardSets').doc(setId).delete();
        // Also update local cache
        localStorage.setItem('wordMatchCustomSets', JSON.stringify(customSetsCache));
        return true;
    } catch (e) {
        console.error('Error deleting from Firebase:', e);
        alert('Error deleting: ' + e.message);
        return false;
    }
}

// Save custom sets (updates cache and Firebase)
async function saveCustomSets(sets) {
    customSetsCache = sets;
    // Save all sets to local storage as backup
    localStorage.setItem('wordMatchCustomSets', JSON.stringify(sets));
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
    
    try {
        // Show loading state
        if (setList) {
            setList.innerHTML = '<p style="text-align: center; color: #888;">Loading card sets...</p>';
        }
        
        // Load data from Firebase
        await loadCustomSetsFromFirebase();
        
        renderSetList();
        setupEventListeners();
        console.log('Initialization complete!');
    } catch (e) {
        console.error('Init error:', e);
        // Still render with built-in sets if Firebase fails
        renderSetList();
        setupEventListeners();
    }
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
        <div class="set-card" data-set-id="${set.id}">
            <h3>${set.name}</h3>
            <p>${set.words.length} words</p>
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

    // Enter key for login
    document.getElementById('passwordInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') attemptLogin();
    });
}

// Lock button hold functions
function startLockHold(e) {
    e.preventDefault();
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
        
        // Auto-lock after 10 seconds of inactivity
        setTimeout(() => {
            lockModes();
        }, 10000);
    }, 3000);
}

function endLockHold() {
    if (lockHoldTimer) {
        clearTimeout(lockHoldTimer);
        lockHoldTimer = null;
    }
    const lockBtn = document.getElementById('lockBtn');
    lockBtn.classList.remove('unlocking');
    
    // If already unlocked, clicking locks it again
    if (gameState.modesUnlocked) {
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

// Set game mode
function setGameMode(mode) {
    gameState.gameMode = mode;
    
    // Update button states
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    
    const modeMap = {
        'match-pic': 'modeMatchPic',
        'pic-word': 'modePicWord',
        'match-word': 'modeMatchWord',
        'word-pic': 'modeWordPic'
    };
    document.getElementById(modeMap[mode]).classList.add('active');
    
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

    gameState.currentSet = set;
    gameState.score = 0;
    gameState.currentWordIndex = 0;
    
    // Shuffle all words and pick 9 (or less if set has fewer)
    const shuffled = shuffleArray([...set.words]);
    const numToPlay = Math.min(9, shuffled.length);
    gameState.wordsToPlay = shuffled.slice(0, numToPlay);
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
        showComplete();
        return;
    }

    renderCurrentRound();
}

// Render current round based on game mode
function renderCurrentRound() {
    const currentWord = gameState.wordsToPlay[gameState.currentWordIndex];
    const mode = gameState.gameMode;
    
    // Get 8 other words for the grid (excluding current)
    const otherWords = gameState.wordsToPlay
        .filter((_, i) => i !== gameState.currentWordIndex)
        .slice(0, 8);
    
    // If not enough words, fill with random from set
    while (otherWords.length < 8) {
        const randomWord = gameState.currentSet.words[Math.floor(Math.random() * gameState.currentSet.words.length)];
        if (randomWord.word !== currentWord.word && !otherWords.find(w => w.word === randomWord.word)) {
            otherWords.push(randomWord);
        }
    }

    // Create grid positions (0-8, with 4 being center)
    const positions = [0, 1, 2, 3, 5, 6, 7, 8]; // Exclude center (4)
    shuffleArray(positions);
    shuffleArray(otherWords);

    // Build grid HTML based on mode
    let gridHTML = '';
    let wordIndex = 0;
    
    // Determine what to show in center and surrounding cells based on mode:
    // match-pic: center=picture, surround=pictures (match picture to picture)
    // pic-word: center=picture, surround=words (match picture to word)
    // match-word: center=word, surround=words (match word to word)
    // word-pic: center=word, surround=pictures (match word to picture)
    
    const centerIsPicture = (mode === 'match-pic' || mode === 'pic-word');
    const surroundIsPicture = (mode === 'match-pic' || mode === 'word-pic');
    const showWordReveal = surroundIsPicture; // Show word after correct match when surrounding is pictures
    
    for (let i = 0; i < 9; i++) {
        if (i === 4) {
            // Center cell - draggable
            if (centerIsPicture) {
                gridHTML += `
                    <div class="grid-cell center-cell" data-position="4">
                        <div class="picture-container">
                            <img src="${currentWord.image}" alt="" class="draggable-picture" id="draggablePic" data-word="${currentWord.word}">
                        </div>
                    </div>
                `;
            } else {
                gridHTML += `
                    <div class="grid-cell center-cell" data-position="4">
                        <div class="picture-container">
                            <span class="word draggable-picture" id="draggablePic" data-word="${currentWord.word}" style="font-size: clamp(1.2rem, 5vw, 2rem); font-weight: 700; cursor: grab;">${currentWord.word}</span>
                        </div>
                    </div>
                `;
            }
        } else {
            const word = otherWords[wordIndex] || currentWord;
            const isCorrect = word.word === currentWord.word;
            
            if (surroundIsPicture) {
                // Surrounding cells show pictures
                gridHTML += `
                    <div class="grid-cell word-cell picture-mode" data-position="${i}" data-word="${word.word}" data-correct="${isCorrect}">
                        <img src="${word.image}" alt="">
                        <div class="word-reveal"><span class="word">${word.word}</span></div>
                    </div>
                `;
            } else {
                // Surrounding cells show words
                gridHTML += `
                    <div class="grid-cell word-cell" data-position="${i}" data-word="${word.word}" data-correct="${isCorrect}">
                        <span class="word">${word.word}</span>
                    </div>
                `;
            }
            wordIndex++;
        }
    }

    // Make sure correct word is in one of the positions
    const hasCorrectWord = otherWords.some(w => w.word === currentWord.word);
    if (!hasCorrectWord) {
        // Replace a random word cell with the correct word
        const randomPos = positions[Math.floor(Math.random() * positions.length)];
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = gridHTML;
        const targetCell = tempDiv.querySelector(`[data-position="${randomPos}"]`);
        if (targetCell) {
            targetCell.dataset.word = currentWord.word;
            targetCell.dataset.correct = 'true';
            
            if (surroundIsPicture) {
                targetCell.querySelector('img').src = currentWord.image;
                targetCell.querySelector('.word-reveal .word').textContent = currentWord.word;
            } else {
                targetCell.querySelector('.word').textContent = currentWord.word;
            }
        }
        gridHTML = tempDiv.innerHTML;
    }

    gameGrid.innerHTML = gridHTML;
    setupDragAndDrop();
}

// Setup drag and drop functionality
function setupDragAndDrop() {
    const draggable = document.getElementById('draggablePic');
    const wordCells = document.querySelectorAll('.word-cell');
    
    let isDragging = false;
    let clone = null;
    let startX, startY;

    const handleStart = (e) => {
        e.preventDefault();
        isDragging = true;
        
        const touch = e.touches ? e.touches[0] : e;
        startX = touch.clientX;
        startY = touch.clientY;

        // Create clone for dragging
        clone = draggable.cloneNode(true);
        clone.classList.add('drag-clone');
        clone.style.width = draggable.offsetWidth + 'px';
        clone.style.height = draggable.offsetHeight + 'px';
        clone.style.left = (startX - draggable.offsetWidth / 2) + 'px';
        clone.style.top = (startY - draggable.offsetHeight / 2) + 'px';
        document.body.appendChild(clone);

        draggable.classList.add('dragging');
        
        // Highlight potential drop targets
        wordCells.forEach(cell => cell.classList.add('drop-target'));
    };

    const handleMove = (e) => {
        if (!isDragging || !clone) return;
        e.preventDefault();

        const touch = e.touches ? e.touches[0] : e;
        clone.style.left = (touch.clientX - clone.offsetWidth / 2) + 'px';
        clone.style.top = (touch.clientY - clone.offsetHeight / 2) + 'px';
    };

    const handleEnd = (e) => {
        if (!isDragging) return;
        isDragging = false;

        const touch = e.changedTouches ? e.changedTouches[0] : e;
        const dropX = touch.clientX;
        const dropY = touch.clientY;

        // Remove clone
        if (clone) {
            clone.remove();
            clone = null;
        }

        draggable.classList.remove('dragging');
        wordCells.forEach(cell => cell.classList.remove('drop-target'));

        // Check which cell was dropped on
        const dropTarget = document.elementFromPoint(dropX, dropY);
        const targetCell = dropTarget?.closest('.word-cell');

        if (targetCell) {
            const isCorrect = targetCell.dataset.correct === 'true';
            handleDrop(targetCell, isCorrect);
        }
    };

    // Touch events
    draggable.addEventListener('touchstart', handleStart, { passive: false });
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);

    // Mouse events (for testing on desktop)
    draggable.addEventListener('mousedown', handleStart);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
}

// Handle drop result
function handleDrop(cell, isCorrect) {
    if (isCorrect) {
        // Success!
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
            // Longer delay to show the word
            setTimeout(() => {
                gameState.currentWordIndex++;
                updateProgress();
                nextRound();
            }, 2000);
        } else {
            setTimeout(() => {
                gameState.currentWordIndex++;
                updateProgress();
                nextRound();
            }, 600);
        }
    } else {
        // Wrong answer
        cell.classList.add('wrong');
        
        setTimeout(() => {
            cell.classList.remove('wrong');
        }, 400);
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

// Shuffle array helper
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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

function attemptLogin() {
    const username = document.getElementById('usernameInput').value;
    const password = document.getElementById('passwordInput').value;

    if (username === 'belinda' && password === 'asher') {
        gameState.isAdmin = true;
        hideLoginModal();
        showAdminPortal();
    } else {
        document.getElementById('loginError').style.display = 'block';
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
        <div class="set-item" data-set-id="${set.id}">
            <div class="set-item-info">
                <h4>${set.name}${badge}</h4>
                <span>${set.words.length} words</span>
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
            editingWords = set.words.map(w => ({...w})); // Deep copy
        }
    } else {
        // New set
        title.textContent = 'New Card Set';
        nameInput.value = '';
        editingWords = [];
    }

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
    
    wordList.innerHTML = editingWords.map((word, index) => `
        <div class="word-item" data-index="${index}">
            <input type="text" value="${word.word}" placeholder="Word" onchange="updateWord(${index}, 'word', this.value)">
            <label class="upload-btn">
                📷 Image
                <input type="file" accept="image/*" onchange="handleImageUpload(${index}, this)">
            </label>
            ${word.image ? `<img src="${word.image}" class="preview" alt="">` : '<div class="preview"></div>'}
            <button class="btn-remove-word" onclick="removeWord(${index})">×</button>
        </div>
    `).join('');
}

function addWordRow() {
    if (editingWords.length >= 20) {
        alert('Maximum 20 words per set!');
        return;
    }
    editingWords.push({ word: '', image: '' });
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

function setupCropEvents() {
    const container = document.getElementById('cropContainer');
    const img = document.getElementById('cropImage');
    const slider = document.getElementById('zoomSlider');
    
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
    
    // Remove old listeners
    container.replaceWith(container.cloneNode(true));
    const newContainer = document.getElementById('cropContainer');
    const newImg = document.getElementById('cropImage');
    newImg.src = img.src;
    
    newContainer.addEventListener('mousedown', handleStart);
    newContainer.addEventListener('touchstart', handleStart, { passive: false });
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);
    
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

    // Filter out incomplete words
    const validWords = editingWords.filter(w => w.word && w.image);
    
    if (validWords.length < 3) {
        alert('Please add at least 3 complete word/image pairs!');
        return;
    }

    let setToSave;
    
    if (editingSetId) {
        // Update existing set
        const index = customSetsCache.findIndex(s => s.id === editingSetId);
        setToSave = {
            id: editingSetId,
            name: name,
            words: validWords,
            isBuiltIn: isBuiltInSet(editingSetId)
        };
        
        if (index !== -1) {
            customSetsCache[index] = setToSave;
        } else {
            customSetsCache.push(setToSave);
        }
    } else {
        // Create new set
        setToSave = {
            id: 'custom_' + Date.now(),
            name: name,
            words: validWords
        };
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
    reader.onload = function(e) {
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
                const merged = [...existingSets, ...newSets];
                saveCustomSets(merged);
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
