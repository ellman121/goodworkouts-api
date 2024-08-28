import express from "express";
import bodyParser from "body-parser";
import rateLimit from "express-rate-limit";

import router from "./routes/router";
import { initDatabase } from "./database";

const timeLabel = "Startup time";
console.time(timeLabel);

// Initialize the database
initDatabase();

// Create the express app and listen
const app = express();

// Remove X-Powered-By header for security reason
app.disable("x-powered-by");

// set up file, url and rate limits
app.use(bodyParser.json({ limit: "35mb" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  rateLimit({
    max: 100, // 100 requests
    windowMs: 10 * 1000, // 10 mins
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
  })
);

app.use((req, res, next) => {
  router(req, res, next);
});

const port = process.env.PORT || 2000;
app.listen(port, () => {
  console.timeEnd(timeLabel);
  console.log(`Server is running on port ${port}`);
});
