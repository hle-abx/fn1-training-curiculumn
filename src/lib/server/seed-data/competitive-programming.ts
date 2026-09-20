// Full curriculum content for the "Competitive Programming" subject.
// Transcribed from design/curriculum-competitive-programming.md — that
// doc is the source of truth for *why* these are the units/lessons;
// this file is just the seedable shape of the same content.

export interface LessonSeed {
	title: string;
	description?: string;
	resourceUrl?: string;
}

export interface UnitSeed {
	title: string;
	description: string;
	lessons: LessonSeed[];
}

export const COMPETITIVE_PROGRAMMING_UNITS: UnitSeed[] = [
	{
		title: 'Unit 1 — Programming Fundamentals (Harvard CS50x)',
		description:
			"Learn to read/write/debug real programs before touching competitive-specific material. Course: CS50x — Harvard's Introduction to Computer Science (edX, free, self-paced).",
		lessons: [
			{
				title: '1.1 Set up environment',
				description: 'CS50 Codespace (or local VS Code) + a GitHub account.',
				resourceUrl: 'https://cs50.harvard.edu/x/2024/ide/'
			},
			{
				title: '1.2 Week 0 — Scratch',
				description: 'Functions, loops, conditionals, events — a visual intro to programming.',
				resourceUrl: 'https://cs50.harvard.edu/x/2024/weeks/0/'
			},
			{
				title: '1.3 Week 1 — C',
				description: 'Variables, conditionals, loops, functions, compiling.',
				resourceUrl: 'https://cs50.harvard.edu/x/2024/weeks/1/'
			},
			{
				title: '1.4 Week 2 — Arrays',
				description: 'Strings, command-line args, intro search algorithms.',
				resourceUrl: 'https://cs50.harvard.edu/x/2024/weeks/2/'
			},
			{
				title: '1.5 Week 3 — Algorithms',
				description: 'Bubble/selection/merge sort, Big-O introduced.',
				resourceUrl: 'https://cs50.harvard.edu/x/2024/weeks/3/'
			},
			{
				title: '1.6 Week 4 — Memory',
				description: 'Pointers, memory allocation, valgrind.',
				resourceUrl: 'https://cs50.harvard.edu/x/2024/weeks/4/'
			},
			{
				title: '1.7 Week 5 — Data Structures',
				description: 'Linked lists, trees, tries, hash tables.',
				resourceUrl: 'https://cs50.harvard.edu/x/2024/weeks/5/'
			},
			{
				title: '1.8 Week 6 — Python',
				description: 'Syntax, transitioning from C to Python.',
				resourceUrl: 'https://cs50.harvard.edu/x/2024/weeks/6/'
			},
			{
				title: '1.9 Milestone: problem sets for weeks 0–6',
				description: "Complete each week's problem set via CS50's check50.",
				resourceUrl: 'https://cs50.harvard.edu/x/2024/psets/'
			}
		]
	},
	{
		title: 'Unit 2 — Math Foundations for Competitive Programming',
		description: 'Build the discrete-math toolbox most CP problems lean on.',
		lessons: [
			{
				title: '2.1 Algebra I/II review',
				description: "As needed per the kid's current level.",
				resourceUrl: 'https://www.khanacademy.org/math/algebra'
			},
			{
				title: '2.2 Precalculus',
				description: 'Sequences, series, functions.',
				resourceUrl: 'https://www.khanacademy.org/math/precalculus'
			},
			{
				title: '2.3 Cryptography unit',
				description: 'Modular arithmetic, GCD, primes.',
				resourceUrl: 'https://www.khanacademy.org/computing/computer-science/cryptography'
			},
			{
				title: '2.4 MIT 6.042J — Part I',
				description: 'Logic, Proofs, Induction.',
				resourceUrl: 'https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/'
			},
			{
				title: '2.5 MIT 6.042J — Part II',
				description: 'Number Theory, Counting & Combinatorics.',
				resourceUrl: 'https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/'
			},
			{
				title: '2.6 MIT 6.042J — Part III',
				description: 'Graph Theory basics, intro Probability.',
				resourceUrl: 'https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/'
			}
		]
	},
	{
		title: 'Unit 3 — Algorithms & Data Structures Core',
		description:
			'Classical algorithms toolkit — sorting, searching, complexity, core data structures — from an algorithms-specific lens.',
		lessons: [
			{
				title: '3.1 Asymptotic (Big-O) notation',
				resourceUrl: 'https://www.khanacademy.org/computing/computer-science/algorithms'
			},
			{
				title: '3.2 Binary search & insertion search',
				resourceUrl: 'https://www.khanacademy.org/computing/computer-science/algorithms/binary-search'
			},
			{
				title: '3.3 Selection sort & insertion sort',
				resourceUrl: 'https://www.khanacademy.org/computing/computer-science/algorithms/insertion-sort'
			},
			{
				title: '3.4 Merge sort & quicksort',
				resourceUrl: 'https://www.khanacademy.org/computing/computer-science/algorithms/merge-sort'
			},
			{
				title: '3.5 Graph representation & Breadth-First Search',
				resourceUrl:
					'https://www.khanacademy.org/computing/computer-science/algorithms/breadth-first-search'
			},
			{
				title: '3.6 Coursera — Princeton "Algorithms, Part I"',
				description: 'Union-find, elementary sorts, mergesort/quicksort, priority queues, BSTs, hash tables. Free to audit.',
				resourceUrl: 'https://www.coursera.org/learn/algorithms-part1'
			},
			{
				title: '3.7 Coursera — Princeton "Algorithms, Part II"',
				description: 'Graphs, MST, shortest paths, strings. Free to audit.',
				resourceUrl: 'https://www.coursera.org/learn/algorithms-part2'
			},
			{
				title: '3.8 Optional depth: MIT OCW 6.006',
				description: 'Introduction to Algorithms — full lecture series.',
				resourceUrl: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/'
			}
		]
	},
	{
		title: 'Unit 4 — Introduction to Competitive Programming Practice',
		description:
			'Bridge from "algorithms course" to "solving judged problems" — reading I/O formats, respecting time limits, handling edge cases.',
		lessons: [
			{
				title: '4.1 Start the guided roadmap',
				description: '"Getting Started" on USACO Guide.',
				resourceUrl: 'https://usaco.guide/general/getting-started'
			},
			{
				title: '4.2 USACO Guide — Bronze division',
				description: 'Simulation, complete search, basic sorting/searching.',
				resourceUrl: 'https://usaco.guide/bronze/'
			},
			{
				title: '4.3 Create accounts',
				description: 'Codeforces and AtCoder.',
				resourceUrl: 'https://codeforces.com/'
			},
			{
				title: '4.4 CSES Problem Set — Introductory Problems',
				resourceUrl: 'https://cses.fi/problemset/'
			},
			{
				title: '4.5 First real contest',
				description: 'A Codeforces Div. 4 round (most beginner-friendly).',
				resourceUrl: 'https://codeforces.com/contests'
			}
		]
	},
	{
		title: 'Unit 5 — Graph Algorithms',
		description: 'Graph traversal, shortest paths, minimum spanning trees.',
		lessons: [
			{
				title: '5.1 USACO Guide — Silver: DFS/BFS on graphs & grids',
				resourceUrl: 'https://usaco.guide/silver/graph-traversal'
			},
			{
				title: '5.2 USACO Guide — Gold: Shortest paths',
				description: 'Dijkstra, Bellman-Ford, Floyd-Warshall.',
				resourceUrl: 'https://usaco.guide/gold/shortest-paths'
			},
			{
				title: '5.3 USACO Guide — Gold: Minimum spanning trees',
				description: 'Kruskal, Prim.',
				resourceUrl: 'https://usaco.guide/gold/mst'
			},
			{
				title: '5.4 CSES Problem Set — Graph Algorithms',
				resourceUrl: 'https://cses.fi/problemset/'
			}
		]
	},
	{
		title: 'Unit 6 — Dynamic Programming',
		description: 'Classic DP patterns, from intro to advanced.',
		lessons: [
			{
				title: '6.1 USACO Guide — Silver: Introduction to DP',
				resourceUrl: 'https://usaco.guide/silver/intro-dp'
			},
			{
				title: '6.2 USACO Guide — Gold: Knapsack, interval DP, bitmask DP',
				resourceUrl: 'https://usaco.guide/gold/dp-more'
			},
			{
				title: '6.3 AtCoder Educational DP Contest (EDPC)',
				description: '26 curated problems, A–Z.',
				resourceUrl: 'https://atcoder.jp/contests/dp'
			},
			{
				title: '6.4 CSES Problem Set — Dynamic Programming',
				resourceUrl: 'https://cses.fi/problemset/'
			}
		]
	},
	{
		title: 'Unit 7 — Number Theory, Combinatorics & Advanced Data Structures',
		description: 'Modular arithmetic, combinatorics, and the data structures that speed up range queries.',
		lessons: [
			{
				title: '7.1 USACO Guide — Number theory',
				description: 'Modular exponentiation, sieve of Eratosthenes.',
				resourceUrl: 'https://usaco.guide/gold/modular'
			},
			{
				title: '7.2 USACO Guide — Combinatorics basics',
				resourceUrl: 'https://usaco.guide/silver/intro-combo'
			},
			{
				title: '7.3 USACO Guide — Gold: Union-Find, Segment Trees, Fenwick Trees',
				resourceUrl: 'https://usaco.guide/gold/RURQ'
			},
			{
				title: '7.4 CSES Problem Set — Range Queries',
				resourceUrl: 'https://cses.fi/problemset/'
			}
		]
	},
	{
		title: 'Unit 8 — Contest Practice & Simulation',
		description:
			'Not a "finish once" unit — meant to run continuously for the rest of the school year alongside whichever unit above is current.',
		lessons: [
			{
				title: '8.1 Weekly: AtCoder Beginner Contest (ABC)',
				resourceUrl: 'https://atcoder.jp/contests/'
			},
			{
				title: '8.2 Weekly/biweekly: Codeforces Div 2/3/4 round',
				resourceUrl: 'https://codeforces.com/contests'
			},
			{
				title: '8.3 Register for official USACO contests',
				description: 'December, January, February, US Open.',
				resourceUrl: 'http://www.usaco.org/'
			},
			{
				title: '8.4 Monthly: upsolve',
				description: 'Revisit unsolved contest problems after reading the editorial.'
			},
			{
				title: '8.5 Track rating progress',
				description: 'Codeforces/AtCoder rating as a rough progress signal.'
			}
		]
	}
];
