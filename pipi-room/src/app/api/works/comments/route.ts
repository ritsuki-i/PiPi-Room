// app/api/works/comments/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { workComments } from '@/db/schema';
import { eq } from 'drizzle-orm';  // Drizzle の where 句で利用

// GET: コメント一覧（?workId=20 のようにクエリがあれば workId で絞り込み）
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workIdParam = searchParams.get('workId');

    let comments;
    if (workIdParam) {
      // workId がクエリにあるなら、その作品IDのコメントだけを取得
      const workIdNum = Number(workIdParam);

      comments = await db
        .select()
        .from(workComments)
        .where(eq(workComments.workId, workIdNum));
    } else {
      // クエリが無ければ全コメントを返す
      comments = await db.select().from(workComments);
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
    const { workId, userId, content } = body;

    const [newComment] = await db
      .insert(workComments)
      .values({
        workId,
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
