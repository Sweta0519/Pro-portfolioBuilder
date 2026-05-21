export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  techStack: string[];
  link?: string;
  github?: string;
  category: 'Frontend' | 'Backend' | 'Fullstack' | 'Mobile' | 'Design' | 'Other';
  featured: boolean;
  image?: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  period: string;
  current: boolean;
  description: string[];
  technologies: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  period: string;
  grade?: string;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link?: string;
}

export interface Skill {
  name: string;
  level: number; // 1 to 100
  category: 'Frontend' | 'Backend' | 'DevOps/Cloud' | 'Design' | 'Languages' | 'Tools/Other';
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  email?: string;
  portfolio?: string;
}

export interface PersonalInfo {
  name: string;
  title: string;
  subtitle: string;
  bio: string;
  avatar: string; // Base64, URL, or initials code
  email: string;
  phone: string;
  location: string;
  socials: SocialLinks;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  text: string;
  avatar: string;
}

export interface ResumeData {
  personal: PersonalInfo;
  experience: WorkExperience[];
  projects: Project[];
  skills: Skill[];
  education: Education[];
  certificates: Certificate[];
  testimonials: Testimonial[];
}

export interface ThemeSettings {
  id: 'minimal' | 'creative' | 'cyberpunk' | 'classic' | 'gradient';
  primaryColor: 'violet' | 'emerald' | 'blue' | 'amber' | 'rose' | 'slate';
  fontFamily: 'sans' | 'serif' | 'mono';
  darkMode: boolean;
  layout: 'standard' | 'compact' | 'split';
  heroStyle: 'wave' | 'minimal' | 'gradient' | 'geometric';
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  unread: boolean;
}
