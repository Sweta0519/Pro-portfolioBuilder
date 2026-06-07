import { create } from 'zustand';
import { ResumeData, ThemeSettings } from '../types';
import { defaultResumeData, defaultThemeSettings } from '../sampleData';

type Updater<T> = T | ((prev: T) => T);
type FieldSetter<T> = (value: Updater<T>) => void;

export interface SavedResume {
  id: string;
  name: string;
  title: string;
  date: string;
  data: ResumeData;
  theme: ThemeSettings;
}

export interface ResumeState {
  savedResumes: SavedResume[];
  resumeData: ResumeData;
  themeSettings: ThemeSettings;
  revisedResumeData: ResumeData | null;
  showRevisedPreview: boolean;
  highlightChanges: boolean;
  appliedFixes: string[];

  setSavedResumes: FieldSetter<SavedResume[]>;
  setResumeData: FieldSetter<ResumeData>;
  setThemeSettings: FieldSetter<ThemeSettings>;
  setRevisedResumeData: FieldSetter<ResumeData | null>;
  setShowRevisedPreview: FieldSetter<boolean>;
  setHighlightChanges: FieldSetter<boolean>;
  setAppliedFixes: FieldSetter<string[]>;
}

const getInitialSavedResumes = (): SavedResume[] => {
  try {
    const local = localStorage.getItem('pro_portfolio_saved_resumes');
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed)) return parsed as SavedResume[];
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

export const useResumeStore = create<ResumeState>((set) => {
  const setter = <K extends keyof ResumeState>(key: K) =>
    (value: Updater<ResumeState[K]>) =>
      set((state) => ({
        [key]:
          typeof value === 'function'
            ? (value as (prev: ResumeState[K]) => ResumeState[K])(state[key])
            : (value as ResumeState[K]),
      } as Partial<ResumeState>));

  return {
    savedResumes: getInitialSavedResumes(),
    resumeData: defaultResumeData,
    themeSettings: defaultThemeSettings,
    revisedResumeData: null,
    showRevisedPreview: false,
    highlightChanges: true,
    appliedFixes: [],

    setSavedResumes: setter('savedResumes'),
    setResumeData: setter('resumeData'),
    setThemeSettings: setter('themeSettings'),
    setRevisedResumeData: setter('revisedResumeData'),
    setShowRevisedPreview: setter('showRevisedPreview'),
    setHighlightChanges: setter('highlightChanges'),
    setAppliedFixes: setter('appliedFixes'),
  };
});
