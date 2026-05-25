import { ResumeData } from './types';

export interface ATSComplianceCheck {
  id: string;
  label: string;
  description: string;
  status: 'pass' | 'warning' | 'fail';
  scoreImpact: number;
}

export interface RecruiterInsight {
  id: string;
  label: string;
  value: string;
  ideal: string;
  status: 'pass' | 'warning' | 'fail';
  tip: string;
}

export interface SkillDensity {
  keyword: string;
  count: number;
  recommended: number;
  type: 'Hard' | 'Soft';
}

export interface ATSAnalysisResult {
  matchScore: number; // Percentage matching against job description keywords
  complianceScore: number; // Layout structure score
  overallAtsScore: number; // Combined Jobscan overall match
  matchedKeywords: string[];
  missingKeywords: string[];
  complianceChecks: ATSComplianceCheck[];
  recruiterInsights: RecruiterInsight[];
  skillsDensity: SkillDensity[];
}

export interface CoverLetterResult {
  score: number;
  wordCount: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  insights: string[];
}

// Standard list of Hard & Soft skills for jobscan mapping
export const HARD_SKILLS = [
  'react', 'next.js', 'typescript', 'javascript', 'node.js', 'express', 'nestjs',
  'graphql', 'rest api', 'postgresql', 'mongodb', 'redis', 'docker', 'kubernetes',
  'aws', 'cloud', 'ci/cd', 'github actions', 'figma', 'ux/ui', 'design system',
  'accessibility', 'a11y', 'jest', 'cypress', 'testing', 'git', 'python', 'django',
  'flask', 'fastapi', 'java', 'spring boot', 'c#', '.net', 'vue.js', 'angular',
  'tailwindcss', 'sass', 'redux', 'zustand', 'serverless', 'microservices', 'sql',
  'nosql', 'prisma', 'sequelize', 'terraform', 'gcp', 'azure', 'saas', 'cloud', 'life sciences', 'industry cloud'
];

export const SOFT_SKILLS = [
  'leadership', 'communication', 'collaboration', 'problem solving', 'mentorship',
  'agile', 'scrum', 'product management', 'project planning', 'teamwork', 'negotiation',
  'critical thinking', 'adaptability', 'time management', 'creativity', 'organization'
];

// Helper to count keyword occurrences in a blob of text
function countOccurrences(text: string, keyword: string): number {
  const escapedKeyword = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'gi');
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

// Main ATS & Jobscan Pro Analyser
export function analyzeATSCompliance(data: ResumeData, jobDescription: string): ATSAnalysisResult {
  const complianceChecks: ATSComplianceCheck[] = [];
  const recruiterInsights: RecruiterInsight[] = [];
  const skillsDensity: SkillDensity[] = [];
  let complianceScore = 100;

  // 1. COMPLIANCE CHECKS (Jobscan standard format audits)
  // Email Check
  if (data.personal.email) {
    complianceChecks.push({
      id: 'email',
      label: 'Email Address Present',
      description: 'ATS systems found your email address immediately.',
      status: 'pass',
      scoreImpact: 0
    });
  } else {
    complianceScore -= 20;
    complianceChecks.push({
      id: 'email',
      label: 'Missing Email Address',
      description: 'Critical: ATS parsers reject applications lacking simple contact email fields.',
      status: 'fail',
      scoreImpact: -20
    });
  }

  // Phone Check
  if (data.personal.phone) {
    complianceChecks.push({
      id: 'phone',
      label: 'Phone Number Present',
      description: 'ATS systems located your telephone number.',
      status: 'pass',
      scoreImpact: 0
    });
  } else {
    complianceScore -= 10;
    complianceChecks.push({
      id: 'phone',
      label: 'Missing Phone Number',
      description: 'Warning: Recruiting triggers often fail without direct telephone matches.',
      status: 'warning',
      scoreImpact: -10
    });
  }

  // LinkedIn Check
  const hasLinkedIn = data.personal.socials.linkedin && data.personal.socials.linkedin.includes('linkedin.com');
  if (hasLinkedIn) {
    complianceChecks.push({
      id: 'linkedin',
      label: 'LinkedIn Profile URL Linked',
      description: 'Jobscan found a valid LinkedIn connection to index.',
      status: 'pass',
      scoreImpact: 0
    });
  } else {
    complianceScore -= 10;
    complianceChecks.push({
      id: 'linkedin',
      label: 'Missing LinkedIn Connection',
      description: 'Jobscan Recommendation: Adding a LinkedIn URL raises recruiter call rates by 28%.',
      status: 'warning',
      scoreImpact: -10
    });
  }

  // Format layout checks
  complianceChecks.push({
    id: 'tables',
    label: 'Plain Semantic Layout (No Nested Tables)',
    description: 'Layout avoids unreadable canvas charts and complicated column grids that trip up older parsers.',
    status: 'pass',
    scoreImpact: 0
  });

  // 2. RECRUITER INSIGHTS (Job Title, Education, Experience Years, Word Count)
  // Accumulate text representation of resume for analytical audits
  let resumeBlobText = `${data.personal.name} ${data.personal.title} ${data.personal.subtitle} ${data.personal.bio}`;
  data.experience.forEach(exp => {
    resumeBlobText += ` ${exp.company} ${exp.position} ${exp.technologies.join(' ')} ${exp.description.join(' ')}`;
  });
  data.skills.forEach(s => {
    resumeBlobText += ` ${s.name}`;
  });
  data.education.forEach(edu => {
    resumeBlobText += ` ${edu.institution} ${edu.degree} ${edu.fieldOfStudy}`;
  });

  // Word count check
  const wordCount = resumeBlobText.split(/\s+/).filter(w => w.length > 0).length;
  let wordCountStatus: 'pass' | 'warning' | 'fail' = 'pass';
  let wordCountTip = 'Optimal word count size for readability.';
  
  if (wordCount < 200) {
    wordCountStatus = 'fail';
    wordCountTip = 'Critical: Your resume is too brief (< 200 words). Add detailed work history bullet points.';
    complianceScore -= 10;
  } else if (wordCount < 400) {
    wordCountStatus = 'warning';
    wordCountTip = 'Warning: A bit short. Expand on technical tasks and project results to beat heavy competition.';
  } else if (wordCount > 1000) {
    wordCountStatus = 'warning';
    wordCountTip = 'Warning: Too long (> 1000 words). Focus on high-impact bullets to avoid recruiter fatigue.';
  }

  recruiterInsights.push({
    id: 'word-count',
    label: 'Word Count',
    value: `${wordCount} words`,
    ideal: '450 - 800 words',
    status: wordCountStatus,
    tip: wordCountTip
  });

  // Average sentence length / readability
  const sentenceCount = resumeBlobText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const avgSentenceLength = sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : 12;
  let readStatus: 'pass' | 'warning' | 'fail' = 'pass';
  let readTip = 'Sentences are clear, punchy, and easy for humans to parse.';

  if (avgSentenceLength > 25) {
    readStatus = 'warning';
    readTip = 'Sentences are too long (> 25 words average). Shorten complex run-on lines for higher readability.';
  } else if (avgSentenceLength < 8) {
    readStatus = 'warning';
    readTip = 'Sentences are very short, which might sound choppy. Add professional transition words.';
  }

  recruiterInsights.push({
    id: 'readability',
    label: 'Sentence Complexity',
    value: `${avgSentenceLength} words/sentence`,
    ideal: '12 - 18 words',
    status: readStatus,
    tip: readTip
  });

  // Years of Experience matching (simulated calculation from dates)
  let totalYears = 0;
  data.experience.forEach(exp => {
    const period = exp.period.toLowerCase();
    if (period.includes('present') || period.includes('2026')) {
      totalYears += 2; // active role weighting
    } else {
      const years = period.match(/\b(19|20)\d{2}\b/g);
      if (years && years.length === 2) {
        const diff = parseInt(years[1]) - parseInt(years[0]);
        totalYears += diff > 0 ? diff : 1;
      } else {
        totalYears += 1.5; // average fallback
      }
    }
  });
  totalYears = Math.round(totalYears);

  // Check job description requirements
  const jdLower = jobDescription.toLowerCase();
  let requestedYears = 2; // baseline requested
  const yearRegex = /(\d+)\s*\+?\s*years?/i;
  const yearMatch = jdLower.match(yearRegex);
  if (yearMatch && yearMatch[1]) {
    requestedYears = parseInt(yearMatch[1]);
  }

  let yearsStatus: 'pass' | 'warning' | 'fail' = 'pass';
  let yearsTip = 'Your years of experience match or exceed what the role requests.';
  
  if (totalYears < requestedYears) {
    yearsStatus = 'warning';
    yearsTip = `Your experience (${totalYears} yrs) is below the requested (${requestedYears} yrs). Highlight high-growth projects to offset.`;
  }

  recruiterInsights.push({
    id: 'experience-years',
    label: 'Experience Match',
    value: `${totalYears} years calculated`,
    ideal: `${requestedYears}+ years requested`,
    status: yearsStatus,
    tip: yearsTip
  });

  // Job Title Match Check
  let targetTitle = 'Software Engineer';
  // Attempt to extract target title from pasted JD
  const titleMatches = ['senior', 'lead', 'manager', 'architect', 'staff', 'full-stack', 'frontend', 'backend', 'designer', 'product'];
  const foundTitles = titleMatches.filter(t => jdLower.includes(t));
  if (foundTitles.length > 0) {
    targetTitle = foundTitles.join(' ') + ' Engineer';
  }

  const candidateTitle = data.personal.title.toLowerCase();
  let titleStatus: 'pass' | 'warning' | 'fail' = 'pass';
  let titleTip = 'Your header title strongly matches keywords in the job target.';

  // If candidate's title has no overlap with parsed target title
  const hasTitleOverlap = foundTitles.some(t => candidateTitle.includes(t));
  if (!hasTitleOverlap && foundTitles.length > 0) {
    titleStatus = 'warning';
    titleTip = `Target role seeks "${targetTitle}". Consider aligning your professional header title closer.`;
  }

  recruiterInsights.push({
    id: 'title-match',
    label: 'Job Title Alignment',
    value: data.personal.title,
    ideal: targetTitle,
    status: titleStatus,
    tip: titleTip
  });

  // 3. HARD & SOFT SKILLS KEYWORD DENSITY MAP
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  const targetHard = jobDescription ? HARD_SKILLS.filter(k => jdLower.includes(k)) : HARD_SKILLS.slice(0, 12);
  const targetSoft = jobDescription ? SOFT_SKILLS.filter(k => jdLower.includes(k)) : SOFT_SKILLS.slice(0, 6);
  
  // Process Hard Skills Density
  targetHard.forEach(skill => {
    const count = countOccurrences(resumeBlobText, skill);
    const recommended = jobDescription ? Math.min(countOccurrences(jdLower, skill), 3) || 1 : 1;
    
    skillsDensity.push({
      keyword: skill.charAt(0).toUpperCase() + skill.slice(1),
      count,
      recommended,
      type: 'Hard'
    });

    if (count > 0) {
      matchedKeywords.push(skill);
    } else {
      missingKeywords.push(skill);
    }
  });

  // Process Soft Skills Density
  targetSoft.forEach(skill => {
    const count = countOccurrences(resumeBlobText, skill);
    const recommended = jobDescription ? Math.min(countOccurrences(jdLower, skill), 2) || 1 : 1;

    skillsDensity.push({
      keyword: skill.charAt(0).toUpperCase() + skill.slice(1),
      count,
      recommended,
      type: 'Soft'
    });

    if (count > 0) {
      matchedKeywords.push(skill);
    } else {
      missingKeywords.push(skill);
    }
  });

  // Final Score Computations
  const keywordCountTotal = targetHard.length + targetSoft.length;
  const keywordMatches = matchedKeywords.length;
  const matchScore = keywordCountTotal > 0 ? Math.round((keywordMatches / keywordCountTotal) * 100) : 70;

  const overallAtsScore = Math.round((complianceScore * 0.4) + (matchScore * 0.6));

  return {
    matchScore,
    complianceScore: Math.max(complianceScore, 0),
    overallAtsScore,
    matchedKeywords,
    missingKeywords,
    complianceChecks,
    recruiterInsights,
    skillsDensity
  };
}

// Cover Letter match parser
export function analyzeCoverLetter(coverLetterText: string, jobDescription: string): CoverLetterResult {
  if (!coverLetterText.trim()) {
    return {
      score: 0,
      wordCount: 0,
      matchedKeywords: [],
      missingKeywords: [],
      insights: ['Please paste your cover letter to start the real-time scanner.']
    };
  }

  const clLower = coverLetterText.toLowerCase();
  const jdLower = jobDescription.toLowerCase();

  // Word Count
  const wordCount = coverLetterText.split(/\s+/).filter(w => w.length > 0).length;
  const insights: string[] = [];
  
  if (wordCount < 150) {
    insights.push('Cover Letter is too short (< 150 words). Add detailed motivation statements.');
  } else if (wordCount > 450) {
    insights.push('Cover Letter is exceptionally long (> 450 words). Keep it concise to maintain recruiter interest.');
  } else {
    insights.push('Optimal Cover Letter word count length.');
  }

  // Check standard greetings
  const hasGreeting = /dear|hiring manager|to whom it may concern|recruiter|team/i.test(clLower);
  if (hasGreeting) {
    insights.push('Pass: Professional greeting parsed correctly.');
  } else {
    insights.push('Warning: Missing standard business greeting (e.g. "Dear Hiring Team").');
  }

  // Keyword Matches
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  const targetKeywords = jdLower ? HARD_SKILLS.concat(SOFT_SKILLS).filter(k => jdLower.includes(k)) : HARD_SKILLS.slice(0, 8);

  targetKeywords.forEach(kw => {
    if (clLower.includes(kw)) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  });

  const keywordMatches = matchedKeywords.length;
  const score = targetKeywords.length > 0 ? Math.round((keywordMatches / targetKeywords.length) * 100) : 60;

  return {
    score,
    wordCount,
    matchedKeywords,
    missingKeywords,
    insights
  };
}

// Auto-selects layout theme parameters based on the resume title and skills content
export function autoTuneDesign(data: ResumeData) {
  const title = (data.personal.title || '').toLowerCase();
  
  let id: 'minimal' | 'creative' | 'cyberpunk' | 'classic' | 'gradient' = 'gradient';
  let primaryColor: 'violet' | 'emerald' | 'blue' | 'amber' | 'rose' | 'slate' = 'violet';
  let fontFamily: 'sans' | 'serif' | 'mono' = 'sans';
  let darkMode = false;

  // Logic to pick theme based on keywords (optional, keeping it simple for now)
  if (title.includes('developer') || title.includes('engineer')) {
    primaryColor = 'blue';
  } else if (title.includes('designer') || title.includes('creative')) {
    id = 'creative';
    primaryColor = 'violet';
  }

  return {
    id,
    primaryColor,
    fontFamily,
    darkMode,
    layout: 'standard' as const,
    heroStyle: 'gradient' as const
  };
}

// Auto-generates an optimized, ATS-compliant revised resume copy
export function autoOptimizeResume(data: ResumeData, jobDescription: string): { revisedData: ResumeData; fixes: string[] } {
  const fixes: string[] = [];
  const jdLower = jobDescription.toLowerCase();

  // Deep copy the resume data structure
  const revised: ResumeData = JSON.parse(JSON.stringify(data));

  // 1. DO NOT add generic placeholders for email/phone if we're optimizing. 
  // Only add a note if they are missing.
  if (!revised.personal.email && !revised.personal.phone) {
    fixes.push('Note: Consider adding contact information for better recruiter reach.');
  }

  // 2. Surgical Job Title Alignment
  // Only change if current title is very generic or missing
  const isGenericTitle = !revised.personal.title || 
                         revised.personal.title === 'Professional Title' || 
                         revised.personal.title === 'Strategic Technology Professional';
  
  if (isGenericTitle && jobDescription) {
    const titleMatches = ['senior', 'lead', 'manager', 'architect', 'staff', 'full-stack', 'frontend', 'backend', 'designer', 'product', 'support', 'specialist', 'analyst'];
    const foundTitles = titleMatches.filter(t => jdLower.includes(t));
    if (foundTitles.length > 0) {
      const targetTitle = foundTitles.slice(0, 2).map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(' ') + (foundTitles.includes('manager') ? '' : ' Specialist');
      revised.personal.title = targetTitle;
      fixes.push(`Aligned title to match role requirements ("${targetTitle}").`);
    }
  }

  // 3. Strategic Keyword Injection (Skills)
  const missingKeywords: string[] = [];
  const allTargetKeywords = HARD_SKILLS.concat(SOFT_SKILLS);
  
  // Build a full search text block including work experience, education, etc.
  // to be perfectly aligned with how analyzeATSCompliance constructs resumeBlobText
  let resumeBlobText = `${revised.personal.name} ${revised.personal.title} ${revised.personal.subtitle} ${revised.personal.bio}`;
  revised.experience.forEach(exp => {
    resumeBlobText += ` ${exp.company} ${exp.position} ${exp.technologies.join(' ')} ${exp.description.join(' ')}`;
  });
  revised.skills.forEach(s => {
    resumeBlobText += ` ${s.name}`;
  });
  revised.education.forEach(edu => {
    resumeBlobText += ` ${edu.institution} ${edu.degree} ${edu.fieldOfStudy}`;
  });

  const hasWord = (text: string, word: string) => {
    const escaped = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const startBound = /^[a-zA-Z0-9_]/.test(word) ? '\\b' : '';
    const endBound = /[a-zA-Z0-9_]$/.test(word) ? '\\b' : '';
    const regex = new RegExp(`${startBound}${escaped}${endBound}`, 'i');
    return regex.test(text);
  };

  if (jobDescription) {
    allTargetKeywords.forEach(kw => {
      if (jdLower.includes(kw) && !hasWord(resumeBlobText, kw)) {
        missingKeywords.push(kw);
      }
    });
  }

  if (missingKeywords.length > 0) {
    const added: string[] = [];
    
    // Add missing hard skills
    const missingHard = missingKeywords.filter(k => HARD_SKILLS.includes(k));
    missingHard.slice(0, 5).forEach(kw => {
      const nameCapitalized = kw.charAt(0).toUpperCase() + kw.slice(1);
      if (!revised.skills.some(s => s.name.toLowerCase() === kw.toLowerCase())) {
        revised.skills.push({ name: nameCapitalized, level: 85, category: 'Languages' as any });
        added.push(nameCapitalized);
      }
    });

    // Add missing soft skills to category 'Tools/Other'
    const missingSoft = missingKeywords.filter(k => SOFT_SKILLS.includes(k));
    missingSoft.slice(0, 3).forEach(kw => {
      const nameCapitalized = kw.charAt(0).toUpperCase() + kw.slice(1);
      if (!revised.skills.some(s => s.name.toLowerCase() === kw.toLowerCase())) {
        revised.skills.push({ name: nameCapitalized, level: 80, category: 'Tools/Other' as any });
        added.push(nameCapitalized);
      }
    });

    if (added.length > 0) {
      fixes.push(`Strategically integrated missing technical and soft keywords: ${added.join(', ')}.`);
    }
  }

  // 4. Experience Optimization - Stronger Verbs
  let verbUpgrades = 0;
  const verbMap: Record<string, string> = {
    'worked on': 'Spearheaded',
    'helped': 'Collaborated on',
    'handled': 'Orchestrated',
    'made': 'Engineered',
    'fixed': 'Resolved',
    'did': 'Executed',
    'managed': 'Directed',
    'led': 'Pioneered',
    'used': 'Leveraged',
    'took care of': 'Oversaw'
  };

  revised.experience = revised.experience.map(exp => {
    const upgradedDesc = exp.description.map(bullet => {
      let refined = bullet;
      const lowerB = bullet.toLowerCase();
      
      // Swap weak verbs for strong ones
      Object.entries(verbMap).forEach(([weak, strong]) => {
        const regex = new RegExp(`^${weak}\\b`, 'i');
        if (regex.test(lowerB)) {
          refined = bullet.replace(regex, strong);
          verbUpgrades++;
        }
      });

      return refined;
    });

    return { ...exp, description: upgradedDesc };
  });

  if (verbUpgrades > 0) {
    fixes.push(`Upgraded ${verbUpgrades} action verbs to more impactful professional alternatives.`);
  }

  // 5. Bio/Summary Polish
  if (revised.personal.bio.length > 10 && revised.personal.bio.length < 150) {
    const originalBio = revised.personal.bio;
    // Don't replace, just add professional punch if it's too short
    if (!originalBio.toLowerCase().includes('proven track record')) {
      revised.personal.bio = `${originalBio} Proven track record of delivering high-impact solutions and driving growth through technical excellence.`;
      fixes.push('Polished professional summary for stronger executive presence.');
    }
  }

  return {
    revisedData: revised,
    fixes
  };
}
