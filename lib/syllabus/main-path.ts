import type { SyllabusSection } from "./kit";
import { S, app, lab, q, r, v } from "./kit";

/* ------------------------------------------------------------------ */
/* Main-path syllabi (minus the RAG certificate, see rag-cert.ts) —    */
/* transcribed from coursera.org (research pass, 2026-08-14). Same     */
/* condensation rules as warmup.ts. English keeps the ADVANCED         */
/* variants only (IELTS 7 target); its BASIC twins are dropped.        */
/* Logging & Monitoring video minutes were unlisted — estimated at     */
/* ~5 min each against the module totals (names verified).             */
/* ------------------------------------------------------------------ */

export const MAIN_PATH_SYLLABUS: Record<string, SyllabusSection[]> = {
  /* ---- Python for Data Science, AI & Development (IBM, ~25 h · 0.6 effort) ---- */
  "co-python-ai-m01": [
    S(undefined, [
      v("Introduction to Python", 4), v("Getting Started with Jupyter", 4), v("Types", 3),
      v("Expressions and Variables", 4), v("String Operations", 4),
      r("Cheat Sheet: Python Basics", 10),
      q("Practice Quiz: Types", 6), q("Practice Quiz: Expressions and Variables", 6),
      q("Practice Quiz: String Operations", 6), q("Module 1 Graded Quiz", 20),
      lab("Write Your First Program", 10), lab("String Operations", 30),
    ]),
  ],
  "co-python-ai-m02": [
    S(undefined, [
      v("Lists and Tuples", 9), v("Dictionaries", 2), v("Sets", 5),
      r("Cheat Sheet: Lists, Tuples, Dictionaries & Sets", 20),
      q("Practice Quiz: Lists and Tuples", 10), q("Practice Quiz: Dictionaries", 6),
      q("Practice Quiz: Sets", 6), q("Module 2 Graded Quiz", 30),
      lab("Lists", 30), lab("Tuples", 15), lab("Dictionaries", 30), lab("Sets", 20),
    ]),
  ],
  "co-python-ai-m03": [
    S(undefined, [
      v("Conditions and Branching", 10), v("Loops", 7), v("Functions", 14),
      v("Exception Handling", 4), v("Objects and Classes", 11),
      r("Cheat Sheet: Python Programming Fundamentals", 10),
      q("Practice Quiz: Conditions and Branching", 8), q("Practice Quiz: Loops", 6),
      q("Practice Quiz: Functions", 8), q("Practice Quiz: Objects and Classes", 10),
      q("Module 3 Graded Quiz", 30),
      lab("Conditions and Branching", 20), lab("Loops", 20), lab("Functions", 40),
      lab("Objects and Classes", 40), lab("Text Analysis Practice Lab", 45),
    ]),
  ],
  "co-python-ai-m04": [
    S(undefined, [
      v("Reading Files with Open", 4), v("Writing Files with Open", 3), v("Pandas: Loading Data", 5),
      v("Pandas: Working with and Saving Data", 2), v("One Dimensional Numpy", 11),
      v("Two Dimensional Numpy", 7),
      r("Beginner's Guide to NumPy", 10), r("Cheat Sheet: Working with Data in Python", 10),
      q("Practice Quiz: Reading and Writing Files", 8), q("Practice Quiz: Pandas", 10),
      q("Practice Quiz: Numpy in Python", 6), q("Module 4 Graded Quiz", 30),
      lab("Reading Files with Open", 30), lab("Writing Files with Open", 30),
      lab("Selecting Data in a DataFrame", 30), lab("One Dimensional Numpy", 40),
      lab("Two Dimensional Numpy", 30),
    ]),
  ],
  "co-python-ai-m05": [
    S(undefined, [
      v("Application Program Interface", 5), v("REST APIs & HTTP Requests (2 parts)", 9),
      v("Web Scraping", 5), v("Working with Different File Formats", 4),
      r("Web Scraping and HTML Basics", 10), r("Cheat Sheet: APIs and Data Collection", 10),
      q("Practice Quiz: Simple APIs", 6), q("Practice Quiz: REST APIs, Web Scraping, Files", 12),
      q("Module 5 Graded Quiz", 30), q("Final Exam for the Course", 75),
      lab("Access REST APIs & Request HTTP", 30), lab("API Examples", 30), lab("Web Scraping", 40),
      lab("Working with different file formats", 40),
      lab("GDP Data Extraction and Processing Practice Project", 30),
    ]),
  ],

  /* ---- English for Career Development (UPenn, ~40 h listed) ----
     Each unit ends in a real artifact: self-assessment, resume, cover
     letter, elevator speech, interview answers — those ARE the outputs
     January needs. */
  "co-english-career-m01": [
    S(undefined, [
      v("Job Search Overview", 5), v("Identifying Your Interests and Skills", 5),
      v("Vocabulary and Word Forms Related to Jobs", 6), v("Choosing the Job that's the Best Fit", 4),
      v("Verb Tenses (Present vs. Present Progressive)", 6),
      v("Understanding Job Descriptions: Reading a Job Advertisement", 6),
      v("Phrases to Compare Similarities", 5), v("Phrases to Contrast Differences", 5),
      r("What You Offer the World", 10), r("Set SMART goals to get ahead in your career", 10),
      r("Listening: Is there a 'Skills Gap' in the US Job Market?", 10),
      app("Game: Key Words in a Job Advertisement", 30),
      q("Check: Set SMART goals to get ahead", 30),
      app("Assessment 1: Self-Assessment of Job Skills and Experience", 30),
      app("Assessment 2: Written Comparison of the Job Search Process", 60),
    ]),
  ],
  "co-english-career-m02": [
    S(undefined, [
      v("What is a resume? Why do you need one?", 5), v("Parts of a Resume", 5),
      v("Writing a Resume 1: Name and Contact Information", 5),
      v("Writing a Resume 2: Headline and Summary", 5), v("Writing a Resume 3: Work Experience", 5),
      v("Writing a Resume 4: Education", 6), v("Writing a Resume 5: Complete your Resume", 7),
      v("Language Focus: Key Words", 4), v("Language Focus: Action Verbs", 4),
      r("Resume Guide: The Basic Elements", 10), r("Using Keywords Effectively", 10),
      r("Functional or Chronological Resume? Which is for You?", 10),
      r("More Action Verbs Practice", 10),
      app("Game: Using Action Verbs", 30), q("Check: Resume Guide: The Basic Elements", 30),
      q("Assessment 1: Resume Template Quiz", 30),
      app("Assessment 2: Peer Review of Resume", 60),
    ]),
  ],
  "co-english-career-m03": [
    S(undefined, [
      v("What is a Cover Letter?", 5), v("Professional Writing: Letter Format", 7),
      v("Paragraph 1 - Introducing Yourself", 5), v("Paragraph 2 - Highlighting Your Skills", 5),
      v("Paragraph 3 - Closing", 5), v("Present Perfect vs. Past Tense", 7),
      v("Professional Writing: Level of Formality", 5), v("Using Modal Verbs to Write Politely", 6),
      v("Writing a Cover Letter for a Specific Job", 3),
      r("Sample Cover Letters", 10), r("Parts of the Cover Letter", 10),
      r("8 Common Cover Letter Mistakes to Avoid", 10),
      q("Check: 8 Common Cover Letter Mistakes to Avoid", 30),
      q("Assessment 1: Quiz on Letter Format", 30),
      app("Assessment 2: Cover Letter", 60),
    ]),
  ],
  "co-english-career-m04": [
    S(undefined, [
      v("What is Networking?", 5), v("Making Small Talk", 6),
      v("Networking Elevator Speech - What to Say", 5), v("Elevator Speech - Delivery", 6),
      v("Sample Spoken Networking Elevator Speech", 2),
      r("Networking During the Job Search", 10), r("Networking doesn't happen overnight", 10),
      r("Preparing a Networking Elevator Speech", 10),
      app("Game: Sample Networking Elevator Speeches", 30),
      q("Check: Networking During the Job Search", 30),
      app("Assessment 1: Written Networking Elevator Speech", 60),
    ]),
  ],
  "co-english-career-m05": [
    S(undefined, [
      v("Overview of the Job Interview", 6), v("Answering Typical Interview Questions", 5),
      v("Asking for Clarification in an Interview", 5), v("Sample Interview Do's and Don'ts (2 parts)", 11),
      v("Sample Video Responding to an Interview Question", 2),
      r("Interview Tips", 10), r("Five Illegal Job Interview Questions in the US", 10),
      r("Seven Ways to Advance Your Career With Social Media", 10),
      app("Game: Matching Answers to Questions", 30), q("Check: Interview Tips", 30),
      app("Assessment 1: Written Answer to Interview Question", 30),
    ]),
  ],

  /* ---- Coding Interview Preparation (Meta, ~11 h) ---- */
  "co-meta-interview-m01": [
    S(undefined, [
      v("Introduction to the technical recruitment process", 8), v("What is a coding interview?", 8),
      v("Communication", 6), v("What to expect from a technical interview", 8), v("Binary", 6),
      v("Memory", 6), v("Time complexity", 7), v("Space complexity", 5),
      r("Interview types you might expect", 10), r("Pseudocode step by step", 10),
      r("Interview tips", 10), r("Testing your solution", 10), r("Working with time complexity", 10),
      q("Knowledge check: The coding interview", 15), q("Knowledge check: Time complexity", 21),
      q("Knowledge check: Space complexity", 15), q("Module quiz: Introduction", 30),
    ]),
  ],
  "co-meta-interview-m02": [
    S(undefined, [
      v("Basic data structures", 7), v("Lists and sets", 6), v("Stacks and queues", 5), v("Trees", 5),
      v("Hash tables", 7), v("Heaps", 6), v("Graphs", 5),
      r("Arrays", 10), r("Lists and sets in different languages", 10),
      r("Stacks and queues in different languages", 10), r("Trees in different languages", 10),
      r("Hash tables in different languages", 10), r("Heaps and graphs in different languages", 10),
      q("Knowledge check: Basic data structures", 15), q("Knowledge check: Collection data structures", 15),
      q("Knowledge check: Advanced data structures", 15), q("Module quiz: Data structures", 30),
    ]),
  ],
  "co-meta-interview-m03": [
    S(undefined, [
      v("Sorting Algorithms", 8), v("Searching Algorithms", 5), v("Divide and conquer", 5),
      v("Recursion", 6), v("Dynamic programming", 6), v("Greedy algorithms", 6),
      r("Time and space complexity in sorting algorithms", 10),
      r("Time and space complexity in search algorithms", 10),
      q("Knowledge check: Sorting and searching", 15), q("Knowledge check: Working with algorithms", 15),
      q("Module quiz: Introduction to algorithms", 30),
      app("Where can you use algorithms?", 10),
    ]),
  ],
  "co-meta-interview-m04": [
    S(undefined, [
      v("Course recap", 8), q("Final graded assessment", 30), app("Reflect on learning", 10),
      app("Mock interview: one full question aloud, timed", 45),
    ]),
  ],

  /* ---- Cloud DevOps Engineer / SRE with Google Cloud (4 courses ~36 h) ---- */
  "co-sre-gcp-m01": [
    S("SRE and DevOps foundations", [
      v("DevOps and SRE", 7), v("SRE value", 2), v("Postmortems", 5),
      v("Blamelessness and Psych Safety", 8), v("SLOs and error budgets", 7),
      v("Share vision and knowledge", 12), r("Module exercises (2–3)", 45), q("Module quizzes", 26),
    ]),
    S("Making tomorrow better than today", [
      v("CI, CD, and canarying", 5), v("Design thinking and prototyping", 5), v("Toil", 8),
      v("Psychology of change", 8), v("Toil and reliability", 8), v("Goal setting", 6),
      v("Organizational maturity", 4), v("Skills and training", 4), v("SRE teams", 9),
      r("Module exercises (4–6)", 70), q("Module quizzes", 26),
      r("Learner Workbook", 135), q("Final Assessment", 30),
    ]),
  ],
  "co-sre-gcp-m02": [
    S("Defining services and microservices", [
      v("Requirements, Analysis, and Design", 7), v("KPIs and SLIs", 7), v("SLOs and SLAs", 7),
      v("Microservices + Best Practices", 12), v("REST / HTTP / APIs", 14),
      q("Defining Services", 6), q("Microservice Design and Architecture", 8),
    ]),
    S("DevOps automation, storage and networks", [
      v("Continuous Integration Pipelines", 8), v("Infrastructure as Code", 6),
      lab("Building a DevOps Pipeline", 60), v("Key Storage Characteristics", 5),
      v("Choosing Google Cloud Storage and Data Solutions", 10),
      v("Designing Google Cloud Networks + Load Balancers", 10), v("Connecting Networks", 14),
      q("DevOps Automation", 4), q("Storage Solutions", 8), q("Network Architecture", 8),
    ]),
    S("Deploying, reliability and security", [
      v("Google Cloud Deployment Platforms", 6), lab("Deploying Apps to Google Cloud", 45),
      v("Designing for Reliability", 8), v("Disaster Planning", 7),
      v("Security Concepts + Network Security + Encryption", 15),
      v("Cost Planning + Monitoring Dashboards", 10),
      lab("Monitoring Applications in Google Cloud", 45),
      q("Reliability / Security / Maintenance quizzes", 20),
    ]),
  ],
  "co-sre-gcp-m03": [
    S("Observability and monitoring", [
      v("Google Cloud Observability tour (7 videos)", 35),
      q("Intro to Google Cloud Observability", 8),
      v("Monitoring architecture, projects, dashboards, uptime checks (6 videos)", 30),
      q("Monitoring critical systems", 6),
      lab("Monitoring and Dashboarding Multiple Projects", 45),
    ]),
    S("Alerting, logging and audit logs", [
      v("SLI/SLO/SLA + alerting strategy + service monitoring (5 videos)", 25),
      q("Alerting Policies", 6), lab("Alerting in Google Cloud", 90), lab("Service Monitoring", 30),
      v("Cloud Logging: types, routing, queries, log-based metrics (7 videos)", 35),
      q("Advanced Logging and Analysis", 4), lab("Log Analytics on Google Cloud", 20),
      v("Cloud Audit Logs: data access, formats, best practices (5 videos)", 25),
      q("Working with Audit Logs", 4), lab("Cloud Audit Logs", 60),
    ]),
  ],
  "co-sre-gcp-m04": [
    S(undefined, [
      v("Cloud computing and Google Cloud compute offerings", 9),
      v("Resource management + Billing + Interacting with Google Cloud", 12),
      q("Introduction to Google Cloud", 8), lab("Accessing Console and Cloud Shell", 60),
      v("Containers + Container images", 13), v("Kubernetes + GKE", 7),
      q("Containers and Kubernetes", 6), lab("Working with Cloud Build", 60),
      v("Kubernetes concepts + components + Autopilot + object management", 19),
      q("Kubernetes Architecture", 6), lab("Deploying GKE Autopilot clusters", 60),
      v("kubectl + Introspection", 11), q("Kubernetes Operations", 8),
      lab("Deploying GKE Autopilot Clusters from Cloud Shell", 60),
    ]),
  ],
};
