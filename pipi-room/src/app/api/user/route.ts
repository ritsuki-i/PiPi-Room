import { NextResponse } from "next/server";
import { db } from "@/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  const users = await db.query.users.findMany();
  const response = NextResponse.json(users);
  // キャッシュを無効にするためのヘッダー設定
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}