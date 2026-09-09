import { NextResponse } from "next/server";
import { assertNoVoteLeak, toPublicRoom } from "@/lib/engine";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const room = await getStore().get(id);
  if (!room) {
    return NextResponse.json({ error: "방을 찾을 수 없습니다." }, { status: 404 });
  }
  const publicRoom = toPublicRoom(room, Date.now());
  assertNoVoteLeak(publicRoom);
  return NextResponse.json(publicRoom);
}
