import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import CoachInviteDialog from "./CoachInviteDialog";
import { coachText } from "../data/coachCopy";
import { coachApi } from "../lib/coaching";
vi.mock("../lib/coaching", () => ({
  coachApi: vi.fn(),
  coachLink: (code) => "https://fullbalance.app/coach?invite=" + code,
}));
vi.mock("qrcode", () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue("data:image/png;base64,AA=="),
  },
}));
const invite = { code: "a".repeat(32), months: 6, expires_at: "2027-09-22" };
const onCreated = vi.fn();
function mount(lang = "en", existing = invite) {
  const c = coachText(lang);
  render(
    <CoachInviteDialog
      invite={existing}
      name="Demo Coach"
      c={c}
      lang={lang}
      onCreated={onCreated}
      onClose={vi.fn()}
    />,
  );
  return c;
}
beforeEach(() => {
  vi.clearAllMocks();
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: vi.fn().mockResolvedValue() },
  });
  Object.defineProperty(navigator, "share", {
    configurable: true,
    value: undefined,
  });
});
it.each(["tr", "en", "es"])(
  "keeps an existing invitation compact and reusable in %s",
  async (lang) => {
    const c = mount(lang);
    expect(screen.getByRole("dialog")).toBeVisible();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: c("sendInvite") }));
    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining(invite.code),
      ),
    );
    expect(coachApi).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: c("showQr") }));
    expect(
      await screen.findByRole("img", { name: c("showQr") }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: c("gymFlyer") })).toBeVisible();
  },
);
it("creates an invitation only after choosing a period and submitting", async () => {
  coachApi.mockResolvedValue({ ...invite, months: 3 });
  const c = mount("en", null);
  expect(coachApi).not.toHaveBeenCalled();
  fireEvent.change(screen.getByRole("combobox", { name: c("period") }), {
    target: { value: "3" },
  });
  fireEvent.click(screen.getByRole("button", { name: c("prepareInvite") }));
  await waitFor(() =>
    expect(coachApi).toHaveBeenCalledWith("invite", { months: 3 }),
  );
  expect(
    await screen.findByRole("button", { name: c("sendInvite") }),
  ).toBeEnabled();
});
it("does not replace the printed QR without confirmation", async () => {
  vi.spyOn(window, "confirm").mockReturnValue(false);
  const c = mount();
  fireEvent.click(screen.getByText(c("inviteSettings")));
  fireEvent.click(screen.getByRole("button", { name: c("changePeriod") }));
  fireEvent.change(screen.getByRole("combobox", { name: c("period") }), {
    target: { value: "3" },
  });
  fireEvent.click(screen.getByRole("button", { name: c("prepareInvite") }));
  expect(window.confirm).toHaveBeenCalled();
  expect(coachApi).not.toHaveBeenCalled();
});
it("treats a dismissed native share sheet as cancellation", async () => {
  Object.defineProperty(navigator, "share", {
    configurable: true,
    value: vi
      .fn()
      .mockRejectedValue(new DOMException("Cancelled", "AbortError")),
  });
  const c = mount();
  fireEvent.click(screen.getByRole("button", { name: c("sendInvite") }));
  await waitFor(() => expect(navigator.share).toHaveBeenCalled());
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});
