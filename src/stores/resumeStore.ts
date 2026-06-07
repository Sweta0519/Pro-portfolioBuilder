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
      if (Array.isArray(parsed)) {
        let migratedAny = false;
        // Migrate legacy IDs to UUIDs so they don't crash Supabase
        const migrated = parsed.map((res: any) => {
          if (res.id && !res.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            migratedAny = true;
            return { ...res, id: crypto.randomUUID() };
          }
          return res;
        });
        if (migratedAny) {
          localStorage.setItem('pro_portfolio_saved_resumes', JSON.stringify(migrated));
        }
        return migrated as SavedResume[];
      }
    }
  } catch (e) {
    console.error('Failed to read saved resumes:', e);
  }
  return [
    {
      id: crypto.randomUUID(),
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
      set((state) => {
        const nextValue = typeof value === 'function'
            ? (value as (prev: ResumeState[K]) => ResumeState[K])(state[key])
            : (value as ResumeState[K]);
            
        if (key === 'savedResumes') {
          localStorage.setItem('pro_portfolio_saved_resumes', JSON.stringify(nextValue));
        }
        
        return { [key]: nextValue } as Partial<ResumeState>;
      });

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
