import { ResumeData, ThemeSettings } from './types';

export const defaultResumeData: ResumeData = {
  personal: {
    name: 'Alex Rivera',
    title: 'Senior Full-Stack Product Engineer',
    subtitle:
      'Building high-performance, beautiful web apps at the intersection of design & engineering',
    bio: 'I am a product-minded software engineer with 6+ years of experience crafting high-fidelity user interfaces and robust backend architectures. I specialize in React, Node.js, TypeScript, and cloud infrastructures, with a strong focus on performance optimization, accessible design (a11y), and user-centered product development.',
    avatar: 'AR', // Initials placeholder or custom design
    email: 'alex.rivera@dev.io',
    phone: '+1 (555) 019-2834',
    location: 'San Francisco, CA (Hybrid)',
    socials: {
      github: 'https://github.com/alexrivera',
      linkedin: 'https://linkedin.com/in/alexrivera-dev',
      twitter: 'https://twitter.com/alex_codes',
      email: 'mailto:alex.rivera@dev.io',
      portfolio: 'https://alexrivera.dev',
    },
  },
  experience: [
    {
      id: 'exp-1',
      company: 'Linear Tech',
      position: 'Senior Frontend Engineer',
      location: 'San Francisco, CA',
      period: '2024 - Present',
      current: true,
      description: [
        'Led the redesign of the core collaboration engine, boosting system responsiveness by 42% and reducing bundle sizes by 130KB.',
        'Architected a reusable React component library using Tailwind CSS and Radix UI, improving product shipping velocity by 30% across 4 engineering squads.',
        'Mentored 5 mid-level and junior engineers, establishing weekly frontend engineering circles and standardizing code-review guidelines.',
      ],
      technologies: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL', 'Vite'],
    },
    {
      id: 'exp-2',
      company: 'Stripe',
      position: 'Software Engineer II (Product)',
      location: 'Remote',
      period: '2021 - 2024',
      current: false,
      description: [
        'Spearheaded the merchant billing dashboard migration to a micro-frontend architecture, eliminating 18s in load time bottlenecks.',
        'Collaborated directly with design and product teams to implement high-fidelity, screen-reader accessible payment widgets used by 100k+ global merchants.',
        'Built automated visual regression testing suites that cut production deploy bugs by 75%.',
      ],
      technologies: ['React', 'Node.js', 'Ruby on Rails', 'PostgreSQL', 'Docker', 'Jest'],
    },
    {
      id: 'exp-3',
      company: 'PixelCraft Studios',
      position: 'Full-Stack Developer',
      location: 'Austin, TX',
      period: '2019 - 2021',
      current: false,
      description: [
        'Developed and shipped 12 client websites and interactive dashboards utilizing React, Express, and AWS.',
        'Implemented real-time chat and live notification systems using Socket.io and Redis, achieving sub-50ms message latency.',
        'Optimized database query paths in PostgreSQL, reducing dashboard response load time from 3.2s to 450ms.',
      ],
      technologies: ['JavaScript', 'React', 'Node.js', 'Express', 'PostgreSQL', 'Redis', 'AWS'],
    },
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'Zenith Task Orchestrator',
      description:
        'A beautiful, offline-first collaborative workspace for hyper-productive engineering teams.',
      longDescription:
        'Zenith is a premium task manager designed for high-velocity engineering teams. It features a custom high-speed offline sync engine (using IndexedDB), fully keyboard-driven navigation (inspired by Vim and linear.app), interactive burndown charts, and instant drag-and-drop Kanban boards. Built to support real-time multiplayer collaboration with absolute minimum latency.',
      techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Zustand', 'IndexedDB', 'Supabase'],
      link: 'https://zenith-orchestrator.demo',
      github: 'https://github.com/alexrivera/zenith-app',
      category: 'Fullstack',
      featured: true,
    },
    {
      id: 'proj-2',
      title: 'Nova UI Kit',
      description:
        'An ultra-accessible, modular React design system crafted with accessibility (WAI-ARIA) at its core.',
      longDescription:
        'Nova UI is a production-ready design system containing 45+ component layouts built using Tailwind CSS and Radix primitives. It provides complete keyboard accessibility, screen-reader compatibility, custom color scheme triggers, and dense layout adaptations out of the box. Optimized for minimal bundle footprint and complete styling customizability.',
      techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Radix UI', 'Storybook'],
      link: 'https://nova-ui.design',
      github: 'https://github.com/alexrivera/nova-ui',
      category: 'Frontend',
      featured: true,
    },
    {
      id: 'proj-3',
      title: 'Holo Analytics Dashboard',
      description:
        'Real-time traffic analytics with interactive Canvas-based maps and user flow diagrams.',
      longDescription:
        'Holo is a lightweight analytics tool that tracks website visits and user flows in real-time without cookies or privacy violations. It features beautiful, custom-rendered interactive heatmaps, pathing flowcharts built on canvas, and quick CSV/JSON export filters. The system easily handles up to 10 million monthly page views on a single minimal server instance.',
      techStack: ['React', 'D3.js', 'Node.js', 'PostgreSQL', 'TimescaleDB', 'Docker'],
      link: 'https://holo-analytics.demo',
      github: 'https://github.com/alexrivera/holo-dashboard',
      category: 'Fullstack',
      featured: false,
    },
    {
      id: 'proj-4',
      title: 'OmniPay - Mobile Finance API',
      description:
        'A unified REST & GraphQL payment routing API supporting multi-currency ledger processing.',
      longDescription:
        'OmniPay simplifies cross-border mobile payments by providing a single routing API. It includes advanced features like automated routing optimization (choosing the lowest fee corridor), ledger reconciliation with double-entry guarantees, and webhook payload signing. The codebase boasts 98% test coverage and processes mock payloads in 20ms.',
      techStack: ['Node.js', 'Fastify', 'TypeScript', 'PostgreSQL', 'Redis', 'Stripe SDK'],
      github: 'https://github.com/alexrivera/omnipay',
      category: 'Backend',
      featured: false,
    },
  ],
  skills: [
    // Frontend
    { name: 'React / Next.js', level: 95, category: 'Frontend' },
    { name: 'TypeScript', level: 92, category: 'Frontend' },
    { name: 'Tailwind CSS / CSS Grid', level: 90, category: 'Frontend' },
    { name: 'State Management (Zustand/Redux)', level: 88, category: 'Frontend' },
    // Backend
    { name: 'Node.js (Express / Fastify)', level: 85, category: 'Backend' },
    { name: 'GraphQL / REST APIs', level: 90, category: 'Backend' },
    { name: 'PostgreSQL / Prisma ORM', level: 82, category: 'Backend' },
    { name: 'Redis (Caching & Pub/Sub)', level: 75, category: 'Backend' },
    // DevOps & Tools
    { name: 'Docker & Containerization', level: 80, category: 'DevOps/Cloud' },
    { name: 'AWS (S3, EC2, CloudFront)', level: 78, category: 'DevOps/Cloud' },
    { name: 'CI/CD (GitHub Actions)', level: 85, category: 'DevOps/Cloud' },
    { name: 'Vercel & Netlify Deployment', level: 95, category: 'DevOps/Cloud' },
    // Design
    { name: 'Figma (UI/UX Design)', level: 85, category: 'Design' },
    { name: 'Design Systems Engineering', level: 92, category: 'Design' },
    { name: 'Web Accessibility (WCAG/a11y)', level: 90, category: 'Design' },
    // Languages & Tools
    { name: 'Git & Version Control', level: 95, category: 'Tools/Other' },
    { name: 'Jest / Cypress Testing', level: 84, category: 'Tools/Other' },
    { name: 'HTML5 & Semantic Web', level: 98, category: 'Tools/Other' },
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science & Cognitive Science',
      location: 'Berkeley, CA',
      period: '2015 - 2019',
      grade: '3.84 GPA',
    },
  ],
  certificates: [
    {
      id: 'cert-1',
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      date: '2023',
    },
    {
      id: 'cert-2',
      name: 'Frontend Performance Mastery',
      issuer: 'Frontend Masters',
      date: '2022',
    },
  ],
  testimonials: [
    {
      id: 'test-1',
      name: 'Sarah Chen',
      role: 'VP of Product',
      company: 'Linear Tech',
      text: "Alex is a rare talent. He doesn't just write highly modular and clean frontend code; he deeply understands user experience and product goals. The collaborative engine redesign he led has been a game changer for our user retention.",
      avatar: 'SC',
    },
    {
      id: 'test-2',
      name: 'Marcus Vance',
      role: 'Engineering Lead',
      company: 'Stripe',
      text: "Alex's focus on system performance and test automation raised the bar for our entire billing team. He has a relentless attention to detail and accessibility guidelines that sets a high benchmark.",
      avatar: 'MV',
    },
  ],
};

export const defaultThemeSettings: ThemeSettings = {
  id: 'classic',
  primaryColor: 'rose',
  fontFamily: 'serif',
  darkMode: false,
  layout: 'standard',
  heroStyle: 'gradient',
};
