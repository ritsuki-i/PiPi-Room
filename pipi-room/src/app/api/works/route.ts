// app/api/works/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { works, userWorks } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getAuth } from "@clerk/nextjs/server";

// POST /api/works
export async function POST(req: NextRequest) {
    const { userId } = getAuth(req);
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    // { name, date, url, icon, description } が送られてくる想定
    const { name, date, url, icon, description } = body;

    // worksテーブルに挿入
    const [insertedWork] = await db
        .insert(works)
        .values({
            name,
            date: date || null,
            url,
            icon,
            description,
        })
        .returning();

    // user_worksテーブルも更新
    if (insertedWork) {
        await db.insert(userWorks).values({
            userId,
            workId: insertedWork.id,
        });
    }

    return NextResponse.json(insertedWork);
}

// GET /api/works
export async function GET(req: NextRequest) {
    const { userId } = getAuth(req);
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // userWorksから対象ユーザーの作品ID一覧を取得
    const userWorkRows = await db.select().from(userWorks).where(eq(userWorks.userId, userId));
    const workIds = userWorkRows.map((row) => row.workId);

    if (workIds.length === 0) {
        return NextResponse.json([]);
    }

    // worksテーブルから該当作品を取得
    const userWorksData = await db.select().from(works).where(inArray(works.id, workIds));

    return NextResponse.json(userWorksData);
}