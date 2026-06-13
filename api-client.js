/**
 * Backend API & real-time socket client for portfolio dashboard.
 * Works when served via `npm start` (http://localhost:3000).
 */
window.PortfolioAPI = (() => {
  const configuredUrl = (window.PORTFOLIO_CONFIG && window.PORTFOLIO_CONFIG.API_URL || "").replace(/\/$/, "");
  const API_BASE = configuredUrl || window.location.origin;
  let socket = null;
  let socketReady = false;
  const listeners = { hiring: [], telemetry: [] };

  const isBackendAvailable = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/health`, { method: "GET" });
      return res.ok;
    } catch {
      return false;
    }
  };

  const apiFetch = async (path, options = {}) => {
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    const token = sessionStorage.getItem("portfolio_owner_token");
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  };

  const initSocket = () => {
    if (typeof io === "undefined" || socket) return;

    socket = io(API_BASE, { transports: ["websocket", "polling"] });

    socket.on("connect", () => {
      socketReady = true;
    });

    socket.on("hiring:new", (lead) => {
      listeners.hiring.forEach((fn) => fn("new", lead));
    });

    socket.on("hiring:deleted", (payload) => {
      listeners.hiring.forEach((fn) => fn("deleted", payload));
    });

    socket.on("hiring:sync", (leads) => {
      listeners.hiring.forEach((fn) => fn("sync", leads));
    });

    socket.on("telemetry:event", (event) => {
      listeners.telemetry.forEach((fn) => fn("event", event));
    });

    socket.on("telemetry:sync", (logs) => {
      listeners.telemetry.forEach((fn) => fn("sync", logs));
    });
  };

  const onHiring = (fn) => {
    listeners.hiring.push(fn);
    initSocket();
  };

  const onTelemetry = (fn) => {
    listeners.telemetry.push(fn);
    initSocket();
  };

  const submitHiringLead = async (name, email, companyLink) => {
    const { ok, data } = await apiFetch("/api/hiring", {
      method: "POST",
      body: JSON.stringify({ name, email, companyLink }),
    });
    if (!ok) throw new Error(data.error || "Failed to submit hiring interest");
    return data.lead;
  };

  const fetchHiringLeads = async () => {
    const { ok, data } = await apiFetch("/api/hiring");
    if (!ok) return [];
    return data.leads || [];
  };

  const deleteHiringLead = async (id) => {
    const { ok, data } = await apiFetch(`/api/hiring/${id}`, { method: "DELETE" });
    if (!ok) throw new Error(data.error || "Failed to delete lead");
    return true;
  };

  const postTelemetryEvent = async (message, type = "info") => {
    try {
      await apiFetch("/api/telemetry/event", {
        method: "POST",
        body: JSON.stringify({ message, type }),
      });
    } catch {
      /* offline fallback — local telemetry still works */
    }
  };

  const login = async (passcode) => {
    const { ok, status, data } = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ passcode }),
    });
    if (data.token) sessionStorage.setItem("portfolio_owner_token", data.token);
    return { ok, status, ...data };
  };

  const getAuthStatus = async () => {
    const { ok, data } = await apiFetch("/api/auth/status");
    if (!ok) return { lockoutActive: false, failedAttempts: 0 };
    return data;
  };

  const requestOtp = async (purpose) => {
    const { ok, data } = await apiFetch("/api/auth/request-otp", {
      method: "POST",
      body: JSON.stringify({ purpose }),
    });
    if (!ok) throw new Error(data.error || "Failed to send OTP");
    return data;
  };

  const verifyLockoutOtp = async (otp) => {
    const { ok, data } = await apiFetch("/api/auth/verify-lockout", {
      method: "POST",
      body: JSON.stringify({ otp }),
    });
    if (data.token) sessionStorage.setItem("portfolio_owner_token", data.token);
    if (!ok) throw new Error(data.error || "Invalid OTP");
    return data;
  };

  const resetPasscode = async (otp, newPasscode, confirmPasscode) => {
    const { ok, data } = await apiFetch("/api/auth/reset-passcode", {
      method: "POST",
      body: JSON.stringify({ otp, newPasscode, confirmPasscode }),
    });
    if (data.token) sessionStorage.setItem("portfolio_owner_token", data.token);
    if (!ok) throw new Error(data.error || "Reset failed");
    return data;
  };

  const fetchTelemetryLogs = async () => {
    const { ok, data } = await apiFetch("/api/telemetry/logs");
    if (!ok) return [];
    return data.logs || [];
  };

  const logout = () => {
    sessionStorage.removeItem("portfolio_owner_token");
    sessionStorage.removeItem("portfolio_owner_authenticated");
  };

  const isAuthenticated = () => {
    return !!sessionStorage.getItem("portfolio_owner_token") ||
      sessionStorage.getItem("portfolio_owner_authenticated") === "true";
  };

  return {
    API_BASE,
    isBackendAvailable,
    initSocket,
    onHiring,
    onTelemetry,
    submitHiringLead,
    fetchHiringLeads,
    deleteHiringLead,
    postTelemetryEvent,
    login,
    getAuthStatus,
    requestOtp,
    verifyLockoutOtp,
    resetPasscode,
    fetchTelemetryLogs,
    logout,
    isAuthenticated,
    get socketReady() { return socketReady; },
  };
})();
