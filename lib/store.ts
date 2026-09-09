import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { applyVote, createRoomRecord } from "./engine";
import { createRoomId } from "./crypto";
import type { CreateRoomInput, RoomRecord, VoteResult } from "./types";

export type RoomStore = {
  create(input: CreateRoomInput, now?: number): Promise<RoomRecord>;
  get(id: string): Promise<RoomRecord | null>;
  vote(id: string, tokenHash: string, now?: number): Promise<VoteResult>;
};

type FileDb = {
  rooms: Record<string, RoomRecord>;
};

const FILE_STORE_PATH =
  process.env.CANCEL_CAT_DATA_FILE ??
  path.join(
    process.env.VERCEL ? "/tmp" : process.cwd(),
    process.env.VERCEL ? "cancel-cat-rooms.json" : ".data/rooms.json",
  );

let writeChain: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeChain.then(fn, fn);
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readDb(filePath: string): Promise<FileDb> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as FileDb;
    return parsed.rooms ? parsed : { rooms: {} };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { rooms: {} };
    }
    throw error;
  }
}

async function writeDb(filePath: string, db: FileDb): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(db), "utf8");
}

function createFileStore(filePath: string): RoomStore {
  return {
    async create(input, now = Date.now()) {
      return withLock(async () => {
        const db = await readDb(filePath);
        const id = createRoomId();
        const room = createRoomRecord(id, input, now);
        db.rooms[id] = room;
        await writeDb(filePath, db);
        return room;
      });
    },
    async get(id) {
      const db = await readDb(filePath);
      return db.rooms[id] ?? null;
    },
    async vote(id, tokenHash, now = Date.now()) {
      return withLock(async () => {
        const db = await readDb(filePath);
        const room = db.rooms[id];
        if (!room) {
          return { ok: false, error: "not_found" } as const;
        }
        const result = applyVote(room, tokenHash, now);
        if (result.ok && !result.alreadyVoted) {
          db.rooms[id] = result.room;
          await writeDb(filePath, db);
        }
        return result;
      });
    },
  };
}

type RedisEnv = {
  url: string;
  token: string;
};

function redisEnv(): RedisEnv | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

async function redisCall(env: RedisEnv, command: unknown[]): Promise<unknown> {
  const response = await fetch(env.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Redis command failed (${response.status})`);
  }
  const payload = (await response.json()) as { result: unknown };
  return payload.result;
}

const VOTE_LUA = `
local raw = redis.call('GET', KEYS[1])
if not raw then
  return cjson.encode({ ok = false, error = 'not_found' })
end
local room = cjson.decode(raw)
local now = tonumber(ARGV[1])
local tokenHash = ARGV[2]
if room.cancelled == false and now >= room.expiresAt then
  return cjson.encode({ ok = false, error = 'expired' })
end
if room.cancelled == true then
  return cjson.encode({ ok = false, error = 'already_cancelled' })
end
for _, hash in ipairs(room.voteHashes) do
  if hash == tokenHash then
    return cjson.encode({ ok = true, alreadyVoted = true, justCancelled = false, room = room })
  end
end
table.insert(room.voteHashes, tokenHash)
room.voteCount = room.voteCount + 1
local justCancelled = room.voteCount >= room.required
if justCancelled then
  room.cancelled = true
  room.cancelledAt = now
end
redis.call('SET', KEYS[1], cjson.encode(room))
return cjson.encode({ ok = true, alreadyVoted = false, justCancelled = justCancelled, room = room })
`;

function roomKey(id: string): string {
  return `cancel-cat:room:${id}`;
}

function createRedisStore(env: RedisEnv): RoomStore {
  return {
    async create(input, now = Date.now()) {
      const id = createRoomId();
      const room = createRoomRecord(id, input, now);
      await redisCall(env, ["SET", roomKey(id), JSON.stringify(room)]);
      return room;
    },
    async get(id) {
      const raw = await redisCall(env, ["GET", roomKey(id)]);
      if (typeof raw !== "string" || !raw) return null;
      return JSON.parse(raw) as RoomRecord;
    },
    async vote(id, tokenHash, now = Date.now()) {
      const raw = await redisCall(env, [
        "EVAL",
        VOTE_LUA,
        "1",
        roomKey(id),
        String(now),
        tokenHash,
      ]);
      if (typeof raw !== "string") {
        return { ok: false, error: "not_found" };
      }
      return JSON.parse(raw) as VoteResult;
    },
  };
}

let singleton: RoomStore | null = null;

export function getStore(): RoomStore {
  if (singleton) return singleton;
  const redis = redisEnv();
  singleton = redis ? createRedisStore(redis) : createFileStore(FILE_STORE_PATH);
  return singleton;
}

export function createTestStore(filePath: string): RoomStore {
  return createFileStore(filePath);
}
