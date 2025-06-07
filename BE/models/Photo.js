const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  comment: { type: String, required: true },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date_time: { type: Date, default: Date.now },
});

const photoSchema = new mongoose.Schema({
  file_name: { type: String, required: true },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date_time: { type: Date, default: Date.now },
  description: { type: String, default: "" },
  comments: [commentSchema],
});

module.exports = mongoose.model("Photo", photoSchema);
