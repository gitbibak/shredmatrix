import { beforeEach, expect, it, vi } from "vitest";
import {
  coachApi,
  coachLink,
  takeCoachReturn,
  validateProgram,
} from "./coaching";
const rpc = vi.hoisted(() => vi.fn());
vi.mock("./supabase", () => ({ supabase: { rpc } }));
beforeEach(() => {
  rpc.mockReset();
  sessionStorage.clear();
});
it("rejects external and malformed auth return paths", () => {
  for (const path of [
    "https://evil.test",
    "//evil.test",
    "/coach?invite=bad",
    "/dashboard",
  ]) {
    sessionStorage.setItem("fb_coach_return", path);
    expect(takeCoachReturn("/auth")).toBeNull();
  }
  sessionStorage.setItem("fb_coach_return", "/coach?invite=" + "a".repeat(32));
  expect(takeCoachReturn("/coach")).toBeNull();
  expect(takeCoachReturn("/auth")).toBe("/coach?invite=" + "a".repeat(32));
  expect(takeCoachReturn("/auth")).toBeNull();
});
it("never treats a failed remote write as a local success", async () => {
  rpc.mockResolvedValue({ error: new Error("offline") });
  await expect(coachApi("join")).rejects.toThrow("offline");
});
it("validates bounded structured programs", () => {
  expect(
    validateProgram({
      title: "Test",
      days: [{ name: "A", exercises: [{ name: "Squat", sets: 3, reps: 8 }] }],
    }),
  ).toBeTruthy();
  expect(validateProgram({ title: "Test", days: [] })).toBeFalsy();
  expect(
    validateProgram({
      title: "Test",
      days: [{ name: "A", exercises: [{ name: "Squat", sets: 3.2, reps: 8 }] }],
    }),
  ).toBeFalsy();
});
it("builds local invites without sending codes to a QR service", () => {
  expect(coachLink("a".repeat(32), "https://fullbalance.app")).toBe(
    "https://fullbalance.app/coach?invite=" + "a".repeat(32),
  );
});
