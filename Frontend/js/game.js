// Frontend/js/game.js
// Flash-card game with 4 multiple-choice answers and 10-question rounds.

// ----- 1. Grab elements from the page ----- //
const difficultySelect = document.getElementById('difficulty');
const startButton = document.getElementById('start-game');
const nextCardButton = document.getElementById('next-card');

const cardWord = document.getElementById('card-word');
const answersContainer = document.getElementById('answer-options');
const feedbackEl = document.getElementById('feedback');

const scoreCorrectSpan = document.getElementById('score-correct');
const scoreTotalSpan = document.getElementById('score-total');

// ----- 2. Constants ----- //

const MAX_QUESTIONS = 10; // stop after 10 answers

// ----- 4. Game state ----- //

let currentWords = [];
let currentIndex = 0;
let scoreCorrect = 0;
let scoreTotal = 0;
let answeredCurrent = false;
let gameActive = false;
let currentDifficulty = 'easy';

// ----- 5. Fetch words from backend ----- //

async function fetchWordsForDifficulty(difficulty) {
  const response = await fetch(`/api/words?difficulty=${encodeURIComponent(difficulty)}`);
  if (!response.ok) {
    throw new Error(`Failed to load words: ${response.status}`);
  }
  const data = await response.json();
  return data; // array of { id, word, definition, difficulty }
}

// ----- 6. Helper functions ----- //

// Simple array shuffle (Fisher–Yates)
function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function updateScoreDisplay() {
  scoreCorrectSpan.textContent = scoreCorrect;
  scoreTotalSpan.textContent = scoreTotal;
}

// Create 4 answer buttons: 1 correct + 3 random wrong
function buildAnswerOptions() {
  answersContainer.innerHTML = '';

  if (currentWords.length === 0) return;

  const current = currentWords[currentIndex];

  const allDefinitions = currentWords.map(w => w.definition);
  const wrongDefinitions = allDefinitions.filter(def => def !== current.definition);
  const shuffledWrongs = shuffle(wrongDefinitions).slice(0, 3);

  const options = shuffle([current.definition, ...shuffledWrongs]);

  options.forEach(defText => {
    const btn = document.createElement('button');
    btn.textContent = defText;
    btn.addEventListener('click', () => handleAnswerClick(btn, defText));
    answersContainer.appendChild(btn);
  });
}

// Show the current word and its options
function showCurrentCard() {
  if (currentWords.length === 0) {
    cardWord.textContent = 'No words loaded.';
    answersContainer.innerHTML = '';
    feedbackEl.textContent = '';
    return;
  }

  const current = currentWords[currentIndex];
  cardWord.textContent = current.word;
  feedbackEl.textContent = '';
  answeredCurrent = false;
  buildAnswerOptions();
}

// When the round is over (10 questions)
function endGame() {
  gameActive = false;
  nextCardButton.disabled = true;
  startButton.disabled = false;

  // disable remaining buttons
  Array.from(answersContainer.children).forEach(btn => {
    btn.disabled = true;
  });

  feedbackEl.textContent = `Game over! You scored ${scoreCorrect} / ${MAX_QUESTIONS}.`;

  // send score to backend
  sendScoreToBackend();
}

// Send the final score to the backend for the leaderboard
function sendScoreToBackend() {
  fetch('/api/scores', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      correctAnswers: scoreCorrect,
      totalQuestions: MAX_QUESTIONS,
      difficulty: currentDifficulty
    })
  })
    .then(res => res.json())
    .then(data => {
      console.log('Score saved:', data);
      // Optional: nudge player to view leaderboard
      feedbackEl.textContent += ' Your score has been saved to the leaderboard!';
    })
    .catch(err => {
      console.error('Error saving score:', err);
      feedbackEl.textContent += ' (Could not save score.)';
    });
}

// Move to the next word (wrap around)
function goToNextCard() {
  if (currentWords.length === 0) return;
  currentIndex = (currentIndex + 1) % currentWords.length;
  showCurrentCard();
}

// Toggle start/next buttons
function setButtonsPlaying(isPlaying) {
  startButton.disabled = isPlaying;
  nextCardButton.disabled = !isPlaying;
}

// ----- 7. Event handlers ----- //

// NOTE: now async so we can await DB words
async function handleStartGame() {
  currentDifficulty = difficultySelect.value; // remember for saving score

  try {
    // Get words from the database for this difficulty
    const wordsFromDb = await fetchWordsForDifficulty(currentDifficulty);

    // Shuffle them so order is random
    currentWords = shuffle(wordsFromDb);

    if (currentWords.length === 0) {
      feedbackEl.textContent = 'No words found for this difficulty.';
      setButtonsPlaying(false);
      gameActive = false;
      return;
    }

    currentIndex = 0;
    scoreCorrect = 0;
    scoreTotal = 0;
    gameActive = true;

    updateScoreDisplay();
    setButtonsPlaying(true);
    showCurrentCard();
  } catch (err) {
    console.error('Error starting game:', err);
    feedbackEl.textContent = 'Could not load words from the server.';
    setButtonsPlaying(false);
    gameActive = false;
  }
}

function handleAnswerClick(button, chosenDefinition) {
  if (!gameActive || answeredCurrent || currentWords.length === 0) return;

  answeredCurrent = true;

  const current = currentWords[currentIndex];
  const correctDefinition = current.definition;

  // update attempts
  scoreTotal += 1;

  if (chosenDefinition === correctDefinition) {
    scoreCorrect += 1;
    feedbackEl.textContent = '✅ Correct!';
    button.classList.add('correct');
  } else {
    feedbackEl.textContent = '❌ Not this one. Look for the right meaning!';
    button.classList.add('incorrect');
  }

  updateScoreDisplay();

  // highlight correct answer & disable all buttons
  Array.from(answersContainer.children).forEach(btn => {
    if (btn.textContent === correctDefinition) {
      btn.classList.add('correct');
    }
    btn.disabled = true;
  });

  // If we've reached 10 questions, end the game
  if (scoreTotal >= MAX_QUESTIONS) {
    endGame();
  }
}

function handleNextCard() {
  if (!gameActive) return;
  goToNextCard();
}

// ----- 8. Wire up buttons & initial state ----- //

startButton.addEventListener('click', handleStartGame);
nextCardButton.addEventListener('click', handleNextCard);

setButtonsPlaying(false);
updateScoreDisplay();
cardWord.textContent = 'Press "Start Game" to begin!';
answersContainer.innerHTML = '';
feedbackEl.textContent = '';