document.addEventListener("DOMContentLoaded", () => {
  // Boot modularized portfolio JS subsystems sequentially
  if (typeof window.initThemeModule === "function") {
    window.initThemeModule();
  }
  if (typeof window.initNavigationModule === "function") {
    window.initNavigationModule();
  }
  if (typeof window.initSkillsModule === "function") {
    window.initSkillsModule();
  }
  if (typeof window.initProjectsModule === "function") {
    window.initProjectsModule();
  }
  if (typeof window.initModalModule === "function") {
    window.initModalModule();
  }
  if (typeof window.initDashboardModule === "function") {
    window.initDashboardModule();
  }
});
