import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { articles, userArticles, works, userWorks, labels } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { Article, Work } from "@/types";

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 記事の取得
  const userArticleRows = await db
    .select()
    .from(userArticles)
    .where(eq(userArticles.userId, userId));
  const articleIds = userArticleRows.map((row) => row.articleId);
  let userArticleData: Article[] = [];
  if (articleIds.length > 0) {
    userArticleData = await db
      .select()
      .from(articles)
      .where(inArray(articles.id, articleIds));
  }

  // 作品の取得
  const userWorkRows = await db
    .select()
    .from(userWorks)
    .where(eq(userWorks.userId, userId));
  const workIds = userWorkRows.map((row) => row.workId);
  let userWorkData: Work[] = [];
  if (workIds.length > 0) {
    userWorkData = await db
      .select()
      .from(works)
      .where(inArray(works.id, workIds));
  }

  // 全ラベルを取得
  const allLabels = await db.select().from(labels);

  return NextResponse.json({
    articles: userArticleData,
    works: userWorkData,
    labels: allLabels,
  });
}
