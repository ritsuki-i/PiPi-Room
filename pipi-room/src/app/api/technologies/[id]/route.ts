import { db } from "@/db"
import { technologies, articleTechnologies, workTechnologies } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { name } = await req.json()
  await db.update(technologies).set({ name }).where(eq(technologies.id, Number(params.id)))
  return NextResponse.json({ success: true })
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  await db.delete(articleTechnologies).where(eq(articleTechnologies.technologieId, id))
  await db.delete(workTechnologies).where(eq(workTechnologies.technologieId, id))
  await db.delete(technologies).where(eq(technologies.id, id))
  return NextResponse.json({ success: true })
}
