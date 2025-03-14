const express = require("express");
const router = express.Router();
const Bet = require("../models/bet");

// ✅ Fetch Bets for a Specific User
router.get("/bets/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const bets = await Bet.find({ userId }).sort({ date: -1 }); // Sort by latest date
    res.status(200).json(bets);
  } catch (error) {
    console.error("Error fetching bets:", error);
    res.status(500).json({ error: "Error fetching bets" });
  }
});

// ✅ Add a New Bet
router.post("/bets", async (req, res) => {
  try {
    const { userId, betCode, stake, date } = req.body;

    if (!userId || !betCode || !stake || !date) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Create a new bet
    const newBet = new Bet({
      userId,
      betCode,
      stake,
      date: new Date(date), // Ensure it's a valid Date object
    });

    await newBet.save();
    res.status(201).json(newBet);
  } catch (error) {
    console.error("Error adding bet:", error);
    res.status(500).json({ error: "Error adding bet" });
  }
});

// ✅ Delete a Bet
router.delete("/bets/:betId", async (req, res) => {
  try {
    const { betId } = req.params;
    const deletedBet = await Bet.findByIdAndDelete(betId);

    if (!deletedBet) {
      return res.status(404).json({ error: "Bet not found" });
    }

    res.status(200).json({ message: "Bet deleted successfully" });
  } catch (error) {
    console.error("Error deleting bet:", error);
    res.status(500).json({ error: "Error deleting bet" });
  }
});

module.exports = router;
