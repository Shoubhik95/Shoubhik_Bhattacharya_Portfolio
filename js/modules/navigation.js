
// --- Cyber Navbar & Hamburger Handling ---
window.initNavigationModule = function () {
  const cyberHeader = document.querySelector(".cyber-header");
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link");
  const sections = document.querySelectorAll("section");

  const toggleMobileMenu = () => {
    if (cyberHeader) {
      cyberHeader.classList.toggle("menu-open");
    }
  };

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener("click", toggleMobileMenu);
  }

  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      if (cyberHeader) {
        cyberHeader.classList.remove("menu-open");
      }
    });
  });

  // Scrollspy Active link highlighting
  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (window.scrollY >= (sectionTop - 120)) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  });

  // Resume Scroll to Bottom Download Station Logic
  const resumeScrollBtns = document.querySelectorAll(".resume-scroll-btn, a[href='#footer-resume-btn']");
  const footerResumeBtn = document.getElementById("footer-resume-btn");

  resumeScrollBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (cyberHeader) {
        cyberHeader.classList.remove("menu-open");
      }
      if (footerResumeBtn) {
        footerResumeBtn.scrollIntoView({ behavior: "smooth", block: "center" });
        footerResumeBtn.classList.remove("resume-pulse-highlight");
        void footerResumeBtn.offsetWidth; // Trigger reflow
        footerResumeBtn.classList.add("resume-pulse-highlight");
        setTimeout(() => {
          footerResumeBtn.classList.remove("resume-pulse-highlight");
        }, 2500);
      }
    });
  });
};
