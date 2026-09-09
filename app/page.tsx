import { CreateRoomForm } from "@/components/create-room-form";
import { CatBox } from "@/components/cat-box";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-5xl flex-1 flex-col px-5">
      <SiteHeader />
      <main className="grid flex-1 items-center gap-12 pb-20 pt-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-amber">
            For plans you secretly dread
          </p>
          <h1 className="display mt-4 text-4xl leading-[1.15] sm:text-6xl">
            나가기 귀찮을 때,
            <br />
            눈치 보지 말고
            <br />
            상자만 누르세요.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted sm:text-lg">
            캔슬캣은 약속 취소 전용 서비스입니다. 슈뢰딩거의 고양이처럼,{" "}
            <strong className="font-medium text-ink">모두가 가기 싫다는
            마음을 넣었을 때만</strong>{" "}
            파기가 공개됩니다. 한 명이라도 안 누르면 아무 일도 없었던 것처럼
            약속은 그대로입니다.
          </p>
          <div className="mt-10 hidden lg:block">
            <CatBox />
          </div>
        </div>
        <div className="lg:pt-8">
          <div className="mb-8 lg:hidden">
            <CatBox />
          </div>
          <CreateRoomForm />
          <ol className="mt-8 grid gap-3 text-sm text-muted sm:grid-cols-3">
            <li className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <span className="text-amber">1.</span> 이름과 인원만 넣고 방을
              만들어요.
            </li>
            <li className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <span className="text-amber">2.</span> 링크를 카톡·토스로
              공유해요.
            </li>
            <li className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <span className="text-amber">3.</span> 전원이 누르면 상자가
              열립니다.
            </li>
          </ol>
        </div>
      </main>
    </div>
  );
}
