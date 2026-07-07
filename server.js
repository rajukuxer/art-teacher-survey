import express from "express";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const feedbackFile = path.join(__dirname, "data", "art-teacher-feedback.json");

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/feedback", async (req, res) => {
  const body = req.body || {};
  const required = ["audience", "classSetup", "worksWell", "wish", "email"];
  const missing = required.filter((key) => !String(body[key] || "").trim());

  if (missing.length) {
    res.status(400).json({ ok: false, error: "Missing required fields", missing });
    return;
  }

  const email = String(body.email || "").trim().toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    res.status(400).json({ ok: false, error: "A valid email address is required" });
    return;
  }

  const entry = {
    id: crypto.randomUUID(),
    audience: String(body.audience).slice(0, 120),
    classSetup: String(body.classSetup).slice(0, 1500),
    adminTasks: Array.isArray(body.adminTasks) ? body.adminTasks.map((task) => String(task).slice(0, 80)) : [],
    otherAdminTask: String(body.otherAdminTask || "").slice(0, 200),
    timeSaved: Number(body.timeSaved || 0),
    worksWell: String(body.worksWell).slice(0, 1500),
    wish: String(body.wish).slice(0, 1500),
    name: String(body.name || "").slice(0, 120),
    email: email.slice(0, 180),
    submittedAt: body.submittedAt || new Date().toISOString()
  };

  try {
    await fs.mkdir(path.dirname(feedbackFile), { recursive: true });
    let existing = [];
    try {
      existing = JSON.parse(await fs.readFile(feedbackFile, "utf8"));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    existing.push(entry);
    await fs.writeFile(feedbackFile, `${JSON.stringify(existing, null, 2)}\n`);
    res.json({ ok: true, id: entry.id });
  } catch (error) {
    res.status(500).json({ ok: false, error: "Could not save feedback" });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const port = process.env.PORT || 3333;
app.listen(port, () => {
  console.log(`Art teacher feedback form running on http://localhost:${port}`);
});
