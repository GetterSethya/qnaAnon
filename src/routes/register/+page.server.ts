import { fail, type Actions, redirect } from "@sveltejs/kit";
import { ZodError } from "zod";
import { ResponseToastEnum } from "$lib/enum";
import type { PageServerLoad } from "./$types";
import { ActionsRegisterHandler } from "./page.helper";
import { AuthError } from "$lib/helper";


export const load: PageServerLoad = async ({ cookies }) => {
    const session = cookies.get("session");
    if (session) {
        redirect(302, "/");
    }
};

export const actions = {
    default: async ({ request }) => {
        console.log("Hit register actions");

        let toast: ResponseToast;

        try {
            const fd = await request.formData()
            const actionsRegistesHandler = new ActionsRegisterHandler(fd)
            actionsRegistesHandler.confirmPassword()
            actionsRegistesHandler.parseRegisterForm()
            actionsRegistesHandler.createNewUser()
        } catch (err) {
            console.error(err);

            toast = {
                error: true,
                message: ["Failed when creating user account"],
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

            if (err instanceof AuthError) {
                toast = {
                    error: true,
                    message: [err.message],
                    type: ResponseToastEnum.warning,
                };
                statusCode = 400
            }

            return fail(statusCode, toast);
        }

        throw redirect(302, "/login");
    },
} satisfies Actions;

