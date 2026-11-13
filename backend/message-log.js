const PER_SESSION_LIMIT = 200;
const TOTAL_LIMIT = 10_000;
const TEXT_LIMIT = 2_000;
const NON_CONTENT_FIELDS = new Set([
  "messageContextInfo",
  "senderKeyDistributionMessage",
]);
const MESSAGE_WRAPPERS = new Set([
  "deviceSentMessage",
  "documentWithCaptionMessage",
  "editedMessage",
  "ephemeralMessage",
  "viewOnceMessage",
  "viewOnceMessageV2",
  "viewOnceMessageV2Extension",
]);

function getMessageContent(message) {
  let content = message?.message;
  while (content && typeof content === "object") {
    const type = Object.keys(content).find(key => !NON_CONTENT_FIELDS.has(key));
    if (!type || !MESSAGE_WRAPPERS.has(type)) break;
    const wrapped = content[type];
    content = type === "deviceSentMessage"
      ? wrapped?.message
      : wrapped?.message;
  }
  if (!content || typeof content !== "object") return { type: "unknown", payload: null };
  const type = Object.keys(content).find(key => !NON_CONTENT_FIELDS.has(key));
  return type ? { type, payload: content[type] } : { type: "unknown", payload: null };
}

function getMessageText(type, payload) {
  let text = "";
  if (typeof payload === "string") text = payload;
  else if (payload && typeof payload === "object") {
    text = payload.text
      || payload.caption
      || payload.selectedButtonId
      || payload.selectedId
      || payload.singleSelectReply?.selectedRowId
      || "";
  }
  if (typeof text === "string" && text.trim()) return text.trim().slice(0, TEXT_LIMIT);
  return type === "unknown"
    ? "Unsupported message"
    : `${type.replace(/Message$/, "").replace(/([a-z])([A-Z])/g, "$1 $2")} message`;
}

function normalizeTimestamp(timestamp) {
  const value = Number(timestamp);
  const milliseconds = Number.isFinite(value) && value > 0
    ? (value < 1_000_000_000_000 ? value * 1000 : value)
    : Date.now();
  const date = new Date(milliseconds);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function createEntry(message, sequence) {
  const { type, payload } = getMessageContent(message);
  const key = message.key || {};
  const chat = typeof key.remoteJid === "string" ? key.remoteJid : "";
  if (!chat || chat === "status@broadcast") return null;
  return {
    id: typeof key.id === "string" && key.id ? key.id : `message-${sequence}`,
    timestamp: normalizeTimestamp(message.messageTimestamp),
    direction: key.fromMe ? "outgoing" : "incoming",
    chat,
    sender: typeof key.participant === "string" ? key.participant : chat,
    senderName: typeof message.pushName === "string" ? message.pushName.slice(0, 100) : "",
    type: type.replace(/Message$/, ""),
    text: getMessageText(type, payload),
  };
}

class MessageLogStore {
  constructor() {
    this.logsByNumber = new Map();
    this.oldestFirst = [];
    this.totalEntries = 0;
    this.sequence = 0;
  }

  append(number, message) {
    if (!/^\d{8,15}$/.test(number)) return;
    const entry = createEntry(message, ++this.sequence);
    if (!entry) return;
    const storedEntry = { ...entry, active: true };
    let logs = this.logsByNumber.get(number);
    if (!logs) {
      logs = [];
      this.logsByNumber.set(number, logs);
    }
    logs.push(storedEntry);
    this.oldestFirst.push({ number, entry: storedEntry });
    this.totalEntries += 1;

    if (logs.length > PER_SESSION_LIMIT) {
      const oldest = logs.shift();
      oldest.active = false;
      this.totalEntries -= 1;
    }
    while (this.totalEntries > TOTAL_LIMIT) {
      this.removeOldest();
    }
    while (this.oldestFirst.length > TOTAL_LIMIT) {
      this.removeOldest();
    }
  }

  removeOldest() {
    const oldest = this.oldestFirst.shift();
    if (!oldest?.entry.active) return;
    oldest.entry.active = false;
    const logs = this.logsByNumber.get(oldest.number);
    if (logs?.[0] === oldest.entry) {
      logs.shift();
      if (logs.length === 0) this.logsByNumber.delete(oldest.number);
    }
    this.totalEntries -= 1;
  }

  get(number, limit = 100) {
    if (!/^\d{8,15}$/.test(number)) return [];
    const safeLimit = Math.min(200, Math.max(1, Number(limit) || 100));
    return (this.logsByNumber.get(number) || [])
      .slice(-safeLimit)
      .map(({ active, ...entry }) => entry);
  }

  clear(number) {
    const logs = this.logsByNumber.get(number);
    if (!logs) return;
    for (const entry of logs) {
      entry.active = false;
      this.totalEntries -= 1;
    }
    this.logsByNumber.delete(number);
  }
}

module.exports = { MessageLogStore };
