import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeFrame, type AnalyzeRequest } from "./analyze.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 8787;

const app = express();
app.use(cors());
app.use(express.json({ limit: "25mb" }));

app.post("/api/analyze", async (req, res) => {
  try {
    const body = req.body as AnalyzeRequest;
    if (!body?.image || !body?.profile) {
      res.status(400).json({ error: "image and profile are required" });
      return;
    }
    const result = await analyzeFrame(body);
    res.json(result);
  } catch (err) {
    console.error("[/api/analyze] error:", err);
    const message = err instanceof Error ? err.message : "analyze failed";
    res.status(500).json({ error: message });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// Serve built client if present
const clientDist = path.resolve(__dirname, "../../client/dist");
app.use(express.static(clientDist));
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) {
      res.status(404).send("Client build not found. Run `npm run build`.");
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
