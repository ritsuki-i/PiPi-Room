// app/api/labels/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { labels } from "@/db/schema";
import { getAuth } from "@clerk/nextjs/server";
import { inArray } from "drizzle-orm";

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

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const idsParam = url.searchParams.get("ids");
  
    if (!idsParam) return NextResponse.json({ error: "No user IDs provided" }, { status: 400 });
  
    const labelIds = idsParam.split(",").map(id => Number(id.trim()));
  
    // ✅ `labelIds` に一致するラベルを取得
    const labelData = await db.select().from(labels).where(inArray(labels.id, labelIds));
  
    return NextResponse.json(labelData);
  }