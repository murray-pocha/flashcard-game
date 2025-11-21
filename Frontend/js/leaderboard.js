// Frontend/js/leaderboard.js
// Renders two leaderboards: one per game mode.

// DOM elements
const difficultyFilter = document.getElementById("difficulty-filter");
const wordTableBody = document.getElementById("leaderboard-word-body");
const defTableBody = document.getElementById("leaderboard-def-body");

const API_BASE = "/api/leaderboard";

// Format timestamp nicely
function formatDate(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(); // local settings
}

// Render rows into a given <tbody>
function renderTableBody(tbody, rows) {
  tbody.innerHTML = "";

  if (!rows || rows.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 5;
    td.textContent = "No scores yet. Play a game to get on the leaderboard!";
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  rows.forEach((row, index) => {
    const tr = document.createElement("tr");

    const rankTd = document.createElement("td");
    rankTd.textContent = index + 1;
    tr.appendChild(rankTd);

    const playerTd = document.createElement("td");
    playerTd.textContent = row.username || "Anonymous";
    tr.appendChild(playerTd);

    const scoreTd = document.createElement("td");
    scoreTd.textContent = `${row.correct_answers} / ${row.total_questions}`;
    tr.appendChild(scoreTd);

    const diffTd = document.createElement("td");
    diffTd.textContent = row.difficulty;
    tr.appendChild(diffTd);

    const whenTd = document.createElement("td");
    whenTd.textContent = formatDate(row.created_at);
    tr.appendChild(whenTd);

    tbody.appendChild(tr);
  });
}

// Fetch leaderboard rows for a specific mode
async function fetchLeaderboard(mode) {
  try {
    let url = `${API_BASE}?mode=${encodeURIComponent(mode)}`;
    const diff = difficultyFilter.value; // "" | "easy" | "medium" | "hard"

    if (diff) {
      url += `&difficulty=${encodeURIComponent(diff)}`;
    }

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch leaderboard (${mode}), status ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    return [];
  }
}

// Load both tables
async function refreshLeaderboards() {
  const [wordRows, defRows] = await Promise.all([
    fetchLeaderboard("word_to_definition"),
    fetchLeaderboard("definition_to_word"),
  ]);

  renderTableBody(wordTableBody, wordRows);
  renderTableBody(defTableBody, defRows);
}

// Reload when difficulty changes
if (difficultyFilter) {
  difficultyFilter.addEventListener("change", () => {
    refreshLeaderboards();
  });
}

// Run once when script loads (script is at bottom of body, so DOM is ready)
refreshLeaderboards();