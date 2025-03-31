// app/api/works/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, works, userWorks, workLabels, workTechnologies } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuth } from "@clerk/nextjs/server";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = getAuth(req);
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const workId = Number(params.id);

  // まず対象作品がユーザーのものかチェック
  const link = await db
    .select()
    .from(userWorks)
    .where(and(eq(userWorks.userId, userId), eq(userWorks.workId, workId)));

  //アクセスしているユーザのロールを取得
  const currentUser = await db
    .select()
    .from(users)
    .where(eq(users.id, userId));
  const userRole = currentUser[0]?.type ?? "general";

  if (link.length === 0 && (userRole !== "admin" && userRole !== "manager")) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const body = await req.json();
  if (!body.name && !body.date && !body.url && !body.icon && !body.description && !body.labelIds && !body.technologieIds) {
    return new NextResponse("Bad Request: No valid fields to update", { status: 400 });
  }

  // 更新処理
  await db
    .update(works)
    .set({
      name: body.name,
      date: body.date,
      url: body.url,
      githubUrl: body.githubUrl,
      icon: body.icon,
      description: body.description,
      type: body.type,
    })
    .where(eq(works.id, workId));

  // もし labelIds がある場合、中間テーブルを更新
  if (body.labelIds && Array.isArray(body.labelIds)) {
    // 既存の関連ラベルを削除
    await db.delete(workLabels).where(eq(workLabels.workId, workId));

    // 新しいラベルを挿入
    const newLabels = body.labelIds.map((labelId: number) => ({
      workId,
      labelId,
    }));

    if (newLabels.length > 0) {
      await db.insert(workLabels).values(newLabels);
    }
  }

  // もし technologieIds がある場合、中間テーブルを更新
  if (body.technologieIds && Array.isArray(body.technologieIds)) {
    // 既存の関連使用技術を削除
    await db.delete(workTechnologies).where(eq(workTechnologies.workId, workId));

    // 新しい使用技術を挿入
    const newTechnologies = body.technologieIds.map((technologieId: number) => ({
      workId,
      technologieId,
    }));

    if (newTechnologies.length > 0) {
      await db.insert(workTechnologies).values(newTechnologies);
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workId = Number(params.id);

  // 所有権チェック (userWorks にレコードがあるか)
  const link = await db
    .select()
    .from(userWorks)
    .where(and(eq(userWorks.userId, userId), eq(userWorks.workId, workId))); // 修正

  //アクセスしているユーザのロールを取得
  const currentUser = await db
    .select()
    .from(users)
    .where(eq(users.id, userId));
  const userRole = currentUser[0]?.type ?? "general";

  if (link.length === 0 && (userRole !== "admin" && userRole !== "manager")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 関連中間テーブル (work_labels など) も削除
  await db.delete(workLabels).where(eq(workLabels.workId, workId));
  await db.delete(workTechnologies).where(eq(workTechnologies.workId, workId));

  // userWorks から削除
  await db
    .delete(userWorks)
    .where(and(eq(userWorks.userId, userId), eq(userWorks.workId, workId)));

  // works 本体を削除 (共有作品でないなら)
  await db.delete(works).where(eq(works.id, workId));

  return NextResponse.json({ success: true });
}
