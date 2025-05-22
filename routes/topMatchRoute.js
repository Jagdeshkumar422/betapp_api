// routes/topMatchRoute.js
const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const matchController = require("../controllers/topMatchesController");

// Get all matches
router.get("/topmatches", matchController.getAllMatches);

// Create new match with single image upload
router.post("/topmatches", upload, matchController.createMatch);

// Update match and optionally replace image
router.put("/topmatches/:id", upload, matchController.updateMatch);

// Delete match
router.delete("/topmatches/:id", matchController.deleteMatch);

module.exports = router;
