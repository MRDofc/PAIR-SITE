const express = require("express");
const { pair } = require("./pair");
const app = express();

app.get("/", (req, res) => {
  res.send("✅ WhatsApp Pair Server Running...");
});

app.get("/pair", async (req, res) => {
  const code = await pair("main", "session");
  res.send(`<h2>Pairing Code:</h2><pre>${code}</pre>`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
