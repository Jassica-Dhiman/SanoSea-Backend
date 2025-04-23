const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Ensures only one patient entry per user
    },
    appointmentStatus: {
      type: String,
      enum: ["New", "Complete", "Canceled", "Past", "Waiting", "Upcoming"],
      required: false,
    },
    canDownloadReport: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
