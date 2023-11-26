require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// require routes
const authRoute = require("./routes/authRoute.js");
const userRoute = require("./routes/userRoute.js");
const seriesRoute = require("./routes/seriesRoute.js");
const sermonRoute = require("./routes/sermonRoute.js");
const openingRoute = require("./routes/openingRoute.js");
const closingRoute = require("./routes/closingRoute.js");
const pointRoute = require("./routes/pointRoute.js");
const verseRoute = require("./routes/verseRoute.js");

// express app
const app = express();

// middlewares
app.use(
  cors({
    credentials: true,
    origin: "*",
    // origin: process.env.CORS_ORIGIN,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// routes
app.use("/api/auth/", authRoute);
app.use("/api/users/", userRoute);
app.use("/api/series/", seriesRoute);
app.use("/api/sermons/", sermonRoute);
app.use("/api/openings/", openingRoute);
app.use("/api/closings/", closingRoute);
app.use("/api/points/", pointRoute);
app.use("/api/verses/", verseRoute);

// connect to db
const PORT = process.env.PORT || 4000;

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`connecting to db & listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Error: " + error);
  });
