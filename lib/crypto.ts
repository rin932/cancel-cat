import { createHash, randomBytes } from "node:crypto";

export function createRoomId(): string {
  return randomBytes(6).toString("base64url");
}

export function hashVoteToken(roomId: string, token: string): string {
  return createHash("sha256")
    .update(`cancel-cat:${roomId}:${token}`)
    .digest("hex");
}

export function isVoteToken(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= 16 &&
    value.length <= 128 &&
    /^[A-Za-z0-9_-]+$/.test(value)
  );
}
