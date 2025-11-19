// backend/server.js
import express from "express";
import cors from "cors";
import { spawn } from "child_process";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/scrape", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: "Missing credentials" });

  // Run Python scraper
  const py = spawn("python3", ["scraper/scraper.py", username, password]);

  let data = "";
  let error = "";

  py.stdout.on("data", (chunk) => (data += chunk.toString()));
  py.stderr.on("data", (chunk) => (error += chunk.toString()));

  py.on("close", (code) => {
    if (code !== 0 || !data) {
      console.error("Scraper failed:", error);
      return res.status(500).json({ error: "Scraper failed", details: error });
    }

    try {
      const parsed = JSON.parse(data);
      res.json(parsed);
    } catch (e) {
      console.error("JSON parse error:", e, data);
      res.status(500).json({ error: "Invalid JSON from scraper" });
    }
  });
});

const PORT = 5050;
app.listen(PORT, () =>
  console.log(`✅ Backend running at http://localhost:${PORT}`)
);
