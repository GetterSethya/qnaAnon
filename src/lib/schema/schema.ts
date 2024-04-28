import {
    integer,
    sqliteTable,
    text,
    uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { v4 as uuidv4 } from "uuid";

export const users = sqliteTable(
    "users",
    {
        id: text("id")
            .notNull()
            .primaryKey()
            .unique()
            .$defaultFn(() => {
                return uuidv4();
            }),
        createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
        updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
        deletedAt: integer("deletedAt", { mode: "timestamp" }),
        username: text("username").notNull().unique(),
        email: text("email").notNull().unique(),
        name: text("name").notNull(),
        bio: text("bio"),
        hashPassword: text("hashPassword").notNull(),
    },
    (table) => {
        return {
            usernameUniqueIdx: uniqueIndex("username_unique_idx").on(
                table.username,
            ),
            emailUniqueIdx: uniqueIndex("email_unique_idx").on(table.email),
        };
    },
);

export const question = sqliteTable("questions", {
    id: text("id")
        .notNull()
        .primaryKey()
        .unique()
        .$defaultFn(() => {
            return uuidv4();
        }),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
    deletedAt: integer("deletedAt", { mode: "timestamp" }),
    userId: text("user_id")
        .notNull()
        .references(() => {
            return users.id;
        }),
    name: text("name").notNull(),
    body: text("body").notNull(),
    visibility: text("visibility").notNull(),
});
