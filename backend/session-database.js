const fs = require("fs");
const path = require("path");

const USER_DATA_DIR = path.join(__dirname, "user-data");

function writeJsonFile(filePath, data) {
  const temporaryPath = `${filePath}.tmp`;
  fs.writeFileSync(temporaryPath, `${JSON.stringify(data, null, 2)}\n`, { mode: 0o600 });
  try {
    fs.renameSync(temporaryPath, filePath);
  } catch (error) {
    if (process.platform !== "win32" || !["EPERM", "EACCES", "EEXIST", "ENOTEMPTY"].includes(error.code)) {
      if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath);
      throw error;
    }
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, { mode: 0o600 });
    fs.unlinkSync(temporaryPath);
  }
}

function readJsonFile(filePath, fallback, isValid) {
  if (!fs.existsSync(filePath)) {
    writeJsonFile(filePath, fallback);
    return fallback;
  }
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!isValid(data)) throw new Error(`Invalid session database file: ${filePath}`);
  return data;
}

function ensureSessionDatabase(number, ownerJid, userDataDir = USER_DATA_DIR) {
  if (!/^\d{8,15}$/.test(number)) {
    throw new Error("A valid paired WhatsApp number is required for its session database.");
  }
  const databaseDir = path.join(userDataDir, number);
  fs.mkdirSync(databaseDir, { recursive: true });

  const ownersPath = path.join(databaseDir, "owner.json");
  const owners = readJsonFile(ownersPath, [], Array.isArray);
  if (typeof ownerJid === "string" && ownerJid.includes("@") && !owners.includes(ownerJid)) {
    owners.push(ownerJid);
    writeJsonFile(ownersPath, owners);
  }

  const botSettingsPath = path.join(databaseDir, "botset.json");
  readJsonFile(
    botSettingsPath,
    { mode: "public" },
    data => data && typeof data === "object" && !Array.isArray(data) && ["public", "self"].includes(data.mode),
  );
  return { databaseDir, ownersPath, botSettingsPath, isIsolated: true };
}

module.exports = { ensureSessionDatabase };
