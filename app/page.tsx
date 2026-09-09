import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { CreateRoomForm } from "@/components/create-room-form";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <AppShell>
      <SiteHeader />
      <main className="flex flex-1 flex-col justify-center py-6">
        <h1 className="text-[1.75rem] font-bold leading-tight">
          나가기 귀찮을 때
          <br />
          눈치 보지 말고 누르세요
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          모두가 가기 싫다고 해야 약속이 취소됩니다. 한 명이라도 안 누르면 아무
          일도 없었던 것처럼요.
        </p>
        <div className="mt-8">
          <CreateRoomForm />
        </div>
        <Link
          href="/demo"
          className="mt-6 py-3 text-center text-sm text-muted underline underline-offset-4"
        >
          파기 화면 미리보기
        </Link>
      </main>
    </AppShell>
  );
}
