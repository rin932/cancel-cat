import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#07060b",
          color: "#e2b36a",
          fontSize: 22,
          fontWeight: 700,
        }}
      >
        냥
      </div>
    ),
    size,
  );
}
