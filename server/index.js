require("dotenv").config();

const path = require("path");
const http = require("http");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");

const store = require("./store");
const { sendOtpEmail } = require("./mailer");

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "portfolio-dev-secret-change-me";
const ROOT = path.join(__dirname, "..");
const SERVE_STATIC = process.env.SERVE_STATIC !== "false";

function getAllowedOrigins() {
  if (process.env.ALLOWED_ORIGINS) {
    return process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return ["http://localhost:3000", "http://127.0.0.1:3000"];
}

const allowedOrigins = getAllowedOrigins();

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("[cors] Blocked origin:", origin);
      callback(null, false);
    }
  },
  credentials: true,
};

const io = new Server(server, { cors: corsOptions });

app.use(cors(corsOptions));
app.use(express.json());

function broadcast(event, payload) {
  io.emit(event, payload);
}

function createToken() {
  return jwt.sign({ role: "owner" }, JWT_SECRET, { expiresIn: "8h" });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function sanitizeText(value, maxLen = 200) {
  return String(value || "")
    .replace(/[<>"']/g, "")
    .trim()
    .slice(0, maxLen);
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    storage: process.env.MONGODB_URI ? "mongodb" : "local-json",
  });
});

app.get("/api/hiring", async (_req, res) => {
  const leads = await store.getHiringLeads();
  res.json({ success: true, leads });
});

app.post("/api/hiring", async (req, res) => {
  const name = sanitizeText(req.body.name);
  const email = sanitizeText(req.body.email, 120);
  const companyLink = sanitizeText(req.body.companyLink, 300);

  if (!name) {
    return res.status(400).json({ success: false, error: "Name is required" });
  }

  const lead = {
    id: uuidv4(),
    name,
    email,
    companyLink,
    timestamp: new Date().toLocaleString(),
    createdAt: new Date().toISOString(),
  };

  await store.addHiringLead(lead);
  await store.incrementHiringMetric();

  const event = {
    time: new Date().toLocaleTimeString(),
    message: `Hiring Lead Added: ${name}`,
    type: "highlight",
  };
  await store.addTelemetryEvent(event);
  broadcast("hiring:new", lead);
  broadcast("telemetry:event", event);

  res.status(201).json({ success: true, lead });
});

app.delete("/api/hiring/:id", authMiddleware, async (req, res) => {
  const removed = await store.deleteHiringLead(req.params.id);
  if (!removed) {
    return res.status(404).json({ success: false, error: "Lead not found" });
  }

  const event = {
    time: new Date().toLocaleTimeString(),
    message: `Hiring Lead Deleted: ${removed.name}`,
    type: "alert",
  };
  await store.addTelemetryEvent(event);
  broadcast("hiring:deleted", { id: req.params.id });
  broadcast("telemetry:event", event);

  res.json({ success: true });
});

app.get("/api/telemetry/logs", authMiddleware, async (_req, res) => {
  const data = await store.getTelemetry();
  res.json({ success: true, logs: data.activityLogs, metrics: data.metrics });
});

app.post("/api/telemetry/event", async (req, res) => {
  const message = sanitizeText(req.body.message, 500);
  const type = ["info", "highlight", "alert"].includes(req.body.type) ? req.body.type : "info";

  if (!message) {
    return res.status(400).json({ success: false, error: "Message required" });
  }

  const event = { time: new Date().toLocaleTimeString(), message, type };
  await store.addTelemetryEvent(event);
  broadcast("telemetry:event", event);
  res.json({ success: true, event });
});

app.get("/api/auth/status", async (_req, res) => {
  const auth = await store.getAuth();
  res.json({
    success: true,
    lockoutActive: auth.lockoutActive,
    failedAttempts: auth.failedAttempts,
  });
});

app.post("/api/auth/login", async (req, res) => {
  const auth = await store.getAuth();

  if (auth.lockoutActive) {
    return res.status(423).json({
      success: false,
      locked: true,
      error: "Security lockout active. Generate OTP to unlock.",
    });
  }

  const passcode = String(req.body.passcode || "");
  const valid = auth.passcodeHash && (await bcrypt.compare(passcode, auth.passcodeHash));

  if (valid) {
    auth.failedAttempts = 0;
    auth.lockoutActive = false;
    await store.saveAuth(auth);

    const event = { time: new Date().toLocaleTimeString(), message: "Owner Access Granted", type: "highlight" };
    await store.addTelemetryEvent(event);
    broadcast("telemetry:event", event);

    return res.json({ success: true, token: createToken() });
  }

  auth.failedAttempts = (auth.failedAttempts || 0) + 1;
  const remaining = Math.max(0, 3 - auth.failedAttempts);

  const failEvent = {
    time: new Date().toLocaleTimeString(),
    message: `Failed Security Auth Attempt (${auth.failedAttempts}/3)`,
    type: "alert",
  };
  await store.addTelemetryEvent(failEvent);
  broadcast("telemetry:event", failEvent);

  if (auth.failedAttempts >= 3) {
    auth.lockoutActive = true;
    await store.saveAuth(auth);

    const lockEvent = {
      time: new Date().toLocaleTimeString(),
      message: "SECURITY LOCKOUT ACTIVE: PANEL ACCESSIBILITY REVOKED",
      type: "alert",
    };
    await store.addTelemetryEvent(lockEvent);
    broadcast("telemetry:event", lockEvent);

    return res.status(423).json({
      success: false,
      locked: true,
      attemptsRemaining: 0,
      error: "Too many failed attempts. Panel locked.",
    });
  }

  await store.saveAuth(auth);
  res.status(401).json({
    success: false,
    locked: false,
    attemptsRemaining: remaining,
    error: `Invalid passcode. ${remaining} attempt(s) remaining.`,
  });
});

app.post("/api/auth/request-otp", async (req, res) => {
  const purpose = req.body.purpose === "reset" ? "reset" : "lockout";
  const auth = await store.getAuth();

  if (purpose === "reset" && auth.lockoutActive) {
    return res.status(423).json({ success: false, error: "Use lockout OTP while panel is locked." });
  }

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  await store.saveOtp(purpose, otp, expiresAt);

  const subject =
    purpose === "reset" ? "Owner Dashboard Passcode Reset OTP" : "Owner Dashboard OTP Security Code";

  const purposeLabel =
    purpose === "reset"
      ? "Use this code to reset your dashboard passcode."
      : "Use this code to unlock the security dashboard after a lockout.";

  try {
    const result = await sendOtpEmail(process.env.OWNER_EMAIL, subject, otp, purposeLabel);

    const event = {
      time: new Date().toLocaleTimeString(),
      message: purpose === "reset" ? "Passcode Reset OTP Generated and Sent" : "OTP Generated and Sent to Owner",
      type: "highlight",
    };
    await store.addTelemetryEvent(event);
    broadcast("telemetry:event", event);

    res.json({
      success: true,
      message: result.message,
      devMode: result.devMode,
      email: process.env.OWNER_EMAIL,
    });
  } catch (err) {
    console.error("[auth] OTP email failed:", err);
    res.status(500).json({
      success: false,
      error: "Failed to send OTP email. Check Gmail credentials in .env",
    });
  }
});

app.post("/api/auth/verify-lockout", async (req, res) => {
  const otp = String(req.body.otp || "").trim();
  const valid = await store.consumeOtp("lockout", otp);

  if (!valid) {
    const event = {
      time: new Date().toLocaleTimeString(),
      message: "Failed OTP Lockout Verification Attempt",
      type: "alert",
    };
    await store.addTelemetryEvent(event);
    broadcast("telemetry:event", event);
    return res.status(401).json({ success: false, error: "Invalid or expired OTP." });
  }

  const auth = await store.getAuth();
  auth.lockoutActive = false;
  auth.failedAttempts = 0;
  await store.saveAuth(auth);

  const event = {
    time: new Date().toLocaleTimeString(),
    message: "Owner Access Restored via OTP Verification",
    type: "highlight",
  };
  await store.addTelemetryEvent(event);
  broadcast("telemetry:event", event);

  res.json({ success: true, token: createToken() });
});

app.post("/api/auth/reset-passcode", async (req, res) => {
  const otp = String(req.body.otp || "").trim();
  const newPasscode = String(req.body.newPasscode || "");
  const confirmPasscode = String(req.body.confirmPasscode || "");

  if (!(await store.consumeOtp("reset", otp))) {
    return res.status(401).json({ success: false, error: "Invalid or expired OTP." });
  }

  if (!newPasscode) {
    return res.status(400).json({ success: false, error: "New passcode cannot be empty." });
  }

  if (newPasscode !== confirmPasscode) {
    return res.status(400).json({ success: false, error: "Passcodes do not match." });
  }

  const auth = await store.getAuth();
  auth.passcodeHash = await bcrypt.hash(newPasscode, 10);
  auth.failedAttempts = 0;
  auth.lockoutActive = false;
  await store.saveAuth(auth);

  const event = {
    time: new Date().toLocaleTimeString(),
    message: "Passcode Reset Successfully by Owner",
    type: "highlight",
  };
  await store.addTelemetryEvent(event);
  broadcast("telemetry:event", event);

  res.json({ success: true, token: createToken() });
});

io.on("connection", async (socket) => {
  socket.emit("hiring:sync", await store.getHiringLeads());
  const telemetry = await store.getTelemetry();
  socket.emit("telemetry:sync", telemetry.activityLogs);
});

if (SERVE_STATIC) {
  app.use(express.static(ROOT));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/") || req.path.startsWith("/socket.io")) return next();
    const ext = path.extname(req.path);
    if (ext) return next();
    res.sendFile(path.join(ROOT, "index.html"));
  });
}

async function start() {
  await store.initStore();
  const defaultPasscode = process.env.DEFAULT_PASSCODE || "owner123";
  await store.initAuth(defaultPasscode);

  server.listen(PORT, () => {
    console.log("");
    console.log("  Shoubhik Portfolio API running");
    console.log(`  Port: ${PORT}`);
    if (SERVE_STATIC) {
      console.log(`  Website:   http://localhost:${PORT}`);
      console.log(`  Dashboard: http://localhost:${PORT}/security.html`);
    }
    console.log(`  Storage:   ${process.env.MONGODB_URI ? "MongoDB (live)" : "Local JSON"}`);
    console.log(`  CORS:      ${allowedOrigins.join(", ")}`);
    console.log(`  Default passcode: ${defaultPasscode}`);
    console.log("");
    if (!process.env.MONGODB_URI) {
      console.log("  ⚠  Live deploy: set MONGODB_URI on Render so hire data persists");
    }
    if (!process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD === "your-16-char-app-password-here") {
      console.log("  ⚠  Gmail not configured — OTP prints in console until GMAIL_APP_PASSWORD is set");
    }
    console.log("");
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
