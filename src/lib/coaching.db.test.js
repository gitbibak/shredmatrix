// @vitest-environment node
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

let db;
const coach = "00000000-0000-4000-8000-000000000001";
const student = "00000000-0000-4000-8000-000000000002";
const stranger = "00000000-0000-4000-8000-000000000003";
const program = {
  title: "Strength",
  days: [{ name: "Day A", exercises: [{ name: "Squat", sets: 1, reps: 8 }] }],
};
async function api(user, action, payload = {}) {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
    user || "",
  ]);
  await db.exec("set role authenticated");
  try {
    return (
      await db.query("select public.coach_api($1,$2::jsonb) as result", [
        action,
        JSON.stringify(payload),
      ])
    ).rows[0].result;
  } finally {
    await db.exec("reset role");
  }
}
async function connect(accept = true, share_metrics = false, months = 6) {
  await api(coach, "enable", { name: "Coach" });
  const invite = await api(coach, "invite", { months });
  await api(student, "join", {
    code: invite.code,
    consent: true,
    share_metrics,
  });
  const link = (await api(coach, "workspace")).links[0];
  if (accept) await api(coach, "respond", { link_id: link.id, accept: true });
  return link.id;
}
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create schema auth;
    create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;
    create table auth.users(id uuid primary key,is_anonymous boolean default false);
    create table public.profiles(id uuid primary key,name text,email text);
    create table public.workout_logs(id uuid primary key default gen_random_uuid(),user_id uuid,date date,day_focus text,exercises jsonb,notes text,created_at timestamptz default now());
    create table public.progress_entries(user_id uuid,date date,weight real,body_fat real,created_at timestamptz default now());
    create table public.measurements(user_id uuid,date date,chest real,waist real,hip real,arm real,leg real,created_at timestamptz default now());
    insert into auth.users(id) values('${coach}'),('${student}'),('${stranger}');
    insert into public.profiles values('${coach}','Coach','secret@example.test'),('${student}','Student','private@example.test'),('${stranger}','Other','other@example.test');`);
  await db.exec(
    await readFile(
      new URL(
        "../../supabase/migrations/20260922202347_coach_workspace.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  );
}, 30000);
beforeEach(async () => {
  await db.exec(
    "truncate private.coach_accounts cascade; truncate public.workout_logs cascade; truncate public.progress_entries; truncate public.measurements;",
  );
});
afterAll(async () => {
  await db?.close();
});

describe("coach database authorization", () => {
  it("denies unauthenticated, deleted and anonymous users", async () => {
    await expect(api(null, "workspace")).rejects.toThrow("AUTH_REQUIRED");
    await expect(
      api("00000000-0000-4000-8000-000000000099", "workspace"),
    ).rejects.toThrow("AUTH_REQUIRED");
    await db.exec(
      `update auth.users set is_anonymous=true where id='${stranger}'`,
    );
    await expect(api(stranger, "workspace")).rejects.toThrow("AUTH_REQUIRED");
    await db.exec(
      `update auth.users set is_anonymous=false where id='${stranger}'`,
    );
    await db.exec("set role anon");
    await expect(
      db.query("select public.coach_api('workspace')"),
    ).rejects.toThrow();
    await db.exec("reset role");
  });
  it("does not grant direct access to private tables", async () => {
    await connect();
    await db.exec("set role authenticated");
    for (const table of [
      "coach_accounts",
      "coach_invites",
      "coach_links",
      "coach_programs",
      "coach_sessions",
    ]) {
      await expect(
        db.query(`select * from private.${table}`),
      ).rejects.toThrow();
      await expect(db.query(`delete from private.${table}`)).rejects.toThrow();
    }
    await db.exec("reset role");
  });
  it("requires explicit consent, rejects self-invites and rotated/expired codes", async () => {
    await api(coach, "enable", { name: "Coach" });
    const old = await api(coach, "invite", { months: 3 });
    await expect(
      api(coach, "join", { code: old.code, consent: true }),
    ).rejects.toThrow("INVALID_INVITE");
    await expect(api(student, "join", { code: old.code })).rejects.toThrow(
      "CONSENT_REQUIRED",
    );
    const current = await api(coach, "invite", { months: 6 });
    await expect(api(student, "preview", { code: old.code })).rejects.toThrow(
      "INVALID_INVITE",
    );
    expect(await api(student, "preview", { code: current.code })).toEqual({
      name: "Coach",
      months: 6,
    });
    await db.exec(
      "update private.coach_invites set expires_at=now()-interval '1 second'",
    );
    await expect(
      api(student, "join", { code: current.code, consent: true }),
    ).rejects.toThrow("INVALID_INVITE");
  });
  it("requires coach acceptance and disallows student self-approval", async () => {
    const id = await connect(false);
    await expect(api(coach, "details", { link_id: id })).rejects.toThrow(
      "CONNECTION_INACTIVE",
    );
    await expect(
      api(student, "respond", { link_id: id, accept: true }),
    ).rejects.toThrow();
    await api(coach, "respond", { link_id: id, accept: true });
    expect((await api(student, "workspace")).links[0].status).toBe("active");
  });
  it("isolates unrelated users and coaches for every operation", async () => {
    const id = await connect();
    await api(stranger, "enable", { name: "Other coach" });
    expect((await api(stranger, "workspace")).links).toEqual([]);
    for (const action of [
      "details",
      "assign",
      "session",
      "sharing",
      "respond",
      "disconnect",
    ]) {
      await expect(
        api(stranger, action, { link_id: id, program }),
      ).rejects.toThrow("FORBIDDEN");
    }
    expect(JSON.stringify(await api(coach, "workspace"))).not.toContain("@");
  });
  it("only permits the student to change optional sharing", async () => {
    const id = await connect();
    await db.exec(
      `insert into public.progress_entries values('${student}',current_date,75,18,now()); insert into public.measurements(user_id,date,waist) values('${student}',current_date,80);`,
    );
    expect((await api(coach, "details", { link_id: id })).weights).toEqual([]);
    await expect(
      api(coach, "sharing", { link_id: id, share_metrics: true }),
    ).rejects.toThrow("FORBIDDEN");
    await api(student, "sharing", { link_id: id, share_metrics: true });
    const details = await api(coach, "details", { link_id: id });
    expect(details.weights).toHaveLength(1);
    expect(details.measurements).toHaveLength(1);
    await api(student, "sharing", { link_id: id, share_metrics: false });
    expect((await api(coach, "details", { link_id: id })).weights).toEqual([]);
  });
  it("does not share old measurements or unrelated personal workout notes", async () => {
    const id = await connect(true, true);
    await db.exec(
      `insert into public.progress_entries values('${student}',current_date,75,18,now()-interval '1 day'); insert into public.workout_logs(user_id,date,notes) values('${student}',current_date,'private journal');`,
    );
    const details = await api(coach, "details", { link_id: id });
    expect(details.weights).toEqual([]);
    expect(details.sessions).toEqual([]);
    expect(JSON.stringify(details)).not.toContain("private journal");
  });
  it("ends all cross-user access immediately on revoke or expiry", async () => {
    const id = await connect();
    await api(student, "disconnect", { link_id: id });
    await expect(api(coach, "details", { link_id: id })).rejects.toThrow(
      "CONNECTION_INACTIVE",
    );
    await expect(
      api(coach, "assign", { link_id: id, program }),
    ).rejects.toThrow("CONNECTION_INACTIVE");
    expect((await api(coach, "workspace")).links).toEqual([]);
    const second = await connect();
    await db.exec(
      "update private.coach_links set ends_at=now()-interval '1 second' where status='active'",
    );
    await expect(api(student, "details", { link_id: second })).rejects.toThrow(
      "CONNECTION_INACTIVE",
    );
    expect((await api(coach, "workspace")).links[0].status).toBe("expired");
  });
  it("rejects duplicate current connections and malformed programs", async () => {
    const id = await connect();
    const invite = await api(coach, "invite", { months: 6 });
    await expect(
      api(student, "join", { code: invite.code, consent: true }),
    ).rejects.toThrow();
    await expect(
      api(student, "assign", { link_id: id, program }),
    ).rejects.toThrow("FORBIDDEN");
    for (const bad of [
      {},
      { title: "x", days: [] },
      {
        title: "x",
        days: [
          { name: "Day", exercises: [{ name: "x", sets: 1.2, reps: 10 }] },
        ],
      },
    ])
      await expect(
        api(coach, "assign", { link_id: id, program: bad }),
      ).rejects.toThrow("INVALID_PROGRAM");
  });
  it("versions programs, validates actual sets and saves sessions idempotently", async () => {
    const id = await connect();
    await api(coach, "assign", { link_id: id, program });
    const old = (await api(student, "details", { link_id: id })).assignment;
    await api(coach, "assign", {
      link_id: id,
      program: { ...program, title: "Updated" },
    });
    const current = (await api(student, "details", { link_id: id })).assignment;
    const session = {
      link_id: id,
      session_id: crypto.randomUUID(),
      program_id: old.id,
      day_index: 0,
      exercises: [{ sets: [{ weight: 20, reps: 8 }] }],
      feedback: "Done",
    };
    await expect(api(student, "session", session)).rejects.toThrow(
      "PROGRAM_CHANGED",
    );
    session.program_id = current.id;
    await expect(api(coach, "session", session)).rejects.toThrow("FORBIDDEN");
    await expect(
      api(student, "session", { ...session, exercises: [{ sets: [] }] }),
    ).rejects.toThrow("INVALID_SESSION");
    await api(student, "session", session);
    await api(student, "session", session);
    const details = await api(coach, "details", { link_id: id });
    expect(details.sessions).toHaveLength(1);
    expect(details.sessions[0].exercises[0].sets[0].weight).toBe(20);
    expect(
      (await db.query("select count(*)::int as n from public.workout_logs"))
        .rows[0].n,
    ).toBe(1);
    await api(student, "disconnect", { link_id: id });
    expect(
      (await db.query("select count(*)::int as n from public.workout_logs"))
        .rows[0].n,
    ).toBe(1);
  });
});
