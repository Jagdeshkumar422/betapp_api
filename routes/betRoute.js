const express = require("express");
const router = express.Router();
const Bet = require("../models/bet");

// Fetch Bets for Logged-in User
router.get("/bets/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const bets = await Bet.find({ userId }); // Fetch bets for specific user
    res.json(bets);
  } catch (error) {
    res.status(500).json({ error: "Error fetching bets" });
  }
});

// Add a Bet
router.post("/bets", async (req, res) => {
    try {
      const { userId, date, betCode, stake } = req.body;
  
      // Validate required fields
      if (!userId || !date || !betCode || !stake) {
        return res.status(400).json({ error: "All fields are required" });
      }
  
      // Validate data types
      if (isNaN(stake) || stake <= 0) {
        return res.status(400).json({ error: "Invalid stake value" });
      }
  
      const newBet = new Bet({ userId, date, betCode, stake });
      const savedBet = await newBet.save();
  
      res.status(201).json(savedBet);
    } catch (error) {
      console.error("Error adding bet:", error.message);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });
  
module.exports = router;
