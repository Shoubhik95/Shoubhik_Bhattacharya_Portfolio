document.addEventListener("DOMContentLoaded", () => {
  // Handle GTA V Style Preloader
  const preloader = document.getElementById("gta-preloader");
  if (preloader) {
    const slides = preloader.querySelectorAll(".loader-slide");
    let currentSlide = 0;

    // Small delay to trigger the slide-in CSS transition
    setTimeout(() => {
      preloader.classList.add("loaded");
      if (slides.length > 0) {
        slides[0].classList.add("active");
      }
    }, 100);

    // Shuffle slides every 2.0 seconds (transitions Trevor -> Michael -> Wukong -> Joel -> Ezio -> Lara -> Trio Group)
    const slideInterval = setInterval(() => {
      if (slides.length > 0) {
        slides[currentSlide].classList.remove("active");
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add("active");
      }
    }, 2000);

    // Fade out and remove after 14 seconds (7 slides * 2 seconds)
    setTimeout(() => {
      clearInterval(slideInterval);
      preloader.classList.add("fade-out");
      setTimeout(() => {
        preloader.remove();
      }, 500);
    }, 14000);
  }

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

  // Floating Emojis Background Setup
  initEmojiBackground();

  // Scroll Reveal Animations
  initScrollReveal();
});

function initScrollReveal() {
  const sections = document.querySelectorAll(".reveal-on-scroll");
  
  const observerOptions = {
    root: null,
    rootMargin: "0px 0px -80px 0px", // Trigger slightly before the section enters full view
    threshold: 0.05
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
