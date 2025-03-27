import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// /api/users/[id]/role/route.ts
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const { type } = await req.json()
    await db.update(users).set({ type }).where(eq(users.id, params.id))
    return new Response("Role updated", { status: 200 })
}
