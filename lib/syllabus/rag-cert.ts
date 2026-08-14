import type { SyllabusSection } from "./kit";
import { S, app, lab, q, r, v } from "./kit";

/* ------------------------------------------------------------------ */
/* IBM RAG and Agentic AI Professional Certificate — 10 courses, one   */
/* seed module each. Transcribed from coursera.org (research pass,     */
/* 2026-08-14); same condensation rules as warmup.ts (the repeated     */
/* per-course "PC Overview" promo, podcasts, meet-and-greets and       */
/* congratulations pages are dropped). Course 10, the capstone, is     */
/* deliberately run through gp-rag — its labs double as project work.  */
/* ------------------------------------------------------------------ */

export const RAG_CERT_SYLLABUS: Record<string, SyllabusSection[]> = {
  /* C1 · Develop Generative AI Applications: Get Started (~10 h) */
  "co-ibm-rag-agentic-m01": [
    S("Foundations of generative AI and prompt engineering", [
      v("RAG and Agentic AI Professional Certificate Overview", 6),
      v("Introduction to Generative AI", 7), v("What are Generative AI Models?", 9),
      v("What is NLP?", 10), v("Introduction to In-Context Learning", 6),
      v("Introduction to LangChain", 4), v("Advanced Methods of Prompt Engineering", 6),
      r("Comprehensive Guide to Generative AI", 30),
      r("Cheat Sheet: Foundations of Generative AI and LangChain", 30),
      q("Practice Quiz: Generative AI Essentials", 15),
      q("Practice Quiz: Prompt Engineering and Prompt Templates", 15),
      q("Graded Quiz: Foundations of Generative AI and Prompt Engineering", 21),
      lab("Master Prompt Engineering and LangChain PromptTemplates", 60),
    ]),
    S("LangChain in GenAI applications", [
      v("LangChain: Core Concepts", 7), v("LangChain Chains and Agents", 7),
      v("LangChain LCEL Chaining Method", 5), r("Recap: Introduction to LangChain", 15),
      r("Cheat Sheet: LangChain in GenAI Applications", 30),
      q("Practice Quiz: LangChain Core Components", 15),
      q("Graded Quiz: Introduction to LangChain in GenAI Applications", 21),
      lab("Build Smarter AI Apps: Empower LLMs with LangChain", 60),
    ]),
    S("Build a GenAI application", [
      v("Choose the Right AI Model for Your Use Case", 4),
      v("From Idea to AI: Building Applications with Generative AI", 7),
      v("Introduction to Flask", 7), r("Cheat Sheet: Web Development Using Flask", 5),
      r("Cheat Sheet: Build GenAI Application with LangChain", 30),
      q("Practice Quiz: Application Development Workflow", 10),
      q("Graded Quiz: Build a Generative AI Application with LangChain", 21),
      lab("Hands-on with GenAI: Choosing the Right Model", 60),
    ]),
  ],

  /* C2 · Build RAG Applications: Get Started (~7 h) */
  "co-ibm-rag-agentic-m02": [
    S("Introduction to RAG", [
      v("Why RAG?", 7), v("More RAG Details", 7), r("What is RAG?", 15),
      r("Cheat Sheet: Introduction to RAG", 5),
      q("Practice Quiz: What is RAG?", 15), q("Graded Quiz: Introduction to RAG", 30),
      lab("Summarize Private Documents Using RAG, LangChain, and LLMs", 45),
    ]),
    S("Build apps with RAG", [
      v("Getting Started with Gradio", 4), r("Introduction to Gradio", 15),
      q("Practice Quiz: Building Apps with RAG", 15), q("Graded Quiz: Building Apps with RAG", 21),
      lab("Set Up a Simple Gradio Interface", 30),
      lab("Construct a QA Bot with LangChain and LLM to Answer from Documents", 30),
    ]),
    S("RAG with LlamaIndex", [
      v("LlamaIndex: Document Ingestion and Chunking", 7),
      v("LlamaIndex: From Vector Stores to Query Engines", 6),
      r("LangChain and LlamaIndex Compared", 15),
      q("Practice Quiz: Application Development with LlamaIndex", 10),
      q("Graded Quiz: Build RAG Apps with LlamaIndex", 21),
      lab("Build an AI Icebreaker Bot with IBM Granite 3.0 & LlamaIndex", 45),
    ]),
  ],

  /* C3 · Vector Databases for RAG: An Introduction (~9 h) */
  "co-ibm-rag-agentic-m03": [
    S("Vector databases and Chroma DB", [
      v("Vector Database Concepts", 7), v("Vector Database Types", 9),
      v("Applications of Vector Databases", 6), v("Chroma DB Key Concepts and Architecture", 7),
      r("Vector Databases Versus Traditional Databases", 5), r("Similarity Search", 30),
      r("Similarity Search and HNSW in Chroma DB", 30), r("Chroma DB Filtering", 15),
      q("Practice Quiz: Vector Databases and Similarity Search", 10),
      q("Practice Quiz: Exploring Chroma DB", 10),
      q("Graded Quiz: Introduction to Vector Databases and Chroma DB", 21),
      lab("Similarity Search by Hand", 30),
      lab("Similarity Search on Text Using Chroma DB and Python", 30),
    ]),
    S("Recommendation systems and RAG", [
      v("Essential Database Operations in Chroma DB", 6), v("How Vector Databases Power RAG", 7),
      r("Cheat Sheet: Vector Databases for Recommendation Systems and RAG", 15),
      q("Practice Quiz: Chroma DB Database Operations", 10),
      q("Practice Quiz: Recommendation System + RAG Concepts", 10),
      q("Graded Quiz: Vector Databases for Recommendation Systems and RAG", 21),
      lab("Similarity Search on Employee Records using Python and Chroma DB", 60),
      lab("Practice Project: Food Recommendation System Using Chroma DB", 120),
    ]),
  ],

  /* C4 · Advanced RAG with Vector Databases and Retrievers (~8 h) */
  "co-ibm-rag-agentic-m04": [
    S("Advanced retrievers", [
      v("Advanced Retrievers in LangChain (2 parts)", 8), v("Advanced Retrievers in LlamaIndex", 9),
      r("Cheat Sheet: Advanced Retrievers for RAG", 15),
      q("Practice Quiz: Advanced Retrievers in LangChain", 14),
      q("Practice Quiz: Advanced Retrievers in LlamaIndex", 14),
      q("Graded Quiz: Advanced Retrievers for RAG", 21),
      lab("Build a Smarter Search with LangChain Context Retrieval", 60),
      lab("Explore Advanced Retrievers in LlamaIndex", 60),
    ]),
    S("Comprehensive RAG with FAISS", [
      v("Introduction to FAISS and How It Compares to ChromaDB", 5),
      r("Hierarchical Navigable Small World (HNSW)", 30),
      r("Cheat Sheet: Build a Comprehensive RAG Application", 15),
      q("Practice Quiz: Introduction to FAISS for RAG", 10),
      q("Graded Quiz: Build a Comprehensive RAG Application", 21),
      lab("Semantic Similarity with FAISS", 60),
      lab("AI-Powered YouTube Summarizer + QA Tool with RAG, LangChain, FAISS", 60),
    ]),
  ],

  /* C5 · Build Multimodal Generative AI Applications (~8 h) */
  "co-ibm-rag-agentic-m05": [
    S("Foundations of multimodal AI", [
      v("Introduction to Multimodal AI", 8), v("Text-to-Speech Technologies", 8),
      v("Speech-to-Text Technologies", 7), r("What is Computer Vision?", 7),
      r("Text Processing, Speech Processing, and Text-to-Speech", 7),
      q("Practice Quiz: Text and Speech Processing", 15),
      q("Graded Quiz: Foundations of Multimodal AI", 21),
      lab("Use Mistral and gTTS to Create Your Personal Storyteller", 30),
      lab("Build a Meeting Assistant with Whisper, LangChain, & Gradio", 45),
    ]),
    S("Visual and video modalities", [
      v("Understanding Image Captioning with Meta's Llama", 7),
      v("Demo: Text-to-Video Generation with OpenAI's Sora", 8),
      r("Text-to-Video and Image-to-Video Technologies", 12),
      app("Image Generation and Captioning", 10),
      q("Graded Quiz: Integrating Visual and Video Modalities", 21),
      lab("DALL·E Image Generation Guide", 20),
      lab("Build an Image Captioning System with watsonx and IBM's Granite", 30),
    ]),
    S("Advanced multimodal applications", [
      v("Introduction to Multimodal RAG (MM-RAG)", 7), v("Multimodal Chatbots and QA Systems", 8),
      app("Build Advanced Multimodal Applications", 15),
      q("Graded Quiz: Advanced Multimodal Applications", 21),
      lab("Build a Style Finder Using Multimodal Retrieval and Search", 45),
      lab("Build Your First GenAI Image-Based Web App: AI Nutrition Coach", 30),
    ]),
  ],

  /* C6 · Fundamentals of Building AI Agents (~11 h) */
  "co-ibm-rag-agentic-m06": [
    S("Tool calling and chaining", [
      v("What are AI Agents?", 12), v("Tool Calling for LLMs", 5),
      v("Why AI Needs Tools: From Guessing to Real-World Action", 5),
      v("Build Effective AI Tools for Advanced LLMs", 8),
      v("Build Intelligent Agents for Dynamic LLM Tool Use", 8),
      v("Build a Custom Math Toolkit Agent with LangChain", 6),
      r("When to (and not to) use AI Agents", 5),
      r("Tools, Agents, and Function Calling in LangChain", 10),
      r("Cheat Sheet: Foundations of Function Calling and Chaining", 20),
      q("Practice Quiz: Introduction to AI Agents", 9),
      q("Practice Quiz: Getting Started with Tool Calling", 10),
      q("Practice Quiz: Building and Orchestrating Tools", 10),
      q("Graded Quiz: Foundations of Tool Calling and Chaining", 21),
      lab("Build an AI Math Assistant with LangChain Tool Calling", 45),
    ]),
    S("LCEL and manual tool calling", [
      v("LangChain LCEL Chaining Method", 5), v("When to Call Tools Manually", 4),
      v("Build LLM Agents with Tools", 5), v("Build Interactive LLM Agents", 6),
      r("Structured Outputs for Tool Calling", 5),
      r("Cheat Sheet: Manual Tool Calling in LangChain", 20),
      q("Practice Quiz: Chaining & LCEL Basics", 10), q("Practice Quiz: Manual Tool Calling", 10),
      q("Practice Quiz: Parsing and Validating Tool Calls", 15),
      q("Graded Quiz: Manual Tool Calling in LangChain", 21),
      lab("AI Powered Data Analysis with LCEL", 45),
      lab("Build Interactive LLM Agents with Tools", 60), lab("Build a Tool Calling Agent", 60),
    ]),
    S("Built-in agents", [
      v("From Natural Language to Data Visualizations with LangChain", 8),
      v("AI-Powered SQL Agents: intro + implementation", 11),
      r("Natural Language Interfaces for Data Systems", 10),
      r("Cheat Sheet: Using Built-in Agents in LangChain", 20),
      q("Practice Quiz: Natural Language Data Visualization", 15),
      q("Practice Quiz: Conversational Database Access", 15),
      q("Graded Quiz: Using Built-in Agents in LangChain", 21),
      lab("Build Your Own Data Visualization Agent", 30),
      lab("Build a Natural Language SQL Agent", 60),
    ]),
  ],

  /* C7 · Agentic AI with LangChain and LangGraph (~11 h) */
  "co-ibm-rag-agentic-m07": [
    S("Introduction to LangGraph", [
      v("Generative versus Agentic AI", 7), v("Core Components of LangGraph", 4),
      v("LangGraph versus LangChain: When to Use What", 10),
      v("Getting Started with LangGraph 101", 7), r("Agentic AI", 12),
      r("LangGraph Architecture: Designing Effective Workflows", 8),
      r("Cheat Sheet: Introduction to LangGraph", 15),
      q("Graded Quiz: Introduction to LangGraph", 15),
      app("LangGraph versus LangChain", 20), app("Build a LangGraph Workflow", 10),
      lab("LangGraph 101: Building Stateful AI Workflows", 60),
    ]),
    S("Self-improving agents", [
      v("Overview: Types of AI Agents", 10), v("Building Reflection Agents", 8),
      v("Understanding Reflexion Agents", 6), v("Building Reflexion Agents", 8),
      v("ReAct: Building Agents that Reason Before Acting", 9),
      r("Structuring LLM Tool Calls with Pydantic and JSON", 10),
      r("Cheat Sheet: Build Self-Improving Agents with LangGraph", 20),
      q("Practice Quizzes: Reflection / Reflexion / ReAct", 18),
      q("Graded Quiz: Build Self-Improving Agents with LangGraph", 21),
      lab("Building a Reflection Agent with LangGraph", 45),
      lab("Building a Reflexion Agent with External Knowledge", 30),
      lab("ReAct: Build Reasoning and Acting AI Agents with LangGraph", 90),
    ]),
    S("Multi-agent systems and agentic RAG", [
      v("Introduction to Multi-Agent Systems", 8), v("Risks of Agentic AI", 7),
      v("Agentic RAG: Enhance Retrieval with Multi-Agent Systems", 6),
      r("Multi-Agent LLM Systems Fundamentals", 12),
      r("Building Multi-Agent Systems with LangGraph", 15),
      q("Practice Quizzes: Single-to-Multi-Agent / Build Multi-Agent", 12),
      q("Graded Quiz: Multi-Agent Systems and Agentic RAG", 21),
      lab("DocChat: Build a Multi-Agent RAG System", 60),
    ]),
  ],

  /* C8 · Agentic AI with LangGraph, CrewAI, AutoGen and BeeAI (~13 h) */
  "co-ibm-rag-agentic-m08": [
    S("Frameworks and design patterns", [
      v("Understanding Agentic AI and Open Source Frameworks", 9),
      v("Building AI Agents with Open Source Frameworks", 8),
      v("Essential Design Patterns for AI Systems", 8), v("Orchestrator Design Pattern", 8),
      v("Evaluator-Optimizer Design Pattern", 5),
      q("Practice Quiz: Agentic Frameworks", 10), q("Practice Quiz: AI System Design Patterns", 10),
      q("Graded Quiz: Agentic Frameworks and Design Patterns", 21),
      lab("Implement Workflow Patterns with LangGraph", 45),
      lab("Build LangGraph Design Patterns: Orchestration & Evaluation", 30),
    ]),
    S("CrewAI", [
      v("Design AI Agent Workflows with CrewAI", 9),
      v("CrewAI with Structured Outputs, YAML, and CrewBase Classes", 10),
      v("Extending CrewAI with Custom Functions", 7), r("Structured Outputs in CrewAI", 6),
      r("Cheat Sheet: CrewAI Fundamentals", 15),
      q("Practice Quizzes: CrewAI intro / outputs / functions", 30),
      q("Graded Quiz: CrewAI Fundamentals and Advanced Applications", 21),
      lab("CrewAI 101: Building Multi-Agent AI Systems", 45),
      lab("Create a Structured Meal & Grocery Planner with CrewAI", 45),
      lab("Agents with Tools vs. Tasks with Tools in CrewAI", 30),
      lab("Build an AI Nutrition Coach with Multi-Agent + Multimodal AI", 60),
    ]),
    S("BeeAI and AG2 (AutoGen)", [
      v("BeeAI: Introduction and Core Components", 9),
      v("Building Agents with the BeeAI Framework", 9),
      v("Introduction to AG2 (AutoGen) and its Key Elements", 9),
      v("Extending AG2 with Tools and Structured Outputs", 7),
      r("Agent Orchestration and Design Patterns in AG2", 10),
      r("Cheat Sheet: BeeAI & AG2 Frameworks", 15),
      q("Practice Quizzes: BeeAI / AG2", 20),
      q("Graded Quiz: Alternative Agentic Frameworks", 21),
      lab("Building Agentic AI Systems with the BeeAI Framework", 120),
      lab("AG2 101 (AutoGen): Complete Tutorial", 45),
      lab("Build Multi-Agent Chatbot with AG2 for Healthcare", 30),
    ]),
  ],

  /* C9 · Build AI Agents using MCP (~10 h) */
  "co-ibm-rag-agentic-m09": [
    S("Getting started with MCP", [
      v("What is MCP?", 4), v("Why MCP?", 10), v("MCP vs API", 8), v("MCP Application Demo", 4),
      v("MCP Architecture", 9), v("MCP in Action", 8), v("Run Existing MCP Servers", 11),
      v("Build an MCP Application with Python", 7), r("Agentic AI Protocols", 10),
      r("Cheat Sheet: Getting Started with MCP", 10),
      q("Practice Quiz: Introduction to MCP", 10), q("Practice Quiz: MCP in Action", 10),
      q("Graded Quiz: Getting Started with MCP", 21),
      lab("Run Existing MCP Servers", 30), lab("Build an MCP Application", 30),
    ]),
    S("MCP servers", [
      v("Hello World of MCP Servers", 11), v("Build an Enhanced MCP Server", 9),
      r("Cheat Sheet: MCP Server", 10),
      q("Practice Quizzes: MCP Server basics / enhanced", 20), q("Graded Quiz: MCP Server", 21),
      lab("Hello World of MCP Servers", 30), lab("Build an Enhanced MCP Server", 30),
    ]),
    S("MCP hosts and clients", [
      v("MCP Client Architecture and Fundamentals", 8),
      v("Streamable HTTP, Roots, and Sampling", 9),
      v("MCP Security with Permissions and Elicitation", 9),
      r("Cheat Sheet: MCP Hosts and Clients", 10),
      q("Practice Quizzes: client / advanced / interaction patterns", 30),
      q("Graded Quiz: MCP Hosts and Clients", 21),
      lab("Build a Custom MCP Client with Python", 45),
      lab("Advanced MCP Applications with Streamable HTTP, Roots, Sampling", 60),
      lab("MCP Security with Permissions and Elicitation", 60),
    ]),
  ],

  /* C10 · RAG and Agentic AI Capstone (~14 h) — runs through gp-rag */
  "co-ibm-rag-agentic-m10": [
    S("Structured GenAI application", [
      v("Project Overview", 5),
      lab("Structure Unstructured Restaurant Data with an LLM", 45),
      lab("Process Multimodal Data with LLMs", 45),
      lab("Build a Command-Line Data Management UI", 45),
      app("Checklists: structure / multimodal / UI", 42),
      q("Graded Quiz: Build a Structured Generative AI Application", 21),
    ]),
    S("Multimodal RAG system", [
      lab("Construct a Multimodal Vector Index", 45),
      lab("Similarity Retrieval with Metadata Filtering", 45),
      lab("Multimodal Similarity Fusion and Retrieval Ranking", 45),
      app("Checklists: index / retrieval / ranking", 30),
      q("Graded Quiz: Design a Multimodal RAG System", 21),
    ]),
    S("Multi-agent system", [
      lab("Design Specialized Agents for a Recommendation System", 45),
      lab("Implement and Test a Multi-Agent Recommendation System", 45),
      lab("Build a Chatbot Interface for the Recommendation System", 45),
      app("Checklists: agents / integration / chatbot", 30),
      q("Graded Quiz: Combine Agents into a Multi-Agent System", 21),
    ]),
    S("MCP integration and final project", [
      lab("Build an MCP Server", 30), lab("Build an MCP Client", 30),
      lab("Build a Full MCP Application", 30),
      app("Checklists: server / client / host", 30),
      q("Graded Quiz: Integrate Agents, RAG, and Tools with MCP", 21),
      app("Final Project Submission and Evaluation", 60),
    ]),
  ],
};
