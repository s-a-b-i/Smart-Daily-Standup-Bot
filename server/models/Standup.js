import mongoose from "mongoose";

const standupSchema = new mongoose.Schema(
  {
    raw: { type: String, required: true },
    summary: { type: String, required: true },
    date: { type: Date, default: Date.now },
    tags: [{ type: String }]
  }
);

const Standup = mongoose.model("Standup", standupSchema);

export default Standup;
