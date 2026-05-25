import React from 'react';
import { ResumeData } from './types';
import { Check, AlertCircle, X, Sparkles, Wand2, Mail, Phone, MapPin } from 'lucide-react';

interface ResumePreviewProps {
  originalData: ResumeData;
  revisedData: ResumeData;
  onApply: () => void;
  onDiscard: () => void;
  appliedFixes: string[];
}

export const ResumeInteractivePreview: React.FC<ResumePreviewProps> = ({
  originalData,
  revisedData,
  onApply,
  onDiscard,
  appliedFixes
}) => {
  return (
    <div className="flex flex-col h-full bg-slate-200 text-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-300">
      {/* Tool Header */}
      <div className="bg-indigo-700 p-5 text-white flex justify-between items-center shadow-lg relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <Wand2 className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-bold text-sm uppercase tracking-widest">AI Optimizer: High-Fidelity Review</h2>
            <p className="text-[10px] text-indigo-200 font-medium">Review and accept ATS-optimized enhancements before applying.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onApply}
            className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold text-xs hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg border-none"
          >
            <Check className="w-4 h-4" />
            Accept & Apply Fixes
          </button>
          <button 
            onClick={onDiscard}
            className="bg-white/10 text-white px-5 py-2 rounded-xl font-bold text-xs hover:bg-white/20 transition-colors flex items-center gap-2 border border-white/20"
          >
            <X className="w-4 h-4" />
            Discard Changes
          </button>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-grow overflow-y-auto p-6 md:p-12 font-serif bg-slate-300/50 scrollbar-thin">
        {/* Actual Resume Document Look-alike */}
        <div className="max-w-[800px] mx-auto bg-white p-12 md:p-20 shadow-2xl min-h-[1050px] relative text-slate-900 ring-1 ring-slate-950/5">
          
          {/* Resume Header */}
          <div className="text-center mb-10 pb-8">
            <h1 className="text-4xl font-bold uppercase tracking-tighter mb-1 font-serif">{originalData.personal.name}</h1>
            <div className="relative group inline-block w-full">
               <p className={`text-lg font-bold text-slate-700 font-serif ${originalData.personal.title !== revisedData.personal.title ? 'bg-amber-100 border-b-2 border-amber-400 px-2 rounded-sm inline-block' : ''}`}>
                {revisedData.personal.title}
               </p>
               {originalData.personal.title !== revisedData.personal.title && (
                 <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 hidden group-hover:block w-72 p-4 bg-slate-900 text-white text-xs rounded-xl shadow-2xl z-50 normal-case font-sans italic leading-relaxed border border-amber-400/30">
                   <p className="font-bold text-amber-400 mb-1.5 flex items-center gap-1.5">
                     <Sparkles className="w-3.5 h-3.5" /> AI Alignment Insight:
                   </p>
                   <p>Strategically re-titled from <span className="text-slate-400">"{originalData.personal.title}"</span> to maximize ATS matching for targeted engineering roles.</p>
                 </div>
               )}
            </div>

            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-5 text-[11px] font-sans text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 underline underline-offset-2 decoration-slate-300 truncate"><Mail className="w-3 h-3" /> {revisedData.personal.email}</span>
              <span className="text-slate-300">&bull;</span>
              <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {revisedData.personal.phone}</span>
              <span className="text-slate-300">&bull;</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {revisedData.personal.location}</span>
            </div>
          </div>

          {/* Bio Section */}
          <div className="mb-12 group relative">
            <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] border-b-2 border-slate-900 pb-1 mb-4 text-slate-900">Professional Profile</h2>
            <div className={`text-[13px] leading-relaxed text-justify p-2 rounded transition-all duration-300 ${originalData.personal.bio !== revisedData.personal.bio ? 'bg-amber-50/50 border border-amber-200/50 shadow-inner' : ''}`}>
              {revisedData.personal.bio}
              {originalData.personal.bio !== revisedData.personal.bio && (
                 <div className="absolute -right-4 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-amber-500 text-white p-1.5 rounded-full shadow-lg cursor-help border-2 border-white">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div className="absolute left-full ml-4 top-0 hidden group-hover:block w-72 p-4 bg-slate-900 text-white text-xs rounded-2xl shadow-2xl z-50 font-sans normal-case leading-relaxed border border-amber-500/20">
                      <p className="font-bold text-amber-400 mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Content Enhancement:
                      </p>
                      Narrative expanded to integrate high-density keywords (ATS optimization) while quantifying your top achievements.
                    </div>
                 </div>
              )}
            </div>
          </div>

          {/* Experience Section */}
          <div className="mb-12">
            <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] border-b-2 border-slate-900 pb-1 mb-6 text-slate-900">Professional Experience</h2>
            <div className="space-y-10">
              {revisedData.experience.map((exp, idx) => {
                const origExp = originalData.experience[idx];
                return (
                  <div key={exp.id} className="relative">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-[15px] font-bold text-slate-900">{exp.position}</h3>
                      <span className="text-[11px] font-bold text-slate-500 italic">{exp.period}</span>
                    </div>
                    <div className="flex justify-between items-baseline mb-3">
                      <p className="text-[13px] font-bold italic text-slate-700">{exp.company}</p>
                      <p className="text-[11px] text-slate-500 font-sans font-medium uppercase tracking-wider">{exp.location}</p>
                    </div>
                    
                    <ul className="list-disc pl-5 space-y-3 text-slate-800">
                      {exp.description.map((bullet, bIdx) => {
                        const isModified = origExp && origExp.description[bIdx] !== bullet;
                        return (
                          <li key={bIdx} className={`text-[13px] leading-relaxed group relative p-1.5 rounded transition-all duration-300 text-justify ${isModified ? 'bg-indigo-50/50 border border-indigo-200 border-dashed cursor-help' : ''}`}>
                            {bullet}
                            {isModified && (
                              <div className="absolute -left-12 top-0 bottom-0 flex items-center opacity-30 group-hover:opacity-100 transition-opacity">
                                <Sparkles className="w-5 h-5 text-indigo-500" />
                                <div className="absolute bottom-full left-0 mb-4 hidden group-hover:block w-80 p-5 bg-slate-900 text-white text-xs rounded-2xl shadow-2xl z-50 font-sans normal-case leading-normal border border-indigo-500/30">
                                  <p className="font-bold text-indigo-400 mb-3 flex items-center gap-1.5">
                                    <Wand2 className="w-4 h-4" /> AI Optimized Bullet Point
                                  </p>
                                  <div className="space-y-3">
                                    <p className="text-slate-400 italic bg-slate-950 p-2 rounded-lg border border-slate-800">Original: "{origExp?.description?.[bIdx] || ''}"</p>
                                    <p className="text-emerald-400 font-bold border-t border-slate-800 pt-3">Impact analysis complete. Bullet re-written to emphasize "Result-driven" metrics and "Scale" to catch recruiter attention.</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skills Section */}
          <div className="mb-10">
            <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] border-b-2 border-slate-900 pb-1 mb-4 text-slate-900">Technical Skills & Competencies</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-3 text-[13px]">
              {revisedData.skills.map((skill, sIdx) => {
                const isNew = !originalData.skills.some(s => s.name === skill.name);
                return (
                  <span key={sIdx} className={`group relative cursor-help ${isNew ? 'bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-md border border-indigo-200' : 'text-slate-800'}`}>
                    {skill.name}
                    {isNew && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block w-56 p-3 bg-slate-900 text-white text-[10px] rounded-xl shadow-2xl z-50 font-sans normal-case text-center border border-indigo-500/20">
                        <Sparkles className="w-3 h-3 text-indigo-400 inline mb-1 mr-1" />
                        Keyword injected from high-relevance job description analysis.
                      </div>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Summary Footer */}
      <div className="bg-white border-t border-slate-300 p-5 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Applied Logic</span>
            <span className="text-[11px] font-bold text-slate-900 uppercase">Optimization Engine</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {appliedFixes.slice(0, 3).map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 px-4 py-1 rounded-lg font-bold text-[10px] shadow-sm">
                <Check className="w-3 h-3" />
                {f}
              </div>
            ))}
            {appliedFixes.length > 3 && <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">+{appliedFixes.length - 3} MORE FIXES</span>}
          </div>
        </div>
        <div className="text-[12px] text-indigo-600 font-black flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl animate-pulse-subtle">
          <AlertCircle className="w-4.5 h-4.5" />
          HOVER HIGHLIGHTS TO INSPECT AI CHANGES
        </div>
      </div>
    </div>
  );
};
