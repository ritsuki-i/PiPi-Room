import { db } from "@/db";
import { users } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";


export async function POST(req: Request) {
  const { userId, name, accountName, icon, email, birthDate, bio, githubUrl } = await req.json();

  // すでに登録されているか確認
  const existingUser = await db.select().from(users).where(eq(users.id, userId)).execute();

  if (existingUser.length > 0) {
    // 既存ユーザーなら更新
    await db
      .update(users)
      .set({ name, accountName, icon, birthDate, bio, githubUrl })
      .where(eq(users.id, userId))
      .execute();

    return NextResponse.json({ message: "プロフィールを更新しました。" }, { status: 200 });
  }

  // 新規ユーザーなら追加
  await db.insert(users).values({
    id: userId,
    name,
    accountName,
    icon,
    email,
    birthDate,
    bio,
    githubUrl,
    createdAt: new Date(),
  });

  return NextResponse.json({ message: "プロフィールを作成しました。" }, { status: 201 });
}
