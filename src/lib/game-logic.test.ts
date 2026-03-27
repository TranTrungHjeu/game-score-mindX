import {
  addQuestionInState,
  createSessionFromTeams,
  finalizeDisplayedEvolution,
  getLevelFromScore,
  normalizeClassroomState,
  removeQuestionInState,
  updateQuestionPromptInState,
  setQuestionWinnerInState,
  triggerMegaEvolutionInState,
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

  it("queues a sad devolution when a penalty crosses an evolution threshold", () => {
    const base = createSessionFromTeams({
      teams: [
        { name: "Team Sao", mascot: MASCOT_FAMILIES[0]! },
        { name: "Team Bot", mascot: MASCOT_FAMILIES[1]! },
      ],
    });

    const afterGain = updateTeamScoreInState(base, base.teams[0]!.id, 20).nextState;
    const afterFirstReveal = finalizeDisplayedEvolution(afterGain, afterGain.overlayQueue[0]!.id);
    const afterSecondReveal = finalizeDisplayedEvolution(afterFirstReveal, afterFirstReveal.overlayQueue[0]!.id);
    const afterPenalty = updateTeamScoreInState(afterSecondReveal, afterSecondReveal.teams[0]!.id, -20).nextState;
    const devolution = afterPenalty.overlayQueue.at(-1);

    expect(afterPenalty.teams[0]?.score).toBe(0);
    expect(afterPenalty.teams[0]?.unlockedLevel).toBe(1);
    expect(devolution?.kind).toBe("devolution");
    expect(devolution?.fromStage.name).toBe("Venusaur");
    expect(devolution?.toStage.name).toBe("Bulbasaur");
  });

  it("does not queue a devolution when score stays in the same threshold", () => {
    const base = createSessionFromTeams({
      teams: [
        { name: "Team Sao", mascot: MASCOT_FAMILIES[0]! },
        { name: "Team Bot", mascot: MASCOT_FAMILIES[1]! },
      ],
    });

    const afterGain = updateTeamScoreInState(base, base.teams[0]!.id, 12).nextState;
    const afterReveal = finalizeDisplayedEvolution(afterGain, afterGain.overlayQueue[0]!.id);
    const afterPenalty = updateTeamScoreInState(afterReveal, afterReveal.teams[0]!.id, -1).nextState;

    expect(afterPenalty.teams[0]?.score).toBe(11);
    expect(afterPenalty.teams[0]?.unlockedLevel).toBe(2);
    expect(afterPenalty.overlayQueue).toHaveLength(0);
  });

  it("unlocks mega after winning just one question, keeps mega above 20 points, and removes it below 20", () => {
    const base = createSessionFromTeams({
      teams: [
        { name: "Team Sao", mascot: MASCOT_FAMILIES[0]! },
        { name: "Team Bot", mascot: MASCOT_FAMILIES[1]! },
      ],
      questions: [
        { prompt: "Câu hỏi 1" },
        { prompt: "Câu hỏi 2" },
      ],
    });

    const afterOneWin = setQuestionWinnerInState(base, base.questions[0]!.id, base.teams[0]!.id);
    const noMegaYet = triggerMegaEvolutionInState(afterOneWin, afterOneWin.teams[0]!.id);
    expect(noMegaYet.overlay).toBeNull();

    const afterGain = updateTeamScoreInState(afterOneWin, afterOneWin.teams[0]!.id, 25).nextState;
    const afterFirstReveal = finalizeDisplayedEvolution(afterGain, afterGain.overlayQueue[0]!.id);
    const afterSecondReveal = finalizeDisplayedEvolution(afterFirstReveal, afterFirstReveal.overlayQueue[0]!.id);
    const megaTriggered = triggerMegaEvolutionInState(afterSecondReveal, afterSecondReveal.teams[0]!.id);

    expect(megaTriggered.overlay?.kind).toBe("mega");
    expect(megaTriggered.nextState.teams[0]?.megaActive).toBe(true);

    const afterSmallPenalty = updateTeamScoreInState(megaTriggered.nextState, megaTriggered.nextState.teams[0]!.id, -2).nextState;
    expect(afterSmallPenalty.teams[0]?.megaActive).toBe(true);
    expect(afterSmallPenalty.overlayQueue.at(-1)?.kind).toBe("mega");

    const afterBigPenalty = updateTeamScoreInState(afterSmallPenalty, afterSmallPenalty.teams[0]!.id, -5).nextState;
    const devolution = afterBigPenalty.overlayQueue.at(-1);

    expect(afterBigPenalty.teams[0]?.score).toBe(18);
    expect(afterBigPenalty.teams[0]?.megaActive).toBe(false);
    expect(devolution?.kind).toBe("devolution");
    expect(devolution?.fromStage.name).toBe("Mega Venusaur");
    expect(devolution?.toStage.name).toBe("Ivysaur");
  });

  it("lets different teams each earn a mega chance from different questions", () => {
    const base = createSessionFromTeams({
      teams: [
        { name: "Team Sao", mascot: MASCOT_FAMILIES[0]! },
        { name: "Team Bot", mascot: MASCOT_FAMILIES[1]! },
        { name: "Team Chớp", mascot: MASCOT_FAMILIES[2]! },
      ],
      questions: [
        { prompt: "Câu hỏi 1" },
        { prompt: "Câu hỏi 2" },
        { prompt: "Câu hỏi 3" },
      ],
    });

    const afterFirst = setQuestionWinnerInState(base, base.questions[0]!.id, base.teams[0]!.id);
    const afterSecond = setQuestionWinnerInState(afterFirst, afterFirst.questions[1]!.id, afterFirst.teams[1]!.id);
    const afterThird = setQuestionWinnerInState(afterSecond, afterSecond.questions[2]!.id, afterSecond.teams[2]!.id);

    expect(triggerMegaEvolutionInState(updateTeamScoreInState(afterThird, afterThird.teams[0]!.id, 25).nextState, afterThird.teams[0]!.id).overlay).not.toBeNull();
    expect(triggerMegaEvolutionInState(updateTeamScoreInState(afterThird, afterThird.teams[1]!.id, 25).nextState, afterThird.teams[1]!.id).overlay).not.toBeNull();
    expect(triggerMegaEvolutionInState(updateTeamScoreInState(afterThird, afterThird.teams[2]!.id, 25).nextState, afterThird.teams[2]!.id).overlay).not.toBeNull();
  });

  it("keeps blank mega question slots so the teacher can fill them later", () => {
    const base = createSessionFromTeams({
      teams: [
        { name: "Team Sao", mascot: MASCOT_FAMILIES[0]! },
        { name: "Team Bot", mascot: MASCOT_FAMILIES[1]! },
      ],
      questions: [{ prompt: "" }],
    });

    expect(base.questions).toHaveLength(1);
    expect(base.questions[0]?.prompt).toBe("");

    const afterBlockedAward = setQuestionWinnerInState(base, base.questions[0]!.id, base.teams[0]!.id);
    expect(afterBlockedAward.questions[0]?.winnerTeamId).toBeNull();

    const afterTyping = updateQuestionPromptInState(base, base.questions[0]!.id, "Câu hỏi thêm trong lúc dạy");
    const afterAward = setQuestionWinnerInState(afterTyping, afterTyping.questions[0]!.id, afterTyping.teams[0]!.id);

    expect(afterAward.questions[0]?.prompt).toBe("Câu hỏi thêm trong lúc dạy");
    expect(afterAward.questions[0]?.winnerTeamId).toBe(afterAward.teams[0]!.id);
  });

  it("lets the teacher add and remove mega questions during class", () => {
    const base = createSessionFromTeams({
      teams: [
        { name: "Team Sao", mascot: MASCOT_FAMILIES[0]! },
        { name: "Team Bot", mascot: MASCOT_FAMILIES[1]! },
      ],
    });

    const afterAdd = addQuestionInState(base);
    expect(afterAdd.questions).toHaveLength(1);
    expect(afterAdd.questions[0]?.prompt).toBe("");

    const afterRemove = removeQuestionInState(afterAdd, afterAdd.questions[0]!.id);
    expect(afterRemove.questions).toHaveLength(0);
  });

  it("does not drop an already mega-evolved team when the teacher adds a new mega question", () => {
    const base = createSessionFromTeams({
      teams: [
        { name: "Team Sao", mascot: MASCOT_FAMILIES[0]! },
        { name: "Team Bot", mascot: MASCOT_FAMILIES[1]! },
      ],
      questions: [
        { prompt: "Câu hỏi 1" },
        { prompt: "Câu hỏi 2" },
      ],
    });

    const afterOneWin = setQuestionWinnerInState(base, base.questions[0]!.id, base.teams[0]!.id);
    const afterAllWins = setQuestionWinnerInState(afterOneWin, afterOneWin.questions[1]!.id, afterOneWin.teams[0]!.id);
    const afterGain = updateTeamScoreInState(afterAllWins, afterAllWins.teams[0]!.id, 25).nextState;
    const afterFirstReveal = finalizeDisplayedEvolution(afterGain, afterGain.overlayQueue[0]!.id);
    const afterSecondReveal = finalizeDisplayedEvolution(afterFirstReveal, afterFirstReveal.overlayQueue[0]!.id);
    const megaTriggered = triggerMegaEvolutionInState(afterSecondReveal, afterSecondReveal.teams[0]!.id);

    expect(megaTriggered.nextState.teams[0]?.megaActive).toBe(true);

    const afterAddQuestion = addQuestionInState(megaTriggered.nextState);

    expect(afterAddQuestion.questions).toHaveLength(3);
    expect(afterAddQuestion.teams[0]?.megaActive).toBe(true);
  });

  it("drops mega and queues a devolution when deleting the last question that gave the team a Mega Stone", () => {
    const base = createSessionFromTeams({
      teams: [
        { name: "Team Sao", mascot: MASCOT_FAMILIES[0]! },
        { name: "Team Bot", mascot: MASCOT_FAMILIES[1]! },
      ],
      questions: [{ prompt: "Câu hỏi 1" }],
    });

    const afterWin = setQuestionWinnerInState(base, base.questions[0]!.id, base.teams[0]!.id);
    const afterGain = updateTeamScoreInState(afterWin, afterWin.teams[0]!.id, 25).nextState;
    const afterFirstReveal = finalizeDisplayedEvolution(afterGain, afterGain.overlayQueue[0]!.id);
    const afterSecondReveal = finalizeDisplayedEvolution(afterFirstReveal, afterFirstReveal.overlayQueue[0]!.id);
    const megaTriggered = triggerMegaEvolutionInState(afterSecondReveal, afterSecondReveal.teams[0]!.id);

    expect(megaTriggered.nextState.teams[0]?.megaActive).toBe(true);

    const afterDelete = removeQuestionInState(megaTriggered.nextState, megaTriggered.nextState.questions[0]!.id);
    const devolution = afterDelete.overlayQueue.at(-1);

    expect(afterDelete.questions).toHaveLength(0);
    expect(afterDelete.teams[0]?.megaActive).toBe(false);
    expect(devolution?.kind).toBe("devolution");
    expect(devolution?.fromStage.name).toBe("Mega Venusaur");
    expect(devolution?.toStage.name).toBe("Venusaur");
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

  it("keeps blank mega questions when hydrating saved state", () => {
    const session = createSessionFromTeams({
      teams: [
        { name: "Team Sao", mascot: MASCOT_FAMILIES[0]! },
        { name: "Team Bot", mascot: MASCOT_FAMILIES[1]! },
      ],
      questions: [{ prompt: "" }],
    });

    const normalized = normalizeClassroomState(session);

    expect(normalized.questions).toHaveLength(1);
    expect(normalized.questions[0]?.prompt).toBe("");
  });
});
