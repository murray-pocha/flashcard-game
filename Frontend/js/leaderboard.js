// Frontend/js/leaderboard.js
// Fetches scores from the backend and displays them in a table.

const difficultyFilter = document.getElementById('leaderboard-difficulty');
const tableBody = document.getElementById('leaderboard-body');

// Format the timestamp as a readable date/time
function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString(); // uses local settings
}

async function loadLeaderboard() {
  const difficultyValue = difficultyFilter.value; // 'all' | 'easy' | 'medium' | 'hard'
  let url = '/api/leaderboard';

  if (difficultyValue !== 'all') {
    url += `?difficulty=${encodeURIComponent(difficultyValue)}`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const scores = await res.json();

    // Clear existing rows
    tableBody.innerHTML = '';

    if (scores.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 5;
      td.textContent = 'No scores yet. Play a game to get on the leaderboard!';
      tableBody.appendChild(tr);
      tr.appendChild(td);
      return;
    }

    scores.forEach((row, index) => {
      const tr = document.createElement('tr');

      const rankTd = document.createElement('td');
      rankTd.textContent = index + 1;

      const playerTd = document.createElement('td');
      playerTd.textContent = row.username || 'Anonymous';

      const scoreTd = document.createElement('td');
      scoreTd.textContent = `${row.correct_answers} / ${row.total_questions}`;

      const difficultyTd = document.createElement('td');
      difficultyTd.textContent = row.difficulty;

      const dateTd = document.createElement('td');
      dateTd.textContent = formatDate(row.created_at);

      tr.appendChild(rankTd);
      tr.appendChild(playerTd);
      tr.appendChild(scoreTd);
      tr.appendChild(difficultyTd);
      tr.appendChild(dateTd);

      tableBody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error loading leaderboard:', err);
    tableBody.innerHTML = '';
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 5;
    td.textContent = 'Failed to load leaderboard.';
    tr.appendChild(td);
    tableBody.appendChild(tr);
  }
}

// Reload leaderboard when difficulty filter changes
difficultyFilter.addEventListener('change', loadLeaderboard);

// Load on page start
loadLeaderboard();