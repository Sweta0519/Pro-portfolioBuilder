import { create } from 'zustand';
import {
  InterviewSession,
  InterviewPlan,
  InterviewRound,
  AnswerScore,
  GeminiEnhancedData,
  RecruiterPersona,
} from '../types';
import type { AiProvider } from '../interviewCoach';
import { RECRUITER_PERSONAS } from '../interviewCoach';

type Updater<T> = T | ((prev: T) => T);
type FieldSetter<T> = (value: Updater<T>) => void;

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

  setSavedSessions: FieldSetter<InterviewSession[]>;
  setCurrentSessionId: FieldSetter<string | null>;
  setInterviewPlan: FieldSetter<InterviewPlan | null>;
  setInterviewJD: FieldSetter<string>;
  setInterviewPositionName: FieldSetter<string>;
  setInterviewCompanyName: FieldSetter<string>;
  setInterviewSubTab: FieldSetter<InterviewState['interviewSubTab']>;
  setActiveRound: FieldSetter<InterviewRound>;
  setIsGeneratingPlan: FieldSetter<boolean>;
  setMockAnswers: FieldSetter<Record<string, string>>;
  setMockScores: FieldSetter<Record<string, AnswerScore>>;
  setMockQuestionIdx: FieldSetter<number>;
  setMockRound: FieldSetter<InterviewRound>;
  setMockMode: FieldSetter<InterviewState['mockMode']>;
  setMockTimerSec: FieldSetter<number>;
  setHintVisible: FieldSetter<Record<string, boolean>>;
  setSampleVisible: FieldSetter<Record<string, boolean>>;
  setMockInterfaceMode: FieldSetter<InterviewState['mockInterfaceMode']>;
  setSelectedRecruiter: FieldSetter<RecruiterPersona>;
  setRecruiterReplies: FieldSetter<Record<string, string>>;
  setIsRecruiterSpeaking: FieldSetter<boolean>;
  setIsRecruiterTyping: FieldSetter<boolean>;
  setIsSessionCompleted: FieldSetter<boolean>;
  setAutoPlayVoice: FieldSetter<boolean>;
  setAutoActivateMic: FieldSetter<boolean>;
  setSessionSummaryFeedback: FieldSetter<string>;
  setIsLoadingSummary: FieldSetter<boolean>;
  setGeminiApiKey: FieldSetter<string>;
  setGeminiData: FieldSetter<GeminiEnhancedData | null>;
  setIsFetchingGemini: FieldSetter<boolean>;
  setAiProgress: FieldSetter<string>;
  setGeminiError: FieldSetter<string>;
  setShowApiKeyInput: FieldSetter<boolean>;
  setAiProvider: FieldSetter<AiProvider>;
  setOpenRouterModel: FieldSetter<string>;
  setConnectionTest: FieldSetter<InterviewState['connectionTest']>;
  setIsRecording: FieldSetter<boolean>;
  setAudioUrl: FieldSetter<string | null>;
  setStarMode: FieldSetter<boolean>;
  setIsStarSplitting: FieldSetter<boolean>;
  setStarSituation: FieldSetter<string>;
  setStarTask: FieldSetter<string>;
  setStarAction: FieldSetter<string>;
  setStarResult: FieldSetter<string>;
  setLoadingIdealAnswer: FieldSetter<boolean>;
  setIdealAnswers: FieldSetter<Record<string, string>>;
  setLoadingOptimization: FieldSetter<boolean>;
  setOptimizedResults: FieldSetter<Record<string, { optimizedAnswer: string; feedback: string }>>;
  setShowIdealAnswer: FieldSetter<Record<string, boolean>>;
  setReportIdealLoadingMap: FieldSetter<Record<string, boolean>>;
  setReportShowIdealMap: FieldSetter<Record<string, boolean>>;
  setRecruiterQuestions: FieldSetter<any[] | null>;
  setIsLoadingRecruiterQuestions: FieldSetter<boolean>;
}

const getInitialSessions = (): InterviewSession[] => {
  try {
    const local = localStorage.getItem('pro_portfolio_interview_sessions');
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed)) {
        // Migrate legacy IDs to UUIDs so they don't crash Supabase
        const migrated = parsed.map((sess: any) => {
          if (sess.id && !sess.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            return { ...sess, id: crypto.randomUUID() };
          }
          return sess;
        });
        return migrated as InterviewSession[];
      }
    }
  } catch (e) {
    console.error('Failed to read saved interview sessions:', e);
  }
  return [];
};

const getInitialActiveSession = (
  sessions: InterviewSession[]
): InterviewSession | null => {
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

export const useInterviewStore = create<InterviewState>((set) => {
  const setter = <K extends keyof InterviewState>(key: K) =>
    (value: Updater<InterviewState[K]>) =>
      set((state) => {
        const nextValue = typeof value === 'function'
            ? (value as (prev: InterviewState[K]) => InterviewState[K])(state[key])
            : (value as InterviewState[K]);
            
        if (key === 'savedSessions') {
          localStorage.setItem('pro_portfolio_interview_sessions', JSON.stringify(nextValue));
        }
        
        return { [key]: nextValue } as Partial<InterviewState>;
      });

  const sessions = getInitialSessions();
  const activeSession = getInitialActiveSession(sessions);

  const initialRecruiter =
    activeSession && activeSession.recruiterPersonaId
      ? RECRUITER_PERSONAS.find((p) => p.id === activeSession.recruiterPersonaId) ||
        RECRUITER_PERSONAS[4]
      : RECRUITER_PERSONAS[4];

  return {
    savedSessions: sessions,
    currentSessionId: activeSession ? activeSession.id : null,
    interviewPlan: activeSession ? activeSession.plan : null,
    interviewJD: activeSession ? activeSession.jobDescription : '',
    interviewPositionName: activeSession ? activeSession.positionName : '',
    interviewCompanyName: activeSession ? activeSession.companyName : '',
    interviewSubTab: activeSession
      ? activeSession.isCompleted
        ? 'mock'
        : 'overview'
      : 'overview',
    activeRound: 'hr',
    isGeneratingPlan: false,
    mockAnswers: activeSession ? activeSession.mockAnswers : {},
    mockScores: activeSession ? activeSession.mockScores : {},
    mockQuestionIdx: activeSession ? activeSession.mockQuestionIdx ?? 0 : 0,
    mockRound: activeSession ? activeSession.mockRound ?? 'hr' : 'hr',
    mockMode: activeSession ? activeSession.mockMode ?? 'idle' : 'idle',
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
    aiProvider: (localStorage.getItem('ai_provider') as AiProvider) || 'groq',
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

    setSavedSessions: setter('savedSessions'),
    setCurrentSessionId: setter('currentSessionId'),
    setInterviewPlan: setter('interviewPlan'),
    setInterviewJD: setter('interviewJD'),
    setInterviewPositionName: setter('interviewPositionName'),
    setInterviewCompanyName: setter('interviewCompanyName'),
    setInterviewSubTab: setter('interviewSubTab'),
    setActiveRound: setter('activeRound'),
    setIsGeneratingPlan: setter('isGeneratingPlan'),
    setMockAnswers: setter('mockAnswers'),
    setMockScores: setter('mockScores'),
    setMockQuestionIdx: setter('mockQuestionIdx'),
    setMockRound: setter('mockRound'),
    setMockMode: setter('mockMode'),
    setMockTimerSec: setter('mockTimerSec'),
    setHintVisible: setter('hintVisible'),
    setSampleVisible: setter('sampleVisible'),
    setMockInterfaceMode: setter('mockInterfaceMode'),
    setSelectedRecruiter: setter('selectedRecruiter'),
    setRecruiterReplies: setter('recruiterReplies'),
    setIsRecruiterSpeaking: setter('isRecruiterSpeaking'),
    setIsRecruiterTyping: setter('isRecruiterTyping'),
    setIsSessionCompleted: setter('isSessionCompleted'),
    setAutoPlayVoice: setter('autoPlayVoice'),
    setAutoActivateMic: setter('autoActivateMic'),
    setSessionSummaryFeedback: setter('sessionSummaryFeedback'),
    setIsLoadingSummary: setter('isLoadingSummary'),
    setGeminiApiKey: setter('geminiApiKey'),
    setGeminiData: setter('geminiData'),
    setIsFetchingGemini: setter('isFetchingGemini'),
    setAiProgress: setter('aiProgress'),
    setGeminiError: setter('geminiError'),
    setShowApiKeyInput: setter('showApiKeyInput'),
    setAiProvider: setter('aiProvider'),
    setOpenRouterModel: setter('openRouterModel'),
    setConnectionTest: setter('connectionTest'),
    setIsRecording: setter('isRecording'),
    setAudioUrl: setter('audioUrl'),
    setStarMode: setter('starMode'),
    setIsStarSplitting: setter('isStarSplitting'),
    setStarSituation: setter('starSituation'),
    setStarTask: setter('starTask'),
    setStarAction: setter('starAction'),
    setStarResult: setter('starResult'),
    setLoadingIdealAnswer: setter('loadingIdealAnswer'),
    setIdealAnswers: setter('idealAnswers'),
    setLoadingOptimization: setter('loadingOptimization'),
    setOptimizedResults: setter('optimizedResults'),
    setShowIdealAnswer: setter('showIdealAnswer'),
    setReportIdealLoadingMap: setter('reportIdealLoadingMap'),
    setReportShowIdealMap: setter('reportShowIdealMap'),
    setRecruiterQuestions: setter('recruiterQuestions'),
    setIsLoadingRecruiterQuestions: setter('isLoadingRecruiterQuestions'),
  };
});
