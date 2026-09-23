import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CoachPage from "./CoachPage";
import { coachApi } from "../lib/coaching";

vi.mock("../lib/coaching", () => ({
  coachApi: vi.fn(),
  coachLink: (code) => "https://fullbalance.app/coach?invite=" + code,
}));
vi.mock("../i18n/LanguageContext", () => ({
  useTranslation: () => ({ lang: "en", setLang: vi.fn() }),
}));
vi.mock("./AuthScreen", () => ({ default: () => <p>Sign in</p> }));
vi.mock("qrcode", () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue("data:image/png;base64,AA=="),
  },
}));
const user = { id: "student", name: "Student" };
const connection = {
  id: "connection",
  coach_id: "coach",
  student_id: "student",
  name: "My trainer",
  status: "active",
  months: 6,
  share_metrics: false,
};
const program = {
  title: "My routine",
  days: [{ name: "Day A", exercises: [{ name: "Squat", sets: 1, reps: 8 }] }],
};
const mount = (person = user) =>
  render(
    <MemoryRouter>
      <CoachPage user={person} />
    </MemoryRouter>,
  );
beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  window.history.replaceState({}, "", "/coach");
  coachApi.mockResolvedValue({ coach: null, links: [] });
});
describe("coach workspace", () => {
  it("opens an incoming invitation directly without enabling sharing", async () => {
    const code = "b".repeat(32);
    window.history.replaceState({}, "", "/coach?invite=" + code);
    coachApi.mockImplementation(async (action) =>
      action === "preview"
        ? { name: "Incoming coach", months: 3 }
        : { coach: null, links: [] },
    );
    mount();
    expect(await screen.findByText("Incoming coach")).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "View coach" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Request connection" }),
    ).toBeDisabled();
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    fireEvent.click(screen.getByRole("button", { name: "Request connection" }));
    await waitFor(() =>
      expect(coachApi).toHaveBeenCalledWith("join", {
        code,
        consent: true,
        share_metrics: false,
      }),
    );
  });
  it("preserves the invite through sign-in and does not fetch private data anonymously", () => {
    window.history.replaceState({}, "", "/coach?invite=" + "a".repeat(32));
    mount(null);
    expect(screen.getByText("Sign in")).toBeInTheDocument();
    expect(sessionStorage.getItem("fb_coach_return")).toBe(
      "/coach?invite=" + "a".repeat(32),
    );
    expect(coachApi).not.toHaveBeenCalled();
  });
  it("requires explicit sharing consent and defaults optional metrics off", async () => {
    coachApi.mockImplementation(async (action) =>
      action === "preview"
        ? { name: "Test coach", months: 6 }
        : { coach: null, links: [] },
    );
    mount();
    fireEvent.click(
      await screen.findByRole("button", { name: "Enter invite link" }),
    );
    fireEvent.change(await screen.findByLabelText("Invite code or link"), {
      target: { value: "a".repeat(32) },
    });
    fireEvent.click(screen.getByRole("button", { name: "View coach" }));
    const join = await screen.findByRole("button", {
      name: "Request connection",
    });
    expect(join).toBeDisabled();
    const boxes = screen.getAllByRole("checkbox");
    expect(boxes[0]).not.toBeChecked();
    expect(boxes[1]).not.toBeChecked();
    fireEvent.click(boxes[0]);
    fireEvent.click(join);
    await waitFor(() =>
      expect(coachApi).toHaveBeenCalledWith("join", {
        code: "a".repeat(32),
        consent: true,
        share_metrics: false,
      }),
    );
  });
  it("does not request data for pending connections", async () => {
    coachApi.mockResolvedValue({
      coach: null,
      links: [{ ...connection, status: "pending" }],
    });
    mount();
    fireEvent.click(await screen.findByRole("button", { name: /My trainer/ }));
    expect(coachApi.mock.calls.some(([action]) => action === "details")).toBe(
      false,
    );
    expect(
      screen.queryByRole("tab", { name: "Program" }),
    ).not.toBeInTheDocument();
  });
  it("opens the assigned program and collects actual sets instead of assuming completion", async () => {
    coachApi.mockImplementation(async (action) =>
      action === "details"
        ? {
            assignment: { id: "p1", program },
            sessions: [],
            weights: [],
            measurements: [],
          }
        : { coach: null, links: [connection] },
    );
    mount();
    fireEvent.click(await screen.findByRole("button", { name: /My trainer/ }));
    fireEvent.click(
      await screen.findByRole("button", { name: "Open workout" }),
    );
    expect(screen.getByLabelText("Weight (kg)").value).toBe("");
    expect(screen.getByLabelText("Reps").value).toBe("");
    fireEvent.change(screen.getByLabelText("Weight (kg)"), {
      target: { value: "20" },
    });
    fireEvent.change(screen.getByLabelText("Reps"), { target: { value: "8" } });
    fireEvent.click(screen.getByRole("button", { name: "Save workout" }));
    await waitFor(() =>
      expect(coachApi).toHaveBeenCalledWith(
        "session",
        expect.objectContaining({
          link_id: "connection",
          program_id: "p1",
          day_index: 0,
          exercises: [{ name: "Squat", sets: [{ weight: "20", reps: "8" }] }],
        }),
      ),
    );
  });
  it("keeps failed submissions visible for retry", async () => {
    coachApi.mockRejectedValue(new Error("offline"));
    mount();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not complete",
    );
    expect(screen.getByRole("button", { name: "Retry" })).toBeEnabled();
  });
  it("does not create a PT account without the explicit enable action", async () => {
    mount();
    fireEvent.click(screen.getByRole("tab", { name: "Coach (PT)" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "Enable coach account" }),
    );
    await waitFor(() =>
      expect(coachApi).toHaveBeenCalledWith("enable", { name: "Student" }),
    );
  });
});
