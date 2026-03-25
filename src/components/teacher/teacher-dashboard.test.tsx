import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MASCOT_FAMILIES, STORAGE_KEY } from "@/lib/constants";
import { createSessionFromTeams } from "@/lib/game-logic";
import TeacherDashboard from "@/components/teacher/teacher-dashboard";
import { useClassroomStore } from "@/store/use-classroom-store";

describe("TeacherDashboard", () => {
  it("lets the teacher update score, toggle audio, and replay evolution", async () => {
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

    expect(await screen.findByText("Chấm điểm thật nhanh cho cả lớp")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Âm thanh: Tắt" }));
    expect(useClassroomStore.getState().audioEnabled).toBe(true);

    const teamSaoCard = screen.getByRole("heading", { name: "Team Sao" }).closest("article");
    expect(teamSaoCard).not.toBeNull();

    await user.click(within(teamSaoCard as HTMLElement).getByRole("button", { name: "+10 điểm" }));
    expect(useClassroomStore.getState().teams.find((team) => team.name === "Team Sao")?.score).toBe(10);
    expect(useClassroomStore.getState().overlayQueue).toHaveLength(1);

    await user.click(within(teamSaoCard as HTMLElement).getByRole("button", { name: "Xem lại tiến hóa" }));
    expect(useClassroomStore.getState().overlayQueue).toHaveLength(2);
  });
});
