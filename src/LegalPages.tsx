import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';

const CONTACT_EMAIL = 'hello@drivede.app';

function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-emerald-600" />
            <span className="text-xl font-bold tracking-tight">ProPortfolio</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition duration-200 ease-out"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-10 space-y-6 text-slate-700 leading-relaxed text-[15px]">
          {children}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-3xl mx-auto px-4 text-center text-slate-500 text-sm flex items-center justify-center gap-4">
          <Link to="/privacy" className="hover:text-slate-900 transition duration-200 ease-out">Privacy</Link>
          <Link to="/imprint" className="hover:text-slate-900 transition duration-200 ease-out">Imprint</Link>
          <Link to="/" className="hover:text-slate-900 transition duration-200 ease-out">Home</Link>
        </div>
      </footer>
    </div>
  );
}

const H1 = ({ children }: { children: ReactNode }) => (
  <h1 className="text-3xl font-bold tracking-tight text-slate-900">{children}</h1>
);
const H2 = ({ children }: { children: ReactNode }) => (
  <h2 className="text-lg font-bold text-slate-900 pt-4">{children}</h2>
);
const Mail = () => (
  <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-700 underline hover:text-emerald-800">
    {CONTACT_EMAIL}
  </a>
);

export function ImprintPage() {
  return (
    <LegalLayout>
      <H1>Imprint (Impressum)</H1>
      <p className="text-sm text-slate-500">Information pursuant to § 5 DDG</p>

      <p className="font-semibold text-slate-900">ProPortfolio</p>
      <p>
        Operated by:
        <br />
        Abhijit Kumar Sahoo
        <br />
        Billstedter Hauptstraße 69
        <br />
        22111 Hamburg
        <br />
        Germany
      </p>

      <H2>Contact</H2>
      <p>
        Email: <Mail />
      </p>

      <H2>Responsible for content</H2>
      <p>Responsible for content pursuant to § 18 Abs. 2 MStV: Abhijit Kumar Sahoo (address as above).</p>
    </LegalLayout>
  );
}

export function PrivacyPage() {
  return (
    <LegalLayout>
      <H1>Privacy Policy</H1>
      <p className="text-sm text-slate-500">Last updated: 3 November 2026</p>

      <H2>1. Controller</H2>
      <p>
        Abhijit Kumar Sahoo, Billstedter Hauptstraße 69, 22111 Hamburg, Germany. Email: <Mail />. See also the{' '}
        <Link to="/imprint" className="text-emerald-700 underline hover:text-emerald-800">Imprint</Link>.
      </p>

      <H2>2. Overview: what stays in your browser and what leaves it</H2>
      <p>
        ProPortfolio runs in your browser. Without an account, your resumes, interview sessions and settings are stored
        in your browser&apos;s local storage on your device. When you upload a PDF or Word file, it is read inside your
        browser; the file itself is not uploaded to our servers. Data leaves your device only in the cases described
        below.
      </p>

      <H2>3. Hosting and server logs (Vercel)</H2>
      <p>
        This website is delivered through Vercel. When you open a page, the hosting provider processes technical
        connection data such as your IP address, the requested URL, date and time, and browser information, in server
        logs, in order to deliver the site and keep it secure. Legal basis: Art. 6(1)(f) GDPR (legitimate interest in a
        secure and working website). Vercel may process data outside the EU.
      </p>

      <H2>4. Accounts and cloud sync (Supabase)</H2>
      <p>
        Creating an account is optional. If you sign up with email and password, your email address and password are
        handled by Supabase Authentication (the password is entered into the Supabase sign-up and sign-in request).
        If you choose &quot;Continue with Google&quot;, you are redirected to Google to sign in, and we receive the
        account details that Google returns through Supabase (such as your email address). Your sign-in session is kept
        in your browser by the Supabase client library so that you stay signed in.
      </p>
      <p>When you are signed in, the following is stored in your account in Supabase and linked to your account id:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          Your saved resumes: the resume name, the full structured resume content (for example name, contact details,
          summary, work experience, education, projects, skills) and the theme settings you chose.
        </li>
        <li>
          Your interview preparation sessions: company name, role name, the job description you entered, the generated
          interview plan and insights, your mock interview answers, scores and feedback, and related session state.
        </li>
      </ul>
      <p>
        This data is used to provide sync across your devices. Legal basis: Art. 6(1)(b) GDPR (providing the account and
        the app functions you request). Supabase may process data outside the EU.
      </p>

      <H2>5. AI features (optional, using your own API key)</H2>
      <p>
        The interview coach can call a third-party AI provider. This only happens if you enter your own API key in the
        app settings and use an AI feature. The app does not supply an AI key of its own. Your key and chosen provider
        are stored in your browser&apos;s local storage and sent only to the provider you selected. Providers, as
        selected by you:
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Google Gemini (generativelanguage.googleapis.com)</li>
        <li>Groq (api.groq.com)</li>
        <li>OpenRouter (openrouter.ai), which forwards your request to the model you pick</li>
      </ul>
      <p>Content sent to the selected provider depends on the feature:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Company insights: the company name, role and seniority level you entered.</li>
        <li>
          Suggested answers: the interview question, the target role, and from your resume your job title, bio, skills
          and your two most recent work experiences (position, company and the first two description lines of each),
          plus up to your three previous answers in the session (first 200 characters each).
        </li>
        <li>
          Answer optimisation: the question, the target role, your draft answer, and from your resume your job title
          and skills.
        </li>
        <li>STAR structuring: your answer text and the question.</li>
        <li>Recruiter replies: the interview question and the interviewer persona prompt.</li>
        <li>
          Session summaries: all questions of the mock round, your answers to them, and the scores they received, plus
          the target role and the interviewer persona prompt.
        </li>
        <li>Connection test: a short test message (or, for OpenRouter, a key check request).</li>
      </ul>
      <p>
        This means parts of your resume and interview answers are transmitted to the AI provider you choose, which
        processes them under its own terms and privacy policy. Please do not enter data you do not want to share with
        that provider. Legal basis: Art. 6(1)(b) GDPR (you request the feature). These providers may process data
        outside the EU.
      </p>

      <H2>6. Publishing your portfolio (optional)</H2>
      <p>You can publish a generated portfolio website in two ways. Both only happen when you start them.</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          Vercel: the app sends the generated portfolio files, which contain your resume content, directly from your
          browser to the Vercel API, using the Vercel access token you provide. The token is stored in your
          browser&apos;s local storage and is sent only to Vercel. Your published site is then hosted in your own Vercel
          account.
        </li>
        <li>
          n8n webhook: if you enter a webhook URL, the app sends the generated portfolio files, the project name and
          the candidate name and email from your resume to that URL. The URL is stored in your browser&apos;s local
          storage. The recipient is whoever operates that URL, which you choose; we have no control over it.
        </li>
      </ul>
      <p>Legal basis: Art. 6(1)(b) GDPR (you request the publishing function).</p>

      <H2>7. Third-party libraries loaded at runtime</H2>
      <p>
        To read PDF and Word files and to create exports, the app loads open-source libraries from public content
        delivery networks when needed: cdnjs.cloudflare.com (PDF export, Word reading, ZIP export libraries) and
        cdn.jsdelivr.net (PDF reader worker, Word export library). When your browser requests these files, the CDN
        operator receives your IP address and standard request data. Your resume content is not sent to these
        networks. Legal basis: Art. 6(1)(f) GDPR (legitimate interest in providing these functions). The CDN operators
        may process data outside the EU. The app&apos;s fonts are bundled with the app and are not loaded from Google
        Fonts.
      </p>

      <H2>8. Product analytics (PostHog)</H2>
      <p>
        We use PostHog Cloud EU (PostHog Inc., eu.i.posthog.com, processing in the EU) to understand which parts of the
        product are used. Settings, as configured in the app:
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>No cookies or other browser storage are used for analytics (analytics state is kept in memory only).</li>
        <li>Session replay is off.</li>
        <li>Text of clicked elements is masked and not sent. Copied and selected text is not sent.</li>
        <li>IP addresses are discarded in our PostHog project settings, and geolocation is switched off.</li>
        <li>Page URLs are sent without query string and without fragment.</li>
        <li>
          If you are signed in, events are linked to a random account id created by our authentication system. Your
          email address is not sent to PostHog. Without an account, events are not linked to a person.
        </li>
        <li>If your browser sends a Do Not Track signal, analytics is not activated.</li>
      </ul>
      <p>Events we record:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Page views and page leaves (page path, referrer, and standard technical data such as browser, operating system and device type).</li>
        <li>Clicks on interface elements (element type only, no text).</li>
        <li>resume_uploaded (properties: source, file_type)</li>
        <li>resume_exported (properties: format, template)</li>
        <li>portfolio_published (properties: provider, theme_id)</li>
        <li>mock_interview_started (properties: round, mode)</li>
        <li>mock_interview_completed (properties: round, mode, question_count)</li>
        <li>signed_up (property: method)</li>
      </ul>
      <p>
        Legal basis: Art. 6(1)(f) GDPR (legitimate interest in improving the product). You can object at any time with
        effect for the future by writing to <Mail />, or by enabling Do Not Track in your browser.
      </p>

      <H2>9. Payments</H2>
      <p>
        The app does not currently contain a payment function, and no payment data is processed by the app code
        described here.
      </p>

      <H2>10. Data transfers outside the EU</H2>
      <p>
        Some of the providers named above (for example Vercel, Supabase, Google, Groq, OpenRouter and the CDN operators)
        may process data outside the European Union or the European Economic Area, including in the United States.
        Where this happens, the transfer relies on a mechanism under Chapter V GDPR, such as standard contractual
        clauses or the EU-US Data Privacy Framework, as applicable to the respective provider.
      </p>

      <H2>11. Storage duration and deletion</H2>
      <p>
        Data stored in your browser stays there until you clear it or sign out (signing out clears your resumes and
        sessions from the browser). Data stored in your account is kept while the account exists and until you ask us
        to delete it. Server logs are kept by the hosting provider under its own retention rules.
      </p>
      <p>
        The app currently has no self-service button to delete your account. To have your account and the stored resume
        and interview data deleted, email <Mail /> from the address you registered with. Please note that deleting a
        resume or interview session inside the app removes it from your browser, but this does not currently remove
        the copy already stored in your account, so please request deletion by email if you want the cloud copy
        removed.
      </p>

      <H2>12. Your rights</H2>
      <p>Under the GDPR you have the right to:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>access to your data (Art. 15),</li>
        <li>rectification (Art. 16),</li>
        <li>erasure (Art. 17),</li>
        <li>restriction of processing (Art. 18),</li>
        <li>data portability (Art. 20),</li>
        <li>
          object to processing based on legitimate interests (Art. 21), including the analytics described above. If
          you object, we will stop that processing unless we can show compelling legitimate grounds.
        </li>
      </ul>
      <p>
        To exercise these rights, write to <Mail />. Where processing is based on your consent, you can withdraw it at
        any time with effect for the future.
      </p>

      <H2>13. Right to complain</H2>
      <p>
        You have the right to lodge a complaint with a supervisory authority. The authority competent for us is the
        Hamburg Commissioner for Data Protection and Freedom of Information (HmbBfDI), Hamburg, Germany. You may also contact the authority in your own place of residence.
      </p>

      <H2>14. Changes</H2>
      <p>We may update this policy when the product changes. The date at the top shows the latest version.</p>
    </LegalLayout>
  );
}
