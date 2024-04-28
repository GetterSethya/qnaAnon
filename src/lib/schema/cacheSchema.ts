import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const keyValue = sqliteTable("key_value", {
    key: text("key").notNull().primaryKey(),
    value: text("value", { mode: "json" }).notNull(),
});
