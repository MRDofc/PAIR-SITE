const express = require("express");
const { makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const pino = require("pino");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("WhatsApp Pair Server Running...");
});

app.get("/pair", async (req, res) => {
  const { state, saveCreds } = await useMultiFileAuthState("./session");
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: "silent" })
  });

  if (!sock.authState.creds.registered) {
    let code = await sock.requestPairingCode("947XXXXXXXX");
    res.send(`<h1>Your Pairing Code: ${code}</h1>`);
  } else {
    res.send("Already paired!");
  }

  sock.ev.on("creds.update", saveCreds);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
