import { db } from "$lib/db/db";
import { json, type RequestHandler } from "@sveltejs/kit";
import { z } from "zod";
import { users as u } from "$lib/schema/schema";
import { and, like } from "drizzle-orm";

export const POST: RequestHandler = async ({ request }) => {
    console.log("Hit POST: /api/v1/user actions");
    const fd = await request.formData();
    const { inputSearch } = Object.fromEntries(fd) as Record<string, string>;

    let users:
        | { name: string; username: string; bio: string | null }[]
        | undefined = undefined;

    try {
        z.string().min(1).max(25).parse(inputSearch);
    } catch (err) {
        console.error(err);
        return json(users);
    }

    try {
        users = await db
            .select({
                username: u.username,
                name: u.name,
                bio: u.bio,
            })
            .from(u)
            .where(
                and(
                    like(u.username, `%${inputSearch}%`),
                    like(u.name, `%${inputSearch}%`),
                ),
            );
    } catch (err) {
        console.error(err);
        return json(users);
    }

    return json(users);
};
