import type { Course, CriticalItem, DayEvent, GapProject, Milestone, Profile, TopicCheck } from "./schemas";
import { addDaysISO, todayISO } from "./dates";
import { AID_APPLY_LEAD_DAYS, AID_WINDOW_DAYS, courseEndISO, courseStartISO, isPreWorkspace } from "./aid";
import { STUDY_CAPACITY } from "./schedule";
import { generateStudyPlan, type PlanItem, type SessionType } from "./study-plan";
import type { SyllabusSource } from "./course-syllabus";

/* Everything the Learning calendar can show, derived on the fly from the
   stores — only study logs and notes (dayEvents) are stored as such. */

export type CalEventType =
  | "course_start"
  | "course_finish"
  | "plan_study"
  | "aid_apply"
  | "aid_deadline"
  | "milestone"
  | "critical"
  | "study"
  | "note";

export type CalTone = "text" | "win" | "risk" | "waived";

export type CalEvent = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: CalEventType;
  tone: CalTone;
  /** True for real deadlines — these pulse when inside 7 days. */
  deadline: boolean;
  courseId: string | null;
  refKind: "course" | "milestone" | "critical" | "dayEvent" | "gapProject" | "plan";
  refId: string;
  minutes?: number | null;
  /** Present on generated plan sessions: the day's unit of work. */
  session?: {
    type: SessionType;
    items: PlanItem[];
    output: string;
    source: SyllabusSource | null;
  };
};

export function deriveCalendarEvents(args: {
  courses: Course[];
  milestones: Milestone[];
  critical: CriticalItem[];
  dayEvents: DayEvent[];
  topicProgress: TopicCheck[];
  gapProjects: GapProject[];
  profile: Profile;
}): CalEvent[] {
  const { courses, milestones, critical, dayEvents, topicProgress, gapProjects, profile } = args;
  const out: CalEvent[] = [];

  for (const c of courses) {
    const start = courseStartISO(profile, c);
    if (start) {
      out.push({
        id: `start-${c.id}`, date: start, title: `Starts: ${c.title}`,
        type: "course_start", tone: "text", deadline: false,
        courseId: c.id, refKind: "course", refId: c.id,
      });
    }
    const finish = courseEndISO(profile, c);
    if (finish && c.status !== "completed") {
      out.push({
        id: `finish-${c.id}`, date: finish, title: `Target finish: ${c.title}`,
        type: "course_finish", tone: "text", deadline: true,
        courseId: c.id, refKind: "course", refId: c.id,
      });
    }
    if (c.aidApplicable && c.status !== "completed" && c.financialAidStatus === "not_applied" && start) {
      const applyBy = addDaysISO(start, -AID_APPLY_LEAD_DAYS);
      const waived = isPreWorkspace(applyBy, profile);
      out.push({
        id: `aid-apply-${c.id}`, date: applyBy,
        title: waived ? `Aid — apply when ready: ${c.title}` : `Aid apply-by: ${c.title}`,
        type: "aid_apply", tone: waived ? "waived" : "win", deadline: !waived,
        courseId: c.id, refKind: "course", refId: c.id,
      });
    }
    if (c.aidApplicable && c.financialAidStatus === "approved" && c.aidApprovedDate) {
      out.push({
        id: `aid-deadline-${c.id}`, date: addDaysISO(c.aidApprovedDate, AID_WINDOW_DAYS),
        title: `Aid window closes: ${c.title}`,
        type: "aid_deadline", tone: "risk", deadline: true,
        courseId: c.id, refKind: "course", refId: c.id,
      });
    }
  }

  for (const m of milestones) {
    out.push({
      id: `ms-${m.id}`, date: m.month + "-01", title: m.title,
      type: "milestone", tone: "win", deadline: false,
      courseId: null, refKind: "milestone", refId: m.id,
    });
  }

  for (const item of critical) {
    if (item.deadline && item.status !== "done") {
      out.push({
        id: `cp-${item.id}`, date: item.deadline, title: item.title,
        type: "critical", tone: "risk", deadline: true,
        courseId: null, refKind: "critical", refId: item.id,
      });
      /* Lead-time reminders so paperwork starts before it turns urgent. */
      for (const lead of [14, 3] as const) {
        const d = addDaysISO(item.deadline, -lead);
        if (d < profile.workspaceCreatedAt) continue;
        out.push({
          id: `cp-${item.id}-t${lead}`, date: d, title: `T-${lead} · ${item.title}`,
          type: "critical", tone: "waived", deadline: false,
          courseId: null, refKind: "critical", refId: item.id,
        });
      }
    }
  }

  for (const e of dayEvents) {
    out.push({
      id: `de-${e.id}`, date: e.date, title: e.title,
      type: e.kind, tone: "text", deadline: false,
      courseId: e.courseId, refKind: "dayEvent", refId: e.id, minutes: e.minutes,
    });
  }

  /* Daily fill — the generated study plan (lib/study-plan.ts): every
     session names its exact unit of work, typed Learn / Practice / Apply /
     Retrieve / Ship / Open, derived from the course windows, the syllabus
     content and the check state; never stored. Pushed last so start /
     deadline / milestone dots win the 3-dot day preview. A day whose
     study time is already logged shows the log instead of the plan. */
  const today = todayISO();
  const logged = new Set(
    dayEvents.filter((e) => e.kind === "study").map((e) => `${e.date}:${e.courseId}`)
  );
  const plan = generateStudyPlan(profile, courses, STUDY_CAPACITY, today, {
    checkedLessons: new Set(topicProgress.map((t) => t.id)),
    gapProjects,
  });
  for (const s of plan.sessions) {
    if (s.courseId && logged.has(`${s.date}:${s.courseId}`)) continue;
    if (!s.courseId && logged.has(`${s.date}:null`)) continue;
    out.push({
      id: `plan-${s.id}`,
      date: s.date,
      title: s.title,
      type: "plan_study",
      tone: "waived",
      deadline: false,
      courseId: s.courseId,
      refKind: s.courseId ? "course" : s.gapProjectId ? "gapProject" : "plan",
      refId: s.courseId ?? s.gapProjectId ?? s.id,
      minutes: s.minutes,
      session: { type: s.type, items: s.items, output: s.output, source: s.source },
    });
  }

  return out;
}

export function groupByDate(events: CalEvent[]): Map<string, CalEvent[]> {
  const map = new Map<string, CalEvent[]>();
  for (const e of events) {
    const list = map.get(e.date) ?? [];
    list.push(e);
    map.set(e.date, list);
  }
  return map;
}

/** Monday-first grid of ISO dates covering the view month (5–6 rows). */
export function monthGridWeeks(viewMonth: string): string[][] {
  const [y, m] = viewMonth.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const rows = Math.ceil((lead + daysInMonth) / 7);
  const cursor = new Date(first);
  cursor.setUTCDate(1 - lead);
  const weeks: string[][] = [];
  for (let r = 0; r < rows; r++) {
    const week: string[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(cursor.toISOString().slice(0, 10));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

export function addMonthsISO(viewMonth: string, delta: number): string {
  const [y, m] = viewMonth.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + delta, 1)).toISOString().slice(0, 7);
}

/** "August 2026" */
export function monthTitle(viewMonth: string): string {
  return new Date(viewMonth + "-01T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

/** "Tuesday, Aug 12, 2026" */
export function dayTitle(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
