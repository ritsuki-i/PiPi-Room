// app/api/articles/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { articles, userArticles, articleLabels } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuth } from "@clerk/nextjs/server";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = getAuth(req);
  if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
  }
  const articleId = Number(params.id);

  // まず対象作品がユーザーのものかチェック
  const link = await db
      .select()
      .from(userArticles)
      .where(and(eq(userArticles.userId, userId), eq(userArticles.articleId, articleId)));

  if (link.length === 0) {
      return new NextResponse("Forbidden", { status: 403 });
  }

  const body = await req.json();
  if (!body.name && !body.date && !body.content && !body.labelIds) {
      return new NextResponse("Bad Request: No valid fields to update", { status: 400 });
  }

  // 更新処理
  await db
      .update(articles)
      .set({
          title: body.title,
          date: body.date,
          content: body.content,
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

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    const articleId = Number(params.id);
  
    // 所有権チェック (userarticles にレコードがあるか)
    const link = await db
      .select()
      .from(userArticles)
      .where(and(eq(userArticles.userId, userId), eq(userArticles.articleId, articleId))); // 修正
  
    if (link.length === 0) {
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
