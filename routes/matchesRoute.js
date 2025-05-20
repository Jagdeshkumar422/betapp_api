// server.js or routes/matches.js
const express = require('express');
const router = express.Router();
const Match = require('../models/Match');

router.post("/matches", async (req, res) => {
  const matches = req.body;  // Expecting an array directly

  if (!Array.isArray(matches) || matches.length === 0) {
    return res.status(400).json({ error: "No matches provided" });
  }

  try {
    // Save matches to DB
    const savedMatches = await Match.insertMany(matches);
    res.status(201).json(savedMatches);
  } catch (error) {
    console.error("Error saving matches:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;
