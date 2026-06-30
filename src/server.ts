import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load environment variables
if (process.env.NODE_ENV === "production") {
  const prodPath = path.join(process.cwd(), ".env.production");
  const defaultPath = path.join(process.cwd(), ".env");
  
  // Try to load .env.production first
  if (fs.existsSync(prodPath) && fs.statSync(prodPath).size > 0) {
    const result = dotenv.config({ path: prodPath });
    if (result.error) {
      console.error("Error loading .env.production:", result.error);
      console.warn("Falling back to .env");
      dotenv.config({ path: defaultPath });
    } else {
      console.log("✓ Loaded .env.production");
    }
  } else {
    console.warn(".env.production is empty or missing, falling back to .env");
    dotenv.config({ path: defaultPath });
  }
} else {
  dotenv.config({ path: path.join(process.cwd(), ".env") });
}

// Verify critical environment variables
if (!process.env.MONGO_URL) {
  console.error("ERROR: MONGO_URL is not defined in environment variables!");
  console.error("Please ensure .env.production (or .env) contains MONGO_URL");
  process.exit(1);
}

import mongoose from "mongoose";
import server from "./app";

mongoose
  .connect(process.env.MONGO_URL as string, {})
  .then(() => {
    console.log("MongoDB connection succeed");
    const PORT = process.env.PORT ?? 3003;
    server.listen(PORT, function () {
      console.info(`The server is running successfully on port: ${PORT}`);
      console.info(`Admin project on http://localhost:${PORT}/admin \n`);
    });
  })
  .catch((err) => console.log("ERROR on connection MongoDB", err));