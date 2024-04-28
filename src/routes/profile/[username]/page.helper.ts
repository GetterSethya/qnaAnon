import { cacheDB, db } from "$lib/db/db";
import { doValidateJTW } from "$lib/helper";
import { keyValue } from "$lib/schema/cacheSchema";
import { users } from "$lib/schema/schema";
import { ZodBio, ZodEmail, ZodFullname } from "$lib/zodSchema";
import type { Cookies } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { z } from "zod";

export class PageLoadHandler {
    private _cookies: Cookies;
    constructor(cookies: Cookies) {
        this._cookies = cookies
    }

    isSession() {
        if (this._cookies.get("session")) {
            return true
        } else {
            return false
        }
    }

    async validateSession() {
        return await doValidateJTW(this._cookies)
    }

    async getUserById(userId: string) {
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


export class ActionsUpdateProfileHandler {
    private _formData;
    private _updateProfileSchema;
    private _cookies: Cookies;
    private _session: string | undefined;
    constructor(fd: FormData, cookies: Cookies) {
        this._formData = fd
        this._cookies = cookies
        this._updateProfileSchema = z.object({
            name: ZodFullname,
            email: ZodEmail,
            bio: ZodBio,
        });
        this._session = this._cookies.get("session")
    }


    get session() {
        return this._session
    }


    async validateSession() {
        return await doValidateJTW(this._cookies)
    }

    parseForm() {
        const { inputName, inputEmail, inputBio } = Object.fromEntries(this._formData) as Record<string, string>
        this._updateProfileSchema.parse({
            name: inputName,
            email: inputEmail,
            bio: inputBio,
        });
    }

    async getUserById(userId: string) {
        const user = await db.query.users.findFirst({
            where: (user) => {
                return eq(user.id, userId);
            },
        });
        return user
    }


    async updateProfile(userId: string) {
        const { inputEmail, inputName, inputBio } = Object.fromEntries(this._formData) as Record<string, string>

        const update = await db
            .update(users)
            .set({
                name: inputName,
                email: inputEmail,
                bio: inputBio,
            })
            .where(eq(users.id, userId))
            .returning({
                name: users.name,
                email: users.email,
                bio: users.bio,
            });

        console.log(update)

        return update
    }

    async invalidateCache(username: string) {

        const cacheInstance = cacheDB();
        await cacheInstance
            .delete(keyValue)
            .where(eq(keyValue.key, username));
    }
}


export class UpdateProfileError extends Error {
    constructor(message: string) {
        super()
        this.message = message
    }
}
