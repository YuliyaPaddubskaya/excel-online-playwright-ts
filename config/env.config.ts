import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const config = {
  email: process.env.MS_ACCOUNT_EMAIL || "",
  password: process.env.MS_ACCOUNT_PASSWORD || "",
};

if (!config.email || !config.password) {
  throw new Error(
    "CRITICAL: MS_ACCOUNT_EMAIL and MS_ACCOUNT_PASSWORD must be defined in .env",
  );
}
