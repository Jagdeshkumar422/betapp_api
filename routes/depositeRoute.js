const express = require("express");
const router = express.Router();
const Deposit = require("../models/deposite");

// @route  POST /api/deposits
// @desc   Make a deposit
router.post("/", async (req, res) => {
  const { userId, amount } = req.body;

  if (!userId || !amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid deposit data" });
  }

  try {
    const deposit = new Deposit({ userId, amount });
    await deposit.save();
    res.status(201).json({ message: "Deposit successful", deposit });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// @route  GET /api/deposits/:userId
// @desc   Get all deposits for a user
router.get("/:userId", async (req, res) => {
  try {
    const deposits = await Deposit.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(deposits);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
