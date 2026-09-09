import Link from "next/link";
import { CatBox } from "@/components/cat-box";

type CancelRevealProps = {
  name: string;
  capacity: number;
  demo?: boolean;
};

export function CancelReveal({ name, capacity, demo = false }: CancelRevealProps) {
  return (
    <section className="flex flex-1 flex-col items-center justify-center text-center">
      {demo ? (
        <p className="mb-3 rounded-full border border-line px-3 py-1 text-xs text-muted">
          미리보기
        </p>
      ) : null}
      <CatBox open />
      <h1 className="mt-6 text-[1.75rem] font-bold leading-tight">약속 파기 확정</h1>
      <p className="mt-2 text-muted">{name}</p>
      <p className="mt-6 text-base leading-relaxed">
        다들 가기 싫었던 거예요.
        <br />
        눈치 볼 사람 없이, 오늘은 집에서.
      </p>
      <p className="mt-3 text-sm text-muted">
        {capacity}명 전원이 같은 마음을 넣었습니다.
      </p>
      <Link href="/" className="btn btn-ghost mt-8 max-w-xs">
        {demo ? "돌아가기" : "다음 약속 만들기"}
      </Link>
    </section>
  );
}
