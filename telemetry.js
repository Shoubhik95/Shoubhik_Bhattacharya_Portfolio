/**
 * Telemetry and User Activity Tracker Module
 * Collects interaction metrics, device details, and live events.
 */

window.Telemetry = (() => {
  // --- State Variables ---
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
    hiringLeads: JSON.parse(localStorage.getItem('portfolio_hiring_leads') || '[]'),
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
  const incrementActionCount = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const history = JSON.parse(localStorage.getItem('portfolio_historical_telemetry') || '{}');
    if (!history[todayStr]) {
      history[todayStr] = { direct: 0, search: 0, refer: 0, actions: 0 };
    }
    history[todayStr].actions++;
    localStorage.setItem('portfolio_historical_telemetry', JSON.stringify(history));
  };

  const getHistoricalStats = (timeframe) => {
    const history = JSON.parse(localStorage.getItem('portfolio_historical_telemetry') || '{}');
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

  // --- Logger ---
  const logEvent = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    state.activityLogs.unshift({ time, message, type });
    if (state.activityLogs.length > 100) state.activityLogs.pop();
    
    // Save to historical counts
    incrementActionCount();

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
      const lead = {
        name: name.trim(),
        email: email.trim(),
        companyLink: companyLink.trim(),
        timestamp: new Date().toLocaleString()
      };
      const leads = JSON.parse(localStorage.getItem('portfolio_hiring_leads') || '[]');
      leads.unshift(lead);
      localStorage.setItem('portfolio_hiring_leads', JSON.stringify(leads));
      state.hiringLeads = leads;
      logEvent(`Hiring Lead Added: ${lead.name}`, 'highlight');
    };

    window.Telemetry.deleteHiringLead = (idx) => {
      const leads = JSON.parse(localStorage.getItem('portfolio_hiring_leads') || '[]');
      const removed = leads.splice(idx, 1);
      localStorage.setItem('portfolio_hiring_leads', JSON.stringify(leads));
      state.hiringLeads = leads;
      logEvent(`Hiring Lead Deleted: ${removed[0] ? removed[0].name : ''}`, 'alert');
      if (typeof window.updateDashboardHiringUI === 'function') {
        window.updateDashboardHiringUI();
      }
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
          fetch("https://api.ipify.org?format=json")
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
        });
    };
    fetchIP();

    // 8. Record Session Visit (Historical Analytics)
    const getReferrerSource = () => {
      const ref = document.referrer.toLowerCase();
      if (!ref) return "direct";
      if (ref.includes("google.") || ref.includes("bing.") || ref.includes("yahoo.") || ref.includes("duckduckgo.") || ref.includes("yandex.") || ref.includes("baidu.")) {
        return "search";
      }
      return "refer";
    };

    const recordSessionVisit = () => {
      const source = getReferrerSource();
      const todayStr = new Date().toISOString().split('T')[0];
      const history = JSON.parse(localStorage.getItem('portfolio_historical_telemetry') || '{}');
      
      if (!sessionStorage.getItem('portfolio_session_active')) {
        sessionStorage.setItem('portfolio_session_active', 'true');
        if (!history[todayStr]) {
          history[todayStr] = { direct: 0, search: 0, refer: 0, actions: 0 };
        }
        if (source === 'direct') history[todayStr].direct++;
        else if (source === 'search') history[todayStr].search++;
        else history[todayStr].refer++;
        
        localStorage.setItem('portfolio_historical_telemetry', JSON.stringify(history));
      }
    };
    recordSessionVisit();

    logEvent("Telemetry engine initialised with security policies", "info");
  };

  // Run on startup
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    state,
    logEvent,
    exportData,
    getHistoricalStats
  };
})();
