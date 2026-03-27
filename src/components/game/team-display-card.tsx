"use client";

import { AnimatePresence, motion } from "framer-motion";

import { getProgressToNextLevel } from "@/lib/game-logic";
import { getEvolutionStageCount, resolveTeamVisual } from "@/lib/pokemon-helpers";
import type { Team } from "@/lib/types";
import { cn, formatPoints } from "@/lib/utils";

import { MascotAvatar } from "./mascot-avatar";
import { ProgressRing } from "./progress-ring";

type TeamDisplayCardProps = {
  team: Team;
  rank: number;
  isLeader: boolean;
  featured?: boolean;
  className?: string;
};

export function TeamDisplayCard({ team, rank, isLeader, featured = false, className }: TeamDisplayCardProps) {
  const stageCount = getEvolutionStageCount(team.mascot);
  const progress = getProgressToNextLevel(team.score, team.unlockedLevel, stageCount);
  const visual = resolveTeamVisual(team);
  const avatarSize = featured ? 268 : 238;
  const ringSize = featured ? 124 : 112;

  return (
    <motion.article
      layout
      transition={{ type: "spring", stiffness: 140, damping: 16 }}
      className={cn(
        "arena-panel relative flex min-h-[20rem] flex-col overflow-hidden rounded-none border-2 p-5 text-slate-900 shadow-[0_24px_50px_rgba(97,117,143,0.18)]",
        featured && "min-h-[22rem] p-6 sm:p-7",
        className,
      )}
      style={{
        borderColor: `${team.accentColor}2f`,
        background: featured
          ? `linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(249,252,255,0.98) 62%, ${team.accentColor}0f 100%)`
          : `linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,251,255,0.96) 72%, ${team.accentColor}0d 100%)`,
      }}
      animate={{
        scale: featured ? 1.02 : isLeader ? 1.01 : 0.98 + team.displayLevel * 0.02,
        y: featured ? -2 : isLeader ? -4 : 0,
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.6),transparent_44%)] opacity-80" />
      <div
        className="absolute right-[-2rem] top-[-1.5rem] h-28 w-28 rounded-full blur-3xl"
        style={{ background: `${team.accentColor}44` }}
      />
      <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: `linear-gradient(90deg, ${team.accentColor}, rgba(255,255,255,0.92))` }} />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex rounded-none border-2 border-white/85 bg-white/88 px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-slate-500 shadow-lg">
            Hạng {rank}
          </div>
          <h3 className={cn("mt-3 font-heading text-3xl leading-none text-slate-950 sm:text-4xl", featured && "sm:text-5xl")}>
            {team.name}
          </h3>
          <p className={cn("mt-2 text-sm text-slate-600", featured && "text-base")}>
            {visual.stage.name}
            {visual.isMega ? " · Mega" : ` · Dạng ${team.displayLevel}/${stageCount}`}
          </p>
        </div>
        <div className="rounded-none border-2 border-white/85 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-lg">
          {formatPoints(team.score)}
        </div>
      </div>

      <div className={cn("relative mt-6 flex flex-1 items-center justify-between gap-4", featured && "flex-col lg:flex-row lg:items-center")}>
        <div className={cn("relative flex flex-1 justify-center", featured && "w-full lg:justify-start")}>
          <MascotAvatar
            family={team.mascot}
            level={visual.isMega ? stageCount : team.displayLevel}
            stage={visual.stage}
            size={avatarSize}
            glow={isLeader || visual.isMega || team.displayLevel >= stageCount}
          />
          <AnimatePresence>
            {team.lastDelta !== 0 ? (
              <motion.div
                key={`${team.id}-${team.score}`}
                initial={{ opacity: 0, y: 12, scale: 0.7 }}
                animate={{ opacity: [0, 1, 0], y: [12, -18, -40], scale: [0.7, 1, 0.8] }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute right-6 top-8 rounded-none bg-white px-4 py-2 text-lg font-black text-slate-900 shadow-2xl"
              >
                {team.lastDelta > 0 ? `+${team.lastDelta}` : team.lastDelta}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className={cn("flex flex-col items-center gap-4", featured && "w-full lg:w-auto lg:items-end")}>
          <ProgressRing
            progress={progress}
            accent={team.accentColor}
            label={visual.isMega ? "Mega" : `Dạng ${team.unlockedLevel}`}
            sublabel={visual.isMega ? "Đang bùng nổ" : team.unlockedLevel >= stageCount ? "Đã tối đa" : "Sắp tiến hóa"}
            size={ringSize}
          />
          <div className={cn("flex flex-wrap justify-center gap-2", featured && "lg:justify-end")}>
            <div className="rounded-none border-2 border-white/90 bg-white/88 px-3 py-2 text-xs font-black text-slate-700 shadow-lg">
              {visual.stage.name}
            </div>
            <div className="rounded-none border-2 border-yellow-700/15 bg-yellow-50 px-3 py-2 text-xs font-black text-yellow-800">
              {visual.isMega ? "Đang mega" : team.unlockedLevel >= stageCount ? "Đã chạm dạng cuối" : `${Math.round(progress * 100)}% đến lần tiến hóa tiếp theo`}
            </div>
          </div>
          {isLeader ? (
            <div className="rounded-none border-2 border-yellow-700/20 bg-yellow-700 px-4 py-2 text-xs font-black text-white">
              Đang dẫn đầu
            </div>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}
