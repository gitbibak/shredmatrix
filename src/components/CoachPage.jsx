import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CoachInviteDialog from "./CoachInviteDialog";
import {
  ArrowLeft,
  Users,
  UserRound,
  Plus,
  RefreshCw,
  ChevronRight,
  Check,
  X,
  Pencil,
} from "lucide-react";
import { useTranslation } from "../i18n/LanguageContext";
import { coachText } from "../data/coachCopy";
import { coachApi } from "../lib/coaching";
import AuthScreen from "./AuthScreen";
import { ProgramEditor, SessionForm, button, field } from "./CoachProgram";

function errorText(error, c) {
  if (error?.code === "PGRST202" || error?.code === "42883")
    return c("unavailable");
  if (error?.code === "23505") return c("exists");
  if (error?.message?.includes("INVALID_INVITE")) return c("invalid");
  if (error?.message?.includes("PROGRAM_CHANGED")) return c("changed");
  if (error?.code === "42501") return c("noAccess");
  return c("error");
}

function CoachAuth({ onAuth }) {
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("invite");
    const path =
      "/coach" + (code && /^[a-f0-9]{32}$/.test(code) ? "?invite=" + code : "");
    try {
      sessionStorage.setItem("fb_coach_return", path);
    } catch {
      /* Direct sign-in still works. */
    }
  }, []);
  return (
    <AuthScreen
      onAuth={onAuth}
      onBack={() => {
        window.location.href = "/";
      }}
    />
  );
}

export default function CoachPage({ user, onAuth }) {
  useEffect(() => {
    const existing = document.querySelector('meta[name="robots"]');
    const meta = existing || document.createElement("meta");
    const previous = meta.getAttribute("content");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    if (!existing) document.head.appendChild(meta);
    return () => {
      if (!existing) meta.remove();
      else if (previous === null) meta.removeAttribute("content");
      else meta.content = previous;
    };
  }, []);
  return user?.id ? (
    <Workspace key={user.id} user={user} />
  ) : (
    <CoachAuth onAuth={onAuth} />
  );
}

function Workspace({ user }) {
  const { lang, setLang } = useTranslation();
  const c = useMemo(() => coachText(lang), [lang]);
  const [workspace, setWorkspace] = useState(null);
  const [mode, setMode] = useState("mine");
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState(null);
  const [tab, setTab] = useState("program");
  const [edit, setEdit] = useState(false);
  const [sessionDay, setSessionDay] = useState(null);
  const [sessionAssignment, setSessionAssignment] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [code, setCode] = useState(
    () => new URLSearchParams(window.location.search).get("invite") || "",
  );
  const [incomingCode] = useState(
    () => new URLSearchParams(window.location.search).get("invite") || "",
  );
  const [manualInvite, setManualInvite] = useState(Boolean(code));
  const [preview, setPreview] = useState(null);
  const [consent, setConsent] = useState(false);
  const [metrics, setMetrics] = useState(false);
  const [name, setName] = useState(user.name || "");
  const [invite, setInvite] = useState(null);
  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [version, setVersion] = useState(0);
  const reload = useCallback(async () => {
    const data = await coachApi("workspace");
    setWorkspace(data);
    setInvite(data.invite || null);
    setVersion((n) => n + 1);
  }, []);
  const connections = workspace?.links || [];
  const selectedLink = connections.find((item) => item.id === selected);
  const linkId = selectedLink?.id;
  const active = selectedLink?.status === "active";
  const isCoach = selectedLink?.coach_id === user.id;
  const date = (value) =>
    value ? new Date(value).toLocaleDateString(lang) : "—";
  const term = (value) => (value ? `${value} ${c("months")}` : c("unlimited"));
  useEffect(() => {
    if (
      workspace?.coach?.name &&
      !new URLSearchParams(window.location.search).has("invite")
    )
      setMode("students");
  }, [workspace?.coach?.name]);

  useEffect(() => {
    let live = true;
    const fetch = async () => {
      try {
        const data = await coachApi("workspace");
        if (live) {
          setWorkspace(data);
          setInvite(data.invite || null);
          setVersion((n) => n + 1);
        }
      } catch (err) {
        if (live) {
          setWorkspace(null);
          setDetails(null);
          setError(errorText(err, c));
        }
      }
    };
    fetch();
    const timer = setInterval(fetch, 30000);
    window.addEventListener("focus", fetch);
    return () => {
      live = false;
      clearInterval(timer);
      window.removeEventListener("focus", fetch);
    };
  }, [c]);
  useEffect(() => {
    let live = true;
    if (!linkId || !active) setDetails(null);
    if (linkId && active)
      coachApi("details", { link_id: linkId })
        .then((data) => {
          if (live) setDetails(data);
        })
        .catch((err) => {
          if (live) {
            setDetails(null);
            setError(errorText(err, c));
          }
        });
    return () => {
      live = false;
    };
  }, [linkId, active, version, c]);
  useEffect(() => {
    if (
      !incomingCode ||
      code !== incomingCode ||
      !/^[a-f0-9]{32}$/.test(incomingCode)
    )
      return;
    let live = true;
    coachApi("preview", { code: incomingCode })
      .then((data) => {
        if (live) setPreview({ ...data, code: incomingCode });
      })
      .catch((err) => {
        if (live) setError(errorText(err, c));
      });
    return () => {
      live = false;
    };
  }, [incomingCode, code, c]);
  useEffect(() => {
    const previous = document.title;
    document.title = c("title") + " | Full Balance";
    return () => {
      document.title = previous;
    };
  }, [c]);

  const run = async (work, message = "success") => {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await work();
      await reload();
      if (message) setNotice(c(message));
    } catch (err) {
      setError(errorText(err, c));
    } finally {
      setBusy(false);
    }
  };
  const inspect = () =>
    run(async () => {
      let token = code.trim();
      try {
        if (token.startsWith("https://") || token.startsWith("http://"))
          token = new URL(token).searchParams.get("invite") || "";
      } catch {
        token = "";
      }
      if (!/^[a-f0-9]{32}$/.test(token)) {
        setPreview(null);
        throw new Error("INVALID_INVITE");
      }
      setCode(token);
      setPreview({
        ...(await coachApi("preview", { code: token })),
        code: token,
      });
      setConsent(false);
      setMetrics(false);
    }, "");
  const open = (id) => {
    setDetails(null);
    setSelected(id);
    setTab("program");
    setEdit(false);
    setSessionDay(null);
    setError("");
    setNotice("");
  };
  const closeConnection = () => {
    if (window.confirm(c("confirm")))
      run(async () => {
        await coachApi("disconnect", { link_id: selected });
        setSelected(null);
      });
  };
  const filtered = connections
    .filter((item) =>
      mode === "students"
        ? item.coach_id === user.id
        : item.student_id === user.id,
    )
    .filter((item) =>
      item.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
    );

  return (
    <main className="coach-shell min-h-screen bg-slate-950 text-slate-100">
      <header className="coach-header border-b border-slate-700">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-4">
          <Link
            to="/dashboard"
            title={c("backApp")}
            aria-label={c("backApp")}
            className={button}
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">{c("backApp")}</span>
          </Link>
          <span className="font-outfit text-sm font-bold">Full Balance</span>
          <select
            aria-label={c("language")}
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="min-h-11 w-14 shrink-0 rounded-lg border border-slate-600 bg-slate-950 px-1 text-sm text-white"
          >
            {["tr", "en", "es"].map((value) => (
              <option key={value} value={value}>
                {value.toUpperCase()}
              </option>
            ))}
          </select>
          <button
            title={c("retry")}
            aria-label={c("retry")}
            className={button}
            onClick={() => run(reload, "")}
            disabled={busy}
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <h1 className="mb-5 font-outfit text-2xl font-bold">{c(mode)}</h1>
        {showInvite && workspace?.coach && (
          <CoachInviteDialog
            invite={invite}
            name={workspace.coach.name}
            lang={lang}
            c={c}
            onCreated={reload}
            onClose={() => setShowInvite(false)}
          />
        )}
        <div
          className="mb-5 flex border-b border-slate-700"
          role="tablist"
          aria-label={c("title")}
        >
          {["mine", "students"].map((value) => (
            <button
              key={value}
              role="tab"
              aria-selected={mode === value}
              className={
                "flex min-h-12 flex-1 items-center justify-center gap-2 border-b-2 px-2 text-sm font-bold " +
                (mode === value
                  ? "border-cyan-400 text-cyan-300"
                  : "border-transparent text-slate-400")
              }
              onClick={() => {
                setMode(value);
                setSelected(null);
                setSearch("");
                setError("");
              }}
            >
              {value === "mine" ? <UserRound size={18} /> : <Users size={18} />}
              {c(value === "mine" ? "studentRole" : "coachRole")}
            </button>
          ))}
        </div>
        {error && (
          <p
            role="alert"
            className="mb-4 border-l-2 border-red-400 px-3 py-2 text-sm text-red-300"
          >
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="mb-4 text-sm text-emerald-300">
            {notice}
          </p>
        )}
        {!workspace && !error && <p role="status">{c("loading")}</p>}
        {workspace && !selectedLink && (
          <>
            {mode === "students" && !workspace.coach && (
              <form
                className="max-w-lg space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  run(() => coachApi("enable", { name }));
                }}
              >
                <label className="block text-sm">
                  {c("name")}
                  <input
                    required
                    maxLength={80}
                    className={field + " mt-2"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <button
                  className={button + " bg-emerald-700"}
                  disabled={busy || !name.trim()}
                >
                  {c("enable")}
                </button>
              </form>
            )}
            {mode === "students" && workspace.coach && (
              <section className="mb-5">
                <button
                  className={button + " bg-emerald-700"}
                  aria-haspopup="dialog"
                  onClick={() => setShowInvite(true)}
                >
                  <Plus size={18} />
                  {c("invite")}
                </button>
              </section>
            )}
            {mode === "mine" && !filtered.length && (
              <section className="mb-6 max-w-xl space-y-4">
                {!manualInvite && !preview && (
                  <>
                    <p className="py-3 text-sm text-slate-300">
                      {c("waitingInvite")}
                    </p>
                    <button
                      className={button}
                      onClick={() => setManualInvite(true)}
                    >
                      {c("enterInvite")}
                    </button>
                  </>
                )}
                {manualInvite && !preview && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      inspect();
                    }}
                    className="space-y-3"
                  >
                    <label className="block text-sm">
                      {c("code")}
                      <input
                        className={field + " mt-2"}
                        required
                        maxLength={300}
                        value={code}
                        onChange={(e) => {
                          setCode(e.target.value);
                          setPreview(null);
                          setConsent(false);
                        }}
                      />
                    </label>
                    <button className={button} disabled={busy}>
                      {c("preview")}
                    </button>
                  </form>
                )}
                {preview && (
                  <div className="space-y-4 border-y border-slate-700 py-4">
                    <h2 className="text-xl font-bold">{preview.name}</h2>
                    <p className="text-sm">
                      {c("period")}: {term(preview.months)}
                    </p>
                    <p className="text-xs text-slate-400">{c("qualified")}</p>
                    <label className="flex items-start gap-3 text-sm leading-6">
                      <input
                        type="checkbox"
                        className="mt-1 h-5 w-5 shrink-0"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                      />
                      {c("consent")}
                    </label>
                    <label className="flex items-start gap-3 text-sm leading-6">
                      <input
                        type="checkbox"
                        className="mt-1 h-5 w-5 shrink-0"
                        checked={metrics}
                        onChange={(e) => setMetrics(e.target.checked)}
                      />
                      {c("metrics")}
                    </label>
                    <p className="text-xs leading-5 text-slate-400">
                      {c("consentScope")} {c("noAutomatic")}{" "}
                      <Link className="underline" to="/privacy">
                        {c("privacy")}
                      </Link>
                    </p>
                    <button
                      className={button + " bg-emerald-700"}
                      disabled={busy || !consent}
                      onClick={() =>
                        run(async () => {
                          await coachApi("join", {
                            code: preview.code,
                            consent,
                            share_metrics: metrics,
                          });
                          setPreview(null);
                          setCode("");
                          window.history.replaceState({}, "", "/coach");
                        }, "requested")
                      }
                    >
                      {c("join")}
                    </button>
                  </div>
                )}
              </section>
            )}
            {mode === "students" &&
              workspace.coach &&
              connections.some((item) => item.coach_id === user.id) && (
                <input
                  aria-label={c("search")}
                  placeholder={c("search")}
                  className={field + " mb-4 max-w-md"}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              )}
            <div className="divide-y divide-slate-700">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  className="flex min-h-20 w-full items-center gap-3 py-4 text-left"
                  onClick={() => open(item.id)}
                >
                  <UserRound size={22} className="shrink-0 text-cyan-300" />
                  <span className="min-w-0 flex-1">
                    <span className="block break-words text-base font-bold">
                      {item.name}
                    </span>
                    <span className="mt-1 block text-xs text-slate-400">
                      {c(item.status)} ·{" "}
                      {item.ends_at ? date(item.ends_at) : term(item.months)}
                    </span>
                    {item.status === "active" && (
                      <span className="mt-1 block text-xs text-slate-300">
                        {c("weeks")}: {item.week_count ?? 0} · {c("last")}:{" "}
                        {date(item.last_session)}
                      </span>
                    )}
                  </span>
                  <ChevronRight size={18} className="shrink-0" />
                </button>
              ))}
            </div>
            {!filtered.length && mode === "students" && workspace.coach && (
              <p className="py-5 text-sm text-slate-400">{c("noStudents")}</p>
            )}
          </>
        )}
        {selectedLink && (
          <>
            <button
              className={button + " mb-4"}
              onClick={() => setSelected(null)}
            >
              <ArrowLeft size={16} />
              {c("back")}
            </button>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="break-words text-xl font-bold">
                  {selectedLink.name}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {c(selectedLink.status)} ·{" "}
                  {selectedLink.ends_at
                    ? date(selectedLink.ends_at)
                    : term(selectedLink.months)}
                </p>
              </div>
              <button
                className={button + " text-red-300"}
                disabled={busy}
                onClick={closeConnection}
              >
                {c("disconnect")}
              </button>
            </div>
            {selectedLink.status === "pending" && isCoach && (
              <div className="flex gap-2">
                <button
                  className={button + " bg-emerald-700"}
                  disabled={busy}
                  onClick={() =>
                    run(() =>
                      coachApi("respond", { link_id: selected, accept: true }),
                    )
                  }
                >
                  <Check size={16} />
                  {c("accept")}
                </button>
                <button
                  className={button}
                  disabled={busy}
                  onClick={() => {
                    if (window.confirm(c("declineWarning")))
                      run(async () => {
                        await coachApi("respond", {
                          link_id: selected,
                          accept: false,
                        });
                        setSelected(null);
                      });
                  }}
                >
                  <X size={16} />
                  {c("reject")}
                </button>
              </div>
            )}
            {active && (
              <>
                {!isCoach && (
                  <button
                    className={button + " mb-4"}
                    disabled={busy}
                    onClick={() => {
                      if (
                        selectedLink.share_metrics ||
                        window.confirm(c("confirmMetrics"))
                      )
                        run(() =>
                          coachApi("sharing", {
                            link_id: selected,
                            share_metrics: !selectedLink.share_metrics,
                          }),
                        );
                    }}
                  >
                    {c(
                      selectedLink.share_metrics
                        ? "revokeMetrics"
                        : "allowMetrics",
                    )}
                  </button>
                )}
                <div
                  role="tablist"
                  aria-label={c("roster")}
                  className="mb-5 flex border-b border-slate-700"
                >
                  {["program", "progress", "feedback"].map((value) => (
                    <button
                      role="tab"
                      key={value}
                      aria-selected={tab === value}
                      className={
                        "min-h-12 flex-1 border-b-2 px-1 text-sm " +
                        (tab === value
                          ? "border-cyan-400 text-cyan-300"
                          : "border-transparent text-slate-400")
                      }
                      onClick={() => {
                        setTab(value);
                        setEdit(false);
                        setSessionDay(null);
                      }}
                    >
                      {c(value)}
                    </button>
                  ))}
                </div>
                {!details && !error && <p role="status">{c("loading")}</p>}
                {details && (
                  <div className="max-w-3xl">
                    {tab === "program" &&
                      (edit ? (
                        <ProgramEditor
                          initial={details.assignment?.program}
                          c={c}
                          busy={busy}
                          templates={connections.filter(
                            (item) =>
                              item.coach_id === user.id &&
                              item.status === "active" &&
                              item.id !== selected,
                          )}
                          onCopy={async (id) => {
                            try {
                              const data = await coachApi("details", {
                                link_id: id,
                              });
                              return data.assignment?.program;
                            } catch (err) {
                              setError(errorText(err, c));
                              return null;
                            }
                          }}
                          onCancel={() => setEdit(false)}
                          onSave={(program) =>
                            run(async () => {
                              await coachApi("assign", {
                                link_id: selected,
                                program,
                              });
                              setEdit(false);
                            }, "savedPlan")
                          }
                        />
                      ) : sessionDay !== null && sessionAssignment ? (
                        <SessionForm
                          key={sessionAssignment.id + ":" + sessionDay}
                          assignment={sessionAssignment}
                          dayIndex={sessionDay}
                          c={c}
                          busy={busy}
                          onCancel={() => setSessionDay(null)}
                          onSave={(payload) =>
                            run(async () => {
                              await coachApi("session", {
                                ...payload,
                                link_id: selected,
                              });
                              setSessionDay(null);
                            }, "saved")
                          }
                        />
                      ) : (
                        <>
                          {isCoach && (
                            <button
                              className={button + " mb-4"}
                              onClick={() => setEdit(true)}
                            >
                              <Pencil size={16} />
                              {c("edit")}
                            </button>
                          )}
                          {!details.assignment ? (
                            <p className="text-sm text-slate-400">
                              {c("noProgram")}
                            </p>
                          ) : (
                            <>
                              <h3 className="text-xl font-bold">
                                {details.assignment.program.title}
                              </h3>
                              <p className="mt-1 text-xs text-slate-400">
                                {c("planDate")}:{" "}
                                {date(details.assignment.created_at)}
                              </p>
                              {details.assignment.program.days.map((day, i) => (
                                <section
                                  key={i}
                                  className="border-b border-slate-700 py-5"
                                >
                                  <h4 className="mb-3 break-words text-lg font-bold">
                                    {day.name}
                                  </h4>
                                  {day.exercises.map((ex, j) => (
                                    <div
                                      key={j}
                                      className="flex items-start justify-between gap-4 py-2 text-sm"
                                    >
                                      <span className="min-w-0 break-words">
                                        {ex.name}
                                      </span>
                                      <span className="shrink-0 text-slate-300">
                                        {ex.sets} × {ex.reps}
                                      </span>
                                    </div>
                                  ))}
                                  {!isCoach && (
                                    <button
                                      className={
                                        button + " mt-3 bg-emerald-700"
                                      }
                                      onClick={() => {
                                        setSessionAssignment(
                                          details.assignment,
                                        );
                                        setSessionDay(i);
                                      }}
                                    >
                                      {c("start")}
                                    </button>
                                  )}
                                </section>
                              ))}
                            </>
                          )}
                        </>
                      ))}
                    {tab === "progress" && (
                      <>
                        <p className="mb-3 text-sm">
                          {c("completed")}: {details.sessions.length}
                        </p>
                        {!selectedLink.share_metrics && (
                          <p className="text-sm text-slate-400">
                            {c("metricsOff")}
                          </p>
                        )}
                        {details.weights.map((entry, i) => (
                          <p
                            key={i}
                            className="border-b border-slate-800 py-3 text-sm"
                          >
                            {date(entry.date)} · {entry.weight ?? "—"} kg
                            {entry.body_fat != null &&
                              ` · ${c("bodyFat")}: ${entry.body_fat}%`}
                          </p>
                        ))}
                        {details.measurements.map((entry, i) => (
                          <div
                            key={i}
                            className="border-b border-slate-800 py-3"
                          >
                            <p className="mb-2 text-sm font-bold">
                              {date(entry.date)}
                            </p>
                            <dl className="grid grid-cols-2 gap-2 text-sm">
                              {["chest", "waist", "hip", "arm", "leg"]
                                .filter((key) => entry[key] != null)
                                .map((key) => (
                                  <div key={key}>
                                    <dt className="text-slate-400">{c(key)}</dt>
                                    <dd>{entry[key]} cm</dd>
                                  </div>
                                ))}
                            </dl>
                          </div>
                        ))}
                        {!details.weights.length &&
                          !details.measurements.length && (
                            <p className="mt-3 text-sm text-slate-400">
                              {c("noRecords")}
                            </p>
                          )}
                      </>
                    )}
                    {tab === "feedback" && (
                      <>
                        {!details.sessions.length && (
                          <p className="text-sm text-slate-400">
                            {c("noRecords")}
                          </p>
                        )}
                        {details.sessions.map((record, i) => (
                          <section
                            key={i}
                            className="border-b border-slate-700 py-4"
                          >
                            <h3 className="font-bold">{record.day_name}</h3>
                            <p className="mt-1 text-xs text-slate-400">
                              {date(record.created_at)}
                            </p>
                            {record.exercises.map((ex, j) => (
                              <p key={j} className="mt-3 break-words text-sm">
                                {ex.name}:{" "}
                                {ex.sets
                                  .map((s) => `${s.weight} kg × ${s.reps}`)
                                  .join(" / ")}
                              </p>
                            ))}
                            {record.feedback && (
                              <p className="mt-3 whitespace-pre-wrap break-words text-sm text-cyan-200">
                                {record.feedback}
                              </p>
                            )}
                          </section>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
