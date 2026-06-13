const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");

const DATA_DIR = path.join(__dirname, "data");

const files = {
  hiring: path.join(DATA_DIR, "hiring-leads.json"),
  auth: path.join(DATA_DIR, "auth.json"),
  otps: path.join(DATA_DIR, "otps.json"),
  telemetry: path.join(DATA_DIR, "telemetry.json"),
};

let db = null;
let useMongo = false;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJson(filePath, fallback) {
  ensureDataDir();
  try {
    if (!fs.existsSync(filePath)) {
      writeJson(filePath, fallback);
      return structuredClone(fallback);
    }
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    writeJson(filePath, fallback);
    return structuredClone(fallback);
  }
}

function writeJson(filePath, data) {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

async function initStore() {
  if (!process.env.MONGODB_URI) {
    console.log("[store] Local JSON storage (localhost dev)");
    return;
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  db = client.db("shoubhik_portfolio");
  useMongo = true;
  console.log("[store] MongoDB connected — live data will persist");
}

async function getHiringLeads() {
  if (useMongo) {
    return db
      .collection("hiring_leads")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
  }
  return readJson(files.hiring, { leads: [] }).leads;
}

async function addHiringLead(lead) {
  if (useMongo) {
    await db.collection("hiring_leads").insertOne(lead);
    return lead;
  }
  const data = readJson(files.hiring, { leads: [] });
  data.leads.unshift(lead);
  writeJson(files.hiring, data);
  return lead;
}

async function deleteHiringLead(id) {
  if (useMongo) {
    const result = await db.collection("hiring_leads").findOneAndDelete({ id });
    return result || null;
  }
  const data = readJson(files.hiring, { leads: [] });
  const idx = data.leads.findIndex((l) => l.id === id);
  if (idx === -1) return null;
  const [removed] = data.leads.splice(idx, 1);
  writeJson(files.hiring, data);
  return removed;
}

async function initAuth(defaultPasscode) {
  if (useMongo) {
    const existing = await db.collection("settings").findOne({ _id: "auth" });
    if (existing && existing.passcodeHash) return existing;

    const passcodeHash = await bcrypt.hash(defaultPasscode, 10);
    const auth = {
      _id: "auth",
      passcodeHash,
      failedAttempts: 0,
      lockoutActive: false,
      updatedAt: new Date().toISOString(),
    };
    await db.collection("settings").replaceOne({ _id: "auth" }, auth, { upsert: true });
    return auth;
  }

  const existing = readJson(files.auth, null);
  if (existing && existing.passcodeHash) return existing;

  const passcodeHash = await bcrypt.hash(defaultPasscode, 10);
  const auth = {
    passcodeHash,
    failedAttempts: 0,
    lockoutActive: false,
    updatedAt: new Date().toISOString(),
  };
  writeJson(files.auth, auth);
  return auth;
}

async function getAuth() {
  if (useMongo) {
    const auth = await db.collection("settings").findOne({ _id: "auth" });
    return (
      auth || {
        passcodeHash: "",
        failedAttempts: 0,
        lockoutActive: false,
        updatedAt: null,
      }
    );
  }
  return readJson(files.auth, {
    passcodeHash: "",
    failedAttempts: 0,
    lockoutActive: false,
    updatedAt: null,
  });
}

async function saveAuth(auth) {
  auth.updatedAt = new Date().toISOString();
  if (useMongo) {
    const { _id, ...rest } = auth;
    await db.collection("settings").replaceOne(
      { _id: "auth" },
      { _id: "auth", ...rest },
      { upsert: true }
    );
    return;
  }
  writeJson(files.auth, auth);
}

async function saveOtp(purpose, otp, expiresAt) {
  if (useMongo) {
    await db.collection("otps").deleteMany({ purpose });
    await db.collection("otps").insertOne({
      purpose,
      otp,
      expiresAt,
      createdAt: new Date().toISOString(),
    });
    return;
  }
  const data = readJson(files.otps, { entries: [] });
  data.entries = data.entries.filter((e) => e.purpose !== purpose);
  data.entries.push({ purpose, otp, expiresAt, createdAt: new Date().toISOString() });
  writeJson(files.otps, data);
}

async function consumeOtp(purpose, otp) {
  const now = Date.now();

  if (useMongo) {
    const entry = await db.collection("otps").findOne({ purpose, otp });
    if (!entry || new Date(entry.expiresAt).getTime() <= now) return false;
    await db.collection("otps").deleteOne({ _id: entry._id });
    return true;
  }

  const data = readJson(files.otps, { entries: [] });
  const entry = data.entries.find(
    (e) => e.purpose === purpose && e.otp === otp && new Date(e.expiresAt).getTime() > now
  );
  if (!entry) return false;
  data.entries = data.entries.filter((e) => e !== entry);
  writeJson(files.otps, data);
  return true;
}

async function getTelemetry() {
  if (useMongo) {
    const logs = await db
      .collection("telemetry_logs")
      .find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();
    const metricsDoc = await db.collection("settings").findOne({ _id: "metrics" });
    return {
      activityLogs: logs.map(({ time, message, type }) => ({ time, message, type })),
      metrics: metricsDoc?.metrics || { totalVisitors: 0, totalHiringSubmissions: 0 },
    };
  }
  return readJson(files.telemetry, {
    activityLogs: [],
    metrics: { totalVisitors: 0, totalHiringSubmissions: 0 },
  });
}

async function addTelemetryEvent(event) {
  if (useMongo) {
    await db.collection("telemetry_logs").insertOne({
      ...event,
      createdAt: new Date().toISOString(),
    });
    const count = await db.collection("telemetry_logs").countDocuments();
    if (count > 200) {
      const oldest = await db
        .collection("telemetry_logs")
        .find({})
        .sort({ createdAt: 1 })
        .limit(count - 200)
        .toArray();
      await db.collection("telemetry_logs").deleteMany({
        _id: { $in: oldest.map((d) => d._id) },
      });
    }
    return event;
  }

  const data = readJson(files.telemetry, {
    activityLogs: [],
    metrics: { totalVisitors: 0, totalHiringSubmissions: 0 },
  });
  data.activityLogs.unshift(event);
  if (data.activityLogs.length > 200) {
    data.activityLogs = data.activityLogs.slice(0, 200);
  }
  writeJson(files.telemetry, data);
  return event;
}

async function incrementHiringMetric() {
  if (useMongo) {
    await db.collection("settings").updateOne(
      { _id: "metrics" },
      { $inc: { "metrics.totalHiringSubmissions": 1 } },
      { upsert: true }
    );
    return;
  }
  const data = readJson(files.telemetry, {
    activityLogs: [],
    metrics: { totalVisitors: 0, totalHiringSubmissions: 0 },
  });
  data.metrics.totalHiringSubmissions = (data.metrics.totalHiringSubmissions || 0) + 1;
  writeJson(files.telemetry, data);
}

module.exports = {
  initStore,
  getHiringLeads,
  addHiringLead,
  deleteHiringLead,
  initAuth,
  getAuth,
  saveAuth,
  saveOtp,
  consumeOtp,
  getTelemetry,
  addTelemetryEvent,
  incrementHiringMetric,
};
