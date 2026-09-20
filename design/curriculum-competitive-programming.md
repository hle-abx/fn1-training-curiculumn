# Curriculum detail: Competitive Programming

Status: **design only** — this is seed-data content for the future
`subjects_catalog` / `units` / `lessons` rows, not implemented yet. See
[`PLAN.md`](./PLAN.md) for the overall app plan and [`schema.sql`](./schema.sql)
for the tables this content will populate.

## Assignment

| Kid | Grade | Starting level | `kid_subjects` row |
|---|---|---|---|
| Wind | 10 | Complete beginner (no prior programming) | own copy of the curriculum below |
| Teen | 7 | Complete beginner (no prior programming) | own copy of the curriculum below |

Both start from the same Unit 1, but each gets an **independent
`kid_subjects` row** (same `subjects_catalog` entry, different
`kid_year_id`) so their progress, pacing, and scores are tracked
separately — Wind is likely to move faster through the fundamentals and
reach contest practice sooner, while Teen may need more time in Unit 2
depending on how far her school math has gotten (adjust pacing once you
see how she does with the Precalculus-level pieces).

No due dates are prescribed in this design — dates get assigned once
Phase 3 (scheduling) exists and you decide a weekly cadence per kid.

Catalog entry: `subjects_catalog(name='Competitive Programming', category='skill', is_preset=1)`.

## Unit 1 — Programming Fundamentals (Harvard CS50x)

Goal: learn to read/write/debug real programs before touching
competitive-specific material. Course: **CS50x — Harvard's Introduction
to Computer Science** (edX, free, fully self-paced):
https://cs50.harvard.edu/x/

| #   | Lesson                                                                  | Resource                                 |
| --- | ----------------------------------------------------------------------- | ---------------------------------------- |
| 1.1 | Set up environment: CS50 Codespace (or local VS Code) + GitHub account  | https://cs50.harvard.edu/x/2024/ide/     |
| 1.2 | Week 0 — Scratch: functions, loops, conditionals, events (visual intro) | https://cs50.harvard.edu/x/2024/weeks/0/ |
| 1.3 | Week 1 — C: variables, conditionals, loops, functions, compiling        | https://cs50.harvard.edu/x/2024/weeks/1/ |
| 1.4 | Week 2 — Arrays: strings, command-line args, intro search algorithms    | https://cs50.harvard.edu/x/2024/weeks/2/ |
| 1.5 | Week 3 — Algorithms: bubble/selection/merge sort, Big-O introduced      | https://cs50.harvard.edu/x/2024/weeks/3/ |
| 1.6 | Week 4 — Memory: pointers, memory allocation, valgrind                  | https://cs50.harvard.edu/x/2024/weeks/4/ |
| 1.7 | Week 5 — Data Structures: linked lists, trees, tries, hash tables       | https://cs50.harvard.edu/x/2024/weeks/5/ |
| 1.8 | Week 6 — Python: syntax, transitioning from C to Python                 | https://cs50.harvard.edu/x/2024/weeks/6/ |
| 1.9 | Milestone: complete problem sets for weeks 0–6 via `check50`            | https://cs50.harvard.edu/x/2024/psets/   |

Python is the language carried forward into the rest of the track — it's
the most common choice for competitive programming practice at the
beginner/intermediate level because of fast iteration, even though C++ is
more common at the top competitive tier (worth a note for later: revisit
switching to C++ once past Unit 4 if contest speed becomes a bottleneck).

## Unit 2 — Math Foundations for Competitive Programming

Goal: build the discrete-math toolbox most CP problems lean on.

| #   | Lesson                                                        | Resource                                                                         |
| --- | ------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 2.1 | Algebra I/II review (as needed per kid's current level)       | https://www.khanacademy.org/math/algebra                                         |
| 2.2 | Precalculus: sequences, series, functions                     | https://www.khanacademy.org/math/precalculus                                     |
| 2.3 | Cryptography unit: modular arithmetic, GCD, primes            | https://www.khanacademy.org/computing/computer-science/cryptography              |
| 2.4 | MIT 6.042J — Part I: Logic, Proofs, Induction                 | https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/ |
| 2.5 | MIT 6.042J — Part II: Number Theory, Counting & Combinatorics | https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/ |
| 2.6 | MIT 6.042J — Part III: Graph Theory basics, intro Probability | https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/ |

## Unit 3 — Algorithms & Data Structures Core

Goal: classical algorithms toolkit — sorting, searching, complexity,
core data structures — from an algorithms-specific lens.

| # | Lesson | Resource |
|---|---|---|
| 3.1 | Asymptotic (Big-O) notation | https://www.khanacademy.org/computing/computer-science/algorithms |
| 3.2 | Binary search & insertion search | https://www.khanacademy.org/computing/computer-science/algorithms/binary-search |
| 3.3 | Selection sort & insertion sort | https://www.khanacademy.org/computing/computer-science/algorithms/insertion-sort |
| 3.4 | Merge sort & quicksort | https://www.khanacademy.org/computing/computer-science/algorithms/merge-sort |
| 3.5 | Graph representation & Breadth-First Search | https://www.khanacademy.org/computing/computer-science/algorithms/breadth-first-search |
| 3.6 | Coursera (audit free) — Princeton "Algorithms, Part I": union-find, elementary sorts, mergesort/quicksort, priority queues, BSTs, hash tables | https://www.coursera.org/learn/algorithms-part1 |
| 3.7 | Coursera (audit free) — Princeton "Algorithms, Part II": graphs, MST, shortest paths, strings | https://www.coursera.org/learn/algorithms-part2 |
| 3.8 | Optional depth: MIT OCW 6.006 Introduction to Algorithms (full lecture series) | https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/ |

## Unit 4 — Introduction to Competitive Programming Practice

Goal: bridge from "algorithms course" to "solving judged problems" —
reading I/O formats, respecting time limits, handling edge cases.

| # | Lesson | Resource |
|---|---|---|
| 4.1 | Start the guided roadmap: "Getting Started" | https://usaco.guide/general/getting-started |
| 4.2 | USACO Guide — Bronze division (simulation, complete search, basic sorting/searching) | https://usaco.guide/bronze/ |
| 4.3 | Create accounts: Codeforces + AtCoder | https://codeforces.com/ , https://atcoder.jp/ |
| 4.4 | CSES Problem Set — Introductory Problems | https://cses.fi/problemset/ |
| 4.5 | First real contest: a Codeforces Div. 4 round (most beginner-friendly) | https://codeforces.com/contests |

## Unit 5 — Graph Algorithms

| # | Lesson | Resource |
|---|---|---|
| 5.1 | USACO Guide — Silver: DFS/BFS on graphs & grids | https://usaco.guide/silver/graph-traversal |
| 5.2 | USACO Guide — Gold: Shortest paths (Dijkstra, Bellman-Ford, Floyd-Warshall) | https://usaco.guide/gold/shortest-paths |
| 5.3 | USACO Guide — Gold: Minimum spanning trees (Kruskal, Prim) | https://usaco.guide/gold/mst |
| 5.4 | CSES Problem Set — Graph Algorithms section | https://cses.fi/problemset/ |

## Unit 6 — Dynamic Programming

| # | Lesson | Resource |
|---|---|---|
| 6.1 | USACO Guide — Silver: Introduction to DP | https://usaco.guide/silver/intro-dp |
| 6.2 | USACO Guide — Gold: Knapsack, interval DP, bitmask DP | https://usaco.guide/gold/dp-more |
| 6.3 | AtCoder Educational DP Contest (EDPC) — 26 curated problems A–Z | https://atcoder.jp/contests/dp |
| 6.4 | CSES Problem Set — Dynamic Programming section | https://cses.fi/problemset/ |

## Unit 7 — Number Theory, Combinatorics & Advanced Data Structures

| # | Lesson | Resource |
|---|---|---|
| 7.1 | USACO Guide — Number theory (modular exponentiation, sieve of Eratosthenes) | https://usaco.guide/gold/modular |
| 7.2 | USACO Guide — Combinatorics basics | https://usaco.guide/silver/intro-combo |
| 7.3 | USACO Guide — Gold: Union-Find (DSU), Segment Trees, Fenwick (BIT) Trees | https://usaco.guide/gold/RURQ |
| 7.4 | CSES Problem Set — Range Queries section | https://cses.fi/problemset/ |

## Unit 8 — Contest Practice & Simulation (ongoing, weekly cadence)

Not a "finish once" unit — meant to run continuously for the rest of the
school year alongside whichever unit above is current.

| # | Lesson | Resource |
|---|---|---|
| 8.1 | Weekly: AtCoder Beginner Contest (ABC) | https://atcoder.jp/contests/ |
| 8.2 | Weekly/biweekly: Codeforces Div 2/3/4 round | https://codeforces.com/contests |
| 8.3 | Register for official USACO contests (Dec/Jan/Feb/US Open) | http://www.usaco.org/ |
| 8.4 | Monthly: upsolve — revisit unsolved contest problems after reading the editorial | — |
| 8.5 | Track rating progress on Codeforces/AtCoder as a rough progress signal | — |

## Summary table (for quick seeding reference)

| Unit | Title | # Lessons |
|---|---|---|
| 1 | Programming Fundamentals (CS50x) | 9 |
| 2 | Math Foundations for CP | 6 |
| 3 | Algorithms & Data Structures Core | 8 |
| 4 | Intro to Competitive Programming Practice | 5 |
| 5 | Graph Algorithms | 4 |
| 6 | Dynamic Programming | 4 |
| 7 | Number Theory, Combinatorics & Advanced DS | 4 |
| 8 | Contest Practice & Simulation (ongoing) | 5 |

**Total: 8 units, 45 lessons per kid** (Wind and Teen each get their own
copy, so 90 lesson rows once seeded).
