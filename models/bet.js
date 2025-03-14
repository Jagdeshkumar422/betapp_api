const mongoose = require("mongoose");

const betSchema = new mongoose.Schema({
    date: String,
    match: String,
    stake: Number,
    returnAmount: Number,
    status: String,
  });
  
module.exports = mongoose.model("Bet", betSchema);
