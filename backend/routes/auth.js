import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import jwt from "jsonwebtoken";
import { sendCredentialsEmail, sendPasswordResetEmail, sendPasswordChangedEmail } from "../utils/mailer.js";

const router = express.Router();

// Check if system needs initial setup (no owner exists yet)
router.get("/setup-check", async (req, res) => {
  try {
    const ownerExists = await User.exists({ role: "owner" });
    res.json({ needsSetup: !ownerExists });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// Register — ONLY works if no owner account exists (first-time setup)
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, phone, companyName } = req.body;

    // Check if an owner already exists
    // (Disabled to allow multiple creations during dev/testing as requested by user)
    // const ownerExists = await User.exists({ role: "owner" });
    // if (ownerExists) {
    //   return res.status(403).json({
    //     message: "Registration is closed. Only the owner can create accounts.",
    //   });
    // }

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      username,
      email,
      password,
      phone: phone || undefined,
      role: "owner",
      status: "Active",
    });
    
    // Explicitly set the owner's tenantId to themselves
    user.tenantId = user._id;
    await user.save({ validateBeforeSave: false });

    // Save companyName to Settings so receipts don't show mock data
    if (companyName) {
      const Settings = (await import("../models/Settings.js")).default;
      let settings = await Settings.findOne({ tenantId: user._id });
      if (!settings) {
        await Settings.create({ storeName: companyName, tenantId: user._id });
      } else {
        settings.storeName = companyName;
        await settings.save();
      }
    }

    const loginUrl = req.headers.origin ? `${req.headers.origin}/login` : "http://localhost:5173/login";
    sendCredentialsEmail({
      to: email,
      name: username,
      email,
      password: "<hidden - specified during signup>",
      role: "owner",
      loginUrl,
    });

    res.status(201).json({
      id: user._id,
      role: user.role,
      email: user.email,
      username: user.username,
      phone: user.phone,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.log(err);
    if (err?.code === 11000) {
      return res.status(400).json({ message: "Email or username already taken" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Login — auto-detect role, no role selector needed
router.post("/login", async (req, res) => {
    let { email, password } = req.body;
    try {
    
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    email = email.trim();
    password = password.trim();

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res
        .status(401)
        .json({ message: "Invalid email or password" });
    }

    // Check if account is suspended
    if (user.status === "Suspended") {
      return res
        .status(403)
        .json({ message: "Your account has been suspended. Contact your administrator." });
    }

    // Update last active timestamp
    user.lastActive = new Date();
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      id: user._id,
      role: user.role,
      email: user.email,
      username: user.username,
      phone: user.phone,
      avator: user.avator,
      status: user.status,
      mustChangePassword: user.mustChangePassword || false,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get current user info
router.get("/me", protect, async (req, res) => {
  // Update last active on every /me call
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, { lastActive: new Date() });
  }
  res.status(200).json(req.user);
});

// Change own password (for first-login password change)
router.patch("/change-password", protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    sendPasswordChangedEmail({
      to: user.email,
      name: user.username
    });

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  try {
    let { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    email = email.trim();

    const user = await User.findOne({ email });
    if (!user) {
      // Don't leak whether user exists or not for security
      return res.status(200).json({ message: "If the email is registered, a temporary password has been sent." });
    }

    const tempPassword = Math.random().toString(36).slice(-8);
    user.password = tempPassword;
    user.mustChangePassword = true;
    await user.save();

    const loginUrl = req.headers.origin ? `${req.headers.origin}/login` : "http://localhost:5173/login";
    await sendPasswordResetEmail({
      to: user.email,
      name: user.username,
      password: tempPassword,
      loginUrl,
    });

    res.status(200).json({ message: "If the email is registered, a temporary password has been sent." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

export default router;
