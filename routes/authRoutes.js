const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Otp = require("../models/otp");
const User = require("../models/user");

const router = express.Router();
const SECRET_KEY = "your_secret_key"; // Change this to a secure secret

// Store blacklisted tokens (use Redis for better scalability)
const BLACKLIST = new Set();

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

/**
 * 3️⃣ Register User
 */
router.post("/register", async (req, res) => {
  const { name, mobileNumber, password } = req.body;

  // Check if OTP is verified
  const otpRecord = await Otp.findOne({ mobileNumber });
  if (!otpRecord) return res.status(400).json({ error: "OTP not verified" });

  // Hash password before storing
  const hashedPassword = await bcrypt.hash(password, 10);

  // Store user in DB
  const newUser = new User({ name, mobileNumber, password: hashedPassword });
  await newUser.save();

  // Delete OTP after registration
  await Otp.deleteOne({ mobileNumber });

  res.json({ success: true, message: "User registered successfully" });
});

/**
 * 4️⃣ Login API
 */
router.post("/login", async (req, res) => {
  const { mobileNumber, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ mobileNumber });
  if (!user) return res.status(400).json({ error: "User not found" });

  // Verify password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

  // Generate JWT token
  const token = jwt.sign({ id: user._id, mobileNumber: user.mobileNumber }, SECRET_KEY, { expiresIn: "7d" });

  res.json({ success: true, message: "Login successful", token });
});

/**
 * 5️⃣ Logout API
 */
router.post("/logout", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(400).json({ error: "No token provided" });

  // Add token to blacklist
  BLACKLIST.add(token);

  res.json({ success: true, message: "Logged out successfully" });
});

/**
 * 6️⃣ Middleware to Protect Routes (Checks Blacklisted Tokens)
 */
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  if (BLACKLIST.has(token)) {
    return res.status(401).json({ error: "Token is invalid. Please log in again." });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });

    req.user = decoded;
    next();
  });
};

module.exports = router;
