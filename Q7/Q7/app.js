const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");

const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/user");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: false }));

// Routes
app.use("/admin", adminRoutes);
app.use("/", userRoutes);

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/shopping_cart")
.then(() => {
    console.log("MongoDB Connected");
    app.listen(3000, () => console.log("Server running on http://localhost:3000"));
})
.catch(err => console.log(err));
