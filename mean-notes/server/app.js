const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connect = require("./db");
const authRoutes = require("./routes/auth");
const noteRoutes = require("./routes/notes");

const app = express();
app.set("trust proxy", 1); // behind Vercel's proxy
app.use(helmet());
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (req, res) => res.json({ ok: true }));

// Connect to MongoDB before any route that needs it.
app.use("/api", async (req, res, next) => {
  try {
    await connect();
    next();
  } catch (err) {
    next(err);
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Try again in a few minutes." },
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/notes", noteRoutes);

app.use("/api", (req, res) => res.status(404).json({ error: "Not found" }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  const setup = /MONGODB_URI|JWT_SECRET/.test(err && err.message);
  res.status(setup ? 503 : 500).json({
    error: setup ? "Server is not configured yet" : "Something went wrong",
  });
});

module.exports = app;
