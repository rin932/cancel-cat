"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { PublicRoom } from "@/lib/types";
import { CatBox } from "@/components/cat-box";

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
  const [notifyArmed, setNotifyArmed] = useState(false);
  const storedVoted = useSyncExternalStore(
    subscribeToNothing,
    () => window.localStorage.getItem(votedKey(roomId)) === "1",
    () => false,
  );
  const shareUrl = useSyncExternalStore(
    subscribeToNothing,
    () => window.location.origin + `/r/${roomId}`,
    () => "",
  );
  const canNotify = useSyncExternalStore(
    subscribeToNothing,
    () => typeof Notification !== "undefined",
    () => false,
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
                ? "이 상자를 찾을 수 없어요."
                : "상자를 불러오지 못했어요.",
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

  useEffect(() => {
    if (room?.status !== "cancelled" || !notifyArmed) return;
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;
    if (document.visibilityState === "visible") return;
    new Notification("약속이 파기됐어요", {
      body: `${room.name} — 다들 가기 싫었던 모양이에요.`,
    });
  }, [notifyArmed, room]);

  const headline = useMemo(() => {
    if (!room) return "";
    if (room.status === "cancelled") return "약속 파기 확정";
    if (room.status === "expired") return "상자가 만료됐어요";
    if (voted) return "속마음은 상자 속에";
    return room.name;
  }, [room, voted]);

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
        text: "가기 싫으면 이 상자만 눌러 주세요. 모두가 눌러야만 열려요.",
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
        justCancelled?: boolean;
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

  async function armNotification() {
    if (typeof Notification === "undefined") return;
    const permission = await Notification.requestPermission();
    setNotifyArmed(permission === "granted");
  }

  if (loadError && !room) {
    return (
      <section className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 text-center">
        <CatBox />
        <h1 className="display mt-8 text-3xl">{loadError}</h1>
        <Link href="/" className="mt-6 text-amber underline-offset-4 hover:underline">
          새 상자 만들기
        </Link>
      </section>
    );
  }

  if (!room) {
    return (
      <section className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 text-center">
        <CatBox />
        <p className="mt-8 text-muted">상자를 살피는 중…</p>
      </section>
    );
  }

  const cancelled = room.status === "cancelled";
  const expired = room.status === "expired";

  return (
    <section className="relative mx-auto flex w-full max-w-lg flex-1 flex-col items-center px-4 pb-16 text-center">
      {cancelled ? <Confetti /> : null}

      {isHost && !cancelled ? (
        <div className="mt-2 w-full rounded-3xl border border-amber/25 bg-amber/10 p-4 text-left">
          <p className="text-sm font-medium text-amber">링크를 공유하세요</p>
          <p className="mt-1 break-all text-xs text-muted">{shareUrl}</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={copyLink}
              className={`flex-1 rounded-full px-4 py-2 text-sm ${
                copied ? "bg-moss font-semibold text-void" : "bg-white/10"
              }`}
            >
              {copied ? "복사됨" : "링크 복사"}
            </button>
            <button
              type="button"
              onClick={nativeShare}
              className="flex-1 rounded-full bg-amber px-4 py-2 text-sm font-semibold text-void"
            >
              카톡·메시지로 보내기
            </button>
          </div>
        </div>
      ) : null}

      <p className="mt-8 text-[11px] uppercase tracking-[0.28em] text-amber/80">
        {cancelled ? "Pandora opened" : "Schrödinger’s plan"}
      </p>
      <h1 className="display mt-3 text-4xl leading-tight sm:text-5xl">
        {headline}
      </h1>
      {!cancelled ? (
        <p className="mt-3 text-muted">
          {room.name} · {room.capacity}명 만장일치일 때만 열립니다
        </p>
      ) : (
        <p className="mt-3 text-muted">{room.name}</p>
      )}

      <div className="relative mt-8">
        {!cancelled && !voted ? (
          <span className="pulse-ring absolute inset-8 rounded-full bg-ember/20" />
        ) : null}
        <CatBox open={cancelled} />
      </div>

      {cancelled ? (
        <div className="waiting-copy mt-8 space-y-3">
          <p className="text-lg leading-relaxed">
            다들 가기 싫었던 거예요.
            <br />
            눈치 볼 사람 없이, 오늘은 집에서.
          </p>
          <p className="text-sm text-muted">
            {room.capacity}명 전원이 같은 마음을 상자에 넣었습니다.
          </p>
          <Link
            href="/"
            className="inline-flex rounded-full bg-white/10 px-5 py-3 text-sm"
          >
            다음 약속 상자 만들기
          </Link>
        </div>
      ) : expired ? (
        <p className="waiting-copy mt-8 text-muted">
          일주일 동안 상자가 열리지 않았어요. 약속은 그대로 진행된 셈입니다.
        </p>
      ) : voted ? (
        <div className="waiting-copy mt-8 max-w-sm space-y-4">
          <p className="text-lg leading-relaxed">
            속마음을 넣었어요.
            <br />
            상자는 아직 닫혀 있습니다.
          </p>
          <p className="text-sm text-muted">
            한 명이라도 누르지 않으면 아무 일도 일어나지 않습니다. 누가
            눌렀는지는 서버에도, 서로에게도 공개되지 않아요. 이 화면을 켜 두면
            상자가 열리는 순간 같은 연출이 뜹니다.
          </p>
          {canNotify ? (
            <button
              type="button"
              onClick={armNotification}
              className="rounded-full border border-white/15 px-4 py-2 text-xs text-muted"
            >
              {notifyArmed ? "알림이 켜졌어요" : "상자 열리면 알려주기"}
            </button>
          ) : null}
        </div>
      ) : (
        <div className="mt-8 w-full max-w-sm">
          <button
            type="button"
            onClick={vote}
            disabled={pending}
            className="big-button w-full rounded-full py-5 text-xl font-bold"
          >
            {pending ? "넣는 중…" : "가기 싫음"}
          </button>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            버튼을 누르면 속마음만 상자 속으로 들어갑니다. 완벽한 무기명.
            전원이 누르기 전에는 투표 여부조차 공개되지 않습니다.
          </p>
        </div>
      )}
    </section>
  );
}

function Confetti() {
  const bits = Array.from({ length: 18 }, (_, index) => index);
  const colors = ["#e2b36a", "#ff5d45", "#f4ead7", "#8fad7a", "#c0894a"];
  return (
    <div className="confetti pointer-events-none absolute inset-0 overflow-hidden">
      {bits.map((bit) => (
        <i
          key={bit}
          style={{
            background: colors[bit % colors.length],
            ["--x" as string]: `${(bit % 2 === 0 ? -1 : 1) * (40 + bit * 12)}px`,
            ["--y" as string]: `${-80 - bit * 8}px`,
            animationDelay: `${bit * 40}ms`,
          }}
        />
      ))}
    </div>
  );
}

