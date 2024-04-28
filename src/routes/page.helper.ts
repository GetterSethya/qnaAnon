import { db } from "$lib/db/db";
import { validateJWT } from "$lib/helper";
import type { Cookies } from "@sveltejs/kit";
import { eq, sql } from "drizzle-orm";

export type UserDiscover = {
    id: string;
    name: string;
    username: string;
    bio: string | null;
};

export class PageLoadHandler {
    private _cookies: Cookies;
    private _session: string | undefined;
    constructor(cookies: Cookies) {
        this._cookies = cookies
        this._session = this._cookies.get("session")
    }

    async doValidate() {
        return await validateJWT(this._session as string)
    }

    static async getDiscover() {
        let result = null;
        try {
            const statement = sql`SELECT id,name,username,bio FROM users ORDER BY RANDOM() LIMIT 5`;
            result = (await db.run(statement)).rows as unknown as UserDiscover[];
        } catch (err) {
            console.error(err);
            return Promise.reject(err);
        }

        return result;

    }


    static async getUserById(userId: string) {
        const user = await db.query.users.findFirst({
            where: (user) => {
                return eq(user.id, userId);
            },
            columns: {
                hashPassword: false,
            },
        });

        return user
    }
}
