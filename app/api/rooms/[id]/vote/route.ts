import { NextResponse } from "next/server";
import { hashVoteToken, isVoteToken } from "@/lib/crypto";
import { assertNoVoteLeak, toPublicRoom } from "@/lib/engine";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const token = (body as { token?: unknown }).token;
  if (!isVoteToken(token)) {
    return NextResponse.json({ error: "유효하지 않은 투표입니다." }, { status: 400 });
  }

  const result = await getStore().vote(id, hashVoteToken(id, token));
  if (!result.ok) {
    const status =
      result.error === "not_found"
        ? 404
        : result.error === "expired"
          ? 410
          : 409;
    const message =
      result.error === "not_found"
        ? "방을 찾을 수 없습니다."
        : result.error === "expired"
          ? "이 상자는 이미 만료되었습니다."
          : "이미 파기된 약속입니다.";
    return NextResponse.json({ error: message, code: result.error }, { status });
  }

  const publicRoom = toPublicRoom(result.room, Date.now());
  assertNoVoteLeak(publicRoom);
  return NextResponse.json({
    ...publicRoom,
    alreadyVoted: result.alreadyVoted,
    justCancelled: result.justCancelled,
  });
}
