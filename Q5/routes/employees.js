const express = require("express");
const Employee = require("../models/Employee");
const jwt = require("jsonwebtoken");

const router = express.Router();

function auth(req, res, next) {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ error: "No token" });
  const token = header.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

router.get("/me", auth, async (req, res) => {
  const emp = await Employee.findById(req.user.id).select("-passwordHash");
  res.json(emp);
});

module.exports = router;
