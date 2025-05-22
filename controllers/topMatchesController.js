const Match = require("../models/TopMatches");

exports.getAllMatches = async (req, res) => {
  try {
    const matches = await Match.find();
    res.json(matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).json({ message: "Server error fetching matches" });
  }
};

exports.createMatch = async (req, res) => {
  try {
    // Adapt to your frontend field names; here example uses league, time, day, etc.
    const {
      league,
      time,
      day,
      leftTeamName,
      rightTeamName,
      oddsOne,
      oddsDraw,
      oddsTwo,
    } = req.body;

    // Handle uploaded files for team logos
    const leftLogo = req.files?.leftLogo ? req.files.leftLogo[0].filename : null;
    const rightLogo = req.files?.rightLogo ? req.files.rightLogo[0].filename : null;

    const match = new Match({
      league,
      time,
      day,
      leftTeam: {
        name: leftTeamName,
        logo: leftLogo,
      },
      rightTeam: {
        name: rightTeamName,
        logo: rightLogo,
      },
      odds: {
        one: oddsOne,
        draw: oddsDraw,
        two: oddsTwo,
      },
    });

    await match.save();
    res.status(201).json(match);
  } catch (error) {
    console.error("Error creating match:", error);
    res.status(500).json({ message: "Server error creating match" });
  }
};

exports.updateMatch = async (req, res) => {
  try {
    const updatedData = { ...req.body };

    if (req.files?.leftLogo) {
      updatedData["leftTeam.logo"] = req.files.leftLogo[0].filename;
    }
    if (req.files?.rightLogo) {
      updatedData["rightTeam.logo"] = req.files.rightLogo[0].filename;
    }

    // You may also want to update nested fields properly
    // For odds or teams, you may need more fine-tuned updates.

    const updatedMatch = await Match.findByIdAndUpdate(req.params.id, updatedData, { new: true });

    if (!updatedMatch) {
      return res.status(404).json({ message: "Match not found" });
    }

    res.json(updatedMatch);
  } catch (error) {
    console.error("Error updating match:", error);
    res.status(500).json({ message: "Server error updating match" });
  }
};

exports.deleteMatch = async (req, res) => {
  try {
    const deleted = await Match.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Match not found" });
    }
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting match:", error);
    res.status(500).json({ message: "Server error deleting match" });
  }
};
