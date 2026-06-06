import { ResumeData, WorkExperience, Education, Skill } from './types';
import { HARD_SKILLS, SOFT_SKILLS } from './ats';

// Clean and split lines safely
function getCleanLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

// Clean binary code if they mistakenly uploaded a raw PDF/DOCX binary instead of plaintext
function cleanBinaryContent(text: string): string {
  if (
    !text.includes('%PDF') &&
    !text.includes('PK\x03\x04') &&
    !text.includes('[Content_Types].xml')
  ) {
    return text;
  }

  let recovered = '';
  // PDF parentheses extractor
  if (text.includes('%PDF')) {
    const matches = text.match(/\(([^)]+)\)/g);
    if (matches) {
      recovered = matches
        .map((m) => m.slice(1, -1))
        .filter((str) => {
          const s = str.toLowerCase().trim();
          return (
            str.length > 2 &&
            !str.includes('/') &&
            !/^[0-9.\s()\[\]{}]+$/.test(str) &&
            ![
              'font',
              'helvetica',
              'arial',
              'times',
              'roman',
              'encoding',
              'identity',
              'flatedecode',
            ].some((g) => s.includes(g))
          );
        })
        .join('\n');
    }
  }
  // Word document text extractor
  else {
    const matches = text.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
    if (matches) {
      recovered = matches
        .map((m) => m.replace(/<[^>]+>/g, ''))
        .filter((str) => str.trim().length > 1)
        .join('\n');
    }
  }

  return recovered || text.replace(/[^\x20-\x7E\n]/g, ' ');
}

// Email extractor
function extractEmail(text: string): string {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : '';
}

// Phone number extractor
function extractPhone(text: string): string {
  const match = text.match(/(?:\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/);
  return match ? match[0] : '';
}

// Social channels extractor
function extractSocials(text: string): { github?: string; linkedin?: string; twitter?: string } {
  const githubMatch = text.match(/github\.com\/[a-zA-Z0-9-_]+/i);
  const linkedinMatch = text.match(/linkedin\.com\/in\/[a-zA-Z0-9-_]+/i);
  const twitterMatch = text.match(/twitter\.com\/[a-zA-Z0-9-_]+/i);

  return {
    github: githubMatch ? `https://${githubMatch[0]}` : undefined,
    linkedin: linkedinMatch ? `https://${linkedinMatch[0]}` : undefined,
    twitter: twitterMatch ? `https://${twitterMatch[0]}` : undefined,
  };
}

const GARBAGE_TERMS = [
  'en-gb',
  'en-us',
  'curriculum vitae',
  'resume',
  'cv',
  'page 1',
  'page 2',
  'private & confidential',
  'contact details',
  'professional summary',
  'summary',
  'experience',
  'education',
  'skills',
  'work experience',
];

const ADDITIONAL_KNOWN_SKILLS = [
  'html',
  'html5',
  'css',
  'css3',
  'jquery',
  'bootstrap',
  'svelte',
  'solid.js',
  'js',
  'ts',
  'mysql',
  'sqlite',
  'mariadb',
  'firebase',
  'supabase',
  'github',
  'gitlab',
  'c',
  'c++',
  'golang',
  'php',
  'laravel',
  'wordpress',
  'webpack',
  'vite',
  'npm',
  'yarn',
  'pnpm',
  'babel',
  'eslint',
  'prettier',
  'restful api',
  'api design',
  'oops',
  'algorithms',
  'data structures',
  'system design',
  'jira',
  'confluence',
  'trello',
  'slack',
  'vscode',
  'postman',
];

const ALL_KNOWN_SKILLS = Array.from(
  new Set([
    ...HARD_SKILLS.map((s) => s.toLowerCase()),
    ...SOFT_SKILLS.map((s) => s.toLowerCase()),
    ...ADDITIONAL_KNOWN_SKILLS.map((s) => s.toLowerCase()),
  ])
);

// Create the combined regex for matching skills in delimiter-less lines
const SKILLS_REGEX_PATTERN = ALL_KNOWN_SKILLS.sort((a, b) => b.length - a.length)
  .map((skill) => {
    const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const startBound = /^[a-zA-Z0-9_]/.test(skill) ? '\\b' : '';
    const endBound = /[a-zA-Z0-9_]$/.test(skill) ? '\\b' : '';
    return `(?:${startBound}${escaped}${endBound})`;
  })
  .join('|');

const SKILLS_REGEX = new RegExp(SKILLS_REGEX_PATTERN, 'gi');

// Utility to classify a parsed skill into the standard resume categories
function classifySkillCategory(skillName: string, prefix?: string): Skill['category'] {
  const lowerName = skillName.toLowerCase();

  if (
    prefix === 'languages' ||
    /english|german|spanish|french|mandarin|hindi|tamil|telugu|japanese/i.test(lowerName)
  ) {
    return 'Languages';
  }
  if (
    /aws|gcp|azure|docker|kubernetes|devops|jenkins|ci\/cd|pipeline|terraform|ansible|cloud|k8s/i.test(
      lowerName
    )
  ) {
    return 'DevOps/Cloud';
  }
  if (/figma|ux|ui|design|photoshop|illustrator|sketch|adobe/i.test(lowerName)) {
    return 'Design';
  }
  if (
    /node|express|nestjs|fastify|graphql|rest|django|flask|laravel|spring|backend|ruby|rails|sql|postgres|mysql|sqlite|mongodb|db|prisma|sequelize|redis/i.test(
      lowerName
    )
  ) {
    return 'Backend';
  }
  if (
    /kibana|saucelabs|sauce connect|confluence|jira|postman|claude|copilot|swagger|tools|technologies|slack|trello/i.test(
      lowerName
    )
  ) {
    return 'Tools/Other';
  }
  if (
    /python|java|c\+\+|c#|go|golang|rust|swift|kotlin|ruby|javascript|typescript|testing|qa|selenium|cypress|junit|jest|xcuitest|automation|js|ts|html|css/i.test(
      lowerName
    )
  ) {
    return 'Languages';
  }
  return 'Frontend'; // default fallback
}

// Intelligent parser designed specifically to parse copy-pasted plain text copied from PDFs or Word files
export function parseRawResumeText(rawText: string): Partial<ResumeData> {
  const cleanedText = cleanBinaryContent(rawText);
  const lines = getCleanLines(cleanedText);

  if (lines.length === 0) return {};

  const parsed: Partial<ResumeData> = {
    personal: {
      name: '',
      title: '',
      subtitle: '',
      bio: '',
      avatar: '',
      email: extractEmail(cleanedText),
      phone: extractPhone(cleanedText),
      location: '',
      socials: extractSocials(cleanedText),
    },
    experience: [],
    skills: [],
    education: [],
    projects: [],
    certificates: [],
    testimonials: [],
  };

  // 1. FIND THE NAME (High-fidelity detection)
  let nameLineIdx = -1;
  let bestNameScore = -1;
  let potentialName = '';

  for (let i = 0; i < Math.min(4, lines.length); i++) {
    const line = lines[i].trim();
    if (line.length < 3 || line.length > 120) continue;

    // Bullet points or list items are never names
    const isBulletLine = /^[•\-\*▪◦⁃‣✓✔★]/.test(line) || /^\d+\.\s/.test(line) || /^o\s/.test(line);
    if (isBulletLine) continue;

    const lower = line.toLowerCase();
    if (GARBAGE_TERMS.some((term) => lower === term || lower.includes(term))) continue;
    if (line.includes('@') || line.includes('http') || line.includes('www.')) continue;

    // Split by common separators if they exist (e.g. "John Doe | Engineer")
    const parts = line.split(/[|•,]/);
    const candidate = parts[0].trim();

    if (candidate.length < 3) continue;

    let score = 0;
    // Names usually start with capital letters
    if (/^[A-Z]/.test(candidate)) score += 10;
    // Full names usually have at least one space
    if (candidate.includes(' ')) score += 5;
    // Names usually don't have digits
    if (!/\d/.test(candidate)) score += 10;
    // Shorter lines near the top are more likely to be names
    score += 10 - i;
    // ALL CAPS is common for names
    if (candidate === candidate.toUpperCase() && candidate.length > 5) score += 5;

    // Penalty for job/work-related keywords in names
    const nameBlacklist = [
      'engineer',
      'developer',
      'analyst',
      'manager',
      'architect',
      'designer',
      'specialist',
      'lead',
      'support',
      'technology',
      'solutions',
      'services',
      'gmbh',
      'inc',
      'corp',
      'co',
      'limited',
      'ltd',
      'summary',
      'experience',
      'education',
      'skills',
      'about',
      'profile',
      'work',
      'project',
      'dxc',
    ];
    if (nameBlacklist.some((term) => candidate.toLowerCase().includes(term))) {
      score -= 50;
    }

    if (score > bestNameScore) {
      bestNameScore = score;
      potentialName = candidate;
      nameLineIdx = i;
    }
  }

  if (potentialName) {
    parsed.personal!.name = potentialName;
    // Check if the same line had a title after a separator
    const fullLine = lines[nameLineIdx];
    const parts = fullLine.split(/[|•,]/);
    if (parts.length > 1 && !parts[1].includes('@')) {
      const candidateTitle = parts[1].trim();
      if (candidateTitle.length > 5 && candidateTitle.length < 50) {
        parsed.personal!.title = candidateTitle;
      }
    }
  } else if (parsed.personal!.email) {
    // Fallback: try to derive name from email (e.g. john.doe@email.com -> John Doe)
    const emailPrefix = parsed.personal!.email.split('@')[0];
    const nameParts = emailPrefix.split(/[._-]/);
    if (nameParts.length >= 2) {
      parsed.personal!.name = nameParts
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    } else {
      parsed.personal!.name = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
    }
    nameLineIdx = -1;
  } else if (lines.length > 0) {
    // Ultimate fallback: first line that isn't a garbage header or a list bullet point
    const fallbackIdx = lines.findIndex((l) => {
      const clean = l.trim();
      const lower = clean.toLowerCase();
      const isBullet =
        /^[•\-\*▪◦⁃‣✓✔★]/.test(clean) || /^\d+\.\s/.test(clean) || /^o\s/.test(clean);
      return (
        clean.length >= 3 &&
        clean.length <= 80 &&
        !isBullet &&
        !GARBAGE_TERMS.some((term) => lower === term || lower.includes(term))
      );
    });
    if (fallbackIdx !== -1) {
      let fallbackName = lines[fallbackIdx].split(/[|•,]/)[0].trim();
      const titleKeywords =
        /engineer|developer|analyst|manager|architect|designer|specialist|lead|support|officer|consultant|expert|head/i;
      if (titleKeywords.test(fallbackName)) {
        parsed.personal!.name = 'Resume Applicant';
      } else {
        parsed.personal!.name = fallbackName;
      }
      nameLineIdx = fallbackIdx;
    } else {
      parsed.personal!.name = 'Resume Applicant';
      nameLineIdx = 0;
    }
  }

  // 2. FIND THE PROFESSIONAL TITLE
  for (let i = nameLineIdx + 1; i < Math.min(nameLineIdx + 6, lines.length); i++) {
    const line = lines[i].trim();
    const lower = line.toLowerCase();

    if (
      line.length > 5 &&
      line.length < 100 &&
      !line.includes('@') &&
      (lower.includes('engineer') ||
        lower.includes('developer') ||
        lower.includes('architect') ||
        lower.includes('designer') ||
        lower.includes('analyst') ||
        lower.includes('manager') ||
        lower.includes('specialist') ||
        lower.includes('consultant') ||
        lower.includes('lead') ||
        lower.includes('stack') ||
        lower.includes('qa') ||
        lower.includes('tester'))
    ) {
      parsed.personal!.title = line.replace(/_/g, ' ');
      break;
    }
  }

  // Provide structural titles if parsing fails
  if (!parsed.personal!.title) {
    parsed.personal!.title = '';
  }

  // 2.5 EXTRACT BIO (Text between Title and first header)
  const firstHeaderIdx = lines.findIndex(
    (l, idx) =>
      idx > nameLineIdx &&
      /^(experience|work experience|professional experience|education|skills|summary|profile|about me|additional)/i.test(
        l
      )
  );
  const bioLimit = firstHeaderIdx === -1 ? nameLineIdx + 8 : firstHeaderIdx;

  const bioLines = [];
  for (let i = nameLineIdx + 1; i < Math.min(bioLimit, lines.length); i++) {
    const line = lines[i].trim();
    // Don't include the title itself in the bio
    if (
      line === parsed.personal!.title ||
      line.replace(/ /g, '_') === parsed.personal!.title.replace(/ /g, '_')
    )
      continue;

    if (line.length > 25 && !line.includes('@') && !line.includes('http') && !/\d{5,}/.test(line)) {
      bioLines.push(line);
    }
  }

  if (bioLines.length > 0) {
    parsed.personal!.bio = bioLines.join(' ');
  }

  parsed.personal!.avatar = parsed
    .personal!.name.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  parsed.personal!.subtitle = '';

  // 3. PARSE SECTIONS (Experience, Education, Skills, Certificates)
  const experiences: WorkExperience[] = [];
  const educations: Education[] = [];
  const skillsList: Skill[] = [];
  const certificatesList: any[] = [];

  let currentSection: 'experience' | 'education' | 'skills' | 'certificates' | 'summary' | 'none' =
    'none';
  let currentExp: Partial<WorkExperience> | null = null;
  let currentEdu: Partial<Education> | null = null;

  const flushActiveTimelines = () => {
    if (
      currentSection === 'experience' &&
      currentExp &&
      currentExp.company &&
      currentExp.position
    ) {
      if (
        !experiences.some(
          (e) => e.company === currentExp!.company && e.position === currentExp!.position
        )
      ) {
        experiences.push(currentExp as WorkExperience);
      }
      currentExp = null;
    }
    if (currentSection === 'education' && currentEdu && currentEdu.institution) {
      if (!educations.some((e) => e.institution === currentEdu!.institution)) {
        educations.push(currentEdu as Education);
      }
      currentEdu = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length === 0) continue;
    const lower = line.toLowerCase();

    // Parse inline awards/certifications (e.g. "Awards: Support Engineer...")
    if (/^(awards|certifications|certificates):\s*/i.test(line)) {
      flushActiveTimelines();
      const cleanLine = line.replace(/^(awards|certifications|certificates):\s*/i, '').trim();
      const parts = cleanLine.split(/,(?![^(]*\))/).map((p) => p.trim());
      parts.forEach((part) => {
        if (part.length > 5) {
          const dateMatch = part.match(/\b(19|20)\d{2}\b/);
          const date = dateMatch ? dateMatch[0] : '2024';

          let textWithoutDate = part
            .replace(/\s*\(\s*(19|20)\d{2}\s*\)/, '')
            .replace(/\s*[,]?\s*\b(19|20)\d{2}\b/, '')
            .trim();

          let name = textWithoutDate;
          let issuer = 'Verification Body';

          const separators = ['–', '-', '|'];
          for (const sep of separators) {
            if (textWithoutDate.includes(sep)) {
              const subparts = textWithoutDate.split(sep).map((p) => p.trim());
              if (subparts[0].length >= 3 && subparts[1].length >= 2) {
                name = subparts[0];
                issuer = subparts[1];
                break;
              }
            }
          }

          certificatesList.push({
            id: `cert-${certificatesList.length + 1}`,
            name: name.replace(/^[•\-*\s]+/, ''),
            issuer: issuer,
            date: date,
          });
        }
      });
      continue;
    }

    // Parse inline skills/technologies/languages (e.g. "Technical Skills: ...", "Tools & Technologies: ...", "Languages: ...")
    if (
      /^(technical skills|tools & technologies|tools and technologies|key skills|skills|tools|technologies|languages):\s*/i.test(
        line
      )
    ) {
      flushActiveTimelines();
      const prefixMatch = line.match(
        /^(technical skills|tools & technologies|tools and technologies|key skills|skills|tools|technologies|languages):\s*/i
      );
      const prefix = prefixMatch ? prefixMatch[1].toLowerCase() : '';
      const cleanLine = line
        .replace(
          /^(technical skills|tools & technologies|tools and technologies|key skills|skills|tools|technologies|languages):\s*/i,
          ''
        )
        .trim();

      const hasDelimiters =
        cleanLine.includes(',') || cleanLine.includes(';') || cleanLine.includes('|');
      let rawSkills: string[] = [];
      if (hasDelimiters) {
        const separator = cleanLine.includes(',') ? ',' : cleanLine.includes(';') ? ';' : '|';
        rawSkills = cleanLine
          .split(separator)
          .map((s) => s.trim())
          .filter((s) => s.length > 1 && s.length < 50);
      } else {
        const matches = cleanLine.match(SKILLS_REGEX);
        if (matches) {
          rawSkills = Array.from(new Set(matches.map((m) => m.trim())));
        } else {
          rawSkills = cleanLine
            .split('  ')
            .map((s) => s.trim())
            .filter((s) => s.length > 1 && s.length < 50);
        }
      }

      rawSkills.forEach((skillName) => {
        // Ignore lines that look like sentences
        if (skillName.split(' ').length > 6) return;

        const category = classifySkillCategory(skillName, prefix);
        const lowerName = skillName.toLowerCase();

        if (!skillsList.some((s) => s.name.toLowerCase() === lowerName)) {
          skillsList.push({
            name: skillName,
            level: 85 + Math.floor(Math.random() * 10),
            category,
          });
        }
      });
      continue;
    }

    // AUTO-CORRECTION: If we see a date and we're NOT in experience/education, it's likely a job entry
    const hasYearDate = /\b(19|20)\d{2}\b/i.test(line) || /present/i.test(line);

    // Check if this line is a section header transition
    const isShortLine = line.length < 50;

    if (
      isShortLine &&
      /^(experience|work experience|professional experience|employment history|employment|work history|history|career|experience:)/i.test(
        line
      )
    ) {
      flushActiveTimelines();
      currentSection = 'experience';
      currentExp = null;
      continue;
    } else if (
      isShortLine &&
      /^(education|academic background|university education|academics|academic|education:)/i.test(
        line
      )
    ) {
      flushActiveTimelines();
      currentSection = 'education';
      currentEdu = null;
      continue;
    } else if (
      isShortLine &&
      (/^(skills|technical skills|key skills|core competencies|expertise|tech stack|technologies|technologies:)/i.test(
        line
      ) ||
        lower === 'skills' ||
        lower === 'technical skills' ||
        lower === 'expertise' ||
        lower === 'technologies')
    ) {
      flushActiveTimelines();
      currentSection = 'skills';
      continue;
    } else if (
      isShortLine &&
      /^(awards|certifications|certificates|achievements|recognition|recognitions|honors|accomplishments|awards:)/i.test(
        line
      )
    ) {
      flushActiveTimelines();
      currentSection = 'certificates';
      continue;
    } else if (
      isShortLine &&
      /^(summary|professional summary|profile|about me|professional profile|summary:)/i.test(line)
    ) {
      flushActiveTimelines();
      currentSection = 'summary';
      parsed.personal!.bio = ''; // Clear pre-header guessed bio to capture a dedicated summary section
      continue;
    } else if (
      isShortLine &&
      /^(additional information|projects|personal projects|portfolio|contact|links|socials)/i.test(
        line
      )
    ) {
      flushActiveTimelines();
      currentSection = 'none';
      continue;
    }

    // HEURISTIC: If we see a date-like line and we are NOT in 'education' or 'experience', it's probably a work experience entry
    const isBulletLine = /^[•\-\*▪◦⁃‣✓✔★]/.test(line) || /^\d+\.\s/.test(line) || /^o\s/.test(line);
    const isJobTitleLine =
      /engineer|developer|analyst|manager|architect|designer|specialist|lead|support|consultant/i.test(
        line
      ) || line.includes('|');
    const isNotAwardsOrCert =
      !/^(awards|certifications|certificates|projects|skills|languages|tools)/i.test(line);
    if (
      hasYearDate &&
      currentSection !== 'education' &&
      currentSection !== 'experience' &&
      !isBulletLine &&
      line.length < 120 &&
      isJobTitleLine &&
      isNotAwardsOrCert
    ) {
      flushActiveTimelines();
      currentSection = 'experience';
      currentExp = null; // Reset any previous active job
    }

    // SECTION A: WORK EXPERIENCE PARSING
    if (currentSection === 'experience') {
      const hasDate = /\b(19|20)\d{2}\b/i.test(line) || /present/i.test(line);
      const isBullet = /^[•\-\*▪◦⁃‣✓✔★]/.test(line) || /^\d+\.\s/.test(line) || /^o\s/.test(line);

      // A new job often has a date OR looks like "Company, Position"
      if (hasDate && !isBullet && line.length < 120) {
        if (currentExp && currentExp.company) {
          experiences.push(currentExp as WorkExperience);
        }

        // Only split by |, @, , to avoid splitting date dashes like "2021 - Present"
        const parts = line.split(/[|@,]/).map((p) => p.trim());
        const period =
          line.match(
            /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}|(?:19|20)\d{2})\s*[-–—]\s*(Present|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}|(?:19|20)\d{2})/i
          )?.[0] ||
          line.match(/\b(19|20)\d{2}\b/g)?.join(' - ') ||
          'Present';

        // Clean period from parts
        const cleanParts = parts
          .map((p) => p.replace(period, '').replace(/\s+/g, ' ').trim())
          .filter((p) => p.length > 0);

        // Classify parts
        const positionKeywords =
          /engineer|developer|analyst|manager|architect|designer|specialist|lead|support|officer|consultant|expert|head/i;
        let positionIdx = cleanParts.findIndex((p) => positionKeywords.test(p));
        if (positionIdx === -1) positionIdx = 0;
        const position = cleanParts[positionIdx] || 'Professional Role';

        const companyKeywords =
          /gmbh|inc|corp|co\b|limited|ltd|llc|labs|solutions|systems|technologies|dxc/i;
        let companyIdx = cleanParts.findIndex(
          (p, idx) => idx !== positionIdx && companyKeywords.test(p)
        );
        if (companyIdx === -1) {
          companyIdx = cleanParts.findIndex(
            (p, idx) =>
              idx !== positionIdx && !/remote|berlin|bangalore|london|york|california|san/i.test(p)
          );
        }
        if (companyIdx === -1) {
          companyIdx = cleanParts.findIndex((_, idx) => idx !== positionIdx);
        }
        const company = cleanParts[companyIdx] || 'Company';

        const locationParts = cleanParts.filter(
          (_, idx) => idx !== positionIdx && idx !== companyIdx
        );
        const location = locationParts.join(', ') || 'Remote';

        currentExp = {
          id: `exp-${experiences.length + 1}`,
          company,
          position,
          location,
          period,
          current: period.toLowerCase().includes('present'),
          description: [],
          technologies: [],
        };
      } else if (currentExp) {
        const startsWithCapital = /^[A-Z]/.test(line);
        const prevLineEndedWithPeriod =
          i > 0 &&
          (lines[i - 1].trim().endsWith('.') ||
            lines[i - 1].trim().endsWith('!') ||
            lines[i - 1].trim().endsWith('?'));
        const isHeaderAbove =
          i > 0 &&
          (lines[i - 1].includes('|') ||
            /\b(19|20)\d{2}\b/i.test(lines[i - 1]) ||
            /present/i.test(lines[i - 1]));
        const isNewAchievement =
          isBullet ||
          (startsWithCapital &&
            (prevLineEndedWithPeriod || isHeaderAbove || lines[i - 1].trim() === ''));

        if (isNewAchievement) {
          const bullet = line
            .replace(/^[•\-\*▪◦⁃‣✓✔★\s]+/, '')
            .replace(/^o\s+/, '')
            .replace(/^\d+\.\s+/, '')
            .trim();
          if (bullet.length > 2) {
            currentExp.description!.push(bullet);
          }
        } else if (line.length > 0 && !hasYearDate) {
          if (currentExp.description!.length > 0) {
            const lastIdx = currentExp.description!.length - 1;
            currentExp.description![lastIdx] = (currentExp.description![lastIdx] + ' ' + line)
              .replace(/\s+/g, ' ')
              .trim();
          } else if (line.length > 10) {
            currentExp.description!.push(line);
          }
        }
      }
    } else if (currentSection === 'summary') {
      if (line.length > 5 && !line.includes('@') && !line.includes('http')) {
        if (parsed.personal!.bio) {
          parsed.personal!.bio += ' ' + line;
        } else {
          parsed.personal!.bio = line;
        }
      }
    } else if (currentSection === 'education') {
      const hasDegree =
        /degree|bachelor|master|phd|b\.s\.|b\.a\.|m\.s\.|bs|ba|ms|university|college|school|institute|technology|academy/i.test(
          line
        );
      const hasDate = /\b(19|20)\d{2}\b/i.test(line);
      const isBullet = /^[•\-\*▪◦⁃‣✓✔★]/.test(line) || /^\d+\.\s/.test(line) || /^o\s/.test(line);

      // Only start a new education entry if it doesn't look like a bullet point
      // and has some academic indicators OR is a very short line with a date
      if (!isBullet && (hasDegree || (hasDate && line.length < 60))) {
        if (currentEdu && currentEdu.institution) {
          educations.push(currentEdu as Education);
        }

        const parts = line.split(/[|\-@,]/).map((p) => p.trim());
        const institution = parts[0];
        const degree = parts[1] || '';

        currentEdu = {
          id: `edu-${educations.length + 1}`,
          institution: institution || 'Academic Institution',
          degree: degree,
          fieldOfStudy: parts[2] || '',
          location: 'United States',
          period: line.match(/\b(19|20)\d{2}\b/g)?.join(' - ') || '',
        };
      } else if (currentEdu) {
        if (lower.includes('gpa') || lower.includes('grade') || lower.includes('g.p.a')) {
          currentEdu.grade = line;
        } else if (line.length > 5 && !isBullet && !currentEdu.degree) {
          // If we haven't found a degree yet, maybe this line is it
          currentEdu.degree = line;
        }
      }
    } else if (currentSection === 'skills') {
      // If we see something that looks like an experience entry, STOP parsing skills
      if (hasYearDate && line.length < 80) {
        currentSection = 'experience';
        i--; // Re-process this line as experience
        continue;
      }

      const hasDelimiters = line.includes(',') || line.includes(';') || line.includes('|');
      let rawSkills: string[] = [];
      if (hasDelimiters) {
        const separator = line.includes(',') ? ',' : line.includes(';') ? ';' : '|';
        rawSkills = line
          .split(separator)
          .map((s) => s.trim())
          .filter((s) => s.length > 1 && s.length < 35);
      } else {
        const matches = line.match(SKILLS_REGEX);
        if (matches) {
          rawSkills = Array.from(new Set(matches.map((m) => m.trim())));
        } else {
          rawSkills = line
            .split('  ')
            .map((s) => s.trim())
            .filter((s) => s.length > 1 && s.length < 35);
        }
      }

      rawSkills.forEach((skillName) => {
        // Ignore lines that look like sentences
        if (skillName.split(' ').length > 4) return;

        const category = classifySkillCategory(skillName);
        const lowerName = skillName.toLowerCase();

        if (!skillsList.some((s) => s.name.toLowerCase() === lowerName)) {
          skillsList.push({
            name: skillName,
            level: 85 + Math.floor(Math.random() * 10),
            category,
          });
        }
      });
    } else if (currentSection === 'certificates') {
      const cleanLine = line.replace(/^[•\-*\s]+/, '').trim();

      if (cleanLine.length > 5) {
        const dateMatch = cleanLine.match(/\b(19|20)\d{2}\b/);
        const date = dateMatch ? dateMatch[0] : '2024';

        let textWithoutDate = cleanLine
          .replace(/\s*\(\s*(19|20)\d{2}\s*\)/, '')
          .replace(/\s*[,]?\s*\b(19|20)\d{2}\b/, '')
          .trim();

        let name = textWithoutDate;
        let issuer = 'Verification Body';

        const separators = [',', '–', '-', '|'];
        let splitDone = false;

        for (const sep of separators) {
          if (textWithoutDate.includes(sep)) {
            const parts = textWithoutDate.split(sep).map((p) => p.trim());
            if (parts[0].length >= 3 && parts[1].length >= 2) {
              name = parts[0];
              issuer = parts[1];
              splitDone = true;
              break;
            }
          }
        }

        if (!splitDone) {
          if (
            /microsoft|aws|amazon|google|cisco|oracle|scrum|pmi|comptia|coursera|udemy|edx|freecodecamp/i.test(
              cleanLine
            )
          ) {
            const matches = cleanLine.match(
              /(microsoft|aws|amazon|google|cisco|oracle|scrum|pmi|comptia|coursera|udemy|edx|freecodecamp)/i
            );
            if (matches) {
              issuer = matches[0].charAt(0).toUpperCase() + matches[0].slice(1);
            }
          }
        }

        certificatesList.push({
          id: `cert-${certificatesList.length + 1}`,
          name: name.replace(/^[•\-*\s]+/, ''),
          issuer: issuer,
          date: date,
        });
      }
    }
  }

  // Flush final active timelines
  if (currentExp && currentExp.company && currentExp.position) {
    experiences.push(currentExp as WorkExperience);
  }
  if (currentEdu && currentEdu.institution) {
    educations.push(currentEdu as Education);
  }

  // Bind collections
  parsed.experience = experiences;
  parsed.education = educations;
  parsed.skills = skillsList;
  parsed.certificates = certificatesList;

  // Clean bio spacing
  if (parsed.personal && parsed.personal.bio) {
    parsed.personal.bio = parsed.personal.bio.replace(/\s+/g, ' ').trim();
  }

  return parsed;
}
