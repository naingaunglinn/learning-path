/* ------------------------------------------------------------------ */
/* Item-level syllabus detail: the actual videos, readings, labs and   */
/* quizzes inside a module, grouped into the same sections the         */
/* Coursera player shows. Static content keyed by seed module id —     */
/* modules without an entry fall back to their topic list              */
/* (lib/module-topics.ts) rendered as plain items.                     */
/* co-genai-llms transcribed 1:1 from the enrolled course player       */
/* (2026-08); deepen other courses the same way as they start.         */
/* ------------------------------------------------------------------ */

export type SyllabusItemKind = "video" | "reading" | "lab" | "quiz" | "app";
export type SyllabusItem = { title: string; kind?: SyllabusItemKind; minutes?: number };
export type SyllabusSection = { section?: string; items: SyllabusItem[] };

const v = (title: string, minutes: number): SyllabusItem => ({ title, kind: "video", minutes });
const r = (title: string, minutes: number): SyllabusItem => ({ title, kind: "reading", minutes });
const q = (title: string, minutes: number): SyllabusItem => ({ title, kind: "quiz", minutes });
const lab = (title: string, minutes: number): SyllabusItem => ({ title, kind: "lab", minutes });
const app = (title: string, minutes: number): SyllabusItem => ({ title, kind: "app", minutes });

export const DETAILED_SYLLABUS: Record<string, SyllabusSection[]> = {
  "co-genai-llms-m01": [
    {
      section: "Introduction to LLMs and the generative AI project lifecycle",
      items: [
        v("Course Introduction", 6),
        r("Contributor Acknowledgments", 1),
        v("Introduction - Week 1", 5),
        v("Generative AI & LLMs", 4),
        app("Intake Survey", 1),
        r("Join the DeepLearning.AI Forum — questions, support, ideas", 1),
        v("LLM use cases and tasks", 2),
        v("Text generation before transformers", 2),
        v("Transformers architecture", 7),
        v("Generating text with transformers", 5),
        r("Transformers: Attention is all you need", 10),
        v("Prompting and prompt engineering", 5),
        v("Generative configuration", 7),
        v("Generative AI project lifecycle", 4),
        r("[IMPORTANT] Guidelines before you start the labs", 5),
        v("Introduction to AWS labs", 5),
        v("Lab 1 walkthrough", 14),
        lab("Lab 1 - Generative AI Use Case: Summarize Dialogue", 120),
      ],
    },
    {
      section: "LLM pre-training and scaling laws",
      items: [
        v("Pre-training large language models", 9),
        v("Computational challenges of training LLMs", 10),
        v("Optional video: Efficient multi-GPU compute strategies", 8),
        v("Scaling laws and compute-optimal models", 8),
        v("Pre-training for domain adaptation", 5),
        r("Domain-specific training: BloombergGPT", 10),
        q("Week 1 quiz", 60),
        r("Week 1 resources", 10),
      ],
    },
    {
      section: "Lecture Notes (Optional)",
      items: [r("Lecture Notes Week 1", 1)],
    },
  ],

  "co-genai-llms-m02": [
    {
      section: "Fine-tuning LLMs with instruction",
      items: [
        v("Introduction - Week 2", 4),
        v("Instruction fine-tuning", 7),
        v("Fine-tuning on a single task", 3),
        v("Multi-task instruction fine-tuning", 8),
        r("Scaling instruct models", 10),
        v("Model evaluation", 10),
        v("Benchmarks", 5),
      ],
    },
    {
      section: "Parameter efficient fine-tuning",
      items: [
        v("Parameter efficient fine-tuning (PEFT)", 4),
        v("PEFT techniques 1: LoRA", 8),
        v("PEFT techniques 2: Soft prompts", 7),
        v("Lab 2 walkthrough", 17),
        lab("Lab 2 - Fine-tune a generative AI model for dialogue summarization", 120),
        q("Week 2 quiz", 60),
        r("Week 2 Resources", 10),
      ],
    },
    {
      section: "Lecture Notes (Optional)",
      items: [r("Lecture Notes Week 2", 1)],
    },
  ],

  "co-genai-llms-m03": [
    {
      section: "Reinforcement learning from human feedback",
      items: [
        v("Introduction - Week 3", 4),
        v("Aligning models with human values", 3),
        v("Reinforcement learning from human feedback (RLHF)", 8),
        v("RLHF: Obtaining feedback from humans", 6),
        v("RLHF: Reward model", 2),
        v("RLHF: Fine-tuning with reinforcement learning", 3),
        v("Optional video: Proximal policy optimization", 13),
        v("RLHF: Reward hacking", 6),
        r("KL divergence", 10),
        v("Scaling human feedback", 5),
        v("Lab 3 walkthrough", 18),
        r("[IMPORTANT] Reminder about end of access to Lab Notebooks", 1),
        lab("Lab 3 - Fine-tune FLAN-T5 with RL for more-positive summaries", 120),
      ],
    },
    {
      section: "LLM-powered applications",
      items: [
        v("Model optimizations for deployment", 7),
        v("Generative AI Project Lifecycle Cheat Sheet", 2),
        v("Using the LLM in applications", 9),
        v("Interacting with external applications", 4),
        v("Helping LLMs reason and plan with chain-of-thought", 5),
        v("Program-aided language models (PAL)", 7),
        v("ReAct: Combining reasoning and action", 9),
        r("ReAct: Reasoning and action", 10),
        v("LLM application architectures", 5),
        v("Optional video: AWS Sagemaker JumpStart", 5),
        q("Week 3 Quiz", 60),
        r("Week 3 resources", 10),
      ],
    },
    {
      section: "Course conclusion and ongoing research",
      items: [v("Responsible AI", 9), v("Course conclusion", 3)],
    },
    {
      section: "Lecture Notes (Optional)",
      items: [r("Lecture Notes Week 3", 1)],
    },
    {
      section: "Acknowledgments",
      items: [r("Acknowledgments", 1), r("(Optional) Opportunity to Mentor Other Learners", 6)],
    },
  ],
};
