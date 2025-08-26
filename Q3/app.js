const express = require("express");
const session = require("express-session");
const RedisStore = require("connect-redis").default;
const Redis = require("ioredis");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 3000;

const plainPassword = "user123";
bcrypt.hash(plainPassword, 10).then((hash) => {
  console.log(` Hashed "${plainPassword}":`, hash);
});

// Pre-created user (password = "user123")
const users = [
  {
    username: "user",
    password: "$2b$10$f7aJr6MXEggbtm5b8XerleKmOEU5N3OXfJosRhlNdgI2y1FpNvyOu",
  },
];

let store;

// Try Redis
const redisClient = new Redis({ host: "127.0.0.1", port: 6379 });

redisClient.on("connect", () => {
  console.log("Connected to Redis, using Redis session store");
  store = new RedisStore({ client: redisClient });
});

redisClient.on("error", (err) => {
  if (!store) {
    console.log("Redis not available, falling back to MemoryStore");
    store = new session.MemoryStore();
  }
});

// Use MemoryStore by default until Redis connects
if (!store) {
  store = new session.MemoryStore();
}

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Session middleware
app.use(
  session({
    store,
    secret: "aaa1234",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }, // 1 hour
  })
);

// Middleware to check authentication
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect("/login");
}

// Routes
app.get("/", (req, res) => res.redirect("/login"));

app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

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
  console.log(`Server running at http://localhost:${PORT}`)
);
