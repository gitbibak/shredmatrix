import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Copy, Download, QrCode, Send, X } from "lucide-react";
import QRCode from "qrcode";
import { coachApi, coachLink } from "../lib/coaching";
import { downloadCoachFlyer } from "../lib/coachFlyer";
import { button, field } from "./CoachProgram";

export default function CoachInviteDialog({
  invite: existing,
  name,
  c,
  lang,
  onCreated,
  onClose,
}) {
  const dialog = useRef(null);
  const [invite, setInvite] = useState(existing);
  const [months, setMonths] = useState(existing?.months ?? 6);
  const [stage, setStage] = useState(existing ? "share" : "period");
  const [qr, setQr] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [manualCopy, setManualCopy] = useState(false);
  const term = (n) => (n ? `${n} ${c("months")}` : c("unlimited"));
  const code = invite?.code;
  useEffect(() => {
    const node = dialog.current;
    node.showModal();
    return () => node.close();
  }, []);
  useEffect(() => {
    let live = true;
    if (code)
      QRCode.toDataURL(coachLink(code), {
        width: 600,
        margin: 3,
        errorCorrectionLevel: "M",
      })
        .then((data) => {
          if (live) setQr(data);
        })
        .catch(() => {
          if (live) setError(c("error"));
        });
    return () => {
      live = false;
    };
  }, [code, c]);
  const prepare = async (event) => {
    event.preventDefault();
    if (invite?.months === months) {
      setStage("share");
      return;
    }
    if (invite && !window.confirm(c("replaceInvite"))) return;
    setBusy(true);
    setError("");
    try {
      const created = await coachApi("invite", { months });
      setInvite(created);
      setStage("share");
      setNotice("");
      await onCreated();
    } catch {
      setError(c("error"));
    } finally {
      setBusy(false);
    }
  };
  const copy = async () => {
    setError("");
    try {
      await navigator.clipboard.writeText(coachLink(invite.code));
      setNotice(c("copied"));
    } catch {
      setManualCopy(true);
    }
  };
  const share = async () => {
    if (!navigator.share) {
      await copy();
      return;
    }
    setError("");
    try {
      await navigator.share({
        title: "Full Balance",
        text: `${name} · ${c("coachInvitation")}`,
        url: coachLink(invite.code),
      });
    } catch (err) {
      if (err.name !== "AbortError") setError(c("error"));
    }
  };
  return (
    <dialog
      ref={dialog}
      aria-labelledby="coach-invite-title"
      onClose={onClose}
      className="coach-invite-dialog m-auto w-[calc(100%-2rem)] max-w-md overflow-y-auto overscroll-contain rounded-lg border border-slate-600 bg-slate-950 p-5 text-white backdrop:bg-black/70"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 id="coach-invite-title" className="text-xl font-bold">
          {stage === "period"
            ? c("period")
            : stage === "qr"
              ? c("showQr")
              : c("sendInvite")}
        </h2>
        <button
          type="button"
          className={button}
          aria-label={c("close")}
          title={c("close")}
          onClick={() => dialog.current.close()}
        >
          <X size={18} />
        </button>
      </div>
      {error && (
        <p role="alert" className="mb-4 text-sm text-red-300">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mb-4 text-sm text-emerald-300">
          {notice}
        </p>
      )}
      {stage === "period" ? (
        <form className="space-y-5" onSubmit={prepare}>
          <label className="block text-sm">
            {c("period")}
            <select
              className={field + " mt-2"}
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
            >
              {[3, 6, 0].map((n) => (
                <option key={n} value={n}>
                  {term(n)}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className={button + " w-full bg-emerald-700"}
            disabled={busy}
          >
            {busy ? c("saving") : c("prepareInvite")}
          </button>
          {invite && (
            <button
              type="button"
              className={button + " w-full"}
              disabled={busy}
              onClick={() => setStage("share")}
            >
              {c("cancel")}
            </button>
          )}
        </form>
      ) : stage === "share" ? (
        <div className="space-y-4">
          <div className="border-b border-slate-700 pb-4">
            <p className="break-words text-lg font-bold">{name}</p>
            <p className="mt-1 text-sm text-slate-300">
              {c("period")}: {term(invite.months)}
            </p>
          </div>
          <button
            type="button"
            className={button + " w-full bg-emerald-700"}
            onClick={share}
          >
            <Send size={18} />
            {c("sendInvite")}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className={button} onClick={copy}>
              <Copy size={16} />
              {c("copy")}
            </button>
            <button
              type="button"
              className={button}
              onClick={() => {
                setNotice("");
                setStage("qr");
              }}
            >
              <QrCode size={18} />
              {c("showQr")}
            </button>
          </div>
          {manualCopy && (
            <input
              aria-label={c("code")}
              readOnly
              className={field}
              value={coachLink(invite.code)}
              onFocus={(e) => e.target.select()}
            />
          )}
          <details className="border-t border-slate-700 pt-3">
            <summary className="min-h-11 cursor-pointer py-3 text-sm text-slate-400">
              {c("inviteSettings")}
            </summary>
            <p className="mb-3 text-xs text-slate-400">
              {c("inviteExpiry")}:{" "}
              {new Date(invite.expires_at).toLocaleDateString(lang)}
            </p>
            <button
              type="button"
              className={button}
              onClick={() => {
                setNotice("");
                setStage("period");
              }}
            >
              {c("changePeriod")}
            </button>
          </details>
        </div>
      ) : (
        <div className="space-y-4 text-center">
          {qr ? (
            <img
              src={qr}
              width={240}
              height={240}
              alt={c("showQr")}
              className="mx-auto aspect-square w-full max-w-[240px] rounded-lg"
            />
          ) : (
            <p role="status">{c("loading")}</p>
          )}
          <p className="break-words font-bold">{name}</p>
          <p className="text-sm text-slate-300">{term(invite.months)}</p>
          <div className="flex flex-col gap-2">
            {qr && (
              <>
                <a
                  className={button}
                  href={qr}
                  download="full-balance-coach-qr.png"
                >
                  <Download size={16} />
                  {c("download")}
                </a>
                <button
                  type="button"
                  className={button}
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    setError("");
                    try {
                      await downloadCoachFlyer({
                        qr,
                        name,
                        period: term(invite.months),
                        expires: new Date(invite.expires_at).toLocaleDateString(
                          lang,
                        ),
                        c,
                      });
                    } catch {
                      setError(c("error"));
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  <Download size={16} />
                  {c("gymFlyer")}
                </button>
              </>
            )}
            <button
              type="button"
              className={button}
              onClick={() => setStage("share")}
            >
              <ArrowLeft size={16} />
              {c("back")}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
