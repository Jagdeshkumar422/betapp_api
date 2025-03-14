const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Bet = require("../models/bet")

const router = express.Router();

router.get("/bets", async (req, res) => {
    try {
      const bets = await Bet.find();
      res.json(bets);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Add a New Bet
  router.post("/bets", async (req, res) => {
    try {
      const newBet = new Bet(req.body);
      await newBet.save();
      res.status(201).json(newBet);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Update Bet Status
  router.put("/bets/:id", async (req, res) => {
    try {
      const { status } = req.body;
      const updatedBet = await Bet.findByIdAndUpdate(req.params.id, { status }, { new: true });
      res.json(updatedBet);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Delete Bet
  router.delete("/bets/:id", async (req, res) => {
    try {
      await Bet.findByIdAndDelete(req.params.id);
      res.json({ message: "Bet deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  module.exports = router;