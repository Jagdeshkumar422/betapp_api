const express = require("express");
const Otp = require("../models/otp");
const User = require("../models/user");

const router = express.Router();

// Generate Random 6-Digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

/**
 * 1️⃣ Send OTP (Just shows OTP instead of sending SMS)
 */
router.post("/send-otp", async (req, res) => {
  const { mobileNumber } = req.body;
  if (!mobileNumber) return res.status(400).json({ error: "Mobile number is required" });

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

  await Otp.findOneAndUpdate(
    { mobileNumber },
    { otp, expiresAt },
    { upsert: true, new: true }
  );

  res.json({ success: true, message: `OTP generated: ${otp}` }); // Show OTP in response
});

/**
 * 2️⃣ Verify OTP
 */
router.post("/verify-otp", async (req, res) => {
  const { mobileNumber, otp } = req.body;

  const otpRecord = await Otp.findOne({ mobileNumber });
  if (!otpRecord) return res.status(400).json({ error: "Invalid OTP" });

  if (otpRecord.otp !== otp) return res.status(400).json({ error: "Incorrect OTP" });
  if (new Date() > otpRecord.expiresAt) return res.status(400).json({ error: "OTP expired" });

  res.json({ success: true, message: "OTP verified successfully" });
});


router.post("/register", async (req, res) => {
  const { name, mobileNumber, password } = req.body;

  // Check if OTP is verified
  const otpRecord = await Otp.findOne({ mobileNumber });
  if (!otpRecord) return res.status(400).json({ error: "OTP not verified" });

  // Store user in DB
  const newUser = new User({ name, mobileNumber, password });
  await newUser.save();

  // Delete OTP after registration
  await Otp.deleteOne({ mobileNumber });

  res.json({ success: true, message: "User registered successfully" });
});
module.exports = router;
