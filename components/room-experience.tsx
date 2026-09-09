"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { CancelReveal } from "@/components/cancel-reveal";
import { CatBox } from "@/components/cat-box";
import type { PublicRoom } from "@/lib/types";

const POLL_MS = 1500;

function tokenKey(roomId: string) {
  return `cancel-cat.token.${roomId}`;
}

function votedKey(roomId: string) {
  return `cancel-cat.voted.${roomId}`;
}

function getOrCreateToken(roomId: string): string {
  const existing = window.localStorage.getItem(tokenKey(roomId));
  if (existing) return existing;
  const token = crypto.randomUUID();
  window.localStorage.setItem(tokenKey(roomId), token);
  return token;
}

function subscribeToNothing() {
  return () => undefined;
}

type RoomExperienceProps = {
  roomId: string;
  isHost?: boolean;
};

export function RoomExperience({ roomId, isHost = false }: RoomExperienceProps) {
  const [room, setRoom] = useState<PublicRoom | null>(null);
  const [loadError, setLoadError] = useState("");
  const [votedHere, setVotedHere] = useState(false);
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const storedVoted = useSyncExternalStore(
    subscribeToNothing,
    () => window.localStorage.getItem(votedKey(roomId)) === "1",
    () => false,
  );
  const shareUrl = useSyncExternalStore(
    subscribeToNothing,
    () => `${window.location.origin}/r/${roomId}`,
    () => "",
  );
  const voted = votedHere || storedVoted;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(`/api/rooms/${roomId}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          if (!cancelled) {
            setLoadError(
              response.status === 404
                ? "방을 찾을 수 없어요."
                : "방을 불러오지 못했어요.",
            );
          }
          return;
        }
        const payload = (await response.json()) as PublicRoom;
        if (!cancelled) {
          setRoom(payload);
          setLoadError("");
        }
      } catch {
        if (!cancelled) setLoadError("네트워크 오류가 났어요.");
      }
    }

    void load();
    const timer = window.setInterval(() => {
      void load();
    }, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [roomId]);

  async function copyLink() {
    const url = shareUrl || `${window.location.origin}/r/${roomId}`;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 6000);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const field = document.createElement("textarea");
      field.value = url;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.left = "-9999px";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }
  }

  async function nativeShare() {
    if (!navigator.share) {
      await copyLink();
      return;
    }
    try {
      await navigator.share({
        title: `캔슬캣 · ${room?.name ?? "약속"}`,
        text: "가기 싫으면 눌러 주세요. 모두가 눌러야만 취소됩니다.",
        url: shareUrl,
      });
    } catch {
      // user cancelled share sheet
    }
  }

  async function vote() {
    if (!room || pending) return;
    setPending(true);
    try {
      const token = getOrCreateToken(roomId);
      const response = await fetch(`/api/rooms/${roomId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const payload = (await response.json()) as PublicRoom & {
        error?: string;
      };
      if (!response.ok) {
        if (response.status === 409) {
          setRoom((current) =>
            current ? { ...current, status: "cancelled" } : current,
          );
          return;
        }
        setLoadError(payload.error ?? "넣지 못했어요.");
        return;
      }
      window.localStorage.setItem(votedKey(roomId), "1");
      setVotedHere(true);
      setRoom(payload);
    } finally {
      setPending(false);
    }
  }

  if (loadError && !room) {
    return (
      <section className="flex flex-1 flex-col items-center justify-center text-center">
        <p>{loadError}</p>
        <Link href="/" className="mt-4 text-sm text-muted">
          처음으로
        </Link>
      </section>
    );
  }

  if (!room) {
    return (
      <section className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="text-muted">불러오는 중…</p>
      </section>
    );
  }

  if (room.status === "cancelled") {
    return <CancelReveal name={room.name} capacity={room.capacity} />;
  }

  if (room.status === "expired") {
    return (
      <section className="flex flex-1 flex-col items-center justify-center text-center">
        <h1 className="text-xl font-bold">상자가 만료됐어요</h1>
        <p className="mt-2 text-sm text-muted">약속은 그대로 진행된 셈입니다.</p>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col items-center text-center">
      {isHost ? (
        <div className="mt-2 w-full rounded-2xl border border-line p-4 text-left">
          <p className="text-sm font-medium">링크를 공유하세요</p>
          <p className="mt-1 break-all text-xs text-muted">{shareUrl}</p>
          <div className="mt-3 flex flex-col gap-2">
            <button type="button" onClick={nativeShare} className="btn btn-danger">
              공유하기
            </button>
            <button type="button" onClick={copyLink} className="btn btn-ghost">
              {copied ? "복사됨" : "링크 복사"}
            </button>
          </div>
        </div>
      ) : null}

      <h1 className="mt-8 text-[1.75rem] font-bold leading-tight">
        {voted ? "속마음을 넣었어요" : room.name}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {room.capacity}명 전원이 눌러야 취소됩니다
      </p>
      <div className="mt-8">
        <CatBox />
      </div>

      {voted ? (
        <p className="mt-8 max-w-xs text-sm leading-relaxed text-muted">
          상자는 아직 닫혀 있습니다. 한 명이라도 안 누르면 아무 일도 일어나지
          않아요. 이 화면을 켜 두면 열리는 순간 같은 화면이 뜹니다.
        </p>
      ) : (
        <div className="mt-8 w-full">
          <button
            type="button"
            onClick={vote}
            disabled={pending}
            className="btn btn-danger"
          >
            {pending ? "넣는 중…" : "가기 싫음"}
          </button>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            누가 눌렀는지는 서버에도 남지 않습니다.
          </p>
        </div>
      )}
    </section>
  );
}
