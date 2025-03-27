import { db } from "@/db";

export async function GET() {
  const users = await db.query.users.findMany()
  return Response.json(users)
}