import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Shared                                                              */
/* ------------------------------------------------------------------ */

export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD");
export const isoMonth = z.string().regex(/^\d{4}-\d{2}$/, "expected YYYY-MM");
export const isoDateTime = z.string().min(10);

/** Fields every stored entity carries. Tags let one item surface in both modules. */
const entityBase = {
  id: z.string().min(1),
  createdAt: isoDateTime,
  updatedAt: isoDateTime,
  tags: z.array(z.string()).default([]),
};

/* ------------------------------------------------------------------ */
/* Action Tracker (forward-looking)                                    */
/* ------------------------------------------------------------------ */

export const gapProjectStatuses = ["not_started", "in_progress", "shipped"] as const;

export const GapProjectSchema = z.object({
  ...entityBase,
  title: z.string().min(1),
  gap: z.string().default(""), // the skill gap this project closes
  scope: z.string().default(""),
  techStack: z.array(z.string()).default([]),
  estWeeks: z.string().default(""), // e.g. "4–6 wks"
  targetMetric: z.string().default(""),
  status: z.enum(gapProjectStatuses).default("not_started"),
  progress: z.number().min(0).max(100).default(0),
  starred: z.boolean().default(false), // highest-leverage flag
});
export type GapProject = z.infer<typeof GapProjectSchema>;

export const milestoneKinds = ["milestone", "decision"] as const;
export const milestoneStatuses = ["upcoming", "done"] as const;

export const MilestoneSchema = z.object({
  ...entityBase,
  month: isoMonth,
  title: z.string().min(1),
  detail: z.string().default(""),
  kind: z.enum(milestoneKinds).default("milestone"),
  status: z.enum(milestoneStatuses).default("upcoming"),
});
export type Milestone = z.infer<typeof MilestoneSchema>;

export const courseStatuses = ["not_started", "in_progress", "completed"] as const;
export const hiringWeights = ["high", "medium", "checkbox"] as const;
export const financialAidStatuses = ["not_applied", "applied", "approved", "denied"] as const;

/** One checkable unit inside a course — a Coursera week/module, or a
    specialization's sub-course. Seeded from the real syllabus. */
export const CourseModuleSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  done: z.boolean().default(false),
  completedDate: isoDate.nullable().default(null),
});
export type CourseModule = z.infer<typeof CourseModuleSchema>;

export const CourseSchema = z.object({
  ...entityBase,
  title: z.string().min(1),
  provider: z.string().default(""),
  duration: z.string().default(""), // display copy, e.g. "3 courses · ~95 h"
  /* Position in the 18-month roadmap. Null = unscheduled — such rows render
     in an "Unscheduled" bucket rather than being dropped; a dropped row is
     indistinguishable from a bug. */
  targetStartMonth: z.number().int().min(1).max(18).nullable().default(null),
  /* Day-precise start set by "Replan from today"; overrides the
     month-derived start when present (see courseStartISO). */
  plannedStartDate: isoDate.nullable().default(null),
  /* Planned effort at ~10 h/week; drives the target-finish date and the
     "wk n of m" progress readout. Null = open-ended (self-study). */
  durationWeeks: z.number().int().min(1).max(52).nullable().default(null),
  /* Which stretch of the path this belongs to, e.g. "Foundations". */
  phase: z.string().default(""),
  /* Syllabus checklist. Checking the last item completes the course;
     rows from before v10 parse to [] and get filled by migration. */
  modules: z.array(CourseModuleSchema).default([]),
  status: z.enum(courseStatuses).default("not_started"),
  hiringWeight: z.enum(hiringWeights).default("medium"),
  url: z.string().default(""),
  completedDate: isoDate.nullable().default(null), // stamped when status -> completed; Portfolio reads it
  /* Coursera Financial Aid tracking — legacy since the Coursera Plus
     subscription (2026-08): off by default, kept for imported workspaces
     that tracked aid windows (see lib/aid.ts). */
  aidApplicable: z.boolean().default(false),
  financialAidStatus: z.enum(financialAidStatuses).default("not_applied"),
  aidAppliedDate: isoDate.nullable().default(null),
  aidApprovedDate: isoDate.nullable().default(null),
  completionDeadline: isoDate.nullable().default(null), // aidApprovedDate + 180 days
});
export type Course = z.infer<typeof CourseSchema>;

export const networkingKinds = ["company", "community", "job_board"] as const;
export const networkingStatuses = [
  "not_contacted",
  "applied",
  "in_conversation",
  "rejected",
  "offer",
] as const;

export const NetworkingTargetSchema = z.object({
  ...entityBase,
  name: z.string().min(1),
  kind: z.enum(networkingKinds).default("company"),
  status: z.enum(networkingStatuses).default("not_contacted"),
  lastTouched: isoDate.nullable().default(null),
  notes: z.string().default(""),
  url: z.string().default(""),
});
export type NetworkingTarget = z.infer<typeof NetworkingTargetSchema>;

export const criticalStatuses = ["open", "in_progress", "done"] as const;

export const CriticalItemSchema = z.object({
  ...entityBase,
  title: z.string().min(1),
  detail: z.string().default(""),
  deadline: isoDate.nullable().default(null),
  status: z.enum(criticalStatuses).default("open"),
});
export type CriticalItem = z.infer<typeof CriticalItemSchema>;

/** One row in a weekly focus list. refType/refId link back to the source item. */
export const weeklyRefTypes = [
  "gap_project",
  "course",
  "networking",
  "critical",
  "resume_fix",
  "custom",
] as const;

export const WeeklyItemSchema = z.object({
  ...entityBase,
  weekStart: isoDate, // Monday, YYYY-MM-DD
  title: z.string().min(1),
  refType: z.enum(weeklyRefTypes).default("custom"),
  refId: z.string().nullable().default(null),
  done: z.boolean().default(false),
  carriedOver: z.number().int().min(0).default(0), // times carried into a new week
});
export type WeeklyItem = z.infer<typeof WeeklyItemSchema>;

export const ResumeFixSchema = z.object({
  ...entityBase,
  title: z.string().min(1),
  detail: z.string().default(""),
  status: z.enum(["open", "done"]).default("open"),
});
export type ResumeFix = z.infer<typeof ResumeFixSchema>;

export const VisaTrackSchema = z.object({
  ...entityBase,
  country: z.string().min(1),
  name: z.string().min(1),
  threshold: z.string().default(""), // salary floor / key requirement
  requirement: z.string().default(""),
  eligibleNow: z.boolean().default(false),
  notes: z.string().default(""),
});
export type VisaTrack = z.infer<typeof VisaTrackSchema>;

/* ------------------------------------------------------------------ */
/* Skills Portfolio Log (backward-looking)                             */
/* ------------------------------------------------------------------ */

export const PortfolioProjectSchema = z.object({
  ...entityBase,
  title: z.string().min(1),
  url: z.string().default(""),
  startDate: isoMonth,
  endDate: isoMonth.nullable().default(null), // null = present
  techStack: z.array(z.string()).default([]),
  summary: z.string().default(""),
  metrics: z.array(z.string()).default([]),
  proves: z.string().default(""), // "what this proves"
});
export type PortfolioProject = z.infer<typeof PortfolioProjectSchema>;

export const proficiencies = ["expert", "proficient", "working", "learning"] as const;

export const SkillSchema = z.object({
  ...entityBase,
  name: z.string().min(1),
  proficiency: z.enum(proficiencies).default("working"),
  yearsUsed: z.number().min(0).default(0),
  proofPointIds: z.array(z.string()).default([]), // portfolio project / achievement ids
});
export type Skill = z.infer<typeof SkillSchema>;

export const AchievementSchema = z.object({
  ...entityBase,
  value: z.string().min(1), // the number: "8 yrs", "4 systems", "-38% p95"
  context: z.string().default(""), // what the number measures
  date: isoDate.nullable().default(null),
  sourceProjectId: z.string().nullable().default(null),
});
export type Achievement = z.infer<typeof AchievementSchema>;

export const CertificationSchema = z.object({
  ...entityBase,
  title: z.string().min(1),
  issuer: z.string().default(""),
  date: isoDate.nullable().default(null),
  credentialUrl: z.string().default(""),
});
export type Certification = z.infer<typeof CertificationSchema>;

export const competencies = [
  "system_design",
  "debugging",
  "ownership",
  "cross_functional_communication",
  "client_management",
  "delivery",
] as const;

export const StarStorySchema = z.object({
  ...entityBase,
  title: z.string().min(1),
  competencyTags: z.array(z.enum(competencies)).default([]),
  situation: z.string().default(""),
  task: z.string().default(""),
  action: z.string().default(""),
  result: z.string().default(""),
});
export type StarStory = z.infer<typeof StarStorySchema>;

/** One checked-off lesson (a topic inside a course module). The row id IS
    the deterministic lesson id (`<moduleId>-tNN`) from lib/topics.ts; lesson
    titles stay in code (lib/module-topics.ts), only the check state is
    stored. A separate collection so pre-topic bundles can never strip it. */
export const TopicCheckSchema = z.object({
  ...entityBase,
  completedDate: isoDate.nullable().default(null),
});
export type TopicCheck = z.infer<typeof TopicCheckSchema>;

/** Calendar entries logged from the Learning day panel: study time + notes. */
export const dayEventKinds = ["study", "note"] as const;

export const DayEventSchema = z.object({
  ...entityBase,
  date: isoDate,
  title: z.string().min(1),
  kind: z.enum(dayEventKinds).default("study"),
  courseId: z.string().nullable().default(null),
  minutes: z.number().int().min(0).nullable().default(null),
});
export type DayEvent = z.infer<typeof DayEventSchema>;

/* ------------------------------------------------------------------ */
/* Cross-cutting                                                       */
/* ------------------------------------------------------------------ */

export const activityKinds = ["created", "updated", "completed", "shipped", "removed", "imported", "seeded"] as const;

export const ActivityEventSchema = z.object({
  id: z.string().min(1),
  at: isoDateTime,
  kind: z.enum(activityKinds),
  message: z.string().min(1),
});
export type ActivityEvent = z.infer<typeof ActivityEventSchema>;

export const ProfileSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().nullable().default(null),
  location: z.string().default(""),
  role: z.string().default(""),
  company: z.string().default(""),
  employedSince: isoMonth,
  stack: z.array(z.string()).default([]),
  targetRoles: z.array(z.string()).default([]), // ranked
  timelineStart: isoMonth, // first month of the 18-month plan
  timelineMonths: z.number().int().min(1).default(18),
  targetDate: isoDate, // the date the countdown KPI points at
  targetLabel: z.string().default("target date"),
  /* Deadlines derived to a date before this never render as overdue —
     the workspace can't be late on a deadline it never had. */
  workspaceCreatedAt: isoDate.default(() => new Date().toISOString().slice(0, 10)),
});
export type Profile = z.infer<typeof ProfileSchema>;

/* ------------------------------------------------------------------ */
/* Export / import envelope                                            */
/* ------------------------------------------------------------------ */

export const collectionSchemas = {
  gapProjects: GapProjectSchema,
  milestones: MilestoneSchema,
  courses: CourseSchema,
  networking: NetworkingTargetSchema,
  critical: CriticalItemSchema,
  weekly: WeeklyItemSchema,
  resumeFixes: ResumeFixSchema,
  visaTracks: VisaTrackSchema,
  portfolio: PortfolioProjectSchema,
  skills: SkillSchema,
  achievements: AchievementSchema,
  certifications: CertificationSchema,
  stories: StarStorySchema,
  dayEvents: DayEventSchema,
  topicProgress: TopicCheckSchema,
  activity: ActivityEventSchema,
} as const;

export type CollectionKey = keyof typeof collectionSchemas;
export type CollectionType = { [K in CollectionKey]: z.infer<(typeof collectionSchemas)[K]> };

export const ExportEnvelopeSchema = z.object({
  app: z.literal("career-command-center"),
  version: z.literal(1),
  exportedAt: isoDateTime,
  profile: ProfileSchema,
  /* Each collection defaults to [] so backups from before a collection
     existed still import cleanly. */
  data: z.object(
    Object.fromEntries(
      Object.entries(collectionSchemas).map(([k, schema]) => [k, z.array(schema).default([])])
    ) as {
      [K in CollectionKey]: z.ZodDefault<z.ZodArray<(typeof collectionSchemas)[K]>>;
    }
  ),
});
export type ExportEnvelope = z.infer<typeof ExportEnvelopeSchema>;
