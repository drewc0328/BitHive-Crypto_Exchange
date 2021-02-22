const dotenv = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const cryptoRoutes = require("./routes/crypto-routes");
const userRoutes = require("./routes/user-routes");

const HttpError = require("./models/http-error");

dotenv.config();

const server = express();

server.use(bodyParser.json());
server.use(cors());

server.use("/api/cryptocurrencies", cryptoRoutes);
server.use("/api/users", userRoutes);

server.use((req, res, next) => {
  const error = new HttpError("Couldn't find this route", 404);
  throw error;
});

server.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_CONN_STRING, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    server.listen(process.env.PORT, () => {
      console.log(`Server connected on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.log("error: " + err);
  }
})();

mongoose.set("useCreateIndex", true);
