const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signToken, requireAuth } = require("../middleware/auth");

const router = express.Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Only accept plain strings so query operators like {"$gt": ""} can never reach MongoDB.
const str = (v) => (typeof v === "string" ? v.trim() : "");

const publicUser = (u) => ({ id: String(u._id), name: u.name, email: u.email });

router.post("/register", async (req, res, next) => {
  try {
    const name = str(req.body.name);
    const email = str(req.body.email).toLowerCase();
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (!name || name.length > 80) return res.status(400).json({ error: "Please enter your name" });
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: "Please enter a valid email" });
    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({ error: "Password must be 8 to 72 characters" });
    }

    if (await User.exists({ email })) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const email = str(req.body.email).toLowerCase();
    const password = typeof req.body.password === "string" ? req.body.password : "";
    const user = email ? await User.findOne({ email }) : null;
    const ok = user && (await bcrypt.compare(password, user.passwordHash));
    if (!ok) return res.status(401).json({ error: "Wrong email or password" });
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ error: "Account no longer exists" });
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
