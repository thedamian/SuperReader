import { PencilIcon } from "../components/icons";
import type { AnalyzeResult } from "../types";

export interface OverlayBox {
  x: number; // 0..1
  y: number; // 0..1
  width: number; // 0..1
  height: number; // 0..1
}

export function ReadOverlay({ result }: { result: AnalyzeResult | null }) {
  if (!result?.box) return null;
  const b = result.box;
  return (
    <div className="overlay">
      <div
        className="field-box"
        style={{
          left: `${b.x * 100}%`,
          top: `${b.y * 100}%`,
          width: `${b.width * 100}%`,
          height: `${b.height * 100}%`,
        }}
      >
        <img
          src={PencilIcon}
          alt="pencil"
          className="pencil"
          draggable={false}
        />
      </div>
    </div>
  );
}
