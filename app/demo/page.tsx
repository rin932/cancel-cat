"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { CancelReveal } from "@/components/cancel-reveal";
import { CatBox } from "@/components/cat-box";
import { SiteHeader } from "@/components/site-header";

const DEMO_NAME = "금요일 치맥";
const DEMO_CAPACITY = 4;

export default function DemoPage() {
  const [opened, setOpened] = useState(false);

  return (
    <AppShell>
      <SiteHeader />
      {opened ? (
        <CancelReveal name={DEMO_NAME} capacity={DEMO_CAPACITY} demo />
      ) : (
        <section className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="rounded-full border border-line px-3 py-1 text-xs text-muted">
            미리보기 · 실제 투표가 아닙니다
          </p>
          <h1 className="mt-5 text-[1.75rem] font-bold">{DEMO_NAME}</h1>
          <p className="mt-2 text-sm text-muted">
            {DEMO_CAPACITY}명 전원이 누르면 열립니다
          </p>
          <div className="mt-8">
            <CatBox />
          </div>
          <button
            type="button"
            className="btn btn-danger mt-8 max-w-xs"
            onClick={() => setOpened(true)}
          >
            가기 싫음
          </button>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            마지막 한 명이 누른 순간이 이렇게 보입니다.
          </p>
          <button
            type="button"
            className="mt-6 text-sm text-muted underline underline-offset-4"
            onClick={() => setOpened(true)}
          >
            결과 화면만 보기
          </button>
        </section>
      )}
    </AppShell>
  );
}
