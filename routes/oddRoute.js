const express = require("express");
const router = express.Router();
const oddModel = require("../models/oddModel")
router.get("/odd/:betId", async (req, res) => {
    try {
        const { betId } = req.params;
        const oddData = await oddModel.findOne({ betId });

        if (oddData) {
            res.json(oddData);
        } else {
            res.json({ odd: "No Code Found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Check if verifyCode exists: Update or Insert
router.put("/odd/:betId", async (req, res) => {
    try {
        const { betId } = req.params;
        const { odd } = req.body;

        // Check if the verifyCode already exists
        const existingOdd = await oddModel.findOne({ odd });

        if (existingOdd) {
            // Update existing verifyCode entry
            existingOdd.betId = betId;  // Update betId if needed
            await existingVerify.save();
            return res.json({ message: "Verify Code updated successfully", existingOdd });
        }

        // If verifyCode does not exist, create a new one
        const newOdd = new oddModel({ betId, odd });
        await newOdd.save();
        res.json({ message: "New Verify Code added", newOdd });

    } catch (error) {
        res.status(500).json({ error: "Error updating code" });
    }
});

module.exports = router