async function toLid(conn, value) {
  if (typeof value !== "string" || !value) return "";

  const jid = value.replace(/:\d+(?=@)/, "");
  if (!jid.endsWith("@s.whatsapp.net") && !jid.endsWith("@hosted")) return jid;

  const lidMapping = conn.signalRepository?.lidMapping;
  if (typeof lidMapping?.getLIDForPN !== "function") return jid;

  try {
    const lid = await lidMapping.getLIDForPN(value);
    return typeof lid === "string" && lid
      ? lid.replace(/:\d+(?=@)/, "")
      : jid;
  } catch (error) {
    console.warn(`Could not resolve WhatsApp LID for ${jid}:`, error);
    return jid;
  }
}

async function arrayJidToLid(conn, values) {
  if (!Array.isArray(values) || values.length === 0) return [];
  return Promise.all(values.map(value => toLid(conn, value)));
}

module.exports = { toLid, arrayJidToLid };
