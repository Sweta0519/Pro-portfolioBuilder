import { Link } from 'react-router-dom';
import { Sparkles, CheckCircle, Briefcase, Zap, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            <span className="text-xl font-bold tracking-tight">ProPortfolio</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 hidden sm:block">Features</a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-indigo-600 hidden sm:block">Pricing</a>
            <Link to="/app" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            Land your dream job with a <span className="text-indigo-600">standout portfolio</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
            Upload your resume and instantly generate a stunning, ATS-optimized portfolio website. Prepare for your interview with our AI recruiter coach.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/app" className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-1">
              Start Building for Free
            </Link>
            <a href="#features" className="bg-white text-slate-700 px-8 py-4 rounded-xl text-lg font-bold hover:bg-slate-50 border border-slate-200 transition-all hover:-translate-y-1">
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to get hired</h2>
            <p className="text-lg text-slate-600">One platform to build your brand and ace the interview.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Portfolio Gen</h3>
              <p className="text-slate-600 leading-relaxed">Turn your boring PDF resume into a fully interactive, mobile-responsive web portfolio in 3 seconds.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">ATS Resume Scanner</h3>
              <p className="text-slate-600 leading-relaxed">Audit your resume against the target job description to guarantee you pass the automated ATS screening.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Mock Interviews</h3>
              <p className="text-slate-600 leading-relaxed">Practice with real company-specific questions. Speak your answers and get immediate grading from our AI recruiter.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-slate-600">Start for free, upgrade when you need to stand out.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <p className="text-slate-500 mb-6">Perfect for standard applications.</p>
              <div className="text-4xl font-extrabold mb-8">$0</div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-emerald-500" /> <span>Resume PDF Parsing</span></li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-emerald-500" /> <span>ATS Resume Scoring</span></li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-emerald-500" /> <span>1 Standard Theme</span></li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-emerald-500" /> <span>HTML Single File Export</span></li>
              </ul>
              <Link to="/app" className="block w-full py-3 px-4 bg-slate-100 text-slate-900 font-bold text-center rounded-xl hover:bg-slate-200 transition-colors">
                Get Started Free
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="bg-indigo-900 text-white rounded-3xl p-8 border border-indigo-800 shadow-2xl shadow-indigo-900/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-indigo-200 mb-6">For serious job seekers.</p>
              <div className="text-4xl font-extrabold mb-8">$19 <span className="text-xl text-indigo-300 font-medium">lifetime</span></div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-indigo-400" /> <span>Everything in Free</span></li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-indigo-400" /> <span>All 5 Premium Themes</span></li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-indigo-400" /> <span>Unlimited AI Mock Interviews</span></li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-indigo-400" /> <span>React Source Code Export</span></li>
              </ul>
              <Link to="/app" className="block w-full py-3 px-4 bg-white text-indigo-900 font-bold text-center rounded-xl hover:bg-indigo-50 transition-colors">
                Upgrade to Pro
              </Link>
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
