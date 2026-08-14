# Claude Code prompt — detailed study schedule on the calendar

Save as `docs/prompts/detailed-schedule.md` in the repo so you can re-run it after
future roadmap changes. Paste the whole thing into Claude Code.

---

## Context

This repo is a career command center for a self-directed 18-month learning path
(Coursera + applied work) aimed at relocating from Myanmar to an EU engineering
role. The Learning page has a Calendar view whose legend is:
`course · study`, `planned session`, `milestone`, `deadline · critical path`.

The calendar is currently near-empty because `dayEvents` in the seed data is `[]`.
Course rows only carry module-level checklists — one row per course *module*,
which is far too coarse to actually study from.

## Goal

Populate the calendar with a day-level study schedule that is detailed enough to
follow without deciding anything each morning, and structured so that it
produces evidence rather than just watch-time.

Important framing: the owner of this path has 8 years of experience that is
really "2 years repeated 4 times." A calendar full of *watch the next video* would
reproduce exactly that failure. The schedule must force retrieval and application,
not consumption. Treat that as the core requirement, not a nice-to-have.

---

## Step 0 — Investigate first. Write no code yet.

Read and report back on:

- `schemas.ts` — the exact shape of `DayEvent`, `TopicProgress`, `WeeklyItem`,
  `Course`, `Module`, `Milestone`, `Critical`. Note which fields are required,
  which are unions, and what the `kind` union allows.
- `dates.ts` and `schedule.ts` — especially `weekStartISO()` and `rescheduleFrom()`.
  I need to know how course start dates are currently derived and chained.
- `seed-data.ts` — the current courses, milestones, `critical`, `gapProjects`,
  `weekly`, and the empty `dayEvents` / `topicProgress`.
- The Calendar component and whatever store/persistence layer feeds it — what
  does the calendar actually query, and how does a dot map to a legend category?
- Any existing migrations (the seed file references v5/v10/v11), so a schema
  change follows the established pattern.

Then tell me, before implementing:

1. The data flow from seed → store → calendar dot, in a few lines.
2. Whether `DayEvent` as it stands can hold what this feature needs, or whether
   the schema must be extended.
3. Your implementation plan.

**Stop there and wait for my go-ahead.**

---

## Step 1 — Architecture: generate, don't hand-author

Do **not** write 18 months of day rows into `seed-data.ts` by hand. There is a
"Replan from today" button in the UI; hand-written dates would desynchronise the
first time it's pressed.

Build a deterministic generator instead:

```ts
generateStudyPlan(
  profile: Profile,
  courses: Course[],
  capacity: StudyCapacity,
  fromDate: string,          // ISO date
): DayEvent[]
```

Requirements:

- **Pure and idempotent.** Same inputs → identical output, including ids. Running
  it twice must not duplicate events.
- **Stable ids**, derived not random: `${courseId}-${moduleId}-s01`. Completion
  state must survive a replan.
- Wire it into the same path as `rescheduleFrom()` so replanning regenerates the
  calendar as well as the course start dates.
- Put the capacity model in **one** exported config object, not scattered
  constants.

Default capacity (make it configurable, don't hardcode at call sites):

| Slot | When | Length |
|---|---|---|
| Primary block | Mon–Sat | 90 min |
| Deep block | Sunday | 3 h |
| Warm-up track | 2–3 weekday blocks | ~3 h/week total |

---

## Step 2 — What "detailed" has to mean

Every generated session needs, at minimum:

- the legend `kind` it maps to
- `courseId` + `moduleId` references
- a **specific unit of work**, not a module name — "Week 2, videos 4–7 + lab:
  fine-tuning a summarisation model", not "Module 2"
- estimated minutes
- an explicit **output**: what exists at the end of the session that didn't
  before. If a session has no output, it is a Learn session and must be capped
  (see ratios below).

### Session types

Tag every session with one of these:

1. **Learn** — new material: video, reading.
2. **Practice** — labs, autograded assignments, coding problems.
3. **Apply** — the material used against a real production system. Mine these
   from the repo's own data: the Car Rental DB index audit, ADRs from the Stripe
   points ledger and CI/CD pipeline, the OWASP hardening pass, pgvector +
   `ts_vector` hybrid search for the RAG assistant.
4. **Retrieve** — closed-book recall of earlier material. No notes, no video.
   Write the answer down, then check it.
5. **Ship** — produce something public: a write-up, a deployed change, a merged PR.

### Ratios — enforce these in the generator, and assert them in a test

- Learn ≤ 60% of scheduled minutes in any rolling 4-week window.
- Every course module gets **Retrieve** sessions at roughly +1 day, +7 days,
  +30 days after its Learn sessions finish. Fold these into existing blocks —
  they must not increase total weekly hours.
- Every course ends with a **Ship** checkpoint session that writes to
  `portfolio`, `achievements`, or `stories`.

### Other event kinds

- Emit `milestone` events from the `seedMilestones` array.
- Emit `deadline · critical path` events from the `critical` array (passport
  renewal, employer reference letter, visa evidence pack, IELTS booking), plus
  lead-time reminder events at T-14 days and T-3 days.
- Emit `planned session` for blocks the schedule reserves but leaves open
  (buffer, catch-up, application-sending time once the Feb 2027 wave opens).

---

## Step 3 — Sourcing lesson-level detail

Module titles exist in the seed data. Lesson-level detail does not. Pick an
approach and tell me which you used:

- **(a) Verified** — fetch the published syllabus from the course URLs already in
  `seed-data.ts` and commit it as a static JSON fixture (e.g.
  `data/syllabi/{courseId}.json`). Preferred where the page is fetchable.
- **(b) Derived** — construct a defensible breakdown from module title + hour
  estimate.

Add a `source: "verified" | "derived"` field to any generated lesson detail.
Do not invent lesson names that read as official without marking them derived —
the whole point is a schedule that can be trusted at 6am.

---

## Step 4 — Constraints

- Do not break `buildSeedData()` or the existing reschedule chain.
- Respect current types. If `DayEvent` genuinely needs new fields, extend the
  schema properly and write the migration in the established style.
- Touch only what this feature needs.
- Work on a branch: `git checkout -b feat/detailed-schedule`. Small, reviewable
  commits — generator, syllabus fixtures, wiring, tests — not one large commit.
- Keep `seed-data.ts` readable. It is the file I edit by hand most often.

---

## Step 5 — Definition of done

- Typecheck and build pass.
- Calendar renders events continuously from Aug 2026 through Feb 2028.
- Running the generator twice produces zero duplicate ids.
- "Replan from today" regenerates the calendar without orphaned or stale events.
- No week exceeds the configured capacity. Print a table of scheduled hours per
  week for the first 12 weeks so I can eyeball it.
- Print one fully expanded sample week (pick the week the IBM RAG certificate
  overlaps the PostgreSQL warm-up track — that is the busiest crossover) so I can
  see what a real day looks like before I trust the other 500.
- A test asserting the Learn ≤ 60% ratio and the presence of spaced Retrieve
  sessions.

---

## Step 6 — Report back

When done, summarise:

- total scheduled hours, and hours by session type
- any week where capacity had to be exceeded, and why
- which courses got verified syllabi vs derived breakdowns
- anything in the roadmap that looks unschedulable at the stated capacity —
  I would rather cut a course than pretend the hours fit
