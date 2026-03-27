import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import TeacherDashboard from "@/components/teacher/teacher-dashboard";
import { MASCOT_FAMILIES, STORAGE_KEY } from "@/lib/constants";
import { createSessionFromTeams, finalizeDisplayedEvolution } from "@/lib/game-logic";
import { useClassroomStore } from "@/store/use-classroom-store";

vi.mock("@/components/game/evolution-overlay", () => ({
  EvolutionOverlay: () => null,
}));

describe("TeacherDashboard", () => {
  it("lets the teacher award mega questions, trigger mega evolution, replay the latest transform, and open the session summary", async () => {
    const session = createSessionFromTeams({
      teams: [
        { name: "Team Sao", mascot: MASCOT_FAMILIES[0]! },
        { name: "Team Bot", mascot: MASCOT_FAMILIES[1]! },
      ],
      questions: [
        { prompt: "Câu hỏi 1" },
        { prompt: "Câu hỏi 2" },
      ],
    });

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    useClassroomStore.setState({ ...session, isHydrated: true });

    const user = userEvent.setup();
    render(<TeacherDashboard />);

    expect(await screen.findByText("Bảng chấm điểm")).toBeInTheDocument();
    expect(screen.getByText("Bậc xếp hạng hiện tại")).toBeInTheDocument();

    expect(useClassroomStore.getState().audioEnabled).toBe(true);

    const teamSaoCard = screen.getByRole("heading", { name: "Team Sao" }).closest("article");
    expect(teamSaoCard).not.toBeNull();

    const questionCards = screen.getAllByText(/^Câu \d+$/).map((node) => node.closest("article")).filter(Boolean) as HTMLElement[];

    await user.click(within(questionCards[0]!).getByRole("button", { name: "Team Sao" }));
    expect(useClassroomStore.getState().questions[0]?.winnerTeamId).toBe(useClassroomStore.getState().teams[0]?.id);

    await user.click(screen.getByRole("button", { name: "Hoàn tác lượt vừa rồi" }));
    expect(useClassroomStore.getState().questions[0]?.winnerTeamId).toBeNull();

    await user.click(within(questionCards[0]!).getByRole("button", { name: "Team Sao" }));
    await user.click(within(questionCards[1]!).getByRole("button", { name: "Team Sao" }));

    await user.click(within(teamSaoCard as HTMLElement).getByRole("button", { name: "+5 điểm" }));
    await user.click(within(teamSaoCard as HTMLElement).getByRole("button", { name: "+5 điểm" }));
    await user.click(within(teamSaoCard as HTMLElement).getByRole("button", { name: "+5 điểm" }));
    await user.click(within(teamSaoCard as HTMLElement).getByRole("button", { name: "+5 điểm" }));
    expect(useClassroomStore.getState().teams.find((team) => team.name === "Team Sao")?.score).toBe(20);
    expect(useClassroomStore.getState().overlayQueue).toHaveLength(2);

    let currentState = useClassroomStore.getState();
    currentState = {
      ...currentState,
      ...finalizeDisplayedEvolution(currentState, currentState.overlayQueue[0]!.id),
    };
    currentState = {
      ...currentState,
      ...finalizeDisplayedEvolution(currentState, currentState.overlayQueue[0]!.id),
    };
    useClassroomStore.setState({ ...currentState, isHydrated: true });

    await user.click(await within(teamSaoCard as HTMLElement).findByRole("button", { name: "Tiến hóa mega" }));
    expect(useClassroomStore.getState().teams.find((team) => team.name === "Team Sao")?.megaActive).toBe(true);

    await user.click(within(teamSaoCard as HTMLElement).getByRole("button", { name: "Xem biến đổi gần nhất" }));
    expect(useClassroomStore.getState().overlayQueue.at(-1)?.kind).toBe("mega");

    await user.click(screen.getByRole("button", { name: "Kết thúc buổi học" }));
    expect(screen.getByText("Tổng kết buổi học")).toBeInTheDocument();
    expect(screen.getByText("Bục vinh danh")).toBeInTheDocument();
  });

  it("lets the teacher add, edit, award, and remove mega questions during class", async () => {
    const session = createSessionFromTeams({
      teams: [
        { name: "Team Sao", mascot: MASCOT_FAMILIES[0]! },
        { name: "Team Bot", mascot: MASCOT_FAMILIES[1]! },
      ],
    });

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    useClassroomStore.setState({ ...session, isHydrated: true });

    const user = userEvent.setup();
    render(<TeacherDashboard />);

    expect(screen.getByText(/Chưa có câu hỏi mega nào/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Thêm câu" }));

    const input = await screen.findByPlaceholderText("Nhập câu 1 khi đang dạy");
    const questionCard = screen.getByText("Câu 1").closest("article");
    expect(questionCard).not.toBeNull();

    const teamButton = within(questionCard as HTMLElement).getByRole("button", { name: "Team Sao" });
    expect(teamButton).toBeDisabled();

    await user.type(input, "Đội nào xong trước?");

    expect(useClassroomStore.getState().questions[0]?.prompt).toBe("Đội nào xong trước?");
    expect(teamButton).toBeEnabled();

    await user.click(teamButton);
    expect(useClassroomStore.getState().questions[0]?.winnerTeamId).toBe(useClassroomStore.getState().teams[0]?.id);

    await user.click(within(questionCard as HTMLElement).getByRole("button", { name: "Xóa câu" }));
    const removeDialog = screen.getByRole("dialog", { name: "Xóa Câu 1?" });
    expect(removeDialog).toBeInTheDocument();
    await user.click(within(removeDialog).getByRole("button", { name: "Xóa câu" }));
    expect(useClassroomStore.getState().questions).toHaveLength(0);
  });

  it("opens a themed confirmation modal before resetting the session", async () => {
    const session = createSessionFromTeams({
      teams: [
        { name: "Team Sao", mascot: MASCOT_FAMILIES[0]! },
        { name: "Team Bot", mascot: MASCOT_FAMILIES[1]! },
      ],
    });

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    useClassroomStore.setState({ ...session, isHydrated: true });

    const user = userEvent.setup();
    render(<TeacherDashboard />);

    await user.click(screen.getByRole("button", { name: "Đặt lại phiên học" }));
    const resetDialog = screen.getByRole("dialog", { name: "Đặt lại phiên học?" });
    expect(resetDialog).toBeInTheDocument();

    await user.click(within(resetDialog).getByRole("button", { name: "Quay lại" }));
    expect(useClassroomStore.getState().teams).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Đặt lại phiên học" }));
    await user.click(within(screen.getByRole("dialog", { name: "Đặt lại phiên học?" })).getByRole("button", { name: "Đặt lại" }));
    expect(useClassroomStore.getState().teams).toHaveLength(0);
  });
});
