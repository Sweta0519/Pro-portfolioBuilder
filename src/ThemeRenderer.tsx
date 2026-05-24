import React, { useState, useMemo, useEffect } from 'react';
import { ResumeData, ThemeSettings } from './types';
import { 
  Code, Mail, Phone, MapPin, Sparkles, Menu, X, Trophy
} from 'lucide-react';

const SocialIcon = ({ type, className = "w-5 h-5" }: { type: string, className?: string }) => {
  switch (type.toLowerCase()) {
    case 'github':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
        </svg>
      );
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
          <rect x="2" y="9" width="4" height="12"></rect>
          <circle cx="4" cy="4" r="2"></circle>
        </svg>
      );
    case 'twitter':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
        </svg>
      );
    default:
      return <Code className={className} />;
  }
};

interface ThemeRendererProps {
  data: ResumeData;
  originalData?: ResumeData;
  settings: ThemeSettings;
  onContactSubmit?: (data: { name: string; email: string; subject: string; message: string }) => void;
  previewMode?: boolean;
  previewDevice?: 'desktop' | 'tablet' | 'mobile';
}

// DiffHighlight Component: Highlight strings that differ from original
const DiffHighlight: React.FC<{ 
  current: string; 
  original?: string; 
  children: React.ReactNode;
  inline?: boolean;
}> = ({ current, original, children, inline }) => {
  const isChanged = original !== undefined && current !== original;
  if (!isChanged) return <>{children}</>;

  return (
    <div className={`relative ${inline ? 'inline-block' : 'block'} group`}>
      <div className="absolute -inset-1 bg-amber-400/20 rounded-md ring-1 ring-amber-400/30 animate-pulse-subtle pointer-events-none ai-highlight"></div>
      <div className="relative z-10">{children}</div>
      <div className="absolute -top-6 left-0 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg flex items-center gap-1 ai-badge">
        <Sparkles className="w-2.5 h-2.5" />
        AI ENHANCED
      </div>
    </div>
  );
};

// Section Helper
const ThemeSection: React.FC<{ title: string; id: string; textHeading?: string; children: React.ReactNode }> = ({ 
  title, 
  id, 
  textHeading = 'text-white', 
  children 
}) => (
  <section id={id} className="scroll-mt-20 py-10 scroll-slide">
    <div className="flex items-center gap-4 mb-8">
      <h2 className={`text-2xl md:text-3xl font-black ${textHeading} whitespace-nowrap tracking-tight`}>{title}</h2>
      <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent"></div>
    </div>
    {children}
  </section>
);

export const ThemeRenderer: React.FC<ThemeRendererProps> = ({ 
  data, 
  originalData,
  settings, 
  onContactSubmit,
  previewDevice = 'desktop'
}) => {
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const rc = (classes: string) => {
    if (!previewDevice || previewDevice === 'desktop') return classes;
    return classes.split(/\s+/).filter(cls => {
      if (previewDevice === 'mobile') {
        return !cls.startsWith('sm:') && 
               !cls.startsWith('md:') && 
               !cls.startsWith('lg:') && 
               !cls.startsWith('xl:') && 
               !cls.startsWith('2xl:');
      }
      if (previewDevice === 'tablet') {
        return !cls.startsWith('lg:') && 
               !cls.startsWith('xl:') && 
               !cls.startsWith('2xl:');
      }
      return true;
    }).join(' ');
  };

  const groupedSkills = useMemo(() => {
    return data.skills.reduce((acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill);
      return acc;
    }, {} as Record<string, typeof data.skills>);
  }, [data.skills]);

  useEffect(() => {
    // Dynamically update the sliding page-wipe background to coordinate with the selected primary color
    const colorHex = {
      violet: '#8b5cf6',
      emerald: '#10b981',
      blue: '#3b82f6',
      amber: '#f59e0b',
      rose: '#f43f5e',
      slate: '#64748b'
    }[settings.primaryColor] || '#6366f1';
    document.documentElement.style.setProperty('--primary-bg', colorHex);

    const elements = document.querySelectorAll('.scroll-slide');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    elements.forEach((el) => observer.observe(el));

    // Helper to find scrollable parent
    const getScrollParent = (node: HTMLElement | null): HTMLElement | null => {
      if (node === null) return null;
      if (node.scrollHeight > node.clientHeight) {
        const overflowY = window.getComputedStyle(node).overflowY;
        if (overflowY === 'auto' || overflowY === 'scroll') {
          return node;
        }
      }
      return getScrollParent(node.parentElement);
    };

    // Smooth scroll with custom cubic ease-in-out easing
    const smoothScrollTo = (targetElement: HTMLElement, duration: number = 850) => {
      const scrollParent = getScrollParent(targetElement) || document.documentElement;
      const startPosition = scrollParent.scrollTop;
      
      const parentRect = scrollParent.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
      const relativeTop = targetRect.top - parentRect.top + startPosition;
      
      // Perfect offset to clear header navigations
      const offset = 80;
      const targetPosition = Math.max(0, relativeTop - offset);
      const distance = targetPosition - startPosition;
      
      if (Math.abs(distance) < 2) return;
      
      let startTime: number | null = null;
      
      const ease = (t: number, b: number, c: number, d: number) => {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t * t + b;
        t -= 2;
        return c / 2 * (t * t * t + 2) + b;
      };

      const animation = (currentTime: number) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        scrollParent.scrollTop = run;
        
        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        } else {
          scrollParent.scrollTop = targetPosition;
          targetElement.classList.add('visible');
        }
      };

      requestAnimationFrame(animation);
    };

    // Handle premium sliding navigation on menu clicks (event delegation)
    const handleDocumentClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest('a[href^="#"]');
      if (!link) return;

      const targetId = link.getAttribute('href')?.substring(1);
      if (!targetId || targetId === '') return;

      const targetElement = document.getElementById(targetId);
      if (!targetElement) return;

      e.preventDefault();
      smoothScrollTo(targetElement, 950); // Luxurious 950ms transition
    };

    document.addEventListener('click', handleDocumentClick);

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [settings.id]); // Re-observe and re-bind when theme changes

  // Theme Constants
  const isDark = (settings.darkMode || settings.id === 'cyberpunk') && settings.id !== 'classic';
  const bgColor = isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900';
  const textHeading = isDark ? 'text-white' : 'text-slate-900';
  const textBody = isDark ? 'text-slate-300' : 'text-slate-700';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const sidebarBg = isDark 
    ? 'bg-white/[0.02] border-white/10 shadow-[20px_0_50px_rgba(0,0,0,0.2)]' 
    : 'bg-white border-slate-200/80 shadow-[10px_0_40px_rgba(0,0,0,0.03)]';
  const cardBg = isDark 
    ? 'bg-white/[0.02] border-white/10' 
    : 'bg-white border-slate-200/80 shadow-md shadow-slate-100/50';
  const cardHoverBg = isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-slate-100/40';
  const pillBg = isDark 
    ? 'bg-white/5 border-white/5 text-slate-300' 
    : 'bg-slate-200/60 border-slate-200 text-slate-700';
  const headerBg = isDark ? 'bg-slate-950/80 border-white/5' : 'bg-white/80 border-slate-200/60';
  
  const fontClass = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono'
  }[settings.fontFamily];

  const primaryClass = {
    violet: 'text-violet-400',
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
    amber: 'text-amber-400',
    rose: 'text-rose-400',
    slate: 'text-slate-400'
  }[settings.primaryColor];

  const primaryBg = {
    violet: 'bg-violet-500',
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    slate: 'bg-slate-500'
  }[settings.primaryColor];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onContactSubmit) {
      onContactSubmit(contactForm);
      setContactForm({ name: '', email: '', subject: '', message: '' });
      alert("Message sent successfully!");
    }
  };

  // 1. CREATIVE MORPH THEME (Morphic Sidebar Layout)
  if (settings.id === 'creative') {
    return (
      <div className={`min-h-screen ${bgColor} ${fontClass} relative overflow-hidden transition-colors duration-500`}>
        {/* Animated Fluid Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-20 blur-[120px] ${primaryBg} animate-pulse`}></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-20 blur-[120px] bg-indigo-500 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className={rc("relative z-10 flex flex-col md:flex-row min-h-screen")}>
          {/* Sidebar */}
          <aside className={rc(`w-full md:w-80 md:min-h-screen p-6 md:p-8 md:sticky md:top-0 flex flex-col backdrop-blur-[20px] ${sidebarBg}`)}>
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className={`w-24 h-24 md:w-32 md:h-32 rounded-3xl mb-4 md:mb-6 overflow-hidden border border-slate-200 dark:border-white/20 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 ${primaryBg}/20 flex items-center justify-center text-3xl md:text-4xl font-black ${textHeading} relative group`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {data.personal.avatar.length <= 2 ? (
                  data.personal.avatar
                ) : (
                  <img src={data.personal.avatar} alt={data.personal.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                )}
              </div>
              <h1 className={rc(`text-2xl md:text-3xl font-black ${textHeading} tracking-tight mb-2 leading-tight break-words w-full`)}>{data.personal.name}</h1>
              <p className={`text-xs md:text-sm font-bold uppercase tracking-widest ${primaryClass}`}>{data.personal.title}</p>
              
              <div className="mt-6 md:mt-8 space-y-3 w-full text-left">
                {data.personal.email && (
                  <div className={`flex items-center gap-3 ${textBody} text-xs ${cardBg} p-2.5 md:p-3 rounded-xl border ${cardHoverBg} transition-colors`}>
                    <Mail className={`w-3.5 h-3.5 md:w-4 md:h-4 ${primaryClass} flex-shrink-0`} />
                    <span className="truncate">{data.personal.email}</span>
                  </div>
                )}
                {data.personal.location && (
                  <div className={`flex items-center gap-3 ${textBody} text-xs ${cardBg} p-2.5 md:p-3 rounded-xl border`}>
                    <MapPin className={`w-3.5 h-3.5 md:w-4 md:h-4 ${primaryClass} flex-shrink-0`} />
                    <span className="truncate">{data.personal.location}</span>
                  </div>
                )}
              </div>
            </div>

            <nav className={rc("mt-6 md:mt-12 flex flex-row md:flex-col gap-2 md:space-y-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none justify-start w-full")}>
              {['About', 'Experience', 'Projects', 'Skills', ...(data.certificates && data.certificates.length > 0 ? ['Awards'] : []), 'Contact'].map(item => (
                <a key={item} href={`#${item.toLowerCase()}`} className={`whitespace-nowrap py-1.5 px-3 md:py-2.5 md:px-4 rounded-xl text-slate-500 dark:text-slate-400 hover:${textHeading} hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all text-xs md:text-sm font-bold tracking-wide`}>
                  {item}
                </a>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className={rc("flex-1 p-5 md:p-16 max-w-5xl overflow-hidden")}>
            <section id="about" className="mb-16 md:mb-24 animate-fadeIn scroll-slide scroll-mt-20">
              <h2 className={rc(`text-3xl md:text-6xl font-black ${textHeading} mb-6 md:mb-8 leading-tight tracking-tighter`)}>
                Crafting <span className={`${primaryClass} underline decoration-slate-200 dark:decoration-white/10 decoration-8 underline-offset-4`}>impactful</span> digital products.
              </h2>
              <div className={rc(`backdrop-blur-md ${cardBg} border rounded-2xl md:rounded-3xl p-6 md:p-10 relative overflow-hidden group`)}>
                <div className={`absolute -right-10 -bottom-10 w-40 h-40 ${primaryBg} opacity-5 blur-3xl rounded-full`}></div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Professional Summary</div>
                <DiffHighlight current={data.personal.bio} original={originalData?.personal.bio}>
                  <p className={rc(`text-base md:text-xl ${textBody} leading-relaxed font-medium`)}>
                    {data.personal.bio}
                  </p>
                </DiffHighlight>
                <div className={rc("grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 md:mt-8 pt-6 md:pt-8 border-t border-slate-200 dark:border-white/10")}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${pillBg} border flex items-center justify-center`}>
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Role Target</div>
                      <div className={`text-sm font-bold ${textHeading}`}>{data.personal.title}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${pillBg} border flex items-center justify-center`}>
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Location</div>
                      <div className={`text-sm font-bold ${textHeading}`}>{data.personal.location || "Remote"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <ThemeSection title="Experience" id="experience">
              <div className="space-y-10 md:space-y-12">
                {data.experience.map((exp, idx) => (
                  <div key={idx} className="group relative pl-6 md:pl-8 border-l border-slate-200 dark:border-white/10">
                    <div className={`absolute left-[-5.5px] top-0 w-2.5 h-2.5 rounded-full ${primaryBg} ring-4 ring-slate-100 dark:ring-white/5 transition-all group-hover:scale-150`}></div>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <h3 className={rc(`text-xl md:text-2xl font-bold ${textHeading} tracking-tight`)}>{exp.position}</h3>
                      <span className={`text-xs font-bold ${pillBg} px-3 py-1 rounded-full border`}>{exp.period}</span>
                    </div>
                    <p className={`text-sm md:text-base font-bold ${primaryClass} mb-3 md:mb-4`}>{exp.company}</p>
                    <ul className="space-y-3">
                      {exp.description.map((bullet, bIdx) => (
                        <li key={bIdx} className={`${textMuted} text-xs md:text-sm leading-relaxed flex gap-3`}>
                          <span className={`${primaryClass} mt-1.5 font-black flex-shrink-0`}>→</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </ThemeSection>

            <ThemeSection title="Projects" id="projects">
              <div className={rc("grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8")}>
                {data.projects.map((proj, idx) => (
                  <div key={idx} className={rc(`backdrop-blur-md ${cardBg} border rounded-2xl md:rounded-3xl p-6 md:p-8 ${cardHoverBg} transition-all group relative overflow-hidden flex flex-col`)}>
                    <div className={`absolute -right-4 -top-4 w-24 h-24 ${primaryBg} opacity-5 blur-2xl group-hover:opacity-20 transition-opacity`}></div>
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl mb-4 md:mb-6 ${primaryBg}/20 flex items-center justify-center ${primaryClass} border border-slate-200 dark:border-white/5`}>
                      <Code className="w-6 h-6 md:w-7 md:h-7" />
                    </div>
                    <h3 className={rc(`text-xl md:text-2xl font-bold ${textHeading} mb-2 md:mb-3 tracking-tight`)}>{proj.title}</h3>
                    <p className={rc(`text-xs md:text-sm ${textBody} mb-6 md:mb-8 leading-relaxed line-clamp-4 flex-grow`)}>{proj.description}</p>
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {proj.techStack.map(tech => (
                        <span key={tech} className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest ${pillBg} px-2.5 py-1.5 rounded-lg border`}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ThemeSection>

            <ThemeSection title="Skills" id="skills">
              <div className={rc("grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6")}>
                {data.skills.map(skill => (
                  <div key={skill.name} className={`${cardBg} border rounded-2xl p-5 md:p-6 ${cardHoverBg} transition-all group`}>
                    <div className="flex justify-between items-center mb-3 md:mb-4">
                      <div className={`text-xs md:text-sm font-bold ${textHeading} group-hover:text-indigo-400 transition-colors`}>{skill.name}</div>
                      <span className="text-[10px] text-slate-500 font-black">{skill.level}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${primaryBg} transition-all duration-1000`} 
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </ThemeSection>

            {data.certificates && data.certificates.length > 0 && (
              <ThemeSection title="Awards & Recognitions" id="awards">
                <div className={rc("grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6")}>
                  {data.certificates.map((cert) => (
                    <div key={cert.id} className={`${cardBg} border rounded-2xl p-5 md:p-6 ${cardHoverBg} transition-all group relative overflow-hidden flex items-start gap-4`}>
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 flex items-center justify-center border border-amber-500/20 dark:border-amber-400/20 shrink-0">
                        <Trophy className="w-5 h-5 text-amber-500 dark:text-amber-400 fill-amber-500/20 animate-pulse-subtle" />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{cert.issuer} {cert.date ? `• ${cert.date}` : ''}</div>
                        <h3 className={rc(`text-base md:text-lg font-bold ${textHeading} tracking-tight`)}>{cert.name}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </ThemeSection>
            )}

            <section id="contact" className="py-24 scroll-slide">
              <div className="p-10 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-violet-700 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/20">
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h3 className="text-4xl font-black tracking-tight leading-none">Let's build <br/> something epic.</h3>
                    <p className="text-indigo-100 font-medium">I'm currently available for freelance projects and full-time opportunities.</p>
                    <div className="pt-4 flex gap-4">
                      {data.personal.socials.linkedin && (
                        <a href={data.personal.socials.linkedin} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                          <SocialIcon type="linkedin" />
                        </a>
                      )}
                      {data.personal.socials.twitter && (
                        <a href={data.personal.socials.twitter} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                          <SocialIcon type="twitter" />
                        </a>
                      )}
                      {data.personal.socials.github && (
                        <a href={data.personal.socials.github} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                          <SocialIcon type="github" />
                        </a>
                      )}
                    </div>
                  </div>
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <input type="text" placeholder="Your Name" className="w-full bg-white/10 border-white/10 rounded-2xl p-4 text-sm focus:bg-white/20 outline-none transition-all placeholder:text-white/40" />
                    <textarea placeholder="Your Project Idea" rows={4} className="w-full bg-white/10 border-white/10 rounded-2xl p-4 text-sm focus:bg-white/20 outline-none transition-all placeholder:text-white/40" />
                    <button type="submit" className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl">Send Message</button>
                  </form>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  // 2. GRADIENT GLOW THEME (Centered High-Impact One-Pager)
  if (settings.id === 'gradient') {
    return (
      <div className={`min-h-screen ${bgColor} ${fontClass} relative overflow-hidden flex flex-col items-center transition-colors duration-500`}>
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full opacity-30 blur-[150px] ${primaryBg} animate-pulse`}></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full opacity-30 blur-[150px] bg-indigo-600 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className={rc("container mx-auto px-4 py-16 md:py-32 relative z-10 max-w-4xl flex flex-col items-center")}>
          <header className={rc("text-center mb-16 md:mb-32 animate-fadeIn flex flex-col items-center")}>
            <div className={rc(`inline-block px-4 py-2 rounded-full ${pillBg} border text-[10px] font-black uppercase tracking-[0.3em] ${primaryClass} mb-6 md:mb-12`)}>
              Available for new projects
            </div>
            <h1 className={rc(`text-4xl md:text-8xl lg:text-9xl font-black ${textHeading} tracking-tighter mb-6 md:mb-10 leading-[0.85] break-words w-full px-4`)}>
              {data.personal.name.split(' ')[0]} <br/>
              <span className={`bg-gradient-to-r ${primaryClass.replace('text-', 'from-')} to-indigo-400 bg-clip-text text-transparent break-words`}>
                {data.personal.name.split(' ').slice(1).join(' ') || ''}
              </span>
            </h1>
            <p className={rc(`text-lg md:text-2xl ${textBody} max-w-2xl mx-auto leading-relaxed font-bold tracking-tight px-2`)}>
              {data.personal.subtitle || data.personal.title}
            </p>
            
            <div className={rc("mt-8 md:mt-16 flex flex-wrap justify-center gap-4 md:gap-6 w-full px-4")}>
              <a href="#contact" className={rc(`${primaryBg} text-white font-black px-6 py-4 md:px-10 md:py-5 rounded-full text-xs uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-2xl shadow-indigo-500/20 text-center w-full sm:w-auto`)}>
                Let's Work Together
              </a>
              <a href="#about" className={rc(`backdrop-blur-md ${pillBg} border ${textHeading} font-black px-6 py-4 md:px-10 md:py-5 rounded-full text-xs uppercase tracking-[0.2em] hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-center w-full sm:w-auto`)}>
                About Me
              </a>
            </div>
          </header>

          <div className={rc("w-full space-y-20 md:space-y-40")}>
            <ThemeSection title="About Me" id="about">
              <div className={rc(`relative rounded-[2rem] md:rounded-[3rem] overflow-hidden ${cardBg} border transition-all p-6 md:p-16 flex flex-col md:flex-row gap-6 md:gap-12 items-center`)}>
                <div className="flex-1 space-y-4">
                  <h3 className={rc(`text-2xl md:text-3xl font-black ${textHeading} leading-tight`)}>
                    Behind the <span className={`bg-gradient-to-r ${primaryClass.replace('text-', 'from-')} to-indigo-400 bg-clip-text text-transparent`}>craft</span>.
                  </h3>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Professional Summary</div>
                  <DiffHighlight current={data.personal.bio} original={originalData?.personal.bio}>
                    <p className={rc(`text-base md:text-xl ${textBody} leading-relaxed font-medium`)}>
                      {data.personal.bio}
                    </p>
                  </DiffHighlight>
                </div>
                {data.personal.avatar && (
                  <div className="w-36 h-36 md:w-48 md:h-48 rounded-[2rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl relative group shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-50 group-hover:opacity-0 transition-opacity"></div>
                    {data.personal.avatar.length > 2 ? (
                      <img src={data.personal.avatar} alt={data.personal.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${textHeading} text-5xl md:text-7xl font-black bg-slate-100 dark:bg-white/5`}>
                        {data.personal.avatar}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ThemeSection>

            <ThemeSection title="Professional Path" id="experience">
              <div className={rc("space-y-12 md:space-y-24")}>
                {data.experience.map((exp, idx) => (
                  <div key={idx} className={rc("group grid grid-cols-1 md:grid-cols-[1fr_2.5fr] gap-4 md:gap-12")}>
                    <div className="text-slate-500 text-xs md:text-sm font-black tracking-widest uppercase py-1">
                      {exp.period}
                    </div>
                    <div>
                      <h3 className={rc(`text-xl md:text-3xl font-black ${textHeading} mb-2 md:mb-3 group-hover:text-indigo-400 transition-colors leading-tight`)}>{exp.position}</h3>
                      <p className={rc(`text-sm md:text-lg font-bold ${primaryClass} mb-4 md:mb-8`)}>{exp.company}</p>
                      <div className={rc("space-y-3 md:space-y-6")}>
                        {exp.description.map((bullet, bIdx) => (
                          <p key={bIdx} className={rc(`${textBody} text-sm md:text-lg leading-relaxed font-medium`)}>{bullet}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ThemeSection>

            <ThemeSection title="Selected Projects" id="projects">
              <div className={rc("space-y-10 md:space-y-20")}>
                {data.projects.map((proj, idx) => (
                  <div key={idx} className={rc(`group relative rounded-[2rem] md:rounded-[3rem] overflow-hidden ${cardBg} border transition-all p-6 md:p-16`)}>
                    <div className={`absolute -right-20 -top-20 w-80 h-80 ${primaryBg} opacity-5 blur-[100px] group-hover:opacity-10 transition-opacity`}></div>
                    <div className={`text-[10px] md:text-xs font-black uppercase tracking-[0.3em] ${primaryClass} mb-4 md:mb-6`}>{proj.category || "Project"}</div>
                    <h3 className={rc(`text-2xl md:text-5xl font-black ${textHeading} mb-4 md:mb-8 group-hover:translate-x-3 transition-transform leading-none`)}>{proj.title}</h3>
                    <p className={rc(`text-sm md:text-xl ${textBody} mb-6 md:mb-10 max-w-xl leading-relaxed font-medium`)}>{proj.description}</p>
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      {proj.techStack.map(tech => (
                        <span key={tech} className={`text-[9px] md:text-xs font-bold ${pillBg} border rounded-full px-3 py-1.5 md:px-5 md:py-2 uppercase tracking-wider`}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ThemeSection>

            <ThemeSection title="Technical Skills" id="skills">
              <div className={rc("grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 md:gap-y-16")}>
                {data.skills.map(skill => (
                  <div key={skill.name} className="space-y-3 md:space-y-4">
                    <div className="flex justify-between items-end">
                      <span className={rc(`text-base md:text-xl font-black ${textHeading} tracking-tight`)}>{skill.name}</span>
                      <span className={`text-xs md:text-sm font-black ${primaryClass}`}>{skill.level}%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${primaryBg}`} style={{ width: `${skill.level}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </ThemeSection>

            {data.certificates && data.certificates.length > 0 && (
              <ThemeSection title="Awards & Recognitions" id="awards">
                <div className={rc("grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8")}>
                  {data.certificates.map((cert) => (
                    <div key={cert.id} className={rc(`group relative rounded-[2rem] overflow-hidden ${cardBg} border transition-all p-6 md:p-10 flex gap-6 items-start`)}>
                      <div className={`absolute -right-10 -top-10 w-24 h-24 ${primaryBg} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity`}></div>
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 flex items-center justify-center border border-amber-500/20 dark:border-amber-400/20 shrink-0">
                        <Trophy className="w-6 h-6 md:w-8 md:h-8 text-amber-500 dark:text-amber-400 fill-amber-500/20 animate-pulse-subtle" />
                      </div>
                      <div className="text-left">
                        <div className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-2">{cert.issuer} {cert.date ? `• ${cert.date}` : ''}</div>
                        <h3 className={rc(`text-xl md:text-2xl font-black ${textHeading} leading-none mb-2`)}>{cert.name}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </ThemeSection>
            )}
          </div>
        </div>

        <footer className="w-full py-12 md:py-20 px-6 border-t border-white/5 text-center">
          <p className="text-[10px] md:text-sm font-bold text-slate-500 tracking-widest uppercase">© {new Date().getFullYear()} {data.personal.name} • Design by Antigravity</p>
        </footer>
      </div>
    );
  }

  // 3. STANDARD LAYOUT (Classic, Cyberpunk, Minimal)
  const colors = {
    violet: {
      bg: 'bg-indigo-600',
      text: 'text-indigo-500',
      border: 'border-indigo-500',
      accentBg: 'bg-indigo-50/50 dark:bg-indigo-900/20',
      gradient: 'from-indigo-600 to-violet-600',
      badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
      glow: 'shadow-indigo-500/20 shadow-lg'
    },
    emerald: {
      bg: 'bg-emerald-600',
      text: 'text-emerald-500',
      border: 'border-emerald-500',
      accentBg: 'bg-emerald-50/50 dark:bg-emerald-900/20',
      gradient: 'from-emerald-600 to-teal-600',
      badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
      glow: 'shadow-emerald-500/20 shadow-lg'
    },
    blue: {
      bg: 'bg-blue-600',
      text: 'text-blue-500',
      border: 'border-blue-500',
      accentBg: 'bg-blue-50/50 dark:bg-blue-900/20',
      gradient: 'from-blue-600 to-cyan-600',
      badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
      glow: 'shadow-blue-500/20 shadow-lg'
    },
    amber: {
      bg: 'bg-amber-600',
      text: 'text-amber-500',
      border: 'border-amber-500',
      accentBg: 'bg-amber-50/50 dark:bg-amber-900/20',
      gradient: 'from-amber-600 to-orange-600',
      badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
      glow: 'shadow-amber-500/20 shadow-lg'
    },
    rose: {
      bg: 'bg-rose-600',
      text: 'text-rose-500',
      border: 'border-rose-500',
      accentBg: 'bg-rose-50/50 dark:bg-rose-900/20',
      gradient: 'from-rose-600 to-pink-600',
      badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
      glow: 'shadow-rose-500/20 shadow-lg'
    },
    slate: {
      bg: 'bg-slate-700',
      text: 'text-slate-600',
      border: 'border-slate-600',
      accentBg: 'bg-slate-100 dark:bg-slate-800',
      gradient: 'from-slate-600 to-slate-800',
      badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      glow: 'shadow-slate-500/10 shadow-lg'
    }
  }[settings.primaryColor];

  const renderHero = () => {
    if (settings.id === 'classic') {
      return (
        <div id="about" className="py-12 px-8 border-b-2 border-slate-900 bg-white text-slate-900 font-serif">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-4xl font-bold uppercase tracking-tight">{data.personal.name}</h1>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm font-sans text-slate-600">
              {data.personal.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {data.personal.email}</span>}
              {data.personal.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {data.personal.phone}</span>}
              {data.personal.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {data.personal.location}</span>}
            </div>
            <div className="pt-4 border-t border-slate-200">
              <p className="text-lg font-medium italic text-slate-700">{data.personal.title}</p>
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mt-4 mb-2">Professional Summary</div>
              <DiffHighlight current={data.personal.bio} original={originalData?.personal.bio} inline>
                <p className="text-sm text-slate-600 leading-relaxed max-w-3xl mx-auto mt-2 text-justify">
                  {data.personal.bio}
                </p>
              </DiffHighlight>
            </div>
          </div>
        </div>
      );
    }

    if (settings.id === 'cyberpunk') {
      return (
        <section className="relative h-screen flex items-center justify-center bg-black overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-900/20 via-transparent to-black pointer-events-none"></div>
          
          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
            <div className="inline-block p-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6 backdrop-blur-sm">
              <span className="text-xs font-mono font-bold tracking-widest text-indigo-400 px-4 py-1 uppercase">Initializing System...</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-4 font-mono uppercase">
              {data.personal.name.split(' ')[0]}<span className="text-indigo-500">_</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 font-mono mb-12 max-w-2xl mx-auto">
              <span className="text-emerald-500">{">"}</span> {data.personal.title}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#about" className={`px-8 py-4 ${colors.bg} text-white font-mono font-bold uppercase tracking-widest hover:opacity-80 transition-all border border-white/20 shadow-2xl shadow-indigo-500/40`}>
                Access Data
              </a>
              <a href="#contact" className="px-8 py-4 bg-transparent text-white font-mono font-bold uppercase tracking-widest hover:bg-white/5 transition-all border border-white/20">
                Contact.exe
              </a>
            </div>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white">Scroll to Decrypt</span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent"></div>
          </div>
        </section>
      );
    }

    // Default Minimal Theme Hero
    return (
      <section id="about" className={rc("relative py-12 md:py-32 px-6 md:px-12 overflow-hidden scroll-mt-20")}>
        <div className={rc("max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-center")}>
          <div className={rc("lg:col-span-3 space-y-6 md:space-y-8")}>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-1 ${colors.bg} rounded-full`}></div>
                <span className={`text-xs font-bold uppercase tracking-[0.2em] ${colors.text}`}>{data.personal.title}</span>
              </div>
              <h1 className={rc(`text-4xl md:text-7xl font-black tracking-tighter leading-[0.9] ${textHeading}`)}>
                {data.personal.name}
              </h1>
            </div>
            <div className="space-y-2">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Professional Summary</div>
              <DiffHighlight current={data.personal.bio} original={originalData?.personal.bio}>
                <p className={rc(`text-base md:text-lg ${textBody} leading-relaxed font-medium`)}>
                  {data.personal.bio}
                </p>
              </DiffHighlight>
            </div>
            <div className="flex flex-wrap gap-4 pt-4">
              <a href="#contact" className={`px-6 py-3.5 md:px-8 md:py-4 rounded-2xl text-white font-bold transition-all hover:scale-105 ${colors.bg} ${colors.glow}`}>
                Get in Touch
              </a>
              <div className="flex items-center gap-4 px-6 border-l border-slate-200 dark:border-slate-800 ml-2">
                {data.personal.socials.linkedin && (
                  <a href={data.personal.socials.linkedin} target="_blank" rel="noreferrer" className={`text-slate-500 hover:${textHeading} transition-colors`}>
                    <SocialIcon type="linkedin" />
                  </a>
                )}
                {data.personal.socials.twitter && (
                  <a href={data.personal.socials.twitter} target="_blank" rel="noreferrer" className={`text-slate-500 hover:${textHeading} transition-colors`}>
                    <SocialIcon type="twitter" />
                  </a>
                )}
                {data.personal.socials.github && (
                  <a href={data.personal.socials.github} target="_blank" rel="noreferrer" className={`text-slate-500 hover:${textHeading} transition-colors`}>
                    <SocialIcon type="github" />
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className={rc("lg:col-span-2 relative")}>
            <div className={rc(`aspect-square max-w-[280px] mx-auto lg:max-w-none rounded-[2rem] bg-gradient-to-br ${colors.gradient} shadow-2xl relative z-10 overflow-hidden group`)}>
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
              {data.personal.avatar.length > 2 ? (
                <img src={data.personal.avatar} alt={data.personal.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-6xl md:text-8xl font-black">
                  {data.personal.avatar}
                </div>
              )}
            </div>
            <div className={`absolute -bottom-8 -right-8 w-40 h-40 ${colors.bg} opacity-20 blur-3xl rounded-full`}></div>
          </div>
        </div>
      </section>
    );
  };

  const isClassic = settings.id === 'classic';

  return (
    <div className={`min-h-screen ${bgColor} ${fontClass} transition-colors duration-500 flex flex-col`}>
      {/* Dynamic Header */}
      {!isClassic && (
        <header className={`sticky top-0 z-50 backdrop-blur-lg ${headerBg} px-6 py-4`}>
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center text-white font-black text-xs`}>
                {data.personal.name.substring(0, 1)}
              </div>
              <span className={`text-sm font-black tracking-tight ${textHeading} uppercase`}>{data.personal.name}</span>
            </div>
            
            {/* Desktop Navigation Menu */}
            <nav className={rc("hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-slate-500")}>
              <a href="#about" className={`hover:${textHeading} transition-colors`}>About</a>
              <a href="#experience" className={`hover:${textHeading} transition-colors`}>Experience</a>
              <a href="#projects" className={`hover:${textHeading} transition-colors`}>Projects</a>
              <a href="#skills" className={`hover:${textHeading} transition-colors`}>Skills</a>
              {data.certificates && data.certificates.length > 0 && (
                <a href="#awards" className={`hover:${textHeading} transition-colors`}>Awards</a>
              )}
              <a href="#contact" className={`px-4 py-2 rounded-xl ${colors.bg} text-white hover:opacity-85 hover:scale-[1.03] transition-all text-[10px]`}>Hire Me</a>
            </nav>

            {/* Premium Hamburger Menu Button for Mobile Viewports */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={rc(`md:hidden p-2 rounded-xl text-slate-500 hover:${textHeading} hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all`)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Premium Mobile Side Drawer Menu Overlay */}
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <div 
                onClick={() => setIsMobileMenuOpen(false)}
                className={rc(`md:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[110] transition-opacity duration-300 animate-fadeIn`)}
              />
              {/* Drawer Container */}
              <div 
                className={rc(`md:hidden fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] ${isDark ? 'bg-slate-950 border-l border-white/10 text-white' : 'bg-white border-l border-slate-200 text-slate-900'} shadow-2xl z-[120] p-6 flex flex-col justify-between transform transition-transform duration-300 ease-out animate-slideInRight`)}
              >
                <div className="space-y-8">
                  {/* Close and Header */}
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg ${colors.bg} flex items-center justify-center text-white font-black text-[10px]`}>
                        {data.personal.name.substring(0, 1)}
                      </div>
                      <span className="text-xs font-black tracking-tight uppercase">Navigation</span>
                    </div>
                    <button 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2 rounded-xl text-slate-500 hover:bg-slate-150 dark:hover:bg-white/5 transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Navigation Links */}
                  <nav className="flex flex-col space-y-2">
                    {['About', 'Experience', 'Projects', 'Skills', ...(data.certificates && data.certificates.length > 0 ? ['Awards'] : [])].map((item) => (
                      <a 
                        key={item} 
                        href={`#${item.toLowerCase()}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-slate-300 hover:text-white border-white/5' : 'text-slate-600 hover:text-slate-900 border-slate-100'} hover:translate-x-1.5 transition-all py-3.5 border-b last:border-0 flex items-center justify-between group`}
                      >
                        <span>{item}</span>
                        <span className={`opacity-0 group-hover:opacity-100 transition-opacity text-xs ${colors.text}`}>→</span>
                      </a>
                    ))}
                  </nav>
                </div>

                {/* Footer Action */}
                <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-white/5">
                  <a 
                    href="#contact"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`w-full py-4 rounded-2xl ${colors.bg} ${colors.glow} text-white font-black uppercase tracking-widest text-[10px] text-center block transition-all hover:opacity-90 active:scale-[0.98] shadow-lg`}
                  >
                    Hire Me
                  </a>
                </div>
              </div>
            </>
          )}
        </header>
      )}

      {renderHero()}

      <main className={rc(`flex-grow max-w-5xl mx-auto px-6 py-12 md:py-24 space-y-16 md:space-y-32 w-full ${isClassic ? 'bg-white text-slate-900 font-serif max-w-4xl py-12' : ''}`)}>
        {settings.id === 'cyberpunk' && (
          <section id="about" className="scroll-mt-24 scroll-slide">
            <div className="flex items-center gap-4 mb-12">
              <h2 className="text-3xl font-black font-mono tracking-tight text-white uppercase">
                <span className="text-indigo-500">//</span> SYSTEM_SUMMARY
              </h2>
            </div>
            <div className="p-8 rounded-3xl bg-black border border-indigo-500/30 hover:border-indigo-400 relative overflow-hidden group font-mono">
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-indigo-500/10 border-b border-l border-indigo-500/30 text-[10px] text-indigo-400 uppercase tracking-widest font-bold">
                STATUS: DECRYPTED
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="text-emerald-500">guest@antigravity:~$</span> cat bio.txt
                </div>
                <DiffHighlight current={data.personal.bio} original={originalData?.personal.bio}>
                  <p className="text-slate-300 text-lg leading-relaxed font-sans font-medium">
                    {data.personal.bio}
                  </p>
                </DiffHighlight>
                <div className="pt-6 border-t border-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex gap-2">
                    <span className="text-indigo-400 font-bold">TARGET_ROLE:</span>
                    <span className="text-slate-400">{data.personal.title}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-indigo-400 font-bold">GEO_LOC:</span>
                    <span className="text-slate-400">{data.personal.location || "REMOTE_ACCESS"}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        <section id="experience" className="scroll-mt-24 scroll-slide">
          <div className="flex items-center gap-4 mb-12">
            <h2 className={`text-3xl font-black tracking-tight ${isClassic ? 'text-xl uppercase border-b-2 border-slate-900 pb-1 w-full' : textHeading}`}>
              {isClassic ? 'Professional Experience' : 'Work History'}
            </h2>
          </div>
          <div className="space-y-16">
            {data.experience.map((exp, idx) => (
              <div key={idx} className={isClassic ? '' : `group relative pl-8 border-l border-slate-200 dark:border-white/5 hover:border-indigo-500/30 transition-colors`}>
                {!isClassic && <div className={`absolute left-[-4px] top-0 w-2 h-2 rounded-full ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity`}></div>}
                <div className="flex flex-wrap justify-between items-baseline mb-2 gap-2">
                  <h3 className={`text-2xl font-bold ${isClassic ? 'text-slate-900' : textHeading}`}>{exp.position}</h3>
                  <span className="text-sm font-bold text-slate-500 tabular-nums">{exp.period}</span>
                </div>
                <div className={`text-lg font-bold ${isClassic ? 'text-slate-800 mb-4' : `${colors.text} mb-6`}`}>{exp.company} • <span className="font-medium opacity-60">{exp.location}</span></div>
                <ul className="space-y-3">
                  {exp.description.map((bullet, bIdx) => (
                    <li key={bIdx} className={`text-base leading-relaxed ${isClassic ? 'text-slate-700 list-disc ml-5' : `${textBody} flex gap-3`}`}>
                      {!isClassic && <span className={`${colors.text} font-black`}>•</span>}
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section id="projects" className="scroll-mt-24 scroll-slide">
          <div className="flex items-center gap-4 mb-12">
            <h2 className={`text-3xl font-black tracking-tight ${isClassic ? 'text-xl uppercase border-b-2 border-slate-900 pb-1 w-full' : textHeading}`}>
              {isClassic ? 'Selected Projects' : 'Featured Work'}
            </h2>
          </div>
          <div className={rc("grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8")}>
            {data.projects.map((proj, idx) => (
              <div key={idx} className={isClassic ? 'border-b border-slate-100 pb-8 last:border-0' : `p-6 md:p-8 rounded-3xl ${cardBg} border ${cardHoverBg} transition-all group`}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className={`text-xl font-bold ${isClassic ? 'text-slate-900' : `${textHeading} group-hover:text-indigo-400 transition-colors`}`}>{proj.title}</h3>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{proj.category}</span>
                </div>
                <p className={`text-base mb-6 leading-relaxed ${isClassic ? 'text-slate-700' : textBody}`}>{proj.description}</p>
                <div className="flex flex-wrap gap-2">
                  {proj.techStack.map(tech => (
                    <span key={tech} className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${isClassic ? 'bg-slate-100 text-slate-600' : `${pillBg} border`}`}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className={rc("grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20")}>
          <section id="education">
            <h2 className={`text-2xl font-black mb-10 ${isClassic ? 'text-lg uppercase border-b-2 border-slate-900 pb-1' : textHeading}`}>Education</h2>
            <div className="space-y-8">
              {data.education.map((edu, idx) => (
                <div key={idx}>
                  <h3 className={`text-lg font-bold mb-1 ${isClassic ? 'text-slate-900' : textHeading}`}>{edu.degree}</h3>
                  <p className={`text-base font-bold ${isClassic ? 'text-slate-800' : colors.text} mb-1`}>{edu.institution}</p>
                  <p className="text-sm text-slate-500">{edu.fieldOfStudy} • {edu.period}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="skills">
            <h2 className={`text-2xl font-black mb-10 ${isClassic ? 'text-lg uppercase border-b-2 border-slate-900 pb-1' : textHeading}`}>Expertise</h2>
            <div className="space-y-8">
              {Object.entries(groupedSkills).map(([cat, skills]) => (
                <div key={cat}>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">{cat}</h4>
                  <div className="flex flex-wrap gap-2">
                    {skills.map(s => (
                      <span key={s.name} className={`text-xs font-bold px-4 py-2 rounded-xl ${isClassic ? 'bg-slate-100 text-slate-800' : `${pillBg} border hover:bg-slate-200/80 dark:hover:bg-white/10 transition-all`}`}>
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {data.certificates && data.certificates.length > 0 && (
          <section id="awards" className="scroll-mt-24 scroll-slide">
            <div className="flex items-center gap-4 mb-12">
              <h2 className={`text-3xl font-black tracking-tight ${isClassic ? 'text-xl uppercase border-b-2 border-slate-900 pb-1 w-full' : textHeading}`}>
                {isClassic ? 'Awards & Recognition' : 'Awards & Recognition'}
              </h2>
            </div>
            <div className={rc("grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8")}>
              {data.certificates.map((cert) => (
                <div key={cert.id} className={isClassic ? 'border-b border-slate-100 pb-6 last:border-0' : `p-6 md:p-8 rounded-3xl ${cardBg} border ${cardHoverBg} transition-all group flex items-start gap-4`}>
                  {!isClassic && (
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 flex items-center justify-center border border-amber-500/20 dark:border-amber-400/20 shrink-0">
                      <Trophy className="w-5 h-5 text-amber-500 dark:text-amber-400 fill-amber-500/20 animate-pulse-subtle" />
                    </div>
                  )}
                  <div>
                    <h3 className={`text-xl font-bold ${isClassic ? 'text-slate-900' : `${textHeading} group-hover:text-indigo-400 transition-colors`}`}>{cert.name}</h3>
                    <p className={`text-sm ${isClassic ? 'text-slate-600' : 'text-slate-400'} mt-1`}>{cert.issuer} {cert.date ? `• ${cert.date}` : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {!isClassic && (
          <section id="contact">
            <div className={rc("p-6 md:p-12 rounded-2xl md:rounded-[3rem] bg-slate-900 text-white relative overflow-hidden")}>
              <div className={rc("relative z-10 flex flex-col items-center text-center space-y-4 md:space-y-8")}>
                <h3 className="text-3xl md:text-4xl font-black tracking-tight">Ready to collaborate?</h3>
                <p className="text-slate-400 max-w-xl text-sm md:text-lg font-medium">I'm always open to discussing new projects, creative ideas or opportunities to be part of your visions.</p>
                <div className="flex flex-wrap justify-center gap-6 md:gap-8 pt-4">
                  {data.personal.email && (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-indigo-400"><Mail className="w-5 h-5" /></div>
                      <span className="text-xs font-bold text-slate-500">{data.personal.email}</span>
                    </div>
                  )}
                  {data.personal.phone && (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-indigo-400"><Phone className="w-5 h-5" /></div>
                      <span className="text-xs font-bold text-slate-500">{data.personal.phone}</span>
                    </div>
                  )}
                </div>
                <button className={rc(`mt-6 md:mt-8 px-8 py-4 md:px-12 md:py-5 rounded-full ${colors.bg} text-white font-black uppercase tracking-[0.2em] text-[10px] md:text-xs hover:scale-105 transition-transform w-full sm:w-auto`)}>
                  Start a Conversation
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {!isClassic && (
        <footer className="py-20 text-center border-t border-slate-200 dark:border-white/5">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">© {new Date().getFullYear()} {data.personal.name} • Built with Antigravity</p>
        </footer>
      )}
    </div>
  );
};

export default ThemeRenderer;
