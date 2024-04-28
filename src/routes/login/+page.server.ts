import bcrypt from "bcrypt";
import { ResponseToastEnum } from "$lib/enum";
import { ZodEmail, ZodPassword } from "$lib/zodSchema";
import type { Actions } from "@sveltejs/kit";
import { ZodError, z } from "zod";
import { fail, redirect } from "@sveltejs/kit";
import { db } from "$lib/db/db";
import { eq } from "drizzle-orm";
import { AuthError, DbQueryError } from "$lib/helper";
import { JWT_EXPIRE, JWT_SECRET, SALT } from "$env/static/private";
import { SignJWT } from "jose";
import type { users } from "$lib/schema/schema";
import type { CookieSerializeOptions } from "cookie";
import type { PageServerLoad } from "./$types";

const loginSchema = z.object({
    email: ZodEmail,
    password: ZodPassword("Password"),
});

export const load: PageServerLoad = async ({ cookies }) => {
    const session = cookies.get("session");
    if (session) {
        redirect(302, "/");
    }
};

async function makeJWT(userId: string) {

    const secret = new TextEncoder().encode(JWT_SECRET as string);
    const alg = "HS256";


    const payload = {
        sub: userId,
    };
    const exp = (): string => {
        const jwtExp = parseInt(JWT_EXPIRE);
        return `${isNaN(jwtExp) ? 60 * 12 : jwtExp * 12}m`;
    };
    const options = {
        exp: exp(),
    };
    return await new SignJWT(payload)
        .setProtectedHeader({ alg })
        .setExpirationTime(options.exp)
        .setIssuedAt()
        .setSubject(payload.sub)
        .sign(secret);
}

function parseLoginForm({ email, password }: z.infer<typeof loginSchema>, toast: ResponseToast) {

    try {
        loginSchema.parse({
            email: email,
            password: password,
        });
    } catch (err) {
        console.error(err);
        if (err instanceof ZodError) {
            const errors = err.errors.map((e) => {
                return e.message;
            });

            toast = {
                error: true,
                message: errors,
                type: ResponseToastEnum.warning,
            };
            return fail(400, toast);
        } else {
            toast = {
                error: true,
                message: ["Something went wrong"],
                type: ResponseToastEnum.error,
            };

            return fail(500, toast);
        }
    }
}

async function compareCred(inputPassword: string, userDbPass: string) {

    const comparePass = await bcrypt.compare(
        inputPassword + SALT,
        userDbPass,
    );

    if (!comparePass) {
        const authError = new AuthError(
            "Email or Password incorrect, Please try again",
        );

        throw authError;
    }
}

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        console.log("Hit /login");

        let toast: ResponseToast = {
            error: true,
            message: ["Something went wrong"],
            type: ResponseToastEnum.error
        };
        const fd = await request.formData();
        const { inputEmail, inputPassword } = Object.fromEntries(fd) as Record<string, string>;

        parseLoginForm({ email: inputEmail, password: inputPassword }, toast)
        let user: typeof users.$inferSelect | undefined = undefined;

        try {
            // get user data by email
            user = await db.query.users.findFirst({
                where: (user) => {
                    return eq(user.email, inputEmail);
                },
            });

            // if user didnot exist, throw error;
            if (!user) {
                const queryError = new DbQueryError(
                    "Not found",
                    "Email or Password incorrect, Please try again",
                );
                throw queryError;
            }

            // compare password
            await compareCred(inputPassword, user.hashPassword)
        } catch (err) {
            console.error(err);
            if (err instanceof DbQueryError || err instanceof AuthError) {
                toast = {
                    error: true,
                    message: [err.message],
                    type: ResponseToastEnum.warning,
                };

                return fail(400, toast);
            } else {
                toast = {
                    error: true,
                    message: ["Something went wrong"],
                    type: ResponseToastEnum.error,
                };

                return fail(500, toast);
            }
        }

        let jwt: string | null = null;
        try {
            if (!user) throw new Error("User is undefined");
            jwt = await makeJWT(user.id)
        } catch (err) {
            console.error(err);
            toast = {
                error: true,
                message: ["Failed when trying to login"],
                type: ResponseToastEnum.error,
            };

            return fail(500, toast);
        }

        // set cookie
        try {
            if (!jwt) {
                throw new Error("jwt is undefined");
            }

            const cookieOptions: CookieSerializeOptions & { path: string } = {
                httpOnly: true,
                path: "/",
                secure: process.env.NODE_ENV !== "development",
                maxAge: 60 * 60 * 12,
            };

            cookies.set("session", jwt, cookieOptions);
        } catch (err) {
            console.error(err);
            toast = {
                error: true,
                message: ["Something went wrong"],
                type: ResponseToastEnum.error,
            };

            return fail(500, toast);
        }

        throw redirect(302, "/");
    },
};
