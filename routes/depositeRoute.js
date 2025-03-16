const express = require("express");
const router = express.Router();
const Deposit = require("../models/deposite");

// @route  POST /api/deposits
// @desc   Make a deposit
router.post("/deposit", async (req, res) => {
    const { userId, amount } = req.body;
  
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid deposit data" });
    }
  
    try {
      // Update the deposit if it exists, otherwise create a new one
      const deposit = await Deposit.findOneAndUpdate(
        { userId }, 
        { $inc: { amount: amount } },  // Increment the amount
        { new: true, upsert: true }  // Return updated document, create if not exists
      );
  
      res.status(200).json({ message: "Deposit processed successfully", deposit });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });
  
  
// @route  GET /api/deposits/:userId
// @desc   Get all deposits for a user
router.get("/deposite/:userId", async (req, res) => {
  try {
    const deposits = await Deposit.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(deposits);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.post("/withdraw", async (req, res) => {
  const { userId, amount } = req.body;

  if (!userId || !amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid withdrawal data" });
  }

  try {
    // Find the user's deposit record
    const deposit = await Deposit.findOne({ userId });

    // Check if the deposit exists and if the balance is sufficient
    if (!deposit || deposit.amount < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct the withdrawal amount
    deposit.amount -= amount;
    await deposit.save();

    res.status(200).json({ message: "Withdrawal successful", deposit });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
