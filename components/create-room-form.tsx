"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { MAX_CAPACITY, MIN_CAPACITY } from "@/lib/engine";

export function CreateRoomForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(4);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, capacity }),
      });
      const payload = (await response.json()) as {
        id?: string;
        error?: string;
      };
      if (!response.ok || !payload.id) {
        setError(payload.error ?? "방을 만들지 못했어요.");
        return;
      }
      router.push(`/r/${payload.id}?host=1`);
    } catch {
      setError("네트워크 오류가 났어요. 다시 시도해 주세요.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-5">
      <label className="block text-sm text-muted">
        약속 이름
        <input
          required
          maxLength={40}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="예: 금요일 치맥"
          className="field mt-2"
          autoComplete="off"
        />
      </label>

      <div>
        <div className="flex items-center justify-between text-sm text-muted">
          <span>몇 명인가요?</span>
          <span>{capacity}명</span>
        </div>
        <div className="stepper mt-2">
          <button
            type="button"
            aria-label="인원 줄이기"
            onClick={() => setCapacity((value) => Math.max(MIN_CAPACITY, value - 1))}
          >
            −
          </button>
          <input
            type="range"
            min={MIN_CAPACITY}
            max={MAX_CAPACITY}
            value={capacity}
            onChange={(event) => setCapacity(Number(event.target.value))}
            className="h-2 flex-1 accent-ink"
          />
          <button
            type="button"
            aria-label="인원 늘리기"
            onClick={() => setCapacity((value) => Math.min(MAX_CAPACITY, value + 1))}
          >
            +
          </button>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn btn-danger">
        {pending ? "만드는 중…" : "방 만들기"}
      </button>
    </form>
  );
}
