document.addEventListener("DOMContentLoaded", () => {
  
  /* ==========================================================================
     1. Navigation Scroll & Level Tracker
     ========================================================================== */
  const xpProgressBar = document.getElementById("xp-progress-bar");
  const navLevel = document.getElementById("nav-level");
  const navBtns = document.querySelectorAll(".nav-btn");

  // Smooth Scroll
  navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-scroll");
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // Scroll Progress Tracker
  const updateScrollProgress = () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    const progress = (window.scrollY / docHeight) * 100;
    
    if (xpProgressBar) {
      xpProgressBar.style.width = `${progress}%`;
    }

    if (navLevel) {
      if (progress < 25) {
        navLevel.textContent = "LVL 1";
      } else if (progress < 55) {
        navLevel.textContent = "LVL 2";
      } else if (progress < 80) {
        navLevel.textContent = "LVL 3";
      } else {
        navLevel.textContent = "MAX LVL";
      }
    }
  };

  window.addEventListener("scroll", updateScrollProgress);
  updateScrollProgress(); // Initial run

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
    "public/my photos/IMG_1506.jpg",
    "public/my photos/WhatsApp Image 2026-06-07 at 9.59.14 PM.jpeg",
    "public/my photos/WhatsApp Image 2026-06-07 at 9.59.15 PM(1).jpeg",
  ];

  const profileCanvas = document.getElementById("profile-canvas");
  const preloadedImages = [];
  let currentPhotoIdx = 0;
  let pixelScale = 1;
  let isTransitioning = false;

  // Preload profile photos
  photoPaths.forEach(src => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      preloadedImages.push(img);
      // Draw first image on load
      if (preloadedImages.length === 1) {
        drawProfile(img, 1);
      }
    };
  });

  const drawProfile = (img, scale) => {
    if (!profileCanvas) return;
    const ctx = profileCanvas.getContext("2d");
    if (!ctx) return;

    // Set canvas display size dynamically based on its offset dimensions!
    const width = profileCanvas.clientWidth || 400;
    const height = profileCanvas.clientHeight || 400;
    
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

  const triggerProfileTransition = () => {
    if (isTransitioning || preloadedImages.length === 0) return;
    isTransitioning = true;

    let currentScale = 1;
    let scalingUp = true;

    const animate = () => {
      const activeImg = preloadedImages[currentPhotoIdx];
      
      if (scalingUp) {
        currentScale += 1.5;
        pixelScale = currentScale;
        drawProfile(activeImg, pixelScale);

        if (currentScale >= 28) {
          scalingUp = false;
          // Switch to next image at maximum pixelation
          currentPhotoIdx = (currentPhotoIdx + 1) % preloadedImages.length;
        }
        requestAnimationFrame(animate);
      } else {
        currentScale -= 1.5;
        pixelScale = currentScale;
        const nextImg = preloadedImages[currentPhotoIdx];
        drawProfile(nextImg, pixelScale);

        if (currentScale <= 1) {
          pixelScale = 1;
          drawProfile(nextImg, 1);
          isTransitioning = false;
        } else {
          requestAnimationFrame(animate);
        }
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
     5. Project Details Modals & Slider Control
     ========================================================================== */
  const projectModal = document.getElementById("project-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalSubtitle = document.getElementById("modal-subtitle");
  const modalDescription = document.getElementById("modal-description");
  const modalHighlights = document.getElementById("modal-highlights");
  const modalTags = document.getElementById("modal-tags");
  
  const modalVisitBtn = document.getElementById("modal-visit-btn");
  const modalVideoBtn = document.getElementById("modal-video-btn");
  const modalSecondaryLink = document.getElementById("modal-secondary-link");
  const modalLinksBlock = document.getElementById("modal-links-block");

  const modalSlidesWrapper = document.getElementById("modal-slides-wrapper");
  const modalDotsContainer = document.getElementById("modal-dots-container");
  
  const modalPrevBtn = document.getElementById("modal-prev-btn");
  const modalNextBtn = document.getElementById("modal-next-btn");
  const modalCloseBtn = document.getElementById("modal-close-btn");

  // Instagram specific elements
  const instaLikeBtn = document.getElementById("insta-like-btn");
  const instaHeartIcon = document.getElementById("insta-heart-icon");
  const instaLikesCount = document.getElementById("insta-likes-count");
  const instaSaveBtn = document.getElementById("insta-save-btn");
  const instaSaveIcon = document.getElementById("insta-save-icon");
  const instaShareBtn = document.getElementById("insta-share-btn");
  const instaShareTooltip = document.getElementById("insta-share-tooltip");
  const instaCommentFocusBtn = document.getElementById("insta-comment-focus-btn");
  const instaCommentInput = document.getElementById("insta-comment-input");
  const instaCommentPostBtn = document.getElementById("insta-comment-post-btn");

  let projectImagesList = [];
  let currentSliderIdx = 0;
  let activeProjectLink = "";
  let baseLikeCount = 1420;
  let isCurrentlyLiked = false;

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

  // Setup click listeners on all project cards
  const projectWrappers = document.querySelectorAll(".project-card-wrapper");
  const mockUsers = ["unreal_dev", "3d_sculptor", "game_critic_x", "level_master", "viewport_fan", "polygon_chief", "pixel_wizard"];

  projectWrappers.forEach(card => {
    card.addEventListener("click", () => {
      // Pull dataset attributes
      const title = card.getAttribute("data-title");
      const subtitle = card.getAttribute("data-subtitle");
      const desc = card.getAttribute("data-desc");
      const longDescItems = card.getAttribute("data-long-desc").split("|");
      const images = card.getAttribute("data-images").split(",");
      const tags = card.getAttribute("data-tags").split(",");
      const link = card.getAttribute("data-link") || "";
      const video = card.getAttribute("data-video");
      const linkText = card.getAttribute("data-link-text") || "Visit Site";

      activeProjectLink = link;

      // Bind data to modal elements
      if (modalTitle) modalTitle.textContent = title;
      if (modalSubtitle) modalSubtitle.textContent = subtitle;
      if (modalDescription) modalDescription.textContent = desc;

      // Reset Instagram micro-interaction states
      isCurrentlyLiked = false;
      if (instaHeartIcon) {
        instaHeartIcon.classList.remove("liked");
      }
      baseLikeCount = Math.floor(Math.random() * 500) + 800; // Randomize likes count for realism
      if (instaLikesCount) {
        instaLikesCount.innerHTML = `<b>${baseLikeCount.toLocaleString()} likes</b>`;
      }
      if (instaSaveIcon) {
        instaSaveIcon.classList.remove("saved");
        instaSaveIcon.setAttribute("fill", "none");
      }
      if (instaCommentInput) {
        instaCommentInput.value = "";
      }
      if (instaCommentPostBtn) {
        instaCommentPostBtn.classList.add("disabled");
      }

      // Populate Highlights List (recreated as Mock Comments)
      if (modalHighlights) {
        modalHighlights.innerHTML = "";
        longDescItems.forEach((item, idx) => {
          const commentDiv = document.createElement("div");
          commentDiv.className = "insta-comment-item";
          const username = mockUsers[idx % mockUsers.length];
          commentDiv.innerHTML = `<span class="insta-comment-user">${username}</span><span class="insta-comment-text">${item}</span>`;
          modalHighlights.appendChild(commentDiv);
        });
      }

      // Populate Skills Tags (recreated as Hashtags)
      if (modalTags) {
        modalTags.innerHTML = "";
        tags.forEach(tag => {
          const a = document.createElement("a");
          a.className = "insta-comment-tag";
          a.href = "#";
          a.textContent = `#${tag.replace(/\s+/g, "")} `;
          a.addEventListener("click", (e) => e.preventDefault());
          modalTags.appendChild(a);
        });
      }

      // Primary Link (Visit / Play / ArtStation)
      if (link) {
        if (modalVisitBtn) {
          modalVisitBtn.classList.remove("hidden");
          modalVisitBtn.href = link;
          modalVisitBtn.textContent = linkText;
        }
        if (modalSecondaryLink) {
          modalSecondaryLink.href = link;
        }
        if (modalLinksBlock) {
          modalLinksBlock.classList.remove("hidden");
        }
      } else {
        if (modalVisitBtn) {
          modalVisitBtn.classList.add("hidden");
        }
        if (modalLinksBlock) {
          modalLinksBlock.classList.add("hidden");
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
      projectModal.classList.remove("hidden");
      document.body.style.overflow = "hidden"; // Freeze scroll
    });
  });

  // Like Toggle Micro-Interaction
  const toggleLike = () => {
    isCurrentlyLiked = !isCurrentlyLiked;
    if (isCurrentlyLiked) {
      if (instaHeartIcon) instaHeartIcon.classList.add("liked");
      if (instaLikesCount) instaLikesCount.innerHTML = `<b>${(baseLikeCount + 1).toLocaleString()} likes</b>`;
    } else {
      if (instaHeartIcon) instaHeartIcon.classList.remove("liked");
      if (instaLikesCount) instaLikesCount.innerHTML = `<b>${baseLikeCount.toLocaleString()} likes</b>`;
    }
  };

  if (instaLikeBtn) {
    instaLikeBtn.addEventListener("click", toggleLike);
  }

  // Double Click Image to Like
  if (modalSlidesWrapper) {
    modalSlidesWrapper.addEventListener("dblclick", (e) => {
      // Trigger like if not already liked
      if (!isCurrentlyLiked) {
        toggleLike();
      }

      // Create a floating heart overlay animation
      const rect = modalSlidesWrapper.getBoundingClientRect();
      const heartOverlay = document.createElement("div");
      heartOverlay.innerHTML = `
        <svg viewBox="0 0 24 24" fill="#ffffff" stroke="none" style="width: 80px; height: 80px; filter: drop-shadow(0 0 10px rgba(0,0,0,0.5));">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      `;
      heartOverlay.style.position = "absolute";
      heartOverlay.style.top = "50%";
      heartOverlay.style.left = "50%";
      heartOverlay.style.transform = "translate(-50%, -50%) scale(0)";
      heartOverlay.style.transition = "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s";
      heartOverlay.style.zIndex = "40";
      heartOverlay.style.pointerEvents = "none";
      
      modalSlidesWrapper.appendChild(heartOverlay);
      
      // Force layout recalculation and animate
      setTimeout(() => {
        heartOverlay.style.transform = "translate(-50%, -50%) scale(1)";
      }, 10);

      // Fade out and remove
      setTimeout(() => {
        heartOverlay.style.opacity = "0";
        heartOverlay.style.transform = "translate(-50%, -50%) scale(0.8)";
      }, 700);

      setTimeout(() => {
        heartOverlay.remove();
      }, 1100);
    });
  }

  // Save/Bookmark Micro-Interaction
  if (instaSaveBtn) {
    instaSaveBtn.addEventListener("click", () => {
      const isSaved = instaSaveIcon.classList.toggle("saved");
      if (isSaved) {
        instaSaveIcon.setAttribute("fill", "#ffffff");
      } else {
        instaSaveIcon.setAttribute("fill", "none");
      }
    });
  }

  // Share Copy Micro-Interaction
  if (instaShareBtn) {
    instaShareBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const shareUrl = activeProjectLink || window.location.href;
      
      navigator.clipboard.writeText(shareUrl).then(() => {
        if (instaShareTooltip) {
          instaShareTooltip.classList.remove("hidden");
          setTimeout(() => {
            instaShareTooltip.classList.add("hidden");
          }, 2000);
        }
      }).catch(err => {
        console.error("Could not copy link: ", err);
      });
    });
  }

  // Comment Bar Input Focus
  if (instaCommentFocusBtn) {
    instaCommentFocusBtn.addEventListener("click", () => {
      if (instaCommentInput) {
        instaCommentInput.focus();
      }
    });
  }

  // Enable/Disable Post button based on text
  if (instaCommentInput) {
    instaCommentInput.addEventListener("input", () => {
      const text = instaCommentInput.value.trim();
      if (text.length > 0) {
        instaCommentPostBtn.classList.remove("disabled");
      } else {
        instaCommentPostBtn.classList.add("disabled");
      }
    });

    instaCommentInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        postComment();
      }
    });
  }

  const postComment = () => {
    const text = instaCommentInput.value.trim();
    if (text.length === 0) return;

    if (modalHighlights) {
      const userComment = document.createElement("div");
      userComment.className = "insta-comment-item";
      userComment.innerHTML = `<span class="insta-comment-user">visitor_user</span><span class="insta-comment-text">${text}</span>`;
      
      modalHighlights.appendChild(userComment);
      instaCommentInput.value = "";
      instaCommentPostBtn.classList.add("disabled");

      // Scroll list to bottom
      const scrollParent = modalHighlights.parentElement;
      if (scrollParent) {
        setTimeout(() => {
          scrollParent.scrollTop = scrollParent.scrollHeight;
        }, 50);
      }
    }
  };

  if (instaCommentPostBtn) {
    instaCommentPostBtn.addEventListener("click", postComment);
  }

  // Modal Closures
  const closeModal = () => {
    if (projectModal) {
      projectModal.classList.add("hidden");
    }
    document.body.style.overflow = "unset"; // Thaw scroll
  };

  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
  if (projectModal) projectModal.addEventListener("click", closeModal);

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

});
