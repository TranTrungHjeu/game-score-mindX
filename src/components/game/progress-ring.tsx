import { cn } from "@/lib/utils";

type ProgressRingProps = {
  progress: number;
  label: string;
  sublabel?: string;
  accent: string;
  size?: number;
  className?: string;
};

export function ProgressRing({
  progress,
  label,
  sublabel,
  accent,
  size = 112,
  className,
}: ProgressRingProps) {
  const safeProgress = Math.max(0, Math.min(progress, 1));

  return (
    <div
      className={cn("relative grid place-items-center rounded-full", className)}
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${accent} ${safeProgress * 360}deg, rgba(255,255,255,0.58) 0deg)`,
      }}
    >
      <div
        className="grid place-items-center rounded-full border-2 border-white/90 bg-white text-center text-slate-900 shadow-[inset_0_2px_8px_rgba(255,255,255,0.7)]"
        style={{ width: size - 18, height: size - 18 }}
      >
        <div className="font-heading text-lg leading-none">{label}</div>
        {sublabel ? <div className="mt-1 text-[0.72rem] font-bold text-slate-500">{sublabel}</div> : null}
      </div>
    </div>
  );
}
