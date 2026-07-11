# Graph Report - .  (2026-07-11)

## Corpus Check
- 52 files · ~320,250 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 351 nodes · 594 edges · 18 communities (14 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AI Interview Coach Prompts & Prompts Generation
- Project Linting & ESLint Config
- Dashboard Interface & Auth Modal
- Styling & UI Dependencies
- TypeScript Declarations & Symbol References
- ATS Resume Checker & Compliance Logic
- Landing Page & Resume Templates
- Recruiter Personas & Interview State Management
- App Manifest & PWA Configuration
- UI Theme & Theme States
- Root Application & Error Boundaries
- Resume Analytics & Action Verb Checker
- Database Cleanup & Session Deduplication Scripts
- Vite Builder Configurations
- Service Worker & PWA Caching
- Vercel Deployments & Routing

## God Nodes (most connected - your core abstractions)
1. `Dashboard()` - 36 edges
2. `compilerOptions` - 19 edges
3. `ResumeData` - 18 edges
4. `callAiChat()` - 10 edges
5. `parseRawResumeText()` - 10 edges
6. `ThemeSettings` - 9 edges
7. `loadScript()` - 9 edges
8. `InterviewState` - 8 edges
9. `ErrorBoundary` - 7 edges
10. `generateInterviewPlan()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Dashboard()` --calls--> `analyzeATSCompliance()`  [EXTRACTED]
  src/Dashboard.tsx → src/ats.ts
- `Dashboard()` --calls--> `analyzeCoverLetter()`  [EXTRACTED]
  src/Dashboard.tsx → src/ats.ts
- `Dashboard()` --calls--> `autoOptimizeResume()`  [EXTRACTED]
  src/Dashboard.tsx → src/ats.ts
- `Dashboard()` --calls--> `autoTuneDesign()`  [EXTRACTED]
  src/Dashboard.tsx → src/ats.ts
- `Dashboard()` --calls--> `analyzeResume()`  [EXTRACTED]
  src/Dashboard.tsx → src/coach.ts

## Import Cycles
- None detected.

## Communities (18 total, 4 thin omitted)

### Community 0 - "AI Interview Coach Prompts & Prompts Generation"
Cohesion: 0.06
Nodes (52): addIds(), addRecruiterIds(), BEHAVIORAL_QUESTIONS, buildInsightsPrompt(), callAiChat(), callOpenRouterModel(), classifyRole(), COMPANY_RECRUITER_QUESTIONS (+44 more)

### Community 1 - "Project Linting & ESLint Config"
Cohesion: 0.04
Nodes (47): docx, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, html2canvas (+39 more)

### Community 2 - "Dashboard Interface & Auth Modal"
Cohesion: 0.11
Nodes (34): AuthModal(), Dashboard(), IMPORTANT: We only call setSavedSessions when something actually changed., extractTextFromFile(), extractTextFromPDF(), extractTextFromWord(), fileToArrayBuffer(), withTimeout() (+26 more)

### Community 3 - "Styling & UI Dependencies"
Cohesion: 0.06
Nodes (31): clsx, @fontsource-variable/geist, lucide-react, dependencies, clsx, @fontsource-variable/geist, lucide-react, pdfjs-dist (+23 more)

### Community 4 - "TypeScript Declarations & Symbol References"
Cohesion: 0.07
Nodes (28): DOM, DOM.Iterable, ES2020, node, src/*, vite/client, vite.config.ts, compilerOptions (+20 more)

### Community 5 - "ATS Resume Checker & Compliance Logic"
Cohesion: 0.11
Nodes (27): analyzeATSCompliance(), analyzeCoverLetter(), ATSAnalysisResult, ATSComplianceCheck, autoOptimizeResume(), autoTuneDesign(), countOccurrences(), CoverLetterResult (+19 more)

### Community 6 - "Landing Page & Resume Templates"
Cohesion: 0.12
Nodes (17): ResumeDocumentTemplate(), ResumeDocumentTemplateProps, ResumeInteractivePreview(), ResumePreviewProps, defaultResumeData, defaultThemeSettings, FieldSetter, ResumeState (+9 more)

### Community 7 - "Recruiter Personas & Interview State Management"
Cohesion: 0.11
Nodes (24): AiProvider, RECRUITER_PERSONAS, FieldSetter, InterviewState, Updater, useInterviewStore, AnswerScore, Certificate (+16 more)

### Community 8 - "App Manifest & PWA Configuration"
Cohesion: 0.13
Nodes (14): background_color, categories, description, display, icons, name, orientation, prefer_related_applications (+6 more)

### Community 9 - "UI Theme & Theme States"
Cohesion: 0.17
Nodes (12): AppTheme, BulletStyle, CoachSubTab, FieldSetter, MobileActiveView, PreviewDevice, RightTab, UIState (+4 more)

### Community 10 - "Root Application & Error Boundaries"
Cohesion: 0.18
Nodes (3): ErrorBoundary, Props, State

### Community 11 - "Resume Analytics & Action Verb Checker"
Cohesion: 0.38
Nodes (6): actionVerbDictionary, analyzeResume(), CoachScoreAnalysis, hasActionVerbs(), hasMetrics(), Recommendation

## Knowledge Gaps
- **143 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+138 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Project Linting & ESLint Config` to `Styling & UI Dependencies`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `ResumeData` connect `Landing Page & Resume Templates` to `AI Interview Coach Prompts & Prompts Generation`, `Dashboard Interface & Auth Modal`, `ATS Resume Checker & Compliance Logic`, `Recruiter Personas & Interview State Management`, `Resume Analytics & Action Verb Checker`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _144 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AI Interview Coach Prompts & Prompts Generation` be split into smaller, more focused modules?**
  _Cohesion score 0.0602322206095791 - nodes in this community are weakly interconnected._
- **Should `Project Linting & ESLint Config` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Should `Dashboard Interface & Auth Modal` be split into smaller, more focused modules?**
  _Cohesion score 0.10676532769556026 - nodes in this community are weakly interconnected._
- **Should `Styling & UI Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._