import { expect, test } from "@playwright/test";

test("teacher and display stay in sync through a classroom scoring flow", async ({ browser }) => {
  const context = await browser.newContext();
  const teacherPage = await context.newPage();
  const displayPage = await context.newPage();

  await teacherPage.goto("/setup");
  await teacherPage.getByRole("button", { name: "2 doi" }).click();
  await teacherPage.locator("input").nth(0).fill("Team Sao");
  await teacherPage.locator("input").nth(1).fill("Team Bot");
  await teacherPage.getByRole("button", { name: "Bat dau tiet hoc" }).click();

  await expect(teacherPage.getByText("Bang dieu khien lop robotics")).toBeVisible();

  await displayPage.goto("/display");
  await expect(displayPage.getByRole("heading", { name: "Team Sao" })).toBeVisible();

  await teacherPage.getByRole("button", { name: "+10 diem" }).first().click();
  await expect(displayPage.getByText("10 điểm")).toBeVisible();
  await expect(displayPage.getByText("Power Up")).toBeVisible();

  await context.close();
});
