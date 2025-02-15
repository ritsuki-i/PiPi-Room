// app/api/articles/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { articles, userArticles, articleLabels } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuth } from "@clerk/nextjs/server";

// ✅ 記事の新規作成（POST）
export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, date, content, labelIds } = await req.json();
  if (!title || !date || !content) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const [newArticle] = await db.insert(articles).values({ title, date, content }).returning();
  await db.insert(userArticles).values({ articleId: newArticle.id, userId });

  if (labelIds?.length) {
    await db.insert(articleLabels).values(
      labelIds.map((labelId: number) => ({ articleId: newArticle.id, labelId }))
    );
  }

  return NextResponse.json(newArticle);
}

// ✅ 記事の編集（PATCH）
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const articleId = Number(params.id);
  const { title, date, content, labelIds } = await req.json();
  if (!title || !date || !content) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  await db.update(articles).set({ title, date, content }).where(eq(articles.id, articleId));

  await db.delete(articleLabels).where(eq(articleLabels.articleId, articleId));
  if (labelIds?.length) {
    await db.insert(articleLabels).values(labelIds.map((labelId: number) => ({ articleId, labelId })));
  }

  return NextResponse.json({ id: articleId, title, date, content, labelIds });
}
