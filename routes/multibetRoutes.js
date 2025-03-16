const express = require("express");
const router = express.Router();
const Bet = require("../models/multibets");
const oddModel = require("../models/oddModel")


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

        // ✅ Save bets to MongoDB
        const savedBets = await Bet.insertMany(
            text.map(bet => ({
                userId,
                gameId: bet.gameId,
                dateTime: bet.date, // Changed field name to match your model
                teams: bet.teams,
                ftScore: bet.ftScore,
                pick: bet.pick,
                market: bet.market,
                outcome: bet.outcome,
                createdAt: new Date() // Automatically store timestamp
            }))
        );

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

  router.put("/multibets/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { market, pick, ftScore, outcome, status, odd, userId } = req.body;

        // Find and update the existing odd entry
        let oddData = await oddModel.findOne({ betId: id });

        if (oddData) {
            oddData.odd = odd; // Update odd value
            await oddData.save();
        } else {
            // Create new odd entry if not found
            oddData = new oddModel({ betId: userId, odd });
            await oddData.save();
        }

        // Update the bet entry
        const updatedBet = await Bet.findByIdAndUpdate(
            id,
            { market, pick, ftScore, outcome, status },
            { new: true } // Returns the updated document
        );

        if (!updatedBet) {
            return res.status(404).json({ message: "Bet not found" });
        }

        res.status(200).json({ updatedBet, updatedOdd: oddData });
    } catch (error) {
        console.error("Error updating bet:", error);
        res.status(500).json({ message: "Error updating bet", error });
    }
});

  
module.exports = router;
