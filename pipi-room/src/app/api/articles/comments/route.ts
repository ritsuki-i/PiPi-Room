import { NextResponse } from 'next/server';
import { db } from '@/db';
import { articleComments } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET: コメント一覧（?articleId=20 のようにクエリがあれば articleId で絞り込み）
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const articleIdParam = searchParams.get('articleId');

    let comments;
    if (articleIdParam) {
      // articleId がクエリにあるなら、その記事IDのコメントだけを取得
      const articleIdNum = Number(articleIdParam);

      comments = await db
        .select()
        .from(articleComments)
        .where(eq(articleComments.articleId, articleIdNum));
    } else {
      // クエリが無ければ全コメントを返す
      comments = await db.select().from(articleComments);
    }

    return NextResponse.json(comments);
  } catch (error) {
    console.error("コメント一覧取得エラー:", error);
    return NextResponse.json(
      { error: 'コメントの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// POST: 新しいコメントを作成する
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { articleId, userId, content } = body;

    const [newComment] = await db
      .insert(articleComments)
      .values({
        articleId,
        userId,
        content,
      })
      .returning();

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error("コメント作成エラー:", error);
    return NextResponse.json(
      { error: 'コメントの作成に失敗しました' },
      { status: 500 }
    );
  }
}
