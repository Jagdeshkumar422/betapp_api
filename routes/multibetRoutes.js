const express = require("express");
const router = express.Router();
const Bet = require("../models/multibets");

// Function to parse bet data from pasted text
const parseBetData = (text) => {
  const betRegex =
    /Game ID:\s*(\d+)\s*\|\s*([\d\/\s:]+)\n([\w\s]+)\sv\s*([\w\s]+)\nFT Score:\n(\d+:\d+)\n\|\s*Match Tracker\nPick\s*([\w\s@.]+)\nMarket\s*([\w\s]+)\nOutcome\s*([\w\s]+)/g;

  const matches = [];
  let match;
  while ((match = betRegex.exec(text)) !== null) {
    matches.push({
      gameId: match[1],
      dateTime: match[2].trim(),
      teams: `${match[3].trim()} v ${match[4].trim()}`,
      ftScore: match[5].trim(),
      pick: match[6].trim(),
      market: match[7].trim(),
      outcome: match[8].trim(),
    });
  }
  return matches;
};

// **API to Store Bets**
router.post("/multibets", async (req, res) => {
  try {
    const { userId, text } = req.body; // Extract userId and pasted text

    if (!userId || !text) {
      return res.status(400).json({ message: "userId and text are required." });
    }

    const bets = parseBetData(text);

    if (bets.length === 0) {
      return res.status(400).json({ message: "No valid bets found." });
    }

    // Add userId to each bet before storing in MongoDB
    const betsToSave = bets.map((bet) => ({
      ...bet,
      userId, // Assign userId
    }));

    await Bet.insertMany(betsToSave);
    res.json({ message: "Bets saved successfully", bets: betsToSave });
  } catch (error) {
    console.error("Error saving bets:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// **API to Fetch Stored Bets**
router.get("/multibets/:userId", async (req, res) => {
    try {
      const { userId } = req.params; // Get userId from request params
      const bets = await Bet.find({ userId }); // Find bets for the specific user
  
      if (!bets.length) {
        return res.status(404).json({ message: "No bets found for this user." });
      }
  
      res.json(bets);
    } catch (error) {
      console.error("Error fetching bets:", error); 
      res.status(500).json({ message: "Server error" });
    }
  });
  
module.exports = router;
