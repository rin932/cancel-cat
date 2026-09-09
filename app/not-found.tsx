import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <AppShell>
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center text-center">
        <h1 className="text-xl font-bold">없는 방이에요</h1>
        <p className="mt-2 text-sm text-muted">링크가 잘못됐거나 사라진 방입니다.</p>
        <Link href="/" className="mt-6 text-sm text-muted">
          처음으로
        </Link>
      </main>
    </AppShell>
  );
}
