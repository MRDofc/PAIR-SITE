/**
 * pair.js — WhatsApp pairing system (working 2025)
 */

const {
  default: makeWASocket,
  useMultiFileAuthState,
  Browsers,
  makeCacheableSignalKeyStore,
  initAuthCreds,
} = require("@whiskeysockets/baileys");

const fs = require("fs-extra");
const path = require("path");
const pino = require("pino");

/**
 * Pair function — generate pairing code or connect session
 * @param {string} num - device/instance number (optional)
 * @param {string} id - session id (optional)
 * @returns pairing code string
 */
async function pair(num = "main", id = "session") {
  try {
    // ensure auth directory exists
    const authDir = path.join(__dirname, "temp", String(num), String(id));
    if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

    // multi-file auth
    const { state, saveCreds } = await useMultiFileAuthState(authDir);

    // make socket
    const sock = makeWASocket({
      auth: state,
      logger: pino({ level: "silent" }),
      browser: Browsers.macOS("Safari"),
      printQRInTerminal: false,
      syncFullHistory: false,
      markOnlineOnConnect: false,
      generateHighQualityLinkPreview: true,
    });

    // save credentials on update
    sock.ev.on("creds.update", saveCreds);

    // listen to connection updates
    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === "open") {
        console.log("✅ WhatsApp connected successfully!");
      } else if (connection === "close") {
        console.log("❌ Connection closed. Trying again...");
      }
    });

    // pairing
    let pairingCode;
    if (!sock.authState.creds.registered) {
      const phoneNumber = process.env.WA_PHONE_NUMBER || "947XXXXXXXX"; // <-- replace with your number
      console.log("📲 Generating pairing code for", phoneNumber);
      pairingCode = await sock.requestPairingCode(phoneNumber);
      console.log("✅ Pairing code:", pairingCode);
    } else {
      console.log("✅ Already registered session found!");
    }

    return pairingCode || "Session already connected.";
  } catch (err) {
    console.error("❌ Error in pairing process:", err);
    return null;
  }
}

module.exports = { pair };
