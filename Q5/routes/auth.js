const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Employee = require("../models/Employee");
const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const emp = await Employee.findOne({ email });
  if (!emp) return res.status(400).json({ error: "Invalid email or password" });

  const valid = await bcrypt.compare(password, emp.passwordHash);
  if (!valid) return res.status(400).json({ error: "Invalid email or password" });

  const token = jwt.sign({ id: emp._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

module.exports = router;
