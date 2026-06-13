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

  const passcodeAuthSection = document.getElementById("passcode-auth-section");
  const lockoutWarningSection = document.getElementById("lockout-warning-section");
  const generateOtpBtn = document.getElementById("generate-otp-btn");
  const lockoutOtpInput = document.getElementById("lockout-otp-input");
  const verifyOtpBtn = document.getElementById("verify-otp-btn");
  const otpStatusMsg = document.getElementById("otp-status-msg");

  const navReports = document.getElementById("nav-reports");
  const navNetlify = document.getElementById("nav-netlify");
  const reportsPanel = document.getElementById("reports-panel");
  const netlifyPanel = document.getElementById("netlify-panel");
  const panelTitle = document.getElementById("panel-title");
  const panelSubtitle = document.getElementById("panel-subtitle");

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

  let lockoutActive = false;

  const isOwnerAuthenticated = () => {
    return window.PortfolioAPI
      ? window.PortfolioAPI.isAuthenticated()
      : sessionStorage.getItem("portfolio_owner_authenticated") === "true";
  };

  const triggerLockout = () => {
    lockoutActive = true;
    if (passcodeAuthSection) passcodeAuthSection.classList.add("hidden");
    if (resetPasscodeSection) resetPasscodeSection.classList.add("hidden");
    if (lockoutWarningSection) lockoutWarningSection.classList.remove("hidden");
    if (window.Telemetry) window.Telemetry.logEvent("SECURITY LOCKOUT ACTIVE: PANEL ACCESSIBILITY REVOKED", "alert");
  };

  const showPasscodeView = async () => {
    if (passcodeScreen) passcodeScreen.classList.remove("hidden");
    if (dashboardScreen) dashboardScreen.classList.add("hidden");

    if (window.PortfolioAPI) {
      try {
        const status = await window.PortfolioAPI.getAuthStatus();
        lockoutActive = status.lockoutActive;
      } catch {
        lockoutActive = localStorage.getItem("portfolio_lockout_active") === "true";
      }
    } else {
      lockoutActive = localStorage.getItem("portfolio_lockout_active") === "true";
    }

    if (lockoutActive) {
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

  const showDashboardView = async () => {
    if (passcodeScreen) passcodeScreen.classList.add("hidden");
    if (dashboardScreen) dashboardScreen.classList.remove("hidden");

    sessionStorage.setItem("portfolio_owner_authenticated", "true");

    if (window.Telemetry && window.PortfolioAPI) {
      await window.Telemetry.syncHiringFromBackend();
      try {
        const logs = await window.PortfolioAPI.fetchTelemetryLogs();
        logs.forEach((log) => window.Telemetry.mergeRemoteEvent(log));
      } catch {
        /* use local logs */
      }
    }

    populateStaticTelemetry();
    refreshDashboardTelemetry();
    populateActivityFeed();
    updateDashboardHiringUI();
    updateTrafficChart(graphTimeFilter ? graphTimeFilter.value : "monthly");
    fetchRealDau();
    initRealtime();
  };

  const checkAuth = () => {
    if (isOwnerAuthenticated()) {
      showDashboardView();
    } else {
      showPasscodeView();
    }
  };

  const verifyPasscode = async () => {
    if (lockoutActive) return;

    const code = ownerPasscodeInput ? ownerPasscodeInput.value : "";

    if (window.PortfolioAPI) {
      try {
        const result = await window.PortfolioAPI.login(code);
        if (result.success) {
          sessionStorage.setItem("portfolio_owner_authenticated", "true");
          showDashboardView();
          return;
        }
        if (result.locked) {
          triggerLockout();
          return;
        }
        if (passcodeErrorMsg) {
          passcodeErrorMsg.textContent = result.error || "ACCESS DENIED: INVALID KEY CARD";
          passcodeErrorMsg.classList.remove("hidden");
        }
        return;
      } catch (err) {
        console.warn("Backend login failed, trying local fallback:", err);
      }
    }

    const targetPasscode = localStorage.getItem("portfolio_owner_passcode") || "owner123";
    if (code === targetPasscode) {
      sessionStorage.setItem("portfolio_owner_authenticated", "true");
      showDashboardView();
      if (window.Telemetry) window.Telemetry.logEvent("Owner Access Granted", "highlight");
    } else {
      let failedAttempts = parseInt(localStorage.getItem("failed_auth_attempts") || "0", 10) + 1;
      localStorage.setItem("failed_auth_attempts", failedAttempts.toString());
      if (passcodeErrorMsg) {
        passcodeErrorMsg.textContent = `ACCESS DENIED: INVALID KEY CARD (${Math.max(0, 3 - failedAttempts)} ATTEMPTS REMAINING)`;
        passcodeErrorMsg.classList.remove("hidden");
      }
      if (failedAttempts >= 3) {
        localStorage.setItem("portfolio_lockout_active", "true");
        triggerLockout();
      }
    }
  };

  window.addEventListener("pagehide", () => {
    if (window.PortfolioAPI) window.PortfolioAPI.logout();
    else sessionStorage.removeItem("portfolio_owner_authenticated");
  });

  if (ownerPasscodeSubmit) ownerPasscodeSubmit.addEventListener("click", verifyPasscode);
  if (ownerPasscodeInput) {
    ownerPasscodeInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") verifyPasscode();
    });
  }

  const handleGenerateOtp = async (purpose, statusEl, onSent) => {
    if (statusEl) {
      statusEl.textContent = "Sending OTP to your Gmail...";
      statusEl.style.color = "var(--warning)";
      statusEl.classList.remove("hidden");
    }

    if (window.PortfolioAPI) {
      try {
        const result = await window.PortfolioAPI.requestOtp(purpose);
        if (statusEl) {
          statusEl.textContent = result.devMode
            ? "Gmail abhi setup nahi hai — OTP server terminal mein print hua. .env mein GMAIL_APP_PASSWORD add karo."
            : result.message;
          statusEl.style.color = result.devMode ? "var(--warning)" : "var(--success)";
        }
        if (onSent) onSent();
        return;
      } catch (err) {
        if (statusEl) {
          statusEl.textContent = err.message || "Failed to send OTP.";
          statusEl.style.color = "var(--danger)";
        }
        return;
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem(purpose === "reset" ? "portfolio_reset_otp" : "portfolio_lockout_otp", otp);
    const email = "shoubhikbhattacharya06@gmail.com";
    if (statusEl) {
      statusEl.textContent = "Backend offline — OTP shown in browser console.";
      statusEl.style.color = "var(--warning)";
    }
    console.log(`[DEV OTP ${purpose}]`, otp, "→", email);
    if (onSent) onSent();
  };

  if (generateOtpBtn) {
    generateOtpBtn.addEventListener("click", () => {
      handleGenerateOtp("lockout", otpStatusMsg, () => {
        if (lockoutOtpInput) {
          lockoutOtpInput.style.display = "block";
          lockoutOtpInput.value = "";
          lockoutOtpInput.focus();
        }
        if (verifyOtpBtn) verifyOtpBtn.style.display = "block";
      });
    });
  }

  if (verifyOtpBtn) {
    verifyOtpBtn.addEventListener("click", async () => {
      const enteredOtp = lockoutOtpInput ? lockoutOtpInput.value.trim() : "";

      if (window.PortfolioAPI) {
        try {
          await window.PortfolioAPI.verifyLockoutOtp(enteredOtp);
          lockoutActive = false;
          if (otpStatusMsg) otpStatusMsg.classList.add("hidden");
          showDashboardView();
          return;
        } catch (err) {
          if (otpStatusMsg) {
            otpStatusMsg.textContent = err.message || "INVALID SECURITY CODE.";
            otpStatusMsg.style.color = "var(--danger)";
            otpStatusMsg.classList.remove("hidden");
          }
          return;
        }
      }

      const actualOtp = sessionStorage.getItem("portfolio_lockout_otp");
      if (enteredOtp && enteredOtp === actualOtp) {
        localStorage.removeItem("portfolio_lockout_active");
        lockoutActive = false;
        sessionStorage.setItem("portfolio_owner_authenticated", "true");
        showDashboardView();
      } else if (otpStatusMsg) {
        otpStatusMsg.textContent = "INVALID SECURITY CODE. PLEASE TRY AGAIN.";
        otpStatusMsg.style.color = "var(--danger)";
        otpStatusMsg.classList.remove("hidden");
      }
    });
  }

  if (forgotPasscodeLink) {
    forgotPasscodeLink.addEventListener("click", (e) => {
      e.preventDefault();
      if (lockoutActive) return;
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
      handleGenerateOtp("reset", resetStatusMsg, () => {
        if (resetOtpFields) resetOtpFields.classList.remove("hidden");
        if (resetGenerateOtpBtn) resetGenerateOtpBtn.style.display = "none";
      });
    });
  }

  if (resetSubmitBtn) {
    resetSubmitBtn.addEventListener("click", async () => {
      const enteredOtp = resetOtpInput ? resetOtpInput.value.trim() : "";
      const newPass = newPasscodeInput ? newPasscodeInput.value : "";
      const confirmPass = confirmPasscodeInput ? confirmPasscodeInput.value : "";

      if (window.PortfolioAPI) {
        try {
          await window.PortfolioAPI.resetPasscode(enteredOtp, newPass, confirmPass);
          if (resetStatusMsg) resetStatusMsg.classList.add("hidden");
          showDashboardView();
          return;
        } catch (err) {
          if (resetStatusMsg) {
            resetStatusMsg.textContent = err.message.toUpperCase();
            resetStatusMsg.style.color = "var(--danger)";
            resetStatusMsg.classList.remove("hidden");
          }
          return;
        }
      }

      const actualOtp = sessionStorage.getItem("portfolio_reset_otp");
      if (!enteredOtp || enteredOtp !== actualOtp) {
        if (resetStatusMsg) {
          resetStatusMsg.textContent = "INVALID OTP CODE.";
          resetStatusMsg.style.color = "var(--danger)";
          resetStatusMsg.classList.remove("hidden");
        }
        return;
      }
      if (!newPass || newPass !== confirmPass) {
        if (resetStatusMsg) {
          resetStatusMsg.textContent = "PASSCODES DO NOT MATCH.";
          resetStatusMsg.style.color = "var(--danger)";
          resetStatusMsg.classList.remove("hidden");
        }
        return;
      }
      localStorage.setItem("portfolio_owner_passcode", newPass);
      sessionStorage.setItem("portfolio_owner_authenticated", "true");
      showDashboardView();
    });
  }

  if (ownerExportBtn) {
    ownerExportBtn.addEventListener("click", () => {
      if (window.Telemetry) window.Telemetry.exportData();
    });
  }

  if (logLegendTrigger && logLegendBox) {
    logLegendTrigger.addEventListener("click", () => logLegendBox.classList.toggle("hidden"));
  }

  const populateStaticTelemetry = () => {
    if (!window.Telemetry) return;
    const device = window.Telemetry.state.deviceData;
    document.getElementById("dash-browser").textContent = device.browser;
    document.getElementById("dash-os").textContent = device.os;
    document.getElementById("dash-resolution").textContent = device.resolution;
    document.getElementById("dash-language").textContent = device.language;
    document.getElementById("dash-network").textContent = device.network;
    document.getElementById("dash-referrer").textContent = device.referrer;
    document.getElementById("dash-timezone").textContent = device.timezone;
    document.getElementById("dash-cookies").textContent = device.cookiesEnabled;
    document.getElementById("dash-dnt").textContent = device.doNotTrack;
  };

  const populateActivityFeed = () => {
    const dashLogContainer = document.getElementById("dash-activity-log");
    if (!dashLogContainer || !window.Telemetry) return;

    const activeSegment = graphSegmentFilter ? graphSegmentFilter.value : "all";
    const logs = window.Telemetry.state.activityLogs.filter((log) => {
      if (activeSegment === "all") return true;
      return log.type === activeSegment;
    });

    dashLogContainer.innerHTML = logs.map((log) => {
      const logClass = log.type === "alert" ? "alert-event" : log.type === "highlight" ? "highlight-event" : "";
      return `<div class="feed-item ${logClass}">
        <div class="feed-dot"></div>
        <div class="feed-text">[${log.time}] ${log.message}</div>
      </div>`;
    }).join("");
  };

  const refreshDashboardTelemetry = () => {
    if (!window.Telemetry) return;
    const tState = window.Telemetry.state;
    const duration = Math.floor((Date.now() - tState.sessionStartTime) / 1000);
    const hrs = String(Math.floor(duration / 3600)).padStart(2, "0");
    const mins = String(Math.floor((duration % 3600) / 60)).padStart(2, "0");
    const secs = String(duration % 60).padStart(2, "0");

    document.getElementById("dash-session-time").textContent = `${hrs}:${mins}:${secs}`;
    document.getElementById("dash-total-clicks").textContent = tState.totalClicks;
    document.getElementById("dash-active-level").textContent = tState.currentLevel;
    document.getElementById("dash-scroll-depth").textContent = `${tState.maxScrollDepth}%`;
    document.getElementById("dash-projects-opened").textContent = tState.projectsOpened;
    document.getElementById("dash-skills-flipped").textContent = tState.skillsFlipped;
    document.getElementById("dash-resume-downloads").textContent = tState.resumeDownloads;
    document.getElementById("dash-external-clicks").textContent = tState.externalClicks;
    document.getElementById("dash-online").textContent = tState.deviceData.onlineStatus;
    document.getElementById("dash-ip").textContent = tState.deviceData.ip;
    document.getElementById("dash-region").textContent = tState.deviceData.region;

    const netlifyDeployEl = document.getElementById("netlify-last-deploy");
    if (netlifyDeployEl) {
      const totalSecs = 620 + duration;
      if (totalSecs < 60) netlifyDeployEl.textContent = `${totalSecs}s ago`;
      else if (totalSecs < 3600) netlifyDeployEl.textContent = `${Math.floor(totalSecs / 60)}m ${totalSecs % 60}s ago`;
      else netlifyDeployEl.textContent = `${Math.floor(totalSecs / 3600)}h ${Math.floor((totalSecs % 3600) / 60)}m ago`;
    }

    const sessionCircle = document.querySelector(".metrics-grid .metric-card:nth-child(1) .circle-fill");
    if (sessionCircle) {
      sessionCircle.setAttribute("stroke-dasharray", `${Math.round(((duration % 60) / 60) * 100)}, 100`);
    }
    const clickCircle = document.querySelector(".metrics-grid .metric-card:nth-child(2) .circle-fill");
    if (clickCircle) {
      clickCircle.setAttribute("stroke-dasharray", `${Math.min(100, Math.round((tState.totalClicks / 50) * 100))}, 100`);
    }
    const scrollCircle = document.querySelector(".metrics-grid .metric-card:nth-child(3) .circle-fill");
    if (scrollCircle) scrollCircle.setAttribute("stroke-dasharray", `${tState.maxScrollDepth}, 100`);
    const levelCircle = document.querySelector(".metrics-grid .metric-card:nth-child(4) .circle-fill");
    if (levelCircle) {
      let lvlPercent = 25;
      if (tState.currentLevel.includes("2")) lvlPercent = 50;
      else if (tState.currentLevel.includes("3")) lvlPercent = 75;
      else if (tState.currentLevel.includes("4") || tState.currentLevel.includes("5")) lvlPercent = 100;
      levelCircle.setAttribute("stroke-dasharray", `${lvlPercent}, 100`);
    }
  };

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
      const dateStr = d.toISOString().split("T")[0];
      labels.push(days[d.getDay()]);
      promises.push(
        fetch(`https://api.counterapi.dev/v1/shoubhik_portfolio/dau_${dateStr}`)
          .then((res) => res.json())
          .then((data) => data.value || 0)
          .catch(() => 0)
      );
    }

    try {
      const values = await Promise.all(promises);
      const maxValue = Math.max(...values, 10);
      chartContainer.innerHTML = values.map((val, idx) => {
        const height = Math.round((val / maxValue) * 140) + 15;
        return `
          <div style="display: flex; flex-direction: column; align-items: center; flex-grow: 1; gap: 8px;">
            <span style="font-size: 10px; font-family: var(--font-mono); color: var(--text-muted);">${val}</span>
            <div style="width: 24px; height: ${height}px; background: linear-gradient(to top, #1d4ed8, var(--primary)); border-radius: 4px; box-shadow: 0 0 10px var(--primary-glow); transition: height 0.5s ease-out;"></div>
            <span style="font-size: 11px; font-weight: 600;">${labels[idx]}</span>
          </div>`;
      }).join("");
      if (dauValEl) dauValEl.textContent = values[values.length - 1];
    } catch (e) {
      console.warn("Error loading DAU data:", e);
    }
  };

  const updateTrafficChart = (filterKey) => {
    let data;
    const isLive = filterKey === "live";
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
      data = total === 0
        ? { total: 0, direct: 0, search: 0, refer: 0 }
        : {
            total,
            direct: Math.round((clicks / total) * 100),
            search: Math.round((skills / total) * 100),
            refer: Math.round((projects / total) * 100),
          };
    } else {
      if (lblDirect) lblDirect.textContent = "Direct";
      if (lblSearch) lblSearch.textContent = "Search";
      if (lblRefer) lblRefer.textContent = "Referral";
      if (lblTotal) lblTotal.textContent = "Visits";
      data = window.Telemetry ? window.Telemetry.getHistoricalStats(filterKey) : { total: 0, direct: 0, search: 0, refer: 0 };
    }

    document.getElementById("graph-total-views").textContent = data.total;
    document.getElementById("graph-val-direct").textContent = `${data.direct}%`;
    document.getElementById("graph-val-search").textContent = `${data.search}%`;
    document.getElementById("graph-val-refer").textContent = `${data.refer}%`;

    const c = 314.15;
    const segDirect = document.getElementById("graph-seg-direct");
    const segSearch = document.getElementById("graph-seg-search");
    const segRefer = document.getElementById("graph-seg-refer");

    if (segDirect && segSearch && segRefer) {
      if (data.total === 0) {
        segDirect.style.strokeDashoffset = `${c}`;
        segSearch.style.strokeDashoffset = `${c}`;
        segRefer.style.strokeDashoffset = `${c}`;
      } else {
        segDirect.style.strokeDasharray = `${c}`;
        segDirect.style.strokeDashoffset = `${c * (1 - data.direct / 100)}`;
        segSearch.style.strokeDasharray = `${c}`;
        segSearch.style.strokeDashoffset = `${c * (1 - data.search / 100)}`;
        segSearch.setAttribute("transform", `rotate(${-90 + (360 * data.direct) / 100} 70 70)`);
        segRefer.style.strokeDasharray = `${c}`;
        segRefer.style.strokeDashoffset = `${c * (1 - data.refer / 100)}`;
        segRefer.setAttribute("transform", `rotate(${-90 + (360 * (data.direct + data.search)) / 100} 70 70)`);
      }
    }
  };

  if (graphTimeFilter) {
    graphTimeFilter.addEventListener("change", (e) => updateTrafficChart(e.target.value));
  }
  if (graphSegmentFilter) {
    graphSegmentFilter.addEventListener("change", () => populateActivityFeed());
  }

  const updateDashboardHiringUI = () => {
    const listContainer = document.getElementById("dash-hire-list");
    const countEl = document.getElementById("dash-hire-count");
    if (!listContainer || !countEl || !window.Telemetry) return;

    const leads = window.Telemetry.state.hiringLeads || [];
    countEl.textContent = leads.length;

    if (leads.length === 0) {
      listContainer.innerHTML = `<div style="font-style:italic; color:var(--text-muted); padding:8px 0; text-align:center; font-size:13px;">No leads registered.</div>`;
    } else {
      listContainer.innerHTML = leads.map((lead) => `
        <div class="lead-item-card">
          <div class="lead-details">
            <div class="lead-name">${lead.name}</div>
            <div class="lead-meta">
              <span>📅 ${lead.timestamp}</span>
              ${lead.email ? `<span>📧 <a href="mailto:${lead.email}">${lead.email}</a></span>` : ""}
              ${lead.companyLink ? `<span>🔗 <a href="${lead.companyLink.startsWith("http") ? lead.companyLink : "https://" + lead.companyLink}" target="_blank" rel="noopener noreferrer">${lead.companyLink}</a></span>` : ""}
            </div>
          </div>
          <button class="lead-delete-btn delete-lead-btn" data-id="${lead.id || ""}" data-idx="${leads.indexOf(lead)}" title="Delete Lead">🗑️</button>
        </div>`).join("");

      listContainer.querySelectorAll(".delete-lead-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.getAttribute("data-id");
          const idx = parseInt(btn.getAttribute("data-idx"), 10);
          if (window.Telemetry) {
            if (id) await window.Telemetry.deleteHiringLead(id);
            else await window.Telemetry.deleteHiringLead(idx);
            updateDashboardHiringUI();
          }
        });
      });
    }
  };

  const initRealtime = () => {
    if (!window.PortfolioAPI) return;

    window.PortfolioAPI.initSocket();

    window.PortfolioAPI.onHiring((action, payload) => {
      if (action === "sync") {
        window.Telemetry.state.hiringLeads = payload;
        localStorage.setItem("portfolio_hiring_leads", JSON.stringify(payload));
      } else if (action === "new") {
        const leads = window.Telemetry.state.hiringLeads || [];
        if (!leads.some((l) => l.id === payload.id)) {
          leads.unshift(payload);
          window.Telemetry.state.hiringLeads = leads;
          localStorage.setItem("portfolio_hiring_leads", JSON.stringify(leads));
        }
      } else if (action === "deleted") {
        window.Telemetry.state.hiringLeads = (window.Telemetry.state.hiringLeads || []).filter(
          (l) => l.id !== payload.id
        );
        localStorage.setItem("portfolio_hiring_leads", JSON.stringify(window.Telemetry.state.hiringLeads));
      }
      updateDashboardHiringUI();
    });

    window.PortfolioAPI.onTelemetry((action, payload) => {
      if (action === "sync") {
        payload.forEach((log) => window.Telemetry.mergeRemoteEvent(log));
      } else if (action === "event") {
        window.Telemetry.mergeRemoteEvent(payload);
      }
      populateActivityFeed();
    });
  };

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

  window.updateDashboardHiringUI = updateDashboardHiringUI;
  window.populateActivityFeed = populateActivityFeed;

  checkAuth();

  setInterval(() => {
    if (isOwnerAuthenticated()) {
      refreshDashboardTelemetry();
      if (graphTimeFilter && graphTimeFilter.value === "live") {
        updateTrafficChart("live");
      }
    }
  }, 1000);
});
