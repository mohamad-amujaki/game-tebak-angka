"use strict";
// ============================================================================
// CONSTANTS
// ============================================================================
const GAME_CONFIG = {
    DEFAULT_LEVEL: 'easy',
    DEFAULT_TIMER_MINUTES: 5,
    SECONDS_PER_MINUTE: 60,
    TIMER_WARNING_THRESHOLD: 60, // seconds
    TIMER_UPDATE_INTERVAL: 1000, // milliseconds
    FEEDBACK_DISPLAY_DURATION: 2000, // milliseconds
    NEXT_QUESTION_DELAY: 2500, // milliseconds
    STAR_ANIMATION_DELAY: 200, // milliseconds
    STAR_DISPLAY_DURATION: 2500, // milliseconds
    STAT_ANIMATION_DURATION: 500, // milliseconds
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 20,
    OPTIONS_COUNT: 4,
    MAX_GRID_COLS_SMALL: 10,
    MAX_GRID_COLS_MEDIUM: 25,
    GRID_COLS_SMALL: 5,
    GRID_COLS_LARGE: 10,
    VISUAL_TYPES: {
        EMOJI: 0,
        SVG: 1,
        MIX: 2
    },
    STORAGE_KEY: 'playerData'
};
const TIMER_DURATIONS = {
    MIN_5: 5,
    MIN_10: 10,
    MIN_15: 15
};
const FEEDBACK_MESSAGES = {
    CORRECT: '🎉 Benar! Bagus sekali!',
    WRONG: '😔 Belum tepat, coba lagi!'
};
const END_GAME_TITLES = {
    TIME_UP: '⏰ Waktu Habis!',
    STOPPED: '⏹️ Permainan Dihentikan'
};
const SPEECH_MESSAGES = [
    'Oops, coba lagi!',
    'Hampir benar, coba sekali lagi'
];
const AUDIO_CONFIG = {
    APPLAUSE_DURATION: 1.5, // seconds
    NUM_CLAPS: 8,
    CLAP_DURATION: 0.05, // seconds
    GAIN_VALUE: 0.5,
    SPEECH_VOLUME: 0.8,
    SPEECH_RATE: 1.0,
    SPEECH_PITCH: 1.0
};
const STAR_RATING_THRESHOLDS = {
    easy: { three: 5000, two: 10000 },
    medium: { three: 7000, two: 15000 },
    hard: { three: 10000, two: 20000 },
    extreme: { three: 12000, two: 25000 }
};
const CONFETTI_CONFIG = {
    DURATION: 3000,
    START_VELOCITY: 30,
    SPREAD: 360,
    TICKS: 60,
    Z_INDEX: 0,
    INTERVAL: 250,
    PARTICLE_MULTIPLIER: 50
};
// ============================================================================
// DATA CONFIGURATION
// ============================================================================
const LEVELS = {
    easy: { name: 'Easy', min: 1, max: 10 },
    medium: { name: 'Medium', min: 11, max: 20 },
    hard: { name: 'Hard', min: 20, max: 30 },
    extreme: { name: 'Extreme', min: 31, max: 50 }
};
const EMOJIS = [
    '🍎', '⭐', '⚽', '🎈', '🎨', '🐶', '🐱', '🐻', '🐰', '🦁',
    '🐸', '🐷', '🐼', '🐨', '🦄', '🌺', '🌸', '🌻', '🌷', '🌹',
    '🍓', '🍌', '🍇', '🍊', '🍉', '🍑', '🥝', '🍒', '🥕', '🌽',
    '🍞', '🧀', '🍕', '🍔', '🍟', '🍰', '🍭', '🍬', '🍫', '🍪',
    '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐'
];
const SVG_ICONS = {
    circle: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
    square: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="20" height="20" rx="2"/></svg>',
    triangle: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20L12 2z"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>'
};
const SVG_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#E74C3C'
];
const GAME_MODES = {
    counting: {
        name: 'Tebak Angka',
        icon: '🔢',
        description: 'Hitung jumlah gambar',
        questionTemplate: 'Berapa jumlahnya?'
    },
    addition: {
        name: 'Penjumlahan',
        icon: '➕',
        description: 'Jumlahkan angka',
        questionTemplate: 'Berapa hasil dari {a} + {b}?'
    },
    subtraction: {
        name: 'Pengurangan',
        icon: '➖',
        description: 'Kurangi angka',
        questionTemplate: 'Berapa hasil dari {a} - {b}?'
    }
};
const MAX_ICONS_PER_ROW = 5;
// ============================================================================
// STATE MANAGEMENT
// ============================================================================
let gameState = {
    currentCount: 0,
    correctAnswer: 0,
    options: [],
    score: 0,
    isAnswered: false,
    currentLevel: LEVELS[GAME_CONFIG.DEFAULT_LEVEL],
    currentMode: 'counting',
    totalStars: 0,
    questionStartTime: 0,
    wrongAnswers: 0
};
let timerState = {
    duration: GAME_CONFIG.DEFAULT_TIMER_MINUTES,
    timeLeft: GAME_CONFIG.DEFAULT_TIMER_MINUTES * GAME_CONFIG.SECONDS_PER_MINUTE,
    isRunning: false,
    startTime: 0,
    initialTimeLeft: GAME_CONFIG.DEFAULT_TIMER_MINUTES * GAME_CONFIG.SECONDS_PER_MINUTE,
    intervalId: null
};
let selectedLevel = GAME_CONFIG.DEFAULT_LEVEL;
let selectedTimerDuration = GAME_CONFIG.DEFAULT_TIMER_MINUTES;
let selectedGameMode = 'counting';
let playerData = null;
let gameLogicInitialized = false;
// ============================================================================
// DOM ELEMENTS
// ============================================================================
const DOM = {
    visualDisplay: document.getElementById('visual-display'),
    optionButtons: document.querySelectorAll('.option-btn'),
    feedbackElement: document.getElementById('feedback'),
    scoreElement: document.getElementById('score'),
    starRatingElement: document.getElementById('star-rating'),
    totalStarsElement: document.getElementById('total-stars'),
    playerModal: document.getElementById('player-modal'),
    gameContainer: document.getElementById('game-container'),
    playerForm: document.getElementById('player-form'),
    playerNameDisplay: document.getElementById('player-name-display'),
    timerDisplay: document.getElementById('timer-display'),
    timerCard: document.getElementById('timer-card'),
    endGameModal: document.getElementById('end-game-modal'),
    endGameTitle: document.getElementById('end-game-title'),
    endTime: document.getElementById('end-time'),
    endAttempts: document.getElementById('end-attempts'),
    endCorrect: document.getElementById('end-correct'),
    endWrong: document.getElementById('end-wrong'),
    endStars: document.getElementById('end-stars'),
    backToMenuBtn: document.getElementById('back-to-menu-btn'),
    stopGameBtn: document.getElementById('stop-game-btn'),
    modalLevelButtons: document.querySelectorAll('.level-btn-modal'),
    modalTimerButtons: document.querySelectorAll('.timer-btn-modal'),
    modalGameModeButtons: document.querySelectorAll('.game-mode-btn'), // Will be re-queried in setupModalGameModeButtons
    questionText: document.querySelector('.question-text'),
    gameTitle: document.querySelector('h1')
};
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
function getRandomColor() {
    return SVG_COLORS[randomInt(0, SVG_COLORS.length - 1)];
}
function formatTime(seconds) {
    const mins = Math.floor(seconds / GAME_CONFIG.SECONDS_PER_MINUTE);
    const secs = seconds % GAME_CONFIG.SECONDS_PER_MINUTE;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
function safeGetElementById(id) {
    return document.getElementById(id);
}
function safeQuerySelector(selector) {
    return document.querySelector(selector);
}
// ============================================================================
// VISUAL GENERATION
// ============================================================================
function calculateGridColumns(count) {
    // Maksimal 5 kolom per baris sesuai requirement
    if (count <= MAX_ICONS_PER_ROW) {
        return count;
    }
    return MAX_ICONS_PER_ROW;
}
function createEmojiItem() {
    const emoji = EMOJIS[randomInt(0, EMOJIS.length - 1)];
    return `<div class="visual-item">${emoji}</div>`;
}
function createSvgItem() {
    const svgKeys = Object.keys(SVG_ICONS);
    const randomSvg = svgKeys[randomInt(0, svgKeys.length - 1)];
    const color = getRandomColor();
    return `<div class="visual-item" style="color: ${color}">${SVG_ICONS[randomSvg]}</div>`;
}
function generateVisual(count) {
    if (!DOM.visualDisplay)
        return;
    DOM.visualDisplay.innerHTML = '';
    // Reset display style to grid (in case it was set to flex by subtraction mode)
    DOM.visualDisplay.style.display = 'grid';
    DOM.visualDisplay.style.alignItems = '';
    DOM.visualDisplay.style.justifyContent = '';
    const cols = calculateGridColumns(count);
    DOM.visualDisplay.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    const visualType = randomInt(GAME_CONFIG.VISUAL_TYPES.EMOJI, GAME_CONFIG.VISUAL_TYPES.MIX);
    const items = [];
    for (let i = 0; i < count; i++) {
        if (visualType === GAME_CONFIG.VISUAL_TYPES.EMOJI) {
            items.push(createEmojiItem());
        }
        else if (visualType === GAME_CONFIG.VISUAL_TYPES.SVG) {
            items.push(createSvgItem());
        }
        else {
            items.push(i % 2 === 0 ? createEmojiItem() : createSvgItem());
        }
    }
    DOM.visualDisplay.innerHTML = items.join('');
}
function generateAdditionVisual(a, b) {
    if (!DOM.visualDisplay)
        return;
    DOM.visualDisplay.innerHTML = '';
    // Reset display style to grid (in case it was set to flex by subtraction mode)
    DOM.visualDisplay.style.display = 'grid';
    DOM.visualDisplay.style.alignItems = '';
    DOM.visualDisplay.style.justifyContent = '';
    const total = a + b;
    const cols = calculateGridColumns(Math.max(a, b, total));
    DOM.visualDisplay.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    const visualType = randomInt(GAME_CONFIG.VISUAL_TYPES.EMOJI, GAME_CONFIG.VISUAL_TYPES.MIX);
    const items = [];
    // Group A
    for (let i = 0; i < a; i++) {
        if (visualType === GAME_CONFIG.VISUAL_TYPES.EMOJI) {
            items.push(createEmojiItem());
        }
        else if (visualType === GAME_CONFIG.VISUAL_TYPES.SVG) {
            items.push(createSvgItem());
        }
        else {
            items.push(i % 2 === 0 ? createEmojiItem() : createSvgItem());
        }
    }
    // Plus sign separator
    items.push('<div class="visual-separator" style="grid-column: 1 / -1; font-size: 2rem; font-weight: bold; color: var(--color-primary-400); padding: 10px;">+</div>');
    // Group B
    for (let i = 0; i < b; i++) {
        if (visualType === GAME_CONFIG.VISUAL_TYPES.EMOJI) {
            items.push(createEmojiItem());
        }
        else if (visualType === GAME_CONFIG.VISUAL_TYPES.SVG) {
            items.push(createSvgItem());
        }
        else {
            items.push((a + i) % 2 === 0 ? createEmojiItem() : createSvgItem());
        }
    }
    DOM.visualDisplay.innerHTML = items.join('');
}
function generateSubtractionVisual(total, subtract) {
    if (!DOM.visualDisplay)
        return;
    // Clear any existing content completely
    DOM.visualDisplay.innerHTML = '';
    // Reset grid columns for text display
    DOM.visualDisplay.style.gridTemplateColumns = '1fr';
    DOM.visualDisplay.style.display = 'flex';
    DOM.visualDisplay.style.alignItems = 'center';
    DOM.visualDisplay.style.justifyContent = 'center';
    // Display subtraction as mathematical equation
    const equationHTML = `
        <div class="subtraction-equation" style="
            font-size: 4rem;
            font-weight: bold;
            color: var(--color-text-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-4);
            padding: var(--spacing-6);
        ">
            <span>${total}</span>
            <span style="color: var(--color-error-500);">-</span>
            <span>${subtract}</span>
            <span style="color: var(--color-primary-400);">=</span>
            <span style="color: var(--color-primary-400);">?</span>
        </div>
    `;
    DOM.visualDisplay.innerHTML = equationHTML;
}
// ============================================================================
// GAME LOGIC - QUESTION GENERATORS
// ============================================================================
function generateAdditionQuestion() {
    const level = gameState.currentLevel;
    // Generate two operands within level range
    // Ensure result is also within level range
    let operand1;
    let operand2;
    let result;
    do {
        operand1 = randomInt(level.min, level.max);
        operand2 = randomInt(level.min, Math.min(level.max, level.max - operand1 + level.min));
        result = operand1 + operand2;
    } while (result > level.max || result < level.min);
    gameState.operand1 = operand1;
    gameState.operand2 = operand2;
    gameState.correctAnswer = result;
    gameState.options = generateOptions(result);
}
function generateSubtractionQuestion() {
    const level = gameState.currentLevel;
    // Generate subtraction question: total - subtractor = result
    // total: angka yang akan dikurangkan (operand1)
    // subtractor: angka yang dikurangkan (operand2)
    // result: hasil pengurangan (correctAnswer)
    // Ensure result >= 0 and within level range
    let total;
    let subtractor;
    let result;
    // Generate total (angka yang akan dikurangkan) within level range
    total = randomInt(level.min, level.max);
    // Generate subtractor (angka yang dikurangkan), must be <= total to ensure non-negative result
    // Ensure subtractor is at least 1 to make it a valid subtraction
    const minSubtractor = Math.max(1, level.min);
    subtractor = randomInt(minSubtractor, total);
    // Calculate result
    result = total - subtractor;
    gameState.operand1 = total;
    gameState.operand2 = subtractor;
    gameState.correctAnswer = result;
    gameState.options = generateOptions(result);
}
function generateOptions(correctAnswer) {
    const options = [correctAnswer];
    const usedNumbers = new Set([correctAnswer]);
    const level = gameState.currentLevel;
    const range = Math.max(3, Math.floor((level.max - level.min) * 0.2));
    const min = Math.max(level.min, correctAnswer - range);
    const max = Math.min(level.max, correctAnswer + range);
    while (options.length < GAME_CONFIG.OPTIONS_COUNT) {
        let distractor;
        do {
            distractor = randomInt(min, max);
        } while (usedNumbers.has(distractor));
        options.push(distractor);
        usedNumbers.add(distractor);
    }
    return shuffleArray(options);
}
function updateOptions(options) {
    DOM.optionButtons.forEach((btn, index) => {
        btn.textContent = options[index].toString();
        btn.dataset.value = options[index].toString();
        btn.classList.remove('correct', 'wrong');
        btn.disabled = false;
    });
}
function resetOptionButtons() {
    DOM.optionButtons.forEach(btn => {
        btn.classList.remove('correct', 'wrong');
        btn.disabled = false;
    });
}
function disableOptionButtons() {
    DOM.optionButtons.forEach(btn => {
        btn.disabled = true;
    });
}
function markCorrectAnswer(correctValue) {
    DOM.optionButtons.forEach(btn => {
        if (parseInt(btn.dataset.value || '0') === correctValue) {
            btn.classList.add('correct');
        }
    });
}
function markWrongAnswer(selectedValue) {
    DOM.optionButtons.forEach(btn => {
        if (parseInt(btn.dataset.value || '0') === selectedValue) {
            btn.classList.add('wrong');
        }
    });
}
function updateQuestionText() {
    if (!DOM.questionText)
        return;
    const modeConfig = GAME_MODES[gameState.currentMode];
    if (gameState.currentMode === 'counting') {
        DOM.questionText.textContent = modeConfig.questionTemplate;
        DOM.questionText.style.display = 'block';
    }
    else if (gameState.currentMode === 'addition' && gameState.operand1 !== undefined && gameState.operand2 !== undefined) {
        DOM.questionText.textContent = modeConfig.questionTemplate
            .replace('{a}', gameState.operand1.toString())
            .replace('{b}', gameState.operand2.toString());
        DOM.questionText.style.display = 'block';
    }
    else if (gameState.currentMode === 'subtraction') {
        // Hide question text for subtraction mode since visual already shows the equation
        DOM.questionText.style.display = 'none';
    }
}
function nextQuestion() {
    gameState.isAnswered = false;
    gameState.questionStartTime = Date.now();
    // Clear visual display first to prevent showing old content
    if (DOM.visualDisplay) {
        DOM.visualDisplay.innerHTML = '';
    }
    // Generate question based on current mode
    if (gameState.currentMode === 'counting') {
        const level = gameState.currentLevel;
        gameState.currentCount = randomInt(level.min, level.max);
        gameState.correctAnswer = gameState.currentCount;
        gameState.options = generateOptions(gameState.correctAnswer);
        generateVisual(gameState.currentCount);
        // Show question text for counting mode
        if (DOM.questionText) {
            DOM.questionText.style.display = 'block';
        }
    }
    else if (gameState.currentMode === 'addition') {
        generateAdditionQuestion();
        if (gameState.operand1 !== undefined && gameState.operand2 !== undefined) {
            generateAdditionVisual(gameState.operand1, gameState.operand2);
        }
        // Show question text for addition mode
        if (DOM.questionText) {
            DOM.questionText.style.display = 'block';
        }
    }
    else if (gameState.currentMode === 'subtraction') {
        generateSubtractionQuestion();
        if (gameState.operand1 !== undefined && gameState.operand2 !== undefined) {
            generateSubtractionVisual(gameState.operand1, gameState.operand2);
        }
        // Hide question text for subtraction mode (visual already shows the equation)
        if (DOM.questionText) {
            DOM.questionText.style.display = 'none';
        }
    }
    else {
        // Show question text for other modes
        if (DOM.questionText) {
            DOM.questionText.style.display = 'block';
        }
    }
    updateQuestionText();
    updateOptions(gameState.options);
    resetOptionButtons();
}
function setLevel(levelKey) {
    const level = LEVELS[levelKey];
    if (!level)
        return;
    gameState.currentLevel = level;
    gameState.score = 0;
    gameState.wrongAnswers = 0;
    gameState.totalStars = 0;
    if (DOM.scoreElement) {
        DOM.scoreElement.textContent = '0';
        DOM.scoreElement.classList.remove('updated');
    }
    if (DOM.totalStarsElement) {
        DOM.totalStarsElement.textContent = '0';
        DOM.totalStarsElement.classList.remove('updated');
    }
    if (!timerState.isRunning) {
        resetTimer();
    }
    nextQuestion();
}
// ============================================================================
// FEEDBACK & ANIMATIONS
// ============================================================================
function updateStatValue(element, newValue) {
    element.textContent = newValue;
    element.classList.add('updated');
    setTimeout(() => {
        element.classList.remove('updated');
    }, GAME_CONFIG.STAT_ANIMATION_DURATION);
}
function showFeedback(isCorrect) {
    if (!DOM.feedbackElement)
        return;
    DOM.feedbackElement.classList.remove('hidden', 'correct', 'wrong');
    DOM.feedbackElement.textContent = isCorrect
        ? FEEDBACK_MESSAGES.CORRECT
        : FEEDBACK_MESSAGES.WRONG;
    DOM.feedbackElement.classList.add(isCorrect ? 'correct' : 'wrong');
    setTimeout(() => {
        DOM.feedbackElement.classList.add('hidden');
    }, GAME_CONFIG.FEEDBACK_DISPLAY_DURATION);
}
function calculateStarRating() {
    const responseTime = Date.now() - gameState.questionStartTime;
    const levelName = gameState.currentLevel.name.toLowerCase();
    const thresholds = STAR_RATING_THRESHOLDS[levelName]
        || STAR_RATING_THRESHOLDS.easy;
    if (responseTime <= thresholds.three)
        return 3;
    if (responseTime <= thresholds.two)
        return 2;
    return 1;
}
function resetStarDisplay() {
    if (!DOM.starRatingElement)
        return;
    const stars = DOM.starRatingElement.querySelectorAll('.star');
    stars.forEach(star => {
        star.classList.remove('active', 'animate');
        star.style.opacity = '0.3';
    });
}
function animateStars(rating) {
    if (!DOM.starRatingElement)
        return;
    const stars = DOM.starRatingElement.querySelectorAll('.star');
    resetStarDisplay();
    for (let i = 0; i < rating; i++) {
        setTimeout(() => {
            stars[i].classList.add('active', 'animate');
            stars[i].style.opacity = '1';
        }, i * GAME_CONFIG.STAR_ANIMATION_DELAY);
    }
}
function showStarRating(rating) {
    if (!DOM.starRatingElement)
        return;
    DOM.starRatingElement.classList.remove('hidden');
    animateStars(rating);
    gameState.totalStars += rating;
    if (DOM.totalStarsElement) {
        updateStatValue(DOM.totalStarsElement, gameState.totalStars.toString());
    }
    savePlayerData();
    setTimeout(() => {
        DOM.starRatingElement.classList.add('hidden');
        resetStarDisplay();
    }, GAME_CONFIG.STAR_DISPLAY_DURATION);
}
// ============================================================================
// AUDIO & SOUNDS
// ============================================================================
function playCelebrationSound() {
    if (typeof AudioContext === 'undefined' && typeof window.webkitAudioContext === 'undefined') {
        return;
    }
    try {
        const AudioContextClass = AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContextClass();
        const sampleRate = audioContext.sampleRate;
        const buffer = audioContext.createBuffer(2, sampleRate * AUDIO_CONFIG.APPLAUSE_DURATION, sampleRate);
        for (let clap = 0; clap < AUDIO_CONFIG.NUM_CLAPS; clap++) {
            const clapTime = (clap / AUDIO_CONFIG.NUM_CLAPS) * AUDIO_CONFIG.APPLAUSE_DURATION
                + Math.random() * 0.1;
            const clapSample = Math.floor(clapTime * sampleRate);
            const clapSamples = Math.floor(AUDIO_CONFIG.CLAP_DURATION * sampleRate);
            for (let channel = 0; channel < 2; channel++) {
                const channelData = buffer.getChannelData(channel);
                for (let i = 0; i < clapSamples && (clapSample + i) < channelData.length; i++) {
                    const t = i / clapSamples;
                    const noise = (Math.random() * 2 - 1) * (1 - t);
                    channelData[clapSample + i] += noise * 0.3;
                }
            }
        }
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        const gainNode = audioContext.createGain();
        gainNode.gain.value = AUDIO_CONFIG.GAIN_VALUE;
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        source.start(0);
        source.onended = () => {
            audioContext.close();
        };
    }
    catch (error) {
        console.error('Audio playback error:', error);
    }
}
function playWrongAnswerSound() {
    if (!('speechSynthesis' in window))
        return;
    const messages = SPEECH_MESSAGES;
    const randomMessage = messages[randomInt(0, messages.length - 1)];
    const speak = () => {
        const utterance = new SpeechSynthesisUtterance(randomMessage);
        utterance.volume = AUDIO_CONFIG.SPEECH_VOLUME;
        utterance.rate = AUDIO_CONFIG.SPEECH_RATE;
        utterance.pitch = AUDIO_CONFIG.SPEECH_PITCH;
        const voices = speechSynthesis.getVoices();
        const indonesianVoice = voices.find(voice => voice.lang.includes('id') || voice.lang.includes('ID'));
        if (indonesianVoice) {
            utterance.voice = indonesianVoice;
        }
        speechSynthesis.speak(utterance);
    };
    if (speechSynthesis.getVoices().length > 0) {
        speak();
    }
    else {
        speechSynthesis.addEventListener('voiceschanged', speak, { once: true });
    }
}
// ============================================================================
// CONFETTI
// ============================================================================
function triggerConfetti() {
    const duration = CONFETTI_CONFIG.DURATION;
    const animationEnd = Date.now() + duration;
    const defaults = {
        startVelocity: CONFETTI_CONFIG.START_VELOCITY,
        spread: CONFETTI_CONFIG.SPREAD,
        ticks: CONFETTI_CONFIG.TICKS,
        zIndex: CONFETTI_CONFIG.Z_INDEX
    };
    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }
    const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
            clearInterval(interval);
            return;
        }
        const particleCount = CONFETTI_CONFIG.PARTICLE_MULTIPLIER * (timeLeft / duration);
        // @ts-ignore - confetti is loaded from CDN
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        // @ts-ignore
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
    }, CONFETTI_CONFIG.INTERVAL);
}
// ============================================================================
// ANSWER HANDLING
// ============================================================================
function handleCorrectAnswer() {
    gameState.score++;
    if (DOM.scoreElement) {
        updateStatValue(DOM.scoreElement, gameState.score.toString());
    }
    showFeedback(true);
    triggerConfetti();
    playCelebrationSound();
    const starRating = calculateStarRating();
    showStarRating(starRating);
    setTimeout(() => {
        nextQuestion();
    }, GAME_CONFIG.NEXT_QUESTION_DELAY);
}
function handleWrongAnswer(selectedValue) {
    gameState.wrongAnswers++;
    showFeedback(false);
    playWrongAnswerSound();
    setTimeout(() => {
        gameState.isAnswered = false;
        resetOptionButtons();
    }, GAME_CONFIG.FEEDBACK_DISPLAY_DURATION);
}
function checkAnswer(selectedValue) {
    if (gameState.isAnswered)
        return;
    if (!timerState.isRunning && timerState.timeLeft > 0) {
        startTimer();
    }
    gameState.isAnswered = true;
    const isCorrect = selectedValue === gameState.correctAnswer;
    disableOptionButtons();
    markCorrectAnswer(gameState.correctAnswer);
    if (!isCorrect) {
        markWrongAnswer(selectedValue);
    }
    if (isCorrect) {
        handleCorrectAnswer();
    }
    else {
        handleWrongAnswer(selectedValue);
    }
}
// ============================================================================
// TIMER FUNCTIONS
// ============================================================================
function setTimerDuration(minutes) {
    timerState.duration = minutes;
    timerState.timeLeft = minutes * GAME_CONFIG.SECONDS_PER_MINUTE;
    timerState.initialTimeLeft = timerState.timeLeft;
    if (DOM.timerDisplay) {
        DOM.timerDisplay.textContent = formatTime(timerState.timeLeft);
    }
}
function startTimer() {
    if (timerState.isRunning)
        return;
    timerState.isRunning = true;
    timerState.startTime = Date.now();
    timerState.initialTimeLeft = timerState.timeLeft; // Simpan waktu awal saat timer mulai
    timerState.intervalId = window.setInterval(() => {
        timerState.timeLeft--;
        if (DOM.timerDisplay) {
            DOM.timerDisplay.textContent = formatTime(timerState.timeLeft);
        }
        if (DOM.timerCard && timerState.timeLeft <= GAME_CONFIG.TIMER_WARNING_THRESHOLD) {
            DOM.timerCard.classList.add('warning');
        }
        if (timerState.timeLeft <= 0) {
            stopTimer();
            endGame();
        }
    }, GAME_CONFIG.TIMER_UPDATE_INTERVAL);
}
function stopTimer() {
    if (timerState.intervalId !== null) {
        clearInterval(timerState.intervalId);
        timerState.intervalId = null;
    }
    timerState.isRunning = false;
    if (DOM.timerCard) {
        DOM.timerCard.classList.remove('warning');
    }
}
function resetTimer() {
    stopTimer();
    timerState.timeLeft = timerState.duration * GAME_CONFIG.SECONDS_PER_MINUTE;
    timerState.initialTimeLeft = timerState.timeLeft;
    timerState.startTime = 0;
    if (DOM.timerDisplay) {
        DOM.timerDisplay.textContent = formatTime(timerState.timeLeft);
    }
    if (DOM.timerCard) {
        DOM.timerCard.classList.remove('warning');
    }
}
function calculatePlayTime() {
    // Timer belum pernah dimulai (user belum menjawab pertanyaan pertama)
    if (timerState.startTime === 0) {
        return 0;
    }
    // Timer sedang berjalan: hitung waktu yang sudah berlalu dari startTime
    if (timerState.isRunning) {
        return Math.floor((Date.now() - timerState.startTime) / 1000);
    }
    // Timer sudah berhenti: hitung dari initialTimeLeft - timeLeft
    // Ini lebih akurat karena sinkron dengan countdown timer
    const elapsed = timerState.initialTimeLeft - timerState.timeLeft;
    return Math.max(0, elapsed);
}
// ============================================================================
// LOCAL STORAGE
// ============================================================================
function savePlayerData() {
    if (!playerData)
        return;
    playerData.totalStars = gameState.totalStars;
    playerData.lastPlayed = new Date().toISOString();
    try {
        localStorage.setItem(GAME_CONFIG.STORAGE_KEY, JSON.stringify(playerData));
    }
    catch (error) {
        console.error('Error saving player data:', error);
    }
}
function loadPlayerData() {
    try {
        const saved = localStorage.getItem(GAME_CONFIG.STORAGE_KEY);
        if (!saved)
            return null;
        return JSON.parse(saved);
    }
    catch (error) {
        console.error('Error loading player data:', error);
        return null;
    }
}
function createPlayerData(name) {
    return {
        name: name.trim(),
        totalStars: 0,
        lastPlayed: new Date().toISOString()
    };
}
// ============================================================================
// GAME STATISTICS
// ============================================================================
function getGameStats() {
    return {
        attempts: gameState.score + gameState.wrongAnswers,
        correct: gameState.score,
        wrong: gameState.wrongAnswers,
        stars: gameState.totalStars
    };
}
function showEndGameModal(isTimeUp = true) {
    const stats = getGameStats();
    const playTime = calculatePlayTime();
    if (DOM.endGameTitle) {
        DOM.endGameTitle.textContent = isTimeUp
            ? END_GAME_TITLES.TIME_UP
            : END_GAME_TITLES.STOPPED;
    }
    if (DOM.endTime) {
        DOM.endTime.textContent = formatTime(playTime);
    }
    if (DOM.endAttempts) {
        DOM.endAttempts.textContent = stats.attempts.toString();
    }
    if (DOM.endCorrect) {
        DOM.endCorrect.textContent = stats.correct.toString();
    }
    if (DOM.endWrong) {
        DOM.endWrong.textContent = stats.wrong.toString();
    }
    if (DOM.endStars) {
        DOM.endStars.textContent = stats.stars.toString();
    }
    if (DOM.endGameModal) {
        DOM.endGameModal.style.display = 'flex';
    }
}
function endGame() {
    stopTimer();
    showEndGameModal(true);
    disableOptionButtons();
}
function stopGame() {
    stopTimer();
    showEndGameModal(false);
    disableOptionButtons();
}
function resetGameWithTimer(minutes) {
    stopTimer();
    setTimerDuration(minutes);
    resetTimer();
    gameState.score = 0;
    gameState.wrongAnswers = 0;
    gameState.totalStars = 0;
    if (DOM.scoreElement) {
        DOM.scoreElement.textContent = '0';
    }
    if (DOM.totalStarsElement) {
        DOM.totalStarsElement.textContent = '0';
    }
    if (DOM.endGameModal) {
        DOM.endGameModal.style.display = 'none';
    }
    resetOptionButtons();
    nextQuestion();
}
// ============================================================================
// FORM HANDLING
// ============================================================================
function resetPlayerForm() {
    const nameInput = safeGetElementById('player-name');
    if (nameInput) {
        nameInput.value = '';
    }
    DOM.modalLevelButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    const defaultLevelBtn = safeGetElementById('modal-level-easy');
    if (defaultLevelBtn) {
        defaultLevelBtn.classList.add('active');
    }
    selectedLevel = GAME_CONFIG.DEFAULT_LEVEL;
    DOM.modalTimerButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    const defaultTimerBtn = safeGetElementById('modal-timer-5');
    if (defaultTimerBtn) {
        defaultTimerBtn.classList.add('active');
    }
    selectedTimerDuration = GAME_CONFIG.DEFAULT_TIMER_MINUTES;
    const gameModeButtons = document.querySelectorAll('.game-mode-btn');
    gameModeButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    const defaultModeBtn = safeGetElementById('mode-counting');
    if (defaultModeBtn) {
        defaultModeBtn.classList.add('active');
    }
    selectedGameMode = 'counting';
}
function backToMainMenu() {
    stopTimer();
    gameState.score = 0;
    gameState.wrongAnswers = 0;
    gameState.isAnswered = false;
    if (DOM.endGameModal) {
        DOM.endGameModal.style.display = 'none';
    }
    if (DOM.gameContainer) {
        DOM.gameContainer.style.display = 'none';
    }
    resetPlayerForm();
    if (DOM.playerModal) {
        DOM.playerModal.style.display = 'flex';
    }
    gameLogicInitialized = false;
}
function handlePlayerFormSubmit(event) {
    event.preventDefault();
    const formData = new FormData(DOM.playerForm);
    const name = formData.get('name')?.trim();
    if (!name || name.length < GAME_CONFIG.MIN_NAME_LENGTH || name.length > GAME_CONFIG.MAX_NAME_LENGTH) {
        return;
    }
    playerData = createPlayerData(name);
    if (DOM.playerNameDisplay) {
        DOM.playerNameDisplay.textContent = name;
    }
    gameState.totalStars = 0;
    if (DOM.totalStarsElement) {
        DOM.totalStarsElement.textContent = '0';
    }
    setTimerDuration(selectedTimerDuration);
    savePlayerData();
    if (DOM.playerModal) {
        DOM.playerModal.style.display = 'none';
    }
    if (DOM.gameContainer) {
        DOM.gameContainer.style.display = 'block';
    }
    initGameLogic();
}
// ============================================================================
// EVENT LISTENERS SETUP
// ============================================================================
function setupModalLevelButtons() {
    DOM.modalLevelButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            DOM.modalLevelButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedLevel = btn.dataset.level || GAME_CONFIG.DEFAULT_LEVEL;
        });
    });
}
function setupModalTimerButtons() {
    DOM.modalTimerButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            DOM.modalTimerButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedTimerDuration = parseInt(btn.dataset.minutes || String(GAME_CONFIG.DEFAULT_TIMER_MINUTES));
        });
    });
}
function setupModalGameModeButtons() {
    // Re-query elements to ensure they exist
    const gameModeButtons = document.querySelectorAll('.game-mode-btn');
    if (gameModeButtons.length === 0) {
        console.warn('Game mode buttons not found');
        return;
    }
    gameModeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            gameModeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const mode = btn.dataset.mode;
            if (mode && (mode === 'counting' || mode === 'addition' || mode === 'subtraction')) {
                selectedGameMode = mode;
            }
        });
    });
}
function setGameMode(mode) {
    gameState.currentMode = mode;
    if (DOM.gameTitle) {
        const modeConfig = GAME_MODES[mode];
        DOM.gameTitle.textContent = `${modeConfig.icon} ${modeConfig.name}`;
    }
    // Don't clear visual display here if we're initializing (nextQuestion will handle it)
    // Only clear if we're switching modes during gameplay
    // Reset question text display
    if (DOM.questionText) {
        DOM.questionText.style.display = 'block';
    }
}
function setupGameButtons() {
    if (DOM.stopGameBtn) {
        DOM.stopGameBtn.addEventListener('click', stopGame);
    }
    if (DOM.backToMenuBtn) {
        DOM.backToMenuBtn.addEventListener('click', backToMainMenu);
    }
    DOM.optionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const value = parseInt(btn.dataset.value || '0');
            checkAnswer(value);
        });
    });
}
function setupEndGameModalButtons() {
    if (!DOM.endGameModal)
        return;
    const timerOptions = DOM.endGameModal.querySelectorAll('.timer-option-btn');
    timerOptions.forEach(btn => {
        btn.addEventListener('click', () => {
            const minutes = parseInt(btn.getAttribute('data-minutes') || String(GAME_CONFIG.DEFAULT_TIMER_MINUTES));
            resetGameWithTimer(minutes);
        });
    });
}
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && DOM.endGameModal && DOM.endGameModal.style.display === 'flex') {
            backToMainMenu();
        }
    });
}
// ============================================================================
// INITIALIZATION
// ============================================================================
function initGameLogic() {
    if (gameLogicInitialized)
        return;
    gameLogicInitialized = true;
    setupGameButtons();
    setupEndGameModalButtons();
    setupKeyboardShortcuts();
    // Set game mode first, then level (which calls nextQuestion)
    setGameMode(selectedGameMode);
    setLevel(selectedLevel);
    // Ensure nextQuestion is called to display the first question
    // setLevel already calls nextQuestion, but ensure it's called after all setup
    nextQuestion();
}
function initApp() {
    setupModalLevelButtons();
    setupModalTimerButtons();
    setupModalGameModeButtons();
    const defaultLevelBtn = safeGetElementById('modal-level-easy');
    if (defaultLevelBtn) {
        defaultLevelBtn.classList.add('active');
    }
    const defaultModeBtn = safeGetElementById('mode-counting');
    if (defaultModeBtn) {
        defaultModeBtn.classList.add('active');
    }
    const savedData = loadPlayerData();
    resetPlayerForm();
    if (savedData) {
        playerData = savedData;
        gameState.totalStars = savedData.totalStars;
        if (DOM.playerNameDisplay && DOM.gameContainer.style.display !== 'none') {
            DOM.playerNameDisplay.textContent = savedData.name;
        }
    }
    if (DOM.playerModal) {
        DOM.playerModal.style.display = 'flex';
    }
    DOM.playerForm.addEventListener('submit', handlePlayerFormSubmit);
}
// ============================================================================
// APP START
// ============================================================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
}
else {
    initApp();
}
