// /api/users/[id]/route.ts

import { db } from "@/db"
import {
  users, userArticles, userWorks, articles, works,
  articleLabels, articleTechnologies,
  workLabels, workTechnologies
} from "@/db/schema"
import { eq, inArray } from "drizzle-orm"
import { NextResponse, type NextRequest } from "next/server"

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = params.id

  try {
    // 1. ユーザーの所有記事IDを取得
    const userArticleLinks = await db
      .select({ articleId: userArticles.articleId })
      .from(userArticles)
      .where(eq(userArticles.userId, userId))
    const articleIds = userArticleLinks.map(a => a.articleId)

    // 2. ユーザーの所有作品IDを取得
    const userWorkLinks = await db
      .select({ workId: userWorks.workId })
      .from(userWorks)
      .where(eq(userWorks.userId, userId))
    const workIds = userWorkLinks.map(w => w.workId)

    // 3. 中間テーブルを削除（articles）
    if (articleIds.length > 0) {
      await db.delete(articleLabels).where(inArray(articleLabels.articleId, articleIds))
      await db.delete(articleTechnologies).where(inArray(articleTechnologies.articleId, articleIds))
    }

    // 4. 中間テーブルを削除（works）
    if (workIds.length > 0) {
      await db.delete(workLabels).where(inArray(workLabels.workId, workIds))
      await db.delete(workTechnologies).where(inArray(workTechnologies.workId, workIds))
    }

    // 5. 記事・作品の削除
    if (articleIds.length > 0) {
      await db.delete(articles).where(inArray(articles.id, articleIds))
    }
    if (workIds.length > 0) {
      await db.delete(works).where(inArray(works.id, workIds))
    }

    // 6. ユーザーと中間テーブル削除
    await db.delete(userArticles).where(eq(userArticles.userId, userId))
    await db.delete(userWorks).where(eq(userWorks.userId, userId))

    // 7. 最後にユーザー削除
    await db.delete(users).where(eq(users.id, userId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("ユーザー削除エラー:", error)
    return NextResponse.json({ error: "ユーザー削除に失敗しました" }, { status: 500 })
  }
}
