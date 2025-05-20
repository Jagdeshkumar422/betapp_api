const express = require("express");
const router = express.Router();
const Match = require("../models/Match");

// POST /api/matches - Save multiple matches
router.post("/matches", async (req, res) => {
  try {
    const matches = req.body.matches;

    if (!Array.isArray(matches) || matches.length === 0) {
      return res.status(400).json({ message: "No matches provided" });
    }

    const formattedMatches = matches.map((match) => ({
      matchId: Math.floor(Math.random() * 100000), // or use match.id if you have it
      time: match.time,
      league: match.league,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      homeOdd: match.homeOdd || "",
      drawOdd: match.drawOdd || "",
      awayOdd: match.awayOdd || "",
      points: match.points || "",
      isLive: match.isLive || false,
    }));

    const savedMatches = await Match.insertMany(formattedMatches);
    res.status(201).json(savedMatches);
  } catch (error) {
    console.error("Error saving matches:", error);
    res.status(500).json({ error: "Failed to save matches" });
  }
});

router.get("/matches", async (req, res) => {
  try {
    const matches = await Match.find().sort({ time: 1 }); // Optional: sort by match time
    res.status(200).json(matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).json({ error: "Failed to fetch matches" });
  }
});

module.exports = router;
