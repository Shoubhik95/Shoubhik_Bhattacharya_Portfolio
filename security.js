document.addEventListener("DOMContentLoaded", () => {
  const passcodeScreen = document.getElementById("passcode-screen");
  const dashboardScreen = document.getElementById("dashboard-screen");
  
  const ownerPasscodeInput = document.getElementById("owner-passcode-input");
  const ownerPasscodeSubmit = document.getElementById("owner-passcode-submit");
  const passcodeErrorMsg = document.getElementById("passcode-error-msg");
  
  const ownerExportBtn = document.getElementById("owner-export-btn");
  
  const logLegendTrigger = document.getElementById("log-legend-trigger");
  const logLegendBox = document.getElementById("log-legend-box");
  const graphTimeFilter = document.getElementById("graph-time-filter");
  const graphSegmentFilter = document.getElementById("graph-segment-filter");

  // OTP Verification Selectors
  const passcodeAuthSection = document.getElementById("passcode-auth-section");
  const lockoutWarningSection = document.getElementById("lockout-warning-section");
  const generateOtpBtn = document.getElementById("generate-otp-btn");
  const lockoutOtpInput = document.getElementById("lockout-otp-input");
  const verifyOtpBtn = document.getElementById("verify-otp-btn");
  const otpStatusMsg = document.getElementById("otp-status-msg");

  // Sidebar Tab Switching Selectors
  const navReports = document.getElementById("nav-reports");
  const navNetlify = document.getElementById("nav-netlify");
  const reportsPanel = document.getElementById("reports-panel");
  const netlifyPanel = document.getElementById("netlify-panel");
  const panelTitle = document.getElementById("panel-title");
  const panelSubtitle = document.getElementById("panel-subtitle");

  // Forgot Passcode / Reset Selectors
  const forgotPasscodeLink = document.getElementById("forgot-passcode-link");
  const resetPasscodeSection = document.getElementById("reset-passcode-section");
  const resetGenerateOtpBtn = document.getElementById("reset-generate-otp-btn");
  const resetOtpFields = document.getElementById("reset-otp-fields");
  const resetOtpInput = document.getElementById("reset-otp-input");
  const newPasscodeInput = document.getElementById("new-passcode-input");
  const confirmPasscodeInput = document.getElementById("confirm-passcode-input");
  const resetSubmitBtn = document.getElementById("reset-submit-btn");
  const resetCancelBtn = document.getElementById("reset-cancel-btn");
  const resetStatusMsg = document.getElementById("reset-status-msg");

  let failedAttempts = parseInt(localStorage.getItem("failed_auth_attempts") || "0");

  const isOwnerAuthenticated = () => {
    return sessionStorage.getItem("portfolio_owner_authenticated") === "true";
  };

  const isLockoutActive = () => {
    return localStorage.getItem("portfolio_lockout_active") === "true";
  };

  const triggerLockout = () => {
    localStorage.setItem("portfolio_lockout_active", "true");
    if (passcodeAuthSection) passcodeAuthSection.classList.add("hidden");
    if (resetPasscodeSection) resetPasscodeSection.classList.add("hidden");
    if (lockoutWarningSection) lockoutWarningSection.classList.remove("hidden");
    if (window.Telemetry) window.Telemetry.logEvent("SECURITY LOCKOUT ACTIVE: PANEL ACCESSIBILITY REVOKED", "alert");
  };

  const showPasscodeView = () => {
    if (passcodeScreen) passcodeScreen.classList.remove("hidden");
    if (dashboardScreen) dashboardScreen.classList.add("hidden");
    
    if (isLockoutActive()) {
      triggerLockout();
      return;
    }

    if (passcodeAuthSection) passcodeAuthSection.classList.remove("hidden");
    if (lockoutWarningSection) lockoutWarningSection.classList.add("hidden");
    if (resetPasscodeSection) resetPasscodeSection.classList.add("hidden");

    if (ownerPasscodeInput) {
      ownerPasscodeInput.value = "";
      ownerPasscodeInput.focus();
    }
    if (passcodeErrorMsg) passcodeErrorMsg.classList.add("hidden");
  };

  const showDashboardView = () => {
    if (passcodeScreen) passcodeScreen.classList.add("hidden");
    if (dashboardScreen) dashboardScreen.classList.remove("hidden");
    
    // Initial telemetries population
    populateStaticTelemetry();
    refreshDashboardTelemetry();
    populateActivityFeed();
    updateDashboardHiringUI();
    updateTrafficChart(graphTimeFilter ? graphTimeFilter.value : "monthly");
    fetchRealDau();
  };

  const checkAuth = () => {
    if (isOwnerAuthenticated()) {
      showDashboardView();
    } else {
      showPasscodeView();
    }
  };

  // Passcode Verification
  const verifyPasscode = () => {
    if (isLockoutActive()) return;

    const code = ownerPasscodeInput ? ownerPasscodeInput.value : "";
    const targetPasscode = localStorage.getItem("portfolio_owner_passcode") || "owner123";
    if (code === targetPasscode) {
      sessionStorage.setItem("portfolio_owner_authenticated", "true");
      localStorage.setItem("failed_auth_attempts", "0");
      failedAttempts = 0;
      showDashboardView();
      if (window.Telemetry) window.Telemetry.logEvent("Owner Access Granted", "highlight");
    } else {
      failedAttempts++;
      localStorage.setItem("failed_auth_attempts", failedAttempts.toString());
      if (passcodeErrorMsg) {
        passcodeErrorMsg.textContent = `ACCESS DENIED: INVALID KEY CARD (${3 - failedAttempts} ATTEMPTS REMAINING)`;
        passcodeErrorMsg.classList.remove("hidden");
      }
      if (window.Telemetry) window.Telemetry.logEvent(`Failed Security Auth Attempt (${failedAttempts}/3)`, "alert");
      
      if (failedAttempts >= 3) {
        triggerLockout();
      }
    }
  };

  // Auto-lock when user navigates away or closes tab/dashboard
  window.addEventListener("pagehide", () => {
    sessionStorage.removeItem("portfolio_owner_authenticated");
  });
  window.addEventListener("beforeunload", () => {
    sessionStorage.removeItem("portfolio_owner_authenticated");
  });

  if (ownerPasscodeSubmit) {
    ownerPasscodeSubmit.addEventListener("click", verifyPasscode);
  }
  if (ownerPasscodeInput) {
    ownerPasscodeInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") verifyPasscode();
    });
  }

  // OTP Verification Handlers
  if (generateOtpBtn) {
    generateOtpBtn.addEventListener("click", () => {
      // Generate random 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      sessionStorage.setItem("portfolio_lockout_otp", otp);

      // Obfuscated email (shoubhikbhattacharya06@gmail.com) decoded safely
      const obfuscatedEmail = atob("c2hvdWJoaWtiaGF0dGFjaGFyeWEwNkBnbWFpbC5jb20=");
      
      const subject = "Owner Dashboard OTP Security Code";
      const plainBody = `Your owner verification security OTP code is: ${otp}\n\nEnter this code on your dashboard to unlock the panel.\n\nIf you did not request this code, please ignore it.`;
      
      // Update UI elements immediately to let the user enter the OTP while it sends
      if (lockoutOtpInput) {
        lockoutOtpInput.style.display = "block";
        lockoutOtpInput.value = "";
        lockoutOtpInput.focus();
      }
      if (verifyOtpBtn) {
        verifyOtpBtn.style.display = "block";
      }
      if (otpStatusMsg) {
        otpStatusMsg.textContent = "Sending OTP directly to your Gmail...";
        otpStatusMsg.style.color = "var(--warning)";
        otpStatusMsg.classList.remove("hidden");
      }

      // Send OTP directly to email via FormSubmit API
      fetch(`https://formsubmit.co/ajax/${obfuscatedEmail}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          _subject: subject,
          message: plainBody,
          _captcha: "false"
        })
      })
      .then(response => {
        if (response.ok) {
          if (otpStatusMsg) {
            otpStatusMsg.textContent = "Security verification OTP code sent directly to your Gmail.";
            otpStatusMsg.style.color = "var(--success)";
          }
        } else {
          throw new Error("API failed");
        }
      })
      .catch(error => {
        console.error("Error sending OTP automatically:", error);
        if (otpStatusMsg) {
          otpStatusMsg.textContent = "Sending automatically failed. Opening mail client fallback...";
          otpStatusMsg.style.color = "var(--danger)";
        }
        // Fallback to mailto link
        window.open(`mailto:${obfuscatedEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainBody)}`);
      });

      if (window.Telemetry) window.Telemetry.logEvent("OTP Generated and Sent to Owner", "highlight");
    });
  }

  if (verifyOtpBtn) {
    verifyOtpBtn.addEventListener("click", () => {
      const enteredOtp = lockoutOtpInput ? lockoutOtpInput.value.trim() : "";
      const actualOtp = sessionStorage.getItem("portfolio_lockout_otp");

      if (enteredOtp && enteredOtp === actualOtp) {
        // Success
        localStorage.removeItem("portfolio_lockout_active");
        localStorage.setItem("failed_auth_attempts", "0");
        failedAttempts = 0;
        sessionStorage.setItem("portfolio_owner_authenticated", "true");
        sessionStorage.removeItem("portfolio_lockout_otp");
        
        if (otpStatusMsg) {
          otpStatusMsg.classList.add("hidden");
        }
        
        showDashboardView();
        
        if (window.Telemetry) window.Telemetry.logEvent("Owner Access Restored via OTP Verification", "highlight");
      } else {
        // Failure
        if (otpStatusMsg) {
          otpStatusMsg.textContent = "INVALID SECURITY CODE. PLEASE TRY AGAIN.";
          otpStatusMsg.style.color = "var(--danger)";
          otpStatusMsg.classList.remove("hidden");
        }
        if (window.Telemetry) window.Telemetry.logEvent("Failed OTP Lockout Verification Attempt", "alert");
      }
    });
  }

  // Forgot Passcode / Reset Handlers
  if (forgotPasscodeLink) {
    forgotPasscodeLink.addEventListener("click", (e) => {
      e.preventDefault();
      if (isLockoutActive()) return;
      if (passcodeAuthSection) passcodeAuthSection.classList.add("hidden");
      if (resetPasscodeSection) resetPasscodeSection.classList.remove("hidden");
      if (resetOtpFields) resetOtpFields.classList.add("hidden");
      if (resetGenerateOtpBtn) resetGenerateOtpBtn.style.display = "block";
      if (resetStatusMsg) resetStatusMsg.classList.add("hidden");
    });
  }

  if (resetCancelBtn) {
    resetCancelBtn.addEventListener("click", () => {
      if (resetPasscodeSection) resetPasscodeSection.classList.add("hidden");
      if (passcodeAuthSection) passcodeAuthSection.classList.remove("hidden");
    });
  }

  if (resetGenerateOtpBtn) {
    resetGenerateOtpBtn.addEventListener("click", () => {
      // Generate random 6-digit OTP for resetting passcode
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      sessionStorage.setItem("portfolio_reset_otp", otp);

      // Obfuscated email (shoubhikbhattacharya06@gmail.com) decoded safely
      const obfuscatedEmail = atob("c2hvdWJoaWtiaGF0dGFjaGFyeWEwNkBnbWFpbC5jb20=");
      
      const subject = "Owner Dashboard Passcode Reset OTP";
      const plainBody = `Your owner verification security OTP code for passcode reset is: ${otp}\n\nEnter this code along with your new passcode on your dashboard to complete the reset.`;
      
      // Update UI elements immediately
      if (resetOtpFields) {
        resetOtpFields.classList.remove("hidden");
      }
      if (resetGenerateOtpBtn) {
        resetGenerateOtpBtn.style.display = "none";
      }
      if (resetStatusMsg) {
        resetStatusMsg.textContent = "Sending passcode reset OTP directly to your Gmail...";
        resetStatusMsg.style.color = "var(--warning)";
        resetStatusMsg.classList.remove("hidden");
      }

      // Send OTP directly to email via FormSubmit API
      fetch(`https://formsubmit.co/ajax/${obfuscatedEmail}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          _subject: subject,
          message: plainBody,
          _captcha: "false"
        })
      })
      .then(response => {
        if (response.ok) {
          if (resetStatusMsg) {
            resetStatusMsg.textContent = "Passcode reset OTP code sent directly to your Gmail.";
            resetStatusMsg.style.color = "var(--success)";
          }
        } else {
          throw new Error("API failed");
        }
      })
      .catch(error => {
        console.error("Error sending reset OTP automatically:", error);
        if (resetStatusMsg) {
          resetStatusMsg.textContent = "Sending automatically failed. Opening mail client fallback...";
          resetStatusMsg.style.color = "var(--danger)";
        }
        // Fallback to mailto link
        window.open(`mailto:${obfuscatedEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainBody)}`);
      });

      if (window.Telemetry) window.Telemetry.logEvent("Passcode Reset OTP Generated and Sent", "highlight");
    });
  }

  if (resetSubmitBtn) {
    resetSubmitBtn.addEventListener("click", () => {
      const enteredOtp = resetOtpInput ? resetOtpInput.value.trim() : "";
      const actualOtp = sessionStorage.getItem("portfolio_reset_otp");
      const newPass = newPasscodeInput ? newPasscodeInput.value : "";
      const confirmPass = confirmPasscodeInput ? confirmPasscodeInput.value : "";

      if (!enteredOtp || enteredOtp !== actualOtp) {
        if (resetStatusMsg) {
          resetStatusMsg.textContent = "INVALID OTP CODE. PLEASE TRY AGAIN.";
          resetStatusMsg.style.color = "var(--danger)";
          resetStatusMsg.classList.remove("hidden");
        }
        return;
      }

      if (!newPass) {
        if (resetStatusMsg) {
          resetStatusMsg.textContent = "NEW PASSCODE CANNOT BE EMPTY.";
          resetStatusMsg.style.color = "var(--danger)";
          resetStatusMsg.classList.remove("hidden");
        }
        return;
      }

      if (newPass !== confirmPass) {
        if (resetStatusMsg) {
          resetStatusMsg.textContent = "PASSCODES DO NOT MATCH.";
          resetStatusMsg.style.color = "var(--danger)";
          resetStatusMsg.classList.remove("hidden");
        }
        return;
      }

      // Success - Save new passcode
      localStorage.setItem("portfolio_owner_passcode", newPass);
      localStorage.removeItem("portfolio_lockout_active");
      localStorage.setItem("failed_auth_attempts", "0");
      failedAttempts = 0;
      sessionStorage.setItem("portfolio_owner_authenticated", "true");
      sessionStorage.removeItem("portfolio_reset_otp");

      if (resetStatusMsg) {
        resetStatusMsg.classList.add("hidden");
      }

      showDashboardView();

      if (window.Telemetry) window.Telemetry.logEvent("Passcode Reset Successfully by Owner", "highlight");
    });
  }

  // Export Data Action
  if (ownerExportBtn) {
    ownerExportBtn.addEventListener("click", () => {
      if (window.Telemetry) {
        window.Telemetry.exportData();
      }
    });
  }

  // Legend Box Toggle Action
  if (logLegendTrigger && logLegendBox) {
    logLegendTrigger.addEventListener("click", () => {
      logLegendBox.classList.toggle("hidden");
    });
  }

  // Browser Telemetry Retrieval
  const populateStaticTelemetry = () => {
    if (!window.Telemetry) return;
    const device = window.Telemetry.state.deviceData;

    document.getElementById("dash-browser").textContent = device.browser;
    document.getElementById("dash-os").textContent = device.os;
    document.getElementById("dash-resolution").textContent = device.resolution;
    document.getElementById("dash-language").textContent = device.language;
    document.getElementById("dash-network").textContent = device.network;
    
    // Security fields
    document.getElementById("dash-referrer").textContent = device.referrer;
    document.getElementById("dash-timezone").textContent = device.timezone;
    document.getElementById("dash-cookies").textContent = device.cookiesEnabled;
    document.getElementById("dash-dnt").textContent = device.doNotTrack;
  };

  // Populate activity feed inside dashboard
  const populateActivityFeed = () => {
    const dashLogContainer = document.getElementById("dash-activity-log");
    if (!dashLogContainer || !window.Telemetry) return;
    
    const activeSegment = graphSegmentFilter ? graphSegmentFilter.value : "all";
    const logs = window.Telemetry.state.activityLogs.filter(log => {
      if (activeSegment === "all") return true;
      return log.type === activeSegment;
    });
    
    dashLogContainer.innerHTML = logs.map(log => {
      const logClass = log.type === 'alert' ? 'alert-event' : (log.type === 'highlight' ? 'highlight-event' : '');
      return `<div class="feed-item ${logClass}">
        <div class="feed-dot"></div>
        <div class="feed-text">[${log.time}] ${log.message}</div>
      </div>`;
    }).join("");
  };

  // Refresh Telemetry Values
  const refreshDashboardTelemetry = () => {
    if (!window.Telemetry) return;
    const tState = window.Telemetry.state;
    const duration = Math.floor((Date.now() - tState.sessionStartTime) / 1000);
    const hrs = String(Math.floor(duration / 3600)).padStart(2, '0');
    const mins = String(Math.floor((duration % 3600) / 60)).padStart(2, '0');
    const secs = String(duration % 60).padStart(2, '0');
    
    document.getElementById("dash-session-time").textContent = `${hrs}:${mins}:${secs}`;
    document.getElementById("dash-total-clicks").textContent = tState.totalClicks;
    document.getElementById("dash-active-level").textContent = tState.currentLevel;
    
    // In security.html, scroll depth refers to the main body's scroll depth or remains constant.
    document.getElementById("dash-scroll-depth").textContent = `${tState.maxScrollDepth}%`;

    document.getElementById("dash-projects-opened").textContent = tState.projectsOpened;
    document.getElementById("dash-skills-flipped").textContent = tState.skillsFlipped;
    document.getElementById("dash-resume-downloads").textContent = tState.resumeDownloads;
    document.getElementById("dash-external-clicks").textContent = tState.externalClicks;
    document.getElementById("dash-online").textContent = tState.deviceData.onlineStatus;
    document.getElementById("dash-ip").textContent = tState.deviceData.ip;
    document.getElementById("dash-region").textContent = tState.deviceData.region;

    // Update Netlify Deploy Age
    const netlifyDeployEl = document.getElementById("netlify-last-deploy");
    if (netlifyDeployEl) {
      const totalSecs = 620 + duration; // Initial offset of 10m 20s
      if (totalSecs < 60) {
        netlifyDeployEl.textContent = `${totalSecs}s ago`;
      } else if (totalSecs < 3600) {
        netlifyDeployEl.textContent = `${Math.floor(totalSecs / 60)}m ${totalSecs % 60}s ago`;
      } else {
        netlifyDeployEl.textContent = `${Math.floor(totalSecs / 3600)}h ${Math.floor((totalSecs % 3600) / 60)}m ago`;
      }
    }

    // --- Dynamic Circular Gauge Animations ---
    // 1. Session Time Circle (Ticking seconds ring)
    const sessionCircle = document.querySelector(".metrics-grid .metric-card:nth-child(1) .circle-fill");
    if (sessionCircle) {
      const sessionPercent = Math.round(((duration % 60) / 60) * 100);
      sessionCircle.setAttribute("stroke-dasharray", `${sessionPercent}, 100`);
    }

    // 2. Interactions Circle (Clicks mapped out of a goal of 50)
    const clickCircle = document.querySelector(".metrics-grid .metric-card:nth-child(2) .circle-fill");
    if (clickCircle) {
      const clickPercent = Math.min(100, Math.round((tState.totalClicks / 50) * 100));
      clickCircle.setAttribute("stroke-dasharray", `${clickPercent}, 100`);
    }

    // 3. Scroll Depth Circle (Mapped directly to scroll depth percent)
    const scrollCircle = document.querySelector(".metrics-grid .metric-card:nth-child(3) .circle-fill");
    if (scrollCircle) {
      scrollCircle.setAttribute("stroke-dasharray", `${tState.maxScrollDepth}, 100`);
    }

    // 4. Active Level Circle (Mapped level 1-4 sections)
    const levelCircle = document.querySelector(".metrics-grid .metric-card:nth-child(4) .circle-fill");
    if (levelCircle) {
      let lvlPercent = 25;
      if (tState.currentLevel.includes("2")) lvlPercent = 50;
      else if (tState.currentLevel.includes("3")) lvlPercent = 75;
      else if (tState.currentLevel.includes("4") || tState.currentLevel.includes("5")) lvlPercent = 100;
      levelCircle.setAttribute("stroke-dasharray", `${lvlPercent}, 100`);
    }
  };

  // Fetch Real Server-Based DAU Analytics from Counter API
  const fetchRealDau = async () => {
    const chartContainer = document.getElementById("netlify-dau-chart");
    const dauValEl = document.getElementById("netlify-dau-val");
    if (!chartContainer) return;

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const promises = [];
    const labels = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = days[d.getDay()];
      labels.push(dayLabel);

      promises.push(
        fetch(`https://api.counterapi.dev/v1/shoubhik_portfolio/dau_${dateStr}`)
          .then(res => res.json())
          .then(data => data.value || 0)
          .catch(() => 0)
      );
    }

    try {
      const values = await Promise.all(promises);
      const maxValue = Math.max(...values, 10); // avoid division by zero

      // Render Bar Chart Emojis
      chartContainer.innerHTML = values.map((val, idx) => {
        const height = Math.round((val / maxValue) * 140) + 15; // Math scale height
        return `
          <div style="display: flex; flex-direction: column; align-items: center; flex-grow: 1; gap: 8px;">
            <span style="font-size: 10px; font-family: var(--font-mono); color: var(--text-muted);">${val}</span>
            <div style="width: 24px; height: ${height}px; background: linear-gradient(to top, #1d4ed8, var(--primary)); border-radius: 4px; box-shadow: 0 0 10px var(--primary-glow); transition: height 0.5s ease-out;"></div>
            <span style="font-size: 11px; font-weight: 600;">${labels[idx]}</span>
          </div>
        `;
      }).join("");

      // Update DAU Header Card with today's real count
      if (dauValEl) {
        dauValEl.textContent = values[values.length - 1]; // today's count
      }
    } catch (e) {
      console.warn("Error loading Netlify DAU data:", e);
    }
  };

  // --- Traffic Chart Logic ---
  const updateTrafficChart = (filterKey) => {
    let data;
    const isLive = filterKey === "live";

    // Legend elements
    const lblDirect = document.getElementById("legend-lbl-direct");
    const lblSearch = document.getElementById("legend-lbl-search");
    const lblRefer = document.getElementById("legend-lbl-refer");
    const lblTotal = document.getElementById("graph-total-label");

    if (isLive) {
      if (lblDirect) lblDirect.textContent = "Clicks";
      if (lblSearch) lblSearch.textContent = "Skills";
      if (lblRefer) lblRefer.textContent = "Projects";
      if (lblTotal) lblTotal.textContent = "Actions";

      const tState = window.Telemetry ? window.Telemetry.state : null;
      const clicks = tState ? tState.totalClicks : 0;
      const skills = tState ? tState.skillsFlipped : 0;
      const projects = tState ? tState.projectsOpened : 0;
      const total = clicks + skills + projects;

      if (total === 0) {
        data = { total: 0, direct: 0, search: 0, refer: 0 };
      } else {
        data = {
          total: total,
          direct: Math.round((clicks / total) * 100),
          search: Math.round((skills / total) * 100),
          refer: Math.round((projects / total) * 100)
        };
      }
    } else {
      if (lblDirect) lblDirect.textContent = "Direct";
      if (lblSearch) lblSearch.textContent = "Search";
      if (lblRefer) lblRefer.textContent = "Referral";
      if (lblTotal) lblTotal.textContent = "Visits";

      if (window.Telemetry) {
        data = window.Telemetry.getHistoricalStats(filterKey);
      } else {
        data = { total: 0, direct: 0, search: 0, refer: 0 };
      }
    }

    document.getElementById("graph-total-views").textContent = data.total;
    document.getElementById("graph-val-direct").textContent = `${data.direct}%`;
    document.getElementById("graph-val-search").textContent = `${data.search}%`;
    document.getElementById("graph-val-refer").textContent = `${data.refer}%`;
    
    const c = 314.15; // Circumference (2 * pi * r) for R=50
    const segDirect = document.getElementById("graph-seg-direct");
    const segSearch = document.getElementById("graph-seg-search");
    const segRefer = document.getElementById("graph-seg-refer");
    
    if (segDirect && segSearch && segRefer) {
      if (data.total === 0) {
        segDirect.style.strokeDashoffset = `${c}`;
        segSearch.style.strokeDashoffset = `${c}`;
        segRefer.style.strokeDashoffset = `${c}`;
      } else {
        // Direct Slice
        segDirect.style.strokeDasharray = `${c}`;
        segDirect.style.strokeDashoffset = `${c * (1 - data.direct / 100)}`;
        
        // Search Slice
        segSearch.style.strokeDasharray = `${c}`;
        segSearch.style.strokeDashoffset = `${c * (1 - data.search / 100)}`;
        const rotSearch = -90 + (360 * data.direct / 100);
        segSearch.setAttribute("transform", `rotate(${rotSearch} 70 70)`);
        
        // Referral Slice
        segRefer.style.strokeDasharray = `${c}`;
        segRefer.style.strokeDashoffset = `${c * (1 - data.refer / 100)}`;
        const rotRefer = -90 + (360 * (data.direct + data.search) / 100);
        segRefer.setAttribute("transform", `rotate(${rotRefer} 70 70)`);
      }
    }
  };

  // Dropdown Filter Listener
  if (graphTimeFilter) {
    graphTimeFilter.addEventListener("change", (e) => {
      updateTrafficChart(e.target.value);
    });
  }

  // Segment Filter Listener
  if (graphSegmentFilter) {
    graphSegmentFilter.addEventListener("change", () => {
      populateActivityFeed();
    });
  }

  // --- Hiring Leads UI Updates ---
  const updateDashboardHiringUI = () => {
    const listContainer = document.getElementById("dash-hire-list");
    const countEl = document.getElementById("dash-hire-count");
    if (!listContainer || !countEl || !window.Telemetry) return;
    
    const leads = window.Telemetry.state.hiringLeads || [];
    countEl.textContent = leads.length;
    
    if (leads.length === 0) {
      listContainer.innerHTML = `<div style="font-style:italic; color:var(--text-muted); padding:8px 0; text-align:center; font-size:13px;">No leads registered.</div>`;
    } else {
      listContainer.innerHTML = leads.map((lead, idx) => `
        <div class="lead-item-card">
          <div class="lead-details">
            <div class="lead-name">${lead.name}</div>
            <div class="lead-meta">
              <span>📅 ${lead.timestamp}</span>
              ${lead.email ? `<span>📧 <a href="mailto:${lead.email}">${lead.email}</a></span>` : ''}
              ${lead.companyLink ? `<span>🔗 <a href="${lead.companyLink.startsWith('http') ? lead.companyLink : 'https://' + lead.companyLink}" target="_blank" rel="noopener noreferrer">${lead.companyLink}</a></span>` : ''}
            </div>
          </div>
          <button class="lead-delete-btn delete-lead-btn" data-idx="${idx}" title="Delete Lead">🗑️</button>
        </div>
      `).join("");

      // Bind delete button events dynamically
      listContainer.querySelectorAll(".delete-lead-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const idx = parseInt(btn.getAttribute("data-idx"));
          if (window.Telemetry && typeof window.Telemetry.deleteHiringLead === 'function') {
            window.Telemetry.deleteHiringLead(idx);
            updateDashboardHiringUI();
          }
        });
      });
    }
  };

  // Sidebar Navigation Click Listeners
  if (navReports && navNetlify) {
    navReports.addEventListener("click", (e) => {
      e.preventDefault();
      navReports.classList.add("active");
      navNetlify.classList.remove("active");
      if (reportsPanel) reportsPanel.classList.remove("hidden");
      if (netlifyPanel) netlifyPanel.classList.add("hidden");
      if (panelTitle) panelTitle.textContent = "Reports";
      if (panelSubtitle) panelSubtitle.textContent = "Real-time analytics and interaction logging feed.";
    });

    navNetlify.addEventListener("click", (e) => {
      e.preventDefault();
      navNetlify.classList.add("active");
      navReports.classList.remove("active");
      if (reportsPanel) reportsPanel.classList.add("hidden");
      if (netlifyPanel) netlifyPanel.classList.remove("hidden");
      if (panelTitle) panelTitle.textContent = "Netlify Dashboard";
      if (panelSubtitle) panelSubtitle.textContent = "Production deployment analytics and usage reports.";
      fetchRealDau();
    });
  }

  // Expose function globally for telemetry.js to call on deletes/inserts
  window.updateDashboardHiringUI = updateDashboardHiringUI;
  window.populateActivityFeed = populateActivityFeed;

  // Run Auth Check
  checkAuth();

  // Start background ticker for telemetry
  setInterval(() => {
    if (isOwnerAuthenticated()) {
      refreshDashboardTelemetry();
      if (graphTimeFilter && graphTimeFilter.value === "live") {
        updateTrafficChart("live");
      }
    }
  }, 1000);

});
