import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User";
import Exam from "../models/Exam";
import Subject from "../models/Subject";
import Topic from "../models/Topic";
import Episode from "../models/Episode";
import CreatorProfile from "../models/CreatorProfile";

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/revisecast";

// Public domain / placeholder audio URLs (use a short silent/sample audio)
// In production, these will be replaced by actual uploaded audio files
const PLACEHOLDER_AUDIO = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
const PLACEHOLDER_THUMB = null;

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Exam.deleteMany({}),
    Subject.deleteMany({}),
    Topic.deleteMany({}),
    Episode.deleteMany({}),
    CreatorProfile.deleteMany({}),
  ]);
  console.log("Cleared existing data");

  // --- EXAMS ---
  const [gateCS, upsc, sscCGL, cat] = await Exam.insertMany([
    { name: "GATE CS", slug: "gate-cs", description: "Graduate Aptitude Test in Engineering — Computer Science", icon: "💻", color: "#6366F1", isActive: true },
    { name: "UPSC", slug: "upsc", description: "Union Public Service Commission Civil Services Examination", icon: "🏛️", color: "#F59E0B", isActive: true },
    { name: "SSC CGL", slug: "ssc-cgl", description: "Staff Selection Commission Combined Graduate Level", icon: "📋", color: "#10B981", isActive: true },
    { name: "CAT", slug: "cat", description: "Common Admission Test for IIM admissions", icon: "📊", color: "#EF4444", isActive: true },
  ]);
  console.log("Exams seeded");

  // --- GATE CS SUBJECTS ---
  const [os, cn, dbms, algo, coa, cd, dl, dm, cp] = await Subject.insertMany([
    { examId: gateCS._id, name: "Operating Systems", slug: "operating-systems", description: "Process management, memory, synchronization, deadlock", icon: "⚙️", order: 1 },
    { examId: gateCS._id, name: "Computer Networks", slug: "computer-networks", description: "Application, transport, network, link layers, routing", icon: "🌐", order: 2 },
    { examId: gateCS._id, name: "DBMS", slug: "dbms", description: "Database design, SQL, transactions, normalization", icon: "🗄️", order: 3 },
    { examId: gateCS._id, name: "Algorithms", slug: "algorithms", description: "Time complexity, sorting, graphs, dynamic programming", icon: "🧮", order: 4 },
    { examId: gateCS._id, name: "Computer Organization", slug: "coa", description: "CPU design, pipelining, memory hierarchy, I/O", icon: "🖥️", order: 5 },
    { examId: gateCS._id, name: "Compiler Design", slug: "compiler-design", description: "Lexical analysis, parsing, code generation, optimization", icon: "⚡", order: 6 },
    { examId: gateCS._id, name: "Digital Logic", slug: "digital-logic", description: "Boolean algebra, combinational circuits, sequential logic", icon: "🔌", order: 7 },
    { examId: gateCS._id, name: "Discrete Mathematics", slug: "discrete-math", description: "Graph theory, combinatorics, logic, probability", icon: "∑", order: 8 },
    { examId: gateCS._id, name: "C Programming", slug: "c-programming", description: "Pointers, arrays, structs, memory management", icon: "🔧", order: 9 },
  ]);
  console.log("GATE CS subjects seeded");

  // --- TOPICS ---
  const osTopics = await Topic.insertMany([
    { subjectId: os._id, name: "Process Synchronization", slug: "process-sync", order: 1 },
    { subjectId: os._id, name: "Deadlock", slug: "deadlock", order: 2 },
    { subjectId: os._id, name: "Memory Management & Paging", slug: "paging", order: 3 },
    { subjectId: os._id, name: "CPU Scheduling", slug: "cpu-scheduling", order: 4 },
    { subjectId: os._id, name: "File Systems", slug: "file-systems", order: 5 },
  ]);

  const cnTopics = await Topic.insertMany([
    { subjectId: cn._id, name: "Application Layer", slug: "application-layer", order: 1 },
    { subjectId: cn._id, name: "TCP/IP & Transport Layer", slug: "tcp-ip", order: 2 },
    { subjectId: cn._id, name: "Supernetting & Subnetting", slug: "supernetting", order: 3 },
    { subjectId: cn._id, name: "Routing Algorithms", slug: "routing", order: 4 },
    { subjectId: cn._id, name: "Data Link Layer", slug: "data-link", order: 5 },
  ]);

  const dbmsTopics = await Topic.insertMany([
    { subjectId: dbms._id, name: "Normalization", slug: "normalization", order: 1 },
    { subjectId: dbms._id, name: "Transactions & ACID", slug: "transactions", order: 2 },
    { subjectId: dbms._id, name: "Indexing & B-Trees", slug: "indexing", order: 3 },
    { subjectId: dbms._id, name: "SQL & Relational Algebra", slug: "sql", order: 4 },
    { subjectId: dbms._id, name: "Concurrency Control", slug: "concurrency", order: 5 },
  ]);

  const algoTopics = await Topic.insertMany([
    { subjectId: algo._id, name: "Graph Algorithms", slug: "graph-algorithms", order: 1 },
    { subjectId: algo._id, name: "Dynamic Programming", slug: "dynamic-programming", order: 2 },
    { subjectId: algo._id, name: "Sorting & Searching", slug: "sorting-searching", order: 3 },
    { subjectId: algo._id, name: "Time & Space Complexity", slug: "complexity", order: 4 },
  ]);

  const cdTopics = await Topic.insertMany([
    { subjectId: cd._id, name: "Lexical Analysis & DFA", slug: "lexical", order: 1 },
    { subjectId: cd._id, name: "Parsing & CFG", slug: "parsing", order: 2 },
    { subjectId: cd._id, name: "Code Generation", slug: "code-gen", order: 3 },
  ]);

  console.log("Topics seeded");

  // --- USERS ---
  const adminHash = await bcrypt.hash("admin123", 12);
  const creatorHash = await bcrypt.hash("creator123", 12);
  const studentHash = await bcrypt.hash("student123", 12);

  const [admin, creator1, creator2, student1, student2] = await User.insertMany([
    { name: "Admin", email: "admin@revisecast.com", passwordHash: adminHash, role: "admin", isActive: true, selectedExams: [gateCS._id] },
    { name: "Arjun Sharma", email: "arjun@revisecast.com", passwordHash: creatorHash, role: "creator", isActive: true, selectedExams: [gateCS._id] },
    { name: "Priya Singh", email: "priya@revisecast.com", passwordHash: creatorHash, role: "creator", isActive: true, selectedExams: [gateCS._id, upsc._id] },
    { name: "Rahul Gupta", email: "rahul@revisecast.com", passwordHash: studentHash, role: "student", isActive: true, selectedExams: [gateCS._id] },
    { name: "Sneha Patel", email: "sneha@revisecast.com", passwordHash: studentHash, role: "student", isActive: true, selectedExams: [gateCS._id, cat._id] },
  ]);

  await CreatorProfile.insertMany([
    { userId: creator1._id, bio: "GATE CS 2022 AIR 47. Teaching OS, CN, DBMS for 3+ years.", expertise: ["Operating Systems", "Computer Networks", "DBMS"], examIds: [gateCS._id], isVerified: true },
    { userId: creator2._id, bio: "GATE CS 2021 AIR 112. Specialist in Algorithms and Theory.", expertise: ["Algorithms", "Compiler Design", "Discrete Math"], examIds: [gateCS._id], isVerified: true },
  ]);
  console.log("Users seeded");

  // --- EPISODES ---
  const episodes = [
    // OS Episodes
    {
      title: "Deadlock — Complete Revision",
      description: "Comprehensive revision of all GATE-important deadlock concepts. Covers Coffman conditions, RAG, Banker's Algorithm, and detection methods in a concise, exam-focused format.",
      audioUrl: PLACEHOLDER_AUDIO, thumbnailUrl: PLACEHOLDER_THUMB,
      creatorId: creator1._id, examId: gateCS._id, subjectId: os._id, topicId: osTopics[1]._id,
      duration: 1080, isPremium: false, status: "published", playCount: 1247, featuredAt: new Date(),
      whatYoullLearn: ["Coffman's 4 necessary conditions", "Resource Allocation Graph analysis", "Deadlock prevention strategies", "Banker's Algorithm step-by-step", "Deadlock detection & recovery", "GATE PYQ patterns on deadlock"],
      difficulty: "intermediate",
    },
    {
      title: "Process Synchronization — Critical Section & Semaphores",
      description: "Master process synchronization for GATE. Race conditions, critical section problem, Peterson's solution, semaphores, and classic problems like producer-consumer.",
      audioUrl: PLACEHOLDER_AUDIO, thumbnailUrl: PLACEHOLDER_THUMB,
      creatorId: creator1._id, examId: gateCS._id, subjectId: os._id, topicId: osTopics[0]._id,
      duration: 1320, isPremium: false, status: "published", playCount: 982, featuredAt: null,
      whatYoullLearn: ["Race conditions and critical sections", "Peterson's solution", "Semaphore types: binary vs counting", "Producer-Consumer problem", "Dining Philosophers problem", "Monitors and condition variables"],
      difficulty: "intermediate",
    },
    {
      title: "Paging & Virtual Memory — Key Concepts",
      description: "Quick revision of paging, TLB, page replacement algorithms, and virtual memory concepts. All formulas and GATE traps covered.",
      audioUrl: PLACEHOLDER_AUDIO, thumbnailUrl: PLACEHOLDER_THUMB,
      creatorId: creator1._id, examId: gateCS._id, subjectId: os._id, topicId: osTopics[2]._id,
      duration: 900, isPremium: true, status: "published", playCount: 754, featuredAt: null,
      whatYoullLearn: ["Page table structure", "TLB hit ratio calculations", "FIFO, LRU, Optimal page replacement", "Thrashing and working set model", "Segmentation vs Paging"],
      difficulty: "intermediate",
    },
    {
      title: "CPU Scheduling — All Algorithms in 12 Minutes",
      description: "FCFS, SJF, SRTF, Round Robin, Priority scheduling — all algorithms with Gantt chart examples and GATE-level calculations.",
      audioUrl: PLACEHOLDER_AUDIO, thumbnailUrl: PLACEHOLDER_THUMB,
      creatorId: creator1._id, examId: gateCS._id, subjectId: os._id, topicId: osTopics[3]._id,
      duration: 720, isPremium: false, status: "published", playCount: 1534, featuredAt: new Date(),
      whatYoullLearn: ["FCFS, SJF, SRTF algorithms", "Round Robin with quantum examples", "Average waiting time calculations", "Preemptive vs non-preemptive", "Priority inversion problem"],
      difficulty: "beginner",
    },

    // CN Episodes
    {
      title: "TCP vs UDP — Transport Layer Revision",
      description: "All differences, use-cases, and GATE-important properties of TCP and UDP. Connection establishment, flow control, congestion control.",
      audioUrl: PLACEHOLDER_AUDIO, thumbnailUrl: PLACEHOLDER_THUMB,
      creatorId: creator1._id, examId: gateCS._id, subjectId: cn._id, topicId: cnTopics[1]._id,
      duration: 780, isPremium: false, status: "published", playCount: 1891, featuredAt: new Date(),
      whatYoullLearn: ["TCP vs UDP key differences", "3-way handshake process", "Sliding window protocol", "TCP flow control (rwnd)", "Congestion control: slow start", "UDP use-cases"],
      difficulty: "beginner",
    },
    {
      title: "Supernetting & Subnetting — Calculation Tricks",
      description: "Master IP addressing calculations for GATE. Subnetting, VLSM, supernetting with shortcut methods to solve questions in under 30 seconds.",
      audioUrl: PLACEHOLDER_AUDIO, thumbnailUrl: PLACEHOLDER_THUMB,
      creatorId: creator1._id, examId: gateCS._id, subjectId: cn._id, topicId: cnTopics[2]._id,
      duration: 960, isPremium: true, status: "published", playCount: 643, featuredAt: null,
      whatYoullLearn: ["CIDR notation and network masks", "Subnetting calculation shortcut", "VLSM step-by-step", "Supernetting conditions", "Host range calculation tricks"],
      difficulty: "intermediate",
    },
    {
      title: "Application Layer — HTTP, DNS, SMTP Quick Revision",
      description: "All application layer protocols for GATE in one shot. HTTP methods, DNS query types, SMTP/POP3/IMAP, FTP active vs passive mode.",
      audioUrl: PLACEHOLDER_AUDIO, thumbnailUrl: PLACEHOLDER_THUMB,
      creatorId: creator2._id, examId: gateCS._id, subjectId: cn._id, topicId: cnTopics[0]._id,
      duration: 840, isPremium: false, status: "published", playCount: 876, featuredAt: null,
      whatYoullLearn: ["HTTP vs HTTPS", "DNS resolution process", "SMTP, POP3, IMAP differences", "FTP active vs passive", "DHCP process"],
      difficulty: "beginner",
    },

    // DBMS Episodes
    {
      title: "Normalization — 1NF to BCNF Complete",
      description: "All normal forms explained with examples. Functional dependencies, candidate keys, Armstrong's axioms, and GATE PYQ approach to normalization questions.",
      audioUrl: PLACEHOLDER_AUDIO, thumbnailUrl: PLACEHOLDER_THUMB,
      creatorId: creator2._id, examId: gateCS._id, subjectId: dbms._id, topicId: dbmsTopics[0]._id,
      duration: 1140, isPremium: false, status: "published", playCount: 2103, featuredAt: new Date(),
      whatYoullLearn: ["Functional dependency rules", "1NF, 2NF, 3NF, BCNF definitions", "Finding candidate keys", "Armstrong's axioms", "Decomposition: lossless and dependency preserving"],
      difficulty: "intermediate",
    },
    {
      title: "Transactions & ACID Properties",
      description: "ACID properties, transaction states, serializability, conflict serializability, view serializability — all GATE-tested concepts in one revision.",
      audioUrl: PLACEHOLDER_AUDIO, thumbnailUrl: PLACEHOLDER_THUMB,
      creatorId: creator2._id, examId: gateCS._id, subjectId: dbms._id, topicId: dbmsTopics[1]._id,
      duration: 960, isPremium: true, status: "published", playCount: 1456, featuredAt: null,
      whatYoullLearn: ["ACID: Atomicity, Consistency, Isolation, Durability", "Transaction states", "Serializability precedence graph", "Conflict vs View serializability", "2-Phase Locking protocol"],
      difficulty: "advanced",
    },
    {
      title: "B+ Trees & Indexing — GATE Focus",
      description: "Primary, secondary, and clustered indexing. B-tree vs B+ tree, order, height calculation, and insertion/deletion concepts tested in GATE.",
      audioUrl: PLACEHOLDER_AUDIO, thumbnailUrl: PLACEHOLDER_THUMB,
      creatorId: creator2._id, examId: gateCS._id, subjectId: dbms._id, topicId: dbmsTopics[2]._id,
      duration: 780, isPremium: false, status: "published", playCount: 987, featuredAt: null,
      whatYoullLearn: ["Dense vs sparse indexing", "B-tree vs B+ tree differences", "Order and height calculations", "Multi-level indexing", "Hashing: open and closed"],
      difficulty: "intermediate",
    },

    // Algorithm Episodes
    {
      title: "Graph Algorithms — BFS, DFS, Dijkstra, Prim, Kruskal",
      description: "All graph algorithms for GATE in one session. Traversals, shortest path, MST, topological sort — with complexity analysis.",
      audioUrl: PLACEHOLDER_AUDIO, thumbnailUrl: PLACEHOLDER_THUMB,
      creatorId: creator2._id, examId: gateCS._id, subjectId: algo._id, topicId: algoTopics[0]._id,
      duration: 1200, isPremium: false, status: "published", playCount: 1678, featuredAt: new Date(),
      whatYoullLearn: ["BFS and DFS complexity", "Dijkstra's algorithm step-by-step", "Bellman-Ford for negative weights", "Prim's and Kruskal's MST", "Topological sorting", "SCC: Kosaraju's algorithm"],
      difficulty: "intermediate",
    },
    {
      title: "Dynamic Programming — Classic Problems Revision",
      description: "LCS, LIS, Knapsack, Matrix Chain Multiplication — all GATE DP problems with recurrence relations and state identification tricks.",
      audioUrl: PLACEHOLDER_AUDIO, thumbnailUrl: PLACEHOLDER_THUMB,
      creatorId: creator2._id, examId: gateCS._id, subjectId: algo._id, topicId: algoTopics[1]._id,
      duration: 1320, isPremium: true, status: "published", playCount: 1234, featuredAt: null,
      whatYoullLearn: ["LCS recurrence and time complexity", "LIS with O(n log n) approach", "0/1 Knapsack formulation", "Matrix Chain Multiplication", "Floyd-Warshall all-pairs shortest path"],
      difficulty: "advanced",
    },
    {
      title: "Sorting Algorithms — Complexity Quick Reference",
      description: "Quick revision of all sorting algorithms. Best, average, worst case complexities, stability, in-place properties — everything for GATE in 8 minutes.",
      audioUrl: PLACEHOLDER_AUDIO, thumbnailUrl: PLACEHOLDER_THUMB,
      creatorId: creator2._id, examId: gateCS._id, subjectId: algo._id, topicId: algoTopics[2]._id,
      duration: 480, isPremium: false, status: "published", playCount: 2345, featuredAt: new Date(),
      whatYoullLearn: ["Bubble, Selection, Insertion: O(n²)", "Merge Sort: stable, O(n log n)", "Quick Sort: average O(n log n)", "Heap Sort: in-place, unstable", "Counting/Radix/Bucket sort"],
      difficulty: "beginner",
    },

    // Compiler Design
    {
      title: "Parsing Techniques — LL(1) & LR(0) Revision",
      description: "Top-down vs bottom-up parsing, FIRST and FOLLOW sets, LL(1) parsing table construction, LR(0) item sets and conflicts.",
      audioUrl: PLACEHOLDER_AUDIO, thumbnailUrl: PLACEHOLDER_THUMB,
      creatorId: creator2._id, examId: gateCS._id, subjectId: cd._id, topicId: cdTopics[1]._id,
      duration: 1080, isPremium: true, status: "published", playCount: 567, featuredAt: null,
      whatYoullLearn: ["Top-down vs Bottom-up parsing", "FIRST and FOLLOW set computation", "LL(1) parsing table", "LR(0) items and closure", "Shift-Reduce conflicts"],
      difficulty: "advanced",
    },

    // Pending episodes for testing admin flow
    {
      title: "Concurrency Control — 2PL and Timestamp Protocols",
      description: "Two-phase locking, timestamp ordering, Thomas write rule — all GATE concurrency control concepts.",
      audioUrl: PLACEHOLDER_AUDIO, thumbnailUrl: PLACEHOLDER_THUMB,
      creatorId: creator1._id, examId: gateCS._id, subjectId: dbms._id, topicId: dbmsTopics[4]._id,
      duration: 840, isPremium: false, status: "pending", playCount: 0, featuredAt: null,
      whatYoullLearn: ["2PL protocol and deadlock", "Timestamp ordering protocol", "Thomas Write Rule", "Strict 2PL and recoverability"],
      difficulty: "advanced",
    },
  ];

  await Episode.insertMany(episodes);
  console.log(`Seeded ${episodes.length} episodes`);

  console.log("\n✅ Seed complete!\n");
  console.log("=== Demo Accounts ===");
  console.log("Admin:    admin@revisecast.com   / admin123");
  console.log("Creator1: arjun@revisecast.com   / creator123");
  console.log("Creator2: priya@revisecast.com   / creator123");
  console.log("Student1: rahul@revisecast.com   / student123");
  console.log("Student2: sneha@revisecast.com   / student123");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
