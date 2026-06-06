import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, CheckCircle, Briefcase, Zap, ShieldCheck, Menu, X, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navigation — h-16 = 64px, single line, within 80px cap */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-emerald-600" />
            <span className="text-xl font-bold tracking-tight">ProPortfolio</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 hidden sm:block transition duration-200 ease-out">Features</a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 hidden sm:block transition duration-200 ease-out">Pricing</a>
            <Link to="/app" className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition duration-200 ease-out active:scale-[0.97] hidden sm:block">
              Open Dashboard
            </Link>
            {/* Mobile Menu Toggle */}
            <button 
              className="sm:hidden p-2 text-slate-600 hover:text-slate-900 active:scale-[0.97] transition duration-200 ease-out"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="sm:hidden bg-white border-b border-slate-200 absolute w-full px-4 pt-2 pb-6 flex flex-col gap-2 shadow-2xl animate-fadeIn">
            <a 
              href="#features" 
              className="block px-4 py-3 text-base font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition duration-200 ease-out"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </a>
            <a 
              href="#pricing" 
              className="block px-4 py-3 text-base font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition duration-200 ease-out"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pricing
            </a>
            <div className="pt-2">
              <Link 
                to="/app" 
                className="block w-full text-center bg-slate-900 text-white px-4 py-3 rounded-xl text-base font-bold hover:bg-slate-800 transition shadow-md active:scale-[0.97] duration-200 ease-out"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Open Dashboard
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section — pt-24 (max per Taste), real product preview via iframe */}
      <section className="pt-24 pb-12 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
              Your resume, turned into a{' '}
              <span className="text-emerald-600">portfolio website</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 max-w-[55ch] leading-relaxed">
              Upload your PDF. Get a live, ATS-optimized portfolio and AI interview prep in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/app" className="bg-slate-900 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-slate-800 shadow-xl shadow-black/10 transition active:scale-[0.97] duration-200 ease-out hover:-translate-y-0.5 inline-flex items-center gap-2">
                Start Building Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#features" className="bg-white text-slate-700 px-8 py-4 rounded-xl text-lg font-bold hover:bg-slate-100 border border-slate-200 transition active:scale-[0.97] duration-200 ease-out hover:-translate-y-0.5 shadow-sm text-center">
                See How It Works
              </a>
            </div>
          </div>

          {/* Right: Live dashboard preview — real product, not a fake mockup */}
          <div className="hidden lg:block relative">
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-2xl shadow-black/10 bg-slate-900">
              {/* Browser chrome bar */}
              <div className="bg-slate-800 px-4 py-2.5 flex items-center gap-2 border-b border-slate-700">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                </div>
                <div className="flex-1 text-center text-xs text-slate-400 font-mono">pro-portfolio-builder.vercel.app/app</div>
              </div>
              {/* Live iframe preview — pointer-events disabled so users can't interact */}
              <div className="relative w-full overflow-hidden" style={{ height: '380px' }}>
                <iframe
                  src="/app"
                  title="ProPortfolio Dashboard Preview"
                  className="absolute top-0 left-0 border-0"
                  style={{
                    width: '1920px',
                    height: '1080px',
                    transform: 'scale(0.35)',
                    transformOrigin: 'top left',
                    pointerEvents: 'none',
                  }}
                  tabIndex={-1}
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section — Taste: varied layout, not 3 equal cards */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to get hired</h2>
            <p className="text-lg text-slate-600">One platform to build your brand and ace the interview.</p>
          </div>
          
          {/* Taste-compliant: asymmetric bento grid instead of 3 equal cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Feature 1: Large hero card */}
            <div className="p-8 bg-slate-900 text-white rounded-2xl row-span-2 flex flex-col justify-between transition duration-200 ease-out hover:shadow-xl hover:shadow-black/10 group">
              <div>
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-6">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Instant Portfolio Generation</h3>
                <p className="text-slate-400 leading-relaxed max-w-[45ch]">
                  Turn your PDF resume into a fully interactive, mobile-responsive portfolio website. Choose from 5 premium themes and export production-ready React code.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-800">
                <Link to="/app" className="text-emerald-400 font-semibold text-sm inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all duration-200 ease-out">
                  Try it now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 transition duration-200 ease-out hover:shadow-xl hover:shadow-black/10 hover:border-slate-200">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">ATS Resume Scanner</h3>
              <p className="text-slate-600 leading-relaxed">Audit your resume against the target job description. Get a compatibility score and actionable fixes to pass automated screening.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 transition duration-200 ease-out hover:shadow-xl hover:shadow-black/10 hover:border-slate-200">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Mock Interviews</h3>
              <p className="text-slate-600 leading-relaxed">Practice with company-specific questions. Speak your answers aloud and get real-time grading from our AI recruiter coach.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-slate-600">Start for free. Upgrade when you need to stand out.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl items-center">
            {/* Free Tier */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm transition hover:shadow-md duration-200 ease-out">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <p className="text-slate-600 mb-6">Perfect for standard applications.</p>
              <div className="text-4xl font-extrabold mb-8">$0</div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-emerald-500" /> <span className="text-slate-700">Resume PDF Parsing</span></li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-emerald-500" /> <span className="text-slate-700">ATS Resume Scoring</span></li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-emerald-500" /> <span className="text-slate-700">1 Standard Theme</span></li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-emerald-500" /> <span className="text-slate-700">HTML Single File Export</span></li>
              </ul>
              <Link to="/app" className="block w-full py-3 px-4 bg-slate-100 text-slate-900 font-bold text-center rounded-xl hover:bg-slate-200 transition active:scale-[0.97] duration-200 ease-out">
                Get Started
              </Link>
            </div>

            {/* Pro Tier — no AI-purple, using slate-900 + emerald accent instead */}
            <div className="bg-slate-900 text-white rounded-2xl p-8 border border-slate-700 shadow-2xl shadow-black/20 relative overflow-hidden md:scale-105 z-10">
              <div className="absolute top-0 right-0 bg-emerald-500 text-slate-900 text-xs font-bold px-4 py-1.5 rounded-bl-xl">MOST POPULAR</div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-slate-400 mb-6">For serious job seekers who want to stand out.</p>
              <div className="text-4xl font-extrabold mb-8">$19 <span className="text-xl text-slate-400 font-medium">lifetime</span></div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-emerald-400" /> <span>Everything in Free</span></li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-emerald-400" /> <span>All 5 Premium Themes</span></li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-emerald-400" /> <span>Unlimited AI Mock Interviews</span></li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-emerald-400" /> <span>React Source Code Export</span></li>
              </ul>
              <Link to="/app" className="block w-full py-3 px-4 bg-white text-slate-900 font-bold text-center rounded-xl hover:bg-slate-100 transition active:scale-[0.97] duration-200 ease-out shadow-lg shadow-white/10">
                Upgrade to Pro
              </Link>
            </div>
          </div>
          
          <div className="mt-16">
             <div className="inline-flex items-center gap-2 bg-slate-200/50 px-4 py-2 rounded-full text-sm font-medium text-slate-700">
               <ShieldCheck className="w-4 h-4 text-emerald-600" />
               Secure payment via Stripe. 14-day money-back guarantee.
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} ProPortfolio Builder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
