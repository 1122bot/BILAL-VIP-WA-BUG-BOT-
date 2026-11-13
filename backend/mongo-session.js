/**
 * =====================================================================
 *  BILAL VIP BOT — MongoDB Session Backup / Restore
 * =====================================================================
 *  Har WhatsApp session folder (backend/sessions/<number>/) ko MongoDB
 *  mein backup karta hai aur panel boot hone par wapas restore karta hai.
 *
 *  Isse panel restart / crash / migration ke baad bhi users ko dobara
 *  pair nahi karna padta — bot khud reconnect ho jata hai.
 *
 *  Env:
 *    MONGODB_URI   (required for backup; na ho to system normal chalta hai)
 *    MONGODB_DB    (optional, default: URI se)
 *    SESSION_BACKUP_INTERVAL_MS (optional, default 45000)
 * =====================================================================
 */

'use strict';

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const SESSIONS_DIR = path.join(__dirname, 'sessions');
const MAX_FILE_BYTES = 4 * 1024 * 1024; // 4 MB per file safety limit

let SessionBackup = null;
let enabled = false;
let timer = null;
let running = false;

/* ----------------------------- model ----------------------------- */
function getModel() {
  if (SessionBackup) return SessionBackup;
  const schema = new mongoose.Schema(
    {
      _id: { type: String }, // phone number
      files: { type: Object, default: {} },
      updatedAt: { type: Date, default: Date.now },
    },
    { versionKey: false, minimize: false }
  );
  SessionBackup = mongoose.models.SessionBackup || mongoose.model('SessionBackup', schema);
  return SessionBackup;
}

/* ----------------------------- init ------------------------------ */
async function init() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('[mongo] MONGODB_URI set nahi hai — session backup disabled.');
    return false;
  }

  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      dbName: process.env.MONGODB_DB || undefined,
    });
  }

  getModel();
  enabled = true;
  console.log('[mongo] Connected — session backup enabled.');
  return true;
}

function isEnabled() {
  return enabled;
}

/* --------------------------- file utils -------------------------- */
function collectFiles(dir, baseDir = dir, out = {}) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(fullPath, baseDir, out);
      continue;
    }
    if (!entry.isFile()) continue;

    const stat = fs.statSync(fullPath);
    if (stat.size > MAX_FILE_BYTES) continue;

    const relative = path.relative(baseDir, fullPath).split(path.sep).join('/');
    out[relative] = fs.readFileSync(fullPath, 'utf8');
  }
  return out;
}

function writeFiles(dir, files) {
  fs.mkdirSync(dir, { recursive: true });
  for (const [relative, contents] of Object.entries(files || {})) {
    if (typeof contents !== 'string') continue;
    const target = path.join(dir, ...relative.split('/'));
    // path traversal safety
    if (!target.startsWith(dir + path.sep)) continue;
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, contents, { mode: 0o600 });
  }
}

/* ---------------------------- backup ----------------------------- */
async function backupSession(number) {
  if (!enabled) return false;
  if (!/^\d{8,15}$/.test(String(number))) return false;

  const dir = path.join(SESSIONS_DIR, String(number));
  const Model = getModel();

  if (!fs.existsSync(dir)) {
    await Model.deleteOne({ _id: String(number) });
    return false;
  }

  const files = collectFiles(dir);
  if (!Object.keys(files).length) return false;

  await Model.updateOne(
    { _id: String(number) },
    { $set: { files, updatedAt: new Date() } },
    { upsert: true }
  );
  return true;
}

async function backupAll() {
  if (!enabled || running) return 0;
  running = true;
  let count = 0;
  try {
    if (!fs.existsSync(SESSIONS_DIR)) return 0;
    const entries = fs.readdirSync(SESSIONS_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() || !/^\d{8,15}$/.test(entry.name)) continue;
      try {
        if (await backupSession(entry.name)) count += 1;
      } catch (error) {
        console.error(`[mongo] backup failed for ${entry.name}:`, error.message);
      }
    }
  } finally {
    running = false;
  }
  if (count) console.log(`[mongo] Backed up ${count} session(s).`);
  return count;
}

/* --------------------------- restore ----------------------------- */
async function restoreAll() {
  if (!enabled) return 0;
  const Model = getModel();
  const docs = await Model.find({}).lean();
  let count = 0;

  for (const doc of docs) {
    const number = String(doc._id);
    if (!/^\d{8,15}$/.test(number)) continue;
    const dir = path.join(SESSIONS_DIR, number);

    // Local files already hain to unhe overwrite na karein
    if (fs.existsSync(path.join(dir, 'creds.json'))) continue;

    try {
      writeFiles(dir, doc.files);
      count += 1;
    } catch (error) {
      console.error(`[mongo] restore failed for ${number}:`, error.message);
    }
  }
  return count;
}

/* ---------------------------- delete ----------------------------- */
async function deleteSession(number) {
  if (!enabled) return;
  await getModel().deleteOne({ _id: String(number) });
}

/* ------------------------- auto backup --------------------------- */
function startAutoBackup(intervalMs = Number(process.env.SESSION_BACKUP_INTERVAL_MS || 45000)) {
  if (!enabled || timer) return;
  timer = setInterval(() => {
    backupAll().catch((error) => console.error('[mongo] auto backup error:', error.message));
  }, Math.max(10000, intervalMs));
  if (typeof timer.unref === 'function') timer.unref();
  console.log(`[mongo] Auto session backup every ${Math.round(Math.max(10000, intervalMs) / 1000)}s.`);
}

async function close() {
  if (timer) clearInterval(timer);
  timer = null;
  if (enabled) await mongoose.connection.close().catch(() => {});
  enabled = false;
}

module.exports = {
  init,
  isEnabled,
  backupSession,
  backupAll,
  restoreAll,
  deleteSession,
  startAutoBackup,
  close,
};
