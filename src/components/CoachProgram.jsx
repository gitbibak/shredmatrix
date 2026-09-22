import { useState } from "react";
import { Copy, Plus, Trash2, Save, X } from "lucide-react";
import { validateProgram } from "../lib/coaching";

export const field =
  "w-full min-w-0 rounded-lg border border-slate-600 bg-slate-950 p-2.5 text-base text-white focus:border-cyan-400";
export const button =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40";
const blankExercise = () => ({ name: "", sets: 3, reps: 10 });
const blankDay = () => ({ name: "", exercises: [blankExercise()] });
const blankProgram = () => ({ title: "", days: [blankDay()] });
function IconButton({ label, children, ...props }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={button + " shrink-0"}
      {...props}
    >
      {children}
    </button>
  );
}

export function ProgramEditor({
  initial,
  c,
  busy,
  onSave,
  onCancel,
  templates = [],
  onCopy,
}) {
  const [program, setProgram] = useState(() =>
    structuredClone(initial || blankProgram()),
  );
  const updateDay = (index, value) =>
    setProgram((old) => ({
      ...old,
      days: old.days.map((day, i) => (i === index ? value : day)),
    }));
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (validateProgram(program)) onSave(program);
      }}
      className="space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold">{c("edit")}</h3>
        <IconButton label={c("cancel")} onClick={onCancel}>
          <X size={18} />
        </IconButton>
      </div>
      {!!templates.length && (
        <label className="block text-sm">
          {c("template")}
          <select
            className={field + " mt-2"}
            defaultValue=""
            disabled={busy}
            onChange={async (e) => {
              if (e.target.value) {
                const copied = await onCopy(e.target.value);
                if (copied) setProgram(structuredClone(copied));
              }
            }}
          >
            <option value="">{c("selected")}</option>
            {templates.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="block text-sm">
        {c("titleInput")}
        <input
          className={field + " mt-2"}
          maxLength={100}
          required
          value={program.title}
          onChange={(e) => setProgram({ ...program, title: e.target.value })}
        />
      </label>
      {program.days.map((day, index) => (
        <fieldset
          key={index}
          className="min-w-0 border-t border-slate-700 py-4"
        >
          <legend className="px-2 text-sm font-bold">
            {c("day")} {index + 1}
          </legend>
          <div className="mb-3 flex items-end gap-2">
            <label className="min-w-0 flex-1 text-sm">
              {c("day")}
              <input
                className={field + " mt-2"}
                required
                maxLength={80}
                value={day.name}
                onChange={(e) =>
                  updateDay(index, { ...day, name: e.target.value })
                }
              />
            </label>
            <IconButton
              label={c("duplicateDay")}
              disabled={program.days.length >= 7}
              onClick={() =>
                setProgram({
                  ...program,
                  days: [...program.days, structuredClone(day)],
                })
              }
            >
              <Copy size={18} />
            </IconButton>
            <IconButton
              label={c("remove")}
              disabled={program.days.length === 1}
              onClick={() =>
                setProgram({
                  ...program,
                  days: program.days.filter((_, i) => i !== index),
                })
              }
            >
              <Trash2 size={18} />
            </IconButton>
          </div>
          {day.exercises.map((ex, exIndex) => (
            <div
              key={exIndex}
              className="mb-3 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_44px] items-end gap-2 sm:grid-cols-[minmax(0,1fr)_80px_80px_44px]"
            >
              <label className="col-span-3 min-w-0 text-sm sm:col-span-1">
                {c("exercise")}
                <input
                  className={field + " mt-1"}
                  required
                  maxLength={100}
                  value={ex.name}
                  onChange={(e) =>
                    updateDay(index, {
                      ...day,
                      exercises: day.exercises.map((item, j) =>
                        j === exIndex
                          ? { ...item, name: e.target.value }
                          : item,
                      ),
                    })
                  }
                />
              </label>
              {["sets", "reps"].map((key) => (
                <label key={key} className="min-w-0 text-sm">
                  {c(key)}
                  <input
                    type="number"
                    className={field + " mt-1"}
                    required
                    min={1}
                    max={key === "sets" ? 10 : 100}
                    step={1}
                    value={ex[key]}
                    onChange={(e) =>
                      updateDay(index, {
                        ...day,
                        exercises: day.exercises.map((item, j) =>
                          j === exIndex
                            ? { ...item, [key]: e.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                </label>
              ))}
              <IconButton
                label={c("remove")}
                disabled={day.exercises.length === 1}
                onClick={() =>
                  updateDay(index, {
                    ...day,
                    exercises: day.exercises.filter((_, j) => j !== exIndex),
                  })
                }
              >
                <Trash2 size={18} />
              </IconButton>
            </div>
          ))}
          <button
            className={button}
            type="button"
            disabled={day.exercises.length >= 20}
            onClick={() =>
              updateDay(index, {
                ...day,
                exercises: [...day.exercises, blankExercise()],
              })
            }
          >
            <Plus size={16} />
            {c("addExercise")}
          </button>
        </fieldset>
      ))}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={button}
          disabled={program.days.length >= 7}
          onClick={() =>
            setProgram({ ...program, days: [...program.days, blankDay()] })
          }
        >
          <Plus size={16} />
          {c("addDay")}
        </button>
        <button
          type="submit"
          className={button + " bg-emerald-700"}
          disabled={busy || !validateProgram(program)}
        >
          <Save size={16} />
          {c("assign")}
        </button>
      </div>
    </form>
  );
}

export function SessionForm({
  assignment,
  dayIndex,
  c,
  busy,
  onSave,
  onCancel,
}) {
  const day = assignment.program.days[dayIndex];
  const [sessionId] = useState(() => crypto.randomUUID());
  const [exercises, setExercises] = useState(() =>
    day.exercises.map((ex) => ({
      name: ex.name,
      sets: Array.from({ length: ex.sets }, () => ({ weight: "", reps: "" })),
    })),
  );
  const [feedback, setFeedback] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          session_id: sessionId,
          program_id: assignment.id,
          day_index: dayIndex,
          exercises,
          feedback,
        });
      }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold">{day.name}</h3>
        <IconButton label={c("cancel")} onClick={onCancel}>
          <X size={18} />
        </IconButton>
      </div>
      {exercises.map((exercise, index) => (
        <fieldset
          key={index}
          className="min-w-0 border-t border-slate-700 pt-3"
        >
          <legend className="max-w-full break-words px-1 text-base font-bold">
            {exercise.name}
          </legend>
          <p className="mb-2 text-sm text-slate-400">
            {c("expected")}: {day.exercises[index].sets} ×{" "}
            {day.exercises[index].reps}
          </p>
          {exercise.sets.map((set, j) => (
            <div
              key={j}
              className="mb-2 grid grid-cols-[24px_minmax(0,1fr)_minmax(0,1fr)] items-end gap-2"
            >
              <span className="pb-3 text-sm text-slate-400">{j + 1}</span>
              {["weight", "reps"].map((key) => (
                <label key={key} className="min-w-0 text-xs">
                  {c(key)}
                  <input
                    type="number"
                    required
                    min={0}
                    max={key === "weight" ? 1000 : 100}
                    step={key === "weight" ? 0.25 : 1}
                    className={field + " mt-1"}
                    value={set[key]}
                    onChange={(e) =>
                      setExercises((old) =>
                        old.map((item, i) =>
                          i === index
                            ? {
                                ...item,
                                sets: item.sets.map((s, k) =>
                                  k === j ? { ...s, [key]: e.target.value } : s,
                                ),
                              }
                            : item,
                        ),
                      )
                    }
                  />
                </label>
              ))}
            </div>
          ))}
        </fieldset>
      ))}
      <label className="block text-sm">
        {c("note")}
        <textarea
          rows={3}
          maxLength={600}
          className={field + " mt-2"}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
      </label>
      <button
        type="submit"
        className={button + " bg-emerald-700"}
        disabled={busy}
      >
        <Save size={18} />
        {c("complete")}
      </button>
    </form>
  );
}
