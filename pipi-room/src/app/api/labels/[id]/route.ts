import { db } from "@/db"
import { labels, articleLabels, workLabels } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { name } = await req.json()
  await db.update(labels).set({ name }).where(eq(labels.id, Number(params.id)))
  return NextResponse.json({ success: true })
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  await db.delete(articleLabels).where(eq(articleLabels.labelId, id))
  await db.delete(workLabels).where(eq(workLabels.labelId, id))
  await db.delete(labels).where(eq(labels.id, id))
  return NextResponse.json({ success: true })
}
