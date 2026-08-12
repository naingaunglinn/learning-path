import type {
  ActivityEvent,
  CollectionType,
  Profile,
} from "./schemas";
import { weekStartISO } from "./dates";

/* ------------------------------------------------------------------ */
/* Seed content — data only, no app logic.                             */
/* Ids are stable slugs so entities can cross-reference each other     */
/* (skills -> proof points, weekly items -> source items).             */
/* ------------------------------------------------------------------ */

export const seedProfile: Profile = {
  name: "Naing Aung Linn",
  age: 26,
  location: "Yangon, Myanmar",
  role: "Senior Web Developer",
  company: "MML Web Development",
  employedSince: "2018-05",
  stack: [
    "JavaScript", "TypeScript", "PHP", "Python", "Laravel", "Node.js",
    "React", "Tailwind", "MySQL", "PostgreSQL", "Git", "REST",
    "GraphQL", "AWS", "Azure", "Stripe",
  ],
  targetRoles: [
    "Senior / Mid-Senior Full-Stack (JS/TS)",
    "Backend (Laravel / Node)",
    "AI Application / LLM Integration",
    "Fintech / Payments Integration",
    "Forward-Deployed / Solutions Engineer",
    "Platform / DevOps → SRE",
  ],
  timelineStart: "2026-08",
  timelineMonths: 18,
  targetDate: "2027-02-01",
  targetLabel: "first EU application wave",
};

type Seed = { [K in keyof CollectionType]: Array<Omit<CollectionType[K], "createdAt" | "updatedAt">> };

const seed: Seed = {
  /* ---------------- Action Tracker ---------------- */

  gapProjects: [
    {
      id: "gp-adr", tags: ["writing", "architecture", "quick-win"],
      title: "Publish 3 architecture decision records",
      gap: "Visible engineering judgment — nothing public shows how I think",
      scope: "Write and publish ADRs mined from existing production systems: Stripe points ledger (Horse Support), CI/CD pipeline (School Mgmt), multi-tenant contract flow (Car Rental).",
      techStack: ["Markdown", "GitHub"],
      estWeeks: "1–2 wks", targetMetric: "3 ADRs public",
      status: "in_progress", progress: 20, starred: true,
    },
    {
      id: "gp-rag", tags: ["ai", "llm", "portfolio-piece"],
      title: "RAG assistant with eval harness",
      gap: "AI application engineering — no shipped LLM work",
      scope: "Retrieval-augmented assistant on pgvector with hybrid search + reranking, plus an eval harness that reports retrieval quality per release.",
      techStack: ["Python", "pgvector", "PostgreSQL", "OpenAI/Claude API"],
      estWeeks: "4–6 wks", targetMetric: "recall@k tracked per release",
      status: "not_started", progress: 0, starred: false,
    },
    {
      id: "gp-llm-feature", tags: ["ai", "llm", "production"],
      title: "LLM feature with streaming + cost tracking",
      gap: "Production LLM operations — latency and unit economics",
      scope: "User-facing LLM feature with token streaming, per-request cost metering, and a small ops dashboard.",
      techStack: ["TypeScript", "Node.js", "SSE", "Claude API"],
      estWeeks: "3–4 wks", targetMetric: "p95 latency + cost/request dashboards",
      status: "not_started", progress: 0, starred: false,
    },
    {
      id: "gp-nextjs", tags: ["frontend", "typescript"],
      title: "Next.js + strict TypeScript migration",
      gap: "Modern React stack depth beyond CRA-era patterns",
      scope: "Migrate an existing React app to Next.js App Router under strict TypeScript; measure before/after.",
      techStack: ["Next.js", "TypeScript", "Tailwind"],
      estWeeks: "3–4 wks", targetMetric: "type coverage % + Lighthouse score",
      status: "not_started", progress: 0, starred: false,
    },
    {
      id: "gp-sre", tags: ["devops", "sre", "platform"],
      title: "Kubernetes + observability + Terraform + SLOs",
      gap: "Platform/SRE credibility — infra as code and reliability practice",
      scope: "Run a real service on Kubernetes with Prometheus/Grafana, Terraform-managed infra, and written SLOs with error budgets.",
      techStack: ["Kubernetes", "Prometheus", "Grafana", "Terraform"],
      estWeeks: "6–8 wks", targetMetric: "documented SLO with error budget",
      status: "not_started", progress: 0, starred: false,
    },
  ],

  milestones: [
    { id: "ms-2026-08", month: "2026-08", kind: "milestone", status: "done", tags: [],
      title: "Plan locked, foundation sprint", detail: "Command center live, financial aid filed, ADR #1 drafted." },
    { id: "ms-2026-09", month: "2026-09", kind: "milestone", status: "upcoming", tags: [],
      title: "3 ADRs published", detail: "Paperwork critical path cleared: passport + reference letter in motion." },
    { id: "ms-2026-10", month: "2026-10", kind: "decision", status: "upcoming", tags: [],
      title: "Direction check: AI-first vs full-stack-first", detail: "Pick portfolio emphasis based on ADR traction and market signal." },
    { id: "ms-2026-11", month: "2026-11", kind: "milestone", status: "upcoming", tags: [],
      title: "RAG assistant shipped", detail: "Eval harness reporting recall@k; write-up published." },
    { id: "ms-2027-01", month: "2027-01", kind: "milestone", status: "upcoming", tags: [],
      title: "LLM streaming feature shipped", detail: "IBM Gen AI certificate completed alongside." },
    { id: "ms-2027-02", month: "2027-02", kind: "decision", status: "upcoming", tags: [],
      title: "Open first application wave?", detail: "Germany §18g already satisfied — go/extend based on portfolio strength." },
    { id: "ms-2027-03", month: "2027-03", kind: "milestone", status: "upcoming", tags: [],
      title: "Resume v2 + Next.js migration done", detail: "All four resume fixes closed; applications running weekly." },
    { id: "ms-2027-05", month: "2027-05", kind: "milestone", status: "upcoming", tags: [],
      title: "SRE project + Google Cloud cert", detail: "Platform/DevOps track credible on paper and in repo." },
    { id: "ms-2027-06", month: "2027-06", kind: "decision", status: "upcoming", tags: [],
      title: "Route decision: DE Blue Card vs NL HSM vs IE CSEP", detail: "Choose based on live pipeline, not theory." },
    { id: "ms-2027-08", month: "2027-08", kind: "milestone", status: "upcoming", tags: [],
      title: "Target: signed offer", detail: "" },
    { id: "ms-2027-10", month: "2027-10", kind: "milestone", status: "upcoming", tags: [],
      title: "Visa filed", detail: "Evidence pack ready since 2026 — no scramble." },
    { id: "ms-2028-01", month: "2028-01", kind: "milestone", status: "upcoming", tags: [],
      title: "Relocation window", detail: "" },
  ],

  courses: [
    { id: "co-genai-llms", tags: ["ai"], title: "Generative AI with Large Language Models",
      provider: "DeepLearning.AI + AWS", duration: "~3 wks", targetStartMonth: 1,
      status: "in_progress", hiringWeight: "high",
      url: "https://www.coursera.org/learn/generative-ai-with-llms",
      completedDate: null, aidApplicable: true, financialAidStatus: "approved",
      aidAppliedDate: "2026-07-05", aidApprovedDate: "2026-07-20", completionDeadline: "2027-01-16" },
    { id: "co-system-design", tags: ["architecture"], title: "System design self-study",
      provider: "Self-study (not Coursera)", duration: "ongoing", targetStartMonth: 2,
      status: "in_progress", hiringWeight: "high", url: "",
      completedDate: null, aidApplicable: false, financialAidStatus: "not_applied",
      aidAppliedDate: null, aidApprovedDate: null, completionDeadline: null },
    { id: "co-ibm-genai", tags: ["ai"], title: "IBM Generative AI Engineering Professional Certificate",
      provider: "IBM", duration: "~6 mo", targetStartMonth: 3,
      status: "not_started", hiringWeight: "high",
      url: "https://www.coursera.org/professional-certificates/ibm-generative-ai-engineering",
      completedDate: null, aidApplicable: true, financialAidStatus: "applied",
      aidAppliedDate: "2026-08-10", aidApprovedDate: null, completionDeadline: null },
    { id: "co-python-ai", tags: ["ai", "python"], title: "Python for AI",
      provider: "Coursera", duration: "~4 wks", targetStartMonth: 5,
      status: "not_started", hiringWeight: "medium", url: "",
      completedDate: null, aidApplicable: true, financialAidStatus: "not_applied",
      aidAppliedDate: null, aidApprovedDate: null, completionDeadline: null },
    { id: "co-sre-gcp", tags: ["devops", "sre"], title: "SRE and DevOps Engineer with Google Cloud",
      provider: "Google Cloud", duration: "~2 mo", targetStartMonth: 7,
      status: "not_started", hiringWeight: "high",
      url: "https://www.coursera.org/professional-certificates/sre-devops-engineer-google-cloud",
      completedDate: null, aidApplicable: true, financialAidStatus: "not_applied",
      aidAppliedDate: null, aidApprovedDate: null, completionDeadline: null },
  ],

  networking: [
    { id: "nw-stripe", tags: ["fintech", "ireland"], name: "Stripe (Dublin)", kind: "company",
      status: "not_contacted", lastTouched: null, notes: "Top target — payments experience is the hook.", url: "https://stripe.com/jobs" },
    { id: "nw-datadog", tags: ["ireland"], name: "Datadog", kind: "company",
      status: "not_contacted", lastTouched: null, notes: "Observability angle pairs with SRE track.", url: "https://careers.datadoghq.com" },
    { id: "nw-hubspot", tags: ["ireland"], name: "HubSpot", kind: "company",
      status: "not_contacted", lastTouched: null, notes: "", url: "https://www.hubspot.com/careers" },
    { id: "nw-msft-ie", tags: ["ireland"], name: "Microsoft Ireland", kind: "company",
      status: "not_contacted", lastTouched: null, notes: "", url: "https://careers.microsoft.com" },
    { id: "nw-startups", tags: ["germany", "netherlands"], name: "Berlin / Amsterdam startups", kind: "company",
      status: "not_contacted", lastTouched: null, notes: "Blue Card §18g / NL HSM friendly; sponsor lists on the job boards below.", url: "" },
    { id: "nw-arbeitnow", tags: ["germany"], name: "Arbeitnow", kind: "job_board",
      status: "not_contacted", lastTouched: null, notes: "Visa-sponsorship filter.", url: "https://www.arbeitnow.com" },
    { id: "nw-nextlevel", tags: ["europe"], name: "Next Level Jobs EU", kind: "job_board",
      status: "not_contacted", lastTouched: null, notes: "", url: "https://nextleveljobs.eu" },
    { id: "nw-relocate", tags: ["europe"], name: "Relocate.me", kind: "job_board",
      status: "not_contacted", lastTouched: null, notes: "", url: "https://relocate.me" },
    { id: "nw-laracasts", tags: ["laravel", "community"], name: "Laracasts Discord", kind: "community",
      status: "in_conversation", lastTouched: "2026-08-08", notes: "Active member — surface finished work here.", url: "https://laracasts.com" },
    { id: "nw-langchain", tags: ["ai", "community"], name: "LangChain community", kind: "community",
      status: "not_contacted", lastTouched: null, notes: "Post the RAG assistant write-up when shipped.", url: "" },
  ],

  critical: [
    { id: "cp-passport", tags: ["visa", "paperwork"], status: "open", deadline: "2026-09-30",
      title: "Renew passport (UID) inside Myanmar",
      detail: "Maximum validity. Everything downstream — visa filing, travel — blocks on this." },
    { id: "cp-reference", tags: ["visa", "paperwork"], status: "open", deadline: "2026-09-15",
      title: "8-year employer reference letter from MML",
      detail: "On letterhead: dates, role, technologies. Needed for §18g experience proof and CSEP." },
    { id: "cp-evidence", tags: ["visa", "paperwork"], status: "open", deadline: "2026-10-31",
      title: "Assemble visa evidence pack",
      detail: "Contract, dated payslips, tax records — one folder, scanned + originals." },
    { id: "cp-coursera-aid", tags: ["learning"], status: "in_progress", deadline: "2026-08-25",
      title: "Set up Coursera Financial Aid",
      detail: "15-day review period per course — file for IBM cert now so it's approved by October." },
  ],

  weekly: [
    { id: "wk-1", weekStart: weekStartISO(), title: "Draft ADR #1 — Stripe points ledger design",
      refType: "gap_project", refId: "gp-adr", done: true, carriedOver: 0, tags: [] },
    { id: "wk-2", weekStart: weekStartISO(), title: "File Coursera Financial Aid (IBM cert)",
      refType: "critical", refId: "cp-coursera-aid", done: false, carriedOver: 0, tags: [] },
    { id: "wk-3", weekStart: weekStartISO(), title: "Book passport renewal appointment",
      refType: "critical", refId: "cp-passport", done: false, carriedOver: 1, tags: [] },
    { id: "wk-4", weekStart: weekStartISO(), title: "Week 1 of Generative AI with LLMs",
      refType: "course", refId: "co-genai-llms", done: false, carriedOver: 0, tags: [] },
  ],

  resumeFixes: [
    { id: "rf-gap", status: "open", tags: ["resume"],
      title: "Fill the 2018–2022 project gap",
      detail: "Car Rental starts 2022 — surface earlier MML work so the first four years aren't blank." },
    { id: "rf-phases", status: "open", tags: ["resume"],
      title: "Restructure MML entry into three phases",
      detail: "Junior → Mid → Senior with dates, so 8 years reads as progression, not repetition." },
    { id: "rf-quantify", status: "open", tags: ["resume"],
      title: "Quantify every bullet",
      detail: "Pull real numbers: users, transactions, uptime, latency. No number, no bullet." },
    { id: "rf-education", status: "open", tags: ["resume"],
      title: "State education precisely",
      detail: "\"Completed 3 years of B.C.Sc coursework (not conferred)\" — accurate and scannable." },
  ],

  visaTracks: [
    { id: "vt-de-18g", country: "Germany", name: "EU Blue Card §18g", tags: [],
      threshold: "€45,934.20 salary", requirement: "≥3 yrs IT experience, no degree required",
      eligibleNow: true, notes: "Already eligible on experience — salary threshold is the only gate." },
    { id: "vt-de-19c", country: "Germany", name: "§19c(2) IT specialist", tags: [],
      threshold: "~€45,630 salary", requirement: "2 yrs experience",
      eligibleNow: true, notes: "Fallback if a Blue Card offer lands slightly under threshold." },
    { id: "vt-nl-hsm", country: "Netherlands", name: "Highly Skilled Migrant", tags: [],
      threshold: "€4,357/mo (under 30)", requirement: "Recognized sponsor employer",
      eligibleNow: false, notes: "Age advantage until 30 — sponsor list is public, target those companies." },
    { id: "vt-ie-csep", country: "Ireland", name: "Critical Skills Employment Permit", tags: [],
      threshold: "€68,911 (no-degree route)", requirement: "Job offer on critical skills list",
      eligibleNow: false, notes: "High bar without degree — Stripe/Datadog salaries clear it." },
    { id: "vt-pt-d3", country: "Portugal", name: "D3 highly qualified", tags: [],
      threshold: "Qualified activity", requirement: "5+ yrs experience limb",
      eligibleNow: true, notes: "Experience limb satisfied; weakest salary market of the five." },
  ],

  /* ---------------- Skills Portfolio Log ---------------- */

  portfolio: [
    {
      id: "pp-horse", tags: ["fintech", "payments", "aws"],
      title: "Horse Support System (umapoi.jp)",
      url: "https://umapoi.jp", startDate: "2023-04", endDate: "2023-10",
      techStack: ["React", "Laravel", "PostgreSQL", "AWS", "Stripe"],
      summary: "Fan donation platform with a Stripe payment flow and an internal points system.",
      metrics: ["Payments + points ledger in production since 2023-10", "0 payment-integrity incidents"],
      proves: "Can design and ship a real-money flow end-to-end: Stripe integration, webhook reconciliation, idempotent points ledger.",
    },
    {
      id: "pp-events", tags: ["serverless", "graphql", "aws"],
      title: "Event Management App (key-persons.jp)",
      url: "https://key-persons.jp", startDate: "2022-12", endDate: "2023-03",
      techStack: ["React", "TypeScript", "GraphQL", "MUI", "AWS Lambda"],
      summary: "Event platform for a Japanese client, including a realtime chat feature on serverless infrastructure.",
      metrics: ["Chat feature shipped on AWS Lambda", "Delivered across a JP–MM timezone gap"],
      proves: "Comfortable in a typed GraphQL/serverless stack and with async client communication across languages and timezones.",
    },
    {
      id: "pp-school", tags: ["devops", "ci-cd", "laravel"],
      title: "School Management System",
      url: "", startDate: "2023-12", endDate: null,
      techStack: ["React", "Laravel", "PostgreSQL", "Ubuntu"],
      summary: "Full school administration system, self-hosted on Ubuntu with a CI/CD pipeline I built and operate.",
      metrics: ["In production since 2024", "CI/CD pipeline: push-to-deploy"],
      proves: "Owns the full lifecycle — not just code but deployment, server management, and release automation.",
    },
    {
      id: "pp-carrental", tags: ["azure", "laravel", "long-running"],
      title: "Car Rental Admin Dashboard",
      url: "", startDate: "2022-01", endDate: null,
      techStack: ["Laravel", "Azure", "MySQL"],
      summary: "Back-office system covering contracts, quotations, delivery inspection, and payments.",
      metrics: ["4.5+ yrs in production, continuously maintained", "4 business workflows digitized"],
      proves: "Long-horizon ownership of a business-critical system on Azure — the opposite of demo-ware.",
    },
  ],

  skills: [
    { id: "sk-js", name: "JavaScript", proficiency: "expert", yearsUsed: 8, proofPointIds: ["pp-horse", "pp-events", "pp-school"], tags: [] },
    { id: "sk-ts", name: "TypeScript", proficiency: "proficient", yearsUsed: 4, proofPointIds: ["pp-events"], tags: [] },
    { id: "sk-php", name: "PHP", proficiency: "expert", yearsUsed: 8, proofPointIds: ["pp-carrental", "pp-school"], tags: [] },
    { id: "sk-laravel", name: "Laravel", proficiency: "expert", yearsUsed: 7, proofPointIds: ["pp-horse", "pp-school", "pp-carrental"], tags: [] },
    { id: "sk-react", name: "React", proficiency: "proficient", yearsUsed: 5, proofPointIds: ["pp-horse", "pp-events", "pp-school"], tags: [] },
    { id: "sk-node", name: "Node.js", proficiency: "proficient", yearsUsed: 5, proofPointIds: ["pp-events"], tags: [] },
    { id: "sk-python", name: "Python", proficiency: "working", yearsUsed: 2, proofPointIds: [], tags: [] },
    { id: "sk-postgres", name: "PostgreSQL", proficiency: "proficient", yearsUsed: 4, proofPointIds: ["pp-horse", "pp-school"], tags: [] },
    { id: "sk-mysql", name: "MySQL", proficiency: "expert", yearsUsed: 8, proofPointIds: ["pp-carrental"], tags: [] },
    { id: "sk-graphql", name: "GraphQL", proficiency: "working", yearsUsed: 3, proofPointIds: ["pp-events"], tags: [] },
    { id: "sk-aws", name: "AWS", proficiency: "working", yearsUsed: 3, proofPointIds: ["pp-horse", "pp-events"], tags: [] },
    { id: "sk-azure", name: "Azure", proficiency: "working", yearsUsed: 3, proofPointIds: ["pp-carrental"], tags: [] },
    { id: "sk-stripe", name: "Stripe", proficiency: "working", yearsUsed: 2, proofPointIds: ["pp-horse"], tags: [] },
    { id: "sk-tailwind", name: "Tailwind", proficiency: "proficient", yearsUsed: 3, proofPointIds: [], tags: [] },
  ],

  achievements: [
    { id: "ac-8yrs", value: "8 yrs", context: "Continuous employment at MML Web Development (May 2018 → present)", date: "2026-05-01", sourceProjectId: null, tags: ["experience"] },
    { id: "ac-4systems", value: "4", context: "Production systems delivered and maintained concurrently", date: null, sourceProjectId: null, tags: ["delivery"] },
    { id: "ac-45yrs-carrental", value: "4.5+ yrs", context: "Single business-critical admin platform maintained in production", date: null, sourceProjectId: "pp-carrental", tags: ["ownership"] },
    { id: "ac-2clouds", value: "2 clouds", context: "AWS and Azure both running production workloads I operate", date: null, sourceProjectId: null, tags: ["devops"] },
    { id: "ac-zero-incidents", value: "0", context: "Payment-integrity incidents since Stripe donation launch (needs verification from logs)", date: null, sourceProjectId: "pp-horse", tags: ["payments"] },
  ],

  certifications: [],

  stories: [
    {
      id: "st-stripe-launch", tags: ["payments"],
      title: "Shipping the Stripe donation + points launch on deadline",
      competencyTags: ["ownership", "system_design"],
      situation: "The horse-support platform had to launch donations and a points system before the racing season — a hard external date.",
      task: "Own the payment flow end-to-end, from Stripe integration to how points would be credited reliably.",
      action: "Designed webhook-driven reconciliation with an idempotent points ledger in PostgreSQL, so retries and duplicate events could never double-credit; built admin views for manual correction.",
      result: "Launched on time in October 2023. No payment-integrity incidents since; corrections handled in-app without engineering intervention.",
    },
    {
      id: "st-cicd", tags: ["devops"],
      title: "Building CI/CD for a self-hosted school system",
      competencyTags: ["ownership", "delivery"],
      situation: "The school management system deployed to a bare Ubuntu server; releases were manual, error-prone, and made everyone nervous.",
      task: "Make deploys boring without any managed platform budget.",
      action: "Set up a push-to-deploy pipeline with zero-downtime releases, migrations gated behind health checks, and instant rollback to the previous release directory.",
      result: "Deploys went from a scheduled event to a non-event — multiple releases per week, no deploy-related outages since.",
    },
    {
      id: "st-jp-client", tags: ["client-work"],
      title: "Delivering a chat feature for a Japanese client remotely",
      competencyTags: ["client_management", "cross_functional_communication"],
      situation: "key-persons.jp needed a realtime chat feature; requirements arrived in Japanese, across a timezone gap, through a coordinator.",
      task: "Extract precise requirements and deliver without a shared language or overlapping hours.",
      action: "Switched communication to annotated screens and short screen recordings instead of prose; confirmed each behavior with a one-line yes/no list before building on AWS Lambda + GraphQL.",
      result: "Feature accepted with one revision round. The annotated-screens format became the default for the client relationship.",
    },
  ],

  activity: [],
};

/** Stamp seed rows with created/updated timestamps at seed time. */
export function buildSeedData(): { [K in keyof CollectionType]: CollectionType[K][] } {
  const now = new Date().toISOString();
  const stamped = Object.fromEntries(
    Object.entries(seed).map(([key, rows]) => [
      key,
      rows.map((row) => ({ createdAt: now, updatedAt: now, ...row })),
    ])
  ) as unknown as { [K in keyof CollectionType]: CollectionType[K][] };

  const seededEvent: ActivityEvent = {
    id: "act-seeded",
    at: now,
    kind: "seeded",
    message: "Workspace seeded — 18-month plan, portfolio, and critical path loaded",
  };
  stamped.activity = [seededEvent];
  return stamped;
}
