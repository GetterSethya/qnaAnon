import { drizzle } from "drizzle-orm/libsql";
import { drizzle as drizzleCache } from "drizzle-orm/better-sqlite3";
import { createClient } from "@libsql/client";
import { TURSO_DB_TOKEN, TURSO_DB_URL } from "$env/static/private";
import * as schema from "$lib/schema/schema";
import * as cacheSchema from "$lib/schema/cacheSchema";
import sqliteDb from "better-sqlite3";

const client = createClient({
    url: TURSO_DB_URL,
    authToken: TURSO_DB_TOKEN,
});
export const db = drizzle(client, { schema });

const inMemorySqlite = new sqliteDb(":memory:");
export const cacheDB = () => {
    const db = drizzleCache(inMemorySqlite, { schema: cacheSchema });
    const keyValueQuery = `
    CREATE TABLE IF NOT EXISTS key_value (
        key TEXT NOT NULL PRIMARY KEY,
        value TEXT NOT NULL
)`;

    inMemorySqlite.prepare(keyValueQuery).run();

    if (!global.cacheDb) {
        global.cacheDb = db;
        console.log("No global.cacheDb");
    }

    return db;
};
