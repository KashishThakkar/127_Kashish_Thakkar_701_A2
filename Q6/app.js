const express = require("express");
const axios = require("axios");

const app = express();

//  put your OpenWeather API key here
const API_KEY = "4f6a613b0542aea6075e702600c8c538";

// Serve frontend (index.html)
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Weather endpoint (backend hides API key)
app.get("/api/weather", async (req, res) => {
  try {
    const city = req.query.city;
    if (!city) return res.status(400).json({ error: "Missing ?city=" });

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&appid=${API_KEY}&units=metric`;

    const { data } = await axios.get(url);

    res.json({
      city: `${data.name}, ${data.sys.country}`,
      temp: data.main.temp,
      feels: data.main.feels_like,
      desc: data.weather[0].description,
      icon: data.weather[0].icon,
    });
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.message || err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
