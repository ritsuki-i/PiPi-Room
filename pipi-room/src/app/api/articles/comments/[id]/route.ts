import { NextResponse } from 'next/server';
import { db } from '@/db';
import { articleComments } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET: 指定したIDのコメントを取得
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const commentId = Number(params.id);
        // where 条件で id をフィルター
        const comments = await db
            .select()
            .from(articleComments)
            .where(eq(articleComments.id, commentId));

        if (!comments || comments.length === 0) {
            return NextResponse.json(
                { error: 'コメントが見つかりませんでした' },
                { status: 404 }
            );
        }

        return NextResponse.json(comments[0]);
    } catch (error) {
        console.error("コメント取得エラー:", error);
        return NextResponse.json(
            { error: 'コメントの取得に失敗しました' },
            { status: 500 }
        );
    }
}

// PATCH: 指定したIDのコメントを更新
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const commentId = Number(params.id);
        const body = await request.json();
        // ここでは content の更新例を示す（必要に応じて他のフィールドも更新可）
        const { content } = body;

        const [updatedComment] = await db
            .update(articleComments)
            .set({ content })
            .where(eq(articleComments.id, commentId))
            .returning();

        if (!updatedComment) {
            return NextResponse.json(
                { error: 'コメントが見つかりませんでした' },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedComment);
    } catch (error) {
        console.error("コメント更新エラー:", error);
        return NextResponse.json(
            { error: 'コメントの更新に失敗しました' },
            { status: 500 }
        );
    }
}

// DELETE: 指定したIDのコメントを削除
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const commentId = Number(params.id);

        const [deletedComment] = await db
            .delete(articleComments)
            .where(eq(articleComments.id, commentId))
            .returning();

        if (!deletedComment) {
            return NextResponse.json(
                { error: 'コメントが見つかりませんでした' },
                { status: 404 }
            );
        }

        return NextResponse.json(deletedComment);
    } catch (error) {
        console.error("コメント削除エラー:", error);
        return NextResponse.json(
            { error: 'コメントの削除に失敗しました' },
            { status: 500 }
        );
    }
}

// PUT: 指定したIDのコメントを更新
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const commentId = Number(params.id);
        const body = await request.json();
        const { content } = body;

        const [updatedComment] = await db
            .update(articleComments)
            .set({ content })
            .where(eq(articleComments.id, commentId))
            .returning();

        if (!updatedComment) {
            return NextResponse.json(
                { error: 'コメントが見つかりませんでした' },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedComment);
    } catch (error) {
        console.error("コメント更新エラー:", error);
        return NextResponse.json(
            { error: 'コメントの更新に失敗しました' },
            { status: 500 }
        );
    }
}
