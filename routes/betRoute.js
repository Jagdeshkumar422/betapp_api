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
    const { userId, stake, returnAmount, match, status, date } = req.body;
    const newBet = new Bet({ userId, stake, returnAmount, match, status, date });
    await newBet.save();
    res.json(newBet);
  } catch (error) {
    res.status(500).json({ error: "Error adding bet" });
  }
});

module.exports = router;
