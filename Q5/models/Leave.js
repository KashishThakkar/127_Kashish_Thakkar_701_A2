const mongoose = require("mongoose");

const LeaveSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  date: { type: Date, required: true },
  reason: { type: String, required: true },
  grant: { type: String, enum: ["Yes", "No"], default: "No" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Leave", LeaveSchema);
