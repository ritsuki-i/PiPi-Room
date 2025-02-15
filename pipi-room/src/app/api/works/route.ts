// app/api/works/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { works, userWorks, workLabels } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getAuth } from "@clerk/nextjs/server";

// ✅ 作品の新規作成（POST）
export async function POST(req: NextRequest) {
    const { userId } = getAuth(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, date, url, icon, description, labelIds }: { name: string; date: string; url?: string; icon?: string; description?: string; labelIds: number[] } = await req.json();
    if (!name || !date) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    // ✅ `works` に新しい作品を追加
    const [newWork] = await db.insert(works).values({ name, date, url, icon, description }).returning();

    // ✅ `userWorks` に作成者（userId）を関連付ける
    await db.insert(userWorks).values({ workId: newWork.id, userId });

    // ✅ `workLabels` にラベルを関連付ける（ラベルがある場合のみ）
    if (labelIds?.length) {
        await db.insert(workLabels).values(labelIds.map((labelId: number) => ({ workId: newWork.id, labelId })));
    }

    return NextResponse.json(newWork);
}

// ✅ 作品の編集（PATCH）
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const { userId } = getAuth(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const workId = Number(params.id);
    const { name, date, url, icon, description, labelIds }: { name: string; date: string; url?: string; icon?: string; description?: string; labelIds: number[] } = await req.json();
    if (!name || !date) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    // ✅ 作品データを更新
    await db.update(works).set({ name, date, url, icon, description }).where(eq(works.id, workId));

    // ✅ `workLabels` を削除して、新しいラベルを追加
    await db.delete(workLabels).where(eq(workLabels.workId, workId));
    if (labelIds?.length) {
        await db.insert(workLabels).values(labelIds.map((labelId: number) => ({ workId, labelId })));
    }

    return NextResponse.json({ id: workId, name, date, url, icon, description, labelIds });
}

// GET /api/works
export async function GET(req: NextRequest) {
    const allWorks = await db.select().from(works);
    return NextResponse.json(allWorks);
}