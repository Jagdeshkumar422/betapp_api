// models/Percentage.js
const mongoose = require("mongoose");

const percentageSchema = new mongoose.Schema({
  value: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
}, { timestamps: true });

module.exports = mongoose.model("Percentage", percentageSchema);
