// app/api/articles/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, articles, userArticles, articleLabels, articleTechnologies } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = getAuth(req)
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const articleId = Number(params.id)
  if (isNaN(articleId)) {
    return new NextResponse("Invalid article ID", { status: 400 })
  }

  //アクセスしているユーザのロールを取得
  const currentUser = await db
    .select()
    .from(users)
    .where(eq(users.id, userId));
  const userRole = currentUser[0]?.type ?? "general";

  // ユーザーと記事の紐付けを確認
  const link = await db
    .select()
    .from(userArticles)
    .where(and(eq(userArticles.userId, userId), eq(userArticles.articleId, articleId)))

  if (link.length === 0 && (userRole !== "admin" && userRole !== "manager")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 記事本体の取得
  const article = await db
    .select()
    .from(articles)
    .where(eq(articles.id, articleId))
    .then((res) => res[0])

  if (!article) {
    return new NextResponse("Article not found", { status: 404 })
  }

  // ラベル・使用技術を取得（中間テーブル経由）
  const labelLinks = await db
    .select({ labelId: articleLabels.labelId })
    .from(articleLabels)
    .where(eq(articleLabels.articleId, articleId))

  const technologieLinks = await db
    .select({ technologieId: articleTechnologies.technologieId })
    .from(articleTechnologies)
    .where(eq(articleTechnologies.articleId, articleId))

  return NextResponse.json({
    ...article,
    labelIds: labelLinks.map((l) => l.labelId),
    technologieIds: technologieLinks.map((t) => t.technologieId),
  })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = getAuth(req);
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const articleId = Number(params.id);

  //アクセスしているユーザのロールを取得
  const currentUser = await db
    .select()
    .from(users)
    .where(eq(users.id, userId));
  const userRole = currentUser[0]?.type ?? "general";

  // まず対象作品がユーザーのものかチェック
  const link = await db
    .select()
    .from(userArticles)
    .where(and(eq(userArticles.userId, userId), eq(userArticles.articleId, articleId)));

  if (link.length === 0 && (userRole !== "admin" && userRole !== "manager")) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const body = await req.json();
  if (!body.name && !body.date && !body.content && !body.labelIds && !body.technologieIds) {
    return new NextResponse("Bad Request: No valid fields to update", { status: 400 });
  }

  // 更新処理
  await db
    .update(articles)
    .set({
      title: body.title,
      date: body.date,
      content: body.content,
      type: body.type,
    })
    .where(eq(articles.id, articleId));

  // もし labelIds がある場合、中間テーブルを更新
  if (body.labelIds && Array.isArray(body.labelIds)) {
    // 既存の関連ラベルを削除
    await db.delete(articleLabels).where(eq(articleLabels.articleId, articleId));

    // 新しいラベルを挿入
    const newLabels = body.labelIds.map((labelId: number) => ({
      articleId,
      labelId,
    }));

    if (newLabels.length > 0) {
      await db.insert(articleLabels).values(newLabels);
    }
  }

  // もし technologieIds がある場合、中間テーブルを更新
  if (body.technologieIds && Array.isArray(body.technologieIds)) {
    // 既存の関連使用技術を削除
    await db.delete(articleTechnologies).where(eq(articleTechnologies.articleId, articleId));

    // 新しい使用技術を挿入
    const newTechnologies = body.technologieIds.map((technologieId: number) => ({
      articleId,
      technologieId,
    }));

    if (newTechnologies.length > 0) {
      await db.insert(articleTechnologies).values(newTechnologies);
    }
  }

  return NextResponse.json({ success: true, articleId: articleId });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const articleId = Number(params.id);

  //アクセスしているユーザのロールを取得
  const currentUser = await db
    .select()
    .from(users)
    .where(eq(users.id, userId));
  const userRole = currentUser[0]?.type ?? "general";

  // 所有権チェック (userarticles にレコードがあるか)
  const link = await db
    .select()
    .from(userArticles)
    .where(and(eq(userArticles.userId, userId), eq(userArticles.articleId, articleId))); // 修正

  if (link.length === 0 && (userRole !== "admin" && userRole !== "manager")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 関連中間テーブル (article_labels など) も削除
  await db.delete(articleLabels).where(eq(articleLabels.articleId, articleId));

  // userarticles から削除
  await db
    .delete(userArticles)
    .where(and(eq(userArticles.userId, userId), eq(userArticles.articleId, articleId)));

  // articles 本体を削除 (共有作品でないなら)
  await db.delete(articles).where(eq(articles.id, articleId));

  return NextResponse.json({ success: true });
}
