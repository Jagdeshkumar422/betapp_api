const mongoose = require("mongoose");

const betSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  stake: {
    type: Number,
    required: true,
  },
  returnAmount: {
    type: Number,
    required: true,
  },
  match: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["won", "lost", "open"],
    default: "open",
  },
  date: {
    type: String, // Format: "DD-MM"
    required: true,
  },
});

module.exports = mongoose.model("Bet", betSchema);
