import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuth } from "@clerk/nextjs/server";

// ✅ `GET /api/users/check` ユーザーの存在をチェック
export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ exists: false, error: "Unauthorized" }, { status: 401 });

  // ✅ `users` テーブルに `userId` が存在するかチェック
  const existingUser = await db.select().from(users).where(eq(users.id, userId));
  const userExists = existingUser.length > 0;

  return NextResponse.json({ exists: userExists });
}