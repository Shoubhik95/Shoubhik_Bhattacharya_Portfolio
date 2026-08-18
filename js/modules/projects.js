window.initProjectsModule = function() {
  let currentCarouselIndex = 0;
  let currentFilteredProjects = [];

  const updateCarouselTrack = () => {
    const track = document.getElementById("projects-grid");
    const prevBtn = document.getElementById("proj-prev-btn");
    const nextBtn = document.getElementById("proj-next-btn");
    const dotsContainer = document.getElementById("projects-carousel-dots");
    if (!track) return;

    const cards = track.querySelectorAll(".project-card-wrapper");
    if (cards.length === 0) return;

    // Calculate items visible per view
    let itemsPerView = 1;
    if (window.innerWidth >= 992) {
      itemsPerView = 3;
    } else if (window.innerWidth >= 640) {
      itemsPerView = 2;
    }

    const maxIndex = Math.max(0, cards.length - itemsPerView);
    if (currentCarouselIndex > maxIndex) {
      currentCarouselIndex = maxIndex;
    }
    if (currentCarouselIndex < 0) {
      currentCarouselIndex = 0;
    }

    // Calculate translation percentage or pixel distance
    const cardWidth = cards[0].offsetWidth;
    const gap = 20;
    const translateX = currentCarouselIndex * (cardWidth + gap);
    track.style.transform = `translateX(-${translateX}px)`;

    // Update Nav Buttons State
    if (prevBtn) prevBtn.disabled = currentCarouselIndex === 0;
    if (nextBtn) nextBtn.disabled = currentCarouselIndex >= maxIndex;

    // Update Pagination Dots
    if (dotsContainer) {
      const totalPages = maxIndex + 1;
      dotsContainer.innerHTML = Array.from({ length: totalPages }, (_, i) => `
        <span class="carousel-dot dot-color-${i % 6} ${i === currentCarouselIndex ? 'active' : ''}" data-index="${i}"></span>
      `).join('');

      dotsContainer.querySelectorAll(".carousel-dot").forEach(dot => {
        dot.addEventListener("click", () => {
          currentCarouselIndex = parseInt(dot.getAttribute("data-index"));
          updateCarouselTrack();
        });
      });
    }
  };

  let projectAutoTimer = null;

  const startProjectAutoSlide = () => {
    stopProjectAutoSlide();
    projectAutoTimer = setInterval(() => {
      let itemsPerView = 1;
      if (window.innerWidth >= 992) itemsPerView = 3;
      else if (window.innerWidth >= 640) itemsPerView = 2;

      const maxIndex = Math.max(0, currentFilteredProjects.length - itemsPerView);
      if (maxIndex > 0) {
        const track = document.getElementById("projects-grid");
        if (currentCarouselIndex >= maxIndex) {
          currentCarouselIndex = 0;
        } else {
          currentCarouselIndex++;
        }
        updateCarouselTrack();
      }
    }, 1500);
  };

  const stopProjectAutoSlide = () => {
    if (projectAutoTimer) {
      clearInterval(projectAutoTimer);
      projectAutoTimer = null;
    }
  };

  const setupCarouselNav = () => {
    const prevBtn = document.getElementById("proj-prev-btn");
    const nextBtn = document.getElementById("proj-next-btn");
    const carouselWrapper = document.querySelector(".projects-carousel-wrapper");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        stopProjectAutoSlide();
        if (currentCarouselIndex > 0) {
          currentCarouselIndex--;
        } else {
          let itemsPerView = 1;
          if (window.innerWidth >= 992) itemsPerView = 3;
          else if (window.innerWidth >= 640) itemsPerView = 2;
          currentCarouselIndex = Math.max(0, currentFilteredProjects.length - itemsPerView);
        }
        updateCarouselTrack();
        startProjectAutoSlide();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        stopProjectAutoSlide();
        let itemsPerView = 1;
        if (window.innerWidth >= 992) itemsPerView = 3;
        else if (window.innerWidth >= 640) itemsPerView = 2;

        const maxIndex = Math.max(0, currentFilteredProjects.length - itemsPerView);
        if (currentCarouselIndex < maxIndex) {
          currentCarouselIndex++;
        } else {
          currentCarouselIndex = 0;
        }
        updateCarouselTrack();
        startProjectAutoSlide();
      });
    }

    if (carouselWrapper) {
      carouselWrapper.addEventListener("mouseenter", () => {
        stopProjectAutoSlide();
      });
      carouselWrapper.addEventListener("mouseleave", () => {
        startProjectAutoSlide();
      });
    }

    window.addEventListener("resize", () => {
      updateCarouselTrack();
    });

    startProjectAutoSlide();
  };

  const renderProjects = (category = "game-design") => {
    const projectsGrid = document.getElementById("projects-grid");
    if (!projectsGrid) return;

    const allProjects = [...gameProjectsData, ...webProjectsData];
    currentFilteredProjects = allProjects.filter(proj => proj.category === category);
    currentCarouselIndex = 0;

    const createProjectCard = (proj) => `
      <div class="project-card-wrapper" 
        data-id="${proj.id}"
        data-category="${proj.category}"
        data-title="${proj.title}" 
        data-subtitle="${proj.subtitle}"
        data-desc="${proj.desc}" 
        data-images="${proj.images}" 
        data-tags="${proj.tags ? proj.tags.join(',') : ''}"
        data-engine="${proj.engine || ''}"
        data-complexity="${proj.complexity || ''}"
        data-stage="${proj.stage || ''}"
        data-tools="${proj.tools || ''}"
        data-logs="${proj.logEntries ? proj.logEntries.join('|') : ''}"
        ${proj.link ? `data-link="${proj.link}"` : ''}
        ${proj.linkText ? `data-link-text="${proj.linkText}"` : ''}
        ${proj.video ? `data-video="${proj.video}"` : ''}
        ${proj.github ? `data-github="${proj.github}"` : ''}>
        <div class="spotlight-card card-inner-padding">
          <div class="project-card-layout">
            <div class="project-image-box">
              <img src="${proj.images.split(',')[0]}" alt="${proj.title}" class="proj-img">
              <div class="project-image-overlay">
                <span>View Project Details</span>
              </div>
            </div>
            <h4 class="project-card-title">${proj.title}</h4>
            <p class="project-card-subtitle">${proj.subtitle}</p>
            <p class="project-card-desc">${proj.desc}</p>
            <div class="project-tags-row">
              ${proj.tags ? proj.tags.slice(0, 3).map(tag => `<span class="project-tag">${tag}</span>`).join('') : ''}
            </div>
            <div class="project-learn-more">
              Learn More &nbsp;<span class="arrow-trans">&rarr;</span>
            </div>
          </div>
        </div>
      </div>
    `;

    projectsGrid.innerHTML = currentFilteredProjects
      .map(createProjectCard)
      .join('');

    setTimeout(() => {
      updateCarouselTrack();
    }, 50);
  };

  const updateTabIndicator = (activeBtn) => {
    const indicator = document.querySelector(".tab-slider-indicator");
    if (!indicator || !activeBtn) return;
    indicator.style.left = `${activeBtn.offsetLeft}px`;
    indicator.style.width = `${activeBtn.offsetWidth}px`;
  };

  const setupProjectsTabs = () => {
    const tabsContainer = document.querySelector(".projects-tabs");
    if (!tabsContainer) return;

    const tabButtons = tabsContainer.querySelectorAll(".tab-btn");

    // Set active class and indicator positioning
    const activeBtn = tabsContainer.querySelector(".tab-btn.active");
    if (activeBtn) {
      const initialCategory = activeBtn.getAttribute("data-category");
      tabsContainer.setAttribute("data-active-category", initialCategory);
      setTimeout(() => updateTabIndicator(activeBtn), 100);
    }

    tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        tabButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        updateTabIndicator(btn);
        const category = btn.getAttribute("data-category");

        // Update container theme attribute
        tabsContainer.setAttribute("data-active-category", category);

        renderProjects(category);
      });
    });

    window.addEventListener("resize", () => {
      const currentActive = tabsContainer.querySelector(".tab-btn.active");
      if (currentActive) {
        updateTabIndicator(currentActive);
      }
    });
  };

  const renderCertificates = () => {
    const tickerTrack = document.getElementById("ticker-track");
    if (!tickerTrack) return;

    const items = [...certificatesData, ...certificatesData, ...certificatesData];

    tickerTrack.innerHTML = items.map(cert => `
      <div class="ticker-item" data-src="${cert.src}" data-alt="${cert.alt}">
        <img src="${cert.src}" alt="${cert.alt}">
        <div class="ticker-overlay"><span>${cert.alt}</span></div>
      </div>
    `).join('');
  };
  renderProjects("game-design");
  setupProjectsTabs();
  setupCarouselNav();
  renderCertificates();



  /* ==========================================================================
     2. Decrypted Typing Text Loop
     ========================================================================== */
  const roles = [
    "3D Artist.",
    "Designer.",
    "Game Dev.",
    "Animator.",
    "Cinematics."
  ];

  let roleIndex = 0;
  let currentDisplayText = "";
  let isDeletingText = false;
  let typingTimeout = null;

  const roleTextEl = document.getElementById("role-text");

  const runTypingLoop = () => {
    const fullText = roles[roleIndex];

    if (isDeletingText) {
      currentDisplayText = fullText.slice(0, currentDisplayText.length - 1);
      if (roleTextEl) roleTextEl.textContent = currentDisplayText;

      if (currentDisplayText === "") {
        isDeletingText = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typingTimeout = setTimeout(runTypingLoop, 200);
      } else {
        typingTimeout = setTimeout(runTypingLoop, 50);
      }
    } else {
      currentDisplayText = fullText.slice(0, currentDisplayText.length + 1);
      if (roleTextEl) roleTextEl.textContent = currentDisplayText;

      if (currentDisplayText === fullText) {
        // Full word written, wait 4 seconds before deleting
        isDeletingText = true;
        typingTimeout = setTimeout(runTypingLoop, 4000);
      } else {
        typingTimeout = setTimeout(runTypingLoop, 100);
      }
    }
  };

  runTypingLoop();

  /* ==========================================================================
     3. Canvas Pixelation Transition
     ========================================================================== */
  const photoPaths = [
    "public/my photos/IMG_1506.webp"
  ];

  const profileCanvas = document.getElementById("profile-canvas");
  const preloadedImages = [];
  let pixelScale = 1;

  // Preload profile photo
  photoPaths.forEach(src => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      preloadedImages.push(img);
      if (preloadedImages.length === 1) {
        triggerIntroPixelation();
      }
    };
  });

  const drawProfile = (img, scale) => {
    if (!profileCanvas) return;
    const ctx = profileCanvas.getContext("2d");
    if (!ctx) return;

    // Set canvas display size dynamically based on its offset dimensions!
    const width = profileCanvas.clientWidth || 400;
    const height = profileCanvas.clientHeight || 480;

    // Only set width/height if they changed to avoid resetting canvas state on every animation frame
    if (profileCanvas.width !== width || profileCanvas.height !== height) {
      profileCanvas.width = width;
      profileCanvas.height = height;
    }

    ctx.clearRect(0, 0, width, height);

    // Center crop details (similar to CSS object-cover)
    const imgRatio = img.width / img.height;
    const canvasRatio = width / height;
    let sx = 0, sy = 0, sw = img.width, sh = img.height;

    if (imgRatio > canvasRatio) {
      sw = img.height * canvasRatio;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / canvasRatio;
      sy = (img.height - sh) / 2;
    }

    if (scale <= 1) {
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
    } else {
      const w = Math.max(10, Math.floor(width / scale));
      const h = Math.max(10, Math.floor(height / scale));

      // Temp canvas for downscaling
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = w;
      tempCanvas.height = h;
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return;

      tempCtx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(tempCanvas, 0, 0, w, h, 0, 0, width, height);
    }
  };

  const triggerIntroPixelation = () => {
    if (preloadedImages.length === 0) return;
    const img = preloadedImages[0];
    let currentScale = 30;

    const animate = () => {
      currentScale -= 1.0;
      pixelScale = Math.max(1, currentScale);
      drawProfile(img, pixelScale);

      if (currentScale > 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  // Run transition cycle every 6 seconds
  // setInterval(triggerProfileTransition, 6000); // Disabled auto profile transition

  /* ==========================================================================
     4. Spotlight Card Hover Effect (Event Delegation for Dynamic Cards)
     ========================================================================== */
  document.addEventListener("mousemove", (e) => {
    const card = e.target.closest(".project-card-wrapper");
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  });

};
