// Frontend/js/game-definition-to-word.js
// Second game: show definition, choose from 4 word options.

// ----- 1. Grab elements from the page ----- //
const startButton2 = document.getElementById('start-game-2');
const nextCardButton2 = document.getElementById('next-card-2');

const cardDefinition = document.getElementById('card-definition');
const answersWordsContainer = document.getElementById('answer-word-options');
const feedbackEl2 = document.getElementById('feedback-2');

const scoreCorrectSpan2 = document.getElementById('score-correct-2');
const scoreTotalSpan2 = document.getElementById('score-total-2');

// We will reuse the same difficulty dropdown and shuffle() + fetchWordsForDifficulty()
// from game.js. Those are already global if game.js loads first.

const MAX_QUESTIONS_2 = 10;

// ----- Game state for game 2 ----- //

let currentWords2 = [];
let currentIndex2 = 0;
let scoreCorrect2 = 0;
let scoreTotal2 = 0;
let answeredCurrent2 = false;
let gameActive2 = false;
let currentDifficulty2 = 'easy';

// ----- Helper functions ----- //

function updateScoreDisplay2() {
  scoreCorrectSpan2.textContent = scoreCorrect2;
  scoreTotalSpan2.textContent = scoreTotal2;
}

// Create 4 word buttons: 1 correct + 3 random wrong
function buildAnswerOptions2() {
  answersWordsContainer.innerHTML = '';

  if (currentWords2.length === 0) return;

  const current = currentWords2[currentIndex2];

  const allWords = currentWords2.map(w => w.word);
  const wrongWords = allWords.filter(w => w !== current.word);
  const shuffledWrongs = shuffle(wrongWords).slice(0, 3);

  const options = shuffle([current.word, ...shuffledWrongs]);

  options.forEach(wordText => {
    const btn = document.createElement('button');
    btn.textContent = wordText;
    btn.addEventListener('click', () => handleAnswerClick2(btn, wordText));
    answersWordsContainer.appendChild(btn);
  });
}

// Show current definition + options
function showCurrentCard2() {
  if (currentWords2.length === 0) {
    cardDefinition.textContent = 'No words loaded.';
    answersWordsContainer.innerHTML = '';
    feedbackEl2.textContent = '';
    return;
  }

  const current = currentWords2[currentIndex2];
  cardDefinition.textContent = current.definition;
  feedbackEl2.textContent = '';
  answeredCurrent2 = false;
  buildAnswerOptions2();
}

function endGame2() {
 gameActive2 = false;
  nextCardButton2.disabled = true;
  startButton2.disabled = false;

  Array.from(answersWordsContainer.children).forEach(btn => {
    btn.disabled = true;
  });

  feedbackEl2.textContent = `Game over! You scored ${scoreCorrect2} / ${MAX_QUESTIONS_2}.`;

  // Send score for Game 2
  fetch('/api/scores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      correctAnswers: scoreCorrect2,
      totalQuestions: MAX_QUESTIONS_2,
      difficulty: currentDifficulty2,
      mode: 'definition_to_word'   // ⬅️ IMPORTANT – different mode
    })
  })
    .then(res => res.json())
    .then(data => {
      console.log('Score saved (Game 2):', data);
    })
    .catch(err => {
      console.error('Error saving score (Game 2):', err);
    });
}

function goToNextCard2() {
  if (currentWords2.length === 0) return;
  currentIndex2 = (currentIndex2 + 1) % currentWords2.length;
  showCurrentCard2();
}

function setButtonsPlaying2(isPlaying) {
  startButton2.disabled = isPlaying;
  nextCardButton2.disabled = !isPlaying;
}

// ----- Event handlers ----- //

async function handleStartGame2() {
  // reuse same dropdown as game 1
  const difficultySelect = document.getElementById('difficulty');
  currentDifficulty2 = difficultySelect.value;

  try {
    const wordsFromDb = await fetchWordsForDifficulty(currentDifficulty2);

    currentWords2 = shuffle(wordsFromDb);

    if (currentWords2.length === 0) {
      feedbackEl2.textContent = 'No words found for this difficulty.';
      setButtonsPlaying2(false);
      gameActive2 = false;
      return;
    }

    currentIndex2 = 0;
    scoreCorrect2 = 0;
    scoreTotal2 = 0;
    gameActive2 = true;

    updateScoreDisplay2();
    setButtonsPlaying2(true);
    showCurrentCard2();
  } catch (err) {
    console.error('Error starting game 2:', err);
    feedbackEl2.textContent = 'Could not load words from the server.';
    setButtonsPlaying2(false);
    gameActive2 = false;
  }
}

function handleAnswerClick2(button, chosenWord) {
  if (!gameActive2 || answeredCurrent2 || currentWords2.length === 0) return;

  answeredCurrent2 = true;

  const current = currentWords2[currentIndex2];
  const correctWord = current.word;

  scoreTotal2 += 1;

  if (chosenWord === correctWord) {
    scoreCorrect2 += 1;
    feedbackEl2.textContent = '✅ Correct!';
    button.classList.add('correct');
  } else {
    feedbackEl2.textContent = '❌ Not this one. Look for the right word!';
    button.classList.add('incorrect');
  }

  updateScoreDisplay2();

  Array.from(answersWordsContainer.children).forEach(btn => {
    if (btn.textContent === correctWord) {
      btn.classList.add('correct');
    }
    btn.disabled = true;
  });

  if (scoreTotal2 >= MAX_QUESTIONS_2) {
    endGame2();
  }
}

function handleNextCard2() {
  if (!gameActive2) return;
  goToNextCard2();
}

// ----- Wire up ----- //

startButton2.addEventListener('click', handleStartGame2);
nextCardButton2.addEventListener('click', handleNextCard2);

setButtonsPlaying2(false);
updateScoreDisplay2();
cardDefinition.textContent = 'Press "Start Game 2" to begin!';
answersWordsContainer.innerHTML = '';
feedbackEl2.textContent = '';