import {
  createSessionFromTeams,
  finalizeDisplayedEvolution,
  getLevelFromScore,
  normalizeClassroomState,
  updateTeamScoreInState,
} from "@/lib/game-logic";
import { MASCOT_FAMILIES } from "@/lib/constants";

describe("game logic", () => {
  it("maps score thresholds to the correct evolution levels", () => {
    expect(getLevelFromScore(0)).toBe(1);
    expect(getLevelFromScore(9)).toBe(1);
    expect(getLevelFromScore(10)).toBe(2);
    expect(getLevelFromScore(19)).toBe(2);
    expect(getLevelFromScore(20)).toBe(3);
    expect(getLevelFromScore(29)).toBe(3);
    expect(getLevelFromScore(30)).toBe(3);
  });

  it("clamps score at zero and never de-evolves after a penalty", () => {
    const base = createSessionFromTeams({
      teams: [
        { name: "Team Sao", mascot: MASCOT_FAMILIES[0]! },
        { name: "Team Bot", mascot: MASCOT_FAMILIES[1]! },
      ],
    });

    const afterGain = updateTeamScoreInState(base, base.teams[0]!.id, 20).nextState;
    const afterPenalty = updateTeamScoreInState(afterGain, afterGain.teams[0]!.id, -50).nextState;

    expect(afterPenalty.teams[0]?.score).toBe(0);
    expect(afterPenalty.teams[0]?.unlockedLevel).toBe(3);
    expect(afterPenalty.teams[0]?.displayLevel).toBe(1);
  });

  it("queues every evolution event when points are added quickly", () => {
    const base = createSessionFromTeams({
      teams: [
        { name: "Team Sao", mascot: MASCOT_FAMILIES[0]! },
        { name: "Team Bot", mascot: MASCOT_FAMILIES[1]! },
      ],
    });

    const afterFirst = updateTeamScoreInState(base, base.teams[0]!.id, 10).nextState;
    const afterSecond = updateTeamScoreInState(afterFirst, afterFirst.teams[0]!.id, 20).nextState;

    expect(afterSecond.overlayQueue).toHaveLength(2);
    expect(afterSecond.overlayQueue.map((item) => item.toLevel)).toEqual([2, 3]);

    const afterConsume = finalizeDisplayedEvolution(
      afterSecond,
      afterSecond.overlayQueue[0]!.id,
      afterSecond.teams[0]!.id,
      afterSecond.overlayQueue[0]!.toLevel,
    );

    expect(afterConsume.overlayQueue).toHaveLength(1);
    expect(afterConsume.teams[0]?.displayLevel).toBe(2);
  });

  it("normalizes old stored sessions that still have the legacy fourth level", () => {
    const session = createSessionFromTeams({
      teams: [
        { name: "Team Sao", mascot: MASCOT_FAMILIES[0]! },
        { name: "Team Bot", mascot: MASCOT_FAMILIES[1]! },
      ],
    });

    const normalized = normalizeClassroomState({
      ...session,
      teams: session.teams.map((team, index) =>
        index === 0
          ? {
              ...team,
              score: 40,
              unlockedLevel: 4,
              displayLevel: 4,
            }
          : team,
      ),
    });

    expect(normalized.teams[0]?.unlockedLevel).toBe(3);
    expect(normalized.teams[0]?.displayLevel).toBe(3);
    expect(normalized.teams[0]?.score).toBe(40);
  });
});
