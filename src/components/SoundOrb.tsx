import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import "./SoundOrb.css";

type Props = {
  id: string;
  className?: string;
  animated?: boolean;
};

type OrbStyle = CSSProperties & Record<`--orb-${string}`, string>;

type SoundArtwork = {
  hue: number;
  accentHue: number;
  angle: number;
  focusX: number;
  focusY: number;
  driftX: number;
  driftY: number;
  primaryDuration: number;
  secondaryDuration: number;
  phaseDelay: number;
};

function idByte(id: string, offset: number): number {
  const value = Number.parseInt(id.slice(offset, offset + 2), 16);
  return Number.isFinite(value) ? value : 0;
}

export function soundArtwork(id: string): SoundArtwork {
  const hueByte = idByte(id, 0);
  return {
    hue: Math.round((hueByte / 255) * 360),
    accentHue:
      (Math.round((hueByte / 255) * 360) + 20 + (idByte(id, 2) % 35)) % 360,
    angle: 115 + (idByte(id, 4) % 130),
    focusX: 25 + (idByte(id, 6) % 51),
    focusY: 25 + (idByte(id, 8) % 51),
    driftX: (idByte(id, 14) % 2 === 0 ? 1 : -1) * (14 + (idByte(id, 16) % 9)),
    driftY: (idByte(id, 18) % 2 === 0 ? -1 : 1) * (14 + (idByte(id, 20) % 9)),
    primaryDuration: 8 + (idByte(id, 10) % 5),
    secondaryDuration: 9 + (idByte(id, 12) % 4),
    phaseDelay: idByte(id, 22) % 17 === 0 ? 0 : -(idByte(id, 22) % 17),
  };
}

function artworkStyle(id: string): OrbStyle {
  const artwork = soundArtwork(id);
  const oppositeX = 100 - artwork.focusX;
  const oppositeY = 100 - artwork.focusY;

  return {
    background: `linear-gradient(${artwork.angle}deg, oklch(0.97 0.018 ${artwork.hue}), oklch(0.76 0.055 ${artwork.hue}))`,
    boxShadow: `inset -18px -22px 42px oklch(0.28 0.035 ${artwork.hue} / 0.14), inset 12px 14px 28px oklch(1 0 0 / 0.38)`,
    "--orb-primary-background": `radial-gradient(circle at ${artwork.focusX}% ${artwork.focusY}%, oklch(0.96 0.09 ${artwork.accentHue}) 0%, transparent 50%)`,
    "--orb-secondary-background": `radial-gradient(circle at ${oppositeX}% ${oppositeY}%, oklch(0.61 0.09 ${artwork.hue}) 0%, transparent 64%)`,
    "--orb-drift-x": `${artwork.driftX}%`,
    "--orb-drift-y": `${artwork.driftY}%`,
    "--orb-secondary-x": `${artwork.driftX * -0.9}%`,
    "--orb-secondary-y": `${artwork.driftY * -0.9}%`,
    "--orb-primary-duration": `${artwork.primaryDuration}s`,
    "--orb-secondary-duration": `${artwork.secondaryDuration}s`,
    "--orb-primary-delay": `${artwork.phaseDelay}s`,
    "--orb-secondary-delay": `${artwork.phaseDelay - 7}s`,
  };
}

const glowClassName =
  "pointer-events-none absolute -inset-[20%] rounded-full [animation-direction:alternate] [animation-iteration-count:infinite] [animation-timing-function:cubic-bezier(0.645,0.045,0.355,1)]";

export default function SoundOrb({
  id,
  className = "",
  animated = true,
}: Props) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-full motion-reduce:transform-none motion-reduce:transition-none",
        className,
      )}
      style={artworkStyle(id)}
      aria-hidden="true"
    >
      <span
        className={cn(
          glowClassName,
          "[background:var(--orb-primary-background)]",
          animated
            ? "[animation-delay:var(--orb-primary-delay)] [animation-duration:var(--orb-primary-duration)] [animation-name:sound-orb-primary-drift] motion-reduce:animate-none motion-reduce:opacity-[0.84] motion-reduce:[transform:translate3d(0,0,0)_scale(1.06)]"
            : "animate-none opacity-[0.84] [transform:translate3d(0,0,0)_scale(1.06)]",
        )}
      />
      <span
        className={cn(
          glowClassName,
          "[background:var(--orb-secondary-background)]",
          animated
            ? "[animation-delay:var(--orb-secondary-delay)] [animation-duration:var(--orb-secondary-duration)] [animation-name:sound-orb-secondary-drift] motion-reduce:animate-none motion-reduce:opacity-[0.62] motion-reduce:[transform:translate3d(0,0,0)_scale(1.05)]"
            : "animate-none opacity-[0.62] [transform:translate3d(0,0,0)_scale(1.05)]",
        )}
      />
    </div>
  );
}
