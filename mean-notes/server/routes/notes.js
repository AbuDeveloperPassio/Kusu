const express = require("express");
const mongoose = require("mongoose");
const Note = require("../models/Note");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

const str = (v) => (typeof v === "string" ? v : "");
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const dto = (n) => ({
  id: String(n._id),
  title: n.title,
  content: n.content,
  pinned: n.pinned,
  createdAt: n.createdAt,
  updatedAt: n.updatedAt,
});

function validId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: "Note not found" });
  next();
}

router.get("/", async (req, res, next) => {
  try {
    const filter = { owner: req.userId };
    const q = str(req.query.q).trim().slice(0, 100);
    if (q) {
      const rx = new RegExp(escapeRegex(q), "i");
      filter.$or = [{ title: rx }, { content: rx }];
    }
    const notes = await Note.find(filter).sort({ pinned: -1, updatedAt: -1 }).limit(500);
    res.json({ notes: notes.map(dto) });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const title = str(req.body.title).trim();
    const content = str(req.body.content);
    if (!title) return res.status(400).json({ error: "Title is required" });
    if (title.length > 150) return res.status(400).json({ error: "Title is too long (max 150)" });
    if (content.length > 20000) return res.status(400).json({ error: "Note is too long (max 20000)" });
    const note = await Note.create({ owner: req.userId, title, content, pinned: req.body.pinned === true });
    res.status(201).json({ note: dto(note) });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", validId, async (req, res, next) => {
  try {
    const update = {};
    if (req.body.title !== undefined) {
      const title = str(req.body.title).trim();
      if (!title || title.length > 150) return res.status(400).json({ error: "Title must be 1 to 150 characters" });
      update.title = title;
    }
    if (req.body.content !== undefined) {
      const content = str(req.body.content);
      if (content.length > 20000) return res.status(400).json({ error: "Note is too long (max 20000)" });
      update.content = content;
    }
    if (req.body.pinned !== undefined) update.pinned = req.body.pinned === true;

    const note = await Note.findOneAndUpdate({ _id: req.params.id, owner: req.userId }, update, { new: true });
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.json({ note: dto(note) });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", validId, async (req, res, next) => {
  try {
    const result = await Note.deleteOne({ _id: req.params.id, owner: req.userId });
    if (!result.deletedCount) return res.status(404).json({ error: "Note not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
