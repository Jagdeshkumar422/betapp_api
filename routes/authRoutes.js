const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Otp = require("../models/otp");
const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const SECRET_KEY = "your_secret_key"; // Change this to a secure secret

// Generate Random 6-Digit OTP
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/**
 * 1️⃣ Send OTP (Just shows OTP instead of sending SMS)
 */
router.post("/send-otp", async (req, res) => {
  const { mobileNumber } = req.body;
  if (!mobileNumber)
    return res.status(400).json({ error: "Mobile number is required" });

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

  if (otpRecord.otp !== otp)
    return res.status(400).json({ error: "Incorrect OTP" });
  if (new Date() > otpRecord.expiresAt)
    return res.status(400).json({ error: "OTP expired" });

  res.json({ success: true, message: "OTP verified successfully" });
});

router.post("/register", async (req, res) => {
  const {
    name,
    // mobileNumber,
    password,
    username,
    email,
    expiry,
    subscription,
  } = req.body;

  // console.log(req.body);

  try {
    if (
      !name ||
      name.trim() === "" ||
      !password ||
      password.trim() === "" ||
      !username ||
      username.trim() === "" ||
      !email ||
      email.trim() === "" ||
      !req.body.expiry ||
      req.body.expiry.trim() === ""
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }
    if (req.body.expiry === "none") {
      return res
        .status(400)
        .json({ success: false, message: "Select expiry period" });
    }
    // Check if user already exists with the same username, email, or mobileNumber
    const existingUserUsingEmail = await User.findOne({ email });

    if (existingUserUsingEmail) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const existingUserUsingUsername = await User.findOne({ username });

    if (existingUserUsingUsername) {
      return res.status(400).json({
        success: false,
        message: "User with this username already exists",
      });
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Set default values
    //const subscription = "premium"; // Default to premium on registration
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30); // Add 30 days for premium subscription

    const grandAuditLimit = 2000000.0; // Default value for grand audit limit

    // Store user in DB
    const newUser = new User({
      name,
      // mobileNumber,
      password: hashedPassword,
      username,
      email,
      subscription,
      expiry,
      grandAuditLimit,
    });

    await newUser.save();
    res
      .status(201)
      .json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

/**
 * 4️⃣ Login API
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "User not found" });

  // Verify password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

  // Generate JWT token
  const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, {
    expiresIn: "7d",
  });

  res.json({ success: true, message: "Login successful", token });
});

router.get("/user/profile", authMiddleware, async (req, res) => {
  try {
    // Get user ID from request after authentication
    const userId = req.user.id;

    // Fetch user data from the database (excluding password)
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/update-user-icon", async (req, res) => {
  const { userId, imageUrl } = req.body;

  if (!userId || !imageUrl) {
    return res
      .status(400)
      .json({ error: "User ID and image URL are required" });
  }

  try {
    // Find the user and update the userIcon field
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { userIcon: imageUrl },
      { new: true } // Return the updated user document
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      message: "User icon updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user icon:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/update-name", async (req, res) => {
  try {
    console.log("Received Request Body:", req.body); // Debugging

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body is empty" });
    }

    const { userId, newName } = req.body;

    if (!userId || !newName.trim()) {
      return res
        .status(400)
        .json({ message: "User ID and new name are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = newName;
    await user.save();

    res
      .status(200)
      .json({ message: "Name updated successfully", updatedName: user.name });
  } catch (error) {
    console.error("Error updating name:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || email.trim() === "" || !password || password.trim() === "") {
      return res
        .status(400)
        .json({ message: "email and password are required." });
    }
    if ((email !== "Capsiteafrica@gmail.com") & (password !== "Fiifi9088.")) {
      return res.status(400).json({ message: "email or password is wrong." });
    }

    // Generate JWT token
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "7d" });

    res.json({ success: true, message: "Login successful", token });
  } catch (error) {
    console.error("Error in admin login", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/admin/getAllUsers", async (req, res) => {
  try {
    const allUsers = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, allUsers });
  } catch (error) {
    console.error("Error fetching all users", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
