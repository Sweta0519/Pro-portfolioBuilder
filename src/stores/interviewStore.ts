import { create } from 'zustand';
import {
  InterviewSession,
  InterviewPlan,
  InterviewRound,
  AnswerScore,
  GeminiEnhancedData,
  RecruiterPersona,
  AiProvider
} from '../types';
import { RECRUITER_PERSONAS } from '../interviewCoach';

export interface InterviewState {
  savedSessions: InterviewSession[];
  currentSessionId: string | null;
  interviewPlan: InterviewPlan | null;
  interviewJD: string;
  interviewPositionName: string;
  interviewCompanyName: string;
  interviewSubTab: 'overview' | 'questions' | 'study-plan' | 'mock';
  activeRound: InterviewRound;
  isGeneratingPlan: boolean;
  mockAnswers: Record<string, string>;
  mockScores: Record<string, AnswerScore>;
  mockQuestionIdx: number;
  mockRound: InterviewRound;
  mockMode: 'idle' | 'answering' | 'reviewed';
  mockTimerSec: number;
  hintVisible: Record<string, boolean>;
  sampleVisible: Record<string, boolean>;
  mockInterfaceMode: 'standard' | 'interactive';
  selectedRecruiter: RecruiterPersona;
  recruiterReplies: Record<string, string>;
  isRecruiterSpeaking: boolean;
  isRecruiterTyping: boolean;
  isSessionCompleted: boolean;
  autoPlayVoice: boolean;
  autoActivateMic: boolean;
  sessionSummaryFeedback: string;
  isLoadingSummary: boolean;
  geminiApiKey: string;
  geminiData: GeminiEnhancedData | null;
  isFetchingGemini: boolean;
  aiProgress: string;
  geminiError: string;
  showApiKeyInput: boolean;
  aiProvider: AiProvider;
  openRouterModel: string;
  connectionTest: { testing: boolean; result: { ok: boolean; message: string } | null };
  isRecording: boolean;
  audioUrl: string | null;
  starMode: boolean;
  isStarSplitting: boolean;
  starSituation: string;
  starTask: string;
  starAction: string;
  starResult: string;
  loadingIdealAnswer: boolean;
  idealAnswers: Record<string, string>;
  loadingOptimization: boolean;
  optimizedResults: Record<string, { optimizedAnswer: string; feedback: string }>;
  showIdealAnswer: Record<string, boolean>;
  reportIdealLoadingMap: Record<string, boolean>;
  reportShowIdealMap: Record<string, boolean>;
  recruiterQuestions: any[] | null;
  isLoadingRecruiterQuestions: boolean;
  set: (update: Partial<InterviewState> | ((state: InterviewState) => Partial<InterviewState>)) => void;
}

export const useInterviewStore = create<InterviewState>((set) => {
  const getInitialSessions = () => {
    try {
      const local = localStorage.getItem('pro_portfolio_interview_sessions');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to read saved interview sessions:', e);
    }
    return [];
  };

  const getInitialActiveSession = (sessions: InterviewSession[]) => {
    try {
      const activeId = localStorage.getItem('pro_portfolio_active_session_id');
      if (activeId) {
        return sessions.find((s) => s.id === activeId) || null;
      }
    } catch (e) {
      console.error('Failed to load active session:', e);
    }
    return null;
  };

  const sessions = getInitialSessions();
  const activeSession = getInitialActiveSession(sessions);

  const initialRecruiter = activeSession && activeSession.recruiterPersonaId
    ? RECRUITER_PERSONAS.find((p) => p.id === activeSession.recruiterPersonaId) || RECRUITER_PERSONAS[4]
    : RECRUITER_PERSONAS[4];

  return {
    savedSessions: sessions,
    currentSessionId: activeSession ? activeSession.id : null,
    interviewPlan: activeSession ? activeSession.plan : null,
    interviewJD: activeSession ? activeSession.jobDescription : '',
    interviewPositionName: activeSession ? activeSession.positionName : '',
    interviewCompanyName: activeSession ? activeSession.companyName : '',
    interviewSubTab: activeSession ? (activeSession.isCompleted ? 'mock' : 'overview') : 'overview',
    activeRound: 'hr',
    isGeneratingPlan: false,
    mockAnswers: activeSession ? activeSession.mockAnswers : {},
    mockScores: activeSession ? activeSession.mockScores : {},
    mockQuestionIdx: activeSession ? (activeSession.mockQuestionIdx ?? 0) : 0,
    mockRound: activeSession ? (activeSession.mockRound ?? 'hr') : 'hr',
    mockMode: activeSession ? (activeSession.mockMode ?? 'idle') : 'idle',
    mockTimerSec: 0,
    hintVisible: {},
    sampleVisible: {},
    mockInterfaceMode: activeSession ? activeSession.interfaceMode || 'standard' : 'standard',
    selectedRecruiter: initialRecruiter,
    recruiterReplies: activeSession ? activeSession.recruiterReplies || {} : {},
    isRecruiterSpeaking: false,
    isRecruiterTyping: false,
    isSessionCompleted: activeSession ? activeSession.isCompleted || false : false,
    autoPlayVoice: true,
    autoActivateMic: true,
    sessionSummaryFeedback: activeSession ? activeSession.sessionSummaryFeedback || '' : '',
    isLoadingSummary: false,
    geminiApiKey: localStorage.getItem('gemini-api-key') || '',
    geminiData: activeSession ? activeSession.geminiData || null : null,
    isFetchingGemini: false,
    aiProgress: '',
    geminiError: '',
    showApiKeyInput: false,
    aiProvider: (localStorage.getItem('ai_provider') as any) || 'groq',
    openRouterModel: (() => {
      const stored = localStorage.getItem('openrouter_model');
      return stored || 'google/gemma-4-31b-it:free';
    })(),
    connectionTest: { testing: false, result: null },
    isRecording: false,
    audioUrl: null,
    starMode: false,
    isStarSplitting: false,
    starSituation: '',
    starTask: '',
    starAction: '',
    starResult: '',
    loadingIdealAnswer: false,
    idealAnswers: activeSession ? activeSession.idealAnswers || {} : {},
    loadingOptimization: false,
    optimizedResults: activeSession ? activeSession.optimizedResults || {} : {},
    showIdealAnswer: {},
    reportIdealLoadingMap: {},
    reportShowIdealMap: {},
    recruiterQuestions: activeSession ? activeSession.recruiterQuestions || null : null,
    isLoadingRecruiterQuestions: false,
    set: (update) => set(update as any),
  };
});
