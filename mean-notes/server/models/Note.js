const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    content: { type: String, default: "", maxlength: 20000 },
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

noteSchema.index({ owner: 1, pinned: -1, updatedAt: -1 });

module.exports = mongoose.models.Note || mongoose.model("Note", noteSchema);
