import bcrypt from "bcrypt";
import { error, redirect, type Actions, fail } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { JWTPayload } from "jose";
import { doValidateJTW, mockDbCall, validateJWT } from "$lib/helper";
import { cacheDB, db } from "$lib/db/db";
import { eq } from "drizzle-orm";
import type { UserResp } from "$lib/types";
import { ZodError, z } from "zod";
import { ZodBio, ZodEmail, ZodFullname, ZodPassword } from "$lib/zodSchema";
import { ResponseToastEnum } from "$lib/enum";
import { users } from "$lib/schema/schema";
import { LibsqlError } from "@libsql/client";
import { SALT } from "$env/static/private";
import { keyValue } from "$lib/schema/cacheSchema";
import { ActionsUpdateProfileHandler, PageLoadHandler, UpdateProfileError } from "./page.helper";

type UserUpdate = { name: string; email: string; bio: string | null }[];
export const load: PageServerLoad = async ({ cookies, params }) => {
    const pageLoadHandler = new PageLoadHandler(cookies)

    if (!pageLoadHandler.isSession()) {
        redirect(302, "/");
    }

    // Validasi JWT, kalo tidak valid redirect ke /login
    let validToken = await pageLoadHandler.validateSession()
    if (validToken === null) {
        redirect(307, "/login");
    }

    let userData: UserResp;
    try {
        userData = await pageLoadHandler.getUserById(validToken?.sub as string)
    } catch (err) {
        console.error(err);
        error(500, "Something went wrong");
    }

    if (!userData) {
        redirect(302, "/");
    }

    if (userData.username !== params.username) {
        redirect(302, "/");
    }

    return {
        userData: userData,
    };
};


const updatePassword = z.object({
    currentPassword: ZodPassword("Current password"),
    newPassword: ZodPassword("New password"),
    confirmPassword: ZodPassword("Confirm password"),
});

export const actions: Actions = {
    updateProfile: async ({ request, cookies, params }) => {

        let toast: ResponseToast = {
            error: true,
            message: ["Something went wrong"],
            type: ResponseToastEnum.error
        };

        try {
            console.log("Hit /profile/username?/updateProfile actions");
            const fd = await request.formData();
            const actionsUpdateProfileHandler = new ActionsUpdateProfileHandler(fd, cookies)

            if (!actionsUpdateProfileHandler.session) {
                return redirect(302, "/login");
            }

            let validToken = await actionsUpdateProfileHandler.validateSession();
            if (validToken === null) {
                cookies.delete("session", { path: "/" });
                return redirect(302, "/login");
            }
            actionsUpdateProfileHandler.parseForm()
            const userData = await actionsUpdateProfileHandler.getUserById(validToken?.sub as string)
            if (!userData) {
                return redirect(302, "/");
            }

            if (params.username !== userData.username) {
                return redirect(307, `/profile/${userData.username}`);
            }

            const userUpdate = await actionsUpdateProfileHandler.updateProfile(validToken?.sub as string)

            if (userUpdate.length < 1) {
                const updateError = new UpdateProfileError("Failed when trying to update your profile, please try again")
                throw updateError
            }

            actionsUpdateProfileHandler.invalidateCache(userData.username)
        } catch (err) {
            console.error(err)
            toast = {
                error: true,
                message: [
                    "Something went wrong",
                ],
                type: ResponseToastEnum.error,
            };
            let statusCode = 500

            if (err instanceof ZodError) {

                const errors = err.errors.map((e) => {
                    return e.message;
                });

                toast = {
                    error: true,
                    message: errors,
                    type: ResponseToastEnum.warning,
                };
                statusCode = 400

            }

            if (err instanceof LibsqlError) {
                if (err.code === "SQLITE_CONSTRAINT") {
                    toast = {
                        error: true,
                        message: ["Email already in use"],
                        type: ResponseToastEnum.warning,
                    };

                    statusCode = 400

                }
            }
            if (err instanceof UpdateProfileError) {
                toast = {
                    error: true,
                    message: [
                        "Failed when trying to update your profile, please try again..",
                    ],
                    type: ResponseToastEnum.error,
                };

                statusCode = 500

            }

            return fail(statusCode, toast);
        }


        toast = {
            error: false,
            message: ["Success"],
            type: ResponseToastEnum.primary,
        };

        return toast;
    },
    changePassword: async ({ request, cookies }) => {
        console.log("Hit /profile/username?/changePassword actions");

        let toast: ResponseToast;

        const fd = await request.formData();
        const { inputPassword, inputNewPassword, inputConfirmPassword } =
            Object.fromEntries(fd) as Record<string, string>;

        const session = cookies.get("session");
        if (!session) {
            return redirect(307, "/login");
        }

        if (inputNewPassword !== inputConfirmPassword) {
            toast = {
                error: true,
                message: [
                    "Your new password didnot match with the confirm password",
                ],
                type: ResponseToastEnum.warning,
            };

            return fail(400, toast);
        }

        try {
            updatePassword.parse({
                currentPassword: inputPassword,
                newPassword: inputNewPassword,
                confirmPassword: inputConfirmPassword,
            });
        } catch (err) {
            console.log(err);
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

        // Validasi JWT, kalo tidak valid redirect ke /login
        let validToken: JWTPayload | null = await doValidateJTW(cookies);
        if (validToken === null) {
            cookies.delete("session", { path: "/" });
            return redirect(302, "/login");
        }

        // get user by id
        let userData: typeof users.$inferSelect | undefined;
        try {
            userData = await db.query.users.findFirst({
                where: (user) => {
                    return eq(user.id, validToken?.sub as string);
                },
            });
        } catch (err) {
            console.error(err);

            toast = {
                error: true,
                message: [
                    "Failed when trying to update your password, try again",
                ],
                type: ResponseToastEnum.error,
            };

            return fail(500, toast);
        }

        if (!userData) {
            return redirect(302, "/");
        }

        const compareCurrent = await bcrypt.compare(
            inputPassword + SALT,
            userData.hashPassword,
        );

        if (!compareCurrent) {
            toast = {
                error: true,
                message: [
                    "Your current password is incorrect, Please try again..",
                ],
                type: ResponseToastEnum.warning,
            };

            return fail(400, toast);
        }

        const hashNewPassword = await bcrypt.hash(inputNewPassword + SALT, 10);

        try {
            await db
                .update(users)
                .set({
                    hashPassword: hashNewPassword,
                })
                .where(eq(users.id, userData.id));
        } catch (err) {
            console.error(err);
            if (err instanceof LibsqlError) {
                toast = {
                    error: true,
                    message: [
                        "Failed when updating your password, please try again..",
                    ],
                    type: ResponseToastEnum.error,
                };

                return fail(500, toast);
            } else {
                toast = {
                    error: true,
                    message: ["Something went wrong"],
                    type: ResponseToastEnum.error,
                };

                return fail(500, toast);
            }
        }

        toast = {
            error: false,
            message: ["Success"],
            type: ResponseToastEnum.primary,
        };
        return toast;
    },
};
