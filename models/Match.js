const mongoose = require("mongoose");

const MatchSchema = new mongoose.Schema({
  matchId: Number,
  time: String,
  league: String,
  homeTeam: String,
  awayTeam: String,
  homeOdd: String,
  drawOdd: String,
  awayOdd: String,
  points: String,
  isLive: { type: Boolean, default: false },
});

module.exports = mongoose.model("Match", MatchSchema);
