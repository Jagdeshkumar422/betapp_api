const express = require("express");
const router = express.Router();
const Bet = require("../models/multibets");
const oddModel = require("../models/bet")


router.post("/multibets", async (req, res) => {
    try {
        console.log("Received request body:", req.body); // ✅ Debugging Log

        const { userId, text, userId1 } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        if (!Array.isArray(text) || text.length === 0) {
            console.error("No valid bets found in request.");
            return res.status(400).json({ message: "No valid bets found." });
        }


        console.log("✅ Total Odd (Multiplication):", totalOdd);

        // ✅ Update the oddModel with the correct multiplied odd
        await oddModel.updateOne({ _id: userId }, { $set: { odd: totalOdd } });

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
                odd: odd,
                createdAt: new Date(), // Automatically store timestamp
                userId1
            }))
        );

        console.log("✅ Bets successfully stored:", savedBets);
        res.json({ message: "Bets stored successfully", bets: savedBets, totalOdd });

    } catch (error) {
        console.error("❌ Error processing bets:", error);
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

  router.get("/multibet/:userId1", async (req, res) => {
    try {
      const { userId1 } = req.params; // Get userId from request params
      const bets = await Bet.find({ userId1: userId1 }); // Find bets for the specific user
  
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

        if (!id || !userId) {
            return res.status(400).json({ message: "Bet ID and User ID are required." });
        }

        // Check if an odd entry exists using _id instead of userId
        const oddData = await oddModel.findById(userId);

        if (!oddData) {
            return res.status(404).json({ message: "Odd entry not found for this user." });
        }

        // Update the existing odd value
        oddData.odd = odd;
        await oddData.save();

        // Update the bet entry while keeping everything else unchanged
        const updatedBet = await Bet.findByIdAndUpdate(
            id,
            { market, pick, ftScore, outcome, status }, // ✅ No changes to odd in Bet
            { new: true, runValidators: true }
        );

        if (!updatedBet) {
            return res.status(404).json({ message: "Bet not found." });
        }

        res.status(200).json({ updatedBet, updatedOdd: oddData });
    } catch (error) {
        console.error("Error updating bet:", error);
        res.status(500).json({ message: "Error updating bet", error: error.message });
    }
});



router.put("/multibets/update/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { teams, gameId, dateTime } = req.body;

        // Find and update the bet entry
        const updatedBet = await Bet.findByIdAndUpdate(
            id,
            { teams, gameId, dateTime },
            { new: true } // Returns the updated document
        );

        if (!updatedBet) {
            return res.status(404).json({ message: "Bet not found" });
        }

        res.status(200).json({ message: "Bet updated successfully", updatedBet });
    } catch (error) {
        console.error("Error updating bet:", error);
        res.status(500).json({ message: "Error updating bet", error });
    }
});

  
module.exports = router;
