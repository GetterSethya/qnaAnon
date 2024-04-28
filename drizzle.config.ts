import type { Config } from "drizzle-kit";

export default {
    schema: "./src/lib/schema/schema.ts",
    out: "./migrations",
    driver: "turso",
    dbCredentials: {
        url: process.env.TURSO_DB_URL as string,
        authToken: process.env.TURSO_DB_TOKEN as string,
    },
    strict: true,
    verbose: true,
} satisfies Config;
