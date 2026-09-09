import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Sans_KR } from "next/font/google";
import "./globals.css";

const ibm = IBM_Plex_Sans_KR({
  variable: "--font-ibm",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "캔슬캣 — 약속 취소 전용 상자",
    template: "%s · 캔슬캣",
  },
  description:
    "가기 싫은 마음을 상자 속에 넣으세요. 모두가 넣었을 때만 약속이 파기됩니다. 한 명이라도 안 누르면, 아무 일도 없었던 것처럼.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    title: "캔슬캣 — 약속 취소 전용 상자",
    description:
      "슈뢰딩거의 약속. 모두가 가기 싫다고 해야 상자가 열립니다.",
    locale: "ko_KR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#07060b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${ibm.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
