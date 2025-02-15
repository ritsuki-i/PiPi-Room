// app/api/articles/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { articles, userArticles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { title, date, content } = body;

  // articlesにINSERT
  const [insertedArticle] = await db
    .insert(articles)
    .values({
      title,
      date: date || null,
      content,
    })
    .returning();

  // userArticlesにもINSERT
  if (insertedArticle) {
    await db.insert(userArticles).values({
      userId,
      articleId: insertedArticle.id,
    });
  }

  return NextResponse.json(insertedArticle);
}
