// Frontend/js/main.js
// Checks who is logged in and updates the nav text.

document.addEventListener('DOMContentLoaded', async () => {
  const nav = document.querySelector('.main-nav');
  if (!nav) return;

  // Create a span in the nav to show the welcome text
  const welcomeSpan = document.createElement('span');
  welcomeSpan.id = 'welcome-user';
  welcomeSpan.style.marginLeft = '1rem';
  welcomeSpan.style.fontWeight = 'bold';
  welcomeSpan.style.color = '#ffe'; // light text on purple header
  nav.appendChild(welcomeSpan);

  try {
    const res = await fetch('/api/me');
    const data = await res.json();

    if (data.loggedIn && data.username) {
      // Show welcome message
      welcomeSpan.textContent = `Welcome, ${data.username}`;

      // ---------- ADD LOGOUT BUTTON WHEN LOGGED IN ----------
      const logoutBtn = document.createElement("button");
      logoutBtn.textContent = "Logout";
      logoutBtn.id = "logout-btn";
      logoutBtn.style.marginLeft = "1rem";
      logoutBtn.style.padding = "5px 10px";
      logoutBtn.style.borderRadius = "5px";
      logoutBtn.style.border = "none";
      logoutBtn.style.cursor = "pointer";
      logoutBtn.style.background = "#fff";
      logoutBtn.style.color = "#6a2fcc"; // purple text
      logoutBtn.style.fontWeight = "bold";

      logoutBtn.addEventListener("click", async () => {
        await fetch("/logout", { method: "POST" });
        window.location.href = "/"; // refresh to anonymous
      });

      nav.appendChild(logoutBtn);
      

    } else {
      // Not logged in
      welcomeSpan.textContent = '';
    }

  } catch (err) {
    console.error('Error checking login status:', err);
  }
});