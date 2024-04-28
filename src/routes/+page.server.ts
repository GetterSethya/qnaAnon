import { AuthError, validateJWT } from "$lib/helper";
import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { JWTPayload } from "jose";
import type { UserResp } from "$lib/types";
import { PageLoadHandler, type UserDiscover } from "./page.helper";


export const load: PageServerLoad = async ({ cookies }) => {
    const session = cookies.get("session");
    const returnData: { userData: UserResp; usersDiscover: Promise<UserDiscover[]> | null; } = {
        userData: undefined,
        usersDiscover: PageLoadHandler.getDiscover()
    };

    if (!session) {
        return returnData;
    }

    try {
        const pageLoadHandler = new PageLoadHandler(cookies)
        let validToken: JWTPayload | null;
        // Validasi JWT, kalo tidak valid redirect ke /login
        validToken = await pageLoadHandler.doValidate()
        if (validToken === null) {
            return returnData;
        }
        returnData.userData = await PageLoadHandler.getUserById(validToken?.sub as string)
    } catch (err) {
        console.error(err);
        if (err instanceof AuthError) {
            cookies.delete("session", { path: "/" });
            redirect(307, "/login");
        }
        error(500, "Something went wrong")
    }

    return returnData;
};

