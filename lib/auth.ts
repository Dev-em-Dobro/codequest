import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../server/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg"
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    additionalFields: {
      points: {
        type: "number",
        defaultValue: 0,
      },
      level: {
        type: "number", 
        defaultValue: 1,
      },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET || "dev-secret-key-change-in-production-this-is-very-important",
  baseURL: "http://localhost:5000",
});