import { supabase } from "./supabase";

export async function coachApi(action, payload = {}) {
  if (!supabase) throw new Error("Coaching requires an online account");
  const { data, error } = await supabase.rpc("coach_api", { action, payload });
  if (error) throw error;
  return data;
}

export function coachLink(code, origin = window.location.origin) {
  return `${origin}/coach?invite=${encodeURIComponent(code)}`;
}

export function takeCoachReturn(pathname) {
  if (pathname !== "/auth") return null;
  try {
    const path = sessionStorage.getItem("fb_coach_return");
    sessionStorage.removeItem("fb_coach_return");
    return /^\/coach(?:\?invite=[a-f0-9]{32})?$/.test(path || "") ? path : null;
  } catch {
    return null;
  }
}

export function validateProgram(program) {
  return (
    typeof program?.title === "string" &&
    program.title.trim().length > 0 &&
    program.title.length <= 100 &&
    Array.isArray(program.days) &&
    program.days.length > 0 &&
    program.days.length <= 7 &&
    program.days.every(
      (day) =>
        typeof day.name === "string" &&
        day.name.trim() &&
        day.name.length <= 80 &&
        Array.isArray(day.exercises) &&
        day.exercises.length > 0 &&
        day.exercises.length <= 20 &&
        day.exercises.every(
          (ex) =>
            typeof ex.name === "string" &&
            ex.name.trim() &&
            ex.name.length <= 100 &&
            Number.isInteger(Number(ex.sets)) &&
            Number(ex.sets) >= 1 &&
            Number(ex.sets) <= 10 &&
            Number.isInteger(Number(ex.reps)) &&
            Number(ex.reps) >= 1 &&
            Number(ex.reps) <= 100,
        ),
    )
  );
}
