// app/api/works/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { works, userWorks } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuth } from "@clerk/nextjs/server";

export async function PATCH(req: NextRequest, { params }: any) {
    const { userId } = getAuth(req);
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    const workId = Number(params.id);

    // まず対象作品がユーザーのものかチェック
    const link = await db
        .select()
        .from(userWorks)
        .where(and(eq(userWorks.userId, userId), eq(userWorks.workId, workId))); // 修正

    if (link.length === 0) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    if (!body.name && !body.date && !body.url && !body.icon && !body.description) {
        return new NextResponse("Bad Request: No valid fields to update", { status: 400 });
    }

    // 更新処理
    await db
        .update(works)
        .set({
            name: body.name,
            date: body.date,
            url: body.url,
            icon: body.icon,
            description: body.description,
        })
        .where(eq(works.id, workId));

    return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: any) {
    const { userId } = getAuth(req);
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const workId = Number(params.id);

    // 所有権のチェック
    const link = await db
        .select()
        .from(userWorks)
        .where(and(eq(userWorks.userId, userId), eq(userWorks.workId, workId))); // 修正

    if (link.length === 0) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    // userWorks から削除
    await db
        .delete(userWorks)
        .where(and(eq(userWorks.userId, userId), eq(userWorks.workId, workId))); // 修正

    // works テーブルからも削除（共有作品でないなら）
    await db.delete(works).where(eq(works.id, workId));

    return NextResponse.json({ success: true });
}
