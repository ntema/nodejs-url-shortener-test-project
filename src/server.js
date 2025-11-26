const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config();
const cors = require("cors");

const app = express();

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

//middlewares
app.use(express.urlencoded({ limit: "1000000mb", extended: true }));
app.use(express.json({ limit: "1000000mb", extended: true }));

// Connect to Database
connectDB();

// Routes
app.get("/", (req, res) => {
  res.status(200).json({
    message: "We're up and running",
  });
});
app.use("/", require("./routes/urlRoutes"));

app.use((req, res, next) => {
  const error = new Error("Route Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  if (error instanceof mongoose.CastError) {
    res.status(400).json({ message: "Invalid ID format" });
  }
});

app.use((error, req, res, next) => {
  if (res.status(error.status || 500)) {
    if (res.headersSent !== true) {
      return res.json({
        error: {
          status: error.status || 500,
          message: error.message,
        },
      });
    }
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
