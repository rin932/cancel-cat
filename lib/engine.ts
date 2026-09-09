import type {
  CreateRoomInput,
  PublicRoom,
  RoomRecord,
  VoteResult,
} from "./types";

export const MIN_CAPACITY = 2;
export const MAX_CAPACITY = 20;
export const NAME_MAX_LENGTH = 40;
export const ROOM_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export class RoomValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RoomValidationError";
  }
}

export function normalizeName(name: string): string {
  return name.replace(/\s+/g, " ").trim();
}

export function validateCreateInput(input: CreateRoomInput): {
  name: string;
  capacity: number;
} {
  const name = normalizeName(input.name);
  if (!name) {
    throw new RoomValidationError("약속 이름을 입력해 주세요.");
  }
  if (name.length > NAME_MAX_LENGTH) {
    throw new RoomValidationError(
      `약속 이름은 ${NAME_MAX_LENGTH}자 이하여야 합니다.`,
    );
  }
  const capacity = Number(input.capacity);
  if (!Number.isInteger(capacity)) {
    throw new RoomValidationError("인원수는 정수여야 합니다.");
  }
  if (capacity < MIN_CAPACITY || capacity > MAX_CAPACITY) {
    throw new RoomValidationError(
      `인원수는 ${MIN_CAPACITY}명 이상 ${MAX_CAPACITY}명 이하여야 합니다.`,
    );
  }
  return { name, capacity };
}

export function createRoomRecord(
  id: string,
  input: CreateRoomInput,
  now: number,
): RoomRecord {
  const { name, capacity } = validateCreateInput(input);
  return {
    id,
    name,
    capacity,
    required: capacity,
    voteCount: 0,
    voteHashes: [],
    cancelled: false,
    cancelledAt: null,
    createdAt: now,
    expiresAt: now + ROOM_TTL_MS,
  };
}

export function isExpired(room: RoomRecord, now: number): boolean {
  return !room.cancelled && now >= room.expiresAt;
}

export function applyVote(
  room: RoomRecord,
  tokenHash: string,
  now: number,
): VoteResult {
  if (!tokenHash) {
    throw new RoomValidationError("투표 토큰이 없습니다.");
  }
  if (isExpired(room, now)) {
    return { ok: false, error: "expired" };
  }
  if (room.cancelled) {
    return { ok: false, error: "already_cancelled" };
  }
  if (room.voteHashes.includes(tokenHash)) {
    return {
      ok: true,
      alreadyVoted: true,
      justCancelled: false,
      room,
    };
  }

  const voteHashes = [...room.voteHashes, tokenHash];
  const voteCount = room.voteCount + 1;
  const cancelled = voteCount >= room.required;
  const next: RoomRecord = {
    ...room,
    voteHashes,
    voteCount,
    cancelled,
    cancelledAt: cancelled ? now : null,
  };

  return {
    ok: true,
    alreadyVoted: false,
    justCancelled: cancelled,
    room: next,
  };
}

export function toPublicRoom(room: RoomRecord, now: number): PublicRoom {
  return {
    id: room.id,
    name: room.name,
    capacity: room.capacity,
    required: room.required,
    status: room.cancelled
      ? "cancelled"
      : isExpired(room, now)
        ? "expired"
        : "pending",
    cancelledAt: room.cancelledAt,
  };
}

export function assertNoVoteLeak(payload: unknown): void {
  if (!payload || typeof payload !== "object") return;
  const record = payload as Record<string, unknown>;
  if ("voteCount" in record || "voteHashes" in record) {
    throw new Error("Public payload leaked vote internals.");
  }
}
