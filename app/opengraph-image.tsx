import { ImageResponse } from "next/og";

export const alt = "캔슬캣 — 모두가 가기 싫을 때만 열리는 상자";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#07060b",
          color: "#f4ead7",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 8, color: "#e2b36a" }}>
          CANCEL CAT
        </div>
        <div style={{ fontSize: 72, fontWeight: 700, marginTop: 16 }}>
          캔슬캣
        </div>
        <div style={{ fontSize: 32, marginTop: 24, color: "#cbbba0", maxWidth: 800 }}>
          가기 싫은 마음은 상자 속에. 모두가 넣어야만 약속이 파기됩니다.
        </div>
      </div>
    ),
    size,
  );
}
