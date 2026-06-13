document.addEventListener("DOMContentLoaded", () => {
  
  // Increment Real Server-Based Daily Active User (DAU) Counter
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const sessionKey = `portfolio_visited_${todayStr}`;
    if (!sessionStorage.getItem(sessionKey)) {
      fetch(`https://api.counterapi.dev/v1/shoubhik_portfolio/dau_${todayStr}/up`)
        .then(res => res.json())
        .then(() => {
          sessionStorage.setItem(sessionKey, "true");
        })
        .catch(err => console.warn("Error incrementing DAU:", err));
    }
  } catch (e) {
    console.warn("DAU tracking disabled or error:", e);
  }

  // Render dynamic components from data.js
  const renderSkills = () => {
    const skillsGrid = document.getElementById("skills-grid");
    if (!skillsGrid) return;
    
    skillsGrid.innerHTML = skillsData.map(skill => `
      <div class="skill-card-animated flip-card"
        style="--skill-color-from: ${skill.style.from}; --skill-color-to: ${skill.style.to}; --skill-border: ${skill.style.border}; --skill-text: ${skill.style.text};">
        <div class="flip-card-inner">
          <div class="flip-card-front">
            <h4 class="skill-name">${skill.name}</h4>
            <span class="skill-status ${skill.statusClass}">${skill.status}</span>
          </div>
          <div class="flip-card-back">
            <h4 class="skill-name">${skill.name}</h4>
            <ul class="subskills-list">
              ${skill.subskills.map(sub => `<li><span class="bullet ${skill.bulletClass}"></span>${sub}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    `).join('');
  };

  const renderProjects = () => {
    const gameDesignGrid = document.getElementById("game-design-grid");
    const immersiveXrGrid = document.getElementById("immersive-xr-grid");
    const gameArtGrid = document.getElementById("game-art-grid");

    const allProjects = [...gameProjectsData, ...webProjectsData];

    const createProjectCard = (proj) => `
      <div class="project-card-wrapper" 
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
        ${proj.video ? `data-video="${proj.video}"` : ''}>
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

    if (gameDesignGrid) {
      gameDesignGrid.innerHTML = allProjects
        .filter(proj => proj.category === "game-design")
        .map(createProjectCard)
        .join('');
    }

    if (immersiveXrGrid) {
      immersiveXrGrid.innerHTML = allProjects
        .filter(proj => proj.category === "immersive-xr")
        .map(createProjectCard)
        .join('');
    }

    if (gameArtGrid) {
      gameArtGrid.innerHTML = allProjects
        .filter(proj => proj.category === "game-art")
        .map(createProjectCard)
        .join('');
    }
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

  renderSkills();
  renderProjects();
  renderCertificates();

  /* ==========================================================================
     1. Navigation Scroll & Level Tracker
     ========================================================================== */
  const xpProgressBar = document.getElementById("tracker-xp-fill");
  const trackerLevelName = document.getElementById("tracker-level-name");
  const floatingTracker = document.getElementById("floating-tracker");

  const sectionNames = {
    "about": "LVL 1: About",
    "skills": "LVL 2: Skills",
    "education": "LVL 3: Edu",
    "projects": "LVL 4: Projects",
    "certificates": "LVL 5: Awards"
  };

  // Intersection Observer for Active State
  const sections = document.querySelectorAll("section[id]");
  const observerOptions = {
    root: null,
    rootMargin: "-20% 0px -60% 0px",
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && trackerLevelName) {
        const lvlName = sectionNames[entry.target.id] || "LVL MAX";
        trackerLevelName.textContent = lvlName;
        if (window.Telemetry) {
          window.Telemetry.state.currentLevel = lvlName;
          window.Telemetry.logEvent(`Entered section: ${lvlName}`, 'info');
        }
      }
    });
  }, observerOptions);

  sections.forEach(sec => sectionObserver.observe(sec));

  let floatTrackerTimeout = null;

  // Scroll Progress Tracker
  const updateScrollProgress = () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    const progress = (window.scrollY / docHeight) * 100;
    
    if (xpProgressBar) {
      xpProgressBar.style.width = `${progress}%`;
    }

    // Hide while scrolling
    if (floatingTracker) {
      floatingTracker.classList.remove("show");
      if (floatTrackerTimeout) clearTimeout(floatTrackerTimeout);
      
      // Show when resting
      floatTrackerTimeout = setTimeout(() => {
        floatingTracker.classList.add("show");
      }, 400); // 400ms rest to pop out
    }
  };

  window.addEventListener("scroll", updateScrollProgress);
  setTimeout(() => {
    if (floatingTracker) floatingTracker.classList.add("show");
  }, 1000);

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
    "public/my photos/IMG_1506.jpg"
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
     4. Spotlight Card Hover Effect
     ========================================================================== */
  const spotlightCards = document.querySelectorAll(".spotlight-card");

  spotlightCards.forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty("--mouse-x", x);
      card.style.setProperty("--mouse-y", y);
    });

    card.addEventListener("mouseenter", () => {
      card.classList.add("hovered");
    });

    card.addEventListener("mouseleave", () => {
      card.classList.remove("hovered");
    });
  });



  /* ==========================================================================
     6. Project Details Modals & Slider Control (Gamer HUD)
     ========================================================================== */
  const projectModal = document.getElementById("project-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalSubtitle = document.getElementById("modal-subtitle");
  const modalDescription = document.getElementById("modal-description");
  
  const modalStatEngine = document.getElementById("modal-stat-engine");
  const modalStatComplexity = document.getElementById("modal-stat-complexity");
  const modalStatStage = document.getElementById("modal-stat-stage");
  const modalStatTools = document.getElementById("modal-stat-tools");
  const modalLogTimeline = document.getElementById("modal-log-timeline");

  const modalVisitBtn = document.getElementById("modal-visit-btn");
  const modalVideoBtn = document.getElementById("modal-video-btn");

  const modalSlidesWrapper = document.getElementById("modal-slides-wrapper");
  const modalDotsContainer = document.getElementById("modal-dots-container");
  
  const modalPrevBtn = document.getElementById("modal-prev-btn");
  const modalNextBtn = document.getElementById("modal-next-btn");
  const modalCloseBtn = document.getElementById("modal-close-btn");

  let projectImagesList = [];
  let currentSliderIdx = 0;

  const updateSliderView = () => {
    const slides = document.querySelectorAll(".modal-slide");
    const dots = document.querySelectorAll(".slider-dot");

    slides.forEach((slide, idx) => {
      if (idx === currentSliderIdx) {
        slide.classList.add("active");
      } else {
        slide.classList.remove("active");
      }
    });

    dots.forEach((dot, idx) => {
      if (idx === currentSliderIdx) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
  };

  const handleNextSlide = (e) => {
    if (e) e.stopPropagation();
    if (projectImagesList.length <= 1) return;
    currentSliderIdx = (currentSliderIdx + 1) % projectImagesList.length;
    updateSliderView();
  };

  const handlePrevSlide = (e) => {
    if (e) e.stopPropagation();
    if (projectImagesList.length <= 1) return;
    currentSliderIdx = (currentSliderIdx - 1 + projectImagesList.length) % projectImagesList.length;
    updateSliderView();
  };

  const projectWrappers = document.querySelectorAll(".project-card-wrapper");

  projectWrappers.forEach(card => {
    card.addEventListener("click", () => {
      // Pull dataset attributes
      const title = card.getAttribute("data-title") || "";
      const subtitle = card.getAttribute("data-subtitle") || "";
      const desc = card.getAttribute("data-desc") || "";
      const images = (card.getAttribute("data-images") || "").split(",").filter(i => i.trim() !== "");
      const engine = card.getAttribute("data-engine") || "N/A";
      const complexity = card.getAttribute("data-complexity") || "N/A";
      const stage = card.getAttribute("data-stage") || "N/A";
      const tools = card.getAttribute("data-tools") || "N/A";
      const logs = (card.getAttribute("data-logs") || "").split("|").filter(l => l.trim() !== "");
      
      const link = card.getAttribute("data-link") || "";
      const video = card.getAttribute("data-video");
      const linkText = card.getAttribute("data-link-text") || "LAUNCH BUILD";

      // Bind data to modal elements
      if (modalTitle) modalTitle.textContent = title;
      if (modalSubtitle) modalSubtitle.textContent = subtitle;
      if (modalDescription) modalDescription.textContent = desc;

      if (modalStatEngine) modalStatEngine.textContent = engine;
      if (modalStatComplexity) modalStatComplexity.textContent = complexity;
      if (modalStatStage) modalStatStage.textContent = stage;
      if (modalStatTools) modalStatTools.textContent = tools;

      // Populate Logs
      if (modalLogTimeline) {
        modalLogTimeline.innerHTML = "";
        logs.forEach(log => {
          const item = document.createElement("div");
          item.className = "hud-log-item";
          item.innerHTML = `<div class="hud-log-dot"></div><div class="hud-log-text">${log}</div>`;
          modalLogTimeline.appendChild(item);
        });
        if (logs.length === 0) {
          modalLogTimeline.innerHTML = `<div class="hud-log-text" style="font-style:italic">No logs available for this file.</div>`;
        }
      }

      // Primary Link (Visit / Play / ArtStation)
      if (link) {
        if (modalVisitBtn) {
          modalVisitBtn.classList.remove("hidden");
          modalVisitBtn.href = link;
          modalVisitBtn.textContent = linkText;
        }
      } else {
        if (modalVisitBtn) {
          modalVisitBtn.classList.add("hidden");
        }
      }

      // Watch Video Button
      if (video) {
        if (modalVideoBtn) {
          modalVideoBtn.classList.remove("hidden");
          modalVideoBtn.href = video;
        }
      } else {
        if (modalVideoBtn) {
          modalVideoBtn.classList.add("hidden");
        }
      }

      // Setup Image Slider structures
      projectImagesList = images;
      currentSliderIdx = 0;

      if (modalSlidesWrapper) {
        modalSlidesWrapper.innerHTML = "";
        images.forEach((imgSrc, idx) => {
          const slideDiv = document.createElement("div");
          slideDiv.className = `modal-slide ${idx === 0 ? "active" : ""}`;
          slideDiv.innerHTML = `<img src="${imgSrc}" alt="${title} Image ${idx + 1}">`;
          modalSlidesWrapper.appendChild(slideDiv);
        });
      }

      // Dots indicators setup
      if (modalDotsContainer) {
        modalDotsContainer.innerHTML = "";
        if (images.length > 1) {
          images.forEach((_, idx) => {
            const dot = document.createElement("button");
            dot.className = `slider-dot ${idx === 0 ? "active" : ""}`;
            dot.addEventListener("click", (e) => {
              e.stopPropagation();
              currentSliderIdx = idx;
              updateSliderView();
            });
            modalDotsContainer.appendChild(dot);
          });
          modalPrevBtn.classList.remove("hidden");
          modalNextBtn.classList.remove("hidden");
        } else {
          modalPrevBtn.classList.add("hidden");
          modalNextBtn.classList.add("hidden");
        }
      }

      // Show Modal
      if (projectModal) {
        projectModal.classList.remove("hidden");
        document.body.style.overflow = "hidden"; // Freeze scroll
      }
    });
  });

  // Modal Closures
  const closeModal = () => {
    if (projectModal) {
      projectModal.classList.add("hidden");
    }
    document.body.style.overflow = "unset"; // Thaw scroll
  };

  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
  if (projectModal) projectModal.addEventListener("click", (e) => {
    if (e.target === projectModal) closeModal();
  });

  if (modalNextBtn) modalNextBtn.addEventListener("click", handleNextSlide);
  if (modalPrevBtn) modalPrevBtn.addEventListener("click", handlePrevSlide);

  /* ==========================================================================
     6. Certificate Ticker Lightbox Zoom
     ========================================================================== */
  const tickerItems = document.querySelectorAll(".ticker-item");
  const lightboxModal = document.getElementById("lightbox-modal");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCloseBtn = document.getElementById("lightbox-close-btn");

  tickerItems.forEach(item => {
    item.addEventListener("click", () => {
      const src = item.getAttribute("data-src");
      const alt = item.getAttribute("data-alt");
      
      if (lightboxImg) {
        lightboxImg.src = src;
        lightboxImg.alt = alt;
      }
      
      if (lightboxModal) {
        lightboxModal.classList.remove("hidden");
      }
      document.body.style.overflow = "hidden";
    });
  });

  const closeLightbox = () => {
    if (lightboxModal) {
      lightboxModal.classList.add("hidden");
    }
    document.body.style.overflow = "unset";
  };

  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener("click", closeLightbox);
  if (lightboxModal) lightboxModal.addEventListener("click", closeLightbox);

  /* ==========================================================================
     7. General Keyboard Accessibility (Escape Key Close)
     ========================================================================== */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
      closeLightbox();
    }
  });

  /* ==========================================================================
     8. Audio Engine (Global Clicks - Zero Latency)
     ========================================================================== */
  
  let audioCtx = null;
  let clickBuffer = null;
  let flipBuffer = null;

  // Preload and decode the MP3s into memory immediately
  const loadAudioFiles = async () => {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      const [clickRes, flipRes] = await Promise.all([
        fetch('./universfield-computer-mouse-click-352734.mp3'),
        fetch('./freesound_community-page-flip-99838.mp3')
      ]);
      
      const [clickArr, flipArr] = await Promise.all([
        clickRes.arrayBuffer(),
        flipRes.arrayBuffer()
      ]);
      
      clickBuffer = await audioCtx.decodeAudioData(clickArr);
      flipBuffer = await audioCtx.decodeAudioData(flipArr);
      
      // Attempt to play a startup sound
      // Note: Browsers may block this unless the user has already interacted with the domain!
      playSound(clickBuffer, 0.5);
    } catch (err) {
      console.error("Failed to preload audio:", err);
    }
  };

  // Start preloading immediately
  loadAudioFiles();

  const playSound = (buffer, volume = 0.5) => {
    if (!audioCtx || !buffer) return;
    
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    try {
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = volume;
      
      source.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      source.start(0);
    } catch(e) {
      console.error("Error playing sound:", e);
    }
  };

  // Play sound on every click
  document.body.addEventListener('click', () => {
    playSound(clickBuffer, 0.5);
  });

  // Play sound on flip card hover with stability check
  let hoverSoundTimer = null;
  
  document.body.addEventListener('mouseover', (e) => {
    const flipCard = e.target.closest('.flip-card');
    if (flipCard) {
      // Check if we entered the card from outside
      if (!flipCard.contains(e.relatedTarget)) {
        if (hoverSoundTimer) clearTimeout(hoverSoundTimer);
        
        // Wait 150ms to ensure the cursor is actually resting on the card
        hoverSoundTimer = setTimeout(() => {
          playSound(flipBuffer, 0.6);
        }, 150);
      }
    }
  });

  document.body.addEventListener('mouseout', (e) => {
    const flipCard = e.target.closest('.flip-card');
    if (flipCard) {
      // Check if we are leaving the card entirely
      if (!flipCard.contains(e.relatedTarget)) {
        if (hoverSoundTimer) clearTimeout(hoverSoundTimer);
      }
    }
  });

  const questCard = document.querySelector('.quest-card');

  // Logic to wait until scroll "rests" before animating
  const inViewElements = new Set();
  
  const visibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        inViewElements.add(entry.target);
      } else {
        inViewElements.delete(entry.target);
      }
    });
  }, { threshold: 0.2 });

  if (questCard) visibilityObserver.observe(questCard);

  let scrollRestTimeout = null;
  
  const triggerRestAnimations = () => {
    inViewElements.forEach(el => {
      // Trigger quest card reveal
      if (el.classList.contains('quest-card') && !el.classList.contains('revealed')) {
        el.classList.add('revealed');
      }
    });
  };

  // Listen to scroll to detect when user stops
  window.addEventListener('scroll', () => {
    if (scrollRestTimeout) clearTimeout(scrollRestTimeout);
    scrollRestTimeout = setTimeout(triggerRestAnimations, 400); // 400ms "rest" period
  });

  // Initial check in case they load directly into a section without scrolling
  setTimeout(triggerRestAnimations, 1000);

  // --- Owner Security Dashboard Link Redirect ---
  const ownerSecretBtn = document.getElementById("owner-secret-btn");
  if (ownerSecretBtn) {
    ownerSecretBtn.addEventListener("click", () => {
      window.location.href = "security.html";
    });
  }

  // --- Hiring Leads UI Updates ---
  window.updateDashboardHiringUI = () => {
    const listContainer = document.getElementById("dash-hire-list");
    const countEl = document.getElementById("dash-hire-count");
    if (!listContainer || !countEl || !window.Telemetry) return;
    
    const leads = window.Telemetry.state.hiringLeads || [];
    countEl.textContent = leads.length;
    
    if (leads.length === 0) {
      listContainer.innerHTML = `<div style="font-style:italic; color:#94a3b8; padding:8px 0; text-align:center;">No leads registered.</div>`;
    } else {
      listContainer.innerHTML = leads.map((lead, idx) => `
        <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:6px; padding:6px 8px; display:flex; justify-content:space-between; align-items:center; gap:6px;">
          <div style="display:flex; flex-direction:column; gap:2px; max-width:85%;">
            <div style="font-weight:bold; color:#22c55e; word-break:break-all;">${lead.name}</div>
            ${lead.email ? `<div style="font-size:9px; color:#38bdf8; word-break:break-all;">📧 ${lead.email}</div>` : ''}
            ${lead.companyLink ? `<div style="font-size:9px; color:#fbbf24; word-break:break-all;">🔗 <a href="${lead.companyLink.startsWith('http') ? lead.companyLink : 'https://' + lead.companyLink}" target="_blank" rel="noopener noreferrer" style="color:#fbbf24; text-decoration:underline;">${lead.companyLink}</a></div>` : ''}
            <div style="font-size:8px; color:#94a3b8;">${lead.timestamp}</div>
          </div>
          <button onclick="window.Telemetry.deleteHiringLead('${lead.id || idx}')" style="background:transparent; border:none; color:#ef4444; font-size:11px; cursor:pointer; padding:4px;" title="Delete Lead">🗑️</button>
        </div>
      `).join("");
    }
  };

  // --- Custom Hire Interest Modal Handling ---
  const hireInterestBtn = document.getElementById("hire-interest-btn");
  const hireInterestModal = document.getElementById("hire-interest-modal");
  const hireCloseBtn = document.getElementById("hire-close-btn");
  const hireCancelBtn = document.getElementById("hire-cancel-btn");
  const hireSubmitBtn = document.getElementById("hire-submit-btn");
  const hireNameInput = document.getElementById("hire-name-input");
  const hireEmailInput = document.getElementById("hire-email-input");
  const hireLinkInput = document.getElementById("hire-link-input");
  const hireErrorMsg = document.getElementById("hire-error-msg");

  const openHireModal = () => {
    if (hireInterestModal) {
      hireInterestModal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
      if (hireNameInput) {
        hireNameInput.value = "";
        hireNameInput.focus();
      }
      if (hireEmailInput) hireEmailInput.value = "";
      if (hireLinkInput) hireLinkInput.value = "";
      if (hireErrorMsg) hireErrorMsg.classList.add("hidden");
    }
  };

  const closeHireModal = () => {
    if (hireInterestModal) hireInterestModal.classList.add("hidden");
    document.body.style.overflow = "unset";
  };

  const submitHiringLead = async () => {
    const val = hireNameInput ? hireNameInput.value.trim() : "";
    const emailVal = hireEmailInput ? hireEmailInput.value.trim() : "";
    const linkVal = hireLinkInput ? hireLinkInput.value.trim() : "";
    if (!val) {
      if (hireErrorMsg) hireErrorMsg.classList.remove("hidden");
      return;
    }

    if (hireSubmitBtn) {
      hireSubmitBtn.disabled = true;
      hireSubmitBtn.textContent = "SUBMITTING...";
    }

    try {
      if (window.Telemetry && typeof window.Telemetry.addHiringLead === 'function') {
        await window.Telemetry.addHiringLead(val, emailVal, linkVal);
        if (typeof window.updateDashboardHiringUI === 'function') {
          window.updateDashboardHiringUI();
        }
      }
      closeHireModal();

      const successToast = document.getElementById("success-toast");
      if (successToast) {
        successToast.classList.add("show");
        if (window.successToastTimeout) clearTimeout(window.successToastTimeout);
        window.successToastTimeout = setTimeout(() => {
          successToast.classList.remove("show");
        }, 5000);
      }
    } catch (err) {
      if (hireErrorMsg) {
        hireErrorMsg.textContent = "SUBMISSION FAILED. PLEASE TRY AGAIN.";
        hireErrorMsg.classList.remove("hidden");
      }
    } finally {
      if (hireSubmitBtn) {
        hireSubmitBtn.disabled = false;
        hireSubmitBtn.textContent = "SUBMIT";
      }
    }
  };

  if (hireInterestBtn) {
    hireInterestBtn.addEventListener("click", openHireModal);
  }
  if (hireCloseBtn) {
    hireCloseBtn.addEventListener("click", closeHireModal);
  }
  if (hireCancelBtn) {
    hireCancelBtn.addEventListener("click", closeHireModal);
  }
  if (hireSubmitBtn) {
    hireSubmitBtn.addEventListener("click", submitHiringLead);
  }
  if (hireNameInput) {
    hireNameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submitHiringLead();
    });
  }
  if (hireEmailInput) {
    hireEmailInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submitHiringLead();
    });
  }
  if (hireLinkInput) {
    hireLinkInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submitHiringLead();
    });
  }

  // Start background ticker for session time / real-time updates (runs only when modal is active)
  setInterval(() => {
    if (ownerDashboardModal && !ownerDashboardModal.classList.contains("hidden")) {
      refreshDashboardTelemetry();
      const timeFilter = document.getElementById("graph-time-filter");
      if (timeFilter && timeFilter.value === "live") {
        updateTrafficChart("live");
      }
    }
  }, 1000);

});
