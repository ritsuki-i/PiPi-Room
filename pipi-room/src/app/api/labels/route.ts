// app/api/labels/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { labels } from "@/db/schema";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
    const { userId } = getAuth(req);
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // body: { name: string }
    const { name } = await req.json();
    if (!name) {
        return NextResponse.json({ error: "No label name" }, { status: 400 });
    }

    // ラベル作成
    const [insertedLabel] = await db
        .insert(labels)
        .values({ name })
        .returning();

    return NextResponse.json(insertedLabel);
}

export async function GET() {
    try {
        const allLabels = await db.select().from(labels)
        return NextResponse.json(allLabels) // 👈 クライアントでは配列として受け取れる
    } catch (err) {
        console.error("ラベル取得失敗:", err)
        return NextResponse.json({ error: "取得失敗" }, { status: 500 })
    }
}