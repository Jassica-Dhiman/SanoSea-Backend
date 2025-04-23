const mongoose = require("mongoose");

const subAdminSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Ensures only one sub-admin entry per user
    },
    subAdminRole: {
      type: String,
      enum: ["Manage The Appointment", "Maintains An Audit Trail"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubAdmin", subAdminSchema);
