const express = require("express");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const path = require("path");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail", // or any email service
  auth: {
    user: process.env.EMAIL_USER, // from your .env
    pass: process.env.EMAIL_PASS, // App Password if 2FA is enabled
  },
});

// Utils & Models
// const { calcSalary } = require("./utils/salary");
const Employee = require("./models/Employee");

// DB connection
require("./config/db");

const app = express();
const PORT = 3000;

//if not exists then create sessions folder  [OPTIONAL]
const sessionsPath = path.join(__dirname, "sessions");
if (!fs.existsSync(sessionsPath)) {
  fs.mkdirSync(sessionsPath, { recursive: true });
}

app.use(
  session({
    store: new FileStore({ path: "./sessions", retries: 1 }),
    secret: "aaa1234",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }, // 1 hour
  })
);

// Views & Static
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// Admin credentials (hardcoded for demo)
const ADMIN = { username: "admin", password: "admin123" };

// Auth middleware
function requireAdmin(req, res, next) {
  if (req.session && req.session.admin) return next();
  res.redirect("/login");
}

// Routes
app.get("/", (req, res) => res.redirect("/employees"));

// Login
app.get("/login", (req, res) => res.render("login", { error: null }));
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN.username && password === ADMIN.password) {
    req.session.admin = { username };
    return res.redirect("/employees");
  }
  res.render("login", { error: "Invalid credentials" });
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

// List employees
app.get("/employees", requireAdmin, async (req, res) => {
  const list = await Employee.find();
  res.render("employees_list", { list, calcSalary });
});

// New employee form
app.get("/employees/new", requireAdmin, (req, res) => {
  res.render("employees_new", { error: null });
});

// Generate employee ID & password
function genEmpId() {
  return "EMP" + Math.floor(100000 + Math.random() * 900000);
}
function genPassword() {
  return Math.random().toString(36).slice(-8);
}
const logFile = path.join(__dirname, "employee_log.txt");

// Create employee
const { calcSalary } = require("./utils/salary"); // make sure path is correct
app.post("/employees/new", requireAdmin, async (req, res) => {
  const { name, email, designation, baseSalary, hra, bonus } = req.body;
  const empid = genEmpId();
  const plainPass = genPassword();
  const passwordHash = await bcrypt.hash(plainPass, 10);
  const salaryDetails = calcSalary(baseSalary, hra, bonus);
  try {
    await Employee.create({
      empid,
      name,
      email,
      designation,
      baseSalary: Number(baseSalary),
      passwordHash,
      hra: Number(hra),
      bonus: Number(bonus),
      totalSalary: salaryDetails.total, // store computed total salary
    });

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to ERP System",
      text: `Hi ${name},\n\nYour ERP login details:\nEmpID: ${empid}\nPassword: ${plainPass}`,
    });

    const logEntry = `[${new Date().toISOString()}] Employee Created: 
      Name: ${name}, 
      Email: ${email}, 
      EmpID: ${empid}, 
      TempPassword: ${plainPass}\n\n`;

    fs.appendFileSync(logFile, logEntry, "utf8");
    res.redirect("/employees");
  } catch (e) {
    console.error(e);
    res.status(400).render("employees_new", { error: e.message });
  }
});

// Edit employee form
app.get("/employees/:id/edit", requireAdmin, async (req, res) => {
  const emp = await Employee.findById(req.params.id);
  if (!emp) return res.status(404).send("Not found");
  res.render("employees_edit", { emp, error: null });
});

// Update employee
app.post("/employees/:id/edit", requireAdmin, async (req, res) => {
  const { name, email, designation, baseSalary, hra, bonus } = req.body;
  try {
    await Employee.findByIdAndUpdate(req.params.id, {
      name,
      email,
      designation,
      baseSalary: Number(baseSalary),
      hra: Number(hra),
      bonus: Number(bonus),
    });
    res.redirect("/employees");
  } catch (e) {
    const emp = await Employee.findById(req.params.id);
    res.status(400).render("employees_edit", { emp, error: e.message });
  }
});

// Delete employee
app.post("/employees/:id/delete", requireAdmin, async (req, res) => {
  await Employee.findByIdAndDelete(req.params.id);
  res.redirect("/employees");
});

// Start server
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
