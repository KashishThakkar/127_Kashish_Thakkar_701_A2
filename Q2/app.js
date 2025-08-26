const express = require("express");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const bcrypt = require("bcryptjs");

bcrypt.hash("kashish123", 10).then((hash) => {
  console.log("Pre-hashed password:", hash);
});

const app = express();
const PORT = 3000;

const password1 = bcrypt.hashSync("kashish123", 10);

const users = [
  {
    username: "kashish",
    password: "$2b$10$TsO8scpGn.B9tjRANBBxXudiXzA96KVlrwIHGUf3bQ1N22GWxgv9m",
  },
];

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(
  session({
    store: new FileStore({ path: "./sessions", retries: 1 }),
    secret: "aaa1234",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }, // 1 hour
  })
);

function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect("/login");
}

app.get("/", (req, res) => res.redirect("/login"));

app.get("/login", (req, res) => res.render("login", { error: null }));

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);
  if (user && (await bcrypt.compare(password, user.password))) {
    req.session.regenerate((err) => {
      if (err) return res.render("login", { error: "Something went wrong" });
      req.session.user = username;
      res.redirect("/dashboard");
    });
  } else {
    res.render("login", { error: "Invalid credentials" });
  }
});

app.get("/dashboard", isAuthenticated, (req, res) => {
  res.render("dashboard", { user: req.session.user });
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
