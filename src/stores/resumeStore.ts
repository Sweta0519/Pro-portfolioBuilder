import { create } from 'zustand';
import { ResumeData, ThemeSettings } from '../types';
import { defaultResumeData, defaultThemeSettings } from '../sampleData';

export interface ResumeState {
  savedResumes: Array<{
    id: string;
    name: string;
    title: string;
    date: string;
    data: ResumeData;
    theme: ThemeSettings;
  }>;
  resumeData: ResumeData;
  themeSettings: ThemeSettings;
  revisedResumeData: ResumeData | null;
  showRevisedPreview: boolean;
  highlightChanges: boolean;
  appliedFixes: string[];
  set: (update: Partial<ResumeState> | ((state: ResumeState) => Partial<ResumeState>)) => void;
}

export const useResumeStore = create<ResumeState>((set) => {
  const getInitialSavedResumes = () => {
    try {
      const local = localStorage.getItem('pro_portfolio_saved_resumes');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to read saved resumes:', e);
    }
    return [
      {
        id: 'default-rivera',
        name: defaultResumeData.personal.name,
        title: defaultResumeData.personal.title,
        date: new Date().toLocaleDateString(),
        data: defaultResumeData,
        theme: defaultThemeSettings,
      },
    ];
  };

  return {
    savedResumes: getInitialSavedResumes(),
    resumeData: defaultResumeData,
    themeSettings: defaultThemeSettings,
    revisedResumeData: null,
    showRevisedPreview: false,
    highlightChanges: true,
    appliedFixes: [],
    set: (update) => set(update as any),
  };
});
