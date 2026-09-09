import Link from "next/link";
import { CatBox } from "@/components/cat-box";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-1 flex-col px-5">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center pb-20 text-center">
        <CatBox />
        <h1 className="display mt-8 text-3xl">없는 상자예요</h1>
        <p className="mt-3 text-muted">링크가 잘못됐거나, 이미 사라진 방입니다.</p>
        <Link href="/" className="mt-6 text-amber underline-offset-4 hover:underline">
          새 상자 만들기
        </Link>
      </main>
    </div>
  );
}
