import { type Config } from "drizzle-kit";
export default {
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
  tablesFilter: ["food-creator_*"],
} satisfies Config;
