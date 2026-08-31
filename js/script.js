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

  // Boot Cursor Spotlight & Ambient Dust System
  initCursorSpotlight();
  initAmbientParticles();

  // Scroll Reveal Animations
  initScrollReveal();

  // Show Reel Video Auto-play on Viewport Entry & Sound Control
  initShowreelController();
});

function initCursorSpotlight() {
  const spotlight = document.querySelector(".cursor-spotlight-bg");
  if (!spotlight) return;

  window.addEventListener("mousemove", (e) => {
    spotlight.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
  });
}

function initAmbientParticles() {
  if (document.querySelector(".particles-container")) return;

  const container = document.createElement("div");
  container.className = "particles-container";
  document.body.appendChild(container);

  const numParticles = 24;
  for (let i = 0; i < numParticles; i++) {
    const particle = document.createElement("span");
    particle.className = "ambient-particle";
    
    const left = Math.random() * 100;
    const size = 2 + Math.random() * 4;
    const delay = Math.random() * 12;
    const duration = 14 + Math.random() * 14;
    
    particle.style.setProperty("--left", `${left}%`);
    particle.style.setProperty("--size", `${size}px`);
    particle.style.setProperty("--delay", `${delay}s`);
    particle.style.animationDuration = `${duration}s`;
    
    container.appendChild(particle);
  }
}

function initShowreelController() {
  const showreelVideo = document.getElementById("showreel-player") || document.querySelector(".showreel-video");
  const soundBtn = document.getElementById("showreel-sound-btn");

  if (!showreelVideo) return;

  // Sound Toggle Button Handler (if present)
  if (soundBtn) {
    soundBtn.addEventListener("click", () => {
      if (showreelVideo.muted) {
        showreelVideo.muted = false;
        soundBtn.innerHTML = "🔊 SOUND ON";
        soundBtn.classList.add("sound-active");
      } else {
        showreelVideo.muted = true;
        soundBtn.innerHTML = "🔇 CLICK FOR SOUND";
        soundBtn.classList.remove("sound-active");
      }
    });
  }
}


function initScrollReveal() {
  const sections = document.querySelectorAll(".reveal-on-scroll");
  
  const observerOptions = {
    root: null,
    rootMargin: "0px 0px -60px 0px",
    threshold: 0.08
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
      } else {
        entry.target.classList.remove("revealed");
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    observer.observe(section);
  });

  // Smooth Scroll Parallax Shift for Background Grid
  const gridOverlay = document.querySelector(".grid-bg-overlay");
  let ticking = false;

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrolled = window.pageYOffset;
        if (gridOverlay) {
          gridOverlay.style.transform = `translate3d(0, ${scrolled * 0.04}px, 0)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

function initEmojiBackground() {
  // Avoid duplicating container
  if (document.querySelector(".emoji-bg-container")) return;

  const container = document.createElement("div");
  container.className = "emoji-bg-container";
  document.body.appendChild(container);

  const emojis = ["🎮", "🕹️", "👾", "🎨", "💻", "🚀", "🎲", "⚔️", "🛡️"];
  const numEmojis = 15;

  for (let i = 0; i < numEmojis; i++) {
    const emojiEl = document.createElement("span");
    emojiEl.className = "bg-emoji";
    emojiEl.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    
    const left = Math.random() * 100;
    const size = 18 + Math.random() * 24; // 18px to 42px
    const delay = Math.random() * 10;
    const duration = 12 + Math.random() * 10;
    
    emojiEl.style.setProperty("--left", `${left}%`);
    emojiEl.style.setProperty("--size", `${size}px`);
    emojiEl.style.setProperty("--delay", `${delay}s`);
    emojiEl.style.animationDuration = `${duration}s`;
    
    container.appendChild(emojiEl);
  }
}
