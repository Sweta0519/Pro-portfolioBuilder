import { ResumeData } from './types';

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'personal' | 'experience' | 'skills' | 'projects';
  completed: boolean;
  scoreImpact: number;
}

export interface CoachScoreAnalysis {
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'Needs Work';
  color: string;
  recommendations: Recommendation[];
}

// Helper to search for metrics/numbers in bullet points
function hasMetrics(bullet: string): boolean {
  // Check for percentages, $ figures, numbers followed by units, or raw digits >= 2
  return /%|\$\d+|\d+(?:\s*|-)(?:x|KB|MB|GB|ms|s|h|hours|days|weeks|months|years|x|percent|times|million|k|thousand|projects|people|engineers|developers|users|clients|merchant)/i.test(bullet) || /\b\d{2,}\b/.test(bullet);
}

// Helper to check for strong action verbs
function hasActionVerbs(bullet: string): boolean {
  const actionVerbs = [
    'led', 'managed', 'optimized', 'developed', 'architected', 'designed', 'built',
    'spearheaded', 'created', 'migrated', 'mentored', 'collaborated', 'improved',
    'established', 'formulated', 'restructured', 'streamlined', 'engineered',
    'automated', 'delivered', 'reduced', 'increased', 'boosted', 'standardized',
    'pioneered', 'implemented', 'coordinated', 'pushed', 'monitored', 'crafted'
  ];
  const lowerBullet = bullet.toLowerCase();
  return actionVerbs.some(verb => new RegExp(`\\b${verb}\\b`, 'i').test(lowerBullet));
}

export function analyzeResume(data: ResumeData): CoachScoreAnalysis {
  const recommendations: Recommendation[] = [];
  let score = 0;

  // 1. Personal Info Scoring (Max 25 points)
  let personalScore = 0;
  
  if (data.personal.name && data.personal.name !== "Professional Candidate") {
    personalScore += 5;
  } else {
    recommendations.push({
      id: 'name',
      title: 'Provide your professional full name',
      description: 'Make sure your profile display name reflects your full professional name.',
      category: 'personal',
      completed: false,
      scoreImpact: 5
    });
  }

  if (data.personal.title && data.personal.title !== "Software Professional / Domain Expert") {
    personalScore += 5;
  } else {
    recommendations.push({
      id: 'title',
      title: 'Add a specific professional title',
      description: 'Avoid generic titles. Use targeted names like "Senior Product Engineer" or "UX/UI Designer" to stand out.',
      category: 'personal',
      completed: false,
      scoreImpact: 5
    });
  }

  if (data.personal.bio && data.personal.bio.length > 50) {
    personalScore += 5;
    if (data.personal.bio.length > 120) {
      personalScore += 5;
    } else {
      recommendations.push({
        id: 'bio-length',
        title: 'Expand your professional summary',
        description: 'Elaborate on your core expertise, industry experience, and what problems you love solving (aim for 120+ characters).',
        category: 'personal',
        completed: false,
        scoreImpact: 5
      });
    }
  } else {
    recommendations.push({
      id: 'bio-missing',
      title: 'Write a compelling bio / professional summary',
      description: 'Your bio is the first thing recruiters read. Highlight your key achievements and developer identity.',
      category: 'personal',
      completed: false,
      scoreImpact: 10
    });
  }

  // Social links
  const socialCount = Object.values(data.personal.socials).filter(Boolean).length;
  if (socialCount >= 3) {
    personalScore += 5;
  } else {
    recommendations.push({
      id: 'social-links',
      title: 'Link your GitHub, LinkedIn & professional channels',
      description: 'Connecting professional profiles increases interview rates by 40%. Provide at least 3 active profiles.',
      category: 'personal',
      completed: false,
      scoreImpact: 5
    });
  }

  score += personalScore;

  // 2. Work Experience Scoring (Max 30 points)
  let expScore = 0;
  
  if (data.experience && data.experience.length > 0) {
    expScore += 10;
    if (data.experience.length >= 2) {
      expScore += 5;
    } else {
      recommendations.push({
        id: 'exp-count',
        title: 'Include multiple career highlights',
        description: 'Add at least 2 distinct roles to show professional growth and consistency.',
        category: 'experience',
        completed: false,
        scoreImpact: 5
      });
    }

    // Check descriptions for action verbs & metrics
    let totalBullets = 0;
    let actionVerbBullets = 0;
    let metricBullets = 0;

    data.experience.forEach(exp => {
      exp.description.forEach(bullet => {
        totalBullets++;
        if (hasActionVerbs(bullet)) actionVerbBullets++;
        if (hasMetrics(bullet)) metricBullets++;
      });
    });

    if (totalBullets > 0) {
      // Action verbs percentage
      const verbRatio = actionVerbBullets / totalBullets;
      if (verbRatio >= 0.7) {
        expScore += 7;
      } else {
        recommendations.push({
          id: 'exp-verbs',
          title: 'Start bullets with strong action verbs',
          description: `Only ${Math.round(verbRatio * 100)}% of your bullet points begin with impactful action verbs (e.g., "Led", "Optimized", "Architected"). Rewrite passive phrasing.`,
          category: 'experience',
          completed: false,
          scoreImpact: 7
        });
      }

      // Metrics percentage
      const metricRatio = metricBullets / totalBullets;
      if (metricRatio >= 0.5) {
        expScore += 8;
      } else {
        recommendations.push({
          id: 'exp-metrics',
          title: 'Add quantitative impact metrics',
          description: `Only ${Math.round(metricRatio * 100)}% of your bullets contain numbers, speeds, or percentages. Recruiters look for hard data (e.g. "improved page speed by 40%", "saved 10 hours/week").`,
          category: 'experience',
          completed: false,
          scoreImpact: 8
        });
      }
    } else {
      recommendations.push({
        id: 'exp-bullets',
        title: 'Add descriptive bullet points for roles',
        description: 'List key achievements and projects for each professional role, rather than just listing company names.',
        category: 'experience',
        completed: false,
        scoreImpact: 15
      });
    }
  } else {
    recommendations.push({
      id: 'exp-missing',
      title: 'Add work experience details',
      description: 'Add your history of full-time, contract, or freelance positions to prove experience.',
      category: 'experience',
      completed: false,
      scoreImpact: 30
    });
  }

  score += expScore;

  // 3. Skills & Certifications (Max 25 points)
  let skillsScore = 0;

  if (data.skills && data.skills.length >= 8) {
    skillsScore += 10;
    if (data.skills.length >= 15) {
      skillsScore += 5;
    } else {
      recommendations.push({
        id: 'skills-count',
        title: 'Expand your technical skillset',
        description: 'Add a broader set of skills (15+) to cover frontend, backend, tools, and methodologies.',
        category: 'skills',
        completed: false,
        scoreImpact: 5
      });
    }

    // Check categories
    const categories = new Set(data.skills.map(s => s.category));
    if (categories.size >= 4) {
      skillsScore += 5;
    } else {
      recommendations.push({
        id: 'skills-categories',
        title: 'Categorize your skills',
        description: 'Organize your skills into different domains (Frontend, Backend, Cloud/DevOps, Design) to show cross-functional abilities.',
        category: 'skills',
        completed: false,
        scoreImpact: 5
      });
    }
  } else {
    recommendations.push({
      id: 'skills-missing',
      title: 'Add your core technical skills',
      description: 'List the programming languages, libraries, frameworks, and tools you are proficient in.',
      category: 'skills',
      completed: false,
      scoreImpact: 15
    });
  }

  // Certificates
  if (data.certificates && data.certificates.length > 0) {
    skillsScore += 5;
  } else {
    recommendations.push({
      id: 'certs-missing',
      title: 'Add certifications or credentials',
      description: 'Add professional certifications, bootcamps, or online courses to establish credibility.',
      category: 'skills',
      completed: false,
      scoreImpact: 5
    });
  }

  score += skillsScore;

  // 4. Projects Showcase (Max 20 points)
  let projScore = 0;

  if (data.projects && data.projects.length > 0) {
    projScore += 10;
    if (data.projects.length >= 3) {
      projScore += 5;
    } else {
      recommendations.push({
        id: 'projects-count',
        title: 'Add more featured projects',
        description: 'Aim for at least 3 featured projects in your portfolio to demonstrate diverse engineering challenges.',
        category: 'projects',
        completed: false,
        scoreImpact: 5
      });
    }

    // Check tags and links
    const hasLinks = data.projects.some(p => p.link || p.github);
    if (hasLinks) {
      projScore += 5;
    } else {
      recommendations.push({
        id: 'projects-links',
        title: 'Provide links/repositories for projects',
        description: 'Add live demo URL or source code links (GitHub) to your projects so visitors can inspect your work.',
        category: 'projects',
        completed: false,
        scoreImpact: 5
      });
    }
  } else {
    recommendations.push({
      id: 'projects-missing',
      title: 'Create a projects showcase',
      description: 'Your code speaks louder than a dry list of words. Add real, interactive projects to prove your capabilities.',
      category: 'projects',
      completed: false,
      scoreImpact: 20
    });
  }

  score += projScore;

  // Adjust completed items score
  recommendations.forEach(rec => {
    // Filter out recommendations already met
    if (rec.id === 'name' && data.personal.name && data.personal.name !== "Professional Candidate") rec.completed = true;
    if (rec.id === 'title' && data.personal.title && data.personal.title !== "Software Professional / Domain Expert") rec.completed = true;
    if (rec.id === 'bio-missing' && data.personal.bio && data.personal.bio.length > 50) rec.completed = true;
    if (rec.id === 'bio-length' && data.personal.bio && data.personal.bio.length > 120) rec.completed = true;
    if (rec.id === 'social-links' && Object.values(data.personal.socials).filter(Boolean).length >= 3) rec.completed = true;
    if (rec.id === 'exp-missing' && data.experience && data.experience.length > 0) rec.completed = true;
    if (rec.id === 'exp-count' && data.experience && data.experience.length >= 2) rec.completed = true;
    
    if (rec.id === 'exp-verbs' && data.experience && data.experience.length > 0) {
      let total = 0, verbs = 0;
      data.experience.forEach(e => e.description.forEach(b => { total++; if (hasActionVerbs(b)) verbs++; }));
      if (total > 0 && (verbs / total) >= 0.7) rec.completed = true;
    }
    if (rec.id === 'exp-metrics' && data.experience && data.experience.length > 0) {
      let total = 0, metrics = 0;
      data.experience.forEach(e => e.description.forEach(b => { total++; if (hasMetrics(b)) metrics++; }));
      if (total > 0 && (metrics / total) >= 0.5) rec.completed = true;
    }
    if (rec.id === 'skills-missing' && data.skills && data.skills.length >= 8) rec.completed = true;
    if (rec.id === 'skills-count' && data.skills && data.skills.length >= 15) rec.completed = true;
    if (rec.id === 'skills-categories' && data.skills && new Set(data.skills.map(s => s.category)).size >= 4) rec.completed = true;
    if (rec.id === 'certs-missing' && data.certificates && data.certificates.length > 0) rec.completed = true;
    if (rec.id === 'projects-missing' && data.projects && data.projects.length > 0) rec.completed = true;
    if (rec.id === 'projects-count' && data.projects && data.projects.length >= 3) rec.completed = true;
    if (rec.id === 'projects-links' && data.projects && data.projects.some(p => p.link || p.github)) rec.completed = true;
  });

  // Filter recommendations to only incomplete ones
  const activeRecommendations = recommendations.filter(r => !r.completed);

  // Calculate grade
  let grade: CoachScoreAnalysis['grade'] = 'Needs Work';
  let color = 'text-rose-500 bg-rose-50 border-rose-200';

  if (score >= 95) {
    grade = 'A+';
    color = 'text-emerald-600 bg-emerald-50 border-emerald-200';
  } else if (score >= 85) {
    grade = 'A';
    color = 'text-emerald-500 bg-emerald-50 border-emerald-100';
  } else if (score >= 75) {
    grade = 'B';
    color = 'text-blue-500 bg-blue-50 border-blue-100';
  } else if (score >= 60) {
    grade = 'C';
    color = 'text-amber-500 bg-amber-50 border-amber-100';
  } else if (score >= 40) {
    grade = 'D';
    color = 'text-orange-500 bg-orange-50 border-orange-100';
  }

  return {
    score: Math.min(score, 100),
    grade,
    color,
    recommendations: activeRecommendations
  };
}

export const actionVerbDictionary = [
  {
    original: "I worked on the React website speed stuff",
    polished: [
      "Spearheaded React performance optimizations, achieving a 40% reduction in initial page load times.",
      "Architected loading mechanisms and bundle size optimizations, saving 200ms in critical rendering paths.",
      "Diagnosed and resolved high-load visual bottlenecks, raising Google Lighthouse scores from 60 to 98."
    ]
  },
  {
    original: "I managed a team of junior developers",
    polished: [
      "Mentored and led a team of 5 software developers, introducing sprint-planning structures that improved velocity by 25%.",
      "Coordinated daily standups and cross-functional workshops, accelerating project delivery targets by 3 weeks.",
      "Fostered an engineering culture of high test-coverage and peer reviews, reducing production rollbacks by 60%."
    ]
  },
  {
    original: "I made the REST APIs for the system",
    polished: [
      "Engineered high-concurrency REST and GraphQL APIs in Node.js, cleanly handling up to 25,000 daily web requests.",
      "Designed and optimized database query indexing paths, boosting API response performance by 3.5x.",
      "Standardized API authentication protocols and payload schemas, strengthening system compliance and documentation."
    ]
  },
  {
    original: "I built a custom UI design library",
    polished: [
      "Created an ultra-accessible custom design system using Radix UI and Tailwind, standardizing 40+ key web components.",
      "Collaborated directly with product design to deploy a multi-theme library, reducing frontend engineering debt by 35%.",
      "Audited and retrofitted UI components for complete WCAG 2.1 AA compliance, expanding total addressable market reach."
    ]
  }
];
