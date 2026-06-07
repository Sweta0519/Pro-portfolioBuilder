import { create } from 'zustand';
import { ContactMessage } from '../types';

type Updater<T> = T | ((prev: T) => T);
type FieldSetter<T> = (value: Updater<T>) => void;

export type AppTheme = 'slate-dark' | 'indigo-midnight' | 'nord-light';
export type RightTab = 'coach' | 'interview' | 'inbox' | 'sandbox';
export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';
export type MobileActiveView = 'editor' | 'preview';
export type VercelDeployState = 'idle' | 'preparing' | 'deploying' | 'polling' | 'success' | 'error';
export type CoachSubTab = 'checklist' | 'ats' | 'cover-letter' | 'linkedin' | 'plaintext';
export type BulletStyle = 'impact' | 'verbs' | 'technical';

export interface UIState {
  appTheme: AppTheme;
  isThemeMenuOpen: boolean;
  isMobileActionsMenuOpen: boolean;
  leftTab: string;
  rightTab: RightTab;
  previewDevice: PreviewDevice;
  fullscreenPreview: boolean;
  mobileActiveView: MobileActiveView;
  rawTextImport: string;
  isParsing: boolean;
  importSuccess: boolean;
  copiedCode: boolean;
  uploadedFileName: string;
  fileErrorMessage: string;
  copiedZip: boolean;
  isZipping: boolean;
  showVercelModal: boolean;
  vercelToken: string;
  vercelProjectName: string;
  vercelDeployState: VercelDeployState;
  vercelDeployUrl: string;
  vercelError: string;
  vercelDeployProgress: string;
  copiedVercelUrl: boolean;
  contactMessages: ContactMessage[];
  expandedJobs: { [key: string]: boolean };
  expandedProjects: { [key: string]: boolean };
  expandedEdu: { [key: string]: boolean };
  expandedCert: { [key: string]: boolean };
  bulletInput: string;
  bulletStyle: BulletStyle;
  improvedBullets: string[];
  copiedBulletIdx: number | null;
  copiedQuestionId: string | null;
  jobDescription: string;
  coachSubTab: CoachSubTab;
  coverLetter: string;
  copiedPlaintext: boolean;
  isOnline: boolean;
  showPrintModal: boolean;
  showOptimizerModal: boolean;

  setAppTheme: FieldSetter<AppTheme>;
  setIsThemeMenuOpen: FieldSetter<boolean>;
  setIsMobileActionsMenuOpen: FieldSetter<boolean>;
  setLeftTab: FieldSetter<string>;
  setRightTab: FieldSetter<RightTab>;
  setPreviewDevice: FieldSetter<PreviewDevice>;
  setFullscreenPreview: FieldSetter<boolean>;
  setMobileActiveView: FieldSetter<MobileActiveView>;
  setRawTextImport: FieldSetter<string>;
  setIsParsing: FieldSetter<boolean>;
  setImportSuccess: FieldSetter<boolean>;
  setCopiedCode: FieldSetter<boolean>;
  setUploadedFileName: FieldSetter<string>;
  setFileErrorMessage: FieldSetter<string>;
  setCopiedZip: FieldSetter<boolean>;
  setIsZipping: FieldSetter<boolean>;
  setShowVercelModal: FieldSetter<boolean>;
  setVercelToken: FieldSetter<string>;
  setVercelProjectName: FieldSetter<string>;
  setVercelDeployState: FieldSetter<VercelDeployState>;
  setVercelDeployUrl: FieldSetter<string>;
  setVercelError: FieldSetter<string>;
  setVercelDeployProgress: FieldSetter<string>;
  setCopiedVercelUrl: FieldSetter<boolean>;
  setContactMessages: FieldSetter<ContactMessage[]>;
  setExpandedJobs: FieldSetter<{ [key: string]: boolean }>;
  setExpandedProjects: FieldSetter<{ [key: string]: boolean }>;
  setExpandedEdu: FieldSetter<{ [key: string]: boolean }>;
  setExpandedCert: FieldSetter<{ [key: string]: boolean }>;
  setBulletInput: FieldSetter<string>;
  setBulletStyle: FieldSetter<BulletStyle>;
  setImprovedBullets: FieldSetter<string[]>;
  setCopiedBulletIdx: FieldSetter<number | null>;
  setCopiedQuestionId: FieldSetter<string | null>;
  setJobDescription: FieldSetter<string>;
  setCoachSubTab: FieldSetter<CoachSubTab>;
  setCoverLetter: FieldSetter<string>;
  setCopiedPlaintext: FieldSetter<boolean>;
  setIsOnline: FieldSetter<boolean>;
  setShowPrintModal: FieldSetter<boolean>;
  setShowOptimizerModal: FieldSetter<boolean>;
}

export const useUIStore = create<UIState>((set) => {
  const setter = <K extends keyof UIState>(key: K) =>
    (value: Updater<UIState[K]>) =>
      set((state) => ({
        [key]:
          typeof value === 'function'
            ? (value as (prev: UIState[K]) => UIState[K])(state[key])
            : (value as UIState[K]),
      } as Partial<UIState>));

  return {
    appTheme: (localStorage.getItem('app_theme') as AppTheme) || 'slate-dark',
    isThemeMenuOpen: false,
    isMobileActionsMenuOpen: false,
    leftTab: 'import',
    rightTab: 'coach',
    previewDevice: 'desktop',
    fullscreenPreview: false,
    mobileActiveView: 'editor',
    rawTextImport: '',
    isParsing: false,
    importSuccess: false,
    copiedCode: false,
    uploadedFileName: '',
    fileErrorMessage: '',
    copiedZip: false,
    isZipping: false,
    showVercelModal: false,
    vercelToken: localStorage.getItem('vercel_deploy_token') || '',
    vercelProjectName: '',
    vercelDeployState: 'idle',
    vercelDeployUrl: '',
    vercelError: '',
    vercelDeployProgress: '',
    copiedVercelUrl: false,
    contactMessages: [
      {
        id: 'msg-1',
        name: 'Sarah Jenkins',
        email: 's.jenkins@talentagency.com',
        subject: 'Lead Frontend Opportunity - Linear Tech partner',
        message:
          "Hi Alex, absolutely loved reading through your portfolio! The Zenith Task Orchestrator case study is spectacular. Let's connect for an introductory call next Tuesday at 10 AM PST. - Sarah",
        date: new Date().toLocaleDateString(),
        unread: true,
      },
    ],
    expandedJobs: { 'exp-1': true },
    expandedProjects: { 'proj-1': true },
    expandedEdu: {},
    expandedCert: {},
    bulletInput: '',
    bulletStyle: 'impact',
    improvedBullets: [],
    copiedBulletIdx: null,
    copiedQuestionId: null,
    jobDescription: '',
    coachSubTab: 'checklist',
    coverLetter: '',
    copiedPlaintext: false,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    showPrintModal: false,
    showOptimizerModal: false,

    setAppTheme: setter('appTheme'),
    setIsThemeMenuOpen: setter('isThemeMenuOpen'),
    setIsMobileActionsMenuOpen: setter('isMobileActionsMenuOpen'),
    setLeftTab: setter('leftTab'),
    setRightTab: setter('rightTab'),
    setPreviewDevice: setter('previewDevice'),
    setFullscreenPreview: setter('fullscreenPreview'),
    setMobileActiveView: setter('mobileActiveView'),
    setRawTextImport: setter('rawTextImport'),
    setIsParsing: setter('isParsing'),
    setImportSuccess: setter('importSuccess'),
    setCopiedCode: setter('copiedCode'),
    setUploadedFileName: setter('uploadedFileName'),
    setFileErrorMessage: setter('fileErrorMessage'),
    setCopiedZip: setter('copiedZip'),
    setIsZipping: setter('isZipping'),
    setShowVercelModal: setter('showVercelModal'),
    setVercelToken: setter('vercelToken'),
    setVercelProjectName: setter('vercelProjectName'),
    setVercelDeployState: setter('vercelDeployState'),
    setVercelDeployUrl: setter('vercelDeployUrl'),
    setVercelError: setter('vercelError'),
    setVercelDeployProgress: setter('vercelDeployProgress'),
    setCopiedVercelUrl: setter('copiedVercelUrl'),
    setContactMessages: setter('contactMessages'),
    setExpandedJobs: setter('expandedJobs'),
    setExpandedProjects: setter('expandedProjects'),
    setExpandedEdu: setter('expandedEdu'),
    setExpandedCert: setter('expandedCert'),
    setBulletInput: setter('bulletInput'),
    setBulletStyle: setter('bulletStyle'),
    setImprovedBullets: setter('improvedBullets'),
    setCopiedBulletIdx: setter('copiedBulletIdx'),
    setCopiedQuestionId: setter('copiedQuestionId'),
    setJobDescription: setter('jobDescription'),
    setCoachSubTab: setter('coachSubTab'),
    setCoverLetter: setter('coverLetter'),
    setCopiedPlaintext: setter('copiedPlaintext'),
    setIsOnline: setter('isOnline'),
    setShowPrintModal: setter('showPrintModal'),
    setShowOptimizerModal: setter('showOptimizerModal'),
  };
});
