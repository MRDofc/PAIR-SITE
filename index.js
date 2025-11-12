const express = require("express");
const pino = require("pino");
const { makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send(`<h2>✅ WhatsApp Pair Server Running...</h2>
            <p>Use <a href="/pair?number=947XXXXXXXX">/pair?number=947XXXXXXXX</a> to get your pairing code.</p>`);
});

app.get("/pair", async (req, res) => {
  try {
    const number = req.query.number;
    if (!number) return res.send("❌ Please provide your phone number like this: /pair?number=947XXXXXXXX");

    const { state, saveCreds } = await useMultiFileAuthState("./session");
    const sock = makeWASocket({
      logger: pino({ level: "silent" }),
      auth: state,
      printQRInTerminal: false,
    });

    if (!sock.authState.creds.registered) {
      const code = await sock.requestPairingCode(number);
      res.send(`<h1>🔑 Your WhatsApp Pairing Code:</h1><h2>${code}</h2><p>Enter this code in WhatsApp → Linked Devices → Link with phone number.</p>`);
    } else {
      res.send("✅ Already paired with WhatsApp!");
    }

    sock.ev.on("creds.update", saveCreds);
  } catch (err) {
    console.error(err);
    res.send("❌ Error: " + err.message);
  }
});

app.listen(PORT, () => console.log("✅ Server running on port " + PORT));
