// Level configuration
interface Level {
    name: string;
    min: number;
    max: number;
}

const levels: Record<string, Level> = {
    easy: { name: 'Easy', min: 1, max: 10 },
    medium: { name: 'Medium', min: 11, max: 20 },
    hard: { name: 'Hard', min: 20, max: 30 },
    extreme: { name: 'Extreme', min: 31, max: 50 }
};

// Game state
interface GameState {
    currentCount: number;
    correctAnswer: number;
    options: number[];
    score: number;
    isAnswered: boolean;
    currentLevel: Level;
}

let gameState: GameState = {
    currentCount: 0,
    correctAnswer: 0,
    options: [],
    score: 0,
    isAnswered: false,
    currentLevel: levels.easy // Default to Easy
};

// Emoji library
const emojis: string[] = [
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
const visualDisplay = document.getElementById('visual-display') as HTMLElement;
const optionButtons = document.querySelectorAll('.option-btn') as NodeListOf<HTMLButtonElement>;
const feedbackElement = document.getElementById('feedback') as HTMLElement;
const scoreElement = document.getElementById('score') as HTMLElement;
const levelButtons = document.querySelectorAll('.level-btn') as NodeListOf<HTMLButtonElement>;

// Generate random number between min and max (inclusive)
function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Shuffle array
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Generate visual (emoji or SVG)
function generateVisual(count: number): void {
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
        } else if (visualType === 1) {
            // Use SVG
            const svgKeys = Object.keys(svgIcons);
            const randomSvg = svgKeys[randomInt(0, svgKeys.length - 1)];
            item.innerHTML = svgIcons[randomSvg as keyof typeof svgIcons];
            item.style.color = getRandomColor();
        } else {
            // Mix: alternate or random
            if (i % 2 === 0) {
                const emoji = emojis[randomInt(0, emojis.length - 1)];
                item.textContent = emoji;
            } else {
                const svgKeys = Object.keys(svgIcons);
                const randomSvg = svgKeys[randomInt(0, svgKeys.length - 1)];
                item.innerHTML = svgIcons[randomSvg as keyof typeof svgIcons];
                item.style.color = getRandomColor();
            }
        }

        visualDisplay.appendChild(item);
    }
}

// Get random color for SVG
function getRandomColor(): string {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
        '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#E74C3C'
    ];
    return colors[randomInt(0, colors.length - 1)];
}

// Generate answer options (1 correct + 3 distractors)
function generateOptions(correctAnswer: number): number[] {
    const options: number[] = [correctAnswer];
    const usedNumbers = new Set([correctAnswer]);
    const level = gameState.currentLevel;

    // Generate 3 distractors
    while (options.length < 4) {
        let distractor: number;

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
function updateOptions(options: number[]): void {
    optionButtons.forEach((btn, index) => {
        btn.textContent = options[index].toString();
        btn.dataset.value = options[index].toString();
        btn.classList.remove('correct', 'wrong');
        btn.disabled = false;
    });
}

// Show feedback
function showFeedback(isCorrect: boolean): void {
    feedbackElement.classList.remove('hidden', 'correct', 'wrong');

    if (isCorrect) {
        feedbackElement.textContent = '🎉 Benar! Bagus sekali!';
        feedbackElement.classList.add('correct');
    } else {
        feedbackElement.textContent = '😔 Belum tepat, coba lagi!';
        feedbackElement.classList.add('wrong');
    }

    // Hide feedback after 2 seconds
    setTimeout(() => {
        feedbackElement.classList.add('hidden');
    }, 2000);
}

// Play applause sound
function playCelebrationSound(): void {
    // Check if browser supports Web Audio API
    if (typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined') {
        try {
            const AudioContextClass = AudioContext || (window as any).webkitAudioContext;
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
        } catch (error) {
            console.log('Audio playback error:', error);
        }
    }
}

// Play wrong answer sound
function playWrongAnswerSound(): void {
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
            const indonesianVoice = voices.find(voice =>
                voice.lang.includes('id') || voice.lang.includes('ID')
            );
            if (indonesianVoice) {
                utterance.voice = indonesianVoice;
            }

            speechSynthesis.speak(utterance);
        };

        // Ensure voices are loaded
        if (speechSynthesis.getVoices().length > 0) {
            speak();
        } else {
            speechSynthesis.addEventListener('voiceschanged', speak, { once: true });
        }
    }
}

// Trigger confetti
function triggerConfetti(): void {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number): number {
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
function checkAnswer(selectedValue: number): void {
    if (gameState.isAnswered) return;

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
        scoreElement.textContent = gameState.score.toString();
        showFeedback(true);
        triggerConfetti();
        playCelebrationSound();

        // Next question after 2.5 seconds
        setTimeout(() => {
            nextQuestion();
        }, 2500);
    } else {
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
function setLevel(levelKey: string): void {
    const level = levels[levelKey];
    if (!level) return;

    gameState.currentLevel = level;
    gameState.score = 0;
    scoreElement.textContent = '0';

    // Update active level button
    levelButtons.forEach(btn => {
        if (btn.dataset.level === levelKey) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Generate new question with new level
    nextQuestion();
}

// Generate new question
function nextQuestion(): void {
    const level = gameState.currentLevel;
    gameState.currentCount = randomInt(level.min, level.max);
    gameState.correctAnswer = gameState.currentCount;
    gameState.options = generateOptions(gameState.correctAnswer);
    gameState.isAnswered = false;

    generateVisual(gameState.currentCount);
    updateOptions(gameState.options);

    // Reset button states
    optionButtons.forEach(btn => {
        btn.classList.remove('correct', 'wrong');
        btn.disabled = false;
    });
}

// Initialize game
function initGame(): void {
    // Add event listeners to level buttons
    levelButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const levelKey = btn.dataset.level;
            if (levelKey) {
                setLevel(levelKey);
            }
        });
    });

    // Add event listeners to option buttons
    optionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const value = parseInt(btn.dataset.value || '0');
            checkAnswer(value);
        });
    });

    // Set default level (Easy) and start first question
    setLevel('easy');
}

// Start game when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}

