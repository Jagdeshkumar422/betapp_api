const mongoose = require("mongoose");

const BetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bet",
        required: true,
      },
    gameId: String,
    dateTime: String,
    teams: String,
    ftScore: String,
    pick: String,
    market: String,
    outcome: String,
    status: {type: String, default: 'won'}
  });

  module.exports = mongoose.model("multbet", BetSchema)