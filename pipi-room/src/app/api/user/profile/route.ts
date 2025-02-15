// app/api/profile/route.ts (Next.js App Routerの場合)
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

// GET: 現在のユーザー情報を返す
export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await db.select().from(users).where(eq(users.id, userId));
  if (result.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  
  return NextResponse.json(result[0]);
}

// PATCH: ユーザー情報を更新
export async function PATCH(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    name,
    accountName,
    icon,
    email,
    birthDate,
    bio,
    githubUrl,
  } = await req.json();

  await db.update(users)
    .set({
      name,
      accountName,
      icon,
      email,
      birthDate, // 文字列の場合 DATE型のカラムに合う形か要確認
      bio,
      githubUrl,
    })
    .where(eq(users.id, userId));

  return NextResponse.json({ success: true });
}
