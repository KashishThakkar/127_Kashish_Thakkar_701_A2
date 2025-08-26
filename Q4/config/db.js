const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/erpdb");
const db = mongoose.connection;
if (db) {
  console.log("Database Connected!");
}
module.exports = mongoose;
