import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { articles, userArticles, works, userWorks, labels, technologies, articleLabels, workLabels, workTechnologies, articleTechnologies } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { ArticleType, WorkType } from "@/types";

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
  let userArticleData: ArticleType[] = [];
  if (articleIds.length > 0) {
    const articleResults = await db
      .select({
        id: articles.id,
        title: articles.title,
        date: articles.date,
        content: articles.content,
        authorId: userArticles.userId, // ✅ 中間テーブルから `authorId` を取得
        labelId: articleLabels.labelId, // ✅ 中間テーブルから `labelId` を取得
        technologieId: articleTechnologies.technologieId, // ✅ 中間テーブルから `technologieId` を取得
      })
      .from(articles)
      .leftJoin(userArticles, eq(articles.id, userArticles.articleId)) // ✅ 記事とユーザーを結びつける
      .leftJoin(articleLabels, eq(articles.id, articleLabels.articleId)) // ✅ 記事とラベルを結びつける
      .leftJoin(articleTechnologies, eq(articles.id, articleTechnologies.articleId)) // ✅ 記事と使用技術を結びつける
      .where(inArray(articles.id, articleIds));

    // `authorIds` と `labelIds`と `TechnologieIds` をグループ化
    const groupedArticles: ArticleType[] = Object.values(
      articleResults.reduce((acc, article) => {
        if (!acc[article.id]) {
          acc[article.id] = {
            id: article.id,
            title: article.title,
            date: article.date,
            content: article.content,
            authorIds: [], // ✅ `authorId` を配列にする
            labelIds: [],  // ✅ `labelId` も配列にする
            technologieIds: [],  // ✅ `TechnologieId` も配列にする
          };
        }
        if (article.authorId && !acc[article.id].authorIds.includes(article.authorId)) {
          acc[article.id].authorIds.push(article.authorId);
        }
        if (article.labelId && !acc[article.id].labelIds.includes(Number(article.labelId))) {
          acc[article.id].labelIds.push(Number(article.labelId));
        }
        if (article.technologieId && !acc[article.id].technologieIds.includes(Number(article.technologieId))) {
          acc[article.id].technologieIds.push(Number(article.technologieId));
        }
        return acc;
      }, {} as Record<number, ArticleType>)
    );

    userArticleData = groupedArticles;
  }


  // 作品の取得
  const userWorkRows = await db
    .select()
    .from(userWorks)
    .where(eq(userWorks.userId, userId));
  const workIds = userWorkRows.map((row) => row.workId);
  let userWorkData: WorkType[] = [];
  const userWorkResults = await db
    .select({
      id: works.id,
      authorId: userWorks.userId,  // ✅ 中間テーブルから `authorId` を取得
      labelId: workLabels.labelId, // ✅ 中間テーブルから `labelId` を取得
      technologieId: workTechnologies.technologieId, // ✅ 中間テーブルから `technologieId` を取得
      name: works.name,
      date: works.date,
      url: works.url,
      icon: works.icon,
      description: works.description,
    })
    .from(works)
    .leftJoin(userWorks, eq(works.id, userWorks.workId)) // ✅ 作品と作成者の関係
    .leftJoin(workLabels, eq(works.id, workLabels.workId)) // ✅ 作品とラベルの関係
    .leftJoin(workTechnologies, eq(works.id, workTechnologies.workId)) // ✅ 作品と使用技術の関係
    .where(inArray(works.id, workIds));

  // `authorIds` と `labelIds` をグループ化
  const groupedWorks: WorkType[] = Object.values(
    userWorkResults.reduce((acc, work) => {
      if (!acc[work.id]) {
        acc[work.id] = {
          id: work.id,
          name: work.name,
          date: work.date,
          url: work.url,
          icon: work.icon,
          description: work.description,
          authorIds: [], // ✅ `authorIds` を配列にする
          labelIds: [],  // ✅ `labelIds` も配列にする
          technologieIds: [],  // ✅ `technologieIds` も配列にする
        };
      }
      if (work.authorId && !acc[work.id].authorIds.includes(work.authorId)) {
        acc[work.id].authorIds.push(work.authorId);
      }
      if (work.labelId && !acc[work.id].labelIds.includes(Number(work.labelId))) {
        acc[work.id].labelIds.push(Number(work.labelId));
      }
      if (work.technologieId && !acc[work.id].technologieIds.includes(Number(work.technologieId))) {
        acc[work.id].technologieIds.push(Number(work.technologieId));
      }
      return acc;
    }, {} as Record<number, WorkType>)
  );

  userWorkData = groupedWorks;


  // 全ラベルを取得
  const allLabels = await db.select().from(labels);
  // 全使用技術を取得
  const allTechnologies = await db.select().from(technologies);

  return NextResponse.json({
    articles: userArticleData,
    works: userWorkData,
    labels: allLabels,
    technologies: allTechnologies,
  });
  
}
