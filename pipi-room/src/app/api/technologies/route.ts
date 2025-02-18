// app/api/labels/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { technologies } from "@/db/schema";
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
    const [insertedTechnologie] = await db
        .insert(technologies)
        .values({ name })
        .returning();

    return NextResponse.json(insertedTechnologie);
}

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const idsParam = url.searchParams.get("ids");
  
    if (!idsParam) return NextResponse.json({ error: "No user IDs provided" }, { status: 400 });
  
    const technologieIds = idsParam.split(",").map(id => Number(id.trim()));
  
    // ✅ `labelIds` に一致するラベルを取得
    const technologieData = await db.select().from(technologies).where(inArray(technologies.id, technologieIds));
  
    return NextResponse.json(technologieData);
  }