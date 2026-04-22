import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userScheme = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: {
        values: ["owner", "stockmgr", "cashier"],
        message: "Role must be owner, stockmgr or cashier",
      },
      default: "cashier",
    },
    avator: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
      match: [/^[0-9]{10}$/, "Phone must be a valid 10-digit number"],
    },
    status: {
      type: String,
      enum: {
        values: ["Active", "Pending"],
        message: "Status must be Active or Pending",
      },
      default: "Active",
    },
  },
  { timestamps: true },
);

// hash password before saving
userScheme.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// compare password
userScheme.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userScheme);

export default User;
