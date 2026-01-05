// Word Match Game - Main Application

// Default card sets (built-in)
const defaultSets = [
    {
        id: 'colors',
        name: 'Colors',
        words: [
            { word: 'Red', image: 'images/colors/red.svg' },
            { word: 'Blue', image: 'images/colors/blue.svg' },
            { word: 'Green', image: 'images/colors/green.svg' },
            { word: 'Yellow', image: 'images/colors/yellow.svg' },
            { word: 'Orange', image: 'images/colors/orange.svg' },
            { word: 'Purple', image: 'images/colors/purple.svg' },
            { word: 'Pink', image: 'images/colors/pink.svg' },
            { word: 'Brown', image: 'images/colors/brown.svg' },
            { word: 'Black', image: 'images/colors/black.svg' },
            { word: 'White', image: 'images/colors/white.svg' }
        ]
    },
    {
        id: 'animals',
        name: 'Animals',
        words: [
            { word: 'Cat', image: 'images/animals/cat.svg' },
            { word: 'Dog', image: 'images/animals/dog.svg' },
            { word: 'Bird', image: 'images/animals/bird.svg' },
            { word: 'Fish', image: 'images/animals/fish.svg' },
            { word: 'Rabbit', image: 'images/animals/rabbit.svg' },
            { word: 'Horse', image: 'images/animals/horse.svg' },
            { word: 'Cow', image: 'images/animals/cow.svg' },
            { word: 'Pig', image: 'images/animals/pig.svg' },
            { word: 'Duck', image: 'images/animals/duck.svg' },
            { word: 'Sheep', image: 'images/animals/sheep.svg' }
        ]
    },
    {
        id: 'items',
        name: 'Simple Items',
        words: [
            { word: 'Ball', image: 'images/items/ball.svg' },
            { word: 'Book', image: 'images/items/book.svg' },
            { word: 'Cup', image: 'images/items/cup.svg' },
            { word: 'Chair', image: 'images/items/chair.svg' },
            { word: 'Table', image: 'images/items/table.svg' },
            { word: 'Bed', image: 'images/items/bed.svg' },
            { word: 'Phone', image: 'images/items/phone.svg' },
            { word: 'Clock', image: 'images/items/clock.svg' },
            { word: 'Key', image: 'images/items/key.svg' },
            { word: 'Hat', image: 'images/items/hat.svg' }
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
    isAdmin: false
};

// Get custom sets from localStorage
function getCustomSets() {
    const stored = localStorage.getItem('wordMatchCustomSets');
    return stored ? JSON.parse(stored) : [];
}

// Save custom sets to localStorage
function saveCustomSets(sets) {
    localStorage.setItem('wordMatchCustomSets', JSON.stringify(sets));
}

// Get all sets (default + custom)
function getAllSets() {
    return [...defaultSets, ...getCustomSets()];
}

// DOM Elements
const menuScreen = document.getElementById('menuScreen');
const gameScreen = document.getElementById('gameScreen');
const completeScreen = document.getElementById('completeScreen');
const setList = document.getElementById('setList');
const gameGrid = document.getElementById('gameGrid');
const scoreValue = document.getElementById('scoreValue');
const currentSetName = document.getElementById('currentSetName');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const finalScore = document.getElementById('finalScore');
const celebration = document.getElementById('celebration');
const loginModal = document.getElementById('loginModal');
const adminPortal = document.getElementById('adminPortal');
const editSetModal = document.getElementById('editSetModal');

// Initialize the app
function init() {
    renderSetList();
    setupEventListeners();
}

// Render the set selection list
function renderSetList() {
    const sets = getAllSets();
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
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('menuBtn').addEventListener('click', showMenu);
    document.getElementById('menuBtn2').addEventListener('click', showMenu);
    document.getElementById('playAgainBtn').addEventListener('click', () => {
        startGame(gameState.currentSet.id);
    });
    document.getElementById('loginBtn').addEventListener('click', showLoginModal);
    document.getElementById('cancelLogin').addEventListener('click', hideLoginModal);
    document.getElementById('submitLogin').addEventListener('click', attemptLogin);
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('addSetBtn').addEventListener('click', () => showEditSetModal());
    document.getElementById('cancelEditSet').addEventListener('click', hideEditSetModal);
    document.getElementById('saveSetBtn').addEventListener('click', saveSet);
    document.getElementById('addWordBtn').addEventListener('click', addWordRow);

    // Enter key for login
    document.getElementById('passwordInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') attemptLogin();
    });
}

// Show menu screen
function showMenu() {
    menuScreen.classList.add('active');
    completeScreen.classList.remove('active');
    gameScreen.style.display = 'none';
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
    gameState.wordsToPlay = shuffleArray([...set.words]);
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

    const currentWord = gameState.wordsToPlay[gameState.currentWordIndex];
    
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

    // Build grid HTML
    let gridHTML = '';
    let wordIndex = 0;
    
    for (let i = 0; i < 9; i++) {
        if (i === 4) {
            // Center cell with picture
            gridHTML += `
                <div class="grid-cell center-cell" data-position="4">
                    <div class="picture-container">
                        <img src="${currentWord.image}" alt="" class="draggable-picture" id="draggablePic" data-word="${currentWord.word}">
                    </div>
                </div>
            `;
        } else {
            const word = otherWords[wordIndex] || currentWord;
            const isCorrect = word.word === currentWord.word;
            gridHTML += `
                <div class="grid-cell word-cell" data-position="${i}" data-word="${word.word}" data-correct="${isCorrect}">
                    <span class="word">${word.word}</span>
                </div>
            `;
            wordIndex++;
        }
    }

    // Make sure correct word is in one of the positions
    const hasCorrectWord = otherWords.some(w => w.word === currentWord.word);
    if (!hasCorrectWord) {
        // Replace a random word cell with the correct word
        const randomPos = positions[Math.floor(Math.random() * positions.length)];
        gridHTML = gridHTML.replace(
            new RegExp(`data-position="${randomPos}"[^>]*data-correct="false"`),
            `data-position="${randomPos}" data-word="${currentWord.word}" data-correct="true"`
        );
        // Also update the word text
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = gridHTML;
        const targetCell = tempDiv.querySelector(`[data-position="${randomPos}"]`);
        if (targetCell) {
            targetCell.querySelector('.word').textContent = currentWord.word;
            targetCell.dataset.word = currentWord.word;
            targetCell.dataset.correct = 'true';
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
        
        // Play success sound effect (visual only for now)
        createConfetti();

        setTimeout(() => {
            gameState.currentWordIndex++;
            updateProgress();
            nextRound();
        }, 800);
    } else {
        // Wrong answer
        cell.classList.add('wrong');
        
        setTimeout(() => {
            cell.classList.remove('wrong');
        }, 500);
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
    
    // Big celebration
    for (let i = 0; i < 50; i++) {
        setTimeout(() => createConfetti(), i * 50);
    }
}

// Create confetti effect
function createConfetti() {
    const colors = ['#FF6B9D', '#7C4DFF', '#00E676', '#FFD54F', '#FF8A80', '#B388FF'];
    
    for (let i = 0; i < 10; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
        celebration.appendChild(confetti);

        setTimeout(() => confetti.remove(), 3000);
    }
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
    const customSets = getCustomSets();
    const adminSetList = document.getElementById('adminSetList');

    if (customSets.length === 0) {
        adminSetList.innerHTML = '<p style="color: #888; text-align: center;">No custom sets yet. Add one!</p>';
        return;
    }

    adminSetList.innerHTML = customSets.map(set => `
        <div class="set-item" data-set-id="${set.id}">
            <div class="set-item-info">
                <h4>${set.name}</h4>
                <span>${set.words.length} words</span>
            </div>
            <div class="set-item-actions">
                <button class="btn-icon btn-edit" onclick="editSet('${set.id}')">✏️</button>
                <button class="btn-icon btn-delete" onclick="deleteSet('${set.id}')">🗑️</button>
            </div>
        </div>
    `).join('');
}

let editingSetId = null;
let editingWords = [];

function showEditSetModal(setId = null) {
    editingSetId = setId;
    const modal = document.getElementById('editSetModal');
    const title = document.getElementById('editSetTitle');
    const nameInput = document.getElementById('setNameInput');

    if (setId) {
        // Editing existing set
        const customSets = getCustomSets();
        const set = customSets.find(s => s.id === setId);
        if (set) {
            title.textContent = 'Edit Card Set';
            nameInput.value = set.name;
            editingWords = [...set.words];
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

    // Check file size (max 100KB for GitHub hosting)
    if (file.size > 100 * 1024) {
        alert('Image too large! Please use images under 100KB for best performance.');
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        editingWords[index].image = e.target.result;
        renderWordList();
    };
    reader.readAsDataURL(file);
}

function saveSet() {
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

    const customSets = getCustomSets();

    if (editingSetId) {
        // Update existing set
        const index = customSets.findIndex(s => s.id === editingSetId);
        if (index !== -1) {
            customSets[index].name = name;
            customSets[index].words = validWords;
        }
    } else {
        // Create new set
        const newSet = {
            id: 'custom_' + Date.now(),
            name: name,
            words: validWords
        };
        customSets.push(newSet);
    }

    saveCustomSets(customSets);
    hideEditSetModal();
    renderAdminSetList();
}

// Make these functions globally accessible
window.editSet = function(setId) {
    showEditSetModal(setId);
};

window.deleteSet = function(setId) {
    if (confirm('Are you sure you want to delete this set?')) {
        const customSets = getCustomSets();
        const filtered = customSets.filter(s => s.id !== setId);
        saveCustomSets(filtered);
        renderAdminSetList();
    }
};

window.updateWord = updateWord;
window.handleImageUpload = handleImageUpload;
window.removeWord = removeWord;

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
