/* ------------------------------------------------------------------ */
/* Syllabus depth: what each module actually covers.                   */
/* Static content, not user state — nothing here is checkable or       */
/* editable, so it lives in code instead of localStorage: immune to    */
/* migrations, resets, and stale-tab writes. Keyed by the seed module  */
/* ids from lib/seed-data.ts; custom modules simply have no topics.    */
/* Coursera lists condensed from the official syllabi (2026-08);       */
/* self-study lists authored with the path's "apply it to a real       */
/* system" rule.                                                       */
/* ------------------------------------------------------------------ */

export const MODULE_TOPICS: Record<string, string[]> = {
  /* -------- Generative AI with Large Language Models -------- */
  "co-genai-llms-m01": [
    "Transformer architecture and text generation",
    "Prompting and generative configuration",
    "LLM pre-training and compute challenges",
    "Scaling laws and compute-optimal models",
    "Lab: dialogue summarization with generative AI",
  ],
  "co-genai-llms-m02": [
    "Instruction fine-tuning, single and multi-task",
    "Model evaluation and benchmarks",
    "Parameter-efficient fine-tuning (PEFT)",
    "LoRA and soft prompt tuning",
    "Lab: fine-tune a model for dialogue summarization",
  ],
  "co-genai-llms-m03": [
    "RLHF: reward models and policy optimization",
    "Avoiding reward hacking; KL divergence",
    "Model optimization for deployment",
    "Chain-of-thought, PAL, ReAct frameworks",
    "Lab: RL fine-tune FLAN-T5 for positive summaries",
  ],

  /* -------- Python for Data Science, AI & Development -------- */
  "co-python-ai-m01": [
    "Python syntax, types, expressions, variables",
    "String operations, indexing, formatting",
    "Jupyter Notebook environment",
    "Lab: write your first program",
  ],
  "co-python-ai-m02": [
    "Lists and tuples: indexing, slicing, sorting",
    "Dictionaries and key-value pairs",
    "Sets and set operations",
    "Hands-on collection manipulation labs",
  ],
  "co-python-ai-m03": [
    "Conditions, branching, logical operators",
    "For and while loops",
    "Functions: built-in and custom",
    "Exception handling",
    "Objects, classes, and OOP",
    "Text analysis practice project",
  ],
  "co-python-ai-m04": [
    "File I/O: text, CSV, JSON",
    "Pandas DataFrames: loading and selecting data",
    "NumPy 1D and 2D arrays",
    "Math operations on arrays and matrices",
  ],
  "co-python-ai-m05": [
    "REST APIs and HTTP requests",
    "Web scraping with BeautifulSoup",
    "Working with multiple file formats",
    "GDP data extraction project",
  ],

  /* -------- Machine Learning Specialization -------- */
  "co-ml-spec-m01": [
    "Linear regression for prediction",
    "Logistic regression for binary classification",
    "Gradient descent and model optimization",
    "Feature engineering and preprocessing",
    "NumPy and scikit-learn in Python",
  ],
  "co-ml-spec-m02": [
    "Neural networks with TensorFlow",
    "Multi-class classification",
    "Decision trees, random forests, boosted trees",
    "ML best practices and generalization",
    "Transfer learning and data ethics",
  ],
  "co-ml-spec-m03": [
    "Clustering and anomaly detection",
    "Dimensionality reduction",
    "Collaborative filtering recommenders",
    "Content-based deep learning recommendations",
    "Deep reinforcement learning model",
  ],

  /* -------- Generative AI for Software Development -------- */
  "co-genai-swdev-m01": [
    "How LLMs work, for developers",
    "Prompt engineering and prompt patterns",
    "AI-assisted bug fixing and code quality",
    "Rapid prototyping with AI",
    "AI-assisted code review",
  ],
  "co-genai-swdev-m02": [
    "AI-generated test suites",
    "Automated technical documentation",
    "Dependency analysis and package management",
    "Security testing with AI",
    "AI-assisted debugging in teams",
  ],
  "co-genai-swdev-m03": [
    "AI-guided software architecture design",
    "Database design and query optimization",
    "Advanced design patterns with LLMs",
    "Secure coding with AI verification",
    "OpenAI API integration and performance tuning",
  ],

  /* -------- Generative AI Engineering with LLMs (IBM) -------- */
  "co-ibm-genai-m01": [
    "Architectures: RNNs, transformers, VAEs, GANs, diffusion",
    "LLMs for NLP: GPT, BERT, BART, T5",
    "Tokenization: NLTK, spaCy, BertTokenizer",
    "Lab: PyTorch NLP data loader",
  ],
  "co-ibm-genai-m02": [
    "One-hot, bag-of-words, embeddings",
    "Word2Vec with CBOW and Skip-gram",
    "N-gram and neural language models",
    "Seq2seq encoder–decoder RNNs for translation",
  ],
  "co-ibm-genai-m03": [
    "Attention mechanisms for context",
    "Positional encoding, masking, transformer parts",
    "Decoder-based GPT vs encoder-based BERT",
    "Labs: text classification, translation models",
  ],
  "co-ibm-genai-m04": [
    "Fine-tuning pretrained transformers",
    "Parameter-efficient fine-tuning: LoRA, QLoRA",
    "Hugging Face + PyTorch loading and training",
    "Prompt engineering and model optimization",
  ],
  "co-ibm-genai-m05": [
    "Instruction tuning and reward modeling",
    "RLHF: treating LLMs as policies",
    "Direct preference optimization (DPO)",
    "PPO fine-tuning labs",
  ],
  "co-ibm-genai-m06": [
    "AI agents with RAG and LangChain",
    "In-context learning, advanced prompting",
    "LangChain tools, chains, chat models, agents",
    "Labs: RAG + LangChain applications",
  ],
  "co-ibm-genai-m07": [
    "Capstone: portfolio-ready QA bot",
    "Vector databases for document embeddings",
    "Retrievers and text-splitting strategies",
    "Gradio interface for user interaction",
  ],

  /* -------- IBM RAG and Agentic AI PC -------- */
  "co-ibm-rag-agentic-m01": [
    "GenAI and LangChain framework basics",
    "Prompt templates, chains, and agents",
    "In-context learning and prompt engineering",
    "Flask GenAI web apps with JSON parsing",
  ],
  "co-ibm-rag-agentic-m02": [
    "RAG fundamentals and architecture",
    "Building RAG apps with LangChain",
    "LlamaIndex vs LangChain comparison",
    "Gradio interfaces for RAG apps",
  ],
  "co-ibm-rag-agentic-m03": [
    "Vector vs traditional databases",
    "ChromaDB operations and collections",
    "Similarity search, manual and ChromaDB",
    "Recommendations via similarity techniques",
  ],
  "co-ibm-rag-agentic-m04": [
    "Advanced retrieval patterns for RAG",
    "FAISS and Chroma DB mechanics",
    "HNSW indexing algorithms",
    "Full RAG app: LangChain, FAISS, Gradio",
  ],
  "co-ibm-rag-agentic-m05": [
    "Multimodal AI: text, speech, image, video",
    "Granite, Llama, Whisper, DALL-E models",
    "Multimodal chatbots with watsonx.ai",
    "Image/video generation apps",
  ],
  "co-ibm-rag-agentic-m06": [
    "Agents that reason and act independently",
    "Tool calling and chaining workflows",
    "Data analysis and visualization agents",
    "Database query agents",
  ],
  "co-ibm-rag-agentic-m07": [
    "LangGraph: memory, iteration, conditional logic",
    "Reflection, Reflexion, and ReAct architectures",
    "Multi-agent orchestration and collaboration",
    "Agentic RAG with query routing",
  ],
  "co-ibm-rag-agentic-m08": [
    "Selecting and combining agentic frameworks",
    "Workflow patterns with LangGraph",
    "CrewAI agents, tasks, custom tools",
    "AutoGen (AG2) and BeeAI applications",
  ],
  "co-ibm-rag-agentic-m09": [
    "MCP architecture vs APIs and tool calling",
    "Building MCP servers with FastMCP",
    "MCP clients: STDIO and Streamable HTTP",
    "Secure multi-agent MCP workflows",
  ],
  "co-ibm-rag-agentic-m10": [
    "End-to-end AI system, data to deployment",
    "Unstructured data to structured JSON via LLMs",
    "Multimodal vector database architecture",
    "Multi-agent recommendation coordination",
  ],

  /* -------- English for Career Development -------- */
  "co-english-career-m01": [
    "US job search process, cross-country comparisons",
    "Identifying interests and skills; reading job ads",
    "Employment and career vocabulary",
    "Present vs present progressive tenses",
  ],
  "co-english-career-m02": [
    "Resume structure: headline, summary, experience",
    "Action verbs for accomplishments",
    "Keywords for applicant tracking systems",
    "Peer-reviewed resume draft",
  ],
  "co-english-career-m03": [
    "Three-paragraph cover letter organization",
    "Business letter formatting and tone",
    "Modal verbs for polite communication",
    "Tailoring letters; common mistakes",
  ],
  "co-english-career-m04": [
    "Networking strategies for job searches",
    "Small talk and conversation starters",
    "Elevator speech self-presentation",
    "Building professional rapport",
  ],
  "co-english-career-m05": [
    "Common interview questions and responses",
    "Interview etiquette and presentation",
    "Asking for clarification politely",
    "Question formation and grammar accuracy",
  ],

  /* -------- SRE and DevOps Engineer with Google Cloud -------- */
  "co-sre-gcp-m01": [
    "Google SRE principles and DevOps philosophy",
    "Service level management and CI/CD",
    "Incident management and safety culture",
    "Automation and data-driven decisions",
  ],
  "co-sre-gcp-m02": [
    "Microservices architecture on Google Cloud",
    "Defining KPIs, SLOs, and SLIs",
    "Network architecture and storage selection",
    "RESTful API design and deployment",
  ],
  "co-sre-gcp-m03": [
    "Google Cloud Observability overview",
    "Dashboards and alerting policies",
    "Log collection, export, and analysis",
    "Hands-on Qwiklabs exercises",
  ],
  "co-sre-gcp-m04": [
    "Kubernetes architecture and orchestration",
    "GKE cluster creation and management",
    "IAM and containerization on Google Cloud",
    "Qwiklabs cluster-management labs",
  ],

  /* -------- Coding Interview Preparation (Meta) -------- */
  "co-meta-interview-m01": [
    "Interview types and technical recruitment",
    "Communication and pseudocode preparation",
    "Binary and memory fundamentals",
    "Big O, time and space complexity",
  ],
  "co-meta-interview-m02": [
    "Strings, integers, arrays, objects",
    "Lists, stacks, and trees",
    "Hash tables, heaps, graphs",
  ],
  "co-meta-interview-m03": [
    "Sorting and searching algorithms",
    "Divide and conquer, greedy",
    "Dynamic programming",
    "Recursion and visualization",
  ],
  "co-meta-interview-m04": [
    "Graded final assessment",
    "Review of all course concepts",
  ],

  /* -------- The Bits and Bytes of Computer Networking -------- */
  "co-warmup-networking-m01": [
    "TCP/IP five-layer and OSI models",
    "Cables, hubs, switches, routers",
    "Physical layer basics",
    "Data link layer and Ethernet",
  ],
  "co-warmup-networking-m02": [
    "IP addressing and subnetting",
    "Binary math for subnets",
    "Encapsulation and ARP",
    "Routing fundamentals and protocols",
  ],
  "co-warmup-networking-m03": [
    "TCP ports, sockets, header components",
    "Connection-oriented vs connectionless",
    "TCP flags and the three-way handshake",
    "Socket states and firewalls",
  ],
  "co-warmup-networking-m04": [
    "How DNS works",
    "DHCP for network administration",
    "NAT and network security",
    "VPNs and proxy services",
  ],
  "co-warmup-networking-m05": [
    "Cable, wireless, cellular, fiber connections",
    "WANs and point-to-point links",
    "Wireless channels and security",
    "Cellular and mobile networking",
  ],
  "co-warmup-networking-m06": [
    "ICMP, ping, and traceroute",
    "Port connectivity and DNS testing",
    "IPv6 and IPv4 interoperability",
    "Cloud computing concepts",
  ],

  /* -------- Algorithmic Toolbox -------- */
  "co-warmup-algorithms-m01": [
    "Implementing, testing, debugging solutions",
    "Maximum Pairwise Product challenge",
    "Stress testing to verify correctness",
  ],
  "co-warmup-algorithms-m02": [
    "Why efficient algorithms matter",
    "Big-O notation and asymptotic analysis",
    "Fibonacci and GCD efficiency examples",
  ],
  "co-warmup-algorithms-m03": [
    "Greedy strategy and proving correctness",
    "Money change problem",
    "Fractional knapsack (maximizing loot)",
  ],
  "co-warmup-algorithms-m04": [
    "Binary search vs linear search",
    "Merge sort and quick sort",
    "Master Theorem for recurrences",
  ],
  "co-warmup-algorithms-m05": [
    "Dynamic programming for optimization",
    "Edit distance and sequence alignment",
    "Reconstructing optimal solutions",
  ],
  "co-warmup-algorithms-m06": [
    "Knapsack with and without repetitions",
    "Maximum arithmetic expression parenthesization",
    "Subproblem design and recurrence practice",
  ],

  /* -------- Design Patterns (Alberta) -------- */
  "co-warmup-patterns-m01": [
    "Singleton and Factory Method",
    "Facade, Adapter, Composite",
    "Proxy and Decorator",
    "Expressing designs in UML",
  ],
  "co-warmup-patterns-m02": [
    "Template Method, Chain of Responsibility",
    "State and Command patterns",
    "Observer pattern with peer review",
  ],
  "co-warmup-patterns-m03": [
    "Model-View-Controller (MVC)",
    "Open-closed and dependency inversion",
    "Code smells and anti-patterns",
  ],
  "co-warmup-patterns-m04": [
    "Identifying code smells in a codebase",
    "Refactoring anti-patterns (capstone)",
    "Peer review and final exam",
  ],

  /* -------- System design self-study · Sundays -------- */
  "co-system-design-m01": [
    "Vertical vs horizontal scaling trade-offs",
    "L4 vs L7 load balancers",
    "Stateless services & session externalization",
    "Health checks and failover",
  ],
  "co-system-design-m02": [
    "Browser, CDN, app and DB cache layers",
    "Cache-aside vs write-through vs write-back",
    "TTLs and eviction policies (LRU/LFU)",
    "Invalidation and cache stampede protection",
  ],
  "co-system-design-m03": [
    "Read replicas and replication lag",
    "Leader–follower vs multi-leader setups",
    "Sharding keys and rebalancing",
    "Partitioning in MySQL/PostgreSQL",
  ],
  "co-system-design-m04": [
    "ACID vs BASE, CAP in practice",
    "Isolation levels and their anomalies",
    "Distributed transactions: 2PC vs sagas",
    "Idempotency keys for payment flows",
  ],
  "co-system-design-m05": [
    "Queues vs pub/sub — SQS, Redis, Kafka",
    "At-least-once delivery and deduplication",
    "Outbox pattern for reliable events",
    "Retry policies and dead-letter queues",
  ],
  "co-system-design-m06": [
    "Token bucket and sliding-window limiters",
    "Backpressure and load shedding",
    "Circuit breakers and timeouts",
    "Graceful degradation and fallbacks",
  ],
  "co-system-design-m07": [
    "Inverted indexes and analyzers",
    "Elasticsearch/OpenSearch basics",
    "Relevance, ranking, deep pagination",
    "Keeping DB and search index in sync",
  ],
  "co-system-design-m08": [
    "The four golden signals",
    "Structured logging and correlation ids",
    "Distributed tracing basics",
    "SLIs, SLOs, and error budgets",
  ],
  "co-system-design-m09": [
    "Estimation: traffic, storage, QPS",
    "Short-key generation and collisions",
    "Redirect latency and caching",
    "Click analytics pipeline sketch",
  ],
  "co-system-design-m10": [
    "WebSockets vs SSE vs polling",
    "Presence and fan-out strategies",
    "Message ordering and delivery receipts",
    "Offline sync and push notifications",
  ],
  "co-system-design-m11": [
    "Fan-out on write vs on read",
    "Feed ranking and cursor pagination",
    "The celebrity problem, hybrid fan-out",
    "Notification batching and quiet hours",
  ],
  "co-system-design-m12": [
    "Double-entry ledger design",
    "Idempotent charge flows and retries",
    "Webhook reconciliation — your Stripe story",
    "Auditability and exactly-once effects",
  ],

  /* -------- Database internals · Use the Index, Luke -------- */
  "co-warmup-db-m01": [
    "B-tree structure and index leaf nodes",
    "Why an index lookup can be slow",
    "Tree traversal, leaf chain, table access",
  ],
  "co-warmup-db-m02": [
    "Equality checks and concatenated indexes",
    "Functions in predicates defeat indexes",
    "Bind parameters and plan caching",
    "Ranges, LIKE, and index merge",
  ],
  "co-warmup-db-m03": [
    "Data volume vs response time",
    "System load and hardware myths",
  ],
  "co-warmup-db-m04": [
    "Nested loops, hash join, merge join",
    "Join order and the optimizer",
  ],
  "co-warmup-db-m05": [
    "Index-only scans",
    "Clustered indexes and index-organized tables",
  ],
  "co-warmup-db-m06": [
    "ORDER BY served straight from the index",
    "GROUP BY pipelines",
  ],
  "co-warmup-db-m07": [
    "Why OFFSET pagination degrades",
    "Keyset (seek) pagination",
  ],
  "co-warmup-db-m08": [
    "Every index taxes INSERT/UPDATE/DELETE",
    "Choosing which indexes to drop",
  ],
  "co-warmup-db-m09": [
    "EXPLAIN the slowest Car Rental queries",
    "Add or adjust indexes, measure before/after",
    "Write the findings up as an ADR",
  ],

  /* -------- Security pass · OWASP Top 10 -------- */
  "co-warmup-security-m01": [
    "A01 broken access control patterns",
    "A02 crypto failures and secrets handling",
    "A03 injection: SQL, command, template",
    "A04 insecure design vs implementation bugs",
    "A05 security misconfiguration checklists",
  ],
  "co-warmup-security-m02": [
    "A06 vulnerable and outdated components",
    "A07 auth failures: sessions, brute force, MFA",
    "A08 software and data integrity failures",
    "A09 logging and monitoring gaps",
    "A10 SSRF patterns and defenses",
  ],
  "co-warmup-security-m03": [
    "Threat-model one MML production system",
    "Audit authorization on every admin endpoint",
    "Review headers, cookies, session config",
    "Dependency audit (composer + npm)",
  ],
  "co-warmup-security-m04": [
    "Findings with severity and concrete fixes",
    "Before/after evidence for each fix",
    "Publish as a portfolio ADR",
  ],
};
