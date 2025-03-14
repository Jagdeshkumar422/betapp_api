const express = require("express");
const router = express.Router();
const Bet = require("../models/multibets");

// Function to parse bet data from pasted text
const extractBets = (rawText) => {
    const betRegex = /Game ID:\s*(\d+)\s*\|\s*([\d/]+ \d+:\d+)\s*(.*?)\s*FT Score:\s*([\d:-]+)\s*\|?\s*Match Tracker\s*Pick\s*(.*?)\s*Market\s*(.*?)\s*Outcome\s*(.*)/gs;
    
    let matches;
    const bets = [];

    while ((matches = betRegex.exec(rawText)) !== null) {
        bets.push({
            gameId: matches[1].trim(),
            date: matches[2].trim(),
            teams: matches[3].trim(),
            ftScore: matches[4].trim(),
            pick: matches[5].trim(),
            market: matches[6].trim(),
            outcome: matches[7].trim(),
        });
    }

    return bets;
};

// API Route to handle dynamic betting formats
router.post("/multibets", async (req, res) => {
    try {
        console.log("Received request body:", req.body);

        const { userId, text } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ message: "Text is required" });
        }

        console.log("Raw text before processing:", text);

        // ✅ Extract structured bets from raw text
        const extractedBets = extractBetData(text);

        console.log("Extracted Bets:", extractedBets);

        if (extractedBets.length === 0) {
            return res.status(400).json({ message: "No valid bets found." });
        }

        // ✅ Format bets correctly for MongoDB insertion
        const formattedBets = extractedBets.map(bet => ({
            userId,
            gameId: bet.gameId,
            dateTime: bet.dateTime,
            teams: bet.teams,
            ftScore: bet.ftScore,
            pick: bet.pick,
            market: bet.market,
            outcome: bet.outcome,
            createdAt: new Date() // ✅ Adds timestamp
        }));

        // ✅ Save structured bets to MongoDB
        const savedBets = await Bet.insertMany(formattedBets);

        console.log("Bets successfully stored:", savedBets);
        res.json({ message: "Bets stored successfully", bets: savedBets });
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
