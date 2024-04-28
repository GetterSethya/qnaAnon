import { db } from "$lib/db/db";
import { doValidateJTW } from "$lib/helper";
import { question, users } from "$lib/schema/schema";
import type { UserResp } from "$lib/types";
import { json, type RequestHandler } from "@sveltejs/kit";
import {
    and,
    asc,
    desc,
    eq,
    type AnyColumn,
    type SQLWrapper,
    count,
} from "drizzle-orm";
import type { JWTPayload } from "jose";
import { ZodError, z } from "zod";

function handleSort(sort: string | null, column: SQLWrapper | AnyColumn) {
    if (sort === "asc") {
        return asc(column);
    } else if (sort === "desc") {
        return desc(column);
    } else {
        return desc(column);
    }
}

export const POST: RequestHandler = async ({ request, cookies, url }) => {
    console.log("Hit POST /api/v1/questions/");

    const tempPageNum = parseInt(url.searchParams.get("page") as string);
    const page = isNaN(tempPageNum) ? 1 : tempPageNum;
    const pageLimit = 5;

    let sort = url.searchParams.get("sort");
    if (!(sort === "asc" || sort === "desc")) {
        sort = "desc";
    }

    let q: {
        q: (typeof question.$inferSelect)[];
        prev: number | null;
        next: number | null;
        count: number;
    } = { q: [], prev: null, next: null, count: 0 };
    const fd = await request.formData();
    const { receiverId } = Object.fromEntries(fd) as Record<string, string>;

    try {
        z.string().uuid().parse(receiverId);
    } catch (err) {
        console.error(err);
        return json(q);
    }

    // Validasi JWT, kalo tidak valid redirect ke /login
    let validToken: JWTPayload | null = await doValidateJTW(cookies);
    let user: UserResp = undefined;

    try {
        if (validToken) {
            user = await db.query.users.findFirst({
                where: eq(users.id, validToken.sub as string),
            });
        }
    } catch (err) {
        console.error(err);
    }

    try {
        if (validToken && user?.id === receiverId) {
            console.log("Owner");
            q.q = await db
                .select({
                    id: question.id,
                    name: question.name,
                    createdAt: question.createdAt,
                    updatedAt: question.updatedAt,
                    deletedAt: question.deletedAt,
                    userId: question.userId,
                    body: question.body,
                    visibility: question.visibility,
                })
                .from(question)
                .where((question) => {
                    return eq(question.userId, receiverId);
                })
                .orderBy(handleSort(sort, question.createdAt))
                .limit(pageLimit)
                .offset((page - 1) * pageLimit);

            const [totalPost] = await db
                .select({ count: count() })
                .from(question)
                .where(eq(question.userId, receiverId));

            q.count = totalPost.count;
            q.prev = page === 0 ? null : page - 1;
            q.next =
                totalPost.count - ((page - 1) * pageLimit + q.q.length) > 0
                    ? page + 1
                    : null;
        } else {
            console.log("Invalid token or not owner");
            q.q = await db
                .select({
                    id: question.id,
                    name: question.name,
                    createdAt: question.createdAt,
                    updatedAt: question.updatedAt,
                    deletedAt: question.deletedAt,
                    userId: question.userId,
                    body: question.body,
                    visibility: question.visibility,
                })
                .from(question)
                .where(
                    and(
                        eq(question.userId, receiverId),
                        eq(question.visibility, "true"),
                    ),
                )
                .orderBy(handleSort(sort, question.createdAt))
                .limit(pageLimit)
                .offset((page - 1) * pageLimit);

            const [totalPost] = await db
                .select({ count: count() })
                .from(question)
                .where(
                    and(
                        eq(question.userId, receiverId),
                        eq(question.visibility, "true"),
                    ),
                );
            q.count = totalPost.count;
            q.prev = page === 0 ? null : page - 1;
            q.next =
                totalPost.count - ((page - 1) * pageLimit + q.q.length) > 0
                    ? page + 1
                    : null;
        }
    } catch (err) {
        console.error(err);
        return json(q);
    }

    return json(q);
};

export const DELETE: RequestHandler = async ({ cookies, url }) => {
    const userId = url.searchParams.get("userId");
    const questionId = url.searchParams.get("qId");
    if (!userId) {
        return new Response(null, { status: 403 });
    }

    if (!questionId) {
        return new Response(null, { status: 403 });
    }

    try {
        z.string().uuid(userId);
        z.string().uuid(questionId);
    } catch (err) {
        console.error(err);
        if (err instanceof ZodError) {
            return new Response(null, { status: 400 });
        } else {
            return new Response(null, { status: 500 });
        }
    }

    const validToken = await doValidateJTW(cookies);
    if (!validToken) {
        return new Response(null, { status: 403 });
    }

    let userFromToken: UserResp;
    try {
        userFromToken = await db.query.users.findFirst({
            where: eq(users.id, validToken.sub as string),
        });
    } catch (err) {
        console.error(err);
        return new Response(null, { status: 500 });
    }

    if (!userFromToken) {
        return new Response(null, { status: 400 });
    }

    if (userFromToken.id !== userId) {
        return new Response(null, { status: 403 });
    }

    try {
        await db.delete(question).where(eq(question.id, questionId));
    } catch (err) {
        console.error(err);
        return new Response(null, { status: 500 });
    }

    return new Response(null, { status: 200 });
};
