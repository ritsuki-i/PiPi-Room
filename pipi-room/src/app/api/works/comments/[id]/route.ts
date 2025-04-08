// app/api/works/comments/[id]/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { workComments } from '@/db/schema';
// Drizzle ORM の eq 関数をインポート（利用しているバージョンに合わせて修正）
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
            .from(workComments)
            .where(eq(workComments.id, commentId));

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
        // ここでは content の更新例を示す（必要に応じて他のフィールドも更新可能）
        const { content } = body;

        const [updatedComment] = await db
            .update(workComments)
            .set({ content })
            .where(eq(workComments.id, commentId))
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
            .delete(workComments)
            .where(eq(workComments.id, commentId))
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
            .update(workComments)
            .set({ content })
            .where(eq(workComments.id, commentId))
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
