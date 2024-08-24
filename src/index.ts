import bodyParser from "body-parser";
import { initDatabase } from "./models";
import express, { Router } from "express";
import rateLimit from "express-rate-limit";
import router from "./routes/router";

// Initializers
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
    windowMs: 10 * 1000, // 10 mins
    max: 100, // 100 requests
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
  })
);

app.use((req, res, next) => {
  router(req, res, next);
});

const port = process.env.PORT || 7000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
