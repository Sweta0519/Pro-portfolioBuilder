import { ResumeData } from './types';

interface ResumeDocumentTemplateProps {
  data: ResumeData;
  template: string;
}

export function ResumeDocumentTemplate({ data: d, template }: ResumeDocumentTemplateProps) {
  // CLASSIC TEMPLATE: Professional, Serif, Traditional
  if (template === 'classic') {
    return (
      <div className="w-full min-h-inherit mx-auto font-serif text-[10.5pt] text-slate-900 leading-normal">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold uppercase tracking-tight mb-2">{d.personal.name}</h1>
          <div className="text-base font-bold text-slate-700 mb-2">{d.personal.title}</div>
          <div className="text-[10pt] text-slate-600 flex justify-center flex-wrap gap-x-3">
            <span>{d.personal.location}</span>
            <span>|</span>
            <span>{d.personal.phone}</span>
            <span>|</span>
            <span>{d.personal.email}</span>
            {d.personal.socials.linkedin && (
              <>
                <span>|</span>
                <span>LinkedIn: {d.personal.socials.linkedin.replace('https://', '')}</span>
              </>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-[11pt] font-bold uppercase border-b-2 border-slate-900 pb-1 mb-3">
            Professional Summary
          </h2>
          <p className="text-justify leading-relaxed italic text-slate-700">{d.personal.bio}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-[11pt] font-bold uppercase border-b-2 border-slate-900 pb-1 mb-4">
            Professional Experience
          </h2>
          <div className="space-y-6">
            {d.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-[11pt] font-bold">{exp.position}</span>
                  <span className="text-[10pt] italic font-medium">{exp.period}</span>
                </div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-[10.5pt] font-bold italic text-slate-700">
                    {exp.company}
                  </span>
                  <span className="text-[10pt] text-slate-500">{exp.location}</span>
                </div>
                <ul className="list-disc pl-5 space-y-1.5 text-justify">
                  {exp.description.map((bullet, i) => (
                    <li key={i}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-[11pt] font-bold uppercase border-b-2 border-slate-900 pb-1 mb-4">
              Education
            </h2>
            <div className="space-y-4">
              {d.education.map((edu) => (
                <div key={edu.id}>
                  <div className="font-bold text-[10.5pt]">{edu.degree}</div>
                  <div className="text-slate-700">{edu.fieldOfStudy}</div>
                  <div className="text-[10pt] italic text-slate-500">
                    {edu.institution} | {edu.period}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-[11pt] font-bold uppercase border-b-2 border-slate-900 pb-1 mb-4">
              Skills & Expertise
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {d.skills.map((s) => (
                <span key={s.name} className="text-[10pt] text-slate-800">
                  <span className="font-bold">{s.name}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MODERN TEMPLATE: Clean, Sans-Serif, Indigo Accents
  if (template === 'modern') {
    return (
      <div className="w-full min-h-inherit mx-auto font-sans text-[10pt] text-slate-800">
        <div className="border-b-4 border-slate-900 pb-6 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 mb-1">
              {d.personal.name}
            </h1>
            <div className="text-xl font-medium text-indigo-600">{d.personal.title}</div>
          </div>
          <div className="text-right text-[9.5pt] text-slate-500 space-y-1">
            <div>{d.personal.email}</div>
            <div>{d.personal.phone}</div>
            <div>{d.personal.location}</div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-700 mb-4 bg-indigo-50 px-3 py-2 rounded-sm inline-block">
            Professional Summary
          </h2>
          <p className="text-justify leading-relaxed font-medium text-slate-700 text-[11pt]">
            {d.personal.bio}
          </p>
        </div>

        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-8">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-700 mb-6 bg-indigo-50 px-3 py-2 rounded-sm inline-block">
              Experience
            </h2>
            <div className="space-y-8">
              {d.experience.map((exp) => (
                <div
                  key={exp.id}
                  className="relative pl-4 border-l-2 border-slate-100 hover:border-indigo-200 transition-colors"
                >
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-indigo-600" />
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-[12pt] text-slate-900">{exp.position}</h3>
                    <span className="text-[9.5pt] font-bold text-indigo-600">{exp.period}</span>
                  </div>
                  <div className="text-[10.5pt] font-semibold text-slate-500 mb-3">
                    {exp.company} • {exp.location}
                  </div>
                  <ul className="list-none space-y-2 text-justify">
                    {exp.description.map((bullet, i) => (
                      <li
                        key={i}
                        className="relative pl-5 before:content-['→'] before:absolute before:left-0 before:text-indigo-500 before:font-bold"
                      >
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 mb-6 border-b-2 border-slate-900 pb-2">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2 mb-10">
              {d.skills.map((s) => (
                <span
                  key={s.name}
                  className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-[9pt] font-bold border border-slate-200"
                >
                  {s.name}
                </span>
              ))}
            </div>

            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 mb-6 border-b-2 border-slate-900 pb-2">
              Education
            </h2>
            <div className="space-y-6">
              {d.education.map((edu) => (
                <div key={edu.id}>
                  <div className="font-bold text-slate-900 leading-tight mb-1">{edu.degree}</div>
                  <div className="text-sm font-medium text-slate-600 mb-1">{edu.fieldOfStudy}</div>
                  <div className="text-[9pt] text-slate-400 font-medium italic">
                    {edu.institution}
                  </div>
                  <div className="text-[9pt] text-indigo-600 font-bold mt-1">{edu.period}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // COMPACT TEMPLATE: High density, 2-column sidebar
  if (template === 'compact') {
    return (
      <div className="w-full min-h-inherit mx-auto grid grid-cols-12 gap-8 text-[9pt] text-slate-800">
        <div className="col-span-4 bg-slate-50 p-6 rounded-xl border border-slate-200">
          <div className="mb-8">
            <h1 className="text-2xl font-black tracking-tight leading-tight mb-2 text-slate-900">
              {d.personal.name}
            </h1>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">
              {d.personal.title}
            </div>

            <div className="space-y-2 text-[8.5pt] text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-4 text-center">📍</span> {d.personal.location}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 text-center">📞</span> {d.personal.phone}
              </div>
              <div className="flex items-center gap-2 break-all">
                <span className="w-4 text-center">✉️</span> {d.personal.email}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-[10pt] font-black uppercase tracking-widest text-slate-900 mb-4 border-b border-slate-300 pb-1">
              Skills
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {d.skills.map((s) => (
                <span
                  key={s.name}
                  className="bg-white px-2 py-1 border border-slate-200 rounded text-[8pt] font-bold"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-[10pt] font-black uppercase tracking-widest text-slate-900 mb-4 border-b border-slate-300 pb-1">
              Education
            </h2>
            <div className="space-y-4">
              {d.education.map((edu) => (
                <div key={edu.id}>
                  <div className="font-bold text-slate-900 leading-tight">{edu.degree}</div>
                  <div className="text-[8.5pt] text-slate-600 italic mb-1">{edu.fieldOfStudy}</div>
                  <div className="text-[8.5pt] font-bold text-slate-400">{edu.institution}</div>
                  <div className="text-[8pt] font-medium text-slate-400">{edu.period}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-8 py-2">
          <div className="mb-8">
            <h2 className="text-[11pt] font-black uppercase tracking-widest border-b-2 border-slate-800 pb-1 mb-3 text-slate-900">
              Professional Summary
            </h2>
            <p className="text-justify leading-relaxed text-slate-700">{d.personal.bio}</p>
          </div>

          <div>
            <h2 className="text-[11pt] font-black uppercase tracking-widest border-b-2 border-slate-800 pb-1 mb-4 text-slate-900">
              Experience
            </h2>
            <div className="space-y-6">
              {d.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-bold text-[11pt] text-slate-900">{exp.position}</span>
                    <span className="text-[8.5pt] font-bold text-slate-400 uppercase tracking-widest">
                      {exp.period}
                    </span>
                  </div>
                  <div className="text-[9.5pt] font-bold text-slate-500 mb-2">
                    {exp.company} &bull; {exp.location}
                  </div>
                  <ul className="list-disc pl-4 space-y-1.5 text-justify marker:text-slate-400">
                    {exp.description.map((bullet, i) => (
                      <li key={i}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // EXECUTIVE TEMPLATE: Premium, High-end Header, Bold Sidebar
  if (template === 'executive') {
    return (
      <div className="w-full min-h-inherit mx-auto font-sans text-[10pt] text-slate-800">
        <div className="bg-slate-900 text-white p-10 mb-10 flex justify-between items-center rounded-sm">
          <div>
            <h1 className="text-5xl font-extrabold uppercase tracking-tight mb-2 leading-none">
              {d.personal.name}
            </h1>
            <div className="text-xl font-medium text-slate-400 tracking-wide">
              {d.personal.title}
            </div>
          </div>
          <div className="text-right text-[10pt] text-slate-400 space-y-1.5">
            <div className="flex items-center justify-end gap-2">
              <span>✉️</span> {d.personal.email}
            </div>
            <div className="flex items-center justify-end gap-2">
              <span>📞</span> {d.personal.phone}
            </div>
            <div className="flex items-center justify-end gap-2">
              <span>📍</span> {d.personal.location}
            </div>
          </div>
        </div>

        <div className="px-10">
          <div className="mb-10">
            <h2 className="text-sm font-black text-slate-900 border-b-4 border-slate-900 pb-2 mb-4 uppercase tracking-[0.2em]">
              Professional Summary
            </h2>
            <p className="text-justify leading-relaxed text-[11pt] text-slate-700 font-medium">
              {d.personal.bio}
            </p>
          </div>

          <div className="mb-10">
            <h2 className="text-sm font-black text-slate-900 border-b-4 border-slate-900 pb-2 mb-6 uppercase tracking-[0.2em]">
              Leadership Experience
            </h2>
            <div className="space-y-10">
              {d.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-[13pt] text-slate-900 tracking-tight">
                      {exp.position}
                    </h3>
                    <span className="text-xs font-black bg-slate-900 text-white px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                      {exp.period}
                    </span>
                  </div>
                  <div className="text-[11pt] font-bold text-slate-500 mb-4">
                    {exp.company} | {exp.location}
                  </div>
                  <ul className="list-disc pl-6 space-y-3 text-justify text-slate-700 text-[10.5pt]">
                    {exp.description.map((bullet, i) => (
                      <li key={i}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 pt-4 border-t border-slate-100">
            <div>
              <h2 className="text-sm font-black text-slate-900 border-b-4 border-slate-900 pb-2 mb-6 uppercase tracking-[0.2em]">
                Academic Background
              </h2>
              <div className="space-y-6">
                {d.education.map((edu) => (
                  <div key={edu.id}>
                    <div className="font-bold text-[11pt] text-slate-900 leading-tight mb-1">
                      {edu.degree}
                    </div>
                    <div className="text-[10pt] font-semibold text-slate-600 mb-1">
                      {edu.fieldOfStudy}
                    </div>
                    <div className="text-[10pt] text-slate-400 font-medium italic">
                      {edu.institution} | {edu.period}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 border-b-4 border-slate-900 pb-2 mb-6 uppercase tracking-[0.2em]">
                Core Competencies
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {d.skills.map((s) => (
                  <span
                    key={s.name}
                    className="bg-slate-50 text-slate-900 px-3.5 py-2 rounded text-[9.5pt] font-bold border-2 border-slate-200 hover:border-slate-900 transition-colors cursor-default"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CREATIVE TEMPLATE: Vibrant Sidebar, Left Align, Skills Bars
  if (template === 'creative') {
    return (
      <div className="w-full min-h-inherit bg-white flex text-[10pt] font-sans">
        {/* Left Sidebar - Vibrant/Dark */}
        <div className="w-[2.8in] bg-slate-900 text-slate-100 p-8 shrink-0 flex flex-col shadow-inner">
          <div className="mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center text-slate-900 text-3xl font-black mb-4 shadow-lg">
              {d.personal.name.charAt(0)}
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2 text-white">
              {d.personal.name}
            </h1>
            <div className="text-xs font-black tracking-[0.2em] uppercase text-emerald-400">
              {d.personal.title}
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-[10pt] font-black uppercase tracking-widest text-slate-500 mb-5 border-b border-slate-800 pb-2">
              Connect
            </h2>
            <div className="space-y-4 text-[9pt]">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-[10px]">
                  📍
                </span>
                <span>{d.personal.location}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-[10px]">
                  📞
                </span>
                <span>{d.personal.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-[10px]">
                  ✉️
                </span>
                <span className="break-all">{d.personal.email}</span>
              </div>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-[10pt] font-black uppercase tracking-widest text-slate-500 mb-5 border-b border-slate-800 pb-2">
              Skills
            </h2>
            <div className="space-y-5">
              {d.skills.slice(0, 8).map((s, i) => (
                <div key={s.name}>
                  <div className="flex justify-between text-[8.5pt] mb-1.5 font-bold">
                    <span>{s.name}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
                      style={{ width: `${95 - i * 6}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-[10pt] font-black uppercase tracking-widest text-slate-500 mb-5 border-b border-slate-800 pb-2">
              Education
            </h2>
            <div className="space-y-6">
              {d.education.map((edu) => (
                <div key={edu.id}>
                  <div className="font-black text-white text-[10pt] leading-tight mb-1">
                    {edu.degree}
                  </div>
                  <div className="text-[9pt] text-slate-300 mb-1">{edu.fieldOfStudy}</div>
                  <div className="text-[8.5pt] text-slate-500 font-bold mb-1">
                    {edu.institution}
                  </div>
                  <div className="text-[8pt] font-black text-emerald-400 tracking-wider">
                    {edu.period}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Main Content */}
        <div className="flex-1 p-10 bg-white">
          <div className="mb-10">
            <h2 className="text-xl font-black uppercase tracking-[0.2em] text-slate-900 mb-4 flex items-center gap-4">
              <span className="w-10 h-1.5 bg-emerald-400 rounded-full"></span>
              Professional Summary
            </h2>
            <p className="text-justify leading-loose text-slate-600 font-medium text-[11pt]">
              {d.personal.bio}
            </p>
          </div>

          <div className="mb-10">
            <h2 className="text-xl font-black uppercase tracking-[0.2em] text-slate-900 mb-6 flex items-center gap-4">
              <span className="w-10 h-1.5 bg-emerald-400 rounded-full"></span>
              Experience
            </h2>
            <div className="space-y-10">
              {d.experience.map((exp) => (
                <div key={exp.id} className="relative">
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="font-black text-xl text-slate-900 tracking-tighter">
                      {exp.position}
                    </h3>
                    <span className="text-[9pt] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                      {exp.period}
                    </span>
                  </div>
                  <div className="text-[11pt] font-bold text-slate-400 mb-4 uppercase tracking-wide">
                    {exp.company} &bull; {exp.location}
                  </div>
                  <ul className="list-none space-y-3 text-justify text-slate-600 font-medium leading-relaxed">
                    {exp.description.map((bullet, i) => (
                      <li
                        key={i}
                        className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2.5 before:w-2.5 before:h-2.5 before:bg-emerald-100 before:border-2 before:border-emerald-400 before:rounded-full"
                      >
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MINIMAL TEMPLATE: Ultra Clean, Light Typography, Spacious
  if (template === 'minimal') {
    return (
      <div className="w-full min-h-inherit mx-auto font-sans text-[10pt] text-slate-800 p-10">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-extralight tracking-[0.1em] text-slate-900 mb-4 uppercase">
            {d.personal.name}
          </h1>
          <div className="text-lg font-light tracking-[0.3em] text-slate-400 uppercase mb-8">
            {d.personal.title}
          </div>
          <div className="text-[9pt] tracking-[0.2em] text-slate-500 flex justify-center gap-10 uppercase">
            <span>{d.personal.location}</span>
            <span>{d.personal.phone}</span>
            <span>{d.personal.email}</span>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="mb-12">
            <p className="text-center leading-loose text-[11pt] text-slate-600 font-light italic">
              "{d.personal.bio}"
            </p>
          </div>

          <div className="mb-12">
            <h2 className="text-[9pt] font-bold tracking-[0.4em] uppercase text-slate-300 mb-8 text-center">
              Experience
            </h2>
            <div className="space-y-12">
              {d.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-end mb-3 border-b border-slate-100 pb-2">
                    <div>
                      <h3 className="font-light text-slate-900 text-2xl tracking-tight">
                        {exp.position}
                      </h3>
                      <div className="text-sm font-medium text-slate-400 uppercase tracking-widest">
                        {exp.company} &bull; {exp.location}
                      </div>
                    </div>
                    <div className="text-xs font-bold tracking-widest text-slate-300 mb-1">
                      {exp.period}
                    </div>
                  </div>
                  <ul className="list-none space-y-3 text-justify text-slate-600 font-light leading-relaxed">
                    {exp.description.map((bullet, i) => (
                      <li
                        key={i}
                        className="relative pl-5 before:content-[''] before:absolute before:left-0 before:top-2.5 before:w-1.5 before:h-px before:bg-slate-300"
                      >
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-16">
            <div>
              <h2 className="text-[9pt] font-bold tracking-[0.4em] uppercase text-slate-300 mb-8">
                Education
              </h2>
              <div className="space-y-6">
                {d.education.map((edu) => (
                  <div key={edu.id}>
                    <div className="font-medium text-slate-900 text-lg leading-tight mb-1">
                      {edu.degree}
                    </div>
                    <div className="text-sm text-slate-500 font-light mb-1">{edu.fieldOfStudy}</div>
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                      {edu.institution} | {edu.period}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-[9pt] font-bold tracking-[0.4em] uppercase text-slate-300 mb-8">
                Expertise
              </h2>
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {d.skills.map((s) => (
                  <span
                    key={s.name}
                    className="text-[10pt] text-slate-500 font-light hover:text-slate-900 transition-colors cursor-default"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STELLAR TEMPLATE: Dark, High-tech, Monospace accents
  if (template === 'stellar') {
    return (
      <div className="w-full min-h-inherit bg-slate-950 text-slate-300 font-mono text-[9.5pt] p-10 border-[12px] border-slate-900 shadow-2xl relative overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[120px] rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[120px] rounded-full -ml-32 -mb-32"></div>

        <div className="relative z-10">
          <div className="border border-indigo-500/30 p-8 mb-10 bg-slate-900/40 backdrop-blur-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-4xl font-bold tracking-tighter text-white mb-2 uppercase">
                  {d.personal.name}
                  <span className="text-indigo-500 animate-pulse">_</span>
                </h1>
                <div className="text-emerald-400 font-bold text-sm tracking-widest uppercase">
                  {'>'} {d.personal.title}
                </div>
              </div>
              <div className="text-right text-[8pt] text-slate-500 space-y-1 font-sans">
                <div className="flex items-center justify-end gap-2">
                  CONTACT_ID: <span className="text-slate-300">{d.personal.email}</span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  LOCATION: <span className="text-slate-300">{d.personal.location}</span>
                </div>
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-2xl text-sm italic">
              {d.personal.bio}
            </p>
          </div>

          <div className="grid grid-cols-12 gap-10">
            <div className="col-span-8">
              <div className="mb-10">
                <h2 className="text-emerald-400 font-bold mb-6 flex items-center gap-3">
                  <span className="text-slate-700">[</span> EXPERIENCE{' '}
                  <span className="text-slate-700">]</span>
                  <div className="flex-1 h-px bg-slate-800"></div>
                </h2>
                <div className="space-y-10">
                  {d.experience.map((exp) => (
                    <div
                      key={exp.id}
                      className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-0 before:w-px before:bg-indigo-500/30"
                    >
                      <div className="absolute left-[-4px] top-2 w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                      <div className="flex justify-between items-baseline mb-2">
                        <h3 className="text-white font-bold text-lg">{exp.position}</h3>
                        <span className="text-[8pt] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 border border-indigo-500/20">
                          {exp.period}
                        </span>
                      </div>
                      <div className="text-slate-500 font-bold text-sm mb-4 uppercase tracking-wider">
                        {exp.company} // {exp.location}
                      </div>
                      <ul className="space-y-2 text-sm text-slate-400 font-sans leading-relaxed">
                        {exp.description.map((bullet, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-indigo-500 select-none">⚡</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-span-4">
              <div className="mb-10">
                <h2 className="text-emerald-400 font-bold mb-6 flex items-center gap-3">
                  <span className="text-slate-700">[</span> TECH_STACK{' '}
                  <span className="text-slate-700">]</span>
                </h2>
                <div className="grid grid-cols-1 gap-2">
                  {d.skills.map((s) => (
                    <div
                      key={s.name}
                      className="flex items-center gap-3 p-2 bg-slate-900/40 border border-slate-800 hover:border-indigo-500/50 transition-colors group"
                    >
                      <div className="w-1.5 h-1.5 bg-slate-700 group-hover:bg-emerald-400 transition-colors"></div>
                      <span className="text-[9pt] font-bold text-slate-400 group-hover:text-white">
                        {s.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-emerald-400 font-bold mb-6 flex items-center gap-3">
                  <span className="text-slate-700">[</span> EDUCATION{' '}
                  <span className="text-slate-700">]</span>
                </h2>
                <div className="space-y-6">
                  {d.education.map((edu) => (
                    <div key={edu.id} className="p-4 bg-slate-900/40 border border-slate-800">
                      <div className="text-white font-bold text-sm leading-tight mb-1">
                        {edu.degree}
                      </div>
                      <div className="text-[8pt] text-slate-500 mb-2">{edu.fieldOfStudy}</div>
                      <div className="text-[8pt] font-bold text-indigo-400">{edu.institution}</div>
                      <div className="text-[8pt] text-slate-600 mt-1">{edu.period}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ORIGINAL / PROFESSIONAL STANDARD: Traditional centered, lines between sections
  if (template === 'original') {
    return (
      <div className="w-full min-h-inherit mx-auto font-serif text-[11pt] text-black leading-snug p-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold uppercase mb-1">{d.personal.name}</h1>
          <div className="text-[10pt] flex justify-center flex-wrap gap-x-2">
            <span>{d.personal.location}</span>
            <span>|</span>
            <span>{d.personal.phone}</span>
            <span>|</span>
            <span>{d.personal.email}</span>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-[10.5pt] font-bold uppercase border-b border-black mb-2">Summary</h2>
          <p className="text-justify">{d.personal.bio}</p>
        </div>

        <div className="mb-4">
          <h2 className="text-[10.5pt] font-bold uppercase border-b border-black mb-3">
            Experience
          </h2>
          <div className="space-y-4">
            {d.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline font-bold">
                  <span>{exp.company}</span>
                  <span>{exp.period}</span>
                </div>
                <div className="flex justify-between items-baseline italic mb-1">
                  <span>{exp.position}</span>
                  <span>{exp.location}</span>
                </div>
                <ul className="list-disc pl-6 space-y-1 text-justify">
                  {exp.description.map((bullet, i) => (
                    <li key={i}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-[10.5pt] font-bold uppercase border-b border-black mb-3">
            Education
          </h2>
          <div className="space-y-3">
            {d.education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline font-bold">
                  <span>{edu.institution}</span>
                  <span>{edu.period}</span>
                </div>
                <div className="italic">
                  {edu.degree} in {edu.fieldOfStudy}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-[10.5pt] font-bold uppercase border-b border-black mb-2">Skills</h2>
          <div className="flex flex-wrap gap-x-2">
            {d.skills.map((s, i) => (
              <span key={s.name}>
                {s.name}
                {i < d.skills.length - 1 ? ',' : ''}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // FALLBACK DEFAULT: Classic Simple
  return (
    <div className="max-w-[8in] mx-auto p-8 font-serif text-[11pt]">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold uppercase">{d.personal.name}</h1>
        <p className="text-sm text-slate-600">
          {d.personal.email} | {d.personal.phone} | {d.personal.location}
        </p>
      </div>
      <div className="border-b border-black mb-4">
        <h2 className="font-bold uppercase text-sm">Experience</h2>
      </div>
      {d.experience.map((exp) => (
        <div key={exp.id} className="mb-4">
          <div className="flex justify-between font-bold">
            <span>{exp.position}</span>
            <span>{exp.period}</span>
          </div>
          <div className="italic">{exp.company}</div>
          <ul className="list-disc pl-5">
            {exp.description.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
