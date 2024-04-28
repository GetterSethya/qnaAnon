import { cacheDB, db } from "$lib/db/db";
import { doValidateJTW } from "$lib/helper";
import { error, redirect, type Actions, fail } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { JWTPayload } from "jose";
import { eq } from "drizzle-orm";
import type { UserResp } from "$lib/types";
import { keyValue } from "$lib/schema/cacheSchema";
import { ZodError, z } from "zod";
import { ResponseToastEnum } from "$lib/enum";
import { ZodFullname, ZodQuestions } from "$lib/zodSchema";
import { question, users } from "$lib/schema/schema";

type askForm = {
    visibility: string,
    name: string,
    question: string,
}

enum visibility {
    Public = "true",
    Private = "false",
}

const askSchema = z.object({
    name: ZodFullname,
    question: ZodQuestions,
    visibility: z.nativeEnum(visibility),
});


function parseAskForm({ visibility, name, question }: askForm, toast: ResponseToast,) {
    try {
        askSchema.parse({
            name,
            question: question,
            visibility: visibility,
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
export const load: PageServerLoad = async ({ cookies, params }) => {
    const usernameParam = params.username;
    const returnData: {
        profile: UserResp;
        userData: UserResp;
        questions: Promise<any> | undefined;
    } = {
        userData: undefined,
        profile: undefined,
        questions: undefined,
    };

    // Validasi JWT, kalo tidak valid redirect ke /login
    let validToken: JWTPayload | null = await doValidateJTW(cookies);

    try {
        if (validToken) {
            returnData.userData = await db.query.users.findFirst({
                where: (user) => {
                    return eq(user.id, validToken?.sub as string);
                },
                columns: {
                    hashPassword: false,
                },
            });
        }
    } catch (err) {
        console.error(err);
        error(500, "Something went wrong");
    }

    //fetch profile from cache
    let profileCache: typeof keyValue.$inferSelect | undefined = undefined;
    try {
        const cacheInstance = cacheDB();
        [profileCache] = await cacheInstance
            .select()
            .from(keyValue)
            .where(eq(keyValue.key, params.username));

        if (profileCache) {
            returnData.profile = JSON.parse(
                profileCache.value as string,
            ) as UserResp;
            console.log("cache hit!");
        }
    } catch (err) {
        console.error(err);
    }

    //fetch profile data
    try {
        if (!returnData.profile) {
            console.log("Fetching from primary db");
            returnData.profile = await db.query.users.findFirst({
                where: (user) => {
                    return eq(user.username, usernameParam);
                },
                columns: {
                    hashPassword: false,
                },
            });
        }
    } catch (err) {
        console.error(err);
        error(500, "Something went wrong");
    }

    if (!returnData.profile) {
        error(404, "Not Found");
    }

    // cache miss
    try {
        if (!profileCache) {
            console.log("Profile cache miss, inserting to memory");
            const cacheInstance = cacheDB();
            await cacheInstance.insert(keyValue).values({
                key: returnData.profile.username,
                value: JSON.stringify(returnData.profile),
            });
        }
    } catch (err) {
        console.error(err);
    }

    return returnData;
};

async function getUserCache(username: string): Promise<UserResp | undefined> {
    // try to get from cache
    let user: UserResp | undefined = undefined
    try {
        const cacheInstance = cacheDB();
        const fetchCache = await cacheInstance.query.keyValue.findFirst({
            where: eq(keyValue.key, username),
        });

        if (fetchCache) {
            console.log("Cache hit!");
            user = JSON.parse(fetchCache.value as string) as UserResp;
        } else {
            user = undefined
        }
    } catch (err) {
        console.error(err);
        user = undefined
    }

    return user
}


export const actions: Actions = {
    ask: async ({ request, params }) => {
        console.log("Hit /username?/ask actions");

        let toast: ResponseToast = {
            error: true,
            message: ["Something went wrong"],
            type: ResponseToastEnum.error
        };

        const fd = await request.formData();
        const { inputVisibility, inputName, isAnon, inputQuestion } =
            Object.fromEntries(fd) as Record<string, string>;
        const name = isAnon ? "Anonim" : inputName;

        parseAskForm({ visibility: inputVisibility, name: inputName, question: inputQuestion }, toast)
        // get user by username
        let userReceiver = await getUserCache(params?.username as string)
        // cache miss, fetch from db
        try {
            if (!userReceiver) {
                userReceiver = await db.query.users.findFirst({
                    where: eq(users.username, params?.username as string),
                });
                console.log("Cache miss!");
            }
        } catch (err) {
            console.error(err);
            toast = {
                error: true,
                message: ["Something when wrong"],
                type: ResponseToastEnum.error,
            };

            return fail(500, toast);
        }

        if (!userReceiver) {
            return redirect(302, "/");
        }

        const timestamp = new Date();

        try {
            await db.insert(question).values({
                name: name,
                visibility: inputVisibility,
                body: inputQuestion,
                userId: userReceiver.id,
                createdAt: timestamp,
                updatedAt: timestamp,
            });
        } catch (err) {
            console.error(err);

            toast = {
                error: true,
                message: [
                    "Failed when trying to create questiong, please try again...",
                ],
                type: ResponseToastEnum.error,
            };

            return fail(500, toast);
        }

        toast = {
            error: false,
            message: ["Success"],
            type: ResponseToastEnum.primary,
        };

        return toast;
    },
};
