// routes/percentage.js
const express = require("express");
const router = express.Router();
const Percentage = require("../models/percentage");

// Create or update percentage
router.put("/percentage", async (req, res) => {
  try {
    const { value } = req.body;

    if (isNaN(value) || value < 0 || value > 100) {
      return res.status(400).json({ error: "Percentage must be between 0 and 100" });
    }

    // Check if a record already exists
    let percentage = await Percentage.findOne();
    if (percentage) {
      percentage.value = value;
    } else {
      percentage = new Percentage({ value });
    }

    await percentage.save();
    res.json({ percentage: percentage.value });
  } catch (err) {
    console.error("Error updating percentage:", err.message);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Get percentage
router.get("/percentage", async (req, res) => {
  try {
    let percentage = await Percentage.findOne();
    if (!percentage) {
      percentage = new Percentage({ value: 0 });
      await percentage.save();
    }
    res.json({ percentage: percentage.value });
  } catch (err) {
    console.error("Error fetching percentage:", err.message);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

module.exports = router;
