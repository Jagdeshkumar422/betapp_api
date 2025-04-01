const express = require("express");
const router = express.Router();
const Bet = require("../models/bet");
const Deposit =  require("../models/deposite")
const Match = require("../models/multibets")
const cashOut = require("../models/cashOut")

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
    const { userId, date, betCode, stake, odd } = req.body;

    // Validate required fields
    if (!userId || !date || !betCode || !stake) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate data types
    if (isNaN(stake) || stake <= 0) {
      return res.status(400).json({ error: "Invalid stake value" });
    }

    // Check if user has enough deposit
    const deposit = await Deposit.findOne({ userId });

    if (!deposit || deposit.amount < stake) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct stake from deposit
    deposit.amount -= stake;
    await deposit.save();

    // Save new bet
    const newBet = new Bet({ userId, date, betCode, stake, odd });
    const savedBet = await newBet.save();

    // Save cashout entry linked to the bet
    const cashStatus = "cashout";
    const amount = 0.00;

    const newCashout = new cashOut({
      cashStatus,
      amount,
      betId: savedBet._id, // Fixed `_id` reference
    });

    await newCashout.save();

    res.status(201).json({
      message: "Bet placed successfully",
      bet: savedBet,
      cashout: newCashout,
    });

  } catch (error) {
    console.error("Error adding bet:", error.message);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});


  // Update Odd for a Bet
router.put("/bets/:betId", async (req, res) => {
  try {
    const { betId } = req.params;
    const { odd } = req.body;

    // Validate the odd value
    if (!odd || isNaN(odd) || odd <= 0) {
      return res.status(400).json({ error: "Invalid odd value" });
    }

    // Find and update the bet
    const updatedBet = await Bet.findByIdAndUpdate(
      betId,
      { $set: { odd } },
      { new: true }
    );

    if (!updatedBet) {
      return res.status(404).json({ error: "Bet not found" });
    }

    res.json(updatedBet);
  } catch (error) {
    console.error("Error updating bet odd:", error.message);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

router.delete("/bets/:betId", async (req, res) => {
  try {
    const { betId } = req.params;

    // Find the bet
    const bet = await Bet.findById(betId);
    if (!bet) {
      return res.status(404).json({ error: "Bet not found" });
    }

    // Find the user's deposit and refund the stake
    const deposit = await Deposit.findOne({ userId: bet.userId });
    if (deposit) {
      deposit.amount += bet.stake; // Refund the stake amount
      await deposit.save();
    }

    // Delete related matches
    await Match.deleteMany({ betId });

    // Delete the bet
    await Bet.findByIdAndDelete(betId);

    res.json({ message: "Bet and related matches deleted successfully" });
  } catch (error) {
    console.error("Error deleting bet:", error.message);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});
  
module.exports = router;
