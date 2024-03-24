import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import ExpressMongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";

import AppError from "./utils/AppError";
import { StatusCode } from "./utils/globalConstants";
import globalErrorHandler from "./controllers/errorController";

import indexRouter from "./routes/indexRoutes";

// Initialize the Application
const app = express();

// GLobal Middlewares
app.use(helmet());

app.use(
  express.json({
    limit: "10kb",
  }),
);
app.use(cookieParser());

// Data sanitization against nosql query injection
app.use(ExpressMongoSanitize());

// Data sanitization againt xss

// Request Logger
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// DOS and Brute force attack prevented
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many request from this IP, please try again in an hour",
});

app.use("/api", limiter);

app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsAverage",
      "ratingsQuantity",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  }),
);

// Routes
app.use("/api/v1", indexRouter);

app.all("*", (req, res, next) => {
  return next(
    new AppError(
      `Couldn't find ${req.originalUrl} on the server`,
      StatusCode.NOT_FOUND,
    ),
  );
});

app.use(globalErrorHandler);

export default app;
