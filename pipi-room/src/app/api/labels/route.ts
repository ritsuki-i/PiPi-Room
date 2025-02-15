// app/api/labels/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { labels } from "@/db/schema";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
    const { userId } = getAuth(req);
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // body: { name: string }
    const { name } = await req.json();
    if (!name) {
        return NextResponse.json({ error: "No label name" }, { status: 400 });
    }

    // ラベル作成
    const [insertedLabel] = await db
        .insert(labels)
        .values({ name })
        .returning();

    return NextResponse.json(insertedLabel);
}

export async function GET() {
    try {
        const allLabels = await db.select().from(labels);
        return NextResponse.json(allLabels);
    } catch (error) {
        console.error("Error fetching labels:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}