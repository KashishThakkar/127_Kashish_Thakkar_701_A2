const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  empid: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  designation: { type: String, default: "" },
  baseSalary: { type: Number, required: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Employee", EmployeeSchema, "employees");
