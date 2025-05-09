// app/api/Articles/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { articles, userArticles, articleLabels, articleTechnologies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuth } from "@clerk/nextjs/server";
import { ArticleType } from "@/types";

// ✅ 作品の新規作成（POST）
export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // リクエストボディの型は必要なプロパティを定義
  const {
    title,
    date,
    content,
    type,
    labelIds,
    technologieIds,
    authorIds,
  } = (await req.json()) as {
    title: string;
    date: string;
    content?: string;
    type: string;
    labelIds: number[];
    technologieIds: [];
    authorIds: string[];
  };

  if (!title || !date)
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  // ① Articles テーブルに新規作品を挿入
  const [newarticle] = await db
    .insert(articles)
    .values({ title, date, content: content ?? "", type })
    .returning();

  // ② authorIds にログイン中の userId を追加（重複を防ぐ）
  const finalAuthorIds = Array.from(new Set([userId, ...authorIds]));
  // ② userArticles テーブルに、各作成者 (authorIds) と新規作品 (newarticle.id) を紐付け
  if (finalAuthorIds?.length) {
    await db.insert(userArticles).values(
      finalAuthorIds.map((authorId: string) => ({
        articleId: newarticle.id,
        userId: authorId,
      }))
    );
  }

  // ③ articleLabels テーブルに、各ラベル (labelIds) と新規作品 (newarticle.id) を紐付け
  if (labelIds?.length) {
    await db.insert(articleLabels).values(
      labelIds.map((labelId: number) => ({
        articleId: newarticle.id,
        labelId,
      }))
    );
  }

  // ③ articleTechnologies テーブルに、各ラベル (technologieIds) と新規作品 (newarticle.id) を紐付け
  if (technologieIds?.length) {
    await db.insert(articleTechnologies).values(
      technologieIds.map((technologieId: number) => ({
        articleId: newarticle.id,
        technologieId,
      }))
    );
  }

  return NextResponse.json(newarticle);
}


export async function GET() {
  // ✅ `Articles` と `userArticles` を結合し、すべての `authorId` を取得
  const articleData = await db
    .select({
      articleId: articles.id,
      title: articles.title,
      date: articles.date,
      content: articles.content,
      type: articles.type,
      authorId: userArticles.userId, // ✅ 各 `articleId` に紐づく `userId`
      labelId: articleLabels.labelId, // ✅ 各 `articleId` に紐づく `labelId`
      technologieId: articleTechnologies.technologieId, // ✅ 各 `articleId` に紐づく `technologieId`
    })
    .from(articles)
    .leftJoin(userArticles, eq(articles.id, userArticles.articleId))
    .leftJoin(articleLabels, eq(articles.id, articleLabels.articleId))
    .leftJoin(articleTechnologies, eq(articles.id, articleTechnologies.articleId));

  // ✅ `articleId` ごとに `authorIds` をグループ化
  const groupedArticles: ArticleType[] = Object.values(
    articleData.reduce((acc, article) => {
      if (!acc[article.articleId]) {
        acc[article.articleId] = {
          id: article.articleId,
          title: article.title,
          date: article.date,
          content: article.content,
          type: article.type,
          authorIds: [], // ✅ `authorIds` を配列にする
          labelIds: [], // ✅ `labelIds` を配列にする
          technologieIds: [], // ✅ `technologiesIds` を配列にする
        };
      }
      if (article.authorId && !acc[article.articleId].authorIds.includes(article.authorId)) {
        acc[article.articleId].authorIds.push(article.authorId);
      }
      if (article.labelId && !acc[article.articleId].labelIds.includes(article.labelId)) {
        acc[article.articleId].labelIds.push(article.labelId);
      }
      if (article.technologieId && !acc[article.articleId].technologieIds.includes(article.technologieId)) {
        acc[article.articleId].technologieIds.push(article.technologieId);
      }
      return acc;
    }, {} as Record<number, ArticleType>)
  );

  return NextResponse.json(groupedArticles);
}