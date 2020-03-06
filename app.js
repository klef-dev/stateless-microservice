require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const logger = require("morgan");

const api = require("./routes/api");

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
if (process.env.NODE_ENV !== "test") app.use(logger("tiny"));

// Connect to available DB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.log(err));

// Initialize passport
app.use(passport.initialize());

require("./config")(passport);

// api route
app.use("/api", api);

app.listen(port, () => console.debug(`Serving on port ${port}`));

module.exports = app;
