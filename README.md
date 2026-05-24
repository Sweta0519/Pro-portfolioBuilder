# 🚀 ProPortfolio Builder

[![Vite](https://img.shields.io/badge/Vite-7.3.2-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.2.6-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.17-06B6D4?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An all-in-one AI-driven resume parser, ATS compliance scanner, interactive resume coach, **AI-powered interview prep coach with live Google Search**, and professional web portfolio generator. 

ProPortfolio Builder allows candidates to paste or upload standard PDF/Word resumes, audit them against active job listings, auto-optimize their content, prepare for interviews with role-specific questions sourced from Glassdoor and Blind, practice with a live mock interview simulator, upload a profile picture, customize styling, and instantly export a fully responsive, deployment-ready Vite + React + Tailwind CSS portfolio site.

---

## 🌟 Key Features

### 📁 1. Intelligent Resume Parser
* **Multi-Format Parsing:** Directly upload and parse standard `.docx`, `.pdf`, or plain text files.
* **Structured Data Extraction:** Automatically separates text into a clean JSON schema covering personal info, work experience, projects, skills, education, certifications, and testimonials.

### 🎭 2. 5 Premium Interactive Web Themes
* **Creative Morph:** Fluid morphing gradient background blobs, a rotating card avatar sidebar, and sleek interactive transitions.
* **Cyberpunk Terminal:** Retro-futuristic, high-contrast monospace developer terminal look. Built with CLI dashboard aesthetics.
* **Minimal Slate:** Ultra-clean, high-readability layout built around premium typography, subtle spacing, and traditional structure.
* **Gradient Glow:** A sleek dark mode UI utilizing floating glassmorphism, gradient cards, and glowing neon nodes.
* **Classic Professional:** Clean, structured corporate layout perfect for traditional engineering, finance, or consulting fields.

### 🎨 3. Deep Customization Engine
* **Dynamic Palette Customizer:** Live accent color picker allowing instant switching between violet, emerald, blue, amber, rose, and slate.
* **Typography Selector:** Toggle typography families (Sans, Serif, and Monospace) to match your developer identity.
* **Base64 Avatar Uploader:** Upload custom profile pictures. Photos are processed via `FileReader.readAsDataURL()` and stored in state as Base64 strings. This embeds the avatar directly in the page markup and exported packages with **zero third-party hosting dependencies**.

### 📊 4. Real-Time ATS & Cover Letter Scanner
* **Jobscan-Style Scoring:** Paste target job descriptions to analyze match probability.
* **Audit Checks:** Automatically checks for contact info, formatting layout, and flags unreadable nested grids that trip up legacy ATS systems.
* **Recruiter Insights:** Audits document word count, sentence length complexity, calculates estimated experience years from resume dates, and verifies job title alignment.
* **Keyword Density Analysis:** Generates a target vs. actual frequency checklist for hard and soft skills.
* **Cover Letter Auditor:** Real-time feedback on greeting presence, length, and keyword mapping.

### 🧠 5. Interactive AI Resume Coach
* **Real-time Scoring:** Rates resume content on a scale of `0 - 100` and assigns a letter grade (`A+` down to `Needs Work`).
* **Active Verb Audits:** Automatically scans description lines and flags passive phrasing, warning you if you lack strong start verbs (e.g. *Led*, *Spearheaded*, *Engineered*).
* **Metrics Auditor:** Scans bullets for quantitative values (percentages, savings, currency, quantities), helping you prove impact with concrete data.
* **Action Verb Upgrader:** Includes a dictionary mapping weak verbs (like *"worked on"*, *"helped"*, *"made"*) to high-impact bullet point examples.

### 🔄 6. One-Click Resume Optimizer
* **Keyword Injection:** Automatically appends relevant missing technical keywords to your skills section.
* **Verb Upgrading:** Automatically swaps passive verbs in your experience history with professional power-verbs.
* **Summary Polishing:** Refines and fills out brief professional bios to increase executive presence.

### 📦 7. Multi-Format Exporters
* **Vite + React + Tailwind ZIP:** Downloads a zip package containing a complete, modular, and responsive Vite application pre-configured with Tailwind CSS 4.0. Upload to Vercel/Netlify for one-click live portfolio deployment.
* **Word Exporter:** Generates a structured, clean, and beautifully styled Word Document (`.docx`) using heading structures.
* **Print PDF:** Renders a clean document layout optimized for printing or direct PDF generation.

### 🎯 8. AI Interview Prep Coach
A comprehensive, role-aware interview preparation system that tailors everything based on your specific position and target company.

#### 🧠 Role-Aware Intelligence (13 Role Categories)
The system classifies your position into one of 13 categories and automatically adjusts which interview rounds and questions are shown:

| Position Detected | Interview Rounds Shown | DSA? | System Design? |
|---|---|---|---|
| Software / Fullstack Engineer | HR, Behavioral, Technical, DSA, System Design | ✅ | ✅ |
| Frontend Engineer | HR, Behavioral, Technical, DSA | ✅ | ❌ |
| Tech Support / Customer Success | HR, Behavioral, Technical, **Customer Scenarios** | ❌ | ❌ |
| Product Manager | HR, Behavioral, **Product Sense** | ❌ | ❌ |
| Data Analyst | HR, Behavioral, **SQL & Analytics** | ❌ | ❌ |
| Data Scientist / ML Engineer | HR, Behavioral, Technical, **ML & Statistics** | ❌ | ❌ |
| DevOps / SRE | HR, Behavioral, **Infrastructure**, System Design | ❌ | ✅ |
| QA / SDET | HR, Behavioral, Technical, **QA & Testing** | ❌ | ❌ |
| UX/UI Designer | HR, Behavioral, **Design Portfolio** | ❌ | ❌ |
| Engineering Manager | HR, Behavioral, **Leadership** | ❌ | ❌ |

#### 🌐 Gemini Google Search Integration (Optional)
With a free [Google AI Studio API key](https://aistudio.google.com/apikey), the tool calls **Gemini 2.0 Flash with Google Search grounding** to fetch real, live information:
* **What people actually do** in this role at this specific company (from Glassdoor, LinkedIn, Blind, Indeed)
* **The real interview process** — step-by-step rounds reported by actual candidates
* **8–10 real interview questions** reported on Glassdoor, Blind, and LeetCode Discuss
* **Source links** from the web results for verification

The interview form has three input fields: **Company Name**, **Position/Job Title**, and **Job Description**. Enter the company name explicitly for the most targeted search results.

> Without an API key, the tool falls back to curated local templates — still fully functional with 100+ questions across all roles.

#### 🔍 Role Insights Dashboard
For every company + role combination, see a rich "What People Do In This Role" card:
* Day-to-day responsibilities (company culture–aware: big-tech vs. startup vs. consulting)
* Typical workday description
* Key skills expected
* Top challenges candidates face

#### 📋 100+ Curated Practice Questions
* **HR & Screening** — salary expectations, motivation, strengths/weaknesses
* **Behavioral (STAR)** — Amazon LP-style, failure/success stories, conflict resolution
* **Technical** — REST vs GraphQL, event loop, SOLID, Docker, JWT auth, database optimization
* **DSA / Coding** — Two Sum, LRU Cache, Number of Islands, Coin Change (real LeetCode problems)
* **System Design** — URL Shortener, Notification System, News Feed, Rate Limiter
* **Customer Scenarios** — Ticket prioritization, escalation handling, knowledge base writing
* **Product Sense** — Metrics investigation, feature prioritization, build vs. buy decisions
* **SQL & Analytics** — Window functions, rolling averages, A/B test design
* **ML & Statistics** — Bias-variance, precision/recall, recommendation systems
* **Infrastructure** — CI/CD pipelines, incident response, Kubernetes, cost optimization
* **QA & Testing** — Test pyramid, API testing, flaky test management
* **Design Portfolio** — Portfolio walkthrough, accessibility, designer-engineer handoff
* **Leadership** — Performance feedback, technical debt negotiation, team building

#### 📚 Smart Study Planner
* Identifies skill gaps between your resume and the job description
* Assigns High/Medium/Low priority based on role category and seniority
* Links to real external learning resources (LeetCode, NeetCode, YouTube, official docs)
* All links open in a new tab for easy access

#### 🎤 Mock Interview Simulator
* **One-question-at-a-time** sequential flow with a live timer
* **🎙️ Voice Recording:** Click the microphone button to speak your answer — real-time speech-to-text transcription appears in the textarea (powered by the browser's Web Speech API). Audio is also recorded for playback so you can listen to yourself.
* **AI-powered answer scorer** evaluates your response on:
  * STAR method structure (for behavioral rounds)
  * Quantitative metrics and impact statements
  * Action verb usage (Led, Built, Delivered, Optimized...)
  * Technical depth and terminology (for technical rounds)
  * Role-specific criteria (SQL terms for analysts, customer empathy for support, etc.)
* Letter grade system (A+ through "Needs Work") with actionable feedback
* Practice shortcuts: click "Practice This" on any question to jump directly into mock mode

---

## 🛠️ Tech Stack

* **Frontend Framework:** React 19 (TypeScript)
* **Build Tooling:** Vite 7.3.2
* **Styling Engine:** Tailwind CSS 4.1.17 (using `@tailwindcss/vite` plugin compilation)
* **AI Integration:** Gemini 2.0 Flash API with Google Search grounding (optional, free tier)
* **Icon Set:** Lucide React
* **Document Parsing Support:** `pdfjs-dist` (PDF extraction) & `mammoth` (Docx extraction)
* **Export Utilities:** `docx` (Word formatting), `jszip` (ZIP file compilation)

---

## 📂 Project Structure

```bash
build-portfolio-from-resume/
├── src/
│   ├── App.tsx                     # Main UI: Sidebar editors, previewers, ATS scanner, interview coach, and layout tools
│   ├── ThemeRenderer.tsx           # Layout engine rendering all 5 portfolio styles and interactions
│   ├── types.ts                    # Core TypeScript definitions (ResumeData, ThemeSettings, Interview types, etc.)
│   ├── parser.ts                   # Text-to-JSON resume parsing heuristics
│   ├── fileParser.ts               # File upload readers (converting PDF/DOCX to plain text)
│   ├── ats.ts                      # ATS scanner, keyword mapping, and cover letter analysis
│   ├── coach.ts                    # AI Coach recommendations engine and action verb dictionary
│   ├── interviewCoach.ts           # Interview Prep engine: role classifier, question banks, study planner, Gemini integration
│   ├── zipExporter.ts              # Code generator writing React/Vite/Tailwind source files into a ZIP
│   ├── wordExporter.ts             # Word Document (.docx) builder
│   ├── ResumeDocumentTemplate.tsx  # Document preview layout optimized for PDF printouts
│   ├── ResumeInteractivePreview.tsx# Live interactive editor preview cards
│   ├── sampleData.ts               # Fallback mock data populated on startup
│   ├── index.css                   # Core Tailwind styling imports and transition rules
│   └── main.tsx                    # React entrypoint
├── public/                         # Static assets
├── index.html                      # HTML container template
├── vite.config.ts                  # Vite compilation configurations
├── tsconfig.json                   # TypeScript setup
├── package.json                    # Dependencies & execution scripts
└── README.md                       # Documentation
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (version 18+ recommended).

### 1. Install Dependencies
In the root directory, install all required packages:
```bash
npm install
```

### 2. Launch Local Development Server
Spin up the local hot-reloading development environment:
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

### 3. Build for Production
Bundle the project into a highly optimized production asset build:
```bash
npm run build
```
Verify the production build locally:
```bash
npm run preview
```

---

## 💡 How the Exporter Works

The **Vite/React/Tailwind ZIP Exporter** (`src/zipExporter.ts`) works by compiling your current resume state and custom configuration settings directly into a standalone React codebase.

1. **Self-Contained Data:** The code generator writes a `data.json` file inside the export containing all your customized text and the Base64 representation of your uploaded profile image.
2. **Modular Components:** It bundles a dedicated copy of the `App.tsx`, `ThemeRenderer.tsx`, `types.ts`, and core styles into the ZIP.
3. **Tailwind CSS 4.0 Integration:** The exported code is set up with Tailwind's Vite compiler, allowing utility styles to compile instantly upon deployment.
4. **No Server Backend Required:** The contact form on the exported website is fully configured to route local inputs, allowing it to work statically.

---

## 🌐 One-Click Deployment Guide

Deploying your exported ZIP archive to the cloud is fast and free.

### Deploying to Vercel (Recommended)
1. Extract the downloaded ZIP file into a folder on your computer.
2. Install the Vercel CLI (`npm install -g vercel`) or push the folder to a **GitHub repository**.
3. If using GitHub:
   * Go to the [Vercel Dashboard](https://vercel.com/) and click **Add New Project**.
   * Import your GitHub repository.
   * Vercel will automatically detect **Vite** and configure the settings. Click **Deploy**.
4. If using Vercel CLI:
   * Open a terminal inside the extracted directory.
   * Run:
     ```bash
     vercel
     ```
   * Follow the prompt questions, and run `vercel --prod` to publish it live!

### Deploying to Netlify
1. Log in to [Netlify](https://www.netlify.com/).
2. Drag and drop your extracted project folder directly into the **Netlify Drop** upload zone.
3. Your portfolio will be live at a public URL within seconds!

---

## 📝 License
This project is licensed under the MIT License - see the LICENSE file for details.
