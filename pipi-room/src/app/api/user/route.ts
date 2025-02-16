import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { inArray } from "drizzle-orm";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const idsParam = url.searchParams.get("ids");
  
    if (!idsParam) return NextResponse.json({ error: "No user IDs provided" }, { status: 400 });
  
    const userIds = idsParam.split(",").map(id => id.trim());
  
    // ✅ `userIds` に一致するユーザーを取得
    const userData = await db.select().from(users).where(inArray(users.id, userIds));
  
    return NextResponse.json(userData);
  }