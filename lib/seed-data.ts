import type {
  ActivityEvent,
  CollectionType,
  Profile,
} from "./schemas";
import { weekStartISO } from "./dates";
import { rescheduleFrom } from "./schedule";

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
    "AI / GenAI Engineer (LLM applications, RAG, agents)",
    "Senior Backend shipping GenAI (Python / TS)",
    "Senior / Mid-Senior Full-Stack (JS/TS)",
    "Fintech / Payments Integration",
    "Platform / DevOps → SRE",
  ],
  timelineStart: "2026-08",
  timelineMonths: 18,
  targetDate: "2027-02-01",
  targetLabel: "first EU application wave",
  workspaceCreatedAt: "2026-08-12", // re-stamped with the real date at seed time
};

type Seed = { [K in keyof CollectionType]: Array<Omit<CollectionType[K], "createdAt" | "updatedAt">> };

/* The learning path — every course verified live on Coursera (2026-08) and
   included in Coursera Plus. Sequenced for ~10 focused hours/week around the
   thesis: a senior backend engineer who ships GenAI systems, not a
   from-scratch ML researcher. Exported for the v5 migration.
   Module checklists mirror each course's published syllabus (verified
   2026-08); self-study rows carry an authored topic list instead. */

/** Deterministic module rows from syllabus titles — ids are stable so the
    v10 migration and future merges can key on them. */
const mods = (courseId: string, titles: string[]) =>
  titles.map((title, i) => ({
    id: `${courseId}-m${String(i + 1).padStart(2, "0")}`,
    title,
    done: false,
    completedDate: null,
  }));

export const seedCourses: Seed["courses"] = [
  /* -------- Phase 1 · Foundations (M1–M4) -------- */
  { id: "co-genai-llms", tags: ["ai"], phase: "Foundations",
    title: "Generative AI with Large Language Models",
    provider: "DeepLearning.AI + AWS", duration: "~17 h", durationWeeks: 2, targetStartMonth: 1, plannedStartDate: null,
    status: "in_progress", hiringWeight: "high",
    url: "https://www.coursera.org/learn/generative-ai-with-llms",
    modules: mods("co-genai-llms", [
      "Week 1 · Generative AI use cases, project lifecycle, and model pre-training",
      "Week 2 · Fine-tuning and evaluating large language models",
      "Week 3 · Reinforcement learning and LLM-powered applications",
    ]),
    completedDate: null, aidApplicable: false, financialAidStatus: "not_applied",
    aidAppliedDate: null, aidApprovedDate: null, completionDeadline: null },
  { id: "co-python-ai", tags: ["ai", "python"], phase: "Foundations",
    title: "Python for Data Science, AI & Development",
    provider: "IBM", duration: "~25 h · fast review", durationWeeks: 3, targetStartMonth: 1, plannedStartDate: null,
    status: "not_started", hiringWeight: "medium",
    url: "https://www.coursera.org/learn/python-for-applied-data-science-ai",
    modules: mods("co-python-ai", [
      "Module 1 · Python Basics",
      "Module 2 · Python Data Structures",
      "Module 3 · Python Programming Fundamentals",
      "Module 4 · Working with Data in Python",
      "Module 5 · APIs and Data Collection",
    ]),
    completedDate: null, aidApplicable: false, financialAidStatus: "not_applied",
    aidAppliedDate: null, aidApprovedDate: null, completionDeadline: null },
  { id: "co-ml-spec", tags: ["ai", "ml"], phase: "Foundations",
    title: "Machine Learning Specialization",
    provider: "DeepLearning.AI + Stanford", duration: "3 courses · ~95 h", durationWeeks: 10, targetStartMonth: 2, plannedStartDate: null,
    status: "not_started", hiringWeight: "high",
    url: "https://www.coursera.org/specializations/machine-learning-introduction",
    modules: mods("co-ml-spec", [
      "Course 1 · Supervised Machine Learning: Regression and Classification",
      "Course 2 · Advanced Learning Algorithms",
      "Course 3 · Unsupervised Learning, Recommenders, Reinforcement Learning",
    ]),
    completedDate: null, aidApplicable: false, financialAidStatus: "not_applied",
    aidAppliedDate: null, aidApprovedDate: null, completionDeadline: null },
  { id: "co-genai-swdev", tags: ["ai", "dev-workflow"], phase: "Foundations",
    title: "Generative AI for Software Development",
    provider: "DeepLearning.AI", duration: "3 courses · ~34 h", durationWeeks: 4, targetStartMonth: 4, plannedStartDate: null,
    status: "not_started", hiringWeight: "medium",
    url: "https://www.coursera.org/specializations/generative-ai-for-software-development",
    modules: mods("co-genai-swdev", [
      "Course 1 · Introduction to Generative AI for Software Development",
      "Course 2 · Team Software Engineering with AI",
      "Course 3 · AI-Powered Software and System Design",
    ]),
    completedDate: null, aidApplicable: false, financialAidStatus: "not_applied",
    aidAppliedDate: null, aidApprovedDate: null, completionDeadline: null },

  /* -------- Phase 2 · GenAI engineering (M5–M9) -------- */
  { id: "co-ibm-genai", tags: ["ai", "llm"], phase: "GenAI engineering",
    title: "Generative AI Engineering with LLMs",
    provider: "IBM", duration: "7 courses · ~48 h", durationWeeks: 6, targetStartMonth: 5, plannedStartDate: null,
    status: "not_started", hiringWeight: "high",
    url: "https://www.coursera.org/specializations/generative-ai-engineering-with-llms",
    modules: mods("co-ibm-genai", [
      "Course 1 · Generative AI and LLMs: Architecture and Data Preparation",
      "Course 2 · Gen AI Foundational Models for NLP & Language Understanding",
      "Course 3 · Generative AI Language Modeling with Transformers",
      "Course 4 · Generative AI Engineering and Fine-Tuning Transformers",
      "Course 5 · Generative AI Advanced Fine-Tuning for LLMs",
      "Course 6 · Fundamentals of AI Agents Using RAG and LangChain",
      "Course 7 · Project: Generative AI Applications with RAG and LangChain",
    ]),
    completedDate: null, aidApplicable: false, financialAidStatus: "not_applied",
    aidAppliedDate: null, aidApprovedDate: null, completionDeadline: null },
  { id: "co-ibm-rag-agentic", tags: ["ai", "rag", "agents"], phase: "GenAI engineering",
    title: "IBM RAG and Agentic AI Professional Certificate",
    provider: "IBM", duration: "10 courses · ~2 mo", durationWeeks: 8, targetStartMonth: 6, plannedStartDate: null,
    status: "not_started", hiringWeight: "high",
    url: "https://www.coursera.org/professional-certificates/ibm-rag-and-agentic-ai",
    modules: mods("co-ibm-rag-agentic", [
      "Course 1 · Develop Generative AI Applications: Get Started",
      "Course 2 · Build RAG Applications: Get Started",
      "Course 3 · Vector Databases for RAG: An Introduction",
      "Course 4 · Advanced RAG with Vector Databases and Retrievers",
      "Course 5 · Build Multimodal Generative AI Applications",
      "Course 6 · Fundamentals of Building AI Agents",
      "Course 7 · Agentic AI with LangChain and LangGraph",
      "Course 8 · Agentic AI with LangGraph, CrewAI, AutoGen and BeeAI",
      "Course 9 · Build AI Agents using MCP",
      "Course 10 · RAG and Agentic AI Capstone Project",
    ]),
    completedDate: null, aidApplicable: false, financialAidStatus: "not_applied",
    aidAppliedDate: null, aidApprovedDate: null, completionDeadline: null },
  /* Open-ended rows own the Sunday slot — scheduled after the Warm-up
     track's last Sunday block so the two never collide. */
  { id: "co-system-design", tags: ["architecture"], phase: "GenAI engineering",
    title: "System design self-study",
    provider: "Self-study (not Coursera)", duration: "ongoing · Sundays", durationWeeks: null, targetStartMonth: 9, plannedStartDate: null,
    status: "not_started", hiringWeight: "high", url: "",
    modules: mods("co-system-design", [
      "Load balancing, stateless services & horizontal scale",
      "Caching layers, eviction & invalidation",
      "Database replication, sharding & partitioning",
      "Consistency models, transactions & isolation",
      "Message queues, async processing & idempotency",
      "Rate limiting, backpressure & graceful degradation",
      "Search & indexing at scale",
      "Observability: metrics, logs, traces & SLOs",
      "Design practice: URL shortener + pastebin",
      "Design practice: chat / realtime updates",
      "Design practice: news feed + notifications",
      "Design practice: payment system + ledger",
    ]),
    completedDate: null, aidApplicable: false, financialAidStatus: "not_applied",
    aidAppliedDate: null, aidApprovedDate: null, completionDeadline: null },

  /* -------- Phase 3 · Production & cloud (M9–M12) -------- */
  { id: "co-english-career", tags: ["english", "applications"], phase: "Production & cloud",
    title: "English for Career Development",
    provider: "University of Pennsylvania", duration: "~25 h", durationWeeks: 3, targetStartMonth: 9, plannedStartDate: null,
    status: "not_started", hiringWeight: "medium",
    url: "https://www.coursera.org/learn/careerdevelopment",
    modules: mods("co-english-career", [
      "Unit 1: Entering the Job Market",
      "Unit 2: Resumes",
      "Unit 3: Writing a Cover Letter",
      "Unit 4: Networking",
      "Unit 5: Interviewing For a Job",
    ]),
    completedDate: null, aidApplicable: false, financialAidStatus: "not_applied",
    aidAppliedDate: null, aidApprovedDate: null, completionDeadline: null },
  { id: "co-sre-gcp", tags: ["devops", "sre"], phase: "Production & cloud",
    title: "Cloud DevOps Engineer (Google Cloud cert prep)",
    provider: "Google Cloud", duration: "4 courses · ~36 h", durationWeeks: 4, targetStartMonth: 10, plannedStartDate: null,
    status: "not_started", hiringWeight: "high",
    url: "https://www.coursera.org/professional-certificates/sre-devops-engineer-google-cloud",
    modules: mods("co-sre-gcp", [
      "Course 1 · Developing a Google SRE Culture",
      "Course 2 · Reliable Google Cloud Infrastructure: Design and Process",
      "Course 3 · Logging and Monitoring in Google Cloud",
      "Course 4 · Getting Started with Google Kubernetes Engine",
    ]),
    completedDate: null, aidApplicable: false, financialAidStatus: "not_applied",
    aidAppliedDate: null, aidApprovedDate: null, completionDeadline: null },

  /* -------- Phase 4 · Interview & landing (M13–M18) -------- */
  { id: "co-meta-interview", tags: ["interview"], phase: "Interview & landing",
    title: "Coding Interview Preparation",
    provider: "Meta", duration: "~11 h", durationWeeks: 2, targetStartMonth: 13, plannedStartDate: null,
    status: "not_started", hiringWeight: "medium",
    url: "https://www.coursera.org/learn/coding-interview-preparation",
    modules: mods("co-meta-interview", [
      "Module 1 · Introduction to the coding interview",
      "Module 2 · Introduction to Data Structures",
      "Module 3 · Introduction to Algorithms",
      "Module 4 · Final project",
    ]),
    completedDate: null, aidApplicable: false, financialAidStatus: "not_applied",
    aidAppliedDate: null, aidApprovedDate: null, completionDeadline: null },

  /* -------- Warm-up · parallel track (M1–M8, ~3 h/week on top) --------
     8 years of experience that is really 2 years × 4 loops: these backfill
     the fundamentals a compounding 8 years would have built. Every item ends
     by applying the material to a real production system (an ADR, an index,
     a hardening pass) so the loop breaks instead of repeating. */
  { id: "co-warmup-networking", tags: ["fundamentals", "networking"], phase: "Warm-up",
    title: "The Bits and Bytes of Computer Networking",
    provider: "Google", duration: "~20 h · 3 h/wk pace", durationWeeks: 7, targetStartMonth: 1, plannedStartDate: null,
    status: "not_started", hiringWeight: "medium",
    url: "https://www.coursera.org/learn/computer-networking",
    modules: mods("co-warmup-networking", [
      "Module 1 · Introduction to Networking",
      "Module 2 · The Network Layer",
      "Module 3 · The Transport and Application Layers",
      "Module 4 · Networking Services",
      "Module 5 · Connecting to the Internet",
      "Module 6 · Troubleshooting and the Future of Networking",
    ]),
    completedDate: null, aidApplicable: false, financialAidStatus: "not_applied",
    aidAppliedDate: null, aidApprovedDate: null, completionDeadline: null },
  { id: "co-warmup-algorithms", tags: ["fundamentals", "algorithms"], phase: "Warm-up",
    title: "Algorithmic Toolbox",
    provider: "UC San Diego", duration: "~40 h · 3 h/wk pace", durationWeeks: 13, targetStartMonth: 3, plannedStartDate: null,
    status: "not_started", hiringWeight: "medium",
    url: "https://www.coursera.org/learn/algorithmic-toolbox",
    modules: mods("co-warmup-algorithms", [
      "Module 1 · Programming Challenges",
      "Module 2 · Algorithmic Warm-up",
      "Module 3 · Greedy Algorithms",
      "Module 4 · Divide-and-Conquer",
      "Module 5 · Dynamic Programming 1",
      "Module 6 · Dynamic Programming 2",
    ]),
    completedDate: null, aidApplicable: false, financialAidStatus: "not_applied",
    aidAppliedDate: null, aidApprovedDate: null, completionDeadline: null },
  { id: "co-warmup-db", tags: ["fundamentals", "databases"], phase: "Warm-up",
    title: "Database internals — indexing, transactions, isolation",
    provider: "Self-study · Use the Index, Luke", duration: "4 wks · applied to the Car Rental DB", durationWeeks: 4, targetStartMonth: 4, plannedStartDate: null,
    status: "not_started", hiringWeight: "medium",
    url: "https://use-the-index-luke.com",
    modules: mods("co-warmup-db", [
      "Ch 1 · Anatomy of an SQL Index",
      "Ch 2 · The Where Clause",
      "Ch 3 · Performance and Scalability",
      "Ch 4 · The Join Operation",
      "Ch 5 · Clustering Data",
      "Ch 6 · Sorting and Grouping",
      "Ch 7 · Partial Results (pagination)",
      "Ch 8 · Modifying Data (insert, delete, update)",
      "Apply · Index audit on the Car Rental DB",
    ]),
    completedDate: null, aidApplicable: false, financialAidStatus: "not_applied",
    aidAppliedDate: null, aidApprovedDate: null, completionDeadline: null },
  { id: "co-warmup-patterns", tags: ["fundamentals", "architecture"], phase: "Warm-up",
    title: "Design Patterns",
    provider: "University of Alberta", duration: "~15 h · 3 h/wk pace", durationWeeks: 5, targetStartMonth: 6, plannedStartDate: null,
    status: "not_started", hiringWeight: "medium",
    url: "https://www.coursera.org/learn/design-patterns",
    modules: mods("co-warmup-patterns", [
      "Module 1 · Introduction to Design Patterns: Creational & Structural Patterns",
      "Module 2 · Behavioural Design Patterns",
      "Module 3 · Working with Design Patterns & Anti-patterns",
      "Module 4 · Capstone Challenge",
    ]),
    completedDate: null, aidApplicable: false, financialAidStatus: "not_applied",
    aidAppliedDate: null, aidApprovedDate: null, completionDeadline: null },
  { id: "co-warmup-security", tags: ["fundamentals", "security"], phase: "Warm-up",
    title: "Security pass — OWASP Top 10 on a production system",
    provider: "Self-study · OWASP", duration: "2 wks · write up findings", durationWeeks: 2, targetStartMonth: 8, plannedStartDate: null,
    status: "not_started", hiringWeight: "medium",
    url: "https://owasp.org/www-project-top-ten/",
    modules: mods("co-warmup-security", [
      "OWASP Top 10 · A01–A05 deep read",
      "OWASP Top 10 · A06–A10 deep read",
      "Hardening pass on one MML production system",
      "Write-up · findings, fixes & lessons",
    ]),
    completedDate: null, aidApplicable: false, financialAidStatus: "not_applied",
    aidAppliedDate: null, aidApprovedDate: null, completionDeadline: null },
];

/* Goal timeline the courses and capstones roll up into. Exported for the
   v5 migration. */
export const seedMilestones: Seed["milestones"] = [
  { id: "ms-2026-08", month: "2026-08", kind: "milestone", status: "done", tags: [],
    title: "Plan locked — Coursera Plus path live",
    detail: "Command center live; Generative AI with LLMs underway; ADR #1 drafted." },
  { id: "ms-2026-09", month: "2026-09", kind: "milestone", status: "upcoming", tags: [],
    title: "Cert #1: Generative AI with LLMs + 3 ADRs public",
    detail: "First certificate and first public engineering-judgment evidence land together." },
  { id: "ms-2026-10", month: "2026-10", kind: "decision", status: "upcoming", tags: [],
    title: "Lane check: senior backend + GenAI",
    detail: "Confirm positioning against ADR traction and job-ad language — the pure-ML lane is a trap without a degree." },
  { id: "ms-2026-11", month: "2026-11", kind: "milestone", status: "upcoming", tags: [],
    title: "Cert #2: Machine Learning Specialization",
    detail: "Andrew Ng fundamentals — the credibility base under every AI claim." },
  { id: "ms-2026-12", month: "2026-12", kind: "milestone", status: "upcoming", tags: [],
    title: "RAG assistant shipped",
    detail: "pgvector + hybrid search + eval harness, deployed publicly with a write-up." },
  { id: "ms-2027-01", month: "2027-01", kind: "milestone", status: "upcoming", tags: [],
    title: "Cert #3: Generative AI Engineering with LLMs",
    detail: "Fine-tuning with PyTorch/Hugging Face, RAG, LangChain." },
  { id: "ms-2027-02", month: "2027-02", kind: "decision", status: "upcoming", tags: [],
    title: "Open the first application wave?",
    detail: "Early market test — Germany §18g is already satisfied; calibrate the CV against real screens." },
  { id: "ms-2027-03", month: "2027-03", kind: "milestone", status: "upcoming", tags: [],
    title: "Resume v2 + LLM streaming feature shipped",
    detail: "All four resume fixes closed; p95 latency + cost dashboards public." },
  { id: "ms-2027-04", month: "2027-04", kind: "milestone", status: "upcoming", tags: [],
    title: "Cert #4: IBM RAG and Agentic AI",
    detail: "Vector DBs, agents, evals — the exact stack recruiters screen for." },
  { id: "ms-2027-06", month: "2027-06", kind: "decision", status: "upcoming", tags: [],
    title: "Route decision: DE Blue Card vs NL HSM vs IE CSEP",
    detail: "Choose on the live pipeline, not theory. Start document legalization now — Myanmar-side paperwork is slow." },
  { id: "ms-2027-07", month: "2027-07", kind: "milestone", status: "upcoming", tags: [],
    title: "GenAI feature live at work + Cloud DevOps cert",
    detail: "The centerpiece CV bullet: real users, real metrics, a Google Cloud cert on top." },
  { id: "ms-2027-08", month: "2027-08", kind: "milestone", status: "upcoming", tags: [],
    title: "Application sprint opens: 15–20/week",
    detail: "NL IND sponsor register + DE Blue Card employers; interview prep runs in parallel." },
  { id: "ms-2027-11", month: "2027-11", kind: "milestone", status: "upcoming", tags: [],
    title: "Target: signed offer",
    detail: "Negotiate with thresholds in mind: DE Blue Card €45,934/yr · NL HSM monthly floor." },
  { id: "ms-2027-12", month: "2027-12", kind: "milestone", status: "upcoming", tags: [],
    title: "Visa filed",
    detail: "Evidence pack ready since 2026. NL HSM ~2 wks; DE Blue Card 4–8 wks." },
  { id: "ms-2028-01", month: "2028-01", kind: "milestone", status: "upcoming", tags: [],
    title: "Relocation window", detail: "Land in January–February 2028." },
];

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

  milestones: seedMilestones,

  courses: seedCourses,

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
    { id: "cp-english-proof", tags: ["learning", "applications"], status: "open", deadline: "2027-01-31",
      title: "Book IELTS Academic (target 7.0)",
      detail: "DE/NL visas don't require it, but recruiters screening a Myanmar applicant do. Result should land before the Feb 2027 application wave." },
  ],

  weekly: [
    { id: "wk-1", weekStart: weekStartISO(), title: "Draft ADR #1 — Stripe points ledger design",
      refType: "gap_project", refId: "gp-adr", done: true, carriedOver: 0, tags: [] },
    { id: "wk-2", weekStart: weekStartISO(), title: "Block the daily 90-min slot + Sunday 3 h deep block",
      refType: "custom", refId: null, done: false, carriedOver: 0, tags: [] },
    { id: "wk-3", weekStart: weekStartISO(), title: "Book passport renewal appointment",
      refType: "critical", refId: "cp-passport", done: false, carriedOver: 1, tags: [] },
    { id: "wk-4", weekStart: weekStartISO(), title: "Generative AI with LLMs — Module 2 + lab",
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

  dayEvents: [],

  topicProgress: [],

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

  /* A fresh workspace starts its path on creation day — chain every course
     from today rather than from the static seed months. */
  const patchById = new Map(
    rescheduleFrom(seedProfile, stamped.courses, now.slice(0, 10)).map((p) => [p.id, p.patch])
  );
  stamped.courses = stamped.courses.map((c) => {
    const patch = patchById.get(c.id);
    return patch ? { ...c, ...patch } : c;
  });

  const seededEvent: ActivityEvent = {
    id: "act-seeded",
    at: now,
    kind: "seeded",
    message: "Workspace seeded — 18-month plan, portfolio, and critical path loaded",
  };
  stamped.activity = [seededEvent];
  return stamped;
}
