window.initModalModule = function () {
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
  const modalGithubBtn = document.getElementById("modal-github-btn");

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

  const showLogDetailPopup = (topic, details) => {
    const modalContainer = document.querySelector(".minimalist-modal-card");
    if (!modalContainer) return;

    let popup = document.getElementById("log-detail-popup");
    if (!popup) {
      popup = document.createElement("div");
      popup.id = "log-detail-popup";
      popup.className = "log-detail-popup";
      popup.style.pointerEvents = "none";
      popup.innerHTML = `
        <div class="log-detail-content">
          <button id="log-detail-close" class="log-detail-close">&times;</button>
          <h4 id="log-detail-title" class="log-detail-title"></h4>
          <p id="log-detail-body" class="log-detail-body"></p>
        </div>
      `;
      modalContainer.appendChild(popup);

      const closeBtn = popup.querySelector("#log-detail-close");
      if (closeBtn) {
        closeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          popup.classList.add("hidden");
        });
      }

      popup.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }

    const titleEl = popup.querySelector("#log-detail-title");
    const bodyEl = popup.querySelector("#log-detail-body");
    if (titleEl) titleEl.textContent = topic;
    if (bodyEl) bodyEl.textContent = details;

    popup.classList.remove("hidden");
  };

  // Event delegation on the projects grid for project card clicks
  document.body.addEventListener("click", (e) => {
    const card = e.target.closest(".project-card-wrapper");
    if (!card) return;

    // Pull dataset attributes
    const category = card.getAttribute("data-category") || "";
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
    const github = card.getAttribute("data-github") || "";
    const linkText = card.getAttribute("data-link-text") || "LAUNCH BUILD";

    // Set category theme attribute on the modal wrapper
    if (projectModal) {
      projectModal.setAttribute("data-theme-category", category);
    }

    // Bind data to modal elements
    if (modalTitle) modalTitle.textContent = title;
    if (modalSubtitle) modalSubtitle.textContent = subtitle;
    if (modalDescription) modalDescription.textContent = desc;

    if (modalStatEngine) modalStatEngine.textContent = engine;
    if (modalStatStage) modalStatStage.textContent = stage;
    if (modalStatTools) modalStatTools.textContent = tools;

    // Populate Dynamic System Architecture Diagram
    const modalExpertSection = document.getElementById("modal-expert-section");
    if (modalExpertSection) {
      // Parse topics from logs
      const topics = logs.map(log => {
        const colonIdx = log.indexOf(":");
        return colonIdx !== -1 ? log.slice(0, colonIdx).trim() : log;
      });

      let architectureHtml = "";
      if (category === "game-design") {
        architectureHtml = `
          <h5 class="modal-section-title">Game Design Architecture & Logic Flow</h5>
          <div class="game-flowchart">
            <!-- Row 1: Core Concept -->
            <div class="flowchart-row">
              <div class="flowchart-node root-node">${title}</div>
            </div>
            
            <!-- Connector Row -->
            <div class="flowchart-row">
              <div class="flowchart-connector-down">▼</div>
            </div>

            <!-- Row 2: Major Systems Split -->
            <div class="flowchart-row-split">
              <!-- Left Column: Wave System & Difficulty -->
              <div class="flowchart-col" style="flex: 1.2;">
                <div class="flowchart-node system-node">${topics[0] || 'Wave System'}</div>
                <div class="flowchart-connector-down">▼</div>
                <div class="flowchart-node system-node">${topics[1] || 'Difficulty Progression'}</div>
                <div class="flowchart-connector-down">▼</div>
                <div class="flowchart-split">
                  <div class="flowchart-col">
                    <div class="flowchart-node attr-node">❤️ HEALTH</div>
                    <div class="flowchart-node attr-node">⚡ SPEED</div>
                    <div class="flowchart-node attr-node">⚔️ DAMAGE</div>
                  </div>
                </div>
              </div>

              <!-- Middle Column: Entities (Player & Enemies) -->
              <div class="flowchart-col" style="flex: 2.2;">
                <div class="flowchart-node entity-node">Entities & Logic</div>
                <div class="flowchart-connector-down">▼</div>
                <div class="flowchart-split">
                  <!-- Player Branch -->
                  <div class="flowchart-col">
                    <div class="flowchart-node player-node">Player</div>
                    <div class="flowchart-connector-down">▼</div>
                    <div class="flowchart-node state-node circle">${topics[2] || 'States (animator)'}</div>
                    <div class="flowchart-connector-down">▼</div>
                    <div class="flowchart-diamond-grid">
                      <div class="flowchart-node diamond-node">Walk/Jump</div>
                      <div class="flowchart-node diamond-node">Dash</div>
                      <div class="flowchart-node diamond-node">Attack</div>
                      <div class="flowchart-node diamond-node">Slam</div>
                    </div>
                  </div>

                  <!-- Enemies Branch -->
                  <div class="flowchart-col">
                    <div class="flowchart-node enemy-node">Enemies</div>
                    <div class="flowchart-connector-down">▼</div>
                    <div class="flowchart-split">
                      <div class="flowchart-col">
                        <div class="flowchart-node behavior-node">Base Structure</div>
                        <div class="flowchart-connector-down">▼</div>
                        <div class="flowchart-node attr-node">Health</div>
                        <div class="flowchart-node attr-node">Damage</div>
                        <div class="flowchart-node attr-node">Speed</div>
                      </div>
                      <div class="flowchart-col">
                        <div class="flowchart-node behavior-node">Unique Behaviour</div>
                        <div class="flowchart-connector-down">▼</div>
                        <div class="flowchart-node attr-node">Attack type</div>
                        <div class="flowchart-node attr-node">Hitbox</div>
                        <div class="flowchart-node attr-node">Weapon</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column: Score System -->
              <div class="flowchart-col" style="flex: 1.2;">
                <div class="flowchart-node system-node">${topics[3] || 'Score System'}</div>
                <div class="flowchart-connector-down">▼</div>
                <div class="flowchart-node attr-node" style="font-size: 9px; line-height: 1.2;">${topics[4] || 'Score value varies by enemy type'}</div>
              </div>
            </div>
          </div>
        `;
      } else if (category === "game-art") {
        architectureHtml = `
          <h5 class="modal-section-title">3D Production Pipeline Architecture</h5>
          <div class="game-flowchart">
            <div class="flowchart-row">
              <div class="flowchart-node root-node">${title}</div>
            </div>
            <div class="flowchart-row"><div class="flowchart-connector-down">▼</div></div>
            <div class="flowchart-row">
              <div class="flowchart-node system-node">🎨 ${topics[0] || 'Concept Reference'}</div>
            </div>
            <div class="flowchart-row"><div class="flowchart-connector-down">▼</div></div>
            <div class="flowchart-row">
              <div class="flowchart-node entity-node">📐 ${topics[1] || 'Modeling'}</div>
            </div>
            <div class="flowchart-row"><div class="flowchart-connector-down">▼</div></div>
            <div class="flowchart-row">
              <div class="flowchart-node player-node">🗺️ ${topics[2] || 'UV / Texturing'}</div>
            </div>
            <div class="flowchart-row"><div class="flowchart-connector-down">▼</div></div>
            <div class="flowchart-row">
              <div class="flowchart-node enemy-node">🦴 ${topics[3] || 'Rigging & Export'}</div>
            </div>
          </div>
        `;
      } else {
        architectureHtml = `
          <h5 class="modal-section-title">System Web Architecture</h5>
          <div class="game-flowchart">
            <div class="flowchart-row">
              <div class="flowchart-node root-node">${title}</div>
            </div>
            <div class="flowchart-row"><div class="flowchart-connector-down">▼</div></div>
            <div class="flowchart-row">
              <div class="flowchart-node system-node">📱 ${topics[0] || 'Frontend UI'}</div>
            </div>
            <div class="flowchart-row"><div class="flowchart-connector-down">▲▼</div></div>
            <div class="flowchart-row">
              <div class="flowchart-node entity-node">⚙️ ${topics[1] || 'State / Controls'}</div>
            </div>
            <div class="flowchart-row"><div class="flowchart-connector-down">▲▼</div></div>
            <div class="flowchart-row">
              <div class="flowchart-node player-node">🔥 ${topics[2] || 'Logic & Integration'}</div>
            </div>
            <div class="flowchart-row"><div class="flowchart-connector-down">▲▼</div></div>
            <div class="flowchart-row">
              <div class="flowchart-node enemy-node">🚀 ${topics[3] || 'Deployment'}</div>
            </div>
          </div>
        `;
      }
      modalExpertSection.innerHTML = architectureHtml;
    }

    // Populate Logs
    if (modalLogTimeline) {
      modalLogTimeline.innerHTML = "";
      logs.forEach(log => {
        const colonIdx = log.indexOf(":");
        const topic = colonIdx !== -1 ? log.slice(0, colonIdx).trim() : log;
        const details = colonIdx !== -1 ? log.slice(colonIdx + 1).trim() : log;

        const item = document.createElement("div");
        item.className = "hud-log-item";
        item.innerHTML = `<div class="hud-log-dot"></div><div class="hud-log-text">${topic}</div>`;
        
        item.addEventListener("mouseenter", (e) => {
          e.stopPropagation();
          showLogDetailPopup(topic, details);
        });

        item.addEventListener("mouseleave", (e) => {
          e.stopPropagation();
          const logPopup = document.getElementById("log-detail-popup");
          if (logPopup) {
            logPopup.classList.add("hidden");
          }
        });

        modalLogTimeline.appendChild(item);
      });
      if (logs.length === 0) {
        modalLogTimeline.innerHTML = `<div class="hud-log-text" style="font-style:italic">No logs available for this project.</div>`;
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

    // View Repository Button
    if (github) {
      if (modalGithubBtn) {
        modalGithubBtn.classList.remove("hidden");
        modalGithubBtn.href = github;
      }
    } else {
      if (modalGithubBtn) {
        modalGithubBtn.classList.add("hidden");
      }
    }

    // Show/Hide CTAs Container depending on if there are links
    const modalCtasContainer = document.getElementById("modal-ctas-container");
    if (modalCtasContainer) {
      if (link || video || github) {
        modalCtasContainer.style.setProperty("display", "flex", "important");
      } else {
        modalCtasContainer.style.setProperty("display", "none", "important");
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

  // Modal Closures
  const closeModal = () => {
    if (projectModal) {
      projectModal.classList.add("hidden");
    }
    const logPopup = document.getElementById("log-detail-popup");
    if (logPopup) {
      logPopup.classList.add("hidden");
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
    } catch (e) {
      console.error("Error playing sound:", e);
    }
  };

  // Play sound on every click (DISABLED)
  /*
  document.body.addEventListener('click', () => {
    playSound(clickBuffer, 0.5);
  });
  */

  /*
  // Play sound on flat skill card hover with stability check
  let hoverSoundTimer = null;

  document.body.addEventListener('mouseover', (e) => {
    const skillCard = e.target.closest('.skill-card-flat');
    if (skillCard) {
      // Check if we entered the card from outside
      if (!skillCard.contains(e.relatedTarget)) {
        if (hoverSoundTimer) clearTimeout(hoverSoundTimer);

        // Wait 150ms to ensure the cursor is actually resting on the card
        hoverSoundTimer = setTimeout(() => {
          playSound(flipBuffer, 0.6);
        }, 150);
      }
    }
  });

  document.body.addEventListener('mouseout', (e) => {
    const skillCard = e.target.closest('.skill-card-flat');
    if (skillCard) {
      // Check if we are leaving the card entirely
      if (!skillCard.contains(e.relatedTarget)) {
        if (hoverSoundTimer) clearTimeout(hoverSoundTimer);
      }
    }
  });
  */

  // --- Custom Hire Interest Modal Handling ---
  const hireInterestBtn = document.getElementById("hire-interest-btn");
  const hireInterestModal = document.getElementById("hire-interest-modal");
  const hireCloseBtn = document.getElementById("hire-close-btn");
  const hireCancelBtn = document.getElementById("hire-cancel-btn");
  const hireSubmitBtn = document.getElementById("hire-submit-btn");
  const hireNameInput = document.getElementById("hire-name-input");
  const hireEmailInput = document.getElementById("hire-email-input");
  const hireLinkInput = document.getElementById("hire-link-input");
  const hireMessageInput = document.getElementById("hire-message-input");
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
      if (hireMessageInput) hireMessageInput.value = "";
      if (hireErrorMsg) hireErrorMsg.classList.add("hidden");
      
      // Slide in Trevor (left character)
      const charLeft = document.getElementById("gta-char-left");
      if (charLeft) charLeft.classList.add("active");
      const charRight = document.getElementById("gta-char-right");
      if (charRight) charRight.classList.remove("active");
    }
  };

  const closeHireModal = () => {
    if (hireInterestModal) hireInterestModal.classList.add("hidden");
    document.body.style.overflow = "unset";
    
    // Slide out both characters
    const charLeft = document.getElementById("gta-char-left");
    if (charLeft) charLeft.classList.remove("active");
    const charRight = document.getElementById("gta-char-right");
    if (charRight) charRight.classList.remove("active");
  };

  const submitHiringLead = () => {
    const val = hireNameInput ? hireNameInput.value.trim() : "";
    const emailVal = hireEmailInput ? hireEmailInput.value.trim() : "";
    const linkVal = hireLinkInput ? hireLinkInput.value.trim() : "";
    const messageVal = hireMessageInput ? hireMessageInput.value.trim() : "";
    
    if (!val) {
      if (hireErrorMsg) {
        hireErrorMsg.textContent = "❌ VALUE INGESTION ERROR: INVALID NAME";
        hireErrorMsg.classList.remove("hidden");
      }
      return;
    }

    // Temporarily disable submit button to show loading state
    if (hireSubmitBtn) {
      hireSubmitBtn.disabled = true;
      hireSubmitBtn.textContent = "[ UPLOADING... ]";
    }
    if (hireErrorMsg) {
      hireErrorMsg.classList.add("hidden");
    }

    const resetSubmitBtn = () => {
      if (hireSubmitBtn) {
        hireSubmitBtn.disabled = false;
        hireSubmitBtn.textContent = "[ INITIATE UPLOAD ]";
      }
    };

    // Save to local Telemetry database/session immediately
    if (window.Telemetry && typeof window.Telemetry.addHiringLead === 'function') {
      window.Telemetry.addHiringLead(val, emailVal, linkVal, messageVal);
      window.updateDashboardHiringUI();
    }

    // Web3Forms integration - Sends form details directly to your email
    const web3FormsKey = "df88249e-ff86-42b9-88b0-c3dd4e281d24";
    if (web3FormsKey && web3FormsKey !== "YOUR_ACCESS_KEY_HERE") {
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          access_key: web3FormsKey,
          name: val,
          email: emailVal,
          link: linkVal,
          subject: `New Lead: ${val} wants to connect!`,
          from_name: "Shoubhik's Portfolio"
        })
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            console.log("Web3Forms Success:", data);
            
            // Slide in the 2nd character (Michael)
            const charRight = document.getElementById("gta-char-right");
            if (charRight) {
              charRight.classList.add("active");
            }
            
            // Change submit button to gamified GTA Mission Passed feedback
            if (hireSubmitBtn) {
              hireSubmitBtn.textContent = "👍 MISSION PASSED!";
              hireSubmitBtn.style.background = "#ffea00";
              hireSubmitBtn.style.color = "#12051a";
              hireSubmitBtn.style.boxShadow = "0 0 25px #ffea00";
            }
            
            // Delay closing the modal to allow animations to show
            setTimeout(() => {
              closeHireModal();
              resetSubmitBtn();
              // Reset submit button inline overrides
              if (hireSubmitBtn) {
                hireSubmitBtn.style.background = "";
                hireSubmitBtn.style.color = "";
                hireSubmitBtn.style.boxShadow = "";
              }
            }, 3500);
            
            // Trigger Success Toast
            const successToast = document.getElementById("success-toast");
            if (successToast) {
              const bodyEl = successToast.querySelector(".cyber-toast-body");
              if (bodyEl) {
                bodyEl.textContent = "Your details were uploaded to Database and Email successfully!";
              }
              successToast.classList.add("show");
              if (window.successToastTimeout) clearTimeout(window.successToastTimeout);
              window.successToastTimeout = setTimeout(() => {
                successToast.classList.remove("show");
              }, 5000);
            }
          } else {
            console.error("Web3Forms Error Response:", data);
            if (hireErrorMsg) {
              hireErrorMsg.textContent = `❌ UPLOAD ERROR: ${data.message || "Invalid Key or Submission Limit Exceeded"}`;
              hireErrorMsg.classList.remove("hidden");
            }
            resetSubmitBtn();
          }
        })
        .catch(error => {
          console.error("Web3Forms Network Error:", error);
          if (hireErrorMsg) {
            hireErrorMsg.textContent = "❌ NETWORK ERROR: Failed to reach Web3Forms server";
            hireErrorMsg.classList.remove("hidden");
          }
          resetSubmitBtn();
        });
    } else {
      // Key not configured, just do success toast immediately
      closeHireModal();
      resetSubmitBtn();
      const successToast = document.getElementById("success-toast");
      if (successToast) {
        successToast.classList.add("show");
        if (window.successToastTimeout) clearTimeout(window.successToastTimeout);
        window.successToastTimeout = setTimeout(() => {
          successToast.classList.remove("show");
        }, 5000);
      }
    }
  };

  // --- Share Portfolio Event Trigger ---
  const sharePortfolioBtn = document.getElementById("share-portfolio-btn");
  if (sharePortfolioBtn) {
    sharePortfolioBtn.addEventListener("click", () => {
      const urlToShare = window.location.href;
      navigator.clipboard.writeText(urlToShare)
        .then(() => {
          const successToast = document.getElementById("success-toast");
          if (successToast) {
            const titleEl = successToast.querySelector(".cyber-toast-title");
            const bodyEl = successToast.querySelector(".cyber-toast-body");
            const originalTitle = titleEl ? titleEl.textContent : "SUBMISSION SUCCESSFUL";
            const originalBody = bodyEl ? bodyEl.textContent : "Your submission was successful! Shoubhik will reach out to you soon.";

            if (titleEl) titleEl.textContent = "LINK COPIED!";
            if (bodyEl) bodyEl.textContent = "Portfolio link has been copied to clipboard to share!";

            successToast.classList.add("show");
            if (window.successToastTimeout) clearTimeout(window.successToastTimeout);
            window.successToastTimeout = setTimeout(() => {
              successToast.classList.remove("show");
              setTimeout(() => {
                if (titleEl) titleEl.textContent = originalTitle;
                if (bodyEl) bodyEl.textContent = originalBody;
              }, 500);
            }, 4000);
          }

          fetch('/api/telemetry/share', { method: 'POST' })
            .catch(err => console.warn("Failed to log share event:", err));
        })
        .catch(err => console.error("Could not copy link:", err));
    });
  }

  if (hireInterestBtn) {
    hireInterestBtn.addEventListener("click", openHireModal);
  }
  const navHireBtn = document.getElementById("nav-hire-btn");
  if (navHireBtn) {
    navHireBtn.addEventListener("click", openHireModal);
  }
  const mobileNavHireBtn = document.getElementById("mobile-nav-hire-btn");
  if (mobileNavHireBtn) {
    mobileNavHireBtn.addEventListener("click", openHireModal);
  }
  if (hireCloseBtn) {
    hireCloseBtn.addEventListener("click", closeHireModal);
  }
  if (hireCancelBtn) {
    hireCancelBtn.addEventListener("click", closeHireModal);
  }
  if (hireSubmitBtn) {
    hireSubmitBtn.addEventListener("click", (e) => {
      e.preventDefault();
      submitHiringLead();
    });
  }
  const hireForm = document.getElementById("hire-form");
  if (hireForm) {
    hireForm.addEventListener("submit", (e) => {
      e.preventDefault();
      submitHiringLead();
    });
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

};
