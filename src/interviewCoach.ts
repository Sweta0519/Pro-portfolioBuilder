import {
  ResumeData,
  JobContext,
  InterviewQuestion,
  InterviewPlan,
  InterviewRoundPlan,
  StudyTopic,
  AnswerScore,
  CompanyCulture,
  InterviewRound,
} from './types';

// ─── JD Parsing ───────────────────────────────────────────────────────────────

export function extractJobContext(jd: string): JobContext {
  const text = jd.toLowerCase();

  // Extract company name heuristically
  const companyPatterns = [
    /(?:at|@|join(?:ing)?|company[:\s]+|employer[:\s]+)\s+([A-Z][a-zA-Z0-9\s&]+?)(?:\s+is|\s+are|\s+we|\s*[,\.\n])/,
    /^([A-Z][a-zA-Z0-9\s&]{2,30}?)\s+is (?:hiring|looking|seeking)/m,
    /(?:about|overview)[:\s]+([A-Z][a-zA-Z0-9\s&]{2,30}?)[\.\n]/im,
  ];
  let company = 'the Company';
  for (const pattern of companyPatterns) {
    const match = jd.match(pattern);
    if (match && match[1]) {
      company = match[1].trim();
      break;
    }
  }

  // Detect well-known companies
  const knownCompanies: Record<string, string> = {
    google: 'Google', alphabet: 'Google', amazon: 'Amazon', aws: 'Amazon',
    microsoft: 'Microsoft', meta: 'Meta', facebook: 'Meta', apple: 'Apple',
    netflix: 'Netflix', uber: 'Uber', lyft: 'Lyft', airbnb: 'Airbnb',
    linkedin: 'LinkedIn', twitter: 'X (Twitter)', salesforce: 'Salesforce',
    stripe: 'Stripe', shopify: 'Shopify', atlassian: 'Atlassian',
    oracle: 'Oracle', ibm: 'IBM', deloitte: 'Deloitte', accenture: 'Accenture',
    jpmorgan: 'JPMorgan', 'j.p. morgan': 'JPMorgan', goldman: 'Goldman Sachs',
    infosys: 'Infosys', wipro: 'Wipro', tcs: 'TCS', cognizant: 'Cognizant',
  };
  for (const [key, name] of Object.entries(knownCompanies)) {
    if (text.includes(key)) { company = name; break; }
  }

  // Detect seniority
  let seniority: JobContext['seniority'] = 'mid';
  if (/\b(vp|vice president|principal|staff|distinguished|director)\b/i.test(jd)) seniority = 'lead';
  else if (/\b(senior|sr\.?|lead|architect|manager)\b/i.test(jd)) seniority = 'senior';
  else if (/\b(junior|jr\.?|associate|entry.level|graduate|intern)\b/i.test(jd)) seniority = 'junior';

  // Extract role
  const rolePhrases = [
    /(?:position|role|title|job title)[:\s]+([^\n,\.]{5,60})/i,
    /(?:we are (?:looking|seeking|hiring)(?: for)?)[:\s]+(?:a|an)\s+([^\n,\.]{5,60})/i,
    /^([A-Za-z\s\/\-]{5,60})(?:\s*[-–]|\s+at\s)/m,
  ];
  let role = 'Software Engineer';
  for (const p of rolePhrases) {
    const m = jd.match(p);
    if (m && m[1] && m[1].trim().length > 4) { role = m[1].trim(); break; }
  }

  // Extract required skills
  const techKeywords = [
    'react', 'vue', 'angular', 'next.js', 'nuxt', 'typescript', 'javascript',
    'python', 'java', 'go', 'rust', 'c++', 'c#', '.net', 'kotlin', 'swift',
    'node.js', 'express', 'nestjs', 'fastapi', 'django', 'flask', 'spring boot',
    'graphql', 'rest api', 'grpc', 'postgresql', 'mysql', 'mongodb', 'redis',
    'elasticsearch', 'kafka', 'rabbitmq', 'docker', 'kubernetes', 'terraform',
    'aws', 'gcp', 'azure', 'ci/cd', 'github actions', 'jenkins', 'git',
    'machine learning', 'deep learning', 'pytorch', 'tensorflow', 'llm',
    'sql', 'nosql', 'microservices', 'system design', 'agile', 'scrum',
    'figma', 'tailwind', 'sass', 'jest', 'cypress', 'playwright',
  ];
  const skills = techKeywords.filter(k => text.includes(k));

  // Detect company culture
  let companyCulture: CompanyCulture = 'generic';
  const bigTechNames = ['google', 'meta', 'amazon', 'apple', 'microsoft', 'netflix', 'uber', 'airbnb', 'stripe', 'linkedin'];
  const consultingNames = ['deloitte', 'accenture', 'mckinsey', 'bcg', 'pwc', 'kpmg', 'ey ', 'ernst'];
  const financeNames = ['goldman', 'jpmorgan', 'morgan stanley', 'blackrock', 'citadel', 'jane street', 'bank', 'hedge fund', 'trading'];
  const startupSignals = ['seed', 'series a', 'series b', 'startup', 'early-stage', 'fast-paced', 'wear many hats', 'small team', 'hypergrowth'];

  if (bigTechNames.some(n => text.includes(n))) companyCulture = 'big-tech';
  else if (consultingNames.some(n => text.includes(n))) companyCulture = 'consulting';
  else if (financeNames.some(n => text.includes(n))) companyCulture = 'finance';
  else if (startupSignals.some(n => text.includes(n))) companyCulture = 'startup';

  const isStartup = companyCulture === 'startup';

  return { company, role, seniority, skills, isStartup, companyCulture };
}

// ─── Question Bank ────────────────────────────────────────────────────────────

const HR_QUESTIONS: Omit<InterviewQuestion, 'id'>[] = [
  { round: 'hr', question: 'Tell me about yourself and your professional background.', hint: 'Structure as: Present → Past → Future. Keep it under 2 minutes.', sampleAnswer: 'I am a [role] with [X] years of experience in [domain]. Currently at [company], I [key achievement]. Before that, I [background]. I\'m excited about this role because [reason].', difficulty: 'easy', source: 'Universal — reported across all companies', tags: ['intro', 'background'] },
  { round: 'hr', question: 'Why do you want to work here?', hint: 'Research the company mission, recent product launches, or culture values before answering.', sampleAnswer: 'I admire how [company] is tackling [specific problem]. Your [product/initiative] aligns with my passion for [domain]. I also see this role as an opportunity to [specific growth area].', difficulty: 'easy', source: 'Glassdoor — Top 3 most asked HR question', tags: ['motivation', 'culture'] },
  { round: 'hr', question: 'What are your salary expectations?', hint: 'Research market rates on Levels.fyi or Glassdoor. Give a range, not a fixed number.', difficulty: 'medium', source: 'Standard HR screen question', tags: ['compensation', 'negotiation'] },
  { round: 'hr', question: 'Where do you see yourself in 5 years?', hint: 'Align your growth goals with what this company offers. Avoid mentioning competitor companies.', difficulty: 'easy', source: 'Glassdoor — Frequently reported', tags: ['growth', 'ambition'] },
  { round: 'hr', question: 'Why are you leaving your current role?', hint: 'Always keep this positive. Focus on growth opportunities rather than negatives about your current employer.', difficulty: 'medium', source: 'Glassdoor — Standard HR question', tags: ['motivation', 'transition'] },
  { round: 'hr', question: 'What do you know about our company and products?', hint: 'Visit the company website, read recent news, and check their engineering blog before the interview.', difficulty: 'easy', source: 'Standard HR screen', tags: ['research', 'culture'] },
  { round: 'hr', question: 'How do you handle work-life balance under tight deadlines?', hint: 'Give a concrete example of a crunch period and how you managed it effectively.', difficulty: 'medium', source: 'Common at startups and consulting firms', tags: ['work-life', 'resilience'] },
];

const BEHAVIORAL_QUESTIONS: Omit<InterviewQuestion, 'id'>[] = [
  { round: 'behavioral', question: 'Tell me about a time you disagreed with a manager\'s decision. What did you do?', hint: 'Use STAR (Situation → Task → Action → Result). Show respectful pushback and data-driven reasoning.', difficulty: 'hard', source: 'Amazon Leadership Principles — frequently reported', tags: ['conflict', 'leadership', 'communication'] },
  { round: 'behavioral', question: 'Describe a project where you had to meet an extremely tight deadline. How did you manage it?', hint: 'Quantify the impact: "We delivered X in Y days, saving Z." Show prioritization, not just heroics.', difficulty: 'medium', source: 'Glassdoor — Top behavioral question', tags: ['deadlines', 'prioritization', 'delivery'] },
  { round: 'behavioral', question: 'Give an example of a time you took ownership of a problem that wasn\'t your responsibility.', hint: 'Amazon\'s "Ownership" LP. Show initiative and the positive impact your action created.', difficulty: 'medium', source: 'Amazon — Ownership Leadership Principle', tags: ['ownership', 'initiative'] },
  { round: 'behavioral', question: 'Tell me about a time you failed. What did you learn?', hint: 'Show self-awareness. Describe the failure honestly, then pivot to lessons learned and what changed.', difficulty: 'hard', source: 'Universal — reported at Google, Meta, Amazon', tags: ['failure', 'learning', 'growth'] },
  { round: 'behavioral', question: 'Describe a situation where you had to influence someone without direct authority.', hint: 'Show data-driven communication, empathy, and stakeholder management skills.', difficulty: 'hard', source: 'Common at senior+ levels across all companies', tags: ['influence', 'collaboration', 'leadership'] },
  { round: 'behavioral', question: 'Tell me about a time you mentored a junior team member. What was the outcome?', hint: 'Quantify outcomes if possible: "their PR review time dropped by 40%" etc.', difficulty: 'medium', source: 'Glassdoor — Engineering lead interviews', tags: ['mentorship', 'leadership', 'teamwork'] },
  { round: 'behavioral', question: 'Give an example where you used data to make a difficult decision.', hint: 'Show your analytical process. Describe the data sources, metrics, and how you validated your decision.', difficulty: 'medium', source: 'Google and Meta — Frequently reported', tags: ['data-driven', 'decision making'] },
  { round: 'behavioral', question: 'Tell me about a time you had to quickly learn a new technology or domain you weren\'t familiar with.', hint: 'Show adaptability and curiosity. Describe your learning approach (structured resources, prototyping, pairing with experts).', difficulty: 'medium', source: 'Glassdoor — Startup and Big Tech interviews', tags: ['learning', 'adaptability'] },
];

const TECHNICAL_QUESTIONS: Omit<InterviewQuestion, 'id'>[] = [
  { round: 'technical', question: 'Explain the difference between REST and GraphQL. When would you choose one over the other?', hint: 'Cover: over-fetching, schema flexibility, real-time subs (WebSocket). REST for simple CRUD, GraphQL for complex client-driven data needs.', difficulty: 'medium', source: 'Glassdoor — Frontend and Fullstack interviews', tags: ['api', 'rest', 'graphql'] },
  { round: 'technical', question: 'What is the difference between horizontal and vertical scaling? When would you use each?', hint: 'Vertical = more powerful machine. Horizontal = more machines. Discuss stateless services, load balancers, CAP theorem.', difficulty: 'medium', source: 'Glassdoor — Backend and infrastructure roles', tags: ['scaling', 'system design', 'infrastructure'] },
  { round: 'technical', question: 'How does a browser render a webpage? Walk me through the critical rendering path.', hint: 'Cover: DNS → TCP → HTML parse → DOM/CSSOM → Render tree → Layout → Paint → Composite. Mention JavaScript blocking.', difficulty: 'hard', source: 'Common at Google, Facebook frontend interviews', tags: ['browser', 'performance', 'frontend'] },
  { round: 'technical', question: 'Explain event loop and asynchronous execution in JavaScript/Node.js.', hint: 'Describe call stack, callback queue, microtask queue, Web APIs. Use a setTimeout vs Promise example to illustrate.', difficulty: 'hard', source: 'Glassdoor — Node.js and frontend engineering', tags: ['javascript', 'async', 'event-loop'] },
  { round: 'technical', question: 'What are SOLID principles? Give an example of one you applied in a past project.', hint: 'Focus on Open/Closed or Dependency Inversion if you have examples. Be concrete, not theoretical.', difficulty: 'medium', source: 'Common in backend and full-stack interviews', tags: ['solid', 'oop', 'architecture'] },
  { round: 'technical', question: 'How would you optimize a slow database query?', hint: 'Cover: indexes (explain plan), query analysis (EXPLAIN), N+1 queries, denormalization, caching (Redis), and connection pooling.', difficulty: 'hard', source: 'Glassdoor — Backend and data engineering', tags: ['database', 'performance', 'sql'] },
  { round: 'technical', question: 'What is the difference between authentication and authorization? How would you implement JWT-based auth?', hint: 'Auth = who you are. Authz = what you can do. Describe JWT structure (header.payload.signature), token expiry, refresh tokens, and storage (httpOnly cookie vs localStorage).', difficulty: 'medium', source: 'Universal — reported across all engineering roles', tags: ['security', 'authentication', 'jwt'] },
  { round: 'technical', question: 'Explain microservices vs monolith architecture. What are the trade-offs?', hint: 'Cover: deployment complexity, service communication (gRPC, REST, events), data consistency, debugging difficulty vs scalability benefits.', difficulty: 'hard', source: 'Common at senior+ engineering interviews', tags: ['microservices', 'architecture', 'monolith'] },
  { round: 'technical', question: 'How does Docker work? What is the difference between a Docker image and a container?', hint: 'Image = read-only template. Container = running instance. Cover layered filesystem, Dockerfile, docker-compose.', difficulty: 'easy', source: 'Glassdoor — DevOps, backend, and fullstack roles', tags: ['docker', 'devops', 'containers'] },
  { round: 'technical', question: 'What is memoization and how does it improve performance in React applications?', hint: 'Describe useMemo, useCallback, and React.memo. Give a real example with expensive computations or avoiding unnecessary re-renders.', difficulty: 'medium', source: 'Common at React/Frontend engineering interviews', tags: ['react', 'performance', 'memoization'] },
  { round: 'technical', question: 'Explain the concept of eventual consistency in distributed systems.', hint: 'Compare to strong consistency. Describe BASE vs ACID. Use examples like social media feed likes or DNS propagation.', difficulty: 'hard', source: 'Common at distributed systems and backend senior roles', tags: ['distributed systems', 'consistency', 'cap theorem'] },
  { round: 'technical', question: 'How would you implement caching in a web application? What are cache invalidation strategies?', hint: 'Cover in-memory (Redis), CDN caching, HTTP cache headers, TTL, LRU eviction, and the "two hard things in CS" joke to show depth.', difficulty: 'hard', source: 'Glassdoor — Backend and infrastructure interviews', tags: ['caching', 'redis', 'performance'] },
];

const DSA_QUESTIONS: Omit<InterviewQuestion, 'id'>[] = [
  { round: 'dsa', question: 'Two Sum — Find two numbers in an array that add up to a target value.', hint: 'Optimal approach uses a Hash Map for O(n) time complexity. Avoid brute-force O(n²).', difficulty: 'easy', source: 'LeetCode #1 — Reported at Google, Amazon, Meta, Microsoft', tags: ['hash map', 'array'] },
  { round: 'dsa', question: 'Merge Intervals — Given a collection of intervals, merge all overlapping ones.', hint: 'Sort by start time first. Use a greedy approach to merge while current start ≤ previous end.', difficulty: 'medium', source: 'LeetCode #56 — Reported at Google, Facebook', tags: ['sorting', 'greedy', 'intervals'] },
  { round: 'dsa', question: 'Longest Palindromic Substring — Find the longest substring that reads the same forwards and backwards.', hint: 'Expand Around Center approach is O(n²). Manacher\'s Algorithm achieves O(n). Mention both.', difficulty: 'medium', source: 'LeetCode #5 — Reported at Amazon, Bloomberg', tags: ['dynamic programming', 'string'] },
  { round: 'dsa', question: 'Binary Tree Level Order Traversal (BFS).', hint: 'Use a Queue (FIFO). Process each level\'s nodes, add children to the queue. Classic BFS pattern.', difficulty: 'medium', source: 'LeetCode #102 — Reported at Facebook, Google, Amazon', tags: ['bfs', 'tree', 'queue'] },
  { round: 'dsa', question: 'LRU Cache — Design and implement a data structure for a Least Recently Used cache.', hint: 'Use a Hash Map + Doubly Linked List combination. O(1) get and put operations. A very common design question.', difficulty: 'hard', source: 'LeetCode #146 — Reported at Google, Amazon, Uber, Lyft', tags: ['design', 'hash map', 'linked list'] },
  { round: 'dsa', question: 'Find the kth largest element in an unsorted array.', hint: 'QuickSelect gives O(n) average. Min-Heap of size k gives O(n log k). Both approaches are valid — mention trade-offs.', difficulty: 'medium', source: 'LeetCode #215 — Reported at Facebook, LinkedIn, Microsoft', tags: ['heap', 'sorting', 'array'] },
  { round: 'dsa', question: 'Word Search — Given a 2D board and a word, check if the word exists using adjacent cells.', hint: 'Classic DFS + backtracking. Mark visited cells to avoid reuse. Time: O(M×N×4^L).', difficulty: 'medium', source: 'LeetCode #79 — Reported at Amazon, Microsoft, Airbnb', tags: ['dfs', 'backtracking', 'matrix'] },
  { round: 'dsa', question: 'Number of Islands — Count distinct islands in a 2D binary grid.', hint: 'DFS or BFS flood-fill from each unvisited "1". Mark cells as visited by setting them to "0".', difficulty: 'medium', source: 'LeetCode #200 — Reported at Google, Amazon, Uber', tags: ['dfs', 'bfs', 'matrix', 'union-find'] },
  { round: 'dsa', question: 'Coin Change — Find the minimum number of coins to make up a given amount.', hint: 'Classic bottom-up dynamic programming. dp[i] = min coins for amount i. Initialize dp[0]=0, rest to Infinity.', difficulty: 'medium', source: 'LeetCode #322 — Reported at Google, Amazon', tags: ['dynamic programming', 'array'] },
  { round: 'dsa', question: 'Serialize and Deserialize a Binary Tree.', hint: 'Use BFS level-order with null markers for missing nodes, or DFS preorder. The key is matching serialize and deserialize logic.', difficulty: 'hard', source: 'LeetCode #297 — Reported at Facebook, Google', tags: ['tree', 'bfs', 'design'] },
];

const SYSTEM_DESIGN_QUESTIONS: Omit<InterviewQuestion, 'id'>[] = [
  { round: 'system-design', question: 'Design a URL Shortener (like bit.ly).', hint: 'Cover: ID generation (base62 encoding), redirect via 301/302, DB schema, caching hot URLs (Redis), analytics tracking, rate limiting.', difficulty: 'medium', source: 'Glassdoor — Very common at Google, Amazon, Uber, Stripe', tags: ['hashing', 'database', 'caching', 'scalability'] },
  { round: 'system-design', question: 'Design a scalable notification system (push, email, SMS).', hint: 'Cover: message queues (Kafka/SQS), fan-out pattern, delivery guarantees (at-least-once), retry logic, user preference store, rate limiting per channel.', difficulty: 'hard', source: 'Reported at Amazon, Uber, Airbnb, LinkedIn', tags: ['messaging', 'queue', 'scalability'] },
  { round: 'system-design', question: 'Design Twitter\'s News Feed / Home Timeline.', hint: 'Cover: Fan-out on write vs read, celebrity problem, cache vs database read, timeline ranking model, CDN for media.', difficulty: 'hard', source: 'Classic system design question — Google, Facebook, Twitter interviews', tags: ['feed', 'caching', 'fan-out', 'scalability'] },
  { round: 'system-design', question: 'Design a distributed Rate Limiter.', hint: 'Cover: token bucket vs leaky bucket vs sliding window. Redis + Lua scripts for atomic operations. Distributed counters with clock skew.', difficulty: 'hard', source: 'Reported at Stripe, Cloudflare, Google, Uber', tags: ['rate limiting', 'redis', 'distributed systems'] },
  { round: 'system-design', question: 'Design a key-value store (like Redis or DynamoDB).', hint: 'Cover: consistent hashing, replication, CAP theorem trade-offs, conflict resolution (vector clocks or last-write-wins), LSM-tree storage.', difficulty: 'hard', source: 'Reported at Amazon (DynamoDB team), Google, Meta', tags: ['database', 'distributed systems', 'hashing'] },
  { round: 'system-design', question: 'Design a real-time collaborative document editor (like Google Docs).', hint: 'Cover: Operational Transformation (OT) or CRDTs for conflict resolution, WebSocket connections, operational log, versioning, snapshot + delta persistence.', difficulty: 'hard', source: 'Reported at Google, Notion, Figma engineering interviews', tags: ['real-time', 'websocket', 'crdt', 'collaboration'] },
];

// Company-specific behavioral injections
const COMPANY_SPECIFIC: Partial<Record<string, Omit<InterviewQuestion, 'id'>[]>> = {
  'big-tech': [
    { round: 'behavioral', question: 'Tell me about a time you dove deep into a problem to understand its root cause (Amazon: "Dive Deep" LP).', hint: 'Amazon values leaders who go beyond surface-level analysis. Describe the investigation process and what you found.', difficulty: 'hard', source: 'Amazon — Leadership Principles interview', tags: ['amazon', 'leadership principles', 'dive deep'] },
    { round: 'behavioral', question: 'Describe a time you raised the bar for quality or standards on your team (Amazon: "Insist on Highest Standards").', hint: 'Show that you proactively improve quality, not just maintain it. Describe the before and after.', difficulty: 'medium', source: 'Amazon — Leadership Principles interview', tags: ['amazon', 'quality', 'standards'] },
  ],
  'startup': [
    { round: 'hr', question: 'How do you handle ambiguity and undefined requirements?', hint: 'Startups thrive on people who can define their own success metrics. Show examples of taking initiative without being told exactly what to do.', difficulty: 'medium', source: 'Common at Series A/B startup interviews', tags: ['ambiguity', 'ownership', 'startup'] },
    { round: 'hr', question: 'Are you comfortable wearing multiple hats and working outside your core role?', hint: 'Give a concrete example of going outside your job description to solve a problem.', difficulty: 'easy', source: 'Reported at early-stage startup interviews', tags: ['flexibility', 'startup', 'ownership'] },
  ],
  'consulting': [
    { round: 'hr', question: 'Walk me through your approach to structuring a complex problem you\'ve never seen before.', hint: 'Use a structured framework: Define scope → Break into components → Prioritize → Analyze → Recommend. This is essentially consulting structured thinking.', difficulty: 'hard', source: 'Deloitte, Accenture, McKinsey HR rounds', tags: ['structured thinking', 'consulting', 'problem-solving'] },
  ],
  'finance': [
    { round: 'behavioral', question: 'Tell me about a time you made a high-stakes decision with incomplete information.', hint: 'Finance interviewers value decisive action under uncertainty. Describe your decision-making process and risk management approach.', difficulty: 'hard', source: 'Goldman Sachs, JPMorgan reported questions', tags: ['decision making', 'finance', 'risk'] },
  ],
};

// ─── Study Plan Generator ─────────────────────────────────────────────────────

const STUDY_RESOURCES: Record<string, { label: string; url: string }[]> = {
  'system design': [
    { label: 'System Design Primer (GitHub)', url: 'https://github.com/donnemartin/system-design-primer' },
    { label: 'Grokking the System Design Interview', url: 'https://www.educative.io/courses/grokking-the-system-design-interview' },
    { label: 'YouTube: Gaurav Sen — System Design', url: 'https://www.youtube.com/c/GauravSensei' },
  ],
  'dsa': [
    { label: 'LeetCode — Top Interview 150', url: 'https://leetcode.com/studyplan/top-interview-150/' },
    { label: 'NeetCode Roadmap', url: 'https://neetcode.io/roadmap' },
    { label: 'YouTube: NeetCode — DSA Patterns', url: 'https://www.youtube.com/c/NeetCode' },
  ],
  'react': [
    { label: 'React Official Docs', url: 'https://react.dev/' },
    { label: 'Patterns.dev — React Patterns', url: 'https://www.patterns.dev/' },
    { label: 'YouTube: Jack Herrington — React', url: 'https://www.youtube.com/@jherr' },
  ],
  'typescript': [
    { label: 'TypeScript Deep Dive (book)', url: 'https://basarat.gitbook.io/typescript/' },
    { label: 'TypeScript Official Handbook', url: 'https://www.typescriptlang.org/docs/handbook/' },
    { label: 'Total TypeScript — Matt Pocock', url: 'https://www.totaltypescript.com/' },
  ],
  'node.js': [
    { label: 'Node.js Official Docs', url: 'https://nodejs.org/en/docs/' },
    { label: 'YouTube: Fireship — Node.js Crash Course', url: 'https://www.youtube.com/watch?v=ENrzD9HAZK4' },
    { label: 'Node.js Best Practices (GitHub)', url: 'https://github.com/goldbergyoni/nodebestpractices' },
  ],
  'aws': [
    { label: 'AWS Free Tier + Documentation', url: 'https://aws.amazon.com/free/' },
    { label: 'AWS Skill Builder (Free Learning)', url: 'https://skillbuilder.aws/' },
    { label: 'YouTube: freeCodeCamp — AWS Certification', url: 'https://www.youtube.com/watch?v=3hLmDS179YE' },
  ],
  'docker': [
    { label: 'Docker Official Get Started Guide', url: 'https://docs.docker.com/get-started/' },
    { label: 'YouTube: TechWorld with Nana — Docker', url: 'https://www.youtube.com/watch?v=3c-iBn73dDE' },
  ],
  'kubernetes': [
    { label: 'Kubernetes Official Tutorials', url: 'https://kubernetes.io/docs/tutorials/' },
    { label: 'YouTube: TechWorld with Nana — K8s', url: 'https://www.youtube.com/watch?v=X48VuDVv0do' },
  ],
  'python': [
    { label: 'Python Official Docs', url: 'https://docs.python.org/3/' },
    { label: 'Real Python — Intermediate Topics', url: 'https://realpython.com/' },
  ],
  'sql': [
    { label: 'Mode SQL Tutorial', url: 'https://mode.com/sql-tutorial/' },
    { label: 'LeetCode — Database Problems', url: 'https://leetcode.com/problemset/database/' },
    { label: 'PostgreSQL Official Docs', url: 'https://www.postgresql.org/docs/' },
  ],
  'machine learning': [
    { label: 'fast.ai — Practical Deep Learning', url: 'https://www.fast.ai/' },
    { label: 'Google ML Crash Course', url: 'https://developers.google.com/machine-learning/crash-course' },
    { label: 'YouTube: Andrej Karpathy — Neural Networks', url: 'https://www.youtube.com/@AndrejKarpathy' },
  ],
  'behavioral': [
    { label: 'STAR Method Guide — Indeed', url: 'https://www.indeed.com/career-advice/interviewing/star-interview-questions' },
    { label: 'Amazon Leadership Principles', url: 'https://www.amazon.jobs/content/en/our-workplace/leadership-principles' },
    { label: 'YouTube: Jeff H Sipe — Behavioral Interviews', url: 'https://www.youtube.com/@jeffhsipe' },
  ],
  'default': [
    { label: 'Glassdoor — Company Interview Reviews', url: 'https://www.glassdoor.com/Interview/index.htm' },
    { label: 'Blind — Tech Company Interview Discussions', url: 'https://www.teamblind.com/' },
    { label: 'Levels.fyi — Compensation Research', url: 'https://www.levels.fyi/' },
  ],
};

function getResources(topic: string): { label: string; url: string }[] {
  const lowerTopic = topic.toLowerCase();
  for (const [key, resources] of Object.entries(STUDY_RESOURCES)) {
    if (lowerTopic.includes(key)) return resources;
  }
  return STUDY_RESOURCES['default'];
}

export function generateStudyPlan(resume: ResumeData, jd: string, context: JobContext): StudyTopic[] {
  const topics: StudyTopic[] = [];
  const resumeSkillsLower = resume.skills.map(s => s.name.toLowerCase());
  const resumeText = [
    ...resume.skills.map(s => s.name),
    ...resume.experience.flatMap(e => [...e.technologies, ...e.description]),
    ...resume.projects.flatMap(p => p.techStack),
  ].join(' ').toLowerCase();

  const jdLower = jd.toLowerCase();

  // Check for system design (senior roles)
  if ((context.seniority === 'senior' || context.seniority === 'lead') && jdLower.includes('design')) {
    const hasSystemDesign = resumeText.includes('system design') || resumeText.includes('architecture') || resumeText.includes('distributed');
    topics.push({
      topic: 'System Design & Distributed Architecture',
      reason: hasSystemDesign
        ? 'Your resume shows some architecture experience — deepen it for senior-level system design rounds.'
        : 'Senior/Lead roles always include a system design round, but no system design experience is visible on your resume.',
      priority: hasSystemDesign ? 'medium' : 'high',
      resources: STUDY_RESOURCES['system design'],
    });
  }

  // Check for DSA gaps
  const hasDSA = resumeText.includes('leetcode') || resumeText.includes('algorithm') || resumeText.includes('data structure');
  topics.push({
    topic: 'Data Structures & Algorithms (DSA)',
    reason: hasDSA
      ? 'Keep practicing common patterns — Hash Maps, BFS/DFS, Dynamic Programming, and Sliding Window are most reported.'
      : 'No DSA practice is visible on your resume. Most tech companies include at least one coding round.',
    priority: hasDSA ? 'medium' : 'high',
    resources: STUDY_RESOURCES['dsa'],
  });

  // Check JD skills not present in resume
  const skillGaps: string[] = [];
  context.skills.forEach(skill => {
    const inResume = resumeSkillsLower.some(rs => rs.includes(skill) || skill.includes(rs));
    const inResumeText = resumeText.includes(skill);
    if (!inResume && !inResumeText) skillGaps.push(skill);
  });

  skillGaps.slice(0, 5).forEach(skill => {
    topics.push({
      topic: `${skill.charAt(0).toUpperCase() + skill.slice(1)} — Skill Gap`,
      reason: `The job description explicitly mentions "${skill}" but it is not visible on your resume. Recruiters and ATS systems will scan for this.`,
      priority: 'high',
      resources: getResources(skill),
    });
  });

  // Behavioral prep
  topics.push({
    topic: 'Behavioral Interview Preparation (STAR Method)',
    reason: 'Every company has at least one behavioral round. Prepare 6-8 stories using the STAR method covering: leadership, conflict, failure, and achievement.',
    priority: 'medium',
    resources: STUDY_RESOURCES['behavioral'],
  });

  // Company-specific tips
  if (context.companyCulture === 'big-tech') {
    topics.push({
      topic: `${context.company} Leadership Principles & Culture`,
      reason: `${context.company} interviewers explicitly test cultural fit. Reviewing their published values and preparing examples mapped to each principle is critical.`,
      priority: 'high',
      resources: [
        { label: `${context.company} Careers & Culture`, url: `https://www.glassdoor.com/Interview/index.htm` },
        { label: 'Amazon Leadership Principles (if applicable)', url: 'https://www.amazon.jobs/content/en/our-workplace/leadership-principles' },
        ...STUDY_RESOURCES['default'],
      ],
    });
  }

  return topics;
}

// ─── Interview Plan Builder ───────────────────────────────────────────────────

function addIds<T extends object>(items: T[]): (T & { id: string })[] {
  return items.map((item, i) => ({ ...item, id: `q-${Date.now()}-${i}` }));
}

export function generateInterviewPlan(resume: ResumeData, jd: string): InterviewPlan {
  const context = extractJobContext(jd);

  // Build process overview based on culture + seniority
  const processOverview: string[] = [];
  if (context.companyCulture === 'big-tech') {
    processOverview.push('📞 Recruiter / HR Phone Screen (30 min)');
    processOverview.push('💻 Technical Phone Screen — Coding (45–60 min)');
    if (context.seniority === 'senior' || context.seniority === 'lead') {
      processOverview.push('🏗️ System Design Round (60 min)');
    }
    processOverview.push('🔁 Virtual On-Site Loop: 3–5 rounds (Coding + Behavioral + Leadership)');
    processOverview.push('🤝 Hiring Manager / Bar Raiser Round');
    processOverview.push('📋 Reference Checks + Offer Stage');
  } else if (context.companyCulture === 'startup') {
    processOverview.push('📞 Founder / Hiring Manager Intro Call (30 min)');
    processOverview.push('💻 Technical Take-Home Assignment (3–5 days)');
    processOverview.push('🔁 Technical Review of Take-Home + Live Coding (60 min)');
    processOverview.push('🤝 Culture Fit Round with Team (30 min)');
    processOverview.push('📋 Offer Stage');
  } else if (context.companyCulture === 'consulting') {
    processOverview.push('📞 HR Screen + Aptitude Test');
    processOverview.push('🧠 Case Interview Round 1 (Structured Problem Solving)');
    processOverview.push('🧠 Case Interview Round 2 (Partner/Manager Level)');
    processOverview.push('🤝 Fit Interview (Leadership & Behavioral)');
    processOverview.push('📋 Panel Discussion + Offer');
  } else if (context.companyCulture === 'finance') {
    processOverview.push('📞 Recruiter Phone Screen');
    processOverview.push('🧮 Technical Assessment (HackerRank or Coderpad)');
    processOverview.push('💻 Technical Interview — Systems + Problem Solving');
    processOverview.push('🤝 Behavioral Interviews with Senior Leadership');
    processOverview.push('📋 Background Check + Offer');
  } else {
    processOverview.push('📞 Initial HR / Recruiter Screening');
    processOverview.push('💻 Technical Interview (1–2 rounds)');
    processOverview.push('🤝 Hiring Manager / Culture Fit Interview');
    processOverview.push('📋 Reference Check + Offer Stage');
  }

  // Select and filter questions based on role/skills
  const jdLower = jd.toLowerCase();

  // Get company-culture specific questions
  const cultureExtras = COMPANY_SPECIFIC[context.companyCulture] || [];

  // Build each round's question list
  const hrQs = addIds([
    ...HR_QUESTIONS,
    ...cultureExtras.filter(q => q.round === 'hr'),
  ]);

  const behavioralQs = addIds([
    ...BEHAVIORAL_QUESTIONS,
    ...cultureExtras.filter(q => q.round === 'behavioral'),
  ]);

  // Filter technical questions by JD relevance (tag matching)
  const relevantTechnical = TECHNICAL_QUESTIONS.filter(q =>
    q.tags.some(tag => jdLower.includes(tag) || context.skills.includes(tag))
  );
  const technicalQs = addIds(
    relevantTechnical.length >= 4
      ? relevantTechnical
      : [...TECHNICAL_QUESTIONS.slice(0, 6), ...relevantTechnical]
  );

  const dsaQs = addIds(DSA_QUESTIONS);

  const systemDesignQs = addIds(SYSTEM_DESIGN_QUESTIONS.slice(0, context.seniority === 'junior' ? 2 : 4));

  const rounds: InterviewRoundPlan[] = [
    {
      round: 'hr',
      label: 'HR & Culture Fit',
      emoji: '🤝',
      description: 'Typically the first screening call. Tests communication, motivation, and culture alignment.',
      questions: hrQs,
    },
    {
      round: 'behavioral',
      label: 'Behavioral (STAR)',
      emoji: '⭐',
      description: 'Tests leadership, teamwork, and past behaviour using the STAR method (Situation → Task → Action → Result).',
      questions: behavioralQs,
    },
    {
      round: 'technical',
      label: 'Technical Skills',
      emoji: '💻',
      description: 'Tests depth of knowledge in your core technology stack and software engineering fundamentals.',
      questions: technicalQs,
    },
    {
      round: 'dsa',
      label: 'Coding / DSA',
      emoji: '🧩',
      description: 'Live coding round testing Data Structures and Algorithms. These are real questions reported on Glassdoor and LeetCode Discuss.',
      questions: dsaQs,
    },
    {
      round: 'system-design',
      label: 'System Design',
      emoji: '🏗️',
      description: 'Open-ended architecture round. Typically expected at mid-level and above. Tests scalability thinking.',
      questions: systemDesignQs,
    },
  ];

  const studyPlan = generateStudyPlan(resume, jd, context);

  return { context, processOverview, rounds, studyPlan };
}

// ─── Answer Scorer ────────────────────────────────────────────────────────────

export function scoreAnswer(question: string, answer: string, round: InterviewRound): AnswerScore {
  if (!answer.trim()) {
    return {
      score: 0,
      grade: 'Needs Work',
      color: 'text-rose-500 bg-rose-50 border-rose-200',
      feedback: 'No answer provided.',
      strengths: [],
      improvements: ['Please type your answer before submitting.'],
    };
  }

  const words = answer.trim().split(/\s+/);
  const wordCount = words.length;
  const answerLower = answer.toLowerCase();
  let score = 0;
  const strengths: string[] = [];
  const improvements: string[] = [];

  // 1. Answer length check (+15)
  if (wordCount >= 80) {
    score += 15;
    strengths.push(`Good answer length (${wordCount} words) — detailed enough for interviewers.`);
  } else if (wordCount >= 40) {
    score += 8;
    improvements.push(`Answer is a bit short (${wordCount} words). Aim for at least 80 words to be thorough.`);
  } else {
    improvements.push(`Answer is too brief (${wordCount} words). Provide more detail and context.`);
  }

  // 2. STAR method structure (+20 for behavioral/hr)
  if (round === 'behavioral' || round === 'hr') {
    const starKeywords = {
      situation: ['situation', 'context', 'background', 'at the time', 'was working', 'we were'],
      task: ['task', 'responsible', 'goal', 'needed to', 'my role', 'challenge was'],
      action: ['i did', 'i decided', 'i led', 'i worked', 'i implemented', 'i built', 'i collaborated', 'i coordinated', 'i spoke', 'action i took'],
      result: ['result', 'outcome', 'we achieved', 'reduced', 'improved', 'increased', 'delivered', 'saved', '%', 'million', 'thousand'],
    };

    const detected = Object.entries(starKeywords).filter(([, kws]) => kws.some(k => answerLower.includes(k)));

    if (detected.length >= 3) {
      score += 20;
      strengths.push('Strong STAR structure detected — Situation, Task, Action, and Result are all present.');
    } else if (detected.length >= 2) {
      score += 10;
      const missing = Object.keys(starKeywords).filter(k => !detected.map(d => d[0]).includes(k));
      improvements.push(`Partial STAR structure. Try to explicitly include: ${missing.join(', ')}.`);
    } else {
      improvements.push('Use the STAR method: Situation → Task → Action → Result. Structure your answer clearly.');
    }
  }

  // 3. Quantitative metrics (+15)
  const hasMetrics = /\d+%|\$\d+|\d+\s*(?:x|times|days|weeks|months|hours|users|engineers|people|projects|ms|seconds|million|k\b)/i.test(answer);
  if (hasMetrics) {
    score += 15;
    strengths.push('Great use of quantitative metrics — numbers make your impact concrete and credible.');
  } else {
    improvements.push('Add specific numbers or metrics (e.g. "reduced load time by 40%", "handled 10,000 users") to prove impact.');
  }

  // 4. Action verbs (+10)
  const actionVerbs = ['led', 'built', 'created', 'designed', 'implemented', 'architected', 'optimized', 'delivered', 'managed', 'coordinated', 'mentored', 'spearheaded', 'automated', 'engineered', 'developed', 'collaborated', 'reduced', 'improved', 'increased', 'migrated', 'established'];
  const foundVerbs = actionVerbs.filter(v => new RegExp(`\\b${v}\\b`, 'i').test(answer));
  if (foundVerbs.length >= 2) {
    score += 10;
    strengths.push(`Strong action verbs used: ${foundVerbs.slice(0, 3).join(', ')}.`);
  } else if (foundVerbs.length === 1) {
    score += 5;
    improvements.push('Use more strong action verbs (e.g. Led, Architected, Delivered, Optimized) to sound assertive.');
  } else {
    improvements.push('Start sentences with strong action verbs (Led, Built, Designed, Implemented) to sound confident.');
  }

  // 5. Technical depth for technical rounds (+20)
  if (round === 'technical' || round === 'system-design') {
    const techTerms = ['complexity', 'algorithm', 'cache', 'database', 'api', 'server', 'latency', 'throughput', 'scalab', 'microservice', 'docker', 'kubernetes', 'load balanc', 'hash', 'queue', 'async', 'concurrent', 'fault toleran', 'replica', 'sharding', 'index'];
    const foundTerms = techTerms.filter(t => answerLower.includes(t));
    if (foundTerms.length >= 3) {
      score += 20;
      strengths.push('Good technical depth — multiple engineering concepts referenced correctly.');
    } else if (foundTerms.length >= 1) {
      score += 10;
      improvements.push('Add more technical specifics — mention trade-offs, complexity, or concrete implementation details.');
    } else {
      improvements.push('For technical rounds, include specific engineering terms, trade-offs, and implementation details.');
    }
  }

  // 6. DSA specific checks (+20)
  if (round === 'dsa') {
    const dsaTerms = ['time complexity', 'space complexity', 'o(n', 'o(log', 'hash map', 'set', 'array', 'bfs', 'dfs', 'dynamic programming', 'recursion', 'iteration', 'two pointer', 'sliding window', 'greedy', 'divide and conquer', 'stack', 'queue', 'heap', 'tree', 'graph'];
    const foundDSA = dsaTerms.filter(t => answerLower.includes(t));
    if (foundDSA.length >= 2) {
      score += 20;
      strengths.push('Clear articulation of approach and complexity — shows structured algorithmic thinking.');
    } else {
      score += 5;
      improvements.push('Mention your approach (e.g. Hash Map, BFS, Two Pointers) and analyze time/space complexity.');
    }
  }

  // Normalize score
  const finalScore = Math.min(score, 100);

  // Grade
  let grade: AnswerScore['grade'] = 'Needs Work';
  let color = 'text-rose-500 bg-rose-50 border-rose-200';
  if (finalScore >= 90) { grade = 'A+'; color = 'text-emerald-600 bg-emerald-50 border-emerald-200'; }
  else if (finalScore >= 78) { grade = 'A'; color = 'text-emerald-500 bg-emerald-50 border-emerald-100'; }
  else if (finalScore >= 65) { grade = 'B'; color = 'text-blue-500 bg-blue-50 border-blue-100'; }
  else if (finalScore >= 50) { grade = 'C'; color = 'text-amber-500 bg-amber-50 border-amber-100'; }
  else if (finalScore >= 35) { grade = 'D'; color = 'text-orange-500 bg-orange-50 border-orange-100'; }

  const feedback = finalScore >= 75
    ? 'Strong answer! With a few refinements this would be excellent in a real interview.'
    : finalScore >= 50
    ? 'Decent foundation — focus on the improvements below to make this answer interview-ready.'
    : 'This answer needs significant development. Review the improvements and try again.';

  return { score: finalScore, grade, color, feedback, strengths, improvements };
}
