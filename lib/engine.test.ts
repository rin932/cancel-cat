import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  applyVote,
  assertNoVoteLeak,
  createRoomRecord,
  toPublicRoom,
  validateCreateInput,
} from "./engine";
import { createTestStore } from "./store";
import { hashVoteToken } from "./crypto";

describe("validateCreateInput", () => {
  it("rejects a single person", () => {
    expect(() =>
      validateCreateInput({ name: "치맥", capacity: 1 }),
    ).toThrow(/2명/);
  });

  it("trims the appointment name", () => {
    expect(validateCreateInput({ name: "  주말 브런치  ", capacity: 3 })).toEqual(
      { name: "주말 브런치", capacity: 3 },
    );
  });
});

describe("Schrödinger voting", () => {
  const now = 1_700_000_000_000;

  it("stays pending until the last person votes", () => {
    let room = createRoomRecord("abc", { name: "치맥", capacity: 3 }, now);
    const first = applyVote(room, "hash-1", now);
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    room = first.room;
    expect(room.cancelled).toBe(false);
    expect(toPublicRoom(room, now).status).toBe("pending");

    const second = applyVote(room, "hash-2", now);
    expect(second.ok && second.justCancelled).toBe(false);
    if (!second.ok) return;
    room = second.room;

    const last = applyVote(room, "hash-3", now);
    expect(last.ok && last.justCancelled).toBe(true);
    if (!last.ok) return;
    expect(toPublicRoom(last.room, now).status).toBe("cancelled");
  });

  it("never exposes vote internals on the public payload", () => {
    const room = createRoomRecord("abc", { name: "치맥", capacity: 2 }, now);
    const voted = applyVote(room, "hash-1", now);
    expect(voted.ok).toBe(true);
    if (!voted.ok) return;
    const publicRoom = toPublicRoom(voted.room, now);
    expect(publicRoom).not.toHaveProperty("voteCount");
    expect(publicRoom).not.toHaveProperty("voteHashes");
    assertNoVoteLeak(publicRoom);
    expect(publicRoom.status).toBe("pending");
  });

  it("ignores a second press from the same anonymous token", () => {
    const room = createRoomRecord("abc", { name: "치맥", capacity: 2 }, now);
    const first = applyVote(room, "same", now);
    expect(first.ok && first.alreadyVoted).toBe(false);
    if (!first.ok) return;
    const second = applyVote(first.room, "same", now);
    expect(second.ok && second.alreadyVoted).toBe(true);
    if (!second.ok) return;
    expect(second.room.voteCount).toBe(1);
    expect(second.room.cancelled).toBe(false);
  });

  it("does not cancel when the room expires mid-vote", () => {
    const room = createRoomRecord("abc", { name: "치맥", capacity: 2 }, now);
    const late = applyVote(room, "hash-1", room.expiresAt + 1);
    expect(late).toEqual({ ok: false, error: "expired" });
  });
});

describe("file store", () => {
  it("persists a unanimous cancel without leaking counts over get()", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "cancel-cat-"));
    const store = createTestStore(path.join(dir, "rooms.json"));
    const room = await store.create({ name: "퇴근 후 한잔", capacity: 2 });
    const first = await store.vote(room.id, hashVoteToken(room.id, "token-a"));
    expect(first.ok && "justCancelled" in first && first.justCancelled).toBe(
      false,
    );
    const last = await store.vote(room.id, hashVoteToken(room.id, "token-b"));
    expect(last.ok && "justCancelled" in last && last.justCancelled).toBe(true);
    const stored = await store.get(room.id);
    expect(stored?.cancelled).toBe(true);
    await rm(dir, { recursive: true, force: true });
  });
});
