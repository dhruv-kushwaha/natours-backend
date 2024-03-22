import express from "express";
import morgan from "morgan";

import AppError from "./utils/AppError";
import { StatusCode } from "./utils/globalConstants";
import globalErrorHandler from "./controllers/errorController";

import indexRouter from "./routes/indexRoutes";

// Initialize the Application
const app = express();

app.use(express.json());

// Request Logger
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// Routes
app.use("/api/v1", indexRouter);

app.all("*", (req, res, next) => {
  return next(
    new AppError(
      `Couldn't find ${req.originalUrl} on the server`,
      StatusCode.NOT_FOUND
    )
  );
});

app.use(globalErrorHandler);

export default app;
