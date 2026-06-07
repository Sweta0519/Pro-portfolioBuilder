import { create } from 'zustand';
import { ContactMessage } from '../types';

export interface UIState {
  appTheme: 'slate-dark' | 'indigo-midnight' | 'nord-light';
  isThemeMenuOpen: boolean;
  isMobileActionsMenuOpen: boolean;
  leftTab: string;
  rightTab: 'coach' | 'interview' | 'inbox' | 'sandbox';
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  fullscreenPreview: boolean;
  mobileActiveView: 'editor' | 'preview';
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
  vercelDeployState: 'idle' | 'preparing' | 'deploying' | 'polling' | 'success' | 'error';
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
  bulletStyle: 'impact' | 'verbs' | 'technical';
  improvedBullets: string[];
  copiedBulletIdx: number | null;
  jobDescription: string;
  coachSubTab: 'checklist' | 'ats' | 'cover-letter' | 'linkedin' | 'plaintext';
  coverLetter: string;
  copiedPlaintext: boolean;
  set: (update: Partial<UIState> | ((state: UIState) => Partial<UIState>)) => void;
}

export const useUIStore = create<UIState>((set) => ({
  appTheme: (localStorage.getItem('app_theme') as any) || 'slate-dark',
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
  jobDescription: '',
  coachSubTab: 'checklist',
  coverLetter: '',
  copiedPlaintext: false,
  set: (update) => set(update as any),
}));
