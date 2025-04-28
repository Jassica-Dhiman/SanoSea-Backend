const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// user schema
const userSchema = new mongoose.Schema(
  {
    profilePhoto: {
      type: Object,
      url: String,
      public_id: String,
      required: false,
    },
    fullName: {
      type: String,
      trim: true,
      required: true,
    },
    firstName: {
      type: String,
      trim: true,
      required: true,
    },
    lastName: {
      type: String,
      trim: true,
      required: false,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    officeAddress: {
      type: String,
      required: false,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    doctorProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null, // Attach Doctor Profile if user is a Doctor
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    state: {
      type: String,
      enum: ["Active", "Deactivate"],
      default: "Active",
    },
  },
  { timestamps: true }
);

// bcrypt and save the password
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// compare password (is it new or old)
userSchema.methods.comparePassword = async function (password) {
  const result = await bcrypt.compare(password, this.password);
  return result;
};

module.exports = mongoose.model("User", userSchema);
