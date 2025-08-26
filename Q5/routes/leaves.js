const express = require("express");
const Leave = require("../models/Leave");
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

router.post("/", auth, async (req, res) => {
  const { date, reason } = req.body;
  const leave = new Leave({
    employee: req.user.id,
    date,
    reason,
    grant: "No"
  });
  await leave.save();
  res.json(leave);
});

router.get("/", auth, async (req, res) => {
  const leaves = await Leave.find({ employee: req.user.id });
  res.json(leaves);
});

module.exports = router;
