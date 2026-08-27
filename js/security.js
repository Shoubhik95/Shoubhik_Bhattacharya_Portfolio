document.addEventListener("DOMContentLoaded", () => {
  const passcodeScreen = document.getElementById("passcode-screen");
  const dashboardScreen = document.getElementById("dashboard-screen");

  const ownerPasscodeInput = document.getElementById("owner-passcode-input");
  const ownerPasscodeSubmit = document.getElementById("owner-passcode-submit");
  const passcodeErrorMsg = document.getElementById("passcode-error-msg");

  const ownerExportBtn = document.getElementById("owner-export-btn");
  const ownerResetDbBtn = document.getElementById("owner-reset-db-btn");

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
  const navClickbait = document.getElementById("nav-clickbait");
  const navLeads = document.getElementById("nav-leads");
  const navIplogs = document.getElementById("nav-iplogs");
  const reportsPanel = document.getElementById("reports-panel");
  const netlifyPanel = document.getElementById("netlify-panel");
  const clickbaitPanel = document.getElementById("clickbait-panel");
  const leadsPanel = document.getElementById("leads-panel");
  const iplogsPanel = document.getElementById("iplogs-panel");
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

  const ownerLogoutBtn = document.getElementById("owner-logout-btn");

  let failedAttempts = 0;
  let isAuthenticated = false;

  const isOwnerAuthenticated = () => {
    return isAuthenticated;
  };

  const triggerLockout = () => {
    if (passcodeAuthSection) passcodeAuthSection.classList.add("hidden");
    if (resetPasscodeSection) resetPasscodeSection.classList.add("hidden");
    if (lockoutWarningSection) lockoutWarningSection.classList.remove("hidden");
    if (window.Telemetry) window.Telemetry.logEvent("SECURITY LOCKOUT ACTIVE: PANEL ACCESSIBILITY REVOKED", "alert");
  };

  const showPasscodeView = async () => {
    if (passcodeScreen) passcodeScreen.classList.remove("hidden");
    if (dashboardScreen) dashboardScreen.classList.add("hidden");

    try {
      const res = await fetch('/api/lockout-state');
      if (res.ok) {
        const data = await res.json();
        if (data.lockoutActive) {
          triggerLockout();
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to check server lockout state:", e);
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
    updateClickbaitStats();
  };

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/lockout-state');
      if (res.ok) {
        const data = await res.json();
        if (data.lockoutActive) {
          triggerLockout();
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to check server lockout state:", e);
    }

    try {
      const authRes = await fetch('/api/verify-session');
      if (authRes.ok) {
        const authData = await authRes.json();
        if (authData.authenticated) {
          isAuthenticated = true;
          showDashboardView();
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to check server session status:", e);
    }

    isAuthenticated = false;
    showPasscodeView();
  };

  window.handleUnauthorized = () => {
    isAuthenticated = false;
    showPasscodeView();
  };

  let isLoggingIn = false;

  // Passcode Verification
  const verifyPasscode = async () => {
    if (isLoggingIn) return;
    const code = ownerPasscodeInput ? ownerPasscodeInput.value : "";
    if (!code) return;

    isLoggingIn = true;
    if (ownerPasscodeSubmit) {
      ownerPasscodeSubmit.disabled = true;
      ownerPasscodeSubmit.textContent = "DECRYPTING...";
    }
    if (ownerPasscodeInput) ownerPasscodeInput.disabled = true;

    try {
      const res = await fetch('/api/verify-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (data.success) {
        isAuthenticated = true;
        showDashboardView();
        if (window.Telemetry) {
          window.Telemetry.fetchLeads();
          window.Telemetry.fetchStats();
          window.Telemetry.logEvent("Owner Access Granted", "highlight");
        }
      } else {
        if (data.lockoutActive) {
          triggerLockout();
        } else {
          if (passcodeErrorMsg) {
            passcodeErrorMsg.textContent = `ACCESS DENIED: INVALID KEY CARD (${data.remainingAttempts} ATTEMPTS REMAINING)`;
            passcodeErrorMsg.classList.remove("hidden");
          }
          if (window.Telemetry) window.Telemetry.logEvent(`Failed Security Auth Attempt (${data.failedAttempts}/3)`, "alert");
        }
      }
    } catch (e) {
      console.error("Error verifying passcode:", e);
    } finally {
      isLoggingIn = false;
      if (ownerPasscodeSubmit) {
        ownerPasscodeSubmit.disabled = false;
        ownerPasscodeSubmit.textContent = "DECRYPT DATABASE";
      }
      if (ownerPasscodeInput) {
        ownerPasscodeInput.disabled = false;
        ownerPasscodeInput.focus();
      }
    }
  };

  // Sessions are managed securely via HTTP-only cookies on the server.
  // The client will re-verify credentials seamlessly via verify-session.

  if (ownerPasscodeSubmit) {
    ownerPasscodeSubmit.addEventListener("click", verifyPasscode);
  }
  if (ownerPasscodeInput) {
    ownerPasscodeInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        verifyPasscode();
      }
    });
  }

  // OTP Verification Handlers
  if (generateOtpBtn) {
    generateOtpBtn.addEventListener("click", () => {
      // Update UI elements immediately
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

      // Send OTP directly to email via backend API
      fetch('/api/generate-otp', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: 'lockout' })
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
            otpStatusMsg.textContent = "Sending automatically failed. Please try again.";
            otpStatusMsg.style.color = "var(--danger)";
          }
        });

      if (window.Telemetry) window.Telemetry.logEvent("OTP Generated and Sent to Owner", "highlight");
    });
  }

  if (verifyOtpBtn) {
    verifyOtpBtn.addEventListener("click", () => {
      const enteredOtp = lockoutOtpInput ? lockoutOtpInput.value.trim() : "";

      fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enteredOtp })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            isAuthenticated = true;
            if (otpStatusMsg) {
              otpStatusMsg.classList.add("hidden");
            }
            showDashboardView();
            if (window.Telemetry) {
              window.Telemetry.fetchLeads();
              window.Telemetry.fetchStats();
              window.Telemetry.logEvent("Owner Access Restored via OTP Verification", "highlight");
            }
          } else {
            if (otpStatusMsg) {
              otpStatusMsg.textContent = "INVALID SECURITY CODE. PLEASE TRY AGAIN.";
              otpStatusMsg.style.color = "var(--danger)";
              otpStatusMsg.classList.remove("hidden");
            }
            if (window.Telemetry) window.Telemetry.logEvent("Failed OTP Lockout Verification Attempt", "alert");
          }
        })
        .catch(err => {
          console.error("Error verifying OTP:", err);
        });
    });
  }

  // Forgot Passcode / Reset Handlers (Firebase Auth Reset Email)
  const sendFirebaseResetEmail = async (statusElement) => {
    if (statusElement) {
      statusElement.textContent = "Sending password reset email via Firebase...";
      statusElement.style.color = "var(--warning)";
      statusElement.classList.remove("hidden");
    }

    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        if (statusElement) {
          statusElement.textContent = "Success! Check your registered Gmail for the reset link.";
          statusElement.style.color = "var(--success)";
        }
        if (window.Telemetry) window.Telemetry.logEvent("Firebase Password Reset Email Sent", "highlight");

        // If locked out, unlock in local view after 3 seconds
        if (statusElement === otpStatusMsg) {
          setTimeout(() => {
            showPasscodeView();
          }, 3000);
        }
      } else {
        if (statusElement) {
          statusElement.textContent = data.message || "Failed to send reset email. Try again.";
          statusElement.style.color = "var(--danger)";
        }
      }
    } catch (err) {
      console.error("Error sending reset email:", err);
      if (statusElement) {
        statusElement.textContent = "Error sending reset email. Try again.";
        statusElement.style.color = "var(--danger)";
      }
    }
  };

  if (forgotPasscodeLink) {
    forgotPasscodeLink.addEventListener("click", async (e) => {
      e.preventDefault();
      sendFirebaseResetEmail(passcodeErrorMsg);
    });
  }

  const firebaseResetBtn = document.getElementById("firebase-reset-btn");
  if (firebaseResetBtn) {
    firebaseResetBtn.addEventListener("click", () => {
      sendFirebaseResetEmail(otpStatusMsg);
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

  // Reset Database Action
  if (ownerResetDbBtn) {
    ownerResetDbBtn.addEventListener("click", () => {
      if (confirm("WARNING: Are you sure you want to reset all visitor sessions, telemetry logs, analytics, and hiring leads in the Firebase database to 0? This action cannot be undone.")) {
        fetch('/api/reset-database', {
          method: 'POST'
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              alert("Database reset successfully! All logs cleared.");
              if (window.Telemetry) {
                window.Telemetry.fetchStats();
                window.Telemetry.fetchLeads();
              }
            } else {
              alert("Failed to reset database: " + (data.message || "Unknown error"));
            }
          })
          .catch(err => {
            console.error("Error resetting database:", err);
            alert("Error resetting database.");
          });
      }
    });
  }

  // Logout Action
  if (ownerLogoutBtn) {
    ownerLogoutBtn.addEventListener("click", () => {
      fetch('/api/logout', { method: 'POST' })
        .then(() => {
          isAuthenticated = false;
          showPasscodeView();
          if (window.Telemetry) window.Telemetry.logEvent("Owner Logged Out", "info");
        })
        .catch(err => console.error("Error logging out:", err));
    });
  }

  // Legend Box Toggle Action
  if (logLegendTrigger && logLegendBox) {
    logLegendTrigger.addEventListener("click", () => {
      logLegendBox.classList.toggle("hidden");
    });
  }

  // Populate visitor session profiles from Firebase
  window.populateVisitorSessionsDropdown = () => {
    const selectEl = document.getElementById("visitor-session-select");
    if (!selectEl || !window.Telemetry) return;

    const sessions = window.Telemetry.state.visitorSessions || [];
    const currentVal = selectEl.value;

    if (sessions.length === 0) {
      selectEl.innerHTML = `<option value="">No Active Sessions</option>`;
      updateDeviceFields(window.Telemetry.state.deviceData);
      return;
    }

    selectEl.innerHTML = sessions.map((sess, idx) => {
      const dateText = sess.timestamp ? sess.timestamp.split(',')[0] : '';
      const label = `${sess.ip} (${sess.region || 'Unknown'}) - ${dateText}`;
      return `<option value="${idx}">${label}</option>`;
    }).join("");

    if (currentVal !== "" && selectEl.options[currentVal]) {
      selectEl.value = currentVal;
    } else {
      selectEl.value = "0";
    }

    const activeIndex = parseInt(selectEl.value);
    if (!isNaN(activeIndex) && sessions[activeIndex]) {
      updateDeviceFields(sessions[activeIndex]);
    }
  };

  const updateDeviceFields = (device) => {
    if (!device) return;
    const ipEl = document.getElementById("dash-ip");
    if (ipEl) ipEl.textContent = device.ip || "N/A";
    const browserEl = document.getElementById("dash-browser");
    if (browserEl) browserEl.textContent = device.browser || "Unknown";
    const osEl = document.getElementById("dash-os");
    if (osEl) osEl.textContent = device.os || "Unknown";
    const resEl = document.getElementById("dash-resolution");
    if (resEl) resEl.textContent = device.resolution || "0x0";
    const langEl = document.getElementById("dash-language");
    if (langEl) langEl.textContent = device.language || "N/A";
    const netEl = document.getElementById("dash-network");
    if (netEl) netEl.textContent = device.network || "N/A";
    const refEl = document.getElementById("dash-referrer");
    if (refEl) refEl.textContent = device.referrer || "Direct Visit";
    const tzEl = document.getElementById("dash-timezone");
    if (tzEl) tzEl.textContent = device.timezone || "N/A";
    const cookiesEl = document.getElementById("dash-cookies");
    if (cookiesEl) cookiesEl.textContent = device.cookiesEnabled || "N/A";
    const dntEl = document.getElementById("dash-dnt");
    if (dntEl) dntEl.textContent = device.doNotTrack || "N/A";

    const regionEl = document.getElementById("dash-region");
    if (regionEl) regionEl.textContent = device.region || "Unknown Region";

    const onlineEl = document.getElementById("dash-online");
    if (onlineEl) onlineEl.textContent = device.onlineStatus || "N/A";

    const metrics = device.metrics || { projectsOpened: 0, skillsFlipped: 0, resumeDownloads: 0, externalClicks: 0 };
    const projsEl = document.getElementById("dash-projects-opened");
    if (projsEl) projsEl.textContent = metrics.projectsOpened || 0;
    const skillsEl = document.getElementById("dash-skills-flipped");
    if (skillsEl) skillsEl.textContent = metrics.skillsFlipped || 0;
    const resumeEl = document.getElementById("dash-resume-downloads");
    if (resumeEl) resumeEl.textContent = metrics.resumeDownloads || 0;
    const extEl = document.getElementById("dash-external-clicks");
    if (extEl) extEl.textContent = metrics.externalClicks || 0;
  };

  // Browser Telemetry Retrieval
  const populateStaticTelemetry = () => {
    if (!window.Telemetry) return;

    const selectEl = document.getElementById("visitor-session-select");
    if (selectEl && !selectEl.dataset.listenerBound) {
      selectEl.addEventListener("change", (e) => {
        const idx = parseInt(e.target.value);
        const sessions = window.Telemetry.state.visitorSessions || [];
        if (!isNaN(idx) && sessions[idx]) {
          updateDeviceFields(sessions[idx]);
        }
      });
      selectEl.dataset.listenerBound = "true";
    }

    window.populateVisitorSessionsDropdown();
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

    // Populate the left-side Suspicious Activity Warning Log (Alerts only)
    const warningLogContainer = document.getElementById("dash-warning-log");
    if (warningLogContainer) {
      const alerts = window.Telemetry.state.activityLogs.filter(log => log.type === 'alert');
      if (alerts.length === 0) {
        warningLogContainer.innerHTML = `<div style="font-style:italic; color:var(--text-muted); padding:16px 0; text-align:center; font-size:12px;">No suspicious threats or signatures detected. System secure.</div>`;
      } else {
        warningLogContainer.innerHTML = alerts.map(log => {
          return `<div class="feed-item alert-event" style="padding: 10px 14px; margin-bottom: 8px; font-size: 11px;">
            <div class="feed-dot"></div>
            <div class="feed-text">[${log.time}] ${log.message}</div>
          </div>`;
        }).join("");
      }
    }
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

    document.getElementById("dash-scroll-depth").textContent = `${tState.maxScrollDepth}%`;

    const selectEl = document.getElementById("visitor-session-select");
    const sessions = window.Telemetry.state.visitorSessions || [];
    const activeIndex = selectEl ? parseInt(selectEl.value) : NaN;

    const projsEl = document.getElementById("dash-projects-opened");
    const skillsEl = document.getElementById("dash-skills-flipped");
    const resumeEl = document.getElementById("dash-resume-downloads");
    const extEl = document.getElementById("dash-external-clicks");
    const ipEl = document.getElementById("dash-ip");
    const regionEl = document.getElementById("dash-region");
    const onlineEl = document.getElementById("dash-online");

    if (!isNaN(activeIndex) && sessions[activeIndex]) {
      const vSession = sessions[activeIndex];
      const metrics = vSession.metrics || { projectsOpened: 0, skillsFlipped: 0, resumeDownloads: 0, externalClicks: 0 };
      if (projsEl) projsEl.textContent = metrics.projectsOpened || 0;
      if (skillsEl) skillsEl.textContent = metrics.skillsFlipped || 0;
      if (resumeEl) resumeEl.textContent = metrics.resumeDownloads || 0;
      if (extEl) extEl.textContent = metrics.externalClicks || 0;
      if (ipEl) ipEl.textContent = vSession.ip || "N/A";
      if (regionEl) regionEl.textContent = vSession.region || "Unknown Region";
    } else {
      if (projsEl) projsEl.textContent = tState.projectsOpened;
      if (skillsEl) skillsEl.textContent = tState.skillsFlipped;
      if (resumeEl) resumeEl.textContent = tState.resumeDownloads;
      if (extEl) extEl.textContent = tState.externalClicks;
      if (ipEl) ipEl.textContent = tState.deviceData.ip;
      if (regionEl) regionEl.textContent = tState.deviceData.region;
    }
    if (onlineEl) onlineEl.textContent = tState.deviceData.onlineStatus;

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

  // Fetch Real Server-Based DAU Analytics from Firebase Database
  const fetchRealDau = async () => {
    const chartContainer = document.getElementById("netlify-dau-chart");
    const dauValEl = document.getElementById("netlify-dau-val");
    if (!chartContainer) return;

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const values = [];
    const labels = [];

    const history = (window.Telemetry && window.Telemetry.state && window.Telemetry.state.historicalTelemetry)
      ? window.Telemetry.state.historicalTelemetry
      : {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = days[d.getDay()];
      labels.push(dayLabel);

      const dayData = history[dateStr] || { direct: 0, github: 0, netlify: 0, search: 0, refer: 0 };
      const visits = (dayData.direct || 0) + (dayData.github || 0) + (dayData.netlify || 0) + (dayData.search || 0) + (dayData.refer || 0);
      values.push(visits);
    }

    try {
      const maxValue = Math.max(...values, 5); // Avoid division by zero, min scale of 5 for layout

      // Render Bar Chart Emojis
      chartContainer.innerHTML = values.map((val, idx) => {
        const height = Math.round((val / maxValue) * 140) + 15; // Math scale height
        return `
          <div style="display: flex; flex-direction: column; align-items: center; flex-grow: 1; gap: 8px;">
            <span style="font-size: 10px; font-family: var(--font-mono); color: var(--text-muted);">${val}</span>
            <div style="width: 24px; height: ${height}px; background: linear-gradient(to top, var(--danger), var(--primary)); border-radius: 4px; box-shadow: 0 0 10px var(--primary-glow); transition: height 0.5s ease-out;"></div>
            <span style="font-size: 11px; font-weight: 600;">${labels[idx]}</span>
          </div>
        `;
      }).join("");

      // Update DAU Header Card with today's real count
      if (dauValEl) {
        dauValEl.textContent = values[values.length - 1]; // today's count
      }

      // Calculate Referrer Breakdown
      let totalDirect = 0;
      let totalGithub = 0;
      let totalNetlify = 0;
      let totalSearch = 0;
      let totalRefer = 0;

      for (const dateStr in history) {
        const dayData = history[dateStr];
        totalDirect += dayData.direct || 0;
        totalGithub += dayData.github || 0;
        totalNetlify += dayData.netlify || 0;
        totalSearch += dayData.search || 0;
        totalRefer += dayData.refer || 0;
      }

      const totalOther = totalSearch + totalRefer;
      const totalAllReferrals = totalGithub + totalNetlify + totalDirect + totalOther;

      const pctGithub = totalAllReferrals > 0 ? Math.round((totalGithub / totalAllReferrals) * 100) : 0;
      const pctNetlify = totalAllReferrals > 0 ? Math.round((totalNetlify / totalAllReferrals) * 100) : 0;
      const pctDirect = totalAllReferrals > 0 ? Math.round((totalDirect / totalAllReferrals) * 100) : 0;
      const pctOther = totalAllReferrals > 0 ? Math.round((totalOther / totalAllReferrals) * 100) : 0;

      // Update Referrer Labels and Bars
      const lblGithub = document.getElementById("referrer-count-github");
      const barGithub = document.getElementById("referrer-bar-github");
      if (lblGithub) lblGithub.textContent = `${totalGithub} visits (${pctGithub}%)`;
      if (barGithub) barGithub.style.width = `${pctGithub}%`;

      const lblNetlify = document.getElementById("referrer-count-netlify");
      const barNetlify = document.getElementById("referrer-bar-netlify");
      if (lblNetlify) lblNetlify.textContent = `${totalNetlify} visits (${pctNetlify}%)`;
      if (barNetlify) barNetlify.style.width = `${pctNetlify}%`;

      const lblDirect = document.getElementById("referrer-count-direct");
      const barDirect = document.getElementById("referrer-bar-direct");
      if (lblDirect) lblDirect.textContent = `${totalDirect} visits (${pctDirect}%)`;
      if (barDirect) barDirect.style.width = `${pctDirect}%`;

      const lblOther = document.getElementById("referrer-count-other");
      const barOther = document.getElementById("referrer-bar-other");
      if (lblOther) lblOther.textContent = `${totalOther} visits (${pctOther}%)`;
      if (barOther) barOther.style.width = `${pctOther}%`;

      // Update Shares Count Value
      const sharesValEl = document.getElementById("netlify-shares-val");
      if (sharesValEl && window.Telemetry && window.Telemetry.state) {
        sharesValEl.textContent = window.Telemetry.state.sharesCount || 0;
      }
    } catch (e) {
      console.warn("Error loading Netlify DAU data from Firebase:", e);
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
      listContainer.innerHTML = `<div style="font-style:italic; color:var(--text-muted); padding:8px 0; text-align:center; font-size:13px; grid-column: 1 / -1;">No leads registered.</div>`;
    } else {
      listContainer.innerHTML = leads.map((lead, idx) => `
        <div class="lead-card-premium" style="background: linear-gradient(135deg, rgba(45, 15, 15, 0.35) 0%, rgba(15, 6, 6, 0.75) 100%); border: 1px solid var(--border-color); border-radius: 14px; padding: 22px; display: flex; flex-direction: column; justify-content: space-between; gap: 16px; position: relative; transition: all 0.3s ease; box-shadow: 0 4px 20px rgba(0,0,0,0.2);">
          
          <!-- Top Row: Avatar icon + Delete button -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary-glow); border: 1px solid rgba(249, 115, 22, 0.2); display: flex; align-items: center; justify-content: center; font-size: 16px;">
                👤
              </div>
              <div>
                <h4 style="font-size: 15px; font-weight: 800; color: var(--text-main); line-height: 1.2; margin-bottom: 2px;">${lead.name}</h4>
                <span style="font-size: 10px; color: var(--text-muted); font-family: var(--font-mono);">${lead.timestamp}</span>
              </div>
            </div>
            <button class="lead-delete-btn delete-lead-btn" data-idx="${idx}" title="Delete Profile" style="background: transparent; border: none; cursor: pointer; color: var(--danger); font-size: 14px; padding: 6px; border-radius: 6px; transition: all 0.2s;">
              🗑️
            </button>
          </div>

          <!-- Divider -->
          <div style="width: 100%; height: 1px; background: rgba(255,255,255,0.04);"></div>

          <!-- Middle Row: Details -->
          <div style="display: flex; flex-direction: column; gap: 10px; font-size: 12px;">
            <div style="display: flex; align-items: center; gap: 10px; color: #cbd5e1;">
              <span style="color: var(--primary); font-weight: bold; width: 18px; text-align: center;">📧</span>
              <span style="font-weight: 600; color: #94a3b8;">Email:</span>
              ${lead.email ? `<a href="mailto:${lead.email}" style="color: var(--primary); text-decoration: underline; font-family: var(--font-mono); font-weight: 600;">${lead.email}</a>` : `<span style="color: var(--text-muted); font-style: italic;">Not Provided</span>`}
            </div>
            
            <div style="display: flex; align-items: center; gap: 10px; color: #cbd5e1;">
              <span style="color: var(--primary); font-weight: bold; width: 18px; text-align: center;">🔗</span>
              <span style="font-weight: 600; color: #94a3b8;">Company:</span>
              ${lead.companyLink ? `<a href="${lead.companyLink.startsWith('http') ? lead.companyLink : 'https://' + lead.companyLink}" target="_blank" rel="noopener noreferrer" style="color: var(--primary); text-decoration: underline; font-weight: 600;">${lead.companyLink}</a>` : `<span style="color: var(--text-muted); font-style: italic;">Not Provided</span>`}
            </div>
          </div>
          
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

  const updateClickbaitStats = () => {
    const history = (window.Telemetry && window.Telemetry.state && window.Telemetry.state.historicalTelemetry)
      ? window.Telemetry.state.historicalTelemetry
      : {};

    const totalDurations = { about: 0, skills: 0, education: 0, projects: 0, certificates: 0 };
    const totalClicks = { about: 0, skills: 0, education: 0, projects: 0, certificates: 0 };
    const totalProjectClicks = {};

    for (const dateStr in history) {
      const dayData = history[dateStr];
      if (dayData && dayData.sectionMetrics) {
        const metrics = dayData.sectionMetrics;

        if (metrics.durations) {
          for (const key in totalDurations) {
            totalDurations[key] += metrics.durations[key] || 0;
          }
        }
        if (metrics.clicks) {
          for (const key in totalClicks) {
            totalClicks[key] += metrics.clicks[key] || 0;
          }
        }
        if (metrics.projectClicks) {
          for (const proj in metrics.projectClicks) {
            totalProjectClicks[proj] = (totalProjectClicks[proj] || 0) + metrics.projectClicks[proj];
          }
        }
      }
    }

    let totalSecs = 0;
    for (const key in totalDurations) {
      totalSecs += totalDurations[key];
    }

    const formatDuration = (secs) => {
      if (secs === 0) return "0s";
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      if (m > 0) {
        return `${m}m ${s}s`;
      }
      return `${s}s`;
    };

    const totalTimeEl = document.getElementById("clickbait-total-time");
    if (totalTimeEl) {
      totalTimeEl.textContent = formatDuration(totalSecs);
    }

    let topSection = "N/A";
    let maxDuration = -1;
    for (const key in totalDurations) {
      if (totalDurations[key] > maxDuration && totalDurations[key] > 0) {
        maxDuration = totalDurations[key];
        topSection = key.charAt(0).toUpperCase() + key.slice(1);
      }
    }
    const topSectionEl = document.getElementById("clickbait-top-section");
    if (topSectionEl) {
      topSectionEl.textContent = topSection;
    }

    const svgEl = document.getElementById("clickbait-pie-chart");
    const legendEl = document.getElementById("clickbait-pie-legend");

    const colors = {
      about: "#f97316",
      skills: "#ef4444",
      education: "#f59e0b",
      projects: "#ea580c",
      certificates: "#b91c1c"
    };

    if (svgEl && legendEl) {
      svgEl.innerHTML = "";
      legendEl.innerHTML = "";

      const c = 376.99;
      let cumulativePercent = 0;
      const sectionKeys = ["about", "skills", "education", "projects", "certificates"];

      sectionKeys.forEach(key => {
        const val = totalDurations[key] || 0;
        const pct = totalSecs > 0 ? (val / totalSecs) : 0;
        const strokeDasharray = `${pct * c} ${c}`;
        const rotateAngle = -90 + (360 * cumulativePercent);

        const slice = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        slice.setAttribute("cx", "80");
        slice.setAttribute("cy", "80");
        slice.setAttribute("r", "60");
        slice.setAttribute("fill", "transparent");
        slice.setAttribute("stroke", colors[key]);
        slice.setAttribute("stroke-width", "20");
        slice.setAttribute("stroke-dasharray", strokeDasharray);
        slice.setAttribute("stroke-dashoffset", "0");
        slice.setAttribute("transform", `rotate(${rotateAngle} 80 80)`);
        slice.style.transition = "stroke-dashoffset 0.5s ease";
        svgEl.appendChild(slice);

        const displayPct = Math.round(pct * 100);
        const displayLabel = key.charAt(0).toUpperCase() + key.slice(1);

        const legendItem = document.createElement("div");
        legendItem.className = "legend-item";
        legendItem.style.display = "flex";
        legendItem.style.justifyContent = "space-between";
        legendItem.style.alignItems = "center";
        legendItem.style.fontSize = "12px";
        legendItem.style.width = "100%";
        legendItem.innerHTML = `
          <div class="legend-label-group" style="display: flex; align-items: center; gap: 8px;">
            <span class="legend-dot" style="background-color: ${colors[key]}; display: inline-block; width: 8px; height: 8px; border-radius: 50%;"></span>
            <span class="legend-label-text" style="color: #cbd5e1; font-weight: 500;">${displayLabel}</span>
          </div>
          <span class="legend-value" style="font-family: var(--font-mono); color: #f1f5f9; font-weight: 700;">${formatDuration(val)} (${displayPct}%)</span>
        `;
        legendEl.appendChild(legendItem);

        cumulativePercent += pct;
      });

      if (totalSecs === 0) {
        const emptySlice = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        emptySlice.setAttribute("cx", "80");
        emptySlice.setAttribute("cy", "80");
        emptySlice.setAttribute("r", "60");
        emptySlice.setAttribute("fill", "transparent");
        emptySlice.setAttribute("stroke", "rgba(255,255,255,0.05)");
        emptySlice.setAttribute("stroke-width", "20");
        svgEl.appendChild(emptySlice);
      }
    }

    const clicksListEl = document.getElementById("clickbait-clicks-list");
    let sumSectionClicks = 0;
    for (const key in totalClicks) {
      sumSectionClicks += totalClicks[key];
    }
    const totalSectClicksEl = document.getElementById("clickbait-total-sect-clicks");
    if (totalSectClicksEl) {
      totalSectClicksEl.textContent = sumSectionClicks;
    }

    if (clicksListEl) {
      clicksListEl.innerHTML = "";
      const sectionKeys = ["about", "skills", "education", "projects", "certificates"];

      sectionKeys.forEach(key => {
        const clicks = totalClicks[key] || 0;
        const pct = sumSectionClicks > 0 ? Math.round((clicks / sumSectionClicks) * 100) : 0;
        const displayLabel = key.charAt(0).toUpperCase() + key.slice(1);

        clicksListEl.innerHTML += `
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600;">
              <span>${displayLabel} Section Clicks</span>
              <span style="font-family: var(--font-mono); color: var(--text-muted);">${clicks} clicks (${pct}%)</span>
            </div>
            <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden;">
              <div style="width: ${pct}%; height: 100%; background: ${colors[key]}; transition: width 0.5s ease-out;"></div>
            </div>
          </div>
        `;
      });
    }

    const leaderboardBodyEl = document.getElementById("clickbait-leaderboard-body");
    const totalProjClicksEl = document.getElementById("clickbait-total-proj-clicks");

    const sortedProjects = Object.entries(totalProjectClicks).sort((a, b) => b[1] - a[1]);
    const sumProjClicks = sortedProjects.reduce((sum, item) => sum + item[1], 0);

    if (totalProjClicksEl) {
      totalProjClicksEl.textContent = sumProjClicks;
    }

    if (leaderboardBodyEl) {
      if (sortedProjects.length === 0) {
        leaderboardBodyEl.innerHTML = `
          <tr>
            <td colspan="3" style="text-align: center; color: var(--text-muted); padding: 20px; font-style: italic;">No projects clicked yet.</td>
          </tr>
        `;
      } else {
        leaderboardBodyEl.innerHTML = sortedProjects.map(([proj, count], idx) => {
          let badge = `<span style="font-family: var(--font-mono); color: var(--text-muted);">#${idx + 1}</span>`;
          if (idx === 0) badge = "🥇";
          else if (idx === 1) badge = "🥈";
          else if (idx === 2) badge = "🥉";

          return `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
              <td style="padding: 10px 8px; font-weight: 700;">${badge}</td>
              <td style="padding: 10px 8px; font-weight: 600; color: #cbd5e1;">${proj}</td>
              <td style="padding: 10px 8px; text-align: right; font-family: var(--font-mono); color: var(--primary); font-weight: 700;">${count}</td>
            </tr>
          `;
        }).join("");
      }
    }
  };
  const updateIPLogsUI = () => {
    const container = document.getElementById("iplogs-container");
    const totalCountEl = document.getElementById("iplogs-total-count");
    const uniqueCountEl = document.getElementById("iplogs-unique-count");
    const datesCountEl = document.getElementById("iplogs-dates-count");
    const searchInput = document.getElementById("iplogs-search-input");
    if (!container || !window.Telemetry) return;

    // Bind input listener once
    if (searchInput && !searchInput.dataset.listenerBound) {
      searchInput.addEventListener("input", () => {
        updateIPLogsUI();
      });
      searchInput.dataset.listenerBound = "true";
    }

    const sessions = window.Telemetry.state.visitorSessions || [];
    if (totalCountEl) totalCountEl.textContent = sessions.length;

    // Unique IPs
    const uniqueIps = new Set(sessions.map(s => s.ip).filter(Boolean));
    if (uniqueCountEl) uniqueCountEl.textContent = uniqueIps.size;

    // Group sessions by date
    const grouped = {};
    sessions.forEach(sess => {
      let dateStr = "Unknown Date";
      if (sess.timestamp) {
        dateStr = sess.timestamp.split(',')[0].trim();
      }
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      grouped[dateStr].push(sess);
    });

    const dates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
    if (datesCountEl) datesCountEl.textContent = dates.length;

    const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : "";

    if (sessions.length === 0) {
      container.innerHTML = `<div style="font-style:italic; color:var(--text-muted); padding:16px 0; text-align:center;">No visitor sessions recorded.</div>`;
      return;
    }

    let html = "";
    dates.forEach(date => {
      const filtered = grouped[date].filter(sess => {
        if (!searchQuery) return true;
        const ip = (sess.ip || "").toLowerCase();
        const region = (sess.region || "").toLowerCase();
        const browser = (sess.browser || "").toLowerCase();
        const os = (sess.os || "").toLowerCase();
        const referrer = (sess.referrer || "").toLowerCase();
        return ip.includes(searchQuery) || region.includes(searchQuery) || browser.includes(searchQuery) || os.includes(searchQuery) || referrer.includes(searchQuery);
      });

      if (filtered.length === 0) return;

      const bodyId = `iplogs-body-${date.replace(/\//g, '-')}`;
      const existingBody = document.getElementById(bodyId);
      const isCollapsed = existingBody ? existingBody.classList.contains("hidden") : false;
      const collapseClass = isCollapsed ? "hidden" : "";
      const icon = isCollapsed ? "▶" : "▼";

      html += `
        <div class="data-card iplogs-date-card" style="padding: 0; overflow: hidden; border-color: var(--border-color); background: rgba(45, 15, 15, 0.25); margin-bottom: 12px;">
          <!-- Collapsible Header -->
          <div class="iplogs-header-toggle" data-date="${date}" style="display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; cursor: pointer; background: rgba(255,255,255,0.02); font-weight: 700; user-select: none;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span class="iplogs-toggle-icon" style="font-size: 10px; color: var(--primary);">${icon}</span>
              <span style="font-size: 14px; color: var(--text-main); font-weight: 800; letter-spacing: 0.5px;">${date}</span>
              <span style="font-size: 10px; background: var(--primary-glow); color: var(--primary); padding: 2px 8px; border-radius: 20px; font-family: var(--font-mono);">${filtered.length} Session${filtered.length > 1 ? 's' : ''}</span>
            </div>
            <span style="font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Toggle Details</span>
          </div>
          
          <!-- Collapsible Content -->
          <div class="iplogs-body-content ${collapseClass}" id="${bodyId}" style="border-top: 1px solid var(--border-color); overflow-x: auto; width: 100%;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 12px; min-width: 800px;">
              <thead>
                <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted); font-family: var(--font-mono); font-size: 11px; background: rgba(0,0,0,0.2);">
                  <th style="padding: 12px 16px;">IP Address</th>
                  <th style="padding: 12px 16px;">Time</th>
                  <th style="padding: 12px 16px;">Location</th>
                  <th style="padding: 12px 16px;">Referrer</th>
                  <th style="padding: 12px 16px;">Device Profile</th>
                  <th style="padding: 12px 16px; text-align: right;">Interactions</th>
                  <th style="padding: 12px 16px; text-align: right; width: 60px;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.map(sess => {
        const timeStr = sess.timestamp ? (sess.timestamp.includes(',') ? sess.timestamp.split(',')[1].trim() : sess.timestamp) : "N/A";
        const metrics = sess.metrics || { totalClicks: 0, skillsFlipped: 0, projectsOpened: 0, resumeDownloads: 0, externalClicks: 0 };
        const interactionsText = `Clicks: ${metrics.totalClicks || 0} | Skills: ${metrics.skillsFlipped || 0} | Projects: ${metrics.projectsOpened || 0} | Download: ${metrics.resumeDownloads || 0}`;
        const os = sess.os || "Unknown";
        const isMobile = os.toLowerCase().includes("android") || os.toLowerCase().includes("ios") || os.toLowerCase().includes("iphone") || os.toLowerCase().includes("ipad");
        const deviceBadge = isMobile 
          ? `<span style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; margin-right: 6px; display: inline-flex; align-items: center; gap: 4px;">📱 Mobile</span>` 
          : `<span style="background: rgba(34, 197, 94, 0.15); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3); padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; margin-right: 6px; display: inline-flex; align-items: center; gap: 4px;">💻 Laptop/PC</span>`;
        
        return `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.03); transition: background 0.2s;" onmouseover="this.style.background='rgba(239, 68, 68, 0.03)'" onmouseout="this.style.background='transparent'">
                      <td style="padding: 12px 16px; font-family: var(--font-mono); font-weight: 700; color: var(--primary);">${sess.ip || "Unknown"}</td>
                      <td style="padding: 12px 16px; font-family: var(--font-mono); color: #94a3b8;">${timeStr}</td>
                      <td style="padding: 12px 16px; color: #f1f5f9; font-weight: 600;">📍 ${sess.region || "Unknown Region"}</td>
                      <td style="padding: 12px 16px; color: var(--primary); font-weight: 600; font-family: var(--font-mono); font-size: 11px;">${sess.referrer || "Direct"}</td>
                      <td style="padding: 12px 16px; color: #cbd5e1; display: flex; align-items: center;">${deviceBadge} ${sess.browser || "Unknown"} on ${os}</td>
                      <td style="padding: 12px 16px; text-align: right; font-family: var(--font-mono); font-weight: 700; color: var(--success); font-size: 11px;">${interactionsText}</td>
                      <td style="padding: 12px 16px; text-align: right;">
                        <button class="delete-session-btn" data-key="${sess.key || ''}" title="Delete Log" style="background: transparent; border: none; cursor: pointer; color: var(--danger); font-size: 13px; padding: 4px; border-radius: 4px; transition: all 0.2s;" onmouseover="this.style.backgroundColor='var(--danger-glow)'" onmouseout="this.style.backgroundColor='transparent'">
                          🗑️
                        </button>
                      </td>
                    </tr>
                  `;
      }).join("")}
              </tbody>
            </table>
          </div>
        </div>
      `;
    });

    if (html === "") {
      container.innerHTML = `<div style="font-style:italic; color:var(--text-muted); padding:16px 0; text-align:center;">No sessions match your search query.</div>`;
    } else {
      container.innerHTML = html;
    }

    // Bind session delete buttons
    container.querySelectorAll(".delete-session-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const key = btn.getAttribute("data-key");
        if (key && window.Telemetry && typeof window.Telemetry.deleteVisitorSession === 'function') {
          if (confirm(`Are you sure you want to delete session log for: ${key.split('_')[0]}?`)) {
            window.Telemetry.deleteVisitorSession(key);
          }
        }
      });
    });

    // Bind accordion togglers
    container.querySelectorAll(".iplogs-header-toggle").forEach(header => {
      header.addEventListener("click", () => {
        const date = header.getAttribute("data-date");
        const body = document.getElementById(`iplogs-body-${date.replace(/\//g, '-')}`);
        const toggleIcon = header.querySelector(".iplogs-toggle-icon");

        if (body) {
          body.classList.toggle("hidden");
          if (body.classList.contains("hidden")) {
            if (toggleIcon) toggleIcon.textContent = "▶";
          } else {
            if (toggleIcon) toggleIcon.textContent = "▼";
          }
        }
      });
    });
  };

  // Sidebar Navigation Click Listeners
  if (navReports && navNetlify && navClickbait && navLeads && navIplogs) {
    const panels = [
      { nav: navReports, panel: reportsPanel, title: "Reports", subtitle: "Real-time analytics and interaction logging feed." },
      { nav: navNetlify, panel: netlifyPanel, title: "Traffic on Web Page", subtitle: "Production deployment analytics and usage reports." },
      { nav: navClickbait, panel: clickbaitPanel, title: "Clickbait Analysis", subtitle: "Visitor section engagement, duration, and click metrics." },
      { nav: navLeads, panel: leadsPanel, title: "Hiring Leads", subtitle: "Recruiters and organizations interested in hiring." },
      { nav: navIplogs, panel: iplogsPanel, title: "IP Tracker", subtitle: "Visitor sessions tracked and grouped daily." }
    ];

    panels.forEach(p => {
      p.nav.addEventListener("click", (e) => {
        e.preventDefault();
        panels.forEach(x => {
          if (x.nav) x.nav.classList.remove("active");
          if (x.panel) x.panel.classList.add("hidden");
        });
        p.nav.classList.add("active");
        if (p.panel) p.panel.classList.remove("hidden");
        if (panelTitle) panelTitle.textContent = p.title;
        if (panelSubtitle) panelSubtitle.textContent = p.subtitle;

        if (p.nav === navNetlify) {
          fetchRealDau();
        } else if (p.nav === navClickbait) {
          updateClickbaitStats();
        } else if (p.nav === navLeads) {
          updateDashboardHiringUI();
        } else if (p.nav === navIplogs) {
          updateIPLogsUI();
        }
      });
    });
  }

  // Expose function globally for telemetry.js to call on deletes/inserts
  window.updateDashboardHiringUI = updateDashboardHiringUI;
  window.populateActivityFeed = populateActivityFeed;

  // --- Lightweight Dashboard Theme System ---
  const dashboardThemeToggle = document.getElementById("theme-toggle-btn");
  const dashboardToggleIcon = dashboardThemeToggle ? dashboardThemeToggle.querySelector(".toggle-icon") : null;

  const setDashboardTheme = (isLight) => {
    if (isLight) {
      document.body.classList.add("light-theme");
      if (dashboardToggleIcon) dashboardToggleIcon.textContent = "☀️";
      localStorage.setItem("portfolio_theme", "light");
    } else {
      document.body.classList.remove("light-theme");
      if (dashboardToggleIcon) dashboardToggleIcon.textContent = "🌙";
      localStorage.setItem("portfolio_theme", "dark");
    }
  };

  // Initialize theme from localStorage
  const currentSavedTheme = localStorage.getItem("portfolio_theme");
  setDashboardTheme(currentSavedTheme === "light");

  if (dashboardThemeToggle) {
    dashboardThemeToggle.addEventListener("click", () => {
      const isLight = document.body.classList.contains("light-theme");
      setDashboardTheme(!isLight);
    });
  }

  // Run Auth Check
  checkAuth();

  // Start background ticker for telemetry
  setInterval(() => {
    if (isOwnerAuthenticated()) {
      if (window.Telemetry) {
        window.Telemetry.fetchStats();
        window.Telemetry.fetchLeads();
      }
      refreshDashboardTelemetry();
      if (graphTimeFilter && graphTimeFilter.value === "live") {
        updateTrafficChart("live");
      }
      if (navClickbait && navClickbait.classList.contains("active")) {
        updateClickbaitStats();
      }
      if (navIplogs && navIplogs.classList.contains("active")) {
        updateIPLogsUI();
      }
    }
  }, 3000);

});
