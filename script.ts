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
} as const;

const TIMER_DURATIONS = {
    MIN_5: 5,
    MIN_10: 10,
    MIN_15: 15
} as const;

const FEEDBACK_MESSAGES = {
    CORRECT: '🎉 Benar! Bagus sekali!',
    WRONG: '😔 Belum tepat, coba lagi!'
} as const;

const END_GAME_TITLES = {
    TIME_UP: '⏰ Waktu Habis!',
    STOPPED: '⏹️ Permainan Dihentikan'
} as const;

const SPEECH_MESSAGES = [
    'Oops, coba lagi!',
    'Hampir benar, coba sekali lagi'
] as const;

const AUDIO_CONFIG = {
    APPLAUSE_DURATION: 1.5, // seconds
    NUM_CLAPS: 8,
    CLAP_DURATION: 0.05, // seconds
    GAIN_VALUE: 0.5,
    SPEECH_VOLUME: 0.8,
    SPEECH_RATE: 1.0,
    SPEECH_PITCH: 1.0
} as const;

const STAR_RATING_THRESHOLDS = {
    easy: { three: 5000, two: 10000 },
    medium: { three: 7000, two: 15000 },
    hard: { three: 10000, two: 20000 },
    extreme: { three: 12000, two: 25000 }
} as const;

const CONFETTI_CONFIG = {
    DURATION: 3000,
    START_VELOCITY: 30,
    SPREAD: 360,
    TICKS: 60,
    Z_INDEX: 0,
    INTERVAL: 250,
    PARTICLE_MULTIPLIER: 50
} as const;

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface Level {
    name: string;
    min: number;
    max: number;
}

interface PlayerData {
    name: string;
    totalStars: number;
    lastPlayed: string;
}

interface TimerState {
    duration: number; // in minutes
    timeLeft: number; // in seconds
    isRunning: boolean;
    startTime: number;
    initialTimeLeft: number; // in seconds - untuk tracking waktu awal saat timer mulai
    intervalId: number | null;
}

interface GameStats {
    attempts: number;
    correct: number;
    wrong: number;
    stars: number;
}

interface GameState {
    currentCount: number;
    correctAnswer: number;
    options: number[];
    score: number;
    isAnswered: boolean;
    currentLevel: Level;
    totalStars: number;
    questionStartTime: number;
    wrongAnswers: number;
}

// ============================================================================
// DATA CONFIGURATION
// ============================================================================

const LEVELS: Record<string, Level> = {
    easy: { name: 'Easy', min: 1, max: 10 },
    medium: { name: 'Medium', min: 11, max: 20 },
    hard: { name: 'Hard', min: 20, max: 30 },
    extreme: { name: 'Extreme', min: 31, max: 50 }
};

const EMOJIS: readonly string[] = [
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
} as const;

const SVG_COLORS: readonly string[] = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#E74C3C'
];

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let gameState: GameState = {
    currentCount: 0,
    correctAnswer: 0,
    options: [],
    score: 0,
    isAnswered: false,
    currentLevel: LEVELS[GAME_CONFIG.DEFAULT_LEVEL],
    totalStars: 0,
    questionStartTime: 0,
    wrongAnswers: 0
};

let timerState: TimerState = {
    duration: GAME_CONFIG.DEFAULT_TIMER_MINUTES,
    timeLeft: GAME_CONFIG.DEFAULT_TIMER_MINUTES * GAME_CONFIG.SECONDS_PER_MINUTE,
    isRunning: false,
    startTime: 0,
    initialTimeLeft: GAME_CONFIG.DEFAULT_TIMER_MINUTES * GAME_CONFIG.SECONDS_PER_MINUTE,
    intervalId: null
};

let selectedLevel: string = GAME_CONFIG.DEFAULT_LEVEL;
let selectedTimerDuration: number = GAME_CONFIG.DEFAULT_TIMER_MINUTES;
let playerData: PlayerData | null = null;
let gameLogicInitialized = false;

// ============================================================================
// DOM ELEMENTS
// ============================================================================

const DOM = {
    visualDisplay: document.getElementById('visual-display') as HTMLElement,
    optionButtons: document.querySelectorAll('.option-btn') as NodeListOf<HTMLButtonElement>,
    feedbackElement: document.getElementById('feedback') as HTMLElement,
    scoreElement: document.getElementById('score') as HTMLElement,
    starRatingElement: document.getElementById('star-rating') as HTMLElement,
    totalStarsElement: document.getElementById('total-stars') as HTMLElement,
    playerModal: document.getElementById('player-modal') as HTMLElement,
    gameContainer: document.getElementById('game-container') as HTMLElement,
    playerForm: document.getElementById('player-form') as HTMLFormElement,
    playerNameDisplay: document.getElementById('player-name-display') as HTMLElement,
    timerDisplay: document.getElementById('timer-display') as HTMLElement,
    timerCard: document.getElementById('timer-card') as HTMLElement,
    endGameModal: document.getElementById('end-game-modal') as HTMLElement,
    endGameTitle: document.getElementById('end-game-title') as HTMLElement,
    endTime: document.getElementById('end-time') as HTMLElement,
    endAttempts: document.getElementById('end-attempts') as HTMLElement,
    endCorrect: document.getElementById('end-correct') as HTMLElement,
    endWrong: document.getElementById('end-wrong') as HTMLElement,
    endStars: document.getElementById('end-stars') as HTMLElement,
    backToMenuBtn: document.getElementById('back-to-menu-btn') as HTMLElement,
    stopGameBtn: document.getElementById('stop-game-btn') as HTMLElement,
    modalLevelButtons: document.querySelectorAll('.level-btn-modal') as NodeListOf<HTMLButtonElement>,
    modalTimerButtons: document.querySelectorAll('.timer-btn-modal') as NodeListOf<HTMLButtonElement>
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function getRandomColor(): string {
    return SVG_COLORS[randomInt(0, SVG_COLORS.length - 1)];
}

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / GAME_CONFIG.SECONDS_PER_MINUTE);
    const secs = seconds % GAME_CONFIG.SECONDS_PER_MINUTE;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function safeGetElementById<T extends HTMLElement>(id: string): T | null {
    return document.getElementById(id) as T | null;
}

function safeQuerySelector<T extends HTMLElement>(selector: string): T | null {
    return document.querySelector(selector) as T | null;
}

// ============================================================================
// VISUAL GENERATION
// ============================================================================

function calculateGridColumns(count: number): number {
    if (count <= GAME_CONFIG.MAX_GRID_COLS_SMALL) {
        return count;
    }
    if (count <= GAME_CONFIG.MAX_GRID_COLS_MEDIUM) {
        return GAME_CONFIG.GRID_COLS_SMALL;
    }
    return GAME_CONFIG.GRID_COLS_LARGE;
}

function createEmojiItem(): string {
    const emoji = EMOJIS[randomInt(0, EMOJIS.length - 1)];
    return `<div class="visual-item">${emoji}</div>`;
}

function createSvgItem(): string {
    const svgKeys = Object.keys(SVG_ICONS);
    const randomSvg = svgKeys[randomInt(0, svgKeys.length - 1)];
    const color = getRandomColor();
    return `<div class="visual-item" style="color: ${color}">${SVG_ICONS[randomSvg as keyof typeof SVG_ICONS]}</div>`;
}

function generateVisual(count: number): void {
    if (!DOM.visualDisplay) return;

    DOM.visualDisplay.innerHTML = '';
    const cols = calculateGridColumns(count);
    DOM.visualDisplay.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    const visualType = randomInt(
        GAME_CONFIG.VISUAL_TYPES.EMOJI,
        GAME_CONFIG.VISUAL_TYPES.MIX
    );

    const items: string[] = [];
    for (let i = 0; i < count; i++) {
        if (visualType === GAME_CONFIG.VISUAL_TYPES.EMOJI) {
            items.push(createEmojiItem());
        } else if (visualType === GAME_CONFIG.VISUAL_TYPES.SVG) {
            items.push(createSvgItem());
        } else {
            items.push(i % 2 === 0 ? createEmojiItem() : createSvgItem());
        }
    }

    DOM.visualDisplay.innerHTML = items.join('');
}

// ============================================================================
// GAME LOGIC
// ============================================================================

function generateOptions(correctAnswer: number): number[] {
    const options: number[] = [correctAnswer];
    const usedNumbers = new Set([correctAnswer]);
    const level = gameState.currentLevel;

    const range = Math.max(3, Math.floor((level.max - level.min) * 0.2));
    const min = Math.max(level.min, correctAnswer - range);
    const max = Math.min(level.max, correctAnswer + range);

    while (options.length < GAME_CONFIG.OPTIONS_COUNT) {
        let distractor: number;
        do {
            distractor = randomInt(min, max);
        } while (usedNumbers.has(distractor));

        options.push(distractor);
        usedNumbers.add(distractor);
    }

    return shuffleArray(options);
}

function updateOptions(options: number[]): void {
    DOM.optionButtons.forEach((btn, index) => {
        btn.textContent = options[index].toString();
        btn.dataset.value = options[index].toString();
        btn.classList.remove('correct', 'wrong');
        btn.disabled = false;
    });
}

function resetOptionButtons(): void {
    DOM.optionButtons.forEach(btn => {
        btn.classList.remove('correct', 'wrong');
        btn.disabled = false;
    });
}

function disableOptionButtons(): void {
    DOM.optionButtons.forEach(btn => {
        btn.disabled = true;
    });
}

function markCorrectAnswer(correctValue: number): void {
    DOM.optionButtons.forEach(btn => {
        if (parseInt(btn.dataset.value || '0') === correctValue) {
            btn.classList.add('correct');
        }
    });
}

function markWrongAnswer(selectedValue: number): void {
    DOM.optionButtons.forEach(btn => {
        if (parseInt(btn.dataset.value || '0') === selectedValue) {
            btn.classList.add('wrong');
        }
    });
}

function nextQuestion(): void {
    const level = gameState.currentLevel;
    gameState.currentCount = randomInt(level.min, level.max);
    gameState.correctAnswer = gameState.currentCount;
    gameState.options = generateOptions(gameState.correctAnswer);
    gameState.isAnswered = false;
    gameState.questionStartTime = Date.now();

    generateVisual(gameState.currentCount);
    updateOptions(gameState.options);
    resetOptionButtons();
}

function setLevel(levelKey: string): void {
    const level = LEVELS[levelKey];
    if (!level) return;

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

function updateStatValue(element: HTMLElement, newValue: string): void {
    element.textContent = newValue;
    element.classList.add('updated');
    setTimeout(() => {
        element.classList.remove('updated');
    }, GAME_CONFIG.STAT_ANIMATION_DURATION);
}

function showFeedback(isCorrect: boolean): void {
    if (!DOM.feedbackElement) return;

    DOM.feedbackElement.classList.remove('hidden', 'correct', 'wrong');
    DOM.feedbackElement.textContent = isCorrect
        ? FEEDBACK_MESSAGES.CORRECT
        : FEEDBACK_MESSAGES.WRONG;
    DOM.feedbackElement.classList.add(isCorrect ? 'correct' : 'wrong');

    setTimeout(() => {
        DOM.feedbackElement.classList.add('hidden');
    }, GAME_CONFIG.FEEDBACK_DISPLAY_DURATION);
}

function calculateStarRating(): number {
    const responseTime = Date.now() - gameState.questionStartTime;
    const levelName = gameState.currentLevel.name.toLowerCase();
    const thresholds = STAR_RATING_THRESHOLDS[levelName as keyof typeof STAR_RATING_THRESHOLDS]
        || STAR_RATING_THRESHOLDS.easy;

    if (responseTime <= thresholds.three) return 3;
    if (responseTime <= thresholds.two) return 2;
    return 1;
}

function resetStarDisplay(): void {
    if (!DOM.starRatingElement) return;

    const stars = DOM.starRatingElement.querySelectorAll('.star') as NodeListOf<HTMLElement>;
    stars.forEach(star => {
        star.classList.remove('active', 'animate');
        star.style.opacity = '0.3';
    });
}

function animateStars(rating: number): void {
    if (!DOM.starRatingElement) return;

    const stars = DOM.starRatingElement.querySelectorAll('.star') as NodeListOf<HTMLElement>;
    resetStarDisplay();

    for (let i = 0; i < rating; i++) {
        setTimeout(() => {
            stars[i].classList.add('active', 'animate');
            stars[i].style.opacity = '1';
        }, i * GAME_CONFIG.STAR_ANIMATION_DELAY);
    }
}

function showStarRating(rating: number): void {
    if (!DOM.starRatingElement) return;

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

function playCelebrationSound(): void {
    if (typeof AudioContext === 'undefined' && typeof (window as any).webkitAudioContext === 'undefined') {
        return;
    }

    try {
        const AudioContextClass = AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContextClass();
        const sampleRate = audioContext.sampleRate;
        const buffer = audioContext.createBuffer(
            2,
            sampleRate * AUDIO_CONFIG.APPLAUSE_DURATION,
            sampleRate
        );

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
    } catch (error) {
        console.error('Audio playback error:', error);
    }
}

function playWrongAnswerSound(): void {
    if (!('speechSynthesis' in window)) return;

    const messages = SPEECH_MESSAGES;
    const randomMessage = messages[randomInt(0, messages.length - 1)];

    const speak = () => {
        const utterance = new SpeechSynthesisUtterance(randomMessage);
        utterance.volume = AUDIO_CONFIG.SPEECH_VOLUME;
        utterance.rate = AUDIO_CONFIG.SPEECH_RATE;
        utterance.pitch = AUDIO_CONFIG.SPEECH_PITCH;

        const voices = speechSynthesis.getVoices();
        const indonesianVoice = voices.find(voice =>
            voice.lang.includes('id') || voice.lang.includes('ID')
        );
        if (indonesianVoice) {
            utterance.voice = indonesianVoice;
        }

        speechSynthesis.speak(utterance);
    };

    if (speechSynthesis.getVoices().length > 0) {
        speak();
    } else {
        speechSynthesis.addEventListener('voiceschanged', speak, { once: true });
    }
}

// ============================================================================
// CONFETTI
// ============================================================================

function triggerConfetti(): void {
    const duration = CONFETTI_CONFIG.DURATION;
    const animationEnd = Date.now() + duration;
    const defaults = {
        startVelocity: CONFETTI_CONFIG.START_VELOCITY,
        spread: CONFETTI_CONFIG.SPREAD,
        ticks: CONFETTI_CONFIG.TICKS,
        zIndex: CONFETTI_CONFIG.Z_INDEX
    };

    function randomInRange(min: number, max: number): number {
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

function handleCorrectAnswer(): void {
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

function handleWrongAnswer(selectedValue: number): void {
    gameState.wrongAnswers++;
    showFeedback(false);
    playWrongAnswerSound();

    setTimeout(() => {
        gameState.isAnswered = false;
        resetOptionButtons();
    }, GAME_CONFIG.FEEDBACK_DISPLAY_DURATION);
}

function checkAnswer(selectedValue: number): void {
    if (gameState.isAnswered) return;

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
    } else {
        handleWrongAnswer(selectedValue);
    }
}

// ============================================================================
// TIMER FUNCTIONS
// ============================================================================

function setTimerDuration(minutes: number): void {
    timerState.duration = minutes;
    timerState.timeLeft = minutes * GAME_CONFIG.SECONDS_PER_MINUTE;
    timerState.initialTimeLeft = timerState.timeLeft;

    if (DOM.timerDisplay) {
        DOM.timerDisplay.textContent = formatTime(timerState.timeLeft);
    }
}

function startTimer(): void {
    if (timerState.isRunning) return;

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

function stopTimer(): void {
    if (timerState.intervalId !== null) {
        clearInterval(timerState.intervalId);
        timerState.intervalId = null;
    }
    timerState.isRunning = false;

    if (DOM.timerCard) {
        DOM.timerCard.classList.remove('warning');
    }
}

function resetTimer(): void {
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

function calculatePlayTime(): number {
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

function savePlayerData(): void {
    if (!playerData) return;

    playerData.totalStars = gameState.totalStars;
    playerData.lastPlayed = new Date().toISOString();

    try {
        localStorage.setItem(GAME_CONFIG.STORAGE_KEY, JSON.stringify(playerData));
    } catch (error) {
        console.error('Error saving player data:', error);
    }
}

function loadPlayerData(): PlayerData | null {
    try {
        const saved = localStorage.getItem(GAME_CONFIG.STORAGE_KEY);
        if (!saved) return null;

        return JSON.parse(saved) as PlayerData;
    } catch (error) {
        console.error('Error loading player data:', error);
        return null;
    }
}

function createPlayerData(name: string): PlayerData {
    return {
        name: name.trim(),
        totalStars: 0,
        lastPlayed: new Date().toISOString()
    };
}

// ============================================================================
// GAME STATISTICS
// ============================================================================

function getGameStats(): GameStats {
    return {
        attempts: gameState.score + gameState.wrongAnswers,
        correct: gameState.score,
        wrong: gameState.wrongAnswers,
        stars: gameState.totalStars
    };
}

function showEndGameModal(isTimeUp: boolean = true): void {
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

function endGame(): void {
    stopTimer();
    showEndGameModal(true);
    disableOptionButtons();
}

function stopGame(): void {
    stopTimer();
    showEndGameModal(false);
    disableOptionButtons();
}

function resetGameWithTimer(minutes: number): void {
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

function resetPlayerForm(): void {
    const nameInput = safeGetElementById<HTMLInputElement>('player-name');
    if (nameInput) {
        nameInput.value = '';
    }

    DOM.modalLevelButtons.forEach(btn => {
        btn.classList.remove('active');
    });

    const defaultLevelBtn = safeGetElementById<HTMLButtonElement>('modal-level-easy');
    if (defaultLevelBtn) {
        defaultLevelBtn.classList.add('active');
    }
    selectedLevel = GAME_CONFIG.DEFAULT_LEVEL;

    DOM.modalTimerButtons.forEach(btn => {
        btn.classList.remove('active');
    });

    const defaultTimerBtn = safeGetElementById<HTMLButtonElement>('modal-timer-5');
    if (defaultTimerBtn) {
        defaultTimerBtn.classList.add('active');
    }
    selectedTimerDuration = GAME_CONFIG.DEFAULT_TIMER_MINUTES;
}

function backToMainMenu(): void {
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

function handlePlayerFormSubmit(event: Event): void {
    event.preventDefault();

    const formData = new FormData(DOM.playerForm);
    const name = (formData.get('name') as string)?.trim();

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

function setupModalLevelButtons(): void {
    DOM.modalLevelButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            DOM.modalLevelButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedLevel = btn.dataset.level || GAME_CONFIG.DEFAULT_LEVEL;
        });
    });
}

function setupModalTimerButtons(): void {
    DOM.modalTimerButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            DOM.modalTimerButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedTimerDuration = parseInt(btn.dataset.minutes || String(GAME_CONFIG.DEFAULT_TIMER_MINUTES));
        });
    });
}

function setupGameButtons(): void {
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

function setupEndGameModalButtons(): void {
    if (!DOM.endGameModal) return;

    const timerOptions = DOM.endGameModal.querySelectorAll('.timer-option-btn');
    timerOptions.forEach(btn => {
        btn.addEventListener('click', () => {
            const minutes = parseInt(btn.getAttribute('data-minutes') || String(GAME_CONFIG.DEFAULT_TIMER_MINUTES));
            resetGameWithTimer(minutes);
        });
    });
}

function setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && DOM.endGameModal && DOM.endGameModal.style.display === 'flex') {
            backToMainMenu();
        }
    });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

function initGameLogic(): void {
    if (gameLogicInitialized) return;
    gameLogicInitialized = true;

    setupGameButtons();
    setupEndGameModalButtons();
    setupKeyboardShortcuts();

    setLevel(selectedLevel);
}

function initApp(): void {
    setupModalLevelButtons();
    setupModalTimerButtons();

    const defaultLevelBtn = safeGetElementById<HTMLButtonElement>('modal-level-easy');
    if (defaultLevelBtn) {
        defaultLevelBtn.classList.add('active');
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
} else {
    initApp();
}
