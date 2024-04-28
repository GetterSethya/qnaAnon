import { JWT_SECRET } from "$env/static/private";
import { redirect, type Cookies } from "@sveltejs/kit";
import { jwtVerify } from "jose";

export function mockDbCall(delay: number): Promise<unknown> {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    });
}

export class DbQueryError extends Error {
    private _type: string;
    constructor(type: string, message: string) {
        super();
        this.message = message;
        this._type = type;
    }

    public get type(): string {
        return this._type;
    }

    public set type(v: string) {
        this._type = v;
    }
}

export class AuthError extends Error {
    constructor(message: string) {
        super();
        this.message = message;
    }
}

export async function validateJWT(token: string) {
    try {
        const validate = await jwtVerify(
            token,
            new TextEncoder().encode(JWT_SECRET),
        );

        return validate.payload;
    } catch (err) {
        console.error(err);
        const authError = new AuthError("Invalid JWT");
        throw authError;
    }
}

export async function doValidateJTW(cookies: Cookies) {
    try {
        const session = cookies.get("session");
        if (session) {
            return await validateJWT(session);
        }
    } catch (err) {
        console.error(err);
        cookies.delete("session", { path: "/" });

        redirect(307, "/login");
    }

    return null;
}
