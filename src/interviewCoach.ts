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
  GeminiEnhancedData,
  RecruiterPersona,
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

export function extractJobContext(positionName: string, jd: string, explicitCompanyName?: string): JobContext {
  const text = jd.toLowerCase();
  const combined = (positionName + ' ' + jd).toLowerCase();

  // Use explicit company name if provided, otherwise auto-detect
  let company = explicitCompanyName?.trim() || '';

  if (!company) {
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
    company = 'the Company';
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

// ─── Company-Specific Recruiter Phone-Screen Questions ────────────────────────
// Curated from Glassdoor, Blind, LinkedIn, and community-reported interviews.
// Keyed by lowercase company name fragment.

const COMPANY_RECRUITER_QUESTIONS: Record<string, Omit<InterviewQuestion, 'id'>[]> = {
  'google': [
    { round: 'hr', question: 'Why Google? What specifically about Google\'s mission excites you?', hint: 'Reference Google\'s mission ("organize the world\'s information") and connect it to real products you use. Be specific.', difficulty: 'easy', source: 'Glassdoor — Google recruiter phone screen (frequently reported)', tags: ['motivation', 'google'] },
    { round: 'hr', question: 'Walk me through your resume — what\'s the thread connecting your career choices?', hint: 'Frame your moves as intentional growth toward a goal, not opportunistic jumps.', difficulty: 'easy', source: 'Glassdoor — Google recruiter screen', tags: ['intro', 'google'] },
    { round: 'hr', question: 'What does "impact" mean to you, and how have you measured it in your last role?', hint: 'Google values Googleyness and impact. Quantify: users affected, revenue, latency, cost savings.', difficulty: 'medium', source: 'Blind — Google recruiter round reports', tags: ['impact', 'google'] },
    { round: 'hr', question: 'Tell me about a technically complex project you led. How did you make it successful?', hint: 'Show cross-functional ownership, technical depth, and your decision-making process.', difficulty: 'hard', source: 'Glassdoor — Google L4/L5 recruiter screens', tags: ['leadership', 'google'] },
    { round: 'hr', question: 'How do you stay current with technology changes in your field?', hint: 'Mention specific sources: papers, open source contributions, internal tech talks, communities.', difficulty: 'easy', source: 'Glassdoor — Google HR screen', tags: ['growth', 'google'] },
    { round: 'hr', question: 'What are your compensation expectations for this role?', hint: 'Research Levels.fyi for Google L4/L5/L6. Give a range; base + equity together. Don\'t anchor too low.', difficulty: 'medium', source: 'Standard Google recruiter screen', tags: ['compensation', 'google'] },
    { round: 'hr', question: 'Are you interviewing with other companies? Where are you in those processes?', hint: 'Be honest but strategic. If you have competing offers or late-stage interviews, it creates urgency — mention them.', difficulty: 'easy', source: 'Glassdoor — Google phone screen, frequently reported', tags: ['pipeline', 'google'] },
  ],
  'amazon': [
    { round: 'hr', question: 'Tell me about yourself and why Amazon?', hint: 'End with a specific Amazon business (AWS, Alexa, Prime, Advertising, etc.) that connects to this team.', difficulty: 'easy', source: 'Glassdoor — Amazon recruiter phone screen', tags: ['intro', 'amazon'] },
    { round: 'hr', question: 'Which 2–3 of Amazon\'s Leadership Principles resonate with you most, and can you give an example for each?', hint: 'Pick LPs you have strong STAR examples for. Don\'t pick all the "cool" ones — pick ones you can back with evidence.', difficulty: 'hard', source: 'Glassdoor — Amazon recruiter screen, Blind — Amazon interview experiences', tags: ['leadership-principles', 'amazon'] },
    { round: 'hr', question: 'Tell me about a time you had to make a decision with incomplete information or under a tight deadline.', hint: '"Bias for Action" and "Are Right, A Lot". Show structured thinking and clear trade-offs.', difficulty: 'medium', source: 'Glassdoor — Amazon recruiter round, top reported question', tags: ['decision-making', 'amazon'] },
    { round: 'hr', question: 'Describe a time when you had to earn the trust of a skeptical stakeholder or customer.', hint: '"Earn Trust" LP. Show empathy, transparency, and how you changed their view through actions not words.', difficulty: 'hard', source: 'Glassdoor — Amazon L5/L6 recruiter screen', tags: ['trust', 'amazon'] },
    { round: 'hr', question: 'What\'s your current compensation, and what are your expectations for this role at Amazon?', hint: 'Amazon\'s TC is heavily equity-weighted (RSU cliff + vest). Research Levels.fyi for your target level.', difficulty: 'medium', source: 'Standard Amazon recruiter screen', tags: ['compensation', 'amazon'] },
    { round: 'hr', question: 'Can you relocate or are you open to hybrid/onsite requirements for this role?', hint: 'Be clear about your flexibility. Amazon RTO policy is 5 days/week in-office at most locations as of 2025.', difficulty: 'easy', source: 'Glassdoor — Amazon recruiter phone screen', tags: ['logistics', 'amazon'] },
  ],
  'meta': [
    { round: 'hr', question: 'Why Meta? How do you feel about Meta\'s mission of connecting people?', hint: 'Be specific about products (Facebook, Instagram, WhatsApp, Reality Labs). Address any concerns authentically.', difficulty: 'easy', source: 'Glassdoor — Meta recruiter phone screen', tags: ['motivation', 'meta'] },
    { round: 'hr', question: 'Tell me about the largest or most complex system you\'ve built. How did you scale it?', hint: 'Meta values scale. Numbers matter — MAUs, QPS, data volume. Show your architectural decisions.', difficulty: 'hard', source: 'Blind — Meta recruiter and technical screen reports', tags: ['scale', 'meta'] },
    { round: 'hr', question: 'Describe a time you moved fast on a project despite uncertainty. What risks did you take?', hint: 'Meta\'s culture of "Move Fast" — show speed as a deliberate strategy, not carelessness.', difficulty: 'medium', source: 'Glassdoor — Meta recruiter phone screen, Blind', tags: ['speed', 'meta'] },
    { round: 'hr', question: 'How do you handle competing priorities across multiple projects?', hint: 'Meta engineers often run multiple concurrent projects. Show your prioritization framework clearly.', difficulty: 'medium', source: 'Glassdoor — Meta L4/L5 recruiter screen', tags: ['prioritization', 'meta'] },
    { round: 'hr', question: 'What\'s your approach to data-driven decision-making?', hint: 'Meta is deeply metrics-driven. Reference A/B testing, funnel analysis, experimentation — be specific.', difficulty: 'medium', source: 'Glassdoor — Meta recruiter round', tags: ['data', 'meta'] },
    { round: 'hr', question: 'What are your total compensation expectations?', hint: 'Meta is competitive on cash + equity. Research Levels.fyi for E4/E5/E6. Be specific with your range.', difficulty: 'easy', source: 'Standard Meta recruiter screen', tags: ['compensation', 'meta'] },
  ],
  'netflix': [
    { round: 'hr', question: 'Why Netflix, and what specifically about our culture document resonates with you?', hint: 'Read the Netflix Culture document. Pick 2-3 specific values and explain why they fit your work style.', difficulty: 'medium', source: 'Glassdoor — Netflix recruiter phone screen, Blind', tags: ['culture', 'netflix'] },
    { round: 'hr', question: 'Netflix operates with a culture of "freedom and responsibility". Can you give an example of a time you took a big risk and owned the outcome?', hint: 'Netflix wants autonomous leaders who own decisions without excessive process. Show a bold, informed risk.', difficulty: 'hard', source: 'Glassdoor — Netflix recruiter screen, frequently reported', tags: ['ownership', 'netflix'] },
    { round: 'hr', question: 'How do you handle receiving very direct, critical feedback?', hint: 'Netflix has a culture of radical candor. Show you actively seek it and act on it — not just tolerate it.', difficulty: 'medium', source: 'Blind — Netflix culture-fit recruiter screen', tags: ['feedback', 'netflix'] },
    { round: 'hr', question: 'Netflix pays top of market. Walk me through your current compensation and expectations.', hint: 'Netflix is famous for top-of-market cash compensation. Come prepared with Levels.fyi data.', difficulty: 'easy', source: 'Glassdoor — Netflix recruiter screen', tags: ['compensation', 'netflix'] },
    { round: 'hr', question: 'Tell me about a time you influenced a product or engineering direction without formal authority.', hint: 'Netflix values leaders who build influence through context-setting and data. Show persuasion, not mandate.', difficulty: 'hard', source: 'Glassdoor — Netflix L5/L6 phone screen', tags: ['influence', 'netflix'] },
  ],
  'microsoft': [
    { round: 'hr', question: 'Why Microsoft, and why this specific team or product area?', hint: 'Reference Azure, M365, Copilot, or Xbox — whatever applies. Show genuine product curiosity.', difficulty: 'easy', source: 'Glassdoor — Microsoft recruiter phone screen', tags: ['motivation', 'microsoft'] },
    { round: 'hr', question: 'Tell me about yourself and how your experience aligns with what we need in this role.', hint: 'Tailor this to the JD. Highlight Azure, cloud, or AI-related experience if relevant.', difficulty: 'easy', source: 'Glassdoor — Microsoft HR screen', tags: ['intro', 'microsoft'] },
    { round: 'hr', question: 'How does this role align with your long-term career goals?', hint: 'Microsoft values growth mindset (per Satya Nadella). Show this is a deliberate career step.', difficulty: 'easy', source: 'Glassdoor — Microsoft recruiter screen', tags: ['growth', 'microsoft'] },
    { round: 'hr', question: 'Tell me about a time you had to collaborate across very different teams or organizations.', hint: 'Microsoft is huge. Cross-org collaboration is critical. Show initiative and structured communication.', difficulty: 'medium', source: 'Glassdoor — Microsoft L61/L62 recruiter screen', tags: ['collaboration', 'microsoft'] },
    { round: 'hr', question: 'What is your experience with cloud technologies, particularly Azure?', hint: 'Azure is core to Microsoft. If you\'re AWS/GCP-heavy, frame your cloud-agnostic expertise clearly.', difficulty: 'medium', source: 'Glassdoor — Microsoft SDE recruiter screen', tags: ['cloud', 'microsoft'] },
    { round: 'hr', question: 'What are your compensation expectations?', hint: 'Microsoft uses a level-based salary band. Research Levels.fyi for L62/L63/L64. Include expected RSU grant.', difficulty: 'easy', source: 'Standard Microsoft recruiter screen', tags: ['compensation', 'microsoft'] },
  ],
  'apple': [
    { round: 'hr', question: 'Why Apple? How do you feel about working on products used by over a billion people?', hint: 'Apple values passion for their ecosystem. Reference specific products, design philosophy, or recent launches.', difficulty: 'easy', source: 'Glassdoor — Apple recruiter phone screen', tags: ['motivation', 'apple'] },
    { round: 'hr', question: 'Tell me about the most impactful project you\'ve shipped. How did you know it was the right thing to build?', hint: 'Apple is obsessed with product quality and deliberate decision-making. Show your judgment.', difficulty: 'hard', source: 'Glassdoor — Apple recruiter screen, Blind', tags: ['impact', 'apple'] },
    { round: 'hr', question: 'How do you balance speed with the level of polish Apple products are known for?', hint: 'Apple moves slower and ships with more quality. Show you understand that trade-off and embrace it.', difficulty: 'medium', source: 'Blind — Apple recruiter round discussion', tags: ['quality', 'apple'] },
    { round: 'hr', question: 'Apple products are often kept secret. How do you feel about working in a high-confidentiality environment?', hint: 'Be genuine. Apple NDAs are strict. Show you\'re comfortable with confidentiality as a professional norm.', difficulty: 'easy', source: 'Glassdoor — Apple recruiter screen', tags: ['culture', 'apple'] },
    { round: 'hr', question: 'What are your salary expectations?', hint: 'Apple is competitive but RSUs vest over 4 years. Compare total comp on Levels.fyi. Ask about refresh grants.', difficulty: 'easy', source: 'Standard Apple recruiter screen', tags: ['compensation', 'apple'] },
  ],
  'stripe': [
    { round: 'hr', question: 'Why Stripe? What about the payments / fintech space excites you?', hint: 'Reference Stripe\'s mission: increasing the GDP of the internet. Be specific about their product (Radar, Connect, Terminal, etc.).', difficulty: 'easy', source: 'Glassdoor — Stripe recruiter phone screen', tags: ['motivation', 'stripe'] },
    { round: 'hr', question: 'Describe a time you had to understand a highly complex domain quickly to deliver results.', hint: 'Stripe deals with payments, compliance, tax, banking — show you can ramp up in complex domains fast.', difficulty: 'hard', source: 'Glassdoor — Stripe recruiter screen, Blind', tags: ['learning', 'stripe'] },
    { round: 'hr', question: 'How do you think about writing code that is used by millions of developers as an API?', hint: 'Stripe\'s core product is APIs. Show awareness of DX, backward compatibility, and reliability at scale.', difficulty: 'hard', source: 'Blind — Stripe recruiter and technical screen', tags: ['api-design', 'stripe'] },
    { round: 'hr', question: 'Tell me about a time you disagreed strongly with a technical decision. What did you do?', hint: 'Stripe values intellectual honesty and debate. Show you engage constructively with conviction.', difficulty: 'hard', source: 'Glassdoor — Stripe recruiter round', tags: ['conflict', 'stripe'] },
    { round: 'hr', question: 'What are your current TC and expectations for this role?', hint: 'Stripe is competitive, especially equity. Research Levels.fyi and ask about cliff and vesting schedule.', difficulty: 'easy', source: 'Standard Stripe recruiter screen', tags: ['compensation', 'stripe'] },
  ],
  'airbnb': [
    { round: 'hr', question: 'Why Airbnb? Why do you believe in the mission of "belonging anywhere"?', hint: 'Airbnb\'s culture is mission-driven. Show genuine belief in community, travel, or belonging — not just the brand.', difficulty: 'easy', source: 'Glassdoor — Airbnb recruiter phone screen', tags: ['motivation', 'airbnb'] },
    { round: 'hr', question: 'Describe your experience building products for marketplace or two-sided platform businesses.', hint: 'Airbnb is a marketplace. Show you understand host/guest dynamics, trust, incentives, and conversion.', difficulty: 'hard', source: 'Glassdoor — Airbnb recruiter screen', tags: ['marketplace', 'airbnb'] },
    { round: 'hr', question: 'Tell me about a time you used data to change a product or engineering direction.', hint: 'Airbnb is highly data-driven. Reference metrics: booking rate, conversion, host activation, etc.', difficulty: 'medium', source: 'Glassdoor — Airbnb recruiter round', tags: ['data', 'airbnb'] },
    { round: 'hr', question: 'What are your compensation expectations?', hint: 'Airbnb went public in 2020. Research Levels.fyi for current bands and equity refresh rates.', difficulty: 'easy', source: 'Standard Airbnb recruiter screen', tags: ['compensation', 'airbnb'] },
  ],
  'uber': [
    { round: 'hr', question: 'Why Uber? Which part of the business excites you most — Rides, Eats, Freight, or something else?', hint: 'Uber has multiple verticals. Show you\'ve researched the specific team\'s product area and challenges.', difficulty: 'easy', source: 'Glassdoor — Uber recruiter phone screen', tags: ['motivation', 'uber'] },
    { round: 'hr', question: 'Describe a time you worked on a system with massive scale — millions of requests per second.', hint: 'Uber operates at extreme scale. Show comfort with distributed systems, reliability, and load.', difficulty: 'hard', source: 'Blind — Uber recruiter and technical phone screen', tags: ['scale', 'uber'] },
    { round: 'hr', question: 'How do you make decisions when you have competing priorities across engineering, product, and business?', hint: 'Uber moves fast. Show a structured framework for trade-offs and stakeholder alignment.', difficulty: 'medium', source: 'Glassdoor — Uber recruiter screen', tags: ['prioritization', 'uber'] },
    { round: 'hr', question: 'What are your compensation expectations?', hint: 'Research Levels.fyi for Uber L4/L5/L6. Uber is competitive on equity post-IPO.', difficulty: 'easy', source: 'Standard Uber recruiter screen', tags: ['compensation', 'uber'] },
  ],
  'salesforce': [
    { round: 'hr', question: 'Why Salesforce? How do you connect with our "Ohana" culture?', hint: 'Salesforce has a strong culture of equality, giving back, and customer success. Reference Trailhead, Dreamforce, or specific cloud.', difficulty: 'easy', source: 'Glassdoor — Salesforce recruiter phone screen', tags: ['motivation', 'salesforce'] },
    { round: 'hr', question: 'Tell me about your experience with enterprise software and working with large customer accounts.', hint: 'Salesforce is B2B enterprise. Show comfort with long sales cycles, customer success, and multi-stakeholder orgs.', difficulty: 'medium', source: 'Glassdoor — Salesforce recruiter screen', tags: ['enterprise', 'salesforce'] },
    { round: 'hr', question: 'How do you balance feature velocity with technical debt in a large, mature codebase?', hint: 'Salesforce is 25+ years old. Show pragmatic judgment: when to refactor vs. ship, and how to get buy-in.', difficulty: 'hard', source: 'Glassdoor — Salesforce recruiter screen', tags: ['tech-debt', 'salesforce'] },
    { round: 'hr', question: 'What are your salary and total comp expectations?', hint: 'Research Levels.fyi for Salesforce MTS/SMTS/Principal. Equity vests quarterly at Salesforce.', difficulty: 'easy', source: 'Standard Salesforce recruiter screen', tags: ['compensation', 'salesforce'] },
  ],
  'shopify': [
    { round: 'hr', question: 'Why Shopify? What do you think about the future of commerce?', hint: 'Shopify is mission-driven around entrepreneurship. Reference specific products (Shop, Markets, POS, Checkout).', difficulty: 'easy', source: 'Glassdoor — Shopify recruiter phone screen', tags: ['motivation', 'shopify'] },
    { round: 'hr', question: 'Shopify operates at a very high trust, low process environment. How do you do your best work?', hint: 'Shopify has no sprints, very few meetings. Show you can self-manage, prioritize, and communicate async.', difficulty: 'medium', source: 'Glassdoor — Shopify recruiter screen, Blind', tags: ['culture', 'shopify'] },
    { round: 'hr', question: 'Tell me about a time you built something that directly helped small businesses or merchants succeed.', hint: 'Shopify\'s mission is removing barriers to entrepreneurship. Connect your work to merchant/customer outcomes.', difficulty: 'medium', source: 'Glassdoor — Shopify recruiter round', tags: ['impact', 'shopify'] },
  ],
  'linkedin': [
    { round: 'hr', question: 'Why LinkedIn? How does your personal professional story connect to our mission of creating economic opportunity?', hint: 'Reference economic opportunity for the global workforce — not just networking. Show genuine belief in the mission.', difficulty: 'easy', source: 'Glassdoor — LinkedIn recruiter phone screen', tags: ['motivation', 'linkedin'] },
    { round: 'hr', question: 'Tell me about the largest audience you\'ve built or served with a product or feature.', hint: 'LinkedIn has 1B+ users. Show you can think at scale and are excited by that challenge.', difficulty: 'medium', source: 'Glassdoor — LinkedIn recruiter screen', tags: ['scale', 'linkedin'] },
    { round: 'hr', question: 'What are your compensation expectations?', hint: 'LinkedIn is a Microsoft subsidiary. Research Levels.fyi for IC4/IC5. Total comp includes RSUs + cash + bonus.', difficulty: 'easy', source: 'Standard LinkedIn recruiter screen', tags: ['compensation', 'linkedin'] },
  ],
  'twitter': [
    { round: 'hr', question: 'Why X (Twitter)?', hint: 'The company has changed significantly post-acquisition. Be genuine about why you want to join in its current form.', difficulty: 'easy', source: 'Glassdoor — X/Twitter recruiter screen', tags: ['motivation', 'twitter'] },
  ],
  'palantir': [
    { round: 'hr', question: 'Why Palantir? How do you feel about working on mission-critical government and enterprise software?', hint: 'Palantir works with defense, intelligence, and health agencies. Show genuine interest in real-world impact, not just the tech.', difficulty: 'medium', source: 'Glassdoor — Palantir recruiter phone screen', tags: ['motivation', 'palantir'] },
    { round: 'hr', question: 'Tell me about a time you had to work directly with customers or end-users to solve a complex technical problem.', hint: 'Palantir Forward Deployed Engineers are embedded with clients. Show you can bridge technical and non-technical worlds.', difficulty: 'hard', source: 'Glassdoor — Palantir FDE recruiter screen', tags: ['customer-facing', 'palantir'] },
    { round: 'hr', question: 'How do you handle working with incomplete, messy, or ambiguous data from the real world?', hint: 'Palantir\'s core challenge is making sense of real-world data. Show pragmatic problem-solving, not theory.', difficulty: 'hard', source: 'Blind — Palantir recruiter screen', tags: ['data', 'palantir'] },
  ],
};

// ─── Recruiter Round Question Generator ───────────────────────────────────────

export interface RecruiterQuestion { id: string; question: string; hint: string; source: string; difficulty: 'easy' | 'medium' | 'hard'; }

function addRecruiterIds(questions: Omit<InterviewQuestion, 'id'>[]): RecruiterQuestion[] {
  return questions.map((q, i) => ({ ...q, id: `rq-${Date.now()}-${i}`, question: q.question, hint: q.hint || '', source: q.source || 'Curated', difficulty: q.difficulty as 'easy' | 'medium' | 'hard' }));
}

/**
 * Returns company-specific recruiter phone-screen questions.
 * Priority: 1) Hardcoded curated bank → 2) AI-generated (if API key) → 3) Generic HR fallback.
 */
export async function generateRecruiterRoundQuestions(
  company: string,
  role: string,
  apiKey: string,
  provider: AiProvider,
  count = 6
): Promise<RecruiterQuestion[]> {
  const companyLower = company.toLowerCase();

  // 1. Check hardcoded curated bank
  const bankKey = Object.keys(COMPANY_RECRUITER_QUESTIONS).find(k => companyLower.includes(k));
  if (bankKey) {
    const pool = COMPANY_RECRUITER_QUESTIONS[bankKey];
    // Return up to `count` questions; always include intro + motivation first
    const intro = pool.filter(q => q.tags?.includes('intro') || q.tags?.includes('motivation'));
    const rest = pool.filter(q => !q.tags?.includes('intro') && !q.tags?.includes('motivation'));
    const selected = [...intro, ...rest].slice(0, count);
    return addRecruiterIds(selected);
  }

  // 2. Try AI generation if API key available
  if (apiKey.trim()) {
    try {
      const systemPrompt = `You are a senior recruiter and hiring expert. Return ONLY valid JSON — no markdown, no explanation.`;
      const userPrompt = `Generate exactly ${count} recruiter phone-screen questions that a recruiter at "${company}" would realistically ask a candidate applying for a "${role}" position.

Bases these on:
- Actual Glassdoor and Blind interview reports for ${company}
- Common recruiter phone-screen patterns at ${company} (culture fit, motivation, compensation, logistics, background)
- The specific culture and values of ${company}

Return a JSON array of ${count} objects. Each object must have:
- "question": the exact question text
- "hint": a 1-sentence tip for the candidate on how to answer this
- "source": where this type of question is typically reported (e.g. "Glassdoor — ${company} recruiter screen")
- "difficulty": one of "easy", "medium", or "hard"

Start with an intro question ("tell me about yourself") then motivation ("why ${company}?"), and end with compensation.
Return only the JSON array.`;

      const raw = await callAiChat(apiKey, provider, systemPrompt, userPrompt);
      const jsonMatch = raw.match(/\[([\s\S]*)\]/);
      if (jsonMatch) {
        const parsed: Array<{ question: string; hint: string; source: string; difficulty: string }> = JSON.parse(`[${jsonMatch[1]}]`);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, count).map((q, i) => ({
            id: `rq-ai-${Date.now()}-${i}`,
            question: q.question || '',
            hint: q.hint || '',
            source: q.source || `AI-generated for ${company}`,
            difficulty: (['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium') as 'easy' | 'medium' | 'hard',
          }));
        }
      }
    } catch (err) {
      console.warn('generateRecruiterRoundQuestions AI fallback triggered:', err);
    }
  }

  // 3. Generic HR fallback
  return addRecruiterIds(HR_QUESTIONS.slice(0, count));
}

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

export function generateStudyPlan(resume: ResumeData, _jd: string, context: JobContext): StudyTopic[] {
  const topics: StudyTopic[] = [];
  const resumeText = [
    ...resume.skills.map(s => s.name),
    ...resume.experience.flatMap(e => [...e.technologies, ...e.description]),
    ...resume.projects.flatMap(p => p.techStack),
  ].join(' ').toLowerCase();

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
  'reported':           { label: 'Real Company Questions', emoji: '🏢', description: 'Real interview questions reported by candidates who interviewed at this company.' },
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
  'reported':           [],
};

export function generateInterviewPlan(resume: ResumeData, positionName: string, jd: string, explicitCompanyName?: string): InterviewPlan {
  const context = extractJobContext(positionName, jd, explicitCompanyName);
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

// Detects questions that should NOT use the STAR method (intro/motivation/culture-fit)
const NON_STAR_PATTERNS = [
  /tell me about yourself/i,
  /introduce yourself/i,
  /walk me through your (background|resume|experience|career)/i,
  /who are you/i,
  /why (do you want to|are you interested in) (join|work at|work for|this (role|company|position))/i,
  /why (this company|this role|us|our company|amazon|google|netflix|stripe|apple|microsoft|meta|facebook)/i,
  /what (attracts|drew|brings) you (to|here)/i,
  /why are you (looking|applying|leaving|moving)/i,
  /where do you see yourself in (5|five|3|three|10|ten) years/i,
  /what are your (salary|compensation|pay) expectations/i,
  /what is your (notice period|availability|start date)/i,
  /are you (open to|comfortable with|willing to) (reloc|remote|hybrid|travel|onsite)/i,
  /what (motivates|excites|drives) you/i,
  /what are you (looking for|seeking) in/i,
  /what do you know about (us|our company|this company)/i,
  /how did you hear about/i,
  /tell me (more )?about your (background|experience|career)/i,
];

export function isNonStarQuestion(question: string): boolean {
  return NON_STAR_PATTERNS.some(p => p.test(question));
}

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

  // 2. STAR for behavioral questions — but NOT for intro/motivation/culture-fit questions
  const requiresStar = (round === 'behavioral' || round === 'hr' || round === 'leadership' || round === 'customer-scenarios')
    && !isNonStarQuestion(question);

  const isIntroMotivationQuestion = (round === 'hr') && isNonStarQuestion(question);

  if (requiresStar) {
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
  } else if (isIntroMotivationQuestion) {
    // For intro/motivation questions: reward narrative clarity, enthusiasm, and specificity
    const hasPersonalBrand = /i am|i have|my background|my experience|i specialize|i focus|my career/i.test(answer);
    const hasMotivation = /because|excited|passionate|align|mission|values|opportunity|growth|impact|love|admire|inspires/i.test(answer);
    const hasSpecifics = /specifically|in particular|for example|such as|including|notably|at .+ i/i.test(answer);
    let narrativeScore = 0;
    if (hasPersonalBrand) { narrativeScore++; strengths.push('Clear personal narrative — you have articulated who you are and what you bring.'); }
    else { improvements.push('Start with a clear positioning statement: who you are, your background, and your key strengths.'); }
    if (hasMotivation) { narrativeScore++; strengths.push('Good motivation expressed — you have explained why this opportunity excites you.'); }
    else { improvements.push('Explain WHY this company/role specifically — show genuine interest, not just a generic statement.'); }
    if (hasSpecifics) { narrativeScore++; strengths.push('Good use of specific examples to back up your claims.'); }
    else { improvements.push('Add specific examples or achievements that support your narrative (e.g. a project, a result, a skill).'); }
    score += narrativeScore >= 3 ? 20 : narrativeScore >= 2 ? 12 : narrativeScore >= 1 ? 6 : 0;
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

// ─── AI-Powered Interview Insights (Gemini / Groq) ──────────────────────────

export type AiProvider = 'gemini' | 'groq';

export async function testApiConnection(apiKey: string, provider: AiProvider): Promise<{ ok: boolean; message: string }> {
  if (!apiKey.trim()) return { ok: false, message: 'No API key provided.' };

  try {
    if (provider === 'groq') {
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: 'Hi' }], max_tokens: 5 }),
      });
      if (r.ok) return { ok: true, message: '✅ Groq connected! Llama 3.3 70B ready.' };
      
      let errorMsg = '';
      try {
        const data = await r.json();
        errorMsg = data?.error?.message || '';
      } catch {}

      if (r.status === 401 || errorMsg.toLowerCase().includes('api key') || errorMsg.toLowerCase().includes('invalid')) {
        return { ok: false, message: '🔑 Invalid API key. Check at console.groq.com/keys' };
      }
      if (r.status === 429) return { ok: false, message: '⏳ Rate limited. Wait a moment and try again.' };
      return { ok: false, message: `❌ Error ${r.status}${errorMsg ? `: ${errorMsg}` : ''}` };
    } else {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: 'Hi' }] }], generationConfig: { maxOutputTokens: 5 } }) }
      );
      if (r.ok) return { ok: true, message: '✅ Gemini connected! Ready to search.' };
      
      let errorMsg = '';
      try {
        const data = await r.json();
        errorMsg = data?.error?.message || '';
      } catch {}

      if (r.status === 401 || r.status === 403 || errorMsg.toLowerCase().includes('api key not valid') || errorMsg.toLowerCase().includes('invalid')) {
        return { ok: false, message: '🔑 Invalid API key. Check at aistudio.google.com/apikey' };
      }
      if (errorMsg.toLowerCase().includes('location') || errorMsg.toLowerCase().includes('region') || errorMsg.toLowerCase().includes('unsupported')) {
        return { ok: false, message: '🌍 Unsupported region. Gemini API keys are restricted in some regions (like EU/UK). Try a USA VPN or switch to Groq (free, no region locks).' };
      }
      if (r.status === 429) return { ok: false, message: '⏳ Rate limited. Wait 60s or switch to Groq.' };
      return { ok: false, message: `❌ Error ${r.status}: ${errorMsg || 'Connection failed'}` };
    }
  } catch (err: any) {
    const isGemini = provider === 'gemini';
    const extraInfo = isGemini 
      ? ' Check your VPN, or disable ad-blockers/shields (like Brave Shields) which often block Google AI Studio requests.'
      : '';
    return { ok: false, message: `❌ Network error: ${err?.message || 'Failed to fetch.'}${extraInfo}` };
  }
}

function buildInsightsPrompt(company: string, role: string, seniority: string): string {
  return `You are a career research assistant with expert knowledge about tech companies and their hiring processes.

**Role:** ${role}
**Company:** ${company}
**Level:** ${seniority}

Based on your knowledge of ${company}'s interview process, Glassdoor reviews, LinkedIn job postings, Blind discussions, and Indeed reviews, provide a comprehensive JSON response with:

1. "roleInsights" — an object with:
   - "glance" (string): A one-line factual summary of what this role does at ${company}
   - "whatYouDo" (array of 5-6 strings): Specific day-to-day responsibilities for this role at ${company}, based on real job postings and employee reviews
   - "typicalDay" (string): A paragraph describing what a typical workday looks like for someone in this role at ${company}
   - "keySkills" (array of 5 strings): The most important skills for this specific role at ${company}
   - "topChallenges" (array of 4 strings): Common challenges people face in this role at ${company}

2. "interviewProcess" (array of strings): The actual step-by-step interview process at ${company} for this role (e.g., "Phone screen with recruiter (30 min)", "Technical coding round (60 min)", etc.)

3. "reportedQuestions" (array of objects): 8-10 real interview questions that candidates have reported being asked for this role at ${company}. Each object should have:
   - "question" (string): The actual question
   - "round" (string): Which round it was asked in (e.g., "Technical", "Behavioral", "HR", "System Design", "Coding")
   - "source" (string): Where this was reported (e.g., "Glassdoor", "Blind", "LeetCode Discuss")

4. "searchSources" (array of strings): Source names where this information can be found

IMPORTANT: Return ONLY valid JSON. No markdown code fences, no explanation text outside the JSON. Start your response with { and end with }.`;
}

function parseInsightsResponse(textContent: string, groundingMeta?: Record<string, unknown>): GeminiEnhancedData | null {
  if (!textContent) return null;

  let jsonStr = textContent.trim();
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) jsonStr = fenceMatch[1].trim();
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  const parsed = JSON.parse(jsonMatch[0]);

  const searchSources: string[] = parsed.searchSources || [];
  if (groundingMeta && Array.isArray((groundingMeta as Record<string, unknown>).groundingChunks)) {
    for (const chunk of (groundingMeta as Record<string, unknown[]>).groundingChunks) {
      const c = chunk as Record<string, Record<string, string>>;
      if (c?.web?.uri) searchSources.push(c.web.uri);
    }
  }

  return {
    roleInsights: {
      glance: parsed.roleInsights?.glance || '',
      whatYouDo: parsed.roleInsights?.whatYouDo || [],
      typicalDay: parsed.roleInsights?.typicalDay || '',
      keySkills: parsed.roleInsights?.keySkills || [],
      topChallenges: parsed.roleInsights?.topChallenges || [],
    },
    interviewProcess: parsed.interviewProcess || [],
    reportedQuestions: (parsed.reportedQuestions || []).map((q: { question?: string; round?: string; source?: string }) => ({
      question: q.question || '',
      round: q.round || 'General',
      source: q.source || 'Unknown',
    })),
    searchSources: [...new Set(searchSources)].slice(0, 10),
  };
}

async function fetchWithGemini(apiKey: string, prompt: string): Promise<GeminiEnhancedData | null> {
  async function callGemini(useGrounding: boolean): Promise<Response> {
    const body: Record<string, unknown> = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
    };
    if (useGrounding) body.tools = [{ google_search: {} }];

    return fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    );
  }

  const groundingSupported = localStorage.getItem('gemini_grounding_supported') !== 'false';
  let response: Response;

  if (groundingSupported) {
    response = await callGemini(true);
    if (!response.ok) {
      let errorMsg = '';
      try {
        const errJson = await response.clone().json();
        errorMsg = errJson?.error?.message || '';
      } catch {}

      // If it is an API key error, don't fallback, throw immediately
      if (errorMsg.toLowerCase().includes('api key not valid') || errorMsg.toLowerCase().includes('invalid') || response.status === 401 || response.status === 403) {
        throw new Error(`🔑 Invalid Gemini API key: ${errorMsg || 'Please check your key at aistudio.google.com/apikey'}`);
      }

      // If it is a region restriction, don't fallback, throw immediately
      if (errorMsg.toLowerCase().includes('location') || errorMsg.toLowerCase().includes('region') || errorMsg.toLowerCase().includes('unsupported')) {
        throw new Error(`🌍 Unsupported region: Gemini API keys are restricted in some regions (like EU/UK). Try a USA VPN or switch to Groq.`);
      }

      // Otherwise, assume it might be a grounding/tools error and try without grounding
      if (response.status === 400) {
        localStorage.setItem('gemini_grounding_supported', 'false');
        response = await callGemini(false);
      }
    }
  } else {
    response = await callGemini(false);
  }

  if (response.status === 429) {
    for (let retry = 0; retry < 2; retry++) {
      await new Promise(resolve => setTimeout(resolve, (retry + 1) * 3000));
      response = await callGemini(false);
      if (response.status !== 429) break;
    }
  }

  if (!response.ok) {
    let errorMsg = '';
    try {
      const errJson = await response.json();
      errorMsg = errJson?.error?.message || '';
    } catch {}

    if (response.status === 429) {
      throw new Error('⏳ Gemini rate limit exceeded. Wait 60s or switch to Groq (free, no rate issues).');
    }
    if (response.status === 401 || response.status === 403 || errorMsg.toLowerCase().includes('api key not valid') || errorMsg.toLowerCase().includes('invalid')) {
      throw new Error(`🔑 Invalid Gemini API key: ${errorMsg || 'Please check your key at aistudio.google.com/apikey'}`);
    }
    if (errorMsg.toLowerCase().includes('location') || errorMsg.toLowerCase().includes('region') || errorMsg.toLowerCase().includes('unsupported')) {
      throw new Error(`🌍 Unsupported region: Gemini API keys are restricted in some regions (like EU/UK). Try a USA VPN or switch to Groq.`);
    }
    throw new Error(`Gemini API error ${response.status}: ${errorMsg || 'Unknown error'}`);
  }

  const data = await response.json();
  const textParts = data.candidates?.[0]?.content?.parts
    ?.filter((p: { text?: string }) => p.text)
    ?.map((p: { text: string }) => p.text)
    ?.join('') || '';
  return parseInsightsResponse(textParts, data.candidates?.[0]?.groundingMetadata);
}

async function fetchWithGroq(apiKey: string, prompt: string): Promise<GeminiEnhancedData | null> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a career research assistant. Always respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    let errorMsg = '';
    try {
      const errJson = await response.json();
      errorMsg = errJson?.error?.message || '';
    } catch {}

    if (response.status === 429) throw new Error('⏳ Groq rate limit — wait a moment and try again.');
    if (response.status === 401 || errorMsg.toLowerCase().includes('api key') || errorMsg.toLowerCase().includes('invalid')) {
      throw new Error('🔑 Invalid Groq API key. Get one free at console.groq.com/keys');
    }
    throw new Error(`Groq API error ${response.status}${errorMsg ? `: ${errorMsg}` : ''}`);
  }

  const data = await response.json();
  const textContent = data.choices?.[0]?.message?.content || '';
  return parseInsightsResponse(textContent);
}

export async function fetchGeminiInsights(
  apiKey: string,
  company: string,
  role: string,
  seniority: string,
  provider: AiProvider = 'gemini',
): Promise<GeminiEnhancedData | null> {
  const prompt = buildInsightsPrompt(company, role, seniority);

  try {
    if (provider === 'groq') {
      return await fetchWithGroq(apiKey, prompt);
    } else {
      return await fetchWithGemini(apiKey, prompt);
    }
  } catch (err) {
    console.error(`${provider} fetch error:`, err);
    throw err;
  }
}

// Helper to handle chat requests to Groq/Gemini consistently
async function callAiChat(
  apiKey: string,
  provider: AiProvider,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  if (provider === 'groq') {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.5,
        max_tokens: 2048,
      }),
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API error ${response.status}: ${errText}`);
    }
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } else {
    // Gemini 2.0 Flash
    const body = {
      contents: [{ parts: [{ text: `${systemPrompt}\n\nUser Request:\n${userPrompt}` }] }],
      generationConfig: { temperature: 0.5, maxOutputTokens: 2048 },
    };
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    );
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errText}`);
    }
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
}

export async function generateIdealAnswer(
  apiKey: string,
  provider: AiProvider,
  question: string,
  roleTitle: string,
  resumeData?: ResumeData,
  formatAsStar?: boolean,
  previousAnswers?: Array<{ question: string; answer: string }>
): Promise<string> {
  // Detect if this is an intro/motivation question (should NOT use STAR)
  const nonStarQuestion = NON_STAR_PATTERNS.some(p => p.test(question));
  const useStar = formatAsStar && !nonStarQuestion;

  const systemPrompt = `You are an elite interview coach. Generate a high-impact, professional, and realistic mock interview answer for the given question.

IMPORTANT RULES:
1. Tailor the answer naturally to the candidate's actual profile — use their specific companies, technologies, and achievements from the resume.
2. Keep the answer to 150-200 words. Return the answer directly with no meta-commentary or preamble.
3. AVOID REPETITION: If previous answers in this session have already mentioned specific facts (like years of experience, a specific company name, or a key achievement), do NOT repeat them verbatim. Reference them briefly or from a different angle, or omit them and highlight something new from the candidate's background.
4. Match the question format:
   - "Tell me about yourself" / "Why do you want to join" / motivation questions → Use a confident narrative pitch. Do NOT use STAR format.
   - Behavioral questions ("Tell me about a time...") → Use STAR format.
   - Technical/conceptual questions → Give a structured explanation with examples.

${useStar ? "CRITICAL: Structure the response using explicit [Situation], [Task], [Action], and [Result] tag headers (e.g. '[Situation]\\n... \\n\\n[Task]\\n...') so the editor can parse it into separate guided fields." : ''}`;

  const resumeContext = resumeData
    ? `Candidate Profile:
Title: ${resumeData.personal?.title}
Bio: ${resumeData.personal?.bio}
Skills: ${resumeData.skills?.map(s => s.name).join(', ')}
Top Experience: ${resumeData.experience?.slice(0, 2).map(e => `${e.position} at ${e.company} (${e.description.slice(0, 2).join('; ')})`).join('\n')}`
    : '';

  const previousContext = previousAnswers && previousAnswers.length > 0
    ? `\n\nPREVIOUS ANSWERS IN THIS SESSION (do NOT repeat these facts verbatim — vary the angle or highlight different details):\n${previousAnswers.slice(-3).map((pa, i) => `Q${i + 1}: "${pa.question}"\nA${i + 1}: "${pa.answer.slice(0, 200)}${pa.answer.length > 200 ? '...' : ''}"`).join('\n\n')}`
    : '';

  const userPrompt = `Question: "${question}"
Target Role: "${roleTitle}"
${resumeContext}${previousContext}`;

  const response = await callAiChat(apiKey, provider, systemPrompt, userPrompt);
  return response.trim().replace(/^```(markdown|text)?|```$/g, '').trim();
}

export interface StarSections {
  situation: string;
  task: string;
  action: string;
  result: string;
}

/**
 * AI-powered: given a freeform narrative answer, intelligently split it into
 * Situation / Task / Action / Result sections.
 */
export async function splitIntoStarSections(
  apiKey: string,
  provider: AiProvider,
  answerText: string,
  question: string
): Promise<StarSections> {
  const systemPrompt = `You are an expert interview coach. The candidate has written a narrative answer to a behavioral interview question. Your job is to intelligently split their existing answer text into the four STAR sections without adding new content — only redistribute what they have already written.

Rules:
- DO NOT invent new sentences or information. Only use text that exists in the answer.
- Each section should be a clean excerpt from the original text.
- If a section cannot be found in the text, use an empty string "".
- Situation: the background/context (who, what, when, where).
- Task: the goal, challenge, or responsibility they faced.
- Action: the specific steps THEY personally took (usually the longest section).
- Result: the outcome, impact, or lesson learned (preferably with metrics if present).

CRITICAL: Respond with valid JSON only. No markdown, no explanation, no code fences. Start with { and end with }.
{
  "situation": "...",
  "task": "...",
  "action": "...",
  "result": "..."
}`;

  const userPrompt = `Interview Question: "${question}"

Candidate's Answer to distribute into STAR sections:
"${answerText}"`;

  const response = await callAiChat(apiKey, provider, systemPrompt, userPrompt);
  let jsonStr = response.trim();
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) jsonStr = fenceMatch[1].trim();
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse STAR split response from AI.');
  const parsed = JSON.parse(jsonMatch[0]);
  return {
    situation: (parsed.situation || '').trim(),
    task: (parsed.task || '').trim(),
    action: (parsed.action || '').trim(),
    result: (parsed.result || '').trim(),
  };
}


export interface OptimizedAnswerResult {
  optimizedAnswer: string;
  feedback: string;
}

export async function optimizeUserAnswer(
  apiKey: string,
  provider: AiProvider,
  question: string,
  roleTitle: string,
  userAnswer: string,
  resumeData?: ResumeData
): Promise<OptimizedAnswerResult> {
  const systemPrompt = `You are an elite interview coach. Analyze the candidate's draft answer for the interview question and provide:
1. An improved, polished rewrite of their answer ("optimizedAnswer"). Keep their core experiences and details, but make it sound more professional, upgrade the phrasing, structure it clearly (using the STAR method if it is behavioral), inject powerful action verbs, and add realistic impact metrics.
2. A brief, constructive feedback paragraph ("feedback") explaining what was improved (e.g. upgraded action verbs, added metrics, improved structure).

IMPORTANT: You MUST respond with valid JSON only. Start with { and end with }. Do not include markdown code fences or any other text.
The JSON must contain exactly these keys:
{
  "optimizedAnswer": "polished rewrite of candidate's answer",
  "feedback": "constructive coaching note"
}`;

  const resumeContext = resumeData
    ? `Candidate Profile:
Title: ${resumeData.personal?.title}
Skills: ${resumeData.skills?.map(s => s.name).join(', ')}`
    : '';

  const userPrompt = `Question: "${question}"
Target Role: "${roleTitle}"
Candidate's Draft Answer: "${userAnswer}"
${resumeContext}`;

  const textResponse = await callAiChat(apiKey, provider, systemPrompt, userPrompt);
  
  let jsonStr = textResponse.trim();
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) jsonStr = fenceMatch[1].trim();
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response as JSON.');
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    optimizedAnswer: parsed.optimizedAnswer || '',
    feedback: parsed.feedback || 'Answer polished for professional phrasing.'
  };
}

export const RECRUITER_PERSONAS: RecruiterPersona[] = [
  {
    id: 'sophia-google',
    name: 'Sophia Vance',
    title: 'Senior Technical Recruiter',
    company: 'Google',
    avatar: '👩‍💼',
    voiceGender: 'female',
    description: 'Analytical, encouraging, and focused on core computer science concepts, scalability, and structural clarity. Sophia values candidates who discuss complex trade-offs and structural solutions.',
    stylePrompt: 'You are Sophia Vance, a Senior Technical Recruiter at Google. Keep your tone encouraging, professional, and slightly analytical. Reference engineering concepts like scale, code cleanliness, or efficiency if relevant. Keep it short (1-2 sentences).'
  },
  {
    id: 'marcus-netflix',
    name: 'Marcus Chen',
    title: 'Lead Talent Partner',
    company: 'Netflix',
    avatar: '👨‍💼',
    voiceGender: 'male',
    description: 'Direct, business-focused, and obsessed with impact. Marcus wants to hear about autonomy, high performance, real customer metrics, and how your engineering work drives commercial success.',
    stylePrompt: 'You are Marcus Chen, a Lead Talent Partner at Netflix. Keep your tone direct, warm, and highly focused on business impact and customer experience. Reference ownership, autonomy, or performance metrics. Keep it short (1-2 sentences).'
  },
  {
    id: 'emily-stripe',
    name: 'Emily Watson',
    title: 'Product & Engineering Talent Acquisition',
    company: 'Stripe',
    avatar: '👩‍💻',
    voiceGender: 'female',
    description: 'Detail-oriented, structured, and deeply interested in user empathy and API design. Emily loves hearing about edge cases, developer experience, and how you solve real customer problems end-to-end.',
    stylePrompt: 'You are Emily Watson from Stripe Talent Acquisition. Keep your tone curious, polished, and detail-oriented. Reference user experience, details, quality, or developer workflow. Keep it short (1-2 sentences).'
  },
  {
    id: 'david-amazon',
    name: 'David Miller',
    title: 'Talent Acquisition Manager',
    company: 'Amazon',
    avatar: '🧔',
    voiceGender: 'male',
    description: 'Leadership Principle enthusiast. David evaluates answers strictly on ownership, customer obsession, bias for action, and expects a clear situation-action-result structure.',
    stylePrompt: 'You are David Miller, a Talent Acquisition Manager at Amazon. Keep your tone professional, structured, and metric-focused. Reference leadership principles like Customer Obsession, Ownership, or Bias for Action if appropriate. Keep it short (1-2 sentences).'
  },
  {
    id: 'sarah-general',
    name: 'Sarah Jenkins',
    title: 'Talent Acquisition Specialist',
    company: 'the Company',
    avatar: '👩',
    voiceGender: 'female',
    description: 'Friendly, welcoming, and highly communicative. Sarah focuses on cultural fit, work style, collaboration, and your motivation for joining the team.',
    stylePrompt: 'You are Sarah Jenkins, a Talent Acquisition Specialist. Keep your tone friendly, welcoming, and focused on teamwork and motivation. Keep it short (1-2 sentences).'
  }
];

export function getRecruiterPersona(companyName: string, culture: string): RecruiterPersona {
  const comp = (companyName || '').toLowerCase();
  const cult = (culture || '').toLowerCase();
  
  if (comp.includes('google')) return RECRUITER_PERSONAS[0];
  if (comp.includes('netflix')) return RECRUITER_PERSONAS[1];
  if (comp.includes('stripe')) return RECRUITER_PERSONAS[2];
  if (comp.includes('amazon')) return RECRUITER_PERSONAS[3];
  
  if (cult === 'big-tech') {
    return RECRUITER_PERSONAS[0];
  } else if (cult === 'startup') {
    return RECRUITER_PERSONAS[2]; // Emily from Stripe
  }
  
  const general = { ...RECRUITER_PERSONAS[4] };
  if (companyName && companyName !== 'the Company') {
    general.company = companyName;
    general.stylePrompt = `You are Sarah Jenkins, a Talent Acquisition Specialist at ${companyName}. Keep your tone friendly, welcoming, and focused on teamwork and motivation. Keep it short (1-2 sentences).`;
  }
  return general;
}

export async function generateRecruiterResponse(
  apiKey: string,
  provider: AiProvider,
  persona: RecruiterPersona,
  role: string,
  question: string,
  answer: string
): Promise<string> {
  if (!apiKey.trim()) {
    const fallbackResponses = [
      "Thanks for sharing that. It's really interesting how you approached it.",
      "Thank you for that detailed answer. That makes a lot of sense.",
      "Excellent points. I appreciate you walking me through your experience.",
      "Got it, thank you. That gives me a very good understanding of your background.",
      "Great. I like how you structured that. Let's move forward to our next question."
    ];
    const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
    return fallbackResponses[randomIndex];
  }

  const systemPrompt = `You are playing the role of ${persona.name}, a ${persona.title} at ${persona.company}.
${persona.stylePrompt}

The candidate is interviewing for the role: "${role}".
They just answered the question: "${question}"
Their answer was: "${answer}"

Provide a brief, natural recruiter transition response.
Guidelines:
1. Keep it extremely short (1-2 sentences maximum, under 30 words).
2. Do NOT grade their answer, do NOT say "Score: X" or "Grade: A", and do NOT give feedback like "you should improve X".
3. Acknowledge what they said in a conversational, professional, and friendly recruiter tone, and transition.
4. Answer directly, do NOT include any meta-commentary, markdown, or introduction. Just write the direct response.`;

  const userPrompt = `Acknowledge candidate's response to: "${question}"`;

  try {
    const response = await callAiChat(apiKey, provider, systemPrompt, userPrompt);
    return response.trim().replace(/^"(.*)"$/, '$1').replace(/^```(markdown|text)?|```$/g, '').trim();
  } catch (err) {
    console.error("Error generating recruiter response:", err);
    return "Thank you for that detailed answer. That makes a lot of sense.";
  }
}

export async function generateSessionFeedbackSummary(
  apiKey: string,
  provider: AiProvider,
  persona: RecruiterPersona,
  role: string,
  qaPairs: Array<{ question: string; answer: string; score: number }>
): Promise<string> {
  const avgScore = qaPairs.reduce((acc, curr) => acc + curr.score, 0) / (qaPairs.length || 1);
  let recommendation = "Hold";
  if (avgScore >= 85) recommendation = "Strong Hire";
  else if (avgScore >= 70) recommendation = "Hire";
  else if (avgScore >= 55) recommendation = "Leaning Hire";
  else recommendation = "No Hire";

  if (!apiKey.trim()) {
    return `Candidate evaluated for the position of ${role}. Selected Recruiter: ${persona.name}. 
Overall Score: ${Math.round(avgScore)}/100. 
Recommendation: ${recommendation}. 

${
  recommendation === "Strong Hire" ? `${persona.name} is highly impressed. The candidate articulated experiences clearly with outstanding structure and metrics.`
  : recommendation === "Hire" ? `${persona.name} recommends advancing. Communication was solid, though adding more metrics would strengthen key achievements.`
  : recommendation === "Leaning Hire" ? `${persona.name} suggests caution. The candidate has good skills, but answers lacked consistent structure or detail.`
  : `${persona.name} noted that candidate answers were too brief and lacked the structured depth required for this role. Encourage revision using the STAR method.`
}`;
  }

  const systemPrompt = `You are playing the role of ${persona.name}, a ${persona.title} at ${persona.company}.
Provide an Executive Assessment Summary of the candidate's interview performance for the role of "${role}".

The candidate answered the following questions:
${qaPairs.map((pair, idx) => `Q${idx + 1}: "${pair.question}"\nCandidate Answer: "${pair.answer}"\nEvaluated Score: ${pair.score}/100\n`).join('\n')}

Guidelines:
1. Write in the first person (e.g., "I evaluated the candidate...", "I was impressed by...").
2. Write a concise, professional assessment paragraph (around 80-100 words).
3. Do not list the questions, write a unified narrative.
4. Give a clear hiring verdict matching the recommendation of "${recommendation}" based on the average score of ${Math.round(avgScore)}/100.
5. Provide 1 key strength and 1 key area for improvement.
6. Return only the direct summary text. No markdown or meta-intro.`;

  const userPrompt = `Generate the interview summary paragraph.`;

  try {
    const response = await callAiChat(apiKey, provider, systemPrompt, userPrompt);
    return response.trim().replace(/^```(markdown|text)?|```$/g, '').trim();
  } catch (err) {
    console.error("Error generating feedback summary:", err);
    return `Candidate completed the round with an average score of ${Math.round(avgScore)}/100, resulting in a recommendation of: ${recommendation}. Please review the detailed question-by-question breakdown below.`;
  }
}



