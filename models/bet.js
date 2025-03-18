const mongoose = require("mongoose");

const betSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  timestamp: { type: Date, default: Date.now },
  betCode: { type: String, required: true },
  stake: { type: Number, required: true },
  date: {
    type: String, // Format: "DD-MM"
    required: true,
  },
  odd: String
});

const Bet = mongoose.model("Bet", betSchema);
module.exports = Bet; // Ensure the export is correct
