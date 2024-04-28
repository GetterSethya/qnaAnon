import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { Config } from "@sveltejs/adapter-vercel";

export const config: Config = {
    runtime: "edge",
};

export const load: PageServerLoad = async () => {
    redirect(302, "/");
};

export const actions: Actions = {
    default: async ({ cookies }) => {
        cookies.delete("session", { path: "/" });

        redirect(302, "/");
    },
};
