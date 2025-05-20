// routes/matches.js

const express = require("express");
const router = express.Router();
const Match = require("../models/Match");

router.post("/matches", async (req, res) => {
  try {
    const matches = req.body.matches;

    if (!Array.isArray(matches)) {
      return res.status(400).json({ error: "Invalid match data" });
    }

    const savedMatches = await Match.insertMany(matches);
    res.status(201).json(savedMatches);
  } catch (err) {
    console.error("Error saving matches:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
