import { expect, test } from "@playwright/test";

test("teacher runs the classroom scoring flow in a single screen", async ({ browser }) => {
  const context = await browser.newContext();
  const teacherPage = await context.newPage();

  await teacherPage.goto("/setup");
  await teacherPage.getByRole("button", { name: "2 đội" }).click();
  await teacherPage.locator("input").nth(0).fill("Team Sao");
  await teacherPage.locator("input").nth(1).fill("Team Bot");
  await teacherPage.getByRole("button", { name: "Bắt đầu tiết học" }).click();

  await expect(teacherPage.getByText("Bảng chấm điểm")).toBeVisible();
  await expect(teacherPage.getByRole("heading", { name: "Team Sao" })).toBeVisible();

  await teacherPage.getByRole("button", { name: "+5 điểm" }).first().click();
  await teacherPage.getByRole("button", { name: "+5 điểm" }).first().click();
  await expect(teacherPage.getByText("10 điểm")).toBeVisible();

  await context.close();
});
