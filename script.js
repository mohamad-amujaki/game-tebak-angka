"use strict";
const levels = {
    easy: { name: 'Easy', min: 1, max: 10 },
    medium: { name: 'Medium', min: 11, max: 20 },
    hard: { name: 'Hard', min: 20, max: 30 },
    extreme: { name: 'Extreme', min: 31, max: 50 }
};
let gameState = {
    currentCount: 0,
    correctAnswer: 0,
    options: [],
    score: 0,
    isAnswered: false,
    currentLevel: levels.easy, // Default to Easy
    totalStars: 0,
    questionStartTime: 0,
    wrongAnswers: 0
};
// Selected level from modal (will be set before game starts)
let selectedLevel = 'easy';
let timerState = {
    duration: 10, // Default 10 minutes
    timeLeft: 600, // 10 minutes in seconds
    isRunning: false,
    startTime: 0,
    intervalId: null
};
// Emoji library
const emojis = [
    '🍎', '⭐', '⚽', '🎈', '🎨', '🐶', '🐱', '🐻', '🐰', '🦁',
    '🐸', '🐷', '🐼', '🐨', '🦄', '🌺', '🌸', '🌻', '🌷', '🌹',
    '🍓', '🍌', '🍇', '🍊', '🍉', '🍑', '🥝', '🍒', '🥕', '🌽',
    '🍞', '🧀', '🍕', '🍔', '🍟', '🍰', '🍭', '🍬', '🍫', '🍪',
    '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐'
];
// SVG icons (simple shapes)
const svgIcons = {
    circle: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
    square: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="20" height="20" rx="2"/></svg>',
    triangle: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20L12 2z"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>'
};
// DOM elements
const visualDisplay = document.getElementById('visual-display');
const optionButtons = document.querySelectorAll('.option-btn');
const feedbackElement = document.getElementById('feedback');
const scoreElement = document.getElementById('score');
// Level buttons removed - level is selected at the beginning
// const levelButtons = document.querySelectorAll('.level-btn') as NodeListOf<HTMLButtonElement>;
const starRatingElement = document.getElementById('star-rating');
const totalStarsElement = document.getElementById('total-stars');
const playerModal = document.getElementById('player-modal');
const gameContainer = document.getElementById('game-container');
const playerForm = document.getElementById('player-form');
const playerNameDisplay = document.getElementById('player-name-display');
const timerSettingBtn = document.getElementById('timer-setting-btn');
const timerSettingDropdown = document.getElementById('timer-setting-dropdown');
const timerSettingDisplay = document.getElementById('timer-setting-display');
const timerDisplay = document.getElementById('timer-display');
const timerCard = document.getElementById('timer-card');
const endGameModal = document.getElementById('end-game-modal');
const endAttempts = document.getElementById('end-attempts');
const endCorrect = document.getElementById('end-correct');
const endWrong = document.getElementById('end-wrong');
const endStars = document.getElementById('end-stars');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const modalLevelButtons = document.querySelectorAll('.level-btn-modal');
// Player data
let playerData = null;
// Generate random number between min and max (inclusive)
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
// Shuffle array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
// Generate visual (emoji or SVG)
function generateVisual(count) {
    visualDisplay.innerHTML = '';
    // Determine grid columns based on count
    const cols = count <= 10 ? count : count <= 25 ? 5 : 10;
    visualDisplay.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    // Randomly choose between emoji, SVG, or mix
    const visualType = randomInt(0, 2); // 0: emoji, 1: SVG, 2: mix
    for (let i = 0; i < count; i++) {
        const item = document.createElement('div');
        item.className = 'visual-item';
        if (visualType === 0) {
            // Use emoji
            const emoji = emojis[randomInt(0, emojis.length - 1)];
            item.textContent = emoji;
        }
        else if (visualType === 1) {
            // Use SVG
            const svgKeys = Object.keys(svgIcons);
            const randomSvg = svgKeys[randomInt(0, svgKeys.length - 1)];
            item.innerHTML = svgIcons[randomSvg];
            item.style.color = getRandomColor();
        }
        else {
            // Mix: alternate or random
            if (i % 2 === 0) {
                const emoji = emojis[randomInt(0, emojis.length - 1)];
                item.textContent = emoji;
            }
            else {
                const svgKeys = Object.keys(svgIcons);
                const randomSvg = svgKeys[randomInt(0, svgKeys.length - 1)];
                item.innerHTML = svgIcons[randomSvg];
                item.style.color = getRandomColor();
            }
        }
        visualDisplay.appendChild(item);
    }
}
// Get random color for SVG
function getRandomColor() {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
        '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#E74C3C'
    ];
    return colors[randomInt(0, colors.length - 1)];
}
// Generate answer options (1 correct + 3 distractors)
function generateOptions(correctAnswer) {
    const options = [correctAnswer];
    const usedNumbers = new Set([correctAnswer]);
    const level = gameState.currentLevel;
    // Generate 3 distractors
    while (options.length < 4) {
        let distractor;
        // Make distractors more challenging but not too far off
        // Use level range to constrain distractors
        const range = Math.max(3, Math.floor((level.max - level.min) * 0.2));
        const min = Math.max(level.min, correctAnswer - range);
        const max = Math.min(level.max, correctAnswer + range);
        do {
            distractor = randomInt(min, max);
        } while (usedNumbers.has(distractor));
        options.push(distractor);
        usedNumbers.add(distractor);
    }
    return shuffleArray(options);
}
// Update option buttons
function updateOptions(options) {
    optionButtons.forEach((btn, index) => {
        btn.textContent = options[index].toString();
        btn.dataset.value = options[index].toString();
        btn.classList.remove('correct', 'wrong');
        btn.disabled = false;
    });
}
// LocalStorage functions
function savePlayerData() {
    if (playerData) {
        playerData.totalStars = gameState.totalStars;
        playerData.lastPlayed = new Date().toISOString();
        localStorage.setItem('playerData', JSON.stringify(playerData));
    }
}
function loadPlayerData() {
    const saved = localStorage.getItem('playerData');
    if (saved) {
        try {
            return JSON.parse(saved);
        }
        catch (e) {
            console.error('Error loading player data:', e);
            return null;
        }
    }
    return null;
}
function createPlayerData(name, age) {
    return {
        name: name,
        age: age,
        totalStars: 0,
        lastPlayed: new Date().toISOString()
    };
}
// Timer functions
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
function setTimerDuration(minutes) {
    timerState.duration = minutes;
    timerState.timeLeft = minutes * 60;
    if (timerSettingDisplay) {
        timerSettingDisplay.textContent = `${minutes} menit`;
    }
    if (timerDisplay) {
        timerDisplay.textContent = formatTime(timerState.timeLeft);
    }
    // Update active option
    if (timerSettingDropdown) {
        const options = timerSettingDropdown.querySelectorAll('.timer-option');
        options.forEach(opt => {
            const optMinutes = parseInt(opt.getAttribute('data-minutes') || '0');
            if (optMinutes === minutes) {
                opt.classList.add('active');
            }
            else {
                opt.classList.remove('active');
            }
        });
    }
}
function startTimer() {
    if (timerState.isRunning)
        return;
    timerState.isRunning = true;
    timerState.startTime = Date.now();
    timerState.intervalId = window.setInterval(() => {
        timerState.timeLeft--;
        if (timerDisplay) {
            timerDisplay.textContent = formatTime(timerState.timeLeft);
        }
        // Visual warning when time < 1 minute
        if (timerCard && timerState.timeLeft <= 60) {
            timerCard.classList.add('warning');
        }
        // Stop timer when time runs out
        if (timerState.timeLeft <= 0) {
            stopTimer();
            endGame();
        }
    }, 1000);
}
function stopTimer() {
    if (timerState.intervalId !== null) {
        clearInterval(timerState.intervalId);
        timerState.intervalId = null;
    }
    timerState.isRunning = false;
    if (timerCard) {
        timerCard.classList.remove('warning');
    }
}
function resetTimer() {
    stopTimer();
    timerState.timeLeft = timerState.duration * 60;
    if (timerDisplay) {
        timerDisplay.textContent = formatTime(timerState.timeLeft);
    }
    if (timerCard) {
        timerCard.classList.remove('warning');
    }
}
function getGameStats() {
    return {
        attempts: gameState.score + gameState.wrongAnswers,
        correct: gameState.score,
        wrong: gameState.wrongAnswers,
        stars: gameState.totalStars
    };
}
function showEndGameModal() {
    const stats = getGameStats();
    if (endAttempts) {
        endAttempts.textContent = stats.attempts.toString();
    }
    if (endCorrect) {
        endCorrect.textContent = stats.correct.toString();
    }
    if (endWrong) {
        endWrong.textContent = stats.wrong.toString();
    }
    if (endStars) {
        endStars.textContent = stats.stars.toString();
    }
    if (endGameModal) {
        endGameModal.style.display = 'flex';
    }
}
function endGame() {
    stopTimer();
    showEndGameModal();
    // Disable all buttons
    optionButtons.forEach(btn => {
        btn.disabled = true;
    });
}
function resetGameWithTimer(minutes) {
    // Stop current timer if running
    stopTimer();
    // Reset timer
    setTimerDuration(minutes);
    resetTimer();
    // Reset game state
    gameState.score = 0;
    gameState.wrongAnswers = 0;
    gameState.totalStars = 0;
    if (scoreElement) {
        scoreElement.textContent = '0';
    }
    if (totalStarsElement) {
        totalStarsElement.textContent = '0';
    }
    // Hide end game modal
    if (endGameModal) {
        endGameModal.style.display = 'none';
    }
    // Re-enable buttons
    optionButtons.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('correct', 'wrong');
    });
    // Start new question
    nextQuestion();
    // Start timer
    startTimer();
}
// Update stat value with animation
function updateStatValue(element, newValue) {
    element.textContent = newValue;
    element.classList.add('updated');
    setTimeout(() => {
        element.classList.remove('updated');
    }, 500);
}
// Show feedback
function showFeedback(isCorrect) {
    feedbackElement.classList.remove('hidden', 'correct', 'wrong');
    if (isCorrect) {
        feedbackElement.textContent = '🎉 Benar! Bagus sekali!';
        feedbackElement.classList.add('correct');
    }
    else {
        feedbackElement.textContent = '😔 Belum tepat, coba lagi!';
        feedbackElement.classList.add('wrong');
    }
    // Hide feedback after 2 seconds
    setTimeout(() => {
        feedbackElement.classList.add('hidden');
    }, 2000);
}
// Calculate star rating based on response time
function calculateStarRating() {
    const responseTime = Date.now() - gameState.questionStartTime;
    const level = gameState.currentLevel;
    // Base time thresholds (in milliseconds)
    // Easy: 10 seconds, Medium: 15 seconds, Hard: 20 seconds, Extreme: 25 seconds
    const timeThresholds = {
        easy: { three: 5000, two: 10000 },
        medium: { three: 7000, two: 15000 },
        hard: { three: 10000, two: 20000 },
        extreme: { three: 12000, two: 25000 }
    };
    const thresholds = timeThresholds[level.name.toLowerCase()] || timeThresholds.easy;
    if (responseTime <= thresholds.three) {
        return 3; // ⭐⭐⭐
    }
    else if (responseTime <= thresholds.two) {
        return 2; // ⭐⭐
    }
    else {
        return 1; // ⭐
    }
}
// Show star rating with animation
function showStarRating(rating) {
    starRatingElement.classList.remove('hidden');
    const stars = starRatingElement.querySelectorAll('.star');
    // Reset all stars
    stars.forEach(star => {
        star.classList.remove('active', 'animate');
        star.style.opacity = '0.3';
    });
    // Animate stars one by one
    for (let i = 0; i < rating; i++) {
        setTimeout(() => {
            stars[i].classList.add('active', 'animate');
            stars[i].style.opacity = '1';
        }, i * 200); // Stagger animation
    }
    // Update total stars
    gameState.totalStars += rating;
    updateStatValue(totalStarsElement, gameState.totalStars.toString());
    // Save to localStorage
    savePlayerData();
    // Hide stars after 2.5 seconds
    setTimeout(() => {
        starRatingElement.classList.add('hidden');
        stars.forEach(star => {
            star.classList.remove('active', 'animate');
            star.style.opacity = '0.3';
        });
    }, 2500);
}
// Play applause sound
function playCelebrationSound() {
    // Check if browser supports Web Audio API
    if (typeof AudioContext !== 'undefined' || typeof window.webkitAudioContext !== 'undefined') {
        try {
            const AudioContextClass = AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContextClass();
            // Create applause sound using multiple claps
            const duration = 1.5; // 1.5 seconds
            const sampleRate = audioContext.sampleRate;
            const buffer = audioContext.createBuffer(2, sampleRate * duration, sampleRate);
            // Generate multiple claps (applause)
            const numClaps = 8;
            for (let clap = 0; clap < numClaps; clap++) {
                const clapTime = (clap / numClaps) * duration + Math.random() * 0.1;
                const clapSample = Math.floor(clapTime * sampleRate);
                // Each clap is a short burst of noise
                const clapDuration = 0.05; // 50ms per clap
                const clapSamples = Math.floor(clapDuration * sampleRate);
                for (let channel = 0; channel < 2; channel++) {
                    const channelData = buffer.getChannelData(channel);
                    for (let i = 0; i < clapSamples && (clapSample + i) < channelData.length; i++) {
                        const t = i / clapSamples;
                        // Create clap sound: white noise with envelope
                        const noise = (Math.random() * 2 - 1) * (1 - t); // Decay envelope
                        channelData[clapSample + i] += noise * 0.3;
                    }
                }
            }
            // Play the applause
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            // Add gain node for volume control
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 0.5;
            source.connect(gainNode);
            gainNode.connect(audioContext.destination);
            source.start(0);
            // Clean up after playback
            source.onended = () => {
                audioContext.close();
            };
        }
        catch (error) {
            console.log('Audio playback error:', error);
        }
    }
}
// Play wrong answer sound
function playWrongAnswerSound() {
    // Check if browser supports speech synthesis
    if ('speechSynthesis' in window) {
        const messages = ['Oops, coba lagi!', 'Hampir benar, coba sekali lagi'];
        const randomMessage = messages[randomInt(0, messages.length - 1)];
        const speak = () => {
            const utterance = new SpeechSynthesisUtterance(randomMessage);
            utterance.volume = 0.8;
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            // Use Indonesian voice if available, otherwise use default
            const voices = speechSynthesis.getVoices();
            const indonesianVoice = voices.find(voice => voice.lang.includes('id') || voice.lang.includes('ID'));
            if (indonesianVoice) {
                utterance.voice = indonesianVoice;
            }
            speechSynthesis.speak(utterance);
        };
        // Ensure voices are loaded
        if (speechSynthesis.getVoices().length > 0) {
            speak();
        }
        else {
            speechSynthesis.addEventListener('voiceschanged', speak, { once: true });
        }
    }
}
// Trigger confetti
function triggerConfetti() {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }
    const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
            return clearInterval(interval);
        }
        const particleCount = 50 * (timeLeft / duration);
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
    }, 250);
}
// Check answer
function checkAnswer(selectedValue) {
    if (gameState.isAnswered)
        return;
    gameState.isAnswered = true;
    const isCorrect = selectedValue === gameState.correctAnswer;
    // Disable all buttons
    optionButtons.forEach(btn => {
        btn.disabled = true;
        if (parseInt(btn.dataset.value || '0') === gameState.correctAnswer) {
            btn.classList.add('correct');
        }
        if (parseInt(btn.dataset.value || '0') === selectedValue && !isCorrect) {
            btn.classList.add('wrong');
        }
    });
    if (isCorrect) {
        gameState.score++;
        updateStatValue(scoreElement, gameState.score.toString());
        showFeedback(true);
        triggerConfetti();
        playCelebrationSound();
        // Calculate and show star rating
        const starRating = calculateStarRating();
        showStarRating(starRating);
        // Next question after 2.5 seconds
        setTimeout(() => {
            nextQuestion();
        }, 2500);
    }
    else {
        gameState.wrongAnswers++;
        showFeedback(false);
        playWrongAnswerSound();
        // Re-enable after feedback
        setTimeout(() => {
            gameState.isAnswered = false;
            optionButtons.forEach(btn => {
                btn.disabled = false;
                btn.classList.remove('correct', 'wrong');
            });
        }, 2000);
    }
}
// Set level and reset game
function setLevel(levelKey) {
    const level = levels[levelKey];
    if (!level)
        return;
    gameState.currentLevel = level;
    gameState.score = 0;
    gameState.wrongAnswers = 0;
    // Load total stars from localStorage if player exists
    if (playerData) {
        const savedData = loadPlayerData();
        if (savedData && savedData.name.toLowerCase() === playerData.name.toLowerCase()) {
            gameState.totalStars = savedData.totalStars;
        }
        else {
            gameState.totalStars = 0;
        }
    }
    else {
        gameState.totalStars = 0;
    }
    scoreElement.textContent = '0';
    totalStarsElement.textContent = gameState.totalStars.toString();
    scoreElement.classList.remove('updated');
    totalStarsElement.classList.remove('updated');
    // Note: Level buttons are removed from game container
    // Level is set at the beginning and cannot be changed during game
    // Reset timer if not running
    if (!timerState.isRunning) {
        resetTimer();
    }
    // Generate new question with new level
    nextQuestion();
}
// Generate new question
function nextQuestion() {
    const level = gameState.currentLevel;
    gameState.currentCount = randomInt(level.min, level.max);
    gameState.correctAnswer = gameState.currentCount;
    gameState.options = generateOptions(gameState.correctAnswer);
    gameState.isAnswered = false;
    gameState.questionStartTime = Date.now(); // Start timer for star rating
    generateVisual(gameState.currentCount);
    updateOptions(gameState.options);
    // Reset button states
    optionButtons.forEach(btn => {
        btn.classList.remove('correct', 'wrong');
        btn.disabled = false;
    });
}
// Reset player form
function resetPlayerForm() {
    const nameInput = document.getElementById('player-name');
    const ageInput = document.getElementById('player-age');
    if (nameInput) {
        nameInput.value = '';
    }
    if (ageInput) {
        ageInput.value = '';
    }
    // Reset level selection to default (Easy)
    modalLevelButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    const defaultLevelBtn = document.getElementById('modal-level-easy');
    if (defaultLevelBtn) {
        defaultLevelBtn.classList.add('active');
    }
    selectedLevel = 'easy';
}
// Back to main menu
function backToMainMenu() {
    // Stop timer
    stopTimer();
    // Reset game state
    gameState.score = 0;
    gameState.wrongAnswers = 0;
    gameState.isAnswered = false;
    // Hide end game modal
    if (endGameModal) {
        endGameModal.style.display = 'none';
    }
    // Hide game container
    if (gameContainer) {
        gameContainer.style.display = 'none';
    }
    // Reset player form
    resetPlayerForm();
    // Show player modal
    if (playerModal) {
        playerModal.style.display = 'flex';
    }
    // Reset game logic initialization flag
    gameLogicInitialized = false;
}
// Handle player form submission
function handlePlayerFormSubmit(event) {
    event.preventDefault();
    const formData = new FormData(playerForm);
    const name = formData.get('name').trim();
    const age = parseInt(formData.get('age'));
    if (name && age > 0) {
        // Create or update player data
        playerData = createPlayerData(name, age);
        // Update player name display
        if (playerNameDisplay) {
            playerNameDisplay.textContent = name;
        }
        // Load existing stars if player exists
        const existingData = loadPlayerData();
        if (existingData && existingData.name.toLowerCase() === name.toLowerCase()) {
            gameState.totalStars = existingData.totalStars;
            totalStarsElement.textContent = existingData.totalStars.toString();
        }
        // Save to localStorage
        savePlayerData();
        // Hide modal and show game
        playerModal.style.display = 'none';
        gameContainer.style.display = 'block';
        // Initialize game
        initGameLogic();
    }
}
// Flag to prevent duplicate event listeners
let gameLogicInitialized = false;
// Initialize game logic
function initGameLogic() {
    // Only initialize once
    if (gameLogicInitialized)
        return;
    gameLogicInitialized = true;
    // Timer setting button click
    if (timerSettingBtn) {
        timerSettingBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (timerSettingDropdown) {
                timerSettingDropdown.classList.toggle('show');
            }
        });
    }
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (timerSettingBtn && timerSettingDropdown &&
            !timerSettingBtn.contains(e.target) &&
            !timerSettingDropdown.contains(e.target)) {
            timerSettingDropdown.classList.remove('show');
        }
    });
    // Timer option clicks
    if (timerSettingDropdown) {
        const timerOptions = timerSettingDropdown.querySelectorAll('.timer-option');
        timerOptions.forEach(opt => {
            opt.addEventListener('click', () => {
                const minutes = parseInt(opt.getAttribute('data-minutes') || '10');
                setTimerDuration(minutes);
                timerSettingDropdown.classList.remove('show');
                // Reset timer if game hasn't started, or restart if running
                if (!timerState.isRunning) {
                    resetTimer();
                }
                else {
                    // If timer is running, restart with new duration
                    stopTimer();
                    setTimerDuration(minutes);
                    startTimer();
                }
            });
        });
    }
    // End game modal timer option buttons
    if (endGameModal) {
        const endGameTimerOptions = endGameModal.querySelectorAll('.timer-option-btn');
        endGameTimerOptions.forEach(btn => {
            btn.addEventListener('click', () => {
                const minutes = parseInt(btn.getAttribute('data-minutes') || '10');
                resetGameWithTimer(minutes);
            });
        });
    }
    // Back to menu button
    if (backToMenuBtn) {
        backToMenuBtn.addEventListener('click', () => {
            backToMainMenu();
        });
    }
    // ESC key handler for back to menu
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && endGameModal && endGameModal.style.display === 'flex') {
            backToMainMenu();
        }
    });
    // Add event listeners to option buttons
    optionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const value = parseInt(btn.dataset.value || '0');
            checkAnswer(value);
        });
    });
    // Initialize timer display
    if (timerDisplay && timerSettingDisplay) {
        setTimerDuration(10);
    }
    // Set default level (Easy) and start first question
    setLevel('easy');
    // Start timer when game starts (only if not already running)
    if (timerDisplay && !timerState.isRunning) {
        startTimer();
    }
}
// Initialize app
function initApp() {
    // Initialize level selection in modal
    modalLevelButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            modalLevelButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            // Set selected level
            selectedLevel = btn.dataset.level || 'easy';
        });
    });
    // Set default level (Easy) as active
    const defaultLevelBtn = document.getElementById('modal-level-easy');
    if (defaultLevelBtn) {
        defaultLevelBtn.classList.add('active');
    }
    // Check if player data exists
    const savedData = loadPlayerData();
    // Always reset form when showing modal
    resetPlayerForm();
    if (savedData) {
        // Load existing player data
        playerData = savedData;
        gameState.totalStars = savedData.totalStars;
        // Update player name display if game container is visible
        if (playerNameDisplay && gameContainer.style.display !== 'none') {
            playerNameDisplay.textContent = savedData.name;
        }
    }
    // Show modal
    playerModal.style.display = 'flex';
    // Add form submit handler
    playerForm.addEventListener('submit', handlePlayerFormSubmit);
}
// Start app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
}
else {
    initApp();
}
