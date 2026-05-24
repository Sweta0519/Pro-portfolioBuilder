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
  RoleCategory,
  RoleInsights,
} from './types';

// ─── Role Classification ──────────────────────────────────────────────────────

export function classifyRole(positionName: string, jd: string): RoleCategory {
  const text = (positionName + ' ' + jd).toLowerCase();

  // Order matters: check more specific before generic
  if (/\b(ux|ui|user experience|user interface|graphic|visual|product design|interaction design)\b/.test(text)) return 'designer';
  if (/\b(devops|sre|site reliability|platform engineer|infrastructure|cloud engineer|devsecops)\b/.test(text)) return 'devops-sre';
  if (/\b(qa|quality assurance|test engineer|sdet|automation engineer|tester)\b/.test(text)) return 'qa-engineer';
  if (/\b(data scientist|ml engineer|machine learning|ai engineer|deep learning|nlp engineer)\b/.test(text)) return 'data-scientist';
  if (/\b(data analyst|business analyst|bi analyst|analytics engineer|reporting analyst|business intelligence)\b/.test(text)) return 'data-analyst';
  if (/\b(product manager|program manager|pm |product owner|head of product)\b/.test(text)) return 'product-manager';
  if (/\b(tech support|technical support|support engineer|customer support|helpdesk|it support|service desk|customer success engineer)\b/.test(text)) return 'tech-support';
  if (/\b(frontend|front-end|front end|ui developer|react developer|vue developer|angular developer)\b/.test(text)) return 'frontend-engineer';
  if (/\b(backend|back-end|back end|api developer|server.side)\b/.test(text)) return 'backend-engineer';
  if (/\b(engineering manager|tech lead|development manager|vp of engineering|director of engineering|cto)\b/.test(text)) return 'manager';
  if (/\b(sales|account executive|account manager|business development|marketing|growth)\b/.test(text)) return 'sales-marketing';
  if (/\b(software engineer|software developer|full.?stack|fullstack|swe|web developer|developer)\b/.test(text)) return 'software-engineer';

  return 'general';
}

// Rounds relevant per role category
const ROLE_ROUNDS: Record<RoleCategory, InterviewRound[]> = {
  'software-engineer':  ['hr', 'behavioral', 'technical', 'dsa', 'system-design'],
  'frontend-engineer':  ['hr', 'behavioral', 'technical', 'dsa'],
  'backend-engineer':   ['hr', 'behavioral', 'technical', 'dsa', 'system-design'],
  'tech-support':       ['hr', 'behavioral', 'technical', 'customer-scenarios'],
  'product-manager':    ['hr', 'behavioral', 'product-sense'],
  'data-analyst':       ['hr', 'behavioral', 'sql-analytics'],
  'data-scientist':     ['hr', 'behavioral', 'technical', 'ml-statistics'],
  'devops-sre':         ['hr', 'behavioral', 'infrastructure', 'system-design'],
  'qa-engineer':        ['hr', 'behavioral', 'technical', 'qa-testing'],
  'designer':           ['hr', 'behavioral', 'design-portfolio'],
  'manager':            ['hr', 'behavioral', 'leadership'],
  'sales-marketing':    ['hr', 'behavioral'],
  'general':            ['hr', 'behavioral', 'technical'],
};

// ─── Role Insights Generator ─────────────────────────────────────────────────

export function generateRoleInsights(roleCategory: RoleCategory, company: string, companyCulture: CompanyCulture, seniority: string): RoleInsights {
  const co = company !== 'the Company' ? company : 'this company';
  const isLarge = companyCulture === 'big-tech';
  const isStartup = companyCulture === 'startup';

  const insights: Record<RoleCategory, RoleInsights> = {
    'software-engineer': {
      glance: `Build and ship scalable software features end-to-end at ${co}.`,
      whatYouDo: [
        'Design, implement, and ship product features in collaboration with product and design teams',
        'Write clean, well-tested, and well-documented code in daily sprints',
        'Participate in code reviews and actively maintain code quality standards',
        isLarge ? 'Collaborate with cross-functional teams spanning multiple time zones' : 'Work closely with founders and product leads on high-impact problems',
        'Debug production issues, perform root cause analyses, and ship fixes',
        seniority === 'senior' || seniority === 'lead' ? 'Mentor junior engineers and contribute to architectural decisions' : 'Own features from design to deployment under senior engineering guidance',
      ],
      typicalDay: `At ${co}, a typical day involves morning standups, picking up sprint tickets, writing and reviewing code, attending design reviews or architecture discussions, and occasionally oncall monitoring. ${isStartup ? 'Expect fast context switching across multiple features.' : 'Processes are well-defined with structured sprint cycles.'}`,
      keySkills: ['Data Structures & Algorithms', 'System Design', 'Code Review', 'Debugging', 'Agile/Scrum'],
      topChallenges: [
        'Writing scalable code under sprint pressure',
        'Balancing technical debt reduction with feature delivery',
        'Navigating ambiguous requirements and undefined edge cases',
        seniority === 'senior' || seniority === 'lead' ? 'Influencing technical direction without direct authority' : 'Getting up to speed on large, existing codebases',
      ],
    },

    'frontend-engineer': {
      glance: `Own the entire user-facing experience and UI layer at ${co}.`,
      whatYouDo: [
        'Build pixel-perfect, responsive UI components from design specs (Figma)',
        'Optimize web performance — Core Web Vitals, bundle sizes, lazy loading',
        'Write integration and component-level tests (Jest, Cypress, Playwright)',
        'Collaborate tightly with UX designers to ensure design fidelity',
        'Manage state management solutions (Redux, Zustand, React Query)',
        'Handle cross-browser compatibility and accessibility (WCAG) standards',
      ],
      typicalDay: `At ${co}, frontend engineers typically attend design sync, review Figma specs, implement UI tickets, and run visual regression tests. ${isStartup ? 'You may also contribute to backend APIs when needed.' : 'You work with a dedicated design system team.'}`,
      keySkills: ['React / Vue / Angular', 'TypeScript', 'CSS / Tailwind', 'Web Performance', 'Accessibility'],
      topChallenges: [
        'Keeping up with the rapidly evolving JavaScript ecosystem',
        'Ensuring visual consistency across browsers and devices',
        'Balancing design fidelity with development speed',
        'Managing complex front-end state as features grow',
      ],
    },

    'backend-engineer': {
      glance: `Design and operate high-performance APIs and data systems at ${co}.`,
      whatYouDo: [
        'Build and maintain RESTful or GraphQL APIs consumed by web and mobile clients',
        'Design database schemas, query optimization, and indexing strategies',
        'Implement background jobs, message queues, and event-driven pipelines',
        'Ensure service reliability with error handling, retries, and circuit breakers',
        'Write integration tests, load tests, and monitor production SLOs',
        seniority !== 'junior' ? 'Lead API contract design discussions with product and frontend teams' : 'Own specific microservice modules under team guidance',
      ],
      typicalDay: `Backend engineers at ${co} typically begin with daily standup, then work on API endpoints or database migrations. Afternoons may include design reviews for new systems, debugging production alerts, or reviewing PRs from teammates.`,
      keySkills: ['API Design (REST/GraphQL)', 'Database Design', 'Caching (Redis)', 'Message Queues', 'Docker / Kubernetes'],
      topChallenges: [
        'Handling high-concurrency edge cases at scale',
        'Managing distributed system failures gracefully',
        'Balancing backward compatibility with evolving API contracts',
        'Keeping up with security patches and compliance requirements',
      ],
    },

    'tech-support': {
      glance: `Be the trusted technical bridge between ${co}'s customers and its engineering team.`,
      whatYouDo: [
        'Respond to and resolve customer-reported technical issues via tickets, email, or live chat',
        'Reproduce reported bugs and document clear reproduction steps for the engineering team',
        'Maintain and update the customer-facing knowledge base and help documentation',
        'Escalate complex, unresolvable issues to Tier 2 support or engineering with detailed context',
        'Run onboarding and training sessions for new enterprise customers',
        'Proactively monitor support queue health and SLA metrics (First Response Time, CSAT)',
      ],
      typicalDay: `A typical day in Tech Support at ${co} starts with triaging the ticket queue, responding to customer issues, investigating logs or error traces, and collaborating with engineers on escalated bugs. You might also attend a product sync to stay aligned on upcoming changes that could affect customers.`,
      keySkills: ['Customer Communication', 'Technical Troubleshooting', 'Log Analysis', 'Product Knowledge', 'Ticket Systems (Zendesk, Jira)'],
      topChallenges: [
        'Communicating complex technical issues to non-technical customers clearly',
        'Managing a high ticket volume while maintaining quality responses',
        'Staying current on product updates and new feature releases',
        'Handling frustrated or escalated customers with professionalism',
      ],
    },

    'product-manager': {
      glance: `Define what gets built and why at ${co} — bridging users, engineering, and business goals.`,
      whatYouDo: [
        'Define and prioritize the product roadmap based on user research, data, and strategic goals',
        'Write detailed Product Requirements Documents (PRDs) and user stories',
        'Work daily with engineering, design, and data teams to ship features on time',
        'Analyze product metrics (DAU, retention, conversion) to measure feature success',
        'Run user interviews and usability sessions to validate assumptions early',
        seniority !== 'junior' ? 'Align stakeholders and executives on product strategy and trade-offs' : 'Own specific feature areas within a larger product surface',
      ],
      typicalDay: `PMs at ${co} spend mornings in stakeholder syncs, reviewing metrics dashboards, and refining sprint backlogs. Afternoons typically involve writing PRDs, working sessions with design, and reviewing engineering progress. ${isLarge ? 'Processes are rigorous with quarterly OKR reviews.' : 'Roadmaps are more fluid and adjust frequently.'}`,
      keySkills: ['Product Thinking', 'Roadmap Prioritization', 'User Research', 'Data Analysis', 'Stakeholder Management'],
      topChallenges: [
        'Saying "no" to well-intentioned feature requests that don\'t align with strategy',
        'Translating user pain into actionable, engineering-ready requirements',
        'Balancing long-term vision with short-term sprint commitments',
        'Measuring the true impact of shipped features beyond vanity metrics',
      ],
    },

    'data-analyst': {
      glance: `Turn raw data into decisions that drive ${co}'s growth and strategy.`,
      whatYouDo: [
        'Write complex SQL queries to explore, extract, and aggregate data from multiple sources',
        'Build dashboards and reports in Tableau, Looker, or Power BI for business stakeholders',
        'Partner with product and marketing teams to define and track key KPIs',
        'Run A/B test analyses and interpret experiment results with statistical confidence',
        'Perform ad-hoc analyses to answer critical business questions quickly',
        'Document data models, metric definitions, and analysis methodologies',
      ],
      typicalDay: `At ${co}, data analysts typically start with checking key dashboards for anomalies, then work on active analysis requests from stakeholders, write SQL queries, and build or update charts. Afternoons may include presenting findings to product or leadership teams.`,
      keySkills: ['SQL (Advanced)', 'Data Visualization', 'A/B Testing', 'Python or R', 'Business Acumen'],
      topChallenges: [
        'Cleaning and reconciling data from inconsistent or incomplete sources',
        'Communicating statistical nuance to non-technical stakeholders',
        'Balancing rigor with the business demand for fast answers',
        'Defending metric definitions under scrutiny from multiple teams',
      ],
    },

    'data-scientist': {
      glance: `Build and deploy ML models that power ${co}'s core product intelligence.`,
      whatYouDo: [
        'Design, train, and evaluate machine learning models end-to-end',
        'Feature engineer from large, messy real-world datasets',
        'Run offline and online experiments to measure model impact on business metrics',
        'Collaborate with MLOps and engineering to productionize models at scale',
        'Present model insights and trade-offs clearly to non-technical stakeholders',
        seniority !== 'junior' ? 'Define the ML strategy and research directions for your team' : 'Contribute to existing ML pipelines and run targeted experiments',
      ],
      typicalDay: `Data scientists at ${co} typically spend mornings exploring datasets, training model iterations, or running evaluation experiments. Afternoons may include collaborating with engineers on API integration, reviewing model metrics in production, or presenting findings to product stakeholders.`,
      keySkills: ['Machine Learning', 'Python (PyTorch/TensorFlow)', 'Statistical Analysis', 'Feature Engineering', 'MLOps'],
      topChallenges: [
        'Bridging the gap between research-quality models and production constraints',
        'Handling data quality and distribution shift in production',
        'Communicating model uncertainty and limitations to business partners',
        'Designing fair and unbiased evaluation frameworks',
      ],
    },

    'devops-sre': {
      glance: `Keep ${co}'s infrastructure reliable, scalable, and secure — 24/7.`,
      whatYouDo: [
        'Design, build, and manage cloud infrastructure (AWS, GCP, Azure) using Terraform or Pulumi',
        'Build and maintain CI/CD pipelines to enable fast, safe deployments',
        'Monitor system health using observability tools (Datadog, Prometheus, Grafana)',
        'Respond to and lead resolution of production incidents with structured post-mortems',
        'Harden security posture — secrets management, IAM policies, network controls',
        'Automate operational toil to reduce manual work for the engineering team',
      ],
      typicalDay: `DevOps/SRE engineers at ${co} monitor infrastructure dashboards in the morning, work on automation or infra improvements, review CI/CD pipeline health, and may respond to on-call alerts. Afternoons often involve capacity planning, security reviews, or improving deployment reliability.`,
      keySkills: ['Kubernetes / Docker', 'Terraform / IaC', 'CI/CD (GitHub Actions, Jenkins)', 'Cloud Platforms (AWS/GCP)', 'Incident Management'],
      topChallenges: [
        'Balancing developer velocity with infrastructure stability',
        'Managing on-call fatigue while maintaining high availability SLAs',
        'Keeping infrastructure costs optimized as the company scales',
        'Staying ahead of security vulnerabilities in a fast-moving cloud landscape',
      ],
    },

    'qa-engineer': {
      glance: `Ensure ${co}'s product ships with confidence — owning quality from code to customer.`,
      whatYouDo: [
        'Design and execute manual and automated test plans covering functional and edge cases',
        'Build and maintain automated test suites (Selenium, Playwright, Cypress, Appium)',
        'Perform regression, integration, performance, and exploratory testing',
        'File detailed, reproducible bug reports and track them through to resolution',
        'Collaborate with developers to shift testing left in the development cycle',
        'Define test coverage metrics and report quality signals to the team',
      ],
      typicalDay: `QA engineers at ${co} typically begin with reviewing PRs and test coverage for new features, running regression suites, and triaging any failing tests. Afternoons may include writing new automation scripts, exploratory testing on pre-release builds, or attending sprint planning to estimate testing effort.`,
      keySkills: ['Test Automation (Selenium/Playwright)', 'API Testing (Postman)', 'Bug Reporting', 'SDLC Understanding', 'CI/CD Integration'],
      topChallenges: [
        'Keeping automation suites stable as the product evolves rapidly',
        'Advocating for quality investment in a fast-ship culture',
        'Balancing automation coverage with the speed of manual exploratory testing',
        'Identifying the boundary between QA and developer responsibilities',
      ],
    },

    'designer': {
      glance: `Shape how users experience and feel about ${co}'s product every day.`,
      whatYouDo: [
        'Design user interfaces, interaction flows, and information architectures in Figma',
        'Conduct user research interviews, usability tests, and competitive analyses',
        'Build and maintain a consistent design system and component library',
        'Collaborate closely with product managers and engineers to deliver designs on time',
        'Run design reviews and present concepts to leadership for sign-off',
        seniority !== 'junior' ? 'Define design principles and mentor junior designers' : 'Own specific feature UI areas under senior design guidance',
      ],
      typicalDay: `UX/UI designers at ${co} typically start with reviewing design feedback, iterating on wireframes or high-fidelity mockups, and attending product syncs. Afternoons may include conducting user interviews, presenting concepts to stakeholders, or working on design system improvements.`,
      keySkills: ['Figma / Sketch', 'User Research', 'Interaction Design', 'Design Systems', 'Prototyping'],
      topChallenges: [
        'Advocating for user needs when facing time or resource constraints',
        'Balancing aesthetic quality with engineering feasibility',
        'Getting consistent design feedback from diverse stakeholders',
        'Maintaining design system consistency as the product scales',
      ],
    },

    'manager': {
      glance: `Lead, grow, and unblock your engineering team at ${co} to ship with excellence.`,
      whatYouDo: [
        'Run 1:1s, provide structured feedback, and drive career growth for direct reports',
        'Own delivery commitments — planning sprints, removing blockers, managing scope',
        'Hire, interview, and onboard strong engineers to the team',
        'Represent your team\'s progress and roadmap to leadership and cross-functional partners',
        'Drive technical strategy and architectural decisions in partnership with senior engineers',
        'Foster a healthy, psychologically safe, and high-performance team culture',
      ],
      typicalDay: `Engineering managers at ${co} start the day with 1:1s or team standups, then shift to stakeholder syncs, sprint reviews, or hiring interviews. Afternoons may include reviewing technical designs, unblocking engineers, or reporting upward on team health and delivery timelines.`,
      keySkills: ['People Management', 'Technical Credibility', 'Roadmap Planning', 'Stakeholder Communication', 'Hiring & Recruiting'],
      topChallenges: [
        'Transitioning mindset from individual contributor to multiplying others',
        'Handling underperformance and difficult conversations with empathy',
        'Balancing short-term sprint delivery with long-term team health',
        'Maintaining technical depth while spending less time coding',
      ],
    },

    'sales-marketing': {
      glance: `Drive revenue and brand growth by bringing ${co}'s value proposition to the right customers.`,
      whatYouDo: [
        'Prospect, qualify, and close deals within your assigned territory or segment',
        'Run product demos and tailor pitches to specific customer pain points',
        'Collaborate with marketing to generate pipeline through campaigns and events',
        'Manage and expand relationships with existing accounts',
        'Track pipeline health and forecast accurately in Salesforce or HubSpot',
        'Partner with customer success to ensure smooth handoffs post-close',
      ],
      typicalDay: `Sales and marketing professionals at ${co} typically start with pipeline reviews, outreach to prospects, and product demos. Afternoons may include follow-ups, internal syncs with marketing, and preparing proposals or pricing discussions.`,
      keySkills: ['Consultative Selling', 'CRM (Salesforce)', 'Negotiation', 'Market Research', 'Communication'],
      topChallenges: [
        'Hitting pipeline and revenue targets consistently quarter over quarter',
        'Adapting the pitch to different buyer personas and company sizes',
        'Managing a complex, multi-stakeholder deal process',
        'Standing out in a competitive market with similar product offerings',
      ],
    },

    'general': {
      glance: `Contribute meaningfully to ${co}'s mission in a cross-functional role.`,
      whatYouDo: [
        'Collaborate with multiple teams to deliver high-quality work on time',
        'Own your domain and proactively communicate progress and blockers',
        'Continuously learn and improve your craft in a fast-paced environment',
        'Contribute to team culture, documentation, and knowledge-sharing',
      ],
      typicalDay: `Professionals at ${co} typically balance heads-down focused work with collaborative syncs, reviews, and cross-team communication. ${isStartup ? 'Roles are fluid with high ownership expected.' : 'Processes are structured with clear team boundaries.'}`,
      keySkills: ['Communication', 'Ownership', 'Adaptability', 'Problem Solving', 'Collaboration'],
      topChallenges: [
        'Navigating ambiguity with limited guidance',
        'Building relationships across different functions and time zones',
        'Balancing quality and speed under business pressure',
      ],
    },
  };

  return insights[roleCategory];
}

// ─── JD Parsing ───────────────────────────────────────────────────────────────

export function extractJobContext(positionName: string, jd: string): JobContext {
  const text = jd.toLowerCase();
  const combined = (positionName + ' ' + jd).toLowerCase();

  // Detect well-known companies
  const knownCompanies: Record<string, string> = {
    google: 'Google', alphabet: 'Google', amazon: 'Amazon', aws: 'Amazon Web Services',
    microsoft: 'Microsoft', meta: 'Meta', facebook: 'Meta', apple: 'Apple',
    netflix: 'Netflix', uber: 'Uber', lyft: 'Lyft', airbnb: 'Airbnb',
    linkedin: 'LinkedIn', twitter: 'X (Twitter)', salesforce: 'Salesforce',
    stripe: 'Stripe', shopify: 'Shopify', atlassian: 'Atlassian',
    oracle: 'Oracle', ibm: 'IBM', deloitte: 'Deloitte', accenture: 'Accenture',
    jpmorgan: 'JPMorgan', 'j.p. morgan': 'JPMorgan', goldman: 'Goldman Sachs',
    infosys: 'Infosys', wipro: 'Wipro', tcs: 'TCS', cognizant: 'Cognizant',
    zendesk: 'Zendesk', servicenow: 'ServiceNow', twilio: 'Twilio',
    datadog: 'Datadog', snowflake: 'Snowflake', palantir: 'Palantir',
  };
  let company = 'the Company';
  for (const [key, name] of Object.entries(knownCompanies)) {
    if (text.includes(key)) { company = name; break; }
  }
  // Fallback heuristic pattern
  if (company === 'the Company') {
    const patterns = [
      /^([A-Z][a-zA-Z0-9\s&]{2,30}?)\s+is (?:hiring|looking|seeking)/m,
      /(?:at|join)\s+([A-Z][a-zA-Z0-9\s&]{2,25}?)(?:\s*[,\.\n])/,
    ];
    for (const p of patterns) {
      const m = jd.match(p);
      if (m && m[1]) { company = m[1].trim(); break; }
    }
  }

  // Detect seniority
  let seniority: JobContext['seniority'] = 'mid';
  if (/\b(vp|vice president|principal|staff|distinguished|director)\b/i.test(combined)) seniority = 'lead';
  else if (/\b(senior|sr\.?|lead|architect|manager)\b/i.test(combined)) seniority = 'senior';
  else if (/\b(junior|jr\.?|associate|entry.level|graduate|intern)\b/i.test(combined)) seniority = 'junior';

  // Use position name as the role, fall back to JD extraction
  const role = positionName.trim() || (() => {
    const pats = [
      /(?:position|role|title)[:\s]+([^\n,\.]{5,60})/i,
      /(?:we are (?:looking|hiring)(?: for)?)[:\s]+(?:a|an)\s+([^\n,\.]{5,60})/i,
    ];
    for (const p of pats) {
      const m = jd.match(p);
      if (m && m[1]) return m[1].trim();
    }
    return 'Software Engineer';
  })();

  // Extract required skills
  const techKeywords = [
    'react', 'vue', 'angular', 'next.js', 'typescript', 'javascript', 'python',
    'java', 'go', 'rust', 'c++', 'c#', '.net', 'kotlin', 'swift', 'node.js',
    'express', 'nestjs', 'fastapi', 'django', 'spring boot', 'graphql', 'rest api',
    'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'kafka', 'rabbitmq',
    'docker', 'kubernetes', 'terraform', 'aws', 'gcp', 'azure', 'ci/cd',
    'machine learning', 'pytorch', 'tensorflow', 'sql', 'tableau', 'looker',
    'figma', 'tailwind', 'jest', 'cypress', 'playwright', 'selenium', 'jira',
    'zendesk', 'salesforce', 'hubspot',
  ];
  const skills = techKeywords.filter(k => text.includes(k));

  // Detect culture
  let companyCulture: CompanyCulture = 'generic';
  const bigTechNames = ['google', 'meta', 'amazon', 'apple', 'microsoft', 'netflix', 'uber', 'airbnb', 'stripe', 'linkedin'];
  const consultingNames = ['deloitte', 'accenture', 'mckinsey', 'bcg', 'pwc', 'kpmg'];
  const financeNames = ['goldman', 'jpmorgan', 'morgan stanley', 'blackrock', 'citadel', 'jane street', 'bank', 'hedge fund'];
  const startupSignals = ['seed', 'series a', 'series b', 'startup', 'early-stage', 'small team', 'hypergrowth', 'wear many hats'];

  if (bigTechNames.some(n => text.includes(n))) companyCulture = 'big-tech';
  else if (consultingNames.some(n => text.includes(n))) companyCulture = 'consulting';
  else if (financeNames.some(n => text.includes(n))) companyCulture = 'finance';
  else if (startupSignals.some(n => text.includes(n))) companyCulture = 'startup';

  const roleCategory = classifyRole(positionName, jd);

  return {
    company,
    role,
    positionName,
    roleCategory,
    seniority,
    skills,
    isStartup: companyCulture === 'startup',
    companyCulture,
  };
}

// ─── Question Banks ───────────────────────────────────────────────────────────

const HR_QUESTIONS: Omit<InterviewQuestion, 'id'>[] = [
  { round: 'hr', question: 'Tell me about yourself and your professional background.', hint: 'Structure: Present → Past → Future. Keep it under 2 minutes. End with why you\'re excited about this role.', sampleAnswer: 'I am a [role] with [X] years of experience in [domain]. Currently I [key achievement]. Before that, I [background]. I\'m excited about this role at [company] because [reason].', difficulty: 'easy', source: 'Universal — asked in virtually every first interview', tags: ['intro'] },
  { round: 'hr', question: 'Why do you want to work at [Company]?', hint: 'Research the company\'s mission, recent product launches, and engineering blog. Be specific, not generic.', difficulty: 'easy', source: 'Glassdoor — Top 3 most common HR questions', tags: ['motivation'] },
  { round: 'hr', question: 'What are your salary expectations?', hint: 'Research market rates on Levels.fyi or Glassdoor first. Give a range anchored slightly above your target.', difficulty: 'medium', source: 'Standard HR screen question', tags: ['compensation'] },
  { round: 'hr', question: 'Where do you see yourself in 5 years?', hint: 'Align your growth goals with what this company and this role specifically offers. Don\'t mention competitors.', difficulty: 'easy', source: 'Glassdoor — Frequently reported', tags: ['growth'] },
  { round: 'hr', question: 'Why are you leaving your current role?', hint: 'Keep this positive and forward-looking. Focus on the opportunity ahead, not the problems behind.', difficulty: 'medium', source: 'Standard HR screen', tags: ['motivation'] },
  { round: 'hr', question: 'What is your biggest professional strength and how have you applied it recently?', hint: 'Pick one concrete strength with a quantified example. Avoid vague answers like "I\'m a hard worker."', difficulty: 'easy', source: 'Universal — frequently reported', tags: ['strengths'] },
  { round: 'hr', question: 'Tell me about a weakness you\'ve been actively working to improve.', hint: 'Show real self-awareness + concrete steps taken. Avoid clichés like "I work too hard."', difficulty: 'medium', source: 'Universal — standard HR question', tags: ['self-awareness'] },
];

const BEHAVIORAL_QUESTIONS: Omit<InterviewQuestion, 'id'>[] = [
  { round: 'behavioral', question: 'Tell me about a time you disagreed with your manager\'s decision. What did you do?', hint: 'Use STAR. Show you raised concerns with data and respect, then committed to the final decision.', difficulty: 'hard', source: 'Amazon Leadership Principles — frequently reported on Glassdoor', tags: ['conflict', 'leadership'] },
  { round: 'behavioral', question: 'Describe a time you had to meet an extremely tight deadline. How did you manage it?', hint: 'Quantify the outcome. Show prioritization, communication, and trade-off decisions — not just "I worked late."', difficulty: 'medium', source: 'Glassdoor — Top behavioral question across all roles', tags: ['deadlines', 'prioritization'] },
  { round: 'behavioral', question: 'Give an example of a time you took ownership of a problem that wasn\'t your responsibility.', hint: 'Amazon\'s "Ownership" LP. Show initiative and the tangible positive impact your action created.', difficulty: 'medium', source: 'Amazon — Leadership Principles interview', tags: ['ownership'] },
  { round: 'behavioral', question: 'Tell me about a time you failed. What did you learn, and what did you change afterward?', hint: 'Be honest. Interviewers look for self-awareness and growth mindset, not a perfect record.', difficulty: 'hard', source: 'Universal — Google, Meta, Amazon, Microsoft all report this', tags: ['failure', 'learning'] },
  { round: 'behavioral', question: 'Describe a situation where you had to influence someone without direct authority.', hint: 'Show data, empathy, and stakeholder management. Useful for any cross-functional role.', difficulty: 'hard', source: 'Common at senior+ levels across all companies', tags: ['influence', 'collaboration'] },
  { round: 'behavioral', question: 'Tell me about a time you had to quickly learn a new technology or domain.', hint: 'Show adaptability: describe your learning approach — structured resources, prototyping, pairing.', difficulty: 'medium', source: 'Glassdoor — Startup and Big Tech interviews', tags: ['learning', 'adaptability'] },
  { round: 'behavioral', question: 'Give an example where you used data to make an important decision.', hint: 'Describe the data sources, metrics used, and how you validated your decision. Show analytical thinking.', difficulty: 'medium', source: 'Google, Meta — frequently reported', tags: ['data-driven'] },
];

const TECHNICAL_QUESTIONS: Omit<InterviewQuestion, 'id'>[] = [
  { round: 'technical', question: 'Explain the difference between REST and GraphQL. When would you choose one over the other?', hint: 'REST: simpler, cacheable. GraphQL: flexible client-driven queries, solves over/under-fetching. Pick based on client complexity.', difficulty: 'medium', source: 'Glassdoor — Frontend and Fullstack roles', tags: ['api', 'rest', 'graphql'] },
  { round: 'technical', question: 'What is the difference between horizontal and vertical scaling?', hint: 'Vertical = bigger machine. Horizontal = more machines. Discuss statelessness, load balancers, and CAP theorem.', difficulty: 'medium', source: 'Glassdoor — Backend and infrastructure roles', tags: ['scaling', 'system design'] },
  { round: 'technical', question: 'How does a browser render a webpage? Walk me through the critical rendering path.', hint: 'DNS → TCP → HTML parse → DOM/CSSOM → Render tree → Layout → Paint → Composite. Mention JS blocking.', difficulty: 'hard', source: 'Google, Meta frontend interviews', tags: ['browser', 'performance', 'frontend'] },
  { round: 'technical', question: 'Explain event loop and asynchronous execution in JavaScript.', hint: 'Call stack → Web APIs → Callback queue → Microtask queue. Use setTimeout vs Promise to illustrate.', difficulty: 'hard', source: 'Glassdoor — Node.js and frontend engineering', tags: ['javascript', 'async'] },
  { round: 'technical', question: 'What are SOLID principles? Give an example of one you applied.', hint: 'Focus on Open/Closed or Dependency Inversion if you have real examples. Be concrete, not theoretical.', difficulty: 'medium', source: 'Common in backend and full-stack interviews', tags: ['solid', 'architecture'] },
  { round: 'technical', question: 'How would you optimize a slow database query?', hint: 'Indexes (EXPLAIN plan), N+1 queries, pagination, caching (Redis), connection pooling, query rewriting.', difficulty: 'hard', source: 'Glassdoor — Backend and data engineering', tags: ['database', 'performance', 'sql'] },
  { round: 'technical', question: 'What is JWT-based authentication? How does it work end-to-end?', hint: 'JWT structure (header.payload.signature), signing, token expiry, refresh tokens, httpOnly cookie vs localStorage security trade-offs.', difficulty: 'medium', source: 'Universal — all engineering roles', tags: ['security', 'authentication'] },
  { round: 'technical', question: 'Explain microservices vs monolith. What are the trade-offs?', hint: 'Monolith: simpler to start. Microservices: independent scaling but adds ops overhead, network failures, distributed tracing complexity.', difficulty: 'hard', source: 'Common at senior+ engineering interviews', tags: ['microservices', 'architecture'] },
  { round: 'technical', question: 'How does Docker work? What is the difference between an image and a container?', hint: 'Image = read-only template (layers). Container = running instance. Cover Dockerfile, layered filesystem, docker-compose.', difficulty: 'easy', source: 'Glassdoor — DevOps, backend, fullstack roles', tags: ['docker', 'devops'] },
  { round: 'technical', question: 'What is memoization and how does React use it for performance?', hint: 'useMemo, useCallback, React.memo — explain when to use each, and when premature optimization hurts readability.', difficulty: 'medium', source: 'React/Frontend engineering interviews', tags: ['react', 'performance'] },
];

const DSA_QUESTIONS: Omit<InterviewQuestion, 'id'>[] = [
  { round: 'dsa', question: 'Two Sum — Find two numbers in an array that add up to a target value.', hint: 'Hash Map gives O(n). Brute-force is O(n²). Interviewers expect the optimal approach.', difficulty: 'easy', source: 'LeetCode #1 — Reported at Google, Amazon, Meta, Microsoft', tags: ['hash map', 'array'] },
  { round: 'dsa', question: 'Merge Intervals — Given overlapping intervals, merge them all.', hint: 'Sort by start time. Greedy merge: if current.start ≤ last.end, merge; else add new interval.', difficulty: 'medium', source: 'LeetCode #56 — Reported at Google, Facebook, LinkedIn', tags: ['sorting', 'greedy'] },
  { round: 'dsa', question: 'Binary Tree Level Order Traversal (BFS).', hint: 'Queue-based BFS. Process each level\'s nodes, push children to the queue. Classic pattern.', difficulty: 'medium', source: 'LeetCode #102 — Facebook, Google, Amazon', tags: ['bfs', 'tree'] },
  { round: 'dsa', question: 'LRU Cache — Design a data structure supporting O(1) get and put.', hint: 'Hash Map + Doubly Linked List combination. Move accessed nodes to front. Evict from back.', difficulty: 'hard', source: 'LeetCode #146 — Google, Amazon, Uber, Lyft', tags: ['design', 'hash map', 'linked list'] },
  { round: 'dsa', question: 'Number of Islands — Count distinct land masses in a binary grid.', hint: 'DFS/BFS flood-fill from each unvisited "1". Mark visited cells as "0" to avoid revisiting.', difficulty: 'medium', source: 'LeetCode #200 — Google, Amazon, Uber', tags: ['dfs', 'bfs', 'matrix'] },
  { round: 'dsa', question: 'Find the kth largest element in an unsorted array.', hint: 'QuickSelect: O(n) average. Min-Heap of size k: O(n log k). Both are valid — explain trade-offs.', difficulty: 'medium', source: 'LeetCode #215 — Facebook, LinkedIn, Microsoft', tags: ['heap', 'sorting'] },
  { round: 'dsa', question: 'Coin Change — Find minimum coins to make a given amount.', hint: 'Bottom-up DP: dp[i] = min coins for amount i. Init dp[0]=0, all others to Infinity.', difficulty: 'medium', source: 'LeetCode #322 — Google, Amazon', tags: ['dynamic programming'] },
  { round: 'dsa', question: 'Serialize and Deserialize a Binary Tree.', hint: 'BFS level-order with null markers, or DFS preorder. Key: matching serialize/deserialize logic.', difficulty: 'hard', source: 'LeetCode #297 — Facebook, Google', tags: ['tree', 'design'] },
];

const SYSTEM_DESIGN_QUESTIONS: Omit<InterviewQuestion, 'id'>[] = [
  { round: 'system-design', question: 'Design a URL Shortener (like bit.ly).', hint: 'ID generation (base62), redirect via 301/302, DB schema, hot URL caching (Redis), analytics, rate limiting.', difficulty: 'medium', source: 'Glassdoor — Very common at Google, Amazon, Uber, Stripe', tags: ['hashing', 'caching', 'scalability'] },
  { round: 'system-design', question: 'Design a scalable push notification system.', hint: 'Message queues (Kafka/SQS), fan-out pattern, retry logic, delivery guarantees, user preference store, rate limiting per channel.', difficulty: 'hard', source: 'Reported at Amazon, Uber, Airbnb, LinkedIn', tags: ['messaging', 'queue', 'scalability'] },
  { round: 'system-design', question: 'Design a social media news feed (like Twitter\'s Home Timeline).', hint: 'Fan-out on write vs read, celebrity problem (hybrid approach), timeline caching, CDN for media, ranking model.', difficulty: 'hard', source: 'Classic — Google, Facebook, Twitter interviews', tags: ['feed', 'caching', 'scalability'] },
  { round: 'system-design', question: 'Design a distributed Rate Limiter.', hint: 'Token bucket vs sliding window. Redis + Lua for atomic operations. Handle clock skew in distributed nodes.', difficulty: 'hard', source: 'Reported at Stripe, Cloudflare, Google, Uber', tags: ['rate limiting', 'redis', 'distributed systems'] },
];

// ─── Role-Specific Question Banks ────────────────────────────────────────────

const CUSTOMER_SCENARIO_QUESTIONS: Omit<InterviewQuestion, 'id'>[] = [
  { round: 'customer-scenarios', question: 'A customer contacts you saying they cannot log in to their account. Walk me through how you would troubleshoot this step by step.', hint: 'Systematic: Verify credentials → Check account status (locked/suspended) → Browser/cookies → Password reset flow → Escalate if backend.', difficulty: 'medium', source: 'Glassdoor — Tech Support interviews across SaaS companies', tags: ['troubleshooting', 'auth'] },
  { round: 'customer-scenarios', question: 'You receive a ticket from an angry enterprise customer saying the product has been down for 2 hours during a critical business period. How do you handle this?', hint: 'Acknowledge immediately, check status page, communicate ETA, escalate internally, maintain calm professionalism, document post-resolution.', difficulty: 'hard', source: 'Common at Zendesk, Salesforce, ServiceNow support interviews', tags: ['escalation', 'communication', 'crisis'] },
  { round: 'customer-scenarios', question: 'A non-technical customer cannot understand your technical explanation. How do you adjust your communication?', hint: 'Use analogies, avoid jargon, ask what they already understand, confirm comprehension with open-ended questions.', difficulty: 'medium', source: 'Universal — all customer-facing technical roles', tags: ['communication', 'empathy'] },
  { round: 'customer-scenarios', question: 'How would you handle a customer who insists on a feature that is not on the product roadmap and will not accept the answer?', hint: 'Acknowledge the pain, explain the prioritization rationale, offer workarounds if available, log the feedback formally, set realistic expectations.', difficulty: 'medium', source: 'Glassdoor — Customer Success Engineer interviews', tags: ['expectations', 'product knowledge'] },
  { round: 'customer-scenarios', question: 'You notice a pattern: 10 customers this week all reported the same bug. What do you do?', hint: 'Document pattern → Reproduce internally → Write detailed engineering escalation with all examples → Proactively reach out to affected customers → Monitor.', difficulty: 'medium', source: 'Glassdoor — Tech Support and Support Engineering roles', tags: ['pattern recognition', 'escalation', 'proactivity'] },
  { round: 'customer-scenarios', question: 'How do you prioritize a queue of 30 open support tickets with varying severity?', hint: 'P1 (outages, data loss) first, then SLA timers, then by customer tier (enterprise vs. free). Show you understand business impact, not just first-come-first-served.', difficulty: 'medium', source: 'Common at SaaS support roles (Datadog, Twilio, Zendesk)', tags: ['prioritization', 'sla'] },
  { round: 'customer-scenarios', question: 'Walk me through how you would write a knowledge base article for a common customer issue.', hint: 'Title (searchable), symptom description, step-by-step resolution, screenshots/code snippets, related articles, feedback mechanism.', difficulty: 'easy', source: 'Standard in all Support Engineer job descriptions', tags: ['documentation', 'knowledge base'] },
];

const PRODUCT_SENSE_QUESTIONS: Omit<InterviewQuestion, 'id'>[] = [
  { round: 'product-sense', question: 'How would you improve [Company]\'s core product? What metric would you move?', hint: 'Use a framework: Identify user segment → Current pain → Proposed solution → Expected metric impact. Be specific, not generic.', difficulty: 'hard', source: 'Facebook/Meta PM interviews — frequently reported', tags: ['product thinking', 'metrics'] },
  { round: 'product-sense', question: 'You have 3 feature requests from 3 different teams. How do you decide what to prioritize on the roadmap?', hint: 'Use a prioritization framework: RICE (Reach × Impact × Confidence / Effort), or MoSCoW. Show you weigh strategic alignment, not just individual team requests.', difficulty: 'hard', source: 'Universal PM interview question across all companies', tags: ['prioritization', 'roadmap'] },
  { round: 'product-sense', question: 'A key product metric (e.g., Daily Active Users) dropped 15% last week. Walk me through how you investigate this.', hint: 'Segment → Compare (time, geography, platform, user type) → Correlate with recent releases or external events → Hypothesize root cause → Define fix and success metric.', difficulty: 'hard', source: 'Google, Amazon, Airbnb PM interviews', tags: ['metrics', 'root cause analysis'] },
  { round: 'product-sense', question: 'Design a product for elderly people who are not comfortable with technology but need medical appointment reminders.', hint: 'Start with empathy: what does this user segment fear? Design for simplicity — large text, voice, SMS. Define success by adoption, not just downloads.', difficulty: 'medium', source: 'Glassdoor — PM design questions', tags: ['product design', 'user empathy'] },
  { round: 'product-sense', question: 'How would you decide whether to build a feature in-house or buy a third-party solution?', hint: 'Consider: core competency, cost (build vs. license), time to market, customization needs, vendor lock-in risk, and long-term maintainability.', difficulty: 'medium', source: 'Common at B2B SaaS PM interviews', tags: ['build vs buy', 'strategy'] },
];

const SQL_ANALYTICS_QUESTIONS: Omit<InterviewQuestion, 'id'>[] = [
  { round: 'sql-analytics', question: 'Write a SQL query to find the top 5 customers by total revenue in the last 30 days.', hint: 'Use SUM(), GROUP BY customer_id, ORDER BY DESC, LIMIT 5. Add a WHERE clause filtering on order_date >= NOW() - INTERVAL 30 DAY.', difficulty: 'medium', source: 'Common SQL screen for all data analyst roles', tags: ['sql', 'aggregation'] },
  { round: 'sql-analytics', question: 'What is the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN? Give a business example of when you\'d use each.', hint: 'INNER: matched rows only. LEFT: all left + matched right. FULL OUTER: all rows from both. Example: customers with/without orders.', difficulty: 'easy', source: 'Universal — every data analyst interview', tags: ['sql', 'joins'] },
  { round: 'sql-analytics', question: 'How would you calculate a 7-day rolling average of daily signups in SQL?', hint: 'Use a window function: AVG(signups) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW).', difficulty: 'hard', source: 'Glassdoor — Analytics Engineer and Data Analyst interviews', tags: ['sql', 'window functions'] },
  { round: 'sql-analytics', question: 'A business stakeholder asks: "Why did our conversion rate drop last month?" How do you approach this analysis?', hint: 'Segment by: channel, geography, device, user cohort. Compare period-over-period. Check for external events or product changes.', difficulty: 'hard', source: 'Common at Airbnb, Uber, DoorDash analyst interviews', tags: ['analysis', 'conversion', 'segmentation'] },
  { round: 'sql-analytics', question: 'What is the difference between a fact table and a dimension table in a data warehouse?', hint: 'Fact table: transactional measures (orders, revenue). Dimension table: descriptive attributes (customer, product, geography). Star schema design.', difficulty: 'medium', source: 'Standard data modeling question for analysts and BI roles', tags: ['data modeling', 'warehousing'] },
  { round: 'sql-analytics', question: 'How would you design an A/B test to measure whether a new checkout flow increases conversion?', hint: 'Define hypothesis → Identify randomization unit (user/session) → Calculate sample size → Set success metric and guardrail metrics → Run for statistical power.', difficulty: 'hard', source: 'Glassdoor — Airbnb, Booking.com, Meta analyst interviews', tags: ['a/b testing', 'statistics'] },
];

const ML_STATISTICS_QUESTIONS: Omit<InterviewQuestion, 'id'>[] = [
  { round: 'ml-statistics', question: 'Explain bias-variance tradeoff. How do you diagnose which one is hurting your model?', hint: 'High bias = underfitting (simple model, low training accuracy). High variance = overfitting (high training, low test accuracy). Use learning curves to diagnose.', difficulty: 'hard', source: 'Universal — every data science interview', tags: ['ml fundamentals', 'model evaluation'] },
  { round: 'ml-statistics', question: 'When would you use precision vs recall vs F1 score as your primary evaluation metric?', hint: 'Precision: when false positives are costly (spam filter). Recall: when false negatives are costly (cancer detection). F1: balanced when both matter.', difficulty: 'medium', source: 'Glassdoor — ML Engineer and Data Scientist interviews', tags: ['model evaluation', 'metrics'] },
  { round: 'ml-statistics', question: 'Walk me through how you would build a recommendation system from scratch.', hint: 'Options: Collaborative filtering, content-based, or hybrid. Cover data needed, cold start problem, evaluation (offline: NDCG; online: CTR), and scalability.', difficulty: 'hard', source: 'Reported at Netflix, Spotify, Amazon, LinkedIn ML interviews', tags: ['recommendation systems', 'ml design'] },
  { round: 'ml-statistics', question: 'What is regularization? Why do L1 and L2 produce different results?', hint: 'L1 (Lasso): sparsity, feature selection. L2 (Ridge): shrinks all weights. L1 can zero out features; L2 distributes penalty smoothly.', difficulty: 'medium', source: 'Common data science technical screen', tags: ['regularization', 'statistics'] },
  { round: 'ml-statistics', question: 'How do you handle class imbalance in a classification problem?', hint: 'Resampling (SMOTE, undersampling), class weights, threshold tuning, anomaly detection framing, or different evaluation metric (F1, AUC-ROC).', difficulty: 'medium', source: 'Glassdoor — Data Scientist interviews across industries', tags: ['class imbalance', 'classification'] },
];

const INFRASTRUCTURE_QUESTIONS: Omit<InterviewQuestion, 'id'>[] = [
  { round: 'infrastructure', question: 'Walk me through how you would set up a CI/CD pipeline for a new microservice from scratch.', hint: 'Code push → Lint/Test → Build Docker image → Push to registry → Deploy to staging → Integration tests → Promote to prod with canary/blue-green.', difficulty: 'medium', source: 'Common at DevOps/SRE interviews across all companies', tags: ['ci/cd', 'docker', 'automation'] },
  { round: 'infrastructure', question: 'Your service\'s p99 latency spiked from 200ms to 2000ms in production. Walk me through your incident response.', hint: 'Alert → Incident commander → Check dashboards (CPU/memory/network/errors) → Recent deployments → Correlate → Remediate (rollback?) → Post-mortem.', difficulty: 'hard', source: 'Glassdoor — SRE at Google, Cloudflare, Datadog', tags: ['incident response', 'observability'] },
  { round: 'infrastructure', question: 'Explain Kubernetes Deployments, Services, and Ingress. How do they work together?', hint: 'Deployment: manages pod replicas. Service: internal load balancer / DNS. Ingress: external HTTP routing to services. Traffic path: External → Ingress → Service → Pod.', difficulty: 'hard', source: 'Glassdoor — Platform and DevOps engineering', tags: ['kubernetes', 'networking'] },
  { round: 'infrastructure', question: 'How would you reduce cloud infrastructure costs by 30% without impacting reliability?', hint: 'Right-size instances (compute), spot/preemptible VMs for batch, reserved instances for base load, S3 lifecycle policies, eliminate idle resources, optimize data transfer costs.', difficulty: 'hard', source: 'Common FinOps question at all cloud-native companies', tags: ['cost optimization', 'cloud'] },
  { round: 'infrastructure', question: 'What is the difference between infrastructure as code tools like Terraform and Ansible?', hint: 'Terraform: declarative, infrastructure provisioning, state-based. Ansible: imperative/procedural, configuration management, agentless. Often used together.', difficulty: 'medium', source: 'Glassdoor — DevOps interviews', tags: ['terraform', 'ansible', 'iac'] },
];

const QA_TESTING_QUESTIONS: Omit<InterviewQuestion, 'id'>[] = [
  { round: 'qa-testing', question: 'How would you design a test plan for a new login feature from scratch?', hint: 'Cover: valid login, wrong password, locked account, case sensitivity, session timeout, remember me, OAuth flows, mobile, and security (brute force protection).', difficulty: 'medium', source: 'Common at all QA Engineer interviews', tags: ['test planning', 'functional testing'] },
  { round: 'qa-testing', question: 'What is the difference between white-box and black-box testing? When do you use each?', hint: 'Black-box: test without code knowledge (functional). White-box: test with code knowledge (unit, coverage). Use together for full coverage.', difficulty: 'easy', source: 'Universal QA interview question', tags: ['testing fundamentals'] },
  { round: 'qa-testing', question: 'How would you approach testing a REST API without a UI?', hint: 'Postman/REST Client for manual. Pytest or Newman for automation. Test: valid inputs, invalid inputs, auth, error codes, schema validation, rate limits.', difficulty: 'medium', source: 'Glassdoor — QA and SDET interviews', tags: ['api testing', 'postman'] },
  { round: 'qa-testing', question: 'What is the test pyramid? Why do we care about it?', hint: 'Unit tests (many, fast, cheap) → Integration tests (fewer) → E2E tests (fewest, slow, expensive). Inverting the pyramid leads to slow, flaky test suites.', difficulty: 'easy', source: 'Common SDET and QA Automation interviews', tags: ['test pyramid', 'strategy'] },
  { round: 'qa-testing', question: 'How do you handle flaky automated tests that sometimes pass and sometimes fail?', hint: 'Identify the root cause: timing issues → add explicit waits. Network/state dependency → mock or isolate. Quarantine flaky tests while investigating. Track flakiness metrics.', difficulty: 'hard', source: 'Glassdoor — SDET and QA Automation roles', tags: ['flaky tests', 'automation'] },
];

const DESIGN_PORTFOLIO_QUESTIONS: Omit<InterviewQuestion, 'id'>[] = [
  { round: 'design-portfolio', question: 'Walk me through a product in your portfolio you are most proud of. What was your design process?', hint: 'Cover: Problem definition → User research → Ideation → Wireframes → Testing → Iteration → Final design → Outcomes/impact.', difficulty: 'medium', source: 'Universal — every UX/UI design interview', tags: ['portfolio', 'design process'] },
  { round: 'design-portfolio', question: 'How do you balance aesthetics with usability when they conflict?', hint: 'Usability usually wins — beauty that confuses users is not good design. Show examples where you made this trade-off consciously.', difficulty: 'hard', source: 'Glassdoor — UX Designer interviews', tags: ['design philosophy', 'usability'] },
  { round: 'design-portfolio', question: 'Tell me about a time user research changed the direction of your design significantly.', hint: 'Show humility: your initial assumption was wrong, research proved it. Describe what you discovered and how you pivoted the design.', difficulty: 'medium', source: 'Common at product design interviews', tags: ['user research', 'iteration'] },
  { round: 'design-portfolio', question: 'How do you ensure your designs are accessible (WCAG standards)?', hint: 'Color contrast ratios (4.5:1), keyboard navigation, ARIA labels, focus states, alt text for images, screen reader testing.', difficulty: 'medium', source: 'Universal — increasingly standard across all design roles', tags: ['accessibility', 'wcag'] },
  { round: 'design-portfolio', question: 'How do you work with engineers to ensure your designs are implemented correctly?', hint: 'Handoff process: Figma annotations, design tokens, redlines. Regular check-ins during implementation. QA the built UI against the spec.', difficulty: 'easy', source: 'Common at in-house product design roles', tags: ['collaboration', 'handoff'] },
];

const LEADERSHIP_QUESTIONS: Omit<InterviewQuestion, 'id'>[] = [
  { round: 'leadership', question: 'Tell me about a time you had to let someone go or deliver critical performance feedback. How did you handle it?', hint: 'Show empathy, directness, and process: documented feedback → PIP → clear expectations → outcome. Avoid vague answers.', difficulty: 'hard', source: 'Common at Engineering Manager and Director interviews', tags: ['people management', 'feedback'] },
  { round: 'leadership', question: 'How do you balance technical debt reduction with delivering new features under business pressure?', hint: 'Negotiate, don\'t fight. Quantify the cost of debt in engineering time. Embed 20-30% refactoring in sprints. Use metrics to build the business case.', difficulty: 'hard', source: 'Glassdoor — Engineering Manager and VP Engineering', tags: ['technical debt', 'strategy'] },
  { round: 'leadership', question: 'How do you build and maintain a high-performing, psychologically safe engineering team?', hint: 'Psychological safety: make it safe to fail, share bad news, and ask questions. Build trust through 1:1s, transparency, and consistent recognition.', difficulty: 'hard', source: 'Common at senior engineering leadership interviews', tags: ['team culture', 'psychological safety'] },
  { round: 'leadership', question: 'How do you onboard a new engineer so they are productive in their first 30/60/90 days?', hint: '30 days: orient, first merged PR. 60 days: own a feature end-to-end. 90 days: first complete sprint independently. Pair with a buddy, frequent 1:1s.', difficulty: 'medium', source: 'Glassdoor — Engineering Manager roles', tags: ['onboarding', 'team growth'] },
  { round: 'leadership', question: 'Describe your approach to technical roadmap planning. How do you balance top-down business goals with bottom-up engineering needs?', hint: 'Translate business OKRs into engineering goals. Engineer-driven input on tech debt and platform improvements. Negotiate in quarterly planning cycles.', difficulty: 'hard', source: 'Glassdoor — VP Engineering, Director, Senior Manager roles', tags: ['roadmap', 'planning', 'strategy'] },
];

// Company-specific behavioral injections
const COMPANY_SPECIFIC_QUESTIONS: Partial<Record<string, Omit<InterviewQuestion, 'id'>[]>> = {
  'big-tech': [
    { round: 'behavioral', question: 'Tell me about a time you dove deep into a problem beyond the surface to find its root cause. (Amazon: "Dive Deep")', hint: 'Amazon values leaders who investigate thoroughly. Describe the investigation process and the non-obvious root cause you found.', difficulty: 'hard', source: 'Amazon Leadership Principles interview', tags: ['amazon', 'dive deep'] },
    { round: 'behavioral', question: 'Describe a time you raised the bar for quality or standards on your team. ("Insist on Highest Standards")', hint: 'Show you proactively raised quality, not just maintained it. Describe the before/after delta.', difficulty: 'medium', source: 'Amazon Leadership Principles interview', tags: ['amazon', 'quality'] },
  ],
  'startup': [
    { round: 'hr', question: 'How do you handle ambiguity and undefined requirements?', hint: 'Startups need people who can define their own success metrics. Show examples of taking initiative without waiting for clarity.', difficulty: 'medium', source: 'Common at Series A/B startup interviews', tags: ['ambiguity', 'startup'] },
    { round: 'hr', question: 'Are you comfortable working outside your core role and owning things end-to-end?', hint: 'Give a concrete example of going outside your job description to solve a high-priority problem.', difficulty: 'easy', source: 'Reported at early-stage startup interviews', tags: ['flexibility', 'startup'] },
  ],
};

// ─── Study Resources ──────────────────────────────────────────────────────────

const STUDY_RESOURCES: Record<string, { label: string; url: string }[]> = {
  'system design':    [{ label: 'System Design Primer (GitHub)', url: 'https://github.com/donnemartin/system-design-primer' }, { label: 'Grokking the System Design Interview', url: 'https://www.educative.io/courses/grokking-the-system-design-interview' }, { label: 'YouTube: Gaurav Sen — System Design', url: 'https://www.youtube.com/c/GauravSensei' }],
  'dsa':              [{ label: 'LeetCode Top Interview 150', url: 'https://leetcode.com/studyplan/top-interview-150/' }, { label: 'NeetCode Roadmap', url: 'https://neetcode.io/roadmap' }, { label: 'YouTube: NeetCode — DSA Patterns', url: 'https://www.youtube.com/c/NeetCode' }],
  'sql':              [{ label: 'Mode SQL Tutorial', url: 'https://mode.com/sql-tutorial/' }, { label: 'LeetCode — Database Problems', url: 'https://leetcode.com/problemset/database/' }, { label: 'PostgreSQL Official Docs', url: 'https://www.postgresql.org/docs/' }],
  'machine learning': [{ label: 'fast.ai — Practical Deep Learning', url: 'https://www.fast.ai/' }, { label: 'Google ML Crash Course', url: 'https://developers.google.com/machine-learning/crash-course' }, { label: 'YouTube: Andrej Karpathy — Neural Networks', url: 'https://www.youtube.com/@AndrejKarpathy' }],
  'react':            [{ label: 'React Official Docs', url: 'https://react.dev/' }, { label: 'Patterns.dev — React Patterns', url: 'https://www.patterns.dev/' }, { label: 'YouTube: Jack Herrington — React Deep Dives', url: 'https://www.youtube.com/@jherr' }],
  'typescript':       [{ label: 'TypeScript Deep Dive (free book)', url: 'https://basarat.gitbook.io/typescript/' }, { label: 'Total TypeScript — Matt Pocock', url: 'https://www.totaltypescript.com/' }],
  'aws':              [{ label: 'AWS Skill Builder (Free)', url: 'https://skillbuilder.aws/' }, { label: 'YouTube: freeCodeCamp — AWS Certification', url: 'https://www.youtube.com/watch?v=3hLmDS179YE' }],
  'docker':           [{ label: 'Docker Official Get Started', url: 'https://docs.docker.com/get-started/' }, { label: 'YouTube: TechWorld with Nana — Docker', url: 'https://www.youtube.com/watch?v=3c-iBn73dDE' }],
  'kubernetes':       [{ label: 'Kubernetes Official Tutorials', url: 'https://kubernetes.io/docs/tutorials/' }, { label: 'YouTube: TechWorld with Nana — K8s Full Course', url: 'https://www.youtube.com/watch?v=X48VuDVv0do' }],
  'behavioral':       [{ label: 'STAR Method Guide — Indeed', url: 'https://www.indeed.com/career-advice/interviewing/star-interview-questions' }, { label: 'Amazon Leadership Principles', url: 'https://www.amazon.jobs/content/en/our-workplace/leadership-principles' }, { label: 'YouTube: Jeff H Sipe — Behavioral Interviews', url: 'https://www.youtube.com/@jeffhsipe' }],
  'support':          [{ label: 'Zendesk Customer Support Best Practices', url: 'https://www.zendesk.com/blog/customer-support-best-practices/' }, { label: 'Support Driven Community', url: 'https://supportdriven.com/' }, { label: 'YouTube: CSAT.AI — Support Excellence', url: 'https://www.youtube.com/results?search_query=customer+support+best+practices' }],
  'product':          [{ label: 'Lenny\'s Newsletter — PM Frameworks', url: 'https://www.lennysnewsletter.com/' }, { label: 'Reforge — Product Strategy', url: 'https://www.reforge.com/' }, { label: 'YouTube: Exponent — PM Interview Prep', url: 'https://www.youtube.com/c/ExponentTV' }],
  'design':           [{ label: 'Nielsen Norman Group — UX Research', url: 'https://www.nngroup.com/articles/' }, { label: 'Google Material Design', url: 'https://m3.material.io/' }, { label: 'Figma — Design Resources', url: 'https://www.figma.com/resources/' }],
  'default':          [{ label: 'Glassdoor — Company Interview Reviews', url: 'https://www.glassdoor.com/Interview/index.htm' }, { label: 'Blind — Tech Company Discussions', url: 'https://www.teamblind.com/' }, { label: 'Levels.fyi — Compensation Research', url: 'https://www.levels.fyi/' }],
};

function getResources(topic: string): { label: string; url: string }[] {
  const lowerTopic = topic.toLowerCase();
  for (const [key, resources] of Object.entries(STUDY_RESOURCES)) {
    if (lowerTopic.includes(key)) return resources;
  }
  return STUDY_RESOURCES['default'];
}

// ─── Study Plan Generator ─────────────────────────────────────────────────────

export function generateStudyPlan(resume: ResumeData, jd: string, context: JobContext): StudyTopic[] {
  const topics: StudyTopic[] = [];
  const resumeText = [
    ...resume.skills.map(s => s.name),
    ...resume.experience.flatMap(e => [...e.technologies, ...e.description]),
    ...resume.projects.flatMap(p => p.techStack),
  ].join(' ').toLowerCase();

  const jdLower = jd.toLowerCase();
  const rc = context.roleCategory;

  // Role-specific primary study topics
  if (rc === 'software-engineer' || rc === 'backend-engineer' || rc === 'frontend-engineer') {
    const hasDSA = resumeText.includes('leetcode') || resumeText.includes('algorithm') || resumeText.includes('data structure');
    topics.push({ topic: 'Data Structures & Algorithms (DSA)', reason: hasDSA ? 'Keep sharpening DSA — coding rounds are still the main filter at most tech companies.' : 'No DSA practice visible on your resume. Coding rounds are a core filter at most tech companies.', priority: hasDSA ? 'medium' : 'high', resources: STUDY_RESOURCES['dsa'] });
    if (rc !== 'frontend-engineer' && (context.seniority === 'senior' || context.seniority === 'lead')) {
      topics.push({ topic: 'System Design & Distributed Architecture', reason: 'Senior+ roles almost always include a dedicated system design round. This is a high-impact preparation area.', priority: 'high', resources: STUDY_RESOURCES['system design'] });
    }
  }

  if (rc === 'tech-support') {
    topics.push({ topic: 'Technical Troubleshooting Methodology', reason: 'Support interviews heavily test structured troubleshooting thinking. Practice walking through issues step by step.', priority: 'high', resources: STUDY_RESOURCES['support'] });
    topics.push({ topic: 'Product & Domain Knowledge', reason: 'Research the company\'s product deeply. Interviewers expect you to understand common failure modes and user pain points.', priority: 'high', resources: [...STUDY_RESOURCES['support'], ...STUDY_RESOURCES['default']] });
  }

  if (rc === 'product-manager') {
    topics.push({ topic: 'Product Thinking & Prioritization Frameworks', reason: 'PM interviews test product sense. Study RICE, MoSCoW, Jobs-to-be-Done, and OKR alignment frameworks.', priority: 'high', resources: STUDY_RESOURCES['product'] });
    topics.push({ topic: 'Metrics & A/B Testing Fundamentals', reason: 'PMs are expected to define success metrics and interpret experiment results confidently.', priority: 'high', resources: [...STUDY_RESOURCES['product'], ...STUDY_RESOURCES['sql']] });
  }

  if (rc === 'data-analyst') {
    topics.push({ topic: 'Advanced SQL (Window Functions, CTEs)', reason: 'SQL is the #1 tested skill for data analysts. Window functions and CTEs are commonly tested in technical screens.', priority: 'high', resources: STUDY_RESOURCES['sql'] });
    topics.push({ topic: 'A/B Testing & Statistical Significance', reason: 'Analyst roles expect you to design and interpret experiments correctly.', priority: 'medium', resources: STUDY_RESOURCES['sql'] });
  }

  if (rc === 'data-scientist') {
    topics.push({ topic: 'ML Fundamentals & Model Evaluation', reason: 'Bias-variance tradeoff, precision/recall, cross-validation — these are standard interview topics.', priority: 'high', resources: STUDY_RESOURCES['machine learning'] });
  }

  if (rc === 'devops-sre') {
    topics.push({ topic: 'Kubernetes & Container Orchestration', reason: 'K8s is now a core expectation for most DevOps/SRE roles, regardless of cloud provider.', priority: 'high', resources: STUDY_RESOURCES['kubernetes'] });
  }

  if (rc === 'designer') {
    topics.push({ topic: 'Portfolio Presentation & Design Process Communication', reason: 'Design interviews are heavily portfolio-driven. Practice narrating your design process clearly and confidently.', priority: 'high', resources: STUDY_RESOURCES['design'] });
  }

  // Check JD skill gaps against resume
  const resumeSkillsLower = resume.skills.map(s => s.name.toLowerCase());
  context.skills.slice(0, 8).forEach(skill => {
    const inResume = resumeSkillsLower.some(rs => rs.includes(skill) || skill.includes(rs));
    const inResumeText = resumeText.includes(skill);
    if (!inResume && !inResumeText) {
      topics.push({ topic: `${skill.charAt(0).toUpperCase() + skill.slice(1)} — Skill Gap`, reason: `The job description explicitly mentions "${skill}" but it is not visible on your resume. ATS and interviewers will look for this.`, priority: 'high', resources: getResources(skill) });
    }
  });

  // Always include behavioral prep
  topics.push({ topic: 'Behavioral Interview Preparation (STAR Method)', reason: 'Every company has at least one behavioral round. Prepare 6–8 strong stories covering: leadership, conflict, failure, and a key achievement.', priority: 'medium', resources: STUDY_RESOURCES['behavioral'] });

  // Company-specific culture tips
  if (context.companyCulture === 'big-tech') {
    topics.push({ topic: `${context.company} Leadership Principles & Culture Values`, reason: `${context.company} interviewers explicitly assess cultural fit against published values. Map your STAR stories to their specific principles before the interview.`, priority: 'high', resources: [{ label: `${context.company} Careers Page`, url: 'https://www.glassdoor.com/Interview/index.htm' }, { label: 'Amazon Leadership Principles (if applicable)', url: 'https://www.amazon.jobs/content/en/our-workplace/leadership-principles' }, ...STUDY_RESOURCES['behavioral']] });
  }

  return topics.slice(0, 8);
}

// ─── Interview Plan Builder ───────────────────────────────────────────────────

function addIds<T extends object>(items: T[]): (T & { id: string })[] {
  return items.map((item, i) => ({ ...item, id: `q-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}` }));
}

// Map round keys to display labels/emojis/descriptions
const ROUND_META: Record<InterviewRound, { label: string; emoji: string; description: string }> = {
  'hr':                 { label: 'HR & Screening',       emoji: '🤝', description: 'The initial screening call. Tests communication, motivation, and cultural alignment with the company.' },
  'behavioral':         { label: 'Behavioral (STAR)',    emoji: '⭐', description: 'Tests past behaviour using the STAR method. Covers leadership, conflict, failure, and collaboration scenarios.' },
  'technical':          { label: 'Technical Skills',     emoji: '💻', description: 'Tests depth of knowledge in your core tech stack and software engineering fundamentals relevant to this role.' },
  'dsa':                { label: 'Coding / DSA',         emoji: '🧩', description: 'Live coding round testing algorithmic thinking. These are real questions reported on Glassdoor and LeetCode Discuss.' },
  'system-design':      { label: 'System Design',        emoji: '🏗️', description: 'Open-ended architecture round. Tests scalability, reliability, and trade-off reasoning.' },
  'customer-scenarios': { label: 'Customer Scenarios',   emoji: '🎧', description: 'Role-plays and scenario questions testing how you handle real customer situations, escalations, and communication.' },
  'product-sense':      { label: 'Product Sense',        emoji: '🧠', description: 'Tests product thinking: how you prioritize, define success, and approach user problems and metrics.' },
  'sql-analytics':      { label: 'SQL & Analytics',      emoji: '📊', description: 'Tests SQL proficiency, data modeling, and analytical reasoning with business-context questions.' },
  'ml-statistics':      { label: 'ML & Statistics',      emoji: '🤖', description: 'Tests machine learning fundamentals, model evaluation, and statistical reasoning.' },
  'infrastructure':     { label: 'Infrastructure',       emoji: '⚙️', description: 'Tests cloud, CI/CD, Kubernetes, observability, and incident response knowledge.' },
  'qa-testing':         { label: 'QA & Testing',         emoji: '🔬', description: 'Tests testing strategy, automation frameworks, bug reporting, and quality mindset.' },
  'design-portfolio':   { label: 'Design Portfolio',     emoji: '🎨', description: 'Portfolio walkthrough and design process evaluation. Tests UX thinking, research, and visual communication.' },
  'leadership':         { label: 'Leadership',           emoji: '👑', description: 'Tests people management, team strategy, stakeholder alignment, and engineering culture leadership.' },
};

const ROUND_QUESTION_BANKS: Record<InterviewRound, Omit<InterviewQuestion, 'id'>[]> = {
  'hr':                 HR_QUESTIONS,
  'behavioral':         BEHAVIORAL_QUESTIONS,
  'technical':          TECHNICAL_QUESTIONS,
  'dsa':                DSA_QUESTIONS,
  'system-design':      SYSTEM_DESIGN_QUESTIONS,
  'customer-scenarios': CUSTOMER_SCENARIO_QUESTIONS,
  'product-sense':      PRODUCT_SENSE_QUESTIONS,
  'sql-analytics':      SQL_ANALYTICS_QUESTIONS,
  'ml-statistics':      ML_STATISTICS_QUESTIONS,
  'infrastructure':     INFRASTRUCTURE_QUESTIONS,
  'qa-testing':         QA_TESTING_QUESTIONS,
  'design-portfolio':   DESIGN_PORTFOLIO_QUESTIONS,
  'leadership':         LEADERSHIP_QUESTIONS,
};

export function generateInterviewPlan(resume: ResumeData, positionName: string, jd: string): InterviewPlan {
  const context = extractJobContext(positionName, jd);
  const roleInsights = generateRoleInsights(context.roleCategory, context.company, context.companyCulture, context.seniority);

  // Interview process overview
  const processOverview: string[] = [];
  if (context.companyCulture === 'big-tech') {
    processOverview.push('📞 Recruiter / HR Phone Screen (30 min)');
    processOverview.push('💻 Technical Phone Screen (45–60 min)');
    if (['software-engineer', 'backend-engineer', 'frontend-engineer'].includes(context.roleCategory) && context.seniority !== 'junior') {
      processOverview.push('🏗️ System Design Round (60 min)');
    }
    processOverview.push('🔁 Virtual On-Site Loop: 3–5 rounds (varies by role)');
    processOverview.push('🤝 Hiring Manager / Bar Raiser Round');
    processOverview.push('📋 Reference Checks + Offer Stage');
  } else if (context.companyCulture === 'startup') {
    processOverview.push('📞 Founder / Hiring Manager Intro Call (30 min)');
    if (['software-engineer', 'backend-engineer', 'frontend-engineer', 'devops-sre', 'qa-engineer'].includes(context.roleCategory)) {
      processOverview.push('💻 Technical Take-Home or Live Coding (1–3 hours)');
    }
    processOverview.push('🔁 Technical Review + Culture Fit Round (60 min)');
    processOverview.push('🤝 Team Meet (optional but common)');
    processOverview.push('📋 Offer Stage');
  } else if (context.companyCulture === 'consulting') {
    processOverview.push('📞 HR Screen + Online Aptitude Test');
    processOverview.push('🧠 Case Interview Round 1 (Structured Problem Solving)');
    processOverview.push('🧠 Case Interview Round 2 (Partner/Manager Level)');
    processOverview.push('🤝 Fit / Behavioral Interview');
    processOverview.push('📋 Panel Discussion + Offer');
  } else {
    processOverview.push('📞 Initial HR / Recruiter Phone Screen');
    processOverview.push('💻 Role-Specific Technical or Skills Assessment');
    processOverview.push('🤝 Hiring Manager / Team Interview');
    processOverview.push('📋 Reference Check + Offer Stage');
  }

  // Build rounds based on role category
  const targetRounds = ROLE_ROUNDS[context.roleCategory];
  const jdLower = jd.toLowerCase();
  const cultureExtras = COMPANY_SPECIFIC_QUESTIONS[context.companyCulture] || [];

  const rounds: InterviewRoundPlan[] = targetRounds.map(roundKey => {
    let bank = [...(ROUND_QUESTION_BANKS[roundKey] || [])];

    // Inject culture-specific questions into matching rounds
    const extras = cultureExtras.filter(q => q.round === roundKey);
    bank = [...bank, ...extras];

    // For technical rounds on non-SWE roles, filter to relevant tags only
    if (roundKey === 'technical' && !['software-engineer', 'backend-engineer', 'frontend-engineer'].includes(context.roleCategory)) {
      bank = bank.filter(q => q.tags.some(t => jdLower.includes(t) || context.skills.some(s => s.includes(t))));
      if (bank.length < 3) bank = ROUND_QUESTION_BANKS['technical'].slice(0, 5);
    }

    const meta = ROUND_META[roundKey];
    return {
      round: roundKey,
      label: meta.label,
      emoji: meta.emoji,
      description: meta.description,
      questions: addIds(bank),
    };
  });

  const studyPlan = generateStudyPlan(resume, jd, context);

  return { context, processOverview, roleInsights, rounds, studyPlan };
}

// ─── Answer Scorer ────────────────────────────────────────────────────────────

export function scoreAnswer(question: string, answer: string, round: InterviewRound): AnswerScore {
  if (!answer.trim()) {
    return { score: 0, grade: 'Needs Work', color: 'text-rose-500 bg-rose-50 border-rose-200', feedback: 'No answer provided.', strengths: [], improvements: ['Please type your answer before submitting.'] };
  }

  const words = answer.trim().split(/\s+/);
  const wordCount = words.length;
  const answerLower = answer.toLowerCase();
  let score = 0;
  const strengths: string[] = [];
  const improvements: string[] = [];

  // 1. Length check
  if (wordCount >= 80) { score += 15; strengths.push(`Good answer length (${wordCount} words) — detailed enough for interviewers.`); }
  else if (wordCount >= 40) { score += 8; improvements.push(`Answer is a bit short (${wordCount} words). Aim for at least 80 words.`); }
  else { improvements.push(`Answer is too brief (${wordCount} words). Provide significantly more detail.`); }

  // 2. STAR for behavioral/hr
  if (round === 'behavioral' || round === 'hr' || round === 'leadership' || round === 'customer-scenarios') {
    const star = {
      situation: ['situation', 'context', 'at the time', 'was working', 'we were', 'background'],
      task: ['task', 'responsible', 'goal', 'needed to', 'my role', 'challenge'],
      action: ['i did', 'i decided', 'i led', 'i worked', 'i implemented', 'i built', 'i collaborated', 'i spoke', 'i took'],
      result: ['result', 'outcome', 'achieved', 'reduced', 'improved', 'increased', 'delivered', 'saved', '%'],
    };
    const detected = Object.entries(star).filter(([, kws]) => kws.some(k => answerLower.includes(k)));
    if (detected.length >= 3) { score += 20; strengths.push('Strong STAR structure — Situation, Task, Action, and Result are all present.'); }
    else if (detected.length >= 2) { score += 10; improvements.push('Partial STAR structure. Ensure you cover all four parts: Situation → Task → Action → Result.'); }
    else { improvements.push('Use the STAR method: Situation → Task → Action → Result. Structure your answer clearly.'); }
  }

  // 3. Metrics
  const hasMetrics = /\d+%|\$\d+|\d+\s*(?:x|times|days|weeks|months|hours|users|engineers|projects|ms|million)/i.test(answer);
  if (hasMetrics) { score += 15; strengths.push('Quantitative metrics found — numbers make your impact credible and memorable.'); }
  else { improvements.push('Add specific numbers: "reduced load time by 40%", "handled 10,000 tickets/month", etc.'); }

  // 4. Action verbs
  const actionVerbs = ['led', 'built', 'created', 'designed', 'implemented', 'architected', 'optimized', 'delivered', 'managed', 'coordinated', 'mentored', 'spearheaded', 'automated', 'engineered', 'developed', 'collaborated', 'reduced', 'improved', 'increased', 'migrated', 'resolved', 'diagnosed', 'escalated'];
  const foundVerbs = actionVerbs.filter(v => new RegExp(`\\b${v}\\b`, 'i').test(answer));
  if (foundVerbs.length >= 2) { score += 10; strengths.push(`Strong action verbs: ${foundVerbs.slice(0, 3).join(', ')}.`); }
  else { improvements.push('Use strong action verbs (Led, Built, Resolved, Delivered, Optimized) to sound decisive.'); }

  // 5. Role-specific depth
  if (round === 'technical' || round === 'system-design' || round === 'infrastructure') {
    const techTerms = ['complexity', 'algorithm', 'cache', 'database', 'api', 'latency', 'throughput', 'scalab', 'microservice', 'docker', 'kubernetes', 'load balanc', 'hash', 'queue', 'async', 'concurrent', 'fault toleran', 'replica', 'sharding', 'index'];
    const found = techTerms.filter(t => answerLower.includes(t));
    if (found.length >= 3) { score += 20; strengths.push('Good technical depth — multiple engineering concepts clearly referenced.'); }
    else if (found.length >= 1) { score += 10; improvements.push('Add more technical specifics — complexity, trade-offs, or implementation details.'); }
    else { improvements.push('For technical rounds, include engineering terms, trade-offs, and concrete implementation details.'); }
  }

  if (round === 'dsa') {
    const dsaTerms = ['time complexity', 'space complexity', 'o(n', 'o(log', 'hash map', 'bfs', 'dfs', 'dynamic programming', 'two pointer', 'sliding window', 'greedy', 'stack', 'queue', 'heap'];
    const found = dsaTerms.filter(t => answerLower.includes(t));
    if (found.length >= 2) { score += 20; strengths.push('Clear algorithmic approach and complexity analysis — shows structured thinking.'); }
    else { score += 5; improvements.push('Mention your approach (Hash Map, BFS, Two Pointers) and analyse time/space complexity.'); }
  }

  if (round === 'product-sense') {
    const pmTerms = ['metric', 'user', 'customer', 'prioriti', 'trade-off', 'stakeholder', 'data', 'segment', 'revenue', 'retention', 'conversion', 'kpi', 'okr', 'hypothesis'];
    const found = pmTerms.filter(t => answerLower.includes(t));
    if (found.length >= 3) { score += 20; strengths.push('Strong product thinking — metrics, user focus, and prioritization are all present.'); }
    else { score += 5; improvements.push('PM answers should reference metrics, user segments, trade-offs, and success criteria.'); }
  }

  if (round === 'sql-analytics') {
    const sqlTerms = ['join', 'group by', 'where', 'having', 'window', 'partition', 'cte', 'subquery', 'aggregate', 'index', 'schema', 'dim', 'fact', 'p-value', 'significance', 'sample size'];
    const found = sqlTerms.filter(t => answerLower.includes(t));
    if (found.length >= 2) { score += 20; strengths.push('Good SQL and analytics terminology — shows technical data fluency.'); }
    else { improvements.push('Include specific SQL constructs (JOINs, window functions, GROUP BY) or statistical terms.'); }
  }

  if (round === 'customer-scenarios') {
    const supportTerms = ['customer', 'escalat', 'ticket', 'document', 'reproduce', 'empathy', 'apologize', 'follow up', 'priority', 'sla', 'knowledge base'];
    const found = supportTerms.filter(t => answerLower.includes(t));
    if (found.length >= 2) { score += 20; strengths.push('Good customer-first mindset and support process awareness.'); }
    else { improvements.push('Reference customer communication, escalation process, and systematic troubleshooting steps.'); }
  }

  const finalScore = Math.min(score, 100);
  let grade: AnswerScore['grade'] = 'Needs Work';
  let color = 'text-rose-500 bg-rose-50 border-rose-200';
  if (finalScore >= 90) { grade = 'A+'; color = 'text-emerald-600 bg-emerald-50 border-emerald-200'; }
  else if (finalScore >= 78) { grade = 'A'; color = 'text-emerald-500 bg-emerald-50 border-emerald-100'; }
  else if (finalScore >= 65) { grade = 'B'; color = 'text-blue-500 bg-blue-50 border-blue-100'; }
  else if (finalScore >= 50) { grade = 'C'; color = 'text-amber-500 bg-amber-50 border-amber-100'; }
  else if (finalScore >= 35) { grade = 'D'; color = 'text-orange-500 bg-orange-50 border-orange-100'; }

  const feedback = finalScore >= 75 ? 'Strong answer! A few refinements would make this excellent in a real interview.'
    : finalScore >= 50 ? 'Decent foundation — focus on the improvements below to make this interview-ready.'
    : 'This answer needs significant development. Review the improvements and practise again.';

  return { score: finalScore, grade, color, feedback, strengths, improvements };
}
