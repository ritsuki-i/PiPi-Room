// app/api/works/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { works, userWorks, workLabels } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getAuth } from "@clerk/nextjs/server";
import { WorkType, UserType, LabelType } from "../../../types";

// ✅ 作品の新規作成（POST）
export async function POST(req: NextRequest) {
    const { userId } = getAuth(req);
    if (!userId)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // リクエストボディの型は必要なプロパティを定義
    const {
        name,
        date,
        url,
        icon,
        description,
        labelIds,
        authorIds,
    } = (await req.json()) as {
        name: string;
        date: string;
        url?: string;
        icon?: string;
        description?: string;
        labelIds: number[];
        authorIds: string[];
    };

    if (!name || !date)
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    // ① works テーブルに新規作品を挿入
    const [newWork] = await db
        .insert(works)
        .values({ name, date, url, icon, description })
        .returning();

    // ② authorIds にログイン中の userId を追加（重複を防ぐ）
    const finalAuthorIds = Array.from(new Set([userId, ...authorIds]));
    // ② userWorks テーブルに、各作成者 (authorIds) と新規作品 (newWork.id) を紐付け
    if (finalAuthorIds?.length) {
        await db.insert(userWorks).values(
            finalAuthorIds.map((authorId: string) => ({
                workId: newWork.id,
                userId: authorId,
            }))
        );
    }

    // ③ workLabels テーブルに、各ラベル (labelIds) と新規作品 (newWork.id) を紐付け
    if (labelIds?.length) {
        await db.insert(workLabels).values(
            labelIds.map((labelId: number) => ({
                workId: newWork.id,
                labelId,
            }))
        );
    }

    return NextResponse.json(newWork);
}


export async function GET(req: NextRequest) {
    // ✅ `works` と `userWorks` を結合し、すべての `authorId` を取得
    const workData = await db
        .select({
            workId: works.id,
            name: works.name,
            date: works.date,
            url: works.url,
            icon: works.icon,
            description: works.description,
            authorId: userWorks.userId, // ✅ 各 `workId` に紐づく `userId`
            labelId: workLabels.labelId, // ✅ 各 `workId` に紐づく `labelId`
        })
        .from(works)
        .leftJoin(userWorks, eq(works.id, userWorks.workId))
        .leftJoin(workLabels, eq(works.id, workLabels.workId));

    // ✅ `workId` ごとに `authorIds` をグループ化
    const groupedWorks: WorkType[] = Object.values(
        workData.reduce((acc, work) => {
            if (!acc[work.workId]) {
                acc[work.workId] = {
                    id: work.workId,
                    name: work.name,
                    date: work.date,
                    url: work.url,
                    icon: work.icon,
                    description: work.description,
                    authorIds: [], // ✅ `authorIds` を配列にする
                    labelIds: [], // ✅ `labelIds` を配列にする
                };
            }
            if (work.authorId && !acc[work.workId].authorIds.includes(work.authorId)) {
                acc[work.workId].authorIds.push(work.authorId);
            }
            if (work.labelId && !acc[work.workId].labelIds.includes(work.labelId)) {
                acc[work.workId].labelIds.push(work.labelId);
            }
            return acc;
        }, {} as Record<number, WorkType>)
    );

    return NextResponse.json(groupedWorks);
}