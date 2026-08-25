import type { SyllabusSection } from "./kit";
import { S, app, lab, q, r, v } from "./kit";

/* ------------------------------------------------------------------ */
/* Warm-up track syllabi — transcribed from coursera.org (research      */
/* pass, 2026-08-14). Condensation rules: office hours, surveys,       */
/* discussions, glossaries, promos and per-item "solution" readings    */
/* are dropped; every real video, substantive reading, lab, quiz and   */
/* assignment keeps its listed minutes. The Apply modules are authored */
/* here (source: derived) — they are the point of the warm-up track.   */
/* ------------------------------------------------------------------ */

export const WARMUP_SYLLABUS: Record<string, SyllabusSection[]> = {
  /* ---- The Bits and Bytes of Computer Networking (Google, ~23 h) ---- */
  "co-warmup-networking-m01": [
    S("Networking fundamentals", [
      v("The TCP/IP Five-Layer Network Model", 5),
      r("Learn About the OSI Networking Model", 5),
      v("Cables", 4), v("Hubs and Switches", 2), v("Routers", 2), v("Servers and Clients", 2),
      q("Test your knowledge: TCP/IP", 6), q("Test your knowledge: Networking Devices", 6),
    ]),
    S("The physical and data-link layers", [
      v("Moving Bits Across the Wire", 2), v("Twisted Pair Cabling and Duplexing", 2),
      v("Network Ports and Patch Panels", 2), v("Ethernet and MAC Addresses", 6),
      v("Unicast, Multicast, and Broadcast", 2), v("Dissecting an Ethernet Frame", 5),
      r("Ethernet Over Twisted Pair Technologies", 4), lab("Cabling Tools", 15),
      q("Test your knowledge: The Physical Layer", 4), q("Test your knowledge: The Data Link Layer", 6),
      q("Layers in Networking Models", 30), q("Module 1 challenge: Networking Basics", 80),
    ]),
  ],
  "co-warmup-networking-m02": [
    S("IP addressing", [
      v("The Network Layer", 2), v("IPv4 Addresses", 3), v("IPv4 Datagram and Encapsulation", 6),
      v("IPv4 Address Classes", 4), v("Address Resolution Protocol", 2),
      q("Test your knowledge: The Network Layer", 4),
    ]),
    S("Subnetting", [
      v("Subnetting", 2), v("Subnet Masks", 7), v("Basic Binary Math", 7), v("CIDR", 4),
      q("Test your knowledge: Subnetting", 6),
    ]),
    S("Routing", [
      v("Basic Routing Concepts", 8), v("Routing Tables", 3), v("Interior Gateway Protocols", 5),
      v("Exterior Gateways, Autonomous Systems, and the IANA", 3), v("Non-Routable Address Space", 3),
      r("Routing Protocol Examples", 4), r("RFCs and Standards", 4),
      q("Test your knowledge: Routing", 6), q("Module 2 challenge: The Network Layer", 75),
    ]),
  ],
  "co-warmup-networking-m03": [
    S("The transport layer", [
      v("The Transport Layer", 3), v("Dissection of a TCP Segment", 5),
      v("TCP Control Flags and the Three-way Handshake", 6), v("TCP Socket States", 3),
      v("Connection-oriented and Connectionless Protocols", 4), v("Firewalls", 2),
      r("System Ports versus Ephemeral Ports", 4), lab("TCP and UDP Packets", 15),
      q("Test your knowledge: The Transport Layer", 8),
    ]),
    S("The application layer", [
      v("The Application Layer", 3), v("The Application Layer and the OSI Model", 2),
      v("All the Layers Working in Unison", 11),
      q("Test your knowledge: The Application Layer", 6),
      q("Module 3 challenge: The Transport and Application Layer", 70),
      q("Module 3 challenge: The Five-Layer Network Model", 120),
    ]),
  ],
  "co-warmup-networking-m04": [
    S("DNS", [
      v("Why do we need DNS?", 3), v("The Many Steps of Name Resolution", 8), v("DNS and UDP", 6),
      v("Resource Record Types", 7), v("Anatomy of a Domain Name", 3), v("DNS Zones", 4),
      q("Test your knowledge: Name Resolution", 6), q("Name Resolution in Practice", 30),
    ]),
    S("DHCP, NAT, VPNs and proxies", [
      v("Overview of DHCP", 5), v("DHCP in Action", 5), v("Basics of NAT", 4),
      v("NAT and the Transport Layer", 4), v("Virtual Private Networks", 4), v("Proxy Services", 4),
      r("IPv4 Address Exhaustion", 4),
      q("Test your knowledge: DHCP", 6), q("Test your knowledge: NAT", 6),
      q("Test your knowledge: VPNs & Proxies", 6), q("Networking Services Simulation", 30),
      q("Module 4 challenge: Networking Services", 80),
    ]),
  ],
  "co-warmup-networking-m05": [
    S("Connection technologies", [
      v("Dial-up and Modems", 4), v("What is broadband?", 3), v("T-Carrier Technologies", 2),
      v("Digital Subscriber Lines", 4), v("Cable Broadband", 4), v("Fiber Connections", 3),
      r("Broadband Protocols", 8),
      q("Test your knowledge: POTS and Dial-up", 4), q("Test your knowledge: Broadband Internet", 6),
    ]),
    S("WANs and wireless", [
      v("Wide Area Network Technologies", 3), v("Point-to-Point VPNs", 2),
      v("Introduction to Wireless Networking Technologies", 5), v("Wireless Network Configurations", 3),
      v("Wireless Channels", 5), v("Wireless Security", 3), v("Cellular Networking", 1),
      v("Mobile Device Networks", 4), r("WAN Protocols", 8), r("Wi-Fi 6", 4), r("Protocols & Encryption", 8),
      q("Test your knowledge: WANs", 6), q("Test your knowledge: Wireless Networking", 6),
      q("Wireless Channels", 30), q("Module 5 challenge: Limitations of the Internet", 80),
    ]),
  ],
  "co-warmup-networking-m06": [
    S("Troubleshooting tools", [
      v("Ping: Internet Control Message Protocol", 5), v("Traceroute", 3),
      v("Testing Port Connectivity", 2), v("Name Resolution Tools", 2), v("Public DNS Servers", 4),
      v("DNS Registration and Expiration", 2), v("Hosts Files", 3),
      r("Command Line Troubleshooting Tools", 2), r("Testing Port Connectivity", 4),
      q("Test your knowledge: Verifying Connectivity", 6), q("Test your knowledge: Digging into DNS", 6),
    ]),
    S("The cloud, IPv6 and wrap-up", [
      v("What is The Cloud?", 6), v("Everything as a Service", 3), v("Cloud Storage", 2),
      v("IPv6 Addressing and Subnetting", 7), v("IPv6 Headers", 3), v("IPv6 and IPv4 Harmony", 3),
      v("Interview Role Play: Networking", 4), r("IPv6 and IPv4 Harmony", 8),
      q("Test your knowledge: The Cloud", 6),
      q("Module 6 challenge: Troubleshooting and the Future of Networking", 80),
    ]),
  ],

  /* ---- Building Modern Distributed Systems with Java (Packt, ~6 h) ---- */
  "co-system-design-m01": [
    S(undefined, [
      v("Evolution of Computer Systems' Architecture", 4),
      v("Challenges of Distributed Compounding", 4),
      v("Use-Case of Course Application", 4),
      v("Practice 1", 5),
      app("Tiny-URL project setup: repo, service skeleton, goals", 30),
    ]),
  ],
  "co-system-design-m02": [
    S(undefined, [
      v("The Need of Communication", 7), v("Message Transport and Format", 2),
      v("Synchronous and Asynchronous Communication Patterns", 3), v("Traditional Load Balancers", 2),
      v("Service Registry and Discovery", 2), v("Service Meshes", 9), v("Idempotent Service Design", 8),
      v("Practice 2", 9),
    ]),
  ],
  "co-system-design-m03": [
    S(undefined, [
      v("Traditional RDBMS Systems Versus NoSQL", 6), v("Data Sharding and Consistent Hashing", 6),
      v("CAP theorem", 7), v("Short Introduction to Apache Cassandra", 20), v("Practice 3", 12),
      q("Assessment 1", 15),
    ]),
  ],
  "co-system-design-m04": [
    S(undefined, [
      v("The Need of Cluster-Wide Coordination", 8), v("RAFT Consensus Algorithm", 13),
      v("Short Introduction to ETCD", 13), v("Implementation of Distributed Mutex", 8),
      v("Leader Election Design Pattern", 3),
      v("Deployment Requirements for Strongly Consistent Systems", 5),
      v("ACID Properties in Distributed System", 5), v("Practice 4", 17),
    ]),
  ],
  "co-system-design-m05": [
    S(undefined, [
      v("Asynchronous Communication and Message-Oriented Middleware", 6),
      v("Short Introduction to Apache Kafka", 5), v("Apache Kafka as a Distributed System", 30),
      v("Event-Driven Architecture", 3), v("Practice 5", 9),
      q("Full Course Practice Assessment", 15), q("Assessment 2", 15), q("Full Course Assessment", 60),
    ]),
  ],
  "co-system-design-m06": [
    S(undefined, [
      app("Requirements + capacity estimate: chat / realtime updates", 30),
      app("Design: gateway, presence, fan-out, message storage", 60),
      app("Failure modes and trade-offs — closed-book first pass", 45),
      app("Write-up + diagram, published as a design doc", 45),
    ]),
  ],
  "co-system-design-m07": [
    S(undefined, [
      app("Requirements + capacity estimate: news feed + notifications", 30),
      app("Design: fan-out on write vs read, ranking, notification pipeline", 60),
      app("Failure modes and trade-offs — closed-book first pass", 45),
      app("Write-up + diagram, published as a design doc", 45),
    ]),
  ],
  "co-system-design-m08": [
    S(undefined, [
      app("Requirements: payment system + ledger (mine from Horse Support)", 30),
      app("Design: double-entry ledger, idempotency keys, reconciliation", 60),
      app("Failure modes: retries, partial failure, audit — closed-book pass", 45),
      app("Write-up + diagram, published as a design doc", 45),
    ]),
  ],

  /* ---- PostgreSQL for Everybody (Michigan, 4 courses ~57 h) ----
     C1 runs at 0.3 effort and C2 at 0.6 (8 years of production SQL);
     the multipliers live in course-syllabus.ts, not in the minutes. */
  "co-warmup-db-m01": [
    S("Introduction to SQL", [
      v("SQL Architecture", 13), v("Using the DBeaver Client to Run SQL Commands", 7),
      r("Connecting to Your Database Server", 10), q("Introductory SQL", 10),
      lab("Initial Database Setup", 30), lab("Making Our First Tables", 45),
      lab("Inserting Some Data into a Table", 60),
    ]),
    S("Single table SQL", [
      v("Working with Tables and PostgreSQL", 13), v("Data Types in PostgreSQL", 9),
      v("Database Keys and Indexes in PostgreSQL", 12), q("Single Table SQL", 15),
      lab("SERIAL fields / Auto Increment", 60), lab("Musical Track Database (CSV)", 60),
    ]),
    S("One-to-many data models", [
      v("Relational Database Design Part 1", 8), v("Relational Database Design Part 2", 7),
      v("Keys", 7), v("Database Normalization", 6), v("Using JOIN Across Tables", 12),
      q("One to Many Data Models", 10), lab("Entering Many-to-One Data - Automobiles", 60),
    ]),
    S("Many-to-many data models", [
      v("Many-to-Many Relationships", 15), v("Demonstration: Database Design and Many to Many", 15),
      q("Many-to-Many Data Models", 10), lab("Building a Many-to-Many Roster", 60),
    ]),
  ],
  "co-warmup-db-m02": [
    S("SQL techniques", [
      v("Altering Table Schema", 4), v("Dates", 15), v("DISTINCT / GROUP BY", 12),
      v("Demonstration: GROUP BY", 7), v("Subqueries", 10), v("Concurrency and Transactions", 15),
      v("Demonstration: Concurrency and Transactions", 20), v("Stored Procedures", 9),
      q("Intermediate SQL", 10), lab("Alter Table", 30), lab("SELECT DISTINCT", 60),
      lab("Creating a Stored Procedure", 60),
    ]),
    S("Loading and normalizing data", [
      v("Demonstration: Creating and Loading a Database", 6),
      v("Demonstration: Loading and Normalizing CSV Data", 9),
      lab("Musical Tracks Many-to-One", 60), lab("Unesco Heritage Sites Many-to-One", 60),
      lab("Musical Track Database plus Artists", 60),
    ]),
    S("Text in PostgreSQL", [
      v("Text Function", 21), v("Character Sets", 17), v("Inside Hashes", 20),
      v("Index Choices and Index Techniques", 14), v("Demonstration: Generating and Scanning Text", 11),
      q("Text and PostgreSQL", 10), lab("A Hash-based Puzzle", 60), lab("Generating Text", 60),
    ]),
    S("Regular expressions", [
      v("Regular Expressions", 12), v("Using Regular Expressions", 11),
      v("Demonstration: Regular Expressions", 10), v("Demonstration: Flat files, Regex, Email", 7),
      q("Regular Expressions", 10), lab("Regular Expression Queries", 60),
    ]),
  ],
  "co-warmup-db-m03": [
    S("Natural language and inverted indexes", [
      v("Allocating Rows to Blocks in PostgreSQL", 9), v("Index Implementation Details", 16),
      v("Building an Inverted Index with SQL", 7), v("Demonstration: SQL Inverse Index", 11),
      v("Building a Natural Language Index with SQL", 6),
      v("Demonstration: SQL Natural Language Index", 18),
      lab("Building an Inverted Index using SQL", 60),
      lab("Building an Inverted Index with stop words using SQL", 60),
    ]),
    S("GIN indexes, tsvector and tsquery", [
      v("A GIN-based Inverted Index with PostgreSQL", 11),
      v("Building a Natural Language Index in PostgreSQL", 9),
      v("Demonstration: Fulltext tsquery and tsvector Functions", 7),
      v("Demonstration: Building a GIN / tsvector Index", 6),
      q("Text In Databases", 15),
      lab("Building a string array-based GIN index", 60),
      lab("Building a tsvector-based full text GIN index", 60),
    ]),
    S("Python and PostgreSQL", [
      v("PostgreSQL and Python", 5), v("Demonstration: Python and PostgreSQL simple.py", 16),
      v("Demonstration: loadbook.py", 13), v("Mail Archive walkthrough (3 parts)", 35),
      v("Ranking Search Results with PostgreSQL", 4),
      lab("Running simple.py", 60), lab("A Sequence of Numbers", 60),
    ]),
    S("JSON and PostgreSQL", [
      v("JavaScript Object Notation", 11), v("Python and JSON", 7), v("PostgreSQL and JSON", 11),
      v("Demonstration: Music Tracks and JSON", 27), v("Demonstration: Star Wars API (2 parts)", 33),
      q("JSON and PostgreSQL", 30), lab("Interacting with the PokeAPI", 60),
    ]),
  ],
  "co-warmup-db-m04": [
    S("Scaling databases", [
      v("To SQL or to NoSQL?", 19), v("Scaling Relational Databases", 11),
      q("Scaling Databases", 30), lab("Mini-Paper - Scaling Relational Databases", 60),
    ]),
    S("Cloud-scale applications", [
      v("First Generation Cloud Applications (2 parts)", 24), v("Second Generation Cloud Applications", 9),
      v("The Emergence of BASE Solutions (i.e. NoSQL)", 13), v("Reacting to the Rise of NoSQL", 18),
      q("Cloud Architectures", 30), lab("Mini-Paper - ACID versus BASE Architectures", 60),
    ]),
    S("DenoKV", [
      v("Intro to Deno and Deno KV", 22), v("Exploring Deno KV Architecture Through B-Trees", 13),
      v("Exploring CRUD in Deno KV Using KVAdmin.py", 12),
      v("Building a Deno KV Model with Secondary Indexes", 11),
      v("Code Walkthrough: KVAdmin.py Client and Server", 32),
      lab("Autograder: DenoKV and KVAdmin Install", 60), lab("Autograder: DenoKV Insert Text", 60),
      lab("Autograder: DenoKV Book Data Model", 60),
    ]),
  ],
  "co-warmup-db-m05": [
    S(undefined, [
      app("Capture baseline: pg_stat_statements + 5 slowest Car Rental queries", 45),
      app("EXPLAIN ANALYZE each; hypothesize the missing indexes", 45),
      app("Add indexes, re-measure — before/after query plans", 60),
      app("Write-up: index audit findings, wins and regressions", 30),
    ]),
  ],
  "co-warmup-db-m06": [
    S(undefined, [
      app("Design the hybrid score: ts_rank + pgvector cosine blend", 45),
      app("Implement ts_vector column + GIN index on the gp-rag corpus", 60),
      app("Wire hybrid search into the gp-rag retriever; eval on recall@k", 60),
      app("Write-up: hybrid vs vector-only results", 15),
    ]),
  ],

  /* ---- Design Patterns (Alberta, ~15 h) ---- */
  "co-warmup-patterns-m01": [
    S(undefined, [
      v("What is a Design Pattern?", 7), v("Creational, Structural, and Behavioural Patterns", 6),
      v("Singleton Pattern", 5), v("Factory Method Pattern", 11), v("Facade Pattern", 6),
      v("Adapter Pattern", 5), v("Composite Pattern", 6), v("Proxy Pattern", 7),
      v("Decorator Pattern", 11), r("Design Patterns Course Notes", 10),
      q("Module 1 Review", 30), lab("Ungraded Assignment - Adapter Pattern", 60),
      lab("Ungraded Assessment - Composite Pattern", 60),
    ]),
  ],
  "co-warmup-patterns-m02": [
    S(undefined, [
      v("Template Method Pattern", 7), v("Chain of Responsibility Pattern", 6), v("State Pattern", 6),
      v("Command Pattern", 9), v("Observer Pattern", 6), r("Mediator Pattern", 10),
      q("Module 2 Review", 30), lab("Capstone 2.1 - Implement the Command Pattern", 60),
      lab("Ungraded Assignment - Observer Pattern", 60),
    ]),
  ],
  "co-warmup-patterns-m03": [
    S(undefined, [
      v("MVC Pattern", 9), v("Open/Closed Principle", 5), v("Dependency Inversion Principle", 6),
      v("Composing Objects Principle", 5), v("Interface Segregation Principle", 5),
      v("Principle of Least Knowledge", 7), v("Code Smells (2 parts)", 24),
      r("Liskov Substitution Principle", 10), q("Module 3 Review", 30),
      lab("Capstone 2.2 - Implement MVC Pattern", 60), lab("Ungraded Assignment - MVC Pattern", 60),
    ]),
  ],
  "co-warmup-patterns-m04": [
    S(undefined, [
      q("Final Exam", 30), lab("Capstone 2.3 - Identify and Fix Code Smells", 60),
      app("Map three patterns you already ship in MML code — notes", 30),
    ]),
  ],

  /* ---- Software Architecture (Alberta, ~10 h) ---- */
  "co-warmup-architecture-m01": [
    S(undefined, [
      v("Architecture Overview and Process", 17), v("Kruchten's 4 + 1 Model View", 6),
      v("UML Component Diagram", 4), v("UML Package Diagram", 6), v("UML Deployment Diagram", 5),
      v("UML Activity Diagram", 5), r("Software Architecture - Course Notes", 10),
      q("Module 1 Review", 30), lab("Capstone 3.1 - Draw a Component Diagram", 60),
      lab("Capstone 3.2 - Draw a Deployment Diagram", 60),
    ]),
  ],
  "co-warmup-architecture-m02": [
    S(undefined, [
      v("Abstract Data Types and Object-Oriented", 6), v("Main Program and Subroutine", 5),
      v("Databases", 9), v("Layered Systems", 8), v("Client Server n-Tier", 9), v("Interpreters", 5),
      v("Pipes and Filters", 5), v("Event Based", 10), v("Process Control", 7),
      r("State Transition Systems", 10), r("Publish-Subscribe", 10), q("Module 2 Review", 30),
    ]),
  ],
  "co-warmup-architecture-m03": [
    S(undefined, [
      v("Quality Attributes", 16), v("Analyzing and Evaluating an Architecture", 14),
      v("Relationship to Organizational Structure", 3), v("Product Lines and Product Families", 9),
      q("Module 3 Review", 30),
    ]),
  ],
  "co-warmup-architecture-m04": [
    S(undefined, [
      q("Final Exam", 30), lab("Capstone 3.3 - Analyze and Evaluate an Architecture", 60),
    ]),
  ],
  "co-warmup-architecture-m05": [
    S(undefined, [
      app("Pick one MML system; inventory components + dependencies", 30),
      app("Sketch its 4+1 views (component, deployment first)", 60),
      app("Quality attributes + architectural drivers write-up", 45),
      app("Publish as an architecture ADR", 45),
    ]),
  ],

  /* ---- Algorithmic Toolbox (UCSD, ~42 h · 1.2 effort) ---- */
  "co-warmup-algorithms-m01": [
    S(undefined, [
      v("Solving the Sum of Two Digits Programming Challenge", 7),
      v("Solving the Maximum Pairwise Product Programming Challenge", 14),
      v("Stress Test - Implementation", 8), v("Stress Test - Find the Test and Debug", 8),
      v("Stress Test - More Testing, Submit and Pass!", 9), r("Ace Your Next Coding Interview", 10),
      q("Solving Programming Challenges", 20), lab("Programming Assignment 1: Sum of Two Digits", 60),
      lab("Programming Assignment 1: Maximum Pairwise Product", 120),
    ]),
  ],
  "co-warmup-algorithms-m02": [
    S(undefined, [
      v("Why Study Algorithms?", 7), v("Fibonacci: Naive and Efficient Algorithm", 10),
      v("GCD: Naive and Efficient Algorithm", 10), v("Computing Runtimes", 10),
      v("Asymptotic Notation", 7), v("Big-O Notation", 7), v("Using Big-O", 10),
      r("Interview Questions", 10), q("Logarithms", 10), q("Big-O", 10), q("Growth rate", 10),
      lab("Big-O Notation: Plots", 60), lab("Programming Assignment 2: Algorithmic Warm-up", 150),
    ]),
  ],
  "co-warmup-algorithms-m03": [
    S(undefined, [
      v("Largest Number", 4), v("Queue of Patients", 12), v("Implementation and Analysis", 7),
      v("Main Ingredients of Greedy Algorithms", 2), v("Celebration Party Problem", 3),
      v("Greedy Algorithm + Analysis", 11), v("Maximizing Loot + Analysis", 19), v("Review", 5),
      r("Proving Correctness of Greedy Algorithms", 10), r("Money Change", 10),
      q("Largest Concatenate", 30), q("Money Change", 30), q("Puzzle: Touch All Segments", 30),
      lab("Programming Assignment 3: Greedy Algorithms", 180),
    ]),
  ],
  "co-warmup-algorithms-m04": [
    S(undefined, [
      v("Linear Search", 7), v("Binary Search + Runtime", 15),
      v("Polynomial Multiplication: Naive and Faster Divide and Conquer", 20),
      v("The Master Theorem + Proof", 15), v("Selection Sort", 8), v("Merge Sort", 11),
      v("Lower Bound for Comparison Based Sorting", 12), v("Non-Comparison Based Sorting", 8),
      v("Quick Sort: Algorithm + Random Pivot", 22), v("Equal Elements + Final Remarks", 15),
      q("Linear Search and Binary Search", 10), q("Polynomial Multiplication", 15),
      q("Master Theorem", 10), q("Sorting", 15), q("Quick Sort", 15),
      lab("Programming Assignment 4: Divide and Conquer", 180),
    ]),
  ],
  "co-warmup-algorithms-m05": [
    S(undefined, [
      v("Change Problem", 10), v("The Alignment Game", 9), v("Computing Edit Distance", 7),
      v("Reconstructing an Optimal Alignment", 5),
      q("Change Money", 30), q("Puzzle: Number of Paths", 30), q("Edit Distance", 30),
      q("Puzzle: Primitive Calculator", 30),
      lab("Programming Assignment 5: Dynamic Programming 1", 240),
    ]),
  ],
  "co-warmup-algorithms-m06": [
    S(undefined, [
      v("Knapsack with Repetitions", 10), v("Knapsack without Repetitions", 19),
      v("Final Remarks", 8), v("Maximum Arithmetic Expression: Subproblems + Algorithm", 26),
      v("Reconstructing a Solution", 9),
      q("Knapsack", 10), q("Maximum Value of an Arithmetic Expression", 10),
      lab("Programming Assignment 6: Dynamic Programming 2", 180),
    ]),
  ],

  /* ---- OWASP security pass (self-directed, authored) ---- */
  "co-warmup-security-m01": [
    S(undefined, [
      r("A01 Broken Access Control — deep read + notes", 30),
      r("A02 Cryptographic Failures — deep read + notes", 30),
      r("A03 Injection — deep read + notes", 30),
      r("A04 Insecure Design — deep read + notes", 30),
      r("A05 Security Misconfiguration — deep read + notes", 30),
      app("Map each A01–A05 to one concrete MML risk", 30),
    ]),
  ],
  "co-warmup-security-m02": [
    S(undefined, [
      r("A06 Vulnerable and Outdated Components — deep read + notes", 30),
      r("A07 Identification and Authentication Failures — deep read + notes", 30),
      r("A08 Software and Data Integrity Failures — deep read + notes", 30),
      r("A09 Security Logging and Monitoring Failures — deep read + notes", 30),
      r("A10 Server-Side Request Forgery — deep read + notes", 30),
      app("Map each A06–A10 to one concrete MML risk", 30),
    ]),
  ],
  "co-warmup-security-m03": [
    S(undefined, [
      app("Pick the production system; scope the hardening pass", 30),
      app("Audit: access control, injection, secrets, headers, deps", 60),
      app("Fix the top findings; verify each fix", 90),
    ]),
  ],
  "co-warmup-security-m04": [
    S(undefined, [
      app("Write-up: findings, fixes, lessons — publishable", 120),
      app("Publish + add to portfolio evidence", 60),
    ]),
  ],
};
