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
      console.log("Received request body:", req.body); // ✅ Debugging Log
  
      const { userId, text } = req.body;
  
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
  
      if (!Array.isArray(text) || text.length === 0) {
        console.error("No valid bets found in request.");
        return res.status(400).json({ message: "No valid bets found." });
      }
  
      // ✅ Log each extracted bet for debugging
      text.forEach((bet, index) => {
        console.log(`Bet ${index + 1}:`, bet);
      });
  
      // Process bets here...
      res.json({ message: "Bets received successfully", bets: text });
    } catch (error) {
      console.error("Error processing bets:", error);
      res.status(500).json({ message: "Internal server error", error: error.message });
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
