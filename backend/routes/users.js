import express from "express";
import crypto from "crypto";
import User from "../models/User.js";
import { authorize, protect } from "../middleware/auth.js";
import { sendCredentialsEmail, sendPasswordResetEmail } from "../utils/mailer.js";

const router = express.Router();

// All routes require owner role
router.use(protect, authorize("owner"));

// List all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to load users" });
  }
});

// Create employee account (owner-only)
router.post("/", async (req, res) => {
  try {
    const { username, email, role, phone } = req.body;

    if (!username || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    if (!role || !["stockmgr", "cashier"].includes(role)) {
      return res.status(400).json({
        message: "Role must be stockmgr or cashier",
      });
    }

    const exists = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (exists) {
      return res.status(400).json({ message: "User with this email or name already exists" });
    }

    // Generate temporary password
    const tempPassword = generateTempPassword();

    const user = await User.create({
      username,
      email,
      password: tempPassword,
      phone: phone || null,
      role,
      status: "Active",
      mustChangePassword: true,
    });

    // Send credential email (best-effort, don't block on failure)
    const loginUrl = req.headers.origin ? `${req.headers.origin}/login` : "http://localhost:5173/login";
    sendCredentialsEmail({
      to: email,
      name: username,
      email,
      password: tempPassword,
      role,
      loginUrl,
    }).then((result) => {
      if (result.success) console.log(`[Users] Credential email sent to ${email}`);
    });

    res.status(201).json({
      id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      tempPassword,
      emailSent: true,
      message: `Account created. Credentials emailed to ${email}.`,
    });
  } catch (error) {
    console.log("Create user error:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
});

// Suspend / Reactivate user
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Active", "Suspended"].includes(status)) {
      return res.status(400).json({ message: "Status must be Active or Suspended" });
    }

    // Cannot suspend yourself
    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({ message: "You cannot suspend your own account" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Cannot suspend another owner
    if (user.role === "owner") {
      return res.status(400).json({ message: "Owner accounts cannot be suspended" });
    }

    user.status = status;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user status" });
  }
});

// Change user role
router.patch("/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    if (!["stockmgr", "cashier"].includes(role)) {
      return res.status(400).json({ message: "Role must be stockmgr or cashier" });
    }

    // Cannot change own role
    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({ message: "You cannot change your own role" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "owner") {
      return res.status(400).json({ message: "Cannot change owner role" });
    }

    user.role = role;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to change role" });
  }
});

// Reset password (owner resets for an employee)
router.patch("/:id/reset-password", async (req, res) => {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({ message: "Use change-password for your own account" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const tempPassword = generateTempPassword();
    user.password = tempPassword;
    user.mustChangePassword = true;
    await user.save();

    // Send reset email
    const loginUrl = req.headers.origin ? `${req.headers.origin}/login` : "http://localhost:5173/login";
    sendPasswordResetEmail({
      to: user.email,
      name: user.username,
      password: tempPassword,
      loginUrl,
    }).then((result) => {
      if (result.success) console.log(`[Users] Password reset email sent to ${user.email}`);
    });

    res.status(200).json({
      message: `Password reset. New credentials emailed to ${user.email}.`,
      tempPassword,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to reset password" });
  }
});

// Update user details (general)
router.patch("/:id", async (req, res) => {
  try {
    const updates = {};
    const allowedKeys = ["username", "phone", "avator"];

    allowedKeys.forEach((key) => {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to update user" });
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own account" });
    }

    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userToDelete.role === "owner") {
      return res.status(400).json({ message: "Owner accounts cannot be deleted" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// Helper: generate a readable temp password
function generateTempPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pass = "";
  for (let i = 0; i < 10; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

export default router;
