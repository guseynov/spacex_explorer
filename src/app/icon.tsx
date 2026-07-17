import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
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
          borderRadius: 14,
          background: "#07110f",
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid #66d4b1",
            borderRadius: 999,
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(102,212,177,0.6)",
              borderRadius: 999,
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: 999, background: "#66d4b1" }} />
          </div>
        </div>
      </div>
    ),
    size,
  );
}
