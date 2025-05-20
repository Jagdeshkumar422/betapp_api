const mongoose = require("mongoose");

const MatchSchema = new mongoose.Schema({
  matchId: Number, // Renamed from `id` to avoid conflict with Mongoose _id
  time: String,
  league: String,
  homeTeam: String,
  awayTeam: String,
  homeOdd: String,
  drawOdd: String,
  awayOdd: String,
  points: String, // keep as string if values like "BEST ODDS" are possible
  isLive: { type: Boolean, default: false },
});

module.exports = mongoose.model("Match", MatchSchema);
