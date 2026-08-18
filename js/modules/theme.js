
// --- Dark/Light Theme Toggle System ---
window.initThemeModule = function() {
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const toggleIcon = themeToggleBtn ? themeToggleBtn.querySelector(".toggle-icon") : null;

  const setDarkTheme = (isDark) => {
    if (isDark) {
      document.body.classList.add("dark-theme");
      document.body.classList.remove("light-theme");
      if (toggleIcon) toggleIcon.textContent = "☀️";
      localStorage.setItem("portfolio_theme", "dark");
    } else {
      document.body.classList.remove("dark-theme");
      document.body.classList.add("light-theme");
      if (toggleIcon) toggleIcon.textContent = "🌙";
      localStorage.setItem("portfolio_theme", "light");
    }
  };

  // Initialize theme from localStorage or user preference
  const savedTheme = localStorage.getItem("portfolio_theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    setDarkTheme(true);
  } else {
    setDarkTheme(false);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const isDark = document.body.classList.contains("dark-theme");
      setDarkTheme(!isDark);
    });
  }
};
