/*

# Base By TdX Division
# Owner ? : t.me/bilal_babar_982
!- do not delete this credit

*/

process.chdir(__dirname);
require("./load-env.js");
require('./config.js')
const {
default:crot,
downloadContentFromMessage,
emitGroupParticipantsUpdate,
emitGroupUpdate,
generateWAMessageContent,
generateWAMessage,
MediaType,
areJidsSameUser,
WAMessageStatus,
downloadAndSaveMediaMessage,
AuthenticationState,
GroupMetadata,
initInMemoryKeyStore,
getContentType,
MiscMessageGenerationOptions,
useSingleFileAuthState,
BufferJSON,
WAMessageProto,
MessageOptions,
WAFlag,
WANode,
WAMetric,
ChatModification,
MessageTypeProto,
WALocationMessage,
WAContextInfo,
WAGroupMetadata,
ProxyAgent,
waChatKey,
MimetypeMap,
MediaPathMap,
WAContactMessage,
WAContactsArrayMessage,
WAGroupInviteMessage,
WATextMessage,
WAMessageContent,
WAMessage,
BaileysError,
WA_MESSAGE_STATUS_TYPE,
URL_REGEX,
WAUrlInfo,
WA_DEFAULT_EPHEMERAL,
WAMediaUpload,
mentionedJid,
MessageType,
Presence,
WA_MESSAGE_STUB_TYPES,
Mimetype,
relayWAMessage,
GroupSettingChange,
WASocket,
getStream,
WAProto,
isBaileys,
AnyMessageContent,
templateMessage,
InteractiveMessage,
Header,
encodeSignedDeviceIdentity,
generateMessageID,
encodeWAMessage,
useMultiFileAuthState,
DisconnectReason,
fetchLatestBaileysVersion,
generateForwardMessageContent,
prepareWAMessageMedia,
generateWAMessageFromContent,
makeInMemoryStore,
jidDecode,
proto,
getAggregateVotesInPollMessage,
makeCacheableSignalKeyStore,
Browsers,
MessageRetryMap,
decryptMessageNode,
encryptMessageNode
} = require("@whiskeysockets/baileys");
//==========================================//
const fs = require("fs");
const path = require("path");
const pino = require("pino");
const { Boom } = require("@hapi/boom")
const moment = require("moment-timezone")
const NodeCache = require("node-cache")
const { startWebServer } = require("./web-server");
//==========================================//
const { 
makeWASocket, 
protoType,
smsg
} = require("./tdxbase/shortcut.js");
const {
unixTimestampSeconds,
generateMessageTag,
processTime,
webApi,
getRandom,
getBuffer,
fetchJson,
runtime,
clockString,
sleep,
isUrl,
getTime,
formatDate,
tanggal,
formatp,
jsonformat,
reSize,
toHD,
logic,
generateProfilePicture,
bytesToSize,
checkBandwidth,
getSizeMedia,
parseMention,
getGroupAdmins,
readFileTxt,
readFileJson,
getHashedPassword,
generateAuthToken,
cekMenfes,
generateToken,
batasiTeks,
randomText,
isEmoji,
getTypeUrlMedia,
pickRandom,
getAllHTML,
toIDR,
capital
} = require("./tdxbase/function.js");
//==========================================//
const clients = new Map();
const sessionStatuses = new Map();
const { MessageLogStore } = require("./message-log.js");
const messageLogs = new MessageLogStore();
const { ensureSessionDatabase } = require("./session-database.js");
const intentionallyClosedSockets = new WeakSet();
const intentionallyRemovedSessions = new Set();

async function start(number) {
const sessionId = number || "legacy";
const sessionDir = number
? path.join(__dirname, "sessions", number)
: path.join(__dirname, "session");
fs.mkdirSync(sessionDir, { recursive: true });
let { state, saveCreds } = await useMultiFileAuthState(sessionDir)
const sessionDatabase = number
? ensureSessionDatabase(number, state.creds.me?.id)
: { databaseDir: path.join(__dirname, "tdxbase", "database"), isIsolated: false };
let store = await makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) })
let { version, isLatest } = await fetchLatestBaileysVersion();
const msgRetryCounterCache = new NodeCache({ stdTTL: 300, useClones: false });
const groupMetadataCache = new Map();
//==========================================//
let opt = {
printQRInTerminal: false,
syncFullHistory: true,
markOnlineOnConnect: true,
browser: /*Browsers.iOS('Safari')*/Browsers.ubuntu('Chrome'), // [ ubuntu, macOS, windows, linux, solaris, baileys, android, iOS, kaiOS, chromeOS, appropriate, custom ]
connectTimeoutMs: 60000, 
defaultQueryTimeoutMs: 0,
keepAliveIntervalMs: 10000,
generateHighQualityLinkPreview: true, 
retryRequestDelayMs: 250,
emitOwnEvents: true,
syncFullHistory: true,
msgRetryCounterCache,
transactionOpts: {
maxCommitRetries: 10,
delayBetweenTriesMs: 10,
},
appStateMacVerification: {
patch: true,
snapshot: true,
},
cachedGroupMetadata: async (jid) => {
if (groupMetadataCache.has(jid)) {
return groupMetadataCache.get(jid);
}
try {
let metadata = await sock.groupMetadata(jid);
groupMetadataCache.set(jid, metadata); // Cache it
return metadata;
} catch (err) {
console.error(`Failed to fetch metadata for group ${jid}:`, err);
return null;
}
},
patchMessageBeforeSending: (message) => {
let requiresPatch = !!(
message.buttonsMessage 
|| message.templateMessage
|| message.listMessage
);
if (requiresPatch) {
message = {
viewOnceMessage: {
message: {
messageContextInfo: {
deviceListMetadataVersion: 2,
deviceListMetadata: {},
},
...message,
},
},
};
}

return message;
},
version: version,
logger: pino({ level: 'fatal' }),
auth: { 
creds: state.creds, 
keys: makeCacheableSignalKeyStore(state.keys, pino().child({ 
level: 'silent', 
stream: 'store' 
})), 
}
}

const sock = await makeWASocket(opt);
clients.set(sessionId, sock);
sessionStatuses.set(sessionId, {
number: number || null,
status: state.creds.registered ? "connecting" : "waiting_for_pairing",
updatedAt: new Date().toISOString()
});
//==========================================//
store.bind(sock.ev);

sock.ev.on('connection.update', async (update) => {
const { connection, lastDisconnect, receivedPendingNotifications } = update
if (connection === 'close') {
if (intentionallyClosedSockets.has(sock)) {
if (clients.get(sessionId) === sock) clients.delete(sessionId);
return;
}
if (clients.has(sessionId) && clients.get(sessionId) !== sock) return;
const reason = new Boom(lastDisconnect?.error)?.output.statusCode
if (clients.get(sessionId) === sock) clients.delete(sessionId);
const currentStatus = sessionStatuses.get(sessionId);
if (currentStatus) {
currentStatus.status = "disconnected";
currentStatus.updatedAt = new Date().toISOString();
}
if (reason === DisconnectReason.connectionLost) {
setTimeout(() => {
if (!clients.has(sessionId) && !intentionallyRemovedSessions.has(sessionId)) start(number).catch(console.error);
}, 2000)
} else if (reason === DisconnectReason.connectionClosed) {
setTimeout(() => {
if (!clients.has(sessionId) && !intentionallyRemovedSessions.has(sessionId)) start(number).catch(console.error);
}, 2000)
} else if (reason === DisconnectReason.restartRequired) {
setTimeout(() => {
if (!clients.has(sessionId) && !intentionallyRemovedSessions.has(sessionId)) start(number).catch(console.error);
}, 2000)
} else if (reason === DisconnectReason.timedOut) {
setTimeout(() => {
if (!clients.has(sessionId) && !intentionallyRemovedSessions.has(sessionId)) start(number).catch(console.error);
}, 2000)
} else if (reason === DisconnectReason.badSession) {
fs.rmSync(sessionDir, { recursive: true, force: true });
sessionStatuses.set(sessionId, { number: number || null, status: "needs_repair", updatedAt: new Date().toISOString() });
} else if (reason === DisconnectReason.loggedOut) {
fs.rmSync(sessionDir, { recursive: true, force: true });
sessionStatuses.set(sessionId, { number: number || null, status: "logged_out", updatedAt: new Date().toISOString() });
} else if (reason === DisconnectReason.forbidden) {
fs.rmSync(sessionDir, { recursive: true, force: true });
sessionStatuses.set(sessionId, { number: number || null, status: "logged_out", updatedAt: new Date().toISOString() });
} else if (reason === DisconnectReason.multideviceMismatch) {
fs.rmSync(sessionDir, { recursive: true, force: true });
sessionStatuses.set(sessionId, { number: number || null, status: "needs_repair", updatedAt: new Date().toISOString() });
} else if (reason !== DisconnectReason.connectionReplaced) {
sock.end(`Unknown DisconnectReason : ${reason}|${connection}`)
}
}
if (connection == 'open') {
sessionStatuses.set(sessionId, { number: number || null, status: "connected", updatedAt: new Date().toISOString() });
}
if (receivedPendingNotifications === 'true') {
await sock.ev.flush();
}
});

store?.bind(sock.ev)
sock.ev.on("creds.update", async () => {
await saveCreds();
if (number && state.creds.me?.id) ensureSessionDatabase(number, state.creds.me.id);
if (sock.authState.creds.registered && sessionStatuses.get(sessionId)?.status !== "connected") {
sessionStatuses.set(sessionId, { number: number || null, status: "connecting", updatedAt: new Date().toISOString() });
}
});


sock.ev.on("group-participants.update", async (update) => {
const { id, author, participants, action } = update;
let groupMetadata;
groupMetadata = await sock.groupMetadata(id);
groupMetadataCache.set(id, groupMetadata);
});

sock.ev.on('messages.upsert', async (xnxx) => {
try {
for (const message of xnxx.messages || []) messageLogs.append(number, message);
let p = xnxx.messages[0];
if (!p.message || (p.key && p.key.remoteJid === 'status@broadcast')) return;
p.message = p.message.ephemeralMessage?.message || p.message;
await require('./tdxmaster.js')(sock, smsg(sock, p, store), xnxx, store, sessionDatabase);
} catch (e) {
console.error(`WhatsApp message handler failed for session ${sessionId}:`, e);
}
});


return sock
}

async function pairNumber(number) {
intentionallyRemovedSessions.delete(number);
const sock = clients.get(number) || await start(number);
if (sock.authState.creds.registered) throw new Error("Nomor ini sudah terhubung.");
await sleep(1500);
const code = await sock.requestPairingCode(number);
sessionStatuses.set(number, { number, status: "pairing_code_issued", updatedAt: new Date().toISOString() });
return code;
}

async function removeSession(number) {
if (!/^\d{8,15}$/.test(number)) throw new Error("Invalid WhatsApp number.");
const sock = clients.get(number);
if (!sock) {
const error = new Error("This WhatsApp connection is not active. Reconnect it before removing the device.");
error.statusCode = 409;
throw error;
}
intentionallyRemovedSessions.add(number);
intentionallyClosedSockets.add(sock);
try {
if (sock.authState.creds.registered) await sock.logout();
else sock.end(new Error("WhatsApp session removed by administrator."));
} catch (error) {
intentionallyClosedSockets.delete(sock);
intentionallyRemovedSessions.delete(number);
throw error;
}
if (clients.get(number) === sock) clients.delete(number);
fs.rmSync(path.join(__dirname, "sessions", number), { recursive: true, force: true });
sessionStatuses.delete(number);
messageLogs.clear(number);
}

async function boot() {
const legacyCreds = path.join(__dirname, "session", "creds.json");
if (fs.existsSync(legacyCreds)) await start(null);

const sessionsDir = path.join(__dirname, "sessions");
if (fs.existsSync(sessionsDir)) {
for (const entry of fs.readdirSync(sessionsDir, { withFileTypes: true })) {
if (entry.isDirectory() && /^\d{8,15}$/.test(entry.name) && fs.existsSync(path.join(sessionsDir, entry.name, "creds.json"))) {
await start(entry.name);
}
}
}

startWebServer({
pairNumber,
removeSession,
getMessageLogs: (number, limit) => messageLogs.get(number, limit),
getSessions: () => Array.from(sessionStatuses.values()),
});
}

boot().catch(error => {
console.error("Failed to start WhatsApp bot or web server:", error);
process.exitCode = 1;
});