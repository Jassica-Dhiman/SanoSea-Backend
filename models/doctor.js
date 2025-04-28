const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  licenseProof: {
    url: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
  },
  availability: {
    days: [{ type: String, required: true }], // Example: ["Monday", "Wednesday"]
    hours: [{ type: String, required: true }], // Example: ["09:00 AM - 12:00 PM"]
  },
});

module.exports = mongoose.model("Doctor", doctorSchema);
