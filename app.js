const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
require('dotenv').config();
const bodyParser = require("body-parser");
const app = express();
const otpRoutes =  require("./routes/authRoutes")
const betRoute = require("./routes/betRoute")
const multibet = require('./routes/multibetRoutes')
const depositRoute = require("./routes/depositeRoute.js")
const verifycodeRoute = require('./routes/verifyCodeRoute.js')

// Middleware for parsing JSON
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: "*", // Replace with your frontend URL
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }));
// Register the routes

app.get("/api", (req, res) => {
  res.json({ message: "API running successfully" });
});

app.use("/api", otpRoutes);
app.use("/api", betRoute);
app.use("/api", multibet);
app.use("/api", depositRoute);
app.use("/api", verifycodeRoute);

// Connect to MongoDB (replace with your own URI)
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
   
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
