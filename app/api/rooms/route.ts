import { NextResponse } from "next/server";
import { RoomValidationError } from "@/lib/engine";
import { getStore } from "@/lib/store";
import { toPublicRoom } from "@/lib/engine";
import { assertNoVoteLeak } from "@/lib/engine";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const record = body as { name?: unknown; capacity?: unknown };
  try {
    const room = await getStore().create({
      name: String(record.name ?? ""),
      capacity: Number(record.capacity),
    });
    const publicRoom = toPublicRoom(room, Date.now());
    assertNoVoteLeak(publicRoom);
    return NextResponse.json({
      ...publicRoom,
      sharePath: `/r/${room.id}`,
    });
  } catch (error) {
    if (error instanceof RoomValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
