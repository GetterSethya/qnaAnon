import type { users } from "./schema/schema";

export type UserResp =
    | Omit<typeof users.$inferSelect, "hashPassword">
    | undefined;
