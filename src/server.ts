import { config as dotenvConfig } from "dotenv";
import mongoose from "mongoose";

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
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
