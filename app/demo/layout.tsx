import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "파기 화면 미리보기",
};

export default function DemoLayout({ children }: { children: ReactNode }) {
  return children;
}
