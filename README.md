# Career Command Center

Single-user, local-first career dashboard for weekly planning and resume-evidence mining.
Two modules: the forward-looking **Action Tracker** (skill-gap projects, 18-month timeline,
learning roadmap with Coursera Financial Aid tracking, networking, critical path, weekly planner)
and the backward-looking **Skills Portfolio Log** (projects, skills with proof points, quantified
achievements, learning completions, STAR stories, resume-bullet generator).

## Run

```bash
npm install
npm run dev        # http://localhost:3000
```

First load seeds the workspace from `lib/seed-data.ts`. Everything persists to `localStorage`
(`ccc:v1:*`) — use **Data → Export** for JSON backups and **Data → Import** to restore.

## Stack

Next.js 15 (App Router, strict TypeScript) · Tailwind CSS v4 · shadcn/ui · Motion (`motion/react`)
· Recharts · Sonner · Zod.

## Architecture notes

- **Persistence boundary:** all storage goes through `lib/storage.ts` (typed repositories,
  Zod-validated on read/write, cross-tab sync, activity log, export/import envelope). Swap this
  file's backend to move to a real database.
- **Schemas:** every stored entity is defined in `lib/schemas.ts`; `schemaVersion` in the meta key
  gates migrations (`ensureSeeded`).
- **Derived aid deadlines:** Coursera Financial Aid logic lives in `lib/aid.ts` — apply-by dates
  (start month − 21 days), 180-day completion windows, and the ~11-pending ceiling. The stored
  `completionDeadline` is always recomputed from `aidApprovedDate`, never hand-edited.
- **Motion:** shared tokens in `lib/motion.ts`; `MotionConfig reducedMotion="user"` plus manual
  gating for count-ups and chart draws honors `prefers-reduced-motion` everywhere.
- **Learning completions:** the Portfolio section renders completed courses live from the courses
  store by id — course records are never duplicated into the certifications collection.
