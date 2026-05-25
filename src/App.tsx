import { useState, useMemo, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  defaultResumeData, 
  defaultThemeSettings 
} from './sampleData';
import { 
  ResumeData, 
  ThemeSettings, 
  ContactMessage, 
  WorkExperience, 
  Project, 
  Skill,
  Education,
  Certificate
} from './types';
import { parseRawResumeText } from './parser';
import { analyzeResume, actionVerbDictionary } from './coach';
import { generateInterviewPlan, scoreAnswer, fetchGeminiInsights, testApiConnection } from './interviewCoach';
import type { AiProvider } from './interviewCoach';
import { InterviewPlan, InterviewRound, AnswerScore, GeminiEnhancedData } from './types';
import { analyzeATSCompliance, analyzeCoverLetter, autoTuneDesign, autoOptimizeResume } from './ats';
import { ThemeRenderer } from './ThemeRenderer';
import { ResumeDocumentTemplate } from './ResumeDocumentTemplate';
import { generatePortfolioZip, getPortfolioFiles } from './zipExporter';
import { generateWordDocument } from './wordExporter';
import { ResumeInteractivePreview } from './ResumeInteractivePreview';
import { extractTextFromFile } from './fileParser';
import { 
  Sparkles, User, Briefcase, Layers, Sliders, MessageSquare, 
  FileCode, Smartphone, Tablet, Laptop, Trash2, Plus, 
  ChevronDown, ChevronUp, Download, 
  FileText, AlertCircle, CheckCircle, Copy, Check, Moon, Sun, X
} from 'lucide-react';

export default function App() {
  // Core states
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings);
  const [appTheme, setAppTheme] = useState<'slate-dark' | 'indigo-midnight' | 'nord-light'>(
    () => (localStorage.getItem('app_theme') as any) || 'slate-dark'
  );
  const [activeTab, setActiveTab] = useState<string>('coach');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [fullscreenPreview, setFullscreenPreview] = useState<boolean>(false);
  const [mobileActiveView, setMobileActiveView] = useState<'editor' | 'preview'>('editor');

  // Sync App Theme to localStorage
  useEffect(() => {
    localStorage.setItem('app_theme', appTheme);
  }, [appTheme]);
  
  // Form & helper states
  const [rawTextImport, setRawTextImport] = useState<string>('');
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [fileErrorMessage, setFileErrorMessage] = useState<string>('');
  const [copiedZip, setCopiedZip] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  // Vercel Deployment states
  const [showVercelModal, setShowVercelModal] = useState<boolean>(false);
  const [vercelToken, setVercelToken] = useState<string>(() => localStorage.getItem('vercel_deploy_token') || '');
  const [vercelProjectName, setVercelProjectName] = useState<string>('');
  const [vercelDeployState, setVercelDeployState] = useState<'idle' | 'preparing' | 'deploying' | 'polling' | 'success' | 'error'>('idle');
  const [vercelDeployUrl, setVercelDeployUrl] = useState<string>('');
  const [vercelError, setVercelError] = useState<string>('');
  const [vercelDeployProgress, setVercelDeployProgress] = useState<string>('');
  const [copiedVercelUrl, setCopiedVercelUrl] = useState<boolean>(false);

  // Mock Inbox state
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([
    {
      id: 'msg-1',
      name: 'Sarah Jenkins',
      email: 's.jenkins@talentagency.com',
      subject: 'Lead Frontend Opportunity - Linear Tech partner',
      message: 'Hi Alex, absolutely loved reading through your portfolio! The Zenith Task Orchestrator case study is spectacular. Let\'s connect for an introductory call next Tuesday at 10 AM PST. - Sarah',
      date: new Date().toLocaleDateString(),
      unread: true
    }
  ]);

  // Accordion expanded items tracker
  const [expandedJobs, setExpandedJobs] = useState<{ [key: string]: boolean }>({ 'exp-1': true });
  const [expandedProjects, setExpandedProjects] = useState<{ [key: string]: boolean }>({ 'proj-1': true });
  const [expandedEdu, setExpandedEdu] = useState<{ [key: string]: boolean }>({});
  const [expandedCert, setExpandedCert] = useState<{ [key: string]: boolean }>({});

  // AI Bullet Improver state
  const [bulletInput, setBulletInput] = useState<string>('');
  const [bulletStyle, setBulletStyle] = useState<'impact' | 'verbs' | 'technical'>('impact');
  const [improvedBullets, setImprovedBullets] = useState<string[]>([]);
  const [copiedBulletIdx, setCopiedBulletIdx] = useState<number | null>(null);

  // ─── Interview Prep Coach states ─────────────────────────────────────────
  const [interviewPlan, setInterviewPlan] = useState<InterviewPlan | null>(null);
  const [interviewJD, setInterviewJD] = useState<string>('');
  const [interviewPositionName, setInterviewPositionName] = useState<string>('');
  const [interviewCompanyName, setInterviewCompanyName] = useState<string>('');
  const [interviewSubTab, setInterviewSubTab] = useState<'overview' | 'questions' | 'study-plan' | 'mock'>('overview');
  const [activeRound, setActiveRound] = useState<InterviewRound>('hr');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  const [mockAnswers, setMockAnswers] = useState<Record<string, string>>({});
  const [mockScores, setMockScores] = useState<Record<string, AnswerScore>>({});
  const [mockQuestionIdx, setMockQuestionIdx] = useState<number>(0);
  const [mockRound, setMockRound] = useState<InterviewRound>('hr');
  const [mockMode, setMockMode] = useState<'idle' | 'answering' | 'reviewed'>('idle');
  const [mockTimerSec, setMockTimerSec] = useState<number>(0);
  const [hintVisible, setHintVisible] = useState<Record<string, boolean>>({});
  const [sampleVisible, setSampleVisible] = useState<Record<string, boolean>>({});
  const mockTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Gemini Google Search Enhancement ────────────────────────────────────
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => localStorage.getItem('gemini-api-key') || '');
  const [geminiData, setGeminiData] = useState<GeminiEnhancedData | null>(null);
  const [isFetchingGemini, setIsFetchingGemini] = useState<boolean>(false);
  const [geminiError, setGeminiError] = useState<string>('');
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(false);
  const [aiProvider, setAiProvider] = useState<AiProvider>(() => (localStorage.getItem('ai_provider') as AiProvider) || 'groq');
  const [connectionTest, setConnectionTest] = useState<{ testing: boolean; result: { ok: boolean; message: string } | null }>({ testing: false, result: null });

  // ─── Voice Recording for Mock Interview ─────────────────────────────────────
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // STAR Guided Answer Builder states
  const [starMode, setStarMode] = useState<boolean>(false);
  const [starSituation, setStarSituation] = useState<string>('');
  const [starTask, setStarTask] = useState<string>('');
  const [starAction, setStarAction] = useState<string>('');
  const [starResult, setStarResult] = useState<string>('');

  // ATS Scanner states
  const [jobDescription, setJobDescription] = useState<string>('');
  const [coachSubTab, setCoachSubTab] = useState<'checklist' | 'ats' | 'cover-letter' | 'linkedin' | 'plaintext'>('checklist');
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [copiedPlaintext, setCopiedPlaintext] = useState<boolean>(false);
  
  // Revised Optimizer states (Premium Jobscan clone features)
  const [revisedResumeData, setRevisedResumeData] = useState<ResumeData | null>(null);
  const [showRevisedPreview, setShowRevisedPreview] = useState<boolean>(false);
  const [highlightChanges, setHighlightChanges] = useState<boolean>(true);
  const [appliedFixes, setAppliedFixes] = useState<string[]>([]);



  // Saved Uploaded Resumes History (Jobscan Pro features clone)
  const [savedResumes, setSavedResumes] = useState<Array<{
    id: string;
    name: string;
    title: string;
    date: string;
    data: ResumeData;
    theme: ThemeSettings;
  }>>(() => {
    try {
      const local = localStorage.getItem('pro_portfolio_saved_resumes');
      if (local) {
        return JSON.parse(local);
      }
    } catch (e) {
      console.error("Failed to read saved resumes:", e);
    }
    return [
      {
        id: 'default-rivera',
        name: defaultResumeData.personal.name,
        title: defaultResumeData.personal.title,
        date: new Date().toLocaleDateString(),
        data: defaultResumeData,
        theme: defaultThemeSettings
      }
    ];
  });

  // Sync Saved Resumes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pro_portfolio_saved_resumes', JSON.stringify(savedResumes));
    } catch (e) {
      console.error("Failed to save resumes:", e);
    }
  }, [savedResumes]);

  // ─── Text-to-Speech (TTS) for questions ─────────────────────────────────────
  const [speakingQId, setSpeakingQId] = useState<string | null>(null);

  const toggleSpeakQuestion = (qId: string, text: string) => {
    if (speakingQId === qId) {
      window.speechSynthesis.cancel();
      setSpeakingQId(null);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setSpeakingQId(null);
      utterance.onerror = () => setSpeakingQId(null);
      
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) ||
                    voices.find(v => v.lang.startsWith('en')) || 
                    voices[0];
      if (voice) {
        utterance.voice = voice;
      }
      
      setSpeakingQId(qId);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    window.speechSynthesis.cancel();
    setSpeakingQId(null);
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [interviewSubTab, mockQuestionIdx, activeTab]);


  // Forms helper states for adding items
  const [newJob, setNewJob] = useState<Partial<WorkExperience>>({
    company: '',
    position: '',
    location: '',
    period: '',
    current: false,
    description: [''],
    technologies: []
  });
  const [newJobTechInput, setNewJobTechInput] = useState<string>('');

  const [newProj, setNewProj] = useState<Partial<Project>>({
    title: '',
    description: '',
    longDescription: '',
    techStack: [],
    link: '',
    github: '',
    category: 'Fullstack',
    featured: true
  });
  const [newProjTechInput, setNewProjTechInput] = useState<string>('');

  const [newSkill, setNewSkill] = useState<{ name: string; level: number; category: Skill['category'] }>({
    name: '',
    level: 80,
    category: 'Frontend'
  });

  const [newEducation, setNewEducation] = useState<Partial<Education>>({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    location: '',
    period: '',
    grade: ''
  });

  const [newCertificate, setNewCertificate] = useState<Partial<Certificate>>({
    name: '',
    issuer: '',
    date: '',
    link: ''
  });

  // Coach analyzer calculation
  const analysis = useMemo(() => analyzeResume(resumeData), [resumeData]);
  
  // ATS Scanner calculation
  const atsAnalysis = useMemo(() => analyzeATSCompliance(resumeData, jobDescription), [resumeData, jobDescription]);

  // Unified data selector for original vs AI-revised preview modes
  const activeData = useMemo(() => {
    return (showRevisedPreview && revisedResumeData) ? revisedResumeData : resumeData;
  }, [showRevisedPreview, revisedResumeData, resumeData]);

  // Revised ATS Score calculation
  const revisedAtsAnalysis = useMemo(() => {
    if (!revisedResumeData) return null;
    return analyzeATSCompliance(revisedResumeData, jobDescription);
  }, [revisedResumeData, jobDescription]);

  // Active ATS Analysis computed dynamically depending on active original/revised preview mode
  const activeAtsAnalysis = useMemo(() => {
    if (showRevisedPreview && revisedAtsAnalysis) {
      return revisedAtsAnalysis;
    }
    return atsAnalysis;
  }, [showRevisedPreview, revisedAtsAnalysis, atsAnalysis]);

  // Revised coach analysis calculation
  const revisedAnalysis = useMemo(() => {
    if (!revisedResumeData) return null;
    return analyzeResume(revisedResumeData);
  }, [revisedResumeData]);

  // Active Coach Analysis computed dynamically depending on active original/revised preview mode
  const activeAnalysis = useMemo(() => {
    if (showRevisedPreview && revisedAnalysis) {
      return revisedAnalysis;
    }
    return analysis;
  }, [showRevisedPreview, revisedAnalysis, analysis]);

  // Cover Letter analysis calculation
  const coverLetterAnalysis = useMemo(() => analyzeCoverLetter(coverLetter, jobDescription), [coverLetter, jobDescription]);
  
  // Unread message count
  const unreadCount = useMemo(() => contactMessages.filter(m => m.unread).length, [contactMessages]);

  // Automatically mark message as read when viewing inbox
  useEffect(() => {
    if (activeTab === 'inbox') {
      setContactMessages(prev => prev.map(m => ({ ...m, unread: false })));
    }
  }, [activeTab]);

  const [uploadedResumeUrl, setUploadedResumeUrl] = useState<string | null>(null);

  // Handle file uploads (.json, .pdf, .docx, .txt)
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    setUploadedFileName(file.name);
    setFileErrorMessage('');
    setIsParsing(true);

    // Create a local URL for the PDF preview
    if (file.type === "application/pdf" || file.name.endsWith('.pdf')) {
      const url = URL.createObjectURL(file);
      setUploadedResumeUrl(url);
    }

    try {
      // First, handle JSON directly if it's a JSON file
      if (file.name.toLowerCase().endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const parsedJSON = JSON.parse(content) as ResumeData;
            if (parsedJSON && parsedJSON.personal) {
              setResumeData(parsedJSON);
              setImportSuccess(true);
              setActiveTab('coach');
              setIsParsing(false);
            }
          } catch (err) {
            setFileErrorMessage('Invalid JSON format.');
            setIsParsing(false);
          }
        };
        reader.readAsText(file);
        return;
      }

      // Extract text using our new utility (supports PDF and Word)
      const content = await extractTextFromFile(file);
      
      if (!content || content.trim().length < 50) {
        setFileErrorMessage('The document appears empty or unreadable. Try copy-pasting the text instead.');
        setIsParsing(false);
        return;
      }

      setRawTextImport(content);
      console.log('Extracted Resume Content:', content);
      const parsedData = parseRawResumeText(content);
      
      const finalData: ResumeData = {
        personal: {
          name: parsedData.personal?.name || '',
          title: parsedData.personal?.title || '',
          subtitle: parsedData.personal?.subtitle || '',
          bio: parsedData.personal?.bio || '',
          avatar: parsedData.personal?.avatar || '',
          email: parsedData.personal?.email || '',
          phone: parsedData.personal?.phone || '',
          location: parsedData.personal?.location || '',
          socials: {
            github: parsedData.personal?.socials?.github,
            linkedin: parsedData.personal?.socials?.linkedin,
            twitter: parsedData.personal?.socials?.twitter,
            email: parsedData.personal?.email ? `mailto:${parsedData.personal.email}` : undefined,
            portfolio: undefined
          }
        },
        experience: parsedData.experience || [],
        skills: parsedData.skills || [],
        education: parsedData.education || [],
        projects: parsedData.projects || [],
        certificates: parsedData.certificates || [],
        testimonials: parsedData.testimonials || []
      };

      setResumeData(finalData);
      const tunedTheme = autoTuneDesign(finalData);
      setThemeSettings(tunedTheme);
      saveResumeToHistory(finalData, tunedTheme);
      setIsParsing(false);
      setImportSuccess(true);
      setFileErrorMessage(`Imported ${finalData.experience.length} roles, ${finalData.skills.length} skills, and ${finalData.projects.length} projects successfully.`);
      setActiveTab('profile');
      setTimeout(() => setFileErrorMessage(''), 6000);
    } catch (err: any) {
      console.error('File parsing error:', err);
      setFileErrorMessage(err.message || 'Parse error. Try copy-pasting the text instead.');
      setIsParsing(false);
    }
  };

  // Handle paste parser trigger
  const handleRawTextParse = () => {
    if (!rawTextImport.trim()) return;
    setIsParsing(true);
    setTimeout(() => {
      const parsedData = parseRawResumeText(rawTextImport);
      
      const finalData: ResumeData = {
        personal: {
          name: parsedData.personal?.name || '',
          title: parsedData.personal?.title || '',
          subtitle: parsedData.personal?.subtitle || '',
          bio: parsedData.personal?.bio || '',
          avatar: parsedData.personal?.avatar || '',
          email: parsedData.personal?.email || '',
          phone: parsedData.personal?.phone || '',
          location: parsedData.personal?.location || '',
          socials: {
            github: parsedData.personal?.socials?.github,
            linkedin: parsedData.personal?.socials?.linkedin,
            twitter: parsedData.personal?.socials?.twitter,
            email: parsedData.personal?.email ? `mailto:${parsedData.personal.email}` : undefined,
            portfolio: undefined
          }
        },
        experience: parsedData.experience || [],
        skills: parsedData.skills || [],
        education: parsedData.education || [],
        projects: parsedData.projects || [],
        certificates: parsedData.certificates || [],
        testimonials: parsedData.testimonials || []
      };

      setResumeData(finalData);

      // Auto-tuning design params
      const tunedTheme = autoTuneDesign(finalData);
      setThemeSettings(tunedTheme);

      // Save into local history list
      saveResumeToHistory(finalData, tunedTheme);

      setIsParsing(false);
      setImportSuccess(true);
      setFileErrorMessage(`Imported ${finalData.experience.length} roles, ${finalData.skills.length} skills, and ${finalData.projects.length} projects successfully.`);

      setActiveTab('profile');
      setTimeout(() => {
        setImportSuccess(false);
        setFileErrorMessage('');
      }, 6000);
    }, 1200);
  };

  // Save current resume state into local history
  const saveResumeToHistory = (data: ResumeData, theme: ThemeSettings) => {
    const newHistoryItem = {
      id: `res-${Date.now()}`,
      name: data.personal.name || 'Professional Candidate',
      title: data.personal.title || 'Senior Software Engineer',
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      data,
      theme
    };

    setSavedResumes(prev => {
      // Check if a copy with the exact same name/title already exists to avoid duplication
      const filtered = prev.filter(item => !(item.name === data.personal.name && item.title === data.personal.title));
      return [newHistoryItem, ...filtered];
    });
  };

  // Load selected resume profile from history
  const loadResumeFromHistory = (id: string) => {
    const selected = savedResumes.find(item => item.id === id);
    if (selected) {
      setResumeData(selected.data);
      setThemeSettings(selected.theme);
    }
  };

  // Delete resume entry from history
  const deleteResumeFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent loading the resume when clicking delete button
    setSavedResumes(prev => prev.filter(item => item.id !== id));
  };

  // Download MS Word document (.docx format) of the active resume (original or revised)
  const handleWordDownload = async (templateOverride?: string) => {
    console.log('handleWordDownload: Exporting active resume to Word (.docx)...');
    try {
      const dataToExport = showRevisedPreview && revisedResumeData ? revisedResumeData : resumeData;
      console.log('handleWordDownload: data to export:', dataToExport);
      if (!dataToExport) {
        throw new Error('No resume data is available to export. Please import or type resume details first.');
      }
      
      // Determine target Word template: direct override, or intelligently map themeSettings.id
      let targetTemplate = 'classic';
      if (templateOverride && typeof templateOverride === 'string') {
        targetTemplate = templateOverride;
      } else if (themeSettings && themeSettings.id) {
        const themeId = themeSettings.id;
        if (themeId === 'classic') targetTemplate = 'classic';
        else if (themeId === 'minimal') targetTemplate = 'minimal';
        else if (themeId === 'creative') targetTemplate = 'creative';
        else if (themeId === 'cyberpunk') targetTemplate = 'stellar';
        else if (themeId === 'gradient') targetTemplate = 'modern';
      }
      
      console.log('handleWordDownload: Using template layout:', targetTemplate);
      const wordBlob = await generateWordDocument(dataToExport, targetTemplate);
      console.log('handleWordDownload: word blob successfully generated:', wordBlob);
      
      const url = URL.createObjectURL(wordBlob);
      const a = document.createElement('a');
      a.href = url;
      
      const nameSegment = dataToExport.personal?.name || 'resume';
      a.download = `${nameSegment.toLowerCase().replace(/\s+/g, '-')}-optimized.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('handleWordDownload: Word export download triggered successfully!');
    } catch (err) {
      console.error('Failed to export DOCX:', err);
      alert(`Failed to export MS Word (.docx) document. Please check your data.\nError: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // High-fidelity PDF generation via Direct Download and Fallback Printer
  const handlePdfPrint = () => {
    setShowPrintModal(true);
  };
  
  const [printTemplate, setPrintTemplate] = useState<string>('classic');
  const [paperSize, setPaperSize] = useState<'letter' | 'a4'>('letter');
  const [spacingDensity, setSpacingDensity] = useState<'normal' | 'compact' | 'tight'>('normal');
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // Dynamic Page-Fit Auto-scaling for Perfect Single-Page Export
  const [autoFitToPage, setAutoFitToPage] = useState<boolean>(true);
  const [printScaleFactor, setPrintScaleFactor] = useState<number>(1);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const calculatePageFitScale = () => {
    const container = previewContainerRef.current;
    if (!container) return;

    if (!autoFitToPage) {
      setPrintScaleFactor(1);
      return;
    }

    const firstChild = container.firstElementChild as HTMLElement;
    if (!firstChild) return;

    // Save current styling to restore after measurement
    const prevWidth = firstChild.style.width;
    const prevHeight = firstChild.style.height;
    const prevMinHeight = firstChild.style.minHeight;
    const prevTransform = firstChild.style.transform;

    // Reset styles to natural unscaled dimensions for measurement
    firstChild.style.width = '100%';
    firstChild.style.height = 'auto';
    firstChild.style.minHeight = 'auto';
    firstChild.style.transform = 'none';

    // Force layout reflow and measure the natural height of the template contents
    const naturalHeight = firstChild.scrollHeight;

    // Restore original styles
    firstChild.style.width = prevWidth;
    firstChild.style.height = prevHeight;
    firstChild.style.minHeight = prevMinHeight;
    firstChild.style.transform = prevTransform;

    // Measure boundaries against net available height to prevent bottom padding clipping
    // Letter: 1056px, A4: 1123px. Classic layouts have 0.5in top + 0.5in bottom padding (1in = 96px total)
    const targetHeight = paperSize === 'letter' ? 1056 : 1123;
    const paddingInches = (printTemplate === 'creative' || printTemplate === 'stellar') ? 0 : 1.0;
    const paddingPx = paddingInches * 96;
    const availableHeight = targetHeight - paddingPx;
    
    if (naturalHeight > availableHeight) {
      const ratio = (availableHeight / naturalHeight) * 0.98;
      const safeRatio = Math.max(0.5, ratio);
      setPrintScaleFactor(safeRatio);
    } else {
      setPrintScaleFactor(1);
    }
  };

  const triggerPdfPrint = async () => {
    try {
      setIsGeneratingPdf(true);
      const element = document.getElementById('pdf-render-target');
      if (!element) {
        throw new Error('PDF render target element was not found in active document body');
      }

      // Allow DOM scheduler buffer to stabilize
      await new Promise(resolve => setTimeout(resolve, 200));

      const canvas = await html2canvas(element, {
        scale: 2.5, // Ultra-sharp 2.5x retina-density resolution
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: printTemplate === 'stellar' ? '#020617' : '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: paperSize === 'letter' ? 'letter' : 'a4'
      });

      const pdfWidth = paperSize === 'letter' ? 8.5 : 8.27; // 210mm = ~8.27in
      const pdfHeight = paperSize === 'letter' ? 11 : 11.69; // 297mm = ~11.69in

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${resumeData.personal.name.toLowerCase().replace(/\s+/g, '-')}-resume.pdf`);
    } catch (err) {
      console.error('Direct high-fidelity PDF capture failed, falling back to native browser engine:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  useEffect(() => {
    if (showPrintModal) {
      const timer = setTimeout(() => {
        calculatePageFitScale();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [showPrintModal, autoFitToPage, printTemplate, paperSize, spacingDensity, activeData]);

  // Auto-Fix & Optimize ATS Score (Jobscan Pro Auto-optimizer)
  const [showOptimizerModal, setShowOptimizerModal] = useState<boolean>(false);

  const triggerAIOptimization = () => {
    if (!jobDescription.trim()) {
      alert("⚠️ Please paste a target Job Description in the input box first, so we can analyze and optimize your resume keywords to match it.");
      return;
    }
    const { revisedData, fixes } = autoOptimizeResume(resumeData, jobDescription);
    if (fixes.length === 0) {
      alert("ℹ️ Your resume is already fully optimized for this Job Description! No missing keywords or weak action verbs were detected.");
      return;
    }
    setRevisedResumeData(revisedData);
    setAppliedFixes(fixes);
    setShowOptimizerModal(true);
    // Automatically set the preview to the revised version so they see the result immediately
    setShowRevisedPreview(true);
  };

  const applyRevisedData = () => {
    if (revisedResumeData) {
      setResumeData(revisedResumeData);
      setRevisedResumeData(null);
      setShowRevisedPreview(false);
      setAppliedFixes([]);
      setShowOptimizerModal(false);
      
      // Preserve user theme settings, only update content
    }
  };

  const discardRevisedData = () => {
    setRevisedResumeData(null);
    setAppliedFixes([]);
    setShowOptimizerModal(false);
    setShowRevisedPreview(false);
  };

  const closeOptimizerModal = () => {
    setShowOptimizerModal(false);
  };

  // ZIP Export Trigger for complete local development packages
  const handleZipDownload = async () => {
    try {
      setIsZipping(true);
      const zipBlob = await generatePortfolioZip(resumeData, themeSettings);
      
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resumeData.personal.name.toLowerCase().replace(/\s+/g, '-')}-portfolio.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setCopiedZip(true);
      setTimeout(() => setCopiedZip(false), 2500);
    } catch (error) {
      console.error("ZIP packaging failed:", error);
    } finally {
      setIsZipping(false);
    }
  };

  // Initialize vercel project name based on resume personal name
  useEffect(() => {
    if (resumeData?.personal?.name && !vercelProjectName) {
      setVercelProjectName(
        resumeData.personal.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );
    }
  }, [resumeData?.personal?.name]);

  // Vercel deployment handler
  const handleVercelDeploy = async () => {
    if (!vercelToken.trim()) {
      setVercelError('Vercel Personal Access Token is required.');
      setVercelDeployState('error');
      return;
    }
    if (!vercelProjectName.trim()) {
      setVercelError('Project Name is required.');
      setVercelDeployState('error');
      return;
    }

    // Save token to localStorage for convenience
    localStorage.setItem('vercel_deploy_token', vercelToken.trim());

    setVercelDeployState('preparing');
    setVercelDeployProgress('Compiling your premium portfolio code files...');
    setVercelError('');

    try {
      // 1. Structural collection of all portfolio project files
      const portfolioFiles = getPortfolioFiles(resumeData, themeSettings);
      const vercelFiles = portfolioFiles.map(f => ({
        file: f.file,
        data: f.data,
        encoding: 'utf-8'
      }));

      setVercelDeployState('deploying');
      setVercelDeployProgress('Uploading files and creating deployment on Vercel...');

      // 2. POST deployment request to Vercel Deployments endpoint
      const response = await fetch('https://api.vercel.com/v13/deployments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vercelToken.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: vercelProjectName.trim(),
          projectSettings: {
            framework: 'vite'
          },
          files: vercelFiles
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `Vercel API returned status code ${response.status}`);
      }

      const deployData = await response.json();
      const deploymentId = deployData.id;
      const hostUrl = deployData.url;

      setVercelDeployState('polling');
      setVercelDeployProgress('Vercel is building your portfolio. Polling build logs...');

      // 3. Status Polling Loop every 3 seconds
      const pollInterval = setInterval(async () => {
        try {
          const pollResponse = await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}`, {
            headers: {
              'Authorization': `Bearer ${vercelToken.trim()}`
            }
          });

          if (!pollResponse.ok) return;

          const pollData = await pollResponse.json();
          const currentStatus = pollData.status;

          if (currentStatus === 'READY') {
            clearInterval(pollInterval);
            setVercelDeployUrl(`https://${hostUrl}`);
            setVercelDeployState('success');
          } else if (currentStatus === 'ERROR' || currentStatus === 'CANCELED') {
            clearInterval(pollInterval);
            setVercelError(`Vercel build pipeline failed with status: ${currentStatus}`);
            setVercelDeployState('error');
          } else {
            setVercelDeployProgress(`Vercel build pipeline status: ${currentStatus.toLowerCase()}...`);
          }
        } catch (pollErr) {
          console.error("Error polling deployment status:", pollErr);
        }
      }, 3000);

      // Timeout safety net: 4 minutes max build polling time
      setTimeout(() => {
        clearInterval(pollInterval);
        setVercelDeployState(prev => {
          if (prev === 'polling') {
            setVercelError('Deployment polling timeout. Please check your Vercel Dashboard directly.');
            return 'error';
          }
          return prev;
        });
      }, 240000);

    } catch (err: any) {
      console.error("Vercel deployment failed:", err);
      setVercelError(err.message || 'An unexpected error occurred during Vercel deployment.');
      setVercelDeployState('error');
    }
  };

  // Live Contact Form Submission in Preview
  const handleMockContactSubmit = (name: string, email: string, subject: string, message: string): boolean => {
    const newMsg: ContactMessage = {
      id: `msg-${Date.now()}`,
      name,
      email,
      subject,
      message,
      date: new Date().toLocaleDateString(),
      unread: true
    };
    setContactMessages(prev => [newMsg, ...prev]);
    return true;
  };

  // AI Bullet Improver Action
  const handleImproveBullet = () => {
    if (!bulletInput.trim()) return;
    
    // Find a standard preset match or generate dynamic variants
    const preset = actionVerbDictionary.find(item => 
      bulletInput.toLowerCase().includes(item.original.toLowerCase()) || 
      item.original.toLowerCase().includes(bulletInput.toLowerCase())
    );

    if (preset) {
      setImprovedBullets(preset.polished);
    } else {
      // Smart rule-based heuristic translations
      const verbs = {
        impact: [
          `Spearheaded workflow optimization initiatives, boosting operational velocity by 35% and saving 8 resource hours weekly.`,
          `Designed and automated transactional pipelines, reducing visual execution latencies by 40% on peak loads.`,
          `Transformed key system sub-routines to support high concurrency, cleanly handling 15,000+ concurrent requests.`
        ],
        verbs: [
          `Optimized core data structures and indexing paths, slashing dashboard response speeds from 3s down to 400ms.`,
          `Architected modular React widgets utilizing Tailwind and accessible primitives, improving code reusability by 50%.`,
          `Coordinated cross-functional squads to ship robust backend APIs, accelerating engineering delivery by 3 weeks.`
        ],
        technical: [
          `Engineered robust TypeScript models and automated Jest testing pipelines, expanding codebase test coverage to 95%.`,
          `Deployed serverless caching engines utilizing Redis pub/sub, reducing SQL database call bottlenecks by 60%.`,
          `Integrated automated GitHub Actions CI/CD processes, cutting QA environment deployment cycles from 2 hours to 5 minutes.`
        ]
      };

      setImprovedBullets(verbs[bulletStyle]);
    }
  };

  // Download file function so users can use source code directly in any IDE (e.g. VS Code)
  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy to clipboard helpers + direct file download
  const copyToClipboard = (text: string, type: 'code' | 'bullet', idx?: number) => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'code') {
        setCopiedCode(true);
        // Download as Portfolio.tsx directly in browser for easy VS Code / IDE usage!
        downloadFile(text, 'Portfolio.tsx', 'text/plain');
        setTimeout(() => setCopiedCode(false), 2000);
      } else if (type === 'bullet' && idx !== undefined) {
        setCopiedBulletIdx(idx);
        setTimeout(() => setCopiedBulletIdx(null), 2000);
      }
    });
  };

  // Generate Full React Component Code for Download
  const getExportCode = () => {
    return `import React, { useState, useMemo } from 'react';
// Standalone Interactive Portfolio Website code generated by ProPortfolio Builder
// Copy this code directly into a single React file in your project!
// You will need lucide-react icons installed: npm install lucide-react

export default function Portfolio() {
  const [projectCategory, setProjectCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeExperience, setActiveExperience] = useState('${resumeData.experience[0]?.id || ""}');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const resumeData = ${JSON.stringify(resumeData, null, 2)};
  const theme = ${JSON.stringify(themeSettings, null, 2)};

  // Theme mapping colors
  const colors = {
    violet: { text: 'text-violet-600', bg: 'bg-violet-600', badge: 'bg-violet-50 text-violet-700 border-violet-100', ring: 'ring-violet-500' },
    emerald: { text: 'text-emerald-600', bg: 'bg-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', ring: 'ring-emerald-500' },
    blue: { text: 'text-blue-600', bg: 'bg-blue-600', badge: 'bg-blue-50 text-blue-700 border-blue-100', ring: 'ring-blue-500' },
    amber: { text: 'text-amber-600', bg: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-100', ring: 'ring-amber-500' },
    rose: { text: 'text-rose-600', bg: 'bg-rose-500', badge: 'bg-rose-50 text-rose-700 border-rose-100', ring: 'ring-rose-500' },
    slate: { text: 'text-slate-700', bg: 'bg-slate-800', badge: 'bg-slate-100 text-slate-800 border-slate-200', ring: 'ring-slate-500' }
  }[theme.primaryColor] || { text: 'text-violet-600', bg: 'bg-violet-600', badge: 'bg-violet-50 text-violet-700 border-violet-100', ring: 'ring-violet-500' };

  const categories = ['All', ...Array.from(new Set(resumeData.projects.map(p => p.category)))];
  const filteredProjects = projectCategory === 'All' ? resumeData.projects : resumeData.projects.filter(p => p.category === projectCategory);

  return (
    <div className={\`min-h-screen flex flex-col \${theme.darkMode ? 'bg-slate-950 text-slate-200' : 'bg-white text-slate-800'}\`}>
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md border-b bg-white/80 border-slate-100 dark:bg-slate-950/80 dark:border-slate-900">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-lg">{resumeData.personal.name}</span>
          <nav className="hidden md:flex gap-6 text-sm">
            <a href="#experience">Experience</a>
            <a href="#projects">Projects</a>
            <a href="#skills">Skills</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-6 text-center relative overflow-hidden">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4">{resumeData.personal.name}</h1>
        <p className={\`text-lg font-semibold \${colors.text} mb-4\`}>{resumeData.personal.title}</p>
        <p className="text-slate-500 max-w-2xl mx-auto">{resumeData.personal.bio}</p>
      </section>

      {/* Main Experience Block */}
      <section id="experience" className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-6">Work History</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2 border-l border-slate-100">
            {resumeData.experience.map(exp => (
              <button 
                key={exp.id} 
                onClick={() => setActiveExperience(exp.id)}
                className={\`w-full text-left px-4 py-2 border-l-2 \${activeExperience === exp.id ? colors.text + ' border-current font-semibold' : 'border-transparent text-slate-400'}\`}
              >
                {exp.company} ({exp.period})
              </button>
            ))}
          </div>
          <div className="md:col-span-2">
            {resumeData.experience.map(exp => exp.id === activeExperience && (
              <div key={exp.id} className="space-y-4">
                <h3 className="text-xl font-bold">{exp.position} @ {exp.company}</h3>
                <ul className="space-y-2 text-slate-500 pl-5 list-disc">
                  {exp.description.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-6">Featured Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map(proj => (
            <div key={proj.id} className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold mb-2">{proj.title}</h3>
              <p className="text-sm text-slate-500 mb-4">{proj.description}</p>
              <div className="flex flex-wrap gap-2">
                {proj.techStack.map((tech, idx) => (
                  <span key={idx} className={\`text-xs px-2.5 py-1 rounded-full \${colors.badge}\`}>{tech}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t text-center text-slate-400 text-xs">
        <p>© {new Date().getFullYear()} {resumeData.personal.name}. Generated via ProPortfolio.</p>
      </footer>
    </div>
  );
}
`;
  };

  // Form state updates helpers
  const handlePersonalChange = (field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value
      }
    }));
  };

  const handleSocialChange = (field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        socials: {
          ...prev.personal.socials,
          [field]: value
        }
      }
    }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        handlePersonalChange('avatar', result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    const initials = resumeData.personal.name
      ? resumeData.personal.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
      : 'AR';
    handlePersonalChange('avatar', initials || 'AR');
  };

  // Experience mutators
  const handleJobChange = (id: string, field: keyof WorkExperience, value: any) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const handleBulletChange = (jobId: string, bulletIdx: number, text: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => {
        if (exp.id !== jobId) return exp;
        const newDesc = [...exp.description];
        newDesc[bulletIdx] = text;
        return { ...exp, description: newDesc };
      })
    }));
  };

  const handleAddBullet = (jobId: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => {
        if (exp.id !== jobId) return exp;
        return { ...exp, description: [...exp.description, ''] };
      })
    }));
  };

  const handleRemoveBullet = (jobId: string, bulletIdx: number) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => {
        if (exp.id !== jobId) return exp;
        const newDesc = exp.description.filter((_, idx) => idx !== bulletIdx);
        return { ...exp, description: newDesc };
      })
    }));
  };

  const handleRemoveJob = (jobId: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== jobId)
    }));
  };

  const handleAddJob = () => {
    if (!newJob.company || !newJob.position) return;
    
    const item: WorkExperience = {
      id: `exp-${Date.now()}`,
      company: newJob.company,
      position: newJob.position,
      location: newJob.location || 'Remote',
      period: newJob.period || '2024 - Present',
      current: newJob.current || false,
      description: newJob.description?.filter(Boolean) || ['Coordinated development activities'],
      technologies: newJobTechInput ? newJobTechInput.split(',').map(t => t.trim()).filter(Boolean) : []
    };

    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, item]
    }));

    // Reset
    setNewJob({
      company: '',
      position: '',
      location: '',
      period: '',
      current: false,
      description: [''],
      technologies: []
    });
    setNewJobTechInput('');
  };

  // Projects mutators
  const handleProjChange = (id: string, field: keyof Project, value: any) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      )
    }));
  };

  const handleProjTechChange = (id: string, techString: string) => {
    const tags = techString.split(',').map(t => t.trim()).filter(Boolean);
    handleProjChange(id, 'techStack', tags);
  };

  const handleAddProj = () => {
    if (!newProj.title || !newProj.description) return;

    const item: Project = {
      id: `proj-${Date.now()}`,
      title: newProj.title,
      description: newProj.description,
      longDescription: newProj.longDescription || newProj.description,
      techStack: newProjTechInput ? newProjTechInput.split(',').map(t => t.trim()).filter(Boolean) : [],
      link: newProj.link,
      github: newProj.github,
      category: newProj.category || 'Fullstack',
      featured: newProj.featured || true
    };

    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, item]
    }));

    // Reset
    setNewProj({
      title: '',
      description: '',
      longDescription: '',
      techStack: [],
      link: '',
      github: '',
      category: 'Fullstack',
      featured: true
    });
    setNewProjTechInput('');
  };

  const handleRemoveProj = (projId: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== projId)
    }));
  };

  // Skills mutators
  const handleSkillLevelChange = (skillName: string, level: number) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.map(s => s.name === skillName ? { ...s, level } : s)
    }));
  };

  const handleRemoveSkill = (skillName: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.name !== skillName)
    }));
  };

  const handleAddSkill = () => {
    if (!newSkill.name.trim()) return;
    
    const skillItem: Skill = {
      name: newSkill.name.trim(),
      level: newSkill.level,
      category: newSkill.category
    };

    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, skillItem]
    }));

    setNewSkill({ name: '', level: 80, category: 'Frontend' });
  };

  // Education mutators
  const handleEduChange = (id: string, field: keyof Education, value: any) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const handleRemoveEdu = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const handleAddEdu = () => {
    if (!newEducation.institution || !newEducation.degree) return;
    
    const item: Education = {
      id: `edu-${Date.now()}`,
      institution: newEducation.institution,
      degree: newEducation.degree,
      fieldOfStudy: newEducation.fieldOfStudy || '',
      location: newEducation.location || '',
      period: newEducation.period || '',
      grade: newEducation.grade || ''
    };

    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, item]
    }));

    setNewEducation({
      institution: '',
      degree: '',
      fieldOfStudy: '',
      location: '',
      period: '',
      grade: ''
    });
  };

  // Certificates mutators
  const handleCertChange = (id: string, field: keyof Certificate, value: any) => {
    setResumeData(prev => ({
      ...prev,
      certificates: prev.certificates.map(cert => 
        cert.id === id ? { ...cert, [field]: value } : cert
      )
    }));
  };

  const handleRemoveCert = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      certificates: prev.certificates.filter(cert => cert.id !== id)
    }));
  };

  const handleAddCert = () => {
    if (!newCertificate.name || !newCertificate.issuer) return;
    
    const item: Certificate = {
      id: `cert-${Date.now()}`,
      name: newCertificate.name,
      issuer: newCertificate.issuer,
      date: newCertificate.date || '',
      link: newCertificate.link || ''
    };

    setResumeData(prev => ({
      ...prev,
      certificates: [...prev.certificates, item]
    }));

    setNewCertificate({
      name: '',
      issuer: '',
      date: '',
      link: ''
    });
  };

  return (
    <div id="app-root-container" className={`flex flex-col h-screen bg-slate-900 text-slate-100 select-none font-sans antialiased overflow-hidden theme-${appTheme}`}>
      
      {/* TOP HEADER */}
      <header className="flex flex-shrink-0 items-center justify-between px-4 sm:px-6 h-16 bg-slate-950 border-b border-slate-800 relative z-40">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="ProPortfolio Logo" className="h-9 w-9 rounded-xl shadow border border-slate-850 object-cover shrink-0" />
          <div>
            <h1 className="text-xs sm:text-sm font-bold tracking-tight text-white">ProPortfolio Builder</h1>
            <p className="text-[10px] text-slate-500 font-medium hidden md:block">Dynamic Interactive Resume & Optimizer</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* App Theme Selector Dropdown */}
          <div className="relative group">
            <button
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                appTheme === 'nord-light'
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-250 text-slate-700 hover:text-slate-955'
                  : appTheme === 'indigo-midnight'
                    ? 'bg-[#0c0920] hover:bg-[#17123d] border-[#2b1f63] text-indigo-200 hover:text-white'
                    : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {appTheme === 'nord-light' ? (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              ) : appTheme === 'indigo-midnight' ? (
                <Sparkles className="w-3.5 h-3.5 text-indigo-405 animate-pulse" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
              )}
              <span>
                <span className="hidden sm:inline">Theme: </span>
                {appTheme === 'slate-dark' ? 'Slate' : appTheme === 'indigo-midnight' ? 'Indigo' : 'Nord'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-500 group-hover:text-slate-355" />
            </button>
            <div
              className={`absolute right-0 mt-1 w-40 rounded-xl border p-1 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 ${
                appTheme === 'nord-light'
                  ? 'bg-white border-slate-200 shadow-slate-200/50'
                  : appTheme === 'indigo-midnight'
                    ? 'bg-[#0e0a26] border-[#2b1f63] shadow-indigo-950/30'
                    : 'bg-slate-950 border-slate-800 shadow-black/40'
              }`}
            >
              <button
                type="button"
                onClick={() => setAppTheme('slate-dark')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  appTheme === 'slate-dark'
                    ? 'bg-indigo-650 text-white'
                    : appTheme === 'nord-light'
                      ? 'text-slate-650 hover:bg-slate-100 hover:text-slate-900'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                Slate Dark
              </button>
              <button
                type="button"
                onClick={() => setAppTheme('indigo-midnight')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  appTheme === 'indigo-midnight'
                    ? 'bg-indigo-650 text-white'
                    : appTheme === 'nord-light'
                      ? 'text-slate-650 hover:bg-slate-100 hover:text-slate-900'
                      : 'text-slate-400 hover:bg-slate-900/60 hover:text-white'
                }`}
              >
                Indigo Midnight
              </button>
              <button
                type="button"
                onClick={() => setAppTheme('nord-light')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  appTheme === 'nord-light'
                    ? 'bg-indigo-650 text-white'
                    : 'text-slate-400 hover:bg-slate-900/60 hover:text-white'
                }`}
              >
                Nord Light
              </button>
            </div>
          </div>

          {/* Mobile Actions Dropdown */}
          <div className="relative group lg:hidden">
            <button
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                appTheme === 'nord-light'
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-250 text-slate-700 hover:text-slate-955 shadow-sm'
                  : appTheme === 'indigo-midnight'
                    ? 'bg-[#0c0920] hover:bg-[#17123d] border-[#2b1f63] text-indigo-200 hover:text-white'
                    : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Actions</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>
            <div
              className={`absolute right-0 mt-1 w-56 rounded-xl border p-1.5 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col gap-1 ${
                appTheme === 'nord-light'
                  ? 'bg-white border-slate-200 shadow-slate-200/50'
                  : appTheme === 'indigo-midnight'
                    ? 'bg-[#0e0a26] border-[#2b1f63] shadow-indigo-950/30'
                    : 'bg-slate-950 border-slate-800 shadow-black/40'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setVercelDeployState('idle');
                  setVercelError('');
                  setShowVercelModal(true);
                }}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                  appTheme === 'nord-light'
                    ? 'text-slate-700 hover:bg-slate-100'
                    : appTheme === 'indigo-midnight'
                      ? 'text-indigo-250 hover:bg-indigo-950/40'
                      : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <svg className="w-3.5 h-3.5 fill-current text-white bg-black rounded p-0.5" viewBox="0 0 512 512">
                  <path d="M256,48,496,464H16Z"/>
                </svg>
                <span>One-Click Deploy</span>
              </button>
              
              <button
                type="button"
                onClick={handleZipDownload}
                disabled={isZipping}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                  appTheme === 'nord-light'
                    ? 'text-slate-700 hover:bg-slate-100'
                    : appTheme === 'indigo-midnight'
                      ? 'text-indigo-250 hover:bg-indigo-950/40'
                      : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isZipping ? 'Creating ZIP...' : 'Download Project (.zip)'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleWordDownload()}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                  appTheme === 'nord-light'
                    ? 'text-slate-700 hover:bg-slate-100'
                    : appTheme === 'indigo-midnight'
                      ? 'text-indigo-250 hover:bg-indigo-950/40'
                      : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Download Word (.doc)</span>
              </button>

              <button
                type="button"
                onClick={handlePdfPrint}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                  appTheme === 'nord-light'
                    ? 'text-slate-700 hover:bg-slate-100'
                    : appTheme === 'indigo-midnight'
                      ? 'text-indigo-250 hover:bg-indigo-950/40'
                      : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export PDF/Document</span>
              </button>

              <button
                type="button"
                onClick={() => copyToClipboard(getExportCode(), 'code')}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                  appTheme === 'nord-light'
                    ? 'text-slate-700 hover:bg-slate-100'
                    : appTheme === 'indigo-midnight'
                      ? 'text-indigo-250 hover:bg-indigo-950/40'
                      : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                <span>React Code</span>
              </button>
            </div>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setFullscreenPreview(!fullscreenPreview)}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              fullscreenPreview
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                : appTheme === 'nord-light'
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-955 shadow-sm'
                  : appTheme === 'indigo-midnight'
                    ? 'bg-[#0c0920] hover:bg-[#17123d] border-[#2b1f63] text-indigo-300 hover:text-white'
                    : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>{fullscreenPreview ? 'Exit Fullscreen' : 'Fullscreen Preview'}</span>
          </button>

          {/* Vercel One-Click Deploy Option */}
          <button
            onClick={() => {
              setVercelDeployState('idle');
              setVercelError('');
              setShowVercelModal(true);
            }}
            className="hidden lg:flex items-center gap-1.5 bg-black hover:bg-slate-955 border border-slate-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer shadow-lg hover:border-slate-700 hover:shadow-indigo-500/10"
            title="Deploy your interactive portfolio directly to Vercel in one click!"
          >
            <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 512 512">
              <path d="M256,48,496,464H16Z"/>
            </svg>
            <span>One-Click Deploy</span>
          </button>

          {/* Export options */}
          <button
            onClick={handleZipDownload}
            disabled={isZipping}
            className="hidden lg:flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-750 hover:to-violet-750 text-white px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-colors shadow-md cursor-pointer disabled:opacity-50"
            title="Downloads a complete ready-to-run React + Vite + Tailwind project as a zip archive"
          >
            {copiedZip ? <Check className="w-3.5 h-3.5 text-emerald-300 animate-pulse" /> : <Download className="w-3.5 h-3.5" />}
            <span>{isZipping ? 'Creating ZIP...' : (copiedZip ? 'Downloaded ZIP!' : 'Download Project (.zip)')}</span>
          </button>

          <button
            onClick={() => handleWordDownload()}
            className={`hidden lg:flex items-center gap-1.5 border px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              appTheme === 'nord-light'
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-955'
                : appTheme === 'indigo-midnight'
                  ? 'bg-[#0c0920] hover:bg-[#17123d] border-[#2b1f63] text-indigo-250 hover:text-white'
                  : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-200'
            }`}
            title="Downloads resume document formatted for Microsoft Word (.doc)"
          >
            <FileText className={`w-3.5 h-3.5 ${appTheme === 'nord-light' ? 'text-indigo-600' : 'text-indigo-400'}`} />
            <span>Download Word (.doc)</span>
          </button>

          <button
            onClick={handlePdfPrint}
            className={`hidden lg:flex items-center gap-1.5 border px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              appTheme === 'nord-light'
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-955'
                : appTheme === 'indigo-midnight'
                  ? 'bg-[#0c0920] hover:bg-[#17123d] border-[#2b1f63] text-indigo-250 hover:text-white'
                  : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-200'
            }`}
            title="Open Document Export Preview"
          >
            <Download className={`w-3.5 h-3.5 ${appTheme === 'nord-light' ? 'text-emerald-600' : 'text-emerald-400'}`} />
            <span>Export Document...</span>
          </button>

          <button
            onClick={() => copyToClipboard(getExportCode(), 'code')}
            className={`hidden lg:flex items-center gap-1.5 border px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              appTheme === 'nord-light'
                ? 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-755 hover:text-indigo-900'
                : appTheme === 'indigo-midnight'
                  ? 'bg-indigo-950/40 hover:bg-indigo-900/40 border-indigo-855 text-slate-350 hover:text-slate-100'
                  : 'bg-indigo-950 hover:bg-indigo-900 border-indigo-800 text-slate-300'
            }`}
            title="Downloads standalone React source code locally as Portfolio.tsx"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileCode className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copied!' : 'React Code'}</span>
          </button>
        </div>
      </header>

      {/* WORKSPACE */}
      <div className="flex flex-grow overflow-hidden">
        
        {/* LEFT PANEL: BUILDER CONTROLS */}
        {!fullscreenPreview && (
          <div className={`w-[520px] flex-shrink-0 bg-slate-900/80 border-r border-slate-800 flex flex-col overflow-hidden ${
            mobileActiveView === 'editor' ? 'flex' : 'hidden lg:flex'
          }`}>
            {/* TAB SELECTOR NAVBAR */}
            <div className="flex flex-nowrap lg:flex-wrap border-b border-slate-800 overflow-x-auto lg:overflow-x-visible scrollbar-none bg-slate-955/30 text-[10px] sm:text-xs font-semibold">
              <button 
                onClick={() => setActiveTab('coach')} 
                className={`flex-grow shrink-0 px-2 py-3.5 text-center border-b-2 transition-all whitespace-nowrap flex items-center justify-center gap-1 ${
                  activeTab === 'coach' 
                    ? 'border-indigo-500 text-indigo-400' 
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>AI Coach</span>
              </button>
              <button 
                onClick={() => setActiveTab('import')} 
                className={`flex-grow shrink-0 px-2 py-3.5 text-center border-b-2 transition-all whitespace-nowrap flex items-center justify-center gap-1 ${
                  activeTab === 'import' 
                    ? 'border-indigo-500 text-indigo-400' 
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>Import</span>
              </button>
              <button 
                onClick={() => setActiveTab('profile')} 
                className={`flex-grow shrink-0 px-2 py-3.5 text-center border-b-2 transition-all whitespace-nowrap flex items-center justify-center gap-1 ${
                  activeTab === 'profile' 
                    ? 'border-indigo-500 text-indigo-400' 
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <User className="w-3 h-3" />
                <span>Profile</span>
              </button>
              <button 
                onClick={() => setActiveTab('experience')} 
                className={`flex-grow shrink-0 px-2 py-3.5 text-center border-b-2 transition-all whitespace-nowrap flex items-center justify-center gap-1 ${
                  activeTab === 'experience' 
                    ? 'border-indigo-500 text-indigo-400' 
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <Briefcase className="w-3 h-3" />
                <span>Jobs</span>
              </button>
              <button 
                onClick={() => setActiveTab('projects')} 
                className={`flex-grow shrink-0 px-2 py-3.5 text-center border-b-2 transition-all whitespace-nowrap flex items-center justify-center gap-1 ${
                  activeTab === 'projects' 
                    ? 'border-indigo-500 text-indigo-400' 
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Work</span>
              </button>
              <button 
                onClick={() => setActiveTab('design')} 
                className={`flex-grow shrink-0 px-2 py-3.5 text-center border-b-2 transition-all whitespace-nowrap flex items-center justify-center gap-1 ${
                  activeTab === 'design' 
                    ? 'border-indigo-500 text-indigo-400' 
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <Sliders className="w-3 h-3" />
                <span>Design</span>
              </button>
              <button 
                onClick={() => setActiveTab('inbox')} 
                className={`flex-grow shrink-0 px-2 py-3.5 text-center border-b-2 transition-all whitespace-nowrap flex items-center justify-center gap-1 relative ${
                  activeTab === 'inbox' 
                    ? 'border-indigo-500 text-indigo-400' 
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <MessageSquare className="w-3 h-3" />
                <span>Inbox</span>
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-1.5 bg-rose-500 text-white text-[8px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('interview')} 
                className={`flex-grow shrink-0 px-2 py-3.5 text-center border-b-2 transition-all whitespace-nowrap flex items-center justify-center gap-1 ${
                  activeTab === 'interview' 
                    ? 'border-violet-500 text-violet-400' 
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <span className="text-[11px]">🎯</span>
                <span>Interview</span>
              </button>
            </div>

            {/* TAB CONTENT PANEL CONTAINER */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-thin">
              
              {/* TAB 1: QUICK IMPORT */}
              {activeTab === 'import' && (
                <div className="space-y-5 animate-fadeIn">
                  <div>
                    <h2 className="text-base font-bold text-white">Upload & Auto-Build Magic</h2>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Upload your resume document or paste standard plain text. Jobscan Pro parsing algorithms will extract details to generate your layout instantly.
                    </p>
                  </div>

                  {importSuccess && (
                    <div className="flex items-center gap-2 bg-emerald-900/30 border border-emerald-800 rounded-xl p-3 text-xs text-emerald-400 animate-fadeIn">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      <span>File parsed successfully! Your portfolio template is updated and live.</span>
                    </div>
                  )}

                  {fileErrorMessage && (
                    <div className="flex items-center gap-2 bg-rose-900/30 border border-rose-800 rounded-xl p-3 text-xs text-rose-400 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{fileErrorMessage}</span>
                    </div>
                  )}

                  {/* Pro Tip Alert Banner for PDF/Word files */}
                  <div className="p-4 bg-indigo-950/40 border border-indigo-850 rounded-2xl text-xs space-y-2 text-left animate-fadeIn">
                    <h4 className="font-bold text-indigo-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                      <span>💡 High-Fidelity Document Parsing Enabled</span>
                    </h4>
                    <p className="text-[11px] text-slate-350 leading-relaxed">
                      We've integrated <b>PDF.js</b> and <b>Mammoth</b> to extract clean text directly from your documents. You can now:
                    </p>
                    <ol className="list-decimal pl-5 text-[11px] text-slate-400 space-y-1.5 leading-relaxed">
                      <li>Upload your <b>PDF</b> or <b>Word (.docx)</b> resume directly.</li>
                      <li>Our internal engine will extract your experience, skills, and education automatically.</li>
                      <li>If a document has a complex layout, the <b>Paste plain text</b> box below remains the perfect fail-safe.</li>
                    </ol>
                  </div>

                  {/* Premium Drag & Drop File Upload Zone */}
                  <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/60 rounded-xl p-5 bg-slate-950/30 text-center transition-all">
                    <div className="space-y-2.5">
                      <div className="w-10 h-10 rounded-full bg-indigo-950/80 text-indigo-400 mx-auto flex items-center justify-center">
                        <Download className="w-5 h-5 animate-bounce" style={{ animationDuration: '2.5s' }} />
                      </div>
                      <div>
                        <label htmlFor="resume-file-upload" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer block">
                          Upload PDF, Word, or Text Resume
                        </label>
                        <p className="text-[9px] text-slate-500 mt-0.5">Supports PDF and Word documents for visual preview.</p>
                      </div>
                      
                      <input
                        id="resume-file-upload"
                        type="file"
                        accept=".pdf,.docx,.doc,.txt,.json"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                        className="hidden"
                      />

                      {uploadedFileName && (
                        <div className="inline-flex items-center gap-1.5 bg-indigo-950/40 border border-indigo-900/45 px-3 py-1 rounded-full text-[10px] text-slate-300">
                          <Check className="w-3 h-3 text-emerald-400 animate-pulse" />
                          <span className="font-semibold truncate max-w-[160px]">{uploadedFileName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PDF Visual Preview Area */}
                  {uploadedResumeUrl && (
                    <div className="space-y-2 border border-slate-800 rounded-xl p-3 bg-slate-950/50">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Original Document Preview</span>
                        <button onClick={() => setUploadedResumeUrl(null)} className="text-slate-500 hover:text-white">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="rounded-lg overflow-hidden border border-slate-800 h-96 bg-slate-900">
                        <iframe 
                          src={uploadedResumeUrl} 
                          className="w-full h-full" 
                          title="Resume Preview"
                        />
                      </div>
                    </div>
                  )}

                  {/* Standard Plaintext paste fallback */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-medium text-slate-300">Paste plain text here:</label>
                      {rawTextImport.trim().length > 0 && (
                        <button
                          onClick={() => {
                            setRawTextImport('');
                            setUploadedFileName('');
                          }}
                          className="text-[10px] text-slate-500 hover:text-rose-400 font-bold transition-colors"
                        >
                          Clear Pastebox
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={8}
                      value={rawTextImport}
                      onChange={(e) => setRawTextImport(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed"
                      placeholder="Paste text copied from PDF or Word here... e.g.&#10;&#10;Jane Doe&#10;Senior React Developer&#10;jane.doe@example.com | (555) 123-4567&#10;&#10;Experience:&#10;Enterprise Corp - Senior Developer (2022 - Present)&#10;• Developed and shipped 12 client websites..."
                    ></textarea>
                  </div>

                  <button
                    onClick={handleRawTextParse}
                    disabled={isParsing || !rawTextImport.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isParsing ? (
                      <>
                        <span className="w-4.5 h-4.5 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                        <span>Parsing Technical Data...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Parse Pasted Resume</span>
                      </>
                    )}
                  </button>

                  {/* Saved Resumes History List */}
                  {savedResumes.length > 0 && (
                    <div className="pt-4 border-t border-slate-800/60 space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                          <span>📂 Saved Resumes History ({savedResumes.length})</span>
                        </h3>
                        <span className="text-[9px] text-slate-500 font-semibold">Saves automatically inside browser</span>
                      </div>

                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                        {savedResumes.map((item) => {
                          const isActive = resumeData.personal.name === item.name && resumeData.personal.title === item.title;
                          return (
                            <div
                              key={item.id}
                              onClick={() => loadResumeFromHistory(item.id)}
                              className={`p-3 rounded-xl border text-xs flex justify-between items-center gap-3 transition-all duration-200 cursor-pointer ${
                                isActive
                                  ? 'bg-indigo-950/35 border-indigo-500/60 text-white shadow'
                                  : 'bg-slate-950/25 border-slate-850 text-slate-400 hover:border-slate-750 hover:bg-slate-950/40'
                              }`}
                            >
                              <div className="min-w-0 space-y-0.5">
                                <div className="flex items-center gap-1.5 font-bold text-slate-200 truncate">
                                  <span className="truncate">{item.name}</span>
                                  {isActive && (
                                    <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-900 px-1.5 py-0.2 rounded-md font-semibold flex-shrink-0 animate-pulse">
                                      ACTIVE
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate">{item.title}</div>
                                <div className="text-[8px] text-slate-500">Parsed: {item.date}</div>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                  onClick={(e) => deleteResumeFromHistory(item.id, e)}
                                  className="text-slate-500 hover:text-rose-400 p-1.5 rounded hover:bg-slate-900 transition-colors"
                                  title="Remove from history"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}


                </div>
              )}

              {/* TAB 2: PERSONAL PROFILE */}
              {activeTab === 'profile' && (
                <div className="space-y-5 animate-fadeIn">
                  <div>
                    <h2 className="text-base font-bold text-white">Personal details</h2>
                    <p className="text-xs text-slate-400 mt-1">Update your identity, bio, and professional summary.</p>
                  </div>

                  {/* Profile Picture Upload Section */}
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center shrink-0">
                      {resumeData.personal.avatar && resumeData.personal.avatar.length > 2 ? (
                        <img 
                          src={resumeData.personal.avatar} 
                          alt={resumeData.personal.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-black text-slate-400 uppercase">
                          {resumeData.personal.avatar || '??'}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 text-center sm:text-left space-y-1">
                      <label className="text-xs font-bold text-slate-300 block">Profile Picture</label>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Upload a photo (PNG, JPG, or WebP, max 2MB). This will be displayed across your portfolio layouts.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="bg-indigo-650 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer block">
                        Upload
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleAvatarUpload} 
                          className="hidden" 
                        />
                      </label>
                      
                      {resumeData.personal.avatar && resumeData.personal.avatar.length > 2 && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-750 text-slate-400 hover:text-slate-350 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400">Full Name</label>
                      <input
                        type="text"
                        value={resumeData.personal.name}
                        onChange={(e) => handlePersonalChange('name', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400">Professional Title</label>
                      <input
                        type="text"
                        value={resumeData.personal.title}
                        onChange={(e) => handlePersonalChange('title', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Short Tagline</label>
                    <input
                      type="text"
                      value={resumeData.personal.subtitle}
                      onChange={(e) => handlePersonalChange('subtitle', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <label className="font-semibold text-slate-400">Biography / Professional Summary</label>
                      <span className="text-slate-500">{resumeData.personal.bio.length} characters</span>
                    </div>
                    <textarea
                      rows={4}
                      value={resumeData.personal.bio}
                      onChange={(e) => handlePersonalChange('bio', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400">Email</label>
                      <input
                        type="email"
                        value={resumeData.personal.email}
                        onChange={(e) => handlePersonalChange('email', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400">Phone Number</label>
                      <input
                        type="text"
                        value={resumeData.personal.phone}
                        onChange={(e) => handlePersonalChange('phone', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Location (e.g. Austin, TX)</label>
                    <input
                      type="text"
                      value={resumeData.personal.location}
                      onChange={(e) => handlePersonalChange('location', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="border-t border-slate-800/50 pt-4 space-y-4">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Social Channels</h3>
                    
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5">
                        <span className="text-xs font-semibold text-slate-500 w-20">GitHub</span>
                        <input
                          type="text"
                          value={resumeData.personal.socials.github || ''}
                          onChange={(e) => handleSocialChange('github', e.target.value)}
                          className="w-full bg-transparent border-none text-xs text-white focus:outline-none"
                          placeholder="https://github.com/username"
                        />
                      </div>
                      <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5">
                        <span className="text-xs font-semibold text-slate-500 w-20">LinkedIn</span>
                        <input
                          type="text"
                          value={resumeData.personal.socials.linkedin || ''}
                          onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                          className="w-full bg-transparent border-none text-xs text-white focus:outline-none"
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                      <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5">
                        <span className="text-xs font-semibold text-slate-500 w-20">Twitter</span>
                        <input
                          type="text"
                          value={resumeData.personal.socials.twitter || ''}
                          onChange={(e) => handleSocialChange('twitter', e.target.value)}
                          className="w-full bg-transparent border-none text-xs text-white focus:outline-none"
                          placeholder="https://twitter.com/username"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: WORK EXPERIENCE */}
              {activeTab === 'experience' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-base font-bold text-white">Work History Timeline</h2>
                      <p className="text-xs text-slate-400 mt-1">Add and adjust bullet points for your roles.</p>
                    </div>
                  </div>

                  {/* Job Accordions List */}
                  <div className="space-y-3">
                    {resumeData.experience.map((exp) => (
                      <div key={exp.id} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/20">
                        <button
                          onClick={() => setExpandedJobs(prev => ({ ...prev, [exp.id]: !prev[exp.id] }))}
                          className="w-full px-4 py-3 bg-slate-950/40 hover:bg-slate-950/60 transition-colors flex items-center justify-between text-left text-xs"
                        >
                          <div>
                            <span className="font-bold text-white">{exp.position}</span>
                            <span className="text-slate-500 mx-1.5">•</span>
                            <span className="text-slate-400 font-medium">{exp.company}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 font-semibold">{exp.period}</span>
                            {expandedJobs[exp.id] ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                          </div>
                        </button>

                        {expandedJobs[exp.id] && (
                          <div className="p-4 border-t border-slate-800/50 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-slate-500">Company Name</label>
                                <input
                                  type="text"
                                  value={exp.company}
                                  onChange={(e) => handleJobChange(exp.id, 'company', e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-slate-500">Position</label>
                                <input
                                  type="text"
                                  value={exp.position}
                                  onChange={(e) => handleJobChange(exp.id, 'position', e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-slate-500">Period (e.g. 2022 - Present)</label>
                                <input
                                  type="text"
                                  value={exp.period}
                                  onChange={(e) => handleJobChange(exp.id, 'period', e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-slate-500">Location</label>
                                <input
                                  type="text"
                                  value={exp.location}
                                  onChange={(e) => handleJobChange(exp.id, 'location', e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                />
                              </div>
                            </div>

                            {/* Bullet Points Editing */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <label className="text-[10px] uppercase font-bold text-slate-500">Achievements & Bullet Points</label>
                                <button
                                  onClick={() => handleAddBullet(exp.id)}
                                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Add Bullet</span>
                                </button>
                              </div>

                              <div className="space-y-2">
                                {exp.description.map((bullet, bulletIdx) => (
                                  <div key={bulletIdx} className="flex gap-2 items-start group">
                                    <span className="text-xs text-slate-500 pt-2">•</span>
                                    <textarea
                                      rows={2}
                                      value={bullet}
                                      onChange={(e) => handleBulletChange(exp.id, bulletIdx, e.target.value)}
                                      className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 resize-none"
                                    />
                                    <button
                                      onClick={() => handleRemoveBullet(exp.id, bulletIdx)}
                                      className="text-slate-600 hover:text-rose-400 p-1 rounded hover:bg-slate-900 transition-colors flex-shrink-0"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Tech Tags */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-bold text-slate-500">Technologies (comma separated)</label>
                              <input
                                type="text"
                                value={exp.technologies.join(', ')}
                                onChange={(e) => handleJobChange(exp.id, 'technologies', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                placeholder="React, TypeScript, CSS"
                              />
                            </div>

                            {/* Remove Job Button */}
                            <div className="pt-2 flex justify-end">
                              <button
                                onClick={() => handleRemoveJob(exp.id)}
                                className="text-xs text-rose-500 hover:text-rose-400 font-semibold flex items-center gap-1 hover:bg-rose-950/10 px-2 py-1 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete Role</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add New Job Block */}
                  <div className="border border-dashed border-slate-800 rounded-xl p-4 bg-slate-950/10 space-y-4">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Add New Experience</span>
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Company Name"
                        value={newJob.company}
                        onChange={(e) => setNewJob(prev => ({ ...prev, company: e.target.value }))}
                        className="bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="Position"
                        value={newJob.position}
                        onChange={(e) => setNewJob(prev => ({ ...prev, position: e.target.value }))}
                        className="bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Period (e.g. 2024)"
                        value={newJob.period}
                        onChange={(e) => setNewJob(prev => ({ ...prev, period: e.target.value }))}
                        className="bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="Location"
                        value={newJob.location}
                        onChange={(e) => setNewJob(prev => ({ ...prev, location: e.target.value }))}
                        className="bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="Technologies (comma separated, e.g. Python, AWS)"
                      value={newJobTechInput}
                      onChange={(e) => setNewJobTechInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />

                    <button
                      onClick={handleAddJob}
                      disabled={!newJob.company || !newJob.position}
                      className="w-full bg-slate-800 hover:bg-slate-750 disabled:bg-slate-900 text-slate-300 disabled:text-slate-600 py-2 rounded-lg text-xs font-bold transition-colors"
                    >
                      Append Experience to Timeline
                    </button>
                  </div>

                </div>
              )}

              {/* TAB 4: PROJECTS & TECHNICAL SKILLS */}
              {activeTab === 'projects' && (
                <div className="space-y-8 animate-fadeIn">
                  
                  {/* Sub-section 1: Featured Projects */}
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-base font-bold text-white">Projects Showcase</h2>
                      <p className="text-xs text-slate-400 mt-1">Detail key personal projects and custom code implementations.</p>
                    </div>

                    {/* Accordion projects */}
                    <div className="space-y-3">
                      {resumeData.projects.map((proj) => (
                        <div key={proj.id} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/20">
                          <button
                            onClick={() => setExpandedProjects(prev => ({ ...prev, [proj.id]: !prev[proj.id] }))}
                            className="w-full px-4 py-3 bg-slate-950/40 hover:bg-slate-950/60 transition-colors flex items-center justify-between text-left text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{proj.title}</span>
                              <span className="text-[10px] bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded-md font-semibold">
                                {proj.category}
                              </span>
                            </div>
                            {expandedProjects[proj.id] ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                          </button>

                          {expandedProjects[proj.id] && (
                            <div className="p-4 border-t border-slate-800/50 space-y-4">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] uppercase font-bold text-slate-500">Project Title</label>
                                  <input
                                    type="text"
                                    value={proj.title}
                                    onChange={(e) => handleProjChange(proj.id, 'title', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] uppercase font-bold text-slate-500">Category</label>
                                  <select
                                    value={proj.category}
                                    onChange={(e) => handleProjChange(proj.id, 'category', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                                  >
                                    <option value="Frontend">Frontend</option>
                                    <option value="Backend">Backend</option>
                                    <option value="Fullstack">Fullstack</option>
                                    <option value="Mobile">Mobile</option>
                                    <option value="Design">Design</option>
                                    <option value="Other">Other</option>
                                  </select>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-slate-500">Brief Description</label>
                                <input
                                  type="text"
                                  value={proj.description}
                                  onChange={(e) => handleProjChange(proj.id, 'description', e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-slate-500">Detailed Case Study (Long Bio)</label>
                                <textarea
                                  rows={3}
                                  value={proj.longDescription || ''}
                                  onChange={(e) => handleProjChange(proj.id, 'longDescription', e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none resize-none"
                                  placeholder="What challenges did you solve? What architecture did you use?"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] uppercase font-bold text-slate-500">Live Demo URL</label>
                                  <input
                                    type="text"
                                    value={proj.link || ''}
                                    onChange={(e) => handleProjChange(proj.id, 'link', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                                    placeholder="https://myproject.demo"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] uppercase font-bold text-slate-500">GitHub Repository</label>
                                  <input
                                    type="text"
                                    value={proj.github || ''}
                                    onChange={(e) => handleProjChange(proj.id, 'github', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                                    placeholder="https://github.com/username/project"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-slate-500">Tech Stack (comma separated)</label>
                                <input
                                  type="text"
                                  value={proj.techStack.join(', ')}
                                  onChange={(e) => handleProjTechChange(proj.id, e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                                  placeholder="React, Next.js, Redis"
                                />
                              </div>

                              {/* Remove project */}
                              <div className="flex justify-end">
                                <button
                                  onClick={() => handleRemoveProj(proj.id)}
                                  className="text-xs text-rose-500 hover:text-rose-400 font-semibold flex items-center gap-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete Project</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add new project */}
                    <div className="border border-dashed border-slate-800 rounded-xl p-4 bg-slate-950/10 space-y-4">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Add New Project</span>
                      </h3>

                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Project Title"
                          value={newProj.title}
                          onChange={(e) => setNewProj(prev => ({ ...prev, title: e.target.value }))}
                          className="bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                        <select
                          value={newProj.category}
                          onChange={(e) => setNewProj(prev => ({ ...prev, category: e.target.value as Project['category'] }))}
                          className="bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Frontend">Frontend</option>
                          <option value="Backend">Backend</option>
                          <option value="Fullstack">Fullstack</option>
                          <option value="Mobile">Mobile</option>
                          <option value="Design">Design</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <input
                        type="text"
                        placeholder="Short project tagline description"
                        value={newProj.description}
                        onChange={(e) => setNewProj(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />

                      <input
                        type="text"
                        placeholder="Tech Stack tags (comma separated)"
                        value={newProjTechInput}
                        onChange={(e) => setNewProjTechInput(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                      />

                      <button
                        onClick={handleAddProj}
                        disabled={!newProj.title || !newProj.description}
                        className="w-full bg-slate-800 hover:bg-slate-750 disabled:bg-slate-900 text-slate-300 disabled:text-slate-600 py-2 rounded-lg text-xs font-bold transition-colors"
                      >
                        Insert Project Card
                      </button>
                    </div>
                  </div>

                  {/* Sub-section 2: Skills list */}
                  <div className="border-t border-slate-800 pt-6 space-y-6">
                    <div>
                      <h2 className="text-base font-bold text-white">Skills & Fluencies</h2>
                      <p className="text-xs text-slate-400 mt-1">Calibrate skill score levels and category allocations.</p>
                    </div>

                    {/* Quick Add Skill */}
                    <div className="grid grid-cols-3 gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                      <div className="col-span-2 space-y-2">
                        <input
                          type="text"
                          placeholder="Skill (e.g. GraphQL, Docker)"
                          value={newSkill.name}
                          onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                        
                        <select
                          value={newSkill.category}
                          onChange={(e) => setNewSkill(prev => ({ ...prev, category: e.target.value as Skill['category'] }))}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Frontend">Frontend</option>
                          <option value="Backend">Backend</option>
                          <option value="DevOps/Cloud">DevOps & Cloud</option>
                          <option value="Design">UX / Design System</option>
                          <option value="Languages">Programming Languages</option>
                          <option value="Tools/Other">Tools & Testing</option>
                        </select>
                      </div>

                      <div className="flex flex-col justify-between">
                        <span className="text-[10px] text-slate-400 text-center font-semibold">Level: {newSkill.level}%</span>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          step="5"
                          value={newSkill.level}
                          onChange={(e) => setNewSkill(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                          className="w-full accent-indigo-500 cursor-pointer"
                        />
                        <button
                          onClick={handleAddSkill}
                          disabled={!newSkill.name.trim()}
                          className="w-full bg-indigo-650 hover:bg-indigo-600 disabled:bg-slate-850 disabled:text-slate-600 text-white py-1 rounded-lg text-xs font-bold transition-colors"
                        >
                          Add Skill
                        </button>
                      </div>
                    </div>

                    {/* Skills list inline sliders */}
                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                      {resumeData.skills.map((skill) => (
                        <div key={skill.name} className="flex items-center justify-between gap-4 bg-slate-950/20 border border-slate-850 rounded-lg px-3 py-2 text-xs">
                          <div className="w-32 truncate">
                            <span className="font-semibold text-slate-200 block">{skill.name}</span>
                            <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">{skill.category}</span>
                          </div>

                          <div className="flex-grow flex items-center gap-3">
                            <input
                              type="range"
                              min="10"
                              max="100"
                              step="5"
                              value={skill.level}
                              onChange={(e) => handleSkillLevelChange(skill.name, parseInt(e.target.value))}
                              className="w-full accent-indigo-500 cursor-pointer"
                            />
                            <span className="w-8 text-right text-slate-400 font-semibold">{skill.level}%</span>
                          </div>

                          <button
                            onClick={() => handleRemoveSkill(skill.name)}
                            className="text-slate-600 hover:text-rose-400 p-1 rounded hover:bg-slate-950"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                  </div>

                  {/* Sub-section 3: Academics & Education */}
                  <div className="border-t border-slate-800 pt-6 space-y-6">
                    <div>
                      <h2 className="text-base font-bold text-white">Academics & Education</h2>
                      <p className="text-xs text-slate-400 mt-1">Manage school enrollment, degrees, locations, and achievements.</p>
                    </div>

                    {/* Accordion education */}
                    <div className="space-y-3">
                      {resumeData.education && resumeData.education.map((edu) => (
                        <div key={edu.id} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/20">
                          <button
                            onClick={() => setExpandedEdu(prev => ({ ...prev, [edu.id]: !prev[edu.id] }))}
                            className="w-full px-4 py-3 bg-slate-950/40 hover:bg-slate-950/60 transition-colors flex items-center justify-between text-left text-xs"
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-white">{edu.institution || 'New Institution'}</span>
                              <span className="text-[10px] text-indigo-400 font-medium">
                                {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-500 font-medium">{edu.period}</span>
                              {expandedEdu[edu.id] ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                            </div>
                          </button>

                          {expandedEdu[edu.id] && (
                            <div className="p-4 border-t border-slate-800/50 space-y-4">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] uppercase font-bold text-slate-500">Institution</label>
                                  <input
                                    type="text"
                                    value={edu.institution}
                                    onChange={(e) => handleEduChange(edu.id, 'institution', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] uppercase font-bold text-slate-500">Degree</label>
                                  <input
                                    type="text"
                                    value={edu.degree}
                                    onChange={(e) => handleEduChange(edu.id, 'degree', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                                    placeholder="B.S., M.S., High School Diploma"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] uppercase font-bold text-slate-500">Field of Study</label>
                                  <input
                                    type="text"
                                    value={edu.fieldOfStudy}
                                    onChange={(e) => handleEduChange(edu.id, 'fieldOfStudy', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                                    placeholder="Computer Science, Cognitive Science"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] uppercase font-bold text-slate-500">Location</label>
                                  <input
                                    type="text"
                                    value={edu.location}
                                    onChange={(e) => handleEduChange(edu.id, 'location', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                                    placeholder="Berkeley, CA"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] uppercase font-bold text-slate-500">Period / Years</label>
                                  <input
                                    type="text"
                                    value={edu.period}
                                    onChange={(e) => handleEduChange(edu.id, 'period', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                                    placeholder="2015 - 2019"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] uppercase font-bold text-slate-500">Grade / GPA (Optional)</label>
                                  <input
                                    type="text"
                                    value={edu.grade || ''}
                                    onChange={(e) => handleEduChange(edu.id, 'grade', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                                    placeholder="3.84 GPA, First Class"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end">
                                <button
                                  onClick={() => handleRemoveEdu(edu.id)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 rounded-lg text-[10px] font-bold text-rose-400 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Remove School</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Quick Add Education */}
                    <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-3">
                      <span className="text-xs font-bold text-slate-300 block">Add New School / Degree</span>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Institution Name *"
                          value={newEducation.institution || ''}
                          onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                        <input
                          type="text"
                          placeholder="Degree / Certificate *"
                          value={newEducation.degree || ''}
                          onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Field of Study"
                          value={newEducation.fieldOfStudy || ''}
                          onChange={(e) => setNewEducation(prev => ({ ...prev, fieldOfStudy: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                        <input
                          type="text"
                          placeholder="Location (e.g. Austin, TX)"
                          value={newEducation.location || ''}
                          onChange={(e) => setNewEducation(prev => ({ ...prev, location: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Period (e.g. 2018 - 2022)"
                          value={newEducation.period || ''}
                          onChange={(e) => setNewEducation(prev => ({ ...prev, period: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                        <input
                          type="text"
                          placeholder="Grade / GPA"
                          value={newEducation.grade || ''}
                          onChange={(e) => setNewEducation(prev => ({ ...prev, grade: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <button
                        onClick={handleAddEdu}
                        disabled={!newEducation.institution || !newEducation.degree}
                        className="w-full bg-slate-800 hover:bg-slate-750 disabled:bg-slate-900 text-slate-300 disabled:text-slate-600 py-2 rounded-lg text-xs font-bold transition-colors"
                      >
                        Insert Education Entry
                      </button>
                    </div>
                  </div>

                  {/* Sub-section 4: Awards & Certifications */}
                  <div className="border-t border-slate-800 pt-6 space-y-6">
                    <div>
                      <h2 className="text-base font-bold text-white">Awards & Certifications</h2>
                      <p className="text-xs text-slate-400 mt-1">Showcase your industry certifications, accolades, and honors.</p>
                    </div>

                    {/* Accordion certificates */}
                    <div className="space-y-3">
                      {resumeData.certificates && resumeData.certificates.map((cert) => (
                        <div key={cert.id} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/20">
                          <button
                            onClick={() => setExpandedCert(prev => ({ ...prev, [cert.id]: !prev[cert.id] }))}
                            className="w-full px-4 py-3 bg-slate-950/40 hover:bg-slate-950/60 transition-colors flex items-center justify-between text-left text-xs"
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-white">{cert.name || 'New Credential'}</span>
                              <span className="text-[10px] text-indigo-400 font-medium">
                                Issuer: {cert.issuer}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-500 font-medium">{cert.date}</span>
                              {expandedCert[cert.id] ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                            </div>
                          </button>

                          {expandedCert[cert.id] && (
                            <div className="p-4 border-t border-slate-800/50 space-y-4">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] uppercase font-bold text-slate-500">Certification / Award Name</label>
                                  <input
                                    type="text"
                                    value={cert.name}
                                    onChange={(e) => handleCertChange(cert.id, 'name', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] uppercase font-bold text-slate-500">Issuer</label>
                                  <input
                                    type="text"
                                    value={cert.issuer}
                                    onChange={(e) => handleCertChange(cert.id, 'issuer', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                                    placeholder="AWS, Scrum Alliance, etc."
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] uppercase font-bold text-slate-500">Date / Year</label>
                                  <input
                                    type="text"
                                    value={cert.date}
                                    onChange={(e) => handleCertChange(cert.id, 'date', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                                    placeholder="2023"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] uppercase font-bold text-slate-500">Credential / Link (Optional)</label>
                                  <input
                                    type="text"
                                    value={cert.link || ''}
                                    onChange={(e) => handleCertChange(cert.id, 'link', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                                    placeholder="https://credly.com/..."
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end">
                                <button
                                  onClick={() => handleRemoveCert(cert.id)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 rounded-lg text-[10px] font-bold text-rose-400 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Remove Entry</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Quick Add Certificate */}
                    <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-3">
                      <span className="text-xs font-bold text-slate-300 block">Add New Certificate / Award</span>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Certificate Name *"
                          value={newCertificate.name || ''}
                          onChange={(e) => setNewCertificate(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                        <input
                          type="text"
                          placeholder="Issuer / Organization *"
                          value={newCertificate.issuer || ''}
                          onChange={(e) => setNewCertificate(prev => ({ ...prev, issuer: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Date (e.g. 2024)"
                          value={newCertificate.date || ''}
                          onChange={(e) => setNewCertificate(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                        <input
                          type="text"
                          placeholder="Verification Link (URL)"
                          value={newCertificate.link || ''}
                          onChange={(e) => setNewCertificate(prev => ({ ...prev, link: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <button
                        onClick={handleAddCert}
                        disabled={!newCertificate.name || !newCertificate.issuer}
                        className="w-full bg-slate-800 hover:bg-slate-750 disabled:bg-slate-900 text-slate-300 disabled:text-slate-600 py-2 rounded-lg text-xs font-bold transition-colors"
                      >
                        Insert Certificate / Award
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 5: DESIGN & STYLING PRESETS */}
              {activeTab === 'design' && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <h2 className="text-base font-bold text-white">Layouts & Theme Palettes</h2>
                    <p className="text-xs text-slate-400 mt-1">Fine tune details to change the style of your website.</p>
                  </div>

                  {/* Theme presets */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Theme Engine</label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { id: 'minimal', label: 'Minimal Slate', desc: 'Ultra-clean grid' },
                        { id: 'creative', label: 'Creative Morph', desc: 'Gradients & blobs' },
                        { id: 'gradient', label: 'Gradient Glow', desc: 'Centered & vibrant' },
                        { id: 'cyberpunk', label: 'Cyber terminal', desc: 'Monospaced neon' },
                        { id: 'classic', label: 'Classic Serif', desc: 'Formal & structured' }
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => setThemeSettings(prev => ({ ...prev, id: t.id as ThemeSettings['id'] }))}
                          className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                            themeSettings.id === t.id
                              ? appTheme === 'nord-light'
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                                : 'bg-indigo-950/40 border-indigo-500 text-white'
                              : appTheme === 'nord-light'
                                ? 'bg-white border-slate-200 text-slate-650 hover:border-slate-350'
                                : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-750'
                          }`}
                        >
                          <span className="text-xs font-bold block">{t.label}</span>
                          <span className="text-[9px] text-slate-500 block mt-0.5">{t.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Primary Color Presets */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Primary Accent Color</label>
                    <div className="flex items-center gap-3.5 py-2 bg-slate-950/30 rounded-xl border border-slate-850 px-4">
                      {[
                        { id: 'violet', color: 'bg-violet-500', border: 'border-violet-600' },
                        { id: 'emerald', color: 'bg-emerald-500', border: 'border-emerald-600' },
                        { id: 'blue', color: 'bg-blue-500', border: 'border-blue-600' },
                        { id: 'amber', color: 'bg-amber-500', border: 'border-amber-650' },
                        { id: 'rose', color: 'bg-rose-500', border: 'border-rose-600' },
                        { id: 'slate', color: 'bg-slate-500', border: 'border-slate-600' }
                      ].map(color => (
                        <button
                          key={color.id}
                          onClick={() => setThemeSettings(prev => ({ ...prev, primaryColor: color.id as ThemeSettings['primaryColor'] }))}
                          className={`w-7 h-7 rounded-full ${color.color} cursor-pointer relative transition-all duration-200 hover:scale-110 ${
                            themeSettings.primaryColor === color.id 
                              ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' 
                              : ''
                          }`}
                          title={`${color.id.charAt(0).toUpperCase() + color.id.slice(1)} Scheme`}
                        ></button>
                      ))}
                    </div>
                  </div>

                  {/* Profile Picture Upload Section (Mirrored in Design tab for convenience) */}
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 flex flex-col sm:flex-row items-center gap-4 animate-fadeIn">
                    <div className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center shrink-0">
                      {resumeData.personal.avatar && resumeData.personal.avatar.length > 2 ? (
                        <img 
                          src={resumeData.personal.avatar} 
                          alt={resumeData.personal.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-black text-slate-400 uppercase">
                          {resumeData.personal.avatar || '??'}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 text-center sm:text-left space-y-1">
                      <label className="text-xs font-bold text-slate-300 block">Profile Picture</label>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Upload a photo (PNG, JPG, or WebP, max 2MB).
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="bg-indigo-650 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer block">
                        Upload
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleAvatarUpload} 
                          className="hidden" 
                        />
                      </label>
                      
                      {resumeData.personal.avatar && resumeData.personal.avatar.length > 2 && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-750 text-slate-400 hover:text-slate-350 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Typography Controls */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Font Family</label>
                    <div className={`grid grid-cols-3 gap-2 p-1 rounded-lg border text-xs font-medium text-center ${
                      appTheme === 'nord-light'
                        ? 'bg-slate-100 border-slate-200'
                        : 'bg-slate-950/40 border-slate-850'
                    }`}>
                      {[
                        { id: 'sans', label: 'Sans Serif', font: 'font-sans' },
                        { id: 'serif', label: 'Classic Serif', font: 'font-serif' },
                        { id: 'mono', label: 'Monospace', font: 'font-mono' }
                      ].map(font => (
                        <button
                          key={font.id}
                          onClick={() => setThemeSettings(prev => ({ ...prev, fontFamily: font.id as ThemeSettings['fontFamily'] }))}
                          className={`py-2 px-1.5 rounded-md transition-colors cursor-pointer ${
                            themeSettings.fontFamily === font.id
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : appTheme === 'nord-light'
                                ? 'text-slate-550 hover:text-slate-900'
                                : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <span className={font.font}>{font.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dark Mode Preview Toggler */}
                  <div className={`flex items-center justify-between p-4 rounded-xl border ${
                    appTheme === 'nord-light' ? 'bg-slate-100 border-slate-200' : 'bg-slate-950/20 border-slate-850'
                  }`}>
                    <div>
                      <span className="text-xs font-bold text-white block">Preview Dark Mode</span>
                      <span className="text-[9px] text-slate-500 mt-0.5 block">Toggles dark styling of target portfolio</span>
                    </div>

                    <button
                      onClick={() => setThemeSettings(prev => ({ ...prev, darkMode: !prev.darkMode }))}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                        themeSettings.darkMode ? 'bg-indigo-650' : 'bg-slate-850'
                      }`}
                    >
                      <div 
                        className={`w-4.5 h-4.5 rounded-full bg-white absolute top-[3px] transition-all flex items-center justify-center text-[8px] ${
                          themeSettings.darkMode ? 'left-[25px] text-indigo-600' : 'left-[4px] text-slate-500'
                        }`}
                      >
                        {themeSettings.darkMode ? <Moon className="w-2.5 h-2.5" /> : <Sun className="w-2.5 h-2.5" />}
                      </div>
                    </button>
                  </div>

                  {/* Application Workspace Theme */}
                  <div className={`space-y-2 pt-4 border-t ${
                    appTheme === 'nord-light' ? 'border-slate-200' : 'border-slate-850'
                  }`}>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white block">Workspace Theme</span>
                      <span className="text-[9px] text-slate-500 mt-0.5 block">Customize the look and feel of the builder workspace interface</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {[
                        { id: 'slate-dark', label: 'Slate Dark', desc: 'Default carbon' },
                        { id: 'indigo-midnight', label: 'Indigo Midnight', desc: 'Deep violet' },
                        { id: 'nord-light', label: 'Nord Light', desc: 'Sleek light' }
                      ].map(t => (
                        <button
                          type="button"
                          key={t.id}
                          onClick={() => setAppTheme(t.id as any)}
                          className={`p-2.5 text-left rounded-xl border transition-all cursor-pointer ${
                            appTheme === t.id
                              ? appTheme === 'nord-light'
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                                : 'bg-indigo-950/40 border-indigo-500 text-white'
                              : appTheme === 'nord-light'
                                ? 'bg-white border-slate-200 text-slate-650 hover:border-slate-350'
                                : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-750'
                          }`}
                        >
                          <span className="text-xs font-bold block">{t.label}</span>
                          <span className="text-[9px] text-slate-500 block mt-0.5 leading-tight">{t.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: RESUME ANALYZER COACH */}
              {activeTab === 'coach' && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <h2 className="text-base font-bold text-white">AI Coach & ATS Keyword Scanner</h2>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Double-check ATS readability, audit layout parsing structures, and optimize target keywords.
                    </p>
                  </div>

                  {/* Sub-tab selection (Jobscan Pro Multi-Tab Presets) */}
                  <div className="flex border-b border-slate-800 overflow-x-auto scrollbar-none text-[10px] font-bold uppercase tracking-wider bg-slate-950/40">
                    {[
                      { id: 'checklist', label: '📝 Format Checklist' },
                      { id: 'ats', label: '🎯 Target Matcher' },
                      { id: 'cover-letter', label: '✉️ Cover Letter' },
                      { id: 'linkedin', label: '🔗 LinkedIn Check' },
                      { id: 'plaintext', label: '📄 Plaintext Exporter' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setCoachSubTab(tab.id as any)}
                        className={`flex-1 px-2 py-2.5 text-center border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                          coachSubTab === tab.id
                            ? 'border-indigo-500 text-indigo-400'
                            : 'border-transparent text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* SUB-TAB 1: FORMAT CHECKLIST */}
                  {coachSubTab === 'checklist' && (
                    <div className="space-y-5 animate-fadeIn">
                      {/* Score Card Grid */}
                      <div className="grid grid-cols-3 gap-4 bg-slate-950/30 border border-slate-800 p-4 rounded-2xl items-center">
                        <div className="col-span-1 flex flex-col items-center justify-center border-r border-slate-800 py-1">
                          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Resume Grade</span>
                          <span className={`text-3xl font-extrabold mt-1.5 ${activeAnalysis.color.split(' ')[0]}`}>
                            {activeAnalysis.grade}
                          </span>
                        </div>

                        <div className="col-span-2 pl-2 space-y-1.5">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-400">Layout Quality Score</span>
                            <span className={activeAnalysis.color.split(' ')[0]}>{activeAnalysis.score}/100</span>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full bg-indigo-500 transition-all duration-500`}
                              style={{ width: `${activeAnalysis.score}%` }}
                            ></div>
                          </div>

                          <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                            Formatting metrics sync instantly as you refine jobs, bullet lists, and contact items!
                          </p>
                        </div>
                      </div>

                      {/* Recommendations list */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider block">Improvement Recommendations</h3>
                        
                        {activeAnalysis.recommendations.length > 0 ? (
                          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
                            {activeAnalysis.recommendations.map((rec) => (
                              <div key={rec.id} className="flex gap-3 p-3 rounded-xl bg-slate-950/20 border border-slate-850 text-xs leading-relaxed animate-fadeIn">
                                <div className="p-1 rounded-lg bg-amber-500/10 text-amber-400 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                                  <AlertCircle className="w-4 h-4" />
                                </div>
                                <div className="space-y-0.5">
                                  <h4 className="font-bold text-slate-200 flex items-center gap-2">
                                    <span>{rec.title}</span>
                                    <span className="text-[9px] text-amber-400 font-semibold bg-amber-950/40 px-1 py-0.2 rounded-md">+{rec.scoreImpact} pts</span>
                                  </h4>
                                  <p className="text-slate-400 text-[11px]">{rec.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 bg-emerald-900/20 border border-emerald-800/65 rounded-xl p-3 text-xs text-emerald-400 font-semibold">
                            <CheckCircle className="w-4 h-4" />
                            <span>Perfect Score! Your layout meets premium corporate parsing standards. Ready to export!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 2: ATS & RECRUITER TARGET MATCH */}
                  {coachSubTab === 'ats' && (
                    <div className="space-y-5 animate-fadeIn">
                      {/* ATS Match Score Card */}
                      <div className="grid grid-cols-3 gap-4 bg-slate-950/30 border border-slate-850 p-4 rounded-2xl items-center">
                        <div className="col-span-1 flex flex-col items-center justify-center border-r border-slate-800 py-1">
                          <span className="text-[9px] font-bold uppercase text-slate-500 tracking-wider text-center">Overall ATS Match</span>
                          <span className="text-3xl font-extrabold mt-1.5 text-indigo-400">
                            {activeAtsAnalysis.overallAtsScore}%
                          </span>
                        </div>

                        <div className="col-span-2 pl-2 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400 font-semibold">Keyword Density Score</span>
                            <span className="text-indigo-300 font-bold">{activeAtsAnalysis.matchScore}%</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400 font-semibold">Compliance Format Score</span>
                            <span className="text-indigo-300 font-bold">{activeAtsAnalysis.complianceScore}%</span>
                          </div>

                          <p className="text-[9px] text-slate-500 leading-normal font-medium pt-1">
                            Jobscan Pro tip: Raising your keyword matches above 75% secures top 10% tier status.
                          </p>
                        </div>
                      </div>

                      {/* Job Description paste field */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Target Job Description</label>
                        <textarea
                          rows={3}
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          placeholder="Paste target requirements here... e.g. 'Seeking 5+ years experience in React, TypeScript, AWS Cloud, Jest, Docker...'"
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none resize-none"
                        />
                      </div>

                      {/* Premium AI Auto-Optimizer Section */}
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/50 to-violet-950/40 border border-indigo-800/50 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xs font-bold text-indigo-350 uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                              <span>Jobscan Auto-Score Optimizer</span>
                            </h3>
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                              Generate an optimized copy in the <b>exact same format & design</b> instantly.
                            </p>
                          </div>
                          
                          <button
                            onClick={triggerAIOptimization}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors shadow cursor-pointer"
                          >
                            ✨ Auto-Optimize Resume
                          </button>
                        </div>

                        {resumeData.personal.name === 'Alex Rivera' && (
                          <div className="bg-amber-900/20 border border-amber-800/50 rounded-xl p-3 flex gap-2.5 items-start">
                            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-amber-400">Placeholder Data Detected</p>
                              <p className="text-[9px] text-slate-400 leading-relaxed">
                                You are currently viewing the default sample profile (Alex Rivera). 
                                For best results, go to the <b>Import</b> tab to upload your own resume first!
                              </p>
                            </div>
                          </div>
                        )}

                        {revisedResumeData && revisedAtsAnalysis && (
                          <div className="space-y-3 pt-2 border-t border-slate-800/60 animate-fadeIn">
                            {/* Side by side visual comparison */}
                            <div className="grid grid-cols-2 gap-4 text-center">
                              <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-850">
                                <span className="text-[9px] font-bold uppercase text-slate-500 block">Current Score</span>
                                <span className="text-xl font-extrabold text-slate-300 mt-1 block">{atsAnalysis.overallAtsScore}%</span>
                              </div>
                              <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-900/40 animate-pulse">
                                <span className="text-[9px] font-bold uppercase text-indigo-400 block">Revised Score</span>
                                <span className="text-xl font-extrabold text-emerald-400 mt-1 block">{revisedAtsAnalysis.overallAtsScore}%!</span>
                              </div>
                            </div>

                            {/* Preview toggles */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => setShowRevisedPreview(true)}
                                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                  showRevisedPreview
                                    ? 'bg-indigo-900/45 border-indigo-500 text-indigo-300'
                                    : 'border-slate-800 text-slate-400 hover:text-slate-300'
                                }`}
                              >
                                👁️ View Revised Preview
                              </button>
                              <button
                                onClick={() => setShowRevisedPreview(false)}
                                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                  !showRevisedPreview
                                    ? 'bg-slate-800 border-slate-700 text-slate-350'
                                    : 'border-slate-800 text-slate-400 hover:text-slate-300'
                                }`}
                              >
                                👁️ View Original Preview
                              </button>
                            </div>

                            <button
                              onClick={() => setShowOptimizerModal(true)}
                              className="w-full py-2.5 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 rounded-xl text-[10px] font-black tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                              <span>REVIEW AI DRAFT INTERACTIVELY</span>
                            </button>

                            {/* Premium Download Actions for AI Optimized Version */}
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleWordDownload()}
                                className="bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-200 text-[10px] py-2 rounded-lg font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                              >
                                <FileText className="w-3 h-3 text-indigo-400" />
                                <span>Download Word (.doc)</span>
                              </button>
                              
                              <button
                                onClick={handlePdfPrint}
                                className="bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-200 text-[10px] py-2 rounded-lg font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                              >
                                <Download className="w-3 h-3 text-emerald-400" />
                                <span>Export Document...</span>
                              </button>
                            </div>

                            {/* List of fixes applied */}
                            <div className="space-y-1.5 bg-slate-950/40 p-3 rounded-xl text-[11px]">
                              <span className="text-[9px] font-bold uppercase text-slate-500 block">AI Adjustments Applied:</span>
                              <ul className="space-y-1 pl-4 list-disc text-slate-400 leading-relaxed">
                                {appliedFixes.map((fix, i) => (
                                  <li key={i}>{fix}</li>
                                ))}
                              </ul>
                            </div>

                            {/* Adopt permanently */}
                            <button
                              onClick={applyRevisedData}
                              className="w-full bg-emerald-650 hover:bg-emerald-600 text-white py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Check className="w-4 h-4" />
                              <span>Save AI Revised Copy Permanently</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Jobscan Recruiter Findings Checklist */}
                      <div className="space-y-2.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Recruiter Optimization Findings</span>
                        
                        <div className="space-y-2">
                          {activeAtsAnalysis.recruiterInsights.map(insight => (
                            <div key={insight.id} className="p-3 rounded-xl bg-slate-950/20 border border-slate-850 flex items-start justify-between gap-3 text-xs leading-relaxed animate-fadeIn">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-200">{insight.label}</span>
                                  <span className="text-[10px] text-slate-500">({insight.value})</span>
                                </div>
                                <p className="text-[11px] text-slate-400">{insight.tip}</p>
                              </div>

                              <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full flex-shrink-0 ${
                                insight.status === 'pass'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/50'
                                  : 'bg-amber-950 text-amber-400 border border-amber-900/50'
                              }`}>
                                {insight.status === 'pass' ? 'Aligned' : 'Needs Attention'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Hard & Soft Skills Density Analysis */}
                      <div className="space-y-3 border-t border-slate-800/60 pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Keyword Density Analysis</span>
                          <span className="text-[9px] text-slate-500">(Candidate Count vs Ideal Density)</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                          {activeAtsAnalysis.skillsDensity.map((density, idx) => (
                            <div key={idx} className="p-2 rounded-lg bg-slate-950/30 border border-slate-850 flex justify-between items-center text-xs animate-fadeIn">
                              <div>
                                <span className="font-bold text-slate-200 block">{density.keyword}</span>
                                <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">{density.type} Skill</span>
                              </div>

                              <div className="text-right">
                                <div className="text-slate-300 font-bold">{density.count} matches</div>
                                <div className="text-[9px] text-slate-500">Recommended: {density.recommended}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* ATS formatting checklist */}
                      <div className="space-y-2 border-t border-slate-800/60 pt-4">
                        <span className="text-[10px] uppercase font-bold text-slate-400">ATS Compliance Checklist</span>
                        <div className="space-y-1.5 text-xs">
                          {activeAtsAnalysis.complianceChecks.map(check => (
                            <div key={check.id} className="flex justify-between items-center p-2 rounded bg-slate-950/20 border border-slate-850 animate-fadeIn">
                              <div>
                                <span className="font-bold text-slate-200 block">{check.label}</span>
                                <span className="text-[9px] text-slate-500 block leading-normal">{check.description}</span>
                              </div>
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                check.status === 'pass' 
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                                  : check.status === 'warning'
                                  ? 'bg-amber-950 text-amber-400 border border-amber-900'
                                  : 'bg-rose-950 text-rose-400 border border-rose-900'
                              }`}>
                                {check.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 3: COVER LETTER OPTIMIZER */}
                  {coachSubTab === 'cover-letter' && (
                    <div className="space-y-5 animate-fadeIn">
                      <div className="grid grid-cols-3 gap-4 bg-slate-950/30 border border-slate-850 p-4 rounded-2xl items-center">
                        <div className="col-span-1 flex flex-col items-center justify-center border-r border-slate-800 py-1">
                          <span className="text-[9px] font-bold uppercase text-slate-500 tracking-wider text-center">Cover Letter Match</span>
                          <span className="text-3xl font-extrabold mt-1.5 text-indigo-450">
                            {coverLetterAnalysis.score}%
                          </span>
                        </div>

                        <div className="col-span-2 pl-2 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Word Count</span>
                            <span className="text-slate-300 font-bold">{coverLetterAnalysis.wordCount} words</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Keyword Matches</span>
                            <span className="text-slate-300 font-bold">{coverLetterAnalysis.matchedKeywords.length} matched</span>
                          </div>
                          <p className="text-[9px] text-slate-500 leading-normal font-medium pt-1">
                            Pasting targeted keywords in cover letters raises human inspection rates by 42%.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-400 block">Paste Cover Letter</label>
                        <textarea
                          rows={6}
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          placeholder="Paste cover letter content here...&#10;e.g. 'Dear Hiring Manager, I am thrilled to apply for the Senior React Developer role...'"
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg p-3 text-xs text-slate-300 focus:outline-none"
                        />
                      </div>

                      {/* Cover Letter Insights */}
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Jobscan Cover Letter Audits</span>
                        <div className="space-y-1.5 text-xs">
                          {coverLetterAnalysis.insights.map((insight, i) => (
                            <div key={i} className="p-2.5 rounded bg-slate-950/20 border border-slate-850 flex items-start gap-2">
                              <div className="p-0.5 rounded bg-indigo-950 text-indigo-400 flex-shrink-0 mt-0.5">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-slate-300 leading-relaxed">{insight}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Matched vs Missing in Cover Letter */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-indigo-950/10 border border-indigo-900/35 space-y-1.5">
                          <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">Matches ({coverLetterAnalysis.matchedKeywords.length})</span>
                          <div className="flex flex-wrap gap-1 text-[9px]">
                            {coverLetterAnalysis.matchedKeywords.map(kw => (
                              <span key={kw} className="px-1 rounded bg-indigo-950 text-indigo-300">{kw}</span>
                            ))}
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-950/10 border border-amber-900/35 space-y-1.5">
                          <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block">Missing ({coverLetterAnalysis.missingKeywords.length})</span>
                          <div className="flex flex-wrap gap-1 text-[9px]">
                            {coverLetterAnalysis.missingKeywords.map(kw => (
                              <span key={kw} className="px-1 rounded bg-amber-950 text-amber-300">+ {kw}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* SUB-TAB 4: LINKEDIN PROFILE AUDITOR */}
                  {coachSubTab === 'linkedin' && (
                    <div className="space-y-5 animate-fadeIn">
                      <div className="p-4 rounded-2xl bg-indigo-950/10 border border-indigo-900/35 space-y-2">
                        <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Jobscan LinkedIn Recruiter Search Optimizations</h3>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Recruiters search LinkedIn using Boolean search queries matching standard title structures and key technical acronyms. Double-check your status:
                        </p>
                      </div>

                      <div className="space-y-2.5 text-xs">
                        {[
                          {
                            title: 'Boolean Headline Density',
                            desc: 'Your current headline has rich keyword parameters.',
                            status: 'Pass'
                          },
                          {
                            title: 'Professional Contact Linking',
                            desc: 'A clean, direct LinkedIn connection is present in your portfolio headers.',
                            status: activeData.personal.socials.linkedin ? 'Pass' : 'Needs Work'
                          },
                          {
                            title: 'Core Skill Categories',
                            desc: 'Ensure you map at least 5 key technical skills in your featured experience descriptions.',
                            status: activeData.skills.length >= 8 ? 'Pass' : 'Warning'
                          },
                          {
                            title: 'Profile Banner Tagline Alignment',
                            desc: 'Headline matches target professional title parameters.',
                            status: 'Pass'
                          }
                        ].map((item, i) => (
                          <div key={i} className="p-3 rounded bg-slate-950/30 border border-slate-850 flex justify-between items-center">
                            <div>
                              <span className="font-bold text-slate-200 block">{item.title}</span>
                              <span className="text-[10px] text-slate-500 leading-normal mt-0.5 block">{item.desc}</span>
                            </div>
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              item.status === 'Pass'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/45'
                                : 'bg-amber-950 text-amber-400 border border-amber-900/45'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 5: ATS PLAIN-TEXT EXPORTER */}
                  {coachSubTab === 'plaintext' && (
                    <div className="space-y-5 animate-fadeIn">
                      <div className="p-3.5 rounded-xl bg-slate-950/30 border border-slate-850 text-xs leading-relaxed space-y-2">
                        <span className="font-bold text-white block">Taleo & Greenhouse Parseable Plaintext</span>
                        <p className="text-[10px] text-slate-400">
                          Jobscan Pro validates that legacy ATS parses (such as Taleo or Workday) can read your details when converted to simple raw plain text. View and copy your optimized plain text below:
                        </p>
                      </div>

                      {/* Plaintext preview container */}
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 font-mono text-[10px] text-slate-400 leading-normal h-64 overflow-y-auto select-text scrollbar-thin">
                        <div className="border-b border-slate-900 pb-2 mb-3 text-slate-200">
                          <div className="font-bold text-xs">{activeData.personal.name.toUpperCase()}</div>
                          <div>{activeData.personal.title} | {activeData.personal.subtitle}</div>
                          <div>Email: {activeData.personal.email} | Phone: {activeData.personal.phone}</div>
                          <div>Location: {activeData.personal.location}</div>
                        </div>

                        <div className="mb-3">
                          <div className="text-slate-200 font-bold border-b border-slate-900 pb-0.5 mb-1.5">PROFESSIONAL EXPERIENCES</div>
                          {activeData.experience.map(exp => (
                            <div key={exp.id} className="mb-2.5">
                              <div className="font-bold text-slate-300">{exp.position} - {exp.company} | {exp.period}</div>
                              <div className="text-[9px] text-slate-500">Location: {exp.location}</div>
                              <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                                {exp.description.map((bullet, i) => <li key={i}>{bullet}</li>)}
                              </ul>
                              <div className="text-[9px] text-slate-500 mt-0.5">Technologies: {exp.technologies.join(', ')}</div>
                            </div>
                          ))}
                        </div>

                        <div className="mb-3">
                          <div className="text-slate-200 font-bold border-b border-slate-900 pb-0.5 mb-1.5">CORE TECH FRAMEWORK SKILLS</div>
                          <div className="leading-relaxed">
                            {resumeData.skills.map(s => `${s.name} (${s.level}%)`).join(', ')}
                          </div>
                        </div>

                        <div className="mb-2">
                          <div className="text-slate-200 font-bold border-b border-slate-900 pb-0.5 mb-1.5">ACADEMICS & EDUCATION</div>
                          {resumeData.education.map(edu => (
                            <div key={edu.id}>
                              <div className="font-bold text-slate-300">{edu.degree} in {edu.fieldOfStudy}</div>
                              <div className="text-[9px] text-slate-500">{edu.institution} | Grade: {edu.grade || 'Not specified'}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Copy to clipboard trigger */}
                      <button
                        onClick={() => {
                          const textBlob = `${resumeData.personal.name.toUpperCase()}\n${resumeData.personal.title} | ${resumeData.personal.subtitle}\nEmail: ${resumeData.personal.email} | Phone: ${resumeData.personal.phone}\nLocation: ${resumeData.personal.location}\n\nPROFESSIONAL EXPERIENCES\n` + 
                            resumeData.experience.map(exp => `${exp.position} - ${exp.company} | ${exp.period}\n` + exp.description.map(b => `• ${b}`).join('\n') + `\nTech: ${exp.technologies.join(', ')}`).join('\n\n') +
                            `\n\nCORE TECHNICAL SKILLS\n` + resumeData.skills.map(s => `${s.name} (${s.level}%)`).join(', ') +
                            `\n\nEDUCATION\n` + resumeData.education.map(edu => `${edu.degree} in ${edu.fieldOfStudy} | ${edu.institution}`).join('\n');
                          
                          setCopiedPlaintext(true);
                          navigator.clipboard.writeText(textBlob);
                          setTimeout(() => setCopiedPlaintext(false), 2500);
                        }}
                        className="w-full bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        {copiedPlaintext ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>Copied Plaintext Resume!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy Plaintext to Clipboard</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Bullet Improver Sandbox */}
                  <div className="border-t border-slate-800 pt-5 space-y-4">
                    <div>
                      <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Action Verb Bullet Improver</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">Transform basic job sentences into premium hiring bullets.</p>
                    </div>

                    <div className="space-y-3">
                      <textarea
                        rows={2}
                        value={bulletInput}
                        onChange={(e) => setBulletInput(e.target.value)}
                        placeholder="Write a boring sentence, e.g. 'I worked on the React website speed stuff' or select from template..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none resize-none"
                      />

                      {/* Presets */}
                      <div className="flex flex-wrap gap-1.5 text-[9px] font-medium">
                        {[
                          { label: 'React Speed Optimization', text: 'I worked on the React website speed stuff' },
                          { label: 'Manager of Developers', text: 'I managed a team of junior developers' },
                          { label: 'Created REST APIs', text: 'I made the REST APIs for the system' },
                          { label: 'Custom Design Library', text: 'I built a custom UI design library' }
                        ].map((preset, i) => (
                          <button
                            key={i}
                            onClick={() => setBulletInput(preset.text)}
                            className="px-2 py-1 rounded bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>

                      {/* Tone / Style selections */}
                      <div className="grid grid-cols-3 gap-2 text-xs font-medium text-center">
                        {[
                          { id: 'impact', label: 'Quantitative Impact' },
                          { id: 'verbs', label: 'Strong Action Verbs' },
                          { id: 'technical', label: 'Deep Technical' }
                        ].map(style => (
                          <button
                            key={style.id}
                            onClick={() => setBulletStyle(style.id as any)}
                            className={`py-1.5 rounded-md border transition-all ${
                              bulletStyle === style.id
                                ? 'bg-indigo-650 border-indigo-500 text-white'
                                : 'border-slate-800 text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            {style.label}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={handleImproveBullet}
                        disabled={!bulletInput.trim()}
                        className="w-full bg-slate-800 hover:bg-slate-750 disabled:bg-slate-900 text-slate-300 disabled:text-slate-600 py-2 rounded-lg text-xs font-bold transition-colors"
                      >
                        Generate Optimized Bullet Variations
                      </button>
                    </div>

                    {/* Results list */}
                    {improvedBullets.length > 0 && (
                      <div className="space-y-2.5 bg-slate-950/40 border border-slate-850 p-3 rounded-xl animate-fadeIn">
                        <span className="text-[9px] font-bold uppercase text-slate-500 block">Action Verb Improver Outputs</span>
                        
                        <div className="space-y-2">
                          {improvedBullets.map((bullet, idx) => (
                            <div key={idx} className="p-2 rounded-lg bg-slate-900 border border-slate-850 flex gap-2 justify-between items-start text-xs">
                              <p className="text-slate-300 leading-relaxed pr-4">{bullet}</p>
                              <button
                                onClick={() => copyToClipboard(bullet, 'bullet', idx)}
                                className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-indigo-400 flex-shrink-0 transition-colors"
                                title="Copy Bullet Point"
                              >
                                {copiedBulletIdx === idx ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* TAB 7: MOCK INBOX */}
              {/* INTERVIEW PREP COACH TAB */}
              {activeTab === 'interview' && (
                <div className="space-y-5 animate-fadeIn">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">🎯 Interview Prep Coach</h2>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">Paste a job description to get a tailored interview plan with real questions, study topics, and a live mock interview simulator.</p>
                  </div>

                  {/* JD Input */}
                  {!interviewPlan && (
                    <div className="space-y-3">
                      {/* AI Provider & API Key Section */}
                      <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden">
                        <button
                          onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                          className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold text-slate-400 hover:text-slate-300 transition-colors"
                        >
                          <span className="flex items-center gap-1.5">
                            {geminiApiKey ? '🟢' : '⚪'} {aiProvider === 'groq' ? 'Groq' : 'Gemini'} API Key {geminiApiKey ? '(Connected)' : '(Optional — Enables AI-Powered Insights)'}
                          </span>
                          <span className="text-slate-600">{showApiKeyInput ? '▲' : '▼'}</span>
                        </button>
                        {showApiKeyInput && (
                          <div className="px-3 pb-3 space-y-2 border-t border-slate-800 pt-2">
                            {/* Provider Toggle */}
                            <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded-lg w-fit">
                              <button
                                onClick={() => { setAiProvider('groq'); localStorage.setItem('ai_provider', 'groq'); setGeminiApiKey(''); localStorage.removeItem('gemini-api-key'); setConnectionTest({ testing: false, result: null }); }}
                                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${aiProvider === 'groq' ? 'bg-green-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                              >🟢 Groq (Recommended)</button>
                              <button
                                onClick={() => { setAiProvider('gemini'); localStorage.setItem('ai_provider', 'gemini'); setGeminiApiKey(''); localStorage.removeItem('gemini-api-key'); setConnectionTest({ testing: false, result: null }); }}
                                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${aiProvider === 'gemini' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                              >🔵 Gemini</button>
                            </div>

                            <p className="text-[10px] text-slate-500 leading-relaxed">
                              {aiProvider === 'groq' ? (
                                <>Groq is <strong className="text-green-400">free with generous limits</strong> (30 req/min). Uses Llama 3.3 70B for high-quality results. <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline">Get a free Groq key →</a></>
                              ) : (
                                <>Gemini uses Google Search grounding when available. Free tier: 15 req/min. <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline">Get a free key →</a></>
                              )}
                            </p>
                            <div className="flex gap-2">
                              <input
                                type="password"
                                value={geminiApiKey}
                                onChange={e => {
                                  const v = e.target.value;
                                  setGeminiApiKey(v);
                                  localStorage.setItem('gemini-api-key', v);
                                  setConnectionTest({ testing: false, result: null });
                                }}
                                placeholder={aiProvider === 'groq' ? 'Paste your Groq API key (gsk_...)' : 'Paste your Gemini API key here...'}
                                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors font-mono"
                              />
                              {geminiApiKey && (
                                <button
                                  onClick={() => { setGeminiApiKey(''); localStorage.removeItem('gemini-api-key'); setConnectionTest({ testing: false, result: null }); }}
                                  className="text-[10px] text-slate-500 hover:text-rose-400 px-2"
                                >Clear</button>
                              )}
                            </div>

                            {/* Test Connection Button */}
                            {geminiApiKey && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={async () => {
                                    setConnectionTest({ testing: true, result: null });
                                    const result = await testApiConnection(geminiApiKey, aiProvider);
                                    setConnectionTest({ testing: false, result });
                                  }}
                                  disabled={connectionTest.testing}
                                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-[10px] font-bold text-slate-300 transition-all flex items-center gap-1.5"
                                >
                                  {connectionTest.testing ? (
                                    <><span className="w-3 h-3 border-2 border-slate-500 border-t-violet-400 rounded-full animate-spin" /> Testing...</>
                                  ) : (
                                    <>🔌 Test Connection</>
                                  )}
                                </button>
                                {connectionTest.result && (
                                  <span className={`text-[10px] font-semibold ${connectionTest.result.ok ? 'text-green-400' : 'text-rose-400'}`}>
                                    {connectionTest.result.message}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Company Name input */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Company Name</label>
                        <input
                          type="text"
                          value={interviewCompanyName}
                          onChange={e => setInterviewCompanyName(e.target.value)}
                          placeholder="e.g. Google, Amazon, Stripe, Infosys..."
                          className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Gemini will search Google for this company's real interview process, questions, and what people do in this role.</p>
                      </div>

                      {/* Position Name input */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Position / Job Title *</label>
                        <input
                          type="text"
                          value={interviewPositionName}
                          onChange={e => setInterviewPositionName(e.target.value)}
                          placeholder="e.g. Senior Software Engineer, Tech Support Specialist, Product Manager..."
                          className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Used to tailor the question bank specifically for your role — a support engineer won't get DSA questions!</p>
                      </div>

                      {/* JD textarea */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Job Description</label>
                        <textarea
                          value={interviewJD}
                          onChange={e => setInterviewJD(e.target.value)}
                          placeholder="Paste the full job description here (include company name, role, requirements, and any culture info)..."
                          className="w-full h-44 bg-slate-950/50 border border-slate-700 rounded-xl p-3 text-xs text-slate-300 placeholder-slate-600 resize-none focus:outline-none focus:border-violet-500 transition-colors"
                        />
                      </div>

                      <button
                        onClick={async () => {
                          if (!interviewPositionName.trim() && !interviewJD.trim()) return;
                          setIsGeneratingPlan(true);
                          setGeminiData(null);
                          setGeminiError('');

                          // Step 1: Generate local plan immediately
                          const plan = generateInterviewPlan(resumeData, interviewPositionName, interviewJD, interviewCompanyName);
                          setTimeout(() => {
                            setInterviewPlan(plan);
                            setIsGeneratingPlan(false);
                            setInterviewSubTab('overview');
                            setMockMode('idle');
                            setMockQuestionIdx(0);
                            setMockTimerSec(0);
                            setMockAnswers({});
                            setMockScores({});
                          }, 600);

                          // Step 2: If API key exists, fetch Gemini enhanced data in parallel
                          if (geminiApiKey.trim()) {
                            setIsFetchingGemini(true);
                            try {
                              const companyForSearch = interviewCompanyName.trim() || plan.context.company;
                              const enhanced = await fetchGeminiInsights(
                                geminiApiKey,
                                companyForSearch,
                                plan.context.role,
                                plan.context.seniority,
                                aiProvider,
                              );
                              if (enhanced) {
                                setGeminiData(enhanced);
                              } else {
                                setGeminiError('Could not fetch data from Google Search. Using local templates.');
                              }
                            } catch (err: any) {
                              setGeminiError(err?.message || 'Gemini API call failed. Check your API key.');
                            } finally {
                              setIsFetchingGemini(false);
                            }
                          }
                        }}
                        disabled={isGeneratingPlan || (!interviewPositionName.trim() && !interviewJD.trim())}
                        className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                      >
                        {isGeneratingPlan ? (
                          <><span className="animate-spin">⏳</span> Generating Interview Plan...</>
                        ) : (
                          <>🎯 Generate My Interview Plan</>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Plan Header */}
                  {interviewPlan && (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-white">{interviewPlan.context.company}</h3>
                          <p className="text-[11px] text-violet-400 font-semibold">{interviewPlan.context.role} · {interviewPlan.context.seniority}</p>
                        </div>
                        <button
                          onClick={() => { setInterviewPlan(null); setInterviewJD(''); setInterviewPositionName(''); setInterviewCompanyName(''); setGeminiData(null); setGeminiError(''); }}
                          className="text-[10px] text-slate-500 hover:text-rose-400 transition-colors border border-slate-700 rounded-lg px-2 py-1"
                        >↩ Reset</button>
                      </div>

                      {/* Sub-tabs */}
                      <div className="flex gap-1 bg-slate-950/40 border border-slate-800 rounded-xl p-1 text-[10px] font-bold overflow-x-auto scrollbar-none">
                        {(['overview', 'questions', 'study-plan', 'mock'] as const).map(tab => (
                          <button
                            key={tab}
                            onClick={() => setInterviewSubTab(tab)}
                            className={`flex-1 py-1.5 px-2 rounded-lg whitespace-nowrap transition-all ${
                              interviewSubTab === tab
                                ? 'bg-violet-600 text-white'
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            {tab === 'overview' ? '🏢 Process' : tab === 'questions' ? '📋 Questions' : tab === 'study-plan' ? '📚 Study Plan' : '🎤 Mock'}
                          </button>
                        ))}
                      </div>

                      {/* OVERVIEW: Interview Process */}
                      {interviewSubTab === 'overview' && (
                        <div className="space-y-3 animate-fadeIn">

                          {/* Gemini Loading Indicator */}
                          {isFetchingGemini && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 animate-pulse">
                              <span className="animate-spin text-sm">🌐</span>
                              <p className="text-[11px] text-blue-300 font-semibold">Searching Google for real data about this role at {interviewPlan.context.company}...</p>
                            </div>
                          )}
                          {geminiError && (
                            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                              <p className="text-[10px] text-amber-400">{geminiError}</p>
                            </div>
                          )}

                          {/* Role Insights Card */}
                          {(() => {
                            const insights = geminiData?.roleInsights?.glance ? geminiData.roleInsights : interviewPlan.roleInsights;
                            const isGemini = !!(geminiData?.roleInsights?.glance);
                            return (
                              <div className={`rounded-xl border overflow-hidden ${isGemini ? 'border-blue-500/30 bg-blue-500/5' : 'border-violet-500/25 bg-violet-500/5'}`}>
                                <div className={`px-4 py-3 border-b ${isGemini ? 'bg-blue-500/10 border-blue-500/20' : 'bg-violet-500/10 border-violet-500/20'}`}>
                                  <div className="flex items-center justify-between">
                                    <p className={`text-[10px] font-black uppercase tracking-wider ${isGemini ? 'text-blue-400' : 'text-violet-400'}`}>🔍 What People Do In This Role</p>
                                    {isGemini && <span className="text-[9px] font-bold bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-full">🌐 Live Google Search</span>}
                                  </div>
                                  <p className="text-xs text-slate-200 font-semibold mt-0.5">{insights.glance}</p>
                                </div>
                                <div className="p-4 space-y-3">
                                  {/* What you do */}
                                  <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Day-to-Day Responsibilities</p>
                                    <ul className="space-y-1">
                                      {insights.whatYouDo.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                                          <span className={`mt-0.5 flex-shrink-0 ${isGemini ? 'text-blue-400' : 'text-violet-400'}`}>▸</span>
                                          {item}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  {/* Typical day */}
                                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                                    <p className="text-[10px] text-amber-400 font-bold mb-1">⏰ Typical Day at {interviewPlan.context.company}</p>
                                    <p className="text-[11px] text-slate-400 leading-relaxed">{insights.typicalDay}</p>
                                  </div>

                                  {/* Key skills + challenges row */}
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <p className="text-[10px] text-emerald-400 font-bold mb-1">✅ Key Skills</p>
                                      <ul className="space-y-0.5">
                                        {insights.keySkills.map((s, i) => (
                                          <li key={i} className="text-[10px] text-slate-400">• {s}</li>
                                        ))}
                                      </ul>
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-rose-400 font-bold mb-1">⚠️ Top Challenges</p>
                                      <ul className="space-y-0.5">
                                        {insights.topChallenges.map((c, i) => (
                                          <li key={i} className="text-[10px] text-slate-400">• {c}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>

                                  {/* Gemini search sources */}
                                  {isGemini && geminiData!.searchSources.length > 0 && (
                                    <div className="pt-1 border-t border-slate-800">
                                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Sources</p>
                                      <div className="flex flex-wrap gap-1">
                                        {geminiData!.searchSources.slice(0, 5).map((src, i) => {
                                          try {
                                            const domain = new URL(src).hostname.replace('www.', '');
                                            return <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="text-[9px] text-blue-400/60 hover:text-blue-300 underline">{domain}</a>;
                                          } catch {
                                            return <span key={i} className="text-[9px] text-slate-450">{src}</span>;
                                          }
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })()}

                          {/* Process overview */}
                          <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider pt-1 flex items-center gap-2">
                            Expected Interview Process
                            {geminiData?.interviewProcess && geminiData.interviewProcess.length > 0 && (
                              <span className="text-[9px] font-bold bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-full">🌐 From Google</span>
                            )}
                          </p>
                          <div className="space-y-2">
                            {(geminiData?.interviewProcess && geminiData.interviewProcess.length > 0 ? geminiData.interviewProcess : interviewPlan.processOverview).map((step, i) => (
                              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                                <span className="text-[11px] font-black text-violet-400 bg-violet-500/10 w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 mt-0.5">{i + 1}</span>
                                <span className="text-xs text-slate-300">{step}</span>
                              </div>
                            ))}
                          </div>
                          <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/20">
                            <p className="text-[11px] text-violet-300 leading-relaxed">💡 <strong>Tip:</strong> Switch to <strong>Questions</strong> to see curated real interview questions by round, or jump to <strong>Mock</strong> to practice answering them live.</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setInterviewSubTab('questions')} className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors">📋 View Questions →</button>
                            <button onClick={() => { setInterviewSubTab('mock'); setMockMode('idle'); setMockQuestionIdx(0); }} className="flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white transition-colors">🎤 Start Mock →</button>
                          </div>
                        </div>
                      )}

                      {/* QUESTIONS: Round-filtered question bank */}
                      {interviewSubTab === 'questions' && (
                        <div className="space-y-3 animate-fadeIn">

                          {/* Gemini Reported Questions */}
                          {geminiData?.reportedQuestions && geminiData.reportedQuestions.length > 0 && (
                            <div className="rounded-xl border border-blue-500/25 bg-blue-500/5 overflow-hidden">
                              <div className="px-3 py-2 bg-blue-500/10 border-b border-blue-500/20 flex items-center justify-between">
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-wider">🌐 Real Interview Questions From Candidates</p>
                                <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-full font-bold">{geminiData.reportedQuestions.length} found</span>
                              </div>
                              <div className="divide-y divide-slate-800/50">
                                {geminiData.reportedQuestions.map((q, i) => (
                                  <div key={i} className="px-3 py-2.5 flex items-start gap-2">
                                    <span className="text-[10px] font-black text-blue-400/60 w-4 flex-shrink-0 mt-0.5">{i + 1}.</span>
                                    <div className="flex-1">
                                      <p className="text-[11px] text-slate-200">{q.question}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-medium">{q.round}</span>
                                        <span className="text-[9px] text-slate-400">Source: {q.source}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Curated question bank header */}
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">📋 Curated Practice Questions by Round</p>

                          {/* Round selector pills */}
                          <div className="flex gap-1.5 flex-wrap">
                            {interviewPlan.rounds.map(r => (
                              <button
                                key={r.round}
                                onClick={() => setActiveRound(r.round)}
                                className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${
                                  activeRound === r.round
                                    ? 'bg-violet-600 text-white border-violet-600'
                                    : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-violet-500 hover:text-slate-200'
                                }`}
                              >
                                {r.emoji} {r.label}
                              </button>
                            ))}
                          </div>

                          {/* Active round description */}
                          {interviewPlan.rounds.filter(r => r.round === activeRound).map(r => (
                            <div key={r.round} className="space-y-2">
                              <p className="text-[11px] text-slate-500 leading-relaxed">{r.description}</p>
                              <p className="text-[10px] text-violet-400 font-bold">{r.questions.length} questions · sorted by difficulty</p>
                              {r.questions.map(q => (
                                <div key={q.id} className={`p-3.5 rounded-xl border space-y-2 ${
                                  q.difficulty === 'hard' ? 'border-rose-800/50 bg-rose-950/10'
                                  : q.difficulty === 'medium' ? 'border-amber-800/50 bg-amber-950/10'
                                  : 'border-emerald-800/50 bg-emerald-950/10'
                                }`}>
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-xs text-slate-200 font-medium leading-relaxed flex-grow">{q.question}</p>
                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded flex-shrink-0 ${
                                      q.difficulty === 'hard' ? 'bg-rose-900/60 text-rose-400'
                                      : q.difficulty === 'medium' ? 'bg-amber-900/60 text-amber-400'
                                      : 'bg-emerald-900/60 text-emerald-400'
                                    }`}>{q.difficulty.toUpperCase()}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-400">📍 {q.source}</p>
                                  <div className="flex gap-2">
                                    {q.hint && (
                                      <button
                                        onClick={() => setHintVisible(p => ({ ...p, [q.id]: !p[q.id] }))}
                                        className="text-[10px] text-violet-400 hover:text-violet-300 font-bold transition-colors"
                                      >💡 {hintVisible[q.id] ? 'Hide Hint' : 'Show Hint'}</button>
                                    )}
                                    <button
                                      onClick={() => {
                                        const roundIdx = interviewPlan.rounds.findIndex(r => r.round === q.round);
                                        const qIdx = interviewPlan.rounds[roundIdx].questions.findIndex(qq => qq.id === q.id);
                                        setMockRound(q.round);
                                        setMockQuestionIdx(qIdx);
                                        setMockMode('answering');
                                        setMockTimerSec(0);
                                        if (mockTimerRef.current) clearInterval(mockTimerRef.current);
                                        mockTimerRef.current = setInterval(() => setMockTimerSec(s => s + 1), 1000);
                                        setInterviewSubTab('mock');
                                      }}
                                      className="text-[10px] text-slate-400 hover:text-white font-bold transition-colors"
                                    >🎤 Practice This</button>
                                    <button
                                      onClick={() => toggleSpeakQuestion(q.id, q.question)}
                                      className={`text-[10px] font-bold transition-colors ${
                                        speakingQId === q.id ? 'text-rose-450 hover:text-rose-400' : 'text-slate-400 hover:text-violet-400'
                                      }`}
                                    >
                                      {speakingQId === q.id ? '⏹ Stop' : '🔊 Listen'}
                                    </button>
                                  </div>
                                  {hintVisible[q.id] && q.hint && (
                                    <div className="mt-1 p-2.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-[11px] text-violet-300 leading-relaxed animate-fadeIn">
                                      {q.hint}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* STUDY PLAN */}
                      {interviewSubTab === 'study-plan' && (
                        <div className="space-y-3 animate-fadeIn">
                          <p className="text-[11px] text-slate-500">Based on your resume vs. the job description, here are your personalized study priorities:</p>
                          {interviewPlan.studyPlan.map((topic, i) => (
                            <div key={i} className={`p-3.5 rounded-xl border space-y-2 ${
                              topic.priority === 'high' ? 'border-rose-800/50 bg-rose-950/10'
                              : topic.priority === 'medium' ? 'border-amber-800/50 bg-amber-950/10'
                              : 'border-emerald-800/50 bg-emerald-950/10'
                            }`}>
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                                  topic.priority === 'high' ? 'bg-rose-900/60 text-rose-400'
                                  : topic.priority === 'medium' ? 'bg-amber-900/60 text-amber-400'
                                  : 'bg-emerald-900/60 text-emerald-400'
                                }`}>{topic.priority.toUpperCase()} PRIORITY</span>
                                <p className="text-xs font-bold text-slate-200">{topic.topic}</p>
                              </div>
                              <p className="text-[11px] text-slate-400 leading-relaxed">{topic.reason}</p>
                              <div className="space-y-1 pt-1">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Resources</p>
                                {topic.resources.map((res, ri) => (
                                  <a key={ri} href={res.url} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-[11px] text-violet-400 hover:text-violet-300 transition-colors">
                                    <span>🔗</span>{res.label}
                                  </a>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* MOCK INTERVIEW SIMULATOR */}
                      {interviewSubTab === 'mock' && (() => {
                        const allRounds = interviewPlan.rounds;
                        const currentRoundData = allRounds.find(r => r.round === mockRound) || allRounds[0];
                        const questions = currentRoundData.questions;
                        const currentQ = questions[mockQuestionIdx];
                        const totalQ = questions.length;
                        const currentScore = currentQ ? mockScores[currentQ.id] : null;
                        const currentAnswer = currentQ ? (mockAnswers[currentQ.id] || '') : '';
                        const timerMins = Math.floor(mockTimerSec / 60).toString().padStart(2, '0');
                        const timerSecs = (mockTimerSec % 60).toString().padStart(2, '0');

                        const startQuestion = (roundType: InterviewRound, idx: number) => {
                          setMockRound(roundType);
                          setMockQuestionIdx(idx);
                          setMockMode('answering');
                          setMockTimerSec(0);
                          setStarSituation('');
                          setStarTask('');
                          setStarAction('');
                          setStarResult('');
                          setStarMode(false);
                          if (mockTimerRef.current) clearInterval(mockTimerRef.current);
                          mockTimerRef.current = setInterval(() => setMockTimerSec(s => s + 1), 1000);
                        };

                        const enableStarMode = () => {
                          const text = currentAnswer.trim();
                          let sit = '';
                          let tsk = '';
                          let act = '';
                          let res = '';

                          if (text.includes('[Situation]') || text.includes('[Task]') || text.includes('[Action]') || text.includes('[Result]')) {
                            const sitMatch = text.match(/\[Situation\]\s*([\s\S]*?)(?=\[Task\]|\[Action\]|\[Result\]|$)/i);
                            const tskMatch = text.match(/\[Task\]\s*([\s\S]*?)(?=\[Situation\]|\[Action\]|\[Result\]|$)/i);
                            const actMatch = text.match(/\[Action\]\s*([\s\S]*?)(?=\[Situation\]|\[Task\]|\[Result\]|$)/i);
                            const resMatch = text.match(/\[Result\]\s*([\s\S]*?)(?=\[Situation\]|\[Task\]|\[Action\]|$)/i);

                            if (sitMatch) sit = sitMatch[1].trim();
                            if (tskMatch) tsk = tskMatch[1].trim();
                            if (actMatch) act = actMatch[1].trim();
                            if (resMatch) res = resMatch[1].trim();
                          } else if (text) {
                            sit = text;
                          }

                          setStarSituation(sit);
                          setStarTask(tsk);
                          setStarAction(act);
                          setStarResult(res);
                          setStarMode(true);
                        };

                        const updateStarAnswer = (sit: string, tsk: string, act: string, res: string) => {
                          if (!currentQ) return;
                          const parts = [];
                          if (sit.trim()) parts.push(`[Situation]\n${sit.trim()}`);
                          if (tsk.trim()) parts.push(`[Task]\n${tsk.trim()}`);
                          if (act.trim()) parts.push(`[Action]\n${act.trim()}`);
                          if (res.trim()) parts.push(`[Result]\n${res.trim()}`);
                          const compiled = parts.join('\n\n');
                          setMockAnswers(p => ({ ...p, [currentQ.id]: compiled }));
                        };

                        const submitAnswer = () => {
                          if (!currentQ || !currentAnswer.trim()) return;
                          if (mockTimerRef.current) clearInterval(mockTimerRef.current);
                          const scored = scoreAnswer(currentQ.question, currentAnswer, currentQ.round);
                          setMockScores(p => ({ ...p, [currentQ.id]: scored }));
                          setMockMode('reviewed');
                        };

                        const nextQuestion = () => {
                          const nextIdx = mockQuestionIdx + 1;
                          if (nextIdx < totalQ) {
                            startQuestion(mockRound, nextIdx);
                          } else {
                            // Check for next round
                            const roundIdx = allRounds.findIndex(r => r.round === mockRound);
                            if (roundIdx + 1 < allRounds.length) {
                              const nextRound = allRounds[roundIdx + 1];
                              startQuestion(nextRound.round, 0);
                            } else {
                              setMockMode('idle');
                            }
                          }
                        };

                        return (
                          <div className="space-y-3 animate-fadeIn">
                            {mockMode === 'idle' && (
                              <div className="space-y-3">
                                <p className="text-[11px] text-slate-400 leading-relaxed">Select a round to begin your mock interview. You'll answer one question at a time and receive AI-scored feedback after each answer.</p>
                                {allRounds.map(r => (
                                  <button
                                    key={r.round}
                                    onClick={() => startQuestion(r.round, 0)}
                                    className="w-full p-3.5 rounded-xl border border-slate-700 bg-slate-900/50 hover:border-violet-500 hover:bg-violet-500/5 transition-all text-left group"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className="text-lg">{r.emoji}</span>
                                        <div>
                                          <p className="text-xs font-bold text-slate-200 group-hover:text-violet-300 transition-colors">{r.label}</p>
                                          <p className="text-[10px] text-slate-500">{r.questions.length} questions</p>
                                        </div>
                                      </div>
                                      <span className="text-[10px] text-violet-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Start →</span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}

                            {(mockMode === 'answering' || mockMode === 'reviewed') && currentQ && (
                              <>
                                {/* Progress */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-violet-400 font-bold">{currentRoundData.emoji} {currentRoundData.label}</span>
                                    <span className="text-[10px] text-slate-400">Q {mockQuestionIdx + 1} / {totalQ}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[11px] font-mono font-bold ${
                                      mockMode === 'answering' ? 'text-violet-400' : 'text-slate-500'
                                    }`}>⏱ {timerMins}:{timerSecs}</span>
                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                                      currentQ.difficulty === 'hard' ? 'bg-rose-900/60 text-rose-400'
                                      : currentQ.difficulty === 'medium' ? 'bg-amber-900/60 text-amber-400'
                                      : 'bg-emerald-900/60 text-emerald-400'
                                    }`}>{currentQ.difficulty.toUpperCase()}</span>
                                  </div>
                                </div>

                                {/* Progress bar */}
                                <div className="w-full h-1 bg-slate-800 rounded-full">
                                  <div
                                    className="h-1 bg-violet-500 rounded-full transition-all"
                                    style={{ width: `${((mockQuestionIdx + 1) / totalQ) * 100}%` }}
                                  />
                                </div>

                                {/* Question card */}
                                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-700 relative group flex justify-between items-start gap-4">
                                  <div className="flex-1">
                                    <p className="text-xs font-medium text-slate-200 leading-relaxed">{currentQ.question}</p>
                                    <p className="text-[10px] text-slate-500 mt-2">📍 {currentQ.source}</p>
                                  </div>
                                  <button
                                    onClick={() => toggleSpeakQuestion(currentQ.id, currentQ.question)}
                                    className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
                                      speakingQId === currentQ.id
                                        ? 'bg-rose-950/40 border-rose-900/50 text-rose-450 animate-pulse shadow-md shadow-rose-950/40'
                                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-violet-450 hover:border-violet-500/50 hover:bg-violet-950/10'
                                    }`}
                                    title={speakingQId === currentQ.id ? 'Stop reading' : 'Read question aloud'}
                                  >
                                    {speakingQId === currentQ.id ? (
                                      <span className="text-xs font-bold">⏹ Stop</span>
                                    ) : (
                                      <span className="text-xs font-bold flex items-center gap-1">🔊 Listen</span>
                                    )}
                                  </button>
                                </div>

                                {/* Answer Mode Selector & Guided Builder */}
                                {mockMode === 'answering' && (
                                  <>
                                    <div className="flex items-center justify-between mb-2">
                                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Answer</label>
                                      <div className="flex p-0.5 bg-slate-955/60 rounded-lg border border-slate-800">
                                        <button
                                          type="button"
                                          onClick={() => setStarMode(false)}
                                          className={`px-2.5 py-1 rounded-md text-[9px] font-bold transition-all ${!starMode ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                          ✍️ Freeform
                                        </button>
                                        <button
                                          type="button"
                                          onClick={enableStarMode}
                                          className={`px-2.5 py-1 rounded-md text-[9px] font-bold transition-all ${starMode ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-350'}`}
                                        >
                                          🧩 Guided STAR
                                        </button>
                                      </div>
                                    </div>

                                    {starMode ? (
                                      <div className="space-y-3.5">
                                        {/* Situation */}
                                        <div className="space-y-1">
                                          <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                              <span className="w-4 h-4 rounded-full bg-blue-550/20 text-blue-400 border border-blue-500/20 flex items-center justify-center text-[9px] font-black">S</span>
                                              Situation
                                            </label>
                                            <span className="text-[9px] text-slate-500">Set the scene & context</span>
                                          </div>
                                          <textarea
                                            value={starSituation}
                                            onChange={e => {
                                              setStarSituation(e.target.value);
                                              updateStarAnswer(e.target.value, starTask, starAction, starResult);
                                            }}
                                            placeholder="What was the situation? (e.g., 'Our service latency spiked by 40% during a traffic spike...')"
                                            className="w-full h-16 bg-slate-950/40 border border-slate-700 focus:border-violet-500 rounded-xl p-2.5 text-xs text-slate-300 placeholder-slate-650 resize-none focus:outline-none transition-colors"
                                          />
                                        </div>

                                        {/* Task */}
                                        <div className="space-y-1">
                                          <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                              <span className="w-4 h-4 rounded-full bg-amber-550/20 text-amber-400 border border-amber-500/20 flex items-center justify-center text-[9px] font-black">T</span>
                                              Task
                                            </label>
                                            <span className="text-[9px] text-slate-500">What was your goal or challenge?</span>
                                          </div>
                                          <textarea
                                            value={starTask}
                                            onChange={e => {
                                              setStarTask(e.target.value);
                                              updateStarAnswer(starSituation, e.target.value, starAction, starResult);
                                            }}
                                            placeholder="What did you need to do? (e.g., 'I was tasked with identifying the bottleneck and reducing latency under 200ms...')"
                                            className="w-full h-16 bg-slate-950/40 border border-slate-700 focus:border-violet-500 rounded-xl p-2.5 text-xs text-slate-300 placeholder-slate-650 resize-none focus:outline-none transition-colors"
                                          />
                                        </div>

                                        {/* Action */}
                                        <div className="space-y-1">
                                          <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                              <span className="w-4 h-4 rounded-full bg-emerald-550/20 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-[9px] font-black">A</span>
                                              Action
                                            </label>
                                            <span className="text-[9px] font-semibold text-violet-400">Most important (60% of answer)</span>
                                          </div>
                                          <textarea
                                            value={starAction}
                                            onChange={e => {
                                              setStarAction(e.target.value);
                                              updateStarAnswer(starSituation, starTask, e.target.value, starResult);
                                            }}
                                            placeholder="What actions did you take? (e.g., 'I profiled the DB queries, added Redis caching, and optimized the indexes...')"
                                            className="w-full h-20 bg-slate-950/40 border border-slate-700 focus:border-violet-500 rounded-xl p-2.5 text-xs text-slate-300 placeholder-slate-650 resize-none focus:outline-none transition-colors"
                                          />
                                        </div>

                                        {/* Result */}
                                        <div className="space-y-1">
                                          <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                              <span className="w-4 h-4 rounded-full bg-rose-555/20 text-rose-450 border border-rose-500/20 flex items-center justify-center text-[9px] font-black">R</span>
                                              Result
                                            </label>
                                            <span className="text-[9px] text-slate-500">Outcome with quantitative metrics</span>
                                          </div>
                                          <textarea
                                            value={starResult}
                                            onChange={e => {
                                              setStarResult(e.target.value);
                                              updateStarAnswer(starSituation, starTask, starAction, e.target.value);
                                            }}
                                            placeholder="What was the result? (e.g., 'We reduced p99 latency by 65% and saved $4k in server costs...')"
                                            className="w-full h-16 bg-slate-950/40 border border-slate-700 focus:border-violet-500 rounded-xl p-2.5 text-xs text-slate-300 placeholder-slate-650 resize-none focus:outline-none transition-colors"
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="relative">
                                        <textarea
                                          value={currentAnswer}
                                          onChange={e => setMockAnswers(p => ({ ...p, [currentQ.id]: e.target.value }))}
                                          placeholder={isRecording ? '🎙️ Listening... speak your answer now' : 'Type your answer here or click the microphone to speak... Use the STAR method for behavioral questions: Situation → Task → Action → Result'}
                                          className={`w-full h-36 bg-slate-950/50 border rounded-xl p-3 pr-12 text-xs text-slate-300 placeholder-slate-600 resize-none focus:outline-none transition-colors ${isRecording ? 'border-red-500 bg-red-950/10' : 'border-slate-700 focus:border-violet-500'}`}
                                        />
                                        {/* Microphone button */}
                                        <button
                                          onClick={() => {
                                            if (isRecording) {
                                              // Stop recording
                                              recognitionRef.current?.stop();
                                              mediaRecorderRef.current?.stop();
                                              setIsRecording(false);
                                            } else {
                                              // Start recording
                                              const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                                              if (!SpeechRecognition) {
                                                alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
                                                return;
                                              }
                                              const recognition = new SpeechRecognition();
                                              recognition.continuous = true;
                                              recognition.interimResults = true;
                                              recognition.lang = 'en-US';
                                              let finalTranscript = currentAnswer;
                                              recognition.onresult = (event: any) => {
                                                let interim = '';
                                                for (let i = event.resultIndex; i < event.results.length; i++) {
                                                  if (event.results[i].isFinal) {
                                                    finalTranscript += (finalTranscript ? ' ' : '') + event.results[i][0].transcript;
                                                  } else {
                                                    interim += event.results[i][0].transcript;
                                                  }
                                                }
                                                setMockAnswers(p => ({ ...p, [currentQ.id]: finalTranscript + (interim ? ' ' + interim : '') }));
                                              };
                                              recognition.onerror = () => setIsRecording(false);
                                              recognition.onend = () => setIsRecording(false);
                                              recognition.start();
                                              recognitionRef.current = recognition;

                                              // Also start audio recording for playback
                                              navigator.mediaDevices.getUserMedia({ audio: true })
                                                .then(stream => {
                                                  const recorder = new MediaRecorder(stream);
                                                  audioChunksRef.current = [];
                                                  recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
                                                  recorder.onstop = () => {
                                                    const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                                                    setAudioUrl(URL.createObjectURL(blob));
                                                    stream.getTracks().forEach(t => t.stop());
                                                  };
                                                  recorder.start();
                                                  mediaRecorderRef.current = recorder;
                                                })
                                                .catch(() => { /* audio recording optional */ });

                                              setIsRecording(true);
                                              setAudioUrl(null);
                                            }
                                          }}
                                          className={`absolute right-2 top-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                            isRecording
                                              ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/40'
                                              : 'bg-slate-800 text-slate-400 hover:bg-violet-600 hover:text-white'
                                          }`}
                                          title={isRecording ? 'Stop recording' : 'Start voice recording'}
                                        >
                                          {isRecording ? '⏹' : '🎙️'}
                                        </button>
                                      </div>
                                    )}

                                    {/* Recording status */}
                                    {isRecording && (
                                      <div className="flex items-center gap-2 text-[10px] text-red-400 font-semibold">
                                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                        Recording... speak your answer clearly. Click ⏹ when done.
                                      </div>
                                    )}

                                    {/* Audio playback */}
                                    {audioUrl && !isRecording && (
                                      <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                                        <span className="text-[10px] text-slate-400 font-bold">🔊 Playback:</span>
                                        <audio src={audioUrl} controls className="h-8 flex-1" style={{ maxHeight: '32px' }} />
                                      </div>
                                    )}

                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => {
                                          if (mockTimerRef.current) clearInterval(mockTimerRef.current);
                                          if (isRecording) { recognitionRef.current?.stop(); mediaRecorderRef.current?.stop(); setIsRecording(false); }
                                          setMockMode('idle');
                                        }}
                                        className="flex-1 py-2 rounded-xl border border-slate-700 text-xs font-bold text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-all"
                                      >✕ Skip</button>
                                      <button
                                        onClick={() => {
                                          if (isRecording) { recognitionRef.current?.stop(); mediaRecorderRef.current?.stop(); setIsRecording(false); }
                                          submitAnswer();
                                        }}
                                        disabled={!currentAnswer.trim()}
                                        className="flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-xs font-bold transition-all"
                                      >✓ Submit Answer</button>
                                    </div>
                                  </>
                                )}

                                {/* Score panel */}
                                {mockMode === 'reviewed' && currentScore && (
                                  <div className="space-y-3 animate-fadeIn">
                                    {/* Score badge */}
                                    <div className={`flex items-center gap-4 p-4 rounded-xl border ${currentScore.color}`}>
                                      <div className="text-center">
                                        <div className="text-3xl font-black">{currentScore.grade}</div>
                                        <div className="text-[10px] font-bold mt-0.5">{currentScore.score}/100</div>
                                      </div>
                                      <p className="text-xs leading-relaxed flex-grow">{currentScore.feedback}</p>
                                    </div>

                                    {/* Strengths */}
                                    {currentScore.strengths.length > 0 && (
                                      <div className="space-y-1.5">
                                        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">✅ Strengths</p>
                                        {currentScore.strengths.map((s, i) => (
                                          <p key={i} className="text-[11px] text-slate-300 bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-2">{s}</p>
                                        ))}
                                      </div>
                                    )}

                                    {/* Improvements */}
                                    {currentScore.improvements.length > 0 && (
                                      <div className="space-y-1.5">
                                        <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">⚠️ Improve</p>
                                        {currentScore.improvements.map((s, i) => (
                                          <p key={i} className="text-[11px] text-slate-300 bg-amber-950/20 border border-amber-900/30 rounded-lg p-2">{s}</p>
                                        ))}
                                      </div>
                                    )}

                                    {/* Sample answer toggle */}
                                    {currentQ.sampleAnswer && (
                                      <>
                                        <button
                                          onClick={() => setSampleVisible(p => ({ ...p, [currentQ.id]: !p[currentQ.id] }))}
                                          className="w-full py-2 border border-slate-700 rounded-xl text-xs font-bold text-slate-400 hover:text-violet-300 hover:border-violet-500 transition-all"
                                        >📝 {sampleVisible[currentQ.id] ? 'Hide' : 'View'} Sample Answer</button>
                                        {sampleVisible[currentQ.id] && (
                                          <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/20 text-[11px] text-violet-200 leading-relaxed animate-fadeIn">
                                            {currentQ.sampleAnswer}
                                          </div>
                                        )}
                                      </>
                                    )}

                                    {/* Next button */}
                                    <button
                                      onClick={nextQuestion}
                                      className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white transition-all"
                                    >
                                      {mockQuestionIdx + 1 < totalQ ? 'Next Question →' : '✓ Finish Round'}
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>
              )}

              {activeTab === 'inbox' && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <h2 className="text-base font-bold text-white">Mock Inbound Leads</h2>
                    <p className="text-xs text-slate-400 mt-1">Inspect mock inquiries received via the contact form in the live portfolio preview.</p>
                  </div>

                  <div className="space-y-3.5">
                    {contactMessages.length > 0 ? (
                      contactMessages.map((msg) => (
                        <div key={msg.id} className="p-4 rounded-xl bg-slate-950/30 border border-slate-800 space-y-2 text-xs relative">
                          {msg.unread && (
                            <span className="absolute top-3 right-3 w-2 h-2 bg-indigo-500 rounded-full"></span>
                          )}
                          
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-slate-200">{msg.name}</h4>
                              <span className="text-[10px] text-slate-500">{msg.email}</span>
                            </div>
                            <span className="text-[9px] text-slate-500 font-semibold">{msg.date}</span>
                          </div>

                          <div className="border-t border-slate-850 pt-2 space-y-1">
                            <span className="font-bold text-indigo-400 block text-[10px] uppercase">Subject: {msg.subject}</span>
                            <p className="text-slate-400 leading-relaxed leading-normal font-normal">
                              {msg.message}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 italic text-center py-8">No submissions yet. Open the preview on the right and try filling out the contact form!</p>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* RIGHT PANEL: INTERACTIVE PORTFOLIO PREVIEW FRAME */}
        <div className={`flex-grow bg-slate-950 flex flex-col overflow-hidden relative ${
          mobileActiveView === 'preview' ? 'flex' : 'hidden lg:flex'
        }`}>
          {/* Preview device controls */}
          <div className="flex-shrink-0 h-12 border-b border-slate-900 bg-slate-950/80 flex items-center justify-between px-6 z-20">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Real-Time Sandbox</span>
            </div>

            {/* Device switches */}
            <div className="flex gap-1 bg-slate-900 p-0.5 rounded-lg text-xs border border-slate-850">
              {[
                { id: 'desktop', icon: Laptop, label: 'Desktop view' },
                { id: 'tablet', icon: Tablet, label: 'Tablet size' },
                { id: 'mobile', icon: Smartphone, label: 'Mobile view' }
              ].map(device => (
                <button
                  key={device.id}
                  onClick={() => setPreviewDevice(device.id as any)}
                  className={`p-1 px-2.5 rounded-md transition-colors flex items-center gap-1 ${
                    previewDevice === device.id
                      ? 'bg-slate-850 text-white'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title={device.label}
                >
                  <device.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[10px]">{device.id.charAt(0).toUpperCase() + device.id.slice(1)}</span>
                </button>
              ))}
            </div>

            <div className="text-[10px] text-slate-500 font-semibold hidden lg:block">
              Interactive Form Inputs Synced Instantly!
            </div>
          </div>

          {/* Scrolling Workspace Content Frame */}
          <div className="flex-grow p-6 md:p-8 overflow-y-auto flex flex-col items-center justify-center gap-4">
            
            {showRevisedPreview && revisedResumeData && (
              <div className="w-full max-w-4xl bg-indigo-900/95 border border-indigo-700 rounded-xl p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-indigo-100 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <span className="p-1 px-2 rounded bg-indigo-950 text-indigo-400 font-bold uppercase text-[9px]">AI ACTIVE PREVIEW</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setHighlightChanges(!highlightChanges)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${highlightChanges ? 'bg-indigo-400 text-indigo-950' : 'bg-indigo-800 text-indigo-300'}`}
                    >
                      {highlightChanges ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      <span>{highlightChanges ? 'Highlighting On' : 'Highlighting Off'}</span>
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={applyRevisedData}
                    className="bg-white text-indigo-950 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-100 transition-colors cursor-pointer shadow-lg"
                  >
                    Apply AI Fixes
                  </button>
                  <button 
                    onClick={() => {
                      setShowRevisedPreview(false);
                      setRevisedResumeData(null);
                      setAppliedFixes([]);
                    }}
                    className="bg-indigo-950/50 text-indigo-300 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-900 transition-colors cursor-pointer border border-indigo-700"
                  >
                    Discard Draft
                  </button>
                </div>
              </div>
            )}

            <div 
              className={`transition-all duration-500 h-full w-full overflow-y-auto border border-slate-850 rounded-2xl shadow-2xl scrollbar-thin ${
                (themeSettings.darkMode || themeSettings.id === 'cyberpunk') ? 'dark' : ''
              } ${
                previewDevice === 'desktop' 
                  ? 'max-w-full' 
                  : previewDevice === 'tablet' 
                  ? 'max-w-3xl' 
                  : 'max-w-[375px]'
              }`}
            >
              <ThemeRenderer 
                data={activeData} 
                originalData={showRevisedPreview && highlightChanges ? resumeData : undefined}
                settings={themeSettings} 
                onContactSubmit={(data) => handleMockContactSubmit(data.name, data.email, data.subject, data.message)}
                previewMode={true} 
                previewDevice={previewDevice}
              />
            </div>

          </div>
        </div>

      </div>



      {/* PDF Export Layout Preview Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-8 bg-slate-900/90 backdrop-blur-md animate-fadeIn print:hidden">
          <div className="w-full max-w-7xl h-full flex flex-col md:flex-row gap-6">
            
            {/* Sidebar Controls */}
            <div className="w-full md:w-80 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shrink-0">
              <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Download className="w-5 h-5 text-emerald-400" />
                  Document Export
                </h2>
                <button 
                  onClick={() => setShowPrintModal(false)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-5 flex-1 overflow-y-auto space-y-6">
                <div>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    Select a professional layout below. When you click download, your browser's print dialog will open—be sure to select <strong className="text-slate-200">Save as PDF</strong>.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { 
                        id: 'classic', 
                        label: 'Classic Serif', 
                        desc: 'Formal & Traditional',
                        icon: '📜',
                        atsScore: 100,
                        atsLevel: 'PERFECT',
                        preview: (
                          <div className="w-full h-full bg-white p-2 font-serif text-[4px] border-t-2 border-slate-900">
                            <div className="text-center mb-1">
                              <div className="font-bold text-[6px]">ALEX RIVERA</div>
                            </div>
                            <div className="border-b border-slate-200 mb-1"></div>
                            <div className="mb-1"><span className="font-bold">Experience:</span> Lead Developer</div>
                            <div className="mb-1"><span className="font-bold">Skills:</span> React, Node.js</div>
                          </div>
                        )
                      },
                      { 
                        id: 'modern', 
                        label: 'Modern Sans', 
                        desc: 'Clean & Efficient',
                        icon: '💎',
                        atsScore: 90,
                        atsLevel: 'EXCELLENT',
                        preview: (
                          <div className="w-full h-full bg-white p-2 font-sans text-[4px]">
                            <div className="flex justify-between border-b-2 border-indigo-600 mb-1 pb-1">
                              <div className="font-black text-[6px] text-slate-900">ALEX R.</div>
                              <div className="text-[3px] text-indigo-600">alex@mail.com</div>
                            </div>
                            <div className="text-[3px] font-bold text-slate-400 mb-1">EXPERIENCE</div>
                            <div className="border-l-2 border-indigo-100 pl-1 mb-1">
                              <div className="font-bold">Senior Engineer</div>
                            </div>
                          </div>
                        )
                      },
                      { 
                        id: 'compact', 
                        label: 'Compact Grid', 
                        desc: 'Space Optimized',
                        icon: '📦',
                        atsScore: 75,
                        atsLevel: 'GOOD',
                        preview: (
                          <div className="w-full h-full bg-white p-1 font-sans text-[3px] grid grid-cols-4 gap-1">
                            <div className="col-span-1 bg-slate-50 p-1 border-r border-slate-100">
                              <div className="font-black text-[5px]">ALEX</div>
                            </div>
                            <div className="col-span-3 p-1">
                              <div className="border-b border-slate-800 mb-1 font-bold">Profile</div>
                              <div className="text-[2px]">High impact results...</div>
                            </div>
                          </div>
                        )
                      },
                      { 
                        id: 'executive', 
                        label: 'Executive', 
                        desc: 'Bold & Authoritative',
                        icon: '🏛️',
                        atsScore: 90,
                        atsLevel: 'EXCELLENT',
                        preview: (
                          <div className="w-full h-full bg-white p-0 font-sans text-[4px]">
                            <div className="bg-slate-900 text-white p-2 mb-1">
                              <div className="font-black text-[6px]">ALEX RIVERA</div>
                            </div>
                            <div className="px-2">
                              <div className="border-b-2 border-slate-900 mb-1 font-bold">LATEST ROLE</div>
                              <div className="text-[3px]">VP of Engineering</div>
                            </div>
                          </div>
                        )
                      },
                      { 
                        id: 'creative', 
                        label: 'Creative', 
                        desc: 'Vibrant & Artistic',
                        icon: '🎨',
                        atsScore: 70,
                        atsLevel: 'MODERATE',
                        preview: (
                          <div className="w-full h-full bg-white p-0 flex font-sans text-[4px]">
                            <div className="w-1/3 bg-slate-900 p-1 text-white">
                              <div className="w-4 h-4 bg-emerald-400 rounded-sm mb-1"></div>
                              <div className="font-bold text-[4px]">ALEX R.</div>
                            </div>
                            <div className="flex-1 p-2">
                              <div className="w-full h-1 bg-emerald-400 mb-2"></div>
                              <div className="font-bold text-slate-900">PROJECTS</div>
                            </div>
                          </div>
                        )
                      },
                      { 
                        id: 'stellar', 
                        label: 'Stellar Tech', 
                        desc: 'Tech-Forward Style',
                        icon: '⭐',
                        atsScore: 65,
                        atsLevel: 'MODERATE',
                        preview: (
                          <div className="w-full h-full bg-slate-950 p-2 font-mono text-[3.5px] text-slate-300">
                            <div className="border border-indigo-500/30 p-1 mb-2">
                              <div className="text-indigo-400 font-bold tracking-tighter">ALEX_RIVERA.v1</div>
                            </div>
                            <div className="text-emerald-400">{">"} EXPERIENCE</div>
                            <div className="pl-2 mt-1 text-[3px]">System Architect @ TechCorp</div>
                          </div>
                        )
                      },
                      { 
                        id: 'minimal', 
                        label: 'Minimal Clean', 
                        desc: 'Ultra Clean & Spacious',
                        icon: '🍃',
                        atsScore: 100,
                        atsLevel: 'PERFECT',
                        preview: (
                          <div className="w-full h-full bg-white p-2 font-sans text-[4px]">
                            <div className="mb-2">
                              <div className="font-light text-[6px]">Alex Rivera</div>
                            </div>
                            <div className="text-slate-400 mb-2 font-normal uppercase tracking-widest text-[4px]">Experience</div>
                          </div>
                        )
                      },
                      { 
                        id: 'original', 
                        label: 'Professional Std', 
                        desc: 'Traditional Corporate',
                        icon: '🏢',
                        atsScore: 100,
                        atsLevel: 'PERFECT',
                        preview: (
                          <div className="w-full h-full bg-white p-2 font-serif text-[4px]">
                            <div className="text-center font-bold text-[6px] border-b border-slate-900 pb-1 mb-1">ALEX RIVERA</div>
                            <div className="font-bold text-[4px] uppercase mb-1">Professional Experience</div>
                          </div>
                        )
                      }
                    ] as const).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setPrintTemplate(t.id)}
                        className={`group relative p-3 rounded-2xl border text-left transition-all duration-300 ${
                          printTemplate === t.id 
                            ? 'bg-indigo-900/40 border-indigo-500 ring-4 ring-indigo-500/20' 
                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-600 hover:bg-slate-800'
                        }`}
                      >
                        <div className="h-20 bg-slate-100 rounded-xl mb-3 overflow-hidden shadow-inner border border-slate-200 group-hover:scale-[1.02] transition-transform">
                          {t.preview}
                        </div>
                        <div className="relative flex justify-between items-start">
                          <div>
                            <div className="font-black text-[11px] text-slate-100 mb-0.5">{t.label}</div>
                            <div className="text-[9px] text-slate-500 font-medium leading-tight mb-2">{t.desc}</div>
                            <div className="flex items-center gap-1">
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md ${
                                t.atsLevel === 'PERFECT' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                t.atsLevel === 'EXCELLENT' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                                'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                              }`}>
                                ATS: {t.atsLevel} ({t.atsScore}%)
                              </span>
                            </div>
                          </div>
                          <span className="text-sm grayscale group-hover:grayscale-0 transition-all">{t.icon}</span>
                        </div>
                        {printTemplate === t.id && (
                          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-900">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Paper Size Selector */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Paper Size</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPaperSize('letter')}
                      className={`flex-1 py-2 rounded-lg border text-xs font-bold transition-all ${
                        paperSize === 'letter'
                          ? 'bg-indigo-900/40 border-indigo-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      US Letter
                    </button>
                    <button
                      onClick={() => setPaperSize('a4')}
                      className={`flex-1 py-2 rounded-lg border text-xs font-bold transition-all ${
                        paperSize === 'a4'
                          ? 'bg-indigo-900/40 border-indigo-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      A4 (International)
                    </button>
                  </div>
                </div>

                {/* Spacing & Page Fit Selector */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Spacing & Page Fit</label>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-semibold">Auto-Fit 1 Page</span>
                      <button
                        type="button"
                        onClick={() => setAutoFitToPage(!autoFitToPage)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          autoFitToPage ? 'bg-indigo-600' : 'bg-slate-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            autoFitToPage ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {[
                      { id: 'normal', label: 'Normal Spacing', desc: 'Standard margins and line height' },
                      { id: 'compact', label: 'Compact Spacing', desc: 'Saves ~10-15% vertical space (prevents 2nd page spill)' },
                      { id: 'tight', label: 'Tight Spacing', desc: 'Maximum compression for dense resumes' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setSpacingDensity(opt.id as any)}
                        className={`w-full p-2.5 rounded-lg border text-left transition-all flex items-center justify-between ${
                          spacingDensity === opt.id
                            ? 'bg-indigo-900/40 border-indigo-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold">{opt.label}</div>
                          <div className="text-[9px] text-slate-500 mt-0.5">{opt.desc}</div>
                        </div>
                        {spacingDensity === opt.id && (
                          <Check className="w-4 h-4 text-indigo-400" />
                        )}
                      </button>
                    ))}
                  </div>

                  {autoFitToPage && printScaleFactor < 1 && (
                    <div className="mt-3 p-2.5 bg-indigo-950/40 border border-indigo-900/40 rounded-xl flex items-center gap-2 text-indigo-300 animate-fadeIn">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 animate-pulse" />
                      <span className="text-[10px] font-medium leading-tight">
                        Auto-scaled to <strong className="text-white">{Math.round(printScaleFactor * 100)}%</strong> to fit everything perfectly on one page.
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-5 border-t border-slate-800 bg-slate-900/50 space-y-4">
                    <button
                      onClick={triggerPdfPrint}
                      disabled={isGeneratingPdf}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-850 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-900/40 transition-all flex justify-center items-center gap-3 active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {isGeneratingPdf ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>GENERATING RESUME PDF...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          <span>DOWNLOAD RESUME (PDF)</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleWordDownload(printTemplate)}
                      disabled={isGeneratingPdf}
                      className="w-full py-3 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 text-slate-300 rounded-2xl text-xs font-bold transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                    >
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span>Export to Word / OpenOffice (.docx)</span>
                    </button>
                    <div className="text-[10px] text-center text-slate-400 mt-1">
                      ✨ Optimized for MS Word, OpenOffice, LibreOffice, & Google Docs
                    </div>
                    <button
                      onClick={() => window.print()}
                      disabled={isGeneratingPdf}
                      className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200 rounded-2xl text-xs font-bold transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                      <span>Open Browser System Printer...</span>
                    </button>
                  
                  {jobDescription && !showRevisedPreview && (
                    <div className="bg-indigo-950/30 border border-indigo-900/50 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-indigo-400 font-bold text-[10px] uppercase tracking-widest">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        <span>AI Optimization Available</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        We can auto-rewrite your bullets to match the target job description while maintaining this exact design.
                      </p>
                      <button
                        onClick={() => {
                          setShowPrintModal(false);
                          setTimeout(() => triggerAIOptimization(), 100);
                        }}
                        className="w-full py-2.5 bg-white text-indigo-950 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-indigo-50 transition-all active:scale-95 shadow-lg"
                      >
                        Optimize for ATS Matches
                      </button>
                    </div>
                  )}
                  {showRevisedPreview && (
                    <div className="bg-emerald-950/40 border border-emerald-900/60 rounded-2xl p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Optimized Copy Active</div>
                        <p className="text-[9px] text-emerald-500/80 leading-tight">Your resume content is now perfectly aligned with the job requirements.</p>
                      </div>
                    </div>
                  )}
                </div>
            </div>

            {/* Live Preview Pane */}
            <div className="flex-1 bg-slate-800/50 border border-slate-800 rounded-2xl overflow-auto">
              <div className="min-h-full flex justify-center p-2 md:p-4">
                <div 
                  ref={previewContainerRef}
                  className={`print-resume-container shadow-2xl transition-all duration-300 pointer-events-none density-${spacingDensity} ${
                    printTemplate === 'classic' ? 'font-serif' : 'font-sans'
                  }`}
                  style={{ 
                    width: paperSize === 'letter' ? '8.5in' : '210mm',
                    minWidth: paperSize === 'letter' ? '8.5in' : '210mm',
                    height: paperSize === 'letter' ? '11in' : '297mm',
                    padding: (printTemplate === 'creative' || printTemplate === 'stellar') ? '0' : '0.5in',
                    background: printTemplate === 'stellar' ? '#020617' : 'white',
                    color: printTemplate === 'stellar' ? '#cbd5e1' : 'black',
                    transform: 'scale(0.9)',
                    transformOrigin: 'top center',
                    overflow: 'hidden',
                    boxSizing: 'border-box'
                  }}
                >
                  <ResumeDocumentTemplate data={activeData} template={printTemplate} />
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Vercel Deployment Modal Overlay */}
      {showVercelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col relative animate-scaleUp">
            {/* Close Button */}
            {(vercelDeployState === 'idle' || vercelDeployState === 'success' || vercelDeployState === 'error') && (
              <button 
                onClick={() => setShowVercelModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white hover:bg-slate-800/50 p-1.5 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className="bg-white text-black p-2 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 fill-current text-black" viewBox="0 0 512 512">
                    <path d="M256,48,496,464H16Z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">One-Click Vercel Deploy</h3>
                  <p className="text-[11px] text-slate-500 font-semibold">Instant Production Serverless Hosting</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 flex-1 flex flex-col overflow-y-auto max-h-[70vh]">
              {/* IDLE / INPUT STATE */}
              {(vercelDeployState === 'idle' || vercelDeployState === 'error') && (
                <div className="space-y-5">
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                    Deploy your high-fidelity React + Vite portfolio website directly to Vercel production. No command lines, git pushes, or configuration files required.
                  </p>

                  {vercelError && (
                    <div className="flex items-start gap-2.5 bg-red-950/40 border border-red-800/40 p-3.5 rounded-xl text-[11px] text-red-200">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-red-100">Deployment Error:</span>
                        <p className="mt-0.5 leading-relaxed text-red-300/90">{vercelError}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Access Token Field */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vercel Personal Access Token</label>
                        <a 
                          href="https://vercel.com/account/tokens" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold underline transition-colors"
                        >
                          Generate Token →
                        </a>
                      </div>
                      <div className="relative">
                        <input
                          type="password"
                          value={vercelToken}
                          onChange={(e) => setVercelToken(e.target.value)}
                          placeholder="paste your vercel token (e.g. v2_...)"
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition-colors"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Your Vercel token is stored safely in your own browser's local storage and used solely to trigger this deployment.
                      </p>
                    </div>

                    {/* Project Name Field */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vercel Project Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={vercelProjectName}
                          onChange={(e) => setVercelProjectName(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                          placeholder="e.g. my-awesome-portfolio"
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition-colors"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
                        <span>Expected subdomain:</span>
                        <span className="font-mono text-indigo-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-850">
                          {vercelProjectName || 'project-name'}.vercel.app
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleVercelDeploy}
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold py-3 rounded-xl text-xs transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 mt-2"
                  >
                    <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 512 512">
                      <path d="M256,48,496,464H16Z"/>
                    </svg>
                    <span>Deploy Portfolio Website</span>
                  </button>
                </div>
              )}

              {/* LOADING / DEPLOYING PROGRESS STATE */}
              {(vercelDeployState === 'preparing' || vercelDeployState === 'deploying' || vercelDeployState === 'polling') && (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-6">
                  {/* Glowing Pulse Spinner */}
                  <div className="relative flex items-center justify-center animate-pulse">
                    <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-xl w-24 h-24 animate-pulse"></div>
                    <div className="relative w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                    <div className="absolute flex items-center justify-center text-black">
                      <svg className="w-6 h-6 fill-current text-indigo-400" viewBox="0 0 512 512">
                        <path d="M256,48,496,464H16Z"/>
                      </svg>
                    </div>
                  </div>

                  <div className="space-y-2 max-w-xs">
                    <h4 className="text-sm font-bold text-white tracking-wide">Publishing Live Portfolio</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      {vercelDeployProgress}
                    </p>
                  </div>

                  {/* Elegant step-by-step indicator */}
                  <div className="w-full max-w-sm border border-slate-800/80 bg-slate-950/20 rounded-2xl p-4.5 text-left space-y-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        vercelDeployState !== 'preparing' 
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-indigo-600 text-white animate-pulse'
                      }`}>
                        {vercelDeployState !== 'preparing' ? '✓' : '1'}
                      </div>
                      <span className={`text-[11px] font-semibold ${vercelDeployState !== 'preparing' ? 'text-slate-300' : 'text-indigo-400 font-bold'}`}>
                        Compiling responsive portfolio modules
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        vercelDeployState === 'polling' || (vercelDeployState as string) === 'success'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : vercelDeployState === 'deploying'
                            ? 'bg-indigo-600 text-white animate-pulse'
                            : 'bg-slate-800 text-slate-500'
                      }`}>
                        {vercelDeployState === 'polling' || (vercelDeployState as string) === 'success' ? '✓' : '2'}
                      </div>
                      <span className={`text-[11px] font-semibold ${
                        vercelDeployState === 'polling' || (vercelDeployState as string) === 'success'
                          ? 'text-slate-300'
                          : vercelDeployState === 'deploying'
                            ? 'text-indigo-400 font-bold'
                            : 'text-slate-500'
                      }`}>
                        Bundling code with Vite and Vercel CDN
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        (vercelDeployState as string) === 'success'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : vercelDeployState === 'polling'
                            ? 'bg-indigo-600 text-white animate-pulse'
                            : 'bg-slate-800 text-slate-500'
                      }`}>
                        {(vercelDeployState as string) === 'success' ? '✓' : '3'}
                      </div>
                      <span className={`text-[11px] font-semibold ${
                        (vercelDeployState as string) === 'success'
                          ? 'text-slate-300'
                          : vercelDeployState === 'polling'
                            ? 'text-indigo-400 font-bold'
                            : 'text-slate-500'
                      }`}>
                        Publishing to edge network domains
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* DEPLOYMENT SUCCESS STATE */}
              {vercelDeployState === 'success' && (
                <div className="space-y-6 py-2">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/5">
                      <Check className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h4 className="text-sm font-extrabold text-white tracking-wide">Deploy Complete!</h4>
                    <p className="text-xs text-slate-400 leading-normal max-w-xs">
                      Your premium portfolio is now live on the Vercel edge CDN globally!
                    </p>
                  </div>

                  {/* Details Card */}
                  <div className="border border-slate-800/80 bg-slate-950/30 rounded-2xl p-5 space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Production URL</label>
                      <div className="flex items-center justify-between gap-3 bg-slate-950 border border-slate-850 rounded-xl p-3">
                        <a 
                          href={vercelDeployUrl}
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-bold underline truncate font-semibold"
                        >
                          {vercelDeployUrl}
                        </a>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(vercelDeployUrl);
                            setCopiedVercelUrl(true);
                            setTimeout(() => setCopiedVercelUrl(false), 2000);
                          }}
                          className="text-slate-400 hover:text-white p-1 rounded transition-colors shrink-0 cursor-pointer"
                          title="Copy Link"
                        >
                          {copiedVercelUrl ? (
                            <Check className="w-4 h-4 text-emerald-400 animate-pulse" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-left border-t border-slate-800/80 pt-4">
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Hosting Platform</span>
                        <span className="text-[11px] font-bold text-slate-200 mt-0.5 block font-semibold">Vercel Edge</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Framework</span>
                        <span className="text-[11px] font-bold text-slate-200 mt-0.5 block font-semibold">Vite + React</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Project Name</span>
                        <span className="text-[11px] font-bold text-slate-200 mt-0.5 block truncate font-semibold">{vercelProjectName}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">SSL Certificate</span>
                        <span className="text-[11px] font-bold text-emerald-400 mt-0.5 block flex items-center gap-1 font-semibold">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                          <span>Active SSL</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <a
                      href={vercelDeployUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold py-3 rounded-xl text-xs transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Visit Live Website</span>
                    </a>
                    <button
                      onClick={() => setShowVercelModal(false)}
                      className="w-full bg-slate-850 hover:bg-slate-800 text-slate-200 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Close Deployment
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Interactive Review Modal Overlay */}
      {showOptimizerModal && revisedResumeData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-900/90 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-6xl h-full max-h-[90vh] flex flex-col relative">
            <button 
              onClick={closeOptimizerModal}
              className="absolute -top-4 -right-4 bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-full shadow-xl transition-all z-[110]"
            >
              <X className="w-5 h-5" />
            </button>
            <ResumeInteractivePreview 
              originalData={resumeData}
              revisedData={revisedResumeData}
              appliedFixes={appliedFixes}
              onApply={applyRevisedData}
              onDiscard={discardRevisedData}
            />
          </div>
        </div>
      )}

      {/* Print-only hidden resume that shows during printing */}
      <div 
        className={`print-resume-container hidden print:block density-${spacingDensity} ${
          printTemplate === 'classic' ? 'font-serif' : 'font-sans'
        }`}
        style={{
          width: paperSize === 'letter' ? '8.5in' : '210mm',
          padding: (printTemplate === 'creative' || printTemplate === 'stellar') ? '0' : '0.5in',
          margin: '0 auto',
          background: printTemplate === 'stellar' ? '#020617' : 'white',
          color: printTemplate === 'stellar' ? '#cbd5e1' : 'black'
        }}
      >
        <ResumeDocumentTemplate data={activeData} template={printTemplate} />
      </div>

      {/* Offscreen container for direct high-fidelity PDF capture */}
      <div 
        id="pdf-render-target"
        className={`density-${spacingDensity} ${
          printTemplate === 'classic' ? 'font-serif' : 'font-sans'
        }`}
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '0',
          width: paperSize === 'letter' ? '8.5in' : '210mm',
          minWidth: paperSize === 'letter' ? '8.5in' : '210mm',
          height: paperSize === 'letter' ? '11in' : '297mm',
          minHeight: paperSize === 'letter' ? '11in' : '297mm',
          padding: (printTemplate === 'creative' || printTemplate === 'stellar') ? '0' : '0.5in',
          background: printTemplate === 'stellar' ? '#020617' : 'white',
          color: printTemplate === 'stellar' ? '#cbd5e1' : 'black',
          overflow: 'hidden',
          boxSizing: 'border-box',
          zIndex: -1000,
          pointerEvents: 'none'
        }}
      >
        <ResumeDocumentTemplate data={activeData} template={printTemplate} />
      </div>

      {/* Dynamic styles injected during printing */}
      <style>{`
        /* Dynamic geometric scaling for absolute page fit on screen preview and printer output */
        .print-resume-container > div,
        #pdf-render-target > div {
          width: ${100 / printScaleFactor}% !important;
          height: ${100 / printScaleFactor}% !important;
          min-height: ${100 / printScaleFactor}% !important;
          transform: scale(${printScaleFactor}) !important;
          transform-origin: top left !important;
          box-sizing: border-box !important;
        }

        @media print {
          @page {
            size: ${paperSize === 'letter' ? 'letter' : 'a4'};
            margin: 0 !important;
          }
          
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: ${printTemplate === 'stellar' ? '#020617' : 'white'} !important;
            width: 100% !important;
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
          }
          
          #app-root-container {
            height: auto !important;
            min-height: auto !important;
            background: transparent !important;
            overflow: visible !important;
          }
          
          #app-root-container > :not(.print-resume-container) {
            display: none !important;
          }
          
          .print-resume-container {
            display: block !important;
            visibility: visible !important;
            position: relative !important;
            width: ${paperSize === 'letter' ? '8.5in' : '210mm'} !important;
            min-height: ${paperSize === 'letter' ? '11in' : '297mm'} !important;
            height: ${paperSize === 'letter' ? '11in' : '297mm'} !important;
            margin: 0 auto !important;
            padding: ${(printTemplate === 'creative' || printTemplate === 'stellar') ? '0' : '0.5in'} !important;
            background: ${printTemplate === 'stellar' ? '#020617' : 'white'} !important;
            color: ${printTemplate === 'stellar' ? '#cbd5e1' : 'black'} !important;
            border: none !important;
            box-shadow: none !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
          }

          .print-resume-container > div,
          #pdf-render-target > div {
            width: ${100 / printScaleFactor}% !important;
            height: ${100 / printScaleFactor}% !important;
            min-height: ${100 / printScaleFactor}% !important;
            transform: scale(${printScaleFactor}) !important;
            transform-origin: top left !important;
            box-sizing: border-box !important;
          }

          /* High-Fidelity print elements page-breaks */
          .print-resume-container li,
          .print-resume-container section,
          .print-resume-container .grid,
          .print-resume-container .space-y-6 > div,
          .print-resume-container .space-y-8 > div,
          .print-resume-container .space-y-10 > div {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
      
      {/* MOBILE BOTTOM VIEW TOGGLER */}
      {!fullscreenPreview && (
        <div className={`lg:hidden flex-shrink-0 h-14 border-t flex items-center justify-around px-4 z-40 ${
          appTheme === 'nord-light'
            ? 'bg-white border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]'
            : appTheme === 'indigo-midnight'
              ? 'bg-[#0c0920] border-[#2b1f63] shadow-[0_-2px_10px_rgba(0,0,0,0.2)]'
              : 'bg-slate-950 border-slate-800 shadow-[0_-2px_10px_rgba(0,0,0,0.3)]'
        }`}>
          <button
            onClick={() => setMobileActiveView('editor')}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-4 rounded-xl transition-all cursor-pointer ${
              mobileActiveView === 'editor'
                ? appTheme === 'nord-light'
                  ? 'text-indigo-650 font-bold font-semibold'
                  : 'text-indigo-400 font-bold font-semibold'
                : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Editor</span>
          </button>
          <button
            onClick={() => setMobileActiveView('preview')}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-4 rounded-xl transition-all cursor-pointer ${
              mobileActiveView === 'preview'
                ? appTheme === 'nord-light'
                  ? 'text-indigo-650 font-bold font-semibold'
                  : 'text-indigo-400 font-bold font-semibold'
                : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            <Smartphone className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Preview</span>
          </button>
        </div>
      )}
    </div>
  );
}
