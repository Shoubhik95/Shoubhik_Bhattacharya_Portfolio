/**
 * Telemetry and User Activity Tracker Module
 * Collects interaction metrics, device details, and live events.
 */

window.Telemetry = (() => {
  // --- State Variables ---
  const getReferrerSource = () => {
    const ref = document.referrer.toLowerCase();
    if (!ref) return "direct";
    if (ref.includes("github.com") || ref.includes("github.io")) {
      return "github";
    }
    if (ref.includes("netlify.app") || ref.includes("127.0.0.1") || ref.includes("localhost")) {
      return "netlify";
    }
    if (ref.includes("google.") || ref.includes("bing.") || ref.includes("yahoo.") || ref.includes("duckduckgo.") || ref.includes("yandex.") || ref.includes("baidu.")) {
      return "search";
    }
    return "refer";
  };

  let activeSectionKey = 'about';
  let sectionEntryTime = Date.now();
  
  const sectionDurations = { about: 0, skills: 0, education: 0, projects: 0, certificates: 0 };
  const sectionClicks = { about: 0, skills: 0, education: 0, projects: 0, certificates: 0 };
  const projectClicks = {};

  const lastSyncedDurations = { about: 0, skills: 0, education: 0, projects: 0, certificates: 0 };
  const lastSyncedClicks = { about: 0, skills: 0, education: 0, projects: 0, certificates: 0 };
  const lastSyncedProjectClicks = {};

  const changeActiveSection = (sectionId) => {
    const id = sectionId.toLowerCase();
    if (sectionDurations[id] !== undefined && id !== activeSectionKey) {
      const elapsed = Math.floor((Date.now() - sectionEntryTime) / 1000);
      if (elapsed > 0) {
        sectionDurations[activeSectionKey] += elapsed;
      }
      activeSectionKey = id;
      sectionEntryTime = Date.now();
      syncEngagementData();
    }
  };

  let syncTimeout;
  const syncEngagementData = () => {
    clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
      const elapsed = Math.floor((Date.now() - sectionEntryTime) / 1000);
      const currentDurations = { ...sectionDurations };
      if (elapsed > 0 && currentDurations[activeSectionKey] !== undefined) {
        currentDurations[activeSectionKey] += elapsed;
      }
      
      const deltaDurations = {};
      for (const key in currentDurations) {
        deltaDurations[key] = currentDurations[key] - lastSyncedDurations[key];
      }
      
      const deltaClicks = {};
      for (const key in sectionClicks) {
        deltaClicks[key] = sectionClicks[key] - lastSyncedClicks[key];
      }
      
      const deltaProjectClicks = {};
      for (const key in projectClicks) {
        deltaProjectClicks[key] = projectClicks[key] - (lastSyncedProjectClicks[key] || 0);
      }
      
      const hasDurations = Object.values(deltaDurations).some(v => v > 0);
      const hasClicks = Object.values(deltaClicks).some(v => v > 0);
      const hasProjectClicks = Object.values(deltaProjectClicks).some(v => v > 0);
      
      if (!hasDurations && !hasClicks && !hasProjectClicks) return;
      
      fetch('/api/telemetry/engagement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionKey: sessionStorage.getItem('portfolio_session_key'),
          durations: deltaDurations,
          clicks: deltaClicks,
          projectClicks: deltaProjectClicks,
          metrics: {
            totalClicks: state.totalClicks,
            skillsFlipped: state.skillsFlipped,
            projectsOpened: state.projectsOpened,
            resumeDownloads: state.resumeDownloads,
            externalClicks: state.externalClicks
          }
        })
      }).then(res => {
        if (res.ok) {
          for (const key in currentDurations) {
            lastSyncedDurations[key] = currentDurations[key];
          }
          for (const key in sectionClicks) {
            lastSyncedClicks[key] = sectionClicks[key];
          }
          for (const key in projectClicks) {
            lastSyncedProjectClicks[key] = projectClicks[key];
          }
          sectionEntryTime = Date.now();
        }
      }).catch(e => console.warn("Failed to sync engagement metrics:", e));
    }, 2000);
  };

  const state = {
    totalClicks: 0,
    skillsFlipped: 0,
    projectsOpened: 0,
    resumeDownloads: 0,
    externalClicks: 0,
    sessionStartTime: Date.now(),
    currentLevel: "LVL 1: About",
    maxScrollDepth: 0,
    activityLogs: [],
    hiringLeads: [],
    historicalTelemetry: {},
    deviceData: {
      ip: "Retrieving...",
      region: "Retrieving...",
      browser: "Unknown",
      os: "Unknown",
      resolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language || "N/A",
      network: "N/A",
      referrer: document.referrer || "Direct Visit",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "N/A",
      cookiesEnabled: navigator.cookieEnabled ? "Enabled" : "Disabled",
      doNotTrack: navigator.doNotTrack === "1" ? "Active" : "Inactive",
      onlineStatus: navigator.onLine ? "Online" : "Offline"
    }
  };

  // --- Historical Analytics Engine (Real Data Collection) ---
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/telemetry/stats');
      if (res.status === 401 || res.status === 403) {
        if (typeof window.handleUnauthorized === 'function') {
          window.handleUnauthorized();
        }
        return;
      }
      if (res.ok) {
        const data = await res.json();
        state.activityLogs = data.activityLogs || [];
        state.historicalTelemetry = data.historicalTelemetry || {};
        state.visitorSessions = data.visitorSessions || [];
        state.sharesCount = data.sharesCount || 0;
        if (typeof window.populateActivityFeed === 'function') {
          window.populateActivityFeed();
        }
        if (typeof window.populateVisitorSessionsDropdown === 'function') {
          window.populateVisitorSessionsDropdown();
        }
      }
    } catch (e) {
      console.warn("Failed to fetch telemetry stats from server:", e);
    }
  };

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/hiring-leads');
      if (res.status === 401 || res.status === 403) {
        if (typeof window.handleUnauthorized === 'function') {
          window.handleUnauthorized();
        }
        return;
      }
      if (res.ok) {
        const data = await res.json();
        state.hiringLeads = data;
        if (typeof window.updateDashboardHiringUI === 'function') {
          window.updateDashboardHiringUI();
        }
      }
    } catch (e) {
      console.warn("Failed to fetch hiring leads from server:", e);
    }
  };

  const getHistoricalStats = (timeframe) => {
    const history = state.historicalTelemetry || {};
    let daysLimit = 30; // monthly default
    if (timeframe === 'weekly') daysLimit = 7;
    if (timeframe === 'yearly') daysLimit = 365;

    const cutoffDate = Date.now() - (daysLimit * 24 * 3600 * 1000);
    
    let direct = 0;
    let search = 0;
    let refer = 0;

    for (const dateStr in history) {
      const dateMs = Date.parse(dateStr);
      if (dateMs >= cutoffDate) {
        const data = history[dateStr];
        direct += data.direct || 0;
        search += data.search || 0;
        refer += data.refer || 0;
      }
    }

    const totalVisits = direct + search + refer;

    if (totalVisits === 0) {
      return { total: 0, direct: 0, search: 0, refer: 0 };
    }

    return {
      total: totalVisits,
      direct: Math.round((direct / totalVisits) * 100),
      search: Math.round((search / totalVisits) * 100),
      refer: Math.round((refer / totalVisits) * 100)
    };
  };

  // --- Offline Telemetry Queue Helpers ---
  const getOfflineQueue = () => {
    try {
      const q = localStorage.getItem('portfolio_telemetry_queue');
      return q ? JSON.parse(q) : [];
    } catch (e) {
      return [];
    }
  };

  const saveOfflineQueue = (queue) => {
    try {
      localStorage.setItem('portfolio_telemetry_queue', JSON.stringify(queue.slice(-50)));
    } catch (e) {
      console.warn("Failed to save offline telemetry queue:", e);
    }
  };

  const queueOfflineEvent = (eventData) => {
    const queue = getOfflineQueue();
    queue.push(eventData);
    saveOfflineQueue(queue);
  };

  let isSyncing = false;
  const syncOfflineQueue = async () => {
    if (isSyncing || !navigator.onLine) return;
    const queue = getOfflineQueue();
    if (queue.length === 0) return;
    isSyncing = true;
    
    while (queue.length > 0) {
      const event = queue[0];
      try {
        const res = await fetch('/api/telemetry/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event)
        });
        if (res.ok) {
          queue.shift();
          saveOfflineQueue(queue);
        } else {
          break;
        }
      } catch (err) {
        break;
      }
    }
    isSyncing = false;
  };

  window.addEventListener('online', syncOfflineQueue);

  // --- Logger ---
  const logEvent = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    state.activityLogs.unshift({ time, message, type });
    if (state.activityLogs.length > 100) state.activityLogs.pop();
    
    const eventData = { 
      message, 
      type, 
      telemetryState: { source: getReferrerSource() } 
    };

    if (!navigator.onLine) {
      queueOfflineEvent(eventData);
    } else {
      fetch('/api/telemetry/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      }).catch(err => {
        console.warn("Failed to log telemetry to server, queueing offline:", err);
        queueOfflineEvent(eventData);
      });
    }

    // Update live UI feed if visible
    const dashLogContainer = document.getElementById("dash-activity-log");
    if (dashLogContainer) {
      if (typeof window.populateActivityFeed === 'function') {
        window.populateActivityFeed();
      } else {
        const logClass = type === 'alert' ? 'alert-event' : (type === 'highlight' ? 'highlight-event' : '');
        const logItem = document.createElement("div");
        logItem.className = `feed-item ${logClass}`;
        logItem.innerHTML = `<div class="feed-dot"></div><div class="feed-text">[${time}] ${message}</div>`;
        dashLogContainer.insertBefore(logItem, dashLogContainer.firstChild);
        if (dashLogContainer.children.length > 100) {
          dashLogContainer.removeChild(dashLogContainer.lastChild);
        }
      }
    }
  };

  // --- Export Data ---
  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      telemetryVersion: "1.1",
      exportTime: new Date().toISOString(),
      durationSeconds: Math.floor((Date.now() - state.sessionStartTime) / 1000),
      metrics: {
        totalClicks: state.totalClicks,
        skillsFlipped: state.skillsFlipped,
        projectsOpened: state.projectsOpened,
        resumeDownloads: state.resumeDownloads,
        externalClicks: state.externalClicks,
        maxScrollDepth: state.maxScrollDepth,
        finalActiveSection: state.currentLevel
      },
      device: state.deviceData,
      logs: state.activityLogs
    }, null, 2));

    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `telemetry_report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    logEvent("Telemetry data successfully exported", "highlight");
  };

  // --- Setup Tracking Listeners ---
  const init = () => {
    // 1. General Clicks & Link Tracking
    document.body.addEventListener('click', (e) => {
      state.totalClicks++;
      
      // Track clicks per section
      const sectionEl = e.target.closest('section');
      if (sectionEl) {
        const id = sectionEl.id.toLowerCase();
        if (sectionClicks[id] !== undefined) {
          sectionClicks[id]++;
          syncEngagementData();
        }
      }

      const target = e.target.closest('a, button');
      if (target) {
        const text = (target.innerText || target.getAttribute('aria-label') || target.tagName).trim().substring(0, 30);
        if (target.tagName === 'A') {
          const href = target.getAttribute('href') || '';
          if (href.includes('Resume') || target.download) {
            state.resumeDownloads++;
            logEvent(`Downloaded Resume (${text})`, 'highlight');
          } else if (href.startsWith('mailto:')) {
            state.externalClicks++;
            logEvent(`Clicked contact email link`, 'highlight');
          } else if (href.startsWith('http') || href.startsWith('//')) {
            state.externalClicks++;
            logEvent(`Followed external link: ${href}`, 'alert');
            if (href.includes("github.com/Shoubhik95")) {
              fetch('/api/telemetry/github-click', { method: 'POST' }).catch(() => {});
            } else if (href.includes("netlify.app")) {
              fetch('/api/telemetry/netlify-click', { method: 'POST' }).catch(() => {});
            }
          } else {
            logEvent(`Navigated anchor: ${href}`, 'info');
          }
        } else if (target.tagName === 'BUTTON') {
          if (!target.id.startsWith('owner-') && !target.id.startsWith('passcode-')) {
            logEvent(`Clicked button: ${text}`, 'info');
          }
        }
      } else {
        const clickTarget = (e.target.className || e.target.tagName || 'element').substring(0, 30);
        logEvent(`Clicked screen: ${clickTarget}`, 'info');
      }
    }, true); // use capture to ensure we log clicks even if stopPropagation is used

    // 2. Skill Card Hover flips
    document.body.addEventListener('mouseover', (e) => {
      const flipCard = e.target.closest('.flip-card');
      if (flipCard && !flipCard.contains(e.relatedTarget)) {
        state.skillsFlipped++;
        const skillTitle = flipCard.querySelector('.skill-name') ? flipCard.querySelector('.skill-name').textContent : 'Unknown';
        logEvent(`Flipped skill card: ${skillTitle}`, 'info');
      }
    });

    // 3. Scroll depth
    window.addEventListener('scroll', () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const depth = Math.round((window.scrollY / docHeight) * 100);
        if (depth > state.maxScrollDepth) {
          state.maxScrollDepth = depth;
          if (state.maxScrollDepth % 25 === 0) {
            logEvent(`Scrolled to ${state.maxScrollDepth}% of page`, 'info');
          }
        }
      }
    });

    // 4. Project Clicks Interceptor
    document.addEventListener('click', (e) => {
      const projCard = e.target.closest('.project-card-wrapper');
      if (projCard) {
        const title = projCard.getAttribute("data-title") || "Unknown Project";
        state.projectsOpened++;
        logEvent(`Opened project details: ${title}`, 'highlight');
        
        if (!projectClicks[title]) {
          projectClicks[title] = 0;
        }
        projectClicks[title]++;
        syncEngagementData();
      }
    });

    // 5. Active Intrusion & Threat Signature Scanner
    const scanURLForThreats = () => {
      const urlParams = decodeURIComponent(window.location.search);
      const suspiciousPatterns = [
        /<script>/i,
        /javascript:/i,
        /onload\s*=/i,
        /onerror\s*=/i,
        /select\s+.*\s+from/i,
        /union\s+select/i,
        /or\s+1\s*=\s*1/i,
        /['"]\s*or\s*['"]/i
      ];

      suspiciousPatterns.forEach(pattern => {
        if (pattern.test(urlParams)) {
          logEvent(`SECURITY ALERT: Threat signature detected in URL parameters!`, "alert");
        }
      });
    };
    scanURLForThreats();

    document.addEventListener('copy', () => {
      logEvent("User copied text from page", "alert");
      const toast = document.getElementById("cyber-security-toast");
      if (toast) {
        toast.classList.add("show");
        if (window.cyberToastTimeout) clearTimeout(window.cyberToastTimeout);
        window.cyberToastTimeout = setTimeout(() => {
          toast.classList.remove("show");
        }, 5000);
      }
    });

    let selectTimeout;
    document.addEventListener('selectionchange', () => {
      clearTimeout(selectTimeout);
      selectTimeout = setTimeout(() => {
        const selectedText = window.getSelection().toString().trim();
        if (selectedText.length > 3) {
          logEvent(`User selected text: "${selectedText.substring(0, 30)}..."`, "alert");
          const toast = document.getElementById("cyber-security-toast");
          if (toast) {
            toast.classList.add("show");
            if (window.cyberToastTimeout) clearTimeout(window.cyberToastTimeout);
            window.cyberToastTimeout = setTimeout(() => {
              toast.classList.remove("show");
            }, 5000);
          }
        }
      }, 700);
    });

    document.addEventListener('contextmenu', (e) => {
      if (e.target.closest('input, textarea')) return;
      e.preventDefault();
      logEvent("User right-click blocked", "alert");
    });

    document.addEventListener('visibilitychange', () => {
      const visibilityMsg = document.hidden ? "User switched tab (Background)" : "User returned to tab (Active)";
      logEvent(visibilityMsg, "info");
      
      if (document.hidden) {
        const elapsed = Math.floor((Date.now() - sectionEntryTime) / 1000);
        if (elapsed > 0 && sectionDurations[activeSectionKey] !== undefined) {
          sectionDurations[activeSectionKey] += elapsed;
        }
        syncEngagementData();
      } else {
        sectionEntryTime = Date.now();
      }
    });

    window.addEventListener('online', () => {
      state.deviceData.onlineStatus = "Online";
      logEvent("Network status restored: Online", "highlight");
    });

    window.addEventListener('offline', () => {
      state.deviceData.onlineStatus = "Offline";
      logEvent("Network connection lost: Offline", "alert");
    });

    // 6. Hiring Interest Helper
    window.Telemetry.addHiringLead = (name, email = '', companyLink = '') => {
      fetch('/api/hiring-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, companyLink })
      })
      .then(res => {
        if (res.ok) {
          fetchLeads();
          logEvent(`Hiring Lead Added: ${name}`, 'highlight');
        }
      })
      .catch(err => console.error("Failed to add hiring lead:", err));
    };

    window.Telemetry.deleteHiringLead = (idx) => {
      fetch(`/api/hiring-lead/${idx}`, {
        method: 'DELETE'
      })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          if (typeof window.handleUnauthorized === 'function') {
            window.handleUnauthorized();
          }
          return;
        }
        if (res.ok) {
          fetchLeads();
          logEvent(`Hiring Lead Deleted at index ${idx}`, 'alert');
        }
      })
      .catch(err => console.error("Failed to delete hiring lead:", err));
    };

    // 7. Gather browser data
    const ua = navigator.userAgent;
    if (ua.indexOf("Firefox") > -1) state.deviceData.browser = "Mozilla Firefox";
    else if (ua.indexOf("SamsungBrowser") > -1) state.deviceData.browser = "Samsung Internet";
    else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) state.deviceData.browser = "Opera";
    else if (ua.indexOf("Edge") > -1 || ua.indexOf("Edg") > -1) state.deviceData.browser = "Microsoft Edge";
    else if (ua.indexOf("Chrome") > -1) state.deviceData.browser = "Google Chrome";
    else if (ua.indexOf("Safari") > -1) state.deviceData.browser = "Apple Safari";

    if (ua.indexOf("Windows NT 10.0") > -1) state.deviceData.os = "Windows 10/11";
    else if (ua.indexOf("Macintosh") > -1) state.deviceData.os = "macOS";
    else if (ua.indexOf("iPhone") > -1) state.deviceData.os = "iOS (iPhone)";
    else if (ua.indexOf("Android") > -1) state.deviceData.os = "Android OS";
    else if (ua.indexOf("Linux") > -1) state.deviceData.os = "Linux";

    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    state.deviceData.network = conn ? (conn.effectiveType || "N/A").toUpperCase() : "N/A";

    const recordSessionVisit = () => {
      const source = getReferrerSource();
      if (!sessionStorage.getItem('portfolio_session_key')) {
        fetch('/api/telemetry/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source, deviceData: state.deviceData })
        })
        .then(res => res.json())
        .then(data => {
          if (data && data.sessionKey) {
            sessionStorage.setItem('portfolio_session_key', data.sessionKey);
          }
          fetchStats();
        })
        .catch(err => console.warn("Failed to record session visit:", err));
      } else {
        fetchStats();
      }
      fetchLeads();
    };

    const fetchIP = () => {
      fetch("https://ipapi.co/json/")
        .then(r => {
          if (!r.ok) throw new Error("ipapi.co rate limit or block");
          return r.json();
        })
        .then(data => {
          if (data.ip) state.deviceData.ip = data.ip;
          if (data.city && data.country_name) {
            state.deviceData.region = `${data.city}, ${data.country_name}`;
            logEvent(`User IP Resolved: ${data.ip} (${data.city}, ${data.country_name})`, "highlight");
          } else {
            state.deviceData.region = "Unknown Region";
          }
        })
        .catch(err => {
          // Fallback to HTTPS compatible ipify API
          return fetch("https://api.ipify.org?format=json")
            .then(r => {
              if (!r.ok) throw new Error("ipify.org error");
              return r.json();
            })
            .then(data => {
              if (data.ip) {
                state.deviceData.ip = data.ip;
                state.deviceData.region = "Resolved via Backup API";
                logEvent(`User IP Resolved (Backup): ${data.ip}`, "highlight");
              }
            })
            .catch(err2 => {
              state.deviceData.ip = "Blocked / Ad-Blocker";
              state.deviceData.region = "Sandbox / VPN / Offline";
              logEvent("IP telemetry blocked by browser security policies", "info");
            });
        })
        .finally(() => {
          recordSessionVisit();
        });
    };
    fetchIP();

    syncOfflineQueue();
    logEvent("Telemetry engine initialised with security policies", "info");
  };

  // Run on startup
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  const deleteVisitorSession = (sessionKey) => {
    fetch(`/api/visitor-session/${sessionKey}`, {
      method: 'DELETE'
    })
    .then(res => {
      if (res.status === 401 || res.status === 403) {
        if (typeof window.handleUnauthorized === 'function') {
          window.handleUnauthorized();
        }
        return;
      }
      if (res.ok) {
        fetchStats();
        logEvent(`Deleted Visitor Session log: ${sessionKey}`, 'alert');
      }
    })
    .catch(err => console.error("Failed to delete visitor session:", err));
  };

  return {
    state,
    logEvent,
    exportData,
    getHistoricalStats,
    fetchStats,
    fetchLeads,
    changeActiveSection,
    deleteVisitorSession
  };
})();
