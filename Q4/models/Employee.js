const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  empid: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  designation: { type: String, default: "" },
  baseSalary: { type: Number, required: true },
  hra: { type: Number, required: true },
  bonus: { type: Number, required: true },
  totalSalary: { type: Number, required: true }, // Add this field
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Employee = mongoose.model("Employee", EmployeeSchema, "employees");
module.exports = Employee;
