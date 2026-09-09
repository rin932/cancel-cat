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
        setError(payload.error ?? "상자를 만들지 못했어요.");
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
    <form
      onSubmit={onSubmit}
      className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md"
    >
      <label className="block text-sm font-medium text-muted">
        약속 이름
        <input
          required
          maxLength={40}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="예: 금요일 치맥"
          className="mt-2 w-full rounded-2xl border border-white/10 bg-void/70 px-4 py-3 text-ink outline-none transition focus:border-amber"
        />
      </label>

      <div className="mt-5">
        <div className="flex items-center justify-between text-sm font-medium text-muted">
          <span>몇 명인가요?</span>
          <span className="text-amber">{capacity}명 · 전원 동의 시 파기</span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            aria-label="인원 줄이기"
            onClick={() => setCapacity((value) => Math.max(MIN_CAPACITY, value - 1))}
            className="h-12 w-12 rounded-2xl border border-white/10 bg-white/5 text-2xl leading-none"
          >
            −
          </button>
          <input
            type="range"
            min={MIN_CAPACITY}
            max={MAX_CAPACITY}
            value={capacity}
            onChange={(event) => setCapacity(Number(event.target.value))}
            className="h-2 flex-1 accent-amber"
          />
          <button
            type="button"
            aria-label="인원 늘리기"
            onClick={() => setCapacity((value) => Math.min(MAX_CAPACITY, value + 1))}
            className="h-12 w-12 rounded-2xl border border-white/10 bg-white/5 text-2xl leading-none"
          >
            +
          </button>
        </div>
        <p className="mt-2 text-xs text-muted/80">
          2명 이상. 로그인 없이, 링크만 있으면 됩니다.
        </p>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-ember" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="big-button mt-6 w-full rounded-full py-4 text-lg font-bold tracking-tight"
      >
        {pending ? "상자 만드는 중…" : "상자 만들고 링크 받기"}
      </button>
    </form>
  );
}
