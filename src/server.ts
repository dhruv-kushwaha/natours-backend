import { config as dotenvConfig } from "dotenv";
import mongoose from "mongoose";

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);

  process.exit(1);
});

// Configure the Environment Variables
dotenvConfig({
  path: "config.env",
});

import app from "./app";

console.log("Hello");

// Listening on PORT
mongoose
  .connect(process.env.DATABASE_LOCAL as string)
  .then(() => console.log("🫡🫡 DB Connection Successfull"));

const PORT = process.env.PORT ?? 3001;
const server = app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

// Handling global unhandled promise rejections
process.on("unhandledRejection", function (err: Error) {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  // 1 => uncaught exception, 0 => success
  server.close(() => {
    // Kill the process after closing the server
    process.exit(1);
  });
});

// uncaughtExceptions => Errors in the sync code
